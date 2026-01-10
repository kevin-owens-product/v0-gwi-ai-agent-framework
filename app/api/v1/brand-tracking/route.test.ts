import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies before importing route handlers
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    brandTracking: {
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
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent } from '@/lib/audit'

describe('GET /api/v1/brand-tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(hasPermission).mockReturnValue(true)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new NextRequest('http://localhost/api/v1/brand-tracking')
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

    const request = new NextRequest('http://localhost/api/v1/brand-tracking')
    const response = await GET(request)

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.error).toBe('No organization found')
  })

  it('returns 403 when user is not a member of the organization', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/v1/brand-tracking', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.error).toBe('Not a member of this organization')
  })

  it('returns 403 when user lacks brand-tracking:read permission', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'VIEWER',
    } as never)
    vi.mocked(hasPermission).mockReturnValue(false)

    const request = new NextRequest('http://localhost/api/v1/brand-tracking', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.error).toBe('Permission denied')
  })

  it('returns brand trackings successfully for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'ADMIN',
    } as never)

    const mockBrandTrackings = [
      {
        id: 'bt-1',
        brandName: 'Test Brand',
        status: 'ACTIVE',
        industry: 'Technology',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { snapshots: 5 },
      },
    ]
    vi.mocked(prisma.brandTracking.findMany).mockResolvedValue(mockBrandTrackings as never)
    vi.mocked(prisma.brandTracking.count).mockResolvedValue(1)

    const request = new NextRequest('http://localhost/api/v1/brand-tracking', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.data).toHaveLength(1)
    expect(data.data[0].brandName).toBe('Test Brand')
    expect(data.meta.total).toBe(1)
  })

  it('applies pagination parameters', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
    } as never)
    vi.mocked(prisma.brandTracking.findMany).mockResolvedValue([])
    vi.mocked(prisma.brandTracking.count).mockResolvedValue(50)

    const request = new NextRequest('http://localhost/api/v1/brand-tracking?page=2&limit=10', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.brandTracking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    )
  })

  it('filters by status active', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
    } as never)
    vi.mocked(prisma.brandTracking.findMany).mockResolvedValue([])
    vi.mocked(prisma.brandTracking.count).mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/v1/brand-tracking?filter=active', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.brandTracking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'ACTIVE',
        }),
      })
    )
  })

  it('filters by status paused', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
    } as never)
    vi.mocked(prisma.brandTracking.findMany).mockResolvedValue([])
    vi.mocked(prisma.brandTracking.count).mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/v1/brand-tracking?filter=paused', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.brandTracking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PAUSED',
        }),
      })
    )
  })

  it('applies search filter', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
    } as never)
    vi.mocked(prisma.brandTracking.findMany).mockResolvedValue([])
    vi.mocked(prisma.brandTracking.count).mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/v1/brand-tracking?search=acme', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.brandTracking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ brandName: { contains: 'acme', mode: 'insensitive' } }),
            expect.objectContaining({ description: { contains: 'acme', mode: 'insensitive' } }),
            expect.objectContaining({ industry: { contains: 'acme', mode: 'insensitive' } }),
          ]),
        }),
      })
    )
  })
})

describe('POST /api/v1/brand-tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(hasPermission).mockReturnValue(true)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new NextRequest('http://localhost/api/v1/brand-tracking', {
      method: 'POST',
      body: JSON.stringify({ brandName: 'Test Brand' }),
    })
    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('returns 400 for invalid request body', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'ADMIN',
    } as never)

    const request = new NextRequest('http://localhost/api/v1/brand-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({ brandName: '' }), // Empty brand name
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation error')
  })

  it('creates brand tracking successfully with valid data', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'ADMIN',
    } as never)

    const mockBrandTracking = {
      id: 'new-bt-id',
      brandName: 'New Brand',
      status: 'DRAFT',
      industry: 'Retail',
      createdAt: new Date(),
    }
    vi.mocked(prisma.brandTracking.create).mockResolvedValue(mockBrandTracking as never)

    const request = new NextRequest('http://localhost/api/v1/brand-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({
        brandName: 'New Brand',
        description: 'A test brand',
        industry: 'Retail',
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.brandName).toBe('New Brand')
  })

  it('returns 403 when user lacks brand-tracking:write permission', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'VIEWER',
    } as never)
    vi.mocked(hasPermission).mockReturnValue(false)

    const request = new NextRequest('http://localhost/api/v1/brand-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({
        brandName: 'New Brand',
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
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'ADMIN',
    } as never)

    const mockBrandTracking = {
      id: 'new-bt-id',
      brandName: 'New Brand',
      status: 'DRAFT',
      createdAt: new Date(),
    }
    vi.mocked(prisma.brandTracking.create).mockResolvedValue(mockBrandTracking as never)

    const request = new NextRequest('http://localhost/api/v1/brand-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({
        brandName: 'New Brand',
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
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'ADMIN',
    } as never)

    const mockBrandTracking = {
      id: 'new-bt-id',
      brandName: 'Full Brand',
      status: 'DRAFT',
      industry: 'Technology',
      competitors: ['Competitor A', 'Competitor B'],
      audiences: ['Gen Z', 'Millennials'],
      createdAt: new Date(),
    }
    vi.mocked(prisma.brandTracking.create).mockResolvedValue(mockBrandTracking as never)

    const request = new NextRequest('http://localhost/api/v1/brand-tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({
        brandName: 'Full Brand',
        description: 'A full test brand',
        industry: 'Technology',
        competitors: ['Competitor A', 'Competitor B'],
        audiences: ['Gen Z', 'Millennials'],
        metrics: { awareness: 0, sentiment: 0 },
        trackingConfig: { frequency: 'weekly' },
        schedule: 'weekly',
        alertThresholds: { awarenessChange: 5 },
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.brandName).toBe('Full Brand')
  })
})
