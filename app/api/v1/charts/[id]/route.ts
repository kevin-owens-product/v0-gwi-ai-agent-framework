import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId, getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { z } from 'zod'

const updateChartSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  type: z.enum(['BAR', 'LINE', 'PIE', 'DONUT', 'AREA', 'SCATTER', 'HEATMAP', 'TREEMAP', 'FUNNEL', 'RADAR']).optional(),
  config: z.record(z.unknown()).optional(),
  data: z.record(z.unknown()).optional(),
  dataSource: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'charts:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const chart = await prisma.chart.findFirst({
      where: { id, orgId },
    })

    if (!chart) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ data: chart })
  } catch (error) {
    console.error('Error fetching chart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'charts:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const existingChart = await prisma.chart.findFirst({
      where: { id, orgId },
    })

    if (!existingChart) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    const body = await request.json()
    const validationResult = updateChartSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { config, data, ...rest } = validationResult.data
    const chart = await prisma.chart.update({
      where: { id },
      data: {
        ...rest,
        ...(config !== undefined && { config: config as Prisma.InputJsonValue }),
        ...(data !== undefined && { data: data as Prisma.InputJsonValue }),
      },
    })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'update',
      resourceType: 'chart',
      resourceId: id,
      metadata: validationResult.data,
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ data: chart })
  } catch (error) {
    console.error('Error updating chart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'charts:delete')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const existingChart = await prisma.chart.findFirst({
      where: { id, orgId },
    })

    if (!existingChart) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    await prisma.chart.delete({ where: { id } })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'delete',
      resourceType: 'chart',
      resourceId: id,
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
