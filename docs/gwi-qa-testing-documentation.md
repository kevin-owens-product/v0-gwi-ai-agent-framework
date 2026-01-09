# GWI AI Agent Framework - QA, Testing & Code Excellence

## Project Context

**Repository:** https://github.com/kevin-owens-product/v0-gwi-ai-agent-framework  
**Status:** Deployed on Render with test data seeded  
**Objective:** Ensure production-readiness through comprehensive QA, testing, documentation, and code quality improvements

---

## Mission

Conduct a thorough audit and enhancement of the GWI AI Agent Framework to ensure every page, button, feature, and module is fully functional and enterprise-ready. Implement comprehensive documentation, unit tests, integration tests, and code quality standards that meet best-in-class criteria for B2B SaaS platforms.

---

## Phase 1: Codebase Audit & Inventory

### 1.1 Generate Complete Feature Inventory

Create `/docs/FEATURE_INVENTORY.md` documenting every:

```markdown
# Feature Inventory

## Pages
| Route | Page Name | Status | Tests | Docs |
|-------|-----------|--------|-------|------|
| / | Landing | ⬜ | ⬜ | ⬜ |
| /login | Login | ⬜ | ⬜ | ⬜ |
| /signup | Signup | ⬜ | ⬜ | ⬜ |
| /dashboard | Dashboard Home | ⬜ | ⬜ | ⬜ |
| /agents | Agent List | ⬜ | ⬜ | ⬜ |
| /agents/new | Create Agent | ⬜ | ⬜ | ⬜ |
| /agents/[id] | Agent Detail | ⬜ | ⬜ | ⬜ |
| /insights | Insights Dashboard | ⬜ | ⬜ | ⬜ |
| /data-sources | Data Sources | ⬜ | ⬜ | ⬜ |
| /settings | Settings | ⬜ | ⬜ | ⬜ |
| /settings/team | Team Management | ⬜ | ⬜ | ⬜ |
| /settings/billing | Billing | ⬜ | ⬜ | ⬜ |
| /settings/api-keys | API Keys | ⬜ | ⬜ | ⬜ |
| /settings/sso | SSO Config | ⬜ | ⬜ | ⬜ |
| /settings/audit-log | Audit Log | ⬜ | ⬜ | ⬜ |

## Components
| Component | Location | Props Documented | Tests | Accessibility |
|-----------|----------|------------------|-------|---------------|
| ... | ... | ⬜ | ⬜ | ⬜ |

## API Endpoints
| Method | Endpoint | Auth | Rate Limited | Tests | Docs |
|--------|----------|------|--------------|-------|------|
| ... | ... | ⬜ | ⬜ | ⬜ | ⬜ |

## Hooks
| Hook | Purpose | Tests |
|------|---------|-------|
| ... | ... | ⬜ |

## Utilities
| Function | Location | Tests |
|----------|----------|-------|
| ... | ... | ⬜ |
```

### 1.2 Dependency Audit

Run and document:
```bash
npm audit
npm outdated
npx depcheck
```

Create `/docs/DEPENDENCIES.md` with:
- All dependencies and their purposes
- Security vulnerabilities (if any)
- Outdated packages requiring updates
- Unused dependencies to remove

---

## Phase 2: Comprehensive Functional Testing

### 2.1 Page-by-Page Manual QA Checklist

For **each page**, verify:

#### Authentication Pages
```markdown
## /login
- [ ] Page renders without errors
- [ ] Email input accepts valid email format
- [ ] Email input shows validation error for invalid format
- [ ] Password input masks characters
- [ ] Password input has show/hide toggle (if implemented)
- [ ] "Forgot password" link navigates correctly
- [ ] "Sign up" link navigates to /signup
- [ ] Form submission with valid credentials redirects to dashboard
- [ ] Form submission with invalid credentials shows error message
- [ ] Google OAuth button initiates OAuth flow
- [ ] Microsoft OAuth button initiates OAuth flow
- [ ] Loading state shown during authentication
- [ ] Error states display user-friendly messages
- [ ] Page is responsive (mobile, tablet, desktop)
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Screen reader announces form labels correctly

## /signup
- [ ] Page renders without errors
- [ ] Name input validation works
- [ ] Email input validation works
- [ ] Password strength indicator (if implemented)
- [ ] Password confirmation matches
- [ ] Organization name input works
- [ ] Terms acceptance checkbox required
- [ ] Form submission creates account and org
- [ ] Redirects to dashboard after signup
- [ ] Duplicate email shows appropriate error
- [ ] OAuth signup options work
- [ ] Loading states display correctly
- [ ] Responsive design verified
```

