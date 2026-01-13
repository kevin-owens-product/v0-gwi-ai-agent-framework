import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  changeNotifications,
  DEFAULT_ALERT_THRESHOLDS,
  createChangeAlert,
  checkThresholdsAndAlert,
  getChangeAlerts,
  getUnreadAlertCount,
  markAlertAsRead,
  markAllAlertsAsRead,
  dismissChangeAlert,
  generateChangeSummary,
  getChangeSummaries,
  type AlertThreshold,
} from './change-notifications'

// Mock Prisma
vi.mock('./db', () => ({
  prisma: {
    changeAlert: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    entityVersion: {
      findMany: vi.fn(),
    },
    changeSummary: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from './db'

describe('DEFAULT_ALERT_THRESHOLDS constant', () => {
  it('defines thresholds for brandHealth decrease', () => {
    const brandHealthThresholds = DEFAULT_ALERT_THRESHOLDS.filter(t => t.metric === 'brandHealth')
    expect(brandHealthThresholds).toHaveLength(2)
    expect(brandHealthThresholds.some(t => t.severity === 'WARNING')).toBe(true)
    expect(brandHealthThresholds.some(t => t.severity === 'CRITICAL')).toBe(true)
  })

  it('defines threshold for marketShare decrease', () => {
    const marketShareThreshold = DEFAULT_ALERT_THRESHOLDS.find(t => t.metric === 'marketShare')
    expect(marketShareThreshold).toBeDefined()
    expect(marketShareThreshold!.type).toBe('decrease')
    expect(marketShareThreshold!.isPercentage).toBe(true)
  })

  it('defines threshold for audience_size with both direction', () => {
    const audienceThreshold = DEFAULT_ALERT_THRESHOLDS.find(t => t.metric === 'audience_size')
    expect(audienceThreshold).toBeDefined()
    expect(audienceThreshold!.type).toBe('both')
  })

  it('defines threshold for nps decrease', () => {
    const npsThreshold = DEFAULT_ALERT_THRESHOLDS.find(t => t.metric === 'nps')
    expect(npsThreshold).toBeDefined()
    expect(npsThreshold!.severity).toBe('CRITICAL')
    expect(npsThreshold!.threshold).toBe(15)
  })
})

describe('ChangeNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createAlert', () => {
    it('creates a new alert with all parameters', async () => {
      const mockAlert = {
        id: 'alert-1',
        orgId: 'org-1',
        entityType: 'audience',
        entityId: 'entity-1',
        alertType: 'SIGNIFICANT_DECREASE',
        severity: 'WARNING',
        title: 'Brand Health decreased',
        message: 'Brand health dropped from 80 to 70',
        metric: 'brandHealth',
        previousValue: 80,
        currentValue: 70,
        changePercent: -0.125,
        threshold: 5,
        isRead: false,
        isDismissed: false,
        metadata: {},
        createdAt: new Date(),
      }

      vi.mocked(prisma.changeAlert.create).mockResolvedValue(mockAlert)

      const result = await changeNotifications.createAlert(
        'org-1',
        'audience',
        'entity-1',
        'SIGNIFICANT_DECREASE',
        {
          title: 'Brand Health decreased',
          message: 'Brand health dropped from 80 to 70',
          severity: 'WARNING',
          metric: 'brandHealth',
          previousValue: 80,
          currentValue: 70,
          changePercent: -0.125,
          threshold: 5,
        }
      )

      expect(result.alertType).toBe('SIGNIFICANT_DECREASE')
      expect(result.severity).toBe('WARNING')
      expect(result.metric).toBe('brandHealth')
    })

    it('uses INFO severity by default', async () => {
      const mockAlert = {
        id: 'alert-1',
        orgId: 'org-1',
        entityType: 'audience',
        entityId: 'entity-1',
        alertType: 'NEW_DATA_AVAILABLE',
        severity: 'INFO',
        title: 'Test',
        message: 'Test message',
        metric: null,
        previousValue: null,
        currentValue: null,
        changePercent: null,
        threshold: null,
        isRead: false,
        isDismissed: false,
        metadata: {},
        createdAt: new Date(),
      }

      vi.mocked(prisma.changeAlert.create).mockResolvedValue(mockAlert)

      const result = await changeNotifications.createAlert(
        'org-1',
        'audience',
        'entity-1',
        'NEW_DATA_AVAILABLE',
        {
          title: 'Test',
          message: 'Test message',
        }
      )

      expect(result.severity).toBe('INFO')
    })
  })

  describe('checkThresholdsAndAlert', () => {
    it('creates alerts when thresholds are exceeded', async () => {
      const mockAlert = {
        id: 'alert-1',
        orgId: 'org-1',
        entityType: 'brand_tracking',
        entityId: 'entity-1',
        alertType: 'SIGNIFICANT_DECREASE',
        severity: 'WARNING',
        title: 'brand Health decreased for Test Entity',
        message: 'Test Entity: brandHealth changed from 80 to 70 (-12.5%)',
        metric: 'brandHealth',
        previousValue: 80,
        currentValue: 70,
        changePercent: -0.125,
        threshold: 5,
        isRead: false,
        isDismissed: false,
        metadata: {},
        createdAt: new Date(),
      }

      vi.mocked(prisma.changeAlert.create).mockResolvedValue(mockAlert)

      const result = await changeNotifications.checkThresholdsAndAlert(
        'org-1',
        'brand_tracking',
        'entity-1',
        'Test Entity',
        {
          brandHealth: { previous: 80, current: 70 }, // 10 point decrease, exceeds 5 point threshold
        }
      )

      expect(result.length).toBeGreaterThan(0)
      expect(prisma.changeAlert.create).toHaveBeenCalled()
    })

    it('does not create alerts when thresholds are not exceeded', async () => {
      const result = await changeNotifications.checkThresholdsAndAlert(
        'org-1',
        'brand_tracking',
        'entity-1',
        'Test Entity',
        {
          brandHealth: { previous: 80, current: 78 }, // 2 point decrease, below 5 point threshold
        }
      )

      expect(result).toHaveLength(0)
      expect(prisma.changeAlert.create).not.toHaveBeenCalled()
    })

    it('creates alerts for percentage-based thresholds', async () => {
      const mockAlert = {
        id: 'alert-1',
        orgId: 'org-1',
        entityType: 'brand_tracking',
        entityId: 'entity-1',
        alertType: 'SIGNIFICANT_DECREASE',
        severity: 'WARNING',
        title: 'market Share decreased for Test Entity',
        message: 'Test Entity: marketShare changed from 0.5 to 0.4 (-20%)',
        metric: 'marketShare',
        previousValue: 0.5,
        currentValue: 0.4,
        changePercent: -0.2,
        threshold: 0.1,
        isRead: false,
        isDismissed: false,
        metadata: {},
        createdAt: new Date(),
      }

      vi.mocked(prisma.changeAlert.create).mockResolvedValue(mockAlert)

      const result = await changeNotifications.checkThresholdsAndAlert(
        'org-1',
        'brand_tracking',
        'entity-1',
        'Test Entity',
        {
          marketShare: { previous: 0.5, current: 0.4 }, // 20% decrease, exceeds 10% threshold
        }
      )

      expect(result.length).toBeGreaterThan(0)
    })

    it('creates alerts for increases when type is "both"', async () => {
      const mockAlert = {
        id: 'alert-1',
        orgId: 'org-1',
        entityType: 'audience',
        entityId: 'entity-1',
        alertType: 'SIGNIFICANT_INCREASE',
        severity: 'INFO',
        title: 'audience size increased for Test Audience',
        message: 'Test Audience: audience_size changed from 1000 to 1500 (+50%)',
        metric: 'audience_size',
        previousValue: 1000,
        currentValue: 1500,
        changePercent: 0.5,
        threshold: 0.2,
        isRead: false,
        isDismissed: false,
        metadata: {},
        createdAt: new Date(),
      }

      vi.mocked(prisma.changeAlert.create).mockResolvedValue(mockAlert)

      const result = await changeNotifications.checkThresholdsAndAlert(
        'org-1',
        'audience',
        'entity-1',
        'Test Audience',
        {
          audience_size: { previous: 1000, current: 1500 }, // 50% increase, exceeds 20% threshold
        }
      )

      expect(result.length).toBeGreaterThan(0)
    })

    it('handles multiple metrics at once', async () => {
      const mockAlert = {
        id: 'alert-1',
        orgId: 'org-1',
        entityType: 'brand_tracking',
        entityId: 'entity-1',
        alertType: 'SIGNIFICANT_DECREASE',
        severity: 'WARNING',
        title: 'Test',
        message: 'Test',
        metric: 'brandHealth',
        previousValue: 80,
        currentValue: 65,
        changePercent: -0.1875,
        threshold: 5,
        isRead: false,
        isDismissed: false,
        metadata: {},
        createdAt: new Date(),
      }

      vi.mocked(prisma.changeAlert.create).mockResolvedValue(mockAlert)

      await changeNotifications.checkThresholdsAndAlert(
        'org-1',
        'brand_tracking',
        'entity-1',
        'Test Entity',
        {
          brandHealth: { previous: 80, current: 65 }, // 15 point decrease - triggers 5 and 10 thresholds
          nps: { previous: 50, current: 30 }, // 20 point decrease - triggers 15 threshold
        }
      )

      // Should be called multiple times for multiple threshold violations
      expect(prisma.changeAlert.create).toHaveBeenCalled()
    })
  })

  describe('getAlerts', () => {
    it('returns alerts with default filters', async () => {
      const mockAlerts = [
        {
          id: 'alert-1',
          orgId: 'org-1',
          entityType: 'audience',
          entityId: 'entity-1',
          alertType: 'SIGNIFICANT_DECREASE',
          severity: 'WARNING',
          title: 'Test Alert',
          message: 'Test message',
          metric: 'brandHealth',
          previousValue: 80,
          currentValue: 70,
          changePercent: -0.125,
          threshold: 5,
          isRead: false,
          isDismissed: false,
          metadata: {},
          createdAt: new Date(),
        },
      ]

      vi.mocked(prisma.changeAlert.findMany).mockResolvedValue(mockAlerts)
      vi.mocked(prisma.changeAlert.count).mockResolvedValue(1)

      const result = await changeNotifications.getAlerts('org-1')

      expect(result.alerts).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('filters by alert types', async () => {
      vi.mocked(prisma.changeAlert.findMany).mockResolvedValue([])
      vi.mocked(prisma.changeAlert.count).mockResolvedValue(0)

      await changeNotifications.getAlerts('org-1', {
        alertTypes: ['SIGNIFICANT_DECREASE', 'THRESHOLD_CROSSED'],
      })

      expect(prisma.changeAlert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            alertType: { in: ['SIGNIFICANT_DECREASE', 'THRESHOLD_CROSSED'] },
          }),
        })
      )
    })

    it('filters by severities', async () => {
      vi.mocked(prisma.changeAlert.findMany).mockResolvedValue([])
      vi.mocked(prisma.changeAlert.count).mockResolvedValue(0)

      await changeNotifications.getAlerts('org-1', {
        severities: ['CRITICAL', 'WARNING'],
      })

      expect(prisma.changeAlert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            severity: { in: ['CRITICAL', 'WARNING'] },
          }),
        })
      )
    })

    it('excludes read alerts by default', async () => {
      vi.mocked(prisma.changeAlert.findMany).mockResolvedValue([])
      vi.mocked(prisma.changeAlert.count).mockResolvedValue(0)

      await changeNotifications.getAlerts('org-1')

      expect(prisma.changeAlert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isRead: false,
          }),
        })
      )
    })

    it('includes read alerts when specified', async () => {
      vi.mocked(prisma.changeAlert.findMany).mockResolvedValue([])
      vi.mocked(prisma.changeAlert.count).mockResolvedValue(0)

      await changeNotifications.getAlerts('org-1', { includeRead: true })

      expect(prisma.changeAlert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            isRead: false,
          }),
        })
      )
    })

    it('filters by date range', async () => {
      vi.mocked(prisma.changeAlert.findMany).mockResolvedValue([])
      vi.mocked(prisma.changeAlert.count).mockResolvedValue(0)

      await changeNotifications.getAlerts('org-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      })

      expect(prisma.changeAlert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-12-31'),
            },
          }),
        })
      )
    })
  })

  describe('getUnreadAlertCount', () => {
    it('returns count of unread, undismissed alerts', async () => {
      vi.mocked(prisma.changeAlert.count).mockResolvedValue(5)

      const result = await changeNotifications.getUnreadAlertCount('org-1')

      expect(result).toBe(5)
      expect(prisma.changeAlert.count).toHaveBeenCalledWith({
        where: { orgId: 'org-1', isRead: false, isDismissed: false },
      })
    })
  })

  describe('markAsRead', () => {
    it('marks a single alert as read', async () => {
      vi.mocked(prisma.changeAlert.update).mockResolvedValue({} as any)

      await changeNotifications.markAsRead('alert-1')

      expect(prisma.changeAlert.update).toHaveBeenCalledWith({
        where: { id: 'alert-1' },
        data: { isRead: true },
      })
    })
  })

  describe('markAllAsRead', () => {
    it('marks all alerts as read for an organization', async () => {
      vi.mocked(prisma.changeAlert.updateMany).mockResolvedValue({ count: 10 })

      const result = await changeNotifications.markAllAsRead('org-1')

      expect(result).toBe(10)
      expect(prisma.changeAlert.updateMany).toHaveBeenCalledWith({
        where: { orgId: 'org-1', isRead: false },
        data: { isRead: true },
      })
    })
  })

  describe('dismissAlert', () => {
    it('dismisses a single alert', async () => {
      vi.mocked(prisma.changeAlert.update).mockResolvedValue({} as any)

      await changeNotifications.dismissAlert('alert-1')

      expect(prisma.changeAlert.update).toHaveBeenCalledWith({
        where: { id: 'alert-1' },
        data: { isDismissed: true },
      })
    })
  })

  describe('generateChangeSummary', () => {
    it('generates a change summary for a period', async () => {
      const mockVersions = [
        {
          id: 'v1',
          entityType: 'audience',
          entityId: 'e1',
          version: 1,
          data: { name: 'Audience 1' },
          delta: null,
          changedFields: [],
          changeType: 'CREATE',
          changeSummary: 'Created',
          createdAt: new Date(),
        },
        {
          id: 'v2',
          entityType: 'audience',
          entityId: 'e2',
          version: 2,
          data: { name: 'Audience 2' },
          delta: { hasSignificantChanges: true, summary: 'Major change' },
          changedFields: ['name'],
          changeType: 'UPDATE',
          changeSummary: 'Updated',
          createdAt: new Date(),
        },
      ]

      const mockSummary = {
        id: 'summary-1',
        orgId: 'org-1',
        period: 'daily',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-02'),
        summaryType: 'overview',
        metrics: {},
        highlights: [],
        newItems: 1,
        updatedItems: 1,
        deletedItems: 0,
        significantChanges: 1,
        topChanges: [],
        createdAt: new Date(),
      }

      vi.mocked(prisma.entityVersion.findMany).mockResolvedValue(mockVersions)
      vi.mocked(prisma.changeAlert.count).mockResolvedValue(0)
      vi.mocked(prisma.changeSummary.upsert).mockResolvedValue(mockSummary)

      const result = await changeNotifications.generateChangeSummary(
        'org-1',
        'daily',
        new Date('2024-01-01'),
        new Date('2024-01-02')
      )

      expect(result.newItems).toBe(1)
      expect(result.updatedItems).toBe(1)
      expect(result.period).toBe('daily')
    })

    it('identifies significant changes', async () => {
      const mockVersions = [
        {
          id: 'v1',
          entityType: 'audience',
          entityId: 'e1',
          version: 2,
          data: { name: 'Audience 1' },
          delta: { hasSignificantChanges: true },
          changedFields: ['size'],
          changeType: 'UPDATE',
          changeSummary: 'size increased',
          createdAt: new Date(),
        },
        {
          id: 'v2',
          entityType: 'crosstab',
          entityId: 'e2',
          version: 2,
          data: { name: 'Crosstab 1' },
          delta: { hasSignificantChanges: true },
          changedFields: ['filters'],
          changeType: 'UPDATE',
          changeSummary: 'filters changed',
          createdAt: new Date(),
        },
      ]

      const mockSummary = {
        id: 'summary-1',
        orgId: 'org-1',
        period: 'weekly',
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date('2024-01-07'),
        summaryType: 'overview',
        metrics: {},
        highlights: [{ type: 'significant_changes', title: '2 significant changes', description: '' }],
        newItems: 0,
        updatedItems: 2,
        deletedItems: 0,
        significantChanges: 2,
        topChanges: [],
        createdAt: new Date(),
      }

      vi.mocked(prisma.entityVersion.findMany).mockResolvedValue(mockVersions)
      vi.mocked(prisma.changeAlert.count).mockResolvedValue(0)
      vi.mocked(prisma.changeSummary.upsert).mockResolvedValue(mockSummary)

      const result = await changeNotifications.generateChangeSummary(
        'org-1',
        'weekly',
        new Date('2024-01-01'),
        new Date('2024-01-07')
      )

      expect(result.significantChanges).toBe(2)
    })

    it('includes critical alerts in highlights', async () => {
      vi.mocked(prisma.entityVersion.findMany).mockResolvedValue([])
      vi.mocked(prisma.changeAlert.count).mockResolvedValue(3)
      vi.mocked(prisma.changeSummary.upsert).mockResolvedValue({
        id: 'summary-1',
        orgId: 'org-1',
        period: 'daily',
        periodStart: new Date(),
        periodEnd: new Date(),
        summaryType: 'overview',
        metrics: {},
        highlights: [{ type: 'critical_alerts', title: '3 critical alerts', description: '' }],
        newItems: 0,
        updatedItems: 0,
        deletedItems: 0,
        significantChanges: 0,
        topChanges: [],
        createdAt: new Date(),
      })

      const result = await changeNotifications.generateChangeSummary(
        'org-1',
        'daily',
        new Date(),
        new Date()
      )

      expect(prisma.changeAlert.count).toHaveBeenCalled()
    })
  })

  describe('getChangeSummaries', () => {
    it('returns existing summaries', async () => {
      const mockSummaries = [
        {
          id: 'summary-1',
          orgId: 'org-1',
          period: 'daily',
          periodStart: new Date('2024-01-02'),
          periodEnd: new Date('2024-01-03'),
          summaryType: 'overview',
          metrics: {},
          highlights: [],
          newItems: 5,
          updatedItems: 10,
          deletedItems: 0,
          significantChanges: 3,
          topChanges: [],
          createdAt: new Date(),
        },
        {
          id: 'summary-2',
          orgId: 'org-1',
          period: 'daily',
          periodStart: new Date('2024-01-01'),
          periodEnd: new Date('2024-01-02'),
          summaryType: 'overview',
          metrics: {},
          highlights: [],
          newItems: 3,
          updatedItems: 8,
          deletedItems: 1,
          significantChanges: 2,
          topChanges: [],
          createdAt: new Date(),
        },
      ]

      vi.mocked(prisma.changeSummary.findMany).mockResolvedValue(mockSummaries)

      const result = await changeNotifications.getChangeSummaries('org-1')

      expect(result).toHaveLength(2)
      expect(result[0].newItems).toBe(5)
    })

    it('filters by period', async () => {
      vi.mocked(prisma.changeSummary.findMany).mockResolvedValue([])

      await changeNotifications.getChangeSummaries('org-1', { period: 'weekly' })

      expect(prisma.changeSummary.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            period: 'weekly',
          }),
        })
      )
    })

    it('filters by summary type', async () => {
      vi.mocked(prisma.changeSummary.findMany).mockResolvedValue([])

      await changeNotifications.getChangeSummaries('org-1', { summaryType: 'detailed' })

      expect(prisma.changeSummary.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            summaryType: 'detailed',
          }),
        })
      )
    })
  })
})

