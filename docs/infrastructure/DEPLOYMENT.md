# Deployment Guide

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Build Process](#build-process)
3. [Environment Configuration](#environment-configuration)
4. [Database Migrations](#database-migrations)
5. [Deployment Steps](#deployment-steps)
6. [Monitoring](#monitoring)
7. [Rollback Procedure](#rollback-procedure)

---

## Overview

The GWI AI Agent Framework is deployed to Render using a Blueprint configuration (`render.yaml`). Deployments are automated via Git pushes, with manual deployment options available.

**Platform:** Render  
**Deployment Type:** Blueprint (Infrastructure as Code)  
**Auto Deploy:** Enabled for main branch

---

## Build Process

### Build Command

```bash
rm -rf .next node_modules/.cache && npm install && npm run build:render
```

**Steps:**
1. Clean build artifacts
2. Install dependencies
3. Run Render-optimized build

### Build Script

**File:** `scripts/render-build.js`

**Features:**
- Memory-constrained build (1280MB limit)
- Prisma client generation
- Database migration
- Next.js standalone build
- Skips Sentry in memory-constrained environments

### Build Output

**Standalone Mode:**
- Optimized for production
- Minimal dependencies
- Fast startup time

**Output Directory:** `.next/standalone`

---

## Environment Configuration

### Required Variables

Set in Render Dashboard → Service → Environment:

| Variable | Description | Source |
|----------|-------------|--------|
| `DATABASE_URL` | PostgreSQL connection | Auto-set from database service |
| `NEXTAUTH_SECRET` | Auth secret | Auto-generated |
| `NEXTAUTH_URL` | Application URL | Set manually |
| `NODE_ENV` | Environment | `production` |
| `RENDER` | Render flag | `true` |
| `MEMORY_CONSTRAINED` | Memory limit flag | `true` |
| `NODE_MEMORY_LIMIT` | Memory limit | `1280` |
| `PORT` | Server port | `3000` |

### Optional Variables

**AI Providers:**
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GWI_API_BASE_URL`
- `GWI_PLATFORM_API_KEY`
- `GWI_SPARK_API_KEY`

**Services:**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RESEND_API_KEY`
- `EMAIL_DOMAIN`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`

**OAuth:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AZURE_AD_CLIENT_ID`
- `AZURE_AD_CLIENT_SECRET`
- `AZURE_AD_TENANT_ID`

**Billing:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_*_PRICE_ID` (various)

### Variable Sync

**From `render.yaml`:**
- `sync: false` - Must be set manually
- `sync: true` - Synced from Blueprint
- `generateValue: true` - Auto-generated

---

## Database Migrations

### Automatic Migrations

**During Build:**
```bash
npm run db:migrate
```

**Process:**
1. Generate Prisma Client
2. Run pending migrations
3. Verify migration status

### Manual Migrations

**Via Render Shell:**
```bash
# Connect to service shell
# Render Dashboard → Service → Shell

# Run migrations
npm run db:migrate

# Seed database (if needed)
npm run db:seed-if-empty
```

### Migration Best Practices

1. **Test Locally First:**
   ```bash
   npm run db:migrate
   ```

2. **Review Migration Files:**
   - Check `prisma/migrations/` directory
   - Verify SQL changes

3. **Backup Before Production:**
   - Render Dashboard → Database → Backups
   - Create manual backup

4. **Monitor After Deployment:**
   - Check application logs
   - Verify database health

---

## Deployment Steps

### Automatic Deployment

**Triggered by:**
- Push to `main` branch
- Merge to `main` branch
- Manual deploy trigger

**Process:**
1. Render detects Git push
2. Clones repository
3. Runs build command
4. Applies migrations
5. Deploys application
6. Health check validation

### Manual Deployment

**Via Render Dashboard:**
1. Go to Service → Manual Deploy
2. Select branch/commit
3. Click "Deploy"

**Via Deploy Hook:**
```bash
curl -X POST $RENDER_DEPLOY_HOOK_URL
```

### Deployment Checklist

**Before Deployment:**
- [ ] All tests pass (`npm run ci`)
- [ ] Migrations tested locally
- [ ] Environment variables set
- [ ] Database backup created
- [ ] Changelog updated

**During Deployment:**
- [ ] Monitor build logs
- [ ] Verify migration success
- [ ] Check health endpoint

**After Deployment:**
- [ ] Verify application loads
- [ ] Test critical paths
- [ ] Monitor error logs
- [ ] Check performance metrics

---

## Monitoring

### Health Check

**Endpoint:** `/api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-01T00:00:00Z",
  "database": "connected"
}
```

**Configuration:**
- Path: `/api/health`
- Interval: 30 seconds
- Timeout: 10 seconds

### Application Logs

**Access:**
- Render Dashboard → Service → Logs
- Real-time streaming
- Search and filter

**Log Levels:**
- `error` - Errors and exceptions
- `warn` - Warnings
- `info` - General information
- `debug` - Debug information (dev only)

### Error Tracking

**Sentry Integration:**
- Automatic error capture
- Performance monitoring
- Release tracking
- User context

**Access:**
- Sentry Dashboard
- Filter by environment
- View error details

### Performance Monitoring

**Metrics:**
- Response times
- Request rates
- Error rates
- Database query times

**Tools:**
- Sentry Performance
- Render Metrics
- Custom analytics

---

## Rollback Procedure

### Quick Rollback

**Via Render Dashboard:**
1. Go to Service → Deploys
2. Find previous successful deployment
3. Click "Rollback"
4. Confirm rollback

### Database Rollback

**If Migration Caused Issues:**

1. **Identify Migration:**
   ```bash
   # Check migration status
   npm run db:migrate status
   ```

2. **Mark as Rolled Back:**
   ```bash
   npx prisma migrate resolve --rolled-back migration_name
   ```

3. **Restore Database:**
   - Render Dashboard → Database → Backups
   - Select backup point
   - Restore

### Code Rollback

**Via Git:**
```bash
# Revert commit
git revert <commit-hash>

# Push to trigger deployment
git push origin main
```

### Verification After Rollback

1. **Check Application:**
   - Verify health endpoint
   - Test critical features

2. **Check Database:**
   - Verify data integrity
   - Check migration status

3. **Monitor:**
   - Watch error logs
   - Check performance metrics

---

## Deployment Environments

### Production

**Branch:** `main`  
**URL:** Production domain  
**Database:** Production database  
**Auto Deploy:** Enabled

### Staging

**Branch:** `staging`  
**URL:** Staging domain  
**Database:** Staging database  
**Auto Deploy:** Enabled

### Development

**Branch:** `develop`  
**URL:** Development domain  
**Database:** Development database  
**Auto Deploy:** Optional

---

## Troubleshooting

### Build Failures

**Common Issues:**

1. **Memory Limit Exceeded:**
   - Check `NODE_MEMORY_LIMIT`
   - Optimize build process
   - Use memory-efficient patterns

2. **Migration Failures:**
   - Check migration files
   - Verify database connection
   - Review migration logs

3. **Dependency Issues:**
   - Check `package.json`
   - Verify npm registry
   - Clear cache and rebuild

### Deployment Failures

**Common Issues:**

1. **Health Check Failed:**
   - Check application logs
   - Verify health endpoint
   - Check database connection

2. **Environment Variables Missing:**
   - Verify all required variables set
   - Check variable names
   - Verify values

3. **Database Connection Failed:**
   - Check `DATABASE_URL`
   - Verify database service status
   - Check network connectivity

---

## Best Practices

### ✅ DO

- Test migrations locally first
- Create database backups before deployment
- Monitor deployment logs
- Verify health after deployment
- Use feature flags for risky changes
- Document deployment changes
- Keep deployment history

### ❌ DON'T

- Deploy without testing
- Skip database backups
- Deploy on Fridays (if possible)
- Ignore build warnings
- Skip health checks
- Deploy multiple changes at once
- Skip rollback planning

---

## Related Documentation

- [Infrastructure Overview](./INFRASTRUCTURE_OVERVIEW.md) - Infrastructure details
- [Environment Variables](../ENVIRONMENT_VARIABLES.md) - Configuration reference
- [Development Workflow](../development/DEVELOPMENT_WORKFLOW.md) - Git workflow
- [Render Deployment](../RENDER_DEPLOYMENT.md) - Detailed Render guide

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
