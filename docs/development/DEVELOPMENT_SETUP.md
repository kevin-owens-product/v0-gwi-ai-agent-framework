# Development Setup Guide

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Common Issues](#common-issues)
7. [Development Tools](#development-tools)

---

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher (comes with Node.js)
- **PostgreSQL**: v14.0 or higher
- **Git**: Latest version

### Recommended Tools

- **VS Code**: With extensions:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense
- **PostgreSQL Client**: pgAdmin, DBeaver, or TablePlus
- **Redis**: For rate limiting (optional, uses Upstash in production)

### Verify Installation

```bash
# Check Node.js version
node --version  # Should be v18+

# Check npm version
npm --version   # Should be v9+

# Check PostgreSQL version
psql --version  # Should be v14+

# Check Git version
git --version
```

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd gwi-agent/v0-gwi-ai-agent-framework
```

### 2. Install Dependencies

```bash
npm install
```

**Note:** The `postinstall` script automatically runs `prisma generate`, so Prisma Client will be generated after installation.

### 3. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

**Note:** If `.env.example` doesn't exist, create `.env.local` manually with required variables (see [Environment Configuration](#environment-configuration)).

### 4. Database Setup

See [Database Setup](#database-setup) section below.

---

## Environment Configuration

### Required Variables

Create `.env.local` with the following required variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gwi_agent_dev"

# Authentication
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# AI Providers (at least one required)
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
```

### Optional Variables

```bash
# Email Service
RESEND_API_KEY="re_..."
EMAIL_DOMAIN="localhost"

# Rate Limiting (optional for local dev)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Error Tracking (optional for local dev)
SENTRY_DSN="https://...@sentry.io/..."
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
AZURE_AD_CLIENT_ID=""
AZURE_AD_CLIENT_SECRET=""
AZURE_AD_TENANT_ID=""

# Stripe (optional for local dev)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

### Environment-Specific Files

- `.env.local` - Local development (gitignored)
- `.env.development` - Development environment
- `.env.production` - Production environment

**Note:** `.env.local` takes precedence over other `.env` files.

---

## Database Setup

### 1. Create Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE gwi_agent_dev;
\q

# Or using createdb command
createdb -U postgres gwi_agent_dev
```

### 2. Run Migrations

```bash
# Generate Prisma Client (if not already done)
npx prisma generate

# Run migrations
npm run db:migrate

# Or manually
npx prisma migrate dev
```

### 3. Seed Database

```bash
# Seed main data (organizations, users, etc.)
npm run db:seed

# Seed GWI-specific data
npm run db:seed:gwi

# Or seed minimal data
npm run db:seed:minimal
```

### 4. Verify Setup

```bash
# Open Prisma Studio to view data
npm run db:studio

# Or verify seed data
npm run db:verify
```

### Database Reset

```bash
# Reset database (WARNING: Deletes all data)
npm run db:reset

# This runs:
# - prisma migrate reset --force
# - npm run db:seed
```

---

## Running the Application

### Development Server

```bash
# Start development server
npm run dev

# Server runs on http://localhost:3000
```

### Development with Seed

```bash
# Seed database and start dev server
npm run dev:seed
```

### Build for Production

```bash
# Build application
npm run build

# Start production server
npm start
```

### Access Portals

Once running, access:

- **User Dashboard**: http://localhost:3000/dashboard
- **Admin Portal**: http://localhost:3000/admin
- **GWI Portal**: http://localhost:3000/gwi

### Test Accounts

After seeding, use these test accounts:

**User Dashboard:**
- Email: `user@example.com`
- Password: `password123`

**Admin Portal:**
- Email: `admin@example.com`
- Password: `admin123`

**GWI Portal:**
- Email: `gwi@example.com`
- Password: `gwi123`

See `prisma/seed.ts` and `prisma/seed-gwi.ts` for all test accounts.

---

## Common Issues

### Issue: Prisma Client Not Generated

**Symptoms:**
```
Cannot find module '@prisma/client'
```

**Solution:**
```bash
npx prisma generate
```

### Issue: Database Connection Error

**Symptoms:**
```
Can't reach database server
```

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   brew services start postgresql
   
   # Linux
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. Check `DATABASE_URL` in `.env.local`:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

3. Verify database exists:
   ```bash
   psql -U postgres -l
   ```

### Issue: Migration Errors

**Symptoms:**
```
Migration failed
```

**Solutions:**
1. Reset database (development only):
   ```bash
   npm run db:reset
   ```

2. Check for schema conflicts:
   ```bash
   npx prisma migrate status
   ```

3. Create new migration:
   ```bash
   npx prisma migrate dev --name fix_migration
   ```

### Issue: Next.js 15 Params Promise

**Symptoms:**
```
TypeError: Cannot read property 'id' of undefined
```

**Solution:**
In Next.js 15, `params` is a Promise. Always await it:

```typescript
// ❌ Wrong
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id  // Error!
}

// ✅ Correct
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // Correct!
}
```

### Issue: Port Already in Use

**Symptoms:**
```
Port 3000 is already in use
```

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

### Issue: Module Not Found

**Symptoms:**
```
Cannot find module '@/lib/...'
```

**Solution:**
1. Check `tsconfig.json` paths configuration
2. Restart TypeScript server in VS Code
3. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

### Issue: TypeScript Errors

**Symptoms:**
```
Type errors in IDE
```

**Solution:**
```bash
# Run type check
npm run type-check

# Fix common issues
npm run lint:fix
```

---

## Development Tools

### Prisma Studio

Visual database browser:

```bash
npm run db:studio
```

Opens at http://localhost:5555

### Type Checking

```bash
# Check types without building
npm run type-check
```

### Linting

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Internationalization

```bash
# Validate translations
npm run i18n:validate

# Scan for hardcoded strings
npm run i18n:scan

# Fix translation issues
npm run i18n:fix

# Full audit
npm run i18n:audit
```

### Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Push schema changes (dev only)
npm run db:push

# Reset database
npm run db:reset

# Seed database
npm run db:seed

# Seed GWI data
npm run db:seed:gwi

# Verify seed data
npm run db:verify
```

---

## VS Code Setup

### Recommended Extensions

Install these VS Code extensions:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## Next Steps

After setup:

1. Read [Development Workflow](./DEVELOPMENT_WORKFLOW.md)
2. Review [Code Standards](./CODE_STANDARDS.md)
3. Check [Adding New Features](./ADDING_NEW_FEATURES.md)
4. Explore [API Documentation](../api/API_OVERVIEW.md)

---

## Related Documentation

- [Environment Variables](../ENVIRONMENT_VARIABLES.md) - Complete env var reference
- [Development Workflow](./DEVELOPMENT_WORKFLOW.md) - Git workflow and processes
- [Code Standards](./CODE_STANDARDS.md) - Coding conventions
- [Prisma Guide](./PRISMA_GUIDE.md) - Database patterns

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
