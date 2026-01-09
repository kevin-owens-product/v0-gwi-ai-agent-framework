import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  PLAN_LIMITS,
  PLAN_PRICES,
  recordUsage,
  getUsageSummary,
  checkUsageLimit,
  getStripe,
} from './billing'

// Mock Prisma
vi.mock('./db', () => ({
  prisma: {
    usageRecord: {
      create: vi.fn(),
      groupBy: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    billingSubscription: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// Import mocked prisma
import { prisma } from './db'

describe('PLAN_LIMITS constant', () => {
  it('defines limits for all plan tiers', () => {
    expect(PLAN_LIMITS).toHaveProperty('STARTER')
    expect(PLAN_LIMITS).toHaveProperty('PROFESSIONAL')
    expect(PLAN_LIMITS).toHaveProperty('ENTERPRISE')
  })

  describe('STARTER plan', () => {
    it('has correct limits', () => {
      expect(PLAN_LIMITS.STARTER.agentRuns).toBe(100)
      expect(PLAN_LIMITS.STARTER.teamSeats).toBe(3)
      expect(PLAN_LIMITS.STARTER.dataSources).toBe(5)
      expect(PLAN_LIMITS.STARTER.apiCallsPerMin).toBe(100)
      expect(PLAN_LIMITS.STARTER.retentionDays).toBe(30)
      expect(PLAN_LIMITS.STARTER.tokensPerMonth).toBe(100000)
    })
  })

  describe('PROFESSIONAL plan', () => {
    it('has correct limits', () => {
      expect(PLAN_LIMITS.PROFESSIONAL.agentRuns).toBe(1000)
      expect(PLAN_LIMITS.PROFESSIONAL.teamSeats).toBe(10)
      expect(PLAN_LIMITS.PROFESSIONAL.dataSources).toBe(25)
      expect(PLAN_LIMITS.PROFESSIONAL.apiCallsPerMin).toBe(500)
      expect(PLAN_LIMITS.PROFESSIONAL.retentionDays).toBe(90)
      expect(PLAN_LIMITS.PROFESSIONAL.tokensPerMonth).toBe(1000000)
    })

    it('has higher limits than STARTER', () => {
      expect(PLAN_LIMITS.PROFESSIONAL.agentRuns).toBeGreaterThan(PLAN_LIMITS.STARTER.agentRuns)
      expect(PLAN_LIMITS.PROFESSIONAL.teamSeats).toBeGreaterThan(PLAN_LIMITS.STARTER.teamSeats)
      expect(PLAN_LIMITS.PROFESSIONAL.dataSources).toBeGreaterThan(PLAN_LIMITS.STARTER.dataSources)
      expect(PLAN_LIMITS.PROFESSIONAL.apiCallsPerMin).toBeGreaterThan(PLAN_LIMITS.STARTER.apiCallsPerMin)
      expect(PLAN_LIMITS.PROFESSIONAL.tokensPerMonth).toBeGreaterThan(PLAN_LIMITS.STARTER.tokensPerMonth)
    })
  })

  describe('ENTERPRISE plan', () => {
    it('has correct limits', () => {
      expect(PLAN_LIMITS.ENTERPRISE.agentRuns).toBe(-1) // unlimited
      expect(PLAN_LIMITS.ENTERPRISE.teamSeats).toBe(-1) // unlimited
      expect(PLAN_LIMITS.ENTERPRISE.dataSources).toBe(-1) // unlimited
      expect(PLAN_LIMITS.ENTERPRISE.apiCallsPerMin).toBe(2000)
      expect(PLAN_LIMITS.ENTERPRISE.retentionDays).toBe(365)
      expect(PLAN_LIMITS.ENTERPRISE.tokensPerMonth).toBe(-1) // unlimited
    })

    it('uses -1 to indicate unlimited', () => {
      const unlimitedFields = ['agentRuns', 'teamSeats', 'dataSources', 'tokensPerMonth'] as const
      unlimitedFields.forEach((field) => {
        expect(PLAN_LIMITS.ENTERPRISE[field]).toBe(-1)
      })
    })
  })
})

describe('PLAN_PRICES constant', () => {
  it('defines prices for all plan tiers', () => {
    expect(PLAN_PRICES).toHaveProperty('STARTER')
    expect(PLAN_PRICES).toHaveProperty('PROFESSIONAL')
    expect(PLAN_PRICES).toHaveProperty('ENTERPRISE')
  })

  describe('STARTER plan pricing', () => {
    it('has correct price structure', () => {
      expect(PLAN_PRICES.STARTER).toHaveProperty('monthly')
      expect(PLAN_PRICES.STARTER).toHaveProperty('yearly')
      expect(PLAN_PRICES.STARTER).toHaveProperty('amount')
    })

    it('is free tier', () => {
      expect(PLAN_PRICES.STARTER.amount).toBe(0)
    })
  })

  describe('PROFESSIONAL plan pricing', () => {
    it('has correct price structure', () => {
      expect(PLAN_PRICES.PROFESSIONAL).toHaveProperty('monthly')
      expect(PLAN_PRICES.PROFESSIONAL).toHaveProperty('yearly')
      expect(PLAN_PRICES.PROFESSIONAL).toHaveProperty('amount')
    })

    it('costs $99', () => {
      expect(PLAN_PRICES.PROFESSIONAL.amount).toBe(99)
    })
  })

  describe('ENTERPRISE plan pricing', () => {
    it('has correct price structure', () => {
      expect(PLAN_PRICES.ENTERPRISE).toHaveProperty('monthly')
      expect(PLAN_PRICES.ENTERPRISE).toHaveProperty('yearly')
      expect(PLAN_PRICES.ENTERPRISE).toHaveProperty('amount')
    })

    it('costs $499', () => {
      expect(PLAN_PRICES.ENTERPRISE.amount).toBe(499)
    })
  })

  it('has increasing prices with each tier', () => {
    expect(PLAN_PRICES.PROFESSIONAL.amount).toBeGreaterThan(PLAN_PRICES.STARTER.amount)
    expect(PLAN_PRICES.ENTERPRISE.amount).toBeGreaterThan(PLAN_PRICES.PROFESSIONAL.amount)
  })
})

describe('Plan tier relationships', () => {
  it('all plan tiers exist in both LIMITS and PRICES', () => {
    const limitTiers = Object.keys(PLAN_LIMITS)
    const priceTiers = Object.keys(PLAN_PRICES)

    expect(limitTiers).toEqual(priceTiers)
  })

  it('all plan limit fields are consistent across tiers', () => {
    const starterFields = Object.keys(PLAN_LIMITS.STARTER)
    const professionalFields = Object.keys(PLAN_LIMITS.PROFESSIONAL)
    const enterpriseFields = Object.keys(PLAN_LIMITS.ENTERPRISE)

    expect(professionalFields).toEqual(starterFields)
    expect(enterpriseFields).toEqual(starterFields)
  })
})

describe('recordUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a usage record with correct parameters', async () => {
    vi.mocked(prisma.usageRecord.create).mockResolvedValue({
      id: 'usage-1',
      orgId: 'org-1',
      metricType: 'AGENT_RUNS',
      quantity: 1,
      recordedAt: new Date(),
    } as any)

    await recordUsage('org-1', 'AGENT_RUNS', 1)

    expect(prisma.usageRecord.create).toHaveBeenCalledWith({
      data: { orgId: 'org-1', metricType: 'AGENT_RUNS', quantity: 1 }
    })
  })

  it('records multiple types of usage', async () => {
    vi.mocked(prisma.usageRecord.create).mockResolvedValue({} as any)

    await recordUsage('org-1', 'TOKENS_CONSUMED', 1000)
    await recordUsage('org-1', 'API_CALLS', 50)

    expect(prisma.usageRecord.create).toHaveBeenCalledTimes(2)
    expect(prisma.usageRecord.create).toHaveBeenNthCalledWith(1, {
      data: { orgId: 'org-1', metricType: 'TOKENS_CONSUMED', quantity: 1000 }
    })
    expect(prisma.usageRecord.create).toHaveBeenNthCalledWith(2, {
      data: { orgId: 'org-1', metricType: 'API_CALLS', quantity: 50 }
    })
  })
})

describe('getUsageSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns aggregated usage by metric type', async () => {
    vi.mocked(prisma.usageRecord.groupBy).mockResolvedValue([
      { metricType: 'AGENT_RUNS', _sum: { quantity: 50 } },
      { metricType: 'TOKENS_CONSUMED', _sum: { quantity: 10000 } },
    ] as any)

    const startDate = new Date('2024-01-01')
    const endDate = new Date('2024-01-31')

    const result = await getUsageSummary('org-1', startDate, endDate)

    expect(result).toEqual({
      AGENT_RUNS: 50,
      TOKENS_CONSUMED: 10000,
    })
    expect(prisma.usageRecord.groupBy).toHaveBeenCalledWith({
      by: ['metricType'],
      where: {
        orgId: 'org-1',
        recordedAt: { gte: startDate, lte: endDate }
      },
      _sum: { quantity: true }
    })
  })

  it('returns 0 for metrics with null sum', async () => {
    vi.mocked(prisma.usageRecord.groupBy).mockResolvedValue([
      { metricType: 'API_CALLS', _sum: { quantity: null } },
    ] as any)

    const result = await getUsageSummary('org-1', new Date(), new Date())

    expect(result.API_CALLS).toBe(0)
  })

  it('returns empty object when no records exist', async () => {
    vi.mocked(prisma.usageRecord.groupBy).mockResolvedValue([])

    const result = await getUsageSummary('org-1', new Date(), new Date())

    expect(result).toEqual({})
  })
})

describe('checkUsageLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns allowed true when under limit', async () => {
    vi.mocked(prisma.organization.findUnique).mockResolvedValue({
      id: 'org-1',
      planTier: 'STARTER',
    } as any)
    vi.mocked(prisma.usageRecord.groupBy).mockResolvedValue([
      { metricType: 'AGENT_RUNS', _sum: { quantity: 50 } },
    ] as any)

    const result = await checkUsageLimit('org-1', 'agentRuns')

    expect(result.allowed).toBe(true)
    expect(result.current).toBe(50)
    expect(result.limit).toBe(100) // STARTER limit
  })

  it('returns allowed false when at or over limit', async () => {
    vi.mocked(prisma.organization.findUnique).mockResolvedValue({
      id: 'org-1',
      planTier: 'STARTER',
    } as any)
    vi.mocked(prisma.usageRecord.groupBy).mockResolvedValue([
      { metricType: 'AGENT_RUNS', _sum: { quantity: 100 } },
    ] as any)

    const result = await checkUsageLimit('org-1', 'agentRuns')

    expect(result.allowed).toBe(false)
    expect(result.current).toBe(100)
    expect(result.limit).toBe(100)
  })

  it('returns unlimited for enterprise plan', async () => {
    vi.mocked(prisma.organization.findUnique).mockResolvedValue({
      id: 'org-1',
      planTier: 'ENTERPRISE',
    } as any)

    const result = await checkUsageLimit('org-1', 'agentRuns')

    expect(result.allowed).toBe(true)
    expect(result.limit).toBe(-1)
  })

  it('defaults to STARTER plan when org not found', async () => {
    vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.usageRecord.groupBy).mockResolvedValue([])

    const result = await checkUsageLimit('org-1', 'agentRuns')

    expect(result.limit).toBe(100) // STARTER limit
  })

  it('returns allowed true for metrics without usage tracking', async () => {
    vi.mocked(prisma.organization.findUnique).mockResolvedValue({
      id: 'org-1',
      planTier: 'STARTER',
    } as any)

    const result = await checkUsageLimit('org-1', 'retentionDays')

    expect(result.allowed).toBe(true)
  })
})

