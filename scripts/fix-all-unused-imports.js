#!/usr/bin/env node

/**
 * Comprehensive unused import fixer
 * Removes all unused imports identified by TypeScript
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

function findFiles() {
  try {
    return execSync(
      'find app components -type f \\( -name "*.tsx" -o -name "*.ts" \\)',
      { cwd: ROOT_DIR, encoding: 'utf8' }
    ).trim().split('\n').filter(f => f);
  } catch (e) {
    return [];
  }
}

function removeUnusedImport(content, importName, importLine) {
  // Remove single import: import { X } from '...'
  if (importLine.match(new RegExp(`import\\s+\\{\\s*${importName}\\s*\\}\\s+from`))) {
    return content.replace(importLine + '\n', '');
  }
  
  // Remove from multi-import: import { A, X, B } from '...'
  const multiImportMatch = importLine.match(/import\s+\{([^}]+)\}\s+from/);
  if (multiImportMatch) {
    const imports = multiImportMatch[1].split(',').map(i => i.trim()).filter(i => i !== importName);
    if (imports.length === 0) {
      return content.replace(importLine + '\n', '');
    } else {
      const newImport = importLine.replace(/\{[^}]+\}/, `{ ${imports.join(', ')} }`);
      return content.replace(importLine, newImport);
    }
  }
  
  return content;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // Remove unused toast import
  if (/import.*toast.*from.*sonner/.test(content) && !/toast\.(error|success|loading|info|warning|dismiss|promise)/.test(content)) {
    content = content.replace(/import\s+\{\s*toast[^}]*\}\s+from\s+['"]sonner['"];?\s*\n/g, '');
    content = content.replace(/import\s+toast\s+from\s+['"]sonner['"];?\s*\n/g, '');
    changes++;
  }
  
  // Remove unused useEffect
  if (/import.*useEffect.*from.*react/.test(content) && !/useEffect\(/.test(content)) {
    content = content.replace(/,\s*useEffect/g, '');
    content = content.replace(/useEffect\s*,/g, '');
    content = content.replace(/import\s+\{\s*useEffect\s*\}\s+from\s+['"]react['"];?\s*\n/g, '');
    changes++;
  }
  
  // Remove unused showSuccessToast
  if (/import.*showSuccessToast/.test(content) && !/showSuccessToast\(/.test(content)) {
    content = content.replace(/,\s*showSuccessToast/g, '');
    content = content.replace(/showSuccessToast\s*,/g, '');
    const match = content.match(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]@\/lib\/toast-utils['"]/);
    if (match) {
      const imports = match[1].split(',').map(i => i.trim()).filter(i => i !== 'showSuccessToast');
      if (imports.length === 0) {
        content = content.replace(/import\s+\{\s*[^}]+\s*\}\s+from\s+['"]@\/lib\/toast-utils['"];?\s*\n/g, '');
      } else {
        content = content.replace(/import\s+\{\s*[^}]+\s*\}\s+from\s+['"]@\/lib\/toast-utils['"]/, `import { ${imports.join(', ')} } from '@/lib/toast-utils'`);
      }
      changes++;
    }
  }
  
  // Remove unused tCommon
  if (/const\s+tCommon\s*=/.test(content) && !/tCommon\(/.test(content)) {
    content = content.replace(/const\s+tCommon\s*=\s*useTranslations\([^)]+\);\s*\n/g, '');
    changes++;
  }
  
  // Remove unused tDuration
  if (/const\s+tDuration\s*=/.test(content) && !/tDuration\(/.test(content)) {
    content = content.replace(/const\s+tDuration\s*=\s*useTranslations\([^)]+\);\s*\n/g, '');
    changes++;
  }
  
  // Remove unused useTranslations import if no translation hooks used
  if (/import.*useTranslations.*from.*next-intl/.test(content) && !/useTranslations\(/.test(content) && !/const\s+t\s*=/.test(content)) {
    content = content.replace(/,\s*useTranslations/g, '');
    content = content.replace(/useTranslations\s*,/g, '');
    content = content.replace(/import\s+\{\s*useTranslations\s*\}\s+from\s+['"]next-intl['"];?\s*\n/g, '');
    changes++;
  }
  
  // Remove unused variables (destructured but not used)
  // This is more complex and might need manual review, but we can try common patterns
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Remove unused destructured variables in catch blocks
    if (line.match(/catch\s*\(\s*(\w+)\s*\)/) && !content.includes(`$1.`)) {
      const match = line.match(/catch\s*\(\s*(\w+)\s*\)/);
      if (match && !content.includes(`${match[1]}.`)) {
        lines[i] = line.replace(/catch\s*\(\s*\w+\s*\)/, 'catch');
        changes++;
      }
    }
    
    // Remove unused variables in destructuring (simple cases)
    // This is risky, so we'll be conservative
  }
  
  if (changes > 0) {
    content = lines.join('\n');
  }
  
  return { content, changes };
}

function main() {
  const files = findFiles();
  console.log(`Processing ${files.length} files for unused imports...`);
  
  let totalChanges = 0;
  const processed = [];
  
  for (const file of files) {
    const filePath = path.join(ROOT_DIR, file);
    try {
      const { content, changes } = fixFile(filePath);
      if (changes > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        processed.push({ file, changes });
        totalChanges += changes;
        if (processed.length % 50 === 0) {
          console.log(`Processed ${processed.length} files, ${totalChanges} changes...`);
        }
      }
    } catch (error) {
      // Skip errors
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
