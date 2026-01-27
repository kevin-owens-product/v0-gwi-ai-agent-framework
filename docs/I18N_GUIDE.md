# Internationalization (i18n) Guide

This guide covers the multi-lingual implementation and enforcement system for the GWI platform.

## Overview

The platform supports **11 languages** with **5,500+ translation keys** using the `next-intl` library. We have a comprehensive i18n enforcement system to ensure all user-facing strings are properly internationalized.

### Supported Languages

| Code | Language | Native Name | RTL | Flag |
|------|----------|-------------|-----|------|
| `en` | English (Base) | English | No | US |
| `es` | Spanish | Espanol | No | ES |
| `zh` | Chinese (Simplified) | Zhongwen | No | CN |
| `hi` | Hindi | Hindi | No | IN |
| `fr` | French | Francais | No | FR |
| `ar` | Arabic | Arabic | Yes | SA |
| `pt` | Portuguese | Portugues | No | BR |
| `ru` | Russian | Russian | No | RU |
| `ja` | Japanese | Japanese | No | JP |
| `bn` | Bengali | Bengali | No | BD |
| `el` | Greek | Greek | No | GR |

## Quick Start

### Using Translations in Components

**Client Components:**
```typescript
"use client"
import { useTranslations } from "next-intl"

export default function MyPage() {
  const t = useTranslations("gwi.surveys")
  const tCommon = useTranslations("common")

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      <button>{tCommon("save")}</button>
    </div>
  )
}
```

**Server Components:**
```typescript
import { getTranslations } from "@/lib/i18n/server"

export default async function MyPage() {
  const t = await getTranslations("gwi.pipelines")
  const tCommon = await getTranslations("common")

  return (
    <div>
      <h1>{t("title")}</h1>
      <button>{tCommon("create")}</button>
    </div>
  )
}
```

### Dynamic Values

```typescript
// In en.json: "welcome": "Hello, {name}!"
t("welcome", { name: user.name })

// Pluralization: "itemCount": "{count, plural, one {# item} other {# items}}"
t("itemCount", { count: items.length })
```

## i18n Enforcement System

We have multiple layers of enforcement to catch hardcoded strings:

### 1. Hardcoded String Scanner

A script that scans all TSX/TS files for potential i18n violations.

```bash
# Basic scan (reports findings)
npm run i18n:scan

# With suggested translation keys
npm run i18n:scan:fix

# Strict mode (exits with error if findings, for CI)
npm run i18n:scan:strict

# Scan specific directory
node scripts/scan-hardcoded-strings.js app/admin

# JSON output for tooling
node scripts/scan-hardcoded-strings.js --json
```

**What it detects:**
- Hardcoded strings in JSX (text between tags)
- Hardcoded strings in props (placeholder, title, aria-label, alt, etc.)
- Hardcoded strings in toast() calls
- Hardcoded strings in arrays/objects that are rendered (label, description, etc.)

**What it ignores:**
- URLs, paths, file extensions
- CSS classes, technical identifiers
- Import statements, console.log
- Translation function calls
- Numbers, single characters
- Constants (ALL_CAPS)

### 2. ESLint Custom Rule

Real-time detection in your editor via ESLint.

**Enabled for:** `app/**/*.tsx`, `components/**/*.tsx`

The rule flags:
- JSX text content that should be translated
- String literals in translatable props
- Template literals with static user-facing text

**Configuration** (in `eslint.config.mjs`):
```javascript
'local/no-hardcoded-strings': ['warn', {
  allowedStrings: ['GWI', 'GlobalWebIndex', 'Spark'],
  translatableProps: [
    'placeholder', 'title', 'aria-label', 'alt',
    'label', 'description', 'helperText', 'tooltip',
  ],
}]
```

### 3. Translation Validation

Ensures all translation files are in sync.

