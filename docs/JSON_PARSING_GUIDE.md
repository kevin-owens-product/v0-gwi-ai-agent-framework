# JSON Parsing Best Practices

This document outlines best practices for safely parsing JSON in forms and API calls to prevent 400 Bad Request errors.

## Common Issues

### Problem: Empty String JSON Parsing
When a form field contains an empty string `""`, calling `JSON.parse("")` will throw an error, causing a 400 Bad Request.

**Bad Example:**
```typescript
const body = {
  options: formData.options ? JSON.parse(formData.options) : null,
}
// ❌ Fails if formData.options is ""
```

**Good Example:**
```typescript
let parsedOptions = null
if (formData.options?.trim()) {
  try {
    parsedOptions = JSON.parse(formData.options.trim())
  } catch (parseError) {
    toast.error("Invalid JSON format for options")
    return
  }
}
const body = {
  options: parsedOptions,
}
```

## Safe JSON Parsing Pattern

### Pattern 1: With Validation and Error Handling
```typescript
const handleSubmit = async () => {
  // Validate required fields first
  if (!formData.code?.trim()) {
    toast.error("Code is required")
    return
  }

  // Parse JSON safely
  let parsedOptions = null
  if (formData.options?.trim()) {
    try {
      parsedOptions = JSON.parse(formData.options.trim())
    } catch (parseError) {
      toast.error("Invalid JSON format for options")
      return
    }
  }

  // Submit with parsed data
  const body = {
    code: formData.code.trim(),
    options: parsedOptions,
  }
  
  // ... rest of submission logic
}
```

### Pattern 2: Using Utility Function
We have a utility function in `lib/utils/json.ts`:

```typescript
import { safeJsonParse, parseJsonOrThrow } from "@/lib/utils/json"

// Safe parsing with fallback
const options = safeJsonParse(formData.options, null)

// Parsing with error throwing for validation
try {
  const options = parseJsonOrThrow(formData.options, "options")
} catch (error) {
  toast.error(error.message)
  return
}
```

## Files Fixed

The following files have been updated to use safe JSON parsing:

1. ✅ `components/gwi/surveys/question-list.tsx` - Fixed empty options parsing
2. ✅ `components/gwi/pipelines/pipeline-editor.tsx` - Fixed configuration parsing
3. ✅ `components/gwi/agents/agent-template-editor.tsx` - Fixed multiple JSON fields
4. ✅ `components/gwi/llm/llm-configuration-editor.tsx` - Fixed params and rate limits

## Files Already Safe

These files already have proper error handling:

1. ✅ `app/admin/rules/page.tsx` - Has try-catch for JSON parsing
2. ✅ `app/admin/integrations/webhooks/new/page.tsx` - Checks for empty strings
3. ✅ `app/admin/entitlement-features/[id]/page.tsx` - Has error handling
4. ✅ `app/gwi/(portal)/surveys/[id]/questions/[questionId]/page.tsx` - Checks trim() before parsing

## Checklist for New Forms

When creating forms that parse JSON:

- [ ] Validate required fields before parsing
- [ ] Check for empty strings with `.trim()` before parsing
- [ ] Wrap `JSON.parse()` in try-catch
- [ ] Show user-friendly error messages
- [ ] Return early on validation errors
- [ ] Use `safeJsonParse()` utility when appropriate

## Testing

To test JSON parsing:

1. Submit form with empty JSON field → Should show validation error
2. Submit form with invalid JSON → Should show parsing error
3. Submit form with valid JSON → Should succeed
4. Submit form without JSON field → Should use null/fallback value
