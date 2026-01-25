import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { recordUsage } from '@/lib/billing'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!hasPermission(membership.role, 'dashboards:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')

    const brandTracking = await prisma.brandTracking.findUnique({
      where: { id },
    })

    if (!brandTracking) {
      return NextResponse.json({ error: 'Brand tracking not found' }, { status: 404 })
    }

    if (brandTracking.orgId !== orgId) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const snapshots = await prisma.brandTrackingSnapshot.findMany({
      where: {
        brandTrackingId: id,
        snapshotDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { snapshotDate: 'asc' },
    })

    // Format data for charts
    const metricsData = {
      timeline: snapshots.map(s => s.snapshotDate),
      brandHealth: snapshots.map(s => s.brandHealth),
      awareness: snapshots.map(s => s.awareness),
      consideration: snapshots.map(s => s.consideration),
      preference: snapshots.map(s => s.preference),
      loyalty: snapshots.map(s => s.loyalty),
      nps: snapshots.map(s => s.nps),
      marketShare: snapshots.map(s => s.marketShare),
      sentimentScore: snapshots.map(s => s.sentimentScore),
    }

    // Calculate trends
    const latestSnapshot = snapshots[snapshots.length - 1]
    const previousSnapshot = snapshots[snapshots.length - 2]

    const trends = latestSnapshot && previousSnapshot ? {
      brandHealth: ((latestSnapshot.brandHealth || 0) - (previousSnapshot.brandHealth || 0)),
      awareness: ((latestSnapshot.awareness || 0) - (previousSnapshot.awareness || 0)),
      consideration: ((latestSnapshot.consideration || 0) - (previousSnapshot.consideration || 0)),
      preference: ((latestSnapshot.preference || 0) - (previousSnapshot.preference || 0)),
      loyalty: ((latestSnapshot.loyalty || 0) - (previousSnapshot.loyalty || 0)),
      nps: ((latestSnapshot.nps || 0) - (previousSnapshot.nps || 0)),
      marketShare: ((latestSnapshot.marketShare || 0) - (previousSnapshot.marketShare || 0)),
      sentimentScore: ((latestSnapshot.sentimentScore || 0) - (previousSnapshot.sentimentScore || 0)),
    } : null

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      brandTracking: {
        id: brandTracking.id,
        brandName: brandTracking.brandName,
        competitors: brandTracking.competitors,
      },
      metrics: metricsData,
      trends,
      snapshots: snapshots.length,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    })
  } catch (error) {
    console.error('Error fetching brand tracking metrics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
