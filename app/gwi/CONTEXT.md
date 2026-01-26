# GWI Portal Context

## Purpose

The GWI Portal (`/gwi/*`) is an internal tool for GWI team members to manage the company's core data operations:
- **Survey Management**: Create and manage market research surveys
- **Taxonomy**: Maintain data classification and standardization rules
- **Data Pipelines**: Configure and monitor ETL processes
- **LLM Configuration**: Manage AI model settings and prompts
- **Agent Configuration**: Set up automated analysis agents
- **Data Sources**: Manage external data connections

## Architecture

### Authentication Flow
```
/login?type=gwi
    ↓
POST /api/gwi/auth/login
    ↓
Set cookie: gwiToken
    ↓
Redirect to /gwi
    ↓
Layout checks gwiToken via validateSuperAdminSession()
```

### Permission System

Permissions are defined in `lib/gwi-permissions.ts`:

```typescript
// Check if user can read surveys
hasGWIPermission(session.admin.role, 'surveys:read')

// Check if user can access GWI portal
canAccessGWIPortal(session.admin.role)

// Check if user can see a navigation section
canSeeNavSection(session.admin.role, 'pipelines')
```

### API Route Pattern

All GWI API routes follow this pattern:

```typescript
import { cookies } from "next/headers"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(request: NextRequest) {
  // 1. Get and validate token
  const cookieStore = await cookies()
  const token = cookieStore.get("gwiToken")?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const session = await validateSuperAdminSession(token)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 2. Check permissions
  if (!hasGWIPermission(session.admin.role, "feature:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // 3. Perform action
  // ...

  // 4. Log action (for write operations)
  await prisma.gWIAuditLog.create({
    data: {
      adminId: session.admin.id,
      action: "ACTION_NAME",
      resourceType: "resource_type",
      resourceId: resourceId,
    }
  })
}
```

## Database Models

### Survey Management
- `Survey` - Survey instrument metadata
- `SurveyQuestion` - Questions with type and options
- `SurveyResponse` - Collected responses
- `SurveyDistribution` - Distribution channels and targets

### Taxonomy
- `TaxonomyCategory` - Hierarchical categories
- `TaxonomyAttribute` - Attribute definitions
- `TaxonomyMappingRule` - Transformation rules

### Data Pipelines
- `DataPipeline` - Pipeline configuration
- `PipelineRun` - Execution history
- `PipelineValidationRule` - Data quality rules

### LLM Configuration
- `LLMConfiguration` - Model settings
- `PromptTemplate` - Reusable prompts
- `LLMUsageRecord` - Usage tracking

### Agents
- `SystemAgentTemplate` - Agent definitions
- `SystemToolConfiguration` - Tool settings

### Data Sources
- `GWIDataSourceConnection` - External connections

### Monitoring
- `GWIMonitoringAlert` - Alert configurations
- `GWIErrorLog` - Error tracking
- `GWIAuditLog` - Action history

## UI Components

GWI-specific components are in `components/gwi/`:

```
components/gwi/
├── sidebar.tsx         # Navigation sidebar
├── header.tsx          # Page header
├── overview/           # Dashboard widgets
├── surveys/            # Survey management UI
├── taxonomy/           # Taxonomy tree view
├── pipelines/          # Pipeline configuration
├── llm/                # LLM settings
├── agents/             # Agent templates
├── data-sources/       # Connection management
└── monitoring/         # Health dashboards
```

## Navigation Structure

```
Overview
├── Dashboard
├── Activity Feed
└── Quick Actions

Survey Management
├── Surveys
├── Questions
├── Responses
└── Distribution

Taxonomy
├── Categories
├── Attributes
├── Mapping Rules
└── Validation

Data Pipelines
├── Pipelines
├── Pipeline Runs
├── Schedules
└── Validation Rules

LLM Configuration
├── Models
├── Prompts
├── Usage & Costs
└── Testing

Agent Configuration
├── System Agents
├── Agent Templates
├── Tools
└── Capabilities

Data Sources
├── Connections
├── Schemas
├── Sync Status
└── Data Quality

Monitoring
├── Pipeline Health
├── LLM Performance
├── Error Logs
└── Alerts

System
├── Settings
├── Access Control
├── Audit Logs
└── API Keys
```

## Testing

Run GWI-specific tests:
```bash
npx vitest run app/api/gwi
```

Seed GWI test data:
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-gwi.ts
```

## Common Patterns

### Form Handling
- Use shadcn/ui form components
- Validate with Zod schemas
- Optimistic updates for better UX

### Data Tables
- Use `@tanstack/react-table` for complex tables
- Implement server-side pagination for large datasets
- Include search, filter, and sort capabilities

### Error Handling
- Display errors using toast notifications
- Log errors to `GWIErrorLog` for tracking
- Show user-friendly messages, hide technical details
