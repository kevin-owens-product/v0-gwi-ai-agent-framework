/**
 * @prompt-id forge-v4.1:feature:custom-alerts:003
 * @generated-at 2024-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { recordUsage } from '@/lib/billing'
import { Prisma } from '@prisma/client'

// GET /api/v1/alerts/[id]/history - Get alert history
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

    // Check membership and permissions
    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'settings:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Verify alert exists and belongs to user
    const alert = await prisma.customAlert.findFirst({
      where: {
        id,
        orgId,
        userId: session.user.id,
      },
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const status = searchParams.get('status') as 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'IGNORED' | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query
    const where: Prisma.AlertHistoryWhereInput = {
      alertId: id,
    }

    if (status) {
      where.status = status
    }

    if (startDate || endDate) {
      where.triggeredAt = {}
      if (startDate) {
        where.triggeredAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.triggeredAt.lte = new Date(endDate)
      }
    }

    const skip = (page - 1) * limit

    // Fetch history with pagination
    const [history, total] = await Promise.all([
      prisma.alertHistory.findMany({
        where,
        orderBy: { triggeredAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.alertHistory.count({ where }),
    ])

    // Record API usage
    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      history,
      data: history,
      total,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching alert history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
