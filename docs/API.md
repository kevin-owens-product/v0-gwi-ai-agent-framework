# GWI API Reference

**Base URL:** `https://your-domain.com/api`
**API Version:** v1

---

## Authentication

### Session Authentication

For browser-based requests, authentication is handled via session cookies managed by NextAuth.js.

### API Key Authentication

For programmatic access, include your API key in the Authorization header:

```
Authorization: Bearer gwi_live_xxxxxxxxxxxx
```

API keys can be created in Dashboard > Settings > API Keys.

### Required Headers

All API v1 endpoints require the following header:

```
x-organization-id: org_xxxxxxxxxxxx
```

---

## Rate Limiting

Rate limits vary by plan tier:

| Plan | Requests/minute |
|------|-----------------|
| Starter | 100 |
| Professional | 500 |
| Enterprise | 2,000 |

Rate limit information is returned in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200000
```

When rate limited, the API returns a `429 Too Many Requests` response.

---

## Endpoints

### Health Check

#### GET /api/health

Check API health status.

**Authentication:** None required

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-09T12:00:00.000Z"
}
```

---

### Authentication

#### POST /api/auth/register

Create a new user account and organization.

**Authentication:** None required

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "organizationName": "Acme Corp"
}
```

**Validation:**
- `name`: Required, 1-100 characters
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters
- `organizationName`: Required, 1-100 characters

**Response (201 Created):**

```json
{
  "success": true,
  "user": {
    "id": "usr_xxxxxxxxxxxx",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "organization": {
    "id": "org_xxxxxxxxxxxx",
    "name": "Acme Corp",
    "slug": "acme-corp"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
- `409 Conflict` - Email already registered

---

### Agents

#### GET /api/v1/agents

List all agents for the organization.

**Authentication:** Required
**Permission:** `agents:read`

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number | 1 |
| `limit` | integer | Results per page (max 100) | 20 |
| `status` | string | Filter by status | - |
| `type` | string | Filter by type | - |

**Status Values:** `DRAFT`, `ACTIVE`, `PAUSED`, `ARCHIVED`

**Type Values:** `RESEARCH`, `ANALYSIS`, `REPORTING`, `MONITORING`, `CUSTOM`

**Response:**

```json
{
  "data": [
    {
      "id": "ag_xxxxxxxxxxxx",
      "name": "Market Research Agent",
      "description": "Analyzes market trends",
      "type": "RESEARCH",
      "status": "ACTIVE",
      "configuration": {},
      "createdAt": "2024-01-09T10:00:00.000Z",
      "updatedAt": "2024-01-09T12:00:00.000Z",
      "creator": {
        "id": "usr_xxxxxxxxxxxx",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "_count": {
        "runs": 42
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

#### POST /api/v1/agents

Create a new agent.

**Authentication:** Required
**Permission:** `agents:write`

**Request Body:**

```json
{
  "name": "New Research Agent",
  "description": "Optional description",
  "type": "RESEARCH",
  "configuration": {
    "model": "claude-3-sonnet",
    "temperature": 0.7
  }
}
```

**Validation:**
- `name`: Required, 1-100 characters
- `description`: Optional, string
- `type`: Required, one of `RESEARCH`, `ANALYSIS`, `REPORTING`, `MONITORING`, `CUSTOM`
- `configuration`: Optional, JSON object

**Response (201 Created):**

```json
{
  "data": {
    "id": "ag_xxxxxxxxxxxx",
    "name": "New Research Agent",
    "description": "Optional description",
    "type": "RESEARCH",
    "status": "DRAFT",
    "configuration": {
      "model": "claude-3-sonnet",
      "temperature": 0.7
    },
    "createdAt": "2024-01-09T12:00:00.000Z",
    "updatedAt": "2024-01-09T12:00:00.000Z",
    "creator": {
      "id": "usr_xxxxxxxxxxxx",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

#### GET /api/v1/agents/:id

Get a single agent by ID.

**Authentication:** Required
**Permission:** `agents:read`

**Response:**

```json
{
  "data": {
    "id": "ag_xxxxxxxxxxxx",
    "name": "Market Research Agent",
    "description": "Analyzes market trends",
    "type": "RESEARCH",
    "status": "ACTIVE",
    "configuration": {},
    "createdAt": "2024-01-09T10:00:00.000Z",
    "updatedAt": "2024-01-09T12:00:00.000Z",
    "creator": {
      "id": "usr_xxxxxxxxxxxx",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "_count": {
      "runs": 42
    }
  }
}
```

**Error Responses:**

- `404 Not Found` - Agent not found

---

#### PATCH /api/v1/agents/:id

Update an existing agent.

**Authentication:** Required
**Permission:** `agents:write`

**Request Body:**

```json
{
  "name": "Updated Agent Name",
  "description": "Updated description",
  "status": "ACTIVE",
  "configuration": {
    "model": "claude-3-opus"
  }
}
```

All fields are optional. Only provided fields will be updated.

**Response:**

```json
{
  "data": {
    "id": "ag_xxxxxxxxxxxx",
    "name": "Updated Agent Name",
    "description": "Updated description",
    "type": "RESEARCH",
    "status": "ACTIVE",
    "configuration": {
      "model": "claude-3-opus"
    },
    "createdAt": "2024-01-09T10:00:00.000Z",
    "updatedAt": "2024-01-09T12:30:00.000Z",
    "creator": {
      "id": "usr_xxxxxxxxxxxx",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

#### DELETE /api/v1/agents/:id

Delete an agent.

**Authentication:** Required
**Permission:** `agents:delete`

**Response:** `204 No Content`

**Error Responses:**

- `404 Not Found` - Agent not found
- `403 Forbidden` - Insufficient permissions

---

#### POST /api/v1/agents/:id/run

Execute an agent.

**Authentication:** Required
**Permission:** `agents:execute`

**Request Body:**

```json
{
  "input": {
    "query": "Analyze Q4 2024 market trends"
  }
}
```

**Response (202 Accepted):**

```json
{
  "runId": "run_xxxxxxxxxxxx",
  "status": "PENDING",
  "startedAt": "2024-01-09T12:00:00.000Z"
}
```

**Run Status Values:** `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED`

**Error Responses:**

- `400 Bad Request` - Agent not active
- `429 Too Many Requests` - Rate limit or usage limit exceeded

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `BAD_REQUEST` | Invalid request data |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists |
| 422 | `VALIDATION_ERROR` | Request validation failed |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

---

## Permissions

API access is controlled by role-based permissions:

| Permission | Owner | Admin | Member | Viewer |
|------------|-------|-------|--------|--------|
| `agents:read` | ✅ | ✅ | ✅ | ✅ |
| `agents:write` | ✅ | ✅ | ✅ | ❌ |
| `agents:delete` | ✅ | ✅ | ❌ | ❌ |
| `agents:execute` | ✅ | ✅ | ✅ | ❌ |
| `insights:read` | ✅ | ✅ | ✅ | ✅ |
| `insights:export` | ✅ | ✅ | ❌ | ❌ |
| `data_sources:read` | ✅ | ✅ | ✅ | ❌ |
| `data_sources:write` | ✅ | ✅ | ❌ | ❌ |
| `team:read` | ✅ | ✅ | ✅ | ❌ |
| `team:invite` | ✅ | ✅ | ❌ | ❌ |
| `team:manage` | ✅ | ✅ | ❌ | ❌ |
| `billing:manage` | ✅ | ❌ | ❌ | ❌ |
| `settings:manage` | ✅ | ✅ | ❌ | ❌ |
| `audit:read` | ✅ | ✅ | ❌ | ❌ |

---

## Webhooks

### Stripe Webhook

**Endpoint:** `POST /api/webhooks/stripe`

Handles Stripe subscription events:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Configure your webhook endpoint in the Stripe dashboard with the signing secret.

---

## SDK Examples

### JavaScript/TypeScript

```typescript
const response = await fetch('https://api.example.com/api/v1/agents', {
  headers: {
    'Authorization': 'Bearer gwi_live_xxxxxxxxxxxx',
    'x-organization-id': 'org_xxxxxxxxxxxx',
    'Content-Type': 'application/json',
  },
})

const data = await response.json()
console.log(data.data) // Array of agents
```

### cURL

```bash
curl -X GET 'https://api.example.com/api/v1/agents' \
  -H 'Authorization: Bearer gwi_live_xxxxxxxxxxxx' \
  -H 'x-organization-id: org_xxxxxxxxxxxx'
```

### Create Agent

```bash
curl -X POST 'https://api.example.com/api/v1/agents' \
  -H 'Authorization: Bearer gwi_live_xxxxxxxxxxxx' \
  -H 'x-organization-id: org_xxxxxxxxxxxx' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "My Agent",
    "type": "RESEARCH",
    "description": "Analyzes market data"
  }'
```

---

## Changelog

### v1 (Current)

- Initial API release
- Agent CRUD operations
- Agent execution
- Authentication via session and API keys
- Rate limiting by plan tier
- Audit logging
