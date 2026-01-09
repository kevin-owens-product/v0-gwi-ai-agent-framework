import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createAuditEventFromRequest,
  logAuditEvent,
  getAuditLogs,
  logBatchAuditEvents,
  type AuditEvent,
} from './audit'

// Mock prisma for database-dependent functions
vi.mock('./db', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

// Import mocked prisma
import { prisma } from './db'

describe('createAuditEventFromRequest', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        'user-agent': 'Mozilla/5.0',
      },
    })

    const baseEvent: Omit<AuditEvent, 'ipAddress' | 'userAgent'> = {
      orgId: 'org-1',
      userId: 'user-1',
      action: 'create',
      resourceType: 'agent',
      resourceId: 'agent-1',
    }

    const result = createAuditEventFromRequest(request, baseEvent)

    expect(result.ipAddress).toBe('192.168.1.1')
    expect(result.userAgent).toBe('Mozilla/5.0')
  })

  it('extracts IP from x-real-ip header when x-forwarded-for is not present', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-real-ip': '10.0.0.1',
        'user-agent': 'TestAgent/1.0',
      },
    })

    const baseEvent: Omit<AuditEvent, 'ipAddress' | 'userAgent'> = {
      orgId: 'org-1',
      action: 'update',
      resourceType: 'settings',
    }

    const result = createAuditEventFromRequest(request, baseEvent)

    expect(result.ipAddress).toBe('10.0.0.1')
    expect(result.userAgent).toBe('TestAgent/1.0')
  })

  it('returns undefined for missing headers', () => {
    const request = new Request('http://localhost')

    const baseEvent: Omit<AuditEvent, 'ipAddress' | 'userAgent'> = {
      orgId: 'org-1',
      action: 'delete',
      resourceType: 'agent',
    }

    const result = createAuditEventFromRequest(request, baseEvent)

    expect(result.ipAddress).toBeUndefined()
    expect(result.userAgent).toBeUndefined()
  })

  it('preserves all base event properties', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Mozilla/5.0',
      },
    })

    const baseEvent: Omit<AuditEvent, 'ipAddress' | 'userAgent'> = {
      orgId: 'org-123',
      userId: 'user-456',
      action: 'execute',
      resourceType: 'agent_run',
      resourceId: 'run-789',
      metadata: { query: 'test query' },
    }

    const result = createAuditEventFromRequest(request, baseEvent)

    expect(result.orgId).toBe('org-123')
    expect(result.userId).toBe('user-456')
    expect(result.action).toBe('execute')
    expect(result.resourceType).toBe('agent_run')
    expect(result.resourceId).toBe('run-789')
    expect(result.metadata).toEqual({ query: 'test query' })
  })

  it('trims whitespace from IP address', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '  192.168.1.1  ',
      },
    })

    const baseEvent: Omit<AuditEvent, 'ipAddress' | 'userAgent'> = {
      orgId: 'org-1',
      action: 'login',
      resourceType: 'user',
    }

    const result = createAuditEventFromRequest(request, baseEvent)

    expect(result.ipAddress).toBe('192.168.1.1')
  })
})

describe('AuditAction types', () => {
  it('allows valid action types', () => {
    const validActions: AuditEvent['action'][] = [
      'create',
      'read',
      'update',
      'delete',
      'execute',
      'export',
      'login',
      'logout',
      'invite',
      'join',
      'leave',
    ]

    validActions.forEach((action) => {
      const event: AuditEvent = {
        orgId: 'org-1',
        action,
        resourceType: 'agent',
      }
      expect(event.action).toBe(action)
    })
  })
})

describe('AuditResourceType types', () => {
  it('allows valid resource types', () => {
    const validResourceTypes: AuditEvent['resourceType'][] = [
      'agent',
      'insight',
      'data_source',
      'user',
      'settings',
      'api_key',
      'invitation',
      'organization',
      'agent_run',
      'workflow',
    ]

    validResourceTypes.forEach((resourceType) => {
      const event: AuditEvent = {
        orgId: 'org-1',
        action: 'create',
        resourceType,
      }
      expect(event.resourceType).toBe(resourceType)
    })
  })
})

