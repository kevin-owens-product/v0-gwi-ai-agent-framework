/**
 * Change Tracking Service
 *
 * Provides comprehensive data versioning and change detection.
 * Features:
 * - Entity version snapshots
 * - Delta computation between versions
 * - Significance detection for changes
 * - Change timeline generation
 * - Before/after comparisons
 */

import { prisma } from '@/lib/db'
import { Prisma, ChangeType } from '@prisma/client'

// Supported entity types for versioning
export type VersionedEntityType =
  | 'audience'
  | 'crosstab'
  | 'insight'
  | 'chart'
  | 'report'
  | 'dashboard'
  | 'brand_tracking'

// Configuration for significance detection
export interface SignificanceConfig {
  absolute?: {
    min: number
  }
  relative?: {
    threshold: number // Percentage as decimal (0.05 = 5%)
  }
}

// Default significance thresholds by metric type
export const SIGNIFICANCE_THRESHOLDS: Record<string, SignificanceConfig> = {
  audience_size: { relative: { threshold: 0.10 } },      // 10% change
  brand_health: { absolute: { min: 5 } },                // 5 point change
  market_share: { relative: { threshold: 0.05 } },       // 5% change
  nps: { absolute: { min: 10 } },                        // 10 point change
  sentiment: { absolute: { min: 0.1 } },                 // 0.1 change (-1 to 1 scale)
  awareness: { relative: { threshold: 0.05 } },          // 5% change
  consideration: { relative: { threshold: 0.05 } },      // 5% change
  preference: { relative: { threshold: 0.05 } },         // 5% change
  default: { relative: { threshold: 0.10 } },            // 10% change default
}

// Fields to ignore when computing deltas
const IGNORED_FIELDS = ['updatedAt', 'createdAt', 'id', 'orgId']

// Delta types
export interface FieldDelta {
  field: string
  oldValue: unknown
  newValue: unknown
  changeType: 'added' | 'removed' | 'modified'
  isSignificant: boolean
  changePercent?: number
}

export interface EntityDelta {
  fields: FieldDelta[]
  changedFieldNames: string[]
  hasSignificantChanges: boolean
  summary: string
}

export interface VersionEntry {
  id: string
  orgId: string
  entityType: string
  entityId: string
  version: number
  data: Record<string, unknown>
  delta: EntityDelta | null
  changedFields: string[]
  changeType: ChangeType
  changeSummary: string | null
  createdBy: string | null
  createdAt: Date
}

export interface VersionComparison {
  entityType: string
  entityId: string
  before: {
    version: number
    data: Record<string, unknown>
    createdAt: Date
  }
  after: {
    version: number
    data: Record<string, unknown>
    createdAt: Date
  }
  delta: EntityDelta
}

export interface ChangeTimelineEntry {
  id: string
  entityType: string
  entityId: string
  entityName: string
  changeType: ChangeType
  summary: string
  changedFields: string[]
  isSignificant: boolean
  createdBy: string | null
  createdAt: Date
  metadata?: Record<string, unknown>
}

export interface ChangeTimelineOptions {
  entityTypes?: VersionedEntityType[]
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
  significantOnly?: boolean
  userId?: string
}

export interface NewItemsSummary {
  entityType: VersionedEntityType
  count: number
  items: Array<{
    id: string
    name: string
    createdAt: Date
  }>
}

/**
 * Change Tracking Service
 */
class ChangeTrackingService {
  /**
   * Capture a new version of an entity
   */
  async captureVersion(
    orgId: string,
    entityType: VersionedEntityType,
    entityId: string,
    data: Record<string, unknown>,
    changeType: ChangeType = 'UPDATE',
    userId?: string
  ): Promise<VersionEntry> {
    // Get the current latest version
    const latestVersion = await prisma.entityVersion.findFirst({
      where: { entityType, entityId },
      orderBy: { version: 'desc' },
    })

    const newVersion = (latestVersion?.version || 0) + 1
    let delta: EntityDelta | null = null
    let changeSummary: string | null = null

    // Compute delta if this is an update (not initial creation)
    if (latestVersion && changeType !== 'CREATE') {
      const previousData = latestVersion.data as Record<string, unknown>
      delta = this.computeDelta(previousData, data, entityType)
      changeSummary = delta.summary
    } else if (changeType === 'CREATE') {
      changeSummary = `Created ${entityType}: ${(data.name || data.title || entityId) as string}`
    }

    const entry = await prisma.entityVersion.create({
      data: {
        orgId,
        entityType,
        entityId,
        version: newVersion,
        data: data as Prisma.InputJsonValue,
        delta: delta ? (delta as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        changedFields: delta?.changedFieldNames || [],
        changeType,
        changeSummary,
        createdBy: userId,
      },
    })

    return this.mapToVersionEntry(entry)
  }

  /**
   * Compute delta between two entity states
   */
  computeDelta(
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
    entityType: VersionedEntityType
  ): EntityDelta {
    const fields: FieldDelta[] = []
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])

