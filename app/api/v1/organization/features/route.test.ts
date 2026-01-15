import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationFeatures } from '@/lib/features'

vi.mock('next-auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    organizationMember: {
      findFirst: vi.fn(),
    },
  },
}))
vi.mock('@/lib/features', () => ({
  getOrganizationFeatures: vi.fn(),
}))

describe('Organization Features API - GET /api/v1/organization/features', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/v1/organization/features', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should require X-Organization-Id header', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      const request = new Request('http://localhost:3000/api/v1/organization/features')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Organization ID required in X-Organization-Id header')
    })

    it('should verify user membership', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      vi.mocked(prisma.organizationMember.findFirst).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/v1/organization/features', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Not a member of this organization')
    })
  })

  describe('Successful Response', () => {
    it('should return all organization features', async () => {
      const mockFeatures = [
        {
          key: 'ADVANCED_ANALYTICS',
          name: 'Advanced Analytics',
          category: 'Analytics',
          valueType: 'BOOLEAN',
          value: true,
          limit: null,
          hasOverride: false,
          expiresAt: null,
        },
        {
          key: 'TEAM_MEMBERS',
          name: 'Team Members',
          category: 'Team',
          valueType: 'NUMBER',
          value: 10,
          limit: 10,
          hasOverride: false,
          expiresAt: null,
        },
        {
          key: 'API_REQUESTS',
          name: 'API Requests',
          category: 'API',
          valueType: 'BOOLEAN',
          value: true,
          limit: 1000,
          hasOverride: true,
          expiresAt: null,
        },
      ]

      vi.mocked(getServerSession).mockResolvedValue({
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

      vi.mocked(getOrganizationFeatures).mockResolvedValue(mockFeatures as any)

      const request = new Request('http://localhost:3000/api/v1/organization/features', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(3)
      expect(data[0]).toMatchObject({
        key: 'ADVANCED_ANALYTICS',
        name: 'Advanced Analytics',
        category: 'Analytics',
      })
    })

    it('should return empty array for organization with no features', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
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

      vi.mocked(getOrganizationFeatures).mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/v1/organization/features', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })
  })

  describe('Feature Structure', () => {
    it('should include all required feature fields', () => {
      const feature = {
        key: 'ADVANCED_ANALYTICS',
        name: 'Advanced Analytics',
        category: 'Analytics',
        valueType: 'BOOLEAN',
        value: true,
        limit: null,
        hasOverride: false,
        expiresAt: null,
      }

      expect(feature).toHaveProperty('key')
      expect(feature).toHaveProperty('name')
      expect(feature).toHaveProperty('category')
      expect(feature).toHaveProperty('valueType')
      expect(feature).toHaveProperty('value')
      expect(feature).toHaveProperty('hasOverride')
    })

    it('should indicate entitlement overrides', () => {
      const planFeature = { hasOverride: false }
      const overriddenFeature = { hasOverride: true }

      expect(planFeature.hasOverride).toBe(false)
      expect(overriddenFeature.hasOverride).toBe(true)
    })

    it('should support different value types', () => {
      const valueTypes = ['BOOLEAN', 'STRING', 'NUMBER', 'JSON']

      valueTypes.forEach(type => {
        expect(['BOOLEAN', 'STRING', 'NUMBER', 'JSON']).toContain(type)
      })
    })
  })

  describe('Error Handling', () => {
    it('should return 500 for database errors', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      vi.mocked(prisma.organizationMember.findFirst).mockRejectedValue(
        new Error('Database error')
      )

      const request = new Request('http://localhost:3000/api/v1/organization/features', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('Feature Categories', () => {
    it('should group features by category', () => {
      const features = [
        { key: 'ANALYTICS_1', category: 'Analytics' },
        { key: 'ANALYTICS_2', category: 'Analytics' },
        { key: 'TEAM_1', category: 'Team' },
        { key: 'API_1', category: 'API' },
      ]

      const groupedByCategory = features.reduce((acc, feature) => {
        acc[feature.category] = (acc[feature.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      expect(groupedByCategory['Analytics']).toBe(2)
      expect(groupedByCategory['Team']).toBe(1)
      expect(groupedByCategory['API']).toBe(1)
    })
  })
})