#### Dashboard Pages
```markdown
## /dashboard
- [ ] Page renders with correct layout
- [ ] Sidebar navigation visible and functional
- [ ] All sidebar links navigate correctly
- [ ] User avatar/name displayed in header
- [ ] Organization name displayed
- [ ] Stats cards show correct data
- [ ] Recent activity list populated
- [ ] Quick action buttons work
- [ ] Empty states display when no data
- [ ] Loading skeletons show during data fetch
- [ ] Real-time updates work (if implemented)
- [ ] Responsive layout adapts correctly

## /agents
- [ ] Agent list displays all agents
- [ ] Agent cards show correct information
- [ ] Status badges display correctly (Draft, Active, Paused, Archived)
- [ ] "New Agent" button navigates to /agents/new
- [ ] Search/filter functionality works
- [ ] Pagination works (if implemented)
- [ ] Sort options work
- [ ] Click on agent card navigates to detail
- [ ] Empty state shows when no agents
- [ ] Loading state displays correctly
- [ ] Bulk actions work (if implemented)

## /agents/new
- [ ] Form renders all required fields
- [ ] Agent name input validation
- [ ] Agent type selector works
- [ ] Description textarea works
- [ ] Configuration JSON editor works (if implemented)
- [ ] Save as draft works
- [ ] Create and activate works
- [ ] Cancel returns to agent list
- [ ] Validation errors display correctly
- [ ] Success toast/notification shows
- [ ] Redirects to agent detail after creation

## /agents/[id]
- [ ] Correct agent data loads
- [ ] Edit button enables form editing
- [ ] Delete button shows confirmation modal
- [ ] Delete removes agent and redirects
- [ ] Run agent button executes agent
- [ ] Run history tab shows past runs
- [ ] Configuration tab shows settings
- [ ] Insights tab shows generated insights
- [ ] Status can be changed (activate/pause/archive)
- [ ] Breadcrumb navigation works
- [ ] 404 displayed for invalid agent ID

## /insights
- [ ] Insights dashboard renders
- [ ] Filter by agent works
- [ ] Filter by date range works
- [ ] Filter by type works
- [ ] Search insights works
- [ ] Insight cards display correctly
- [ ] Click opens insight detail
- [ ] Export functionality works
- [ ] Charts/visualizations render
- [ ] Empty state when no insights
- [ ] Pagination works

## /data-sources
- [ ] Data source list displays
- [ ] Status indicators correct (Connected, Error, Pending)
- [ ] Add data source button works
- [ ] Data source type selector works
- [ ] Connection configuration form works
- [ ] Test connection button works
- [ ] Save data source works
- [ ] Edit existing data source works
- [ ] Delete with confirmation works
- [ ] Sync now button triggers sync
- [ ] Last sync timestamp displays
- [ ] Error messages display for failed connections
```

#### Settings Pages
```markdown
## /settings (General)
- [ ] Organization name editable
- [ ] Organization slug editable (with validation)
- [ ] Save changes persists updates
- [ ] Cancel reverts changes
- [ ] Danger zone visible to owners only
- [ ] Delete organization shows confirmation
- [ ] Delete requires typing org name

## /settings/team
- [ ] Team member list displays
- [ ] Role badges display correctly
- [ ] Invite button opens invite modal
- [ ] Invite form validates email
- [ ] Invite form has role selector
- [ ] Invite sends email (or shows invite link)
- [ ] Pending invitations listed
- [ ] Revoke invitation works
- [ ] Change member role works (admin only)
- [ ] Remove member works (with confirmation)
- [ ] Cannot remove last owner
- [ ] Cannot change own role to lower
- [ ] Pagination for large teams

## /settings/billing
- [ ] Current plan displays
- [ ] Usage metrics display
- [ ] Usage progress bars accurate
- [ ] Upgrade button works
- [ ] Downgrade shows confirmation
- [ ] Payment method displayed (masked)
- [ ] Update payment method works
- [ ] Invoice history displays
- [ ] Download invoice works
- [ ] Cancel subscription shows consequences
- [ ] Stripe checkout redirects correctly
- [ ] Webhook updates subscription status

## /settings/api-keys
- [ ] API key list displays
- [ ] Key prefix shown (not full key)
- [ ] Create new key button works
- [ ] Key name input required
- [ ] Permission checkboxes work
- [ ] Expiration date picker works
- [ ] Rate limit input works
- [ ] Generated key shown ONCE with copy button
- [ ] Revoke key shows confirmation
- [ ] Last used timestamp displays
- [ ] Expired keys indicated

## /settings/sso
- [ ] SSO configuration form displays
- [ ] Provider selector (SAML/OIDC)
- [ ] Metadata URL input
- [ ] Client ID/Secret inputs
- [ ] Test SSO connection button
- [ ] Enable/disable SSO toggle
- [ ] Save configuration works
- [ ] SSO login flow works end-to-end
- [ ] Error handling for invalid config

## /settings/audit-log
- [ ] Audit log table displays
- [ ] Columns: Timestamp, User, Action, Resource, IP
- [ ] Filter by action type
- [ ] Filter by user
- [ ] Filter by date range
- [ ] Search functionality
- [ ] Click row shows detail modal
- [ ] Export to CSV works
- [ ] Pagination works
- [ ] Retention notice displayed
```

### 2.2 Interactive Elements Checklist

For **every button, link, and form**:

```markdown
## Buttons Audit
| Location | Button Text | Action | Working | Accessible |
|----------|-------------|--------|---------|------------|
| Header | User Menu | Opens dropdown | ⬜ | ⬜ |
| Header | Logout | Signs out user | ⬜ | ⬜ |
| Sidebar | New Agent | Navigates | ⬜ | ⬜ |
| ... | ... | ... | ⬜ | ⬜ |

## Forms Audit
| Location | Form Name | Validation | Submit | Errors | Loading |
|----------|-----------|------------|--------|--------|---------|
| /login | Login Form | ⬜ | ⬜ | ⬜ | ⬜ |
| /signup | Signup Form | ⬜ | ⬜ | ⬜ | ⬜ |
| ... | ... | ⬜ | ⬜ | ⬜ | ⬜ |

## Modals/Dialogs Audit
| Trigger | Modal Name | Opens | Closes | Actions Work |
|---------|------------|-------|--------|--------------|
| Delete Agent | Confirmation | ⬜ | ⬜ | ⬜ |
| Invite Member | Invite Form | ⬜ | ⬜ | ⬜ |
| ... | ... | ⬜ | ⬜ | ⬜ |
```