describe('Convenience Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createChangeAlert delegates correctly', async () => {
    const mockAlert = {
      id: 'alert-1',
      orgId: 'org-1',
      entityType: 'audience',
      entityId: 'entity-1',
      alertType: 'THRESHOLD_CROSSED',
      severity: 'INFO',
      title: 'Test',
      message: 'Test message',
      metric: null,
      previousValue: null,
      currentValue: null,
      changePercent: null,
      threshold: null,
      isRead: false,
      isDismissed: false,
      metadata: {},
      createdAt: new Date(),
    }

    vi.mocked(prisma.changeAlert.create).mockResolvedValue(mockAlert)

    const result = await createChangeAlert(
      'org-1',
      'audience',
      'entity-1',
      'THRESHOLD_CROSSED',
      { title: 'Test', message: 'Test message' }
    )

    expect(result.alertType).toBe('THRESHOLD_CROSSED')
  })

  it('getChangeAlerts delegates correctly', async () => {
    vi.mocked(prisma.changeAlert.findMany).mockResolvedValue([])
    vi.mocked(prisma.changeAlert.count).mockResolvedValue(0)

    const result = await getChangeAlerts('org-1')

    expect(result.alerts).toHaveLength(0)
  })

  it('getUnreadAlertCount delegates correctly', async () => {
    vi.mocked(prisma.changeAlert.count).mockResolvedValue(7)

    const result = await getUnreadAlertCount('org-1')

    expect(result).toBe(7)
  })

  it('markAlertAsRead delegates correctly', async () => {
    vi.mocked(prisma.changeAlert.update).mockResolvedValue({} as any)

    await markAlertAsRead('alert-1')

    expect(prisma.changeAlert.update).toHaveBeenCalled()
  })

  it('markAllAlertsAsRead delegates correctly', async () => {
    vi.mocked(prisma.changeAlert.updateMany).mockResolvedValue({ count: 5 })

    const result = await markAllAlertsAsRead('org-1')

    expect(result).toBe(5)
  })

  it('dismissChangeAlert delegates correctly', async () => {
    vi.mocked(prisma.changeAlert.update).mockResolvedValue({} as any)

    await dismissChangeAlert('alert-1')

    expect(prisma.changeAlert.update).toHaveBeenCalled()
  })

  it('generateChangeSummary delegates correctly', async () => {
    vi.mocked(prisma.entityVersion.findMany).mockResolvedValue([])
    vi.mocked(prisma.changeAlert.count).mockResolvedValue(0)
    vi.mocked(prisma.changeSummary.upsert).mockResolvedValue({
      id: 'summary-1',
      orgId: 'org-1',
      period: 'daily',
      periodStart: new Date(),
      periodEnd: new Date(),
      summaryType: 'overview',
      metrics: {},
      highlights: [],
      newItems: 0,
      updatedItems: 0,
      deletedItems: 0,
      significantChanges: 0,
      topChanges: [],
      createdAt: new Date(),
    })

    const result = await generateChangeSummary('org-1', 'daily', new Date(), new Date())

    expect(result.period).toBe('daily')
  })

  it('getChangeSummaries delegates correctly', async () => {
    vi.mocked(prisma.changeSummary.findMany).mockResolvedValue([])

    const result = await getChangeSummaries('org-1')

    expect(result).toHaveLength(0)
  })
})
