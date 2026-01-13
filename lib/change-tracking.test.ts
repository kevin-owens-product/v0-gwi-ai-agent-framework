import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  changeTracking,
  SIGNIFICANCE_THRESHOLDS,
  captureEntityVersion,
  getEntityVersionHistory,
  compareEntityVersions,
  getChangeTimeline,
  getNewItemsSince,
  trackUserVisit,
  getUnseenChangesCount,
  type VersionedEntityType,
  type EntityDelta,
} from './change-tracking'

// Mock Prisma
vi.mock('./db', () => ({
  prisma: {
    entityVersion: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    userChangeTracker: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

import { prisma } from './db'

describe('SIGNIFICANCE_THRESHOLDS constant', () => {
  it('defines thresholds for key metrics', () => {
    expect(SIGNIFICANCE_THRESHOLDS).toHaveProperty('audience_size')
    expect(SIGNIFICANCE_THRESHOLDS).toHaveProperty('brand_health')
    expect(SIGNIFICANCE_THRESHOLDS).toHaveProperty('market_share')
    expect(SIGNIFICANCE_THRESHOLDS).toHaveProperty('nps')
    expect(SIGNIFICANCE_THRESHOLDS).toHaveProperty('sentiment')
    expect(SIGNIFICANCE_THRESHOLDS).toHaveProperty('default')
  })

  it('has relative threshold for audience_size', () => {
    expect(SIGNIFICANCE_THRESHOLDS.audience_size.relative?.threshold).toBe(0.10)
  })

  it('has absolute threshold for brand_health', () => {
    expect(SIGNIFICANCE_THRESHOLDS.brand_health.absolute?.min).toBe(5)
  })

  it('has absolute threshold for nps', () => {
    expect(SIGNIFICANCE_THRESHOLDS.nps.absolute?.min).toBe(10)
  })

  it('has default relative threshold of 10%', () => {
    expect(SIGNIFICANCE_THRESHOLDS.default.relative?.threshold).toBe(0.10)
  })
})

describe('ChangeTrackingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('computeDelta', () => {
    it('detects added fields', () => {
      const oldData = { name: 'Test' }
      const newData = { name: 'Test', description: 'Added' }

      const delta = changeTracking.computeDelta(oldData, newData, 'audience')

      expect(delta.fields).toHaveLength(1)
      expect(delta.fields[0]).toEqual({
        field: 'description',
        oldValue: undefined,
        newValue: 'Added',
        changeType: 'added',
        isSignificant: true,
      })
    })

    it('detects removed fields', () => {
      const oldData = { name: 'Test', description: 'Removed' }
      const newData = { name: 'Test' }

      const delta = changeTracking.computeDelta(oldData, newData, 'audience')

      expect(delta.fields).toHaveLength(1)
      expect(delta.fields[0]).toEqual({
        field: 'description',
        oldValue: 'Removed',
        newValue: undefined,
        changeType: 'removed',
        isSignificant: true,
      })
    })

    it('detects modified fields', () => {
      const oldData = { name: 'Old Name' }
      const newData = { name: 'New Name' }

      const delta = changeTracking.computeDelta(oldData, newData, 'audience')

      expect(delta.fields).toHaveLength(1)
      expect(delta.fields[0].field).toBe('name')
      expect(delta.fields[0].changeType).toBe('modified')
      expect(delta.fields[0].oldValue).toBe('Old Name')
      expect(delta.fields[0].newValue).toBe('New Name')
    })

    it('ignores updatedAt, createdAt, id, and orgId fields', () => {
      const oldData = {
        name: 'Test',
        updatedAt: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        id: 'id1',
        orgId: 'org1',
      }
      const newData = {
        name: 'Test',
        updatedAt: new Date('2024-01-02'),
        createdAt: new Date('2024-01-02'),
        id: 'id2',
        orgId: 'org2',
      }

      const delta = changeTracking.computeDelta(oldData, newData, 'audience')

      expect(delta.fields).toHaveLength(0)
    })

    it('identifies significant numeric changes based on threshold', () => {
      const oldData = { audience_size: 1000 }
      const newData = { audience_size: 1200 } // 20% increase, significant

      const delta = changeTracking.computeDelta(oldData, newData, 'audience')

      expect(delta.fields[0].isSignificant).toBe(true)
      expect(delta.fields[0].changePercent).toBe(0.2)
    })

    it('identifies non-significant numeric changes', () => {
      const oldData = { audience_size: 1000 }
      const newData = { audience_size: 1050 } // 5% increase, not significant (threshold is 10%)

      const delta = changeTracking.computeDelta(oldData, newData, 'audience')

      expect(delta.fields[0].isSignificant).toBe(false)
      expect(delta.fields[0].changePercent).toBeCloseTo(0.05)
    })

    it('returns hasSignificantChanges true when at least one field is significant', () => {
      const oldData = { name: 'Old', size: 100 }
      const newData = { name: 'New', size: 100 }

      const delta = changeTracking.computeDelta(oldData, newData, 'audience')

      expect(delta.hasSignificantChanges).toBe(true)
    })

    it('generates a summary for changes', () => {
      const oldData = { size: 100 }
      const newData = { size: 150 } // significant change

      const delta = changeTracking.computeDelta(oldData, newData, 'audience')

      expect(delta.summary).toContain('size')
    })

    it('handles no changes', () => {
      const oldData = { name: 'Test', value: 42 }
      const newData = { name: 'Test', value: 42 }

      const delta = changeTracking.computeDelta(oldData, newData, 'audience')

      expect(delta.fields).toHaveLength(0)
      expect(delta.summary).toBe('No changes detected')
    })

    it('handles deep object comparison', () => {
      const oldData = { config: { a: 1, b: 2 } }
      const newData = { config: { a: 1, b: 3 } }

      const delta = changeTracking.computeDelta(oldData, newData, 'audience')

      expect(delta.fields).toHaveLength(1)
      expect(delta.fields[0].field).toBe('config')
      expect(delta.fields[0].changeType).toBe('modified')
    })
  })

  describe('captureVersion', () => {
    it('creates a new version with initial version number 1', async () => {
      const mockEntityVersion = {
        id: 'version-1',
        orgId: 'org-1',
        entityType: 'audience',
        entityId: 'entity-1',
        version: 1,
        data: { name: 'Test Audience' },
        delta: null,
        changedFields: [],
        changeType: 'CREATE',
        changeSummary: 'Created audience: Test Audience',
        createdBy: 'user-1',
        createdAt: new Date(),
      }

      vi.mocked(prisma.entityVersion.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.entityVersion.create).mockResolvedValue(mockEntityVersion)

      const result = await changeTracking.captureVersion(
        'org-1',
        'audience',
        'entity-1',
        { name: 'Test Audience' },
        'CREATE',
        'user-1'
      )

      expect(result.version).toBe(1)
      expect(result.changeType).toBe('CREATE')
      expect(result.changeSummary).toContain('Created audience')
    })

    it('increments version number for subsequent captures', async () => {
      const existingVersion = {
        id: 'version-1',
        orgId: 'org-1',
        entityType: 'audience',
        entityId: 'entity-1',
        version: 2,
        data: { name: 'Old Name' },
        delta: null,
        changedFields: [],
        changeType: 'UPDATE' as const,
        changeSummary: null,
        createdBy: null,
        createdAt: new Date(),
      }

      const newVersion = {
        ...existingVersion,
        id: 'version-2',
        version: 3,
        data: { name: 'New Name' },
        delta: { fields: [], changedFieldNames: [], hasSignificantChanges: false, summary: '' },
      }

      vi.mocked(prisma.entityVersion.findFirst).mockResolvedValue(existingVersion)
      vi.mocked(prisma.entityVersion.create).mockResolvedValue(newVersion)

      const result = await changeTracking.captureVersion(
        'org-1',
        'audience',
        'entity-1',
        { name: 'New Name' },
        'UPDATE'
      )

      expect(result.version).toBe(3)
    })

    it('computes delta for UPDATE operations', async () => {
      const existingVersion = {
        id: 'version-1',
        orgId: 'org-1',
        entityType: 'audience',
        entityId: 'entity-1',
        version: 1,
        data: { name: 'Old', size: 100 },
        delta: null,
        changedFields: [],
        changeType: 'CREATE' as const,
        changeSummary: null,
        createdBy: null,
        createdAt: new Date(),
      }

      vi.mocked(prisma.entityVersion.findFirst).mockResolvedValue(existingVersion)
      vi.mocked(prisma.entityVersion.create).mockImplementation(async (args) => ({
        id: 'version-2',
        orgId: args.data.orgId as string,
        entityType: args.data.entityType as string,
        entityId: args.data.entityId as string,
        version: args.data.version as number,
        data: args.data.data,
        delta: args.data.delta,
        changedFields: args.data.changedFields as string[],
        changeType: args.data.changeType as 'UPDATE',
        changeSummary: args.data.changeSummary as string,
        createdBy: args.data.createdBy as string | null,
        createdAt: new Date(),
      }))

      const result = await changeTracking.captureVersion(
        'org-1',
        'audience',
        'entity-1',
        { name: 'New', size: 150 },
        'UPDATE'
      )

      expect(result.delta).not.toBeNull()
      expect(result.changeSummary).toBeTruthy()
    })
  })

  describe('getVersionHistory', () => {
    it('returns version history with pagination', async () => {
      const mockVersions = [
        {
          id: 'v2',
          orgId: 'org-1',
          entityType: 'audience',
          entityId: 'entity-1',
          version: 2,
          data: { name: 'Updated' },
          delta: null,
          changedFields: [],
          changeType: 'UPDATE' as const,
          changeSummary: null,
          createdBy: null,
          createdAt: new Date(),
        },
        {
          id: 'v1',
          orgId: 'org-1',
          entityType: 'audience',
          entityId: 'entity-1',
          version: 1,
          data: { name: 'Created' },
          delta: null,
          changedFields: [],
          changeType: 'CREATE' as const,
          changeSummary: null,
          createdBy: null,
          createdAt: new Date(),
        },
      ]

      vi.mocked(prisma.entityVersion.findMany).mockResolvedValue(mockVersions)
      vi.mocked(prisma.entityVersion.count).mockResolvedValue(2)

      const result = await changeTracking.getVersionHistory('audience', 'entity-1')

      expect(result.versions).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.versions[0].version).toBe(2)
    })

    it('supports date filters', async () => {
      vi.mocked(prisma.entityVersion.findMany).mockResolvedValue([])
      vi.mocked(prisma.entityVersion.count).mockResolvedValue(0)

      await changeTracking.getVersionHistory('audience', 'entity-1', {
        before: new Date('2024-12-31'),
        after: new Date('2024-01-01'),
      })

      expect(prisma.entityVersion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              lt: new Date('2024-12-31'),
              gt: new Date('2024-01-01'),
            },
          }),
        })
      )
    })
  })

  describe('compareVersions', () => {
    it('compares two versions and returns delta', async () => {
      const v1 = {
        id: 'v1',
        orgId: 'org-1',
        entityType: 'audience',
        entityId: 'entity-1',
        version: 1,
        data: { name: 'First', size: 100 },
        delta: null,
        changedFields: [],
        changeType: 'CREATE' as const,
        changeSummary: null,
        createdBy: null,
        createdAt: new Date('2024-01-01'),
      }

      const v2 = {
        ...v1,
        id: 'v2',
        version: 2,
        data: { name: 'Second', size: 200 },
        createdAt: new Date('2024-01-02'),
      }

      vi.mocked(prisma.entityVersion.findFirst)
        .mockResolvedValueOnce(v1)
        .mockResolvedValueOnce(v2)

      const result = await changeTracking.compareVersions('audience', 'entity-1', 1, 2)

      expect(result).not.toBeNull()
      expect(result!.before.version).toBe(1)
      expect(result!.after.version).toBe(2)
      expect(result!.delta.changedFieldNames).toContain('name')
      expect(result!.delta.changedFieldNames).toContain('size')
    })

    it('returns null if either version is not found', async () => {
      vi.mocked(prisma.entityVersion.findFirst)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const result = await changeTracking.compareVersions('audience', 'entity-1', 1, 2)

      expect(result).toBeNull()
    })

    it('correctly orders versions regardless of parameter order', async () => {
      const v1 = {
        id: 'v1',
        orgId: 'org-1',
        entityType: 'audience',
        entityId: 'entity-1',
        version: 1,
        data: { name: 'First' },
        delta: null,
        changedFields: [],
        changeType: 'CREATE' as const,
        changeSummary: null,
        createdBy: null,
        createdAt: new Date('2024-01-01'),
      }

      const v2 = {
        ...v1,
        id: 'v2',
        version: 2,
        data: { name: 'Second' },
        createdAt: new Date('2024-01-02'),
      }

      // Pass v2 first, v1 second
      vi.mocked(prisma.entityVersion.findFirst)
        .mockResolvedValueOnce(v2)
        .mockResolvedValueOnce(v1)

      const result = await changeTracking.compareVersions('audience', 'entity-1', 2, 1)

      expect(result!.before.version).toBe(1)
      expect(result!.after.version).toBe(2)
    })
  })

  describe('getLatestVersion', () => {
    it('returns the latest version', async () => {
      const mockVersion = {
        id: 'v3',
        orgId: 'org-1',
        entityType: 'audience',
        entityId: 'entity-1',
        version: 3,
        data: { name: 'Latest' },
        delta: null,
        changedFields: [],
        changeType: 'UPDATE' as const,
        changeSummary: null,
        createdBy: null,
        createdAt: new Date(),
      }

      vi.mocked(prisma.entityVersion.findFirst).mockResolvedValue(mockVersion)

      const result = await changeTracking.getLatestVersion('audience', 'entity-1')

      expect(result).not.toBeNull()
      expect(result!.version).toBe(3)
    })

    it('returns null if no versions exist', async () => {
      vi.mocked(prisma.entityVersion.findFirst).mockResolvedValue(null)

      const result = await changeTracking.getLatestVersion('audience', 'entity-1')

      expect(result).toBeNull()
    })
  })

  describe('getChangeTimeline', () => {
    it('returns changes timeline for an organization', async () => {
      const mockVersions = [
        {
          id: 'v1',
          orgId: 'org-1',
          entityType: 'audience',
          entityId: 'entity-1',
          version: 2,
          data: { name: 'Updated' },
          delta: { hasSignificantChanges: true },
          changedFields: ['name'],
          changeType: 'UPDATE' as const,
          changeSummary: 'name changed',
          createdBy: 'user-1',
          createdAt: new Date(),
        },
      ]

      vi.mocked(prisma.entityVersion.findMany).mockResolvedValue(mockVersions)
      vi.mocked(prisma.entityVersion.count).mockResolvedValue(1)

      const result = await changeTracking.getChangeTimeline('org-1')

      expect(result.changes).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('filters by entity types', async () => {
      vi.mocked(prisma.entityVersion.findMany).mockResolvedValue([])
      vi.mocked(prisma.entityVersion.count).mockResolvedValue(0)

      await changeTracking.getChangeTimeline('org-1', {
        entityTypes: ['audience', 'crosstab'],
      })

      expect(prisma.entityVersion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            entityType: { in: ['audience', 'crosstab'] },
          }),
        })
      )
    })

    it('filters by date range', async () => {
      vi.mocked(prisma.entityVersion.findMany).mockResolvedValue([])
      vi.mocked(prisma.entityVersion.count).mockResolvedValue(0)

      await changeTracking.getChangeTimeline('org-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      })

      expect(prisma.entityVersion.findMany).toHaveBeenCalledWith(
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

    it('filters significant changes only', async () => {
      const mockVersions = [
        {
          id: 'v1',
          entityType: 'audience',
          entityId: 'e1',
          version: 2,
          data: { name: 'Test' },
          delta: { hasSignificantChanges: true },
          changedFields: ['name'],
          changeType: 'UPDATE' as const,
          changeSummary: 'significant',
          createdBy: null,
          createdAt: new Date(),
        },
        {
          id: 'v2',
          entityType: 'audience',
          entityId: 'e2',
          version: 2,
          data: { name: 'Test2' },
          delta: { hasSignificantChanges: false },
          changedFields: ['name'],
          changeType: 'UPDATE' as const,
          changeSummary: 'minor',
          createdBy: null,
          createdAt: new Date(),
        },
      ]

      vi.mocked(prisma.entityVersion.findMany).mockResolvedValue(mockVersions)
      vi.mocked(prisma.entityVersion.count).mockResolvedValue(2)

      const result = await changeTracking.getChangeTimeline('org-1', {
        significantOnly: true,
      })

      expect(result.changes).toHaveLength(1)
      expect(result.changes[0].isSignificant).toBe(true)
    })
  })

  describe('getNewItemsSince', () => {
    it('returns new items grouped by entity type', async () => {
      const mockItems = [
        {
          id: 'v1',
          orgId: 'org-1',
          entityType: 'audience',
          entityId: 'aud-1',
          version: 1,
          data: { name: 'Audience 1' },
          delta: null,
          changedFields: [],
          changeType: 'CREATE' as const,
          changeSummary: null,
          createdBy: null,
          createdAt: new Date(),
        },
        {
          id: 'v2',
          orgId: 'org-1',
          entityType: 'audience',
          entityId: 'aud-2',
          version: 1,
          data: { name: 'Audience 2' },
          delta: null,
          changedFields: [],
          changeType: 'CREATE' as const,
          changeSummary: null,
          createdBy: null,
          createdAt: new Date(),
        },
        {
          id: 'v3',
          orgId: 'org-1',
          entityType: 'crosstab',
          entityId: 'ct-1',
          version: 1,
          data: { title: 'Crosstab 1' },
          delta: null,
          changedFields: [],
          changeType: 'CREATE' as const,
          changeSummary: null,
          createdBy: null,
          createdAt: new Date(),
        },
      ]

      vi.mocked(prisma.entityVersion.findMany).mockResolvedValue(mockItems)

      const result = await changeTracking.getNewItemsSince('org-1', new Date('2024-01-01'))

      expect(result).toHaveLength(2)
      const audienceSummary = result.find(r => r.entityType === 'audience')
      const crosstabSummary = result.find(r => r.entityType === 'crosstab')

      expect(audienceSummary!.count).toBe(2)
      expect(crosstabSummary!.count).toBe(1)
    })
  })

  describe('user tracking', () => {
    it('tracks user visit', async () => {
      vi.mocked(prisma.userChangeTracker.upsert).mockResolvedValue({
        id: 'tracker-1',
        orgId: 'org-1',
        userId: 'user-1',
        lastVisit: new Date(),
        lastSeenChanges: null,
      })

      await changeTracking.trackUserVisit('org-1', 'user-1')

      expect(prisma.userChangeTracker.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orgId_userId: { orgId: 'org-1', userId: 'user-1' } },
        })
      )
    })

    it('gets unseen changes count', async () => {
      vi.mocked(prisma.userChangeTracker.findUnique).mockResolvedValue({
        id: 'tracker-1',
        orgId: 'org-1',
        userId: 'user-1',
        lastVisit: new Date(),
        lastSeenChanges: new Date('2024-01-01'),
      })
      vi.mocked(prisma.entityVersion.count).mockResolvedValue(5)

      const result = await changeTracking.getUnseenChangesCount('org-1', 'user-1')

      expect(result).toBe(5)
    })

    it('returns all changes as unseen if no tracker exists', async () => {
      vi.mocked(prisma.userChangeTracker.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.entityVersion.count).mockResolvedValue(10)

      const result = await changeTracking.getUnseenChangesCount('org-1', 'user-1')

      expect(result).toBe(10)
    })
  })
})

