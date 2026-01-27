# ADR 007: Internationalization (i18n) Implementation

## Status

Accepted

## Context

The GWI platform serves a global user base requiring support for multiple languages. We needed to implement a comprehensive internationalization system that:

1. Supports 10+ languages across all three portals (Admin, GWI, Dashboard)
2. Integrates seamlessly with Next.js 15 App Router
3. Works with both Server and Client Components
4. Maintains type safety
5. Enables easy addition of new languages and translation keys
6. Integrates with CI/CD for validation

## Decision

We chose **next-intl** as our i18n library with the following architecture:

### Library Choice: next-intl

Selected over alternatives because:
- Native Next.js App Router support
- Works with Server Components (no client-side hydration issues)
- TypeScript support with type-safe translations
- Small bundle size
- Active maintenance and community

### Translation File Structure

Single JSON file per language in `/messages/`:
- Hierarchical namespace structure: `portal.section.subsection.key`
- English (`en.json`) as the source of truth
- All languages maintain identical structure

### Namespace Convention

```
common.*         - Shared terms (save, cancel, delete)
auth.*           - Authentication flows
navigation.*     - Navigation labels
admin.*          - Admin Portal specific
gwi.*            - GWI Portal specific
dashboard.*      - User Dashboard specific
```

### Component Patterns

**Client Components:**
```typescript
import { useTranslations } from "next-intl"
const t = useTranslations("namespace")
```

**Server Components:**
```typescript
import { getTranslations } from "@/lib/i18n/server"
const t = await getTranslations("namespace")
```

### Validation & Tooling

Custom validation script (`scripts/validate-translations.js`) with:
- Coverage checking across all languages
- Missing key detection
- Orphaned key cleanup
- Placeholder generation for sync
- CI/CD integration

## Consequences

### Positive

1. **100% Language Coverage**: All 10 languages have complete key coverage
2. **Type Safety**: TypeScript catches missing keys at build time
3. **Developer Experience**: Clear patterns and validation tools
4. **Scalability**: Easy to add new languages or keys
5. **Performance**: Server-side rendering with no hydration mismatch
6. **Maintainability**: Hierarchical structure makes keys easy to find

### Negative

1. **Initial Setup Effort**: Required converting 50+ pages from hardcoded strings
2. **Translation Overhead**: New features require translation keys
3. **Placeholder Keys**: Auto-sync creates `[XX]` placeholders that need manual translation

### Learnings from Implementation

1. **Parallel Execution**: Running multiple agents (Admin, GWI, Dashboard) in parallel significantly reduced implementation time
2. **Validation is Critical**: The validation script caught hundreds of missing keys
3. **Common Namespace**: Sharing terms like "save", "cancel" reduced duplication by ~30%
4. **Pre-commit Hooks**: Catching translation issues before commit prevents CI failures

## Metrics

| Metric | Before | After |
|--------|--------|-------|
| Translation Keys | 2,145 | 5,118 |
| Admin Portal Coverage | 9.5% | 100% |
| GWI Portal Coverage | 31% | 100% |
| Dashboard Coverage | 11% | 100% |
| Languages Supported | 10 | 10 |
| Language File Coverage | Partial | 100% |

## Related Documents

- [I18N_GUIDE.md](../I18N_GUIDE.md) - Developer guide
- [CLAUDE.md](../../CLAUDE.md) - Project context (i18n section)
- [app/gwi/CONTEXT.md](../../app/gwi/CONTEXT.md) - GWI i18n patterns
