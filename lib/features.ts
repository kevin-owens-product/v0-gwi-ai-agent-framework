import { prisma } from './prisma'
import type { FeatureValueType } from '@prisma/client'

export interface FeatureAccess {
  hasAccess: boolean
  value?: string | number | boolean | object | null
  limit?: number | null
  usage?: number
  percentage?: number
  isNearLimit?: boolean
  isAtLimit?: boolean
}

/**
 * Check if an organization has access to a feature
 * Checks entitlement overrides first, then plan features
 */
export async function checkFeatureAccess(
  organizationId: string,
  featureKey: string
): Promise<FeatureAccess> {
  try {
    // Get organization with plan and entitlements
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        plan: {
          include: {
            planFeatures: {
              where: {
                feature: { key: featureKey }
              },
              include: {
                feature: true
              }
            }
          }
        },
        entitlements: {
          where: {
            feature: { key: featureKey },
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          },
          include: {
            feature: true
          }
        }
      }
    })

    if (!org) {
      return { hasAccess: false }
    }

    // Check entitlement override first (highest priority)
    const entitlement = org.entitlements[0]
    if (entitlement) {
      const hasAccess = isFeatureEnabled(
        entitlement.value,
        entitlement.feature.valueType
      )

      let usage: number | undefined
      let limit = entitlement.limit

      // Get usage if feature has limits
      if (limit !== null && limit !== undefined) {
        usage = await getFeatureUsage(organizationId, featureKey)
      }

      return {
        hasAccess,
        value: entitlement.value,
        limit,
        usage,
        percentage: limit && usage !== undefined ? (usage / limit) * 100 : undefined,
        isNearLimit: limit && usage !== undefined ? usage >= limit * 0.8 : false,
        isAtLimit: limit && usage !== undefined ? usage >= limit : false,
      }
    }

    // Check plan feature
    const planFeature = org.plan?.planFeatures[0]
    if (planFeature) {
      const hasAccess = isFeatureEnabled(
        planFeature.value,
        planFeature.feature.valueType
      )

      let usage: number | undefined
      let limit = planFeature.limit

      // Get usage if feature has limits
      if (limit !== null && limit !== undefined) {
        usage = await getFeatureUsage(organizationId, featureKey)
      }

      return {
        hasAccess,
        value: planFeature.value,
        limit,
        usage,
        percentage: limit && usage !== undefined ? (usage / limit) * 100 : undefined,
        isNearLimit: limit && usage !== undefined ? usage >= limit * 0.8 : false,
        isAtLimit: limit && usage !== undefined ? usage >= limit : false,
      }
    }

    // Feature not found in plan or entitlements
    return { hasAccess: false }
  } catch (error) {
    console.error('Error checking feature access:', error)
    return { hasAccess: false }
  }
}

/**
 * Check if a feature value indicates the feature is enabled
 */
function isFeatureEnabled(value: any, valueType: FeatureValueType): boolean {
  switch (valueType) {
    case 'BOOLEAN':
      return value === true || value === 'true'
    case 'NUMBER':
      return typeof value === 'number' && value > 0
    case 'STRING':
      return typeof value === 'string' && value.length > 0
    case 'JSON':
      return value !== null && value !== undefined
    default:
      return false
  }
}

/**
 * Get current usage for a feature
 * This is a simplified version - you'd implement actual usage tracking
 */
async function getFeatureUsage(
  organizationId: string,
  featureKey: string
): Promise<number> {
  try {
    // Get usage records for this organization and feature
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        organizationId,
        resourceType: featureKey,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Sum up the quantity
    return usageRecords.reduce((sum, record) => sum + record.quantity, 0)
  } catch (error) {
    console.error('Error getting feature usage:', error)
    return 0
  }
}

/**
 * Record usage for a feature
 */
export async function recordFeatureUsage(
  organizationId: string,
  featureKey: string,
  quantity: number = 1,
  metadata?: object
): Promise<void> {
  try {
    await prisma.usageRecord.create({
      data: {
        organizationId,
        resourceType: featureKey,
        quantity,
        metadata,
      }
    })
  } catch (error) {
    console.error('Error recording feature usage:', error)
  }
}

/**
 * Check multiple features at once
 */
export async function checkMultipleFeatures(
  organizationId: string,
  featureKeys: string[]
): Promise<Record<string, FeatureAccess>> {
  const results: Record<string, FeatureAccess> = {}

  await Promise.all(
    featureKeys.map(async (key) => {
      results[key] = await checkFeatureAccess(organizationId, key)
    })
  )

  return results
}

/**
 * Get all features for an organization with their access status
 */
export async function getOrganizationFeatures(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      plan: {
        include: {
          planFeatures: {
            include: {
              feature: true
            }
          }
        }
      },
      entitlements: {
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        include: {
          feature: true
        }
      }
    }
  })

  if (!org || !org.plan) {
    return []
  }

  // Combine plan features with entitlement overrides
  const features = org.plan.planFeatures.map(pf => {
    const entitlement = org.entitlements.find(e => e.feature.key === pf.feature.key)

    return {
      key: pf.feature.key,
      name: pf.feature.name,
      category: pf.feature.category,
      valueType: pf.feature.valueType,
      value: entitlement?.value ?? pf.value,
      limit: entitlement?.limit ?? pf.limit,
      hasOverride: !!entitlement,
      expiresAt: entitlement?.expiresAt,
    }
  })

  // Add entitlements that don't have plan features
  for (const entitlement of org.entitlements) {
    if (!features.find(f => f.key === entitlement.feature.key)) {
      features.push({
        key: entitlement.feature.key,
        name: entitlement.feature.name,
        category: entitlement.feature.category,
        valueType: entitlement.feature.valueType,
        value: entitlement.value,
        limit: entitlement.limit,
        hasOverride: true,
        expiresAt: entitlement.expiresAt,
      })
    }
  }

  return features
}
