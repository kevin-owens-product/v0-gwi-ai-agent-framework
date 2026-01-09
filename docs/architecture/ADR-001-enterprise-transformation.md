# ADR-001: Enterprise SaaS Transformation

## Status
Accepted

## Date
2026-01-09

## Context

The GWI AI Agent Framework started as a v0-generated Next.js MVP deployed on Vercel. While functional for demonstration purposes, it lacks the enterprise-grade features required for production deployment:

- No database layer (all data is mock/static)
- No authentication system (simulated login)
- No multi-tenancy support
- No role-based access control (RBAC)
- No audit logging for compliance
- No billing/usage metering
- No rate limiting for API protection
- Vercel-specific deployment configuration

The platform needs to support enterprise customers with requirements for:
- Data isolation between organizations
- SSO integration (Google, Microsoft Entra ID)
- Compliance audit trails
- Usage-based billing
- API access with rate limiting
- Team management with role-based permissions

## Decision

### 1. Database Layer: PostgreSQL with Prisma ORM

**Choice:** PostgreSQL on Render + Prisma ORM

**Rationale:**
- PostgreSQL provides robust JSONB support for flexible agent configurations
- Prisma offers type-safe database access with excellent TypeScript integration
- Render provides managed PostgreSQL with automatic backups
- Prisma migrations enable version-controlled schema evolution

### 2. Authentication: NextAuth v5 (Auth.js)

**Choice:** NextAuth v5 with Prisma Adapter

**Rationale:**
- Native Next.js App Router support
- Built-in OAuth provider support (Google, Microsoft Entra ID)
- Session management with JWT strategy
- Extensible for custom SSO configurations
- Active maintenance and security updates

### 3. Multi-Tenancy: Organization-Based Isolation

**Choice:** Organization model with slug-based routing

**Rationale:**
- Each organization has isolated data through foreign key relationships
- Subdomain routing (acme.gwi-insights.com) for white-label support
- Organization membership model supports multiple users per org
- Single database with row-level isolation (cost-effective)

### 4. Authorization: Role-Based Access Control (RBAC)

**Choice:** Permission-based RBAC with four role tiers

**Roles:**
- **OWNER:** Full admin access, billing management, org deletion
- **ADMIN:** All features except billing and org deletion
- **MEMBER:** Create/edit resources, execute agents
- **VIEWER:** Read-only access to agents and insights

**Rationale:**
- Granular permissions map to specific actions
- Role hierarchy simplifies permission management
- Extensible for custom enterprise roles

### 5. Audit Logging: Event-Based Logging

**Choice:** Comprehensive audit log table with structured events

**Logged Events:**
- All CRUD operations on sensitive resources
- Authentication events (login, logout, failed attempts)
- Permission changes and role assignments
- API key usage and management
- Export operations

**Rationale:**
- Compliance requirement for enterprise customers
- Forensic capability for security incidents
- User activity monitoring for internal governance

### 6. Billing: Stripe Integration with Usage Metering

**Choice:** Stripe for subscription management + internal usage tracking

**Plan Tiers:**
- **STARTER:** 100 agent runs, 3 seats, 5 data sources
- **PROFESSIONAL:** 1000 agent runs, 10 seats, 25 data sources
- **ENTERPRISE:** Unlimited (custom pricing)

**Rationale:**
- Stripe provides robust subscription management
- Internal usage records enable granular metering
- Plan limits enforce resource constraints

### 7. Rate Limiting: Upstash Redis

**Choice:** Upstash Redis with sliding window algorithm

**Rationale:**
- Serverless-compatible (no persistent connections needed)
- Sliding window provides fair rate limiting
- Plan-based limits (100/500/2000 requests per minute)
- Analytics for monitoring abuse patterns

### 8. Deployment: Render Platform

**Choice:** Render with Infrastructure-as-Code (render.yaml)

