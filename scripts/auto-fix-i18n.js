#!/usr/bin/env node

/**
 * Automated i18n Fixer
 * 
 * Automatically fixes common hardcoded string patterns
 */

const fs = require('fs');
const path = require('path');

// Common JSX text replacements
const JSX_TEXT_REPLACEMENTS = [
  { pattern: />Back</g, replacement: '>{t("common.back")}<', needsHook: true },
  { pattern: />Cancel</g, replacement: '>{t("common.cancel")}<', needsHook: true },
  { pattern: />Save</g, replacement: '>{t("common.save")}<', needsHook: true },
  { pattern: />Delete</g, replacement: '>{t("common.delete")}<', needsHook: true },
  { pattern: />Edit</g, replacement: '>{t("common.edit")}<', needsHook: true },
  { pattern: />Create</g, replacement: '>{t("common.create")}<', needsHook: true },
  { pattern: />Status</g, replacement: '>{t("common.status")}<', needsHook: true },
  { pattern: />Description</g, replacement: '>{t("common.description")}<', needsHook: true },
  { pattern: />Name</g, replacement: '>{t("common.name")}<', needsHook: true },
  { pattern: />Overview</g, replacement: '>{t("common.statuses.overview")}<', needsHook: true },
  { pattern: />Active</g, replacement: '>{t("common.active")}<', needsHook: true },
  { pattern: />Inactive</g, replacement: '>{t("common.inactive")}<', needsHook: true },
  { pattern: />Enabled</g, replacement: '>{t("common.enabled")}<', needsHook: true },
  { pattern: />Disabled</g, replacement: '>{t("common.disabled")}<', needsHook: true },
  { pattern: />Required</g, replacement: '>{t("common.required")}<', needsHook: true },
  { pattern: />Not Required</g, replacement: '>{t("common.notRequired")}<', needsHook: true },
  { pattern: />Loading\.\.\.</g, replacement: '>{t("common.loading")}<', needsHook: true },
  { pattern: />Search</g, replacement: '>{t("common.search")}<', needsHook: true },
  { pattern: />Filter</g, replacement: '>{t("common.filter")}<', needsHook: true },
  { pattern: />Close</g, replacement: '>{t("common.close")}<', needsHook: true },
  { pattern: />Next</g, replacement: '>{t("common.next")}<', needsHook: true },
  { pattern: />Previous</g, replacement: '>{t("common.previous")}<', needsHook: true },
  { pattern: />Submit</g, replacement: '>{t("common.submit")}<', needsHook: true },
  { pattern: />Confirm</g, replacement: '>{t("common.confirm")}<', needsHook: true },
  { pattern: />Yes</g, replacement: '>{t("common.yes")}<', needsHook: true },
  { pattern: />No</g, replacement: '>{t("common.no")}<', needsHook: true },
];

