import { http, HttpResponse } from 'msw'
import {
  createUser,
  createOrganization,
  createAgentWithDetails,
  createAgentRun,
  createInsight,
  createDataSource,
  createAuditLogWithUser,
  createApiKey,
  createInvitation,
  createTeamMemberList,
  createPaginatedResponse,
} from '../factories'

const mockUser = createUser({ id: 'test-user-id', email: 'test@example.com', name: 'Test User' })
const mockOrg = createOrganization({ id: 'org-1', name: 'Test Organization', slug: 'test-org', planTier: 'PROFESSIONAL' })

export const handlers = [
  // ==================== AUTH ====================
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
  }),

  http.post('/api/auth/signup', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>

    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    return HttpResponse.json(
      { message: 'Account created successfully' },
      { status: 201 }
    )
  }),

  http.post('/api/auth/forgot-password', async () => {
    return HttpResponse.json({
      message: 'If an account exists, a reset link has been sent',
    })
  }),

  http.post('/api/auth/reset-password', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>

    if (body.token === 'invalid-token') {
      return HttpResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    return HttpResponse.json({ message: 'Password reset successfully' })
  }),

  // ==================== USER ORGANIZATIONS ====================
  http.get('/api/user/organizations', () => {
    return HttpResponse.json({
      organizations: [
        {
          id: mockOrg.id,
          name: mockOrg.name,
          slug: mockOrg.slug,
          role: 'OWNER',
          planTier: mockOrg.planTier,
        },
      ],
    })
  }),

  // ==================== AGENTS ====================
  http.get('/api/v1/agents', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const status = url.searchParams.get('status')
    const type = url.searchParams.get('type')

    let agents = Array.from({ length: 5 }, () =>
      createAgentWithDetails({ orgId: mockOrg.id })
    )

    if (status) {
      agents = agents.filter(a => a.status === status)
    }
    if (type) {
      agents = agents.filter(a => a.type === type)
    }

    return HttpResponse.json(createPaginatedResponse(agents, page, limit, agents.length))
  }),

  http.post('/api/v1/agents', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>

    if (!body.name || (body.name as string).length < 2) {
      return HttpResponse.json(
        { error: 'Validation error', details: [{ path: ['name'], message: 'Name must be at least 2 characters' }] },
        { status: 400 }
      )
    }

    const agent = createAgentWithDetails({
      ...body,
      orgId: mockOrg.id,
      createdBy: mockUser.id,
      status: 'DRAFT',
    } as Parameters<typeof createAgentWithDetails>[0])

    return HttpResponse.json({ data: agent }, { status: 201 })
  }),

  http.get('/api/v1/agents/:id', ({ params }) => {
    const agent = createAgentWithDetails({
      id: params.id as string,
      orgId: mockOrg.id,
    })

    return HttpResponse.json({ data: agent })
  }),

  http.patch('/api/v1/agents/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const agent = createAgentWithDetails({
      id: params.id as string,
      orgId: mockOrg.id,
      ...body,
    } as Parameters<typeof createAgentWithDetails>[0])

    return HttpResponse.json({ data: agent })
  }),

  http.delete('/api/v1/agents/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/agents/:id/run', async ({ params }) => {
    const run = createAgentRun({
      agentId: params.id as string,
      orgId: mockOrg.id,
      status: 'PENDING',
    })

    return HttpResponse.json({
      runId: run.id,
      status: run.status,
      startedAt: run.startedAt,
    }, { status: 202 })
  }),

  // ==================== INSIGHTS ====================
  http.get('/api/v1/insights', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const type = url.searchParams.get('type')

    let insights = Array.from({ length: 10 }, () =>
      createInsight({ orgId: mockOrg.id })
    )

    if (type) {
      insights = insights.filter(i => i.type === type)
    }

    return HttpResponse.json(createPaginatedResponse(insights, page, limit, insights.length))
  }),

  http.get('/api/v1/insights/export', ({ request }) => {
    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'json'

    if (format === 'csv') {
      return new HttpResponse(
        'ID,Type,Title,Created At\n1,trend,Test,2024-01-01',
        {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="insights.csv"',
          },
        }
      )
    }

    return new HttpResponse(
      JSON.stringify({ insights: Array.from({ length: 5 }, () => createInsight()) }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }),

  // ==================== DATA SOURCES ====================
  http.get('/api/v1/data-sources', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    const dataSources = Array.from({ length: 3 }, () =>
      createDataSource({ orgId: mockOrg.id })
    )

    return HttpResponse.json(createPaginatedResponse(dataSources, page, limit, dataSources.length))
  }),

  http.post('/api/v1/data-sources', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>

    if (!body.name) {
      return HttpResponse.json(
        { error: 'Validation error', details: [{ path: ['name'], message: 'Name is required' }] },
        { status: 400 }
      )
    }

    const dataSource = createDataSource({
      ...body,
      orgId: mockOrg.id,
      status: 'PENDING',
    } as Parameters<typeof createDataSource>[0])

    return HttpResponse.json({ data: dataSource }, { status: 201 })
  }),

  http.post('/api/v1/data-sources/:id/test', async () => {
    // Simulate random success/failure
    const success = Math.random() > 0.3

    return HttpResponse.json({
      success,
      message: success ? 'Connection successful' : 'Connection failed: Unable to reach endpoint',
    })
  }),

  http.delete('/api/v1/data-sources/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // ==================== TEAM ====================
  http.get('/api/v1/team', () => {
    const members = createTeamMemberList(3)
    members[0].role = 'OWNER'

    return HttpResponse.json({ data: members })
  }),

  http.post('/api/v1/team/invite', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>

    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 400 }
      )
    }

    const invitation = createInvitation({
      email: body.email as string,
      role: (body.role as 'ADMIN' | 'MEMBER' | 'VIEWER') || 'MEMBER',
      orgId: mockOrg.id,
      status: 'PENDING',
    })

    return HttpResponse.json({ data: invitation }, { status: 201 })
  }),

  http.patch('/api/v1/team/members/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>

    return HttpResponse.json({
      data: {
        id: params.id,
        role: body.role,
        updatedAt: new Date().toISOString(),
      },
    })
  }),

  http.delete('/api/v1/team/members/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // ==================== INVITATIONS ====================
  http.get('/api/v1/invitations', () => {
    const invitations = [
      createInvitation({ status: 'PENDING', orgId: mockOrg.id }),
      createInvitation({ status: 'PENDING', orgId: mockOrg.id }),
    ]

    return HttpResponse.json({ data: invitations })
  }),

  http.delete('/api/v1/invitations/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/invitations/:id/resend', () => {
    return HttpResponse.json({ message: 'Invitation resent' })
  }),

  // ==================== API KEYS ====================
  http.get('/api/v1/api-keys', () => {
    const keys = Array.from({ length: 2 }, () => createApiKey({ orgId: mockOrg.id, userId: mockUser.id }))
    return HttpResponse.json({ data: keys })
  }),

  http.post('/api/v1/api-keys', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>

    if (!body.name) {
      return HttpResponse.json(
        { error: 'Validation error', details: [{ path: ['name'], message: 'Name is required' }] },
        { status: 400 }
      )
    }

    const apiKey = createApiKey({
      name: body.name as string,
      permissions: (body.permissions as string[]) || ['agents:read'],
      orgId: mockOrg.id,
      userId: mockUser.id,
    })

    // Return the full key only on creation
    return HttpResponse.json({
      data: {
        id: apiKey.id,
        key: `gwi_professional_${Math.random().toString(36).substring(2, 26)}`,
        name: apiKey.name,
        permissions: apiKey.permissions,
        createdAt: apiKey.createdAt,
      },
    }, { status: 201 })
  }),

  http.delete('/api/v1/api-keys/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // ==================== AUDIT LOGS ====================
  http.get('/api/v1/audit-logs', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const action = url.searchParams.get('action')
    const resourceType = url.searchParams.get('resourceType')

    let logs = Array.from({ length: 50 }, () =>
      createAuditLogWithUser({ orgId: mockOrg.id })
    )

    if (action) {
      logs = logs.filter(l => l.action === action)
    }
    if (resourceType) {
      logs = logs.filter(l => l.resourceType === resourceType)
    }

    return HttpResponse.json(createPaginatedResponse(logs, page, limit, 150))
  }),

  // ==================== ANALYTICS ====================
  http.get('/api/v1/analytics/performance', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '30d'

    return HttpResponse.json({
      data: {
        period,
        metrics: {
          totalAgentRuns: 1247,
          successfulRuns: 1189,
          failedRuns: 58,
          averageRunTime: 4.2,
          tokensConsumed: 2456789,
          insightsGenerated: 892,
        },
        trends: {
          agentRuns: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: Math.floor(Math.random() * 100) + 20,
          })),
          tokensConsumed: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: Math.floor(Math.random() * 100000) + 50000,
          })),
        },
      },
    })
  }),

  // ==================== BILLING ====================
  http.get('/api/v1/billing', () => {
    return HttpResponse.json({
      data: {
        subscription: {
          planId: 'professional',
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        usage: {
          agentRuns: { current: 450, limit: 1000 },
          teamSeats: { current: 3, limit: 10 },
          dataSources: { current: 5, limit: 20 },
          storage: { current: 2.5, limit: 50 },
        },
      },
    })
  }),

  http.post('/api/v1/billing/checkout', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>

    return HttpResponse.json({
      url: `https://checkout.stripe.com/test_session_${body.planId}`,
    })
  }),

  http.post('/api/v1/billing/portal', () => {
    return HttpResponse.json({
      url: 'https://billing.stripe.com/test_portal',
    })
  }),

  // ==================== HEALTH ====================
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0',
    })
  }),
]
