# Translation Workflow Guide

## Quick Start

### Adding New Translation Keys

1. **Add to English file** (`messages/en.json`)
   ```json
   {
     "dashboard": {
       "crosstabs": {
         "newKey": "New Translation"
       }
     }
   }
   ```

2. **Sync to all languages**
   ```bash
   npm run i18n:fix
   ```
   This adds placeholder keys like `[ES] New Translation` to all language files.

3. **Translate the placeholders**
   - Search for `[ES]`, `[FR]`, etc. in message files
   - Replace with proper translations
   - Keep variable placeholders like `{count}`, `{time}` unchanged

4. **Verify**
   ```bash
   npm run i18n:validate
   ```

### Before Committing

Always run validation before committing:
```bash
npm run i18n:validate
```

If validation fails, run:
```bash
npm run i18n:fix
```

### Before Deploying

The CI pipeline automatically runs:
```bash
npm run ci
```

This includes translation validation and will fail if keys are missing.

## Common Tasks

### Check What's Missing
```bash
npm run i18n:check
```

### Fix All Missing Keys
```bash
npm run i18n:fix
```

### Full Sync (Fix + Clean)
```bash
npm run i18n:sync
```

### Full Audit
```bash
npm run i18n:audit
```

## Troubleshooting

### Error: "MISSING_MESSAGE: Could not resolve..."

**Solution:**
```bash
npm run i18n:fix
```

This will add placeholder keys for all missing translations.

### Error: "Validation failed"

**Check what's wrong:**
```bash
npm run i18n:check
```

**Fix it:**
```bash
npm run i18n:sync
```

### Too Many Placeholder Keys

After running `i18n:fix`, you'll see keys like `[ES] English text`. These need translation:

1. Search for `[ES]` (or other locale codes)
2. Translate the text
3. Remove the `[ES]` prefix
4. Keep variable placeholders like `{count}`

## Best Practices

1. **Always add to English first** - English (`en.json`) is the source of truth
2. **Run i18n:fix immediately** - Don't wait, sync right away
3. **Translate placeholders** - Don't leave `[XX]` prefixes in production
4. **Validate before commit** - Catch issues early
5. **Use variables correctly** - Keep `{count}`, `{time}`, etc. in all languages

## Variable Placeholders

When translating, preserve variable placeholders:

**English:**
```json
"audiencesCount": "{count} audiences"
```

**Spanish:**
```json
"audiencesCount": "{count} audiencias"
```

**NOT:**
```json
"audiencesCount": "[ES] {count} audiences"  // ❌ Wrong - has prefix
"audiencesCount": "{contador} audiencias"   // ❌ Wrong - changed variable name
```

## CI/CD Integration

The CI pipeline automatically validates translations. If validation fails:
- Build will fail
- Check CI logs for missing keys
- Run `npm run i18n:fix` locally
- Commit the fixes
- Push again

## Getting Help

- Check `docs/TRANSLATION_SYNC_PLAN.md` for detailed plan
- Run `npm run i18n:check` to see what's missing
- All scripts are in `scripts/validate-translations.js`
