# Testing Strategy

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Pyramid](#testing-pyramid)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [E2E Tests](#e2e-tests)
6. [Coverage Goals](#coverage-goals)
7. [Testing Patterns](#testing-patterns)

---

## Overview

The GWI AI Agent Framework uses a comprehensive testing strategy covering unit tests, integration tests, and end-to-end tests. Testing is automated via CI/CD and runs on every pull request.

**Test Frameworks:**
- **Unit/Integration:** Vitest
- **E2E:** Playwright
- **Coverage:** Vitest Coverage (v8)

**CI/CD:** GitHub Actions

---

## Testing Pyramid

```
        /\
       /  \      E2E Tests (10%)
      /____\     - Critical user flows
     /      \    
    /________\   Integration Tests (30%)
   /          \  - API routes, services
  /____________\ Unit Tests (60%)
                 - Functions, utilities, components
```

### Test Distribution

- **Unit Tests:** 60% - Fast, isolated, comprehensive
- **Integration Tests:** 30% - API routes, database interactions
- **E2E Tests:** 10% - Critical user flows, happy paths

---

## Unit Tests

### Framework

**Vitest** - Fast, Vite-native test runner

**Configuration:** `vitest.config.ts`

### What to Test

**Functions & Utilities:**
- Pure functions
- Business logic
- Validation functions
- Transformations
- Calculations

**Components:**
- Component rendering
- User interactions
- State management
- Props handling

### Example

```typescript
import { describe, it, expect } from 'vitest'
import { validateEmail } from '@/lib/validation'

describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true)
  })

  it('should reject invalid email', () => {
    expect(validateEmail('invalid')).toBe(false)
  })

  it('should reject empty string', () => {
    expect(validateEmail('')).toBe(false)
  })
})
```

### Running Unit Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# UI mode
npm run test:ui
```

---

## Integration Tests

### What to Test

**API Routes:**
- Request/response handling
- Authentication/authorization
- Validation
- Error handling
- Rate limiting

**Database Interactions:**
- CRUD operations
- Queries
- Transactions
- Relationships

**Services:**
- Service integration
- External API calls (mocked)
- Business logic flows

### Example

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/v1/agents/route'
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

vi.mock('@/lib/auth')
vi.mock('@/lib/db')

describe('GET /api/v1/agents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when unauthorized', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/v1/agents')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return agents for organization', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user_123' },
    })

    vi.mocked(prisma.agent.findMany).mockResolvedValue([
      { id: 'agent_1', name: 'Test Agent', orgId: 'org_123' },
    ])

    const request = new NextRequest('http://localhost/api/v1/agents')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.agents).toHaveLength(1)
  })
})
```

### Running Integration Tests

```bash
# Run all tests (includes integration)
npm test

# Specific test file
npm test app/api/v1/agents/route.test.ts
```

---

## E2E Tests

### Framework

**Playwright** - Cross-browser E2E testing

**Configuration:** `playwright.config.ts`

### What to Test

**Critical User Flows:**
- User authentication
- Agent creation/execution
- Workflow creation
- Report generation
- Dashboard access

**Cross-Portal Flows:**
- User Dashboard flows
- Admin Portal flows
- GWI Portal flows

### Example

```typescript
import { test, expect } from '@playwright/test'

test.describe('Agent Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'user@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('user can create agent', async ({ page }) => {
    await page.goto('/dashboard/agents')
    await page.click('text=Create Agent')
    
    await page.fill('[name="name"]', 'Test Agent')
    await page.fill('[name="description"]', 'Test Description')
    await page.selectOption('[name="type"]', 'RESEARCH')
    
    await page.click('text=Save')
    
    await expect(page.locator('text=Test Agent')).toBeVisible()
  })

  test('user can execute agent', async ({ page }) => {
    await page.goto('/dashboard/agents')
    await page.click('text=Test Agent')
    await page.click('text=Run')
    
    await expect(page.locator('text=Running')).toBeVisible()
    await expect(page.locator('text=Completed')).toBeVisible({ timeout: 30000 })
  })
})
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# View report
npm run test:e2e:report
```

### E2E Test Structure

**Directory:** `e2e/`

**Files:**
- `auth.spec.ts` - Authentication flows
- `agents.spec.ts` - Agent management
- `workflows.spec.ts` - Workflow management
- `reports.spec.ts` - Report generation
- `admin.spec.ts` - Admin portal
- `gwi.spec.ts` - GWI portal

---

## Coverage Goals

### Overall Coverage

**Target:** 80%+ code coverage

**Breakdown:**
- **Critical Paths:** 90%+
- **Business Logic:** 85%+
- **Utilities:** 80%+
- **Components:** 75%+

### Coverage Exclusions

**Excluded:**
- Configuration files
- Type definitions
- Test utilities
- Migration files

**Configuration:** `vitest.config.ts`

```typescript
coverage: {
  exclude: [
    '**/*.config.*',
    '**/*.d.ts',
    '**/tests/**',
    '**/e2e/**',
  ],
}
```

### Coverage Reports

**Generate:**
```bash
npm run test:coverage
```

**Output:**
- Console summary
- HTML report: `coverage/index.html`
- CI integration (Codecov)

---

## Testing Patterns

### Mocking

**External Dependencies:**
```typescript
import { vi } from 'vitest'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

const mockedAuth = auth as ReturnType<typeof vi.fn>
mockedAuth.mockResolvedValue({ user: { id: 'user_123' } })
```

**Prisma:**
```typescript
vi.mock('@/lib/db', () => ({
  prisma: {
    agent: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))
```

### Test Data

**Factories:**
```typescript
// tests/factories/agent.ts
export function createAgent(overrides?: Partial<Agent>): Agent {
  return {
    id: 'agent_123',
    name: 'Test Agent',
    orgId: 'org_123',
    ...overrides,
  }
}
```

**Fixtures:**
```typescript
// tests/fixtures/agents.ts
export const testAgents = [
  createAgent({ id: 'agent_1', name: 'Agent 1' }),
  createAgent({ id: 'agent_2', name: 'Agent 2' }),
]
```

### Async Testing

**API Routes:**
```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction()
  expect(result).toBeDefined()
})
```

**E2E:**
```typescript
test('should wait for async operations', async ({ page }) => {
  await page.click('button')
  await expect(page.locator('.result')).toBeVisible({ timeout: 5000 })
})
```

### Error Testing

**Unit Tests:**
```typescript
it('should throw error on invalid input', () => {
  expect(() => validateInput(null)).toThrow('Invalid input')
})
```

**Integration Tests:**
```typescript
it('should return 400 on validation error', async () => {
  const response = await POST(requestWithInvalidData)
  expect(response.status).toBe(400)
})
```

---

## CI/CD Integration

### GitHub Actions

**Workflow:** `.github/workflows/ci.yml`

**Test Jobs:**
1. **Lint & Type Check** - Code quality
2. **Security Scan** - Vulnerability detection
3. **Unit Tests** - Vitest with coverage
4. **E2E Tests** - Playwright with PostgreSQL

**Requirements:**
- All tests must pass
- Coverage threshold met
- No security vulnerabilities

### Pre-commit Hooks

**Husky + lint-staged:**
- Run linter on staged files
- Prevent commit if errors

---

## Best Practices

### ✅ DO

- Write tests before fixing bugs
- Test edge cases
- Use descriptive test names
- Keep tests isolated
- Mock external dependencies
- Test error paths
- Maintain test coverage
- Update tests with code changes

### ❌ DON'T

- Skip tests to save time
- Test implementation details
- Write flaky tests
- Ignore test failures
- Commit without running tests
- Test third-party libraries
- Write tests that depend on each other
- Leave console.logs in tests

---

## Related Documentation

- [Test Structure](./TEST_STRUCTURE.md) - Test organization
- [Development Workflow](../development/DEVELOPMENT_WORKFLOW.md) - Git workflow
- [Code Standards](../development/CODE_STANDARDS.md) - Coding conventions

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
