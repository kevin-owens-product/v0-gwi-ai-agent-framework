#!/usr/bin/env node

/**
 * Fix all toast.error and toast.success calls across the codebase
 * Replaces them with showErrorToast/showSuccessToast from toast-utils
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

function findFilesWithToastCalls() {
  try {
    const result = execSync(
      'find app components -type f \\( -name "*.tsx" -o -name "*.ts" \\) -exec grep -l "toast\\.\\(error\\|success\\)" {} \\;',
      { cwd: ROOT_DIR, encoding: 'utf8' }
    );
    return result.trim().split('\n').filter(f => f);
  } catch (e) {
    return [];
  }
}

function fixToastCalls(content, filePath) {
  let modified = content;
  let changes = 0;
  
  // Check if file needs toast utils import
  const needsToastUtils = /toast\.(error|success)/.test(modified);
  const hasToastUtilsImport = /from ['"]@\/lib\/toast-utils['"]/.test(modified);
  
  // Replace toast.error("hardcoded") with showErrorToast(t("key"))
  modified = modified.replace(/toast\.error\((["'])([^"']+)\1\)/g, (match, quote, message) => {
    changes++;
    // If message looks like a translation key, use it directly
    if (message.includes('.') && /^[a-z]/.test(message)) {
      return `showErrorToast(t("${message}"))`;
    }
    // Otherwise generate a key
    const key = message.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).slice(0, 3).join('_') || 'error';
    return `showErrorToast(t("toast.error.${key}"))`;
  });
  
  // Replace toast.error(t("key")) with showErrorToast(t("key"))
  modified = modified.replace(/toast\.error\(t\(([^)]+)\)\)/g, (match, key) => {
    changes++;
    return `showErrorToast(t(${key}))`;
  });
  
  // Replace toast.success("hardcoded") with showSuccessToast(t("key"))
  modified = modified.replace(/toast\.success\((["'])([^"']+)\1\)/g, (match, quote, message) => {
    changes++;
    if (message.includes('.') && /^[a-z]/.test(message)) {
      return `showSuccessToast(t("${message}"))`;
    }
    const key = message.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).slice(0, 3).join('_') || 'success';
    return `showSuccessToast(t("toast.success.${key}"))`;
  });
  
  // Replace toast.success(t("key")) with showSuccessToast(t("key"))
  modified = modified.replace(/toast\.success\(t\(([^)]+)\)\)/g, (match, key) => {
    changes++;
    return `showSuccessToast(t(${key}))`;
  });
  
  // Add toast utils import if needed
  if (needsToastUtils && !hasToastUtilsImport && changes > 0) {
    // Find last import statement
    const importRegex = /^import\s+.*from\s+['"][^'"]+['"];?\s*$/gm;
    const imports = modified.match(importRegex);
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = modified.lastIndexOf(lastImport);
      const insertPos = lastImportIndex + lastImport.length;
      modified = modified.slice(0, insertPos) + 
        "\nimport { showErrorToast, showSuccessToast } from '@/lib/toast-utils';\n" +
        modified.slice(insertPos);
    }
  }
  
  // Remove toast import from sonner if no longer used
  if (changes > 0 && !/toast\.(error|success|loading|info|warning)/.test(modified)) {
    modified = modified.replace(/import\s+\{\s*toast[^}]*\}\s+from\s+['"]sonner['"];?\s*\n/g, '');
    modified = modified.replace(/import\s+toast\s+from\s+['"]sonner['"];?\s*\n/g, '');
  }
  
  return { modified, changes };
}

function main() {
  const files = findFilesWithToastCalls();
  console.log(`Found ${files.length} files with toast calls`);
  
  let totalChanges = 0;
  const processedFiles = [];
  
  for (const file of files) {
    const filePath = path.join(ROOT_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { modified, changes } = fixToastCalls(content, filePath);
      
      if (changes > 0) {
        fs.writeFileSync(filePath, modified, 'utf8');
        processedFiles.push({ file, changes });
        totalChanges += changes;
        console.log(`✓ Fixed ${changes} toast call(s) in ${file}`);
      }
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Files processed: ${processedFiles.length}`);
  console.log(`Total changes: ${totalChanges}`);
  
  if (processedFiles.length > 0) {
    console.log(`\nFiles modified:`);
    processedFiles.forEach(({ file, changes }) => {
      console.log(`  - ${file} (${changes} changes)`);
    });
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixToastCalls };
