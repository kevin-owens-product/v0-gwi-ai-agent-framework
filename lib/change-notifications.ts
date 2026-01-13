/**
 * Change Notification Service
 *
 * Manages alerts and notifications for data changes.
 * Features:
 * - Threshold-based alerting
 * - Real-time change notifications
 * - Alert management (read/dismiss)
 * - Change summary generation
 */

import { prisma } from '@/lib/db'
import { Prisma, ChangeAlertType, AlertSeverity } from '@prisma/client'
import { SIGNIFICANCE_THRESHOLDS, type VersionedEntityType } from './change-tracking'

// Alert configuration
export interface AlertThreshold {
  metric: string
  type: 'increase' | 'decrease' | 'both'
  threshold: number // Percentage as decimal or absolute value
  isPercentage: boolean
  severity: AlertSeverity
}

// Default alert thresholds
export const DEFAULT_ALERT_THRESHOLDS: AlertThreshold[] = [
  { metric: 'brandHealth', type: 'decrease', threshold: 5, isPercentage: false, severity: 'WARNING' },
  { metric: 'brandHealth', type: 'decrease', threshold: 10, isPercentage: false, severity: 'CRITICAL' },
  { metric: 'marketShare', type: 'decrease', threshold: 0.1, isPercentage: true, severity: 'WARNING' },
  { metric: 'audience_size', type: 'both', threshold: 0.2, isPercentage: true, severity: 'INFO' },
  { metric: 'nps', type: 'decrease', threshold: 15, isPercentage: false, severity: 'CRITICAL' },
  { metric: 'sentiment', type: 'decrease', threshold: 0.2, isPercentage: false, severity: 'WARNING' },
]

// Alert entry type
export interface ChangeAlertEntry {
  id: string
  orgId: string
  entityType: string
  entityId: string
  alertType: ChangeAlertType
  severity: AlertSeverity
  title: string
  message: string
  metric: string | null
  previousValue: unknown
  currentValue: unknown
  changePercent: number | null
  threshold: number | null
  isRead: boolean
  isDismissed: boolean
  metadata: Record<string, unknown>
  createdAt: Date
}

// Change summary types
export interface ChangeSummaryEntry {
  id: string
  orgId: string
  period: 'daily' | 'weekly' | 'monthly'
  periodStart: Date
  periodEnd: Date
  summaryType: string
  metrics: Record<string, unknown>
  highlights: Array<{
    type: string
    title: string
    description: string
    entityType?: string
    entityId?: string
  }>
  newItems: number
  updatedItems: number
  deletedItems: number
  significantChanges: number
  topChanges: Array<{
    entityType: string
    entityId: string
    entityName: string
    changeType: string
    summary: string
    changePercent?: number
  }>
  createdAt: Date
}

