# API Overview

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [API Versioning](#api-versioning)
2. [Authentication Methods](#authentication-methods)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [Response Formats](#response-formats)
6. [Request Headers](#request-headers)
7. [Pagination](#pagination)
8. [Filtering & Sorting](#filtering--sorting)

---

## API Versioning

### Version Strategy

The platform uses **URL-based versioning** for API endpoints:

- **`/api/v1/`** - Current stable API (Public API)
- **`/api/v2/`** - Future API version (in development)
- **`/api/admin/`** - Admin portal API (no versioning)
- **`/api/gwi/`** - GWI portal API (no versioning)

### Version Lifecycle

1. **Development** - New features in development
2. **Beta** - Beta testing with select customers
3. **Stable** - Production-ready, fully supported
4. **Deprecated** - Scheduled for removal (6+ months notice)
5. **Removed** - No longer available

### Breaking Changes

Breaking changes require a new API version:
- Removing endpoints
- Changing response structures
- Removing required fields
- Changing authentication methods

Non-breaking changes can be made in-place:
- Adding new endpoints
- Adding optional fields
- Adding new response fields

---

## Authentication Methods

### 1. NextAuth Session (User Dashboard)

**Use Case:** Browser-based requests from user dashboard

**Method:** Cookie-based authentication via NextAuth.js

**Headers:** Not required (cookies sent automatically)

**Usage:**
```typescript
// Server-side: Session automatically available
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 2. API Key Authentication

**Use Case:** Programmatic API access

**Method:** Bearer token in Authorization header

**Headers:**
```
Authorization: Bearer gwi_abc123...
x-organization-id: org_123
```

**API Key Format:**
- Prefix: `gwi_` for identification
- Token: 32-character hex string
- Storage: SHA-256 hash in database

**Usage:**
```typescript
const authHeader = request.headers.get('authorization')
const apiKey = authHeader?.replace('Bearer ', '')

if (!apiKey) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const hashedKey = createHash('sha256').update(apiKey).digest('hex')
const keyRecord = await prisma.apiKey.findFirst({
  where: { hashedKey }
})
```

### 3. Admin Token (Admin Portal)

**Use Case:** Admin portal API requests

**Method:** Cookie-based (`adminToken`)

**Headers:** Not required (cookies sent automatically)

### 4. GWI Token (GWI Portal)

**Use Case:** GWI portal API requests

**Method:** Cookie-based (`gwiToken`)

**Headers:** Not required (cookies sent automatically)

---

## Rate Limiting

### Overview

Rate limiting is enforced per organization and per API key to prevent abuse and ensure fair usage.

### Implementation

**Technology:** Upstash Redis with sliding window algorithm

**File:** `lib/rate-limit.ts`

### Rate Limits by Plan

| Plan Tier | Requests per Minute |
|-----------|---------------------|
| STARTER | 60 |
| PROFESSIONAL | 300 |
| ENTERPRISE | 1000 |

### Rate Limit Headers

All API responses include rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

### Rate Limit Response

**Status Code:** `429 Too Many Requests`

**Response Body:**
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

### Rate Limit Identifier

**User Dashboard:**
- Identifier: `user:{userId}:org:{orgId}`

**API Key:**
- Identifier: `apikey:{apiKeyId}`

### Checking Rate Limits

```typescript
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'

const identifier = getRateLimitIdentifier(request, userId, orgId)
const rateLimitResult = await checkRateLimit(identifier, planTier)

if (!rateLimitResult.success) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { 
      status: 429,
      headers: getRateLimitHeaders(rateLimitResult)
    }
  )
}
```

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```typescript
interface ApiErrorResponse {
  error: string        // Error type/code
  message?: string     // Human-readable message
  details?: any        // Additional error details
  requestId?: string   // Request ID for tracking
}
```

### HTTP Status Codes

| Status Code | Meaning | Use Case |
|-------------|---------|----------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Types

**Validation Errors (400):**
```json
{
  "error": "Validation error",
  "message": "Invalid request data",
  "details": [
    {
      "path": ["name"],
      "message": "String must contain at least 1 character(s)"
    }
  ],
  "requestId": "req_123"
}
```

**Authentication Errors (401):**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required",
  "requestId": "req_123"
}
```

**Permission Errors (403):**
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to perform this action",
  "requestId": "req_123"
}
```

**Not Found Errors (404):**
```json
{
  "error": "Not found",
  "message": "The requested resource was not found",
  "requestId": "req_123"
}
```

### Error Handler

**File:** `lib/api-error-handler.ts`

**Wrapper Function:**
```typescript
import { withErrorHandler } from '@/lib/api-error-handler'

export const GET = withErrorHandler(async (request: NextRequest) => {
  // Handler logic
  return NextResponse.json({ data: result })
})
```

**Features:**
- Automatic error logging to Sentry
- Request ID generation
- Structured error responses
- Request duration tracking

---

## Response Formats

### Success Response

**Standard Response:**
```json
{
  "data": {
    // Response data
  }
}
```

**List Response:**
```json
{
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Response Headers

**Standard Headers:**
```
Content-Type: application/json
X-Request-Id: req_123456789
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

**Cache Headers:**
```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

---

## Request Headers

### Required Headers

**For API Key Authentication:**
```
Authorization: Bearer {api_key}
x-organization-id: {org_id}
```

**For Session Authentication:**
- Headers not required (cookies sent automatically)
- Organization ID inferred from session

### Optional Headers

```
Content-Type: application/json
Accept: application/json
x-request-id: {custom_request_id}  // For request tracking
```

### Organization Context

**Header:** `x-organization-id`

**Purpose:** Specify which organization context to use

**Validation:** Always validated against user's organization memberships

**Fallback:** First organization user is a member of

---

## Pagination

### Pagination Methods

**1. Page-Based Pagination**

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Example:**
```
GET /api/v1/agents?page=2&limit=50
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 150,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": true
  }
}
```

**2. Offset-Based Pagination**

**Query Parameters:**
- `offset` - Number of items to skip
- `limit` - Items per page

**Example:**
```
GET /api/v1/agents?offset=50&limit=50
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "offset": 50,
    "limit": 50,
    "total": 150,
    "hasNext": true
  }
}
```

### Pagination Best Practices

- Use page-based for user-facing APIs
- Use offset-based for programmatic access
- Always include total count when possible
- Limit maximum page size (default: 100)

---

## Filtering & Sorting

### Filtering

**Query Parameters:**
- `status` - Filter by status
- `type` - Filter by type
- `search` - Text search
- `createdAfter` - Date filter
- `createdBefore` - Date filter

**Example:**
```
GET /api/v1/agents?status=ACTIVE&type=RESEARCH&search=audience
```

### Sorting

**Query Parameters:**
- `sortBy` - Field to sort by (default: `updatedAt`)
- `sortOrder` - `asc` or `desc` (default: `desc`)

**Example:**
```
GET /api/v1/agents?sortBy=name&sortOrder=asc
```

### Common Filter Fields

**Agents:**
- `status` - DRAFT, ACTIVE, PAUSED, ARCHIVED
- `type` - RESEARCH, ANALYSIS, REPORTING, MONITORING, CUSTOM
- `search` - Name or description search

**Workflows:**
- `status` - DRAFT, ACTIVE, PAUSED, ARCHIVED
- `search` - Name or description search

**Reports:**
- `status` - DRAFT, PUBLISHED
- `type` - PRESENTATION, DASHBOARD, PDF, EXPORT, INFOGRAPHIC
- `search` - Name or description search

---

## API Endpoints Overview

### Public API v1 (`/api/v1/`)

**Core Resources:**
- `/agents` - Agent management
- `/workflows` - Workflow management
- `/reports` - Report generation
- `/dashboards` - Dashboard management
- `/audiences` - Audience analysis
- `/crosstabs` - Crosstab analysis
- `/brand-tracking` - Brand tracking
- `/charts` - Chart management
- `/memory` - Memory operations
- `/projects` - Project management
- `/templates` - Template management

**Organization:**
- `/organization/*` - Organization settings
- `/team` - Team management
- `/hierarchy` - Organization hierarchy

**Integrations:**
- `/integrations` - Integration management
- `/api-keys` - API key management
- `/webhooks` - Webhook management

**See:** [V1 API Documentation](./V1_API.md) for complete endpoint catalog

### Admin API (`/api/admin/`)

**Management:**
- `/tenants` - Tenant management
- `/users` - User management
- `/analytics` - Platform analytics
- `/audit` - Audit logs
- `/compliance` - Compliance management

**See:** [Admin API Documentation](./ADMIN_API.md) for complete endpoint catalog

### GWI API (`/api/gwi/`)

**GWI Resources:**
- `/surveys` - Survey management
- `/taxonomy` - Taxonomy management
- `/pipelines` - Data pipeline management
- `/llm` - LLM configuration
- `/agents` - Agent template management
- `/data-sources` - Data source connections

**See:** [GWI API Documentation](./GWI_API.md) for complete endpoint catalog

---

## Related Documentation

- [V1 API](./V1_API.md) - Public API endpoint catalog
- [Admin API](./ADMIN_API.md) - Admin API endpoints
- [GWI API](./GWI_API.md) - GWI API endpoints
- [Authentication Architecture](../architecture/AUTH_ARCHITECTURE.md) - Auth details
- [Application Architecture](../architecture/APPLICATION_ARCHITECTURE.md) - API structure

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
