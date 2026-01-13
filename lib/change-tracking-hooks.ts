/**
 * Change Tracking Hooks
 *
 * Helper functions to integrate change tracking into existing entity operations.
 * Use these hooks when creating, updating, or deleting tracked entities.
 */

import { ChangeType } from '@prisma/client'
import {
  captureEntityVersion,
  type VersionedEntityType,
} from './change-tracking'
import {
  checkThresholdsAndAlert,
  createChangeAlert,
} from './change-notifications'
import {
  trackAnalysis,
  type AnalysisType,
} from './analysis-evolution'

/**
 * Hook to call after creating an entity
 */
export async function onEntityCreated(
  orgId: string,
  entityType: VersionedEntityType,
  entityId: string,
  data: Record<string, unknown>,
  userId?: string
) {
  try {
    await captureEntityVersion(
      orgId,
      entityType,
      entityId,
      data,
      'CREATE',
      userId
    )
  } catch (error) {
    // Log but don't fail the main operation
    console.error('Failed to capture entity creation version:', error)
  }
}

/**
 * Hook to call after updating an entity
 */
export async function onEntityUpdated(
  orgId: string,
  entityType: VersionedEntityType,
  entityId: string,
  previousData: Record<string, unknown>,
  newData: Record<string, unknown>,
  userId?: string
) {
  try {
    await captureEntityVersion(
      orgId,
      entityType,
      entityId,
      newData,
      'UPDATE',
      userId
    )

    // Check for numeric metrics that need threshold alerts
    const metricsToCheck: Record<string, { previous: number; current: number }> = {}

    const numericFields = ['size', 'brandHealth', 'marketShare', 'nps', 'sentiment', 'awareness', 'consideration', 'preference', 'loyalty']

    for (const field of numericFields) {
      if (typeof previousData[field] === 'number' && typeof newData[field] === 'number') {
        metricsToCheck[field] = {
          previous: previousData[field] as number,
          current: newData[field] as number,
        }
      }
    }

    if (Object.keys(metricsToCheck).length > 0) {
      const entityName = (newData.name || newData.title || entityId) as string
      await checkThresholdsAndAlert(
        orgId,
        entityType,
        entityId,
        entityName,
        metricsToCheck
      )
    }
  } catch (error) {
    console.error('Failed to capture entity update version:', error)
  }
}

/**
 * Hook to call after deleting an entity
 */
export async function onEntityDeleted(
  orgId: string,
  entityType: VersionedEntityType,
  entityId: string,
  deletedData: Record<string, unknown>,
  userId?: string
) {
  try {
    await captureEntityVersion(
      orgId,
      entityType,
      entityId,
      deletedData,
      'DELETE',
      userId
    )
  } catch (error) {
    console.error('Failed to capture entity deletion version:', error)
  }
}

/**
 * Hook to call after regenerating AI content
 */
export async function onAIContentRegenerated(
  orgId: string,
  entityType: VersionedEntityType,
  entityId: string,
  newData: Record<string, unknown>,
  userId?: string
) {
  try {
    await captureEntityVersion(
      orgId,
      entityType,
      entityId,
      newData,
      'REGENERATE',
      userId
    )
  } catch (error) {
    console.error('Failed to capture AI regeneration version:', error)
  }
}

/**
 * Hook to call after generating/updating an analysis
 */
export async function onAnalysisCompleted(
  orgId: string,
  analysisType: AnalysisType,
  referenceId: string,
  results: Record<string, unknown>,
  aiInsights: string[],
  keyMetrics: Record<string, number>,
  options?: {
    confidence?: number
    dataSourceDate?: Date
    metadata?: Record<string, unknown>
  }
) {
  try {
    await trackAnalysis(
      orgId,
      analysisType,
      referenceId,
      results,
      aiInsights,
      keyMetrics,
      options
    )
  } catch (error) {
    console.error('Failed to track analysis:', error)
  }
}

/**
 * Hook to call when new data becomes available
 */
export async function onNewDataAvailable(
  orgId: string,
  entityType: VersionedEntityType,
  entityId: string,
  dataDescription: string
) {
  try {
    await createChangeAlert(
      orgId,
      entityType,
      entityId,
      'NEW_DATA_AVAILABLE',
      {
        title: 'New Data Available',
        message: dataDescription,
        severity: 'INFO',
        metadata: {
          dataDescription,
          availableAt: new Date().toISOString(),
        },
      }
    )
  } catch (error) {
    console.error('Failed to create new data alert:', error)
  }
}

/**
 * HOC-style wrapper for entity operations with automatic tracking
 */
export function withChangeTracking<T extends Record<string, unknown>>(
  orgId: string,
  entityType: VersionedEntityType,
  entityId: string,
  userId?: string
) {
  return {
    /**
     * Wrap a create operation
     */
    async create(operation: () => Promise<T>): Promise<T> {
      const result = await operation()
      await onEntityCreated(orgId, entityType, entityId, result, userId)
      return result
    },

    /**
     * Wrap an update operation
     */
    async update(
      previousData: Record<string, unknown>,
      operation: () => Promise<T>
    ): Promise<T> {
      const result = await operation()
      await onEntityUpdated(orgId, entityType, entityId, previousData, result, userId)
      return result
    },

    /**
     * Wrap a delete operation
     */
    async delete(
      deletedData: Record<string, unknown>,
      operation: () => Promise<void>
    ): Promise<void> {
      await operation()
      await onEntityDeleted(orgId, entityType, entityId, deletedData, userId)
    },
  }
}

/**
 * Example usage in an API route:
 *
 * ```typescript
 * import { withChangeTracking, onEntityCreated } from '@/lib/change-tracking-hooks'
 *
 * // Option 1: Direct hooks
 * export async function POST(request: NextRequest) {
 *   const audience = await prisma.audience.create({ data: ... })
 *   await onEntityCreated(orgId, 'audience', audience.id, audience)
 *   return NextResponse.json(audience)
 * }
 *
 * // Option 2: Wrapper pattern
 * export async function PUT(request: NextRequest) {
 *   const previousAudience = await prisma.audience.findUnique({ where: { id } })
 *   const tracker = withChangeTracking(orgId, 'audience', id, userId)
 *
 *   const updated = await tracker.update(previousAudience, async () => {
 *     return prisma.audience.update({ where: { id }, data: ... })
 *   })
 *
 *   return NextResponse.json(updated)
 * }
 * ```
 */
