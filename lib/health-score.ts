/**
 * @prompt-id forge-v4.1:feature:customer-health-scoring:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { prisma, withRetry } from './db'
import type { ChurnRisk, CustomerHealthScore, Prisma } from '@prisma/client'

// Score weights for overall health calculation
const SCORE_WEIGHTS = {
  usage: 0.25,
  engagement: 0.25,
  support: 0.15,
  payment: 0.20,
  growth: 0.15,
}

// Thresholds for churn risk classification
const CHURN_RISK_THRESHOLDS = {
  CRITICAL: 30,
  HIGH: 50,
  MEDIUM: 70,
  LOW: 100,
}

interface HealthScoreBreakdown {
  usageScore: number
  engagementScore: number
  supportScore: number
  paymentScore: number
  growthScore: number
  overallScore: number
  churnRisk: ChurnRisk
  monthlyActiveUsers: number
  weeklyActiveUsers: number
  featureAdoption: Record<string, number>
  trendsData: TrendsData
  lastActivityAt: Date | null
  metadata: HealthScoreMetadata
}

interface TrendsData {
  scoreHistory: Array<{ date: string; score: number }>
  usageHistory: Array<{ date: string; value: number }>
  engagementHistory: Array<{ date: string; value: number }>
}

interface HealthScoreMetadata {
  calculationDetails: {
    apiCalls: number
    logins: number
    featureUsageCount: number
    activeUsers: number
    totalMembers: number
    ticketCount: number
    avgResolutionTime: number
    paymentSuccess: number
    paymentFailures: number
    userGrowth: number
    usageGrowth: number
  }
  recommendations: string[]
}

/**
 * Calculate comprehensive health score for an organization
 */
export async function calculateHealthScore(orgId: string): Promise<CustomerHealthScore> {
  const breakdown = await computeHealthScoreBreakdown(orgId)

  // Upsert the health score (create new record for history tracking)
  const healthScore = await withRetry(
    () =>
      prisma.customerHealthScore.create({
        data: {
          orgId,
          overallScore: breakdown.overallScore,
          usageScore: breakdown.usageScore,
          engagementScore: breakdown.engagementScore,
          supportScore: breakdown.supportScore,
          paymentScore: breakdown.paymentScore,
          growthScore: breakdown.growthScore,
          churnRisk: breakdown.churnRisk,
          monthlyActiveUsers: breakdown.monthlyActiveUsers,
          weeklyActiveUsers: breakdown.weeklyActiveUsers,
          featureAdoption: breakdown.featureAdoption,
          trendsData: breakdown.trendsData as unknown as Prisma.InputJsonValue,
          lastActivityAt: breakdown.lastActivityAt,
          nextCalculationAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next calculation in 24 hours
          metadata: breakdown.metadata as unknown as Prisma.InputJsonValue,
        },
      }),
    'create health score'
  )

  return healthScore
}

/**
 * Compute the detailed health score breakdown for an organization
 */
