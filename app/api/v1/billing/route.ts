import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId, getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'

// GET /api/v1/billing - Get billing information
export async function GET(request: NextRequest) {
  try {
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

    if (!hasPermission(membership.role, 'billing:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Get subscription (using BillingSubscription model)
    const subscription = await prisma.billingSubscription.findUnique({
      where: { orgId },
    })

    // Get usage metrics for current period
    const now = new Date()
    const periodEnd = subscription?.currentPeriodEnd || new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const periodStart = subscription?.currentPeriodEnd 
      ? new Date(subscription.currentPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days before period end
      : new Date(now.getFullYear(), now.getMonth(), 1)

    const [agentQueries, reportsGenerated, teamMembers] = await Promise.all([
      prisma.usageMetric.count({
        where: {
          orgId,
          metricType: 'API_CALLS',
          recordedAt: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
      }),
      prisma.report.count({
        where: {
          orgId,
          createdAt: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
      }),
      prisma.organizationMember.count({
        where: { organizationId: orgId },
      }),
    ])

    // Get invoices (if Invoice model exists in ServiceClient context)
    // For now, return empty array
    const invoices: any[] = []

    return NextResponse.json({
      subscription: subscription ? {
        planId: subscription.planId,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString(),
      } : null,
      usage: {
        agentQueries,
        reportsGenerated,
        teamMembers,
        teamSeatsLimit: 25, // Default limit
        reportsLimit: 100, // Default limit
      },
      invoices,
    })
  } catch (error) {
    console.error('Error fetching billing information:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
