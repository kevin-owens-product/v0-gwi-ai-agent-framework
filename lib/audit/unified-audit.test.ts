import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  createAuditContext,
  createUserAuditContext,
  createAdminAuditContext,
  createGWIAuditContext,
  getRequestMetadata,
  logAuditEvent,
  logAudit,
  logBatchAuditEvents,
  logUserAudit,
  logAdminAudit,
  logGWIAudit,
  queryAuditLogs,
  getPortalAuditLogs,
  getUserPortalAuditLogs,
  getAdminPortalAuditLogs,
  getGWIPortalAuditLogs,
  getResourceAuditLogs,
  getUserAuditLogs,
  getAdminAuditLogs,
  getOrgAuditLogs,
  getAuditLogStats,
  type AuditContext,
  type AuditLogInput,
  type AuditLogEntry,
  type PortalSession,
} from './unified-audit'

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    portalAuditLog: {
      create: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'

describe('Unified Audit Logging System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper to create mock request
  const createMockRequest = (
    headers: Record<string, string> = {}
  ): NextRequest => {
    return new NextRequest('http://localhost:3000/api/gwi/surveys', {
      headers: new Headers({
        'user-agent': 'Mozilla/5.0 Test Browser',
        'x-forwarded-for': '192.168.1.1',
        ...headers,
      }),
    })
  }

  // Helper to create mock portal session
  const createMockSession = (
    type: 'user' | 'admin' | 'gwi' = 'gwi',
    overrides: Partial<PortalSession> = {}
  ): PortalSession => ({
    type,
    userId: type === 'user' ? 'user-123' : 'admin-123',
    email: 'test@example.com',
    name: 'Test User',
    role: type === 'gwi' ? 'GWI_ADMIN' : type === 'admin' ? 'SUPER_ADMIN' : 'user',
    permissions: type === 'gwi' ? ['gwi:*'] : type === 'admin' ? ['super:*'] : ['user:*'],
    organizationId: type === 'user' ? 'org-123' : undefined,
    expiresAt: new Date(Date.now() + 3600000),
    raw: { type } as PortalSession['raw'],
    ...overrides,
  })

  // ============================================================================
  // Audit Context Creation Tests
  // ============================================================================

  describe('createAuditContext', () => {
    it('should create context from GWI portal session', () => {
      const session = createMockSession('gwi')
      const request = createMockRequest()

      const context = createAuditContext(session, request)

      expect(context.portal).toBe('GWI')
      expect(context.adminId).toBe('admin-123')
      expect(context.userId).toBeUndefined()
      expect(context.email).toBe('test@example.com')
      expect(context.role).toBe('GWI_ADMIN')
      expect(context.ipAddress).toBe('192.168.1.1')
      expect(context.userAgent).toBe('Mozilla/5.0 Test Browser')
    })

    it('should create context from admin portal session', () => {
      const session = createMockSession('admin')
      const request = createMockRequest()

      const context = createAuditContext(session, request)

      expect(context.portal).toBe('ADMIN')
      expect(context.adminId).toBe('admin-123')
      expect(context.userId).toBeUndefined()
      expect(context.role).toBe('SUPER_ADMIN')
    })

    it('should create context from user portal session', () => {
      const session = createMockSession('user')
      const request = createMockRequest()

      const context = createAuditContext(session, request)

      expect(context.portal).toBe('USER')
      expect(context.userId).toBe('user-123')
      expect(context.adminId).toBeUndefined()
      expect(context.orgId).toBe('org-123')
    })

    it('should handle missing request headers', () => {
      const session = createMockSession('gwi')
      const request = new NextRequest('http://localhost:3000')

      const context = createAuditContext(session, request)

      expect(context.ipAddress).toBeUndefined()
      expect(context.userAgent).toBeUndefined()
    })
  })

  describe('createUserAuditContext', () => {
    it('should create user audit context', () => {
      const context = createUserAuditContext('user-123', 'user@example.com', 'org-123')

      expect(context.portal).toBe('USER')
      expect(context.userId).toBe('user-123')
      expect(context.email).toBe('user@example.com')
      expect(context.orgId).toBe('org-123')
    })

    it('should include request metadata when provided', () => {
      const request = createMockRequest()
      const context = createUserAuditContext('user-123', 'user@example.com', 'org-123', request)

      expect(context.ipAddress).toBe('192.168.1.1')
      expect(context.userAgent).toBe('Mozilla/5.0 Test Browser')
    })
  })

  describe('createAdminAuditContext', () => {
    it('should create admin audit context', () => {
      const context = createAdminAuditContext('admin-123', 'admin@example.com', 'SUPER_ADMIN')

      expect(context.portal).toBe('ADMIN')
      expect(context.adminId).toBe('admin-123')
      expect(context.email).toBe('admin@example.com')
      expect(context.role).toBe('SUPER_ADMIN')
    })

    it('should include request metadata when provided', () => {
      const request = createMockRequest()
      const context = createAdminAuditContext('admin-123', 'admin@example.com', 'SUPER_ADMIN', request)

      expect(context.ipAddress).toBe('192.168.1.1')
    })
  })

  describe('createGWIAuditContext', () => {
    it('should create GWI audit context', () => {
      const context = createGWIAuditContext('admin-123', 'gwi@example.com', 'GWI_ADMIN')

      expect(context.portal).toBe('GWI')
      expect(context.adminId).toBe('admin-123')
      expect(context.email).toBe('gwi@example.com')
      expect(context.role).toBe('GWI_ADMIN')
    })

    it('should include request metadata when provided', () => {
      const request = createMockRequest()
      const context = createGWIAuditContext('admin-123', 'gwi@example.com', 'GWI_ADMIN', request)

      expect(context.ipAddress).toBe('192.168.1.1')
    })
  })

  describe('getRequestMetadata', () => {
    it('should extract x-forwarded-for header (first IP)', () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
      })

      const metadata = getRequestMetadata(request)
      expect(metadata.ipAddress).toBe('192.168.1.1')
    })

    it('should fall back to x-real-ip header', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: new Headers({
          'x-real-ip': '10.0.0.1',
        }),
      })

      const metadata = getRequestMetadata(request)
      expect(metadata.ipAddress).toBe('10.0.0.1')
    })

    it('should extract user agent', () => {
      const request = createMockRequest({
        'user-agent': 'Custom/1.0 Test Agent',
      })

      const metadata = getRequestMetadata(request)
      expect(metadata.userAgent).toBe('Custom/1.0 Test Agent')
    })
  })

  // ============================================================================
  // Audit Logging Tests
  // ============================================================================

  describe('logAuditEvent', () => {
    it('should create audit log entry in database', async () => {
      const mockAuditLog = { id: 'audit-123' }
      vi.mocked(prisma.portalAuditLog.create).mockResolvedValue(mockAuditLog as never)

      const entry: AuditLogEntry = {
        context: {
          portal: 'GWI',
          adminId: 'admin-123',
          email: 'gwi@example.com',
          role: 'GWI_ADMIN',
          ipAddress: '192.168.1.1',
        },
        action: 'create',
        resourceType: 'survey',
        resourceId: 'survey-123',
        newState: { name: 'New Survey' },
      }

      const result = await logAuditEvent(entry)

      expect(prisma.portalAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          portal: 'GWI',
          adminId: 'admin-123',
          action: 'create',
          resourceType: 'survey',
          resourceId: 'survey-123',
        }),
      })
      expect(result).toEqual(mockAuditLog)
    })

    it('should include metadata with email, role, and IP', async () => {
      vi.mocked(prisma.portalAuditLog.create).mockResolvedValue({ id: 'audit-123' } as never)

      const entry: AuditLogEntry = {
        context: {
          portal: 'GWI',
          adminId: 'admin-123',
          email: 'gwi@example.com',
          role: 'GWI_ADMIN',
          ipAddress: '192.168.1.1',
          userAgent: 'Test Browser',
        },
        action: 'update',
        resourceType: 'survey',
        resourceId: 'survey-123',
        metadata: { customField: 'value' },
      }

      await logAuditEvent(entry)

      expect(prisma.portalAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            email: 'gwi@example.com',
            role: 'GWI_ADMIN',
            ipAddress: '192.168.1.1',
            userAgent: 'Test Browser',
            customField: 'value',
          }),
        }),
      })
    })

    it('should store previous and new state', async () => {
      vi.mocked(prisma.portalAuditLog.create).mockResolvedValue({ id: 'audit-123' } as never)

      const entry: AuditLogEntry = {
        context: { portal: 'GWI', adminId: 'admin-123' },
        action: 'update',
        resourceType: 'survey',
        resourceId: 'survey-123',
        previousState: { name: 'Old Name', status: 'DRAFT' },
        newState: { name: 'New Name', status: 'ACTIVE' },
      }

      await logAuditEvent(entry)

      expect(prisma.portalAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          previousState: { name: 'Old Name', status: 'DRAFT' },
          newState: { name: 'New Name', status: 'ACTIVE' },
        }),
      })
    })

    it('should not throw on database error', async () => {
      vi.mocked(prisma.portalAuditLog.create).mockRejectedValue(new Error('DB Error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const entry: AuditLogEntry = {
        context: { portal: 'GWI', adminId: 'admin-123' },
        action: 'create',
        resourceType: 'survey',
      }

      const result = await logAuditEvent(entry)

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to log audit event:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('logAudit', () => {
    it('should call logAuditEvent with combined context and input', async () => {
      vi.mocked(prisma.portalAuditLog.create).mockResolvedValue({ id: 'audit-123' } as never)

      const context: AuditContext = {
        portal: 'GWI',
        adminId: 'admin-123',
        email: 'gwi@example.com',
      }

      const input: AuditLogInput = {
        action: 'delete',
        resourceType: 'pipeline',
        resourceId: 'pipeline-123',
      }

      await logAudit(context, input)

      expect(prisma.portalAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          portal: 'GWI',
          adminId: 'admin-123',
          action: 'delete',
          resourceType: 'pipeline',
          resourceId: 'pipeline-123',
        }),
      })
    })
  })

  describe('logBatchAuditEvents', () => {
    it('should create multiple audit logs in batch', async () => {
      vi.mocked(prisma.portalAuditLog.createMany).mockResolvedValue({ count: 3 })

      const entries: AuditLogEntry[] = [
        {
          context: { portal: 'GWI', adminId: 'admin-123' },
          action: 'create',
          resourceType: 'survey',
          resourceId: 'survey-1',
        },
        {
          context: { portal: 'GWI', adminId: 'admin-123' },
          action: 'create',
          resourceType: 'survey',
          resourceId: 'survey-2',
        },
        {
          context: { portal: 'GWI', adminId: 'admin-123' },
          action: 'create',
          resourceType: 'survey',
          resourceId: 'survey-3',
        },
      ]

      const result = await logBatchAuditEvents(entries)

      expect(prisma.portalAuditLog.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ resourceId: 'survey-1' }),
          expect.objectContaining({ resourceId: 'survey-2' }),
          expect.objectContaining({ resourceId: 'survey-3' }),
        ]),
      })
      expect(result).toBe(3)
    })

    it('should return 0 on database error', async () => {
      vi.mocked(prisma.portalAuditLog.createMany).mockRejectedValue(new Error('DB Error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await logBatchAuditEvents([])

      expect(result).toBe(0)
      consoleSpy.mockRestore()
    })
  })

  // ============================================================================
  // Portal-Specific Logging Tests
  // ============================================================================

  describe('logUserAudit', () => {
    it('should log audit event for user portal', async () => {
      vi.mocked(prisma.portalAuditLog.create).mockResolvedValue({ id: 'audit-123' } as never)

      await logUserAudit('user-123', 'user@example.com', 'org-123', {
        action: 'create',
        resourceType: 'report',
        resourceId: 'report-123',
      })

      expect(prisma.portalAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          portal: 'USER',
          userId: 'user-123',
          orgId: 'org-123',
          action: 'create',
          resourceType: 'report',
        }),
      })
    })
  })

  describe('logAdminAudit', () => {
    it('should log audit event for admin portal', async () => {
      vi.mocked(prisma.portalAuditLog.create).mockResolvedValue({ id: 'audit-123' } as never)

      await logAdminAudit('admin-123', 'admin@example.com', 'SUPER_ADMIN', {
        action: 'update',
        resourceType: 'tenant',
        resourceId: 'tenant-123',
      })

      expect(prisma.portalAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          portal: 'ADMIN',
          adminId: 'admin-123',
          action: 'update',
          resourceType: 'tenant',
        }),
      })
    })
  })

  describe('logGWIAudit', () => {
    it('should log audit event for GWI portal', async () => {
      vi.mocked(prisma.portalAuditLog.create).mockResolvedValue({ id: 'audit-123' } as never)

      await logGWIAudit('admin-123', 'gwi@example.com', 'GWI_ADMIN', {
        action: 'execute',
        resourceType: 'pipeline',
        resourceId: 'pipeline-123',
      })

      expect(prisma.portalAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          portal: 'GWI',
          adminId: 'admin-123',
          action: 'execute',
          resourceType: 'pipeline',
        }),
      })
    })
  })

  // ============================================================================
  // Audit Log Query Tests
  // ============================================================================

  describe('queryAuditLogs', () => {
    const mockLogs = [
      { id: 'log-1', action: 'create', resourceType: 'survey', createdAt: new Date() },
      { id: 'log-2', action: 'update', resourceType: 'survey', createdAt: new Date() },
    ]

    beforeEach(() => {
      vi.mocked(prisma.portalAuditLog.findMany).mockResolvedValue(mockLogs as never)
      vi.mocked(prisma.portalAuditLog.count).mockResolvedValue(2)
    })

    it('should query audit logs with default options', async () => {
      const result = await queryAuditLogs()

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      })
      expect(result.logs).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.hasMore).toBe(false)
    })

    it('should filter by portal types', async () => {
      await queryAuditLogs({ portals: ['GWI', 'ADMIN'] })

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            portal: { in: ['GWI', 'ADMIN'] },
          }),
        })
      )
    })

    it('should filter by user ID', async () => {
      await queryAuditLogs({ userId: 'user-123' })

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-123',
          }),
        })
      )
    })

    it('should filter by admin ID', async () => {
      await queryAuditLogs({ adminId: 'admin-123' })

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            adminId: 'admin-123',
          }),
        })
      )
    })

    it('should filter by organization ID', async () => {
      await queryAuditLogs({ orgId: 'org-123' })

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orgId: 'org-123',
          }),
        })
      )
    })

    it('should filter by actions', async () => {
      await queryAuditLogs({ actions: ['create', 'update', 'delete'] })

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            action: { in: ['create', 'update', 'delete'] },
          }),
        })
      )
    })

    it('should filter by resource types', async () => {
      await queryAuditLogs({ resourceTypes: ['survey', 'pipeline'] })

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            resourceType: { in: ['survey', 'pipeline'] },
          }),
        })
      )
    })

    it('should filter by resource ID', async () => {
      await queryAuditLogs({ resourceId: 'survey-123' })

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            resourceId: 'survey-123',
          }),
        })
      )
    })

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      await queryAuditLogs({ startDate, endDate })

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: { gte: startDate, lte: endDate },
          }),
        })
      )
    })

    it('should support pagination', async () => {
      await queryAuditLogs({ limit: 10, offset: 20 })

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
        })
      )
    })

    it('should support custom ordering', async () => {
      await queryAuditLogs({ orderBy: 'action', orderDirection: 'asc' })

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { action: 'asc' },
        })
      )
    })

    it('should indicate hasMore when more results exist', async () => {
      vi.mocked(prisma.portalAuditLog.count).mockResolvedValue(100)

      const result = await queryAuditLogs({ limit: 10, offset: 0 })

      expect(result.hasMore).toBe(true)
    })
  })

  describe('getPortalAuditLogs', () => {
    beforeEach(() => {
      vi.mocked(prisma.portalAuditLog.findMany).mockResolvedValue([])
      vi.mocked(prisma.portalAuditLog.count).mockResolvedValue(0)
    })

    it('should query logs for specific portal', async () => {
      await getPortalAuditLogs('GWI')

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            portal: { in: ['GWI'] },
          }),
        })
      )
    })
  })

  describe('Portal-specific audit log getters', () => {
    beforeEach(() => {
      vi.mocked(prisma.portalAuditLog.findMany).mockResolvedValue([])
      vi.mocked(prisma.portalAuditLog.count).mockResolvedValue(0)
    })

    it('getUserPortalAuditLogs should filter by USER portal', async () => {
      await getUserPortalAuditLogs()

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            portal: { in: ['USER'] },
          }),
        })
      )
    })

    it('getAdminPortalAuditLogs should filter by ADMIN portal', async () => {
      await getAdminPortalAuditLogs()

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            portal: { in: ['ADMIN'] },
          }),
        })
      )
    })

    it('getGWIPortalAuditLogs should filter by GWI portal', async () => {
      await getGWIPortalAuditLogs()

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            portal: { in: ['GWI'] },
          }),
        })
      )
    })
  })

  describe('getResourceAuditLogs', () => {
    beforeEach(() => {
      vi.mocked(prisma.portalAuditLog.findMany).mockResolvedValue([])
      vi.mocked(prisma.portalAuditLog.count).mockResolvedValue(0)
    })

    it('should query logs for specific resource', async () => {
      await getResourceAuditLogs('survey', 'survey-123')

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            resourceType: { in: ['survey'] },
            resourceId: 'survey-123',
          }),
        })
      )
    })
  })

  describe('getUserAuditLogs', () => {
    beforeEach(() => {
      vi.mocked(prisma.portalAuditLog.findMany).mockResolvedValue([])
      vi.mocked(prisma.portalAuditLog.count).mockResolvedValue(0)
    })

    it('should query logs for specific user', async () => {
      await getUserAuditLogs('user-123')

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-123',
          }),
        })
      )
    })
  })

  describe('getAdminAuditLogs', () => {
    beforeEach(() => {
      vi.mocked(prisma.portalAuditLog.findMany).mockResolvedValue([])
      vi.mocked(prisma.portalAuditLog.count).mockResolvedValue(0)
    })

    it('should query logs for specific admin', async () => {
      await getAdminAuditLogs('admin-123')

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            adminId: 'admin-123',
          }),
        })
      )
    })
  })

  describe('getOrgAuditLogs', () => {
    beforeEach(() => {
      vi.mocked(prisma.portalAuditLog.findMany).mockResolvedValue([])
      vi.mocked(prisma.portalAuditLog.count).mockResolvedValue(0)
    })

    it('should query logs for specific organization', async () => {
      await getOrgAuditLogs('org-123')

      expect(prisma.portalAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orgId: 'org-123',
          }),
        })
      )
    })
  })

  // ============================================================================
  // Audit Log Statistics Tests
  // ============================================================================

  describe('getAuditLogStats', () => {
    beforeEach(() => {
      vi.mocked(prisma.portalAuditLog.count).mockResolvedValue(100)
      vi.mocked(prisma.portalAuditLog.groupBy).mockImplementation((args) => {
        if (args.by?.includes('portal')) {
          return Promise.resolve([
            { portal: 'GWI', _count: 50 },
            { portal: 'USER', _count: 30 },
            { portal: 'ADMIN', _count: 20 },
          ]) as never
        }
        if (args.by?.includes('action')) {
          return Promise.resolve([
            { action: 'create', _count: 40 },
            { action: 'update', _count: 35 },
            { action: 'delete', _count: 25 },
          ]) as never
        }
        if (args.by?.includes('resourceType')) {
          return Promise.resolve([
            { resourceType: 'survey', _count: 45 },
            { resourceType: 'pipeline', _count: 30 },
            { resourceType: 'taxonomy', _count: 25 },
          ]) as never
        }
        return Promise.resolve([]) as never
      })
    })

    it('should return audit log statistics', async () => {
      const stats = await getAuditLogStats()

      expect(stats.total).toBe(100)
      expect(stats.byPortal).toHaveLength(3)
      expect(stats.topActions).toHaveLength(3)
      expect(stats.topResourceTypes).toHaveLength(3)
    })

    it('should filter stats by portals', async () => {
      await getAuditLogStats({ portals: ['GWI'] })

      expect(prisma.portalAuditLog.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          portal: { in: ['GWI'] },
        }),
      })
    })

    it('should filter stats by organization', async () => {
      await getAuditLogStats({ orgId: 'org-123' })

      expect(prisma.portalAuditLog.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          orgId: 'org-123',
        }),
      })
    })

    it('should filter stats by date range', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      await getAuditLogStats({ startDate, endDate })

      expect(prisma.portalAuditLog.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          createdAt: { gte: startDate, lte: endDate },
        }),
      })
    })
  })
})
