# Code Standards

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [TypeScript Conventions](#typescript-conventions)
2. [Component Patterns](#component-patterns)
3. [API Patterns](#api-patterns)
4. [Error Handling](#error-handling)
5. [Internationalization](#internationalization)
6. [Database Patterns](#database-patterns)
7. [Testing Patterns](#testing-patterns)

---

## TypeScript Conventions

### Type Safety

**Always use strict types:**

```typescript
// ❌ Bad - implicit any
function processData(data) {
  return data.value
}

// ✅ Good - explicit types
function processData(data: { value: string }): string {
  return data.value
}
```

### Null Safety

**Handle null/undefined explicitly:**

```typescript
// ❌ Bad - potential runtime error
const userId = session.user.id

// ✅ Good - null check
const userId = session?.user?.id
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Type Narrowing

**Extract to typed variables for complex types:**

```typescript
// ❌ Bad - TypeScript can't narrow
expect(searchClause.OR[0]!.name.contains).toBe('value')

// ✅ Good - extract to typed variable
const nameClause = { name: { contains: search, mode: 'insensitive' } }
const searchClause = { OR: [nameClause] }
expect(nameClause.name.contains).toBe('value')
```

### Unused Variables

**Remove unused imports or prefix with underscore:**

```typescript
// ❌ Bad - unused import
import { useState, useEffect } from 'react'

// ✅ Good - remove unused
import { useState } from 'react'

// ✅ Good - intentionally unused
function handler(_event: Event) {
  // event not used
}
```

### Next.js 15 Params

**CRITICAL: In Next.js 15, `params` is a Promise:**

```typescript
// ❌ Wrong - params is not a Promise in Next.js 15
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id  // Error!
}

// ✅ Correct - await params
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // Correct!
}
```

---

## Component Patterns

### Server vs Client Components

**Default to Server Components, use Client Components only when needed:**

```typescript
// ✅ Server Component (default)
export default async function AgentsPage() {
  const agents = await prisma.agent.findMany()
  return <AgentsList agents={agents} />
}

// ✅ Client Component (when needed)
"use client"
import { useState } from 'react'

export function AgentsList({ agents }: { agents: Agent[] }) {
  const [filter, setFilter] = useState('')
  return <div>...</div>
}
```

### Component Structure

**Follow consistent structure:**

```typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types/Interfaces
interface Props {
  agent: Agent
  onSave?: (agent: Agent) => void
}

// 3. Component
export function AgentCard({ agent, onSave }: Props) {
  // 4. Hooks
  const [isEditing, setIsEditing] = useState(false)

  // 5. Handlers
  const handleSave = async () => {
    // ...
  }

  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Props Interface

**Always define Props interface:**

```typescript
// ✅ Good
interface AgentCardProps {
  agent: Agent
  onEdit?: () => void
  onDelete?: () => void
}

export function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  // ...
}
```

### Event Handlers

**Use descriptive handler names:**

```typescript
// ✅ Good
const handleSave = async () => { }
const handleDelete = async () => { }
const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => { }
```

---

## API Patterns

### Route Handler Structure

**Follow consistent API route structure:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { checkRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// 1. Validation schema
const createSchema = z.object({
  name: z.string().min(1),
})

// 2. Handler function
export async function POST(request: NextRequest) {
  try {
    // 3. Authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 4. Organization validation
    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // 5. Rate limiting
    const rateLimitResult = await checkRateLimit(identifier, planTier)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // 6. Authorization
    const membership = await getUserMembership(session.user.id, orgId)
    if (!hasPermission(membership.role, 'agents:write')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 7. Validation
    const body = await request.json()
    const data = createSchema.parse(body)

    // 8. Business logic
    const agent = await prisma.agent.create({
      data: {
        orgId,
        ...data,
        createdBy: session.user.id,
      },
    })

    // 9. Response
    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    // 10. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Authentication Pattern

**Always check authentication:**

```typescript
// ✅ Good
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Authorization Pattern

**Check permissions after authentication:**

```typescript
// ✅ Good
const membership = await getUserMembership(userId, orgId)
if (!hasPermission(membership.role, 'agents:write')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### Rate Limiting Pattern

**Apply rate limiting:**

```typescript
// ✅ Good
const rateLimitResult = await checkRateLimit(identifier, planTier)
if (!rateLimitResult.success) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
  )
}
```

### Validation Pattern

**Use Zod for validation:**

```typescript
// ✅ Good
const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

try {
  const data = schema.parse(body)
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    )
  }
}
```

---

## Error Handling

### API Error Responses

**Use consistent error response format:**

```typescript
// ✅ Good
return NextResponse.json(
  { error: 'Error message', details: optionalDetails },
  { status: 400 }
)
```

### Error Types

**Handle different error types:**

```typescript
try {
  // ...
} catch (error) {
  // Zod validation error
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    )
  }

  // Prisma error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Resource already exists' },
        { status: 409 }
      )
    }
  }

  // Generic error
  console.error('API Error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

### Component Error Handling

**Use error boundaries:**

```typescript
// ✅ Good
"use client"
import { ErrorBoundary } from '@/components/error-boundary'

export function AgentsPage() {
  return (
    <ErrorBoundary>
      <AgentsList />
    </ErrorBoundary>
  )
}
```

---

## Internationalization

### Using Translations

**Client Components:**

```typescript
"use client"
import { useTranslations } from 'next-intl'

export function AgentCard() {
  const t = useTranslations('dashboard.agents')
  const tCommon = useTranslations('common')

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{tCommon('save')}</button>
    </div>
  )
}
```

**Server Components:**

```typescript
import { getTranslations } from '@/lib/i18n/server'

export default async function AgentsPage() {
  const t = await getTranslations('dashboard.agents')
  return <h1>{t('title')}</h1>
}
```

### Translation Keys

**Follow namespace structure:**

```
portal.section.subsection.key

Examples:
- dashboard.agents.title
- admin.settings.billing
- gwi.surveys.create
- common.save
- common.cancel
```

### No Hardcoded Strings

**❌ Bad:**
```typescript
<button>Save</button>
```

**✅ Good:**
```typescript
<button>{t('common.save')}</button>
```

---

## Database Patterns

### Prisma Queries

**Always filter by organization:**

```typescript
// ✅ Good
const agents = await prisma.agent.findMany({
  where: { orgId },
})

// ❌ Bad - missing org filter
const agents = await prisma.agent.findMany()
```

### Field Names

**Match Prisma schema exactly:**

```typescript
// ✅ Good - matches schema
const apiKey = await prisma.apiKey.findUnique({
  where: { keyHash: hash },
})

// ❌ Bad - wrong field name
const apiKey = await prisma.apiKey.findUnique({
  where: { apiKeyHash: hash },  // Field doesn't exist
})
```

### Transactions

**Use transactions for multi-step operations:**

```typescript
// ✅ Good
await prisma.$transaction(async (tx) => {
  const agent = await tx.agent.create({ data: agentData })
  await tx.agentRun.create({ data: { agentId: agent.id } })
})
```

### Error Handling

**Handle Prisma errors:**

```typescript
try {
  await prisma.agent.create({ data })
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // Unique constraint violation
    }
    if (error.code === 'P2025') {
      // Record not found
    }
  }
}
```

---

## Testing Patterns

### Unit Tests

**Test functions and utilities:**

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
})
```

### Component Tests

**Test component behavior:**

```typescript
import { render, screen } from '@testing-library/react'
import { AgentCard } from '@/components/agents/agent-card'

describe('AgentCard', () => {
  it('should render agent name', () => {
    const agent = { id: '1', name: 'Test Agent' }
    render(<AgentCard agent={agent} />)
    expect(screen.getByText('Test Agent')).toBeInTheDocument()
  })
})
```

### API Tests

**Test API routes:**

```typescript
import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/v1/agents/route'

describe('GET /api/v1/agents', () => {
  it('should return 401 when unauthorized', async () => {
    const request = new NextRequest('http://localhost/api/v1/agents')
    const response = await GET(request)
    expect(response.status).toBe(401)
  })
})
```

### Mocking

**Mock external dependencies:**

```typescript
import { vi } from 'vitest'
import { auth } from '@/lib/auth'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

const mockedAuth = auth as ReturnType<typeof vi.fn>
mockedAuth.mockResolvedValue({ user: { id: 'user_123' } })
```

---

## Best Practices

### ✅ DO

- Use TypeScript strict mode
- Define explicit types
- Handle null/undefined explicitly
- Filter by organization in queries
- Use Zod for validation
- Check authentication and authorization
- Apply rate limiting
- Use translations (no hardcoded strings)
- Write tests for critical paths
- Follow consistent naming conventions

### ❌ DON'T

- Use `any` type
- Skip null checks
- Hardcode strings
- Skip authentication checks
- Skip authorization checks
- Skip rate limiting
- Commit console.logs
- Commit secrets
- Skip error handling
- Break existing functionality

---

## Related Documentation

- [Development Workflow](./DEVELOPMENT_WORKFLOW.md) - Git workflow
- [Adding New Features](./ADDING_NEW_FEATURES.md) - Feature development
- [Testing Strategy](../testing/TESTING_STRATEGY.md) - Testing guide
- [Component Architecture](../components/COMPONENT_ARCHITECTURE.md) - Component patterns

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
