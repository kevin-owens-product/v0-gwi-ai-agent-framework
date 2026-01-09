import { http, HttpResponse } from 'msw'

export const handlers = [
  // Auth handlers
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
  }),

  // User organizations handler
  http.get('/api/user/organizations', () => {
    return HttpResponse.json({
      organizations: [
        {
          id: 'org-1',
          name: 'Test Organization',
          slug: 'test-org',
          role: 'OWNER',
          planTier: 'PROFESSIONAL',
        },
      ],
    })
  }),

  // Agent handlers
  http.get('/api/v1/agents', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    return HttpResponse.json({
      data: [
        {
          id: 'agent-1',
          name: 'Research Agent',
          description: 'Analyzes market trends',
          type: 'RESEARCH',
          status: 'ACTIVE',
          configuration: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          creator: {
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
          },
          _count: { runs: 42 },
        },
        {
          id: 'agent-2',
          name: 'Analysis Agent',
          description: 'Performs data analysis',
          type: 'ANALYSIS',
          status: 'DRAFT',
          configuration: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          creator: {
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
          },
          _count: { runs: 0 },
        },
      ],
      meta: {
        page,
        limit,
        total: 2,
        totalPages: 1,
      },
    })
  }),

  http.post('/api/v1/agents', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json(
      {
        data: {
          id: 'new-agent-id',
          ...body,
          status: 'DRAFT',
          configuration: body.configuration || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          creator: {
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      },
      { status: 201 }
    )
  }),

  http.get('/api/v1/agents/:id', ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      data: {
        id,
        name: 'Research Agent',
        description: 'Analyzes market trends',
        type: 'RESEARCH',
        status: 'ACTIVE',
        configuration: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
        _count: { runs: 42 },
      },
    })
  }),

  http.patch('/api/v1/agents/:id', async ({ params, request }) => {
    const { id } = params
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      data: {
        id,
        name: body.name || 'Research Agent',
        description: body.description || 'Analyzes market trends',
        type: body.type || 'RESEARCH',
        status: body.status || 'ACTIVE',
        configuration: body.configuration || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    })
  }),

  http.delete('/api/v1/agents/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/agents/:id/run', () => {
    return HttpResponse.json(
      {
        runId: 'run-1',
        status: 'PENDING',
        startedAt: new Date().toISOString(),
      },
      { status: 202 }
    )
  }),

  // Health check handler
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    })
  }),
]
