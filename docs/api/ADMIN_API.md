# Admin API

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Tenant Management](#tenant-management)
4. [User Management](#user-management)
5. [Analytics](#analytics)
6. [Compliance](#compliance)
7. [Security](#security)
8. [Operations](#operations)

---

## Overview

The Admin API (`/api/admin/`) provides platform administration endpoints for managing tenants, users, analytics, compliance, and platform operations. Access is restricted to SuperAdmin users with appropriate permissions.

**Base URL:** `https://api.example.com/api/admin`

**Authentication:** Cookie-based (`adminToken`)

**Required Permissions:** SuperAdmin roles (SUPER_ADMIN, ADMIN, SUPPORT, ANALYST)

---

## Authentication

### Method

**Cookie-Based Authentication:**
- Cookie name: `adminToken`
- Session stored in `SuperAdminSession` table
- 24-hour session expiration

### Usage

```typescript
import { cookies } from 'next/headers'
import { validateSuperAdminSession } from '@/lib/super-admin'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('adminToken')?.value
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const session = await validateSuperAdminSession(token)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check permissions
  if (!hasSuperAdminPermission(session.admin.role, 'tenants:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Process request
}
```

---

## Tenant Management

### List Tenants

**Endpoint:** `GET /api/admin/tenants`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search in name/slug
- `planTier` - Filter by plan (STARTER, PROFESSIONAL, ENTERPRISE)
- `status` - Filter by status (active, suspended)

**Required Permission:** `tenants:read`

**Response:**
```json
{
  "tenants": [
    {
      "id": "org_123",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "planTier": "PROFESSIONAL",
      "isSuspended": false,
      "_count": {
        "members": 15,
        "agents": 42,
        "workflows": 8
      },
      "subscription": {
        "status": "ACTIVE",
        "currentPeriodEnd": "2026-02-15T10:00:00Z"
      },
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

### Get Tenant

**Endpoint:** `GET /api/admin/tenants/{id}`

**Required Permission:** `tenants:read`

**Response:** `200 OK` - Full tenant details

### Create Tenant

**Endpoint:** `POST /api/admin/tenants`

**Required Permission:** `tenants:write`

**Request Body:**
```json
{
  "name": "New Organization",
  "slug": "new-org",
  "planTier": "STARTER",
  "orgType": "STANDARD",
  "industry": "Technology",
  "companySize": "MEDIUM"
}
```

**Response:** `201 Created`

### Update Tenant

**Endpoint:** `PATCH /api/admin/tenants/{id}`

**Required Permission:** `tenants:write`

**Request Body:** Partial tenant fields

**Response:** `200 OK`

### Suspend Tenant

**Endpoint:** `POST /api/admin/tenants/{id}/suspend`

**Required Permission:** `tenants:suspend`

**Request Body:**
```json
{
  "reason": "Payment overdue",
  "suspensionType": "PAYMENT",
  "notes": "Contact billing team"
}
```

**Response:** `200 OK`

### Delete Tenant

**Endpoint:** `DELETE /api/admin/tenants/{id}`

**Required Permission:** `tenants:delete`

**Response:** `204 No Content`

---

## User Management

### List Users

**Endpoint:** `GET /api/admin/users`

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `search` - Search in email/name
- `status` - Filter by status (active, banned)

**Required Permission:** `users:read`

**Response:**
```json
{
  "users": [
    {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "isBanned": false,
      "memberships": [
        {
          "organization": {
            "id": "org_123",
            "name": "Acme Corp"
          },
          "role": "ADMIN"
        }
      ],
      "_count": {
        "sessions": 3
      },
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 500,
  "page": 1,
  "limit": 20
}
```

### Get User

**Endpoint:** `GET /api/admin/users/{id}`

**Required Permission:** `users:read`

**Response:** `200 OK` - Full user details

### Create User

**Endpoint:** `POST /api/admin/users`

**Required Permission:** `users:write`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "SecurePassword123!",
  "orgId": "org_123",
  "role": "MEMBER"
}
```

**Response:** `201 Created`

### Update User

**Endpoint:** `PATCH /api/admin/users/{id}`

**Required Permission:** `users:write`

**Request Body:** Partial user fields

**Response:** `200 OK`

### Ban User

**Endpoint:** `POST /api/admin/users/{id}/ban`

**Required Permission:** `users:ban`

**Request Body:**
```json
{
  "reason": "Terms of service violation",
  "banType": "PERMANENT",
  "expiresAt": null
}
```

**Response:** `200 OK`

### Delete User

**Endpoint:** `DELETE /api/admin/users/{id}`

**Required Permission:** `users:delete`

**Response:** `204 No Content`

---

## Analytics

### Platform Analytics

**Endpoint:** `GET /api/admin/analytics`

**Required Permission:** `analytics:read`

**Query Parameters:**
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)
- `granularity` - daily, weekly, monthly

**Response:**
```json
{
  "metrics": {
    "totalTenants": 150,
    "totalUsers": 5000,
    "activeTenants": 120,
    "activeUsers": 3500,
    "newTenants": 15,
    "newUsers": 200
  },
  "timeSeries": [
    {
      "date": "2026-01-15",
      "tenants": 150,
      "users": 5000,
      "apiCalls": 50000
    }
  ]
}
```

### Revenue Metrics

**Endpoint:** `GET /api/admin/revenue`

**Required Permission:** `billing:read`

**Query Parameters:**
- `startDate` - Start date
- `endDate` - End date
- `period` - daily, weekly, monthly, yearly

**Response:**
```json
{
  "mrr": 50000,
  "arr": 600000,
  "revenue": [
    {
      "date": "2026-01-15",
      "revenue": 5000,
      "newRevenue": 500,
      "churnedRevenue": 100
    }
  ],
  "forecast": {
    "nextMonth": 52000,
    "nextQuarter": 150000
  }
}
```

### Calculate MRR

**Endpoint:** `POST /api/admin/revenue/mrr`

**Required Permission:** `billing:read`

**Response:**
```json
{
  "mrr": 50000,
  "calculatedAt": "2026-01-15T10:00:00Z"
}
```

### Feature Usage

**Endpoint:** `GET /api/admin/feature-usage`

**Required Permission:** `analytics:read`

**Response:**
```json
{
  "features": [
    {
      "featureKey": "advanced_analytics",
      "usageCount": 45,
      "uniqueTenants": 30,
      "usageRate": 0.25
    }
  ]
}
```

### Health Scores

**Endpoint:** `GET /api/admin/health-scores`

**Required Permission:** `analytics:read`

**Response:**
```json
{
  "scores": [
    {
      "orgId": "org_123",
      "score": 85,
      "riskLevel": "LOW",
      "factors": {
        "usage": 0.9,
        "engagement": 0.8,
        "support": 0.85
      }
    }
  ]
}
```

---

## Compliance

### Compliance Frameworks

**Endpoint:** `GET /api/admin/compliance/frameworks`

**Required Permission:** `compliance:read`

**Response:**
```json
{
  "frameworks": [
    {
      "id": "framework_123",
      "name": "GDPR",
      "status": "ACTIVE",
      "requirements": [/* requirements */]
    }
  ]
}
```

### Compliance Audits

**Endpoint:** `GET /api/admin/compliance/audits`

**Required Permission:** `compliance:read`

**Query Parameters:**
- `frameworkId` - Filter by framework
- `status` - Filter by audit status
- `startDate`, `endDate` - Date range

**Response:**
```json
{
  "audits": [
    {
      "id": "audit_123",
      "frameworkId": "framework_123",
      "status": "PASSED",
      "conductedAt": "2026-01-15T10:00:00Z",
      "findings": []
    }
  ]
}
```

### Data Exports

**Endpoint:** `GET /api/admin/compliance/data-exports`

**Required Permission:** `compliance:read`

**Response:**
```json
{
  "exports": [
    {
      "id": "export_123",
      "orgId": "org_123",
      "type": "GDPR",
      "status": "COMPLETED",
      "requestedAt": "2026-01-15T10:00:00Z",
      "completedAt": "2026-01-15T11:00:00Z"
    }
  ]
}
```

### Legal Holds

**Endpoint:** `GET /api/admin/compliance/legal-holds`

**Required Permission:** `compliance:read`

**Response:**
```json
{
  "holds": [
    {
      "id": "hold_123",
      "orgId": "org_123",
      "reason": "Legal investigation",
      "status": "ACTIVE",
      "startDate": "2026-01-15T10:00:00Z",
      "endDate": null
    }
  ]
}
```

---

## Security

### Security Policies

**Endpoint:** `GET /api/admin/security/policies`

**Required Permission:** `security:read`

**Response:**
```json
{
  "policies": [
    {
      "id": "policy_123",
      "type": "PASSWORD",
      "scope": "PLATFORM",
      "enforcementMode": "ENFORCED",
      "config": {
        "minLength": 12,
        "requireUppercase": true,
        "requireNumbers": true
      }
    }
  ]
}
```

### Security Violations

**Endpoint:** `GET /api/admin/security/violations`

**Required Permission:** `security:read`

**Query Parameters:**
- `orgId` - Filter by organization
- `userId` - Filter by user
- `type` - Violation type
- `status` - Violation status

**Response:**
```json
{
  "violations": [
    {
      "id": "violation_123",
      "orgId": "org_123",
      "userId": "user_123",
      "type": "FAILED_LOGIN_ATTEMPTS",
      "status": "OPEN",
      "severity": "HIGH",
      "occurredAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Threat Events

**Endpoint:** `GET /api/admin/security/threats`

**Required Permission:** `security:read`

**Response:**
```json
{
  "threats": [
    {
      "id": "threat_123",
      "type": "BRUTE_FORCE",
      "status": "DETECTED",
      "ipAddress": "192.168.1.1",
      "detectedAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### IP Blocklist

**Endpoint:** `GET /api/admin/security/ip-blocklist`

**Required Permission:** `security:read`

**Response:**
```json
{
  "blockedIPs": [
    {
      "id": "block_123",
      "ipAddress": "192.168.1.1",
      "blockType": "PERMANENT",
      "reason": "Malicious activity",
      "blockedAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

---

## Operations

### Platform Incidents

**Endpoint:** `GET /api/admin/operations/incidents`

**Required Permission:** `operations:read`

**Response:**
```json
{
  "incidents": [
    {
      "id": "incident_123",
      "title": "Database Performance Degradation",
      "severity": "HIGH",
      "status": "RESOLVED",
      "startedAt": "2026-01-15T10:00:00Z",
      "resolvedAt": "2026-01-15T11:00:00Z"
    }
  ]
}
```

### Maintenance Windows

**Endpoint:** `GET /api/admin/operations/maintenance`

**Required Permission:** `operations:read`

**Response:**
```json
{
  "windows": [
    {
      "id": "maintenance_123",
      "type": "SCHEDULED",
      "status": "UPCOMING",
      "startTime": "2026-01-20T02:00:00Z",
      "endTime": "2026-01-20T04:00:00Z",
      "description": "Database migration"
    }
  ]
}
```

### Release Management

**Endpoint:** `GET /api/admin/operations/releases`

**Required Permission:** `operations:read`

**Response:**
```json
{
  "releases": [
    {
      "id": "release_123",
      "version": "1.2.0",
      "type": "MINOR",
      "status": "DEPLOYED",
      "deployedAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Capacity Metrics

**Endpoint:** `GET /api/admin/operations/capacity`

**Required Permission:** `operations:read`

**Response:**
```json
{
  "metrics": {
    "database": {
      "usage": 0.65,
      "status": "HEALTHY"
    },
    "redis": {
      "usage": 0.45,
      "status": "HEALTHY"
    },
    "storage": {
      "usage": 0.30,
      "status": "HEALTHY"
    }
  }
}
```

---

## Additional Endpoints

### Support Tickets

- `GET /api/admin/support/tickets` - List support tickets
- `POST /api/admin/support/tickets` - Create ticket
- `GET /api/admin/support/tickets/{id}` - Get ticket
- `PATCH /api/admin/support/tickets/{id}` - Update ticket

### Feedback

- `GET /api/admin/feedback` - List user feedback
- `GET /api/admin/feedback/{id}` - Get feedback item

### NPS Surveys

- `GET /api/admin/nps/surveys` - List NPS surveys
- `POST /api/admin/nps/surveys` - Create NPS survey

### Broadcast Messages

- `GET /api/admin/broadcast` - List broadcast messages
- `POST /api/admin/broadcast` - Create broadcast message

### Feature Flags

- `GET /api/admin/features` - List feature flags
- `POST /api/admin/features` - Create feature flag
- `PATCH /api/admin/features/{id}` - Update feature flag

### System Rules

- `GET /api/admin/rules` - List system rules
- `POST /api/admin/rules` - Create system rule
- `PATCH /api/admin/rules/{id}` - Update system rule

### Email Templates

- `GET /api/admin/email-templates` - List email templates
- `POST /api/admin/email-templates` - Create template
- `PATCH /api/admin/email-templates/{id}` - Update template

### Integrations

- `GET /api/admin/integrations/apps` - List integration apps
- `GET /api/admin/integrations/webhooks` - List webhook endpoints
- `GET /api/admin/integrations/api-clients` - List API clients

### Identity Management

- `GET /api/admin/identity/sso` - List SSO configurations
- `GET /api/admin/identity/scim` - List SCIM integrations
- `GET /api/admin/identity/domains` - List verified domains

---

## Related Documentation

- [API Overview](./API_OVERVIEW.md) - API basics
- [Authentication Architecture](../architecture/AUTH_ARCHITECTURE.md) - Auth details
- [Admin Portal](../architecture/SYSTEM_OVERVIEW.md#2-admin-portal-admin) - Admin portal overview

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
