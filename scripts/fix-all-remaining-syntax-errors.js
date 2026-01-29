#!/usr/bin/env node

/**
 * Final comprehensive script to fix all remaining syntax errors
 * Handles: duplicate variables, broken JSX, incomplete function calls, orphaned code
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

function fixBrokenPatterns(content, filePath) {
  let changed = false;
  const original = content;
  
  // Fix 1: Remove orphaned JSX/code after component closing brace
  // Pattern: }\n  >\n  <Select
  const lines = content.split('\n');
  let lastComponentEnd = -1;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    
    // Check if this is a component closing brace
    if (line.trim() === '}' && braceCount === 0 && i > 0) {
      const prevLine = lines[i - 1].trim();
      // Check if previous line ends with ) or } indicating end of return statement
      if (prevLine.endsWith(')') || prevLine.endsWith('}')) {
        lastComponentEnd = i;
      }
    }
  }
  
  // If we found a component end and there's code after it that looks like orphaned JSX
  if (lastComponentEnd > 0 && lastComponentEnd < lines.length - 1) {
    const afterEnd = lines.slice(lastComponentEnd + 1).join('\n');
    // Check if there's JSX-like code after the closing brace
    if (afterEnd.match(/^\s*[<>]/) || afterEnd.match(/^\s*const\s+\w+\s*=\s*\[/)) {
      // Remove everything after the component
      content = lines.slice(0, lastComponentEnd + 1).join('\n');
      changed = true;
    }
  }
  
  // Fix 2: Remove duplicate variable declarations
  const variableDecls = new Map();
  const newLines = [];
  const seenVars = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check for const/let/var declarations
    const varMatch = trimmed.match(/^(const|let|var)\s+(\w+)\s*=/);
    if (varMatch) {
      const varName = varMatch[2];
      if (seenVars.has(varName)) {
        // Skip duplicate
        changed = true;
        continue;
      }
      seenVars.add(varName);
    }
    
    newLines.push(line);
  }
  
  if (changed) {
    content = newLines.join('\n');
  }
  
  // Fix 3: Fix incomplete function calls
  // Pattern: func(\n  const array = [
  content = content.replace(/(\w+\([^)]*)\s*\n\s*const\s+\w+\s*=\s*\[/g, (match, incompleteCall) => {
    changed = true;
    if (!incompleteCall.includes(')')) {
      return incompleteCall + ')\n  const array = [';
    }
    return incompleteCall + '\n  const array = [';
  });
  
  // Fix 4: Fix broken setState calls
  content = content.replace(/(set\w+\([^)]*)\s*\n\s*const\s+\w+\s*=\s*\[/g, (match, setState) => {
    changed = true;
    if (!setState.includes(')')) {
      return setState + ')\n  const array = [';
    }
    return setState + '\n  const array = [';
  });
  
  // Fix 5: Remove arrays inserted in JSX (between > and <)
  content = content.replace(/>\s*\n\s*const\s+\w+\s*=\s*\[[\s\S]*?\]\s*\n\s*</g, (match) => {
    changed = true;
    return '>\n<';
  });
  
  // Fix 6: Fix broken object literals
  // Pattern: { key: value\n  const array = [
  content = content.replace(/(\{[^}]*:\s*[^}]*)\s*\n\s*const\s+\w+\s*=\s*\[/g, (match, objStart) => {
    changed = true;
    return objStart + '}\n  const array = [';
  });
  
  return { content, changed: changed || content !== original };
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Apply all fixes
    const result = fixBrokenPatterns(content, filePath);
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
  console.log(`Processing ${files.length} files for remaining syntax errors...`);
  
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
