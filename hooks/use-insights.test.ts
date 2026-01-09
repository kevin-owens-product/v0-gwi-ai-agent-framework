import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useInsights, useInsight } from './use-insights'
import { createOrganizationContext } from '@/tests/factories'
import { server } from '@/tests/mocks/server'

// Mock use-organization hook
const mockOrg = createOrganizationContext({ id: 'org-1', name: 'Test Org' })

vi.mock('./use-organization', () => ({
  useCurrentOrg: () => ({ org: mockOrg, isLoading: false }),
}))

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('useInsights', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchInsights', () => {
    it('fetches insights with organization header', async () => {
      server.use(
        http.get('/api/v1/insights', ({ request }) => {
          const orgId = request.headers.get('x-organization-id')
          expect(orgId).toBe('org-1')
          return HttpResponse.json({
            data: [{ id: 'insight-1', type: 'trend', title: 'Test Insight', confidenceScore: 0.9 }],
            meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
          })
        })
      )

      const { result } = renderHook(() => useInsights())

      await act(async () => {
        await result.current.fetchInsights()
      })

      expect(result.current.insights).toHaveLength(1)
      expect(result.current.insights[0].title).toBe('Test Insight')
    })

    it('updates insights state on successful fetch', async () => {
      server.use(
        http.get('/api/v1/insights', () => {
          return HttpResponse.json({
            data: [
              { id: 'insight-1', type: 'trend', title: 'Insight 1', confidenceScore: 0.9 },
              { id: 'insight-2', type: 'anomaly', title: 'Insight 2', confidenceScore: 0.85 },
            ],
            meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
          })
        })
      )

      const { result } = renderHook(() => useInsights())

      await act(async () => {
        await result.current.fetchInsights()
      })

      expect(result.current.insights).toHaveLength(2)
      expect(result.current.meta.total).toBe(2)
    })

    it('applies filters to fetch request', async () => {
      let capturedUrl = ''

      server.use(
        http.get('/api/v1/insights', ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({
            data: [],
            meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
          })
        })
      )

      const { result } = renderHook(() => useInsights({
        agentId: 'agent-1',
        type: 'trend',
        minConfidence: 0.8,
      }))

      await act(async () => {
        await result.current.fetchInsights()
      })

      expect(capturedUrl).toContain('agentId=agent-1')
      expect(capturedUrl).toContain('type=trend')
      expect(capturedUrl).toContain('minConfidence=0.8')
    })

    it('applies date filters to request', async () => {
      let capturedUrl = ''
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      server.use(
        http.get('/api/v1/insights', ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({
            data: [],
            meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
          })
        })
      )

      const { result } = renderHook(() => useInsights({
        startDate,
        endDate,
      }))

      await act(async () => {
        await result.current.fetchInsights()
      })

      expect(capturedUrl).toContain('startDate=')
      expect(capturedUrl).toContain('endDate=')
    })

    it('supports pagination', async () => {
      let capturedUrl = ''

      server.use(
        http.get('/api/v1/insights', ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({
            data: [],
            meta: { page: 2, limit: 20, total: 50, totalPages: 3 },
          })
        })
      )

      const { result } = renderHook(() => useInsights())

      await act(async () => {
        await result.current.fetchInsights(undefined, 2)
      })

      expect(capturedUrl).toContain('page=2')
      expect(result.current.meta.page).toBe(2)
    })

    it('sets error state on fetch failure', async () => {
      server.use(
        http.get('/api/v1/insights', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      const { result } = renderHook(() => useInsights())

      await act(async () => {
        await result.current.fetchInsights()
      })

      expect(result.current.error).toBe('Failed to fetch insights')
      expect(result.current.insights).toEqual([])
    })

    it('handles network errors', async () => {
      server.use(
        http.get('/api/v1/insights', () => {
          return HttpResponse.error()
        })
      )

      const { result } = renderHook(() => useInsights())

      await act(async () => {
        await result.current.fetchInsights()
      })

      expect(result.current.error).toBeTruthy()
    })

    it('sets loading state during fetch', async () => {
      server.use(
        http.get('/api/v1/insights', async () => {
          await new Promise(resolve => setTimeout(resolve, 50))
          return HttpResponse.json({
            data: [],
            meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
          })
        })
      )

      const { result } = renderHook(() => useInsights())

      let fetchPromise: Promise<void>
      act(() => {
        fetchPromise = result.current.fetchInsights()
      })

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        await fetchPromise
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('updates filters when passing new filters', async () => {
      server.use(
        http.get('/api/v1/insights', () => {
          return HttpResponse.json({
            data: [],
            meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
          })
        })
      )

      const { result } = renderHook(() => useInsights())

      await act(async () => {
        await result.current.fetchInsights({ type: 'anomaly' })
      })

      expect(result.current.filters.type).toBe('anomaly')
    })
  })

  describe('exportInsights', () => {
    it('exports insights as CSV', async () => {
      const mockBlob = new Blob(['id,type,title\n1,trend,Test'], { type: 'text/csv' })

      server.use(
        http.get('/api/v1/insights/export', ({ request }) => {
          const url = new URL(request.url)
          expect(url.searchParams.get('format')).toBe('csv')
          return new HttpResponse(mockBlob, {
            headers: {
              'Content-Type': 'text/csv',
            },
          })
        })
      )

      // Mock DOM methods
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.body)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.body)

      const { result } = renderHook(() => useInsights())

      await act(async () => {
        await result.current.exportInsights('csv')
      })

      expect(mockAnchor.click).toHaveBeenCalled()
    })

    it('exports insights as JSON', async () => {
      server.use(
        http.get('/api/v1/insights/export', ({ request }) => {
          const url = new URL(request.url)
          expect(url.searchParams.get('format')).toBe('json')
          return new HttpResponse(JSON.stringify({ insights: [] }), {
            headers: {
              'Content-Type': 'application/json',
            },
          })
        })
      )

      const mockAnchor = { href: '', download: '', click: vi.fn() }
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.body)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.body)

      const { result } = renderHook(() => useInsights())

      await act(async () => {
        await result.current.exportInsights('json')
      })

      expect(mockAnchor.click).toHaveBeenCalled()
    })

    it('throws error on export failure', async () => {
      server.use(
        http.get('/api/v1/insights/export', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      const { result } = renderHook(() => useInsights())

      await expect(
        act(async () => {
          await result.current.exportInsights('csv')
        })
      ).rejects.toThrow('Failed to export insights')
    })

    it('includes filters in export request', async () => {
      let capturedUrl = ''

      server.use(
        http.get('/api/v1/insights/export', ({ request }) => {
          capturedUrl = request.url
          return new HttpResponse('', {
            headers: { 'Content-Type': 'text/csv' },
          })
        })
      )

      const mockAnchor = { href: '', download: '', click: vi.fn() }
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.body)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.body)

      const { result } = renderHook(() => useInsights({
        agentId: 'agent-1',
        type: 'trend',
      }))

      await act(async () => {
        await result.current.exportInsights('csv')
      })

      expect(capturedUrl).toContain('agentId=agent-1')
      expect(capturedUrl).toContain('type=trend')
    })
  })

  describe('setFilters', () => {
    it('allows setting filters directly', () => {
      const { result } = renderHook(() => useInsights())

      act(() => {
        result.current.setFilters({ type: 'recommendation' })
      })

      expect(result.current.filters.type).toBe('recommendation')
    })
  })
})

