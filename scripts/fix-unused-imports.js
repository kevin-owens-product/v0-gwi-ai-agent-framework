#!/usr/bin/env node

/**
 * Remove unused imports to clean up TypeScript warnings
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

function findFiles() {
  try {
    return execSync(
      'find app components -type f -name "*.tsx" -o -name "*.ts" | head -500',
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
  
  // Check for unused imports based on common patterns
  const lines = content.split('\n');
  const imports = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('import ')) {
      // Extract import names
      const singleMatch = line.match(/import\s+(\w+)\s+from/);
      const multiMatch = line.match(/import\s+\{([^}]+)\}\s+from/);
      
      if (singleMatch) {
        imports.push({ name: singleMatch[1], line, index: i, type: 'single' });
      } else if (multiMatch) {
        const names = multiMatch[1].split(',').map(n => n.trim());
        names.forEach(name => {
          imports.push({ name, line, index: i, type: 'multi' });
        });
      }
    }
  }
  
  // Check which imports are actually used
  for (const imp of imports) {
    const name = imp.name;
    // Skip if it's a type-only import or commonly used
    if (name.includes('type') || name === 'React' || name === 'useState' || name === 'useEffect') {
      continue;
    }
    
    // Check if the import is used (not just in the import line itself)
    const usagePattern = new RegExp(`\\b${name}\\b`);
    const beforeImport = content.substring(0, content.indexOf(imp.line));
    const afterImport = content.substring(content.indexOf(imp.line) + imp.line.length);
    const restOfContent = beforeImport + afterImport;
    
    if (!usagePattern.test(restOfContent)) {
      // Import is unused
      if (imp.type === 'single') {
        content = content.replace(imp.line + '\n', '');
        changes++;
      } else {
        // Multi-import - remove just this name
        const line = imp.line;
        const match = line.match(/import\s+\{([^}]+)\}\s+from/);
        if (match) {
          const imports = match[1].split(',').map(i => i.trim()).filter(i => i !== name);
          if (imports.length === 0) {
            content = content.replace(line + '\n', '');
            changes++;
          } else {
            const newLine = line.replace(/\{[^}]+\}/, `{ ${imports.join(', ')} }`);
            content = content.replace(line, newLine);
            changes++;
          }
        }
      }
    }
  }
  
  return { content, changes };
}

function main() {
  const files = findFiles();
  console.log(`Processing ${files.length} files...`);
  
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
