# Production Readiness Guide

This guide outlines the steps to prepare the GWI AI Agent Framework for production deployment.

## 📊 Current Status: 70% Production Ready

**Last Updated:** January 2026
**Target Production Date:** Configure based on your timeline

---

## ✅ What's Already Implemented

### Security ✅
- NextAuth.js authentication with JWT and session management
- Role-based access control (RBAC) with granular permissions
- Multi-tenant isolation via organization membership
- Rate limiting with Upstash Redis (plan-based tiers)
- Input validation with Zod schemas
- Security headers via middleware
- Comprehensive audit logging (16+ action types)
- Stripe webhook signature verification

### Error Handling & Logging ✅
- **Sentry integration** for error tracking (client, server, edge)
- Structured error logging with context
- React Error Boundary with Sentry reporting
- API error handler utilities
- Specialized loggers (API, Database, External API)

### Testing ✅
- Unit tests with Vitest
- E2E tests with Playwright
- Test coverage reporting
- Comprehensive test suite for core features

### CI/CD ✅
- **GitHub Actions workflow** with:
  - Automated testing on PRs
  - Linting and type checking
  - Security scanning (npm audit, TruffleHog)
  - Build validation
  - Database migration checks
  - E2E testing with PostgreSQL service
  - Coverage reporting

### Performance ✅
- Database indexes on all major tables (70+ indexes)
- Tool result caching with TTL
- Paginated queries
- Efficient Prisma queries
- Circuit breaker pattern for external services

### Documentation ✅
- Complete API documentation
- Privacy Policy, Terms of Service, Security page
- Event tracking implementation
- Test coverage reports

---

## 🚨 Critical Items (Must Complete Before Production)

### 1. Set Up Sentry Error Tracking

**Priority:** CRITICAL
**Time Estimate:** 30 minutes

1. Create a free Sentry account at https://sentry.io/
2. Create a new project for your application
3. Copy the DSN (Data Source Name)
4. Add to Render environment variables:
   ```bash
   SENTRY_DSN=https://your-dsn@sentry.io/project-id
   NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   SENTRY_ORG=your-org-slug
   SENTRY_PROJECT=your-project-name
   SENTRY_AUTH_TOKEN=your-auth-token  # For source map uploads
   ```
5. Test error tracking:
   ```bash
   # In development, errors won't be sent to Sentry
   # Deploy to staging and trigger a test error to verify
   ```

**Validation:**
- [ ] Sentry project created
- [ ] Environment variables configured
- [ ] Test error sent and appears in Sentry dashboard
- [ ] Source maps uploaded successfully
- [ ] Error grouping and fingerprinting working

### 2. Configure Database Backups

**Priority:** CRITICAL
**Time Estimate:** 1 hour

**For Render PostgreSQL:**
1. Upgrade database plan to at least "Standard" (includes daily backups)
2. Enable point-in-time recovery (PITR)
3. Set backup retention to minimum 7 days
4. Configure cross-region backup replication (optional but recommended)

**Backup Strategy:**
- **Frequency:** Automated daily backups at 2 AM UTC
- **Retention:** 7 daily, 4 weekly, 12 monthly
- **Recovery Time Objective (RTO):** 4 hours
- **Recovery Point Objective (RPO):** 1 hour

**Alternative: Custom Backup Script**
```bash
# Add to scheduled job (e.g., GitHub Actions cron)
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz
# Upload to S3/R2/Backblaze B2
```

**Validation:**
- [ ] Backup system configured
- [ ] Test restoration performed successfully
- [ ] Backup monitoring/alerts set up
- [ ] Backup restoration documented

### 3. Add Rate Limiting to Auth Endpoints

**Priority:** CRITICAL
**Time Estimate:** 2 hours

Currently missing rate limiting on `/api/auth/signin` and `/api/auth/signup` - vulnerable to brute force attacks.

**Implementation:**
```typescript
// In app/api/auth/signin/route.ts
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limit by IP address for auth endpoints
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  const rateLimitResult = await checkRateLimit(
    `auth:signin:${ip}`,
    'STARTER',  // Use strictest tier
    { requests: 5, window: '15m' }  // 5 attempts per 15 minutes
  );

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // Continue with authentication...
}
```

**Validation:**
- [ ] Rate limiting added to signin endpoint
- [ ] Rate limiting added to signup endpoint
- [ ] Rate limiting added to password reset
- [ ] Account lockout after 5 failed attempts
- [ ] Tests added for rate limiting

