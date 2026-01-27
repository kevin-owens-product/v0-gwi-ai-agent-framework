import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getValidatedOrgId } from '@/lib/tenant'

/**
 * GET /api/v1/organization/usage
 * Get organization usage metrics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id!)
    if (!orgId) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      )
    }

    // Get usage for current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        orgId,
        recordedAt: {
          gte: startOfMonth,
        },
      },
    })

    // Aggregate usage by metric type
    const usageByType: Record<string, number> = {}

    for (const record of usageRecords) {
      if (!usageByType[record.metricType]) {
        usageByType[record.metricType] = 0
      }
      usageByType[record.metricType] += record.quantity
    }

    // Get counts
    const counts = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: {
            members: true,
            agents: true,
            workflows: true,
            reports: true,
            audiences: true,
            brandTrackings: true,
            crosstabs: true,
            charts: true,
            dashboards: true,
            apiKeys: true,
          },
        },
      },
    })

    return NextResponse.json({
      usage: usageByType,
      counts: counts?._count || {},
      period: {
        start: startOfMonth.toISOString(),
        end: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error fetching organization usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
