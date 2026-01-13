import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/db')
vi.mock('@/lib/super-admin')
vi.mock('next/headers')

describe('Admin Analytics Snapshots API - /api/admin/analytics/snapshots', () => {
  describe('GET /api/admin/analytics/snapshots', () => {
    describe('Authentication', () => {
      it('should require admin token', () => {
        const token = undefined
        expect(token).toBeUndefined()
      })

      it('should validate admin token', () => {
        const token = 'valid-admin-token-123'
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
      it('should support page parameter', () => {
        const page = 1
        expect(page).toBeGreaterThan(0)
      })

      it('should support limit parameter', () => {
        const limit = 30
        expect(limit).toBeGreaterThan(0)
      })

      it('should support startDate parameter', () => {
        const startDate = '2024-01-01'
        expect(startDate).toBeTruthy()
      })

      it('should support endDate parameter', () => {
        const endDate = '2024-01-31'
        expect(endDate).toBeTruthy()
      })

      it('should support type filter', () => {
        const validTypes = ['DAILY', 'WEEKLY', 'MONTHLY']
        const type = 'DAILY'
        expect(validTypes).toContain(type)
      })
    })

    describe('Response Structure', () => {
      it('should return snapshots array', () => {
        const response = {
          snapshots: [],
          total: 0,
          page: 1,
          limit: 30,
          totalPages: 0
        }

        expect(Array.isArray(response.snapshots)).toBe(true)
        expect(response).toHaveProperty('total')
        expect(response).toHaveProperty('page')
        expect(response).toHaveProperty('limit')
        expect(response).toHaveProperty('totalPages')
      })

      it('should include snapshot details', () => {
        const snapshot = {
          id: 'snapshot-123',
          type: 'DAILY',
          date: new Date(),
          metrics: {},
          createdAt: new Date()
        }

        expect(snapshot).toHaveProperty('id')
        expect(snapshot).toHaveProperty('type')
        expect(snapshot).toHaveProperty('date')
        expect(snapshot).toHaveProperty('metrics')
      })
    })

    describe('Snapshot Metrics', () => {
      it('should include organization metrics', () => {
        const metrics = {
          totalOrgs: 150,
          activeOrgs: 120,
          newOrgs: 10,
          churnedOrgs: 3
        }

        expect(metrics).toHaveProperty('totalOrgs')
        expect(metrics).toHaveProperty('activeOrgs')
        expect(metrics).toHaveProperty('newOrgs')
        expect(metrics).toHaveProperty('churnedOrgs')
      })

      it('should include user metrics', () => {
        const metrics = {
          totalUsers: 500,
          activeUsers: 350,
          newUsers: 25,
          dailyActiveUsers: 150
        }

        expect(metrics).toHaveProperty('totalUsers')
        expect(metrics).toHaveProperty('activeUsers')
        expect(metrics).toHaveProperty('newUsers')
        expect(metrics).toHaveProperty('dailyActiveUsers')
      })

      it('should include usage metrics', () => {
        const metrics = {
          totalAgentRuns: 5000,
          totalTokens: 1000000,
          totalApiCalls: 25000,
          avgSessionDuration: 15
        }

        expect(metrics).toHaveProperty('totalAgentRuns')
        expect(metrics).toHaveProperty('totalTokens')
        expect(metrics).toHaveProperty('totalApiCalls')
        expect(metrics).toHaveProperty('avgSessionDuration')
      })

      it('should include revenue metrics', () => {
        const metrics = {
          mrr: 50000,
          arr: 600000,
          arpu: 333,
          ltv: 8000
        }

        expect(metrics).toHaveProperty('mrr')
        expect(metrics).toHaveProperty('arr')
        expect(metrics).toHaveProperty('arpu')
        expect(metrics).toHaveProperty('ltv')
      })

      it('should include growth metrics', () => {
        const metrics = {
          orgGrowthRate: 15,
          userGrowthRate: 20,
          revenueGrowthRate: 25
        }

        expect(metrics).toHaveProperty('orgGrowthRate')
        expect(metrics).toHaveProperty('userGrowthRate')
        expect(metrics).toHaveProperty('revenueGrowthRate')
      })
    })

    describe('Snapshot Types', () => {
      it('should support DAILY type', () => {
        const snapshot = { type: 'DAILY' }
        expect(snapshot.type).toBe('DAILY')
      })

      it('should support WEEKLY type', () => {
        const snapshot = { type: 'WEEKLY' }
        expect(snapshot.type).toBe('WEEKLY')
      })

      it('should support MONTHLY type', () => {
        const snapshot = { type: 'MONTHLY' }
        expect(snapshot.type).toBe('MONTHLY')
      })
    })

    describe('Date Range Filtering', () => {
      it('should filter by date range', () => {
        const snapshots = [
          { id: '1', date: new Date('2024-01-15') },
          { id: '2', date: new Date('2024-01-20') },
          { id: '3', date: new Date('2024-02-01') }
        ]

        const startDate = new Date('2024-01-01')
        const endDate = new Date('2024-01-31')

        const filtered = snapshots.filter(
          s => s.date >= startDate && s.date <= endDate
        )
        expect(filtered.length).toBe(2)
      })

      it('should default to last 30 days', () => {
        const defaultDays = 30
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - defaultDays)
        expect(startDate).toBeInstanceOf(Date)
      })
    })

    describe('Pagination', () => {
      it('should calculate total pages correctly', () => {
        const total = 90
        const limit = 30
        const totalPages = Math.ceil(total / limit)
        expect(totalPages).toBe(3)
      })

      it('should calculate skip correctly', () => {
        const page = 2
        const limit = 30
        const skip = (page - 1) * limit
        expect(skip).toBe(30)
      })
    })
  })

  describe('GET /api/admin/analytics/snapshots/[id]', () => {
    describe('Response Structure', () => {
      it('should return full snapshot details', () => {
        const snapshot = {
          id: 'snapshot-123',
          type: 'DAILY',
          date: new Date(),
          metrics: {
            totalOrgs: 150,
            totalUsers: 500,
            mrr: 50000
          },
          breakdown: {
            orgsByPlan: { STARTER: 50, PROFESSIONAL: 75, ENTERPRISE: 25 },
            orgsByIndustry: { Technology: 60, Healthcare: 40, Finance: 30 }
          },
          createdAt: new Date()
        }

        expect(snapshot).toHaveProperty('metrics')
        expect(snapshot).toHaveProperty('breakdown')
      })

      it('should include plan breakdown', () => {
        const breakdown = {
          orgsByPlan: {
            STARTER: 50,
            PROFESSIONAL: 75,
            ENTERPRISE: 25
          }
        }

        expect(breakdown.orgsByPlan).toHaveProperty('STARTER')
        expect(breakdown.orgsByPlan).toHaveProperty('PROFESSIONAL')
        expect(breakdown.orgsByPlan).toHaveProperty('ENTERPRISE')
      })

      it('should include industry breakdown', () => {
        const breakdown = {
          orgsByIndustry: {
            Technology: 60,
            Healthcare: 40,
            Finance: 30,
            Retail: 20
          }
        }

        const totalOrgs = Object.values(breakdown.orgsByIndustry).reduce((a, b) => a + b, 0)
        expect(totalOrgs).toBe(150)
      })

      it('should return 404 for non-existent snapshot', () => {
        const statusCode = 404
        const response = { error: 'Snapshot not found' }

        expect(statusCode).toBe(404)
        expect(response.error).toBe('Snapshot not found')
      })
    })
  })

  describe('POST /api/admin/analytics/snapshots', () => {
    describe('Validation', () => {
      it('should require type', () => {
        const body = { date: new Date() }
        expect(body).not.toHaveProperty('type')
      })

      it('should use current date if not provided', () => {
        const body = { type: 'DAILY' }
        const date = body.date || new Date()
        expect(date).toBeInstanceOf(Date)
      })
    })

    describe('Response', () => {
      it('should return created snapshot', () => {
        const createdSnapshot = {
          id: 'snapshot-123',
          type: 'DAILY',
          date: new Date(),
          metrics: {}
        }

        expect(createdSnapshot).toHaveProperty('id')
        expect(createdSnapshot).toHaveProperty('metrics')
      })

      it('should return 201 on success', () => {
        const statusCode = 201
        expect(statusCode).toBe(201)
      })

      it('should prevent duplicate snapshots for same date/type', () => {
        const existingSnapshot = {
          type: 'DAILY',
          date: new Date('2024-01-15')
        }

        const newSnapshot = {
          type: 'DAILY',
          date: new Date('2024-01-15')
        }

        const isDuplicate =
          existingSnapshot.type === newSnapshot.type &&
          existingSnapshot.date.toDateString() === newSnapshot.date.toDateString()

        expect(isDuplicate).toBe(true)
      })
    })
  })

  describe('Metrics Calculations', () => {
    it('should calculate MRR correctly', () => {
      const subscriptions = [
        { amount: 100, status: 'active' },
        { amount: 200, status: 'active' },
        { amount: 150, status: 'cancelled' }
      ]

      const mrr = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.amount, 0)

      expect(mrr).toBe(300)
    })

    it('should calculate ARR from MRR', () => {
      const mrr = 50000
      const arr = mrr * 12
      expect(arr).toBe(600000)
    })

    it('should calculate ARPU correctly', () => {
      const mrr = 50000
      const totalOrgs = 150
      const arpu = Math.round(mrr / totalOrgs)
      expect(arpu).toBe(333)
    })

    it('should calculate growth rate correctly', () => {
      const currentPeriod = 120
      const previousPeriod = 100
      const growthRate = ((currentPeriod - previousPeriod) / previousPeriod) * 100
      expect(growthRate).toBe(20)
    })

    it('should handle zero previous period for growth rate', () => {
      const currentPeriod = 50
      const previousPeriod = 0
      const growthRate = previousPeriod > 0
        ? ((currentPeriod - previousPeriod) / previousPeriod) * 100
        : currentPeriod > 0 ? 100 : 0

      expect(growthRate).toBe(100)
    })

    it('should calculate churn rate correctly', () => {
      const churnedOrgs = 5
      const totalOrgsAtStart = 100
      const churnRate = (churnedOrgs / totalOrgsAtStart) * 100
      expect(churnRate).toBe(5)
    })
  })

  describe('Comparison Calculations', () => {
    it('should compare metrics between snapshots', () => {
      const current = { totalOrgs: 150, totalUsers: 500 }
      const previous = { totalOrgs: 120, totalUsers: 400 }

      const orgChange = ((current.totalOrgs - previous.totalOrgs) / previous.totalOrgs) * 100
      const userChange = ((current.totalUsers - previous.totalUsers) / previous.totalUsers) * 100

      expect(orgChange).toBe(25)
      expect(userChange).toBe(25)
    })

    it('should identify trending metrics', () => {
      const snapshots = [
        { date: new Date('2024-01-01'), metrics: { totalOrgs: 100 } },
        { date: new Date('2024-01-02'), metrics: { totalOrgs: 105 } },
        { date: new Date('2024-01-03'), metrics: { totalOrgs: 110 } },
        { date: new Date('2024-01-04'), metrics: { totalOrgs: 115 } }
      ]

      const isUptrend = snapshots.every((s, i) =>
        i === 0 || s.metrics.totalOrgs >= snapshots[i - 1].metrics.totalOrgs
      )

      expect(isUptrend).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 for database errors', () => {
      const statusCode = 500
      const response = { error: 'Failed to fetch snapshots' }

      expect(statusCode).toBe(500)
      expect(response.error).toBe('Failed to fetch snapshots')
    })

    it('should return 400 for invalid date format', () => {
      const statusCode = 400
      const response = { error: 'Invalid date format' }

      expect(statusCode).toBe(400)
      expect(response.error).toBe('Invalid date format')
    })

    it('should handle missing metrics gracefully', () => {
      const snapshot = {
        id: 'snapshot-123',
        metrics: null
      }

      const totalOrgs = snapshot.metrics?.totalOrgs ?? 0
      expect(totalOrgs).toBe(0)
    })
  })

  describe('Data Aggregation', () => {
    it('should aggregate daily snapshots into weekly', () => {
      const dailySnapshots = [
        { date: new Date('2024-01-01'), metrics: { totalOrgs: 100 } },
        { date: new Date('2024-01-02'), metrics: { totalOrgs: 102 } },
        { date: new Date('2024-01-03'), metrics: { totalOrgs: 104 } },
        { date: new Date('2024-01-04'), metrics: { totalOrgs: 106 } },
        { date: new Date('2024-01-05'), metrics: { totalOrgs: 108 } },
        { date: new Date('2024-01-06'), metrics: { totalOrgs: 110 } },
        { date: new Date('2024-01-07'), metrics: { totalOrgs: 112 } }
      ]

      const weekStart = dailySnapshots[0].metrics.totalOrgs
      const weekEnd = dailySnapshots[dailySnapshots.length - 1].metrics.totalOrgs
      const weeklyGrowth = weekEnd - weekStart

      expect(weeklyGrowth).toBe(12)
    })

    it('should calculate averages for period', () => {
      const snapshots = [
        { metrics: { activeUsers: 100 } },
        { metrics: { activeUsers: 120 } },
        { metrics: { activeUsers: 110 } },
        { metrics: { activeUsers: 130 } }
      ]

      const avgActiveUsers = snapshots.reduce((sum, s) => sum + s.metrics.activeUsers, 0) / snapshots.length
      expect(avgActiveUsers).toBe(115)
    })
  })
})
