/**
 * @prompt-id forge-v4.1:feature:feature-usage-analytics:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * Feature Usage Tracking Service
 * Tracks and calculates feature usage metrics across the platform
 */

import { prisma, withRetry } from './db'
import { Prisma, MetricPeriod } from '@prisma/client'

// Trackable features definition
export const TRACKABLE_FEATURES = {
  // Agent features
  'agents.create': { name: 'Agent Creation', category: 'agents' },
  'agents.run': { name: 'Agent Runs', category: 'agents' },
  'agents.edit': { name: 'Agent Editing', category: 'agents' },
  'agents.marketplace': { name: 'Marketplace Browse', category: 'agents' },
  'agents.install': { name: 'Agent Installation', category: 'agents' },

  // Audience features
  'audiences.create': { name: 'Audience Creation', category: 'audiences' },
  'audiences.view': { name: 'Audience Viewing', category: 'audiences' },
  'audiences.compare': { name: 'Audience Comparison', category: 'audiences' },
  'audiences.export': { name: 'Audience Export', category: 'audiences' },

  // Dashboard features
  'dashboards.create': { name: 'Dashboard Creation', category: 'dashboards' },
  'dashboards.view': { name: 'Dashboard Viewing', category: 'dashboards' },
  'dashboards.share': { name: 'Dashboard Sharing', category: 'dashboards' },
  'dashboards.widget.add': { name: 'Widget Addition', category: 'dashboards' },

  // Report features
  'reports.create': { name: 'Report Creation', category: 'reports' },
  'reports.generate': { name: 'Report Generation', category: 'reports' },
  'reports.export': { name: 'Report Export', category: 'reports' },
  'reports.schedule': { name: 'Report Scheduling', category: 'reports' },

  // Workflow features
  'workflows.create': { name: 'Workflow Creation', category: 'workflows' },
  'workflows.run': { name: 'Workflow Execution', category: 'workflows' },
  'workflows.edit': { name: 'Workflow Editing', category: 'workflows' },
  'workflows.schedule': { name: 'Workflow Scheduling', category: 'workflows' },

  // Chart features
  'charts.create': { name: 'Chart Creation', category: 'charts' },
  'charts.view': { name: 'Chart Viewing', category: 'charts' },
  'charts.export': { name: 'Chart Export', category: 'charts' },

  // Crosstab features
  'crosstabs.create': { name: 'Crosstab Creation', category: 'crosstabs' },
  'crosstabs.analyze': { name: 'Crosstab Analysis', category: 'crosstabs' },
  'crosstabs.export': { name: 'Crosstab Export', category: 'crosstabs' },

  // API features
  'api.query': { name: 'API Queries', category: 'api' },
  'api.webhook': { name: 'Webhook Usage', category: 'api' },
  'api.integration': { name: 'Integration Setup', category: 'api' },

  // Data features
  'data.import': { name: 'Data Import', category: 'data' },
  'data.export': { name: 'Data Export', category: 'data' },
  'data.connect': { name: 'Data Source Connection', category: 'data' },

  // Collaboration features
  'collaboration.share': { name: 'Content Sharing', category: 'collaboration' },
  'collaboration.comment': { name: 'Commenting', category: 'collaboration' },
  'collaboration.invite': { name: 'Team Invitations', category: 'collaboration' },

  // Settings features
  'settings.profile': { name: 'Profile Updates', category: 'settings' },
  'settings.organization': { name: 'Organization Settings', category: 'settings' },
  'settings.integrations': { name: 'Integration Settings', category: 'settings' },
} as const

export type FeatureKey = keyof typeof TRACKABLE_FEATURES

export interface FeatureUsageEvent {
  userId: string
  orgId: string
  featureKey: FeatureKey
  metadata?: Record<string, unknown>
  sessionId?: string
  duration?: number // seconds spent
}

export interface FeatureMetrics {
  featureKey: string
  featureName: string
  totalUsers: number
  activeUsers: number
  totalEvents: number
  uniqueSessions: number
  avgTimeSpent: number
  adoptionRate: number
  retentionRate: number
  byPlan: Record<string, number>
  byUserRole: Record<string, number>
}

/**
 * Track a feature usage event
 * Records when a user uses a specific feature using the AuditLog model
 */