```bash
# Validate all translation files
npm run i18n:validate

# Add missing keys as placeholders
npm run i18n:fix

# Remove orphaned keys
npm run i18n:clean

# Fix + clean combined
npm run i18n:sync
```

### 4. Full Audit

Run all checks together:

```bash
# Run all i18n checks
npm run i18n:audit

# Strict mode (fails on any issue)
npm run i18n:audit:strict
```

## Adding New Translations

### Step 1: Add Keys to en.json

Add your keys to `/messages/en.json` under the appropriate namespace:

```json
{
  "gwi": {
    "myFeature": {
      "title": "My Feature",
      "description": "Description of my feature",
      "form": {
        "name": "Name",
        "namePlaceholder": "Enter name...",
        "submit": "Submit"
      },
      "table": {
        "columns": {
          "name": "Name",
          "status": "Status",
          "actions": "Actions"
        }
      },
      "confirmations": {
        "deleteTitle": "Delete Item",
        "deleteDescription": "Are you sure you want to delete this item?"
      }
    }
  }
}
```

### Step 2: Sync to All Languages

```bash
npm run i18n:fix
```

This adds placeholder keys (prefixed with `[XX]`) to all other language files.

### Step 3: Verify

```bash
npm run i18n:validate
```

### Step 4: Translate Placeholders

Search for `[XX]` markers in language files and replace with proper translations:

```json
// Before
"title": "[ES] My Feature"

// After
"title": "Mi Funcion"
```

## Naming Conventions for Keys

### Namespace Structure

```
{portal}.{feature}.{section}.{key}
```

Examples:
- `admin.settings.general.title`
- `gwi.surveys.form.namePlaceholder`
- `dashboard.audiences.table.columns.name`

### Key Naming Guidelines

1. **Use camelCase** for key names
2. **Be descriptive but concise**
3. **Group related keys** under common parents
4. **Use standard suffixes** for common patterns:
   - `*Title` - Headings/titles
   - `*Description` - Longer descriptive text
   - `*Placeholder` - Input placeholders
   - `*Label` - Form labels
   - `*Error` - Error messages
   - `*Success` - Success messages
   - `*Empty` - Empty state messages
   - `*Loading` - Loading messages
   - `*Confirm*` - Confirmation dialogs

### Common Namespace

Use `common.*` for frequently used terms:

| Key | English | Usage |
|-----|---------|-------|
| `common.save` | Save | Save buttons |
| `common.cancel` | Cancel | Cancel buttons |
| `common.delete` | Delete | Delete buttons |
| `common.edit` | Edit | Edit buttons |
| `common.create` | Create | Create buttons |
| `common.search` | Search | Search inputs |
| `common.loading` | Loading... | Loading states |
| `common.error` | Error | Error states |
| `common.success` | Success | Success states |
| `common.confirm` | Confirm | Confirm actions |
| `common.actions` | Actions | Table headers |

## Common Patterns

### Translating Arrays/Objects

**Before (hardcoded):**
```typescript
const CATEGORIES = [
  { value: "CORE", label: "Core" },
  { value: "ANALYTICS", label: "Analytics" },
]
```

**After (translated):**
```typescript
const t = useTranslations("features")

const CATEGORIES = [
  { value: "CORE", label: t("categories.core") },
  { value: "ANALYTICS", label: t("categories.analytics") },
]
```

### Translating Toast Messages

**Before:**
```typescript
toast.success("Changes saved successfully!")
```

**After:**
```typescript
const t = useTranslations("common")
toast.success(t("notifications.saveSuccess"))
```

### Translating Form Validation

**Before:**
```typescript
const schema = z.object({
  name: z.string().min(1, "Name is required"),
})
```

**After:**
```typescript
const t = useTranslations("validation")

const schema = z.object({
  name: z.string().min(1, t("required")),
})
```

### Translating Table Headers

**Before:**
```typescript
const columns = [
  { header: "Name", accessorKey: "name" },
  { header: "Status", accessorKey: "status" },
]
```