### 4. Document Disaster Recovery Procedures

**Priority:** CRITICAL
**Time Estimate:** 3 hours

Create `docs/DISASTER_RECOVERY.md` with:
- Database restoration steps
- Application rollback procedures
- Data breach response plan
- Incident escalation contacts
- Post-mortem template

### 5. Implement Alerting

**Priority:** CRITICAL
**Time Estimate:** 2 hours

Configure Sentry alerts for:
- Error rate > 1% (immediate)
- Response time > 2s (warning)
- Database connection failures (critical)
- Memory usage > 80% (warning)

Optional: Integrate PagerDuty or Opsgenie for on-call rotation.

---

## ⚠️ High Priority Items (Complete Within 2 Weeks)

### 6. Set Up Application Performance Monitoring (APM)

**Priority:** HIGH
**Time Estimate:** 4 hours

**Options:**
- **Sentry Performance** (easiest, included with error tracking)
- **New Relic** (comprehensive APM)
- **DataDog** (infrastructure + APM)

**What to Monitor:**
- API endpoint latency
- Database query performance
- External API call duration
- Memory and CPU usage
- Request throughput

**Implementation with Sentry:**
```typescript
// Already configured in sentry.*.config.ts files!
// Just need to enable performance monitoring in Sentry dashboard
```

### 7. Implement Redis Caching

**Priority:** HIGH
**Time Estimate:** 6 hours

Currently Redis is only used for rate limiting. Expand to cache:

```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
  // Try cache first
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  // Fetch and cache
  const data = await fetcher();
  await redis.setex(key, ttl, data);
  return data;
}

// Usage in API routes:
const agents = await getCached(
  `org:${orgId}:agents`,
  () => prisma.agent.findMany({ where: { orgId } }),
  300
);
```

**What to Cache:**
- Organization data (5 min TTL)
- User permissions (10 min TTL)
- Agent definitions (5 min TTL)
- Dashboard widgets (2 min TTL)
- GWI API responses (1 hour TTL)

### 8. Create Staging Environment

**Priority:** HIGH
**Time Estimate:** 2 hours

Set up a staging environment on Render:
1. Duplicate production configuration
2. Use separate database
3. Configure staging-specific environment variables
4. Set up automatic deployment from `staging` branch

### 9. Database Performance Optimization

**Priority:** HIGH
**Time Estimate:** 4 hours

**Tasks:**
- [ ] Enable Prisma query logging to identify slow queries
- [ ] Add query performance monitoring (log queries > 1s)
- [ ] Configure connection pooling (increase from default 2)
- [ ] Add read replicas for analytics queries (Enterprise plan)
- [ ] Implement database activity monitoring

**Configuration:**
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Log slow queries
prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    logger.warn('Slow query detected', {
      query: e.query,
      duration: e.duration,
      params: e.params,
    });
  }
});
```

### 10. Upgrade Database Plan

**Priority:** HIGH
**Time Estimate:** 30 minutes

Current: `basic-256mb` (inadequate for production)

**Recommended:**
- **Production:** Standard plan (1GB RAM, daily backups, PITR)
- **High Availability:** Pro plan (4GB RAM, HA, read replicas)

**Steps:**
1. Go to Render dashboard → Database
2. Upgrade to Standard or Pro plan
3. Verify backup configuration
4. Update connection pool settings

---

## 📈 Medium Priority Items (Complete Within 1 Month)

### 11. Implement Prometheus Metrics

Export custom business metrics:
- Agents created/run per day
- API calls by endpoint
- Token usage by organization
- Error rates by type
- Active users/organizations

### 12. Add Feature Flagging

Use LaunchDarkly, Unleash, or simple env-based flags:
```typescript
// lib/feature-flags.ts
export const features = {
  newDashboard: process.env.FEATURE_NEW_DASHBOARD === 'true',
  aiInsights: process.env.FEATURE_AI_INSIGHTS === 'true',
  // etc.
};
```

### 13. Implement Web Vitals Tracking

Track Core Web Vitals (LCP, FID, CLS):
```typescript
// app/layout.tsx
import { sendToAnalytics } from '@/lib/analytics';