### 2.3 API Endpoint Testing

Test every API endpoint:

```markdown
## API Testing Matrix

### Authentication Endpoints
| Method | Endpoint | Auth Required | Test Cases | Status |
|--------|----------|---------------|------------|--------|
| POST | /api/auth/signin | No | Valid creds, Invalid creds, Missing fields | ⬜ |
| POST | /api/auth/signup | No | Valid data, Duplicate email, Invalid data | ⬜ |
| POST | /api/auth/signout | Yes | Valid session, No session | ⬜ |
| GET | /api/auth/session | No | With session, Without session | ⬜ |

### Agent Endpoints
| Method | Endpoint | Auth Required | Test Cases | Status |
|--------|----------|---------------|------------|--------|
| GET | /api/v1/agents | Yes | List all, Empty list, Pagination | ⬜ |
| POST | /api/v1/agents | Yes | Valid agent, Invalid data, Missing fields | ⬜ |
| GET | /api/v1/agents/[id] | Yes | Valid ID, Invalid ID, Wrong org | ⬜ |
| PATCH | /api/v1/agents/[id] | Yes | Valid update, Invalid data, Not found | ⬜ |
| DELETE | /api/v1/agents/[id] | Yes | Valid delete, Not found, No permission | ⬜ |
| POST | /api/v1/agents/[id]/run | Yes | Valid run, Agent not active, Rate limited | ⬜ |

### Additional Endpoints
| Method | Endpoint | Auth Required | Test Cases | Status |
|--------|----------|---------------|------------|--------|
| GET | /api/v1/insights | Yes | List, Filter, Pagination | ⬜ |
| GET | /api/v1/data-sources | Yes | List, Filter | ⬜ |
| POST | /api/v1/data-sources | Yes | Valid, Invalid connection | ⬜ |
| GET | /api/health | No | Healthy, DB down | ⬜ |

### Test Cases for Each Endpoint
1. **Happy path** - Valid request returns expected response
2. **Authentication** - Unauthenticated request returns 401
3. **Authorization** - Unauthorized role returns 403
4. **Validation** - Invalid data returns 400 with errors
5. **Not found** - Invalid ID returns 404
6. **Rate limiting** - Excessive requests return 429
7. **Tenant isolation** - Cannot access other org's data
```

---

## Phase 3: Testing Infrastructure

### 3.1 Testing Stack Setup

