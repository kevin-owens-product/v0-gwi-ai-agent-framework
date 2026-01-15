# Project Structure Review

**Date:** January 2026
**Reviewer:** Automated Review
**Status:** Completed

## Executive Summary

This is a sophisticated, enterprise-grade Next.js 16 AI agent framework with extensive multi-tenancy, organizational hierarchy, and administrative capabilities. The project has ~811 TypeScript/TSX files with 154 test files (~19% test coverage).

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.0.10 with App Router |
| Database | PostgreSQL with Prisma ORM (v5.22.0) |
| Authentication | NextAuth.js v5 (Beta) |
| UI | React 19.2.0, Tailwind CSS 4.1, Radix UI |
| State | TanStack React Query v5, SWR |
| Testing | Vitest (unit), Playwright (e2e) |
| Error Tracking | Sentry |
| Billing | Stripe |
| LLM | Anthropic Claude SDK + OpenAI |
| Deployment | Render |

## Project Structure Overview

```
/app                    # Next.js App Router pages (26 directories)
  /(auth)              # User authentication
  /(admin-auth)        # Admin authentication
  /admin               # Super admin portal (22 subdirectories)
  /dashboard           # Main application (23 subdirectories)
  /api/v1, /api/v2     # API routes

/components            # Reusable components (28 directories)
  /ui                  # Radix-based primitives
  /admin               # Admin-specific components
  /agents, /audiences  # Feature domains

/lib                   # Core business logic (54 files)
  /api                 # API middleware
  /schemas             # Zod validation

/hooks                 # React hooks (16 files)
/prisma                # Database schema & migrations
/tests                 # Test infrastructure
/docs                  # Documentation
```

## Critical Issues (Priority 1)

### 1. TypeScript Build Errors Ignored

**Location:** `next.config.mjs:7`
```javascript
typescript: {
  ignoreBuildErrors: true,
}
```

**Impact:** Type errors are masked in production builds, leading to potential runtime errors.

**Recommendation:** Remove this setting and fix all TypeScript errors. Add `npm run type-check` to CI pipeline.

### 2. Very Large Files

The following files exceed recommended size limits:

| File | Lines | Recommendation |
|------|-------|----------------|
| `lib/store-agents.ts` | 32,612 | Split into models, queries, mutations, types |
| `lib/solution-agents.ts` | 1,901 | Extract agent definitions to separate files |
| `lib/tenant-hierarchy.ts` | 1,378 | Split into service modules |
| `components/crosstabs/advanced-crosstab-grid.tsx` | 1,280 | Extract sub-components |
| `components/dashboards/advanced-dashboard-builder.tsx` | 1,191 | Extract sub-components |
| `components/export-manager.tsx` | 1,043 | Extract export handlers |

### 3. Middleware Deprecation Warning

**Location:** `middleware.ts`

Next.js 16 has deprecated the `middleware` file convention in favor of the `proxy` pattern.

**Status:** Monitor Next.js documentation for migration guidance.

## Major Concerns (Priority 2)

### 4. Low Test Coverage

- **Current:** ~19% (154 of 811 files)
- **Target:** 50%+
- **Gaps:** API routes, complex components, integration tests

### 5. Client Component Usage

- 143 client components in `/app`
- 134 client components in `/components`
- Audit needed to optimize Server/Client boundaries

### 6. Large Prisma Schema

- 2,887 lines covering ~90 models
- Migration management complexity increasing
- Consider schema modularization

## Moderate Concerns (Priority 3)

### 7. API Versioning

- Two API versions (v1, v2) coexist
- No documented migration path
- Maintenance burden increasing

### 8. Seed File Scale

- `seed.ts` is 10,182 lines
- Should be modularized by feature domain

### 9. Documentation Gaps

- Architectural documentation sparse
- No comprehensive ADRs beyond initial enterprise transformation

## Positive Aspects

- Well-structured component hierarchy
- Comprehensive database design with proper indexing
- Good use of TypeScript throughout
- Proper Next.js App Router patterns
- E2E testing with Playwright (6 browser profiles)
- Security headers configured in middleware
- Sentry integration for error tracking
- Rate limiting infrastructure
- Stripe billing integration
- Multi-tenancy with organizational hierarchy
- Comprehensive audit logging
- Feature flag system

## Recommendations

### Immediate Actions

1. **Remove `ignoreBuildErrors: true`** - Fix type errors
2. **Refactor files >1000 lines** - Improve maintainability
3. **Add CI type checking** - `npm run type-check` before builds

### Short-term (Next Sprint)

1. Increase test coverage to 30%
2. Document API versioning strategy
3. Add integration tests for critical paths

### Medium-term (Next Quarter)

1. Establish module boundaries
2. Create feature-based folder structure
3. Improve architectural documentation
4. Performance audit and optimization

### Long-term

1. Consider monorepo structure if team grows
2. Extract shared libraries
3. Implement comprehensive observability

## Changes Made in This Review

### Fixed: Sentry Deprecation Warnings

**File:** `next.config.mjs`

Migrated deprecated Sentry options to new structure:

```javascript
// Before (deprecated)
disableLogger: true,
reactComponentAnnotation: { enabled: true },

// After (current)
webpack: {
  treeshake: {
    removeDebugLogging: true,
  },
  reactComponentAnnotation: {
    enabled: true,
  },
},
```

## Metrics Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total Files | 811 | - |
| Test Files | 154 | Low |
| Test Coverage | ~19% | Needs Improvement |
| Client Components | 277 | Monitor |
| Prisma Models | ~90 | High |
| API Versions | 2 | Document strategy |
| Deprecation Warnings | 2 fixed | Resolved |

## Next Steps

1. Address `ignoreBuildErrors` configuration
2. Plan refactoring of large files
3. Increase test coverage incrementally
4. Monitor Next.js 16 migration guidance for middleware