describe('Convenience Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('captureEntityVersion delegates to changeTracking', async () => {
    const mockVersion = {
      id: 'v1',
      orgId: 'org-1',
      entityType: 'audience',
      entityId: 'entity-1',
      version: 1,
      data: { name: 'Test' },
      delta: null,
      changedFields: [],
      changeType: 'CREATE' as const,
      changeSummary: 'Created',
      createdBy: 'user-1',
      createdAt: new Date(),
    }

    vi.mocked(prisma.entityVersion.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.entityVersion.create).mockResolvedValue(mockVersion)

    const result = await captureEntityVersion(
      'org-1',
      'audience',
      'entity-1',
      { name: 'Test' },
      'CREATE',
      'user-1'
    )

    expect(result.version).toBe(1)
  })

  it('getEntityVersionHistory delegates correctly', async () => {
    vi.mocked(prisma.entityVersion.findMany).mockResolvedValue([])
    vi.mocked(prisma.entityVersion.count).mockResolvedValue(0)

    const result = await getEntityVersionHistory('audience', 'entity-1', { limit: 10 })

    expect(result.versions).toHaveLength(0)
    expect(result.total).toBe(0)
  })

  it('getChangeTimeline delegates correctly', async () => {
    vi.mocked(prisma.entityVersion.findMany).mockResolvedValue([])
    vi.mocked(prisma.entityVersion.count).mockResolvedValue(0)

    const result = await getChangeTimeline('org-1', { limit: 20 })

    expect(result.changes).toHaveLength(0)
  })

  it('getNewItemsSince delegates correctly', async () => {
    vi.mocked(prisma.entityVersion.findMany).mockResolvedValue([])

    const result = await getNewItemsSince('org-1', new Date())

    expect(result).toHaveLength(0)
  })

  it('trackUserVisit delegates correctly', async () => {
    vi.mocked(prisma.userChangeTracker.upsert).mockResolvedValue({
      id: 'tracker-1',
      orgId: 'org-1',
      userId: 'user-1',
      lastVisit: new Date(),
      lastSeenChanges: null,
    })

    await trackUserVisit('org-1', 'user-1')

    expect(prisma.userChangeTracker.upsert).toHaveBeenCalled()
  })

  it('getUnseenChangesCount delegates correctly', async () => {
    vi.mocked(prisma.userChangeTracker.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.entityVersion.count).mockResolvedValue(5)

    const result = await getUnseenChangesCount('org-1', 'user-1')

    expect(result).toBe(5)
  })
})
