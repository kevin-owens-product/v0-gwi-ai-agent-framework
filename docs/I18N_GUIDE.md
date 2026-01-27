# Internationalization (i18n) Guide

This guide covers the multi-lingual implementation for the GWI platform.

## Overview

The platform supports **10 languages** with **5,118+ translation keys** using the `next-intl` library.

### Supported Languages

| Code | Language | RTL |
|------|----------|-----|
| `en` | English (Base) | No |
| `es` | Spanish | No |
| `zh` | Chinese (Simplified) | No |
| `hi` | Hindi | No |
| `fr` | French | No |
| `ar` | Arabic | Yes |
| `pt` | Portuguese | No |
| `ru` | Russian | No |
| `ja` | Japanese | No |
| `bn` | Bengali | No |

## Architecture

### Translation Files

All translations are stored in `/messages/`:

```
messages/
├── en.json    # Base language (source of truth)
├── es.json
├── zh.json
├── hi.json
├── fr.json
├── ar.json
├── pt.json
├── ru.json
├── ja.json
└── bn.json
```

### Namespace Structure

Translations are organized hierarchically by portal and feature:

```
{
  "common": { ... },           // Shared terms across all portals
  "auth": { ... },             // Authentication pages
  "navigation": { ... },       // Navigation labels
  "admin": {                   // Admin Portal
    "settings": { ... },
    "entitlementFeatures": { ... },
    "identity": {
      "sso": { ... },
      "domains": { ... }
    }
  },
  "gwi": {                     // GWI Portal
    "surveys": { ... },
    "pipelines": { ... },
    "llm": {
      "configurations": { ... },
      "prompts": { ... }
    }
  },
  "dashboard": {               // User Dashboard
    "audiences": { ... },
    "charts": { ... }
  }
}
```

## Usage

### Client Components ("use client")

```typescript
"use client"
import { useTranslations } from "next-intl"

export default function SurveysPage() {
  const t = useTranslations("gwi.surveys")
  const tCommon = useTranslations("common")

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      <button>{tCommon("save")}</button>
      <button>{tCommon("cancel")}</button>
    </div>
  )
}
```

### Server Components

```typescript
import { getTranslations } from "@/lib/i18n/server"

export default async function PipelinesPage() {
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

// In en.json: "itemCount": "{count, plural, one {# item} other {# items}}"
t("itemCount", { count: items.length })
```

### Translating Arrays/Objects

Convert hardcoded arrays to use translations:

```typescript
// Before (hardcoded)
const CATEGORIES = [
  { value: "CORE", label: "Core" },
  { value: "ANALYTICS", label: "Analytics" },
]

// After (translated)
const CATEGORIES = [
  { value: "CORE", label: t("categories.core") },
  { value: "ANALYTICS", label: t("categories.analytics") },
]
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
        "name": "Name",
        "status": "Status",
        "actions": "Actions"
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

### Step 3: Verify Coverage

```bash
npm run i18n:validate
```

Expected output:
```
All translations are valid!
```

### Step 4: Translate Placeholders

Search for `[XX]` markers in language files and replace with proper translations:

```json
// Before
"title": "[ES] My Feature"

// After
"title": "Mi Función"
```

## Common Namespace

Use `common.*` for frequently used terms to avoid duplication:

| Key | English |
|-----|---------|
| `common.save` | Save |
| `common.cancel` | Cancel |
| `common.delete` | Delete |
| `common.edit` | Edit |
| `common.create` | Create |
| `common.search` | Search |
| `common.filter` | Filter |
| `common.loading` | Loading... |
| `common.error` | Error |
| `common.success` | Success |
| `common.confirm` | Confirm |
| `common.status` | Status |
| `common.actions` | Actions |
| `common.name` | Name |
| `common.description` | Description |

## Best Practices

### 1. Never Hardcode User-Facing Strings

```typescript
// Bad
<button>Save Changes</button>

// Good
<button>{tCommon("save")}</button>
```

### 2. Use Hierarchical Keys

```typescript
// Bad
t("surveyTitle")
t("surveyDescription")

// Good
t("survey.title")
t("survey.description")
```

### 3. Keep Keys Descriptive but Concise

```typescript
// Bad
t("theMainTitleOfTheSurveyListPage")

// Good
t("title")  // Context from namespace: gwi.surveys.title
```

### 4. Group Related Keys

```json
{
  "form": {
    "name": "Name",
    "email": "Email",
    "submit": "Submit"
  },
  "validation": {
    "required": "This field is required",
    "invalidEmail": "Invalid email address"
  }
}
```

### 5. Include All UI Text

Don't forget:
- Page titles and descriptions
- Button labels
- Form labels and placeholders
- Table headers
- Error messages
- Success/toast messages
- Confirmation dialogs
- Empty states
- Loading states

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run i18n:validate` | Check translation coverage |
| `npm run i18n:validate:verbose` | Detailed validation output |
| `npm run i18n:fix` | Add missing keys as placeholders |
| `npm run i18n:clean` | Remove orphaned keys |
| `npm run i18n:sync` | Fix + clean combined |

## CI/CD Integration

Translation validation runs automatically:
- **Pre-commit hook**: Validates translations before commit
- **CI Pipeline**: Blocks deployment if translations are invalid

## Troubleshooting

### Missing Translation Key

If you see `gwi.surveys.title` rendered as text, the key is missing. Add it to en.json and run `npm run i18n:fix`.

### Type Mismatch

Ensure the value type matches across all languages (string vs object vs array).

### RTL Languages

Arabic (`ar`) requires RTL layout. Check `lib/i18n/config.ts` for RTL detection:

```typescript
export function isRtlLocale(locale: string): boolean {
  return locale === 'ar'
}
```

## Parallel Development Learnings

From our multi-lingual implementation project:

1. **Run validation scripts frequently** - Catch issues early
2. **Use parallel agents for large-scale i18n work** - Admin, GWI, Dashboard can be translated simultaneously
3. **Add keys to en.json first** - It's the source of truth
4. **Common namespace reduces duplication** - Saves translation effort
5. **Hierarchical namespaces make keys discoverable** - Easy to find and maintain