    for (const key of allKeys) {
      if (IGNORED_FIELDS.includes(key)) continue

      const oldValue = oldData[key]
      const newValue = newData[key]

      if (oldValue === undefined && newValue !== undefined) {
        fields.push({
          field: key,
          oldValue: undefined,
          newValue,
          changeType: 'added',
          isSignificant: true,
        })
      } else if (oldValue !== undefined && newValue === undefined) {
        fields.push({
          field: key,
          oldValue,
          newValue: undefined,
          changeType: 'removed',
          isSignificant: true,
        })
      } else if (!this.deepEqual(oldValue, newValue)) {
        const { isSignificant, changePercent } = this.checkSignificance(
          key,
          oldValue,
          newValue,
          entityType
        )
        fields.push({
          field: key,
          oldValue,
          newValue,
          changeType: 'modified',
          isSignificant,
          changePercent,
        })
      }
    }

    const changedFieldNames = fields.map(f => f.field)
    const hasSignificantChanges = fields.some(f => f.isSignificant)
    const summary = this.generateChangeSummary(fields, entityType)

    return {
      fields,
      changedFieldNames,
      hasSignificantChanges,
      summary,
    }
  }

  /**
   * Check if a change is significant based on thresholds
   */
  private checkSignificance(
    field: string,
    oldValue: unknown,
    newValue: unknown,
    entityType: VersionedEntityType
  ): { isSignificant: boolean; changePercent?: number } {
    // Get threshold config for this field
    const config = SIGNIFICANCE_THRESHOLDS[field] || SIGNIFICANCE_THRESHOLDS.default

    // Only compute significance for numeric values
    if (typeof oldValue !== 'number' || typeof newValue !== 'number') {
      return { isSignificant: true } // Non-numeric changes are always significant
    }

    const changePercent = oldValue !== 0 ? ((newValue - oldValue) / Math.abs(oldValue)) :
      (newValue !== 0 ? 1 : 0)

    if (config.relative) {
      if (Math.abs(changePercent) >= config.relative.threshold) {
        return { isSignificant: true, changePercent }
      }
    }

    if (config.absolute) {
      if (Math.abs(newValue - oldValue) >= config.absolute.min) {
        return { isSignificant: true, changePercent }
      }
    }

    return { isSignificant: false, changePercent }
  }

  /**
   * Generate a human-readable summary of changes
   */
  private generateChangeSummary(fields: FieldDelta[], entityType: VersionedEntityType): string {
    if (fields.length === 0) return 'No changes detected'

    const significantChanges = fields.filter(f => f.isSignificant)

    if (significantChanges.length === 0) {
      return `${fields.length} minor change${fields.length > 1 ? 's' : ''}`
    }

    // Prioritize important fields for summary
    const priorityFields = ['size', 'name', 'status', 'brandHealth', 'marketShare', 'nps']
    const priorityChange = significantChanges.find(c => priorityFields.includes(c.field))

    if (priorityChange) {
      const changeDirection = this.getChangeDirection(priorityChange)
      return `${priorityChange.field} ${changeDirection}${
        priorityChange.changePercent !== undefined
          ? ` (${this.formatPercent(priorityChange.changePercent)})`
          : ''
      }`
    }

    return `${significantChanges.length} significant change${significantChanges.length > 1 ? 's' : ''}`
  }

  private getChangeDirection(change: FieldDelta): string {
    if (change.changeType === 'added') return 'added'
    if (change.changeType === 'removed') return 'removed'
    if (typeof change.oldValue === 'number' && typeof change.newValue === 'number') {
      return change.newValue > change.oldValue ? 'increased' : 'decreased'
    }
    return 'changed'
  }

  private formatPercent(value: number): string {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${(value * 100).toFixed(1)}%`
  }

  /**
   * Get version history for an entity
   */
  async getVersionHistory(
    entityType: VersionedEntityType,
    entityId: string,
    options: { limit?: number; offset?: number; before?: Date; after?: Date } = {}
  ): Promise<{ versions: VersionEntry[]; total: number }> {
    const { limit = 50, offset = 0, before, after } = options

    const where: Prisma.EntityVersionWhereInput = {
      entityType,
      entityId,
    }

    if (before || after) {
      where.createdAt = {}
      if (before) where.createdAt.lt = before
      if (after) where.createdAt.gt = after
    }

    const [versions, total] = await Promise.all([
      prisma.entityVersion.findMany({
        where,
        orderBy: { version: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.entityVersion.count({ where }),
    ])

    return {
      versions: versions.map(v => this.mapToVersionEntry(v)),
      total,
    }
  }

  /**
   * Compare two specific versions
   */
  async compareVersions(
    entityType: VersionedEntityType,
    entityId: string,
    version1: number,
    version2: number
  ): Promise<VersionComparison | null> {
    const [v1, v2] = await Promise.all([
      prisma.entityVersion.findFirst({
        where: { entityType, entityId, version: version1 },
      }),
      prisma.entityVersion.findFirst({
        where: { entityType, entityId, version: version2 },
      }),
    ])

    if (!v1 || !v2) return null

    const [before, after] = version1 < version2 ? [v1, v2] : [v2, v1]
    const beforeData = before.data as Record<string, unknown>
    const afterData = after.data as Record<string, unknown>

    return {
      entityType,
      entityId,
      before: {
        version: before.version,
        data: beforeData,
        createdAt: before.createdAt,
      },
      after: {
        version: after.version,
        data: afterData,
        createdAt: after.createdAt,
      },
      delta: this.computeDelta(beforeData, afterData, entityType),
    }
  }

  /**
   * Get the latest version of an entity
   */
  async getLatestVersion(
    entityType: VersionedEntityType,
    entityId: string
  ): Promise<VersionEntry | null> {
    const version = await prisma.entityVersion.findFirst({
      where: { entityType, entityId },
      orderBy: { version: 'desc' },
    })

    return version ? this.mapToVersionEntry(version) : null
  }

  /**
   * Get change timeline for an organization
   */
  async getChangeTimeline(
    orgId: string,
    options: ChangeTimelineOptions = {}
  ): Promise<{ changes: ChangeTimelineEntry[]; total: number }> {
    const {
      entityTypes,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
      significantOnly = false,
      userId,
    } = options

    const where: Prisma.EntityVersionWhereInput = {
      orgId,
      version: { gt: 1 }, // Exclude initial creations unless explicitly needed
    }

    if (entityTypes && entityTypes.length > 0) {
      where.entityType = { in: entityTypes }
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    if (userId) {
      where.createdBy = userId
    }

    const [versions, total] = await Promise.all([
      prisma.entityVersion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.entityVersion.count({ where }),
    ])

    let changes = versions.map(v => this.mapToTimelineEntry(v))

    if (significantOnly) {
      changes = changes.filter(c => c.isSignificant)
    }

    return { changes, total }
  }

  /**
   * Get new items created since a timestamp
   */
  async getNewItemsSince(
    orgId: string,
    since: Date,
    entityTypes?: VersionedEntityType[]
  ): Promise<NewItemsSummary[]> {
    const where: Prisma.EntityVersionWhereInput = {
      orgId,
      changeType: 'CREATE',
      createdAt: { gt: since },
    }

    if (entityTypes && entityTypes.length > 0) {
      where.entityType = { in: entityTypes }
    }

    const newItems = await prisma.entityVersion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Group by entity type
    const grouped = new Map<VersionedEntityType, Array<{ id: string; name: string; createdAt: Date }>>()

    for (const item of newItems) {
      const entityType = item.entityType as VersionedEntityType
      const data = item.data as Record<string, unknown>
      const name = (data.name || data.title || item.entityId) as string

      if (!grouped.has(entityType)) {
        grouped.set(entityType, [])
      }

      grouped.get(entityType)!.push({
        id: item.entityId,
        name,
        createdAt: item.createdAt,
      })
    }

    return Array.from(grouped.entries()).map(([entityType, items]) => ({
      entityType,
      count: items.length,
      items,
    }))
  }

  /**
   * Track user's last visit for "What's New" feature
   */
  async trackUserVisit(orgId: string, userId: string): Promise<void> {
    await prisma.userChangeTracker.upsert({
      where: { orgId_userId: { orgId, userId } },
      create: { orgId, userId, lastVisit: new Date() },
      update: { lastVisit: new Date() },
    })
  }

  /**
   * Get user's last visit timestamp
   */
  async getUserLastVisit(orgId: string, userId: string): Promise<Date | null> {
    const tracker = await prisma.userChangeTracker.findUnique({
      where: { orgId_userId: { orgId, userId } },
    })

    return tracker?.lastSeenChanges || null
  }

  /**
   * Mark changes as seen by user
   */
  async markChangesSeen(orgId: string, userId: string): Promise<void> {
    await prisma.userChangeTracker.upsert({
      where: { orgId_userId: { orgId, userId } },
      create: { orgId, userId, lastSeenChanges: new Date() },
      update: { lastSeenChanges: new Date() },
    })
  }

  /**
   * Get count of unseen changes for a user
   */
  async getUnseenChangesCount(orgId: string, userId: string): Promise<number> {
    const tracker = await prisma.userChangeTracker.findUnique({
      where: { orgId_userId: { orgId, userId } },
    })

    const since = tracker?.lastSeenChanges || new Date(0)

    return prisma.entityVersion.count({
      where: {
        orgId,
        createdAt: { gt: since },
        version: { gt: 1 }, // Exclude initial creations
      },
    })
  }

  /**
   * Deep equality check for objects
   */
  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true
    if (typeof a !== typeof b) return false
    if (a === null || b === null) return a === b
    if (typeof a !== 'object') return a === b

    const aObj = a as Record<string, unknown>
    const bObj = b as Record<string, unknown>

    const aKeys = Object.keys(aObj)
    const bKeys = Object.keys(bObj)

    if (aKeys.length !== bKeys.length) return false

    return aKeys.every(key => this.deepEqual(aObj[key], bObj[key]))
  }

  /**
   * Map database entry to VersionEntry
   */
  private mapToVersionEntry(entry: {
    id: string
    orgId: string
    entityType: string
    entityId: string
    version: number
    data: Prisma.JsonValue
    delta: Prisma.JsonValue
    changedFields: string[]
    changeType: ChangeType
    changeSummary: string | null
    createdBy: string | null
    createdAt: Date
  }): VersionEntry {
    return {
      id: entry.id,
      orgId: entry.orgId,
      entityType: entry.entityType,
      entityId: entry.entityId,
      version: entry.version,
      data: entry.data as Record<string, unknown>,
      delta: entry.delta as EntityDelta | null,
      changedFields: entry.changedFields,
      changeType: entry.changeType,
      changeSummary: entry.changeSummary,
      createdBy: entry.createdBy,
      createdAt: entry.createdAt,
    }
  }

  /**
   * Map database entry to ChangeTimelineEntry
   */
  private mapToTimelineEntry(entry: {
    id: string
    entityType: string
    entityId: string
    data: Prisma.JsonValue
    delta: Prisma.JsonValue
    changeType: ChangeType
    changeSummary: string | null
    changedFields: string[]
    createdBy: string | null
    createdAt: Date
  }): ChangeTimelineEntry {
    const data = entry.data as Record<string, unknown>
    const delta = entry.delta as EntityDelta | null

    return {
      id: entry.id,
      entityType: entry.entityType,
      entityId: entry.entityId,
      entityName: (data.name || data.title || entry.entityId) as string,
      changeType: entry.changeType,
      summary: entry.changeSummary || 'Changes made',
      changedFields: entry.changedFields,
      isSignificant: delta?.hasSignificantChanges ?? true,
      createdBy: entry.createdBy,
      createdAt: entry.createdAt,
    }
  }
}

// Export singleton instance
export const changeTracking = new ChangeTrackingService()

// Convenience functions for common operations
export async function captureEntityVersion(
  orgId: string,
  entityType: VersionedEntityType,
  entityId: string,
  data: Record<string, unknown>,
  changeType: ChangeType = 'UPDATE',
  userId?: string
): Promise<VersionEntry> {
  return changeTracking.captureVersion(orgId, entityType, entityId, data, changeType, userId)
}

export async function getEntityVersionHistory(
  entityType: VersionedEntityType,
  entityId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ versions: VersionEntry[]; total: number }> {
  return changeTracking.getVersionHistory(entityType, entityId, options)
}

export async function compareEntityVersions(
  entityType: VersionedEntityType,
  entityId: string,
  v1: number,
  v2: number
): Promise<VersionComparison | null> {
  return changeTracking.compareVersions(entityType, entityId, v1, v2)
}

export async function getChangeTimeline(
  orgId: string,
  options?: ChangeTimelineOptions
): Promise<{ changes: ChangeTimelineEntry[]; total: number }> {
  return changeTracking.getChangeTimeline(orgId, options)
}

export async function getNewItemsSince(
  orgId: string,
  since: Date,
  entityTypes?: VersionedEntityType[]
): Promise<NewItemsSummary[]> {
  return changeTracking.getNewItemsSince(orgId, since, entityTypes)
}

export async function trackUserVisit(orgId: string, userId: string): Promise<void> {
  return changeTracking.trackUserVisit(orgId, userId)
}

export async function getUnseenChangesCount(orgId: string, userId: string): Promise<number> {
  return changeTracking.getUnseenChangesCount(orgId, userId)
}
