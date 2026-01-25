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

    const orgId = await getValidatedOrgId(request, session.user.id)
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
        organizationId: orgId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    })

    // Aggregate usage by resource type
    const usageByType: Record<string, number> = {}

    for (const record of usageRecords) {
      if (!usageByType[record.resourceType]) {
        usageByType[record.resourceType] = 0
      }
      usageByType[record.resourceType] += record.quantity
    }

    // Get counts
    const counts = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        _count: {
          select: {
            members: true,
            agents: true,
            workflows: true,
            reports: true,
            audiences: true,
            brandTracking: true,
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
