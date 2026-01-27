# Claude Code Context

This file provides context for Claude Code (and other AI assistants) when working on this codebase.

## Project Overview

This is a Next.js 15 application for GWI (GlobalWebIndex), a market research data platform. It consists of three portals:

1. **User Dashboard** (`/dashboard/*`) - Customer-facing portal for data analysis
2. **Admin Portal** (`/admin/*`) - Platform administration for managing tenants
3. **GWI Team Portal** (`/gwi/*`) - Internal tools for GWI team members

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**:
  - NextAuth for user dashboard
  - Cookie-based for admin (`adminToken`) and GWI (`gwiToken`) portals
- **Testing**: Vitest

## Key Directories

```
app/
├── (auth)/           # Public auth pages (login, signup)
├── (dashboard)/      # User dashboard (NextAuth protected)
├── (admin-auth)/     # Admin login redirect
├── admin/            # Admin portal (adminToken protected)
├── gwi/(portal)/     # GWI portal (gwiToken protected)
├── api/
│   ├── admin/        # Admin API routes
│   ├── gwi/          # GWI API routes
│   └── v1/           # Public API routes
components/
├── admin/            # Admin-specific components
├── gwi/              # GWI-specific components
└── ui/               # Shared UI components
lib/
├── db.ts             # Prisma client
├── super-admin.ts    # Admin authentication utilities
├── gwi-permissions.ts # GWI role-based permissions
prisma/
├── schema.prisma     # Database schema
├── seed.ts           # Main seed data
└── seed-gwi.ts       # GWI-specific test data
```

## Authentication Systems

### User Dashboard (NextAuth)
- Uses JWT sessions
- Providers: credentials, Google, Microsoft
- Session stored in cookies via NextAuth

### Admin Portal
- Cookie: `adminToken`
- Validation: `validateSuperAdminSession()` from `lib/super-admin.ts`
- Redirect: `/login?type=admin`

### GWI Portal
- Cookie: `gwiToken`
- Validation: `validateSuperAdminSession()` from `lib/super-admin.ts`
- Redirect: `/login?type=gwi`
- Permission check: `hasGWIPermission()` from `lib/gwi-permissions.ts`

## GWI Portal Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| `GWI_ADMIN` | Full access | All GWI permissions |
| `DATA_ENGINEER` | Pipeline management | Pipelines, data sources, monitoring |
| `TAXONOMY_MANAGER` | Data classification | Surveys, taxonomy |
| `ML_ENGINEER` | AI configuration | LLMs, agents, prompts |
| `SUPER_ADMIN` | Platform super admin | Full access everywhere |

## GWI Portal Features

### Surveys (`/gwi/surveys`)
- Create and manage survey instruments
- Question types: single/multi select, scale, open text, numeric, date, matrix
- Taxonomy integration for standardized data
- Response collection and analytics

### Taxonomy (`/gwi/taxonomy`)
- Hierarchical categories (e.g., Demographics > Age Groups)
- Attributes with validation rules
- Mapping rules for data transformation

### Pipelines (`/gwi/pipelines`)
- ETL, transformation, aggregation, export, sync
- Cron-based scheduling
- Validation rules and error tracking

### LLM (`/gwi/llm`)
- Model configurations (OpenAI, Anthropic, etc.)
- Prompt template management
- Usage tracking and cost analytics

### Agents (`/gwi/agents`)
- Agent templates for automated tasks
- Tool configurations with permissions
- Capabilities: analysis, classification, reporting

### Data Sources (`/gwi/data-sources`)
- Database connections (PostgreSQL, BigQuery, Snowflake)
- API integrations
- Sync status and health monitoring

## Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm test
npx vitest run app/api/gwi  # GWI tests only

# Database
npx prisma generate         # Generate client
npx prisma migrate dev      # Run migrations
npx prisma db seed          # Seed main data
npx ts-node prisma/seed-gwi.ts  # Seed GWI data
```

## Common Tasks

### Adding a new GWI API endpoint
1. Create route at `app/api/gwi/[feature]/route.ts`
2. Use `gwiToken` cookie for authentication
3. Check permissions with `hasGWIPermission()`
4. Log actions to `GWIAuditLog`

### Adding a new GWI page
1. Create page at `app/gwi/(portal)/[feature]/page.tsx`
2. Add to sidebar navigation in `components/gwi/sidebar.tsx`
3. Update permissions in `lib/gwi-permissions.ts` if needed

### Next.js 15 API Route Pattern
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // Note: params is a Promise in Next.js 15
  // ...
}
```

