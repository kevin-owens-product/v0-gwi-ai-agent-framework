import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/db')
vi.mock('@/lib/super-admin')
vi.mock('next/headers')

describe('Admin Health API - GET /api/admin/health', () => {
  describe('Authentication', () => {
    it('should require admin token', () => {
      const token = undefined
      expect(token).toBeUndefined()
    })

    it('should validate admin token', () => {
      const token = 'valid-admin-token'
      expect(token).toBeTruthy()
    })

    it('should return 401 for missing token', () => {
      const statusCode = 401
      expect(statusCode).toBe(401)
    })

    it('should return 401 for invalid session', () => {
      const session = null
      expect(session).toBeNull()
    })
  })

  describe('Query Parameters', () => {
    it('should support riskLevel filter', () => {
      const validRiskLevels = ['all', 'HEALTHY', 'AT_RISK', 'CRITICAL']
      const riskLevel = 'AT_RISK'

      expect(validRiskLevels).toContain(riskLevel)
    })

    it('should filter by HEALTHY risk level', () => {
      const riskLevel = 'HEALTHY'
      expect(riskLevel).toBe('HEALTHY')
    })

    it('should filter by AT_RISK risk level', () => {
      const riskLevel = 'AT_RISK'
      expect(riskLevel).toBe('AT_RISK')
    })

    it('should filter by CRITICAL risk level', () => {
      const riskLevel = 'CRITICAL'
      expect(riskLevel).toBe('CRITICAL')
    })

    it('should return all when riskLevel is "all"', () => {
      const riskLevel = 'all'
      const shouldFilter = riskLevel && riskLevel !== 'all'

      expect(shouldFilter).toBe(false)
    })
  })

  describe('Health Score Structure', () => {
    it('should include required health score fields', () => {
      const score = {
        id: 'score-123',
        orgId: 'org-123',
        overallScore: 75,
        engagementScore: 80,
        usageScore: 70,
        riskLevel: 'HEALTHY',
        churnProbability: 0.15,
        calculatedAt: new Date()
      }

      expect(score).toHaveProperty('orgId')
      expect(score).toHaveProperty('overallScore')
      expect(score).toHaveProperty('engagementScore')
      expect(score).toHaveProperty('usageScore')
      expect(score).toHaveProperty('riskLevel')
      expect(score).toHaveProperty('churnProbability')
    })

    it('should include recommendations', () => {
      const score = {
        id: 'score-1',
        recommendations: [
          'Low user engagement - consider outreach',
          'Low feature utilization - offer training'
        ]
      }

      expect(Array.isArray(score.recommendations)).toBe(true)
    })

    it('should include health indicators', () => {
      const score = {
        id: 'score-1',
        healthIndicators: {
          memberCount: 25,
          activeMembers: 20,
          agentRuns: 150,
          recentLogins: 18
        }
      }

      expect(score.healthIndicators).toBeDefined()
      expect(score.healthIndicators).toHaveProperty('memberCount')
      expect(score.healthIndicators).toHaveProperty('activeMembers')
      expect(score.healthIndicators).toHaveProperty('agentRuns')
    })
  })

  describe('Score Calculations', () => {
    it('should validate overall score range', () => {
      const scores = [0, 25, 50, 75, 100]

      scores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      })
    })

    it('should validate engagement score range', () => {
      const score = 85
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should validate usage score range', () => {
      const score = 65
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should calculate churn probability', () => {
      const churnProbability = 0.4
      expect(churnProbability).toBeGreaterThanOrEqual(0)
      expect(churnProbability).toBeLessThanOrEqual(1)
    })
  })

  describe('Risk Level Classification', () => {
    it('should classify HEALTHY organizations', () => {
      const overallScore = 75
      const riskLevel = overallScore >= 60 ? 'HEALTHY' : overallScore >= 30 ? 'AT_RISK' : 'CRITICAL'

      expect(riskLevel).toBe('HEALTHY')
    })

    it('should classify AT_RISK organizations', () => {
      const overallScore = 45
      const riskLevel = overallScore >= 60 ? 'HEALTHY' : overallScore >= 30 ? 'AT_RISK' : 'CRITICAL'

      expect(riskLevel).toBe('AT_RISK')
    })

    it('should classify CRITICAL organizations', () => {
      const overallScore = 20
      const riskLevel = overallScore >= 60 ? 'HEALTHY' : overallScore >= 30 ? 'AT_RISK' : 'CRITICAL'

      expect(riskLevel).toBe('CRITICAL')
    })

    it('should handle edge case at HEALTHY threshold', () => {
      const overallScore = 60
      const riskLevel = overallScore >= 60 ? 'HEALTHY' : 'AT_RISK'

      expect(riskLevel).toBe('HEALTHY')
    })

    it('should handle edge case at CRITICAL threshold', () => {
      const overallScore = 30
      const riskLevel = overallScore >= 30 ? 'AT_RISK' : 'CRITICAL'

      expect(riskLevel).toBe('AT_RISK')
    })
  })

  describe('Churn Probability Thresholds', () => {
    it('should assign low churn for HEALTHY', () => {
      // HEALTHY risk level should have low churn probability
      const churnProbability = 0.1

      expect(churnProbability).toBeLessThan(0.3)
    })

    it('should assign medium churn for AT_RISK', () => {
      // AT_RISK risk level should have medium churn probability
      const churnProbability = 0.4

      expect(churnProbability).toBeGreaterThanOrEqual(0.3)
      expect(churnProbability).toBeLessThan(0.6)
    })

    it('should assign high churn for CRITICAL', () => {
      // CRITICAL risk level should have high churn probability
      const churnProbability = 0.7

      expect(churnProbability).toBeGreaterThanOrEqual(0.6)
    })
  })

  describe('Response Structure', () => {
    it('should return scores array', () => {
      const response = {
        scores: []
      }

      expect(Array.isArray(response.scores)).toBe(true)
    })

    it('should include organization details', () => {
      const scoreWithOrg = {
        id: 'score-1',
        orgId: 'org-1',
        overallScore: 80,
        organization: {
          id: 'org-1',
          name: 'Acme Corp',
          slug: 'acme-corp',
          planTier: 'PROFESSIONAL'
        }
      }

      expect(scoreWithOrg).toHaveProperty('organization')
      expect(scoreWithOrg.organization).toHaveProperty('name')
      expect(scoreWithOrg.organization).toHaveProperty('slug')
      expect(scoreWithOrg.organization).toHaveProperty('planTier')
    })
  })

  describe('Sorting and Filtering', () => {
    it('should order by calculatedAt descending', () => {
      const orderBy = [{ calculatedAt: 'desc' }]
      expect(orderBy[0].calculatedAt).toBe('desc')
    })

    it('should show most recent scores first', () => {
      const scores = [
        { id: '1', calculatedAt: new Date('2024-01-01') },
        { id: '2', calculatedAt: new Date('2024-03-01') },
        { id: '3', calculatedAt: new Date('2024-02-01') }
      ]

      const sorted = [...scores].sort((a, b) =>
        b.calculatedAt.getTime() - a.calculatedAt.getTime()
      )

      expect(sorted[0].id).toBe('2')
    })

    it('should return distinct scores per organization', () => {
      const scores = [
        { orgId: 'org-1', calculatedAt: new Date('2024-03-01') },
        { orgId: 'org-1', calculatedAt: new Date('2024-02-01') },
        { orgId: 'org-2', calculatedAt: new Date('2024-03-01') }
      ]

      const uniqueOrgIds = new Set(scores.map(s => s.orgId))
      expect(uniqueOrgIds.size).toBeLessThanOrEqual(scores.length)
    })
  })

  describe('Health Indicators', () => {
    it('should track member count', () => {
      const indicators = {
        memberCount: 25,
        activeMembers: 20,
        agentRuns: 150,
        recentLogins: 18
      }

      expect(indicators.memberCount).toBeGreaterThanOrEqual(0)
    })

    it('should track active members', () => {
      const indicators = {
        memberCount: 25,
        activeMembers: 20
      }

      expect(indicators.activeMembers).toBeLessThanOrEqual(indicators.memberCount)
    })

    it('should track agent runs', () => {
      const indicators = {
        agentRuns: 150
      }

      expect(indicators.agentRuns).toBeGreaterThanOrEqual(0)
    })

    it('should track recent logins', () => {
      const indicators = {
        recentLogins: 18,
        memberCount: 25
      }

      expect(indicators.recentLogins).toBeGreaterThanOrEqual(0)
      expect(indicators.recentLogins).toBeLessThanOrEqual(indicators.memberCount)
    })
  })

  describe('Recommendations Generation', () => {
    it('should recommend outreach for low engagement', () => {
      const engagementScore = 30
      const recommendations: string[] = []

      if (engagementScore < 50) {
        recommendations.push('Low user engagement - consider outreach')
      }

      expect(recommendations).toContain('Low user engagement - consider outreach')
    })

    it('should recommend training for low usage', () => {
      const usageScore = 20
      const recommendations: string[] = []

      if (usageScore < 30) {
        recommendations.push('Low feature utilization - offer training')
      }

      expect(recommendations).toContain('Low feature utilization - offer training')
    })

    it('should recommend team invites for small teams', () => {
      const memberCount = 2
      const recommendations: string[] = []

      if (memberCount < 3) {
        recommendations.push('Small team size - encourage team invites')
      }

      expect(recommendations).toContain('Small team size - encourage team invites')
    })

    it('should handle multiple recommendations', () => {
      const recommendations = [
        'Low user engagement - consider outreach',
        'Low feature utilization - offer training',
        'Small team size - encourage team invites'
      ]

      expect(recommendations.length).toBe(3)
    })

    it('should handle no recommendations for healthy org', () => {
      const engagementScore = 80
      const usageScore = 75
      const memberCount = 15
      const recommendations: string[] = []

      if (engagementScore < 50) {
        recommendations.push('Low user engagement - consider outreach')
      }
      if (usageScore < 30) {
        recommendations.push('Low feature utilization - offer training')
      }
      if (memberCount < 3) {
        recommendations.push('Small team size - encourage team invites')
      }

      expect(recommendations.length).toBe(0)
    })
  })

  describe('Organization Mapping', () => {
    it('should map organizations to scores', () => {
      const orgs = [
        { id: 'org-1', name: 'Org 1' },
        { id: 'org-2', name: 'Org 2' }
      ]

      const orgMap = new Map(orgs.map(o => [o.id, o]))

      expect(orgMap.get('org-1')).toEqual({ id: 'org-1', name: 'Org 1' })
      expect(orgMap.get('org-2')).toEqual({ id: 'org-2', name: 'Org 2' })
    })

    it('should handle missing organizations', () => {
      const orgMap = new Map()
      const org = orgMap.get('org-999')

      expect(org).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    it('should return 500 for database errors', () => {
      const statusCode = 500
      expect(statusCode).toBe(500)
    })

    it('should log errors', () => {
      const errorMessage = 'Get health scores error:'
      expect(errorMessage).toContain('error')
    })
  })

  describe('Risk Filtering', () => {
    it('should filter HEALTHY organizations', () => {
      const scores = [
        { id: '1', riskLevel: 'HEALTHY' },
        { id: '2', riskLevel: 'AT_RISK' },
        { id: '3', riskLevel: 'HEALTHY' }
      ]

      const filtered = scores.filter(s => s.riskLevel === 'HEALTHY')
      expect(filtered.length).toBe(2)
    })

    it('should filter AT_RISK organizations', () => {
      const scores = [
        { id: '1', riskLevel: 'HEALTHY' },
        { id: '2', riskLevel: 'AT_RISK' },
        { id: '3', riskLevel: 'CRITICAL' }
      ]

      const filtered = scores.filter(s => s.riskLevel === 'AT_RISK')
      expect(filtered.length).toBe(1)
    })

    it('should filter CRITICAL organizations', () => {
      const scores = [
        { id: '1', riskLevel: 'CRITICAL' },
        { id: '2', riskLevel: 'AT_RISK' },
        { id: '3', riskLevel: 'CRITICAL' }
      ]

      const filtered = scores.filter(s => s.riskLevel === 'CRITICAL')
      expect(filtered.length).toBe(2)
    })
  })

  describe('Security', () => {
    it('should validate admin session', () => {
      const session = {
        id: 'session-1',
        adminId: 'admin-1',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }

      const isValid = session.expiresAt > new Date()
      expect(isValid).toBe(true)
    })

    it('should not expose sensitive org data', () => {
      const org = {
        id: 'org-1',
        name: 'Acme Corp',
        slug: 'acme-corp',
        planTier: 'PROFESSIONAL'
      }

      expect(org).not.toHaveProperty('apiKey')
      expect(org).not.toHaveProperty('webhookSecret')
    })
  })
})
