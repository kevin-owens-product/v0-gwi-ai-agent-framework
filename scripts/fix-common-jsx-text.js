#!/usr/bin/env node

/**
 * Fix common JSX text patterns with translation keys
 * Replaces hardcoded common strings like "Save", "Cancel", "Delete" with common.* keys
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

// Common text mappings to translation keys
const COMMON_MAPPINGS = {
  // Buttons
  'Save': 'common.save',
  'Cancel': 'common.cancel',
  'Delete': 'common.delete',
  'Edit': 'common.edit',
  'Create': 'common.create',
  'Update': 'common.update',
  'Submit': 'common.submit',
  'Confirm': 'common.confirm',
  'Close': 'common.close',
  'Back': 'common.back',
  'Next': 'common.next',
  'Previous': 'common.previous',
  'Search': 'common.search',
  'Filter': 'common.filter',
  'Export': 'common.export',
  'Import': 'common.import',
  'Refresh': 'common.refresh',
  'View': 'common.view',
  'View All': 'common.viewAll',
  'View Details': 'common.viewDetails',
  
  // Labels
  'Name': 'common.name',
  'Description': 'common.description',
  'Status': 'common.status',
  'Type': 'common.type',
  'Date': 'common.date',
  'Email': 'common.email',
  'Required': 'common.required',
  'Optional': 'common.optional',
  'Loading...': 'common.loading',
  'Error': 'common.error',
  'Success': 'common.success',
  'No results found': 'common.noResults',
  
  // Status values
  'Active': 'common.active',
  'Inactive': 'common.inactive',
  'Enabled': 'common.enabled',
  'Disabled': 'common.disabled',
  'Pending': 'common.pending',
  'Completed': 'common.completed',
};

function findFilesWithHardcodedText() {
  try {
    const result = execSync(
      'find app components -type f -name "*.tsx" -exec grep -l ">Save<\\|>Cancel<\\|>Delete<\\|>Edit<\\|>Create<\\|>Name<\\|>Description<\\|>Status<" {} \\;',
      { cwd: ROOT_DIR, encoding: 'utf8' }
    );
    return result.trim().split('\n').filter(f => f);
  } catch (e) {
    return [];
  }
}

function fixCommonJSXText(content, filePath) {
  let modified = content;
  let changes = 0;
  
  // Check if file needs useTranslations
  const isClientComponent = content.includes("'use client'");
  const hasUseTranslations = content.includes('useTranslations');
  const hasGetTranslations = content.includes('getTranslations');
  const needsTranslations = !hasUseTranslations && !hasGetTranslations;
  
  // Replace common text in JSX
  for (const [text, key] of Object.entries(COMMON_MAPPINGS)) {
    // Pattern: >Text< or >Text</Tag>
    const patterns = [
      new RegExp(`>${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<`, 'g'),
      new RegExp(`>${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</`, 'g'),
    ];
    
    for (const pattern of patterns) {
      const matches = modified.match(pattern);
      if (matches) {
        modified = modified.replace(pattern, `>{t("${key}")}<`);
        changes += matches.length;
      }
    }
  }
  
  // Add useTranslations if needed
  if (changes > 0 && needsTranslations) {
    if (isClientComponent) {
      // Add import
      if (!content.includes('useTranslations')) {
        const importMatch = content.match(/import.*from\s+['"]next-intl['"]/);
        if (!importMatch) {
          const lastImport = content.lastIndexOf('import');
          const nextLine = content.indexOf('\n', lastImport);
          modified = modified.slice(0, nextLine + 1) + 
            "import { useTranslations } from 'next-intl'\n" +
            modified.slice(nextLine + 1);
        } else {
          modified = modified.replace(
            /import.*from\s+['"]next-intl['"]/,
            "import { useTranslations } from 'next-intl'"
          );
        }
      }
      
      // Add hook call
      if (!modified.includes('const t = useTranslations')) {
        const functionMatch = modified.match(/(export\s+)?(default\s+)?function\s+\w+/);
        if (functionMatch) {
          const insertPos = functionMatch.index + functionMatch[0].length;
          const nextBrace = modified.indexOf('{', insertPos);
          if (nextBrace !== -1) {
            modified = modified.slice(0, nextBrace + 1) + 
              "\n  const t = useTranslations('common');\n" +
              modified.slice(nextBrace + 1);
          }
        }
      }
    }
  }
  
  return { modified, changes };
}

function main() {
  const files = findFilesWithHardcodedText();
  console.log(`Found ${files.length} files with common hardcoded text`);
  
  let totalChanges = 0;
  const processedFiles = [];
  
  for (const file of files.slice(0, 50)) { // Process first 50 files
    const filePath = path.join(ROOT_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { modified, changes } = fixCommonJSXText(content, filePath);
      
      if (changes > 0) {
        fs.writeFileSync(filePath, modified, 'utf8');
        processedFiles.push({ file, changes });
        totalChanges += changes;
        console.log(`✓ Fixed ${changes} common text(s) in ${file}`);
      }
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Files processed: ${processedFiles.length}`);
  console.log(`Total changes: ${totalChanges}`);
}

if (require.main === module) {
  main();
}

module.exports = { fixCommonJSXText };
