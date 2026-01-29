#!/usr/bin/env node

/**
 * Comprehensive script to fix all broken files
 * Handles: arrays in JSX, broken try-catch, duplicate components, missing braces
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

function fixBrokenPatterns(content) {
  let changed = false;
  const original = content;
  
  // Fix 1: Remove arrays/const declarations inserted in JSX (between > and <)
  // Pattern: >\n  const array = [\n  ...\n]\n<
  content = content.replace(/>\s*\n\s*const\s+\w+\s*=\s*\[[\s\S]*?\]\s*\n\s*</g, (match) => {
    changed = true;
    return '>\n<';
  });
  
  // Fix 2: Remove state declarations inserted in JSX
  content = content.replace(/>\s*\n\s*const\s+\[\w+,\s*set\w+\]\s*=\s*useState\([^)]*\)\s*\n\s*</g, (match) => {
    changed = true;
    return '>\n<';
  });
  
  // Fix 3: Fix broken function calls with arrays inserted
  // Pattern: setState(value || []\n  const array = [
  content = content.replace(/(\w+\([^)]*\)\s*)\s*\n\s*const\s+\w+\s*=\s*\[/g, (match, funcCall) => {
    changed = true;
    return funcCall.trim() + '\n  const array = [';
  });
  
  // Fix 4: Fix broken setState calls
  // Pattern: setState(value || []\n  const array = [
  content = content.replace(/(set\w+\([^)]*\))\s*\n\s*const\s+\w+\s*=\s*\[/g, (match, setState) => {
    changed = true;
    // Check if the setState call is incomplete
    if (!setState.includes(')')) {
      return setState + ')\n  const array = [';
    }
    return setState + '\n  const array = [';
  });
  
  // Fix 5: Fix broken try-catch blocks
  // Pattern: } catch (err) { ... } const array = [
  content = content.replace(/(\}\s*catch\s*\([^)]+\)\s*\{[^}]*\})\s*\n\s*const\s+\w+\s*=\s*\[/g, (match, catchBlock) => {
    changed = true;
    return catchBlock + '\n    } finally {\n      setIsLoading(false)\n    }\n  }\n\n  const array = [';
  });
  
  // Fix 6: Remove duplicate component declarations (keep first, remove rest)
  const componentRegex = /(export\s+(default\s+)?function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\}\s*\n)/g;
  const componentMatches = [...content.matchAll(componentRegex)];
  if (componentMatches.length > 1) {
    // Find all component declarations
    const lines = content.split('\n');
    const componentStarts = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().match(/^(export\s+)?(default\s+)?function\s+\w+\s*\(/)) {
        componentStarts.push(i);
      }
    }
    
    if (componentStarts.length > 1) {
      // Keep first component, remove duplicates
      for (let i = componentStarts.length - 1; i > 0; i--) {
        const start = componentStarts[i];
        // Find the end of this component (next component or end of file)
        let end = lines.length;
        if (i < componentStarts.length - 1) {
          end = componentStarts[i + 1];
        }
        
        // Check if this is truly a duplicate (same function name)
        const startLine = lines[start];
        const firstStartLine = lines[componentStarts[0]];
        const nameMatch1 = startLine.match(/function\s+(\w+)/);
        const nameMatch2 = firstStartLine.match(/function\s+(\w+)/);
        
        if (nameMatch1 && nameMatch2 && nameMatch1[1] === nameMatch2[1]) {
          // Remove duplicate
          lines.splice(start, end - start);
          changed = true;
        }
      }
      content = lines.join('\n');
    }
  }
  
  // Fix 7: Fix broken JSX with missing closing tags
  // Pattern: <div>\n  const array = [\n  ...\n]\n  </div>
  content = content.replace(/<(\w+)[^>]*>\s*\n\s*const\s+\w+\s*=\s*\[[\s\S]*?\]\s*\n\s*<\/\1>/g, (match) => {
    changed = true;
    return match.replace(/const\s+\w+\s*=\s*\[[\s\S]*?\]\s*\n\s*/g, '');
  });
  
  // Fix 8: Fix incomplete function calls
  // Pattern: func(\n  const array = [
  content = content.replace(/(\w+\([^)]*)\s*\n\s*const\s+\w+\s*=\s*\[/g, (match, incompleteCall) => {
    changed = true;
    if (!incompleteCall.includes(')')) {
      return incompleteCall + ')\n  const array = [';
    }
    return incompleteCall + '\n  const array = [';
  });
  
  // Fix 9: Remove orphaned closing braces/brackets after arrays
  content = content.replace(/\]\s*\n\s*\}\s*\n\s*\}\s*\n\s*\)/g, (match) => {
    changed = true;
    return ']';
  });
  
  // Fix 10: Fix broken useEffect/useState with arrays
  content = content.replace(/(useEffect|useState|useCallback|useMemo)\([^)]*\n\s*const\s+\w+\s*=\s*\[/g, (match, hook) => {
    changed = true;
    return match.replace(/\n\s*const\s+\w+\s*=\s*\[/, '');
  });
  
  return { content, changed: changed || content !== original };
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Apply all fixes
    const result = fixBrokenPatterns(content);
    content = result.content;
    
    if (result.changed || content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      return { changes: 1 };
    }
    
    return { changes: 0 };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { changes: 0 };
  }
}

function main() {
  const files = findFiles();
  console.log(`Processing ${files.length} files for broken patterns...`);
  
  let totalChanges = 0;
  const processed = [];
  
  for (const file of files) {
    const filePath = path.join(ROOT_DIR, file);
    const { changes } = fixFile(filePath);
    if (changes > 0) {
      processed.push(file);
      totalChanges += changes;
      if (processed.length % 50 === 0) {
        console.log(`Processed ${processed.length} files, ${totalChanges} changes...`);
      }
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Files processed: ${processed.length}`);
  console.log(`Total changes: ${totalChanges}`);
  if (processed.length > 0) {
    console.log(`\nFiles modified:`);
    processed.slice(0, 20).forEach(f => console.log(`  - ${f}`));
    if (processed.length > 20) {
      console.log(`  ... and ${processed.length - 20} more`);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixFile, fixBrokenPatterns };