export async function trackFeatureUsage(event: FeatureUsageEvent): Promise<void> {
  const { userId, orgId, featureKey, metadata = {}, sessionId, duration = 0 } = event

  const featureInfo = TRACKABLE_FEATURES[featureKey]
  if (!featureInfo) {
    console.warn(`Unknown feature key: ${featureKey}`)
    return
  }

  try {
    // Get user and org info for enrichment
    const [user, org] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
      }),
      prisma.organization.findUnique({
        where: { id: orgId },
        select: { id: true, planTier: true },
      }),
    ])

    if (!user || !org) {
      console.warn(`User or org not found: userId=${userId}, orgId=${orgId}`)
      return
    }

    // Get user role in organization
    const membership = await prisma.organizationMember.findFirst({
      where: { userId, orgId },
      select: { role: true },
    })

    // Record the usage event using AuditLog
    await withRetry(
      () => prisma.auditLog.create({
        data: {
          userId,
          orgId,
          action: 'feature_usage',
          resourceType: 'feature',
          resourceId: featureKey,
          metadata: {
            featureKey,
            featureName: featureInfo.name,
            category: featureInfo.category,
            planTier: org.planTier,
            userRole: membership?.role || 'unknown',
            sessionId,
            duration,
            ...metadata,
          } as Prisma.InputJsonValue,
        },
      }),
      'track feature usage'
    )
  } catch (error) {
    // Non-blocking - log and continue
    console.error('Failed to track feature usage:', error)
  }
}

/**
 * Calculate feature metrics for a specific date and period
 * Aggregates usage data into FeatureUsageMetric records
 */
