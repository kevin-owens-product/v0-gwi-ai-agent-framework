import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  useOrganization,
  useOrganizationMember,
  useOrganizationPlan,
  useOrganizationUsage,
} from './useOrganization'
import useSWR from 'swr'

vi.mock('swr')

describe('useOrganization Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Successful Response', () => {
    it('should return organization with plan', () => {
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
      }

      vi.mocked(useSWR).mockReturnValue({
        data: mockOrganization,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganization())

      expect(result.current.organization).toEqual(mockOrganization)
      expect(result.current.organization?.plan?.tier).toBe('PROFESSIONAL')
    })

    it('should handle organization without plan', () => {
      const mockOrganization = {
        id: 'org-1',
        name: 'New Org',
        slug: 'new-org',
        planId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        plan: null,
      }

      vi.mocked(useSWR).mockReturnValue({
        data: mockOrganization,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganization())

      expect(result.current.organization?.plan).toBeNull()
    })
  })

  describe('Loading State', () => {
    it('should indicate loading state', () => {
      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: null,
        isLoading: true,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganization())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.organization).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors', () => {
      const mockError = new Error('API Error')

      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganization())

      expect(result.current.error).toBe(mockError)
    })
  })

  describe('Refresh Functionality', () => {
    it('should provide refresh function', () => {
      const mockMutate = vi.fn()

      vi.mocked(useSWR).mockReturnValue({
        data: { id: 'org-1', name: 'Test' } as any,
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganization())

      expect(result.current.refresh).toBe(mockMutate)
    })
  })
})

describe('useOrganizationMember Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Member Roles', () => {
    it('should identify OWNER role correctly', () => {
      const mockMember = {
        id: 'member-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'OWNER',
        joinedAt: new Date(),
      }

      vi.mocked(useSWR).mockReturnValue({
        data: mockMember,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationMember())

      expect(result.current.role).toBe('OWNER')
      expect(result.current.isOwner).toBe(true)
      expect(result.current.isAdmin).toBe(true)
      expect(result.current.isMember).toBe(true)
      expect(result.current.isViewer).toBe(false)
    })

    it('should identify ADMIN role correctly', () => {
      const mockMember = {
        id: 'member-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'ADMIN',
        joinedAt: new Date(),
      }

      vi.mocked(useSWR).mockReturnValue({
        data: mockMember,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationMember())

      expect(result.current.role).toBe('ADMIN')
      expect(result.current.isOwner).toBe(false)
      expect(result.current.isAdmin).toBe(true)
      expect(result.current.isMember).toBe(true)
      expect(result.current.isViewer).toBe(false)
    })

    it('should identify MEMBER role correctly', () => {
      const mockMember = {
        id: 'member-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'MEMBER',
        joinedAt: new Date(),
      }

      vi.mocked(useSWR).mockReturnValue({
        data: mockMember,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationMember())

      expect(result.current.role).toBe('MEMBER')
      expect(result.current.isOwner).toBe(false)
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.isMember).toBe(true)
      expect(result.current.isViewer).toBe(false)
    })

    it('should identify VIEWER role correctly', () => {
      const mockMember = {
        id: 'member-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'VIEWER',
        joinedAt: new Date(),
      }

      vi.mocked(useSWR).mockReturnValue({
        data: mockMember,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationMember())

      expect(result.current.role).toBe('VIEWER')
      expect(result.current.isOwner).toBe(false)
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.isMember).toBe(false)
      expect(result.current.isViewer).toBe(true)
    })
  })

  describe('Loading State', () => {
    it('should indicate loading state', () => {
      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: null,
        isLoading: true,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationMember())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.member).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors', () => {
      const mockError = new Error('API Error')

      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationMember())

      expect(result.current.error).toBe(mockError)
    })
  })
})

describe('useOrganizationPlan Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Plan Details', () => {
    it('should return plan with features', () => {
      const mockData = {
        plan: {
          id: 'plan-1',
          name: 'Professional',
          tier: 'PROFESSIONAL',
          limits: {
            teamMembers: 10,
            apiRequests: 1000,
          },
        },
        features: [
          {
            key: 'ADVANCED_ANALYTICS',
            name: 'Advanced Analytics',
            value: true,
            limit: null,
          },
          {
            key: 'API_REQUESTS',
            name: 'API Requests',
            value: true,
            limit: 1000,
          },
        ],
      }

      vi.mocked(useSWR).mockReturnValue({
        data: mockData,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationPlan())

      expect(result.current.plan?.name).toBe('Professional')
      expect(result.current.tier).toBe('PROFESSIONAL')
      expect(result.current.features).toHaveLength(2)
    })

    it('should handle plan with limits', () => {
      const mockData = {
        plan: {
          id: 'plan-1',
          name: 'Starter',
          tier: 'STARTER',
          limits: {
            teamMembers: 5,
            apiRequests: 100,
            workflows: 10,
          },
        },
        features: [],
      }

      vi.mocked(useSWR).mockReturnValue({
        data: mockData,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationPlan())

      expect(result.current.limits).toEqual({
        teamMembers: 5,
        apiRequests: 100,
        workflows: 10,
      })
    })
  })

  describe('Loading State', () => {
    it('should indicate loading state', () => {
      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: null,
        isLoading: true,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationPlan())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.features).toEqual([])
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors', () => {
      const mockError = new Error('API Error')

      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationPlan())

      expect(result.current.error).toBe(mockError)
      expect(result.current.features).toEqual([])
    })
  })
})

describe('useOrganizationUsage Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Usage Metrics', () => {
    it('should return usage data', () => {
      const mockUsage = {
        usage: {
          API_REQUESTS: 750,
          WORKFLOW_RUNS: 45,
          STORAGE_GB: 15,
        },
        counts: {
          members: 8,
          agents: 12,
          workflows: 6,
        },
        period: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
        },
      }

      vi.mocked(useSWR).mockReturnValue({
        data: mockUsage,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationUsage())

      expect(result.current.usage).toEqual(mockUsage)
      expect(result.current.usage.usage.API_REQUESTS).toBe(750)
      expect(result.current.usage.counts.members).toBe(8)
    })

    it('should handle empty usage data', () => {
      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationUsage())

      expect(result.current.usage).toEqual({})
    })
  })

  describe('Loading State', () => {
    it('should indicate loading state', () => {
      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: null,
        isLoading: true,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationUsage())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.usage).toEqual({})
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors', () => {
      const mockError = new Error('API Error')

      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationUsage())

      expect(result.current.error).toBe(mockError)
      expect(result.current.usage).toEqual({})
    })
  })

  describe('Refresh Functionality', () => {
    it('should provide refresh function', () => {
      const mockMutate = vi.fn()

      vi.mocked(useSWR).mockReturnValue({
        data: {},
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationUsage())

      expect(result.current.refresh).toBe(mockMutate)
    })
  })
})
