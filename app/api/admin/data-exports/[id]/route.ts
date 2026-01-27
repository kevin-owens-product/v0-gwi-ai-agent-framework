/**
 * @prompt-id forge-v4.1:feature:data-export:006
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * Admin Data Export Management API
 *
 * GET /api/admin/data-exports/[id] - Get details of a specific export
 * PUT /api/admin/data-exports/[id] - Update export status
 * DELETE /api/admin/data-exports/[id] - Delete an export
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { validateSuperAdminSession, logPlatformAudit } from '@/lib/super-admin'
import { generateExport } from '@/lib/data-export'

/**
 * GET - Get details of a specific export
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('adminToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const exportRecord = await prisma.dataExport.findUnique({
      where: { id },
    })

    if (!exportRecord) {
      return NextResponse.json({ error: 'Export not found' }, { status: 404 })
    }

    // Fetch user details
    const [user, requestedByUser] = await Promise.all([
      exportRecord.userId
        ? prisma.user.findUnique({
            where: { id: exportRecord.userId },
            select: { id: true, name: true, email: true },
          })
        : null,
      prisma.user.findUnique({
        where: { id: exportRecord.requestedBy },
        select: { id: true, name: true, email: true },
      }),
    ])

    return NextResponse.json({
      export: {
        id: exportRecord.id,
        type: exportRecord.type,
        status: exportRecord.status,
        format: exportRecord.format,
        scope: exportRecord.scope,
        fileSize: exportRecord.fileSize ? Number(exportRecord.fileSize) : null,
        fileUrl: exportRecord.fileUrl,
        createdAt: exportRecord.createdAt,
        startedAt: exportRecord.startedAt,
        completedAt: exportRecord.completedAt,
        expiresAt: exportRecord.expiresAt,
        error: exportRecord.error,
        metadata: exportRecord.metadata,
        user,
        requestedBy: requestedByUser,
      },
    })
  } catch (error) {
    console.error('Admin export fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch export' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update export status (cancel, retry, etc.)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { action } = body

    const exportRecord = await prisma.dataExport.findUnique({
      where: { id },
    })

    if (!exportRecord) {
      return NextResponse.json({ error: 'Export not found' }, { status: 404 })
    }

    let updatedExport
    let actionMessage = ''

    switch (action) {
      case 'cancel':
        if (!['PENDING', 'PROCESSING'].includes(exportRecord.status)) {
          return NextResponse.json(
            { error: 'Can only cancel pending or processing exports' },
            { status: 400 }
          )
        }
        updatedExport = await prisma.dataExport.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            completedAt: new Date(),
          },
        })
        actionMessage = 'Export cancelled'
        break

      case 'retry':
        if (!['FAILED', 'CANCELLED'].includes(exportRecord.status)) {
          return NextResponse.json(
            { error: 'Can only retry failed or cancelled exports' },
            { status: 400 }
          )
        }
        updatedExport = await prisma.dataExport.update({
          where: { id },
          data: {
            status: 'PENDING',
            error: null,
            startedAt: null,
            completedAt: null,
          },
        })

        // Start processing
        if (exportRecord.userId) {
          generateExport(exportRecord.userId, id).catch((error) => {
            console.error('Background export retry failed:', error)
          })
        }

        actionMessage = 'Export retry initiated'
        break

      case 'extend':
        // Extend expiration by 30 days
        if (exportRecord.status !== 'COMPLETED') {
          return NextResponse.json(
            { error: 'Can only extend completed exports' },
            { status: 400 }
          )
        }
        const newExpiresAt = new Date()
        newExpiresAt.setDate(newExpiresAt.getDate() + 30)

        updatedExport = await prisma.dataExport.update({
          where: { id },
          data: { expiresAt: newExpiresAt },
        })
        actionMessage = 'Export expiration extended by 30 days'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: cancel, retry, or extend' },
          { status: 400 }
        )
    }

    // Log admin action
    await logPlatformAudit({
      adminId: session.adminId,
      action: `${action}_data_export`,
      resourceType: 'data_export',
      resourceId: id,
      targetUserId: exportRecord.userId ?? undefined,
      details: {
        previousStatus: exportRecord.status,
        newStatus: updatedExport.status,
        action,
      },
    })

    return NextResponse.json({
      success: true,
      message: actionMessage,
      export: {
        id: updatedExport.id,
        status: updatedExport.status,
        expiresAt: updatedExport.expiresAt,
      },
    })
  } catch (error) {
    console.error('Admin export update error:', error)
    return NextResponse.json(
      { error: 'Failed to update export' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete an export record
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('adminToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const exportRecord = await prisma.dataExport.findUnique({
      where: { id },
    })

    if (!exportRecord) {
      return NextResponse.json({ error: 'Export not found' }, { status: 404 })
    }

    // Don't allow deletion of processing exports
    if (exportRecord.status === 'PROCESSING') {
      return NextResponse.json(
        { error: 'Cannot delete an export that is currently processing' },
        { status: 400 }
      )
    }

    // Delete the export
    await prisma.dataExport.delete({
      where: { id },
    })

    // Log admin action
    await logPlatformAudit({
      adminId: session.adminId,
      action: 'delete_data_export',
      resourceType: 'data_export',
      resourceId: id,
      targetUserId: exportRecord.userId ?? undefined,
      details: {
        type: exportRecord.type,
        status: exportRecord.status,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Export deleted successfully',
    })
  } catch (error) {
    console.error('Admin export deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete export' },
      { status: 500 }
    )
  }
}
