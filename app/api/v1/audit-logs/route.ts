import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'

// Helper to get org ID from header or cookies
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

// GET /api/v1/audit-logs - List audit logs
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

    if (!hasPermission(membership.role, 'audit:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const action = searchParams.get('action')
    const resourceType = searchParams.get('resourceType')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: any = { orgId }
    if (action) where.action = action
    if (resourceType) where.resourceType = resourceType
    if (userId) where.userId = userId
    if (startDate || endDate) {
      where.timestamp = {}
      if (startDate) where.timestamp.gte = new Date(startDate)
      if (endDate) where.timestamp.lte = new Date(endDate)
    }

    // Fetch audit logs
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ])

    // Get unique actions and resource types for filters
    const [actions, resourceTypes] = await Promise.all([
      prisma.auditLog.findMany({
        where: { orgId },
        select: { action: true },
        distinct: ['action'],
      }),
      prisma.auditLog.findMany({
        where: { orgId },
        select: { resourceType: true },
        distinct: ['resourceType'],
      }),
    ])

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
      filters: {
        actions: actions.map(a => a.action),
        resourceTypes: resourceTypes.map(r => r.resourceType),
      },
    })
  } catch (error) {
    console.error('GET /api/v1/audit-logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
