# GWI API

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Surveys](#surveys)
4. [Taxonomy](#taxonomy)
5. [Data Pipelines](#data-pipelines)
6. [LLM Configuration](#llm-configuration)
7. [Agent Templates](#agent-templates)
8. [Data Sources](#data-sources)
9. [Monitoring](#monitoring)
10. [Services Business](#services-business)

---

## Overview

The GWI API (`/api/gwi/`) provides internal tools for GWI team members to manage core data operations, surveys, taxonomy, data pipelines, LLM configurations, and services business operations.

**Base URL:** `https://api.example.com/api/gwi`

**Authentication:** Cookie-based (`gwiToken`)

**Required Permissions:** GWI-specific roles (GWI_ADMIN, DATA_ENGINEER, TAXONOMY_MANAGER, ML_ENGINEER)

---

## Authentication

### Method

**Cookie-Based Authentication:**
- Cookie name: `gwiToken`
- Session stored in `SuperAdminSession` table
- 24-hour session expiration
- Additional permission checks via `hasGWIPermission()`

### Usage

```typescript
import { cookies } from 'next/headers'
import { validateSuperAdminSession } from '@/lib/super-admin'
import { hasGWIPermission } from '@/lib/gwi-permissions'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('gwiToken')?.value
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const session = await validateSuperAdminSession(token)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check GWI permissions
  if (!hasGWIPermission(session.admin.role, 'surveys:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Process request
}
```

### Organization Context

**Header:** `X-Organization-Id`

**Purpose:** Specify which organization's resources to manage

**Usage:** Optional - if not provided, returns all organizations' resources

---

## Surveys

### List Surveys

**Endpoint:** `GET /api/gwi/surveys`

**Query Parameters:**
- `status` - Filter by status (DRAFT, ACTIVE, ARCHIVED)
- `search` - Search in name/description
- `orgId` - Filter by organization (via header `X-Organization-Id`)

**Required Permission:** `surveys:read`

**Response:**
```json
{
  "surveys": [
    {
      "id": "survey_123",
      "name": "Q1 Consumer Survey",
      "description": "Quarterly consumer behavior survey",
      "status": "ACTIVE",
      "orgId": "org_123",
      "organization": {
        "id": "org_123",
        "name": "Acme Corp"
      },
      "_count": {
        "questions": 25,
        "responses": 10000,
        "distributions": 5
      },
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Create Survey

**Endpoint:** `POST /api/gwi/surveys`

**Required Permission:** `surveys:write`

**Request Body:**
```json
{
  "name": "New Survey",
  "description": "Survey description",
  "status": "DRAFT",
  "orgId": "org_123"
}
```

**Response:** `201 Created`

### Get Survey

**Endpoint:** `GET /api/gwi/surveys/{id}`

**Required Permission:** `surveys:read`

**Response:** `200 OK` - Full survey with questions

### Update Survey

**Endpoint:** `PATCH /api/gwi/surveys/{id}`

**Required Permission:** `surveys:write`

**Request Body:** Partial survey fields

**Response:** `200 OK`

### Delete Survey

**Endpoint:** `DELETE /api/gwi/surveys/{id}`

**Required Permission:** `surveys:delete`

**Response:** `204 No Content`

### Publish Survey

**Endpoint:** `POST /api/gwi/surveys/{id}/publish`

**Required Permission:** `surveys:publish`

**Response:** `200 OK`

### Survey Questions

**List Questions:**
- `GET /api/gwi/surveys/{id}/questions`

**Create Question:**
- `POST /api/gwi/surveys/{id}/questions`

**Update Question:**
- `PATCH /api/gwi/surveys/{id}/questions/{questionId}`

**Delete Question:**
- `DELETE /api/gwi/surveys/{id}/questions/{questionId}`

### Survey Responses

**List Responses:**
- `GET /api/gwi/surveys/{id}/responses`

**Get Response:**
- `GET /api/gwi/surveys/{id}/responses/{responseId}`

**Create Response:**
- `POST /api/gwi/surveys/{id}/responses`

---

## Taxonomy

### List Categories

**Endpoint:** `GET /api/gwi/taxonomy/categories`

**Query Parameters:**
- `parentId` - Filter by parent category
- `search` - Search in name/description
- `orgId` - Filter by organization

**Required Permission:** `taxonomy:read`

**Response:**
```json
{
  "categories": [
    {
      "id": "category_123",
      "name": "Demographics",
      "description": "Demographic categories",
      "parentId": null,
      "level": 0,
      "path": "/demographics",
      "orgId": "org_123",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Create Category

**Endpoint:** `POST /api/gwi/taxonomy/categories`

**Required Permission:** `taxonomy:write`

**Request Body:**
```json
{
  "name": "Age Groups",
  "description": "Age group categories",
  "parentId": "category_123",
  "orgId": "org_123"
}
```

**Response:** `201 Created`

### Update Category

**Endpoint:** `PATCH /api/gwi/taxonomy/categories/{id}`

**Required Permission:** `taxonomy:write`

**Request Body:** Partial category fields

**Response:** `200 OK`

### Delete Category

**Endpoint:** `DELETE /api/gwi/taxonomy/categories/{id}`

**Required Permission:** `taxonomy:delete`

**Response:** `204 No Content`

### Taxonomy Attributes

**List Attributes:**
- `GET /api/gwi/taxonomy/attributes`

**Create Attribute:**
- `POST /api/gwi/taxonomy/attributes`

**Update Attribute:**
- `PATCH /api/gwi/taxonomy/attributes/{id}`

**Delete Attribute:**
- `DELETE /api/gwi/taxonomy/attributes/{id}`

### Mapping Rules

**List Mappings:**
- `GET /api/gwi/taxonomy/mappings`

**Create Mapping:**
- `POST /api/gwi/taxonomy/mappings`

**Update Mapping:**
- `PATCH /api/gwi/taxonomy/mappings/{id}`

---

## Data Pipelines

### List Pipelines

**Endpoint:** `GET /api/gwi/pipelines`

**Query Parameters:**
- `orgId` - Filter by organization (via header)
- `type` - Filter by pipeline type
- `status` - Filter by status

**Required Permission:** `pipelines:read`

**Response:**
```json
{
  "pipelines": [
    {
      "id": "pipeline_123",
      "name": "Daily Data Sync",
      "description": "Syncs data from GWI Platform API",
      "type": "SYNC",
      "status": "ACTIVE",
      "schedule": "0 2 * * *",
      "orgId": "org_123",
      "_count": {
        "runs": 150,
        "validationRules": 5
      },
      "lastRun": {
        "status": "SUCCESS",
        "completedAt": "2026-01-15T02:00:00Z"
      },
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Create Pipeline

**Endpoint:** `POST /api/gwi/pipelines`

**Required Permission:** `pipelines:write`

**Request Body:**
```json
{
  "name": "My Pipeline",
  "description": "Pipeline description",
  "type": "ETL",
  "configuration": {
    "source": "gwi_api",
    "destination": "postgresql",
    "transformations": []
  },
  "schedule": "0 2 * * *",
  "isActive": true,
  "orgId": "org_123"
}
```

**Response:** `201 Created`

### Get Pipeline

**Endpoint:** `GET /api/gwi/pipelines/{id}`

**Required Permission:** `pipelines:read`

**Response:** `200 OK` - Full pipeline details

### Update Pipeline

**Endpoint:** `PATCH /api/gwi/pipelines/{id}`

**Required Permission:** `pipelines:write`

**Request Body:** Partial pipeline fields

**Response:** `200 OK`

### Delete Pipeline

**Endpoint:** `DELETE /api/gwi/pipelines/{id}`

**Required Permission:** `pipelines:delete`

**Response:** `204 No Content`

### Run Pipeline

**Endpoint:** `POST /api/gwi/pipelines/{id}/runs`

**Required Permission:** `pipelines:run`

**Request Body:**
```json
{
  "trigger": "manual",
  "parameters": {}
}
```

**Response:** `202 Accepted`
```json
{
  "runId": "run_123",
  "status": "PENDING"
}
```

### Pipeline Runs

**List Runs:**
- `GET /api/gwi/pipelines/{id}/runs`

**Get Run:**
- `GET /api/gwi/pipelines/{id}/runs/{runId}`

**Run Status:**
- `PENDING` - Queued for execution
- `RUNNING` - Currently executing
- `SUCCESS` - Completed successfully
- `FAILED` - Execution failed
- `CANCELLED` - Cancelled by user

---

## LLM Configuration

### List LLM Configurations

**Endpoint:** `GET /api/gwi/llm/configurations`

**Query Parameters:**
- `provider` - Filter by provider (anthropic, openai, gwi-spark)
- `orgId` - Filter by organization

**Required Permission:** `llm:read`

**Response:**
```json
{
  "configurations": [
    {
      "id": "llm_123",
      "name": "Claude 3.5 Sonnet",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "defaultTemperature": 0.7,
      "defaultMaxTokens": 2000,
      "isActive": true,
      "orgId": "org_123",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Create LLM Configuration

**Endpoint:** `POST /api/gwi/llm/configurations`

**Required Permission:** `llm:write`

**Request Body:**
```json
{
  "name": "My LLM Config",
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "defaultTemperature": 0.7,
  "defaultMaxTokens": 2000,
  "apiKey": "encrypted_key",
  "orgId": "org_123"
}
```

**Response:** `201 Created`

### Update LLM Configuration

**Endpoint:** `PATCH /api/gwi/llm/configurations/{id}`

**Required Permission:** `llm:write`

**Request Body:** Partial configuration fields

**Response:** `200 OK`

### Test LLM Configuration

**Endpoint:** `POST /api/gwi/llm/test`

**Required Permission:** `llm:test`

**Request Body:**
```json
{
  "configurationId": "llm_123",
  "prompt": "Test prompt",
  "temperature": 0.7,
  "maxTokens": 100
}
```

**Response:**
```json
{
  "response": "Test response from LLM",
  "tokensUsed": 50,
  "executionTimeMs": 1200
}
```

### Prompt Templates

**List Prompts:**
- `GET /api/gwi/llm/prompts`

**Create Prompt:**
- `POST /api/gwi/llm/prompts`

**Update Prompt:**
- `PATCH /api/gwi/llm/prompts/{id}`

**Delete Prompt:**
- `DELETE /api/gwi/llm/prompts/{id}`

### LLM Usage Analytics

**Endpoint:** `GET /api/gwi/llm/usage`

**Required Permission:** `llm:usage`

**Query Parameters:**
- `startDate` - Start date
- `endDate` - End date
- `orgId` - Filter by organization
- `configurationId` - Filter by configuration

**Response:**
```json
{
  "usage": [
    {
      "date": "2026-01-15",
      "configurationId": "llm_123",
      "requests": 1000,
      "tokensUsed": 500000,
      "cost": 15.50
    }
  ],
  "total": {
    "requests": 10000,
    "tokensUsed": 5000000,
    "cost": 155.00
  }
}
```

---

## Agent Templates

### List Agent Templates

**Endpoint:** `GET /api/gwi/agents/templates`

**Query Parameters:**
- `orgId` - Filter by organization
- `search` - Search in name/description

**Required Permission:** `agents:read`

**Response:**
```json
{
  "templates": [
    {
      "id": "template_123",
      "name": "Audience Research Template",
      "description": "Template for audience research",
      "agentType": "RESEARCH",
      "configuration": {
        "systemPrompt": "You are a research assistant...",
        "tools": ["create_audience", "create_insight"]
      },
      "isPublished": true,
      "orgId": "org_123",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Create Agent Template

**Endpoint:** `POST /api/gwi/agents/templates`

**Required Permission:** `agents:write`

**Request Body:**
```json
{
  "name": "My Template",
  "description": "Template description",
  "agentType": "RESEARCH",
  "configuration": {
    "systemPrompt": "You are a research assistant...",
    "tools": ["create_audience"]
  },
  "orgId": "org_123"
}
```

**Response:** `201 Created`

### Publish Agent Template

**Endpoint:** `POST /api/gwi/agents/templates/{id}/publish`

**Required Permission:** `agents:publish`

**Response:** `200 OK`

### Agent Tools

**List Tools:**
- `GET /api/gwi/agents/tools`

**Get Tool:**
- `GET /api/gwi/agents/tools/{name}`

---

## Data Sources

### List Data Sources

**Endpoint:** `GET /api/gwi/data-sources`

**Query Parameters:**
- `orgId` - Filter by organization
- `status` - Filter by status (PENDING, CONNECTED, ERROR, DISABLED)

**Required Permission:** `datasources:read`

**Response:**
```json
{
  "dataSources": [
    {
      "id": "source_123",
      "name": "GWI Platform API",
      "type": "API",
      "status": "CONNECTED",
      "orgId": "org_123",
      "lastSync": "2026-01-15T10:00:00Z",
      "syncStatus": {
        "lastSync": "2026-01-15T10:00:00Z",
        "recordsSynced": 10000,
        "status": "SUCCESS"
      },
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Create Data Source

**Endpoint:** `POST /api/gwi/data-sources`

**Required Permission:** `datasources:write`

**Request Body:**
```json
{
  "name": "My Data Source",
  "type": "API",
  "config": {
    "url": "https://api.example.com",
    "authType": "bearer",
    "apiKey": "encrypted_key"
  },
  "orgId": "org_123"
}
```

**Response:** `201 Created`

### Sync Data Source

**Endpoint:** `POST /api/gwi/data-sources/{id}/sync`

**Required Permission:** `datasources:sync`

**Response:** `202 Accepted`
```json
{
  "syncId": "sync_123",
  "status": "PENDING"
}
```

### Delete Data Source

**Endpoint:** `DELETE /api/gwi/data-sources/{id}`

**Required Permission:** `datasources:delete`

**Response:** `204 No Content`

---

## Monitoring

### Monitoring Dashboard

**Endpoint:** `GET /api/gwi/monitoring`

**Required Permission:** `monitoring:read`

**Response:**
```json
{
  "metrics": {
    "pipelineHealth": {
      "healthy": 45,
      "warning": 3,
      "error": 2
    },
    "dataSourceHealth": {
      "connected": 20,
      "disconnected": 2,
      "error": 1
    },
    "llmUsage": {
      "requests": 10000,
      "tokensUsed": 5000000,
      "averageLatency": 1200
    }
  }
}
```

### Monitoring Alerts

**Endpoint:** `GET /api/gwi/monitoring/alerts`

**Required Permission:** `monitoring:alerts`

**Query Parameters:**
- `severity` - Filter by severity (INFO, WARNING, CRITICAL)
- `status` - Filter by status (OPEN, RESOLVED)

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert_123",
      "type": "PIPELINE_FAILURE",
      "severity": "CRITICAL",
      "status": "OPEN",
      "message": "Pipeline 'Daily Sync' failed",
      "occurredAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Error Logs

**Endpoint:** `GET /api/gwi/monitoring/errors`

**Required Permission:** `monitoring:errors`

**Query Parameters:**
- `startDate` - Start date
- `endDate` - End date
- `severity` - Filter by severity
- `orgId` - Filter by organization

**Response:**
```json
{
  "errors": [
    {
      "id": "error_123",
      "type": "PIPELINE_ERROR",
      "severity": "ERROR",
      "message": "Connection timeout",
      "orgId": "org_123",
      "occurredAt": "2026-01-15T10:00:00Z",
      "stackTrace": "..."
    }
  ]
}
```

---

## Services Business

### Clients

**List Clients:**
- `GET /api/gwi/services/clients`

**Create Client:**
- `POST /api/gwi/services/clients`

**Get Client:**
- `GET /api/gwi/services/clients/{id}`

**Update Client:**
- `PATCH /api/gwi/services/clients/{id}`

**Delete Client:**
- `DELETE /api/gwi/services/clients/{id}`

### Projects

**List Projects:**
- `GET /api/gwi/services/projects`

**Create Project:**
- `POST /api/gwi/services/projects`

**Get Project:**
- `GET /api/gwi/services/projects/{id}`

**Update Project:**
- `PATCH /api/gwi/services/projects/{id}`

**Project Team:**
- `GET /api/gwi/services/projects/{id}/team` - List team members
- `POST /api/gwi/services/projects/{id}/team` - Add team member
- `DELETE /api/gwi/services/projects/{id}/team/{memberId}` - Remove member

### Time Tracking

**List Time Entries:**
- `GET /api/gwi/services/time/entries`

**Create Time Entry:**
- `POST /api/gwi/services/time/entries`

**Update Time Entry:**
- `PATCH /api/gwi/services/time/entries/{id}`

**Approve Time Entry:**
- `POST /api/gwi/services/time/entries/{id}/approve`

### Invoicing

**List Invoices:**
- `GET /api/gwi/services/invoicing/invoices`

**Create Invoice:**
- `POST /api/gwi/services/invoicing/invoices`

**Get Invoice:**
- `GET /api/gwi/services/invoicing/invoices/{id}`

**Send Invoice:**
- `POST /api/gwi/services/invoicing/invoices/{id}/send`

### Vendors

**List Vendors:**
- `GET /api/gwi/services/vendors`

**Create Vendor:**
- `POST /api/gwi/services/vendors`

**Get Vendor:**
- `GET /api/gwi/services/vendors/{id}`

**Update Vendor:**
- `PATCH /api/gwi/services/vendors/{id}`

### Team Management

**List Employees:**
- `GET /api/gwi/services/team/employees`

**Create Employee:**
- `POST /api/gwi/services/team/employees`

**Get Employee:**
- `GET /api/gwi/services/team/employees/{id}`

**Update Employee:**
- `PATCH /api/gwi/services/team/employees/{id}`

**Departments:**
- `GET /api/gwi/services/team/departments` - List departments
- `POST /api/gwi/services/team/departments` - Create department

### Statistics

**Endpoint:** `GET /api/gwi/services/stats`

**Required Permission:** `services:financial:read`

**Response:**
```json
{
  "stats": {
    "activeProjects": 25,
    "totalRevenue": 500000,
    "pendingInvoices": 50000,
    "teamSize": 50,
    "billableHours": 2000
  }
}
```

---

## Additional Endpoints

### GWI Platform Integration

**Create Audience:**
- `POST /api/gwi/platform/audiences/create`

**Crosstab:**
- `POST /api/gwi/platform/crosstab`

**Data Query:**
- `POST /api/gwi/platform/data`

### Spark MCP

**Query:**
- `POST /api/gwi/spark-mcp/query`

**Request Body:**
```json
{
  "query": "What are the top 5 countries by internet penetration?",
  "orgId": "org_123"
}
```

**Response:**
```json
{
  "response": "Based on GWI data...",
  "data": [/* data points */],
  "citations": [/* citations */]
}
```

---

## Related Documentation

- [API Overview](./API_OVERVIEW.md) - API basics
- [GWI Portal](../architecture/SYSTEM_OVERVIEW.md#3-gwi-team-portal-gwi) - GWI portal overview
- [GWI Permissions](../architecture/AUTH_ARCHITECTURE.md#gwi-portal-authentication) - Permission system

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
