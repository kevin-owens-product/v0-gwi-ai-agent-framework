# Development Workflow

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Git Workflow](#git-workflow)
3. [Branching Strategy](#branching-strategy)
4. [Code Review Process](#code-review-process)
5. [Testing Requirements](#testing-requirements)
6. [Deployment Process](#deployment-process)

---

## Overview

This document outlines the development workflow, Git practices, branching strategy, code review process, and deployment procedures for the GWI AI Agent Framework.

**CI/CD:** GitHub Actions  
**Deployment:** Render  
**Database:** PostgreSQL

---

## Git Workflow

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding/updating tests
- `chore` - Maintenance tasks

**Examples:**
```bash
feat(agents): add agent execution history
fix(auth): resolve NextAuth session expiration
docs(api): update API endpoint documentation
refactor(components): extract shared form logic
```

### Pre-commit Hooks

Husky runs lint-staged before commits:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix --max-warnings 0 --no-warn-ignored"
    ]
  }
}
```

**What it does:**
- Runs ESLint on staged files
- Auto-fixes issues when possible
- Prevents commit if errors remain

### Commit Process

```bash
# 1. Stage changes
git add .

# 2. Commit with message
git commit -m "feat(agents): add agent execution history"

# 3. Push to remote
git push origin feature/agent-history
```

---

## Branching Strategy

### Branch Types

#### Main Branches

- **`main`** - Production-ready code
- **`develop`** - Integration branch for features
- **`staging`** - Pre-production testing

#### Feature Branches

- **`feature/*`** - New features
  - Example: `feature/agent-marketplace`
  - Prefix: `feature/`

#### Bug Fix Branches

- **`fix/*`** - Bug fixes
  - Example: `fix/auth-session-expiry`
  - Prefix: `fix/`

#### Hotfix Branches

- **`hotfix/*`** - Critical production fixes
  - Example: `hotfix/security-patch`
  - Prefix: `hotfix/`

### Branch Naming Convention

```
<type>/<short-description>

Examples:
- feature/agent-marketplace
- fix/auth-session-expiry
- hotfix/security-patch
- docs/api-documentation
```

### Creating Branches

```bash
# From develop
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Or from main for hotfixes
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix
```

### Branch Lifecycle

1. **Create** - Create feature branch from `develop`
2. **Develop** - Make commits and push regularly
3. **Test** - Run tests locally before PR
4. **PR** - Create pull request to `develop`
5. **Review** - Address review comments
6. **Merge** - Merge after approval
7. **Delete** - Delete branch after merge

---

## Code Review Process

### Pull Request Requirements

**Before creating PR:**

1. ✅ Code compiles without errors
2. ✅ All tests pass (`npm test`)
3. ✅ Linting passes (`npm run lint`)
4. ✅ Type checking passes (`npm run type-check`)
5. ✅ No console.logs or debug code
6. ✅ Documentation updated if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Criteria

**Code Quality:**
- Follows TypeScript best practices
- Uses proper error handling
- Implements proper authentication/authorization
- Follows component patterns
- No hardcoded strings (use i18n)

**Testing:**
- Adequate test coverage
- Tests are meaningful and maintainable
- Edge cases considered

**Documentation:**
- Code comments for complex logic
- API documentation updated
- README updated if needed

### Review Process

1. **Author creates PR** → Assigns reviewers
2. **Reviewers review** → Leave comments
3. **Author addresses feedback** → Push changes
4. **Re-review** → If needed
5. **Approval** → Merge to `develop`

### Merge Strategy

**Squash and Merge** (preferred):
- Creates single commit
- Clean history
- Use for feature branches

**Merge Commit**:
- Preserves branch history
- Use for hotfixes

**Rebase and Merge**:
- Linear history
- Use sparingly

---

## Testing Requirements

### Before PR

```bash
# Run all checks
npm run ci

# This runs:
# - Type checking
# - Linting
# - i18n validation
# - Test coverage
# - Build validation
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: User flows covered

### Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage

# All tests
npm run test:all
```

### Writing Tests

**Unit Test Example:**
```typescript
import { describe, it, expect } from 'vitest'
import { validateEmail } from '@/lib/validation'

describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true)
  })

  it('should reject invalid email', () => {
    expect(validateEmail('invalid')).toBe(false)
  })
})
```

**E2E Test Example:**
```typescript
import { test, expect } from '@playwright/test'

test('user can create agent', async ({ page }) => {
  await page.goto('/dashboard/agents')
  await page.click('text=Create Agent')
  await page.fill('[name="name"]', 'Test Agent')
  await page.click('text=Save')
  await expect(page.locator('text=Test Agent')).toBeVisible()
})
```

---

## Deployment Process

### Environments

1. **Development** - Local development
2. **Staging** - Pre-production testing
3. **Production** - Live environment

### Deployment Flow

```
Feature Branch → develop → staging → main (production)
```

### Staging Deployment

**Automatic:**
- Merges to `develop` trigger staging deploy
- Runs CI/CD pipeline
- Deploys to staging environment

**Manual:**
```bash
# Trigger staging deploy via Render webhook
curl -X POST $RENDER_STAGING_DEPLOY_HOOK
```

### Production Deployment

**Process:**
1. Merge `develop` → `staging`
2. Test on staging
3. Merge `staging` → `main`
4. Automatic production deploy

**Manual:**
```bash
# Trigger production deploy via Render webhook
curl -X POST $RENDER_PRODUCTION_DEPLOY_HOOK
```

### Database Migrations

**Before Deployment:**
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Test migration
npx prisma migrate deploy

# Commit migration files
git add prisma/migrations
git commit -m "chore(db): add migration for feature X"
```

**During Deployment:**
- Migrations run automatically via `npm run db:migrate`
- Rollback plan should be documented

### Rollback Procedure

**If deployment fails:**

1. **Identify issue** - Check logs and monitoring
2. **Rollback code** - Revert merge commit
3. **Rollback database** - If migration caused issues:
   ```bash
   npx prisma migrate resolve --rolled-back migration_name
   ```
4. **Verify** - Test rollback deployment
5. **Document** - Document issue and resolution

---

## CI/CD Pipeline

### GitHub Actions Workflow

**Triggers:**
- Push to `main`, `develop`, `staging`
- Pull requests to these branches

**Jobs:**
1. **Lint & Type Check** - ESLint + TypeScript
2. **Security Scan** - npm audit + secret detection
3. **Unit Tests** - Vitest with coverage
4. **E2E Tests** - Playwright tests
5. **Build Validation** - Production build check
6. **Migration Check** - Prisma migration validation

### Pipeline Status

**Required Checks:**
- ✅ Lint & Type Check
- ✅ Security Scan
- ✅ Unit Tests
- ✅ E2E Tests
- ✅ Build Validation

**All checks must pass before merge.**

### Local CI Simulation

```bash
# Run all CI checks locally
npm run ci

# This runs:
# - type-check
# - lint
# - i18n:validate
# - test:coverage
# - build
```

---

## Best Practices

### ✅ DO

- Create feature branches from `develop`
- Write meaningful commit messages
- Run tests before pushing
- Keep PRs focused and small
- Review your own code before requesting review
- Update documentation with changes
- Follow TypeScript best practices
- Use proper error handling

### ❌ DON'T

- Commit directly to `main` or `develop`
- Skip tests to "save time"
- Leave console.logs in code
- Commit secrets or API keys
- Force push to shared branches
- Merge without review
- Ignore linting errors
- Break existing functionality

---

## Related Documentation

- [Development Setup](./DEVELOPMENT_SETUP.md) - Initial setup
- [Code Standards](./CODE_STANDARDS.md) - Coding conventions
- [CI/CD Setup](../CI_CD_SETUP.md) - CI/CD configuration
- [Adding New Features](./ADDING_NEW_FEATURES.md) - Feature development guide

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
