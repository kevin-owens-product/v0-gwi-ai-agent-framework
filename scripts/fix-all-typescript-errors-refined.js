#!/usr/bin/env node

/**
 * Refined script to fix TypeScript errors related to missing translation hooks
 * Properly handles module-level arrays without breaking files
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

function determineNamespace(filePath) {
  if (filePath.includes('/admin/integrations/apps/')) return 'admin.integrations.apps';
  if (filePath.includes('/admin/notifications/')) return 'admin.notifications';
  if (filePath.includes('/admin/operations/incidents/')) return 'admin.operations.incidents';
  if (filePath.includes('/admin/operations/maintenance/')) return 'admin.operations.maintenance';
  if (filePath.includes('/admin/operations/releases/')) return 'admin.operations.releases';
  if (filePath.includes('/admin/plans/')) return 'admin.plans';
  if (filePath.includes('/admin/')) return 'admin';
  if (filePath.includes('/dashboard/audiences/')) return 'dashboard.audiences';
  if (filePath.includes('/dashboard/charts/')) return 'dashboard.charts';
  if (filePath.includes('/dashboard/crosstabs/')) return 'dashboard.crosstabs';
  if (filePath.includes('/dashboard/dashboards/')) return 'dashboard.dashboards';
  if (filePath.includes('/dashboard/inbox/')) return 'dashboard.inbox';
  if (filePath.includes('/dashboard/playground/')) return 'dashboard.playground';
  if (filePath.includes('/dashboard/projects/')) return 'dashboard.projects';
  if (filePath.includes('/dashboard/store/')) return 'dashboard.store';
  if (filePath.includes('/dashboard/workflows/')) return 'dashboard.workflows';
  if (filePath.includes('/dashboard/')) return 'dashboard';
  if (filePath.includes('/docs/')) return 'docs';
  if (filePath.includes('/gwi/')) return 'gwi';
  return 'common';
}

function removeDuplicateImports(content) {
  const lines = content.split('\n');
  const seen = new Set();
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed.startsWith('import ')) {
      const importMatch = trimmed.match(/import\s+(.*?)\s+from\s+['"](.*?)['"]/);
      if (importMatch) {
        const key = `${importMatch[2]}:${importMatch[1]}`;
        if (seen.has(key)) {
          // Skip duplicate
          continue;
        }
        seen.add(key);
      }
    }
    result.push(line);
  }
  
  return result.join('\n');
}

function fixDuplicateUseTranslations(content) {
  const importRegex = /import\s+.*?useTranslations.*?from\s+['"]next-intl['"]/g;
  const matches = [...content.matchAll(importRegex)];
  
  if (matches.length > 1) {
    let first = true;
    content = content.replace(importRegex, (match) => {
      if (first) {
        first = false;
        return match;
      }
      return '';
    });
    content = content.replace(/\n\n\n+/g, '\n\n');
  }
  
  return content;
}

function findModuleLevelArrays(content) {
  const lines = content.split('\n');
  const arrays = [];
  let inArray = false;
  let arrayStart = -1;
  let arrayName = '';
  let arrayLines = [];
  let braceCount = 0;
  let bracketCount = 0;
  
  // Find first function/component declaration
  let firstFunctionIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/^(export\s+)?(default\s+)?function\s+\w+/)) {
      firstFunctionIndex = i;
      break;
    }
  }
  
  if (firstFunctionIndex === -1) return [];
  
  // Find module-level const arrays that use t()
  for (let i = 0; i < firstFunctionIndex; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if this is the start of a const array
    const constMatch = trimmed.match(/^const\s+(\w+)\s*=\s*\[/);
    if (constMatch && !inArray) {
      inArray = true;
      arrayStart = i;
      arrayName = constMatch[1];
      arrayLines = [line];
      bracketCount = (line.match(/\[/g) || []).length - (line.match(/\]/g) || []).length;
      braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      continue;
    }
    
    if (inArray) {
      arrayLines.push(line);
      bracketCount += (line.match(/\[/g) || []).length - (line.match(/\]/g) || []).length;
      braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      
      // Check if array is closed
      if (bracketCount === 0 && braceCount === 0) {
        const arrayContent = arrayLines.join('\n');
        // Only include if it uses t()
        if (/[^a-zA-Z]t\(/.test(arrayContent)) {
          arrays.push({
            name: arrayName,
            startLine: arrayStart,
            endLine: i,
            content: arrayContent,
            indentedContent: arrayLines.map(l => '  ' + l).join('\n')
          });
        }
        inArray = false;
        arrayLines = [];
      }
    }
  }
  
  return arrays;
}

function moveModuleLevelArrays(content, filePath) {
  const arrays = findModuleLevelArrays(content);
  if (arrays.length === 0) return content;
  
  const lines = content.split('\n');
  
  // Find component function
  let componentStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().match(/^(export\s+)?(default\s+)?function\s+\w+/)) {
      componentStart = i;
      break;
    }
  }
  
  if (componentStart === -1) return content;
  
  // Find where const t = useTranslations is
  let tHookLine = -1;
  for (let i = componentStart; i < lines.length; i++) {
    if (lines[i].trim().match(/const\s+t\s*=\s*useTranslations\(/)) {
      tHookLine = i;
      break;
    }
  }
  
  if (tHookLine === -1) return content;
  
  // Insert arrays after t hook
  const insertLine = tHookLine + 1;
  
  // Remove arrays from module level (in reverse order to preserve indices)
  let newLines = [...lines];
  for (let i = arrays.length - 1; i >= 0; i--) {
    const arr = arrays[i];
    // Remove the array
    newLines.splice(arr.startLine, arr.endLine - arr.startLine + 1);
    // Adjust insert position if needed
    if (arr.endLine < insertLine) {
      // Insert after t hook (adjusted for removed lines)
      const adjustedInsert = insertLine - (arr.endLine - arr.startLine + 1);
      newLines.splice(adjustedInsert, 0, arr.indentedContent);
    } else {
      // Insert at original position
      newLines.splice(insertLine, 0, arr.indentedContent);
    }
  }
  
  return newLines.join('\n');
}

function addMissingTranslationHook(content, filePath) {
  const isClient = content.includes("'use client'") || content.includes('"use client"');
  if (!isClient) return content;
  
  const usesT = /[^a-zA-Z]t\(/.test(content);
  const hasT = /const\s+t\s*=\s*useTranslations\(/.test(content);
  
  if (!usesT || hasT) return content;
  
  // Add import if needed
  if (!/from\s+['"]next-intl['"]/.test(content)) {
    const lastImport = content.lastIndexOf('import');
    if (lastImport !== -1) {
      const nextLine = content.indexOf('\n', lastImport);
      content = content.slice(0, nextLine + 1) + 
        "import { useTranslations } from 'next-intl';\n" +
        content.slice(nextLine + 1);
    }
  } else if (!/useTranslations/.test(content)) {
    content = content.replace(
      /import\s+(\{[^}]*\})\s+from\s+['"]next-intl['"]/,
      (match, imports) => {
        if (!imports.includes('useTranslations')) {
          return match.replace(imports, imports.replace('}', ', useTranslations }'));
        }
        return match;
      }
    );
  }
  
  // Find component function
  const functionMatch = content.match(/(export\s+)?(default\s+)?function\s+\w+/);
  if (!functionMatch) return content;
  
  const insertPos = content.indexOf('{', functionMatch.index + functionMatch[0].length);
  if (insertPos === -1) return content;
  
  const afterBrace = content.indexOf('\n', insertPos) + 1;
  
  // Check if t is already defined nearby
  if (content.slice(afterBrace, afterBrace + 300).includes('const t =')) {
    return content;
  }
  
  const namespace = determineNamespace(filePath);
  content = content.slice(0, afterBrace) + 
    `  const t = useTranslations("${namespace}");\n` +
    content.slice(afterBrace);
  
  return content;
}

function fixBrokenFiles(content) {
  // Fix common broken patterns from previous script runs
  
  // Fix broken catch blocks: } catch (err) { ... } const array = [
  const brokenCatchPattern = /(\}\s*catch\s*\([^)]+\)\s*\{[^}]*\})\s*const\s+\w+\s*=\s*\[/g;
  content = content.replace(brokenCatchPattern, (match, catchBlock) => {
    return catchBlock + '\n    } finally {\n      setIsLoading(false)\n    }\n  }\n\n  const array = [';
  });
  
  // Fix broken function declarations: const [state, setState] = useState(...) const array = [
  const brokenStatePattern = /(const\s+\[\w+,\s*set\w+\]\s*=\s*useState\([^)]*\))\s*const\s+\w+\s*=\s*\[/g;
  content = content.replace(brokenStatePattern, (match, stateDecl) => {
    return stateDecl + '\n\n  const array = [';
  });
  
  // Fix broken object properties: }, }), }) const array = [
  const brokenObjectPattern = /(\},\s*\}\),\s*\}\))\s*const\s+\w+\s*=\s*\[/g;
  content = content.replace(brokenObjectPattern, (match, objClose) => {
    return objClose + '\n\n  const array = [';
  });
  
  // Fix duplicate component declarations
  const componentPattern = /(export\s+(default\s+)?function\s+\w+[^}]*\{)/g;
  const matches = [...content.matchAll(componentPattern)];
  if (matches.length > 1) {
    // Keep only the first one, remove duplicates
    let first = true;
    content = content.replace(componentPattern, (match) => {
      if (first) {
        first = false;
        return match;
      }
      return '';
    });
  }
  
  return content;
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Fix broken files first
    content = fixBrokenFiles(content);
    
    // Fix duplicate imports
    content = removeDuplicateImports(content);
    content = fixDuplicateUseTranslations(content);
    
    // Move module-level arrays (only if file is not already broken)
    if (!content.includes('const [state') || !content.match(/const\s+\w+\s*=\s*\[.*\]\s*const\s+\[/)) {
      content = moveModuleLevelArrays(content, filePath);
    }
    
    // Add missing translation hooks
    content = addMissingTranslationHook(content, filePath);
    
    if (content !== original) {
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
  console.log(`Processing ${files.length} files for TypeScript errors...`);
  
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

module.exports = { fixFile };
