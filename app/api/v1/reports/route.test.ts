import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies before importing route handlers
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    report: {
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

describe('GET /api/v1/reports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(hasPermission).mockReturnValue(true)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new NextRequest('http://localhost/api/v1/reports')
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

    const request = new NextRequest('http://localhost/api/v1/reports')
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

    const request = new NextRequest('http://localhost/api/v1/reports', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.error).toBe('Not a member of this organization')
  })

  it('returns 403 when user lacks reports:read permission', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'VIEWER',
    } as never)
    vi.mocked(hasPermission).mockReturnValue(false)

    const request = new NextRequest('http://localhost/api/v1/reports', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.error).toBe('Permission denied')
  })

  it('returns reports successfully for authenticated user with permission', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'ADMIN',
    } as never)

    const mockReports = [
      {
        id: 'report-1',
        title: 'Test Report',
        type: 'PRESENTATION',
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    vi.mocked(prisma.report.findMany).mockResolvedValue(mockReports as never)
    vi.mocked(prisma.report.count).mockResolvedValue(1)

    const request = new NextRequest('http://localhost/api/v1/reports', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.data).toHaveLength(1)
    expect(data.data[0].title).toBe('Test Report')
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
    vi.mocked(prisma.report.findMany).mockResolvedValue([])
    vi.mocked(prisma.report.count).mockResolvedValue(50)

    const request = new NextRequest('http://localhost/api/v1/reports?page=2&limit=10', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.report.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    )
  })

  it('filters by status', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
    } as never)
    vi.mocked(prisma.report.findMany).mockResolvedValue([])
    vi.mocked(prisma.report.count).mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/v1/reports?status=PUBLISHED', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.report.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PUBLISHED',
        }),
      })
    )
  })

  it('filters by type', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
    } as never)
    vi.mocked(prisma.report.findMany).mockResolvedValue([])
    vi.mocked(prisma.report.count).mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/v1/reports?type=DASHBOARD', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.report.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: 'DASHBOARD',
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
    vi.mocked(prisma.report.findMany).mockResolvedValue([])
    vi.mocked(prisma.report.count).mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/v1/reports?search=quarterly', {
      headers: { 'x-organization-id': 'org-1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.report.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ title: { contains: 'quarterly', mode: 'insensitive' } }),
            expect.objectContaining({ description: { contains: 'quarterly', mode: 'insensitive' } }),
          ]),
        }),
      })
    )
  })
})

describe('POST /api/v1/reports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(hasPermission).mockReturnValue(true)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new NextRequest('http://localhost/api/v1/reports', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test', type: 'PRESENTATION' }),
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

    const request = new NextRequest('http://localhost/api/v1/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({ title: '', type: 'INVALID' }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation error')
  })

  it('creates report successfully with valid data', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'ADMIN',
    } as never)

    const mockReport = {
      id: 'new-report-id',
      title: 'New Report',
      type: 'PRESENTATION',
      status: 'DRAFT',
      createdAt: new Date(),
    }
    vi.mocked(prisma.report.create).mockResolvedValue(mockReport as never)

    const request = new NextRequest('http://localhost/api/v1/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({
        title: 'New Report',
        type: 'PRESENTATION',
        description: 'A test report',
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.title).toBe('New Report')
  })

  it('returns 403 when user lacks reports:write permission', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'VIEWER',
    } as never)
    vi.mocked(hasPermission).mockReturnValue(false)

    const request = new NextRequest('http://localhost/api/v1/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({
        title: 'New Report',
        type: 'PRESENTATION',
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

    const mockReport = {
      id: 'new-report-id',
      title: 'New Report',
      type: 'PRESENTATION',
      status: 'DRAFT',
      createdAt: new Date(),
    }
    vi.mocked(prisma.report.create).mockResolvedValue(mockReport as never)

    const request = new NextRequest('http://localhost/api/v1/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-organization-id': 'org-1',
      },
      body: JSON.stringify({
        title: 'New Report',
        type: 'PRESENTATION',
      }),
    })
    await POST(request)

    expect(logAuditEvent).toHaveBeenCalled()
  })

  it('accepts all valid report types', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any)
    vi.mocked(getUserMembership).mockResolvedValue({
      id: 'member-1',
      role: 'ADMIN',
    } as never)

    const validTypes = ['PRESENTATION', 'DASHBOARD', 'PDF', 'EXPORT', 'INFOGRAPHIC']

    for (const type of validTypes) {
      vi.mocked(prisma.report.create).mockResolvedValue({
        id: 'report-id',
        title: 'Test',
        type,
        status: 'DRAFT',
        createdAt: new Date(),
      } as never)

      const request = new NextRequest('http://localhost/api/v1/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org-1',
        },
        body: JSON.stringify({
          title: 'Test Report',
          type,
        }),
      })
      const response = await POST(request)

      expect(response.status).toBe(201)
    }
  })
})
