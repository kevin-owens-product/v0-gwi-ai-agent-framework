# CI/CD Pipeline Setup Guide

The GitHub Actions CI/CD pipeline is already configured and will automatically run on every push and pull request.

## What's Included

The pipeline (`.github/workflows/ci.yml`) includes:

✅ **Linting & Type Checking** - ESLint and TypeScript validation
✅ **Security Scanning** - npm audit and TruffleHog secret detection
✅ **Unit Tests** - Vitest with coverage reporting
✅ **E2E Tests** - Playwright tests with PostgreSQL database
✅ **Build Validation** - Ensures production build succeeds
✅ **Database Migration Check** - Validates Prisma migrations
✅ **Deployment Ready Gate** - Only for main/staging branches

---

## Setup Requirements

### 1. GitHub Secrets (Optional)

For full functionality, add these secrets to your GitHub repository:

**Go to:** Repository → Settings → Secrets and variables → Actions → New repository secret

| Secret Name | Description | Required | How to Get |
|-------------|-------------|----------|------------|
| `CODECOV_TOKEN` | Code coverage reporting | Optional | [codecov.io](https://codecov.io/) |
| `SENTRY_AUTH_TOKEN` | Error tracking + source maps | Recommended | See [SENTRY_SETUP.md](./SENTRY_SETUP.md) |
| `RENDER_STAGING_DEPLOY_HOOK` | Auto-deploy to staging | Optional | Render dashboard → Deploy Hook |

### 2. Enable GitHub Actions

The workflow is already committed, so it will run automatically on:
- ✅ Every push to `main`, `develop`, or `staging` branches
- ✅ Every pull request to these branches

**No additional configuration needed!**

---

## Pipeline Jobs

### Job 1: Lint & Type Check (2-3 minutes)

```yaml
✓ Checkout code
✓ Setup Node.js 20 with npm cache
✓ Install dependencies (npm ci)
✓ Run ESLint
✓ Run TypeScript type check
✓ Upload lint results as artifact
```

**What it catches:**
- Code style violations
- TypeScript type errors
- Unused variables
- Missing imports
- Best practice violations

**Local equivalent:**
```bash
npm run lint
npm run type-check
```

### Job 2: Security Scan (2-3 minutes)

```yaml
✓ Checkout code
✓ Setup Node.js
✓ Install dependencies
✓ Run npm audit (moderate+ vulnerabilities)
✓ Check for secrets with TruffleHog
```

**What it catches:**
- Vulnerable dependencies
- Known CVEs in packages
- Accidentally committed secrets (API keys, passwords)
- High/critical security issues

**Local equivalent:**
```bash
npm audit
```

### Job 3: Unit Tests (3-5 minutes)

```yaml
✓ Checkout code
✓ Setup Node.js
✓ Install dependencies
✓ Generate Prisma Client
✓ Run unit tests with coverage
✓ Upload coverage to Codecov
✓ Upload test results as artifact
```

**What it validates:**
- All unit tests pass
- Code coverage meets standards
- No test regressions
- Component functionality

**Local equivalent:**
```bash
npm run test:coverage
```

**Coverage reports available at:**
- GitHub Actions → Workflow Run → Artifacts → `test-results`
- Codecov dashboard (if configured)

### Job 4: E2E Tests (5-10 minutes)

```yaml
✓ Checkout code
✓ Setup Node.js
✓ Start PostgreSQL 16 service
✓ Install dependencies
✓ Install Playwright browsers
✓ Setup test database (Prisma migrate)
✓ Run E2E tests
✓ Upload Playwright report
```

**What it validates:**
- Critical user flows work end-to-end
- Database interactions work correctly
- Authentication flows
- API integrations

**Local equivalent:**
```bash
# Start local postgres first
npm run test:e2e
```

**Test reports available at:**
- GitHub Actions → Workflow Run → Artifacts → `playwright-report`

### Job 5: Build (5-7 minutes)

**Runs only if:** Lint & tests pass

```yaml
✓ Checkout code
✓ Setup Node.js
✓ Install dependencies
✓ Generate Prisma Client
✓ Build production bundle
✓ Check build size
✓ Upload build artifacts
```

**What it validates:**
- Production build succeeds
- No build-time errors
- Bundle size is reasonable
- Next.js optimization works

**Local equivalent:**
```bash
npm run build
```

### Job 6: Database Migration Check (2-3 minutes)

```yaml
✓ Checkout code
✓ Setup Node.js
✓ Start PostgreSQL service
✓ Install dependencies
✓ Generate Prisma Client
✓ Run migrations (prisma migrate deploy)
✓ Validate schema
```

**What it validates:**
- Database migrations are valid
- No migration conflicts
- Schema is in sync with Prisma client
- Migrations can be applied cleanly

**Local equivalent:**
```bash
npx prisma migrate deploy
npx prisma validate
```

### Job 7: Deployment Ready (1 minute)

**Runs only if:** All previous jobs pass + branch is `main` or `staging`

```yaml
✓ Confirm all checks passed
✓ Log deployment readiness
✓ Output branch and commit info
```

This is a gate that confirms the code is ready for production deployment.

### Job 8: Deploy to Staging (Optional, 2-5 minutes)

**Runs only if:**
- All checks pass
- Branch is `staging`
- Push event (not PR)
- `RENDER_STAGING_DEPLOY_HOOK` secret is configured

```yaml
✓ Trigger Render staging deployment
✓ Confirm deployment started
```

---

## Viewing Pipeline Results

### In Pull Requests

GitHub shows CI status automatically:

```
✓ All checks passed — Ready to merge
  ✓ lint-and-typecheck
  ✓ security
  ✓ test
  ✓ e2e
  ✓ build
  ✓ migration-check
```

Or:
```
✗ Some checks failed
  ✓ lint-and-typecheck
  ✗ test (Click "Details" to see what failed)
  ⏳ build (Pending)
```

### In GitHub Actions Tab

1. Go to repository → **Actions** tab
2. Click on a workflow run
3. View all job results
4. Click job name to see detailed logs
5. Download artifacts (test reports, coverage, build output)

### Artifacts

After each run, these artifacts are available for 7 days:

- **lint-results** - ESLint output
- **test-results** - Code coverage reports
- **playwright-report** - E2E test results with screenshots
- **build-output** - Production build files

**Download:** Actions → Workflow Run → Artifacts section

---

## Troubleshooting

### Build Failing on CI but Works Locally

**Common causes:**

1. **Different Node version**
   ```bash
   # Check your local version
   node -v

   # CI uses Node 20 - make sure you match it
   nvm use 20
   ```

2. **Missing environment variables**
   ```bash
   # CI uses dummy values for build
   # Make sure your code doesn't require real values at build time
   ```

3. **Cached dependencies**
   ```bash
   # Clear your local cache and rebuild
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

4. **Different package versions**
   - CI uses `npm ci` (installs exact versions from package-lock.json)
   - You might be using `npm install` (updates versions)
   - Solution: Commit updated `package-lock.json`

### Tests Passing Locally but Failing on CI

1. **Database state issues**
   ```bash
   # CI starts with fresh database each time
   # Make sure tests don't depend on existing data
   ```

2. **Timing/race conditions**
   ```bash
   # CI might be slower than your local machine
   # Add proper waits in E2E tests
   await page.waitForSelector('.element');
   ```

3. **Network requests**
   ```bash
   # Mock external API calls in tests
   # Don't rely on actual external services
   ```

### E2E Tests Timing Out

**Increase timeout in workflow:**
```yaml
e2e:
  timeout-minutes: 30  # Increase from 20
```

**Or increase Playwright timeout:**
```typescript
// playwright.config.ts
timeout: 60000,  // 60 seconds
```

### Security Scan Failing

**npm audit failures:**
```bash
# Locally check what's vulnerable
npm audit

# Fix what you can
npm audit fix

# For unfixable issues, either:
# 1. Wait for package updates
# 2. Update to continue-on-error: true in workflow
# 3. Override specific vulnerabilities (not recommended)
```

**TruffleHog secret detection:**
- Remove any accidentally committed secrets
- Add false positives to `.trufflehog-ignore` (create if needed)

### Build Size Too Large

**Check what's bloating your bundle:**
```bash
npm run build
# Look at output for large files

# Analyze bundle
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

**Common fixes:**
- Remove unused dependencies
- Use dynamic imports for large components
- Optimize images
- Tree-shake unused code

---

## Advanced Configuration

### Adding Custom Jobs

Edit `.github/workflows/ci.yml`:

```yaml
# Add a new job
custom-check:
  name: Custom Validation
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
    - run: npm run your-custom-script
```

### Running on Different Branches

```yaml
on:
  push:
    branches: [main, develop, staging, feature/*]
  pull_request:
    branches: [main, develop, staging]
```

### Adding Deployment Hooks

**For Render:**
1. Go to Render dashboard → Your service
2. Settings → Deploy Hook → Create
3. Copy webhook URL
4. Add to GitHub secrets as `RENDER_STAGING_DEPLOY_HOOK`
5. Uncomment deploy job in workflow:

```yaml
- name: Deploy to Render (Staging)
  run: |
    curl -X POST "${{ secrets.RENDER_STAGING_DEPLOY_HOOK }}"
```

### Matrix Testing (Multiple Node Versions)

```yaml
test:
  strategy:
    matrix:
      node-version: [18, 20, 21]
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
```

### Caching for Faster Builds

Already configured! The workflow uses:
- `cache: 'npm'` in `setup-node` action
- Playwright browser caching
- PostgreSQL caching via GitHub Actions cache

**To clear cache:**
- Settings → Actions → Caches → Delete

---

## Best Practices

### ✅ DO

- Run tests locally before pushing
- Keep workflows fast (< 15 minutes total)
- Use artifacts for debugging
- Set reasonable timeouts
- Use concurrency groups to cancel outdated runs
- Monitor GitHub Actions usage (free tier: 2,000 min/month)

### ❌ DON'T

- Commit secrets or tokens to repository
- Use real production data in tests
- Skip tests to "save time"
- Ignore failing tests
- Let dependency vulnerabilities pile up
- Run workflows on every commit (use PR only for some checks)

---

## Monitoring Pipeline Health

### Check Pipeline Status

**Weekly review:**
1. Go to Actions tab
2. Check success rate
3. Identify flaky tests
4. Monitor average runtime

**Use this badge in README.md:**
```markdown
![CI/CD Pipeline](https://github.com/your-org/your-repo/workflows/CI%2FCD%20Pipeline/badge.svg)
```

### Cost Management

**Free tier limits:**
- Public repos: Unlimited
- Private repos: 2,000 minutes/month

**Current usage:** ~15 min/run × 20 runs/day = 300 min/day = ~6,000 min/month

**If exceeding limits:**
- Run less frequently (e.g., only on PR, not every commit)
- Use self-hosted runners (free)
- Reduce E2E test scope
- Upgrade to paid plan ($4/month for 3,000 extra minutes)

---

## Integration with Render

### Automatic Deployment

Render automatically deploys when:
1. You push to `main` branch
2. CI checks pass (if required)
3. No manual approval needed

**To require CI before deploy:**
1. Render Dashboard → Service → Settings
2. Deploy → Auto-Deploy → Enable
3. Branch: `main`
4. Wait for CI: Yes (if you want to gate on CI passing)

### Manual Deployment

Deploy without waiting for CI:
```bash
# Option 1: Via Render dashboard
# Services → Your service → Manual Deploy → Deploy latest commit

# Option 2: Via Render API
curl -X POST "https://api.render.com/v1/services/YOUR_SERVICE_ID/deploys" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clearCache": false}'

# Option 3: Via webhook (set up in GitHub secrets)
curl -X POST "$RENDER_DEPLOY_HOOK_URL"
```

---

## Next Steps

✅ CI/CD is now set up!

**Immediate:**
1. Push a commit and watch the pipeline run
2. Create a test PR to see status checks
3. Download and review test artifacts

**Within 1 week:**
1. Set up Codecov for coverage tracking
2. Configure Sentry auth token for source maps
3. Add Render deploy hook for staging
4. Set up branch protection rules

**Ongoing:**
1. Monitor pipeline health weekly
2. Keep dependencies updated
3. Fix flaky tests immediately
4. Optimize slow test suites

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js CI/CD Guide](https://nextjs.org/docs/pages/building-your-application/deploying/ci-build-caching)
- [Render Deployment Guide](https://render.com/docs/deploys)

**Need help?** Check the Actions logs or contact the development team.