**Rationale:**
- Native PostgreSQL integration
- Automatic deployments from GitHub
- SSL/TLS included
- Cost-effective scaling
- Docker support if needed

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Web App   │  │  Mobile App │  │   API CLI   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Edge/CDN Layer                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Render Edge Network                       ││
│  │              (SSL Termination, Static Assets)                ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Next.js 16 App                            ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       ││
│  │  │  Middleware  │  │   API Routes │  │  React Pages │       ││
│  │  │  - Auth      │  │  - /api/v1/* │  │  - Dashboard │       ││
│  │  │  - RBAC      │  │  - Webhooks  │  │  - Settings  │       ││
│  │  │  - Rate Limit│  │  - Health    │  │  - Agents    │       ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘       ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    Auth     │  │   Billing   │  │    Audit    │              │
│  │  (NextAuth) │  │  (Stripe)   │  │  (Logging)  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Tenant    │  │ Permissions │  │ Rate Limit  │              │
│  │  (Context)  │  │   (RBAC)    │  │  (Upstash)  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   Prisma ORM                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────┐  ┌─────────────────────────────┐   │
│  │    PostgreSQL (Render)  │  │      Upstash Redis          │   │
│  │    - Users & Orgs       │  │      - Rate Limiting        │   │
│  │    - Agents & Runs      │  │      - Session Cache        │   │
│  │    - Audit Logs         │  │                             │   │
│  │    - Billing            │  │                             │   │
│  └─────────────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Stripe    │  │    GWI      │  │  AI Models  │              │
│  │  (Billing)  │  │   (APIs)    │  │  (Anthropic)│              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Data Model

### Core Entities

```
Organization (1) ─┬── (N) OrganizationMember ──┬── (1) User
                  │                             │
                  ├── (N) Agent ───────────────┼── (N) AgentRun
                  │                             │
                  ├── (N) DataSource           │
                  │                             │
                  ├── (N) Insight ─────────────┘
                  │
                  ├── (N) AuditLog
                  │
                  ├── (N) UsageRecord
                  │
                  ├── (N) ApiKey
                  │
                  ├── (N) Invitation
                  │
                  ├── (1) BillingSubscription
                  │
                  └── (1) SSOConfiguration
```

### Key Relationships

- **User ↔ Organization:** Many-to-many through OrganizationMember
- **Agent ↔ AgentRun:** One-to-many (agent execution history)
- **AgentRun ↔ Insight:** One-to-many (generated insights)
- **Organization ↔ AuditLog:** One-to-many (all org activity)

## Migration Strategy

### Phase 1: Foundation (Database + Auth)
1. Install Prisma and configure PostgreSQL connection
2. Create schema with all models
3. Run initial migration
4. Implement NextAuth with Prisma adapter
5. Update existing auth pages to use real authentication

### Phase 2: Multi-Tenancy
1. Implement organization creation flow
2. Add tenant context utilities
3. Update all queries to include org scope
4. Add organization switcher to dashboard

### Phase 3: Enterprise Features
1. Implement RBAC middleware
2. Add audit logging to all sensitive operations
3. Integrate Stripe billing
4. Configure rate limiting

### Phase 4: Deployment
1. Create render.yaml blueprint
2. Configure environment variables
3. Deploy to Render
4. Run production migrations
5. Verify health check endpoint

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data migration complexity | High | Start with clean database, import mock data as needed |
| Auth state persistence | Medium | JWT strategy with proper cookie configuration |
| Multi-tenant data leakage | Critical | Enforce org scoping at query layer, add middleware checks |
| Rate limit bypass | Medium | Multiple identifier strategies (IP + API key + user) |
| Stripe webhook reliability | Medium | Implement idempotency and retry logic |

## Consequences

### Positive
- Production-ready platform with enterprise security
- Scalable multi-tenant architecture
- Compliance-ready audit logging
- Revenue-generating billing system
- Protected APIs with rate limiting

### Negative
- Increased operational complexity
- Additional infrastructure costs (Postgres, Redis)
- Learning curve for team (Prisma, NextAuth)
- More complex testing requirements

### Neutral
- Migration from Vercel to Render (different platform, similar capabilities)
- Schema evolution will require migration management

## References

- [NextAuth v5 Documentation](https://authjs.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Render Documentation](https://render.com/docs)
- [Stripe Billing Documentation](https://stripe.com/docs/billing)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
