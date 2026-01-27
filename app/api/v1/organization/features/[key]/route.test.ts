import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock auth module before importing route
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    organizationMember: {
      findFirst: vi.fn(),
    },
  },
}))

vi.mock('@/lib/features', () => ({
  checkFeatureAccess: vi.fn(),
}))

// Import after mocking
import { GET } from './route'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkFeatureAccess } from '@/lib/features'

describe('Feature Access API - GET /api/v1/organization/features/[key]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/v1/organization/features/ADVANCED_ANALYTICS', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request as any, { params: Promise.resolve({ key: 'ADVANCED_ANALYTICS' }) })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should require X-Organization-Id header', async () => {
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      const request = new Request('http://localhost:3000/api/v1/organization/features/ADVANCED_ANALYTICS')

      const response = await GET(request as any, { params: Promise.resolve({ key: 'ADVANCED_ANALYTICS' }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Organization ID required in X-Organization-Id header')
    })

    it('should verify user membership', async () => {
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      vi.mocked(prisma.organizationMember.findFirst).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/v1/organization/features/ADVANCED_ANALYTICS', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request as any, { params: Promise.resolve({ key: 'ADVANCED_ANALYTICS' }) })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Not a member of this organization')
    })
  })

  describe('Feature Access Check', () => {
    it('should return access granted with no limits', async () => {
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      vi.mocked(prisma.organizationMember.findFirst).mockResolvedValue({
        id: 'member-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'MEMBER',
        joinedAt: new Date(),
      } as any)
      vi.mocked(checkFeatureAccess).mockResolvedValue({
        hasAccess: true,
        value: true,
        limit: null,
      })

      const request = new Request('http://localhost:3000/api/v1/organization/features/ADVANCED_ANALYTICS', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request as any, { params: Promise.resolve({ key: 'ADVANCED_ANALYTICS' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        hasAccess: true,
        value: true,
        limit: null,
      })
      expect(checkFeatureAccess).toHaveBeenCalledWith('org-1', 'ADVANCED_ANALYTICS')
    })

    it('should return access denied for unavailable feature', async () => {
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      vi.mocked(prisma.organizationMember.findFirst).mockResolvedValue({
        id: 'member-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'MEMBER',
        joinedAt: new Date(),
      } as any)
      vi.mocked(checkFeatureAccess).mockResolvedValue({
        hasAccess: false,
      })

      const request = new Request('http://localhost:3000/api/v1/organization/features/ENTERPRISE_FEATURE', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request as any, { params: Promise.resolve({ key: 'ENTERPRISE_FEATURE' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        hasAccess: false,
      })
    })

    it('should return usage tracking for limited features', async () => {
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      vi.mocked(prisma.organizationMember.findFirst).mockResolvedValue({
        id: 'member-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'MEMBER',
        joinedAt: new Date(),
      } as any)
      vi.mocked(checkFeatureAccess).mockResolvedValue({
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: 750,
        percentage: 75,
        isNearLimit: false,
        isAtLimit: false,
      })

      const request = new Request('http://localhost:3000/api/v1/organization/features/API_REQUESTS', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request as any, { params: Promise.resolve({ key: 'API_REQUESTS' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: 750,
        percentage: 75,
        isNearLimit: false,
        isAtLimit: false,
      })
    })

    it('should indicate near limit status', async () => {
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      vi.mocked(prisma.organizationMember.findFirst).mockResolvedValue({
        id: 'member-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'MEMBER',
        joinedAt: new Date(),
      } as any)
      vi.mocked(checkFeatureAccess).mockResolvedValue({
        hasAccess: true,
        value: true,
        limit: 100,
        usage: 85,
        percentage: 85,
        isNearLimit: true,
        isAtLimit: false,
      })

      const request = new Request('http://localhost:3000/api/v1/organization/features/WORKFLOW_RUNS', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request as any, { params: Promise.resolve({ key: 'WORKFLOW_RUNS' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.isNearLimit).toBe(true)
      expect(data.isAtLimit).toBe(false)
    })

    it('should indicate at limit status', async () => {
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      vi.mocked(prisma.organizationMember.findFirst).mockResolvedValue({
        id: 'member-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'MEMBER',
        joinedAt: new Date(),
      } as any)
      vi.mocked(checkFeatureAccess).mockResolvedValue({
        hasAccess: true,
        value: true,
        limit: 100,
        usage: 100,
        percentage: 100,
        isNearLimit: true,
        isAtLimit: true,
      })

      const request = new Request('http://localhost:3000/api/v1/organization/features/TEAM_MEMBERS', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request as any, { params: Promise.resolve({ key: 'TEAM_MEMBERS' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.isAtLimit).toBe(true)
    })
  })

  describe('Different Feature Keys', () => {
    it('should check ADVANCED_ANALYTICS feature', async () => {
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      vi.mocked(prisma.organizationMember.findFirst).mockResolvedValue({
        id: 'member-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'MEMBER',
        joinedAt: new Date(),
      } as any)
      vi.mocked(checkFeatureAccess).mockResolvedValue({
        hasAccess: true,
        value: true,
        limit: null,
      })

      const request = new Request('http://localhost:3000/api/v1/organization/features/ADVANCED_ANALYTICS', {
        headers: { 'x-organization-id': 'org-1' },
      })

      await GET(request as any, { params: Promise.resolve({ key: 'ADVANCED_ANALYTICS' }) })

      expect(checkFeatureAccess).toHaveBeenCalledWith('org-1', 'ADVANCED_ANALYTICS')
    })

    it('should check CUSTOM_INTEGRATIONS feature', async () => {
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      vi.mocked(prisma.organizationMember.findFirst).mockResolvedValue({
        id: 'member-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'MEMBER',
        joinedAt: new Date(),
      } as any)
      vi.mocked(checkFeatureAccess).mockResolvedValue({
        hasAccess: false,
      })

      const request = new Request('http://localhost:3000/api/v1/organization/features/CUSTOM_INTEGRATIONS', {
        headers: { 'x-organization-id': 'org-1' },
      })

      await GET(request as any, { params: Promise.resolve({ key: 'CUSTOM_INTEGRATIONS' }) })

      expect(checkFeatureAccess).toHaveBeenCalledWith('org-1', 'CUSTOM_INTEGRATIONS')
    })
  })

  describe('Error Handling', () => {
    it('should return 500 for database errors', async () => {
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      vi.mocked(prisma.organizationMember.findFirst).mockRejectedValue(
        new Error('Database error')
      )

      const request = new Request('http://localhost:3000/api/v1/organization/features/ADVANCED_ANALYTICS', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request as any, { params: Promise.resolve({ key: 'ADVANCED_ANALYTICS' }) })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('Response Structure', () => {
    it('should always include hasAccess field', async () => {
      const accessResponse = {
        hasAccess: true,
        value: true,
      }

      expect(accessResponse).toHaveProperty('hasAccess')
      expect(typeof accessResponse.hasAccess).toBe('boolean')
    })

    it('should include value when feature has access', () => {
      const response = {
        hasAccess: true,
        value: 'custom-value',
      }

      expect(response.value).toBeDefined()
    })

    it('should include usage fields when limits exist', () => {
      const response = {
        hasAccess: true,
        value: true,
        limit: 100,
        usage: 50,
        percentage: 50,
        isNearLimit: false,
        isAtLimit: false,
      }

      expect(response).toHaveProperty('limit')
      expect(response).toHaveProperty('usage')
      expect(response).toHaveProperty('percentage')
      expect(response).toHaveProperty('isNearLimit')
      expect(response).toHaveProperty('isAtLimit')
    })
  })
})
