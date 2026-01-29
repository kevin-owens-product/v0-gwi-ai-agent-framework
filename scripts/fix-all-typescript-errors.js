#!/usr/bin/env node

/**
 * Fix all TypeScript errors related to missing translation hooks and other issues
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
  let inImportBlock = false;
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed.startsWith('import ')) {
      inImportBlock = true;
      const importMatch = trimmed.match(/import\s+(.*?)\s+from\s+['"](.*?)['"]/);
      if (importMatch) {
        const key = `${importMatch[2]}:${importMatch[1]}`;
        if (seen.has(key)) {
          // Skip duplicate
          continue;
        }
        seen.add(key);
        lastImportIndex = result.length;
      }
      result.push(line);
    } else if (inImportBlock && trimmed === '') {
      result.push(line);
    } else {
      inImportBlock = false;
      result.push(line);
    }
  }
  
  return result.join('\n');
}

function fixDuplicateUseTranslations(content) {
  // Remove duplicate useTranslations imports
  const importRegex = /import\s+.*?useTranslations.*?from\s+['"]next-intl['"]/g;
  const matches = [...content.matchAll(importRegex)];
  
  if (matches.length > 1) {
    // Keep only the first one
    let first = true;
    content = content.replace(importRegex, (match) => {
      if (first) {
        first = false;
        return match;
      }
      return '';
    });
    // Clean up empty lines
    content = content.replace(/\n\n\n+/g, '\n\n');
  }
  
  return content;
}

function moveModuleLevelTCalls(content, filePath) {
  // Find module-level const arrays/objects that use t()
  const moduleLevelPattern = /^const\s+(\w+)\s*=\s*\[[\s\S]*?t\([^)]+\)[\s\S]*?\]/gm;
  const matches = [...content.matchAll(moduleLevelPattern)];
  
  if (matches.length === 0) return content;
  
  // Find the component function
  const componentMatch = content.match(/(export\s+)?(default\s+)?function\s+(\w+)/);
  if (!componentMatch) return content;
  
  const componentStart = componentMatch.index;
  const componentName = componentMatch[3];
  
  // Find where const t = useTranslations is in the component
  const tHookMatch = content.slice(componentStart).match(/const\s+t\s*=\s*useTranslations\(/);
  if (!tHookMatch) return content;
  
  const tHookPos = componentStart + tHookMatch.index;
  const afterTHook = content.indexOf('\n', tHookPos) + 1;
  
  // Move module-level arrays into component
  let moved = false;
  for (const match of matches.reverse()) {
    const varName = match[1];
    const varDef = match[0];
    const varStart = match.index;
    const varEnd = varStart + match[0].length;
    
    // Check if it's already inside a component
    if (varStart > componentStart) continue;
    
    // Remove from module level
    content = content.slice(0, varStart) + content.slice(varEnd);
    
    // Add inside component after t hook
    content = content.slice(0, afterTHook) + 
      `  ${varDef.replace(/^const /, 'const ')}\n` +
      content.slice(afterTHook);
    
    moved = true;
  }
  
  return content;
}

function addMissingTranslationHook(content, filePath) {
  // Check if it's a client component
  const isClient = content.includes("'use client'") || content.includes('"use client"');
  if (!isClient) return content;
  
  // Check if uses t() but doesn't have const t =
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
    // Add useTranslations to existing import
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

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Fix duplicate imports
    content = removeDuplicateImports(content);
    content = fixDuplicateUseTranslations(content);
    
    // Move module-level t() calls into component
    content = moveModuleLevelTCalls(content, filePath);
    
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
