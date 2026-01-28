# i18n Label Fix Plan

## Overview
Found **3,567 high-priority hardcoded strings** across the codebase that need translation.

## Breakdown by Type
- **JSX Text**: Hardcoded text in JSX elements
- **Props**: Hardcoded strings in props (placeholder, title, aria-label, etc.)
- **Toast Messages**: Direct toast.error/success calls
- **Object Literals**: Hardcoded labels in object literals

## Fix Strategy

### Phase 1: Toast Messages (High Priority)
**Pattern**: `toast.error("message")` → `showErrorToast(t("toast.error.key"))`

**Common replacements**:
- `toast.error("Name and code are required")` → `showErrorToast(t("toast.error.validationError"))`
- `toast.error("Failed to create framework")` → `showErrorToast(t("admin.compliance.frameworks.createFailed"))`
- `toast.error("Failed to load...")` → `showErrorToast(t("toast.error.loadFailed"))`

**Files to fix**:
- `app/admin/compliance/frameworks/new/page.tsx` ✅ (Fixed)
- `app/admin/devices/policies/[id]/page.tsx`
- `app/(dashboard)/dashboard/audiences/[id]/edit/page.tsx`
- `app/(dashboard)/dashboard/brand-tracking/[id]/edit/page.tsx`

### Phase 2: Common JSX Text Patterns
**Pattern**: `<Label>Hardcoded Text</Label>` → `<Label>{t("key")}</Label>`

**Common labels**:
- "Back" → `t("common.back")`
- "Cancel" → `t("common.cancel")`
- "Save" → `t("common.save")`
- "Create" → `t("common.create")`
- "Delete" → `t("common.delete")`
- "Status" → `t("common.status")`
- "Description" → `t("common.description")`

### Phase 3: Form Labels and Placeholders
**Pattern**: 
```tsx
<Label>Framework Name *</Label>
<Input placeholder="SOC 2 Type II" />
```
→
```tsx
<Label>{t("admin.compliance.frameworks.nameRequired")}</Label>
<Input placeholder={t("admin.compliance.frameworks.namePlaceholder")} />
```

### Phase 4: Object Literal Labels
**Pattern**:
```tsx
const config = {
  label: "Framework Details",
  description: "Define standards..."
}
```
→
```tsx
const config = {
  label: t("admin.compliance.frameworks.details"),
  description: t("admin.compliance.frameworks.detailsDescription")
}
```

## Required Imports

### Client Components
```tsx
import { useTranslations } from "next-intl"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

// In component:
const t = useTranslations()
```

### Server Components
```tsx
import { getTranslations } from "@/lib/i18n/server"

// In component:
const t = await getTranslations()
```

## Translation Key Structure

Follow existing patterns:
- `common.*` - Common UI elements (back, cancel, save, etc.)
- `toast.error.*` - Error messages
- `toast.success.*` - Success messages
- `admin.*` - Admin-specific translations
- `dashboard.*` - Dashboard-specific translations
- `gwi.*` - GWI Tools translations

## Automated Fix Script

Created `scripts/fix-i18n-labels.js` to help automate common patterns:
```bash
node scripts/fix-i18n-labels.js app/admin/compliance/frameworks/new/page.tsx
```

## Progress Tracking

- ✅ Fixed: `app/admin/compliance/frameworks/new/page.tsx`
- 🔄 In Progress: Toast messages across admin pages
- ⏳ Pending: JSX text content (3000+ instances)
- ⏳ Pending: Form labels and placeholders
- ⏳ Pending: Object literal labels

## Next Steps

1. **Continue fixing toast messages** - Highest impact, easiest to fix
2. **Fix common JSX text** - Use find/replace for common patterns
3. **Add missing translation keys** - Run `npm run i18n:fix` after adding keys
4. **Validate translations** - Run `npm run i18n:validate`
5. **Re-scan** - Run `npm run i18n:scan` to verify fixes

## Files with Most Issues

Based on scan results:
1. `app/admin/devices/policies/[id]/page.tsx` - 30+ hardcoded strings
2. `app/admin/compliance/frameworks/new/page.tsx` - ✅ Fixed
3. `app/(dashboard)/dashboard/audiences/[id]/edit/page.tsx` - Multiple toast/error messages
4. Various admin pages with form labels

## Notes

- Always check if translation key exists before adding new ones
- Use existing keys when possible (e.g., `common.back` instead of creating new)
- Test after fixes to ensure UI still works correctly
- Run linter to catch any issues: `npm run lint`