**CRITICAL**: In Next.js 15, `params` is a Promise. Always use `await params` to destructure. This is a common source of TypeScript errors.

## TypeScript Patterns

### Common Error Fixes

**1. Unused Imports (TS6133/TS6196)**
```typescript
// Bad - causes error
import { useState, useEffect } from "react"  // useEffect unused

// Good - remove unused or prefix with underscore
import { useState } from "react"
// or for intentionally unused params:
function handler(_event: Event) { }
```

**2. Type Narrowing with Null (TS2339)**
```typescript
// Bad - TypeScript narrows to 'never'
const session: { user?: { id?: string } } | null = null
session?.user?.id  // Error: 'user' doesn't exist on 'never'

// Good - use type assertion
const session = null as { user?: { id?: string } } | null
session?.user?.id  // Works
```

**3. Prisma Field Names**
Always match field names exactly as defined in `prisma/schema.prisma`:
- `hashedKey` not `apiKeyHash`
- `expiresAt` not `expiry`
- Check schema when you get "property does not exist" errors

**4. Test Mocking with Vitest**
```typescript
// Bad - vi.mocked() has TypeScript issues
vi.mocked(auth).mockResolvedValue(null)

// Good - use typed helper
const mockedAuth = auth as ReturnType<typeof vi.fn>
mockedAuth.mockResolvedValue(null)
```

**5. Array Access in Tests**
```typescript
// Bad - TypeScript can't narrow heterogeneous array elements
expect(searchClause.OR[0]!.name.contains).toBe('value')

// Good - extract to typed variables
const nameClause = { name: { contains: search, mode: 'insensitive' } }
const searchClause = { OR: [nameClause] }
expect(nameClause.name.contains).toBe('value')
```

### TypeScript Commands
```bash
npm run type-check    # Check for TypeScript errors
npx tsc --noEmit      # Same as above
```

## Internationalization (i18n)

This application supports **11 languages** with 5,476+ translation keys using `next-intl`.

### Supported Languages
`en`, `es`, `zh`, `hi`, `fr`, `ar`, `pt`, `ru`, `ja`, `bn`, `el`

| Code | Language | Native Name | Flag |
|------|----------|-------------|------|
| `en` | English | English | 🇺🇸 |
| `es` | Spanish | Español | 🇪🇸 |
| `zh` | Chinese | 中文 | 🇨🇳 |
| `hi` | Hindi | हिन्दी | 🇮🇳 |
| `fr` | French | Français | 🇫🇷 |
| `ar` | Arabic | العربية | 🇸🇦 |
| `pt` | Portuguese | Português | 🇧🇷 |
| `ru` | Russian | Русский | 🇷🇺 |
| `ja` | Japanese | 日本語 | 🇯🇵 |
| `bn` | Bengali | বাংলা | 🇧🇩 |
| `el` | Greek | Ελληνικά | 🇬🇷 |

### Translation Files
- Location: `/messages/*.json`
- Base language: `en.json`
- Namespace structure: `portal.section.subsection.key`

### Using Translations

**Client Components:**
```typescript
"use client"
import { useTranslations } from "next-intl"

export default function MyPage() {
  const t = useTranslations("gwi.surveys")
  const tCommon = useTranslations("common")
  return <h1>{t("title")}</h1>
}
```

**Server Components:**
```typescript
import { getTranslations } from "@/lib/i18n/server"

export default async function MyPage() {
  const t = await getTranslations("admin.settings")
  return <h1>{t("title")}</h1>
}
```

### Key Namespaces
- `common.*` - Shared terms (save, cancel, delete, loading)
- `admin.*` - Admin Portal
- `gwi.*` - GWI Portal
- `dashboard.*` - User Dashboard

### i18n Commands
```bash
npm run i18n:validate      # Check all translations
npm run i18n:fix           # Add missing keys as placeholders
npm run i18n:clean         # Remove orphaned keys
npm run i18n:sync          # Fix + clean combined
```

### Adding New Translation Keys
1. Add keys to `/messages/en.json` under appropriate namespace
2. Run `npm run i18n:fix` to sync to all languages
3. Search for `[XX]` placeholders to find keys needing translation

