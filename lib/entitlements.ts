import { prisma } from './db'
import type { PlanTier, FeatureCategory, FeatureValueType } from '@prisma/client'

// Types for entitlement system
export interface PlanLimits {
  agentRuns: number
  teamSeats: number
  dataSources: number
  apiCallsPerMin: number
  retentionDays: number
  tokensPerMonth: number
  dashboards: number
  reports: number
  workflows: number
  brandTrackings: number
}

export interface FeatureEntitlement {
  key: string
  name: string
  category: FeatureCategory
  valueType: FeatureValueType
  value: unknown
  limit?: number | null
  isOverride: boolean // Whether this is a tenant-specific override
}

export interface TenantEntitlements {
  planId: string | null
  planName: string | null
  planTier: PlanTier
  limits: Partial<PlanLimits>
  features: FeatureEntitlement[]
}

// Default limits for each plan tier (fallback)
export const DEFAULT_PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  STARTER: {
    agentRuns: 100,
    teamSeats: 3,
    dataSources: 5,
    apiCallsPerMin: 100,
    retentionDays: 30,
    tokensPerMonth: 100000,
    dashboards: 3,
    reports: 10,
    workflows: 2,
    brandTrackings: 1,
  },
  PROFESSIONAL: {
    agentRuns: 1000,
    teamSeats: 10,
    dataSources: 25,
    apiCallsPerMin: 500,
    retentionDays: 90,
    tokensPerMonth: 1000000,
    dashboards: 20,
    reports: 100,
    workflows: 10,
    brandTrackings: 5,
  },
  ENTERPRISE: {
    agentRuns: -1, // unlimited
    teamSeats: -1,
    dataSources: -1,
    apiCallsPerMin: 2000,
    retentionDays: 365,
    tokensPerMonth: -1,
    dashboards: -1,
    reports: -1,
    workflows: -1,
    brandTrackings: -1,
  },
}

/**
 * Get all entitlements for a tenant
 */
