#!/usr/bin/env node

/**
 * Batch i18n Fixer
 * 
 * Fixes common hardcoded string patterns across multiple files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common replacements
const COMMON_REPLACEMENTS = [
  // Common button/link text
  { pattern: />Back</g, replacement: '>{t("common.back")}<' },
  { pattern: />Cancel</g, replacement: '>{t("common.cancel")}<' },
  { pattern: />Save</g, replacement: '>{t("common.save")}<' },
  { pattern: />Delete</g, replacement: '>{t("common.delete")}<' },
  { pattern: />Edit</g, replacement: '>{t("common.edit")}<' },
  { pattern: />Create</g, replacement: '>{t("common.create")}<' },
  { pattern: />Status</g, replacement: '>{t("common.status")}<' },
  { pattern: />Description</g, replacement: '>{t("common.description")}<' },
  { pattern: />Overview</g, replacement: '>{t("common.statuses.overview")}<' },
  
  // Common labels
  { pattern: /label="Back"/g, replacement: 'label={t("common.back")}' },
  { pattern: /label="Cancel"/g, replacement: 'label={t("common.cancel")}' },
  { pattern: /label="Save"/g, replacement: 'label={t("common.save")}' },
  { pattern: /label="Delete"/g, replacement: 'label={t("common.delete")}' },
  
  // Toast messages - direct string replacements
  { pattern: /toast\.error\("Failed to load"/g, replacement: 'showErrorToast(t("toast.error.loadFailed"))' },
  { pattern: /toast\.error\("Failed to save"/g, replacement: 'showErrorToast(t("toast.error.saveFailed"))' },
  { pattern: /toast\.error\("Failed to create"/g, replacement: 'showErrorToast(t("toast.error.createFailed"))' },
  { pattern: /toast\.error\("Failed to update"/g, replacement: 'showErrorToast(t("toast.error.updateFailed"))' },
  { pattern: /toast\.error\("Failed to delete"/g, replacement: 'showErrorToast(t("toast.error.deleteFailed"))' },
  
  { pattern: /toast\.success\(".*created successfully"/g, replacement: 'showSuccessToast(t("toast.success.created"))' },
  { pattern: /toast\.success\(".*updated successfully"/g, replacement: 'showSuccessToast(t("toast.success.updated"))' },
  { pattern: /toast\.success\(".*deleted successfully"/g, replacement: 'showSuccessToast(t("toast.success.deleted"))' },
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  let needsImports = false;

  // Apply replacements
  for (const { pattern, replacement } of COMMON_REPLACEMENTS) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      changes += matches.length;
      if (replacement.includes('showErrorToast') || replacement.includes('showSuccessToast')) {
        needsImports = true;
      }
    }
  }

  // Add imports if needed
  if (needsImports && !content.includes('showErrorToast')) {
    if (content.includes("'use client'")) {
      // Client component
      if (!content.includes('useTranslations')) {
        content = content.replace(
          /import.*from ['"]next-intl['"]/,
          "import { useTranslations } from 'next-intl'"
        );
      }
      if (!content.includes('@/lib/toast-utils')) {
        const lastImport = content.lastIndexOf('import');
        const nextLine = content.indexOf('\n', lastImport);
        content = content.slice(0, nextLine + 1) + 
                 "import { showErrorToast, showSuccessToast } from '@/lib/toast-utils'\n" +
                 content.slice(nextLine + 1);
      }
    }
  }

  // Add useTranslations hook if needed
  if (content.includes('t(') && !content.includes('const t = useTranslations')) {
    if (content.includes("'use client'")) {
      const functionMatch = content.match(/(export\s+)?(default\s+)?function\s+\w+/);
      if (functionMatch) {
        const insertPos = functionMatch.index + functionMatch[0].length;
        const nextBrace = content.indexOf('{', insertPos);
        if (nextBrace !== -1) {
          content = content.slice(0, nextBrace + 1) + 
                   "\n  const t = useTranslations();\n" +
                   content.slice(nextBrace + 1);
        }
      }
    }
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    return changes;
  }
  return 0;
}

// Main
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/batch-fix-i18n.js <file1> [file2] ...');
    console.log('Or: node scripts/batch-fix-i18n.js --all-admin (fixes all admin pages)');
    process.exit(1);
  }

  let files = [];
  if (args[0] === '--all-admin') {
    // Find all admin pages
    const adminDir = path.join(process.cwd(), 'app/admin');
    const findFiles = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findFiles(fullPath);
        } else if (entry.name.endsWith('.tsx') && !entry.name.includes('.test.')) {
          files.push(fullPath);
        }
      }
    };
    findFiles(adminDir);
  } else {
    files = args.map(f => path.resolve(process.cwd(), f));
  }

  let totalChanges = 0;
  let filesChanged = 0;

  for (const filePath of files) {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    const changes = fixFile(filePath);
    if (changes > 0) {
      console.log(`✓ Fixed ${changes} issue(s) in ${path.relative(process.cwd(), filePath)}`);
      totalChanges += changes;
      filesChanged++;
    }
  }

  console.log(`\nTotal: ${totalChanges} issue(s) fixed across ${filesChanged} file(s)`);
}

module.exports = { fixFile };
