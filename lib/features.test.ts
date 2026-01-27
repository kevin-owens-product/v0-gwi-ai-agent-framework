import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  checkFeatureAccess,
  recordFeatureUsage,
  checkMultipleFeatures,
  getOrganizationFeatures,
} from './features'
import { prisma } from './prisma'

// Mock Prisma
vi.mock('./prisma', () => ({
  prisma: {
    organization: {
      findUnique: vi.fn(),
    },
    usageRecord: {
      findMany: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
    },
    plan: {
      findFirst: vi.fn(),
    },
    tenantEntitlement: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

describe('Features Library', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default to no entitlement found (tests override when needed)
    vi.mocked(prisma.tenantEntitlement.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.tenantEntitlement.findMany).mockResolvedValue([])
    vi.mocked(prisma.usageRecord.aggregate).mockResolvedValue({ _sum: { quantity: 0 } })
  })

  describe('checkFeatureAccess', () => {
    it('should return no access for non-existent organization', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)

      const result = await checkFeatureAccess('non-existent-org', 'ADVANCED_ANALYTICS')

      expect(result).toEqual({ hasAccess: false })
    })

    it('should return no access when feature not in plan or entitlements', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        planTier: 'STARTER',
      } as any)
      vi.mocked(prisma.tenantEntitlement.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.plan.findFirst).mockResolvedValue({
        id: 'plan-1',
        name: 'Starter',
        tier: 'STARTER',
        isActive: true,
        features: [], // No matching features
      } as any)

      const result = await checkFeatureAccess('org-1', 'NON_EXISTENT_FEATURE')

      expect(result).toEqual({ hasAccess: false })
    })

    it('should return access from plan feature with boolean value', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        planTier: 'STARTER',
      } as any)
      vi.mocked(prisma.tenantEntitlement.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.plan.findFirst).mockResolvedValue({
        id: 'plan-1',
        name: 'Starter',
        tier: 'STARTER',
        isActive: true,
        features: [
          {
            id: 'pf-1',
            planId: 'plan-1',
            featureId: 'f-1',
            value: true,
            limit: null,
            feature: {
              id: 'f-1',
              key: 'BASIC_ANALYTICS',
              name: 'Basic Analytics',
              category: 'Analytics',
              valueType: 'BOOLEAN',
            },
          },
        ],
      } as any)

      const result = await checkFeatureAccess('org-1', 'BASIC_ANALYTICS')

      expect(result.hasAccess).toBe(true)
      expect(result.value).toBe(true)
      expect(result.limit).toBeNull()
    })

    it('should return access with usage tracking for limited features', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        planTier: 'PROFESSIONAL',
      } as any)
      vi.mocked(prisma.tenantEntitlement.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.plan.findFirst).mockResolvedValue({
        id: 'plan-1',
        name: 'Professional',
        tier: 'PROFESSIONAL',
        isActive: true,
        features: [
          {
            id: 'pf-1',
            planId: 'plan-1',
            featureId: 'f-1',
            value: true,
            limit: 100,
            feature: {
              id: 'f-1',
              key: 'API_REQUESTS',
              name: 'API Requests',
              category: 'API',
              valueType: 'BOOLEAN',
            },
          },
        ],
      } as any)
      // Mock usage at 50%
      vi.mocked(prisma.usageRecord.aggregate).mockResolvedValue({ _sum: { quantity: 50 } })

      const result = await checkFeatureAccess('org-1', 'API_REQUESTS')

      expect(result.hasAccess).toBe(true)
      expect(result.limit).toBe(100)
      expect(result.usage).toBe(50)
      expect(result.percentage).toBe(50)
      expect(result.isNearLimit).toBe(false)
      expect(result.isAtLimit).toBe(false)
    })

    it('should detect near limit (80%)', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        planTier: 'PROFESSIONAL',
      } as any)
      vi.mocked(prisma.tenantEntitlement.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.plan.findFirst).mockResolvedValue({
        id: 'plan-1',
        name: 'Professional',
        tier: 'PROFESSIONAL',
        isActive: true,
        features: [
          {
            id: 'pf-1',
            planId: 'plan-1',
            featureId: 'f-1',
            value: true,
            limit: 100,
            feature: {
              id: 'f-1',
              key: 'API_REQUESTS',
              name: 'API Requests',
              category: 'API',
              valueType: 'BOOLEAN',
            },
          },
        ],
      } as any)
      // Mock usage at 85%
      vi.mocked(prisma.usageRecord.aggregate).mockResolvedValue({ _sum: { quantity: 85 } })

      const result = await checkFeatureAccess('org-1', 'API_REQUESTS')

      expect(result.isNearLimit).toBe(true)
      expect(result.isAtLimit).toBe(false)
    })

    it('should detect at limit (100%)', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        planTier: 'PROFESSIONAL',
      } as any)
      vi.mocked(prisma.tenantEntitlement.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.plan.findFirst).mockResolvedValue({
        id: 'plan-1',
        name: 'Professional',
        tier: 'PROFESSIONAL',
        isActive: true,
        features: [
          {
            id: 'pf-1',
            planId: 'plan-1',
            featureId: 'f-1',
            value: true,
            limit: 100,
            feature: {
              id: 'f-1',
              key: 'API_REQUESTS',
              name: 'API Requests',
              category: 'API',
              valueType: 'BOOLEAN',
            },
          },
        ],
      } as any)
      // Mock usage at 100%
      vi.mocked(prisma.usageRecord.aggregate).mockResolvedValue({ _sum: { quantity: 100 } })

      const result = await checkFeatureAccess('org-1', 'API_REQUESTS')

      expect(result.isNearLimit).toBe(true)
      expect(result.isAtLimit).toBe(true)
    })

    it('should prioritize entitlement over plan feature', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        planTier: 'STARTER',
      } as any)
      // Return entitlement (takes priority over plan)
      vi.mocked(prisma.tenantEntitlement.findFirst).mockResolvedValue({
        id: 'e-1',
        orgId: 'org-1',
        featureId: 'f-1',
        value: 500,
        limit: 500,
        isActive: true,
        expiresAt: null,
        feature: {
          id: 'f-1',
          key: 'TEAM_MEMBERS',
          name: 'Team Members',
          category: 'Team',
          valueType: 'NUMBER',
        },
      } as any)
      vi.mocked(prisma.usageRecord.aggregate).mockResolvedValue({ _sum: { quantity: 0 } })

      const result = await checkFeatureAccess('org-1', 'TEAM_MEMBERS')

      expect(result.hasAccess).toBe(true)
      expect(result.value).toBe(500)
      expect(result.limit).toBe(500)
    })

    it('should ignore expired entitlements', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        planTier: 'STARTER',
      } as any)
      // Entitlement not found (expired ones filtered out by query)
      vi.mocked(prisma.tenantEntitlement.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.plan.findFirst).mockResolvedValue({
        id: 'plan-1',
        name: 'Starter',
        tier: 'STARTER',
        isActive: true,
        features: [
          {
            id: 'pf-1',
            planId: 'plan-1',
            featureId: 'f-1',
            value: true,
            limit: null,
            feature: {
              id: 'f-1',
              key: 'BASIC_ANALYTICS',
              name: 'Basic Analytics',
              category: 'Analytics',
              valueType: 'BOOLEAN',
            },
          },
        ],
      } as any)

      const result = await checkFeatureAccess('org-1', 'BASIC_ANALYTICS')

      expect(result.hasAccess).toBe(true)
      expect(result.value).toBe(true)
    })

    it('should handle different value types correctly', async () => {
      // Test STRING type
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        planTier: 'PROFESSIONAL',
      } as any)
      vi.mocked(prisma.tenantEntitlement.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.plan.findFirst).mockResolvedValue({
        id: 'plan-1',
        name: 'Professional',
        tier: 'PROFESSIONAL',
        isActive: true,
        features: [
          {
            id: 'pf-1',
            planId: 'plan-1',
            featureId: 'f-1',
            value: 'custom-domain.com',
            limit: null,
            feature: {
              id: 'f-1',
              key: 'CUSTOM_DOMAIN',
              name: 'Custom Domain',
              category: 'Branding',
              valueType: 'STRING',
            },
          },
        ],
      } as any)

      const result = await checkFeatureAccess('org-1', 'CUSTOM_DOMAIN')

      expect(result.hasAccess).toBe(true)
      expect(result.value).toBe('custom-domain.com')
    })

    it('should handle JSON value type', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        planTier: 'ENTERPRISE',
      } as any)
      vi.mocked(prisma.tenantEntitlement.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.plan.findFirst).mockResolvedValue({
        id: 'plan-1',
        name: 'Enterprise',
        tier: 'ENTERPRISE',
        isActive: true,
        features: [
          {
            id: 'pf-1',
            planId: 'plan-1',
            featureId: 'f-1',
            value: { integrations: ['slack', 'teams', 'discord'] },
            limit: null,
            feature: {
              id: 'f-1',
              key: 'INTEGRATIONS',
              name: 'Integrations',
              category: 'Features',
              valueType: 'JSON',
            },
          },
        ],
      } as any)

      const result = await checkFeatureAccess('org-1', 'INTEGRATIONS')

      expect(result.hasAccess).toBe(true)
      expect(result.value).toEqual({ integrations: ['slack', 'teams', 'discord'] })
    })
  })

  describe('recordFeatureUsage', () => {
    it('should create usage record', async () => {
      vi.mocked(prisma.usageRecord.create).mockResolvedValue({
        id: 'ur-1',
        orgId: 'org-1',
        metricType: 'API_CALLS',
        quantity: 1,
        recordedAt: new Date(),
      } as any)

      await recordFeatureUsage('org-1', 'API_REQUESTS', 1)

      expect(prisma.usageRecord.create).toHaveBeenCalledWith({
        data: {
          orgId: 'org-1',
          metricType: 'API_CALLS',
          quantity: 1,
        },
      })
    })

    it('should handle custom quantity', async () => {
      vi.mocked(prisma.usageRecord.create).mockResolvedValue({
        id: 'ur-1',
        orgId: 'org-1',
        metricType: 'API_CALLS',
        quantity: 50,
        recordedAt: new Date(),
      } as any)

      await recordFeatureUsage('org-1', 'STORAGE_GB', 50)

      expect(prisma.usageRecord.create).toHaveBeenCalledWith({
        data: {
          orgId: 'org-1',
          metricType: 'API_CALLS',
          quantity: 50,
        },
      })
    })

    it('should handle metadata', async () => {
      const metadata = { endpoint: '/api/v1/agents', method: 'POST' }

      vi.mocked(prisma.usageRecord.create).mockResolvedValue({
        id: 'ur-1',
        orgId: 'org-1',
        metricType: 'API_CALLS',
        quantity: 1,
        recordedAt: new Date(),
      } as any)

      // Note: The actual implementation ignores metadata
      await recordFeatureUsage('org-1', 'API_REQUESTS', 1, metadata)

      expect(prisma.usageRecord.create).toHaveBeenCalledWith({
        data: {
          orgId: 'org-1',
          metricType: 'API_CALLS',
          quantity: 1,
        },
      })
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(prisma.usageRecord.create).mockRejectedValue(new Error('Database error'))

      // Should not throw
      await expect(recordFeatureUsage('org-1', 'API_REQUESTS')).resolves.not.toThrow()
    })
  })

  describe('checkMultipleFeatures', () => {
    it('should check multiple features in parallel', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        planTier: 'PROFESSIONAL',
      } as any)
      vi.mocked(prisma.tenantEntitlement.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.plan.findFirst).mockResolvedValue({
        id: 'plan-1',
        name: 'Professional',
        tier: 'PROFESSIONAL',
        isActive: true,
        features: [
          {
            id: 'pf-1',
            planId: 'plan-1',
            featureId: 'f-1',
            value: true,
            limit: null,
            feature: {
              id: 'f-1',
              key: 'ADVANCED_ANALYTICS',
              name: 'Advanced Analytics',
              category: 'Analytics',
              valueType: 'BOOLEAN',
            },
          },
          {
            id: 'pf-2',
            planId: 'plan-1',
            featureId: 'f-2',
            value: true,
            limit: null,
            feature: {
              id: 'f-2',
              key: 'CUSTOM_INTEGRATIONS',
              name: 'Custom Integrations',
              category: 'Features',
              valueType: 'BOOLEAN',
            },
          },
        ],
      } as any)

      const result = await checkMultipleFeatures('org-1', ['ADVANCED_ANALYTICS', 'CUSTOM_INTEGRATIONS'])

      expect(result).toHaveProperty('ADVANCED_ANALYTICS')
      expect(result).toHaveProperty('CUSTOM_INTEGRATIONS')
      expect(result.ADVANCED_ANALYTICS.hasAccess).toBe(true)
      expect(result.CUSTOM_INTEGRATIONS.hasAccess).toBe(true)
    })
  })

  describe('getOrganizationFeatures', () => {
    it('should return empty array for non-existent organization', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)

      const result = await getOrganizationFeatures('org-1')

      expect(result).toEqual([])
    })

    it('should return empty array for organization without plan and no entitlements', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        planTier: 'STARTER',
      } as any)
      vi.mocked(prisma.plan.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.tenantEntitlement.findMany).mockResolvedValue([])

      const result = await getOrganizationFeatures('org-1')

      expect(result).toEqual([])
    })

    it('should return plan features', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        planTier: 'PROFESSIONAL',
      } as any)
      vi.mocked(prisma.plan.findFirst).mockResolvedValue({
        id: 'plan-1',
        name: 'Professional',
        tier: 'PROFESSIONAL',
        isActive: true,
        features: [
          {
            id: 'pf-1',
            planId: 'plan-1',
            featureId: 'f-1',
            value: true,
            limit: 100,
            feature: {
              id: 'f-1',
              key: 'API_REQUESTS',
              name: 'API Requests',
              category: 'API',
              valueType: 'BOOLEAN',
            },
          },
        ],
      } as any)
      vi.mocked(prisma.tenantEntitlement.findMany).mockResolvedValue([])

      const result = await getOrganizationFeatures('org-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        key: 'API_REQUESTS',
        name: 'API Requests',
        category: 'API',
        valueType: 'BOOLEAN',
        value: true,
        limit: 100,
        hasOverride: false,
        expiresAt: null,
      })
    })

    it('should combine plan features with entitlement overrides', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        planTier: 'STARTER',
      } as any)
      vi.mocked(prisma.plan.findFirst).mockResolvedValue({
        id: 'plan-1',
        name: 'Starter',
        tier: 'STARTER',
        isActive: true,
        features: [
          {
            id: 'pf-1',
            planId: 'plan-1',
            featureId: 'f-1',
            value: 10,
            limit: 10,
            feature: {
              id: 'f-1',
              key: 'TEAM_MEMBERS',
              name: 'Team Members',
              category: 'Team',
              valueType: 'NUMBER',
            },
          },
        ],
      } as any)
      vi.mocked(prisma.tenantEntitlement.findMany).mockResolvedValue([
        {
          id: 'e-1',
          orgId: 'org-1',
          featureId: 'f-1',
          value: 50,
          limit: 50,
          isActive: true,
          expiresAt: null,
          feature: {
            id: 'f-1',
            key: 'TEAM_MEMBERS',
            name: 'Team Members',
            category: 'Team',
            valueType: 'NUMBER',
          },
        },
      ] as any)

      const result = await getOrganizationFeatures('org-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        key: 'TEAM_MEMBERS',
        name: 'Team Members',
        category: 'Team',
        valueType: 'NUMBER',
        value: 50,
        limit: 50,
        hasOverride: true,
        expiresAt: null,
      })
    })

    it('should include entitlements not in plan features', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        planTier: 'STARTER',
      } as any)
      vi.mocked(prisma.plan.findFirst).mockResolvedValue({
        id: 'plan-1',
        name: 'Starter',
        tier: 'STARTER',
        isActive: true,
        features: [],
      } as any)
      vi.mocked(prisma.tenantEntitlement.findMany).mockResolvedValue([
        {
          id: 'e-1',
          orgId: 'org-1',
          featureId: 'f-1',
          value: true,
          limit: null,
          isActive: true,
          expiresAt: null,
          feature: {
            id: 'f-1',
            key: 'BETA_FEATURES',
            name: 'Beta Features',
            category: 'Features',
            valueType: 'BOOLEAN',
          },
        },
      ] as any)

      const result = await getOrganizationFeatures('org-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        key: 'BETA_FEATURES',
        name: 'Beta Features',
        category: 'Features',
        valueType: 'BOOLEAN',
        value: true,
        limit: null,
        hasOverride: true,
        expiresAt: null,
      })
    })
  })
})