Install testing dependencies:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @faker-js/faker playwright @playwright/test
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/*',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

Create `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { beforeAll, afterAll, afterEach } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 3.2 Mock Service Worker Setup

Create `tests/mocks/handlers.ts`:

```typescript
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

  // Agent handlers
  http.get('/api/v1/agents', () => {
    return HttpResponse.json({
      agents: [
        {
          id: 'agent-1',
          name: 'Research Agent',
          type: 'RESEARCH',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
    })
  }),

  http.post('/api/v1/agents', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 'new-agent-id',
      ...body,
      createdAt: new Date().toISOString(),
    }, { status: 201 })
  }),

  // Add more handlers for all endpoints...
]
```

Create `tests/mocks/server.ts`:

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### 3.3 Test Factories

Create `tests/factories/index.ts`:

```typescript
import { faker } from '@faker-js/faker'

export function createUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
    createdAt: faker.date.past(),
    ...overrides,
  }
}

export function createOrganization(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
    planTier: 'STARTER',
    createdAt: faker.date.past(),
    ...overrides,
  }
}

export function createAgent(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.productName() + ' Agent',
    description: faker.lorem.sentence(),
    type: faker.helpers.arrayElement(['RESEARCH', 'ANALYSIS', 'REPORTING', 'MONITORING']),
    status: faker.helpers.arrayElement(['DRAFT', 'ACTIVE', 'PAUSED']),
    configuration: {},
    createdAt: faker.date.past(),
    ...overrides,
  }
}

export function createInsight(overrides = {}) {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    type: faker.helpers.arrayElement(['trend', 'anomaly', 'recommendation']),
    data: { value: faker.number.int({ min: 1, max: 100 }) },
    confidenceScore: faker.number.float({ min: 0.5, max: 1, fractionDigits: 2 }),
    createdAt: faker.date.past(),
    ...overrides,
  }
}

export function createAuditLog(overrides = {}) {
  return {
    id: faker.string.uuid(),
    action: faker.helpers.arrayElement(['create', 'update', 'delete', 'execute']),
    resourceType: faker.helpers.arrayElement(['agent', 'insight', 'data_source']),
    resourceId: faker.string.uuid(),
    metadata: {},
    ipAddress: faker.internet.ip(),
    timestamp: faker.date.recent(),
    ...overrides,
  }
}
```

---

## Phase 4: Unit Tests

### 4.1 Component Tests

Create test files alongside components:

```typescript
// components/agents/agent-card.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AgentCard } from './agent-card'
import { createAgent } from '@/tests/factories'

describe('AgentCard', () => {
  it('renders agent information correctly', () => {
    const agent = createAgent({ name: 'Test Agent', status: 'ACTIVE' })
    render(<AgentCard agent={agent} />)

    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('displays correct status badge color', () => {
    const activeAgent = createAgent({ status: 'ACTIVE' })
    const { rerender } = render(<AgentCard agent={activeAgent} />)
    expect(screen.getByText('Active')).toHaveClass('bg-green-100')

    const pausedAgent = createAgent({ status: 'PAUSED' })
    rerender(<AgentCard agent={pausedAgent} />)
    expect(screen.getByText('Paused')).toHaveClass('bg-yellow-100')
  })

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const agent = createAgent()

    render(<AgentCard agent={agent} onClick={onClick} />)
    await user.click(screen.getByRole('article'))

    expect(onClick).toHaveBeenCalledWith(agent.id)
  })

  it('shows run count when provided', () => {
    const agent = createAgent()
    render(<AgentCard agent={agent} runCount={42} />)

    expect(screen.getByText('42 runs')).toBeInTheDocument()
  })

  it('is accessible', () => {
    const agent = createAgent({ name: 'Accessible Agent' })
    render(<AgentCard agent={agent} />)

    expect(screen.getByRole('article')).toHaveAccessibleName(/Accessible Agent/)
  })
})
```

### 4.2 Hook Tests

```typescript
// hooks/use-agents.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect } from 'vitest'
import { useAgents, useAgent, useCreateAgent } from './use-agents'

const wrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useAgents', () => {
  it('fetches agents successfully', async () => {
    const { result } = renderHook(() => useAgents(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.agents).toHaveLength(1)
    expect(result.current.data?.agents[0].name).toBe('Research Agent')
  })

  it('handles loading state', () => {
    const { result } = renderHook(() => useAgents(), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })
})

describe('useCreateAgent', () => {
  it('creates agent and invalidates cache', async () => {
    const { result } = renderHook(() => useCreateAgent(), { wrapper })

    await result.current.mutateAsync({
      name: 'New Agent',
      type: 'RESEARCH',
    })

    expect(result.current.isSuccess).toBe(true)
  })
})
```

### 4.3 Utility Function Tests

```typescript
// lib/permissions.test.ts
import { describe, it, expect } from 'vitest'
import { hasPermission, hasAnyPermission, ROLE_PERMISSIONS } from './permissions'

describe('hasPermission', () => {
  it('returns true for owner with any permission', () => {
    expect(hasPermission('OWNER', 'agents:read')).toBe(true)
    expect(hasPermission('OWNER', 'billing:manage')).toBe(true)
    expect(hasPermission('OWNER', 'admin:*')).toBe(true)
  })

  it('returns true for admin with allowed permissions', () => {
    expect(hasPermission('ADMIN', 'agents:read')).toBe(true)
    expect(hasPermission('ADMIN', 'team:manage')).toBe(true)
  })

  it('returns false for admin with billing:manage', () => {
    expect(hasPermission('ADMIN', 'billing:manage')).toBe(false)
  })

  it('returns false for member with admin permissions', () => {
    expect(hasPermission('MEMBER', 'team:manage')).toBe(false)
    expect(hasPermission('MEMBER', 'settings:manage')).toBe(false)
  })

  it('returns true for member with basic permissions', () => {
    expect(hasPermission('MEMBER', 'agents:read')).toBe(true)
    expect(hasPermission('MEMBER', 'agents:execute')).toBe(true)
  })

  it('returns limited permissions for viewer', () => {
    expect(hasPermission('VIEWER', 'agents:read')).toBe(true)
    expect(hasPermission('VIEWER', 'agents:write')).toBe(false)
    expect(hasPermission('VIEWER', 'agents:execute')).toBe(false)
  })
})

describe('hasAnyPermission', () => {
  it('returns true if user has any of the permissions', () => {
    expect(hasAnyPermission('MEMBER', ['agents:read', 'billing:manage'])).toBe(true)
  })

  it('returns false if user has none of the permissions', () => {
    expect(hasAnyPermission('VIEWER', ['agents:write', 'billing:manage'])).toBe(false)
  })
})
```

```typescript
// lib/audit.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logAuditEvent, getAuditLogs } from './audit'
import { prisma } from './db'

vi.mock('./db', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

describe('logAuditEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates audit log entry with all fields', async () => {
    const event = {
      orgId: 'org-1',
      userId: 'user-1',
      action: 'create' as const,
      resourceType: 'agent' as const,
      resourceId: 'agent-1',
      metadata: { name: 'Test Agent' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    }

    await logAuditEvent(event)

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orgId: 'org-1',
        userId: 'user-1',
        action: 'create',
        resourceType: 'agent',
      }),
    })
  })

  it('handles errors gracefully', async () => {
    vi.mocked(prisma.auditLog.create).mockRejectedValue(new Error('DB Error'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await logAuditEvent({
      orgId: 'org-1',
      action: 'create',
      resourceType: 'agent',
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to log audit event:',
      expect.any(Error)
    )
  })
})
```

### 4.4 API Route Tests

```typescript
// app/api/v1/agents/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

vi.mock('@/lib/db')
vi.mock('@/lib/auth')

describe('GET /api/v1/agents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const request = new Request('http://localhost/api/v1/agents')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('returns agents for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    })

    vi.mocked(prisma.agent.findMany).mockResolvedValue([
      { id: 'agent-1', name: 'Test Agent', type: 'RESEARCH', status: 'ACTIVE' },
    ])

    const request = new Request('http://localhost/api/v1/agents')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.agents).toHaveLength(1)
  })

  it('filters agents by organization', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    })

    await GET(new Request('http://localhost/api/v1/agents'))

    expect(prisma.agent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          orgId: expect.any(String),
        }),
      })
    )
  })
})

describe('POST /api/v1/agents', () => {
  it('creates agent with valid data', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    })

    vi.mocked(prisma.agent.create).mockResolvedValue({
      id: 'new-agent',
      name: 'New Agent',
      type: 'RESEARCH',
      status: 'DRAFT',
    })

    const request = new Request('http://localhost/api/v1/agents', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Agent',
        type: 'RESEARCH',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
  })

  it('returns 400 for invalid data', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1' },
    })

    const request = new Request('http://localhost/api/v1/agents', {
      method: 'POST',
      body: JSON.stringify({
        // missing required fields
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
```

---

## Phase 5: E2E Tests

### 5.1 Critical User Flows

Create `e2e/auth.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can sign up and create organization', async ({ page }) => {
    await page.goto('/signup')

    await page.fill('[name="name"]', 'Test User')
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`)
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.fill('[name="organizationName"]', 'Test Organization')
    await page.check('[name="acceptTerms"]')

    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Test Organization')).toBeVisible()
  })

  test('user can log in with valid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'existing@example.com')
    await page.fill('[name="password"]', 'password123')

    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'wrong@example.com')
    await page.fill('[name="password"]', 'wrongpassword')

    await page.click('button[type="submit"]')

    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('user can log out', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[name="email"]', 'existing@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')

    // Logout
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Log out')

    await expect(page).toHaveURL('/login')
  })
})
```

Create `e2e/agents.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Agents', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('user can create a new agent', async ({ page }) => {
    await page.goto('/agents')
    await page.click('text=New Agent')

    await page.fill('[name="name"]', 'E2E Test Agent')
    await page.fill('[name="description"]', 'Created by E2E test')
    await page.selectOption('[name="type"]', 'RESEARCH')

    await page.click('button[type="submit"]')

    await expect(page.locator('text=Agent created successfully')).toBeVisible()
    await expect(page.locator('text=E2E Test Agent')).toBeVisible()
  })

  test('user can view agent details', async ({ page }) => {
    await page.goto('/agents')
    await page.click('text=E2E Test Agent')

    await expect(page.locator('h1')).toContainText('E2E Test Agent')
    await expect(page.locator('text=RESEARCH')).toBeVisible()
  })

  test('user can run an agent', async ({ page }) => {
    await page.goto('/agents')
    await page.click('text=E2E Test Agent')

    await page.click('text=Run Agent')

    await expect(page.locator('text=Agent run started')).toBeVisible()
    await expect(page.locator('[data-testid="run-status"]')).toContainText('Running')
  })

  test('user can delete an agent', async ({ page }) => {
    await page.goto('/agents')
    await page.click('text=E2E Test Agent')

    await page.click('text=Delete')
    await page.click('text=Confirm')

    await expect(page.locator('text=Agent deleted')).toBeVisible()
    await expect(page).toHaveURL('/agents')
  })
})
```

Create `e2e/settings.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
  })

  test('admin can invite team member', async ({ page }) => {
    await page.goto('/settings/team')

    await page.click('text=Invite Member')
    await page.fill('[name="email"]', 'newmember@example.com')
    await page.selectOption('[name="role"]', 'MEMBER')
    await page.click('text=Send Invitation')

    await expect(page.locator('text=Invitation sent')).toBeVisible()
    await expect(page.locator('text=newmember@example.com')).toBeVisible()
    await expect(page.locator('text=Pending')).toBeVisible()
  })

  test('admin can create API key', async ({ page }) => {
    await page.goto('/settings/api-keys')

    await page.click('text=Create API Key')
    await page.fill('[name="name"]', 'Test API Key')
    await page.check('[name="permissions.agents:read"]')
    await page.check('[name="permissions.agents:execute"]')
    await page.click('text=Create')

    await expect(page.locator('[data-testid="api-key-value"]')).toBeVisible()
    await expect(page.locator('text=Test API Key')).toBeVisible()
  })

  test('admin can view audit log', async ({ page }) => {
    await page.goto('/settings/audit-log')

    await expect(page.locator('table')).toBeVisible()
    await expect(page.locator('th:has-text("Action")')).toBeVisible()
    await expect(page.locator('th:has-text("User")')).toBeVisible()
    await expect(page.locator('th:has-text("Timestamp")')).toBeVisible()
  })
})
```

---

## Phase 6: Code Documentation

### 6.1 JSDoc Standards

Every exported function, component, hook, and type must have JSDoc:

```typescript
/**
 * Custom hook for managing agent data and operations.
 *
 * @example
 * ```tsx
 * function AgentList() {
 *   const { agents, isLoading, createAgent } = useAgents()
 *
 *   if (isLoading) return <Skeleton />
 *
 *   return agents.map(agent => <AgentCard key={agent.id} agent={agent} />)
 * }
 * ```
 *
 * @returns Object containing agent data and mutation functions
 */
