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
 * Checks entitlement overrides first, then plan features based on planTier
 */
export async function checkFeatureAccess(
  organizationId: string,
  featureKey: string
): Promise<FeatureAccess> {
  try {
    // Get organization with planTier
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { planTier: true }
    })

    if (!org) {
      return { hasAccess: false }
    }

    // Check for direct tenant entitlement override first (highest priority)
    const entitlement = await prisma.tenantEntitlement.findFirst({
      where: {
        orgId: organizationId,
        isActive: true,
        feature: { key: featureKey },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        feature: true
      }
    })

    if (entitlement && entitlement.feature) {
      const hasAccess = isFeatureEnabled(
        entitlement.value,
        entitlement.feature.valueType
      )

      let usage: number | undefined
      const limit = entitlement.limit

      // Get usage if feature has limits
      if (limit !== null && limit !== undefined) {
        usage = await getFeatureUsage(organizationId, featureKey)
      }

      return {
        hasAccess,
        value: entitlement.value as string | number | boolean | object | null,
        limit,
        usage,
        percentage: limit && usage !== undefined ? (usage / limit) * 100 : undefined,
        isNearLimit: limit && usage !== undefined ? usage >= limit * 0.8 : false,
        isAtLimit: limit && usage !== undefined ? usage >= limit : false,
      }
    }

    // Check plan feature based on organization's planTier
    const plan = await prisma.plan.findFirst({
      where: { tier: org.planTier, isActive: true },
      include: {
        features: {
          where: {
            feature: { key: featureKey }
          },
          include: {
            feature: true
          }
        }
      }
    })

    const planFeature = plan?.features[0]
    if (planFeature) {
      const hasAccess = isFeatureEnabled(
        planFeature.value,
        planFeature.feature.valueType
      )

      let usage: number | undefined
      const limit = planFeature.limit

      // Get usage if feature has limits
      if (limit !== null && limit !== undefined) {
        usage = await getFeatureUsage(organizationId, featureKey)
      }

      return {
        hasAccess,
        value: planFeature.value as string | number | boolean | object | null,
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
function isFeatureEnabled(value: unknown, valueType: FeatureValueType): boolean {
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
 * Uses UsageRecord model with metricType field
 */
async function getFeatureUsage(
  organizationId: string,
  _featureKey: string
): Promise<number> {
  try {
    // Get usage records for this organization
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Note: UsageRecord uses metricType (UsageMetric enum) not resourceType
    // For feature-based usage, we aggregate based on relevant metrics
    const result = await prisma.usageRecord.aggregate({
      where: {
        orgId: organizationId,
        recordedAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        quantity: true
      }
    })

    return result._sum.quantity || 0
  } catch (error) {
    console.error('Error getting feature usage:', error)
    return 0
  }
}

/**
 * Record usage for a feature
 * Note: UsageRecord uses metricType enum, not arbitrary resource types
 */
export async function recordFeatureUsage(
  organizationId: string,
  _featureKey: string,
  quantity: number = 1,
  _metadata?: object
): Promise<void> {
  try {
    // Map feature key to a metric type - using API_CALLS as default
    await prisma.usageRecord.create({
      data: {
        orgId: organizationId,
        metricType: 'API_CALLS',
        quantity,
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

interface OrgFeature {
  key: string
  name: string
  category: string | null
  valueType: FeatureValueType
  value: unknown
  limit: number | null
  hasOverride: boolean
  expiresAt: Date | null
}

/**
 * Get all features for an organization with their access status
 */
export async function getOrganizationFeatures(organizationId: string): Promise<OrgFeature[]> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { planTier: true }
  })

  if (!org) {
    return []
  }

  // Get plan based on org's planTier
  const plan = await prisma.plan.findFirst({
    where: { tier: org.planTier, isActive: true },
    include: {
      features: {
        include: {
          feature: true
        }
      }
    }
  })

  // Get tenant entitlements
  const entitlements = await prisma.tenantEntitlement.findMany({
    where: {
      orgId: organizationId,
      isActive: true,
      featureId: { not: null },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
    include: {
      feature: true
    }
  })

  if (!plan) {
    // Return only entitlements if no plan
    return entitlements
      .filter((e): e is typeof e & { feature: NonNullable<typeof e.feature> } => e.feature !== null)
      .map(e => ({
        key: e.feature.key,
        name: e.feature.name,
        category: e.feature.category,
        valueType: e.feature.valueType,
        value: e.value,
        limit: e.limit,
        hasOverride: true,
        expiresAt: e.expiresAt,
      }))
  }

  // Combine plan features with entitlement overrides
  const features: OrgFeature[] = plan.features.map((pf: { feature: { key: string; name: string; category: string | null; valueType: FeatureValueType }; value: unknown; limit: number | null }) => {
    const entitlement = entitlements.find(e => e.feature?.key === pf.feature.key)

    return {
      key: pf.feature.key,
      name: pf.feature.name,
      category: pf.feature.category,
      valueType: pf.feature.valueType,
      value: entitlement?.value ?? pf.value,
      limit: entitlement?.limit ?? pf.limit,
      hasOverride: !!entitlement,
      expiresAt: entitlement?.expiresAt ?? null,
    }
  })

  // Add entitlements that don't have plan features
  for (const entitlement of entitlements) {
    if (entitlement.feature && !features.find(f => f.key === entitlement.feature!.key)) {
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
