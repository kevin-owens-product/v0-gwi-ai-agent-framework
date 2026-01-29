# Feature Components

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Agent Components](#agent-components)
3. [Workflow Components](#workflow-components)
4. [Report Components](#report-components)
5. [Dashboard Components](#dashboard-components)
6. [Playground Components](#playground-components)
7. [Data Analysis Components](#data-analysis-components)

---

## Overview

Feature components are domain-specific React components that implement business logic and user interactions for specific platform features. They are organized by feature area and compose UI components to create complete user experiences.

**Organization:** Feature-based directories

**Pattern:** Client Components with Server Component data fetching

---

## Agent Components

### Location

**Directory:** `components/agents/`

### Components

#### AgentBuilder

**File:** `components/agents/agent-builder.tsx`

**Purpose:** Comprehensive form for creating and configuring AI agents

**Features:**
- Multi-step form with validation
- Real-time draft saving
- Tag management
- Data source selection
- Output format configuration
- Advanced AI settings (temperature, tokens, memory)
- Example prompt management
- Event tracking

**Props:**
```typescript
interface AgentBuilderProps {
  agentId?: string           // For editing existing agent
  initialData?: Partial<Agent>
  onSave?: (agent: Agent) => void
  showAdvanced?: boolean
}
```

**Usage:**
```typescript
import { AgentBuilder } from '@/components/agents/agent-builder'

<AgentBuilder />
```

#### AgentGrid

**File:** `components/agents/agent-grid.tsx`

**Purpose:** Grid display of agents with filtering and sorting

**Features:**
- Grid layout
- Filter by type/status
- Search functionality
- Pagination
- Quick actions (run, edit, delete)

**Props:**
```typescript
interface AgentGridProps {
  agents: Agent[]
  onAgentClick?: (agent: Agent) => void
  onRunAgent?: (agentId: string) => void
  filters?: AgentFilters
}
```

#### AgentDetail

**File:** `components/agents/agent-detail.tsx`

**Purpose:** Detailed view of agent with run history

**Features:**
- Agent configuration display
- Run history timeline
- Performance metrics
- Quick run action
- Edit/delete actions

**Props:**
```typescript
interface AgentDetailProps {
  agentId: string
  onEdit?: () => void
  onDelete?: () => void
}
```

#### AgentMarketplace

**File:** `components/agents/agent-marketplace.tsx`

**Purpose:** Browse and install pre-built agent templates

**Features:**
- Template browsing
- Category filtering
- Search functionality
- Install templates
- Preview templates

#### AgentPerformanceDashboard

**File:** `components/agents/agent-performance-dashboard.tsx`

**Purpose:** Performance analytics for agents

**Features:**
- Execution metrics
- Success rate
- Average execution time
- Token usage
- Cost analysis

---

## Workflow Components

### Location

**Directory:** `components/workflows/`

### Components

#### WorkflowBuilder

**File:** `components/workflows/workflow-builder.tsx`

**Purpose:** Create and configure automated workflows

**Features:**
- Drag-and-drop agent pipeline builder
- Multi-step workflow configuration
- Agent selection from marketplace
- Schedule configuration (cron expressions)
- Output destination management
- Real-time pipeline preview
- Draft saving

**Props:**
```typescript
interface WorkflowBuilderProps {
  workflowId?: string        // For editing
  initialData?: Partial<Workflow>
  onSave?: (workflow: Workflow) => void
}
```

**Usage:**
```typescript
import { WorkflowBuilder } from '@/components/workflows/workflow-builder'

<WorkflowBuilder />
```

#### WorkflowCanvas

**File:** `components/workflows/workflow-canvas.tsx`

**Purpose:** Visual workflow editor with drag-and-drop

**Features:**
- Visual node-based editor
- Drag-and-drop agents
- Connection lines between steps
- Step configuration panels
- Conditional branching
- Parallel execution

#### WorkflowRunHistory

**File:** `components/workflows/workflow-run-history.tsx`

**Purpose:** Display workflow execution history

**Features:**
- Run timeline
- Step-by-step execution view
- Error details
- Performance metrics
- Retry functionality

---

## Report Components

### Location

**Directory:** `components/reports/`

### Components

#### ReportBuilder

**File:** `components/reports/report-builder.tsx`

**Purpose:** Multi-step wizard for creating reports

**Features:**
- Multi-step wizard interface
- Report type selection (presentation, dashboard, PDF, export, infographic)
- AI agent selection for content generation
- Data source and market selection
- Audience targeting
- Real-time generation progress
- Template support
- Draft saving

**Props:**
```typescript
interface ReportBuilderProps {
  reportId?: string
  templateId?: string
  templateTitle?: string
  onSave?: (report: Report) => void
}
```

**Usage:**
```typescript
import { ReportBuilder } from '@/components/reports/report-builder'

// Create new report
<ReportBuilder />

// Edit existing report
<ReportBuilder reportId="report_123" />

// From template
<ReportBuilder templateId="template_456" />
```

#### ReportViewer

**File:** `components/reports/report-viewer.tsx`

**Purpose:** Display generated reports

**Features:**
- Report rendering
- Multiple format support
- Export options
- Sharing functionality
- Comments and annotations

**Props:**
```typescript
interface ReportViewerProps {
  reportId: string
  mode?: 'view' | 'edit'
  onEdit?: () => void
}
```

#### ReportTemplates

**File:** `components/reports/report-templates.tsx`

**Purpose:** Browse and select report templates

**Features:**
- Template gallery
- Category filtering
- Preview templates
- Use template action

---

## Dashboard Components

### Location

**Directory:** `components/dashboard/`

### Components

#### DashboardBuilder

**File:** `components/dashboard/advanced-dashboard-builder.tsx`

**Purpose:** Create and customize dashboards

**Features:**
- Drag-and-drop widget placement
- Grid-based layout system
- Multiple widget types (charts, tables, metrics)
- Widget configuration
- Responsive breakpoints
- Real-time preview
- Save/publish functionality

**Widget Types:**
- Chart widgets
- Metric widgets
- Table widgets
- Text widgets
- Image widgets
- KPI widgets

**Props:**
```typescript
interface DashboardBuilderProps {
  dashboardId?: string
  initialLayout?: WidgetLayout
  onSave?: (dashboard: Dashboard) => void
}
```

#### WidgetEditor

**File:** `components/dashboard/widget-editor.tsx`

**Purpose:** Configure individual widgets

**Features:**
- Widget type selection
- Data source configuration
- Styling options
- Filter configuration
- Size and position

#### WidgetRenderer

**File:** `components/dashboard/widget-renderer.tsx`

**Purpose:** Render widgets with data

**Features:**
- Data fetching
- Chart rendering
- Table display
- Metric display
- Error handling
- Loading states

#### DashboardGrid

**File:** `components/dashboard/dashboard-grid.tsx`

**Purpose:** Grid layout system for dashboards

**Features:**
- Responsive grid
- Drag-and-drop
- Resize handles
- Breakpoint management

---

## Playground Components

### Location

**Directory:** `components/playground/`

### Components

#### ChatInterface

**File:** `components/playground/chat-interface.tsx`

**Purpose:** Interactive AI chat interface

**Features:**
- Message display
- Streaming responses
- File attachments
- Command palette integration
- Memory context display
- Citations
- Reasoning mode

**Props:**
```typescript
interface ChatInterfaceProps {
  agentId?: string
  initialMessages?: Message[]
  onMessage?: (message: Message) => void
}
```

#### CanvasView

**File:** `components/playground/canvas-view.tsx`

**Purpose:** Visual block-based interface

**Features:**
- Block-based visualization
- Connection lines
- Block configuration
- Visual flow representation

#### SplitView

**File:** `components/playground/split-view.tsx`

**Purpose:** Chat and canvas side-by-side

**Features:**
- Split pane layout
- Resizable panels
- Synchronized state

#### PlaygroundHeader

**File:** `components/playground/header.tsx`

**Purpose:** Playground header with controls

**Features:**
- View mode switcher (Chat, Canvas, Split)
- Agent selector
- Settings
- Export options

#### MessageBlock

**File:** `components/playground/message-block.tsx`

**Purpose:** Render individual messages

**Block Types:**
- Text block
- Code block
- Chart block
- Table block
- Image block
- File block
- Agent block
- Workflow block

---

## Data Analysis Components

### Audience Components

**Location:** `components/audiences/`

**Components:**
- `audience-builder.tsx` - Create audience definitions
- `audience-filters.tsx` - Filter builder
- `audience-preview.tsx` - Preview audience
- `habits-behaviors.tsx` - Habits and behaviors display
- `media-consumption.tsx` - Media consumption analysis

### Crosstab Components

**Location:** `components/crosstabs/`

**Components:**
- `crosstab-grid.tsx` - Crosstab data grid
- `crosstab-builder.tsx` - Create crosstabs
- `trend-tracking.tsx` - Trend analysis
- `calculated-fields.tsx` - Calculated fields
- `crosstab-templates.tsx` - Template selection

### Chart Components

**Location:** `components/charts/`

**Components:**
- `chart-renderer.tsx` - Render charts
- `chart-builder.tsx` - Chart configuration
- `chart-types.tsx` - Chart type definitions

**Chart Types:**
- BAR, LINE, PIE, DONUT, AREA
- SCATTER, HEATMAP, TREEMAP
- FUNNEL, RADAR

### Brand Tracking Components

**Location:** `components/brand-tracking/`

**Components:**
- `brand-tracking-dashboard.tsx` - Brand health dashboard
- `snapshot-comparison.tsx` - Compare snapshots
- `trend-analysis.tsx` - Trend visualization

---

## Component Patterns

### Data Fetching Pattern

**Server Component fetches, Client Component displays:**

```typescript
// Server Component (page.tsx)
import { prisma } from '@/lib/db'
import { AgentsList } from '@/components/agents/agents-list'

export default async function AgentsPage() {
  const agents = await prisma.agent.findMany()
  return <AgentsList agents={agents} />
}

// Client Component (agents-list.tsx)
"use client"

export function AgentsList({ agents }: { agents: Agent[] }) {
  return (
    <div>
      {agents.map(agent => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  )
}
```

### Form Pattern

**React Hook Form + Zod:**

```typescript
"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
})

export function AgentForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  })
  
  return (
    <Form {...form}>
      {/* Form fields */}
    </Form>
  )
}
```

### State Management Pattern

**Local State + Server State:**

```typescript
"use client"

import { useState } from 'react'
import useSWR from 'swr'

export function AgentDetail({ agentId }: { agentId: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const { data: agent } = useSWR(`/api/v1/agents/${agentId}`, fetcher)
  
  return (
    <div>
      {isEditing ? (
        <AgentForm agent={agent} />
      ) : (
        <AgentDisplay agent={agent} />
      )}
    </div>
  )
}
```

### Event Tracking Pattern

**Custom hooks for analytics:**

```typescript
"use client"

import { useAgentTracking } from '@/hooks/use-event-tracking'

export function AgentBuilder() {
  const { trackAgentCreated } = useAgentTracking()
  
  const handleSave = async (agent: Agent) => {
    await saveAgent(agent)
    trackAgentCreated(agent)
  }
  
  return <form onSubmit={handleSave}>...</form>
}
```

---

## Related Documentation

- [Component Architecture](./COMPONENT_ARCHITECTURE.md) - Component organization
- [UI Components](./UI_COMPONENTS.md) - Base UI components
- [Core Features](../features/CORE_FEATURES.md) - Feature documentation

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
