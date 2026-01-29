# Component Architecture

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Component Organization](#component-organization)
3. [Component Patterns](#component-patterns)
4. [Shared UI Components](#shared-ui-components)
5. [Feature Components](#feature-components)
6. [Component Conventions](#component-conventions)
7. [Props Documentation Standards](#props-documentation-standards)

---

## Overview

The component architecture follows a **feature-based organization** with shared UI components at the base level. Components are organized by domain/feature area, making it easy to locate and maintain related functionality.

**Total Components:** ~300+ React components

**Organization Strategy:**
- Feature-based directories for domain components
- Shared UI components in `components/ui/`
- Portal-specific components (`admin/`, `gwi/`)
- Layout components for structure
- Provider components for context

---

## Component Organization

### Directory Structure

```
components/
├── ui/                    # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
│
├── admin/                 # Admin portal components
│   ├── sidebar.tsx
│   ├── header.tsx
│   ├── data-table.tsx
│   └── ...
│
├── gwi/                   # GWI portal components
│   ├── sidebar.tsx
│   ├── header.tsx
│   └── ...
│
├── agents/                # Agent feature components
│   ├── agent-builder.tsx
│   ├── agent-grid.tsx
│   ├── agent-detail.tsx
│   └── ...
│
├── workflows/             # Workflow feature components
│   ├── workflow-builder.tsx
│   ├── workflow-canvas.tsx
│   └── ...
│
├── reports/               # Report feature components
│   ├── report-builder.tsx
│   ├── report-viewer.tsx
│   └── ...
│
├── dashboards/            # Dashboard feature components
│   ├── dashboard-builder.tsx
│   ├── widget-editor.tsx
│   └── ...
│
├── playground/            # Playground components
│   ├── chat-interface.tsx
│   ├── canvas-view.tsx
│   └── ...
│
├── audiences/             # Audience feature components
│   ├── audience-builder.tsx
│   ├── audience-filters.tsx
│   └── ...
│
├── crosstabs/             # Crosstab feature components
│   ├── crosstab-grid.tsx
│   ├── crosstab-builder.tsx
│   └── ...
│
├── charts/                # Chart components
│   ├── chart-renderer.tsx
│   ├── chart-builder.tsx
│   └── ...
│
├── layout/                # Layout components
│   ├── sidebar.tsx
│   ├── header.tsx
│   └── ...
│
├── providers/             # Context providers
│   ├── theme-provider.tsx
│   ├── auth-provider.tsx
│   └── ...
│
└── shared/                # Shared feature components
    ├── folder-organization.tsx
    └── ...
```

### Component Categories

**1. UI Components (`components/ui/`)**
- Base components from shadcn/ui
- Radix UI primitives
- Accessible, unstyled components
- Examples: Button, Card, Dialog, Input, Select

**2. Feature Components**
- Domain-specific components
- Organized by feature area
- Examples: `agents/`, `workflows/`, `reports/`

**3. Portal Components**
- Portal-specific UI
- Examples: `admin/`, `gwi/`

**4. Layout Components**
- Page structure components
- Examples: Sidebar, Header, Navigation

**5. Provider Components**
- React Context providers
- Examples: ThemeProvider, AuthProvider

---

## Component Patterns

### Server Components (Default)

**Pattern:** Server Components for data fetching

```typescript
// app/dashboard/agents/page.tsx
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { AgentsList } from '@/components/agents/agents-list'

export default async function AgentsPage() {
  const session = await auth()
  const agents = await prisma.agent.findMany({
    where: { orgId: session.user.orgId }
  })
  
  return <AgentsList agents={agents} />
}
```

**Benefits:**
- Direct database access
- Reduced client bundle size
- Better SEO
- Faster initial load

### Client Components

**Pattern:** Client Components for interactivity

```typescript
// components/agents/agent-form.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function AgentForm() {
  const [name, setName] = useState('')
  const router = useRouter()
  
  const handleSubmit = async () => {
    await fetch('/api/v1/agents', {
      method: 'POST',
      body: JSON.stringify({ name })
    })
    router.refresh()
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Button type="submit">Create</Button>
    </form>
  )
}
```

**When to Use:**
- User interactions (onClick, onChange)
- React hooks (useState, useEffect)
- Browser APIs (localStorage, window)
- Event listeners
- Third-party libraries requiring client-side JS

### Hybrid Pattern

**Server Component renders Client Component:**

```typescript
// Server Component (page.tsx)
import { AgentForm } from '@/components/agents/agent-form'
import { prisma } from '@/lib/db'

export default async function CreateAgentPage() {
  const templates = await prisma.template.findMany()
  
  return (
    <div>
      <h1>Create Agent</h1>
      {/* Client Component for form interactivity */}
      <AgentForm templates={templates} />
    </div>
  )
}
```

---

## Shared UI Components

### Base Components (shadcn/ui)

**Location:** `components/ui/`

**Components:**
- `button.tsx` - Button component
- `card.tsx` - Card container
- `dialog.tsx` - Modal dialog
- `input.tsx` - Text input
- `select.tsx` - Dropdown select
- `textarea.tsx` - Multi-line text input
- `checkbox.tsx` - Checkbox input
- `radio-group.tsx` - Radio button group
- `switch.tsx` - Toggle switch
- `badge.tsx` - Badge/label
- `alert.tsx` - Alert message
- `toast.tsx` - Toast notification
- `table.tsx` - Data table
- `tabs.tsx` - Tab navigation
- `dropdown-menu.tsx` - Dropdown menu
- `tooltip.tsx` - Tooltip
- `popover.tsx` - Popover
- `sheet.tsx` - Side sheet
- `accordion.tsx` - Accordion
- `progress.tsx` - Progress bar
- `skeleton.tsx` - Loading skeleton
- And more...

### Component Structure

**Base Pattern:**
```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  // Component-specific props
}

export function Component({ className, ...props }: ComponentProps) {
  return (
    <div
      className={cn("base-classes", className)}
      {...props}
    />
  )
}
```

**Features:**
- TypeScript interfaces for props
- `cn()` utility for className merging
- Forward refs for DOM access
- Accessible by default (Radix UI)

---

## Feature Components

### Agent Components

**Location:** `components/agents/`

**Components:**
- `agent-builder.tsx` - Agent creation form
- `agent-grid.tsx` - Agent grid display
- `agent-detail.tsx` - Agent detail view
- `agent-marketplace.tsx` - Agent marketplace
- `agent-performance-dashboard.tsx` - Performance metrics
- `agent-filters.tsx` - Filter component

**Pattern:**
```typescript
"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export function AgentBuilder() {
  const t = useTranslations("agents.builder")
  const [name, setName] = useState('')
  
  return (
    <div>
      <h1>{t("title")}</h1>
      {/* Form fields */}
    </div>
  )
}
```

### Workflow Components

**Location:** `components/workflows/`

**Components:**
- `workflow-builder.tsx` - Workflow creation
- `workflow-canvas.tsx` - Visual workflow editor
- `workflow-run-history.tsx` - Execution history
- `workflow-scheduler.tsx` - Schedule configuration

### Report Components

**Location:** `components/reports/`

**Components:**
- `report-builder.tsx` - Report creation wizard
- `report-viewer.tsx` - Report display
- `report-templates.tsx` - Template selection
- `report-exporter.tsx` - Export functionality

### Dashboard Components

**Location:** `components/dashboards/`

**Components:**
- `dashboard-builder.tsx` - Dashboard creation
- `widget-editor.tsx` - Widget configuration
- `widget-renderer.tsx` - Widget rendering
- `dashboard-grid.tsx` - Grid layout system

### Playground Components

**Location:** `components/playground/`

**Components:**
- `chat-interface.tsx` - Chat UI
- `canvas-view.tsx` - Canvas visualization
- `split-view.tsx` - Split view layout
- `message-block.tsx` - Message rendering

---

## Component Conventions

### Naming Conventions

**Component Files:**
- PascalCase: `AgentBuilder.tsx`
- Descriptive names: `agent-builder.tsx` (kebab-case for files)
- Suffix patterns: `-builder.tsx`, `-viewer.tsx`, `-grid.tsx`

**Component Names:**
- PascalCase: `AgentBuilder`, `WorkflowCanvas`
- Match file name

**Props Interfaces:**
- `ComponentNameProps`: `AgentBuilderProps`
- Export interfaces for reuse

### File Organization

**Single Component Files:**
- One component per file
- Component name matches file name
- Export default or named export

**Index Files:**
- `index.ts` for barrel exports
- Re-export components from directory

**Example:**
```typescript
// components/agents/index.ts
export { AgentBuilder } from './agent-builder'
export { AgentGrid } from './agent-grid'
export { AgentDetail } from './agent-detail'
```

### Import Patterns

**UI Components:**
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
```

**Feature Components:**
```typescript
import { AgentBuilder } from '@/components/agents/agent-builder'
import { WorkflowCanvas } from '@/components/workflows/workflow-canvas'
```

**Utilities:**
```typescript
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/date-utils'
```

**Hooks:**
```typescript
import { useAgents } from '@/hooks/use-agents'
import { useEventTracking } from '@/hooks/use-event-tracking'
```

---

## Props Documentation Standards

### Interface Documentation

**Pattern:**
```typescript
/**
 * AgentBuilder Component Props
 * 
 * @interface AgentBuilderProps
 */
export interface AgentBuilderProps {
  /** Agent ID for editing (optional) */
  agentId?: string
  
  /** Initial agent data (optional) */
  initialData?: Partial<Agent>
  
  /** Callback when agent is created/updated */
  onSave?: (agent: Agent) => void
  
  /** Whether to show advanced options */
  showAdvanced?: boolean
}
```

### Component Documentation

**Pattern:**
```typescript
/**
 * AgentBuilder Component
 *
 * A comprehensive form interface for creating and configuring custom AI agents.
 * Provides multi-section configuration including basic info, system prompts,
 * data sources, output formats, and advanced settings.
 *
 * @component
 * @module components/agents/agent-builder
 *
 * @example
 * ```tsx
 * <AgentBuilder />
 * ```
 *
 * @example
 * ```tsx
 * <AgentBuilder 
 *   agentId="agent_123"
 *   initialData={{ name: "My Agent" }}
 *   onSave={(agent) => console.log(agent)}
 * />
 * ```
 */
export function AgentBuilder({ agentId, initialData, onSave }: AgentBuilderProps) {
  // Component implementation
}
```

### Prop Types

**Required Props:**
- No `?` marker
- Must be provided

**Optional Props:**
- `?` marker
- Default values when appropriate

**Default Values:**
```typescript
export interface ComponentProps {
  title: string              // Required
  description?: string        // Optional
  isActive?: boolean         // Optional, default: false
}

export function Component({ 
  title, 
  description, 
  isActive = false 
}: ComponentProps) {
  // Implementation
}
```

---

## Component Patterns

### Form Components

**Pattern:** React Hook Form + Zod validation

```typescript
"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
    }
  })
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### Data Fetching Components

**Pattern:** SWR for client-side data fetching

```typescript
"use client"

import useSWR from 'swr'

export function AgentsList() {
  const { data, error, isLoading } = useSWR('/api/v1/agents', fetcher)
  
  if (isLoading) return <Loading />
  if (error) return <Error />
  
  return <List agents={data.agents} />
}
```

### Loading States

**Pattern:** Skeleton components for loading

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  )
}
```

### Error Boundaries

**Pattern:** Error boundary for error handling

```typescript
import { ErrorBoundary } from '@/components/error-boundary'

export function Page() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Content />
    </ErrorBoundary>
  )
}
```

---

## Related Documentation

- [UI Component Library](./UI_COMPONENTS.md) - shadcn/ui components
- [Feature Components](./FEATURE_COMPONENTS.md) - Feature-specific components
- [Application Architecture](../architecture/APPLICATION_ARCHITECTURE.md) - App structure

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
