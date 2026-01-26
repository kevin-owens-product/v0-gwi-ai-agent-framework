import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies before importing route handlers
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    crosstab: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    organizationMember: {
      findMany: vi.fn(() => Promise.resolve([])),
    },
    usageRecord: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/tenant', () => ({
  getUserMembership: vi.fn(),
  getValidatedOrgId: vi.fn(),
}))

vi.mock('@/lib/audit', () => ({
  logAuditEvent: vi.fn(),
  createAuditEventFromRequest: vi.fn((_req, event) => event),
}))

vi.mock('@/lib/billing', () => ({
  recordUsage: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/lib/permissions', () => ({
  hasPermission: vi.fn(() => true),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
}))

import { GET, POST } from './route'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent } from '@/lib/audit'

describe('GET /api/v1/crosstabs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(hasPermission).mockReturnValue(true)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new NextRequest('http://localhost/api/v1/crosstabs')
    const response = await GET(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 404 when organization ID is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getValidatedOrgId).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/v1/crosstabs')
    const response = await GET(request)

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.error).toContain('No organization found')
  })

  it('returns 403 when user is not a member of the organization', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getValidatedOrgId).mockResolvedValue('org-1')
    vi.mocked(getUserMembership).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/v1/crosstabs', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.error).toBe('Not a member of this organization')
  })

  it('returns 403 when user lacks crosstabs:read permission', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getValidatedOrgId).mockResolvedValue('org-1')
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'VIEWER',
    } as never)
    vi.mocked(hasPermission).mockReturnValue(false)

    const request = new NextRequest('http://localhost/api/v1/crosstabs', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.error).toBe('Permission denied')
  })

  it('returns crosstabs successfully for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getValidatedOrgId).mockResolvedValue('org-1')
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'ADMIN',
    } as never)

    const mockCrosstabs = [
      {
        id: 'ct-1',
        name: 'Test Crosstab',
        description: 'A test crosstab analysis',
        audiences: ['Gen Z', 'Millennials'],
        metrics: ['Brand Awareness', 'Purchase Intent'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    vi.mocked(prisma.crosstab.findMany).mockResolvedValue(mockCrosstabs as never)
    vi.mocked(prisma.crosstab.count).mockResolvedValue(1)

    const request = new NextRequest('http://localhost/api/v1/crosstabs', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.data).toHaveLength(1)
    expect(data.data[0].name).toBe('Test Crosstab')
    expect(data.meta.total).toBe(1)
  })

  it('applies pagination parameters', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getValidatedOrgId).mockResolvedValue('org-1')
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
    } as never)
    vi.mocked(prisma.crosstab.findMany).mockResolvedValue([])
    vi.mocked(prisma.crosstab.count).mockResolvedValue(50)

    const request = new NextRequest('http://localhost/api/v1/crosstabs?page=2&limit=10', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.crosstab.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    )
  })

  it('applies search filter', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getValidatedOrgId).mockResolvedValue('org-1')
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
    } as never)
    vi.mocked(prisma.crosstab.findMany).mockResolvedValue([])
    vi.mocked(prisma.crosstab.count).mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/v1/crosstabs?search=brand', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.crosstab.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: { contains: 'brand', mode: 'insensitive' } }),
            expect.objectContaining({ description: { contains: 'brand', mode: 'insensitive' } }),
          ]),
        }),
      })
    )
  })

  it('limits page size to 100', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getValidatedOrgId).mockResolvedValue('org-1')
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
    } as never)
    vi.mocked(prisma.crosstab.findMany).mockResolvedValue([])
    vi.mocked(prisma.crosstab.count).mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/v1/crosstabs?limit=500', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.crosstab.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 100, // Should be capped at 100
      })
    )
  })
})

describe('POST /api/v1/crosstabs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(hasPermission).mockReturnValue(true)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new NextRequest('http://localhost/api/v1/crosstabs', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Crosstab' }),
    })
    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid request body', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getValidatedOrgId).mockResolvedValue('org-1')
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'ADMIN',
    } as never)

    const request = new NextRequest('http://localhost/api/v1/crosstabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({ name: '' }), // Empty name
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation error')
  })

  it('creates crosstab successfully with valid data', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getValidatedOrgId).mockResolvedValue('org-1')
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'ADMIN',
    } as never)

    const mockCrosstab = {
      id: 'new-ct-id',
      name: 'New Crosstab',
      description: 'A test crosstab',
      audiences: [],
      metrics: [],
      createdAt: new Date(),
    }
    vi.mocked(prisma.crosstab.create).mockResolvedValue(mockCrosstab as never)

    const request = new NextRequest('http://localhost/api/v1/crosstabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({
        name: 'New Crosstab',
        description: 'A test crosstab',
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.name).toBe('New Crosstab')
  })

  it('returns 403 when user lacks crosstabs:write permission', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getValidatedOrgId).mockResolvedValue('org-1')
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'VIEWER',
    } as never)
    vi.mocked(hasPermission).mockReturnValue(false)

    const request = new NextRequest('http://localhost/api/v1/crosstabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({
        name: 'New Crosstab',
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.error).toBe('Permission denied')
  })

  it('logs audit event on successful creation', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getValidatedOrgId).mockResolvedValue('org-1')
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'ADMIN',
    } as never)

    const mockCrosstab = {
      id: 'new-ct-id',
      name: 'New Crosstab',
      createdAt: new Date(),
    }
    vi.mocked(prisma.crosstab.create).mockResolvedValue(mockCrosstab as never)

    const request = new NextRequest('http://localhost/api/v1/crosstabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({
        name: 'New Crosstab',
      }),
    })
    await POST(request)

    expect(logAuditEvent).toHaveBeenCalled()
  })

  it('accepts optional fields', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getValidatedOrgId).mockResolvedValue('org-1')
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'ADMIN',
    } as never)

    const mockCrosstab = {
      id: 'new-ct-id',
      name: 'Full Crosstab',
      description: 'A full test crosstab',
      audiences: ['Gen Z', 'Millennials'],
      metrics: ['Brand Awareness', 'Purchase Intent'],
      filters: { market: 'US' },
      createdAt: new Date(),
    }
    vi.mocked(prisma.crosstab.create).mockResolvedValue(mockCrosstab as never)

    const request = new NextRequest('http://localhost/api/v1/crosstabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({
        name: 'Full Crosstab',
        description: 'A full test crosstab',
        audiences: ['Gen Z', 'Millennials'],
        metrics: ['Brand Awareness', 'Purchase Intent'],
        filters: { market: 'US' },
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.name).toBe('Full Crosstab')
  })

  it('creates crosstab with correct data in database', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getValidatedOrgId).mockResolvedValue('org-1')
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'ADMIN',
    } as never)

    vi.mocked(prisma.crosstab.create).mockResolvedValue({
      id: 'new-ct-id',
      name: 'Test',
      createdAt: new Date(),
    } as never)

    const request = new NextRequest('http://localhost/api/v1/crosstabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({
        name: 'Test',
        description: 'Test desc',
        audiences: ['Audience 1'],
        metrics: ['Metric 1'],
      }),
    })
    await POST(request)

    expect(prisma.crosstab.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orgId: 'org-1',
        name: 'Test',
        description: 'Test desc',
        audiences: ['Audience 1'],
        metrics: ['Metric 1'],
        filters: {},
        createdBy: 'user-1',
      }),
    })
  })
})