### Adding a New Language
1. Add locale code to `lib/i18n/config.ts`:
   - Add to `locales` array
   - Add to `localeNames` with native name
   - Add to `localeFlags` with country flag emoji
2. Add language code mapping to `scripts/translate-messages.ts` in `LANG_MAP`
3. Create translation file: `cp messages/en.json messages/{code}.json`
4. Add placeholders: Run script to prefix all strings with `[{CODE}] `
5. Translate: `npx tsx scripts/translate-messages.ts --lang={code}`
6. Validate: `npm run i18n:validate`
7. Update test files to include new locale count and assertions

## Large-Scale Codebase Changes

When fixing errors or making changes across many files, use parallel agents by directory:

| Directory | Typical Issues |
|-----------|----------------|
| `app/gwi/` | i18n, unused imports, type mismatches |
| `app/admin/` | i18n, async params, type narrowing |
| `app/(dashboard)/` | i18n, Next.js 15 patterns |
| `app/api/` | Async params, Prisma schema alignment |
| `lib/` | Type assertions, interface alignment |
| `components/` | Props types, unused imports |
| `**/*.test.ts` | Mock patterns, type assertions |

**Example parallel agent distribution for TypeScript errors:**
1. Agent 1: `app/gwi/**/*.tsx`
2. Agent 2: `app/admin/**/*.tsx`
3. Agent 3: `app/(dashboard)/**/*.tsx`
4. Agent 4: `app/api/**/*.ts`
5. Agent 5: `lib/**/*.ts`
6. Agent 6: `components/**/*.tsx`
7. Agent 7: `**/*.test.ts`

This approach fixed 1,018 TypeScript errors across 373 files efficiently.

## Test Accounts

> **Note:** These accounts are created by `prisma/seed.ts`. If login fails, re-seed the database.

### GWI Portal (`/login?type=gwi`)
| Email | Password | Role |
|-------|----------|------|
| `gwiadmin@gwi.com` | `gwi123` | GWI_ADMIN |
| `dataengineer@gwi.com` | `dataengineer123` | DATA_ENGINEER |
| `taxonomy@gwi.com` | `gwi123` | TAXONOMY_MANAGER |
| `mlengineer@gwi.com` | `gwi123` | ML_ENGINEER |

### Admin Portal (`/login?type=admin`)
| Email | Password | Role |
|-------|----------|------|
| `demo-admin@gwi.com` | `demo123` | SUPER_ADMIN |
| `superadmin@gwi.com` | `SuperAdmin123!` | SUPER_ADMIN |
| `admin@gwi.com` | `Admin123!` | ADMIN |
| `support@gwi.com` | `Support123!` | SUPPORT |

### User Dashboard (`/login`)
| Email | Password | Notes |
|-------|----------|-------|
| `demo@example.com` | `demo123` | Demo user |
| `admin@acme.com` | `Password123!` | Acme Corp owner |

## Known Pitfalls & Lessons Learned

### 1. Middleware Route Handling
The middleware (`middleware.ts`) must have explicit handlers for each portal type. Missing handlers cause auth failures:

```typescript
// REQUIRED: Each portal needs its own route handler
if (isAdminRoute(pathname)) { /* check adminToken */ }
if (isGwiRoute(pathname)) { /* check gwiToken */ }  // Don't forget this!
// THEN fall through to NextAuth for dashboard routes
```

**Symptom:** Infinite redirect loop when accessing a portal
**Cause:** Route falls through to wrong auth check (e.g., GWI route hitting NextAuth)
**Fix:** Add explicit route handler in middleware before the NextAuth check

### 2. Password Hashing Consistency
All auth endpoints MUST use `verifyPassword()` from `lib/super-admin.ts`:

```typescript
// CORRECT - supports both bcrypt and legacy SHA256
import { verifyPassword } from "@/lib/super-admin"
const isValid = await verifyPassword(password, user.passwordHash)

// WRONG - only supports bcrypt, breaks with seeded SHA256 passwords
import bcrypt from "bcryptjs"
const isValid = await bcrypt.compare(password, user.passwordHash)
```

### 3. i18n Namespace Matching
Translation namespaces in components MUST exist in `messages/en.json`:

```typescript
// Component uses:
const t = useTranslations("admin.tenants")

// messages/en.json MUST have:
{
  "admin": {
    "tenants": { ... }  // This namespace must exist!
  }
}
```

