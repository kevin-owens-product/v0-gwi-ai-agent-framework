import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

/**
 * GET /api/v1/organization/exports
 * Get data export requests
 */
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = request.headers.get('x-organization-id')
    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }

    // Verify membership
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
    })

    if (!member || !hasPermission(member.role, 'compliance:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get export requests
    const exports = await prisma.dataExport.findMany({
      where: { organizationId: orgId },
      include: {
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(exports)
  } catch (error) {
    console.error('Error fetching data exports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/organization/exports
 * Request a data export
 */
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = request.headers.get('x-organization-id')
    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }

    // Verify membership and permission
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
    })

    if (!member || !hasPermission(member.role, 'data-exports:request')) {
      return NextResponse.json(
        { error: 'You do not have permission to request data exports' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { exportType, format = 'JSON', description } = body

    if (!exportType || !['ORGANIZATION_DATA', 'USER_DATA', 'COMPLIANCE_DATA'].includes(exportType)) {
      return NextResponse.json(
        { error: 'Invalid export type' },
        { status: 400 }
      )
    }

    // Create export request
    const dataExport = await prisma.dataExport.create({
      data: {
        organizationId: orgId,
        requestedById: session.user.id,
        exportType,
        format,
        description,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    // Log action
    await prisma.auditLog.create({
      data: {
        action: 'DATA_EXPORT_REQUESTED',
        entityType: 'DATA_EXPORT',
        entityId: dataExport.id,
        userId: session.user.id,
        organizationId: orgId,
        metadata: {
          exportType,
          format,
        },
      },
    })

    // TODO: Trigger async job to generate export

    return NextResponse.json({
      success: true,
      export: dataExport,
      message: 'Data export request submitted. You will be notified when it is ready.',
    })
  } catch (error) {
    console.error('Error creating data export:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