export function useAgents() {
  // ...
}

/**
 * Displays an agent's information in a card format.
 *
 * @param props - Component props
 * @param props.agent - The agent data to display
 * @param props.onClick - Optional click handler, called with agent ID
 * @param props.showActions - Whether to show action buttons (default: true)
 *
 * @example
 * ```tsx
 * <AgentCard
 *   agent={agent}
 *   onClick={(id) => router.push(`/agents/${id}`)}
 *   showActions={false}
 * />
 * ```
 */
export function AgentCard({
  agent,
  onClick,
  showActions = true,
}: AgentCardProps) {
  // ...
}

/**
 * Checks if a user with the given role has the specified permission.
 *
 * @param userRole - The user's role (OWNER, ADMIN, MEMBER, VIEWER)
 * @param requiredPermission - The permission to check
 * @returns True if the user has the permission, false otherwise
 *
 * @example
 * ```ts
 * if (hasPermission(user.role, 'agents:delete')) {
 *   // Show delete button
 * }
 * ```
 */
export function hasPermission(
  userRole: string,
  requiredPermission: Permission
): boolean {
  // ...
}
```

### 6.2 README Documentation

Create comprehensive `README.md`:

```markdown
# GWI AI Agent Framework

Enterprise-grade AI agent and insights platform for automating business intelligence processes.

