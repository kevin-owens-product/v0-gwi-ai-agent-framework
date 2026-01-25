import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { z } from 'zod'

const createDataSourceSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['API', 'DATABASE', 'FILE_UPLOAD', 'WEBHOOK', 'INTEGRATION']),
  connectionConfig: z.record(z.unknown()).optional(),
})

const updateDataSourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  connectionConfig: z.record(z.unknown()).optional(),
  status: z.enum(['PENDING', 'CONNECTED', 'ERROR', 'DISABLED']).optional(),
})

// GET /api/v1/data-sources - List data sources
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    // Build where clause
    const where: any = { orgId }
    if (type) where.type = type
    if (status) where.status = status

    // Fetch data sources
    const dataSources = await prisma.dataSource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ dataSources })
  } catch (error) {
    console.error('GET /api/v1/data-sources error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/v1/data-sources - Create data source
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'dataSources:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const validation = createDataSourceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, type, connectionConfig } = validation.data

    // Create data source
    const dataSource = await prisma.dataSource.create({
      data: {
        orgId,
        name,
        type,
        connectionConfig: (connectionConfig || {}) as Prisma.InputJsonValue,
        status: 'PENDING',
      },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'create',
      resourceType: 'data_source',
      resourceId: dataSource.id,
      metadata: { name, type },
    }))

    return NextResponse.json({ dataSource }, { status: 201 })
  } catch (error) {
    console.error('POST /api/v1/data-sources error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/v1/data-sources - Update data source
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'dataSources:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const dataSourceId = searchParams.get('id')

    if (!dataSourceId) {
      return NextResponse.json({ error: 'Data source ID is required' }, { status: 400 })
    }

    // Check data source exists
    const existing = await prisma.dataSource.findFirst({
      where: { id: dataSourceId, orgId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Data source not found' }, { status: 404 })
    }

    const body = await request.json()
    const validation = updateDataSourceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Update data source
    const { name, status, connectionConfig } = validation.data
    const dataSource = await prisma.dataSource.update({
      where: { id: dataSourceId },
      data: {
        ...(name !== undefined && { name }),
        ...(status !== undefined && { status }),
        ...(connectionConfig !== undefined && {
          connectionConfig: connectionConfig as Prisma.InputJsonValue
        }),
      },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'update',
      resourceType: 'data_source',
      resourceId: dataSourceId,
      metadata: { changes: Object.keys(validation.data) },
    }))

    return NextResponse.json({ dataSource })
  } catch (error) {
    console.error('PATCH /api/v1/data-sources error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/v1/data-sources - Delete data source
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'dataSources:delete')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const dataSourceId = searchParams.get('id')

    if (!dataSourceId) {
      return NextResponse.json({ error: 'Data source ID is required' }, { status: 400 })
    }

    // Check data source exists
    const existing = await prisma.dataSource.findFirst({
      where: { id: dataSourceId, orgId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Data source not found' }, { status: 404 })
    }

    // Delete data source
    await prisma.dataSource.delete({
      where: { id: dataSourceId },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'delete',
      resourceType: 'data_source',
      resourceId: dataSourceId,
      metadata: { name: existing.name },
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/v1/data-sources error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
