import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOrgIdFromRequest } from '@/lib/shared-utils'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgIdFromRequest(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership || !hasPermission(membership.role, 'analytics:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Parallel data fetching for comprehensive analytics
    const [
      agentStats,
      workflowStats,
      usageStats,
      costStats,
      insightStats,
      performanceStats,
      userActivity,
    ] = await Promise.all([
      // Agent statistics
      prisma.agent.groupBy({
        by: ['type', 'status'],
        where: { orgId },
        _count: true,
      }),

      // Workflow statistics - uses startedAt
      prisma.workflowRun.groupBy({
        by: ['status'],
        where: {
          orgId,
          startedAt: { gte: startDate },
        },
        _count: true,
        _avg: { tokensUsed: true },
      }),

      // Usage statistics - uses recordedAt
      prisma.usageRecord.groupBy({
        by: ['metricType'],
        where: {
          orgId,
          recordedAt: { gte: startDate },
        },
        _sum: { quantity: true },
      }),

      // Cost estimation - uses startedAt
      prisma.agentRun.aggregate({
        where: {
          orgId,
          startedAt: { gte: startDate },
          status: 'COMPLETED',
        },
        _sum: { tokensUsed: true },
        _count: true,
      }),

      // Insight statistics - uses createdAt
      prisma.insight.groupBy({
        by: ['type'],
        where: {
          orgId,
          createdAt: { gte: startDate },
        },
        _count: true,
        _avg: { confidenceScore: true },
      }),

      // Performance metrics - uses startedAt
      prisma.agentRun.aggregate({
        where: {
          orgId,
          status: 'COMPLETED',
          startedAt: { gte: startDate },
        },
        _avg: { tokensUsed: true },
      }),

      // User activity - uses timestamp
      prisma.auditLog.groupBy({
        by: ['action'],
        where: {
          orgId,
          timestamp: { gte: startDate },
        },
        _count: true,
      }),
    ])

    // Calculate trends (compare with previous period)
    const previousPeriodStart = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000)
    const previousPeriodEnd = startDate

    const [previousAgentRuns, previousWorkflowRuns] = await Promise.all([
      prisma.agentRun.count({
        where: {
          orgId,
          startedAt: { gte: previousPeriodStart, lt: previousPeriodEnd },
        },
      }),
      prisma.workflowRun.count({
        where: {
          orgId,
          startedAt: { gte: previousPeriodStart, lt: previousPeriodEnd },
        },
      }),
    ])

    const currentAgentRuns = costStats._count || 0
    const currentWorkflowRuns = workflowStats.reduce((sum: number, s: { _count: number }) => sum + s._count, 0)

    // Calculate growth rates
    const agentRunGrowth = previousAgentRuns > 0
      ? ((currentAgentRuns - previousAgentRuns) / previousAgentRuns) * 100
      : 0

    const workflowRunGrowth = previousWorkflowRuns > 0
      ? ((currentWorkflowRuns - previousWorkflowRuns) / previousWorkflowRuns) * 100
      : 0

    // Estimate costs (example: $0.01 per 1K tokens)
    const totalTokens = costStats._sum.tokensUsed || 0
    const estimatedCost = (totalTokens / 1000) * 0.01

    type AgentStatType = { type: string; status: string; _count: number }
    type WorkflowStatType = { status: string; _count: number; _avg: { tokensUsed: number | null } }
    type UsageStatType = { metricType: string; _sum: { quantity: number | null } }
    type InsightStatType = { type: string; _count: number; _avg: { confidenceScore: number | null } }
    type ActivityType = { action: string; _count: number }

    const analytics = {
      overview: {
        period: { days, startDate, endDate: new Date() },
        totalAgentRuns: currentAgentRuns,
        totalWorkflowRuns: currentWorkflowRuns,
        totalTokensConsumed: totalTokens,
        estimatedCost,
        avgTokensPerRun: performanceStats._avg.tokensUsed || 0,
      },
      growth: {
        agentRunGrowth: agentRunGrowth.toFixed(1),
        workflowRunGrowth: workflowRunGrowth.toFixed(1),
      },
      agents: {
        byType: agentStats.reduce((acc: Record<string, { total: number; active: number; inactive: number }>, stat: AgentStatType) => {
          if (!acc[stat.type]) acc[stat.type] = { total: 0, active: 0, inactive: 0 }
          acc[stat.type].total += stat._count
          if (stat.status === 'ACTIVE') acc[stat.type].active += stat._count
          else acc[stat.type].inactive += stat._count
          return acc
        }, {} as Record<string, { total: number; active: number; inactive: number }>),
      },
      workflows: {
        byStatus: workflowStats.reduce((acc: Record<string, { count: number; avgTokens: number }>, stat: WorkflowStatType) => {
          acc[stat.status] = {
            count: stat._count,
            avgTokens: stat._avg.tokensUsed || 0,
          }
          return acc
        }, {} as Record<string, { count: number; avgTokens: number }>),
      },
      usage: {
        byMetric: usageStats.reduce((acc: Record<string, number>, stat: UsageStatType) => {
          acc[stat.metricType] = stat._sum.quantity || 0
          return acc
        }, {} as Record<string, number>),
      },
      insights: {
        byType: insightStats.map((stat: InsightStatType) => ({
          type: stat.type,
          count: stat._count,
          avgConfidence: stat._avg.confidenceScore || 0,
        })),
      },
      activity: {
        byAction: userActivity.map((act: ActivityType) => ({
          action: act.action,
          count: act._count,
        })),
      },
    }

    return NextResponse.json({ data: analytics })
  } catch (error) {
    console.error('Comprehensive analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
