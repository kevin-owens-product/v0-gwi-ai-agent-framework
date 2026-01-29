#!/usr/bin/env node

/**
 * Comprehensive fix for all remaining issues:
 * - Remaining toast calls
 * - Missing translation hooks
 * - Unused imports cleanup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

function findFiles(pattern) {
  try {
    return execSync(
      `grep -rl "${pattern}" app/ components/ --include="*.tsx" --include="*.ts"`,
      { cwd: ROOT_DIR, encoding: 'utf8' }
    ).trim().split('\n').filter(f => f);
  } catch (e) {
    return [];
  }
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  const isClient = content.includes("'use client'");
  
  // Fix remaining toast calls
  if (/toast\.(error|success)\(/.test(content)) {
    const needsToastUtils = !/from ['"]@\/lib\/toast-utils['"]/.test(content);
    
    if (needsToastUtils) {
      const lastImport = content.lastIndexOf('import');
      if (lastImport !== -1) {
        const nextLine = content.indexOf('\n', lastImport);
        content = content.slice(0, nextLine + 1) + 
          "import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';\n" +
          content.slice(nextLine + 1);
        changes++;
      }
    }
    
    content = content.replace(/toast\.error\(/g, 'showErrorToast(');
    content = content.replace(/toast\.success\(/g, 'showSuccessToast(');
    changes++;
    
    // Remove toast import if unused
    if (!/toast\.(error|success|loading|info|warning|dismiss|promise)/.test(content)) {
      content = content.replace(/import\s+\{\s*toast[^}]*\}\s+from\s+['"]sonner['"];?\s*\n/g, '');
      content = content.replace(/import\s+toast\s+from\s+['"]sonner['"];?\s*\n/g, '');
    }
  }
  
  // Add missing translation hooks if t() is used but not defined
  if (/[^a-zA-Z]t\(/.test(content) && !/const\s+t\s*=/.test(content) && !/await\s+getTranslations/.test(content)) {
    const hasUseTranslations = /useTranslations/.test(content);
    const hasGetTranslations = /getTranslations/.test(content);
    
    if (!hasUseTranslations && !hasGetTranslations) {
      if (isClient) {
        // Add useTranslations import
        if (!/from\s+['"]next-intl['"]/.test(content)) {
          const lastImport = content.lastIndexOf('import');
          const nextLine = content.indexOf('\n', lastImport);
          content = content.slice(0, nextLine + 1) + 
            "import { useTranslations } from 'next-intl';\n" +
            content.slice(nextLine + 1);
          changes++;
        } else {
          content = content.replace(
            /import\s+.*from\s+['"]next-intl['"]/,
            "import { useTranslations } from 'next-intl'"
          );
        }
        
        // Add hook call
        const functionMatch = content.match(/(export\s+)?(default\s+)?function\s+\w+/);
        if (functionMatch) {
          const insertPos = functionMatch.index + functionMatch[0].length;
          const nextBrace = content.indexOf('{', insertPos);
          if (nextBrace !== -1) {
            const afterBrace = content.indexOf('\n', nextBrace) + 1;
            // Try to infer namespace from file path
            let namespace = 'common';
            if (filePath.includes('/admin/')) namespace = 'admin';
            else if (filePath.includes('/dashboard/')) namespace = 'dashboard';
            else if (filePath.includes('/gwi/')) namespace = 'gwi';
            
            content = content.slice(0, afterBrace) + 
              `  const t = useTranslations("${namespace}");\n` +
              content.slice(afterBrace);
            changes++;
          }
        }
      }
    }
  }
  
  // Remove unused imports
  const unusedPatterns = [
    { pattern: /import\s+\{\s*useEffect\s*\}\s+from\s+['"]react['"];?\s*\n/g, check: /useEffect\(/ },
    { pattern: /,\s*useEffect/g, check: /useEffect\(/ },
    { pattern: /useEffect\s*,/g, check: /useEffect\(/ },
  ];
  
  for (const { pattern, check } of unusedPatterns) {
    if (pattern.test(content) && !check.test(content)) {
      content = content.replace(pattern, '');
      changes++;
    }
  }
  
  return { content, changes };
}

function main() {
  // Find all files with issues
  const toastFiles = findFiles('toast\\.(error|success)');
  const tUsageFiles = findFiles('[^a-zA-Z]t\\(');
  
  const allFiles = [...new Set([...toastFiles, ...tUsageFiles])];
  console.log(`Found ${allFiles.length} files to process`);
  
  let totalChanges = 0;
  const processed = [];
  
  for (const file of allFiles) {
    const filePath = path.join(ROOT_DIR, file);
    try {
      const { content, changes } = fixFile(filePath);
      if (changes > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        processed.push({ file, changes });
        totalChanges += changes;
        console.log(`✓ Fixed ${changes} issue(s) in ${file}`);
      }
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Files processed: ${processed.length}`);
  console.log(`Total changes: ${totalChanges}`);
}

if (require.main === module) {
  main();
}

module.exports = { fixFile };