describe('useInsight', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches single insight by ID', async () => {
    server.use(
      http.get('/api/v1/insights/:id', ({ params, request }) => {
        expect(params.id).toBe('insight-1')
        expect(request.headers.get('x-organization-id')).toBe('org-1')
        return HttpResponse.json({
          data: { id: 'insight-1', type: 'trend', title: 'Test Insight', confidenceScore: 0.95 }
        })
      })
    )

    const { result } = renderHook(() => useInsight('insight-1'))

    await act(async () => {
      await result.current.fetchInsight()
    })

    expect(result.current.insight?.id).toBe('insight-1')
    expect(result.current.insight?.title).toBe('Test Insight')
  })

  it('does not fetch when ID is empty', async () => {
    let fetchCalled = false

    server.use(
      http.get('/api/v1/insights/:id', () => {
        fetchCalled = true
        return HttpResponse.json({ data: {} })
      })
    )

    const { result } = renderHook(() => useInsight(''))

    await act(async () => {
      await result.current.fetchInsight()
    })

    expect(fetchCalled).toBe(false)
    expect(result.current.insight).toBeNull()
  })

  it('sets error state on fetch failure', async () => {
    server.use(
      http.get('/api/v1/insights/:id', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const { result } = renderHook(() => useInsight('insight-1'))

    await act(async () => {
      await result.current.fetchInsight()
    })

    expect(result.current.error).toBe('Failed to fetch insight')
  })

  it('manages loading state', async () => {
    server.use(
      http.get('/api/v1/insights/:id', async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return HttpResponse.json({ data: { id: 'insight-1' } })
      })
    )

    const { result } = renderHook(() => useInsight('insight-1'))

    expect(result.current.isLoading).toBe(false)

    let fetchPromise: Promise<void>
    act(() => {
      fetchPromise = result.current.fetchInsight()
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      await fetchPromise
    })

    expect(result.current.isLoading).toBe(false)
  })
})
