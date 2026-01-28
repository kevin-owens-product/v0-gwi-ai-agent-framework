# Environment Variables Reference

This document lists all environment variables used by the GWI AI Agent Framework.

For local development, copy these to `.env.local`. For Render production, set them in the Render dashboard.

## Quick Reference

### Required Variables

```bash
# Database (auto-provided by Render database service)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Authentication
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.com"

# GWI API Integration
GWI_API_BASE_URL="https://api.gwi.com"
GWI_PLATFORM_API_KEY="your-gwi-platform-api-key"
GWI_SPARK_API_KEY="your-gwi-spark-api-key"

# AI Providers
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
```

### Optional Variables

```bash
# Email Service
RESEND_API_KEY="re_..."
EMAIL_DOMAIN="gwi-platform.com"

# Rate Limiting
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Error Tracking
SENTRY_DSN="https://...@sentry.io/..."
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="gwi-ai-agent-framework"
SENTRY_AUTH_TOKEN=""

# OAuth (Google)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# OAuth (Azure AD)
AZURE_AD_CLIENT_ID=""
AZURE_AD_CLIENT_SECRET=""
AZURE_AD_TENANT_ID=""

# Stripe Billing
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_STARTER_MONTHLY_PRICE_ID="price_..."
STRIPE_STARTER_YEARLY_PRICE_ID="price_..."
STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID="price_..."
STRIPE_PROFESSIONAL_YEARLY_PRICE_ID="price_..."
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID="price_..."
STRIPE_ENTERPRISE_YEARLY_PRICE_ID="price_..."
```

---

## Detailed Reference

### Database

#### `DATABASE_URL`
- **Required**: Yes
- **Type**: Connection String
- **Format**: `postgresql://user:password@host:5432/dbname`
- **Render**: Automatically provided by database service
- **Local**: Set manually in `.env.local`

---

### Authentication

#### `NEXTAUTH_SECRET`
- **Required**: Yes
- **Type**: String
- **Purpose**: Secret key for encrypting NextAuth sessions
- **Generate**: `openssl rand -base64 32`
- **Render**: Auto-generated if `generateValue: true` in render.yaml
- **Security**: Must be unique and kept secret

#### `NEXTAUTH_URL`
- **Required**: Yes
- **Type**: URL
- **Purpose**: Base URL for authentication callbacks
- **Format**: `https://your-domain.com` or `http://localhost:3000` (dev)
- **Render**: Set to your Render service URL
- **Note**: Must match your actual domain

---

### GWI API Integration

#### `GWI_API_BASE_URL`
- **Required**: Yes
- **Type**: URL
- **Purpose**: Base URL for GWI Platform API
- **Example**: `https://api.gwi.com`
- **Note**: Provided by GWI

#### `GWI_PLATFORM_API_KEY`
- **Required**: Yes
- **Type**: String
- **Purpose**: API key for GWI Platform authentication
- **Note**: Get from GWI Platform dashboard

#### `GWI_SPARK_API_KEY`
- **Required**: Yes
- **Type**: String
- **Purpose**: API key for GWI Spark API
- **Note**: Get from GWI Platform dashboard

---

### AI Providers

