#!/usr/bin/env node

/**
 * Comprehensive script to fix ALL remaining hardcoded strings
 * Processes object literals, form labels, props, and JSX text
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

// Common patterns to replace
const COMMON_REPLACEMENTS = [
  // Object literal labels
  { pattern: /label:\s*["']([^"']+)["']/g, replacement: (match, text) => {
    const key = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).slice(0, 3).join('_') || 'label';
    return `label: t("common.${key}")`;
  }},
  { pattern: /name:\s*["']([^"']+)["']/g, replacement: (match, text) => {
    if (text.length > 20) return match; // Skip long names
    const key = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).slice(0, 3).join('_') || 'name';
    return `name: t("common.${key}")`;
  }},
  { pattern: /description:\s*["']([^"']+)["']/g, replacement: (match, text) => {
    if (text.length > 50) return match; // Skip long descriptions
    const key = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).slice(0, 3).join('_') || 'description';
    return `description: t("common.${key}")`;
  }},
  
  // Placeholder props
  { pattern: /placeholder=["']([^"']+)["']/g, replacement: (match, text) => {
    if (text.length < 4 || text.length > 50) return match;
    const key = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).slice(0, 3).join('_') || 'placeholder';
    return `placeholder={t("common.${key}Placeholder")}`;
  }},
  
  // Title props
  { pattern: /title=["']([^"']+)["']/g, replacement: (match, text) => {
    if (text.length < 4 || text.length > 50) return match;
    const key = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).slice(0, 3).join('_') || 'title';
    return `title={t("common.${key}Title")}`;
  }},
  
  // Alt props
  { pattern: /alt=["']([^"']+)["']/g, replacement: (match, text) => {
    if (text.length < 4 || text.length > 50) return match;
    const key = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).slice(0, 3).join('_') || 'alt';
    return `alt={t("common.${key}Alt")}`;
  }},
];

function findFilesWithHardcodedStrings() {
  try {
    // Use the scanner to find files
    const result = execSync(
      'find app components -type f -name "*.tsx" | head -100',
      { cwd: ROOT_DIR, encoding: 'utf8' }
    );
    return result.trim().split('\n').filter(f => f);
  } catch (e) {
    return [];
  }
}

function needsTranslationHook(content) {
  return /[^a-zA-Z]t\(/.test(content) && !/const\s+t\s*=/.test(content) && !/await\s+getTranslations/.test(content);
}

function addTranslationHook(content, filePath) {
  const isClient = content.includes("'use client'");
  
  if (!isClient) return content;
  
  // Add import if needed
  if (!/from\s+['"]next-intl['"]/.test(content)) {
    const lastImport = content.lastIndexOf('import');
    const nextLine = content.indexOf('\n', lastImport);
    content = content.slice(0, nextLine + 1) + 
      "import { useTranslations } from 'next-intl';\n" +
      content.slice(nextLine + 1);
  } else if (!/useTranslations/.test(content)) {
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
      let namespace = 'common';
      if (filePath.includes('/admin/')) namespace = 'admin';
      else if (filePath.includes('/dashboard/')) namespace = 'dashboard';
      else if (filePath.includes('/gwi/')) namespace = 'gwi';
      
      if (!/const\s+t\s*=/.test(content.slice(afterBrace, afterBrace + 200))) {
        content = content.slice(0, afterBrace) + 
          `  const t = useTranslations("${namespace}");\n` +
          content.slice(afterBrace);
      }
    }
  }
  
  return content;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // Skip if already has translations and no obvious hardcoded strings
  if (!/[>]["'][A-Z][^"']{3,}["']</.test(content) && 
      !/label:\s*["'][A-Z]/.test(content) &&
      !/placeholder=["'][A-Z]/.test(content)) {
    return { content, changes: 0 };
  }
  
  // Add translation hook if needed
  if (needsTranslationHook(content)) {
    content = addTranslationHook(content, filePath);
    changes++;
  }
  
  // Apply common replacements
  for (const { pattern, replacement } of COMMON_REPLACEMENTS) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      changes += matches.length;
    }
  }
  
  return { content, changes };
}

function main() {
  const files = findFilesWithHardcodedStrings();
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
        if (processed.length % 10 === 0) {
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
