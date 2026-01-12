# Sentry Error Tracking Setup Guide

This guide will help you set up Sentry error tracking for the GWI AI Agent Framework in 15 minutes.

## Why Sentry?

Sentry provides:
- **Real-time error notifications** - Get alerted immediately when errors occur
- **Error grouping and deduplication** - Automatically groups similar errors
- **Full stack traces** - See exactly where errors happened in your code
- **User context** - Know which users are affected
- **Performance monitoring** - Track slow API calls and database queries
- **Session replay** - Watch what users did before an error occurred
- **Free tier** - 5,000 errors/month free forever

---

## Step 1: Create Sentry Account (5 minutes)

1. Go to [sentry.io/signup](https://sentry.io/signup/)
2. Sign up with GitHub, Google, or email
3. Choose the free "Developer" plan (5,000 errors/month)
4. Create a new organization (e.g., "GWI AI")

---

## Step 2: Create Sentry Project (2 minutes)

1. Click **"Create Project"**
2. Select platform: **Next.js**
3. Set alert frequency: **Alert me on every new issue**
4. Name your project: `gwi-ai-agent-framework` (or similar)
5. Click **"Create Project"**

You'll be shown a DSN (Data Source Name) that looks like:
```
https://abc123def456@o123456.ingest.sentry.io/7890123
```

**Copy this DSN** - you'll need it in the next step!

---

## Step 3: Configure Environment Variables (5 minutes)

### For Local Development

Create `.env.local` (if it doesn't exist):
```bash
# Sentry Configuration
SENTRY_DSN="https://your-dsn@sentry.io/project-id"
NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/project-id"
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="gwi-ai-agent-framework"
SENTRY_AUTH_TOKEN=""  # Leave empty for now, will set up later
```

### For Render Production Deployment

1. Go to your Render dashboard
2. Select your web service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `SENTRY_DSN` | `https://your-dsn@sentry.io/project-id` | From Step 2 |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://your-dsn@sentry.io/project-id` | Same as SENTRY_DSN |
| `SENTRY_ORG` | `your-org-slug` | Found in Sentry Settings > Organization |
| `SENTRY_PROJECT` | `gwi-ai-agent-framework` | Your project name |

**Note:** We'll add `SENTRY_AUTH_TOKEN` later for source map uploads (optional).

---

## Step 4: Test Error Tracking (3 minutes)

### Test in Development

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open browser console and trigger a test error:
   ```javascript
   // In browser console
   throw new Error("Test error from browser");
   ```

   Note: In development mode, errors won't be sent to Sentry by default (to avoid noise). To test, you need to deploy to staging or production.

### Test in Production/Staging

After deploying to Render:

1. Create a test page that throws an error:
   ```typescript
   // app/test-error/page.tsx
   'use client';

   export default function TestError() {
     const throwError = () => {
       throw new Error("This is a test error for Sentry!");
     };

     return (
       <div className="p-8">
         <button
           onClick={throwError}
           className="bg-red-500 text-white px-4 py-2 rounded"
         >
           Trigger Test Error
         </button>
       </div>
     );
   }
   ```

2. Visit `https://your-app.onrender.com/test-error`
3. Click the button
4. Check Sentry dashboard - error should appear within 10 seconds!

### Test Server-Side Error

Make a request to this test endpoint:

```bash
curl https://your-app.onrender.com/api/test-error
```

```typescript
// app/api/test-error/route.ts
import { NextResponse } from 'next/server';
import { logger } from '@/lib/error-logger';

export async function GET() {
  logger.error(new Error('Test server-side error'));
  return NextResponse.json({ message: 'Error logged to Sentry' });
}
```

---

## Step 5: Configure Source Maps (Optional, 10 minutes)

Source maps let you see the original TypeScript code in Sentry, not minified JavaScript.

### Generate Sentry Auth Token

1. Go to Sentry: **Settings** > **Account** > **API** > **Auth Tokens**
2. Click **"Create New Token"**
3. Name: "CI/CD Pipeline"
4. Scopes: Check these:
   - `project:read`
   - `project:releases`
   - `org:read`
5. Click **"Create Token"**
6. **Copy the token** (you won't see it again!)

### Add to Environment Variables

**Render:**
```
SENTRY_AUTH_TOKEN=your-auth-token-here
```

**GitHub Secrets (for CI/CD):**
1. Go to GitHub repo > Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Name: `SENTRY_AUTH_TOKEN`
4. Value: your-auth-token
5. Add secret

### Verify Source Maps

After deployment:
1. Trigger an error
2. View error in Sentry
3. Stack trace should show TypeScript file names and line numbers
4. Click on a frame to see original source code

---

## Step 6: Configure Alerts (5 minutes)

### Email Alerts

1. Go to Sentry: **Settings** > **Projects** > Your Project > **Alerts**
2. Default alert rule is already created: "Alert me on every new issue"
3. Customize if needed:
   - Threshold: "Is greater than X times in Y minutes"
   - Actions: Email, Slack, PagerDuty, etc.

### Slack Integration (Optional)

1. Go to **Settings** > **Integrations** > **Slack**
2. Click "Add to Slack"
3. Choose channel for alerts (e.g., `#engineering-alerts`)
4. Configure alert rules to post to Slack

### Issue Assignment

1. Go to **Settings** > **Projects** > Your Project > **Issue Owners**
2. Set ownership rules (e.g., errors in `/api/` go to backend team)

---

## Step 7: Using Error Logger in Your Code

### Client-Side (React Components)

```typescript
'use client';
import * as Sentry from '@sentry/nextjs';

function MyComponent() {
  const handleAction = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      Sentry.captureException(error, {
        tags: { component: 'MyComponent', action: 'handleAction' },
        extra: { userId: user.id },
      });
      // Show user-friendly error
    }
  };
}
```

### Server-Side (API Routes)

```typescript
import { withErrorHandler, AppError } from '@/lib/api-error-handler';

export const GET = withErrorHandler(async (request) => {
  // Automatic error logging!
  const data = await fetchData();
  return NextResponse.json(data);
});

// Or throw custom errors:
export const POST = withErrorHandler(async (request) => {
  if (!validInput) {
    throw AppError.badRequest('Invalid input provided');
  }

  // AppError automatically logs to Sentry with proper context
});
```

### Using Logger Utilities

```typescript
import { logger, ApiErrorLogger, DbErrorLogger } from '@/lib/error-logger';

// Basic logging
logger.info('User signed in', { userId: '123' });
logger.warn('Slow response detected', { duration: 5000 });
logger.error(new Error('Failed to fetch data'));

// API-specific
ApiErrorLogger.log(error, request, { additionalContext });

// Database-specific
DbErrorLogger.log(error, 'findUser', { userId: '123' });
```

---

## Monitoring Best Practices

### 1. Set Up Error Budget

Track error rate and set a budget (e.g., < 0.1% error rate):

```typescript
// In Sentry dashboard
Alerts > Create Alert Rule
Condition: Error rate is above 0.1% in 1 hour
Action: Notify #engineering-critical channel
```

### 2. Create Error Handling Standards

**DO:**
- Catch and log all errors
- Add context (user ID, org ID, request ID)
- Use appropriate log levels
- Test error scenarios

**DON'T:**
- Swallow errors silently
- Log sensitive data (passwords, tokens)
- Log expected errors (404s, validation errors)
- Create alerts for non-actionable errors

### 3. Regular Error Triage

Schedule weekly error review:
1. Review new error types
2. Prioritize by volume and impact
3. Assign ownership
4. Fix or suppress (if expected)

### 4. Monitor Error Trends

Watch for:
- Sudden spike in errors (deployment issue?)
- New error types (recent changes?)
- Errors affecting many users (critical bug?)
- Errors in specific features (needs attention)

---

## Troubleshooting

### Errors Not Appearing in Sentry

**Check:**
1. DSN configured correctly?
   ```bash
   echo $SENTRY_DSN
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. NODE_ENV set to 'production' or 'staging'?
   ```bash
   echo $NODE_ENV
   ```
   (Development errors are filtered out by default)

3. Build successful?
   ```bash
   npm run build
   ```
   Look for Sentry plugin output

4. Network connectivity?
   ```bash
   curl https://o123456.ingest.sentry.io/api/7890123/envelope/ \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

### Source Maps Not Working

**Check:**
1. `SENTRY_AUTH_TOKEN` set?
2. `SENTRY_ORG` and `SENTRY_PROJECT` correct?
3. Build logs show source map upload?
4. Sentry project has "Enable JavaScript Source Fetching" enabled?

### Too Many Errors

**Solutions:**
1. Add to `ignoreErrors` in Sentry config:
   ```typescript
   // sentry.client.config.ts
   ignoreErrors: [
     'ResizeObserver loop',
     'Network request failed',
     // Add patterns here
   ]
   ```

2. Use `beforeSend` to filter:
   ```typescript
   beforeSend(event, hint) {
     if (event.exception?.values?.[0]?.value?.includes('Expected error')) {
       return null;  // Don't send to Sentry
     }
     return event;
   }
   ```

3. Increase rate limits in Sentry project settings

---

## Cost Management

### Free Tier Limits
- 5,000 errors/month
- 10,000 performance transactions/month
- 50 session replays/month
- 1GB attachments storage

### Staying Under Free Tier

1. **Filter noise:**
   - Ignore browser extension errors
   - Ignore network errors in development
   - Filter expected errors (404s, validation)

2. **Sample performance data:**
   ```typescript
   // sentry.server.config.ts
   tracesSampleRate: 0.1,  // 10% sampling
   ```

3. **Limit session replays:**
   ```typescript
   // sentry.client.config.ts
   replaysSessionSampleRate: 0.01,  // 1% of sessions
   replaysOnErrorSampleRate: 1.0,    // All errors
   ```

4. **Monitor quota:**
   - Go to Settings > Subscription
   - Set up quota alerts

### When to Upgrade

Upgrade to paid plan ($26/month) when:
- Exceeding 5,000 errors/month regularly
- Need more performance monitoring
- Need longer data retention (90 days vs 30 days)
- Need advanced features (data forwarding, SAML SSO)

---

## Next Steps

✅ Sentry is now set up!

**Immediate actions:**
1. Test error tracking in production
2. Configure Slack alerts
3. Set up error budget alerts
4. Train team on error triage

**Within 1 week:**
1. Review error patterns
2. Fix top errors
3. Add more context to error logs
4. Set up on-call rotation

**Ongoing:**
1. Weekly error review
2. Monitor error trends
3. Refine alerting rules
4. Update error handling patterns

---

## Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)
- [Error Tracking Best Practices](https://sentry.io/resources/error-tracking-best-practices/)
- [Sentry Community Forum](https://forum.sentry.io/)

**Need help?** Open an issue or contact the development team.
