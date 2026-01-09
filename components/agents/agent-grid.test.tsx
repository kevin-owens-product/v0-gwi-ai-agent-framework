import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { AgentGrid } from './agent-grid'
import { server } from '@/tests/mocks/server'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('AgentGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading spinner initially', async () => {
    // Set up a delayed response to keep loading state visible
    server.use(
      http.get('/api/v1/agents', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return HttpResponse.json({
          data: [],
          agents: [],
          meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        })
      })
    )

    render(<AgentGrid filter="all" />)

    // Check for the loading spinner
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeTruthy()
  })

  it('displays agents when fetched successfully', async () => {
    const mockAgents = [
      {
        id: 'agent-1',
        name: 'Research Agent',
        type: 'RESEARCH',
        status: 'ACTIVE',
        description: 'Analyzes market trends',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        _count: { runs: 10 },
      },
      {
        id: 'agent-2',
        name: 'Analysis Agent',
        type: 'ANALYSIS',
        status: 'DRAFT',
        description: 'Performs data analysis',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        _count: { runs: 5 },
      },
    ]

    server.use(
      http.get('/api/v1/agents', () => {
        return HttpResponse.json({
          data: mockAgents,
          agents: mockAgents,
          meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
        })
      })
    )

    render(<AgentGrid filter="all" />)

    await waitFor(() => {
      expect(screen.getByText('Research Agent')).toBeInTheDocument()
    })

    expect(screen.getByText('Analysis Agent')).toBeInTheDocument()
    expect(screen.getByText('Analyzes market trends')).toBeInTheDocument()
    expect(screen.getByText('Performs data analysis')).toBeInTheDocument()
  })

  it('shows error message when fetch fails', async () => {
    server.use(
      http.get('/api/v1/agents', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    render(<AgentGrid filter="all" />)

    await waitFor(() => {
      expect(screen.getByText(/error loading agents/i)).toBeInTheDocument()
    })
  })

  it('shows empty state when no agents', async () => {
    server.use(
      http.get('/api/v1/agents', () => {
        return HttpResponse.json({
          data: [],
          agents: [],
          meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        })
      })
    )

    render(<AgentGrid filter="all" />)

    await waitFor(() => {
      expect(screen.getByText(/no agents found/i)).toBeInTheDocument()
    })
  })

  it('displays agent status badges correctly', async () => {
    const mockAgents = [
      {
        id: 'agent-1',
        name: 'Active Agent',
        type: 'RESEARCH',
        status: 'ACTIVE',
        description: 'An active agent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        _count: { runs: 0 },
      },
    ]

    server.use(
      http.get('/api/v1/agents', () => {
        return HttpResponse.json({
          data: mockAgents,
          agents: mockAgents,
          meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
        })
      })
    )

    render(<AgentGrid filter="all" />)

    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument()
    })
  })

  it('displays run count for agents', async () => {
    const mockAgents = [
      {
        id: 'agent-1',
        name: 'Busy Agent',
        type: 'RESEARCH',
        status: 'ACTIVE',
        description: 'A busy agent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        _count: { runs: 42 },
      },
    ]

    server.use(
      http.get('/api/v1/agents', () => {
        return HttpResponse.json({
          data: mockAgents,
          agents: mockAgents,
          meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
        })
      })
    )

    render(<AgentGrid filter="all" />)

    await waitFor(() => {
      expect(screen.getByText(/42/)).toBeInTheDocument()
    })
  })

  it('applies search filter to request', async () => {
    let capturedUrl = ''

    server.use(
      http.get('/api/v1/agents', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({
          data: [],
          agents: [],
          meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        })
      })
    )

    render(<AgentGrid filter="all" search="test query" />)

    await waitFor(() => {
      // URL can be encoded as either + or %20
      expect(capturedUrl).toMatch(/search=test(\+|%20)query/)
    })
  })

  it('applies custom filter to request', async () => {
    let capturedUrl = ''

    server.use(
      http.get('/api/v1/agents', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({
          data: [],
          agents: [],
          meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        })
      })
    )

    render(<AgentGrid filter="custom" />)

    await waitFor(() => {
      expect(capturedUrl).toContain('type=CUSTOM')
    })
  })

  it('displays agent type badge', async () => {
    const mockAgents = [
      {
        id: 'agent-1',
        name: 'Reporting Agent',
        type: 'REPORTING',
        status: 'ACTIVE',
        description: 'Generates reports',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        _count: { runs: 0 },
      },
    ]

    server.use(
      http.get('/api/v1/agents', () => {
        return HttpResponse.json({
          data: mockAgents,
          agents: mockAgents,
          meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
        })
      })
    )

    render(<AgentGrid filter="all" />)

    await waitFor(() => {
      expect(screen.getByText('reporting')).toBeInTheDocument()
    })
  })

  it('displays creator name', async () => {
    const mockAgents = [
      {
        id: 'agent-1',
        name: 'Test Agent',
        type: 'RESEARCH',
        status: 'ACTIVE',
        description: 'Test description',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
        _count: { runs: 0 },
      },
    ]

    server.use(
      http.get('/api/v1/agents', () => {
        return HttpResponse.json({
          data: mockAgents,
          agents: mockAgents,
          meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
        })
      })
    )

    render(<AgentGrid filter="all" />)

    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument()
    })
  })

  it('renders Run Agent button and settings icon', async () => {
    const mockAgents = [
      {
        id: 'agent-1',
        name: 'Test Agent',
        type: 'RESEARCH',
        status: 'ACTIVE',
        description: 'Test description',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        _count: { runs: 0 },
      },
    ]

    server.use(
      http.get('/api/v1/agents', () => {
        return HttpResponse.json({
          data: mockAgents,
          agents: mockAgents,
          meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
        })
      })
    )

    render(<AgentGrid filter="all" />)

    await waitFor(() => {
      expect(screen.getByText('Run Agent')).toBeInTheDocument()
    })

    // Settings button has only an icon, check for the link to agent details
    const links = screen.getAllByRole('link')
    const agentDetailLinks = links.filter(link =>
      link.getAttribute('href')?.includes('/dashboard/agents/agent-1')
    )
    expect(agentDetailLinks.length).toBeGreaterThan(0)
  })

  it('links to correct agent pages', async () => {
    const mockAgents = [
      {
        id: 'agent-123',
        name: 'Test Agent',
        type: 'RESEARCH',
        status: 'ACTIVE',
        description: 'Test description',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        _count: { runs: 0 },
      },
    ]

    server.use(
      http.get('/api/v1/agents', () => {
        return HttpResponse.json({
          data: mockAgents,
          agents: mockAgents,
          meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
        })
      })
    )

    render(<AgentGrid filter="all" />)

    await waitFor(() => {
      const agentLink = screen.getByRole('link', { name: /Test Agent/i })
      expect(agentLink).toHaveAttribute('href', '/dashboard/agents/agent-123')
    })
  })
})
