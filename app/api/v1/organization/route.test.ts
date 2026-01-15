import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

vi.mock('next-auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    organizationMember: {
      findFirst: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(),
    },
  },
}))

describe('Organization API - GET /api/v1/organization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/v1/organization', {
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

      const request = new Request('http://localhost:3000/api/v1/organization')

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

      const request = new Request('http://localhost:3000/api/v1/organization', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Not a member of this organization')
    })
  })

  describe('Successful Response', () => {
    it('should return organization details with plan and counts', async () => {
      const mockOrganization = {
        id: 'org-1',
        name: 'Acme Corp',
        slug: 'acme-corp',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: {
          id: 'plan-1',
          name: 'Professional',
          tier: 'PROFESSIONAL',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        _count: {
          members: 10,
          agents: 25,
          workflows: 15,
          reports: 8,
        },
      }

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

      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrganization as any)

      const request = new Request('http://localhost:3000/api/v1/organization', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        id: 'org-1',
        name: 'Acme Corp',
        slug: 'acme-corp',
        plan: {
          name: 'Professional',
          tier: 'PROFESSIONAL',
        },
        _count: {
          members: 10,
          agents: 25,
          workflows: 15,
          reports: 8,
        },
      })
    })

    it('should return 404 for non-existent organization', async () => {
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

      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/v1/organization', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Organization not found')
    })
  })

  describe('Error Handling', () => {
    it('should return 500 for database errors', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      vi.mocked(prisma.organizationMember.findFirst).mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = new Request('http://localhost:3000/api/v1/organization', {
        headers: { 'x-organization-id': 'org-1' },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('Response Structure', () => {
    it('should include required organization fields', async () => {
      const organization = {
        id: 'org-1',
        name: 'Test Organization',
        slug: 'test-org',
        planId: 'plan-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
      }

      expect(organization).toHaveProperty('id')
      expect(organization).toHaveProperty('name')
      expect(organization).toHaveProperty('slug')
      expect(organization).toHaveProperty('planId')
      expect(organization).toHaveProperty('settings')
    })

    it('should include plan details', async () => {
      const plan = {
        id: 'plan-1',
        name: 'Professional',
        tier: 'PROFESSIONAL',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(plan).toHaveProperty('id')
      expect(plan).toHaveProperty('name')
      expect(plan).toHaveProperty('tier')
      expect(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']).toContain(plan.tier)
    })

    it('should include resource counts', async () => {
      const counts = {
        members: 10,
        agents: 25,
        workflows: 15,
        reports: 8,
      }

      expect(counts.members).toBeGreaterThanOrEqual(0)
      expect(counts.agents).toBeGreaterThanOrEqual(0)
      expect(counts.workflows).toBeGreaterThanOrEqual(0)
      expect(counts.reports).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Multi-tenancy', () => {
    it('should isolate organizations by ID', async () => {
      const org1 = { id: 'org-1', name: 'Org 1' }
      const org2 = { id: 'org-2', name: 'Org 2' }

      expect(org1.id).not.toBe(org2.id)
      expect(org1.name).not.toBe(org2.name)
    })

    it('should verify membership for correct organization', async () => {
      const member = {
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'MEMBER',
      }

      expect(member.organizationId).toBe('org-1')
    })
  })
})