// Prop replacements
const PROP_REPLACEMENTS = [
  { pattern: /placeholder=["']Back["']/g, replacement: 'placeholder={t("common.back")}', needsHook: true },
  { pattern: /placeholder=["']Cancel["']/g, replacement: 'placeholder={t("common.cancel")}', needsHook: true },
  { pattern: /placeholder=["']Search["']/g, replacement: 'placeholder={t("common.searchPlaceholder")}', needsHook: true },
  { pattern: /placeholder=["']Search\.\.\.["']/g, replacement: 'placeholder={t("common.searchPlaceholder")}', needsHook: true },
  { pattern: /title=["']Back["']/g, replacement: 'title={t("common.back")}', needsHook: true },
  { pattern: /aria-label=["']Back["']/g, replacement: 'aria-label={t("common.back")}', needsHook: true },
];

// Toast replacements
const TOAST_REPLACEMENTS = [
  { pattern: /toast\.error\("Failed to load"/g, replacement: 'showErrorToast(t("common.errors.loadFailed"))', needsImports: true },
  { pattern: /toast\.error\("Failed to save"/g, replacement: 'showErrorToast(t("common.errors.saveFailed"))', needsImports: true },
  { pattern: /toast\.error\("Failed to create"/g, replacement: 'showErrorToast(t("common.errors.createFailed"))', needsImports: true },
  { pattern: /toast\.error\("Failed to update"/g, replacement: 'showErrorToast(t("common.errors.updateFailed"))', needsImports: true },
  { pattern: /toast\.error\("Failed to delete"/g, replacement: 'showErrorToast(t("common.errors.deleteFailed"))', needsImports: true },
  { pattern: /toast\.error\("Failed to fetch"/g, replacement: 'showErrorToast(t("common.errors.fetchFailed"))', needsImports: true },
  { pattern: /toast\.success\(".*created successfully"/g, replacement: 'showSuccessToast(t("common.success.created"))', needsImports: true },
  { pattern: /toast\.success\(".*updated successfully"/g, replacement: 'showSuccessToast(t("common.success.updated"))', needsImports: true },
  { pattern: /toast\.success\(".*deleted successfully"/g, replacement: 'showSuccessToast(t("common.success.deleted"))', needsImports: true },
];

function ensureImports(content) {
  let modified = content;
  let needsToastUtils = false;
  let needsUseTranslations = false;

  // Check if we need toast utils
  if (modified.includes('showErrorToast') || modified.includes('showSuccessToast')) {
    needsToastUtils = true;
    if (!modified.includes("from '@/lib/toast-utils'")) {
      // Find last import
      const importMatch = modified.match(/import\s+.*from\s+['"][^'"]+['"];?\s*\n/g);
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        const lastImportIndex = modified.lastIndexOf(lastImport);
        const insertPos = lastImportIndex + lastImport.length;
        modified = modified.slice(0, insertPos) + 
                  "import { showErrorToast, showSuccessToast } from '@/lib/toast-utils'\n" +
                  modified.slice(insertPos);
      }
    }
  }

  // Check if we need useTranslations
  if (modified.includes('t(') && !modified.includes('const t = useTranslations')) {
    needsUseTranslations = true;
    if (!modified.includes("from 'next-intl'")) {
      // Add useTranslations import
      if (modified.includes("'use client'")) {
        const useClientIndex = modified.indexOf("'use client'");
        const nextLine = modified.indexOf('\n', useClientIndex);
        modified = modified.slice(0, nextLine + 1) + 
                  "import { useTranslations } from 'next-intl'\n" +
                  modified.slice(nextLine + 1);
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
    console.error(`File not found: ${filePath}`);
    return 0;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // Skip if not a TSX/JSX file
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) {
    return 0;
  }

  // Skip test files
  if (filePath.includes('.test.') || filePath.includes('.spec.')) {
    return 0;
  }

  // Apply JSX text replacements
  for (const { pattern, replacement, needsHook } of JSX_TEXT_REPLACEMENTS) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      changes += matches.length;
    }
  }

  // Apply prop replacements
  for (const { pattern, replacement } of PROP_REPLACEMENTS) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      changes += matches.length;
    }
  }

  // Apply toast replacements
  for (const { pattern, replacement, needsImports } of TOAST_REPLACEMENTS) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      changes += matches.length;
    }
  }

  // Ensure imports are present
  if (changes > 0) {
    content = ensureImports(content);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return changes;
}

// Main
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/auto-fix-i18n.js <file1> [file2] ...');
    process.exit(1);
  }

  let totalChanges = 0;
  let filesChanged = 0;

  for (const filePath of args) {
    const fullPath = path.resolve(process.cwd(), filePath);
    const changes = fixFile(fullPath);
    if (changes > 0) {
      console.log(`✓ Fixed ${changes} issue(s) in ${path.relative(process.cwd(), fullPath)}`);
      totalChanges += changes;
      filesChanged++;
    }
  }

  console.log(`\nTotal: ${totalChanges} issue(s) fixed across ${filesChanged} file(s)`);
}

module.exports = { fixFile };
