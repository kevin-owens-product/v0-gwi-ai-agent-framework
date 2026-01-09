import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createUser, createOrganization as createOrgFactory, createMembership, createBillingSubscription } from '@/tests/factories'

// Mock Prisma
vi.mock('./db', () => ({
  prisma: {
    organization: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    organizationMember: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    billingSubscription: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback({
      organization: {
        create: vi.fn(),
      },
      organizationMember: {
        create: vi.fn(),
      },
      billingSubscription: {
        create: vi.fn(),
      },
    })),
  },
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

import { prisma } from './db'
import { headers } from 'next/headers'
import {
  getCurrentOrganization,
  getUserOrganizations,
  getUserMembership,
  getOrganizationById,
  getOrganizationBySlug,
  createOrganization,
  isSlugAvailable,
  generateUniqueSlug,
} from './tenant'

describe('tenant utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentOrganization', () => {
    it('returns null for www subdomain', async () => {
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn().mockReturnValue('www.gwi-platform.com'),
      } as any)

      const result = await getCurrentOrganization()
      expect(result).toBeNull()
    })

    it('returns null for app subdomain', async () => {
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn().mockReturnValue('app.gwi-platform.com'),
      } as any)

      const result = await getCurrentOrganization()
      expect(result).toBeNull()
    })

    it('returns null for localhost', async () => {
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn().mockReturnValue('localhost:3000'),
      } as any)

      // localhost:3000.split('.')[0] = 'localhost:3000', not in excluded list
      // but no org will be found with that slug, so it returns null from findUnique
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)

      const result = await getCurrentOrganization()
      expect(result).toBeNull()
    })

    it('returns null when host header is missing', async () => {
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn().mockReturnValue(null),
      } as any)

      const result = await getCurrentOrganization()
      expect(result).toBeNull()
    })

    it('fetches organization by subdomain slug', async () => {
      const mockOrg = createOrgFactory({ slug: 'acme' })
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn().mockReturnValue('acme.gwi-platform.com'),
      } as any)
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any)

      const result = await getCurrentOrganization()

      expect(prisma.organization.findUnique).toHaveBeenCalledWith({
        where: { slug: 'acme' },
        include: {
          subscription: true,
          ssoConfig: true,
        },
      })
      expect(result).toEqual(mockOrg)
    })

    it('returns null when organization not found', async () => {
      vi.mocked(headers).mockResolvedValue({
        get: vi.fn().mockReturnValue('unknown.gwi-platform.com'),
      } as any)
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)

      const result = await getCurrentOrganization()
      expect(result).toBeNull()
    })
  })

  describe('getUserOrganizations', () => {
    it('returns organizations with roles for user', async () => {
      const mockOrg = createOrgFactory()
      const mockMembership = createMembership({ role: 'ADMIN' })
      vi.mocked(prisma.organizationMember.findMany).mockResolvedValue([
        {
          ...mockMembership,
          organization: mockOrg,
        },
      ] as any)

      const result = await getUserOrganizations('user-1')

      expect(prisma.organizationMember.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          organization: {
            include: {
              subscription: true,
            },
          },
        },
      })
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('role', 'ADMIN')
    })

    it('returns empty array when user has no memberships', async () => {
      vi.mocked(prisma.organizationMember.findMany).mockResolvedValue([])

      const result = await getUserOrganizations('user-without-orgs')
      expect(result).toEqual([])
    })
  })

  describe('getUserMembership', () => {
    it('returns membership for user in organization', async () => {
      const mockMembership = createMembership({ role: 'MEMBER' })
      vi.mocked(prisma.organizationMember.findUnique).mockResolvedValue(mockMembership as any)

      const result = await getUserMembership('user-1', 'org-1')

      expect(prisma.organizationMember.findUnique).toHaveBeenCalledWith({
        where: {
          orgId_userId: { orgId: 'org-1', userId: 'user-1' },
        },
      })
      expect(result).toEqual(mockMembership)
    })

    it('returns null when user is not a member', async () => {
      vi.mocked(prisma.organizationMember.findUnique).mockResolvedValue(null)

      const result = await getUserMembership('user-1', 'org-1')
      expect(result).toBeNull()
    })
  })

  describe('getOrganizationById', () => {
    it('returns organization with counts and relations', async () => {
      const mockOrg = createOrgFactory()
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        ...mockOrg,
        _count: { members: 5, agents: 10, dataSources: 3 },
      } as any)

      const result = await getOrganizationById('org-1')

      expect(prisma.organization.findUnique).toHaveBeenCalledWith({
        where: { id: 'org-1' },
        include: {
          subscription: true,
          ssoConfig: true,
          _count: {
            select: {
              members: true,
              agents: true,
              dataSources: true,
            },
          },
        },
      })
      expect(result).toHaveProperty('_count')
    })
  })

  describe('getOrganizationBySlug', () => {
    it('returns organization by slug', async () => {
      const mockOrg = createOrgFactory({ slug: 'acme' })
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any)

      const result = await getOrganizationBySlug('acme')

      expect(prisma.organization.findUnique).toHaveBeenCalledWith({
        where: { slug: 'acme' },
        include: {
          subscription: true,
          ssoConfig: true,
        },
      })
      expect(result).toEqual(mockOrg)
    })
  })

  describe('createOrganization', () => {
    it('creates organization with owner and billing subscription', async () => {
      const mockOrg = createOrgFactory({ name: 'Acme Inc', slug: 'acme-inc' })

      // Mock transaction to actually execute the callback and return the org
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          organization: {
            create: vi.fn().mockReturnValue(Promise.resolve(mockOrg)),
          },
          organizationMember: {
            create: vi.fn().mockReturnValue(Promise.resolve({})),
          },
          billingSubscription: {
            create: vi.fn().mockReturnValue(Promise.resolve({})),
          },
        }
        return await callback(tx)
      })

      const result = await createOrganization({
        name: 'Acme Inc',
        slug: 'acme-inc',
        userId: 'user-1',
      })

      expect(result).toEqual(mockOrg)
    })

    it('sanitizes slug to lowercase and alphanumeric', async () => {
      const mockOrg = createOrgFactory({ slug: 'test-company--special-' })
      let capturedSlug = ''

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          organization: {
            create: vi.fn().mockImplementation(async ({ data }) => {
              capturedSlug = data.slug
              return mockOrg
            }),
          },
          organizationMember: {
            create: vi.fn().mockReturnValue(Promise.resolve({})),
          },
          billingSubscription: {
            create: vi.fn().mockReturnValue(Promise.resolve({})),
          },
        }
        return await callback(tx)
      })

      await createOrganization({
        name: 'Test Company',
        slug: 'Test Company @Special!',
        userId: 'user-1',
      })

      expect(capturedSlug).toBe('test-company--special-')
    })
  })

  describe('isSlugAvailable', () => {
    it('returns true when slug is available', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)

      const result = await isSlugAvailable('new-org')

      expect(prisma.organization.findUnique).toHaveBeenCalledWith({
        where: { slug: 'new-org' },
        select: { id: true },
      })
      expect(result).toBe(true)
    })

    it('returns false when slug is taken', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({ id: 'org-1' } as any)

      const result = await isSlugAvailable('existing-org')
      expect(result).toBe(false)
    })

    it('converts slug to lowercase before checking', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)

      await isSlugAvailable('MyOrg')

      expect(prisma.organization.findUnique).toHaveBeenCalledWith({
        where: { slug: 'myorg' },
        select: { id: true },
      })
    })
  })

  describe('generateUniqueSlug', () => {
    it('returns base slug when available', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)

      const result = await generateUniqueSlug('Acme Inc')

      expect(result).toBe('acme-inc')
    })

    it('appends counter when base slug is taken', async () => {
      vi.mocked(prisma.organization.findUnique)
        .mockResolvedValueOnce({ id: 'org-1' } as any) // acme taken
        .mockResolvedValueOnce({ id: 'org-2' } as any) // acme-1 taken
        .mockResolvedValue(null) // acme-2 available

      const result = await generateUniqueSlug('Acme')

      expect(result).toBe('acme-2')
    })

    it('removes special characters from slug', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)

      const result = await generateUniqueSlug('Test@Company!#123')

      expect(result).toBe('test-company-123')
    })

    it('handles leading and trailing hyphens', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)

      const result = await generateUniqueSlug('--Test--')

      expect(result).toBe('test')
    })

    it('collapses multiple hyphens', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null)

      const result = await generateUniqueSlug('Test   Company')

      expect(result).toBe('test-company')
    })
  })
})
