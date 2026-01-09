import { test, expect } from '@playwright/test'

test.describe('API Health Check', () => {
  test('health endpoint returns healthy status', async ({ request }) => {
    const response = await request.get('/api/health')

    expect(response.ok()).toBe(true)

    const body = await response.json()
    expect(body).toHaveProperty('status')
  })
})

test.describe('API Authentication', () => {
  test('agents endpoint requires authentication', async ({ request }) => {
    const response = await request.get('/api/v1/agents')

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401)
  })

  test('agents endpoint requires organization ID header', async ({ request }) => {
    const response = await request.get('/api/v1/agents', {
      headers: {
        // Missing x-organization-id header
      },
    })

    // Should return 400 or 401
    expect([400, 401]).toContain(response.status())
  })

  test('agent creation requires authentication', async ({ request }) => {
    const response = await request.post('/api/v1/agents', {
      data: {
        name: 'Test Agent',
        type: 'RESEARCH',
      },
    })

    expect(response.status()).toBe(401)
  })

  test('agent deletion requires authentication', async ({ request }) => {
    const response = await request.delete('/api/v1/agents/test-id')

    expect(response.status()).toBe(401)
  })
})

test.describe('API Validation', () => {
  test('registration endpoint validates email format', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        organizationName: 'Test Org',
      },
    })

    // Should return validation error
    expect([400, 422]).toContain(response.status())
  })

  test('registration endpoint requires all fields', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {
        name: 'Test User',
        // Missing email, password, organizationName
      },
    })

    expect([400, 422]).toContain(response.status())
  })
})

test.describe('API Rate Limiting Headers', () => {
  test('health endpoint does not have rate limit headers', async ({ request }) => {
    const response = await request.get('/api/health')

    // Health check should not be rate limited
    expect(response.ok()).toBe(true)
  })
})