## Features

- 🤖 **AI Agents** - Create, configure, and run AI-powered research and analysis agents
- 📊 **Insights Dashboard** - Visualize and explore AI-generated insights
- 🔌 **Data Sources** - Connect multiple data sources for comprehensive analysis
- 👥 **Team Management** - Invite team members with role-based access control
- 🔐 **Enterprise Security** - SSO, audit logging, and API key management
- 💳 **Usage-Based Billing** - Flexible plans with Stripe integration

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/kevin-owens-product/v0-gwi-ai-agent-framework.git
cd v0-gwi-ai-agent-framework

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for all required variables. Key configurations:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Random string for session encryption | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `STRIPE_SECRET_KEY` | Stripe API key | For billing |
| `ANTHROPIC_API_KEY` | Anthropic API key | For AI agents |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  Next.js App Router │ React │ Tailwind │ shadcn/ui          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│  NextAuth │ API Routes │ Rate Limiting │ Validation         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic                          │
│  Agents │ Insights │ Billing │ Permissions │ Audit          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  Prisma ORM │ PostgreSQL │ Redis (Rate Limiting)            │
└─────────────────────────────────────────────────────────────┘
```

## Development

### Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

### Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

## API Reference

See `/docs/API.md` for complete API documentation.

### Authentication

All API endpoints (except `/api/health`) require authentication via:
- Session cookie (for browser requests)
- API key in `Authorization: Bearer <key>` header

### Rate Limits

| Plan | Requests/minute |
|------|-----------------|
| Starter | 100 |
| Professional | 500 |
| Enterprise | 2000 |

## Deployment

### Render

The application is configured for deployment on Render using the `render.yaml` blueprint.

```bash
# Deploy via Render Dashboard
# Or use Render CLI
render blueprint apply
```

### Manual Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run `npm run build`
4. Run `npx prisma migrate deploy`
5. Start with `npm start`

## Contributing

See `CONTRIBUTING.md` for development guidelines.

## License

Proprietary - All rights reserved
```

### 6.3 API Documentation

Create `/docs/API.md`:

```markdown
# GWI API Reference

Base URL: `https://api.gwi-platform.com/v1`

## Authentication

### API Key Authentication

Include your API key in the Authorization header:

```
Authorization: Bearer gwi_live_xxxxxxxxxxxx
```

### Session Authentication

For browser-based requests, authentication is handled via session cookies.

---

## Agents

### List Agents

