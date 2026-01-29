#!/usr/bin/env node

/**
 * Fix catch blocks that reference error/err without parameters
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

function fixCatchBlocks(content) {
  let changes = 0;
  
  // Fix catch blocks that use error but don't have parameter
  // Pattern: } catch { ... error ...
  const catchErrorPattern = /}\s+catch\s*\{([^}]*error[^}]*)\}/g;
  if (catchErrorPattern.test(content)) {
    content = content.replace(/}\s+catch\s*\{([^}]*error[^}]*)\}/g, (match, body) => {
      changes++;
      return `} catch (error) {${body}}`;
    });
  }
  
  // Fix catch blocks that use err but don't have parameter
  // Pattern: } catch { ... err ...
  const catchErrPattern = /}\s+catch\s*\{([^}]*\berr\b[^}]*)\}/g;
  if (catchErrPattern.test(content)) {
    content = content.replace(/}\s+catch\s*\{([^}]*\berr\b[^}]*)\}/g, (match, body) => {
      changes++;
      return `} catch (err) {${body}}`;
    });
  }
  
  return { content, changes };
}

function main() {
  const files = findFiles();
  console.log(`Processing ${files.length} files for catch block fixes...`);
  
  let totalChanges = 0;
  const processed = [];
  
  for (const file of files) {
    const filePath = path.join(ROOT_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { content: fixedContent, changes } = fixCatchBlocks(content);
      if (changes > 0) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
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

module.exports = { fixCatchBlocks };