**Symptom:** Labels show as `admin.tenants.title` instead of actual text
**Cause:** Namespace doesn't exist or has wrong structure
**Fix:** Add missing namespace to `messages/en.json`

### 4. Duplicate JSON Keys
JSON files silently use the LAST occurrence of duplicate keys:

```json
{
  "admin": {
    "security": { "title": "First" },
    "other": { ... },
    "security": { "title": "Second" }  // This one wins!
  }
}
```

**Prevention:** Use a JSON linter or search for duplicate keys before committing

### 5. Seed Data vs Documentation
Test accounts in documentation MUST match actual seed data:

| Documented | Seed File | Status |
|------------|-----------|--------|
| `gwiadmin@gwi.com` | Must exist in `prisma/seed.ts` | Verify! |

**After adding test accounts to docs, always verify they exist in seed.**

---

## Validation Checklists

### Adding a New Portal Route
- [ ] Add route handler in `middleware.ts` (before NextAuth check)
- [ ] Add login redirect path to `publicPaths` array
- [ ] Use correct auth cookie (`adminToken`, `gwiToken`, etc.)
- [ ] Test: login → redirect → refresh (should stay logged in)

### Adding New i18n Keys
- [ ] Add namespace to `messages/en.json`
- [ ] Verify no duplicate keys in the JSON file
- [ ] Run `npm run i18n:validate` to check structure
- [ ] Test: page shows actual labels, not translation keys

### Adding Test Accounts
- [ ] Add to `prisma/seed.ts`
- [ ] Document in `CLAUDE.md` Test Accounts section
- [ ] Use `hashSuperAdminPassword()` for password (SHA256 compatible)
- [ ] Run `npx prisma db seed` to apply
- [ ] Test: can actually log in with documented credentials

---

## Troubleshooting

### Pre-commit Hook Fails with ESLint Warnings
The pre-commit hook uses `--max-warnings 0`. If there are pre-existing warnings:
```bash
git commit --no-verify -m "message"  # Bypass hook for pre-existing issues
```

### Missing shadcn/ui Component
If a component import fails (e.g., `@/components/ui/command`):
```bash
npx shadcn@latest add command  # Add the missing component
```

### Prisma Type Errors After Schema Change
```bash
npx prisma generate  # Regenerate client after schema changes
```

### "params is not a Promise" Error
You're using Next.js 14 syntax in Next.js 15. Change:
```typescript
// Next.js 14 (old)
{ params }: { params: { id: string } }

// Next.js 15 (current)
{ params }: { params: Promise<{ id: string }> }
const { id } = await params
```

### Login Redirects to Wrong Page / Infinite Loop
**Symptom:** After login, redirects to `/login` instead of dashboard, or loops forever
**Cause:** Middleware doesn't have handler for this portal type
**Fix:** Add route handler in `middleware.ts`:
```typescript
if (isGwiRoute(pathname)) {
  const gwiToken = request.cookies.get('gwiToken')?.value
  if (!gwiToken) {
    return NextResponse.redirect(new URL('/login?type=gwi', request.url))
  }
  return addSecurityHeaders(NextResponse.next())
}
```

### Login Returns 401 "Invalid Credentials" (But Credentials Are Correct)
**Symptom:** Correct password returns 401
**Cause:** Password hash mismatch - endpoint uses bcrypt but seed uses SHA256
**Fix:** Use `verifyPassword()` which supports both:
```typescript
import { verifyPassword } from "@/lib/super-admin"
const isValid = await verifyPassword(password, admin.passwordHash)
```

### Translation Keys Show Instead of Labels
**Symptom:** UI shows `admin.tenants.title` instead of "Tenants"
**Causes:**
1. Namespace doesn't exist in `messages/en.json`
2. Duplicate namespace keys (later one overwrites)
3. Cache issue

**Fixes:**
1. Add missing namespace to `messages/en.json`
2. Search for duplicate keys: `grep -n '"tenants":' messages/en.json`
3. Clear cache: `rm -rf .next && npm run dev`

### Test Account Login Fails
**Symptom:** Documented test account doesn't work
**Cause:** Account doesn't exist in seed data
**Fix:**
1. Check `prisma/seed.ts` for the account
2. Add if missing
3. Re-seed: `npx prisma db push --force-reset && npx prisma db seed`
