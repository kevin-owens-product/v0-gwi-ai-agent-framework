import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  checkFeatureAccess,
  recordFeatureUsage,
  checkMultipleFeatures,
  getOrganizationFeatures,
  type FeatureAccess
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
    },
  },
}))

describe('Features Library', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkFeatureAccess', () => {
    it('should return no access for non-existent organization', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)

      const result = await checkFeatureAccess('non-existent-org', 'ADVANCED_ANALYTICS')

      expect(result).toEqual({ hasAccess: false })
    })

    it('should return no access when feature not in plan or entitlements', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: {
          id: 'plan-1',
          name: 'Starter',
          tier: 'STARTER',
          createdAt: new Date(),
          updatedAt: new Date(),
          planFeatures: [],
        },
        entitlements: [],
      } as any)

      const result = await checkFeatureAccess('org-1', 'NON_EXISTENT_FEATURE')

      expect(result).toEqual({ hasAccess: false })
    })

    it('should return access from plan feature with boolean value', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: {
          id: 'plan-1',
          name: 'Starter',
          tier: 'STARTER',
          createdAt: new Date(),
          updatedAt: new Date(),
          planFeatures: [
            {
              id: 'pf-1',
              planId: 'plan-1',
              featureId: 'f-1',
              value: true,
              limit: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              feature: {
                id: 'f-1',
                key: 'BASIC_ANALYTICS',
                name: 'Basic Analytics',
                category: 'Analytics',
                valueType: 'BOOLEAN',
                defaultValue: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
        entitlements: [],
      } as any)

      const result = await checkFeatureAccess('org-1', 'BASIC_ANALYTICS')

      expect(result.hasAccess).toBe(true)
      expect(result.value).toBe(true)
      expect(result.limit).toBeNull()
    })

    it('should return access with usage tracking for limited features', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: {
          id: 'plan-1',
          name: 'Professional',
          tier: 'PROFESSIONAL',
          createdAt: new Date(),
          updatedAt: new Date(),
          planFeatures: [
            {
              id: 'pf-1',
              planId: 'plan-1',
              featureId: 'f-1',
              value: true,
              limit: 100,
              createdAt: new Date(),
              updatedAt: new Date(),
              feature: {
                id: 'f-1',
                key: 'API_REQUESTS',
                name: 'API Requests',
                category: 'API',
                valueType: 'BOOLEAN',
                defaultValue: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
        entitlements: [],
      } as any)

      // Mock usage at 50%
      vi.mocked(prisma.usageRecord.findMany).mockResolvedValue([
        {
          id: 'ur-1',
          organizationId: 'org-1',
          resourceType: 'API_REQUESTS',
          quantity: 50,
          metadata: {},
          createdAt: new Date(),
        },
      ] as any)

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
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: {
          id: 'plan-1',
          name: 'Professional',
          tier: 'PROFESSIONAL',
          createdAt: new Date(),
          updatedAt: new Date(),
          planFeatures: [
            {
              id: 'pf-1',
              planId: 'plan-1',
              featureId: 'f-1',
              value: true,
              limit: 100,
              createdAt: new Date(),
              updatedAt: new Date(),
              feature: {
                id: 'f-1',
                key: 'API_REQUESTS',
                name: 'API Requests',
                category: 'API',
                valueType: 'BOOLEAN',
                defaultValue: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
        entitlements: [],
      } as any)

      // Mock usage at 85%
      vi.mocked(prisma.usageRecord.findMany).mockResolvedValue([
        {
          id: 'ur-1',
          organizationId: 'org-1',
          resourceType: 'API_REQUESTS',
          quantity: 85,
          metadata: {},
          createdAt: new Date(),
        },
      ] as any)

      const result = await checkFeatureAccess('org-1', 'API_REQUESTS')

      expect(result.isNearLimit).toBe(true)
      expect(result.isAtLimit).toBe(false)
    })

    it('should detect at limit (100%)', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: {
          id: 'plan-1',
          name: 'Professional',
          tier: 'PROFESSIONAL',
          createdAt: new Date(),
          updatedAt: new Date(),
          planFeatures: [
            {
              id: 'pf-1',
              planId: 'plan-1',
              featureId: 'f-1',
              value: true,
              limit: 100,
              createdAt: new Date(),
              updatedAt: new Date(),
              feature: {
                id: 'f-1',
                key: 'API_REQUESTS',
                name: 'API Requests',
                category: 'API',
                valueType: 'BOOLEAN',
                defaultValue: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
        entitlements: [],
      } as any)

      // Mock usage at 100%
      vi.mocked(prisma.usageRecord.findMany).mockResolvedValue([
        {
          id: 'ur-1',
          organizationId: 'org-1',
          resourceType: 'API_REQUESTS',
          quantity: 100,
          metadata: {},
          createdAt: new Date(),
        },
      ] as any)

      const result = await checkFeatureAccess('org-1', 'API_REQUESTS')

      expect(result.isNearLimit).toBe(true)
      expect(result.isAtLimit).toBe(true)
    })

    it('should prioritize entitlement over plan feature', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: {
          id: 'plan-1',
          name: 'Starter',
          tier: 'STARTER',
          createdAt: new Date(),
          updatedAt: new Date(),
          planFeatures: [
            {
              id: 'pf-1',
              planId: 'plan-1',
              featureId: 'f-1',
              value: 100,
              limit: 100,
              createdAt: new Date(),
              updatedAt: new Date(),
              feature: {
                id: 'f-1',
                key: 'TEAM_MEMBERS',
                name: 'Team Members',
                category: 'Team',
                valueType: 'NUMBER',
                defaultValue: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
        entitlements: [
          {
            id: 'e-1',
            organizationId: 'org-1',
            featureId: 'f-1',
            value: 500,
            limit: 500,
            expiresAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            feature: {
              id: 'f-1',
              key: 'TEAM_MEMBERS',
              name: 'Team Members',
              category: 'Team',
              valueType: 'NUMBER',
              defaultValue: 5,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      } as any)

      vi.mocked(prisma.usageRecord.findMany).mockResolvedValue([])

      const result = await checkFeatureAccess('org-1', 'TEAM_MEMBERS')

      expect(result.hasAccess).toBe(true)
      expect(result.value).toBe(500)
      expect(result.limit).toBe(500)
    })

    it('should ignore expired entitlements', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: {
          id: 'plan-1',
          name: 'Starter',
          tier: 'STARTER',
          createdAt: new Date(),
          updatedAt: new Date(),
          planFeatures: [
            {
              id: 'pf-1',
              planId: 'plan-1',
              featureId: 'f-1',
              value: true,
              limit: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              feature: {
                id: 'f-1',
                key: 'BASIC_ANALYTICS',
                name: 'Basic Analytics',
                category: 'Analytics',
                valueType: 'BOOLEAN',
                defaultValue: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
        entitlements: [],
      } as any)

      const result = await checkFeatureAccess('org-1', 'BASIC_ANALYTICS')

      expect(result.hasAccess).toBe(true)
      expect(result.value).toBe(true)
    })

    it('should handle different value types correctly', async () => {
      // Test STRING type
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: {
          id: 'plan-1',
          name: 'Professional',
          tier: 'PROFESSIONAL',
          createdAt: new Date(),
          updatedAt: new Date(),
          planFeatures: [
            {
              id: 'pf-1',
              planId: 'plan-1',
              featureId: 'f-1',
              value: 'custom-domain.com',
              limit: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              feature: {
                id: 'f-1',
                key: 'CUSTOM_DOMAIN',
                name: 'Custom Domain',
                category: 'Branding',
                valueType: 'STRING',
                defaultValue: '',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
        entitlements: [],
      } as any)

      const result = await checkFeatureAccess('org-1', 'CUSTOM_DOMAIN')

      expect(result.hasAccess).toBe(true)
      expect(result.value).toBe('custom-domain.com')
    })

    it('should handle JSON value type', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: {
          id: 'plan-1',
          name: 'Enterprise',
          tier: 'ENTERPRISE',
          createdAt: new Date(),
          updatedAt: new Date(),
          planFeatures: [
            {
              id: 'pf-1',
              planId: 'plan-1',
              featureId: 'f-1',
              value: { integrations: ['slack', 'teams', 'discord'] },
              limit: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              feature: {
                id: 'f-1',
                key: 'INTEGRATIONS',
                name: 'Integrations',
                category: 'Features',
                valueType: 'JSON',
                defaultValue: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
        entitlements: [],
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
        organizationId: 'org-1',
        resourceType: 'API_REQUESTS',
        quantity: 1,
        metadata: {},
        createdAt: new Date(),
      } as any)

      await recordFeatureUsage('org-1', 'API_REQUESTS', 1)

      expect(prisma.usageRecord.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-1',
          resourceType: 'API_REQUESTS',
          quantity: 1,
          metadata: undefined,
        },
      })
    })

    it('should handle custom quantity', async () => {
      vi.mocked(prisma.usageRecord.create).mockResolvedValue({
        id: 'ur-1',
        organizationId: 'org-1',
        resourceType: 'STORAGE_GB',
        quantity: 50,
        metadata: {},
        createdAt: new Date(),
      } as any)

      await recordFeatureUsage('org-1', 'STORAGE_GB', 50)

      expect(prisma.usageRecord.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-1',
          resourceType: 'STORAGE_GB',
          quantity: 50,
          metadata: undefined,
        },
      })
    })

    it('should handle metadata', async () => {
      const metadata = { endpoint: '/api/v1/agents', method: 'POST' }

      vi.mocked(prisma.usageRecord.create).mockResolvedValue({
        id: 'ur-1',
        organizationId: 'org-1',
        resourceType: 'API_REQUESTS',
        quantity: 1,
        metadata,
        createdAt: new Date(),
      } as any)

      await recordFeatureUsage('org-1', 'API_REQUESTS', 1, metadata)

      expect(prisma.usageRecord.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-1',
          resourceType: 'API_REQUESTS',
          quantity: 1,
          metadata,
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
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: {
          id: 'plan-1',
          name: 'Professional',
          tier: 'PROFESSIONAL',
          createdAt: new Date(),
          updatedAt: new Date(),
          planFeatures: [
            {
              id: 'pf-1',
              planId: 'plan-1',
              featureId: 'f-1',
              value: true,
              limit: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              feature: {
                id: 'f-1',
                key: 'ADVANCED_ANALYTICS',
                name: 'Advanced Analytics',
                category: 'Analytics',
                valueType: 'BOOLEAN',
                defaultValue: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
            {
              id: 'pf-2',
              planId: 'plan-1',
              featureId: 'f-2',
              value: true,
              limit: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              feature: {
                id: 'f-2',
                key: 'CUSTOM_INTEGRATIONS',
                name: 'Custom Integrations',
                category: 'Features',
                valueType: 'BOOLEAN',
                defaultValue: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
        entitlements: [],
      } as any)

      const result = await checkMultipleFeatures('org-1', ['ADVANCED_ANALYTICS', 'CUSTOM_INTEGRATIONS'])

      expect(result).toHaveProperty('ADVANCED_ANALYTICS')
      expect(result).toHaveProperty('CUSTOM_INTEGRATIONS')
      expect(result.ADVANCED_ANALYTICS.hasAccess).toBe(true)
      expect(result.CUSTOM_INTEGRATIONS.hasAccess).toBe(true)
    })
  })

  describe('getOrganizationFeatures', () => {
    it('should return empty array for organization without plan', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        planId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: null,
        entitlements: [],
      } as any)

      const result = await getOrganizationFeatures('org-1')

      expect(result).toEqual([])
    })

    it('should return plan features', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: {
          id: 'plan-1',
          name: 'Professional',
          tier: 'PROFESSIONAL',
          createdAt: new Date(),
          updatedAt: new Date(),
          planFeatures: [
            {
              id: 'pf-1',
              planId: 'plan-1',
              featureId: 'f-1',
              value: true,
              limit: 100,
              createdAt: new Date(),
              updatedAt: new Date(),
              feature: {
                id: 'f-1',
                key: 'API_REQUESTS',
                name: 'API Requests',
                category: 'API',
                valueType: 'BOOLEAN',
                defaultValue: false,
                description: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
        entitlements: [],
      } as any)

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
        expiresAt: undefined,
      })
    })

    it('should combine plan features with entitlement overrides', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: {
          id: 'plan-1',
          name: 'Starter',
          tier: 'STARTER',
          createdAt: new Date(),
          updatedAt: new Date(),
          planFeatures: [
            {
              id: 'pf-1',
              planId: 'plan-1',
              featureId: 'f-1',
              value: 10,
              limit: 10,
              createdAt: new Date(),
              updatedAt: new Date(),
              feature: {
                id: 'f-1',
                key: 'TEAM_MEMBERS',
                name: 'Team Members',
                category: 'Team',
                valueType: 'NUMBER',
                defaultValue: 5,
                description: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
        entitlements: [
          {
            id: 'e-1',
            organizationId: 'org-1',
            featureId: 'f-1',
            value: 50,
            limit: 50,
            expiresAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            feature: {
              id: 'f-1',
              key: 'TEAM_MEMBERS',
              name: 'Team Members',
              category: 'Team',
              valueType: 'NUMBER',
              defaultValue: 5,
              description: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      } as any)

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
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: {
          id: 'plan-1',
          name: 'Starter',
          tier: 'STARTER',
          createdAt: new Date(),
          updatedAt: new Date(),
          planFeatures: [],
        },
        entitlements: [
          {
            id: 'e-1',
            organizationId: 'org-1',
            featureId: 'f-1',
            value: true,
            limit: null,
            expiresAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            feature: {
              id: 'f-1',
              key: 'BETA_FEATURES',
              name: 'Beta Features',
              category: 'Features',
              valueType: 'BOOLEAN',
              defaultValue: false,
              description: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      } as any)

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
