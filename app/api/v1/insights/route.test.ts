import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createInsight, createOrganization, createMembership } from '@/tests/factories'

// Mock dependencies before importing route handlers
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    insight: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    organizationMember: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: 'org-1' })),
  })),
}))

import { GET } from './route'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

describe('GET /api/v1/insights', () => {
  const mockOrg = createOrganization({ id: 'org-1' })
  const mockMembership = createMembership({
    orgId: 'org-1',
    userId: 'user-1',
    role: 'MEMBER',
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/v1/insights')
    const response = await GET(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 404 when user has no organization memberships', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    })
    vi.mocked(prisma.organizationMember.findMany).mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/v1/insights')
    const response = await GET(request)

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.error).toBe('No organization found')
  })

  it('returns insights successfully for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    })
    vi.mocked(prisma.organizationMember.findMany).mockResolvedValue([
      {
        ...mockMembership,
        organization: mockOrg,
      },
    ] as any)

    const mockInsights = [
      createInsight({ id: 'insight-1', orgId: 'org-1', type: 'trend', title: 'Test Insight' }),
    ]

    vi.mocked(prisma.insight.findMany).mockResolvedValue(mockInsights as any)
    vi.mocked(prisma.insight.count).mockResolvedValue(1)

    const request = new NextRequest('http://localhost/api/v1/insights')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.insights).toHaveLength(1)
    expect(data.total).toBe(1)
  })

  it('applies pagination parameters', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    })
    vi.mocked(prisma.organizationMember.findMany).mockResolvedValue([
      {
        ...mockMembership,
        organization: mockOrg,
      },
    ] as any)
    vi.mocked(prisma.insight.findMany).mockResolvedValue([])
    vi.mocked(prisma.insight.count).mockResolvedValue(100)

    const request = new NextRequest('http://localhost/api/v1/insights?limit=10&offset=20')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.insight.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      })
    )
    const data = await response.json()
    expect(data.limit).toBe(10)
    expect(data.offset).toBe(20)
  })

  it('limits maximum page size to 100', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    })
    vi.mocked(prisma.organizationMember.findMany).mockResolvedValue([
      {
        ...mockMembership,
        organization: mockOrg,
      },
    ] as any)
    vi.mocked(prisma.insight.findMany).mockResolvedValue([])
    vi.mocked(prisma.insight.count).mockResolvedValue(200)

    const request = new NextRequest('http://localhost/api/v1/insights?limit=500')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.insight.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 100, // Capped at 100
      })
    )
  })

  it('filters by type when provided', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    })
    vi.mocked(prisma.organizationMember.findMany).mockResolvedValue([
      {
        ...mockMembership,
        organization: mockOrg,
      },
    ] as any)
    vi.mocked(prisma.insight.findMany).mockResolvedValue([])
    vi.mocked(prisma.insight.count).mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/v1/insights?type=trend')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.insight.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: 'trend',
        }),
      })
    )
  })

  it('filters by agentId when provided', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    })
    vi.mocked(prisma.organizationMember.findMany).mockResolvedValue([
      {
        ...mockMembership,
        organization: mockOrg,
      },
    ] as any)
    vi.mocked(prisma.insight.findMany).mockResolvedValue([])
    vi.mocked(prisma.insight.count).mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/v1/insights?agentId=agent-123')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.insight.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          agentRun: { agentId: 'agent-123' },
        }),
      })
    )
  })

  it('includes agent run and agent details in response', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    })
    vi.mocked(prisma.organizationMember.findMany).mockResolvedValue([
      {
        ...mockMembership,
        organization: mockOrg,
      },
    ] as any)
    vi.mocked(prisma.insight.findMany).mockResolvedValue([
      {
        id: 'insight-1',
        type: 'trend',
        title: 'Test',
        agentRun: {
          id: 'run-1',
          agent: {
            id: 'agent-1',
            name: 'Test Agent',
            type: 'RESEARCH',
          },
        },
      },
    ] as any)
    vi.mocked(prisma.insight.count).mockResolvedValue(1)

    const request = new NextRequest('http://localhost/api/v1/insights')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.insight.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          agentRun: expect.objectContaining({
            include: expect.objectContaining({
              agent: expect.any(Object),
            }),
          }),
        }),
      })
    )
  })

  it('orders insights by createdAt descending', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    })
    vi.mocked(prisma.organizationMember.findMany).mockResolvedValue([
      {
        ...mockMembership,
        organization: mockOrg,
      },
    ] as any)
    vi.mocked(prisma.insight.findMany).mockResolvedValue([])
    vi.mocked(prisma.insight.count).mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/v1/insights')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.insight.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    )
  })

  it('returns 500 on database error', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      expires: new Date(Date.now() + 86400000).toISOString(),
    })
    vi.mocked(prisma.organizationMember.findMany).mockRejectedValue(
      new Error('Database connection failed')
    )

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const request = new NextRequest('http://localhost/api/v1/insights')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Internal server error')

    consoleSpy.mockRestore()
  })
})
