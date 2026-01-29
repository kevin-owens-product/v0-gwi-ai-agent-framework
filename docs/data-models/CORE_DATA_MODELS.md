# Core Data Models

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Organization](#organization)
3. [User](#user)
4. [Agent](#agent)
5. [Workflow](#workflow)
6. [Report](#report)
7. [Dashboard](#dashboard)
8. [Memory](#memory)
9. [Relationships](#relationships)

---

## Overview

Core data models represent the fundamental entities in the platform. They are defined in Prisma schema and form the foundation of multi-tenancy, AI agent functionality, and data visualization.

**Database:** PostgreSQL  
**ORM:** Prisma  
**Schema File:** `prisma/schema.prisma`

---

## Organization

**Model:** `Organization`  
**Purpose:** Multi-tenant organization container

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `name` | `String` | Organization name |
| `slug` | `String` | URL-friendly identifier (unique) |
| `planTier` | `PlanTier` | Billing tier (STARTER, PROFESSIONAL, ENTERPRISE) |
| `settings` | `Json` | Organization-specific settings |
| `orgType` | `OrganizationType` | Type (STANDARD, AGENCY, HOLDING_COMPANY, etc.) |
| `parentOrgId` | `String?` | Direct parent organization ID |
| `rootOrgId` | `String?` | Top-level organization ID |
| `hierarchyPath` | `String` | Materialized path (e.g., "/rootId/parentId/id/") |
| `hierarchyLevel` | `Int` | Depth in hierarchy (0 = root) |
| `maxChildDepth` | `Int` | Maximum allowed child depth |
| `displayOrder` | `Int` | Ordering among siblings |
| `hierarchySettings` | `Json` | Hierarchy-specific configurations |
| `inheritSettings` | `Boolean` | Whether to inherit parent settings |
| `allowChildOrgs` | `Boolean` | Whether this org can have children |
| `logoUrl` | `String?` | Organization logo URL |
| `brandColor` | `String?` | Primary brand color |
| `domain` | `String?` | Custom domain for white-labeling |
| `industry` | `String?` | Industry classification |
| `companySize` | `CompanySize?` | Company size enum |
| `country` | `String?` | Country code |
| `timezone` | `String` | Timezone (default: UTC) |
| `defaultLanguage` | `String` | Default language (default: en) |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Relationships

- **Members:** `OrganizationMember[]` - Organization members
- **Agents:** `Agent[]` - AI agents
- **Workflows:** `Workflow[]` - Automated workflows
- **Reports:** `Report[]` - Generated reports
- **Dashboards:** `Dashboard[]` - Data dashboards
- **Memories:** `Memory[]` - Agent memory/context
- **Data Sources:** `DataSource[]` - Data connections
- **Audiences:** `Audience[]` - Audience definitions
- **Crosstabs:** `Crosstab[]` - Crosstab analyses
- **Parent/Child:** `Organization` (self-referential) - Hierarchy relationships

### Indexes

- `parentOrgId` - For hierarchy queries
- `rootOrgId` - For root-level queries
- `hierarchyPath` - For path-based queries
- `orgType` - For filtering by type
- `industry` - For industry filtering
- `domain` - For domain lookups

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create organization
const org = await prisma.organization.create({
  data: {
    name: 'Acme Corp',
    slug: 'acme-corp',
    planTier: 'PROFESSIONAL',
    orgType: 'STANDARD',
  },
})

// Find with hierarchy
const orgWithChildren = await prisma.organization.findUnique({
  where: { id: orgId },
  include: {
    childOrgs: true,
    parentOrg: true,
  },
})
```

---

## User

**Model:** `User`  
**Purpose:** Platform user account

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `email` | `String` | Email address (unique) |
| `name` | `String?` | Display name |
| `avatarUrl` | `String?` | Avatar image URL |
| `passwordHash` | `String?` | Hashed password (for credentials auth) |
| `emailVerified` | `DateTime?` | Email verification timestamp |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Relationships

- **Memberships:** `OrganizationMember[]` - Organization memberships
- **Sessions:** `Session[]` - Active sessions
- **Accounts:** `Account[]` - OAuth accounts (Google, Microsoft)
- **API Keys:** `ApiKey[]` - API authentication keys
- **Agents Created:** `Agent[]` - Created agents
- **Templates Created:** `Template[]` - Created templates
- **Projects Created:** `Project[]` - Created projects
- **Preferences:** `UserPreferences?` - User preferences

### Authentication

Users can authenticate via:
1. **Credentials** - Email/password (stored in `passwordHash`)
2. **Google OAuth** - Via `Account` model with `provider: 'google'`
3. **Microsoft Entra ID** - Via `Account` model with `provider: 'azure-ad'`

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
})

// Find with memberships
const userWithOrgs = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    memberships: {
      include: {
        organization: true,
      },
    },
  },
})
```

---

## Agent

**Model:** `Agent`  
**Purpose:** AI agent configuration

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `orgId` | `String` | Organization ID |
| `name` | `String` | Agent name |
| `description` | `String?` | Agent description |
| `type` | `AgentType` | Agent type (RESEARCH, ANALYSIS, REPORTING, MONITORING, CUSTOM) |
| `configuration` | `Json` | Agent configuration (prompts, tools, settings) |
| `status` | `AgentStatus` | Status (DRAFT, ACTIVE, PAUSED, ARCHIVED) |
| `createdBy` | `String` | Creator user ID |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Configuration JSON Structure

```typescript
{
  systemPrompt: string
  tools?: string[]              // Enabled tool IDs
  temperature?: number          // LLM temperature (0-1)
  maxTokens?: number            // Max output tokens
  memoryEnabled?: boolean       // Enable memory/context
  dataSources?: string[]        // Data source IDs
  outputFormat?: 'json' | 'text' | 'markdown'
  examples?: Array<{
    input: string
    output: string
  }>
}
```

### Relationships

- **Organization:** `Organization` - Owning organization
- **Creator:** `User` - User who created the agent
- **Runs:** `AgentRun[]` - Execution history

### Enums

**AgentType:**
- `RESEARCH` - Research-focused agent
- `ANALYSIS` - Data analysis agent
- `REPORTING` - Report generation agent
- `MONITORING` - Monitoring/alerting agent
- `CUSTOM` - Custom agent type

**AgentStatus:**
- `DRAFT` - Not yet active
- `ACTIVE` - Active and executable
- `PAUSED` - Temporarily paused
- `ARCHIVED` - Archived (read-only)

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create agent
const agent = await prisma.agent.create({
  data: {
    orgId: 'org_123',
    name: 'Market Research Agent',
    type: 'RESEARCH',
    status: 'ACTIVE',
    configuration: {
      systemPrompt: 'You are a market research expert...',
      temperature: 0.7,
      maxTokens: 2000,
    },
    createdBy: 'user_123',
  },
})

// Find with runs
const agentWithRuns = await prisma.agent.findUnique({
  where: { id: agentId },
  include: {
    runs: {
      orderBy: { startedAt: 'desc' },
      take: 10,
    },
  },
})
```

---

## Workflow

**Model:** `Workflow`  
**Purpose:** Multi-step agent orchestration

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `orgId` | `String` | Organization ID |
| `name` | `String` | Workflow name |
| `description` | `String?` | Workflow description |
| `status` | `WorkflowStatus` | Status (DRAFT, ACTIVE, PAUSED, ARCHIVED) |
| `schedule` | `String?` | Cron expression or "on-demand" |
| `agents` | `String[]` | Array of agent IDs in execution order |
| `configuration` | `Json` | Workflow configuration |
| `lastRun` | `DateTime?` | Last execution timestamp |
| `nextRun` | `DateTime?` | Next scheduled execution |
| `runCount` | `Int` | Total execution count |
| `createdBy` | `String` | Creator user ID |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Configuration JSON Structure

```typescript
{
  steps: Array<{
    agentId: string
    type: 'agent' | 'condition' | 'transform' | 'parallel'
    config?: {
      condition?: string        // For condition steps
      transform?: string        // For transform steps
      parallel?: string[]       // For parallel steps
    }
  }>
  retry?: {
    maxAttempts: number
    backoffMs: number
  }
  outputDestination?: {
    type: 'report' | 'dashboard' | 'webhook' | 'email'
    config: Record<string, any>
  }
}
```

### Relationships

- **Organization:** `Organization` - Owning organization
- **Runs:** `WorkflowRun[]` - Execution history

### Enums

**WorkflowStatus:**
- `DRAFT` - Not yet active
- `ACTIVE` - Active and scheduled
- `PAUSED` - Temporarily paused
- `ARCHIVED` - Archived (read-only)

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create workflow
const workflow = await prisma.workflow.create({
  data: {
    orgId: 'org_123',
    name: 'Weekly Market Report',
    status: 'ACTIVE',
    schedule: '0 9 * * 1', // Every Monday at 9 AM
    agents: ['agent_1', 'agent_2', 'agent_3'],
    configuration: {
      steps: [
        { agentId: 'agent_1', type: 'agent' },
        { agentId: 'agent_2', type: 'agent' },
        { agentId: 'agent_3', type: 'agent' },
      ],
    },
    createdBy: 'user_123',
  },
})
```

---

## Report

**Model:** `Report`  
**Purpose:** Generated research reports

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `orgId` | `String` | Organization ID |
| `title` | `String` | Report title |
| `description` | `String?` | Report description |
| `type` | `ReportType` | Report type (PRESENTATION, DASHBOARD, PDF, EXPORT, INFOGRAPHIC) |
| `status` | `ReportStatus` | Status (DRAFT, PUBLISHED, ARCHIVED) |
| `content` | `Json` | Report content structure |
| `thumbnail` | `String?` | Thumbnail image URL |
| `agentId` | `String?` | Agent that generated this report |
| `views` | `Int` | View count |
| `createdBy` | `String` | Creator user ID |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Content JSON Structure

```typescript
{
  sections: Array<{
    title: string
    content: string | object
    type: 'text' | 'chart' | 'table' | 'image'
  }>
  metadata?: {
    markets?: string[]
    audiences?: string[]
    dateRange?: { start: string, end: string }
  }
}
```

### Relationships

- **Organization:** `Organization` - Owning organization

### Enums

**ReportType:**
- `PRESENTATION` - Presentation format
- `DASHBOARD` - Interactive dashboard
- `PDF` - PDF document
- `EXPORT` - Data export
- `INFOGRAPHIC` - Visual infographic

**ReportStatus:**
- `DRAFT` - Draft (not published)
- `PUBLISHED` - Published and visible
- `ARCHIVED` - Archived (read-only)

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create report
const report = await prisma.report.create({
  data: {
    orgId: 'org_123',
    title: 'Q1 Market Analysis',
    type: 'PRESENTATION',
    status: 'PUBLISHED',
    content: {
      sections: [
        { title: 'Executive Summary', content: '...', type: 'text' },
      ],
    },
    agentId: 'agent_123',
    createdBy: 'user_123',
  },
})
```

---

## Dashboard

**Model:** `Dashboard`  
**Purpose:** Data visualization dashboards

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `orgId` | `String` | Organization ID |
| `name` | `String` | Dashboard name |
| `description` | `String?` | Dashboard description |
| `layout` | `Json` | Grid layout configuration |
| `widgets` | `Json` | Array of widget configurations |
| `status` | `DashboardStatus` | Status (DRAFT, PUBLISHED, ARCHIVED) |
| `isPublic` | `Boolean` | Public visibility flag |
| `views` | `Int` | View count |
| `createdBy` | `String` | Creator user ID |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Layout JSON Structure

```typescript
{
  columns: number           // Grid columns (default: 12)
  breakpoints: {
    sm: number
    md: number
    lg: number
    xl: number
  }
}
```

### Widgets JSON Structure

```typescript
Array<{
  id: string
  type: 'chart' | 'metric' | 'table' | 'text' | 'image' | 'kpi'
  position: {
    x: number
    y: number
    w: number
    h: number
  }
  config: {
    dataSource?: string
    chartType?: string
    filters?: Record<string, any>
    // ... type-specific config
  }
}>
```

### Relationships

- **Organization:** `Organization` - Owning organization

### Enums

**DashboardStatus:**
- `DRAFT` - Draft (not published)
- `PUBLISHED` - Published and visible
- `ARCHIVED` - Archived (read-only)

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create dashboard
const dashboard = await prisma.dashboard.create({
  data: {
    orgId: 'org_123',
    name: 'Sales Dashboard',
    status: 'PUBLISHED',
    layout: { columns: 12 },
    widgets: [
      {
        id: 'widget_1',
        type: 'chart',
        position: { x: 0, y: 0, w: 6, h: 4 },
        config: { chartType: 'bar' },
      },
    ],
    createdBy: 'user_123',
  },
})
```

---

## Memory

**Model:** `Memory`  
**Purpose:** Agent memory and context storage

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `orgId` | `String` | Organization ID |
| `agentId` | `String?` | Agent ID (null for org-wide memory) |
| `type` | `MemoryType` | Memory type |
| `key` | `String` | Memory key |
| `value` | `Json` | Memory value |
| `metadata` | `Json` | Additional metadata |
| `expiresAt` | `DateTime?` | Expiration timestamp |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Unique Constraint

- `(orgId, agentId, type, key)` - Ensures unique memory entries

### Relationships

- **Organization:** `Organization` - Owning organization

### Enums

**MemoryType:**
- `CONTEXT` - Contextual information
- `PREFERENCE` - User/agent preferences
- `FACT` - Factual information
- `CONVERSATION` - Conversation history
- `CACHE` - Cached data

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Store memory
const memory = await prisma.memory.upsert({
  where: {
    orgId_agentId_type_key: {
      orgId: 'org_123',
      agentId: 'agent_123',
      type: 'CONTEXT',
      key: 'user_preferences',
    },
  },
  create: {
    orgId: 'org_123',
    agentId: 'agent_123',
    type: 'CONTEXT',
    key: 'user_preferences',
    value: { theme: 'dark', language: 'en' },
  },
  update: {
    value: { theme: 'dark', language: 'en' },
  },
})

// Retrieve memory
const memories = await prisma.memory.findMany({
  where: {
    orgId: 'org_123',
    agentId: 'agent_123',
    type: 'CONTEXT',
  },
})
```

---

## Relationships

### Organization → User

**Via:** `OrganizationMember`

```typescript
{
  orgId: string
  userId: string
  role: Role              // OWNER, ADMIN, MEMBER, VIEWER
  invitedBy?: string
  joinedAt: DateTime
}
```

### Organization Hierarchy

**Self-referential via:**
- `parentOrgId` → `Organization`
- `rootOrgId` → `Organization`
- `hierarchyPath` → Materialized path

### Agent → Organization

**Many-to-One:**
- Each agent belongs to one organization
- Cascade delete: Deleting org deletes agents

### Workflow → Agent

**Many-to-Many via array:**
- `Workflow.agents: String[]` contains agent IDs
- Workflow orchestrates multiple agents

### Report → Agent

**Optional Many-to-One:**
- `Report.agentId` references agent that generated report
- Reports can be manually created (no agentId)

### Dashboard → Organization

**Many-to-One:**
- Each dashboard belongs to one organization
- Cascade delete: Deleting org deletes dashboards

### Memory → Organization/Agent

**Many-to-One:**
- Memory belongs to organization
- Optional agentId for agent-specific memory
- Unique constraint ensures no duplicates

---

## Best Practices

### 1. Always Filter by Organization

```typescript
// ✅ Good
const agents = await prisma.agent.findMany({
  where: { orgId },
})

// ❌ Bad - Missing org filter
const agents = await prisma.agent.findMany()
```

### 2. Use Cascade Deletes

```typescript
// Organization deletion cascades to:
// - Agents
// - Workflows
// - Reports
// - Dashboards
// - Memories
// - etc.

await prisma.organization.delete({
  where: { id: orgId },
})
```

### 3. Index Queries Properly

```typescript
// Use indexed fields for filtering
const agents = await prisma.agent.findMany({
  where: {
    orgId,              // ✅ Indexed
    status: 'ACTIVE',    // ✅ Indexed
  },
})
```

### 4. Handle JSON Fields Safely

```typescript
// Validate JSON structure
import { z } from 'zod'

const agentConfigSchema = z.object({
  systemPrompt: z.string(),
  temperature: z.number().min(0).max(1),
})

const config = agentConfigSchema.parse(agent.configuration)
```

---

## Related Documentation

- [Enterprise Data Models](./ENTERPRISE_DATA_MODELS.md) - Hierarchy, SSO, Billing
- [GWI Data Models](./GWI_DATA_MODELS.md) - Surveys, Taxonomy, Pipelines
- [Database Schema](../architecture/DATABASE_SCHEMA.md) - Full schema reference
- [Prisma Guide](../development/PRISMA_GUIDE.md) - Prisma usage patterns

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
