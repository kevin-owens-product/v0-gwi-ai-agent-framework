/**
 * @prompt-id forge-v4.1:feature:admin-activity:010
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma before imports
vi.mock('./db', () => ({
  prisma: {
    adminActivity: {
      create: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
    superAdmin: {
      findMany: vi.fn(),
    },
  },
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === 'x-forwarded-for') return '192.168.1.1'
      if (name === 'user-agent') return 'Test User Agent'
      return null
    }),
  })),
}))

import {
  logAdminActivity,
  withActivityTracking,
  getActivityStats,
  getRecentActivities,
  AdminActivityAction,
  AdminResourceType,
} from './admin-activity'
import { prisma } from './db'

describe('Admin Activity Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AdminActivityAction', () => {
    it('should have all expected action types', () => {
      expect(AdminActivityAction.USER_CREATE).toBe('user.create')
      expect(AdminActivityAction.USER_UPDATE).toBe('user.update')
      expect(AdminActivityAction.USER_DELETE).toBe('user.delete')
      expect(AdminActivityAction.TENANT_CREATE).toBe('tenant.create')
      expect(AdminActivityAction.TENANT_SUSPEND).toBe('tenant.suspend')
      expect(AdminActivityAction.ADMIN_LOGIN).toBe('admin.login')
      expect(AdminActivityAction.FEATURE_FLAG_CREATE).toBe('feature_flag.create')
      expect(AdminActivityAction.CONFIG_UPDATE).toBe('config.update')
    })
  })

  describe('AdminResourceType', () => {
    it('should have all expected resource types', () => {
      expect(AdminResourceType.USER).toBe('user')
      expect(AdminResourceType.TENANT).toBe('tenant')
      expect(AdminResourceType.ADMIN).toBe('admin')
      expect(AdminResourceType.SECURITY_POLICY).toBe('security_policy')
      expect(AdminResourceType.FEATURE_FLAG).toBe('feature_flag')
      expect(AdminResourceType.CONFIG).toBe('config')
    })
  })

  describe('logAdminActivity', () => {
    it('should create an activity record with required fields', async () => {
      const mockCreate = vi.mocked(prisma.adminActivity.create)
      mockCreate.mockResolvedValueOnce({} as any)

      await logAdminActivity({
        adminId: 'admin-123',
        action: AdminActivityAction.USER_CREATE,
        resourceType: AdminResourceType.USER,
      })

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adminId: 'admin-123',
          action: 'user.create',
          resourceType: 'user',
          status: 'success',
          metadata: {},
        }),
      })
    })

    it('should include optional fields when provided', async () => {
      const mockCreate = vi.mocked(prisma.adminActivity.create)
      mockCreate.mockResolvedValueOnce({} as any)

      await logAdminActivity({
        adminId: 'admin-123',
        action: AdminActivityAction.USER_UPDATE,
        resourceType: AdminResourceType.USER,
        resourceId: 'user-456',
        description: 'Updated user profile',
        metadata: { field: 'email' },
        status: 'success',
        duration: 150,
        ipAddress: '10.0.0.1',
        userAgent: 'Custom Agent',
      })

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adminId: 'admin-123',
          action: 'user.update',
          resourceType: 'user',
          resourceId: 'user-456',
          description: 'Updated user profile',
          metadata: { field: 'email' },
          status: 'success',
          duration: 150,
          ipAddress: '10.0.0.1',
          userAgent: 'Custom Agent',
        }),
      })
    })

    it('should not throw on database errors', async () => {
      const mockCreate = vi.mocked(prisma.adminActivity.create)
      mockCreate.mockRejectedValueOnce(new Error('Database error'))

      // Should not throw
      await expect(
        logAdminActivity({
          adminId: 'admin-123',
          action: AdminActivityAction.USER_CREATE,
          resourceType: AdminResourceType.USER,
        })
      ).resolves.toBeUndefined()
    })

    it('should log failure status with error message', async () => {
      const mockCreate = vi.mocked(prisma.adminActivity.create)
      mockCreate.mockResolvedValueOnce({} as any)

      await logAdminActivity({
        adminId: 'admin-123',
        action: AdminActivityAction.USER_DELETE,
        resourceType: AdminResourceType.USER,
        status: 'failure',
        errorMessage: 'User not found',
      })

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'failure',
          errorMessage: 'User not found',
        }),
      })
    })
  })

  describe('withActivityTracking', () => {
    it('should track successful operations', async () => {
      const mockCreate = vi.mocked(prisma.adminActivity.create)
      mockCreate.mockResolvedValueOnce({} as any)

      const result = await withActivityTracking(
        {
          adminId: 'admin-123',
          action: AdminActivityAction.USER_CREATE,
          resourceType: AdminResourceType.USER,
          description: 'Create user test',
        },
        async () => {
          return { id: 'new-user' }
        }
      )

      expect(result).toEqual({ id: 'new-user' })
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'success',
          duration: expect.any(Number),
        }),
      })
    })

    it('should track failed operations and rethrow error', async () => {
      const mockCreate = vi.mocked(prisma.adminActivity.create)
      mockCreate.mockResolvedValueOnce({} as any)

      await expect(
        withActivityTracking(
          {
            adminId: 'admin-123',
            action: AdminActivityAction.USER_DELETE,
            resourceType: AdminResourceType.USER,
          },
          async () => {
            throw new Error('Deletion failed')
          }
        )
      ).rejects.toThrow('Deletion failed')

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'failure',
          errorMessage: 'Deletion failed',
          duration: expect.any(Number),
        }),
      })
    })
  })

  describe('getActivityStats', () => {
    it('should return aggregated statistics', async () => {
      const mockCount = vi.mocked(prisma.adminActivity.count)
      const mockGroupBy = vi.mocked(prisma.adminActivity.groupBy)
      const mockFindMany = vi.mocked(prisma.adminActivity.findMany)
      const mockAggregate = vi.mocked(prisma.adminActivity.aggregate)
      const mockAdminFindMany = vi.mocked(prisma.superAdmin.findMany)

      mockCount.mockResolvedValueOnce(100)

      mockGroupBy
        .mockResolvedValueOnce([
          { action: 'user.create', _count: 30 },
          { action: 'user.update', _count: 20 },
        ] as any)
        .mockResolvedValueOnce([
          { adminId: 'admin-1', _count: 50 },
          { adminId: 'admin-2', _count: 50 },
        ] as any)
        .mockResolvedValueOnce([
          { resourceType: 'user', _count: 60 },
          { resourceType: 'tenant', _count: 40 },
        ] as any)
        .mockResolvedValueOnce([
          { status: 'success', _count: 95 },
          { status: 'failure', _count: 5 },
        ] as any)
        .mockResolvedValueOnce([] as any)

      mockFindMany.mockResolvedValueOnce([
        { createdAt: new Date() },
      ] as any)

      mockAdminFindMany.mockResolvedValueOnce([
        { id: 'admin-1', name: 'Admin 1', email: 'admin1@test.com', role: 'ADMIN' },
        { id: 'admin-2', name: 'Admin 2', email: 'admin2@test.com', role: 'SUPER_ADMIN' },
      ] as any)

      mockAggregate.mockResolvedValueOnce({ _avg: { duration: 250 } } as any)

      const stats = await getActivityStats()

      expect(stats.totalActivities).toBe(100)
      expect(stats.activitiesByAction).toHaveLength(2)
      expect(stats.activitiesByAdmin).toHaveLength(2)
      expect(stats.activitiesByResource).toHaveLength(2)
      expect(stats.activitiesByStatus).toHaveLength(2)
      expect(stats.avgResponseTime).toBe(250)
    })
  })

  describe('getRecentActivities', () => {
    it('should return paginated activities with admin details', async () => {
      const mockFindMany = vi.mocked(prisma.adminActivity.findMany)
      const mockCount = vi.mocked(prisma.adminActivity.count)
      const mockAdminFindMany = vi.mocked(prisma.superAdmin.findMany)

      mockFindMany.mockResolvedValueOnce([
        {
          id: 'activity-1',
          adminId: 'admin-1',
          action: 'user.create',
          resourceType: 'user',
          resourceId: 'user-1',
          description: 'Created user',
          ipAddress: '192.168.1.1',
          userAgent: 'Test Agent',
          duration: 100,
          status: 'success',
          errorMessage: null,
          metadata: {},
          createdAt: new Date(),
        },
      ] as any)

      mockCount.mockResolvedValueOnce(1)

      mockAdminFindMany.mockResolvedValueOnce([
        { id: 'admin-1', name: 'Admin 1', email: 'admin1@test.com', role: 'ADMIN' },
      ] as any)

      const result = await getRecentActivities({ limit: 10, page: 1 })

      expect(result.activities).toHaveLength(1)
      expect(result.activities[0].admin).toBeDefined()
      expect(result.activities[0].admin?.name).toBe('Admin 1')
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
      expect(result.totalPages).toBe(1)
    })

    it('should apply filters correctly', async () => {
      const mockFindMany = vi.mocked(prisma.adminActivity.findMany)
      const mockCount = vi.mocked(prisma.adminActivity.count)
      const mockAdminFindMany = vi.mocked(prisma.superAdmin.findMany)

      mockFindMany.mockResolvedValueOnce([] as any)
      mockCount.mockResolvedValueOnce(0)
      mockAdminFindMany.mockResolvedValueOnce([] as any)

      await getRecentActivities({
        adminId: 'admin-123',
        action: 'user.create',
        resourceType: 'user',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      })

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            adminId: 'admin-123',
            action: 'user.create',
            resourceType: 'user',
            createdAt: expect.objectContaining({
              gte: new Date('2024-01-01'),
              lte: new Date('2024-12-31'),
            }),
          }),
        })
      )
    })
  })
})
