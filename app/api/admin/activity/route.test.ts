/**
 * @prompt-id forge-v4.1:feature:admin-activity:011
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {},
}))

vi.mock('@/lib/super-admin', () => ({
  validateSuperAdminSession: vi.fn(),
}))

vi.mock('@/lib/admin-activity', () => ({
  getRecentActivities: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === 'adminToken') return { value: 'test-token' }
      return null
    }),
  })),
}))

import { GET } from './route'
import { validateSuperAdminSession } from '@/lib/super-admin'
import { getRecentActivities } from '@/lib/admin-activity'

describe('GET /api/admin/activity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if no token is provided', async () => {
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockReturnValueOnce({
      get: vi.fn(() => undefined),
    } as any)

    const request = new NextRequest('http://localhost/api/admin/activity')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 401 if session is invalid', async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce(null)

    const request = new NextRequest('http://localhost/api/admin/activity')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return activities on success', async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce({
      admin: { id: 'admin-1', role: 'SUPER_ADMIN' },
    } as any)

    vi.mocked(getRecentActivities).mockResolvedValueOnce({
      activities: [
        {
          id: 'activity-1',
          adminId: 'admin-1',
          action: 'user.create',
          resourceType: 'user',
          resourceId: 'user-1',
          status: 'success',
          createdAt: new Date(),
          ipAddress: null,
          userAgent: null,
          description: 'Created user',
          metadata: {},
          duration: null,
          errorMessage: null,
          admin: { id: 'admin-1', name: 'Test Admin', email: 'admin@test.com', role: 'ADMIN' },
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
      totalPages: 1,
    })

    const request = new NextRequest('http://localhost/api/admin/activity')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.activities).toHaveLength(1)
    expect(data.total).toBe(1)
  })

  it('should pass query parameters to getRecentActivities', async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce({
      admin: { id: 'admin-1', role: 'SUPER_ADMIN' },
    } as any)

    vi.mocked(getRecentActivities).mockResolvedValueOnce({
      activities: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    })

    const request = new NextRequest(
      'http://localhost/api/admin/activity?page=2&limit=10&adminId=admin-123&action=user.create&resourceType=user'
    )
    await GET(request)

    expect(getRecentActivities).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 10,
        adminId: 'admin-123',
        action: 'user.create',
        resourceType: 'user',
      })
    )
  })

  it('should handle date range filters', async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce({
      admin: { id: 'admin-1', role: 'SUPER_ADMIN' },
    } as any)

    vi.mocked(getRecentActivities).mockResolvedValueOnce({
      activities: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    })

    const startDate = '2024-01-01'
    const endDate = '2024-12-31'
    const request = new NextRequest(
      `http://localhost/api/admin/activity?startDate=${startDate}&endDate=${endDate}`
    )
    await GET(request)

    expect(getRecentActivities).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })
    )
  })
})
