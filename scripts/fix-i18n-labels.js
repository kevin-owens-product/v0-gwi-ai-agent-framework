#!/usr/bin/env node

/**
 * Automated i18n Label Fixer
 * 
 * Helps fix common i18n issues by:
 * 1. Replacing toast.error/success calls with translated versions
 * 2. Suggesting translation keys for common patterns
 * 3. Generating translation entries
 */

const fs = require('fs');
const path = require('path');

// Common toast message mappings
const TOAST_MAPPINGS = {
  'Name and code are required': 'toast.error.validationError',
  'Failed to create framework': 'toast.error.createFailed',
  'Failed to update framework': 'toast.error.updateFailed',
  'Failed to load framework': 'toast.error.loadFailed',
  'Failed to save changes': 'toast.error.saveFailed',
  'Policy name is required': 'toast.error.validationError',
  'Failed to load audience': 'toast.error.loadFailed',
  'Failed to update audience': 'toast.error.updateFailed',
  'Failed to load brand tracking study': 'toast.error.loadFailed',
};

// Common label mappings
const LABEL_MAPPINGS = {
  'Framework Details': 'admin.compliance.frameworks.details',
  'Framework Name *': 'admin.compliance.frameworks.nameRequired',
  'Code *': 'admin.compliance.frameworks.codeRequired',
  'Version': 'common.version',
  'Description': 'common.description',
  'Active Status': 'common.status',
  'Policy not found': 'admin.devices.policies.notFound',
  'Policy Name *': 'admin.devices.policies.nameRequired',
  'Cancel': 'common.cancel',
  'Overview': 'common.overview',
  'Status': 'common.status',
  'Created': 'common.createdAt',
  'Last Updated': 'common.lastUpdated',
  'Created By': 'common.createdBy',
};

function fixToastCall(content, filePath) {
  let modified = content;
  let changes = 0;

  // Pattern: toast.error("message")
  const toastErrorPattern = /toast\.error\(["']([^"']+)["']\)/g;
  modified = modified.replace(toastErrorPattern, (match, message) => {
    const trimmed = message.trim();
    if (TOAST_MAPPINGS[trimmed]) {
      changes++;
      return `showErrorToast(t("${TOAST_MAPPINGS[trimmed]}"))`;
    }
    // Generate key for unknown messages
    const key = generateToastKey(trimmed, 'error');
    changes++;
    return `showErrorToast(t("toast.error.${key}"))`;
  });

  // Pattern: toast.success("message")
  const toastSuccessPattern = /toast\.success\(["']([^"']+)["']\)/g;
  modified = modified.replace(toastSuccessPattern, (match, message) => {
    const trimmed = message.trim();
    const key = generateToastKey(trimmed, 'success');
    changes++;
    return `showSuccessToast(t("toast.success.${key}"))`;
  });

  return { content: modified, changes };
}

function generateToastKey(message, type) {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('_') || 'message';
}

function needsUseTranslations(content) {
  return content.includes('useTranslations') || content.includes('getTranslations');
}

function addUseTranslationsImport(content) {
  if (content.includes("'use client'")) {
    // Client component
    if (!content.includes('useTranslations')) {
      return content.replace(
        /import.*from ['"]next-intl['"]/,
        "import { useTranslations } from 'next-intl'"
      );
    }
  } else {
    // Server component
    if (!content.includes('getTranslations')) {
      // Add import if not present
      const importMatch = content.match(/import.*from ['"]@\/lib\/i18n\/server['"]/);
      if (!importMatch) {
        const lastImport = content.lastIndexOf('import');
        const nextLine = content.indexOf('\n', lastImport);
        return content.slice(0, nextLine + 1) + 
               "import { getTranslations } from '@/lib/i18n/server'\n" +
               content.slice(nextLine + 1);
      }
    }
  }
  return content;
}

function addToastUtilsImport(content) {
  if (content.includes('showErrorToast') || content.includes('showSuccessToast')) {
    if (!content.includes('@/lib/toast-utils')) {
      const lastImport = content.lastIndexOf('import');
      const nextLine = content.indexOf('\n', lastImport);
      return content.slice(0, nextLine + 1) + 
             "import { showErrorToast, showSuccessToast } from '@/lib/toast-utils'\n" +
             content.slice(nextLine + 1);
    }
  }
  return content;
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already using translations properly
  if (content.includes('useTranslations') || content.includes('getTranslations')) {
    // Still check for direct toast calls
    if (content.includes('toast.error(') || content.includes('toast.success(')) {
      const { content: fixed, changes } = fixToastCall(content, filePath);
      if (changes > 0) {
        const modified = addToastUtilsImport(fixed);
        return { modified, changes };
      }
    }
    return { modified: content, changes: 0 };
  }

  // Fix toast calls
  const { content: fixed, changes } = fixToastCall(content, filePath);
  
  if (changes > 0) {
    let modified = addUseTranslationsImport(fixed);
    modified = addToastUtilsImport(modified);
    
    // Add useTranslations hook if client component
    if (modified.includes("'use client'") && !modified.includes('const t = useTranslations')) {
      // Find first function component
      const functionMatch = modified.match(/(export\s+)?(default\s+)?function\s+\w+/);
      if (functionMatch) {
        const insertPos = functionMatch.index + functionMatch[0].length;
        const nextBrace = modified.indexOf('{', insertPos);
        if (nextBrace !== -1) {
          modified = modified.slice(0, nextBrace + 1) + 
                    "\n  const t = useTranslations();\n" +
                    modified.slice(nextBrace + 1);
        }
      }
    }
    
    return { modified, changes };
  }
  
  return { modified: content, changes: 0 };
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/fix-i18n-labels.js <file1> [file2] ...');
    console.log('Example: node scripts/fix-i18n-labels.js app/admin/compliance/frameworks/new/page.tsx');
    process.exit(1);
  }

  let totalChanges = 0;
  
  for (const fileArg of args) {
    const filePath = path.resolve(process.cwd(), fileArg);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    const { modified, changes } = fixFile(filePath);
    
    if (changes > 0) {
      fs.writeFileSync(filePath, modified, 'utf8');
      console.log(`✓ Fixed ${changes} issue(s) in ${fileArg}`);
      totalChanges += changes;
    } else {
      console.log(`- No changes needed in ${fileArg}`);
    }
  }

  console.log(`\nTotal: ${totalChanges} issue(s) fixed`);
}

module.exports = { fixFile, fixToastCall };