export function reportWebVitals(metric) {
  sendToAnalytics(metric);
}
```

### 14. Create Monitoring Dashboard

Set up Grafana or use Sentry/DataDog dashboards:
- Request rate and error rate
- Database performance
- Memory and CPU usage
- Active users and sessions
- Business metrics (agents run, insights generated)

### 15. Implement Data Retention Cleanup

Currently plan-based retention is defined but not enforced:

```typescript
// scripts/cleanup-old-data.ts
import { prisma } from '@/lib/db';

async function cleanupOldAuditLogs() {
  const orgs = await prisma.organization.findMany({
    select: { id: true, planTier: true },
  });

  for (const org of orgs) {
    const retentionDays = {
      STARTER: 30,
      PROFESSIONAL: 90,
      ENTERPRISE: 365,
    }[org.planTier];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    await prisma.auditLog.deleteMany({
      where: {
        orgId: org.id,
        createdAt: { lt: cutoffDate },
      },
    });
  }
}

// Run via cron job or GitHub Actions schedule
```

### 16. Security Improvements

**Secrets Management:**
- Migrate to AWS Secrets Manager or HashiCorp Vault
- Implement secret rotation policy
- Remove secrets from environment variables

**Additional Security:**
- Enable CORS allowlist for production domains
- Implement CSRF protection for state-changing operations
- Add security headers (already partially done)
- Conduct security audit (Snyk, SonarQube)

---

## 🔧 Optional Improvements (Nice to Have)

### 17. Multi-Region Deployment

Deploy to multiple regions for:
- Lower latency globally
- High availability
- Disaster recovery

### 18. CDN Configuration

Enable Cloudflare or Render CDN:
- Cache static assets
- DDoS protection
- Global distribution

### 19. Docker Containerization

Create production Dockerfile:
```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

### 20. Blue/Green Deployment

Set up blue/green deployment for zero-downtime releases.

---

## 📋 Production Launch Checklist

### Pre-Launch (1 Week Before)

- [ ] All CRITICAL items completed
- [ ] Sentry configured and tested
- [ ] Database backups working
- [ ] Rate limiting on auth endpoints
- [ ] Disaster recovery plan documented
- [ ] Alerting configured
- [ ] Staging environment matches production
- [ ] Load testing performed
- [ ] Security audit completed
- [ ] All team members trained on incident response

### Launch Day

- [ ] Monitor error rates in Sentry
- [ ] Watch database performance
- [ ] Monitor API response times
- [ ] Check memory/CPU usage
- [ ] Verify backups running
- [ ] Test critical user flows
- [ ] On-call engineer assigned

### Post-Launch (First Week)

- [ ] Daily error review in Sentry
- [ ] Daily performance review
- [ ] User feedback monitoring
- [ ] Database growth monitoring
- [ ] Cost monitoring (especially API usage)
- [ ] Incident retrospective if needed

### Post-Launch (First Month)

- [ ] Complete HIGH priority items
- [ ] Implement APM
- [ ] Add Redis caching
- [ ] Optimize slow queries
- [ ] Review and adjust rate limits
- [ ] Conduct security review
- [ ] Plan MEDIUM priority items

---

## 🎯 Success Metrics

Track these KPIs after production launch:

**Reliability:**
- Uptime > 99.9%
- Error rate < 0.1%
- P95 response time < 500ms
- Database query time < 100ms average

**Performance:**
- Page load time < 2s
- API response time < 200ms (median)
- No memory leaks (stable memory over 7 days)

**Security:**
- Zero critical security incidents
- All dependencies up to date
- Successful security audits

**Business:**
- User satisfaction > 4.5/5
- Customer support tickets < 5% of users
- Feature adoption rate tracking

---

## 📚 Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [Render Deployment Guide](https://render.com/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 🆘 Support and Escalation

**Development Team:**
- Lead Developer: [Name]
- DevOps Engineer: [Name]

**On-Call Rotation:**
- Configure PagerDuty or similar
- Document escalation procedures

**External Support:**
- Render Support: https://render.com/support
- Sentry Support: support@sentry.io
- Stripe Support: https://support.stripe.com/

---

## 📝 Changelog

### 2026-01-12
- ✅ Implemented Sentry error tracking
- ✅ Created GitHub Actions CI/CD pipeline
- ✅ Added structured error logging
- ✅ Created production readiness documentation

### Next Steps
- [ ] Configure Sentry in Render
- [ ] Set up database backups
- [ ] Add auth endpoint rate limiting
- [ ] Implement APM monitoring
