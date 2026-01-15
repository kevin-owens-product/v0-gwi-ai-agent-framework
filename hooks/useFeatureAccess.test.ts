import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useFeatureAccess, useOrganizationFeatures } from './useFeatureAccess'
import useSWR from 'swr'

vi.mock('swr')

describe('useFeatureAccess Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Successful Feature Access', () => {
    it('should return feature access data', async () => {
      const mockData = {
        hasAccess: true,
        value: true,
        limit: null,
      }

      vi.mocked(useSWR).mockReturnValue({
        data: mockData,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useFeatureAccess('ADVANCED_ANALYTICS'))

      expect(result.current.hasAccess).toBe(true)
      expect(result.current.value).toBe(true)
      expect(result.current.limit).toBeNull()
    })

    it('should return limited feature with usage tracking', async () => {
      const mockData = {
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: 750,
        percentage: 75,
        isNearLimit: false,
        isAtLimit: false,
      }

      vi.mocked(useSWR).mockReturnValue({
        data: mockData,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useFeatureAccess('API_REQUESTS'))

      expect(result.current.hasAccess).toBe(true)
      expect(result.current.limit).toBe(1000)
      expect(result.current.usage).toBe(750)
      expect(result.current.percentage).toBe(75)
      expect(result.current.isNearLimit).toBe(false)
      expect(result.current.isAtLimit).toBe(false)
    })

    it('should indicate near limit status', async () => {
      const mockData = {
        hasAccess: true,
        value: true,
        limit: 100,
        usage: 85,
        percentage: 85,
        isNearLimit: true,
        isAtLimit: false,
      }

      vi.mocked(useSWR).mockReturnValue({
        data: mockData,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useFeatureAccess('WORKFLOW_RUNS'))

      expect(result.current.isNearLimit).toBe(true)
      expect(result.current.isAtLimit).toBe(false)
    })

    it('should indicate at limit status', async () => {
      const mockData = {
        hasAccess: true,
        value: true,
        limit: 100,
        usage: 100,
        percentage: 100,
        isNearLimit: true,
        isAtLimit: true,
      }

      vi.mocked(useSWR).mockReturnValue({
        data: mockData,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useFeatureAccess('TEAM_MEMBERS'))

      expect(result.current.isNearLimit).toBe(true)
      expect(result.current.isAtLimit).toBe(true)
    })
  })

  describe('Access Denied', () => {
    it('should return no access when feature is not available', async () => {
      const mockData = {
        hasAccess: false,
      }

      vi.mocked(useSWR).mockReturnValue({
        data: mockData,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useFeatureAccess('ENTERPRISE_FEATURE'))

      expect(result.current.hasAccess).toBe(false)
      expect(result.current.value).toBeUndefined()
    })

    it('should default to no access when data is undefined', async () => {
      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useFeatureAccess('UNKNOWN_FEATURE'))

      expect(result.current.hasAccess).toBe(false)
      expect(result.current.percentage).toBe(0)
      expect(result.current.isNearLimit).toBe(false)
      expect(result.current.isAtLimit).toBe(false)
    })
  })

  describe('Loading State', () => {
    it('should indicate loading state', async () => {
      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: null,
        isLoading: true,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useFeatureAccess('ADVANCED_ANALYTICS'))

      expect(result.current.isLoading).toBe(true)
      expect(result.current.hasAccess).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const mockError = new Error('API Error')

      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useFeatureAccess('ADVANCED_ANALYTICS'))

      expect(result.current.error).toBe(mockError)
      expect(result.current.hasAccess).toBe(false)
    })
  })

  describe('API Endpoint', () => {
    it('should call correct endpoint for feature key', () => {
      vi.mocked(useSWR).mockReturnValue({
        data: { hasAccess: true },
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      renderHook(() => useFeatureAccess('ADVANCED_ANALYTICS'))

      expect(useSWR).toHaveBeenCalledWith(
        '/api/v1/organization/features/ADVANCED_ANALYTICS',
        expect.any(Function)
      )
    })

    it('should not call endpoint when feature key is empty', () => {
      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      renderHook(() => useFeatureAccess(''))

      expect(useSWR).toHaveBeenCalledWith(null, expect.any(Function))
    })
  })

  describe('Refresh Functionality', () => {
    it('should provide refresh function', () => {
      const mockMutate = vi.fn()

      vi.mocked(useSWR).mockReturnValue({
        data: { hasAccess: true },
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useFeatureAccess('ADVANCED_ANALYTICS'))

      expect(result.current.refresh).toBe(mockMutate)
    })
  })

  describe('Different Feature Keys', () => {
    it('should check ADVANCED_ANALYTICS', () => {
      vi.mocked(useSWR).mockReturnValue({
        data: { hasAccess: true, value: true },
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      renderHook(() => useFeatureAccess('ADVANCED_ANALYTICS'))

      expect(useSWR).toHaveBeenCalledWith(
        '/api/v1/organization/features/ADVANCED_ANALYTICS',
        expect.any(Function)
      )
    })

    it('should check CUSTOM_INTEGRATIONS', () => {
      vi.mocked(useSWR).mockReturnValue({
        data: { hasAccess: false },
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      renderHook(() => useFeatureAccess('CUSTOM_INTEGRATIONS'))

      expect(useSWR).toHaveBeenCalledWith(
        '/api/v1/organization/features/CUSTOM_INTEGRATIONS',
        expect.any(Function)
      )
    })

    it('should check TEAM_MEMBERS', () => {
      vi.mocked(useSWR).mockReturnValue({
        data: { hasAccess: true, value: 10, limit: 10 },
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      renderHook(() => useFeatureAccess('TEAM_MEMBERS'))

      expect(useSWR).toHaveBeenCalledWith(
        '/api/v1/organization/features/TEAM_MEMBERS',
        expect.any(Function)
      )
    })
  })
})

describe('useOrganizationFeatures Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Successful Response', () => {
    it('should return list of features', () => {
      const mockFeatures = [
        {
          key: 'ADVANCED_ANALYTICS',
          name: 'Advanced Analytics',
          category: 'Analytics',
          valueType: 'BOOLEAN',
          value: true,
          limit: null,
          hasOverride: false,
        },
        {
          key: 'API_REQUESTS',
          name: 'API Requests',
          category: 'API',
          valueType: 'BOOLEAN',
          value: true,
          limit: 1000,
          hasOverride: false,
        },
      ]

      vi.mocked(useSWR).mockReturnValue({
        data: mockFeatures,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationFeatures())

      expect(result.current.features).toHaveLength(2)
      expect(result.current.features[0].key).toBe('ADVANCED_ANALYTICS')
      expect(result.current.features[1].key).toBe('API_REQUESTS')
    })

    it('should return empty array when data is undefined', () => {
      vi.mocked(useSWR).mockReturnValue({
        data: undefined,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationFeatures())

      expect(result.current.features).toEqual([])
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

      const { result } = renderHook(() => useOrganizationFeatures())

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

      const { result } = renderHook(() => useOrganizationFeatures())

      expect(result.current.error).toBe(mockError)
      expect(result.current.features).toEqual([])
    })
  })

  describe('API Endpoint', () => {
    it('should call correct endpoint', () => {
      vi.mocked(useSWR).mockReturnValue({
        data: [],
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      renderHook(() => useOrganizationFeatures())

      expect(useSWR).toHaveBeenCalledWith(
        '/api/v1/organization/features',
        expect.any(Function)
      )
    })
  })

  describe('Refresh Functionality', () => {
    it('should provide refresh function', () => {
      const mockMutate = vi.fn()

      vi.mocked(useSWR).mockReturnValue({
        data: [],
        error: null,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationFeatures())

      expect(result.current.refresh).toBe(mockMutate)
    })
  })

  describe('Feature Structure', () => {
    it('should include feature metadata', () => {
      const mockFeatures = [
        {
          key: 'TEST_FEATURE',
          name: 'Test Feature',
          category: 'Testing',
          valueType: 'BOOLEAN',
          value: true,
          limit: 100,
          hasOverride: true,
          expiresAt: null,
        },
      ]

      vi.mocked(useSWR).mockReturnValue({
        data: mockFeatures,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      } as any)

      const { result } = renderHook(() => useOrganizationFeatures())

      const feature = result.current.features[0]
      expect(feature).toHaveProperty('key')
      expect(feature).toHaveProperty('name')
      expect(feature).toHaveProperty('category')
      expect(feature).toHaveProperty('valueType')
      expect(feature).toHaveProperty('value')
      expect(feature).toHaveProperty('limit')
      expect(feature).toHaveProperty('hasOverride')
    })
  })
})
