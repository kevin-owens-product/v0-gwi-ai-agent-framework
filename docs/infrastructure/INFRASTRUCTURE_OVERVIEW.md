# Infrastructure Overview

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Hosting](#hosting)
3. [Database](#database)
4. [Cache](#cache)
5. [Storage](#storage)
6. [CDN](#cdn)
7. [Monitoring](#monitoring)

---

## Overview

The GWI AI Agent Framework infrastructure is designed for scalability, reliability, and performance. The platform uses managed services for hosting, database, cache, and monitoring.

**Architecture:** Multi-tier with managed services  
**Hosting:** Render  
**Database:** PostgreSQL (Render managed)  
**Cache:** Upstash Redis  
**Storage:** S3-compatible (future)

---

## Hosting

### Render

**Service:** Web Application Hosting  
**Plan:** Standard  
**Region:** Oregon (us-west-2)

**Configuration:**
- **Runtime:** Node.js 20
- **Build Command:** `rm -rf .next node_modules/.cache && npm install && npm run build:render`
- **Start Command:** `bash scripts/render-start.sh`
- **Health Check:** `/api/health`
- **Auto Deploy:** Enabled

**Features:**
- Automatic SSL certificates
- Zero-downtime deployments
- Horizontal scaling support
- Environment variable management
- Log aggregation

**Memory Constraints:**
- Memory limit: 1280MB
- Optimized build process for memory-constrained environments
- Standalone Next.js output

**Reference:** `render.yaml`

---

## Database

### PostgreSQL

**Service:** Render PostgreSQL  
**Plan:** Basic (256MB RAM)  
**Region:** Oregon (us-west-2)  
**Version:** PostgreSQL 16

**Configuration:**
- **Database Name:** `gwi_production`
- **Disk Size:** 1GB (expandable)
- **Connection:** Managed via `DATABASE_URL`

**Features:**
- ACID compliance
- JSON/JSONB support
- Full-text search
- Foreign key constraints
- Automatic backups

**Schema:**
- **Total Models:** 149
- **ORM:** Prisma 5.22.0
- **Migrations:** Managed via Prisma

**Connection:**
```bash
DATABASE_URL="postgresql://user:password@host:5432/gwi_production"
```

**Reference:** `prisma/schema.prisma`

---

## Cache

### Upstash Redis

**Service:** Redis Cache & Rate Limiting  
**Plan:** Pay-as-you-go  
**Region:** Global

**Use Cases:**
- API rate limiting
- Session storage (optional)
- Temporary data caching
- Pub/sub messaging

**Configuration:**
```bash
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

**Rate Limiting:**
- Per-plan tier limits
- Token bucket algorithm
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Reference:** `lib/rate-limit.ts`

---

## Storage

### S3-Compatible Storage

**Status:** Planned  
**Use Cases:**
- Report storage (PDFs, presentations)
- Export files
- Media attachments
- Backup storage

**Future Implementation:**
- Vercel Blob Storage
- AWS S3
- Cloudflare R2

**Current:** Files stored in database (JSON) or generated on-demand

---

## CDN

### Vercel Edge Network

**Service:** Content Delivery Network  
**Status:** Integrated with Next.js

**Features:**
- Global edge locations
- Automatic static asset caching
- Image optimization
- API route caching

**Configuration:**
- Automatic via Next.js
- Cache headers configured in `next.config.mjs`

---

## Monitoring

### Sentry

**Service:** Error Tracking & Performance Monitoring  
**Plan:** Team/Enterprise

**Features:**
- Error tracking
- Performance monitoring
- Source maps
- Release tracking
- User context

**Configuration:**
```bash
SENTRY_DSN="https://...@sentry.io/..."
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="gwi-ai-agent-framework"
SENTRY_AUTH_TOKEN="..."
```

**Integration:**
- Next.js SDK (`@sentry/nextjs`)
- Automatic error capture
- Performance tracing
- Conditional enablement (skipped in memory-constrained builds)

**Reference:** `sentry.*.config.ts`

### Render Logs

**Service:** Application Logging  
**Features:**
- Real-time log streaming
- Log aggregation
- Search and filtering
- Retention: 7 days

**Access:**
- Render Dashboard → Service → Logs

---

## External Services

### Email Service

**Service:** Resend  
**Use Cases:**
- Transactional emails
- Invitations
- Notifications
- Password resets

**Configuration:**
```bash
RESEND_API_KEY="re_..."
EMAIL_DOMAIN="gwi-platform.com"
```

### Payment Processing

**Service:** Stripe  
**Use Cases:**
- Subscription management
- Billing
- Payment processing

**Configuration:**
```bash
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_*_PRICE_ID="price_..."
```

### AI Providers

**Anthropic Claude:**
```bash
ANTHROPIC_API_KEY="sk-ant-..."
```

**OpenAI GPT:**
```bash
OPENAI_API_KEY="sk-..."
```

**GWI APIs:**
```bash
GWI_API_BASE_URL="https://api.gwi.com"
GWI_PLATFORM_API_KEY="..."
GWI_SPARK_API_KEY="..."
```

---

## Infrastructure Diagram

```
┌─────────────────────────────────────────┐
│         CLIENT LAYER                    │
│  ├─ Web Browser                         │
│  └─ Mobile App (future)                 │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│    CDN (Vercel Edge Network)           │
│  ├─ Static Assets                       │
│  ├─ Image Optimization                  │
│  └─ API Route Caching                   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│    APPLICATION LAYER (Render)          │
│  ├─ Next.js Application                │
│  ├─ API Routes                          │
│  └─ Server Components                   │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼────────┐
│   PostgreSQL   │   │  Upstash Redis  │
│   (Render)     │   │   (Cache)       │
└────────────────┘   └─────────────────┘
        │
┌───────▼────────────────────────────────┐
│    EXTERNAL SERVICES                    │
│  ├─ Sentry (Monitoring)                │
│  ├─ Resend (Email)                      │
│  ├─ Stripe (Billing)                    │
│  ├─ Anthropic (AI)                     │
│  ├─ OpenAI (AI)                         │
│  └─ GWI APIs (Data)                     │
└──────────────────────────────────────────┘
```

---

## Scaling Considerations

### Horizontal Scaling

**Application:**
- Render supports horizontal scaling
- Stateless application design
- Session storage in cookies (JWT)

**Database:**
- Read replicas (future)
- Connection pooling
- Query optimization

### Vertical Scaling

**Application:**
- Upgrade Render plan for more memory/CPU
- Optimize build process
- Memory-efficient code patterns

**Database:**
- Upgrade PostgreSQL plan
- Increase disk size
- Optimize queries

---

## Security

### Network Security

- **HTTPS:** Automatic SSL via Render
- **Headers:** Security headers in middleware
- **CORS:** Configured per environment

### Data Security

- **Encryption:** TLS for data in transit
- **Secrets:** Environment variables (never committed)
- **Database:** Encrypted at rest (Render managed)

### Access Control

- **Authentication:** NextAuth.js + cookie-based
- **Authorization:** RBAC with permissions
- **API Keys:** Hashed and stored securely

---

## Disaster Recovery

### Backups

**Database:**
- Automatic daily backups (Render)
- Retention: 7 days
- Point-in-time recovery available

**Application:**
- Git repository (source of truth)
- Deployment history in Render

### Recovery Procedures

1. **Database Restore:**
   - Render Dashboard → Database → Backups
   - Select backup point
   - Restore to new database or replace

2. **Application Rollback:**
   - Render Dashboard → Service → Deploys
   - Select previous deployment
   - Rollback

---

## Cost Optimization

### Current Costs

- **Render Web:** ~$7/month (Standard plan)
- **PostgreSQL:** ~$7/month (Basic plan)
- **Upstash Redis:** Pay-as-you-go
- **Sentry:** Free tier or Team plan
- **Resend:** Free tier (3,000 emails/month)

### Optimization Strategies

1. **Database:**
   - Optimize queries
   - Use indexes effectively
   - Archive old data

2. **Cache:**
   - Cache frequently accessed data
   - Set appropriate TTLs

3. **CDN:**
   - Leverage edge caching
   - Optimize asset sizes

---

## Related Documentation

- [Deployment](./DEPLOYMENT.md) - Deployment procedures
- [Environment Variables](../ENVIRONMENT_VARIABLES.md) - Configuration
- [Security Architecture](../security/SECURITY_ARCHITECTURE.md) - Security details

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