// Alert query options
export interface AlertQueryOptions {
  alertTypes?: ChangeAlertType[]
  severities?: AlertSeverity[]
  entityTypes?: string[]
  includeRead?: boolean
  includeDismissed?: boolean
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

/**
 * Change Notification Service
 */
class ChangeNotificationService {
  /**
   * Create a new alert
   */
  async createAlert(
    orgId: string,
    entityType: VersionedEntityType,
    entityId: string,
    alertType: ChangeAlertType,
    params: {
      title: string
      message: string
      severity?: AlertSeverity
      metric?: string
      previousValue?: unknown
      currentValue?: unknown
      changePercent?: number
      threshold?: number
      metadata?: Record<string, unknown>
    }
  ): Promise<ChangeAlertEntry> {
    const alert = await prisma.changeAlert.create({
      data: {
        orgId,
        entityType,
        entityId,
        alertType,
        severity: params.severity || 'INFO',
        title: params.title,
        message: params.message,
        metric: params.metric,
        previousValue: params.previousValue !== undefined
          ? (params.previousValue as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        currentValue: params.currentValue !== undefined
          ? (params.currentValue as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        changePercent: params.changePercent,
        threshold: params.threshold,
        metadata: (params.metadata || {}) as Prisma.InputJsonValue,
      },
    })

    return this.mapToAlertEntry(alert)
  }

  /**
   * Check values against thresholds and create alerts if needed
   */
  async checkThresholdsAndAlert(
    orgId: string,
    entityType: VersionedEntityType,
    entityId: string,
    entityName: string,
    metrics: Record<string, { previous: number; current: number }>,
    customThresholds?: AlertThreshold[]
  ): Promise<ChangeAlertEntry[]> {
    const thresholds = customThresholds || DEFAULT_ALERT_THRESHOLDS
    const alerts: ChangeAlertEntry[] = []

    for (const [metric, values] of Object.entries(metrics)) {
      const applicableThresholds = thresholds.filter(t => t.metric === metric)

      for (const threshold of applicableThresholds) {
        const changePercent = values.previous !== 0
          ? (values.current - values.previous) / Math.abs(values.previous)
          : (values.current !== 0 ? 1 : 0)
        const absoluteChange = values.current - values.previous

        const exceedsThreshold = this.checkThreshold(
          threshold,
          changePercent,
          absoluteChange
        )

        if (exceedsThreshold) {
          const alertType = this.determineAlertType(changePercent, threshold)
          const alert = await this.createAlert(
            orgId,
            entityType,
            entityId,
            alertType,
            {
              title: this.generateAlertTitle(metric, changePercent, entityName),
              message: this.generateAlertMessage(metric, values, changePercent, entityName),
              severity: threshold.severity,
              metric,
              previousValue: values.previous,
              currentValue: values.current,
              changePercent,
              threshold: threshold.threshold,
            }
          )
          alerts.push(alert)
        }
      }
    }

    return alerts
  }

  /**
   * Check if a change exceeds threshold
   */
  private checkThreshold(
    threshold: AlertThreshold,
    changePercent: number,
    absoluteChange: number
  ): boolean {
    const value = threshold.isPercentage ? Math.abs(changePercent) : Math.abs(absoluteChange)
    const thresholdValue = threshold.threshold

    if (threshold.type === 'both') {
      return value >= thresholdValue
    }

    if (threshold.type === 'increase') {
      return changePercent > 0 && value >= thresholdValue
    }

    if (threshold.type === 'decrease') {
      return changePercent < 0 && value >= thresholdValue
    }

    return false
  }

  /**
   * Determine alert type based on change
   */
  private determineAlertType(
    changePercent: number,
    threshold: AlertThreshold
  ): ChangeAlertType {
    if (changePercent > 0) {
      return 'SIGNIFICANT_INCREASE'
    }
    if (changePercent < 0) {
      return 'SIGNIFICANT_DECREASE'
    }
    return 'THRESHOLD_CROSSED'
  }

  /**
   * Generate alert title
   */
  private generateAlertTitle(
    metric: string,
    changePercent: number,
    entityName: string
  ): string {
    const direction = changePercent > 0 ? 'increased' : 'decreased'
    const formattedMetric = metric.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()
    return `${formattedMetric} ${direction} for ${entityName}`
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(
    metric: string,
    values: { previous: number; current: number },
    changePercent: number,
    entityName: string
  ): string {
    const sign = changePercent >= 0 ? '+' : ''
    const percentStr = `${sign}${(changePercent * 100).toFixed(1)}%`
    return `${entityName}: ${metric} changed from ${values.previous} to ${values.current} (${percentStr})`
  }

  /**
   * Get alerts for an organization
   */
  async getAlerts(
    orgId: string,
    options: AlertQueryOptions = {}
  ): Promise<{ alerts: ChangeAlertEntry[]; total: number }> {
    const {
      alertTypes,
      severities,
      entityTypes,
      includeRead = false,
      includeDismissed = false,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = options

    const where: Prisma.ChangeAlertWhereInput = { orgId }

    if (alertTypes && alertTypes.length > 0) {
      where.alertType = { in: alertTypes }
    }

    if (severities && severities.length > 0) {
      where.severity = { in: severities }
    }

    if (entityTypes && entityTypes.length > 0) {
      where.entityType = { in: entityTypes }
    }

    if (!includeRead) {
      where.isRead = false
    }

    if (!includeDismissed) {
      where.isDismissed = false
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    const [alerts, total] = await Promise.all([
      prisma.changeAlert.findMany({
        where,
        orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.changeAlert.count({ where }),
    ])

    return {
      alerts: alerts.map(a => this.mapToAlertEntry(a)),
      total,
    }
  }

  /**
   * Get unread alert count
   */
  async getUnreadAlertCount(orgId: string): Promise<number> {
    return prisma.changeAlert.count({
      where: { orgId, isRead: false, isDismissed: false },
    })
  }

  /**
   * Mark alert as read
   */
  async markAsRead(alertId: string): Promise<void> {
    await prisma.changeAlert.update({
      where: { id: alertId },
      data: { isRead: true },
    })
  }

  /**
   * Mark multiple alerts as read
   */
  async markAllAsRead(orgId: string): Promise<number> {
    const result = await prisma.changeAlert.updateMany({
      where: { orgId, isRead: false },
      data: { isRead: true },
    })
    return result.count
  }

  /**
   * Dismiss an alert
   */
  async dismissAlert(alertId: string): Promise<void> {
    await prisma.changeAlert.update({
      where: { id: alertId },
      data: { isDismissed: true },
    })
  }

  /**
   * Generate change summary for a period
   */
  async generateChangeSummary(
    orgId: string,
    period: 'daily' | 'weekly' | 'monthly',
    periodStart: Date,
    periodEnd: Date,
    summaryType: string = 'overview'
  ): Promise<ChangeSummaryEntry> {
    // Get all version changes in the period
    const versions = await prisma.entityVersion.findMany({
      where: {
        orgId,
        createdAt: { gte: periodStart, lte: periodEnd },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Count by change type
    const newItems = versions.filter(v => v.changeType === 'CREATE').length
    const updatedItems = versions.filter(v => v.changeType === 'UPDATE').length
    const deletedItems = versions.filter(v => v.changeType === 'DELETE').length

    // Find significant changes
    const significantVersions = versions.filter(v => {
      const delta = v.delta as { hasSignificantChanges?: boolean } | null
      return delta?.hasSignificantChanges
    })

    // Generate highlights
    const highlights: ChangeSummaryEntry['highlights'] = []

    if (newItems > 0) {
      highlights.push({
        type: 'new_items',
        title: `${newItems} new items created`,
        description: `New content was added during this period`,
      })
    }

    if (significantVersions.length > 0) {
      highlights.push({
        type: 'significant_changes',
        title: `${significantVersions.length} significant changes`,
        description: `Notable updates that may require attention`,
      })
    }

    // Get alerts from the period
    const criticalAlerts = await prisma.changeAlert.count({
      where: {
        orgId,
        severity: 'CRITICAL',
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    })

    if (criticalAlerts > 0) {
      highlights.push({
        type: 'critical_alerts',
        title: `${criticalAlerts} critical alerts`,
        description: `Important changes that need immediate review`,
      })
    }

    // Top changes (most significant)
    const topChanges = significantVersions.slice(0, 10).map(v => {
      const data = v.data as Record<string, unknown>
      const delta = v.delta as { summary?: string } | null
      return {
        entityType: v.entityType,
        entityId: v.entityId,
        entityName: (data.name || data.title || v.entityId) as string,
        changeType: v.changeType,
        summary: delta?.summary || v.changeSummary || 'Changes made',
      }
    })

    // Metrics
    const metrics: Record<string, unknown> = {
      totalChanges: versions.length,
      changesByType: {
        create: newItems,
        update: updatedItems,
        delete: deletedItems,
      },
      changesByEntityType: this.groupByEntityType(versions),
      alertCount: await prisma.changeAlert.count({
        where: { orgId, createdAt: { gte: periodStart, lte: periodEnd } },
      }),
    }

    // Upsert summary
    const summary = await prisma.changeSummary.upsert({
      where: {
        orgId_period_periodStart_summaryType: {
          orgId,
          period,
          periodStart,
          summaryType,
        },
      },
      create: {
        orgId,
        period,
        periodStart,
        periodEnd,
        summaryType,
        metrics: metrics as Prisma.InputJsonValue,
        highlights: highlights as unknown as Prisma.InputJsonValue,
        newItems,
        updatedItems,
        deletedItems,
        significantChanges: significantVersions.length,
        topChanges: topChanges as unknown as Prisma.InputJsonValue,
      },
      update: {
        periodEnd,
        metrics: metrics as Prisma.InputJsonValue,
        highlights: highlights as unknown as Prisma.InputJsonValue,
        newItems,
        updatedItems,
        deletedItems,
        significantChanges: significantVersions.length,
        topChanges: topChanges as unknown as Prisma.InputJsonValue,
      },
    })

    return this.mapToSummaryEntry(summary)
  }

  /**
   * Get existing change summaries
   */
  async getChangeSummaries(
    orgId: string,
    options: {
      period?: 'daily' | 'weekly' | 'monthly'
      summaryType?: string
      limit?: number
    } = {}
  ): Promise<ChangeSummaryEntry[]> {
    const { period, summaryType, limit = 10 } = options

    const where: Prisma.ChangeSummaryWhereInput = { orgId }

    if (period) where.period = period
    if (summaryType) where.summaryType = summaryType

    const summaries = await prisma.changeSummary.findMany({
      where,
      orderBy: { periodStart: 'desc' },
      take: limit,
    })

    return summaries.map(s => this.mapToSummaryEntry(s))
  }

  /**
   * Group versions by entity type
   */
  private groupByEntityType(
    versions: Array<{ entityType: string }>
  ): Record<string, number> {
    const grouped: Record<string, number> = {}

    for (const version of versions) {
      grouped[version.entityType] = (grouped[version.entityType] || 0) + 1
    }

    return grouped
  }

  /**
   * Map database entry to ChangeAlertEntry
   */
  private mapToAlertEntry(entry: {
    id: string
    orgId: string
    entityType: string
    entityId: string
    alertType: ChangeAlertType
    severity: AlertSeverity
    title: string
    message: string
    metric: string | null
    previousValue: Prisma.JsonValue
    currentValue: Prisma.JsonValue
    changePercent: number | null
    threshold: number | null
    isRead: boolean
    isDismissed: boolean
    metadata: Prisma.JsonValue
    createdAt: Date
  }): ChangeAlertEntry {
    return {
      id: entry.id,
      orgId: entry.orgId,
      entityType: entry.entityType,
      entityId: entry.entityId,
      alertType: entry.alertType,
      severity: entry.severity,
      title: entry.title,
      message: entry.message,
      metric: entry.metric,
      previousValue: entry.previousValue,
      currentValue: entry.currentValue,
      changePercent: entry.changePercent,
      threshold: entry.threshold,
      isRead: entry.isRead,
      isDismissed: entry.isDismissed,
      metadata: entry.metadata as Record<string, unknown>,
      createdAt: entry.createdAt,
    }
  }

  /**
   * Map database entry to ChangeSummaryEntry
   */
  private mapToSummaryEntry(entry: {
    id: string
    orgId: string
    period: string
    periodStart: Date
    periodEnd: Date
    summaryType: string
    metrics: Prisma.JsonValue
    highlights: Prisma.JsonValue
    newItems: number
    updatedItems: number
    deletedItems: number
    significantChanges: number
    topChanges: Prisma.JsonValue
    createdAt: Date
  }): ChangeSummaryEntry {
    return {
      id: entry.id,
      orgId: entry.orgId,
      period: entry.period as 'daily' | 'weekly' | 'monthly',
      periodStart: entry.periodStart,
      periodEnd: entry.periodEnd,
      summaryType: entry.summaryType,
      metrics: entry.metrics as Record<string, unknown>,
      highlights: entry.highlights as ChangeSummaryEntry['highlights'],
      newItems: entry.newItems,
      updatedItems: entry.updatedItems,
      deletedItems: entry.deletedItems,
      significantChanges: entry.significantChanges,
      topChanges: entry.topChanges as ChangeSummaryEntry['topChanges'],
      createdAt: entry.createdAt,
    }
  }
}

// Export singleton instance
export const changeNotifications = new ChangeNotificationService()

// Convenience functions
export async function createChangeAlert(
  orgId: string,
  entityType: VersionedEntityType,
  entityId: string,
  alertType: ChangeAlertType,
  params: {
    title: string
    message: string
    severity?: AlertSeverity
    metric?: string
    previousValue?: unknown
    currentValue?: unknown
    changePercent?: number
    threshold?: number
    metadata?: Record<string, unknown>
  }
): Promise<ChangeAlertEntry> {
  return changeNotifications.createAlert(orgId, entityType, entityId, alertType, params)
}

export async function checkThresholdsAndAlert(
  orgId: string,
  entityType: VersionedEntityType,
  entityId: string,
  entityName: string,
  metrics: Record<string, { previous: number; current: number }>
): Promise<ChangeAlertEntry[]> {
  return changeNotifications.checkThresholdsAndAlert(
    orgId,
    entityType,
    entityId,
    entityName,
    metrics
  )
}

export async function getChangeAlerts(
  orgId: string,
  options?: AlertQueryOptions
): Promise<{ alerts: ChangeAlertEntry[]; total: number }> {
  return changeNotifications.getAlerts(orgId, options)
}

export async function getUnreadAlertCount(orgId: string): Promise<number> {
  return changeNotifications.getUnreadAlertCount(orgId)
}

export async function markAlertAsRead(alertId: string): Promise<void> {
  return changeNotifications.markAsRead(alertId)
}

export async function markAllAlertsAsRead(orgId: string): Promise<number> {
  return changeNotifications.markAllAsRead(orgId)
}

export async function dismissChangeAlert(alertId: string): Promise<void> {
  return changeNotifications.dismissAlert(alertId)
}

export async function generateChangeSummary(
  orgId: string,
  period: 'daily' | 'weekly' | 'monthly',
  periodStart: Date,
  periodEnd: Date,
  summaryType?: string
): Promise<ChangeSummaryEntry> {
  return changeNotifications.generateChangeSummary(
    orgId,
    period,
    periodStart,
    periodEnd,
    summaryType
  )
}

export async function getChangeSummaries(
  orgId: string,
  options?: {
    period?: 'daily' | 'weekly' | 'monthly'
    summaryType?: string
    limit?: number
  }
): Promise<ChangeSummaryEntry[]> {
  return changeNotifications.getChangeSummaries(orgId, options)
}
