#!/usr/bin/env node

/**
 * Comprehensive i18n Fixer
 * 
 * Automatically fixes hardcoded strings across the codebase
 */

const fs = require('fs');
const path = require('path');

// Common replacements with context
const REPLACEMENTS = [
  // JSX Text - Common buttons/labels
  { pattern: />Back</g, replacement: '>{t("common.back")}<', type: 'jsx-text' },
  { pattern: />Cancel</g, replacement: '>{t("common.cancel")}<', type: 'jsx-text' },
  { pattern: />Save</g, replacement: '>{t("common.save")}<', type: 'jsx-text' },
  { pattern: />Delete</g, replacement: '>{t("common.delete")}<', type: 'jsx-text' },
  { pattern: />Edit</g, replacement: '>{t("common.edit")}<', type: 'jsx-text' },
  { pattern: />Create</g, replacement: '>{t("common.create")}<', type: 'jsx-text' },
  { pattern: />Status</g, replacement: '>{t("common.status")}<', type: 'jsx-text' },
  { pattern: />Description</g, replacement: '>{t("common.description")}<', type: 'jsx-text' },
  { pattern: />Name</g, replacement: '>{t("common.name")}<', type: 'jsx-text' },
  { pattern: />Overview</g, replacement: '>{t("common.statuses.overview")}<', type: 'jsx-text' },
  { pattern: />Active</g, replacement: '>{t("common.active")}<', type: 'jsx-text' },
  { pattern: />Inactive</g, replacement: '>{t("common.inactive")}<', type: 'jsx-text' },
  { pattern: />Enabled</g, replacement: '>{t("common.enabled")}<', type: 'jsx-text' },
  { pattern: />Disabled</g, replacement: '>{t("common.disabled")}<', type: 'jsx-text' },
  { pattern: />Required</g, replacement: '>{t("common.required")}<', type: 'jsx-text' },
  { pattern: />Not Required</g, replacement: '>{t("common.notRequired")}<', type: 'jsx-text' },
  { pattern: />Loading\.\.\.</g, replacement: '>{t("common.loading")}<', type: 'jsx-text' },
  { pattern: />Search</g, replacement: '>{t("common.search")}<', type: 'jsx-text' },
  { pattern: />Filter</g, replacement: '>{t("common.filter")}<', type: 'jsx-text' },
  { pattern: />Close</g, replacement: '>{t("common.close")}<', type: 'jsx-text' },
  { pattern: />Next</g, replacement: '>{t("common.next")}<', type: 'jsx-text' },
  { pattern: />Previous</g, replacement: '>{t("common.previous")}<', type: 'jsx-text' },
  { pattern: />Submit</g, replacement: '>{t("common.submit")}<', type: 'jsx-text' },
  { pattern: />Confirm</g, replacement: '>{t("common.confirm")}<', type: 'jsx-text' },
  { pattern: />Yes</g, replacement: '>{t("common.yes")}<', type: 'jsx-text' },
  { pattern: />No</g, replacement: '>{t("common.no")}<', type: 'jsx-text' },
  { pattern: />View</g, replacement: '>{t("common.viewDetails")}<', type: 'jsx-text' },
  { pattern: />Export</g, replacement: '>{t("common.export")}<', type: 'jsx-text' },
  { pattern: />Import</g, replacement: '>{t("common.import")}<', type: 'jsx-text' },
  { pattern: />Refresh</g, replacement: '>{t("common.refresh")}<', type: 'jsx-text' },
  
  // Props
  { pattern: /placeholder=["']Back["']/g, replacement: 'placeholder={t("common.back")}', type: 'prop' },
  { pattern: /placeholder=["']Cancel["']/g, replacement: 'placeholder={t("common.cancel")}', type: 'prop' },
  { pattern: /placeholder=["']Search["']/g, replacement: 'placeholder={t("common.searchPlaceholder")}', type: 'prop' },
  { pattern: /placeholder=["']Search\.\.\.["']/g, replacement: 'placeholder={t("common.searchPlaceholder")}', type: 'prop' },
  { pattern: /title=["']Back["']/g, replacement: 'title={t("common.back")}', type: 'prop' },
  { pattern: /aria-label=["']Back["']/g, replacement: 'aria-label={t("common.back")}', type: 'prop' },
  
  // Toast messages
  { pattern: /toast\.error\("Failed to load"/g, replacement: 'showErrorToast(t("common.errors.loadFailed"))', type: 'toast' },
  { pattern: /toast\.error\("Failed to save"/g, replacement: 'showErrorToast(t("common.errors.saveFailed"))', type: 'toast' },
  { pattern: /toast\.error\("Failed to create"/g, replacement: 'showErrorToast(t("common.errors.createFailed"))', type: 'toast' },
  { pattern: /toast\.error\("Failed to update"/g, replacement: 'showErrorToast(t("common.errors.updateFailed"))', type: 'toast' },
  { pattern: /toast\.error\("Failed to delete"/g, replacement: 'showErrorToast(t("common.errors.deleteFailed"))', type: 'toast' },
  { pattern: /toast\.error\("Failed to fetch"/g, replacement: 'showErrorToast(t("common.errors.fetchFailed"))', type: 'toast' },
];

function ensureImports(content) {
  let modified = content;
  
  // Check if we need toast utils
  if ((modified.includes('showErrorToast') || modified.includes('showSuccessToast')) && 
      !modified.includes("from '@/lib/toast-utils'")) {
    // Find last import
    const importLines = modified.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < importLines.length; i++) {
      if (importLines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    if (lastImportIndex >= 0) {
      importLines.splice(lastImportIndex + 1, 0, "import { showErrorToast, showSuccessToast } from '@/lib/toast-utils'");
      modified = importLines.join('\n');
    }
  }

  // Check if we need useTranslations
  if (modified.includes('t(') && !modified.includes('const t = useTranslations')) {
    if (!modified.includes("from 'next-intl'") && modified.includes("'use client'")) {
      const lines = modified.split('\n');
      const useClientIndex = lines.findIndex(l => l.includes("'use client'"));
      if (useClientIndex >= 0) {
        lines.splice(useClientIndex + 1, 0, "import { useTranslations } from 'next-intl'");
        modified = lines.join('\n');
      }
    }
    
    // Add hook call
    if (modified.includes("'use client'")) {
      const functionMatch = modified.match(/(export\s+)?(default\s+)?function\s+(\w+)/);
      if (functionMatch && !modified.includes('const t = useTranslations')) {
        const funcName = functionMatch[3];
        const funcStart = modified.indexOf(`function ${funcName}`);
        const openBrace = modified.indexOf('{', funcStart);
        if (openBrace !== -1) {
          modified = modified.slice(0, openBrace + 1) + 
                    "\n  const t = useTranslations();\n" +
                    modified.slice(openBrace + 1);
        }
      }
    }
  }

  return modified;
}

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { changes: 0, errors: [`File not found: ${filePath}`] };
  }

  // Skip non-TSX files
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) {
    return { changes: 0, skipped: true };
  }

  // Skip test files
  if (filePath.includes('.test.') || filePath.includes('.spec.')) {
    return { changes: 0, skipped: true };
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  const errors = [];

  // Apply replacements
  for (const { pattern, replacement } of REPLACEMENTS) {
    try {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        changes += matches.length;
      }
    } catch (error) {
      errors.push(`Error applying pattern ${pattern}: ${error.message}`);
    }
  }

  // Ensure imports
  if (changes > 0) {
    try {
      content = ensureImports(content);
      fs.writeFileSync(filePath, content, 'utf8');
    } catch (error) {
      errors.push(`Error writing file: ${error.message}`);
    }
  }

  return { changes, errors };
}

// Main
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/comprehensive-i18n-fix.js <file1> [file2] ...');
    console.log('Or: node scripts/comprehensive-i18n-fix.js --file-list <list-file>');
    process.exit(1);
  }

  let files = [];
  if (args[0] === '--file-list' && args[1]) {
    const listContent = fs.readFileSync(args[1], 'utf8');
    files = listContent.split('\n').filter(f => f.trim());
  } else {
    files = args.map(f => path.resolve(process.cwd(), f));
  }

  let totalChanges = 0;
  let filesChanged = 0;
  const allErrors = [];

  for (const filePath of files) {
    const result = fixFile(filePath);
    if (result.skipped) continue;
    
    if (result.changes > 0) {
      const relPath = path.relative(process.cwd(), filePath);
      console.log(`✓ Fixed ${result.changes} issue(s) in ${relPath}`);
      totalChanges += result.changes;
      filesChanged++;
    }
    
    if (result.errors && result.errors.length > 0) {
      allErrors.push(...result.errors.map(e => `${filePath}: ${e}`));
    }
  }

  console.log(`\nTotal: ${totalChanges} issue(s) fixed across ${filesChanged} file(s)`);
  
  if (allErrors.length > 0) {
    console.log(`\nErrors encountered:`);
    allErrors.forEach(e => console.error(`  ${e}`));
  }
}

module.exports = { fixFile };