export async function calculateFeatureMetrics(
  date: Date,
  period: MetricPeriod
): Promise<FeatureMetrics[]> {
  // Calculate date range based on period
  const endDate = new Date(date)
  const startDate = new Date(date)

  switch (period) {
    case 'DAILY':
      startDate.setDate(startDate.getDate() - 1)
      break
    case 'WEEKLY':
      startDate.setDate(startDate.getDate() - 7)
      break
    case 'MONTHLY':
      startDate.setMonth(startDate.getMonth() - 1)
      break
    case 'QUARTERLY':
      startDate.setMonth(startDate.getMonth() - 3)
      break
    case 'YEARLY':
      startDate.setFullYear(startDate.getFullYear() - 1)
      break
  }

  const metrics: FeatureMetrics[] = []

  // Get total users count for adoption rate calculation
  const totalUsers = await prisma.user.count()

  // Process each feature
  for (const [featureKey, featureInfo] of Object.entries(TRACKABLE_FEATURES)) {
    // Get audit logs for this feature
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        action: 'feature_usage',
        resourceType: 'feature',
        resourceId: featureKey,
        timestamp: { gte: startDate, lt: endDate },
      },
      select: {
        userId: true,
        orgId: true,
        metadata: true,
      },
    })

    if (auditLogs.length === 0) {
      // Create metric with zero values
      const metric = await prisma.featureUsageMetric.upsert({
        where: {
          date_period_featureKey: {
            date: endDate,
            period,
            featureKey,
          },
        },
        create: {
          date: endDate,
          period,
          featureKey,
          featureName: featureInfo.name,
          totalUsers: 0,
          activeUsers: 0,
          totalEvents: 0,
          uniqueSessions: 0,
          avgTimeSpent: 0,
          byPlan: {},
          byUserRole: {},
          adoptionRate: 0,
          retentionRate: 0,
          metadata: { category: featureInfo.category },
        },
        update: {
          totalUsers: 0,
          activeUsers: 0,
          totalEvents: 0,
          uniqueSessions: 0,
          avgTimeSpent: 0,
          byPlan: {},
          byUserRole: {},
          adoptionRate: 0,
          retentionRate: 0,
        },
      })

      metrics.push({
        featureKey,
        featureName: featureInfo.name,
        totalUsers: metric.totalUsers,
        activeUsers: metric.activeUsers,
        totalEvents: metric.totalEvents,
        uniqueSessions: metric.uniqueSessions,
        avgTimeSpent: metric.avgTimeSpent,
        adoptionRate: Number(metric.adoptionRate),
        retentionRate: Number(metric.retentionRate),
        byPlan: metric.byPlan as Record<string, number>,
        byUserRole: metric.byUserRole as Record<string, number>,
      })
      continue
    }

    // Calculate metrics
    const uniqueUsers = new Set(auditLogs.filter(r => r.userId).map(r => r.userId))
    const uniqueSessions = new Set(
      auditLogs
        .map(r => (r.metadata as Record<string, unknown>)?.sessionId)
        .filter(Boolean)
    )

    let totalDuration = 0
    const byPlan: Record<string, number> = {}
    const byUserRole: Record<string, number> = {}

    for (const record of auditLogs) {
      const recordMetadata = record.metadata as Record<string, unknown>

      // Accumulate duration
      if (typeof recordMetadata?.duration === 'number') {
        totalDuration += recordMetadata.duration
      }

      // Count by plan
      const planTier = (recordMetadata?.planTier as string) || 'unknown'
      byPlan[planTier] = (byPlan[planTier] || 0) + 1

      // Count by role
      const userRole = (recordMetadata?.userRole as string) || 'unknown'
      byUserRole[userRole] = (byUserRole[userRole] || 0) + 1
    }

    const totalEvents = auditLogs.length
    const activeUsersCount = uniqueUsers.size
    const avgTimeSpent = activeUsersCount > 0
      ? Math.round(totalDuration / activeUsersCount)
      : 0
    const adoptionRate = totalUsers > 0
      ? Number(((activeUsersCount / totalUsers) * 100).toFixed(2))
      : 0

    // Calculate retention rate (users who used this feature in both this and previous period)
    let retentionRate = 0
    if (period !== 'DAILY') {
      const previousEndDate = new Date(startDate)
      const previousStartDate = new Date(startDate)

      switch (period) {
        case 'WEEKLY':
          previousStartDate.setDate(previousStartDate.getDate() - 7)
          break
        case 'MONTHLY':
          previousStartDate.setMonth(previousStartDate.getMonth() - 1)
          break
        case 'QUARTERLY':
          previousStartDate.setMonth(previousStartDate.getMonth() - 3)
          break
        case 'YEARLY':
          previousStartDate.setFullYear(previousStartDate.getFullYear() - 1)
          break
      }

      const previousLogs = await prisma.auditLog.findMany({
        where: {
          action: 'feature_usage',
          resourceType: 'feature',
          resourceId: featureKey,
          timestamp: { gte: previousStartDate, lt: previousEndDate },
        },
        select: { userId: true },
      })

      const previousUsers = new Set(previousLogs.filter(r => r.userId).map(r => r.userId))
      const retainedUsers = [...uniqueUsers].filter(u => u && previousUsers.has(u))

      retentionRate = previousUsers.size > 0
        ? Number(((retainedUsers.length / previousUsers.size) * 100).toFixed(2))
        : 0
    }

    // Upsert the metric
    const metric = await prisma.featureUsageMetric.upsert({
      where: {
        date_period_featureKey: {
          date: endDate,
          period,
          featureKey,
        },
      },
      create: {
        date: endDate,
        period,
        featureKey,
        featureName: featureInfo.name,
        totalUsers,
        activeUsers: activeUsersCount,
        totalEvents,
        uniqueSessions: uniqueSessions.size,
        avgTimeSpent,
        byPlan: byPlan as Prisma.InputJsonValue,
        byUserRole: byUserRole as Prisma.InputJsonValue,
        adoptionRate,
        retentionRate,
        metadata: { category: featureInfo.category },
      },
      update: {
        featureName: featureInfo.name,
        totalUsers,
        activeUsers: activeUsersCount,
        totalEvents,
        uniqueSessions: uniqueSessions.size,
        avgTimeSpent,
        byPlan: byPlan as Prisma.InputJsonValue,
        byUserRole: byUserRole as Prisma.InputJsonValue,
        adoptionRate,
        retentionRate,
        metadata: { category: featureInfo.category },
      },
    })

    metrics.push({
      featureKey,
      featureName: featureInfo.name,
      totalUsers: metric.totalUsers,
      activeUsers: metric.activeUsers,
      totalEvents: metric.totalEvents,
      uniqueSessions: metric.uniqueSessions,
      avgTimeSpent: metric.avgTimeSpent,
      adoptionRate: Number(metric.adoptionRate),
      retentionRate: Number(metric.retentionRate),
      byPlan: metric.byPlan as Record<string, number>,
      byUserRole: metric.byUserRole as Record<string, number>,
    })
  }

  return metrics
}

/**
 * Get feature adoption data
 * Returns adoption metrics for a specific feature
 */
