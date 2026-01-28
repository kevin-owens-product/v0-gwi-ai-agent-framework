# Render Production Deployment Guide

This guide will help you deploy the GWI AI Agent Framework to Render for production.

## Prerequisites

- A Render account ([sign up here](https://render.com))
- GitHub repository with your code
- API keys for required services (see below)

---

## Quick Start

### 1. Connect Your Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and create services

### 2. Set Environment Variables

After the services are created, configure environment variables in the Render dashboard:

#### Required Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `NEXTAUTH_URL` | Your production URL | Set to your Render service URL |
| `GWI_API_BASE_URL` | GWI API endpoint | Your GWI API base URL |
| `GWI_PLATFORM_API_KEY` | GWI Platform API key | From GWI Platform |
| `GWI_SPARK_API_KEY` | GWI Spark API key | From GWI Platform |
| `ANTHROPIC_API_KEY` | Anthropic API key | From [Anthropic Console](https://console.anthropic.com) |
| `OPENAI_API_KEY` | OpenAI API key | From [OpenAI Platform](https://platform.openai.com) |

#### Optional but Recommended

| Variable | Description | How to Get |
|----------|-------------|------------|
| `RESEND_API_KEY` | Email service | From [Resend Dashboard](https://resend.com) |
| `EMAIL_DOMAIN` | Email domain | Your verified domain (e.g., `gwi-platform.com`) |
| `UPSTASH_REDIS_REST_URL` | Redis URL | From [Upstash Dashboard](https://upstash.com) |
| `UPSTASH_REDIS_REST_TOKEN` | Redis token | From Upstash Dashboard |
| `SENTRY_DSN` | Error tracking | From [Sentry Dashboard](https://sentry.io) |
| `NEXT_PUBLIC_SENTRY_DSN` | Client-side Sentry | Same as SENTRY_DSN |
| `SENTRY_ORG` | Sentry org slug | From Sentry Dashboard |
| `SENTRY_PROJECT` | Sentry project slug | From Sentry Dashboard |

#### OAuth (Optional - for SSO)

| Variable | Description | How to Get |
|----------|-------------|------------|
| `GOOGLE_CLIENT_ID` | Google OAuth | From [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | From Google Cloud Console |
| `AZURE_AD_CLIENT_ID` | Azure AD client ID | From [Azure Portal](https://portal.azure.com) |
| `AZURE_AD_CLIENT_SECRET` | Azure AD secret | From Azure Portal |
| `AZURE_AD_TENANT_ID` | Azure AD tenant ID | From Azure Portal |

#### Stripe (Optional - for billing)

| Variable | Description | How to Get |
|----------|-------------|------------|
| `STRIPE_SECRET_KEY` | Stripe API key | From [Stripe Dashboard](https://dashboard.stripe.com) |
| `STRIPE_WEBHOOK_SECRET` | Webhook secret | From Stripe Dashboard → Webhooks |
| `STRIPE_STARTER_MONTHLY_PRICE_ID` | Starter monthly price | From Stripe Dashboard → Products |
| `STRIPE_STARTER_YEARLY_PRICE_ID` | Starter yearly price | From Stripe Dashboard |
| `STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID` | Professional monthly | From Stripe Dashboard |
| `STRIPE_PROFESSIONAL_YEARLY_PRICE_ID` | Professional yearly | From Stripe Dashboard |
| `STRIPE_ENTERPRISE_MONTHLY_PRICE_ID` | Enterprise monthly | From Stripe Dashboard |
| `STRIPE_ENTERPRISE_YEARLY_PRICE_ID` | Enterprise yearly | From Stripe Dashboard |

### 3. Database Setup

The `render.yaml` file automatically creates a PostgreSQL database. After deployment:

1. Go to your database service in Render
2. Copy the **Internal Database URL** (for use within Render)
3. The `DATABASE_URL` environment variable is automatically set

### 4. Initial Database Migration

The build process automatically runs migrations. To manually seed the database:

1. Open a shell in your Render service
2. Run: `npm run db:seed-if-empty`

---

## Configuration Details

### Build Process

The deployment uses a memory-optimized build script (`scripts/render-build.js`) that:

- Clears stale build artifacts
- Generates Prisma client
- Runs database migrations
- Builds Next.js with memory constraints (1280MB limit)
- Prepares standalone deployment

### Start Process

The start script (`scripts/render-start.sh`) ensures:

- Proper memory limits are set
- Build artifacts are verified
- Standalone server is used if available
- Fallback to regular Next.js start if needed

### Memory Configuration

Render's Standard plan has 2GB RAM. The build is optimized for this:

- Node.js heap limit: 1280MB
- Memory-constrained mode enabled
- Sentry webpack plugin disabled during build
- Source maps disabled to save memory

---

## Environment Variable Reference

### Auto-Generated Variables

These are automatically set by Render (don't override):

- `DATABASE_URL` - Automatically linked from database service
- `NEXTAUTH_SECRET` - Auto-generated if `generateValue: true` is set
- `RENDER` - Set to `"true"`
- `MEMORY_CONSTRAINED` - Set to `"true"`
- `NODE_MEMORY_LIMIT` - Set to `"1280"`
- `PORT` - Set to `"3000"`
- `NODE_ENV` - Set to `"production"`
- `RENDER_EXTERNAL_URL` - Your service URL

### Required Variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `NEXTAUTH_URL` | ✅ | - | Must match your Render service URL |
| `GWI_API_BASE_URL` | ✅ | - | GWI API endpoint |
| `GWI_PLATFORM_API_KEY` | ✅ | - | GWI Platform authentication |
| `GWI_SPARK_API_KEY` | ✅ | - | GWI Spark authentication |
| `ANTHROPIC_API_KEY` | ✅ | - | For AI agent features |
| `OPENAI_API_KEY` | ✅ | - | For AI agent features |

### Optional Variables

| Variable | Purpose | Fallback Behavior |
|----------|---------|-------------------|
| `RESEND_API_KEY` | Email sending | Logs to console (emails not sent) |
| `EMAIL_DOMAIN` | Email from domain | Uses `gwi-platform.com` |
| `UPSTASH_REDIS_REST_URL` | Rate limiting | Rate limiting disabled |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting | Rate limiting disabled |
| `SENTRY_DSN` | Error tracking | Sentry disabled |
| OAuth variables | SSO login | OAuth providers disabled |
| Stripe variables | Billing | Billing features disabled |

---

## Service Configuration

### Web Service

- **Type**: Web Service
- **Runtime**: Node.js
- **Plan**: Standard (2GB RAM)
- **Region**: Oregon (us-west-2)
- **Build Command**: `rm -rf .next node_modules/.cache && npm install && npm run build:render`
- **Start Command**: `bash scripts/render-start.sh`
- **Health Check**: `/api/health`
- **Auto Deploy**: Enabled (deploys on git push)

### Database Service

- **Type**: PostgreSQL
- **Plan**: Basic 256MB (upgrade to Pro for production)
- **Region**: Oregon (us-west-2)
- **PostgreSQL Version**: 16
- **Disk Size**: 1GB (increase as needed)
- **Database Name**: `gwi_production`

---

## Post-Deployment Checklist

- [ ] Verify health check endpoint: `https://your-service.onrender.com/api/health`
- [ ] Test authentication: Sign up and login
- [ ] Verify database migrations ran successfully
- [ ] Test email sending (if Resend configured)
- [ ] Test AI agent features (verify API keys)
- [ ] Configure custom domain (if needed)
- [ ] Set up SSL certificate (automatic with custom domain)
- [ ] Configure Stripe webhooks (if using billing)
- [ ] Set up Sentry alerts (if using Sentry)
- [ ] Test OAuth providers (if configured)
- [ ] Verify rate limiting (if Upstash configured)

---

## Troubleshooting

### Build Failures

**Out of Memory Error**
- The build script is already optimized for 2GB RAM
- If still failing, consider upgrading to a larger plan
- Check build logs for specific memory usage

**Database Connection Error**
- Ensure database service is running
- Verify `DATABASE_URL` is correctly set
- Check database service logs

**Prisma Generation Error**
- Ensure `DATABASE_URL` is accessible
- Check Prisma schema is valid
- Review build logs for specific errors

### Runtime Issues

**Service Won't Start**
- Check start script logs
- Verify build completed successfully
- Ensure `.next` directory exists
- Check memory limits aren't exceeded

**Health Check Failing**
- Verify `/api/health` endpoint exists
- Check service logs for errors
- Ensure database is accessible
- Verify environment variables are set

**Email Not Sending**
- Check `RESEND_API_KEY` is set
- Verify `EMAIL_DOMAIN` is configured
- Check Resend dashboard for errors
- Review application logs

### Database Issues

**Migrations Not Running**
- Check build logs for migration output
- Manually run migrations: `npm run db:migrate`
- Verify database connection string
- Check database service status

**Seed Data Missing**
- Run seed manually: `npm run db:seed-if-empty`
- Check seed script logs
- Verify database permissions

---

## Upgrading Database Plan

For production workloads, upgrade your database:

1. Go to database service in Render
2. Click **"Change Plan"**
3. Select **"Pro"** plan (recommended for production)
4. Render will handle the migration automatically

---

## Custom Domain Setup

1. Go to your web service in Render
2. Click **"Settings"** → **"Custom Domains"**
3. Add your domain (e.g., `app.yourdomain.com`)
4. Follow DNS configuration instructions
5. SSL certificate is automatically provisioned

---

## Monitoring & Alerts

### Health Checks

The service includes a health check endpoint at `/api/health` that:
- Checks database connectivity
- Returns service status
- Used by Render for automatic restarts

### Logs

Access logs in Render dashboard:
- **Service** → **"Logs"** tab
- Real-time log streaming
- Search and filter capabilities

### Metrics

Monitor in Render dashboard:
- CPU usage
- Memory usage
- Request count
- Response times

---

## Security Best Practices

1. **Never commit secrets** - Use Render environment variables
2. **Use strong NEXTAUTH_SECRET** - Auto-generated is recommended
3. **Enable rate limiting** - Configure Upstash Redis
4. **Use HTTPS** - Automatic with Render
5. **Regular updates** - Keep dependencies updated
6. **Monitor errors** - Use Sentry for production
7. **Database backups** - Configure in Render dashboard
8. **Restrict database access** - Use internal URLs only

---

## Cost Optimization

- **Database**: Start with Basic plan, upgrade as needed
- **Web Service**: Standard plan is sufficient for most workloads
- **Auto-scaling**: Configure based on traffic patterns
- **Database disk**: Monitor usage, increase as needed
- **Backups**: Configure retention policies

---

## Support

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Render Support**: [render.com/support](https://render.com/support)
- **Project Issues**: Check GitHub issues
- **Application Logs**: Available in Render dashboard

---

## Next Steps

After successful deployment:

1. Set up monitoring and alerts
2. Configure custom domain
3. Set up CI/CD for automated deployments
4. Configure database backups
5. Set up staging environment
6. Document your specific configuration
7. Train team on deployment process