describe('getStripe', () => {
  it('throws error when STRIPE_SECRET_KEY is not configured', () => {
    const originalKey = process.env.STRIPE_SECRET_KEY
    delete process.env.STRIPE_SECRET_KEY

    expect(() => getStripe()).toThrow('STRIPE_SECRET_KEY environment variable is not configured')

    process.env.STRIPE_SECRET_KEY = originalKey
  })
})

// Mock Stripe for testing Stripe-dependent functions
const mockCustomerCreate = vi.fn().mockResolvedValue({ id: 'cus_test123' })
const mockCheckoutSessionCreate = vi.fn().mockResolvedValue({ id: 'cs_test123', url: 'https://checkout.stripe.com/test' })
const mockPortalSessionCreate = vi.fn().mockResolvedValue({ id: 'bps_test123', url: 'https://billing.stripe.com/test' })

vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      customers = {
        create: mockCustomerCreate,
      }
      checkout = {
        sessions: {
          create: mockCheckoutSessionCreate,
        },
      }
      billingPortal = {
        sessions: {
          create: mockPortalSessionCreate,
        },
      }
    },
  }
})

describe('Stripe integration functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_SECRET_KEY = 'sk_test_12345'
  })

  describe('createCustomer', () => {
    it('creates a Stripe customer and updates billing subscription', async () => {
      vi.mocked(prisma.billingSubscription.update).mockResolvedValue({
        id: 'sub-1',
        orgId: 'org-1',
        stripeCustomerId: 'cus_test123',
      } as any)

      // We need to dynamically import to get the mocked version
      const { createCustomer } = await import('./billing')

      const result = await createCustomer('org-1', 'test@example.com', 'Test Org')

      expect(result.id).toBe('cus_test123')
      expect(prisma.billingSubscription.update).toHaveBeenCalledWith({
        where: { orgId: 'org-1' },
        data: { stripeCustomerId: 'cus_test123' },
      })
    })
  })

  describe('createCheckoutSession', () => {
    it('creates checkout session for existing customer', async () => {
      vi.mocked(prisma.billingSubscription.findUnique).mockResolvedValue({
        id: 'sub-1',
        orgId: 'org-1',
        stripeCustomerId: 'cus_existing',
        organization: { id: 'org-1', name: 'Test Org' },
      } as any)

      const { createCheckoutSession } = await import('./billing')

      const result = await createCheckoutSession(
        'org-1',
        'price_test',
        'https://example.com/success',
        'https://example.com/cancel'
      )

      expect(result.id).toBe('cs_test123')
    })

    it('throws error when no Stripe customer ID exists', async () => {
      vi.mocked(prisma.billingSubscription.findUnique).mockResolvedValue({
        id: 'sub-1',
        orgId: 'org-1',
        stripeCustomerId: null,
        organization: { id: 'org-1' },
      } as any)

      const { createCheckoutSession } = await import('./billing')

      await expect(
        createCheckoutSession(
          'org-1',
          'price_test',
          'https://example.com/success',
          'https://example.com/cancel'
        )
      ).rejects.toThrow('No Stripe customer ID found')
    })
  })

  describe('createPortalSession', () => {
    it('creates billing portal session for existing customer', async () => {
      vi.mocked(prisma.billingSubscription.findUnique).mockResolvedValue({
        id: 'sub-1',
        orgId: 'org-1',
        stripeCustomerId: 'cus_existing',
      } as any)

      const { createPortalSession } = await import('./billing')

      const result = await createPortalSession('org-1', 'https://example.com/return')

      expect(result.id).toBe('bps_test123')
    })

    it('throws error when no Stripe customer ID exists', async () => {
      vi.mocked(prisma.billingSubscription.findUnique).mockResolvedValue({
        id: 'sub-1',
        orgId: 'org-1',
        stripeCustomerId: null,
      } as any)

      const { createPortalSession } = await import('./billing')

      await expect(
        createPortalSession('org-1', 'https://example.com/return')
      ).rejects.toThrow('No Stripe customer ID found')
    })
  })

  describe('handleStripeWebhook', () => {
    it('handles customer.subscription.created event', async () => {
      vi.mocked(prisma.billingSubscription.update).mockResolvedValue({} as any)

      const { handleStripeWebhook } = await import('./billing')

      const event = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test',
            status: 'active',
            metadata: { orgId: 'org-1' },
            current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
            cancel_at_period_end: false,
          },
        },
      } as any

      await handleStripeWebhook(event)

      expect(prisma.billingSubscription.update).toHaveBeenCalledWith({
        where: { orgId: 'org-1' },
        data: expect.objectContaining({
          stripeSubscriptionId: 'sub_test',
          status: 'ACTIVE',
          cancelAtPeriodEnd: false,
        }),
      })
    })

    it('handles customer.subscription.updated event', async () => {
      vi.mocked(prisma.billingSubscription.update).mockResolvedValue({} as any)

      const { handleStripeWebhook } = await import('./billing')

      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test',
            status: 'past_due',
            metadata: { orgId: 'org-1' },
            current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
            cancel_at_period_end: true,
          },
        },
      } as any

      await handleStripeWebhook(event)

      expect(prisma.billingSubscription.update).toHaveBeenCalledWith({
        where: { orgId: 'org-1' },
        data: expect.objectContaining({
          status: 'PAST_DUE',
          cancelAtPeriodEnd: true,
        }),
      })
    })

    it('handles customer.subscription.deleted event', async () => {
      vi.mocked(prisma.billingSubscription.update).mockResolvedValue({} as any)
      vi.mocked(prisma.organization.update).mockResolvedValue({} as any)

      const { handleStripeWebhook } = await import('./billing')

      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test',
            metadata: { orgId: 'org-1' },
          },
        },
      } as any

      await handleStripeWebhook(event)

      expect(prisma.billingSubscription.update).toHaveBeenCalledWith({
        where: { orgId: 'org-1' },
        data: {
          status: 'CANCELED',
          stripeSubscriptionId: null,
        },
      })

      expect(prisma.organization.update).toHaveBeenCalledWith({
        where: { id: 'org-1' },
        data: { planTier: 'STARTER' },
      })
    })

    it('does not process events without orgId in metadata', async () => {
      const { handleStripeWebhook } = await import('./billing')

      const event = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test',
            status: 'active',
            metadata: {},
            current_period_end: Math.floor(Date.now() / 1000),
            cancel_at_period_end: false,
          },
        },
      } as any

      await handleStripeWebhook(event)

      expect(prisma.billingSubscription.update).not.toHaveBeenCalled()
    })

    it('handles trialing status', async () => {
      vi.mocked(prisma.billingSubscription.update).mockResolvedValue({} as any)

      const { handleStripeWebhook } = await import('./billing')

      const event = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test',
            status: 'trialing',
            metadata: { orgId: 'org-1' },
            current_period_end: Math.floor(Date.now() / 1000) + 86400 * 14,
            cancel_at_period_end: false,
          },
        },
      } as any

      await handleStripeWebhook(event)

      expect(prisma.billingSubscription.update).toHaveBeenCalledWith({
        where: { orgId: 'org-1' },
        data: expect.objectContaining({
          status: 'TRIALING',
        }),
      })
    })

    it('handles unpaid status', async () => {
      vi.mocked(prisma.billingSubscription.update).mockResolvedValue({} as any)

      const { handleStripeWebhook } = await import('./billing')

      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test',
            status: 'unpaid',
            metadata: { orgId: 'org-1' },
            current_period_end: Math.floor(Date.now() / 1000),
            cancel_at_period_end: false,
          },
        },
      } as any

      await handleStripeWebhook(event)

      expect(prisma.billingSubscription.update).toHaveBeenCalledWith({
        where: { orgId: 'org-1' },
        data: expect.objectContaining({
          status: 'UNPAID',
        }),
      })
    })
  })
})
