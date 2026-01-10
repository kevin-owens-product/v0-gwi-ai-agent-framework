import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { z } from 'zod'

const updateBrandTrackingSchema = z.object({
  brandName: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  competitors: z.array(z.string()).optional(),
  audiences: z.array(z.string()).optional(),
  metrics: z.record(z.unknown()).optional(),
  trackingConfig: z.record(z.unknown()).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
  schedule: z.string().optional(),
  alertThresholds: z.record(z.unknown()).optional(),
})

async function getOrgId(request: NextRequest, userId: string): Promise<string | null> {
  const headerOrgId = request.headers.get('x-organization-id')
  if (headerOrgId) return headerOrgId

  const cookieStore = await cookies()
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { joinedAt: 'asc' },
  })

  if (memberships.length === 0) return null

  return cookieStore.get('currentOrgId')?.value || memberships[0].organization.id
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'brand-tracking:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { id } = await params

    const brandTracking = await prisma.brandTracking.findUnique({
      where: { id },
      include: {
        snapshots: {
          orderBy: { snapshotDate: 'desc' },
          take: 10,
        },
        _count: {
          select: { snapshots: true }
        }
      },
    })

    if (!brandTracking) {
      return NextResponse.json({ error: 'Brand tracking not found' }, { status: 404 })
    }

    if (brandTracking.orgId !== orgId) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json(brandTracking)
  } catch (error) {
    console.error('Error fetching brand tracking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'brand-tracking:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { id } = await params

    const existingBrandTracking = await prisma.brandTracking.findUnique({
      where: { id },
    })

    if (!existingBrandTracking) {
      return NextResponse.json({ error: 'Brand tracking not found' }, { status: 404 })
    }

    if (existingBrandTracking.orgId !== orgId) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const validationResult = updateBrandTrackingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { metrics, trackingConfig, alertThresholds, ...rest } = validationResult.data
    const brandTracking = await prisma.brandTracking.update({
      where: { id },
      data: {
        ...rest,
        ...(metrics !== undefined && { metrics: metrics as Prisma.InputJsonValue }),
        ...(trackingConfig !== undefined && { trackingConfig: trackingConfig as Prisma.InputJsonValue }),
        ...(alertThresholds !== undefined && { alertThresholds: alertThresholds as Prisma.InputJsonValue }),
      },
    })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'update',
      resourceType: 'brand_tracking',
      resourceId: brandTracking.id,
      metadata: { brandName: brandTracking.brandName },
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json(brandTracking)
  } catch (error) {
    console.error('Error updating brand tracking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'brand-tracking:delete')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { id } = await params

    const brandTracking = await prisma.brandTracking.findUnique({
      where: { id },
    })

    if (!brandTracking) {
      return NextResponse.json({ error: 'Brand tracking not found' }, { status: 404 })
    }

    if (brandTracking.orgId !== orgId) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    await prisma.brandTracking.delete({
      where: { id },
    })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'delete',
      resourceType: 'brand_tracking',
      resourceId: id,
      metadata: { brandName: brandTracking.brandName },
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting brand tracking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
