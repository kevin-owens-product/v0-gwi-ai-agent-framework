#!/usr/bin/env node

/**
 * Fix remaining toast calls and clean up unused imports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

function findFilesWithIssues() {
  const files = [];
  
  // Find files with toast calls
  try {
    const toastFiles = execSync(
      'grep -rl "toast\\.\\(error\\|success\\)" app/ components/ --include="*.tsx" --include="*.ts"',
      { cwd: ROOT_DIR, encoding: 'utf8' }
    ).trim().split('\n').filter(f => f);
    files.push(...toastFiles.map(f => ({ file: f, issue: 'toast' })));
  } catch (e) {}
  
  return files;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // Replace remaining toast.error/toast.success
  const toastErrorPattern = /toast\.error\(/g;
  const toastSuccessPattern = /toast\.success\(/g;
  
  if (toastErrorPattern.test(content) || toastSuccessPattern.test(content)) {
    // Check if showErrorToast/showSuccessToast are imported
    const hasToastUtils = /from ['"]@\/lib\/toast-utils['"]/.test(content);
    
    if (!hasToastUtils) {
      // Add import
      const importMatch = content.match(/^import.*from\s+['"][^'"]+['"];?\s*$/m);
      if (importMatch) {
        const lastImport = content.lastIndexOf(importMatch[0]);
        const insertPos = lastImport + importMatch[0].length;
        content = content.slice(0, insertPos) + 
          "\nimport { showErrorToast, showSuccessToast } from '@/lib/toast-utils';" +
          content.slice(insertPos);
        changes++;
      }
    }
    
    // Replace toast.error with showErrorToast
    content = content.replace(/toast\.error\(/g, 'showErrorToast(');
    changes += (content.match(/showErrorToast\(/g) || []).length - (content.match(/toast\.error\(/g) || []).length;
    
    // Replace toast.success with showSuccessToast
    content = content.replace(/toast\.success\(/g, 'showSuccessToast(');
    changes += (content.match(/showSuccessToast\(/g) || []).length - (content.match(/toast\.success\(/g) || []).length;
    
    // Remove toast import if no longer used
    if (!/toast\.(error|success|loading|info|warning|dismiss|promise)/.test(content)) {
      content = content.replace(/import\s+\{\s*toast[^}]*\}\s+from\s+['"]sonner['"];?\s*\n/g, '');
      content = content.replace(/import\s+toast\s+from\s+['"]sonner['"];?\s*\n/g, '');
    }
  }
  
  // Remove unused useEffect import if useEffect is not used
  if (/import.*useEffect.*from.*react/.test(content) && !/useEffect\(/.test(content)) {
    content = content.replace(/,\s*useEffect/g, '');
    content = content.replace(/useEffect\s*,/g, '');
    content = content.replace(/import\s+\{\s*useEffect\s*\}\s+from\s+['"]react['"];?\s*\n/g, '');
    changes++;
  }
  
  return { content, changes };
}

function main() {
  const files = findFilesWithIssues();
  console.log(`Found ${files.length} files with issues`);
  
  let totalChanges = 0;
  
  for (const { file } of files) {
    const filePath = path.join(ROOT_DIR, file);
    try {
      const { content, changes } = fixFile(filePath);
      if (changes > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Fixed ${changes} issue(s) in ${file}`);
        totalChanges += changes;
      }
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\nTotal changes: ${totalChanges}`);
}

if (require.main === module) {
  main();
}

module.exports = { fixFile };
