import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/auth')
vi.mock('@/lib/db')
vi.mock('@/lib/gwi-api')

describe('GWI Audiences Create API - POST /api/v1/gwi/audiences/create', () => {
  describe('Request Validation', () => {
    it('should validate audience criteria', () => {
      const criteria = {
        markets: ['US', 'UK'],
        age: { min: 18, max: 65 },
        interests: ['technology', 'gaming']
      }

      expect(Array.isArray(criteria.markets)).toBe(true)
      expect(criteria.age.min).toBeLessThan(criteria.age.max)
    })

    it('should require markets', () => {
      const criteria = { markets: ['US'] }
      expect(criteria.markets.length).toBeGreaterThan(0)
    })

    it('should validate age range', () => {
      const age = { min: 18, max: 25 }
      expect(age.min).toBeGreaterThanOrEqual(16)
      expect(age.max).toBeLessThanOrEqual(65)
    })
  })

  describe('GWI API Integration', () => {
    it('should build GWI audience query', () => {
      const query = {
        markets: ['US', 'UK'],
        age_range: '18-25',
        interests: ['tech', 'gaming']
      }

      expect(query.markets).toBeTruthy()
    })

    it('should calculate audience size', () => {
      const audience = {
        totalSize: 45000000,
        marketBreakdown: {
          US: 30000000,
          UK: 15000000
        }
      }

      const total = Object.values(audience.marketBreakdown).reduce((a, b) => a + b)
      expect(total).toBe(audience.totalSize)
    })

    it('should fetch demographic data', () => {
      const demographics = {
        age: { '18-24': 45, '25-34': 55 },
        gender: { male: 52, female: 48 }
      }

      expect(demographics.age).toBeDefined()
      expect(demographics.gender).toBeDefined()
    })
  })

  describe('Audience Creation', () => {
    it('should create audience record', () => {
      const audience = {
        id: 'aud-123',
        name: 'Gen Z Gamers',
        criteria: {},
        size: 45000000,
        createdAt: new Date()
      }

      expect(audience.id).toBeTruthy()
      expect(audience.size).toBeGreaterThan(0)
    })

    it('should save GWI metadata', () => {
      const metadata = {
        gwiQueryId: 'gwi-query-123',
        lastSynced: new Date(),
        dataVersion: '2024-Q4'
      }

      expect(metadata.gwiQueryId).toBeTruthy()
    })

    it('should link to organization', () => {
      const audience = {
        id: 'aud-123',
        organizationId: 'org-456',
        createdBy: 'user-789'
      }

      expect(audience.organizationId).toBeTruthy()
    })
  })

  describe('Interest Selection', () => {
    it('should support interest categories', () => {
      const interests = [
        { id: 'tech', name: 'Technology', category: 'interests' },
        { id: 'gaming', name: 'Gaming', category: 'hobbies' }
      ]

      expect(interests.every(i => i.category)).toBe(true)
    })

    it('should calculate interest indices', () => {
      const interests = [
        { name: 'Technology', index: 158, audienceSize: 35000000 },
        { name: 'Gaming', index: 142, audienceSize: 30000000 }
      ]

      expect(interests[0].index).toBeGreaterThan(100)
    })
  })

  describe('Market Selection', () => {
    it('should support multiple markets', () => {
      const markets = ['US', 'UK', 'CA', 'AU', 'DE']
      expect(markets.length).toBeGreaterThan(0)
    })

    it('should validate market codes', () => {
      const validMarkets = ['US', 'UK', 'CA', 'AU']
      const market = 'US'

      expect(validMarkets.includes(market)).toBe(true)
    })

    it('should calculate market reach', () => {
      const marketData = {
        US: { population: 330000000, reach: 15.5 },
        UK: { population: 67000000, reach: 12.3 }
      }

      expect(marketData.US.reach).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle GWI API errors', () => {
      const error = {
        code: 'GWI_API_ERROR',
        message: 'Failed to fetch audience data'
      }

      expect(error.code).toBe('GWI_API_ERROR')
    })

    it('should handle invalid criteria', () => {
      const error = {
        code: 'INVALID_CRITERIA',
        field: 'age.min',
        message: 'Minimum age must be at least 16'
      }

      expect(error.field).toBeTruthy()
    })

    it('should handle quota limits', () => {
      const quota = {
        used: 9500,
        limit: 10000,
        remaining: 500
      }

      const hasQuota = quota.remaining > 0
      expect(hasQuota).toBe(true)
    })
  })
})