```http
GET /agents
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (DRAFT, ACTIVE, PAUSED, ARCHIVED) |
| `type` | string | Filter by type (RESEARCH, ANALYSIS, REPORTING, MONITORING) |
| `limit` | integer | Max results (default: 20, max: 100) |
| `offset` | integer | Pagination offset |

**Response:**
```json
{
  "agents": [
    {
      "id": "ag_xxxx",
      "name": "Market Research Agent",
      "description": "Analyzes market trends",
      "type": "RESEARCH",
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

### Create Agent

```http
POST /agents
```

**Request Body:**
```json
{
  "name": "New Agent",
  "description": "Optional description",
  "type": "RESEARCH",
  "configuration": {}
}
```

**Response:** `201 Created`
```json
{
  "id": "ag_xxxx",
  "name": "New Agent",
  "type": "RESEARCH",
  "status": "DRAFT",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Get Agent

```http
GET /agents/:id
```

**Response:**
```json
{
  "id": "ag_xxxx",
  "name": "Market Research Agent",
  "description": "Analyzes market trends",
  "type": "RESEARCH",
  "status": "ACTIVE",
  "configuration": {},
  "createdBy": {
    "id": "usr_xxxx",
    "name": "John Doe"
  },
  "runCount": 42,
  "lastRunAt": "2024-01-15T09:00:00Z",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Update Agent

```http
PATCH /agents/:id
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "status": "ACTIVE"
}
```

### Delete Agent

```http
DELETE /agents/:id
```

**Response:** `204 No Content`

### Run Agent

```http
POST /agents/:id/run
```

**Request Body:**
```json
{
  "input": {
    "query": "Analyze Q4 market trends"
  }
}
```

**Response:** `202 Accepted`
```json
{
  "runId": "run_xxxx",
  "status": "PENDING",
  "startedAt": "2024-01-15T10:30:00Z"
}
```

---

## Insights

### List Insights

```http
GET /insights
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `agentId` | string | Filter by agent |
| `type` | string | Filter by insight type |
| `startDate` | string | Filter by date (ISO 8601) |
| `endDate` | string | Filter by date (ISO 8601) |

### Get Insight

```http
GET /insights/:id
```

---

## Errors

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
```

---

## Phase 7: Custom Hooks Audit & Enhancement

### 7.1 Required Custom Hooks

Ensure these hooks exist and are properly implemented:

```typescript
// hooks/use-organization.ts
/**
 * Hook for accessing current organization context and operations.
 */
export function useOrganization() {
  // Returns: { organization, isLoading, switchOrganization, updateOrganization }
}

// hooks/use-permissions.ts
/**
 * Hook for checking user permissions in components.
 */
export function usePermissions() {
  // Returns: { hasPermission, hasAnyPermission, role, isOwner, isAdmin }
}

// hooks/use-agents.ts
/**
 * Hooks for agent CRUD operations.
 */
export function useAgents(filters?: AgentFilters) { /* ... */ }
export function useAgent(id: string) { /* ... */ }
export function useCreateAgent() { /* ... */ }
export function useUpdateAgent() { /* ... */ }
export function useDeleteAgent() { /* ... */ }
export function useRunAgent() { /* ... */ }

// hooks/use-insights.ts
/**
 * Hooks for insights operations.
 */
export function useInsights(filters?: InsightFilters) { /* ... */ }
export function useInsight(id: string) { /* ... */ }

// hooks/use-data-sources.ts
/**
 * Hooks for data source operations.
 */
export function useDataSources() { /* ... */ }
export function useDataSource(id: string) { /* ... */ }
export function useCreateDataSource() { /* ... */ }
export function useTestConnection() { /* ... */ }

// hooks/use-team.ts
/**
 * Hooks for team management.
 */
export function useTeamMembers() { /* ... */ }
export function useInvitations() { /* ... */ }
export function useInviteMember() { /* ... */ }
export function useUpdateMemberRole() { /* ... */ }
export function useRemoveMember() { /* ... */ }

// hooks/use-api-keys.ts
/**
 * Hooks for API key management.
 */
export function useApiKeys() { /* ... */ }
export function useCreateApiKey() { /* ... */ }
export function useRevokeApiKey() { /* ... */ }

// hooks/use-audit-log.ts
/**
 * Hook for audit log viewing.
 */
export function useAuditLog(filters?: AuditLogFilters) { /* ... */ }

// hooks/use-billing.ts
/**
 * Hooks for billing and subscription.
 */
export function useSubscription() { /* ... */ }
export function useUsage() { /* ... */ }
export function useCreateCheckoutSession() { /* ... */ }

// hooks/use-toast.ts
/**
 * Hook for toast notifications.
 */
export function useToast() { /* ... */ }

// hooks/use-debounce.ts
/**
 * Hook for debouncing values.
 */
export function useDebounce<T>(value: T, delay: number): T { /* ... */ }

// hooks/use-local-storage.ts
/**
 * Hook for localStorage with SSR safety.
 */
export function useLocalStorage<T>(key: string, initialValue: T) { /* ... */ }
```

### 7.2 Hook Implementation Pattern

All data-fetching hooks should follow this pattern:

```typescript
// hooks/use-agents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useOrganization } from './use-organization'
import { useToast } from './use-toast'

const AGENTS_KEY = 'agents'

export function useAgents(filters?: AgentFilters) {
  const { organization } = useOrganization()

  return useQuery({
    queryKey: [AGENTS_KEY, organization?.id, filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.type) params.set('type', filters.type)

      const response = await fetch(`/api/v1/agents?${params}`)
      if (!response.ok) throw new Error('Failed to fetch agents')
      return response.json()
    },
    enabled: !!organization?.id,
  })
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: [AGENTS_KEY, id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/agents/${id}`)
      if (!response.ok) throw new Error('Failed to fetch agent')
      return response.json()
    },
    enabled: !!id,
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: CreateAgentInput) => {
      const response = await fetch('/api/v1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create agent')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGENTS_KEY] })
      toast({ title: 'Agent created successfully' })
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create agent', description: error.message, variant: 'destructive' })
    },
  })
}

export function useDeleteAgent() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/agents/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete agent')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGENTS_KEY] })
      toast({ title: 'Agent deleted' })
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete agent', description: error.message, variant: 'destructive' })
    },
  })
}
```

---

## Phase 8: Code Quality Standards

### 8.1 TypeScript Strictness

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### 8.2 ESLint Configuration

Update `.eslintrc.json`:

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "plugins": ["@typescript-eslint", "jsx-a11y"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-floating-promises": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "jsx-a11y/anchor-is-valid": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 8.3 Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 8.4 Pre-commit Hooks

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

Create `.lintstagedrc`:

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

---

## Phase 9: Accessibility Audit

### 9.1 WCAG 2.1 AA Compliance Checklist

```markdown
## Accessibility Checklist

