# Public API v1

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Core Resources](#core-resources)
4. [Data Resources](#data-resources)
5. [Collaboration Resources](#collaboration-resources)
6. [Organization Resources](#organization-resources)
7. [Integration Resources](#integration-resources)

---

## Overview

The Public API v1 (`/api/v1/`) provides programmatic access to all platform features for customer organizations. All endpoints require authentication and are scoped to the authenticated user's organization.

**Base URL:** `https://api.example.com/api/v1`

**Authentication:** See [API Overview](./API_OVERVIEW.md#authentication-methods)

---

## Authentication

### Methods

1. **NextAuth Session** (Browser requests)
   - Cookie-based, automatic
   - No headers required

2. **API Key** (Programmatic access)
   - Header: `Authorization: Bearer {api_key}`
   - Header: `x-organization-id: {org_id}`

### Required Permissions

Each endpoint requires specific permissions:
- `agents:read` - View agents
- `agents:write` - Create/edit agents
- `workflows:read` - View workflows
- `workflows:write` - Create/edit workflows
- And more...

See [Permission System](../architecture/AUTH_ARCHITECTURE.md#permission-system) for complete list.

---

## Core Resources

### Agents

#### List Agents

**Endpoint:** `GET /api/v1/agents`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `status` - Filter by status (DRAFT, ACTIVE, PAUSED, ARCHIVED)
- `type` - Filter by type (RESEARCH, ANALYSIS, REPORTING, MONITORING, CUSTOM)
- `search` - Search in name/description

**Response:**
```json
{
  "data": [
    {
      "id": "agent_123",
      "name": "Audience Research Agent",
      "description": "Researches audience segments",
      "type": "RESEARCH",
      "status": "ACTIVE",
      "configuration": {},
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### Create Agent

**Endpoint:** `POST /api/v1/agents`

**Request Body:**
```json
{
  "name": "My Agent",
  "description": "Agent description",
  "type": "RESEARCH",
  "configuration": {
    "systemPrompt": "You are a research assistant...",
    "temperature": 0.7,
    "maxTokens": 2000
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "agent_123",
  "name": "My Agent",
  // ... agent fields
}
```

#### Get Agent

**Endpoint:** `GET /api/v1/agents/{id}`

**Response:** `200 OK`
```json
{
  "id": "agent_123",
  "name": "My Agent",
  // ... full agent details
}
```

#### Update Agent

**Endpoint:** `PATCH /api/v1/agents/{id}`

**Request Body:** Partial agent fields

**Response:** `200 OK` - Updated agent

#### Delete Agent

**Endpoint:** `DELETE /api/v1/agents/{id}`

**Response:** `204 No Content`

#### Run Agent

**Endpoint:** `POST /api/v1/agents/{id}/run`

**Request Body:**
```json
{
  "input": "Research Gen Z audience preferences",
  "enableTools": true
}
```

**Response:** `202 Accepted`
```json
{
  "runId": "run_123",
  "status": "PENDING",
  "message": "Agent execution started"
}
```

**Status Endpoint:** `GET /api/v1/agents/{id}/runs/{runId}`

---

### Workflows

#### List Workflows

**Endpoint:** `GET /api/v1/workflows`

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter by status
- `search` - Search in name/description

**Response:**
```json
{
  "data": [
    {
      "id": "workflow_123",
      "name": "Weekly Brand Report",
      "description": "Generates weekly brand tracking report",
      "status": "ACTIVE",
      "schedule": "0 9 * * 1",
      "agents": ["agent_1", "agent_2"],
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { /* pagination */ }
}
```

#### Create Workflow

**Endpoint:** `POST /api/v1/workflows`

**Request Body:**
```json
{
  "name": "My Workflow",
  "description": "Workflow description",
  "schedule": "0 9 * * 1",
  "agents": ["agent_1", "agent_2"],
  "configuration": {
    "steps": [/* workflow steps */]
  }
}
```

**Response:** `201 Created`

#### Run Workflow

**Endpoint:** `POST /api/v1/workflows/{id}/run`

**Request Body:**
```json
{
  "input": {
    "prompt": "Generate Q1 report"
  }
}
```

**Response:** `202 Accepted`
```json
{
  "runId": "run_123",
  "status": "PENDING"
}
```

---

### Reports

#### List Reports

**Endpoint:** `GET /api/v1/reports`

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - DRAFT, PUBLISHED, ARCHIVED
- `type` - PRESENTATION, DASHBOARD, PDF, EXPORT, INFOGRAPHIC
- `search` - Search in title/description

**Response:**
```json
{
  "data": [
    {
      "id": "report_123",
      "title": "Q1 Brand Analysis",
      "type": "PRESENTATION",
      "status": "PUBLISHED",
      "viewCount": 42,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { /* pagination */ }
}
```

#### Create Report

**Endpoint:** `POST /api/v1/reports`

**Request Body:**
```json
{
  "title": "My Report",
  "description": "Report description",
  "type": "PRESENTATION",
  "templateId": "template_123",
  "content": { /* report content */ }
}
```

**Response:** `201 Created`

#### Get Report

**Endpoint:** `GET /api/v1/reports/{id}`

**Response:** `200 OK` - Full report with content

---

### Dashboards

#### List Dashboards

**Endpoint:** `GET /api/v1/dashboards`

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - DRAFT, PUBLISHED
- `search` - Search in name/description

**Response:**
```json
{
  "data": [
    {
      "id": "dashboard_123",
      "name": "Brand Health Dashboard",
      "status": "PUBLISHED",
      "viewCount": 150,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { /* pagination */ }
}
```

#### Create Dashboard

**Endpoint:** `POST /api/v1/dashboards`

**Request Body:**
```json
{
  "name": "My Dashboard",
  "description": "Dashboard description",
  "layout": {
    "widgets": [/* widget configurations */]
  }
}
```

**Response:** `201 Created`

---

## Data Resources

### Audiences

#### List Audiences

**Endpoint:** `GET /api/v1/audiences`

**Query Parameters:**
- `page`, `limit` - Pagination
- `search` - Search in name/description
- `isFavorite` - Filter favorites

**Response:**
```json
{
  "data": [
    {
      "id": "audience_123",
      "name": "Gen Z Tech Enthusiasts",
      "description": "Gen Z users interested in technology",
      "size": 2500000,
      "markets": ["US", "UK"],
      "isFavorite": true,
      "usageCount": 15,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { /* pagination */ }
}
```

#### Create Audience

**Endpoint:** `POST /api/v1/audiences`

**Request Body:**
```json
{
  "name": "My Audience",
  "description": "Audience description",
  "criteria": {
    "filters": [
      {
        "field": "age",
        "operator": "between",
        "value": [25, 40]
      }
    ],
    "logic": "AND"
  },
  "markets": ["US", "UK"]
}
```

**Response:** `201 Created`

#### Estimate Audience Size

**Endpoint:** `POST /api/v1/audiences/estimate`

**Request Body:**
```json
{
  "criteria": { /* audience criteria */ },
  "markets": ["US"]
}
```

**Response:**
```json
{
  "estimatedSize": 2500000,
  "confidence": "high"
}
```

---

### Crosstabs

#### List Crosstabs

**Endpoint:** `GET /api/v1/crosstabs`

**Query Parameters:**
- `page`, `limit` - Pagination
- `search` - Search in name/description

**Response:**
```json
{
  "data": [
    {
      "id": "crosstab_123",
      "name": "Audience Comparison",
      "audiences": ["audience_1", "audience_2"],
      "metrics": ["awareness", "consideration"],
      "views": 25,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { /* pagination */ }
}
```

#### Create Crosstab

**Endpoint:** `POST /api/v1/crosstabs`

**Request Body:**
```json
{
  "name": "My Crosstab",
  "description": "Crosstab description",
  "audiences": ["audience_1", "audience_2"],
  "metrics": ["awareness", "consideration", "preference"],
  "filters": {
    "market": "US",
    "timeRange": "last_30_days"
  }
}
```

**Response:** `201 Created`

#### Get Crosstab Results

**Endpoint:** `GET /api/v1/crosstabs/{id}`

**Response:**
```json
{
  "id": "crosstab_123",
  "results": {
    "rows": [
      {
        "metric": "awareness",
        "values": {
          "audience_1": 0.65,
          "audience_2": 0.72
        }
      }
    ]
  }
}
```

---

### Brand Tracking

#### List Brand Trackings

**Endpoint:** `GET /api/v1/brand-tracking`

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - DRAFT, ACTIVE, PAUSED, ARCHIVED
- `search` - Search in brand name

**Response:**
```json
{
  "data": [
    {
      "id": "brand_123",
      "brandName": "My Brand",
      "status": "ACTIVE",
      "lastSnapshot": "2026-01-15T10:00:00Z",
      "snapshotCount": 12,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { /* pagination */ }
}
```

#### Create Brand Tracking

**Endpoint:** `POST /api/v1/brand-tracking`

**Request Body:**
```json
{
  "brandName": "My Brand",
  "description": "Brand description",
  "competitors": ["Competitor A", "Competitor B"],
  "audiences": ["audience_1"],
  "metrics": {
    "brandHealth": true,
    "marketShare": true,
    "sentiment": true
  },
  "schedule": "0 9 * * 1"
}
```

**Response:** `201 Created`

#### Get Brand Tracking Snapshots

**Endpoint:** `GET /api/v1/brand-tracking/{id}/snapshots`

**Query Parameters:**
- `page`, `limit` - Pagination
- `startDate` - Filter by start date
- `endDate` - Filter by end date

**Response:**
```json
{
  "data": [
    {
      "id": "snapshot_123",
      "snapshotDate": "2026-01-15T10:00:00Z",
      "brandHealth": 75.5,
      "marketShare": 0.15,
      "sentimentScore": 0.65,
      "metrics": { /* all metrics */ }
    }
  ],
  "meta": { /* pagination */ }
}
```

---

### Charts

#### List Charts

**Endpoint:** `GET /api/v1/charts`

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - DRAFT, PUBLISHED
- `type` - Chart type filter

**Response:**
```json
{
  "data": [
    {
      "id": "chart_123",
      "name": "Brand Awareness Trend",
      "type": "LINE",
      "status": "PUBLISHED",
      "views": 50,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { /* pagination */ }
}
```

#### Create Chart

**Endpoint:** `POST /api/v1/charts`

**Request Body:**
```json
{
  "name": "My Chart",
  "type": "BAR",
  "dataSource": {
    "type": "agent_run",
    "agentId": "agent_123",
    "metric": "awareness"
  },
  "config": {
    "colors": ["#3b82f6", "#10b981"],
    "showLegend": true
  }
}
```

**Response:** `201 Created`

---

## Collaboration Resources

### Projects

#### List Projects

**Endpoint:** `GET /api/v1/projects`

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - ACTIVE, ON_HOLD, COMPLETED, ARCHIVED
- `search` - Search in name/description

**Response:**
```json
{
  "data": [
    {
      "id": "project_123",
      "name": "Q1 Research Initiative",
      "status": "ACTIVE",
      "progress": 65,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { /* pagination */ }
}
```

#### Create Project

**Endpoint:** `POST /api/v1/projects`

**Request Body:**
```json
{
  "name": "My Project",
  "description": "Project description",
  "color": "#3b82f6",
  "icon": "rocket"
}
```

**Response:** `201 Created`

---

### Comments

#### List Comments

**Endpoint:** `GET /api/v1/comments`

**Query Parameters:**
- `entityType` - Resource type (required)
- `entityId` - Resource ID (required)
- `includeReplies` - Include threaded replies

**Response:**
```json
{
  "data": [
    {
      "id": "comment_123",
      "content": "Great analysis!",
      "userId": "user_123",
      "user": {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "mentions": ["user_456"],
      "isResolved": false,
      "createdAt": "2026-01-15T10:00:00Z",
      "replies": [/* nested replies */]
    }
  ]
}
```

#### Create Comment

**Endpoint:** `POST /api/v1/comments`

**Request Body:**
```json
{
  "entityType": "report",
  "entityId": "report_123",
  "content": "This report needs more detail on methodology.",
  "parentId": null,
  "mentions": ["user_456"]
}
```

**Response:** `201 Created`

---

### Shared Links

#### List Shared Links

**Endpoint:** `GET /api/v1/shared-links`

**Query Parameters:**
- `page`, `limit` - Pagination
- `entityType` - Filter by resource type
- `isActive` - Filter active links

**Response:**
```json
{
  "data": [
    {
      "id": "link_123",
      "entityType": "report",
      "entityId": "report_123",
      "token": "abc123...",
      "url": "https://app.example.com/shared/abc123...",
      "viewCount": 25,
      "maxViews": 100,
      "expiresAt": "2026-02-15T10:00:00Z",
      "isActive": true,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { /* pagination */ }
}
```

#### Create Shared Link

**Endpoint:** `POST /api/v1/shared-links`

**Request Body:**
```json
{
  "entityType": "report",
  "entityId": "report_123",
  "password": "optional_password",
  "expiresAt": "2026-02-15T10:00:00Z",
  "maxViews": 100,
  "allowedEmails": ["viewer@example.com"],
  "permissions": "VIEW"
}
```

**Response:** `201 Created`
```json
{
  "id": "link_123",
  "token": "abc123...",
  "url": "https://app.example.com/shared/abc123...",
  // ... other fields
}
```

---

## Organization Resources

### Organization Settings

#### Get Organization

**Endpoint:** `GET /api/v1/organization`

**Response:**
```json
{
  "id": "org_123",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "planTier": "PROFESSIONAL",
  "settings": {},
  "createdAt": "2026-01-15T10:00:00Z"
}
```

#### Update Organization

**Endpoint:** `PATCH /api/v1/organization`

**Request Body:** Partial organization fields

**Response:** `200 OK` - Updated organization

### Team Management

#### List Team Members

**Endpoint:** `GET /api/v1/team`

**Response:**
```json
{
  "data": [
    {
      "id": "member_123",
      "user": {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "role": "ADMIN",
      "joinedAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

#### Invite Team Member

**Endpoint:** `POST /api/v1/invitations`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "MEMBER",
  "message": "Welcome to the team!"
}
```

**Response:** `201 Created`

---

## Integration Resources

### API Keys

#### List API Keys

**Endpoint:** `GET /api/v1/api-keys`

**Response:**
```json
{
  "data": [
    {
      "id": "key_123",
      "name": "Production API Key",
      "prefix": "gwi_abc",
      "permissions": ["agents:read", "workflows:read"],
      "lastUsedAt": "2026-01-15T10:00:00Z",
      "expiresAt": null,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

#### Create API Key

**Endpoint:** `POST /api/v1/api-keys`

**Request Body:**
```json
{
  "name": "My API Key",
  "permissions": ["agents:read", "workflows:read"],
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

**Response:** `201 Created`
```json
{
  "id": "key_123",
  "name": "My API Key",
  "apiKey": "gwi_abc123...", // Only shown once
  "prefix": "gwi_abc",
  "createdAt": "2026-01-15T10:00:00Z"
}
```

**Note:** The full API key is only returned on creation. Store it securely.

#### Delete API Key

**Endpoint:** `DELETE /api/v1/api-keys/{id}`

**Response:** `204 No Content`

---

### Webhooks

#### List Webhooks

**Endpoint:** `GET /api/v1/webhooks`

**Response:**
```json
{
  "data": [
    {
      "id": "webhook_123",
      "url": "https://example.com/webhook",
      "events": ["agent.run.completed", "workflow.run.completed"],
      "status": "ACTIVE",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

#### Create Webhook

**Endpoint:** `POST /api/v1/webhooks`

**Request Body:**
```json
{
  "url": "https://example.com/webhook",
  "events": ["agent.run.completed", "workflow.run.completed"],
  "secret": "webhook_secret"
}
```

**Response:** `201 Created`

---

## Additional Endpoints

### Memory

- `GET /api/v1/memory` - List memory items
- `POST /api/v1/memory` - Store memory
- `DELETE /api/v1/memory/{id}` - Delete memory

### Templates

- `GET /api/v1/templates` - List templates
- `POST /api/v1/templates` - Create template
- `GET /api/v1/templates/{id}` - Get template

### Data Sources

- `GET /api/v1/data-sources` - List data sources
- `POST /api/v1/data-sources` - Create data source
- `GET /api/v1/data-sources/{id}/sync` - Trigger sync

### Analytics

- `GET /api/v1/analytics/performance` - Performance metrics
- `GET /api/v1/analytics/comprehensive` - Comprehensive analytics

### Chat

- `POST /api/v1/chat` - Chat with AI agent (Playground)

---

## Related Documentation

- [API Overview](./API_OVERVIEW.md) - API basics and conventions
- [Admin API](./ADMIN_API.md) - Admin portal API
- [GWI API](./GWI_API.md) - GWI portal API
- [Authentication Architecture](../architecture/AUTH_ARCHITECTURE.md) - Auth details

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
