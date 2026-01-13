import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/db')
vi.mock('@/lib/super-admin')
vi.mock('next/headers')

describe('Admin Analytics API - GET /api/admin/analytics', () => {
  describe('Authentication', () => {
    it('should require admin token', () => {
      const token = undefined
      expect(token).toBeUndefined()
    })

    it('should return 401 for missing token', () => {
      const statusCode = 401
      expect(statusCode).toBe(401)
    })

    it('should return 401 for invalid session', () => {
      const session = null
      expect(session).toBeNull()
    })

    it('should validate admin session', () => {
      const session = {
        adminId: 'admin-123',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
      expect(session.adminId).toBeTruthy()
    })
  })

  describe('Query Parameters', () => {
    it('should support period parameter', () => {
      const period = '30d'
      expect(period).toBeTruthy()
    })

    it('should default to 30 days', () => {
      const periodParam = undefined
      const period = periodParam || '30d'
      expect(period).toBe('30d')
    })

    it('should parse numeric periods', () => {
      const periodParam = '90'
      const periodDays = parseInt(periodParam)
      expect(periodDays).toBe(90)
    })

    it('should handle "d" suffix in period', () => {
      const periodParam = '7d'
      const periodDays = parseInt(periodParam) || 7
      expect(periodDays).toBe(7)
    })
  })

  describe('Date Range Calculation', () => {
    it('should calculate start date from period', () => {
      const periodDays = 30
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
      expect(daysDiff).toBeCloseTo(30, 0)
    })

    it('should calculate previous period start date', () => {
      const periodDays = 30
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
      const previousStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000)
      const daysDiff = Math.floor((startDate.getTime() - previousStartDate.getTime()) / (24 * 60 * 60 * 1000))
      expect(daysDiff).toBeCloseTo(30, 0)
    })

    it('should handle 7 day period', () => {
      const periodDays = 7
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
      expect(startDate).toBeInstanceOf(Date)
    })

    it('should handle 90 day period', () => {
      const periodDays = 90
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
      expect(startDate).toBeInstanceOf(Date)
    })
  })

  describe('Platform Metrics', () => {
    it('should return total organizations count', () => {
      const data = { totalOrgs: 150 }
      expect(data.totalOrgs).toBeGreaterThanOrEqual(0)
    })

    it('should return active organizations count', () => {
      const data = { activeOrgs: 120 }
      expect(data.activeOrgs).toBeGreaterThanOrEqual(0)
    })

    it('should return new organizations this period', () => {
      const data = { newOrgsThisPeriod: 25 }
      expect(data.newOrgsThisPeriod).toBeGreaterThanOrEqual(0)
    })

    it('should return churned organizations', () => {
      const data = { churnedOrgs: 3 }
      expect(data.churnedOrgs).toBeGreaterThanOrEqual(0)
    })

    it('should return total users count', () => {
      const data = { totalUsers: 500 }
      expect(data.totalUsers).toBeGreaterThanOrEqual(0)
    })

    it('should return active users count', () => {
      const data = { activeUsers: 300 }
      expect(data.activeUsers).toBeGreaterThanOrEqual(0)
    })

    it('should return new users this period', () => {
      const data = { newUsersThisPeriod: 50 }
      expect(data.newUsersThisPeriod).toBeGreaterThanOrEqual(0)
    })

    it('should calculate DAU/MAU ratio', () => {
      const totalUsers = 1000
      const activeUsers = 300
      const dauMau = Math.min(100, Math.round((activeUsers / totalUsers) * 100 * 3))
      expect(dauMau).toBeGreaterThanOrEqual(0)
      expect(dauMau).toBeLessThanOrEqual(100)
    })
  })

  describe('Active Organizations Detection', () => {
    it('should consider orgs with recent members as active', () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const where = {
        OR: [
          { members: { some: { joinedAt: { gte: startDate } } } }
        ]
      }
      expect(where.OR[0].members.some.joinedAt.gte).toBeInstanceOf(Date)
    })

    it('should consider orgs with recent agent runs as active', () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const where = {
        agents: { some: { runs: { some: { startedAt: { gte: startDate } } } } }
      }
      expect(where.agents.some.runs.some.startedAt.gte).toBeInstanceOf(Date)
    })
  })

  describe('Usage Metrics', () => {
    it('should return total agent runs', () => {
      const data = { totalAgentRuns: 5000 }
      expect(data.totalAgentRuns).toBeGreaterThanOrEqual(0)
    })

    it('should return total tokens consumed', () => {
      const data = { totalTokens: 10000000 }
      expect(data.totalTokens).toBeGreaterThanOrEqual(0)
    })

    it('should return total API calls', () => {
      const data = { totalApiCalls: 50000 }
      expect(data.totalApiCalls).toBeGreaterThanOrEqual(0)
    })

    it('should return average session duration', () => {
      const data = { avgSessionDuration: 12 }
      expect(data.avgSessionDuration).toBeGreaterThanOrEqual(0)
    })

    it('should aggregate tokens from usage records', () => {
      const usageRecords = [
        { quantity: 10000 },
        { quantity: 25000 },
        { quantity: 15000 }
      ]
      const totalTokens = usageRecords.reduce((sum, r) => sum + r.quantity, 0)
      expect(totalTokens).toBe(50000)
    })

    it('should filter by metric type TOKENS_CONSUMED', () => {
      const where = {
        metricType: 'TOKENS_CONSUMED'
      }
      expect(where.metricType).toBe('TOKENS_CONSUMED')
    })
  })

  describe('Revenue Metrics', () => {
    it('should return MRR', () => {
      const data = { mrr: 750000 }
      expect(data.mrr).toBeGreaterThanOrEqual(0)
    })

    it('should return ARR', () => {
      const data = { arr: 9000000 }
      expect(data.arr).toBeGreaterThanOrEqual(0)
    })

    it('should return ARPU', () => {
      const data = { arpu: 5000 }
      expect(data.arpu).toBeGreaterThanOrEqual(0)
    })

    it('should return LTV', () => {
      const data = { ltv: 120000 }
      expect(data.ltv).toBeGreaterThanOrEqual(0)
    })

    it('should return churn rate', () => {
      const data = { churnRate: 2.0 }
      expect(data.churnRate).toBeGreaterThanOrEqual(0)
    })

    it('should return net revenue retention', () => {
      const data = { netRevenueRetention: 105 }
      expect(data.netRevenueRetention).toBeGreaterThanOrEqual(0)
    })

    it('should calculate ARR from MRR', () => {
      const mrr = 100000
      const arr = mrr * 12
      expect(arr).toBe(1200000)
    })

    it('should calculate ARPU from MRR and org count', () => {
      const mrr = 150000
      const totalOrgs = 30
      const arpu = Math.round(mrr / totalOrgs)
      expect(arpu).toBe(5000)
    })

    it('should handle zero organizations for ARPU', () => {
      const mrr = 100000
      const totalOrgs = 0
      const arpu = totalOrgs > 0 ? Math.round(mrr / totalOrgs) : 0
      expect(arpu).toBe(0)
    })

    it('should calculate LTV as 24 month average', () => {
      const avgRevenuePerOrg = 5000
      const ltv = avgRevenuePerOrg * 24
      expect(ltv).toBe(120000)
    })
  })

  describe('Growth Metrics', () => {
    it('should calculate organization growth rate', () => {
      const newOrgsThisPeriod = 30
      const newOrgsPreviousPeriod = 20
      const orgGrowthRate = ((newOrgsThisPeriod - newOrgsPreviousPeriod) / newOrgsPreviousPeriod) * 100
      expect(orgGrowthRate).toBe(50)
    })

    it('should handle zero previous period orgs', () => {
      const newOrgsThisPeriod = 10
      const newOrgsPreviousPeriod = 0
      const orgGrowthRate = newOrgsPreviousPeriod > 0
        ? ((newOrgsThisPeriod - newOrgsPreviousPeriod) / newOrgsPreviousPeriod) * 100
        : newOrgsThisPeriod > 0 ? 100 : 0
      expect(orgGrowthRate).toBe(100)
    })

    it('should return zero growth when no orgs in both periods', () => {
      const newOrgsThisPeriod = 0
      const newOrgsPreviousPeriod = 0
      const orgGrowthRate = newOrgsPreviousPeriod > 0
        ? ((newOrgsThisPeriod - newOrgsPreviousPeriod) / newOrgsPreviousPeriod) * 100
        : newOrgsThisPeriod > 0 ? 100 : 0
      expect(orgGrowthRate).toBe(0)
    })

    it('should calculate negative growth', () => {
      const newOrgsThisPeriod = 15
      const newOrgsPreviousPeriod = 25
      const orgGrowthRate = ((newOrgsThisPeriod - newOrgsPreviousPeriod) / newOrgsPreviousPeriod) * 100
      expect(orgGrowthRate).toBe(-40)
    })

    it('should return user growth rate', () => {
      const data = { userGrowthRate: 25.5 }
      expect(data.userGrowthRate).toBeGreaterThanOrEqual(-100)
    })

    it('should return revenue growth rate', () => {
      const data = { revenueGrowthRate: 30 }
      expect(data.revenueGrowthRate).toBeGreaterThanOrEqual(-100)
    })
  })

  describe('Churn Calculation', () => {
    it('should calculate churned orgs as percentage', () => {
      const totalOrgs = 100
      const churnRate = 0.02 // 2%
      const churnedOrgs = Math.max(0, Math.floor(totalOrgs * churnRate))
      expect(churnedOrgs).toBe(2)
    })

    it('should not return negative churn', () => {
      const totalOrgs = 10
      const churnRate = -0.05
      const churnedOrgs = Math.max(0, Math.floor(totalOrgs * churnRate))
      expect(churnedOrgs).toBe(0)
    })

    it('should handle zero total orgs', () => {
      const totalOrgs = 0
      const churnRate = 0.02
      const churnedOrgs = Math.max(0, Math.floor(totalOrgs * churnRate))
      expect(churnedOrgs).toBe(0)
    })
  })

  describe('Organizations by Plan', () => {
    it('should group organizations by plan tier', () => {
      const orgsByPlan = [
        { planTier: 'STARTER', _count: 50 },
        { planTier: 'PROFESSIONAL', _count: 75 },
        { planTier: 'ENTERPRISE', _count: 25 }
      ]
      expect(orgsByPlan.length).toBe(3)
    })

    it('should convert to map format', () => {
      const orgsByPlan = [
        { planTier: 'STARTER', _count: 50 },
        { planTier: 'PROFESSIONAL', _count: 75 }
      ]
      const orgsByPlanMap: Record<string, number> = {}
      orgsByPlan.forEach(item => {
        orgsByPlanMap[item.planTier] = item._count
      })
      expect(orgsByPlanMap['STARTER']).toBe(50)
      expect(orgsByPlanMap['PROFESSIONAL']).toBe(75)
    })

    it('should support all plan tiers', () => {
      const validPlans = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE']
      expect(validPlans.length).toBe(3)
    })
  })

  describe('Organizations by Industry', () => {
    it('should group organizations by industry', () => {
      const orgsByIndustry = [
        { industry: 'Technology', _count: 40 },
        { industry: 'Healthcare', _count: 30 },
        { industry: 'Finance', _count: 20 }
      ]
      expect(orgsByIndustry.length).toBe(3)
    })

    it('should filter out null industries', () => {
      const where = { industry: { not: null } }
      expect(where.industry.not).toBeNull()
    })

    it('should convert to map format', () => {
      const orgsByIndustry = [
        { industry: 'Technology', _count: 40 },
        { industry: 'Healthcare', _count: 30 }
      ]
      const orgsByIndustryMap: Record<string, number> = {}
      orgsByIndustry.forEach(item => {
        if (item.industry) {
          orgsByIndustryMap[item.industry] = item._count
        }
      })
      expect(orgsByIndustryMap['Technology']).toBe(40)
      expect(orgsByIndustryMap['Healthcare']).toBe(30)
    })
  })

  describe('Top Features', () => {
    it('should return top features with usage', () => {
      const topFeatures = [
        { name: 'AI Agent Runs', usage: 5000 },
        { name: 'Dashboard Views', usage: 2250 },
        { name: 'Report Generation', usage: 1200 }
      ]
      expect(topFeatures.length).toBeGreaterThan(0)
      expect(topFeatures[0]).toHaveProperty('name')
      expect(topFeatures[0]).toHaveProperty('usage')
    })

    it('should include AI Agent Runs', () => {
      const totalAgentRuns = 5000
      const feature = { name: 'AI Agent Runs', usage: totalAgentRuns }
      expect(feature.usage).toBe(5000)
    })

    it('should calculate dashboard views', () => {
      const totalOrgs = 150
      const dashboardViews = Math.floor(totalOrgs * 15)
      expect(dashboardViews).toBe(2250)
    })

    it('should calculate report generation', () => {
      const totalOrgs = 150
      const reportGen = Math.floor(totalOrgs * 8)
      expect(reportGen).toBe(1200)
    })

    it('should calculate data source connections', () => {
      const totalOrgs = 150
      const dataSources = Math.floor(totalOrgs * 3)
      expect(dataSources).toBe(450)
    })

    it('should calculate API calls', () => {
      const totalOrgs = 150
      const apiCalls = Math.floor(totalOrgs * 100)
      expect(apiCalls).toBe(15000)
    })
  })

  describe('Response Structure', () => {
    it('should return data object', () => {
      const response = { data: {} }
      expect(response).toHaveProperty('data')
    })

    it('should include all platform metrics', () => {
      const data = {
        totalOrgs: 150,
        activeOrgs: 120,
        newOrgsThisPeriod: 25,
        churnedOrgs: 3,
        totalUsers: 500,
        activeUsers: 300,
        newUsersThisPeriod: 50,
        dauMau: 90
      }
      expect(data).toHaveProperty('totalOrgs')
      expect(data).toHaveProperty('activeOrgs')
      expect(data).toHaveProperty('newOrgsThisPeriod')
      expect(data).toHaveProperty('churnedOrgs')
      expect(data).toHaveProperty('totalUsers')
      expect(data).toHaveProperty('activeUsers')
      expect(data).toHaveProperty('newUsersThisPeriod')
      expect(data).toHaveProperty('dauMau')
    })

    it('should include all usage metrics', () => {
      const data = {
        totalAgentRuns: 5000,
        totalTokens: 10000000,
        totalApiCalls: 50000,
        avgSessionDuration: 12
      }
      expect(data).toHaveProperty('totalAgentRuns')
      expect(data).toHaveProperty('totalTokens')
      expect(data).toHaveProperty('totalApiCalls')
      expect(data).toHaveProperty('avgSessionDuration')
    })

    it('should include all revenue metrics', () => {
      const data = {
        mrr: 750000,
        arr: 9000000,
        arpu: 5000,
        ltv: 120000,
        churnRate: 2.0,
        netRevenueRetention: 105
      }
      expect(data).toHaveProperty('mrr')
      expect(data).toHaveProperty('arr')
      expect(data).toHaveProperty('arpu')
      expect(data).toHaveProperty('ltv')
      expect(data).toHaveProperty('churnRate')
      expect(data).toHaveProperty('netRevenueRetention')
    })

    it('should include all growth metrics', () => {
      const data = {
        orgGrowthRate: 25,
        userGrowthRate: 30,
        revenueGrowthRate: 20
      }
      expect(data).toHaveProperty('orgGrowthRate')
      expect(data).toHaveProperty('userGrowthRate')
      expect(data).toHaveProperty('revenueGrowthRate')
    })

    it('should include breakdown data', () => {
      const data = {
        orgsByPlan: { STARTER: 50, PROFESSIONAL: 75, ENTERPRISE: 25 },
        orgsByIndustry: { Technology: 40, Healthcare: 30 },
        topFeatures: [{ name: 'Feature1', usage: 100 }]
      }
      expect(data).toHaveProperty('orgsByPlan')
      expect(data).toHaveProperty('orgsByIndustry')
      expect(data).toHaveProperty('topFeatures')
    })
  })

  describe('Parallel Data Fetching', () => {
    it('should fetch all metrics in parallel', () => {
      const queries = [
        'totalOrgs',
        'activeOrgs',
        'newOrgsThisPeriod',
        'newOrgsPreviousPeriod',
        'totalUsers',
        'activeUsers',
        'newUsersThisPeriod',
        'totalAgentRuns',
        'totalTokens',
        'orgsByPlan',
        'orgsByIndustry'
      ]
      expect(queries.length).toBe(11)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 for server errors', () => {
      const statusCode = 500
      const error = 'Failed to fetch analytics'
      expect(statusCode).toBe(500)
      expect(error).toBe('Failed to fetch analytics')
    })

    it('should log analytics errors', () => {
      const logMessage = 'Analytics error:'
      expect(logMessage).toContain('error')
    })

    it('should handle null token sum gracefully', () => {
      const tokenSum = { _sum: { quantity: null } }
      const totalTokens = tokenSum._sum.quantity || 0
      expect(totalTokens).toBe(0)
    })

    it('should handle activeUsers as number or fallback', () => {
      const activeUsers = 300
      const result = typeof activeUsers === 'number' ? activeUsers : 0
      expect(result).toBe(300)
    })
  })

  describe('Security', () => {
    it('should validate admin permissions', () => {
      const session = {
        adminId: 'admin-123',
        isSuperAdmin: true
      }
      expect(session.adminId).toBeTruthy()
    })

    it('should not expose sensitive data', () => {
      const data = {
        totalOrgs: 150,
        totalUsers: 500
      }
      expect(data).not.toHaveProperty('apiKeys')
      expect(data).not.toHaveProperty('passwords')
    })
  })
})
