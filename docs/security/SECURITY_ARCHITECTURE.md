# Security Architecture

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Authorization](#authorization)
4. [Data Isolation](#data-isolation)
5. [API Security](#api-security)
6. [XSS/CSRF Protection](#xsscsrf-protection)
7. [Data Encryption](#data-encryption)
8. [Security Headers](#security-headers)

---

## Overview

The GWI AI Agent Framework implements a multi-layered security architecture covering authentication, authorization, data isolation, API security, and protection against common web vulnerabilities.

**Security Principles:**
- Defense in depth
- Least privilege
- Zero trust
- Secure by default

---

## Authentication

### User Dashboard (NextAuth.js)

**Provider:** NextAuth.js v5  
**Session Strategy:** JWT  
**Storage:** HTTP-only cookies

**Providers:**
- Credentials (email/password)
- Google OAuth
- Microsoft Entra ID (Azure AD)

**Configuration:** `lib/auth.ts`

**Session Flow:**
1. User authenticates via provider
2. NextAuth creates JWT session
3. Session stored in HTTP-only cookie
4. Middleware validates session on each request

### Admin Portal

**Method:** Cookie-based authentication  
**Cookie:** `adminToken`  
**Validation:** `validateSuperAdminSession()` from `lib/super-admin.ts`

**Flow:**
1. Admin logs in via `/api/admin/auth/login`
2. Server validates credentials against `SuperAdmin` table
3. Server generates session token
4. Token stored in `adminToken` cookie
5. Middleware validates token on admin routes

### GWI Portal

**Method:** Cookie-based authentication  
**Cookie:** `gwiToken`  
**Validation:** `validateSuperAdminSession()` from `lib/super-admin.ts`  
**Permission Check:** `hasGWIPermission()` from `lib/gwi-permissions.ts`

**Flow:**
1. GWI team member logs in via `/api/gwi/auth/login`
2. Server validates credentials and GWI portal access
3. Server generates session token
4. Token stored in `gwiToken` cookie
5. Middleware validates token and permissions on GWI routes

---

## Authorization

### Role-Based Access Control (RBAC)

**User Dashboard:**

**Roles:**
- `OWNER` - Full organization access
- `ADMIN` - Administrative access
- `MEMBER` - Standard access
- `VIEWER` - Read-only access

**Permissions:** Defined in `lib/permissions.ts`

**Example:**
```typescript
const PERMISSIONS = {
  'agents:read': 'View agents',
  'agents:write': 'Create and edit agents',
  'agents:delete': 'Delete agents',
  'agents:execute': 'Run agents',
  // ... more permissions
}
```

**Permission Check:**
```typescript
import { hasPermission } from '@/lib/permissions'

if (!hasPermission(membership.role, 'agents:write')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### Super Admin Roles

**Roles:** Defined in `lib/super-admin.ts`

- `SUPER_ADMIN` - Full platform access
- `ADMIN` - Admin portal access
- `SUPPORT` - Support access
- `ANALYST` - Analytics access
- `GWI_ADMIN` - GWI portal full access
- `DATA_ENGINEER` - Data pipeline access
- `TAXONOMY_MANAGER` - Taxonomy management
- `ML_ENGINEER` - ML/AI configuration

**GWI Portal Permissions:** Defined in `lib/gwi-permissions.ts`

---

## Data Isolation

### Multi-Tenancy

**Organization Scoping:**
- All data scoped to `Organization`
- Queries filtered by `orgId`
- Cross-organization access prevented

**Pattern:**
```typescript
// ✅ Good - Always filter by orgId
const agents = await prisma.agent.findMany({
  where: { orgId },
})

// ❌ Bad - Missing org filter
const agents = await prisma.agent.findMany()
```

### Organization Validation

**Middleware:** `middleware.ts`

**Process:**
1. Extract organization from request
2. Validate user membership
3. Verify organization access
4. Inject `orgId` into request context

**Function:** `getValidatedOrgId()` from `lib/tenant.ts`

### Hierarchy Isolation

**Organization Hierarchy:**
- Parent-child relationships
- Resource sharing via `SharedResourceAccess`
- Role inheritance via `RoleInheritanceRule`

**Isolation Rules:**
- Default: No cross-organization access
- Explicit sharing required
- Permission-based access control

---

## API Security

### Rate Limiting

**Service:** Upstash Redis  
**Implementation:** `lib/rate-limit.ts`

**Limits by Plan Tier:**
- `STARTER`: 100 requests/minute
- `PROFESSIONAL`: 500 requests/minute
- `ENTERPRISE`: 2000 requests/minute

**Headers:**
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

**Pattern:**
```typescript
const rateLimitResult = await checkRateLimit(identifier, planTier)
if (!rateLimitResult.success) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
  )
}
```

### API Key Authentication

**Model:** `ApiKey`  
**Storage:** Hashed keys (`keyHash`)  
**Validation:** Hash comparison

**Security:**
- Keys hashed with SHA-256
- Only prefix stored for identification
- Expiration support
- Permission scoping

### Input Validation

**Framework:** Zod

**Pattern:**
```typescript
const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
})

try {
  const data = schema.parse(body)
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    )
  }
}
```

### SQL Injection Prevention

**ORM:** Prisma

**Protection:**
- Parameterized queries
- Type-safe queries
- No raw SQL (unless necessary and sanitized)

---

## XSS/CSRF Protection

### XSS Protection

**Content Security Policy (CSP):**
- Configured in middleware
- Restricts script sources
- Prevents inline scripts

**Input Sanitization:**
- DOMPurify for HTML content
- React's built-in XSS protection
- JSON encoding for API responses

**Pattern:**
```typescript
import DOMPurify from 'isomorphic-dompurify'

