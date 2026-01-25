/**
 * @prompt-id forge-v4.1:feature:data-export:005
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * Admin Data Exports API
 *
 * GET /api/admin/data-exports - List all data export requests
 * POST /api/admin/data-exports - Manually trigger an export for a user
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { validateSuperAdminSession, logPlatformAudit } from '@/lib/super-admin'
import { createExportRequest, generateExport } from '@/lib/data-export'

/**
 * GET - List all data export requests with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('adminToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: Record<string, unknown> = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (type && type !== 'all') {
      where.type = type
    }

    if (userId) {
      where.userId = userId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate)
      }
    }

    // Fetch exports with pagination
    const [exports, total] = await Promise.all([
      prisma.dataExport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dataExport.count({ where }),
    ])

    // Fetch user details for exports
    const userIds = [...new Set(exports.filter((e) => e.userId).map((e) => e.userId as string))]
    const requestedByIds = [...new Set(exports.map((e) => e.requestedBy))]

    const [users, requestedByUsers] = await Promise.all([
      userIds.length > 0
        ? prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true },
          })
        : [],
      prisma.user.findMany({
        where: { id: { in: requestedByIds } },
        select: { id: true, name: true, email: true },
      }),
    ])

    const userMap = new Map(users.map((u) => [u.id, u]))
    const requestedByMap = new Map(requestedByUsers.map((u) => [u.id, u]))

    // Format exports with user details
    const formattedExports = exports.map((exp) => ({
      id: exp.id,
      type: exp.type,
      status: exp.status,
      format: exp.format,
      fileSize: exp.fileSize ? Number(exp.fileSize) : null,
      createdAt: exp.createdAt,
      startedAt: exp.startedAt,
      completedAt: exp.completedAt,
      expiresAt: exp.expiresAt,
      error: exp.error,
      user: exp.userId ? userMap.get(exp.userId) : null,
      requestedBy: requestedByMap.get(exp.requestedBy),
    }))

    // Calculate statistics
    const stats = {
      total: await prisma.dataExport.count(),
      pending: await prisma.dataExport.count({ where: { status: 'PENDING' } }),
      processing: await prisma.dataExport.count({ where: { status: 'PROCESSING' } }),
      completed: await prisma.dataExport.count({ where: { status: 'COMPLETED' } }),
      failed: await prisma.dataExport.count({ where: { status: 'FAILED' } }),
      expired: await prisma.dataExport.count({ where: { status: 'EXPIRED' } }),
    }

    return NextResponse.json({
      exports: formattedExports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats,
    })
  } catch (error) {
    console.error('Admin data exports fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data exports' },
      { status: 500 }
    )
  }
}

/**
 * POST - Manually trigger an export for a specific user
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('adminToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, type = 'ADMIN_EXPORT', reason } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create export request
    const exportRecord = await createExportRequest(userId, 'GDPR_REQUEST')

    // Log admin action
    await logPlatformAudit({
      adminId: session.adminId,
      action: 'create_data_export',
      resourceType: 'data_export',
      resourceId: exportRecord.id,
      targetUserId: userId,
      details: {
        type,
        reason,
        adminTriggered: true,
      },
    })

    // Start processing the export
    generateExport(userId, exportRecord.id).catch((error) => {
      console.error('Background export failed:', error)
    })

    return NextResponse.json(
      {
        success: true,
        export: {
          id: exportRecord.id,
          status: exportRecord.status,
          type: exportRecord.type,
          userId: user.id,
          userEmail: user.email,
          createdAt: exportRecord.createdAt,
        },
        message: 'Export request created and processing started',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin data export creation error:', error)

    if (error instanceof Error && error.message === 'An export request is already in progress') {
      return NextResponse.json(
        { error: 'An export request is already in progress for this user' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create data export' },
      { status: 500 }
    )
  }
}
