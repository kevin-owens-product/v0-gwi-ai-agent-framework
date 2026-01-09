import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PLAN_LIMITS, PLAN_PRICES } from './billing'

// Note: Database-dependent functions (recordUsage, checkUsageLimit, etc.)
// are tested in API integration tests where we can properly mock Prisma

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