#### `ANTHROPIC_API_KEY`
- **Required**: Yes (for AI features)
- **Type**: String
- **Purpose**: Anthropic Claude API key
- **Format**: `sk-ant-...`
- **Get**: [Anthropic Console](https://console.anthropic.com)

#### `OPENAI_API_KEY`
- **Required**: Yes (for AI features)
- **Type**: String
- **Purpose**: OpenAI API key
- **Format**: `sk-...`
- **Get**: [OpenAI Platform](https://platform.openai.com)

---

### Email Service

#### `RESEND_API_KEY`
- **Required**: No (optional)
- **Type**: String
- **Purpose**: Resend API key for sending emails
- **Format**: `re_...`
- **Get**: [Resend Dashboard](https://resend.com)
- **Fallback**: If not set, emails are logged to console (not sent)

#### `EMAIL_DOMAIN`
- **Required**: No (optional)
- **Type**: String
- **Purpose**: Domain for email "from" address
- **Format**: `yourdomain.com` (no protocol)
- **Default**: `gwi-platform.com`
- **Usage**: Emails sent from `noreply@${EMAIL_DOMAIN}`
- **Note**: Domain must be verified in Resend

---

### Rate Limiting

#### `UPSTASH_REDIS_REST_URL`
- **Required**: No (optional)
- **Type**: URL
- **Purpose**: Upstash Redis REST API URL
- **Get**: [Upstash Dashboard](https://upstash.com)
- **Fallback**: If not set, rate limiting is disabled

#### `UPSTASH_REDIS_REST_TOKEN`
- **Required**: No (optional, required if UPSTASH_REDIS_REST_URL is set)
- **Type**: String
- **Purpose**: Upstash Redis REST API token
- **Get**: From Upstash Dashboard (same place as URL)
- **Security**: Keep secret

---

### Error Tracking (Sentry)

#### `SENTRY_DSN`
- **Required**: No (optional)
- **Type**: URL
- **Purpose**: Sentry DSN for server-side error tracking
- **Format**: `https://...@sentry.io/...`
- **Get**: [Sentry Dashboard](https://sentry.io)
- **Fallback**: If not set, Sentry is disabled

#### `NEXT_PUBLIC_SENTRY_DSN`
- **Required**: No (optional)
- **Type**: URL
- **Purpose**: Sentry DSN for client-side error tracking
- **Format**: Same as `SENTRY_DSN`
- **Note**: Must be public (prefixed with `NEXT_PUBLIC_`)

#### `SENTRY_ORG`
- **Required**: No (optional, for source maps)
- **Type**: String
- **Purpose**: Sentry organization slug
- **Get**: From Sentry Dashboard (URL: `sentry.io/organizations/{org}`)

#### `SENTRY_PROJECT`
- **Required**: No (optional, for source maps)
- **Type**: String
- **Purpose**: Sentry project slug
- **Get**: From Sentry Dashboard

#### `SENTRY_AUTH_TOKEN`
- **Required**: No (optional)
- **Type**: String
- **Purpose**: Sentry auth token for uploading source maps
- **Get**: Sentry Dashboard → Settings → Auth Tokens
- **Note**: Only needed for source map uploads during build

---

### OAuth Providers

#### Google OAuth

##### `GOOGLE_CLIENT_ID`
- **Required**: No (optional)
- **Type**: String
- **Purpose**: Google OAuth client ID
- **Get**: [Google Cloud Console](https://console.cloud.google.com)
- **Steps**:
  1. Create OAuth 2.0 credentials
  2. Add authorized redirect URI: `{NEXTAUTH_URL}/api/auth/callback/google`
  3. Copy Client ID

##### `GOOGLE_CLIENT_SECRET`
- **Required**: No (optional, required if GOOGLE_CLIENT_ID is set)
- **Type**: String
- **Purpose**: Google OAuth client secret
- **Get**: Same place as Client ID
- **Security**: Keep secret

#### Microsoft Azure AD

##### `AZURE_AD_CLIENT_ID`
- **Required**: No (optional)
- **Type**: String (UUID)
- **Purpose**: Azure AD application client ID
- **Get**: [Azure Portal](https://portal.azure.com)
- **Steps**:
  1. Register an application in Azure AD
  2. Add redirect URI: `{NEXTAUTH_URL}/api/auth/callback/azure-ad`
  3. Copy Application (client) ID

##### `AZURE_AD_CLIENT_SECRET`
- **Required**: No (optional, required if AZURE_AD_CLIENT_ID is set)
- **Type**: String
- **Purpose**: Azure AD application secret
- **Get**: Azure Portal → Certificates & secrets
- **Security**: Keep secret

##### `AZURE_AD_TENANT_ID`
- **Required**: No (optional, required if AZURE_AD_CLIENT_ID is set)
- **Type**: String (UUID)
- **Purpose**: Azure AD tenant ID
- **Get**: Azure Portal → Overview → Tenant ID

---

### Stripe Billing

#### `STRIPE_SECRET_KEY`
- **Required**: No (optional)
- **Type**: String
- **Purpose**: Stripe API secret key
- **Format**: `sk_live_...` (production) or `sk_test_...` (testing)
- **Get**: [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API keys
- **Security**: Keep secret

#### `STRIPE_WEBHOOK_SECRET`
- **Required**: No (optional, for webhooks)
- **Type**: String
- **Purpose**: Stripe webhook signing secret
- **Format**: `whsec_...`
- **Get**: Stripe Dashboard → Developers → Webhooks → Add endpoint
- **Endpoint**: `{NEXTAUTH_URL}/api/webhooks/stripe`
- **Events**: `customer.subscription.*`, `invoice.*`, `payment_method.*`

#### Stripe Price IDs

These are the Stripe Price IDs for each subscription tier:

- `STRIPE_STARTER_MONTHLY_PRICE_ID` - Starter plan, monthly billing
- `STRIPE_STARTER_YEARLY_PRICE_ID` - Starter plan, yearly billing
- `STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID` - Professional plan, monthly billing
- `STRIPE_PROFESSIONAL_YEARLY_PRICE_ID` - Professional plan, yearly billing
- `STRIPE_ENTERPRISE_MONTHLY_PRICE_ID` - Enterprise plan, monthly billing
- `STRIPE_ENTERPRISE_YEARLY_PRICE_ID` - Enterprise plan, yearly billing

**Get**: Stripe Dashboard → Products → Create/Edit Product → Pricing → Copy Price ID

---

### Render-Specific Variables

These are automatically set by Render (don't override):

#### `RENDER`
- **Value**: `"true"`
- **Purpose**: Indicates running on Render

#### `MEMORY_CONSTRAINED`
- **Value**: `"true"`
- **Purpose**: Enables memory-optimized build settings

#### `NODE_MEMORY_LIMIT`
- **Value**: `"1280"`
- **Purpose**: Node.js heap size limit (MB)

#### `PORT`
- **Value**: `"3000"`
- **Purpose**: Port for web server

#### `NODE_ENV`
- **Value**: `"production"`
- **Purpose**: Node.js environment

#### `RENDER_EXTERNAL_URL`
- **Value**: Your Render service URL
- **Purpose**: External URL of your service
- **Usage**: Fallback for `NEXTAUTH_URL`

#### `DATABASE_URL`
- **Value**: Auto-provided from database service
- **Purpose**: PostgreSQL connection string
- **Note**: Automatically linked in render.yaml

---

## Environment-Specific Configuration

### Local Development

Create `.env.local`:

```bash
# Copy from this file and fill in values
DATABASE_URL="postgresql://localhost:5432/gwi_dev"
NEXTAUTH_SECRET="local-dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
# ... add other variables as needed
```

### Production (Render)

Set variables in Render dashboard:
1. Go to your web service
2. Click **"Environment"** tab
3. Add each variable
4. Click **"Save Changes"**
5. Service will restart automatically

---

## Security Best Practices

1. **Never commit secrets** - Use `.env.local` (gitignored) or Render environment variables
2. **Use strong secrets** - Generate with `openssl rand -base64 32`
3. **Rotate keys regularly** - Especially API keys and secrets
4. **Use different keys per environment** - Don't share dev/prod keys
5. **Limit access** - Only give access to team members who need it
6. **Monitor usage** - Check API dashboards for unusual activity
7. **Use environment-specific values** - Different Stripe keys for test/prod

---

## Validation

### Required Variables Check

Before deploying, ensure these are set:

```bash
# Check in Render dashboard or run locally:
[ -n "$DATABASE_URL" ] && echo "✓ DATABASE_URL" || echo "✗ DATABASE_URL missing"
[ -n "$NEXTAUTH_SECRET" ] && echo "✓ NEXTAUTH_SECRET" || echo "✗ NEXTAUTH_SECRET missing"
[ -n "$NEXTAUTH_URL" ] && echo "✓ NEXTAUTH_URL" || echo "✗ NEXTAUTH_URL missing"
[ -n "$GWI_API_BASE_URL" ] && echo "✓ GWI_API_BASE_URL" || echo "✗ GWI_API_BASE_URL missing"
[ -n "$GWI_PLATFORM_API_KEY" ] && echo "✓ GWI_PLATFORM_API_KEY" || echo "✗ GWI_PLATFORM_API_KEY missing"
[ -n "$GWI_SPARK_API_KEY" ] && echo "✓ GWI_SPARK_API_KEY" || echo "✗ GWI_SPARK_API_KEY missing"
[ -n "$ANTHROPIC_API_KEY" ] && echo "✓ ANTHROPIC_API_KEY" || echo "✗ ANTHROPIC_API_KEY missing"
[ -n "$OPENAI_API_KEY" ] && echo "✓ OPENAI_API_KEY" || echo "✗ OPENAI_API_KEY missing"
```

---

## Troubleshooting

### Variable Not Found

**Error**: `process.env.VARIABLE_NAME is undefined`

**Solution**:
1. Check variable is set in Render dashboard
2. Ensure no typos in variable name
3. Restart service after adding variable
4. Check variable is not in a different service

### Variable Not Updating

**Issue**: Changed variable but service still uses old value

**Solution**:
1. Save changes in Render dashboard
2. Wait for service restart (automatic)
3. Check logs for confirmation
4. Hard restart if needed

### Sensitive Data Exposure

**Issue**: Accidentally committed secrets

**Solution**:
1. Rotate all exposed keys immediately
2. Remove from git history: `git filter-branch` or BFG Repo-Cleaner
3. Add to `.gitignore`: `.env*`
4. Use Render environment variables going forward

---

## Additional Resources

- [Render Environment Variables Docs](https://render.com/docs/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NextAuth Configuration](https://next-auth.js.org/configuration/options)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Anthropic API Docs](https://docs.anthropic.com)
- [OpenAI API Docs](https://platform.openai.com/docs)
