import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useAgents, useAgent } from './use-agents'
import { createOrganizationContext, createAgentWithDetails } from '@/tests/factories'
import { server } from '@/tests/mocks/server'

// Mock use-organization hook
const mockOrg = createOrganizationContext({ id: 'org-1', name: 'Test Org' })

vi.mock('./use-organization', () => ({
  useCurrentOrg: () => ({ org: mockOrg, isLoading: false }),
}))

describe('useAgents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchAgents', () => {
    it('fetches agents with organization header', async () => {
      server.use(
        http.get('/api/v1/agents', ({ request }) => {
          const orgId = request.headers.get('x-organization-id')
          expect(orgId).toBe('org-1')
          return HttpResponse.json({
            data: [{ id: 'agent-1', name: 'Test Agent', orgId: 'org-1', status: 'ACTIVE', type: 'RESEARCH' }],
            meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
          })
        })
      )

      const { result } = renderHook(() => useAgents())

      await act(async () => {
        await result.current.fetchAgents()
      })

      expect(result.current.agents).toHaveLength(1)
      expect(result.current.agents[0].name).toBe('Test Agent')
    })

    it('updates agents state on successful fetch', async () => {
      const mockAgents = [
        createAgentWithDetails({ id: 'agent-1', name: 'Agent 1', orgId: 'org-1' }),
        createAgentWithDetails({ id: 'agent-2', name: 'Agent 2', orgId: 'org-1' }),
      ]

      server.use(
        http.get('/api/v1/agents', () => {
          return HttpResponse.json({
            data: mockAgents,
            meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
          })
        })
      )

      const { result } = renderHook(() => useAgents())

      await act(async () => {
        await result.current.fetchAgents()
      })

      expect(result.current.agents).toHaveLength(2)
      expect(result.current.meta.total).toBe(2)
    })

    it('applies filters to fetch request', async () => {
      let capturedUrl = ''

      server.use(
        http.get('/api/v1/agents', ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({
            data: [],
            meta: { page: 2, limit: 10, total: 0, totalPages: 0 },
          })
        })
      )

      const { result } = renderHook(() => useAgents({
        status: 'ACTIVE',
        type: 'RESEARCH',
        page: 2,
        limit: 10,
      }))

      await act(async () => {
        await result.current.fetchAgents()
      })

      expect(capturedUrl).toContain('status=ACTIVE')
      expect(capturedUrl).toContain('type=RESEARCH')
      expect(capturedUrl).toContain('page=2')
      expect(capturedUrl).toContain('limit=10')
    })

    it('sets error state on fetch failure', async () => {
      server.use(
        http.get('/api/v1/agents', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      const { result } = renderHook(() => useAgents())

      await act(async () => {
        await result.current.fetchAgents()
      })

      expect(result.current.error).toBe('Failed to fetch agents')
      expect(result.current.agents).toEqual([])
    })

    it('handles network errors', async () => {
      server.use(
        http.get('/api/v1/agents', () => {
          return HttpResponse.error()
        })
      )

      const { result } = renderHook(() => useAgents())

      await act(async () => {
        await result.current.fetchAgents()
      })

      expect(result.current.error).toBeTruthy()
    })

    it('sets loading state during fetch', async () => {
      server.use(
        http.get('/api/v1/agents', async () => {
          await new Promise(resolve => setTimeout(resolve, 50))
          return HttpResponse.json({
            data: [],
            meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
          })
        })
      )

      const { result } = renderHook(() => useAgents())

      // Start fetch
      let fetchPromise: Promise<void>
      act(() => {
        fetchPromise = result.current.fetchAgents()
      })

      // Should be loading
      expect(result.current.isLoading).toBe(true)

      // Wait for completion
      await act(async () => {
        await fetchPromise
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('createAgent', () => {
    it('creates agent with POST request', async () => {
      let capturedBody: any

      server.use(
        http.post('/api/v1/agents', async ({ request }) => {
          capturedBody = await request.json()
          return HttpResponse.json({
            data: { id: 'new-1', name: 'New Agent', type: 'RESEARCH', status: 'DRAFT' }
          }, { status: 201 })
        })
      )

      const { result } = renderHook(() => useAgents())

      let createdAgent: any
      await act(async () => {
        createdAgent = await result.current.createAgent({
          name: 'New Agent',
          type: 'RESEARCH',
        })
      })

      expect(capturedBody.name).toBe('New Agent')
      expect(capturedBody.type).toBe('RESEARCH')
      expect(createdAgent.id).toBe('new-1')
      expect(createdAgent.name).toBe('New Agent')
    })

    it('adds created agent to state', async () => {
      server.use(
        http.post('/api/v1/agents', () => {
          return HttpResponse.json({
            data: { id: 'new-1', name: 'New Agent', type: 'RESEARCH', status: 'DRAFT' }
          }, { status: 201 })
        })
      )

      const { result } = renderHook(() => useAgents())

      await act(async () => {
        await result.current.createAgent({ name: 'New Agent', type: 'RESEARCH' })
      })

      expect(result.current.agents.some(a => a.id === 'new-1')).toBe(true)
      expect(result.current.agents.find(a => a.id === 'new-1')?.name).toBe('New Agent')
    })

    it('throws error on failed creation', async () => {
      server.use(
        http.post('/api/v1/agents', () => {
          return HttpResponse.json({ error: 'Validation error' }, { status: 400 })
        })
      )

      const { result } = renderHook(() => useAgents())

      await expect(
        act(async () => {
          await result.current.createAgent({ name: '', type: 'RESEARCH' })
        })
      ).rejects.toThrow('Validation error')
    })
  })

  describe('updateAgent', () => {
    it('updates agent with PATCH request', async () => {
      const updatedAgent = createAgentWithDetails({ id: 'agent-1', name: 'Updated Name', orgId: 'org-1' })
      let capturedBody: any

      server.use(
        http.patch('/api/v1/agents/:id', async ({ request }) => {
          capturedBody = await request.json()
          return HttpResponse.json({ data: updatedAgent })
        })
      )

      const { result } = renderHook(() => useAgents())

      await act(async () => {
        await result.current.updateAgent('agent-1', { name: 'Updated Name' })
      })

      expect(capturedBody.name).toBe('Updated Name')
    })

    it('updates agent in local state', async () => {
      const initialAgents = [createAgentWithDetails({ id: 'agent-1', name: 'Old Name', orgId: 'org-1' })]
      const updatedAgent = createAgentWithDetails({ id: 'agent-1', name: 'New Name', orgId: 'org-1' })

      server.use(
        http.get('/api/v1/agents', () => {
          return HttpResponse.json({
            data: initialAgents,
            meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
          })
        }),
        http.patch('/api/v1/agents/:id', () => {
          return HttpResponse.json({ data: updatedAgent })
        })
      )

      const { result } = renderHook(() => useAgents())

      await act(async () => {
        await result.current.fetchAgents()
      })

      await act(async () => {
        await result.current.updateAgent('agent-1', { name: 'New Name' })
      })

      const agent = result.current.agents.find(a => a.id === 'agent-1')
      expect(agent?.name).toBe('New Name')
    })
  })

  describe('deleteAgent', () => {
    it('deletes agent with DELETE request', async () => {
      let deleteCalled = false

      server.use(
        http.delete('/api/v1/agents/:id', ({ params }) => {
          expect(params.id).toBe('agent-1')
          deleteCalled = true
          return new HttpResponse(null, { status: 204 })
        })
      )

      const { result } = renderHook(() => useAgents())

      await act(async () => {
        await result.current.deleteAgent('agent-1')
      })

      expect(deleteCalled).toBe(true)
    })

    it('removes agent from local state', async () => {
      const initialAgents = [
        createAgentWithDetails({ id: 'agent-1', orgId: 'org-1' }),
        createAgentWithDetails({ id: 'agent-2', orgId: 'org-1' }),
      ]

      server.use(
        http.get('/api/v1/agents', () => {
          return HttpResponse.json({
            data: initialAgents,
            meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
          })
        }),
        http.delete('/api/v1/agents/:id', () => {
          return new HttpResponse(null, { status: 204 })
        })
      )

      const { result } = renderHook(() => useAgents())

      await act(async () => {
        await result.current.fetchAgents()
      })

      expect(result.current.agents).toHaveLength(2)

      await act(async () => {
        await result.current.deleteAgent('agent-1')
      })

      expect(result.current.agents).toHaveLength(1)
      expect(result.current.agents.find(a => a.id === 'agent-1')).toBeUndefined()
    })
  })

  describe('runAgent', () => {
    it('runs agent with POST request', async () => {
      let capturedBody: any

      server.use(
        http.post('/api/v1/agents/:id/run', async ({ request, params }) => {
          expect(params.id).toBe('agent-1')
          capturedBody = await request.json()
          return HttpResponse.json({ runId: 'run-1', status: 'PENDING' }, { status: 202 })
        })
      )

      const { result } = renderHook(() => useAgents())

      let runResult
      await act(async () => {
        runResult = await result.current.runAgent('agent-1', { input: { query: 'Test query' } })
      })

      expect(capturedBody.input.query).toBe('Test query')
      expect(runResult).toEqual({ runId: 'run-1', status: 'PENDING' })
    })
  })
})

describe('useAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches single agent by ID', async () => {
    const mockAgent = createAgentWithDetails({ id: 'agent-1', name: 'Test Agent', orgId: 'org-1' })

    server.use(
      http.get('/api/v1/agents/:id', ({ params, request }) => {
        expect(params.id).toBe('agent-1')
        expect(request.headers.get('x-organization-id')).toBe('org-1')
        return HttpResponse.json({ data: mockAgent })
      })
    )

    const { result } = renderHook(() => useAgent('agent-1'))

    await act(async () => {
      await result.current.fetchAgent()
    })

    expect(result.current.agent?.id).toBe('agent-1')
    expect(result.current.agent?.name).toBe('Test Agent')
  })

  it('does not fetch when ID is empty', async () => {
    let fetchCalled = false

    server.use(
      http.get('/api/v1/agents/:id', () => {
        fetchCalled = true
        return HttpResponse.json({ data: {} })
      })
    )

    const { result } = renderHook(() => useAgent(''))

    await act(async () => {
      await result.current.fetchAgent()
    })

    expect(fetchCalled).toBe(false)
    expect(result.current.agent).toBeNull()
  })

  it('sets error state on fetch failure', async () => {
    server.use(
      http.get('/api/v1/agents/:id', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const { result } = renderHook(() => useAgent('agent-1'))

    await act(async () => {
      await result.current.fetchAgent()
    })

    expect(result.current.error).toBe('Failed to fetch agent')
  })

  it('manages loading state', async () => {
    server.use(
      http.get('/api/v1/agents/:id', async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return HttpResponse.json({ data: { id: 'agent-1' } })
      })
    )

    const { result } = renderHook(() => useAgent('agent-1'))

    expect(result.current.isLoading).toBe(false)

    let fetchPromise: Promise<void>
    act(() => {
      fetchPromise = result.current.fetchAgent()
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      await fetchPromise
    })

    expect(result.current.isLoading).toBe(false)
  })
})
