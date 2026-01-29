#!/usr/bin/env node

/**
 * Fix missing translation hooks
 * Adds const t = useTranslations(...) where t() is used but not defined
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
  if (filePath.includes('/admin/')) {
    if (filePath.includes('/identity/sso/')) return 'admin.identity.sso';
    if (filePath.includes('/identity/scim/')) return 'admin.identity.scim';
    if (filePath.includes('/identity/')) return 'admin.identity';
    if (filePath.includes('/feedback/')) return 'admin.feedback';
    if (filePath.includes('/plans/')) return 'admin.plans';
    if (filePath.includes('/notifications/')) return 'admin.notifications';
    if (filePath.includes('/nps/')) return 'admin.nps';
    return 'admin';
  } else if (filePath.includes('/dashboard/')) {
    if (filePath.includes('/dashboards/')) return 'dashboard.dashboards';
    if (filePath.includes('/audiences/')) return 'dashboard.audiences';
    if (filePath.includes('/charts/')) return 'dashboard.charts';
    if (filePath.includes('/brand-tracking/')) return 'dashboard.brandTracking';
    if (filePath.includes('/crosstabs/')) return 'dashboard.crosstabs';
    if (filePath.includes('/projects/')) return 'dashboard.projects';
    if (filePath.includes('/workflows/')) return 'dashboard.workflows';
    if (filePath.includes('/settings/')) return 'dashboard.settings';
    return 'dashboard';
  } else if (filePath.includes('/gwi/')) {
    return 'gwi';
  }
  return 'common';
}

function addTranslationHook(content, filePath) {
  // Check if already has useTranslations import
  const hasImport = /from\s+['"]next-intl['"]/.test(content);
  const hasUseTranslations = /useTranslations\(/.test(content);
  
  if (!hasImport) {
    // Add import
    const lastImport = content.lastIndexOf('import');
    if (lastImport !== -1) {
      const nextLine = content.indexOf('\n', lastImport);
      content = content.slice(0, nextLine + 1) + 
        "import { useTranslations } from 'next-intl';\n" +
        content.slice(nextLine + 1);
    }
  } else if (!hasUseTranslations) {
    // Add useTranslations to existing import
    content = content.replace(
      /import\s+.*from\s+['"]next-intl['"]/,
      "import { useTranslations } from 'next-intl'"
    );
  }
  
  // Determine namespace
  const namespace = determineNamespace(filePath);
  
  // Find function start
  const functionMatch = content.match(/(export\s+)?(default\s+)?function\s+\w+/);
  if (functionMatch) {
    const insertPos = content.indexOf('{', functionMatch.index + functionMatch[0].length);
    if (insertPos !== -1) {
      const afterBrace = content.indexOf('\n', insertPos) + 1;
      // Check if t is already defined nearby
      if (!content.slice(afterBrace, afterBrace + 300).includes('const t =')) {
        content = content.slice(0, afterBrace) + 
          `  const t = useTranslations("${namespace}");\n` +
          content.slice(afterBrace);
        return content;
      }
    }
  }
  
  return content;
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if not a client component
    if (!content.includes("'use client'") && !content.includes('"use client"')) {
      return { changes: 0 };
    }
    
    // Check if uses t() but doesn't have const t =
    const usesT = /[^a-zA-Z]t\(/.test(content);
    const hasT = /const\s+t\s*=/.test(content);
    
    if (usesT && !hasT) {
      content = addTranslationHook(content, filePath);
      fs.writeFileSync(filePath, content, 'utf8');
      return { changes: 1 };
    }
    
    return { changes: 0 };
  } catch (error) {
    return { changes: 0 };
  }
}

function main() {
  const files = findFiles();
  console.log(`Processing ${files.length} files for missing translation hooks...`);
  
  let totalChanges = 0;
  const processed = [];
  
  for (const file of files) {
    const filePath = path.join(ROOT_DIR, file);
    const { changes } = fixFile(filePath);
    if (changes > 0) {
      processed.push({ file, changes });
      totalChanges += changes;
      if (processed.length % 50 === 0) {
        console.log(`Processed ${processed.length} files, ${totalChanges} changes...`);
      }
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Files processed: ${processed.length}`);
  console.log(`Total changes: ${totalChanges}`);
}

if (require.main === module) {
  main();
}

module.exports = { fixFile, addTranslationHook };
