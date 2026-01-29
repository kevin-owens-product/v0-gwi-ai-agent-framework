# Adding New Features

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Feature Checklist](#feature-checklist)
3. [Schema Changes](#schema-changes)
4. [API Creation](#api-creation)
5. [Component Development](#component-development)
6. [Testing Requirements](#testing-requirements)
7. [Documentation](#documentation)

---

## Overview

This guide walks through the process of adding a new feature to the GWI AI Agent Framework, from database schema changes to UI components and testing.

**Prerequisites:**
- Development environment set up
- Understanding of [Code Standards](./CODE_STANDARDS.md)
- Familiarity with [Development Workflow](./DEVELOPMENT_WORKFLOW.md)

---

## Feature Checklist

### Planning Phase

- [ ] Define feature requirements
- [ ] Identify affected areas (database, API, UI)
- [ ] Plan database schema changes
- [ ] Design API endpoints
- [ ] Design UI components
- [ ] Identify permissions needed
- [ ] Plan testing strategy

### Development Phase

- [ ] Create database migration
- [ ] Update Prisma schema
- [ ] Create API routes
- [ ] Implement business logic
- [ ] Create UI components
- [ ] Add translations
- [ ] Write tests
- [ ] Update documentation

### Review Phase

- [ ] Code review
- [ ] Test review
- [ ] Documentation review
- [ ] Security review (if applicable)

### Deployment Phase

- [ ] Merge to develop
- [ ] Test on staging
- [ ] Deploy to production
- [ ] Monitor for issues

---

## Schema Changes

### 1. Update Prisma Schema

**Edit `prisma/schema.prisma`:**

```prisma
model NewFeature {
  id        String   @id @default(cuid())
  orgId     String
  name      String
  status    FeatureStatus @default(DRAFT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([orgId])
  @@index([status])
}

enum FeatureStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}
```

### 2. Create Migration

```bash
# Create migration
npx prisma migrate dev --name add_new_feature

# This will:
# - Create migration file
# - Apply migration to database
# - Regenerate Prisma Client
```

### 3. Update Seed Data (Optional)

**Edit `prisma/seed.ts`:**

```typescript
// Add seed data for new feature
await prisma.newFeature.create({
  data: {
    orgId: testOrg.id,
    name: 'Test Feature',
    status: 'ACTIVE',
  },
})
```

### 4. Verify Migration

```bash
# Check migration status
npx prisma migrate status

# Open Prisma Studio to verify
npm run db:studio
```

---

## API Creation

### 1. Create API Route

**Create `app/api/v1/new-features/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { checkRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Validation schema
const createSchema = z.object({
  name: z.string().min(1).max(100),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
})

// GET /api/v1/new-features
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Organization validation
    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Rate limiting
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { planTier: true },
    })

    const rateLimitResult = await checkRateLimit(
      `api:${session.user.id}:${orgId}`,
      org?.planTier || 'STARTER'
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authorization
    const membership = await getUserMembership(session.user.id, orgId)
    if (!hasPermission(membership.role, 'features:read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Query
    const features = await prisma.newFeature.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ features })
  } catch (error) {
    console.error('GET /api/v1/new-features:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/v1/new-features
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Organization validation
    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Authorization
    const membership = await getUserMembership(session.user.id, orgId)
    if (!hasPermission(membership.role, 'features:write')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validation
    const body = await request.json()
    const data = createSchema.parse(body)

    // Create
    const feature = await prisma.newFeature.create({
      data: {
        orgId,
        ...data,
      },
    })

    return NextResponse.json(feature, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('POST /api/v1/new-features:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 2. Create Dynamic Route (Optional)

**Create `app/api/v1/new-features/[id]/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'

// GET /api/v1/new-features/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Authentication, authorization, etc.
  // ...
  
  const feature = await prisma.newFeature.findUnique({
    where: { id, orgId },
  })

  if (!feature) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(feature)
}
```

### 3. Add Permissions

**Update `lib/permissions.ts`:**

```typescript
export const PERMISSIONS = {
  // ... existing permissions
  'features:read': 'View features',
  'features:write': 'Create and edit features',
  'features:delete': 'Delete features',
} as const
```

---

## Component Development

### 1. Create Feature Component

**Create `components/features/feature-list.tsx`:**

```typescript
"use client"

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Feature {
  id: string
  name: string
  status: string
}

export function FeatureList() {
  const t = useTranslations('dashboard.features')
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/v1/new-features')
      const data = await response.json()
      setFeatures(data.features)
    } catch (error) {
      console.error('Failed to fetch features:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>{t('loading')}</div>
  }

  return (
    <div>
      <h1>{t('title')}</h1>
      {features.map((feature) => (
        <Card key={feature.id}>
          <h2>{feature.name}</h2>
          <p>{feature.status}</p>
        </Card>
      ))}
    </div>
  )
}
```

### 2. Create Page

**Create `app/dashboard/features/page.tsx`:**

```typescript
import { FeatureList } from '@/components/features/feature-list'

export default function FeaturesPage() {
  return (
    <div>
      <FeatureList />
    </div>
  )
}
```

### 3. Add Navigation

**Update `components/layout/sidebar.tsx`:**

```typescript
{
  name: 'Features',
  href: '/dashboard/features',
  icon: FeatureIcon,
}
```

---

## Testing Requirements

### 1. Unit Tests

**Create `app/api/v1/new-features/route.test.ts`:**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { GET, POST } from './route'
import { NextRequest } from 'next/server'

describe('GET /api/v1/new-features', () => {
  it('should return 401 when unauthorized', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    
    const request = new NextRequest('http://localhost/api/v1/new-features')
    const response = await GET(request)
    
    expect(response.status).toBe(401)
  })

  it('should return features for organization', async () => {
    // Mock auth, prisma, etc.
    // ...
    
    const request = new NextRequest('http://localhost/api/v1/new-features')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.features).toBeDefined()
  })
})
```

### 2. Component Tests

**Create `components/features/feature-list.test.tsx`:**

```typescript
import { render, screen } from '@testing-library/react'
import { FeatureList } from './feature-list'

describe('FeatureList', () => {
  it('should render features', () => {
    render(<FeatureList />)
    expect(screen.getByText('Features')).toBeInTheDocument()
  })
})
```

### 3. E2E Tests

**Create `e2e/features.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test'

test('user can view features', async ({ page }) => {
  await page.goto('/dashboard/features')
  await expect(page.locator('h1')).toContainText('Features')
})

test('user can create feature', async ({ page }) => {
  await page.goto('/dashboard/features')
  await page.click('text=Create Feature')
  await page.fill('[name="name"]', 'Test Feature')
  await page.click('text=Save')
  await expect(page.locator('text=Test Feature')).toBeVisible()
})
```

---

## Documentation

### 1. Update API Documentation

**Update `docs/api/API_V1.md`:**

```markdown
## Features API

### GET /api/v1/new-features
List features for organization.

**Authentication:** Required
**Permissions:** `features:read`

**Response:**
```json
{
  "features": [
    {
      "id": "feature_123",
      "name": "Feature Name",
      "status": "ACTIVE"
    }
  ]
}
```
```

### 2. Update Feature Documentation

**Create `docs/features/NEW_FEATURE.md`:**

```markdown
# New Feature

## Overview
Description of the feature.

## Usage
How to use the feature.

## API
API endpoints and examples.

## Components
UI components and their usage.
```

### 3. Update Translations

**Update `messages/en.json`:**

```json
{
  "dashboard": {
    "features": {
      "title": "Features",
      "create": "Create Feature",
      "loading": "Loading features..."
    }
  }
}
```

**Run translation sync:**

```bash
npm run i18n:fix
```

---

## Complete Example

### Feature: Agent Marketplace

**1. Schema:**
```prisma
model AgentTemplate {
  id          String   @id @default(cuid())
  name        String
  description String?
  category    String
  config      Json
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

**2. API:**
- `GET /api/v1/agent-templates` - List templates
- `POST /api/v1/agent-templates` - Create template
- `POST /api/v1/agent-templates/[id]/install` - Install template

**3. Components:**
- `AgentTemplateGrid` - Display templates
- `AgentTemplateCard` - Template card
- `InstallTemplateDialog` - Installation dialog

**4. Pages:**
- `/dashboard/agent-templates` - Marketplace page

**5. Permissions:**
- `agent-templates:read`
- `agent-templates:write`
- `agent-templates:install`

---

## Related Documentation

- [Code Standards](./CODE_STANDARDS.md) - Coding conventions
- [Development Workflow](./DEVELOPMENT_WORKFLOW.md) - Git workflow
- [Testing Strategy](../testing/TESTING_STRATEGY.md) - Testing guide
- [API Overview](../api/API_OVERVIEW.md) - API patterns

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
