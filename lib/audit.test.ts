import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createAuditEventFromRequest, type AuditEvent } from './audit'

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