### Perceivable
- [ ] All images have alt text
- [ ] Color is not the only means of conveying information
- [ ] Text has sufficient contrast ratio (4.5:1 for normal, 3:1 for large)
- [ ] Text can be resized to 200% without loss of functionality
- [ ] No content flashes more than 3 times per second

### Operable
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Skip links provided for navigation
- [ ] Focus visible on all interactive elements
- [ ] Focus order is logical
- [ ] Touch targets are at least 44x44px

### Understandable
- [ ] Language of page is set
- [ ] Form labels are associated with inputs
- [ ] Error messages are descriptive
- [ ] Consistent navigation across pages
- [ ] Error prevention for important actions

### Robust
- [ ] Valid HTML markup
- [ ] ARIA attributes used correctly
- [ ] Works with screen readers (NVDA, VoiceOver)
```

### 9.2 Automated Accessibility Testing

Add to E2E tests:

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('login page has no accessibility violations', async ({ page }) => {
    await page.goto('/login')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('dashboard has no accessibility violations', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})
```

---

## Phase 10: Security Review

### 10.1 Security Checklist

```markdown
## Security Audit

### Authentication
- [ ] Passwords hashed with bcrypt (cost factor 12+)
- [ ] Session tokens are cryptographically random
- [ ] Sessions expire appropriately
- [ ] Rate limiting on login attempts
- [ ] Account lockout after failed attempts
- [ ] Password strength requirements enforced

### Authorization
- [ ] RBAC enforced on all endpoints
- [ ] Tenant isolation verified
- [ ] API keys properly scoped
- [ ] Cannot access other org's data

### Input Validation
- [ ] All inputs validated with Zod
- [ ] SQL injection prevented (Prisma parameterized)
- [ ] XSS prevented (React escaping + CSP)
- [ ] File upload validation (if applicable)

### API Security
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] API versioning implemented
- [ ] Sensitive data not logged

### Headers
- [ ] Strict-Transport-Security
- [ ] X-Content-Type-Options
- [ ] X-Frame-Options
- [ ] Content-Security-Policy
- [ ] Referrer-Policy

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] PII handling compliant
- [ ] Audit logging complete
- [ ] Data retention policies implemented
```

### 10.2 Dependency Security

```bash
# Run security audit
npm audit

# Check for known vulnerabilities
npx snyk test

# Update vulnerable packages
npm audit fix
```

---

## Phase 11: Performance Optimization

### 11.1 Performance Checklist

```markdown
## Performance Audit

### Bundle Size
- [ ] Bundle analyzer run
- [ ] No unnecessary dependencies
- [ ] Dynamic imports for heavy components
- [ ] Tree shaking working

### Loading Performance
- [ ] Images optimized (next/image)
- [ ] Fonts optimized (next/font)
- [ ] Critical CSS inlined
- [ ] Lazy loading for below-fold content

### Runtime Performance
- [ ] No unnecessary re-renders
- [ ] Memoization where appropriate
- [ ] Virtual scrolling for long lists
- [ ] Debounced search inputs

### API Performance
- [ ] Database queries optimized
- [ ] N+1 queries eliminated
- [ ] Pagination implemented
- [ ] Caching strategy defined
```

### 11.2 Bundle Analysis

Add to `package.json`:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  }
}
```

Update `next.config.mjs`:

```javascript
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer({
  // existing config
})
```

---

## Execution Instructions

### Run Order

1. **Inventory** - Create feature inventory document
2. **Functional QA** - Test every page and feature manually
3. **Fix Issues** - Address any bugs found during QA
4. **Add Tests** - Implement unit, integration, and E2E tests
5. **Documentation** - Add JSDoc, README, API docs
6. **Code Quality** - Apply linting, formatting, TypeScript strictness
7. **Accessibility** - Run accessibility audit and fix issues
8. **Security** - Complete security review
9. **Performance** - Optimize and analyze bundles
10. **Final Review** - Complete checklist verification

### Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Type check
npm run type-check

# Lint
npm run lint

# Full CI check
npm run ci
```

### CI Script

Add to `package.json`:

```json
{
  "scripts": {
    "ci": "npm run type-check && npm run lint && npm run test:coverage && npm run build"
  }
}
```

---

## Success Criteria

### Code Quality
- [ ] 80%+ test coverage
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] All functions documented with JSDoc

### Functional
- [ ] All pages render without errors
- [ ] All buttons/forms work correctly
- [ ] All API endpoints return expected responses
- [ ] Error states handled gracefully

### Security
- [ ] Security audit passed
- [ ] No known vulnerabilities
- [ ] RBAC verified
- [ ] Tenant isolation confirmed

### Accessibility
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

### Performance
- [ ] Lighthouse score 90+
- [ ] Core Web Vitals pass
- [ ] Bundle size optimized

---

## Deliverables

Upon completion, provide:

1. **Feature Inventory** - Complete `/docs/FEATURE_INVENTORY.md`
2. **Test Coverage Report** - HTML coverage report
3. **QA Sign-off** - All checklists completed
4. **Documentation** - README, API docs, JSDoc coverage
5. **Audit Reports** - Security, accessibility, performance
6. **CI Pipeline** - Working test and lint commands