**After:**
```typescript
const t = useTranslations("myFeature.table")

const columns = [
  { header: t("columns.name"), accessorKey: "name" },
  { header: t("columns.status"), accessorKey: "status" },
]
```

## Pre-Commit Checklist

Before committing code with UI changes:

- [ ] All user-facing strings use translation functions
- [ ] New keys added to `messages/en.json`
- [ ] Keys synced to other languages (`npm run i18n:fix`)
- [ ] No ESLint warnings from `local/no-hardcoded-strings`
- [ ] Scanner finds no new issues (`npm run i18n:scan`)
- [ ] Translations validated (`npm run i18n:validate`)

## CI/CD Integration

The CI pipeline includes:

1. **ESLint check** - Catches hardcoded strings (currently as warnings)
2. **Translation validation** - Ensures all language files are in sync
3. **Full audit** (optional) - Can run `i18n:audit:strict` for strict enforcement

## Troubleshooting

### Issue: Translation key shows as raw text

**Symptom:** UI shows `gwi.surveys.title` instead of actual text

**Causes:**
1. Key doesn't exist in `messages/en.json`
2. Wrong namespace in `useTranslations()`
3. Typo in key name

**Fix:**
1. Verify key exists: `grep -r "surveys.title" messages/en.json`
2. Check namespace matches file path
3. Run `npm run i18n:validate` to find issues

### Issue: Scanner reports false positives

**Solution:** Add to allowlist in the script or ESLint config:

For scanner (`scripts/scan-hardcoded-strings.js`):
```javascript
const ALLOWLIST_EXACT = new Set([
  'MyBrandName',
  // ...
])
```

For ESLint (`eslint.config.mjs`):
```javascript
'local/no-hardcoded-strings': ['warn', {
  allowedStrings: ['MyBrandName'],
}]
```

### Issue: Type errors with translations

**Symptom:** TypeScript errors when using `t()` function

**Fix:** Ensure you're using the correct import:
```typescript
// Client components
import { useTranslations } from "next-intl"

// Server components
import { getTranslations } from "@/lib/i18n/server"
```

## NPM Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run i18n:validate` | Check translation file coverage |
| `npm run i18n:validate:verbose` | Detailed validation output |
| `npm run i18n:fix` | Add missing keys as placeholders |
| `npm run i18n:clean` | Remove orphaned keys |
| `npm run i18n:sync` | Fix + clean combined |
| `npm run i18n:scan` | Scan for hardcoded strings |
| `npm run i18n:scan:fix` | Scan with suggested keys |
| `npm run i18n:scan:strict` | Scan and exit with error if found |
| `npm run i18n:audit` | Run all validations |
| `npm run i18n:audit:strict` | Run all validations in strict mode |

## File Structure

```
/
├── messages/
│   ├── en.json          # Base language (source of truth)
│   ├── es.json
│   ├── zh.json
│   └── ...
├── lib/i18n/
│   ├── config.ts        # Locale configuration
│   ├── client.ts        # Client-side utilities
│   ├── server.ts        # Server-side utilities
│   └── request.ts       # Request handling
├── scripts/
│   ├── scan-hardcoded-strings.js   # Hardcoded string scanner
│   └── validate-translations.js    # Translation validator
├── eslint-local-rules/
│   ├── index.js                    # Rule exports
│   └── no-hardcoded-strings.js     # ESLint rule
└── eslint.config.mjs               # ESLint configuration
```

## Best Practices Summary

1. **Never hardcode user-facing strings** - Always use `t()` or `tCommon()`
2. **Use hierarchical keys** - Makes them discoverable and maintainable
3. **Group related keys** - Keep translations organized
4. **Use common namespace** - Reduces duplication
5. **Run scanner regularly** - Catch issues early
6. **Add keys to en.json first** - It's the source of truth
7. **Include all UI text** - Don't forget error messages, empty states, etc.
8. **Review ESLint warnings** - They indicate potential i18n issues