const sanitized = DOMPurify.sanitize(userInput)
```

### CSRF Protection

**Next.js Built-in:**
- CSRF tokens for forms
- SameSite cookies
- Origin validation

**Cookie Settings:**
```typescript
// HTTP-only cookies
httpOnly: true

// SameSite protection
sameSite: 'lax' // or 'strict'

// Secure in production
secure: process.env.NODE_ENV === 'production'
```

---

## Data Encryption

### Data in Transit

**TLS/HTTPS:**
- Automatic SSL via Render
- TLS 1.2+ required
- Certificate auto-renewal

### Data at Rest

**Database:**
- Encrypted at rest (Render managed)
- Backup encryption

**Secrets:**
- Environment variables
- Never committed to Git
- Encrypted in Render

**Passwords:**
- Bcrypt hashing
- Salt rounds: 10
- Legacy SHA256 support (migration)

**API Keys:**
- SHA-256 hashing
- Only hash stored
- Prefix for identification

---

## Security Headers

**Middleware:** `middleware.ts`

**Headers Applied:**
```typescript
// Content Security Policy
'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"

// XSS Protection
'X-XSS-Protection': '1; mode=block'

// Frame Options
'X-Frame-Options': 'DENY'

// Content Type Options
'X-Content-Type-Options': 'nosniff'

// Referrer Policy
'Referrer-Policy': 'strict-origin-when-cross-origin'

// Permissions Policy
'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'

// Strict Transport Security
'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
```

---

## Audit Logging

### Audit Log Model

**Model:** `AuditLog`

**Fields:**
- `orgId` - Organization
- `userId` - User (optional)
- `action` - Action type
- `resourceType` - Resource type
- `resourceId` - Resource ID
- `metadata` - Additional data
- `ipAddress` - IP address
- `userAgent` - User agent
- `timestamp` - Action timestamp

### Logging Pattern

```typescript
import { logAuditEvent } from '@/lib/audit'

await logAuditEvent({
  orgId,
  userId,
  action: 'agent.created',
  resourceType: 'agent',
  resourceId: agent.id,
  metadata: { name: agent.name },
})
```

---

## Security Best Practices

### ✅ DO

- Always validate input
- Use parameterized queries
- Filter by organization
- Check permissions
- Apply rate limiting
- Log security events
- Use HTTPS in production
- Keep dependencies updated
- Hash passwords properly
- Use secure cookies

### ❌ DON'T

- Trust user input
- Expose sensitive data
- Skip authorization checks
- Store secrets in code
- Use weak passwords
- Skip rate limiting
- Ignore security warnings
- Deploy without HTTPS
- Skip audit logging
- Share credentials

---

## Security Checklist

### Development

- [ ] Input validation on all endpoints
- [ ] Authentication on protected routes
- [ ] Authorization checks in place
- [ ] Organization filtering in queries
- [ ] Rate limiting applied
- [ ] Error messages don't leak info
- [ ] Secrets not in code
- [ ] Dependencies updated

### Deployment

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Environment variables set
- [ ] Database encrypted
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Logging configured
- [ ] Access controls reviewed

---

## Related Documentation

- [Compliance](./COMPLIANCE.md) - Compliance requirements
- [Authentication Architecture](../architecture/AUTHENTICATION_ARCHITECTURE.md) - Auth details
- [Development Workflow](../development/DEVELOPMENT_WORKFLOW.md) - Security in workflow

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
