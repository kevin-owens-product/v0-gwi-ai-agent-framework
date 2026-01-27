import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { getValidatedOrgId } from '@/lib/tenant'

/**
 * GET /api/v1/organization/exports
 * Get data export requests
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get validated organization ID (validates user membership)
    const orgId = await getValidatedOrgId(request, session.user.id!)
    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 403 }
      )
    }

    // Check permission
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id!, orgId },
    })

    if (!member || !hasPermission(member.role, 'compliance:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get export requests
    const exports = await prisma.dataExport.findMany({
      where: { orgId },
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
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get validated organization ID (validates user membership)
    const orgId = await getValidatedOrgId(request, session.user.id!)
    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 403 }
      )
    }

    // Check permission
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id!, orgId },
    })

    if (!member || !hasPermission(member.role, 'data-exports:request')) {
      return NextResponse.json(
        { error: 'You do not have permission to request data exports' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { exportType, format = 'json' } = body

    if (!exportType || !['ORGANIZATION_DATA', 'USER_DATA', 'COMPLIANCE_DATA'].includes(exportType)) {
      return NextResponse.json(
        { error: 'Invalid export type' },
        { status: 400 }
      )
    }

    // Create export request
    const dataExport = await prisma.dataExport.create({
      data: {
        orgId,
        requestedBy: session.user.id!,
        type: exportType,
        format,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    // Log action
    await prisma.auditLog.create({
      data: {
        action: 'DATA_EXPORT_REQUESTED',
        resourceType: 'DATA_EXPORT',
        resourceId: dataExport.id,
        userId: session.user.id,
        orgId,
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