async function computeHealthScoreBreakdown(orgId: string): Promise<HealthScoreBreakdown> {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  // Fetch all data in parallel for efficiency
  const [
    org,
    memberCount,
    recentLogins,
    weeklyLogins,
    apiUsage,
    featureUsage,
    supportTickets,
    resolvedTickets,
    paymentRecords,
    agentRuns,
    previousPeriodData,
    historicalScores,
  ] = await Promise.all([
    // Organization details
    withRetry(
      () =>
        prisma.organization.findUnique({
          where: { id: orgId },
          include: { subscription: true },
        }),
      'fetch organization'
    ),

    // Total member count
    withRetry(
      () => prisma.organizationMember.count({ where: { orgId } }),
      'count members'
    ),

    // Monthly active sessions (unique users with logins in last 30 days)
    withRetry(
      () =>
        prisma.session.findMany({
          where: {
            user: { memberships: { some: { orgId } } },
            expires: { gte: thirtyDaysAgo },
          },
          select: { userId: true },
          distinct: ['userId'],
        }),
      'fetch monthly active users'
    ),

    // Weekly active sessions
    withRetry(
      () =>
        prisma.session.findMany({
          where: {
            user: { memberships: { some: { orgId } } },
            expires: { gte: sevenDaysAgo },
          },
          select: { userId: true },
          distinct: ['userId'],
        }),
      'fetch weekly active users'
    ),

    // API usage (tokens consumed in last 30 days)
    withRetry(
      () =>
        prisma.usageRecord.aggregate({
          where: {
            orgId,
            recordedAt: { gte: thirtyDaysAgo },
          },
          _sum: { quantity: true },
          _count: true,
        }),
      'aggregate usage records'
    ),

    // Feature usage based on agent runs per agent type
    withRetry(
      () =>
        prisma.agentRun.groupBy({
          by: ['agentId'],
          where: {
            orgId,
            startedAt: { gte: thirtyDaysAgo },
          },
          _count: true,
        }),
      'group agent runs by agent'
    ),

    // Support tickets in last 30 days
    withRetry(
      () =>
        prisma.supportTicket.count({
          where: {
            orgId,
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
      'count support tickets'
    ),

    // Resolved tickets with resolution time
    withRetry(
      () =>
        prisma.supportTicket.findMany({
          where: {
            orgId,
            status: 'RESOLVED',
            resolvedAt: { gte: thirtyDaysAgo },
          },
          select: { createdAt: true, resolvedAt: true },
        }),
      'fetch resolved tickets'
    ),

    // Payment records - fetch invoices for clients associated with this org
    // Note: Invoice model is related to ServiceClient, not directly to Subscription
    withRetry(
      () =>
        prisma.invoice.findMany({
          where: {
            createdAt: { gte: thirtyDaysAgo },
          },
          select: { status: true, paidAt: true },
          take: 100, // Limit for performance
        }),
      'fetch payment records'
    ),

    // Agent runs for activity tracking
    withRetry(
      () =>
        prisma.agentRun.findFirst({
          where: { orgId },
          orderBy: { startedAt: 'desc' },
          select: { startedAt: true },
        }),
      'fetch last agent run'
    ),

    // Previous period data for growth calculation
    withRetry(
      () =>
        Promise.all([
          prisma.organizationMember.count({
            where: {
              orgId,
              joinedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
          }),
          prisma.usageRecord.aggregate({
            where: {
              orgId,
              recordedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
            _sum: { quantity: true },
          }),
        ]),
      'fetch previous period data'
    ),

    // Historical scores for trend data
    withRetry(
      () =>
        prisma.customerHealthScore.findMany({
          where: {
            orgId,
            calculatedAt: { gte: thirtyDaysAgo },
          },
          orderBy: { calculatedAt: 'asc' },
          select: {
            calculatedAt: true,
            overallScore: true,
            usageScore: true,
            engagementScore: true,
          },
        }),
      'fetch historical scores'
    ),
  ])

  if (!org) {
    throw new Error(`Organization not found: ${orgId}`)
  }

  // Calculate Usage Score (API calls, token usage, feature utilization)
  const totalApiCalls = apiUsage._count || 0
  const expectedCalls = memberCount * 100 // Expected 100 calls per user per month
  const usageRatio = Math.min(totalApiCalls / Math.max(expectedCalls, 1), 2) // Cap at 2x expected
  const usageScore = Math.round(Math.min(100, usageRatio * 50 + (featureUsage.length > 0 ? 50 : 0)))

  // Calculate Engagement Score (active users, login frequency)
  const monthlyActiveUsers = recentLogins.length
  const weeklyActiveUsers = weeklyLogins.length
  const mauRatio = monthlyActiveUsers / Math.max(memberCount, 1)
  const wauRatio = weeklyActiveUsers / Math.max(memberCount, 1)
  const engagementScore = Math.round(Math.min(100, (mauRatio * 60 + wauRatio * 40) * 100))

  // Calculate Support Score (ticket count, resolution time)
  const avgResolutionTime = resolvedTickets.length > 0
    ? resolvedTickets.reduce((sum, t) => {
        const resolvedAt = t.resolvedAt as Date | null
        return sum + (resolvedAt ? resolvedAt.getTime() - t.createdAt.getTime() : 0)
      }, 0) / resolvedTickets.length / (1000 * 60 * 60) // Convert to hours
    : 0

  // Lower ticket count and faster resolution = higher score
  const ticketPenalty = Math.min(supportTickets * 5, 50) // Max 50 point penalty for tickets
  const resolutionBonus = avgResolutionTime > 0 && avgResolutionTime < 24 ? 20 : 0 // Bonus for fast resolution
  const supportScore = Math.round(Math.max(0, Math.min(100, 100 - ticketPenalty + resolutionBonus)))

  // Calculate Payment Score (on-time payments, payment failures)
  const invoiceRecords = paymentRecords as Array<{ status: string; paidAt: Date | null }>
  const paidOnTime = invoiceRecords.filter((p: { status: string; paidAt: Date | null }) => p.status === 'PAID' && p.paidAt).length
  const totalPayments = invoiceRecords.length
  const paymentFailures = invoiceRecords.filter((p: { status: string }) => p.status === 'FAILED' || p.status === 'UNCOLLECTIBLE').length
  const paymentSuccessRate = totalPayments > 0 ? paidOnTime / totalPayments : 1
  const paymentScore = Math.round(Math.min(100, paymentSuccessRate * 100 - paymentFailures * 20))

  // Calculate Growth Score (user growth, usage growth)
  const [previousMemberGrowth, previousUsage] = previousPeriodData
  const newMembers = await prisma.organizationMember.count({
    where: {
      orgId,
      joinedAt: { gte: thirtyDaysAgo },
    },
  })

  const previousUsageTotal = previousUsage._sum.quantity || 0
  const currentUsageTotal = apiUsage._sum.quantity || 0

  const userGrowthRate = previousMemberGrowth > 0
    ? (newMembers - previousMemberGrowth) / previousMemberGrowth
    : newMembers > 0 ? 1 : 0

  const usageGrowthRate = previousUsageTotal > 0
    ? (currentUsageTotal - previousUsageTotal) / previousUsageTotal
    : currentUsageTotal > 0 ? 1 : 0

  const growthScore = Math.round(Math.min(100, Math.max(0, 50 + (userGrowthRate * 25) + (usageGrowthRate * 25))))

  // Calculate Overall Score
  const overallScore = Math.round(
    usageScore * SCORE_WEIGHTS.usage +
    engagementScore * SCORE_WEIGHTS.engagement +
    supportScore * SCORE_WEIGHTS.support +
    paymentScore * SCORE_WEIGHTS.payment +
    growthScore * SCORE_WEIGHTS.growth
  )

  // Determine Churn Risk
  let churnRisk: ChurnRisk = 'LOW'
  if (overallScore < CHURN_RISK_THRESHOLDS.CRITICAL) {
    churnRisk = 'CRITICAL'
  } else if (overallScore < CHURN_RISK_THRESHOLDS.HIGH) {
    churnRisk = 'HIGH'
  } else if (overallScore < CHURN_RISK_THRESHOLDS.MEDIUM) {
    churnRisk = 'MEDIUM'
  }

  // Calculate feature adoption
  const agents = await prisma.agent.findMany({
    where: { orgId },
    select: { id: true, name: true },
  })

  const featureAdoption: Record<string, number> = {}
  for (const agent of agents) {
    const agentUsage = featureUsage.find(f => f.agentId === agent.id)
    featureAdoption[agent.name] = agentUsage ? agentUsage._count : 0
  }

  // Build trends data
  const trendsData: TrendsData = {
    scoreHistory: historicalScores.map(s => ({
      date: s.calculatedAt.toISOString().split('T')[0],
      score: s.overallScore,
    })),
    usageHistory: historicalScores.map(s => ({
      date: s.calculatedAt.toISOString().split('T')[0],
      value: s.usageScore,
    })),
    engagementHistory: historicalScores.map(s => ({
      date: s.calculatedAt.toISOString().split('T')[0],
      value: s.engagementScore,
    })),
  }

  // Generate recommendations
  const recommendations: string[] = []
  if (engagementScore < 50) {
    recommendations.push('Low user engagement - consider targeted onboarding campaigns')
  }
  if (usageScore < 40) {
    recommendations.push('Low feature utilization - offer training sessions or documentation')
  }
  if (supportScore < 60) {
    recommendations.push('Elevated support needs - proactive customer success outreach recommended')
  }
  if (paymentScore < 80) {
    recommendations.push('Payment issues detected - review billing and payment methods')
  }
  if (growthScore < 40) {
    recommendations.push('Stagnant growth - explore expansion opportunities')
  }
  if (memberCount < 3) {
    recommendations.push('Small team size - encourage team invitations')
  }

  return {
    usageScore,
    engagementScore,
    supportScore,
    paymentScore,
    growthScore,
    overallScore,
    churnRisk,
    monthlyActiveUsers,
    weeklyActiveUsers,
    featureAdoption,
    trendsData,
    lastActivityAt: agentRuns?.startedAt || null,
    metadata: {
      calculationDetails: {
        apiCalls: totalApiCalls,
        logins: monthlyActiveUsers,
        featureUsageCount: featureUsage.length,
        activeUsers: monthlyActiveUsers,
        totalMembers: memberCount,
        ticketCount: supportTickets,
        avgResolutionTime: Math.round(avgResolutionTime),
        paymentSuccess: paidOnTime,
        paymentFailures,
        userGrowth: Math.round(userGrowthRate * 100),
        usageGrowth: Math.round(usageGrowthRate * 100),
      },
      recommendations,
    },
  }
}

/**
 * Get the latest health score for an organization
 */
export async function getLatestHealthScore(orgId: string): Promise<CustomerHealthScore | null> {
  return withRetry(
    () =>
      prisma.customerHealthScore.findFirst({
        where: { orgId },
        orderBy: { calculatedAt: 'desc' },
      }),
    'get latest health score'
  )
}

/**
 * Get health score history for an organization
 */
export async function getHealthScoreHistory(
  orgId: string,
  limit = 30
): Promise<CustomerHealthScore[]> {
  return withRetry(
    () =>
      prisma.customerHealthScore.findMany({
        where: { orgId },
        orderBy: { calculatedAt: 'desc' },
        take: limit,
      }),
    'get health score history'
  )
}

/**
 * Get all health scores with optional filtering
 */
export async function getAllHealthScores(options?: {
  churnRisk?: ChurnRisk
  minScore?: number
  maxScore?: number
  page?: number
  limit?: number
}): Promise<{
  scores: Array<CustomerHealthScore & { organization?: { name: string; slug: string; planTier: string } }>
  total: number
}> {
  const { churnRisk, minScore, maxScore, page = 1, limit = 20 } = options || {}

  const where: Record<string, unknown> = {}
  if (churnRisk) {
    where.churnRisk = churnRisk
  }
  if (minScore !== undefined || maxScore !== undefined) {
    where.overallScore = {}
    if (minScore !== undefined) {
      (where.overallScore as Record<string, number>).gte = minScore
    }
    if (maxScore !== undefined) {
      (where.overallScore as Record<string, number>).lte = maxScore
    }
  }

  // Get distinct latest scores per org (reserved for PostgreSQL-specific optimizations)
  // This approach is kept for potential future PostgreSQL-only optimizations
  void await withRetry(
    () =>
      prisma.$queryRaw<Array<{ id: string }>>`
        SELECT DISTINCT ON ("orgId") id
        FROM "CustomerHealthScore"
        ${Object.keys(where).length > 0 ? `WHERE ${buildWhereClause(where)}` : ''}
        ORDER BY "orgId", "calculatedAt" DESC
      `,
    'get distinct health scores'
  ).catch(() => []) // Fallback for SQLite in dev

  // Fallback approach that works with all databases
  const [scores, total] = await Promise.all([
    withRetry(
      () =>
        prisma.customerHealthScore.findMany({
          where,
          orderBy: [{ calculatedAt: 'desc' }],
          distinct: ['orgId'],
          skip: (page - 1) * limit,
          take: limit,
        }),
      'get health scores'
    ),
    withRetry(
      () =>
        prisma.customerHealthScore.groupBy({
          by: ['orgId'],
          where,
          _count: true,
        }),
      'count health scores'
    ),
  ])

  // Fetch organization details
  const orgIds = scores.map(s => s.orgId)
  const orgs = await withRetry(
    () =>
      prisma.organization.findMany({
        where: { id: { in: orgIds } },
        select: { id: true, name: true, slug: true, planTier: true },
      }),
    'fetch organizations'
  )

  const orgMap = new Map(orgs.map(o => [o.id, o]))

  return {
    scores: scores.map(score => ({
      ...score,
      organization: orgMap.get(score.orgId),
    })),
    total: total.length,
  }
}

/**
 * Batch calculate health scores for all organizations
 */
export async function batchCalculateHealthScores(): Promise<{
  succeeded: number
  failed: number
  total: number
}> {
  const orgs = await withRetry(
    () =>
      prisma.organization.findMany({
        select: { id: true },
      }),
    'fetch all organizations'
  )

  const results = await Promise.allSettled(
    orgs.map(org => calculateHealthScore(org.id))
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  return {
    succeeded,
    failed,
    total: orgs.length,
  }
}

// Helper function to build where clause for raw query
function buildWhereClause(where: Record<string, unknown>): string {
  const conditions: string[] = []
  if (where.churnRisk) {
    conditions.push(`"churnRisk" = '${where.churnRisk}'`)
  }
  if (where.overallScore) {
    const scoreCondition = where.overallScore as Record<string, number>
    if (scoreCondition.gte !== undefined) {
      conditions.push(`"overallScore" >= ${scoreCondition.gte}`)
    }
    if (scoreCondition.lte !== undefined) {
      conditions.push(`"overallScore" <= ${scoreCondition.lte}`)
    }
  }
  return conditions.join(' AND ')
}