export async function getFeatureAdoption(featureKey: FeatureKey): Promise<{
  current: FeatureMetrics | null
  trend: Array<{ date: string; adoptionRate: number; activeUsers: number }>
  topOrganizations: Array<{ orgId: string; orgName: string; usage: number }>
}> {
  const featureInfo = TRACKABLE_FEATURES[featureKey]
  if (!featureInfo) {
    return { current: null, trend: [], topOrganizations: [] }
  }

  // Get current metrics (most recent)
  const currentMetric = await prisma.featureUsageMetric.findFirst({
    where: { featureKey },
    orderBy: { date: 'desc' },
  })

  // Get trend data (last 12 periods)
  const trendMetrics = await prisma.featureUsageMetric.findMany({
    where: {
      featureKey,
      period: 'WEEKLY',
    },
    orderBy: { date: 'desc' },
    take: 12,
  })

  // Get top organizations by usage from audit logs
  const topOrgUsage = await prisma.auditLog.groupBy({
    by: ['orgId'],
    where: {
      action: 'feature_usage',
      resourceType: 'feature',
      resourceId: featureKey,
    },
    _count: { _all: true },
    orderBy: { _count: { orgId: 'desc' } },
    take: 10,
  })

  // Get organization names
  const orgIds = topOrgUsage.map(o => o.orgId)
  const orgs = await prisma.organization.findMany({
    where: { id: { in: orgIds } },
    select: { id: true, name: true },
  })
  const orgMap = new Map(orgs.map(o => [o.id, o.name]))

  return {
    current: currentMetric ? {
      featureKey: currentMetric.featureKey,
      featureName: currentMetric.featureName,
      totalUsers: currentMetric.totalUsers,
      activeUsers: currentMetric.activeUsers,
      totalEvents: currentMetric.totalEvents,
      uniqueSessions: currentMetric.uniqueSessions,
      avgTimeSpent: currentMetric.avgTimeSpent,
      adoptionRate: Number(currentMetric.adoptionRate),
      retentionRate: Number(currentMetric.retentionRate),
      byPlan: currentMetric.byPlan as Record<string, number>,
      byUserRole: currentMetric.byUserRole as Record<string, number>,
    } : null,
    trend: trendMetrics.reverse().map(m => ({
      date: m.date.toISOString().split('T')[0],
      adoptionRate: Number(m.adoptionRate),
      activeUsers: m.activeUsers,
    })),
    topOrganizations: topOrgUsage.map(o => ({
      orgId: o.orgId,
      orgName: orgMap.get(o.orgId) || 'Unknown',
      usage: o._count._all,
    })),
  }
}

/**
 * Get underutilized features
 * Returns features with low adoption rates
 */
export async function getUnderutilizedFeatures(
  threshold: number = 20 // adoption rate threshold percentage
): Promise<Array<{
  featureKey: string
  featureName: string
  category: string
  adoptionRate: number
  totalEvents: number
  recommendation: string
}>> {
  // Get most recent metrics for each feature
  const metrics = await prisma.featureUsageMetric.findMany({
    where: { period: 'MONTHLY' },
    orderBy: [{ featureKey: 'asc' }, { date: 'desc' }],
    distinct: ['featureKey'],
  })

  const underutilized = metrics
    .filter(m => Number(m.adoptionRate) < threshold)
    .map(m => {
      const featureInfo = TRACKABLE_FEATURES[m.featureKey as FeatureKey]
      const category = featureInfo?.category || 'unknown'

      // Generate recommendation based on adoption level
      let recommendation = ''
      const adoptionRate = Number(m.adoptionRate)

      if (adoptionRate < 5) {
        recommendation = 'Consider a dedicated onboarding campaign or in-app tutorial'
      } else if (adoptionRate < 10) {
        recommendation = 'Highlight feature in product tours and email campaigns'
      } else if (adoptionRate < 15) {
        recommendation = 'Add contextual hints and feature discovery prompts'
      } else {
        recommendation = 'Monitor trends and gather user feedback for improvements'
      }

      return {
        featureKey: m.featureKey,
        featureName: m.featureName,
        category,
        adoptionRate,
        totalEvents: m.totalEvents,
        recommendation,
      }
    })
    .sort((a, b) => a.adoptionRate - b.adoptionRate)

  return underutilized
}

/**
 * Get feature usage by plan tier
 * Returns aggregated usage data by plan
 */
export async function getFeatureUsageByPlan(): Promise<Record<string, Record<string, number>>> {
  const metrics = await prisma.featureUsageMetric.findMany({
    where: { period: 'MONTHLY' },
    orderBy: [{ featureKey: 'asc' }, { date: 'desc' }],
    distinct: ['featureKey'],
  })

  const byPlan: Record<string, Record<string, number>> = {
    STARTER: {},
    PROFESSIONAL: {},
    ENTERPRISE: {},
  }

  for (const metric of metrics) {
    const planData = metric.byPlan as Record<string, number>
    for (const [plan, count] of Object.entries(planData)) {
      if (byPlan[plan]) {
        byPlan[plan][metric.featureKey] = count
      }
    }
  }

  return byPlan
}