export async function getTenantEntitlements(orgId: string): Promise<TenantEntitlements> {
  // Get organization with its plan tier
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { planTier: true },
  })

  if (!org) {
    throw new Error(`Organization not found: ${orgId}`)
  }

  // Check if tenant has a custom plan assignment
  const planEntitlement = await prisma.tenantEntitlement.findFirst({
    where: {
      orgId,
      planId: { not: null },
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: {
      plan: {
        include: {
          features: {
            include: { feature: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get the plan and its features
  let plan = planEntitlement?.plan
  let planLimits: Partial<PlanLimits> = {}
  let planFeatures: Array<{ feature: { key: string; name: string; category: FeatureCategory; valueType: FeatureValueType }; value: unknown; limit: number | null }> = []

  if (plan) {
    planLimits = plan.limits as Partial<PlanLimits>
    planFeatures = plan.features.map((pf) => ({
      feature: pf.feature,
      value: pf.value,
      limit: pf.limit,
    }))
  } else {
    // Fall back to default plan based on org's planTier
    const defaultPlan = await prisma.plan.findFirst({
      where: {
        tier: org.planTier,
        isActive: true,
      },
      include: {
        features: {
          include: { feature: true },
        },
      },
    })

    if (defaultPlan) {
      plan = defaultPlan
      planLimits = defaultPlan.limits as Partial<PlanLimits>
      planFeatures = defaultPlan.features.map((pf) => ({
        feature: pf.feature,
        value: pf.value,
        limit: pf.limit,
      }))
    } else {
      // Use hardcoded defaults
      planLimits = DEFAULT_PLAN_LIMITS[org.planTier]
    }
  }

  // Get feature-specific overrides for this tenant
  const featureOverrides = await prisma.tenantEntitlement.findMany({
    where: {
      orgId,
      featureId: { not: null },
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: { feature: true },
  })

  // Build feature entitlements
  const featureMap = new Map<string, FeatureEntitlement>()

  // Add plan features
  for (const pf of planFeatures) {
    featureMap.set(pf.feature.key, {
      key: pf.feature.key,
      name: pf.feature.name,
      category: pf.feature.category,
      valueType: pf.feature.valueType,
      value: pf.value,
      limit: pf.limit,
      isOverride: false,
    })
  }

  // Apply tenant-specific overrides
  for (const override of featureOverrides) {
    if (override.feature) {
      featureMap.set(override.feature.key, {
        key: override.feature.key,
        name: override.feature.name,
        category: override.feature.category,
        valueType: override.feature.valueType,
        value: override.value ?? featureMap.get(override.feature.key)?.value ?? override.feature.defaultValue,
        limit: override.limit ?? featureMap.get(override.feature.key)?.limit,
        isOverride: true,
      })
    }
  }

  return {
    planId: plan?.id ?? null,
    planName: plan?.displayName ?? null,
    planTier: org.planTier,
    limits: planLimits,
    features: Array.from(featureMap.values()),
  }
}

/**
 * Check if a tenant has access to a specific feature
 */
export async function hasFeature(orgId: string, featureKey: string): Promise<boolean> {
  const entitlements = await getTenantEntitlements(orgId)
  const feature = entitlements.features.find((f) => f.key === featureKey)

  if (!feature) {
    // Check if this feature exists and has a default
    const featureDef = await prisma.feature.findUnique({
      where: { key: featureKey },
    })
    if (featureDef) {
      // Return default value
      return featureDef.defaultValue === true || featureDef.defaultValue === 'true'
    }
    return false
  }

  // For boolean features
  if (feature.valueType === 'BOOLEAN') {
    return feature.value === true || feature.value === 'true'
  }

  // For numeric features, check if value is > 0 or -1 (unlimited)
  if (feature.valueType === 'NUMBER') {
    const numValue = typeof feature.value === 'number' ? feature.value : parseInt(String(feature.value), 10)
    return numValue !== 0
  }

  // For other types, presence means enabled
  return feature.value !== null && feature.value !== undefined
}

/**
 * Get the value of a specific feature for a tenant
 */
export async function getFeatureValue<T = unknown>(orgId: string, featureKey: string): Promise<T | null> {
  const entitlements = await getTenantEntitlements(orgId)
  const feature = entitlements.features.find((f) => f.key === featureKey)

  if (feature) {
    return feature.value as T
  }

  // Check default
  const featureDef = await prisma.feature.findUnique({
    where: { key: featureKey },
  })

  return featureDef?.defaultValue as T ?? null
}

/**
 * Get a specific limit for a tenant
 */
export async function getLimit(orgId: string, limitKey: keyof PlanLimits): Promise<number> {
  const entitlements = await getTenantEntitlements(orgId)

  // Check if there's a specific limit in the plan
  const limit = entitlements.limits[limitKey]
  if (limit !== undefined) {
    return limit
  }

  // Fall back to defaults based on plan tier
  return DEFAULT_PLAN_LIMITS[entitlements.planTier][limitKey]
}

/**
 * Check if a tenant is within their limit for a resource
 */
export async function checkLimit(
  orgId: string,
  limitKey: keyof PlanLimits,
  currentCount: number
): Promise<{ allowed: boolean; limit: number; current: number; remaining: number }> {
  const limit = await getLimit(orgId, limitKey)

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, limit: -1, current: currentCount, remaining: -1 }
  }

  const remaining = limit - currentCount
  return {
    allowed: currentCount < limit,
    limit,
    current: currentCount,
    remaining: Math.max(0, remaining),
  }
}

/**
 * Grant a feature to a specific tenant (override)
 */
export async function grantFeature(
  orgId: string,
  featureKey: string,
  value: unknown,
  options?: {
    limit?: number
    expiresAt?: Date
    grantedBy?: string
    reason?: string
  }
): Promise<void> {
  const feature = await prisma.feature.findUnique({
    where: { key: featureKey },
  })

  if (!feature) {
    throw new Error(`Feature not found: ${featureKey}`)
  }

  await prisma.tenantEntitlement.upsert({
    where: {
      id: `${orgId}-${feature.id}`, // This will fail, but we need a unique identifier
    },
    create: {
      orgId,
      featureId: feature.id,
      value: value as object,
      limit: options?.limit,
      expiresAt: options?.expiresAt,
      grantedBy: options?.grantedBy,
      reason: options?.reason,
      isActive: true,
    },
    update: {
      value: value as object,
      limit: options?.limit,
      expiresAt: options?.expiresAt,
      grantedBy: options?.grantedBy,
      reason: options?.reason,
      isActive: true,
    },
  })
}

/**
 * Revoke a feature override from a tenant
 */
export async function revokeFeature(orgId: string, featureKey: string): Promise<void> {
  const feature = await prisma.feature.findUnique({
    where: { key: featureKey },
  })

  if (!feature) {
    throw new Error(`Feature not found: ${featureKey}`)
  }

  await prisma.tenantEntitlement.updateMany({
    where: {
      orgId,
      featureId: feature.id,
    },
    data: {
      isActive: false,
    },
  })
}

/**
 * Assign a plan to a tenant
 */
export async function assignPlan(
  orgId: string,
  planId: string,
  options?: {
    expiresAt?: Date
    grantedBy?: string
    reason?: string
  }
): Promise<void> {
  // Deactivate existing plan assignments
  await prisma.tenantEntitlement.updateMany({
    where: {
      orgId,
      planId: { not: null },
    },
    data: {
      isActive: false,
    },
  })

  // Get the plan to update org's planTier
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  })

  if (!plan) {
    throw new Error(`Plan not found: ${planId}`)
  }

  // Create new plan assignment
  await prisma.tenantEntitlement.create({
    data: {
      orgId,
      planId,
      expiresAt: options?.expiresAt,
      grantedBy: options?.grantedBy,
      reason: options?.reason,
      isActive: true,
    },
  })

  // Update org's planTier to match
  await prisma.organization.update({
    where: { id: orgId },
    data: { planTier: plan.tier },
  })
}

/**
 * Get all features grouped by category
 */
export async function getAllFeatures(): Promise<Record<FeatureCategory, Array<{ id: string; key: string; name: string; description: string | null; valueType: FeatureValueType; defaultValue: unknown }>>> {
  const features = await prisma.feature.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  })

  const grouped: Record<string, typeof features> = {}

  for (const feature of features) {
    if (!grouped[feature.category]) {
      grouped[feature.category] = []
    }
    grouped[feature.category].push(feature)
  }

  return grouped as Record<FeatureCategory, typeof features>
}

/**
 * Get all active plans
 */
export async function getAllPlans(): Promise<Array<{
  id: string
  name: string
  displayName: string
  description: string | null
  tier: PlanTier
  monthlyPrice: number
  yearlyPrice: number
  limits: Partial<PlanLimits>
  featureCount: number
}>> {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { features: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    displayName: plan.displayName,
    description: plan.description,
    tier: plan.tier,
    monthlyPrice: plan.monthlyPrice,
    yearlyPrice: plan.yearlyPrice,
    limits: plan.limits as Partial<PlanLimits>,
    featureCount: plan._count.features,
  }))
}