describe('logAuditEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an audit log entry', async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({
      id: 'log-1',
      orgId: 'org-1',
      userId: 'user-1',
      action: 'create',
      resourceType: 'agent',
      resourceId: 'agent-1',
      timestamp: new Date(),
    } as any)

    const event: AuditEvent = {
      orgId: 'org-1',
      userId: 'user-1',
      action: 'create',
      resourceType: 'agent',
      resourceId: 'agent-1',
      metadata: { name: 'Test Agent' },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    }

    await logAuditEvent(event)

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        orgId: 'org-1',
        userId: 'user-1',
        action: 'create',
        resourceType: 'agent',
        resourceId: 'agent-1',
        metadata: { name: 'Test Agent' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
    })
  })

  it('uses empty object for metadata when not provided', async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

    const event: AuditEvent = {
      orgId: 'org-1',
      action: 'read',
      resourceType: 'agent',
    }

    await logAuditEvent(event)

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        metadata: {},
      }),
    })
  })

  it('logs error but does not throw on failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(prisma.auditLog.create).mockRejectedValue(new Error('DB error'))

    const event: AuditEvent = {
      orgId: 'org-1',
      action: 'create',
      resourceType: 'agent',
    }

    // Should not throw
    await logAuditEvent(event)

    expect(consoleSpy).toHaveBeenCalledWith('Failed to log audit event:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})

describe('getAuditLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches audit logs with default options', async () => {
    const mockLogs = [
      { id: 'log-1', action: 'create', resourceType: 'agent', timestamp: new Date() },
      { id: 'log-2', action: 'update', resourceType: 'agent', timestamp: new Date() },
    ]

    vi.mocked(prisma.auditLog.findMany).mockResolvedValue(mockLogs as any)
    vi.mocked(prisma.auditLog.count).mockResolvedValue(2)

    const result = await getAuditLogs('org-1')

    expect(result.logs).toEqual(mockLogs)
    expect(result.total).toBe(2)
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: { orgId: 'org-1' },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { timestamp: 'desc' },
      take: 50,
      skip: 0,
    })
  })

  it('applies pagination options', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([])
    vi.mocked(prisma.auditLog.count).mockResolvedValue(100)

    await getAuditLogs('org-1', { limit: 10, offset: 20 })

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
        skip: 20,
      })
    )
  })

  it('filters by action', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([])
    vi.mocked(prisma.auditLog.count).mockResolvedValue(0)

    await getAuditLogs('org-1', { action: 'create' })

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orgId: 'org-1', action: 'create' },
      })
    )
  })

  it('filters by resourceType', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([])
    vi.mocked(prisma.auditLog.count).mockResolvedValue(0)

    await getAuditLogs('org-1', { resourceType: 'agent' })

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orgId: 'org-1', resourceType: 'agent' },
      })
    )
  })

  it('filters by userId', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([])
    vi.mocked(prisma.auditLog.count).mockResolvedValue(0)

    await getAuditLogs('org-1', { userId: 'user-123' })

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orgId: 'org-1', userId: 'user-123' },
      })
    )
  })

  it('filters by date range', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([])
    vi.mocked(prisma.auditLog.count).mockResolvedValue(0)

    const startDate = new Date('2024-01-01')
    const endDate = new Date('2024-01-31')

    await getAuditLogs('org-1', { startDate, endDate })

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          orgId: 'org-1',
          timestamp: { gte: startDate, lte: endDate },
        },
      })
    )
  })

  it('filters by start date only', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([])
    vi.mocked(prisma.auditLog.count).mockResolvedValue(0)

    const startDate = new Date('2024-01-01')

    await getAuditLogs('org-1', { startDate })

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          orgId: 'org-1',
          timestamp: { gte: startDate },
        },
      })
    )
  })

  it('filters by end date only', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([])
    vi.mocked(prisma.auditLog.count).mockResolvedValue(0)

    const endDate = new Date('2024-01-31')

    await getAuditLogs('org-1', { endDate })

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          orgId: 'org-1',
          timestamp: { lte: endDate },
        },
      })
    )
  })

  it('combines multiple filters', async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([])
    vi.mocked(prisma.auditLog.count).mockResolvedValue(0)

    const startDate = new Date('2024-01-01')

    await getAuditLogs('org-1', {
      action: 'create',
      resourceType: 'agent',
      userId: 'user-1',
      startDate,
      limit: 25,
      offset: 50,
    })

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: {
        orgId: 'org-1',
        action: 'create',
        resourceType: 'agent',
        userId: 'user-1',
        timestamp: { gte: startDate },
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { timestamp: 'desc' },
      take: 25,
      skip: 50,
    })
  })
})

describe('logBatchAuditEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates multiple audit log entries', async () => {
    vi.mocked(prisma.auditLog.createMany).mockResolvedValue({ count: 3 })

    const events: AuditEvent[] = [
      { orgId: 'org-1', action: 'create', resourceType: 'agent', resourceId: 'agent-1' },
      { orgId: 'org-1', action: 'create', resourceType: 'agent', resourceId: 'agent-2' },
      { orgId: 'org-1', action: 'create', resourceType: 'agent', resourceId: 'agent-3' },
    ]

    await logBatchAuditEvents(events)

    expect(prisma.auditLog.createMany).toHaveBeenCalledWith({
      data: [
        { orgId: 'org-1', action: 'create', resourceType: 'agent', resourceId: 'agent-1', metadata: {}, userId: undefined, ipAddress: undefined, userAgent: undefined },
        { orgId: 'org-1', action: 'create', resourceType: 'agent', resourceId: 'agent-2', metadata: {}, userId: undefined, ipAddress: undefined, userAgent: undefined },
        { orgId: 'org-1', action: 'create', resourceType: 'agent', resourceId: 'agent-3', metadata: {}, userId: undefined, ipAddress: undefined, userAgent: undefined },
      ],
    })
  })

  it('handles events with all fields', async () => {
    vi.mocked(prisma.auditLog.createMany).mockResolvedValue({ count: 1 })

    const events: AuditEvent[] = [
      {
        orgId: 'org-1',
        userId: 'user-1',
        action: 'delete',
        resourceType: 'agent',
        resourceId: 'agent-1',
        metadata: { reason: 'cleanup' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
    ]

    await logBatchAuditEvents(events)

    expect(prisma.auditLog.createMany).toHaveBeenCalledWith({
      data: [
        {
          orgId: 'org-1',
          userId: 'user-1',
          action: 'delete',
          resourceType: 'agent',
          resourceId: 'agent-1',
          metadata: { reason: 'cleanup' },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      ],
    })
  })

  it('logs error but does not throw on failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(prisma.auditLog.createMany).mockRejectedValue(new Error('DB error'))

    const events: AuditEvent[] = [
      { orgId: 'org-1', action: 'create', resourceType: 'agent' },
    ]

    // Should not throw
    await logBatchAuditEvents(events)

    expect(consoleSpy).toHaveBeenCalledWith('Failed to log batch audit events:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})
