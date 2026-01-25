import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const createBrandTrackingSchema = z.object({
  brandName: z.string().min(1).max(200),
  description: z.string().optional(),
  industry: z.string().optional(),
  competitors: z.array(z.string()).optional(),
  audiences: z.array(z.string()).optional(),
  metrics: z.record(z.unknown()).optional(),
  trackingConfig: z.record(z.unknown()).optional(),
  schedule: z.string().optional(),
  alertThresholds: z.record(z.unknown()).optional(),
})

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

    if (!hasPermission(membership.role, 'brand-tracking:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const filter = searchParams.get('filter')
    const search = searchParams.get('search')

    const where: any = { orgId }
    if (filter === 'active') where.status = 'ACTIVE'
    if (filter === 'paused') where.status = 'PAUSED'
    if (filter === 'draft') where.status = 'DRAFT'
    if (search) {
      where.OR = [
        { brandName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ]
    }

    const skip = (page - 1) * limit

    const [brandTrackings, total] = await Promise.all([
      prisma.brandTracking.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { snapshots: true }
          },
          snapshots: {
            orderBy: { snapshotDate: 'desc' },
            take: 1,
            select: {
              id: true,
              snapshotDate: true,
              brandHealth: true,
              awareness: true,
              nps: true,
              marketShare: true,
            }
          }
        }
      }),
      prisma.brandTracking.count({ where }),
    ])

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      brandTrackings,
      data: brandTrackings,
      total,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching brand trackings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    if (!hasPermission(membership.role, 'brand-tracking:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const validationResult = createBrandTrackingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const {
      brandName,
      description,
      industry,
      competitors,
      audiences,
      metrics,
      trackingConfig,
      schedule,
      alertThresholds
    } = validationResult.data

    const brandTracking = await prisma.brandTracking.create({
      data: {
        orgId,
        brandName,
        description,
        industry,
        competitors: competitors || [],
        audiences: audiences || [],
        metrics: (metrics || {}) as Prisma.InputJsonValue,
        trackingConfig: (trackingConfig || {}) as Prisma.InputJsonValue,
        schedule,
        alertThresholds: (alertThresholds || {}) as Prisma.InputJsonValue,
        createdBy: session.user.id,
      },
    })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'create',
      resourceType: 'brand_tracking',
      resourceId: brandTracking.id,
      metadata: { brandName },
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json(brandTracking, { status: 201 })
  } catch (error) {
    console.error('Error creating brand tracking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
