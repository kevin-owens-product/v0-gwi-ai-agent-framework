#!/usr/bin/env node

/**
 * Batch processor for hardcoded strings
 * Processes files in batches and applies comprehensive fixes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

// Get list of hardcoded strings from scanner
function getHardcodedStrings() {
  try {
    const output = execSync(
      'npm run i18n:scan 2>&1',
      { cwd: ROOT_DIR, encoding: 'utf8' }
    );
    
    const findings = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      const match = line.match(/L(\d+)\s+\[(JSX|OBJ|PROP)\]\s+"([^"]+)"/);
      if (match) {
        findings.push({
          line: parseInt(match[1]),
          type: match[2],
          text: match[3],
          file: line.match(/app\/[^\s]+|components\/[^\s]+/)?.[0]
        });
      }
    }
    
    return findings;
  } catch (e) {
    return [];
  }
}

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

function needsTranslationHook(content) {
  return /[^a-zA-Z]t\(/.test(content) && !/const\s+t\s*=/.test(content) && !/await\s+getTranslations/.test(content);
}

function addTranslationHook(content, filePath) {
  const isClient = content.includes("'use client'");
  if (!isClient) return content;
  
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

function generateKey(text, context) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join('_') || 'text';
}

function fixHardcodedString(content, filePath, finding) {
  const lines = content.split('\n');
  const lineIndex = finding.line - 1;
  
  if (lineIndex < 0 || lineIndex >= lines.length) return content;
  
  const line = lines[lineIndex];
  let namespace = 'common';
  if (filePath.includes('/admin/')) namespace = 'admin';
  else if (filePath.includes('/dashboard/')) namespace = 'dashboard';
  else if (filePath.includes('/gwi/')) namespace = 'gwi';
  
  const key = generateKey(finding.text, finding.type);
  const translationKey = `${namespace}.${key}`;
  
  let newLine = line;
  
  if (finding.type === 'JSX') {
    // Replace JSX text: >Text< -> {t("key")}
    newLine = newLine.replace(
      new RegExp(`>${finding.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<`, 'g'),
      `>{t("${translationKey}")}<`
    );
  } else if (finding.type === 'PROP') {
    // Replace prop: title="Text" -> title={t("key")}
    const propMatch = line.match(/(\w+)=["']([^"']+)["']/);
    if (propMatch && propMatch[2] === finding.text) {
      newLine = newLine.replace(
        `${propMatch[1]}="${finding.text}"`,
        `${propMatch[1]}={t("${translationKey}")}`
      );
    }
  } else if (finding.type === 'OBJ') {
    // Replace object literal: label: "Text" -> label: t("key")
    newLine = newLine.replace(
      new RegExp(`:\\s*["']${finding.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'g'),
      `: t("${translationKey}")`
    );
  }
  
  if (newLine !== line) {
    lines[lineIndex] = newLine;
    return lines.join('\n');
  }
  
  return content;
}

function fixFile(filePath, findings) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  const fileFindings = findings.filter(f => f.file && filePath.includes(f.file));
  
  if (fileFindings.length === 0) return { content, changes: 0 };
  
  // Add translation hook if needed
  if (needsTranslationHook(content)) {
    content = addTranslationHook(content, filePath);
    changes++;
  }
  
  // Fix each finding
  for (const finding of fileFindings) {
    const newContent = fixHardcodedString(content, filePath, finding);
    if (newContent !== content) {
      content = newContent;
      changes++;
    }
  }
  
  return { content, changes };
}

function main() {
  console.log('Scanning for hardcoded strings...');
  const findings = getHardcodedStrings();
  console.log(`Found ${findings.length} hardcoded strings`);
  
  const files = findFiles();
  console.log(`Processing ${files.length} files...`);
  
  let totalChanges = 0;
  const processed = [];
  
  for (const file of files) {
    const filePath = path.join(ROOT_DIR, file);
    try {
      const { content, changes } = fixFile(filePath, findings);
      if (changes > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        processed.push({ file, changes });
        totalChanges += changes;
        if (processed.length % 20 === 0) {
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
