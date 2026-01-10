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

const createChartSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(['BAR', 'LINE', 'PIE', 'DONUT', 'AREA', 'SCATTER', 'HEATMAP', 'TREEMAP', 'FUNNEL', 'RADAR']),
  config: z.record(z.unknown()).optional(),
  data: z.record(z.unknown()).optional(),
  dataSource: z.string().optional(),
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

export async function GET(request: NextRequest) {
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

    if (!hasPermission(membership.role, 'charts:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const type = searchParams.get('type') as any
    const status = searchParams.get('status') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | null
    const search = searchParams.get('search')

    const where: any = { orgId }
    if (type) where.type = type
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const skip = (page - 1) * limit

    const [charts, total] = await Promise.all([
      prisma.chart.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.chart.count({ where }),
    ])

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      charts,
      data: charts,
      total,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching charts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    if (!hasPermission(membership.role, 'charts:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const validationResult = createChartSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { name, description, type, config, data, dataSource } = validationResult.data

    const chart = await prisma.chart.create({
      data: {
        orgId,
        name,
        description,
        type,
        config: (config || {}) as Prisma.InputJsonValue,
        data: (data || null) as Prisma.InputJsonValue,
        dataSource,
        createdBy: session.user.id,
      },
    })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'create',
      resourceType: 'chart',
      resourceId: chart.id,
      metadata: { name, type },
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json(chart, { status: 201 })
  } catch (error) {
    console.error('Error creating chart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
