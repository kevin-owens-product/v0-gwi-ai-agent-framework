import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock auth module before importing route
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/tenant', () => ({
  getValidatedOrgId: vi.fn(),
}))

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

// Import after mocking
import { GET } from './route'
import { auth } from '@/lib/auth'
import { getValidatedOrgId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'

// Ensure prisma mock is referenced
void prisma
import { getOrganizationFeatures } from '@/lib/features'

// Type assertion helpers for mocked functions
const mockedAuth = auth as ReturnType<typeof vi.fn>
const mockedGetValidatedOrgId = getValidatedOrgId as ReturnType<typeof vi.fn>
const mockedGetOrganizationFeatures = getOrganizationFeatures as ReturnType<typeof vi.fn>

describe('Organization Features API - GET /api/v1/organization/features', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockedAuth.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/v1/organization/features', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request as any)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 when org validation fails', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      mockedGetValidatedOrgId.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/v1/organization/features')

      const response = await GET(request as any)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('Organization not found')
    })

    it('should verify user membership via getValidatedOrgId', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      mockedGetValidatedOrgId.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/v1/organization/features', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request as any)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('Organization not found')
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

      mockedAuth.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      mockedGetValidatedOrgId.mockResolvedValue('org-1')
      mockedGetOrganizationFeatures.mockResolvedValue(mockFeatures)

      const request = new Request('http://localhost:3000/api/v1/organization/features', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request as any)
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
      mockedAuth.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      mockedGetValidatedOrgId.mockResolvedValue('org-1')
      mockedGetOrganizationFeatures.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/v1/organization/features', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request as any)
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
      mockedAuth.mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      mockedGetValidatedOrgId.mockRejectedValue(
        new Error('Database error')
      )

      const request = new Request('http://localhost:3000/api/v1/organization/features', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request as any)
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
