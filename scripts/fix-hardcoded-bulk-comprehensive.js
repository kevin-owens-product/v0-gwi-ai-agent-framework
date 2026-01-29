#!/usr/bin/env node

/**
 * Comprehensive hardcoded string fixer
 * Processes all files and fixes hardcoded strings systematically
 * Handles JSX text, object literals, props, and adds translation hooks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const EN_JSON_PATH = path.join(ROOT_DIR, 'messages', 'en.json');

// Load en.json
let enJson = {};
try {
  enJson = JSON.parse(fs.readFileSync(EN_JSON_PATH, 'utf8'));
} catch (e) {
  console.error('Failed to load en.json:', e.message);
  process.exit(1);
}

// Translation keys to add
const keysToAdd = new Set();

function addTranslationKey(namespace, key, value) {
  const fullKey = `${namespace}.${key}`;
  keysToAdd.add(JSON.stringify({ namespace, key, value, fullKey }));
  
  // Add to in-memory structure
  const parts = namespace.split('.');
  let current = enJson;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  const lastPart = parts[parts.length - 1];
  if (!current[lastPart]) {
    current[lastPart] = {};
  }
  current[lastPart][key] = value;
}

function generateKey(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join('_')
    .replace(/^_+|_+$/g, '') || 'text';
}

function sanitizeForKey(text) {
  return text
    .replace(/["']/g, '')
    .trim();
}

function needsTranslationHook(content) {
  return /[^a-zA-Z]t\(/.test(content) && 
         !/const\s+t\s*=/.test(content) && 
         !/await\s+getTranslations/.test(content) &&
         (content.includes("'use client'") || content.includes('"use client"'));
}

function addTranslationHook(content, filePath) {
  // Check if already has useTranslations
  if (/useTranslations\(/.test(content)) {
    // Check if has const t =
    if (!/const\s+t\s*=/.test(content)) {
      // Add const t = useTranslations(...)
      const useTranslationsMatch = content.match(/useTranslations\([^)]+\)/);
      if (useTranslationsMatch) {
        const namespaceMatch = useTranslationsMatch[0].match(/useTranslations\(["']([^"']+)["']\)/);
        const namespace = namespaceMatch ? namespaceMatch[1] : 'common';
        
        // Find where to insert
        const functionMatch = content.match(/(export\s+)?(default\s+)?function\s+\w+/);
        if (functionMatch) {
          const insertPos = content.indexOf('{', functionMatch.index + functionMatch[0].length);
          if (insertPos !== -1) {
            const afterBrace = content.indexOf('\n', insertPos) + 1;
            if (!content.slice(afterBrace, afterBrace + 200).includes('const t =')) {
              content = content.slice(0, afterBrace) + 
                `  const t = useTranslations("${namespace}");\n` +
                content.slice(afterBrace);
            }
          }
        }
      }
    }
    return content;
  }
  
  // Add import
  if (!/from\s+['"]next-intl['"]/.test(content) && (content.includes("'use client'") || content.includes('"use client"'))) {
    const lastImport = content.lastIndexOf('import');
    if (lastImport !== -1) {
      const nextLine = content.indexOf('\n', lastImport);
      content = content.slice(0, nextLine + 1) + 
        "import { useTranslations } from 'next-intl';\n" +
        content.slice(nextLine + 1);
    }
  }
  
  // Determine namespace
  let namespace = 'common';
  if (filePath.includes('/admin/')) {
    if (filePath.includes('/identity/sso/')) namespace = 'admin.identity.sso';
    else if (filePath.includes('/identity/scim/')) namespace = 'admin.identity.scim';
    else if (filePath.includes('/identity/')) namespace = 'admin.identity';
    else if (filePath.includes('/feedback/')) namespace = 'admin.feedback';
    else namespace = 'admin';
  } else if (filePath.includes('/dashboard/')) {
    namespace = 'dashboard';
  } else if (filePath.includes('/gwi/')) {
    namespace = 'gwi';
  }
  
  // Add const t = useTranslations(...)
  const functionMatch = content.match(/(export\s+)?(default\s+)?function\s+\w+/);
  if (functionMatch) {
    const insertPos = content.indexOf('{', functionMatch.index + functionMatch[0].length);
    if (insertPos !== -1) {
      const afterBrace = content.indexOf('\n', insertPos) + 1;
      if (!content.slice(afterBrace, afterBrace + 200).includes('const t =')) {
        content = content.slice(0, afterBrace) + 
          `  const t = useTranslations("${namespace}");\n` +
          content.slice(afterBrace);
      }
    }
  }
  
  return content;
}

function fixHardcodedStrings(content, filePath) {
  let changes = 0;
  const lines = content.split('\n');
  const fixedLines = [];
  
  // Determine namespace
  let namespace = 'common';
  if (filePath.includes('/admin/')) {
    if (filePath.includes('/identity/sso/')) namespace = 'admin.identity.sso';
    else if (filePath.includes('/identity/scim/')) namespace = 'admin.identity.scim';
    else if (filePath.includes('/identity/')) namespace = 'admin.identity';
    else if (filePath.includes('/feedback/')) namespace = 'admin.feedback';
    else namespace = 'admin';
  } else if (filePath.includes('/dashboard/')) {
    namespace = 'dashboard';
  } else if (filePath.includes('/gwi/')) {
    namespace = 'gwi';
  }
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const originalLine = line;
    
    // Skip if already has translation
    if (line.includes('{t(') || line.includes('t("') || line.includes("t('")) {
      fixedLines.push(line);
      continue;
    }
    
    // Fix JSX text: >"Text"<
    const jsxTextMatch = line.match(/>\s*["']([^"']{3,})["']\s*</);
    if (jsxTextMatch) {
      const text = jsxTextMatch[1];
      // Skip if it's a technical string
      if (!/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|\/|#|http)/i.test(text)) {
        const key = generateKey(text);
        const translationKey = `${namespace}.${key}`;
        line = line.replace(/>\s*["']([^"']+)["']\s*</, `>{t("${translationKey}")}<`);
        addTranslationKey(namespace, key, text);
        changes++;
      }
    }
    
    // Fix JSX text between tags: <Tag>Text</Tag>
    // Match pattern: <TagName>text</TagName> where text is user-facing
    const jsxTagTextMatch = line.match(/<(\w+)([^>]*)>([^<>{]+)<\/\1>/);
    if (jsxTagTextMatch && !line.includes('{t(') && !line.includes('{') && !line.includes('className') && !line.includes('onClick')) {
      const tagName = jsxTagTextMatch[1];
      const text = jsxTagTextMatch[3].trim();
      // Skip if it's a technical tag or text
      if (!['code', 'pre', 'script', 'style', 'svg', 'path', 'circle', 'rect', 'img', 'input', 'button', 'a'].includes(tagName.toLowerCase()) &&
          text.length >= 3 && text.length <= 100 &&
          !text.match(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|\/|#|http|className|onClick|e\.g\.|example\.com|-----BEGIN)/i) &&
          !text.includes('{') && !text.includes('}') &&
          /^[A-Z]/.test(text) &&
          !text.match(/^\d+$/) && // Not just numbers
          text.split(' ').length <= 10) { // Not too long
        const key = generateKey(text);
        const translationKey = `${namespace}.${key}`;
        // Escape special regex characters in tagName
        const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        line = line.replace(new RegExp(`<${escapedTagName}([^>]*)>([^<]+)</${escapedTagName}>`), `<${tagName}$1>{t("${translationKey}")}</${tagName}>`);
        addTranslationKey(namespace, key, text);
        changes++;
      }
    }
    
    // Fix JSX text without quotes: >Text< (standalone text between tags)
    if (!line.includes('className') && !line.includes('onClick') && !line.includes('onChange')) {
      const jsxTextMatch2 = line.match(/>\s*([A-Z][a-zA-Z\s]{2,50})\s*</);
      if (jsxTextMatch2 && !line.match(/<[^>]+>/)) {
        const text = jsxTextMatch2[1].trim();
        // Only process if it looks like user-facing text
        if (text.length >= 3 && text.length <= 50 && 
            !text.match(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|\/|#|http|className|onClick)/i) &&
            !text.includes('{') && !text.includes('}')) {
          const key = generateKey(text);
          const translationKey = `${namespace}.${key}`;
          line = line.replace(/>\s*([A-Z][a-zA-Z\s]+)\s*</, (match, text) => {
            return `>{t("${translationKey}")}<`;
          });
          addTranslationKey(namespace, key, text);
          changes++;
        }
      }
    }
    
    // Fix object literal: label: "Text"
    const objLiteralMatch = line.match(/(label|title|description|message|placeholder|name|value|text|content|error|success|warning|info|errorMessage|successMessage):\s*["']([^"']{3,})["']/);
    if (objLiteralMatch) {
      const prop = objLiteralMatch[1];
      const text = objLiteralMatch[2];
      // Skip technical strings
      if (!/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|\/|#|http|true|false|null|undefined)/i.test(text)) {
        const key = generateKey(text);
        const translationKey = `${namespace}.${key}`;
        line = line.replace(new RegExp(`(${prop}):\\s*["']([^"']+)["']`), `$1: t("${translationKey}")`);
        addTranslationKey(namespace, key, text);
        changes++;
      }
    }
    
    // Fix props: placeholder="Text"
    const propMatch = line.match(/(placeholder|title|aria-label|alt|label|description|name|value|text|content|error|success|warning|info|errorMessage|successMessage)=["']([^"']{3,})["']/);
    if (propMatch) {
      const prop = propMatch[1];
      const text = propMatch[2];
      // Skip technical strings
      if (!/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|\/|#|http|true|false|null|undefined|e\.g\.|example\.com)/i.test(text)) {
        const key = generateKey(text);
        const translationKey = `${namespace}.${key}`;
        line = line.replace(new RegExp(`(${prop})=["']([^"']+)["']`), `$1={t("${translationKey}")}`);
        addTranslationKey(namespace, key, text);
        changes++;
      }
    }
    
    // Fix SelectItem: <SelectItem value="X">Text</SelectItem>
    const selectItemMatch = line.match(/<SelectItem[^>]*>([^<]{2,50})<\/SelectItem>/);
    if (selectItemMatch) {
      const text = selectItemMatch[1].trim();
      if (text.length >= 2 && text.length <= 50 && 
          !text.includes('{') && !text.match(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|\/|#|http)/i)) {
        const key = generateKey(text);
        const translationKey = `${namespace}.${key}`;
        line = line.replace(/<SelectItem([^>]*)>([^<]+)<\/SelectItem>/, `<SelectItem$1>{t("${translationKey}")}</SelectItem>`);
        addTranslationKey(namespace, key, text);
        changes++;
      }
    }
    
    fixedLines.push(line);
  }
  
  return { content: fixedLines.join('\n'), changes };
}

function processFile(filePath, verbose = false) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalChanges = 0;
    
    // Skip API routes (they use getTranslations, handled separately)
    if (filePath.includes('/api/')) {
      if (verbose) console.log(`  Skipping ${filePath}: API route (use getTranslations)`);
      return { changes: 0 };
    }
    
    // Note: We'll process both client and server components
    // Server components will need getTranslations, but for now focus on client components
    const isClientComponent = content.includes("'use client'") || content.includes('"use client"');
    
    // Check if file has hardcoded strings by checking for common patterns
    // More permissive pattern to catch JSX text - allow newlines and whitespace
    const hasHardcoded = /<[A-Z]\w+[^>]*>\s*[A-Z][^<>{]{3,}\s*<\/[A-Z]\w+>/.test(content) ||
                        /<[A-Z]\w+[^>]*>[A-Z][a-zA-Z\s]{3,}<\/[A-Z]\w+>/.test(content) ||
                        /(label|title|description|message|placeholder)=["'][^"']{3,}["']/.test(content) ||
                        /(label|title|description|message|placeholder):\s*["'][^"']{3,}["']/.test(content);
    
    if (!hasHardcoded) {
      if (verbose) {
        // Check a sample of the content to see what's there
        const sample = content.substring(0, 500);
        // Also check for specific patterns we know exist
        const hasCardTitle = /<CardTitle>[^<{]+<\/CardTitle>/.test(content);
        console.log(`  Skipping ${filePath}: no hardcoded strings detected`);
        console.log(`    Has CardTitle pattern: ${hasCardTitle}`);
        console.log(`    Sample: ${sample.substring(0, 100)}...`);
      }
      return { changes: 0 };
    }
    
    if (verbose) console.log(`  Processing ${filePath}...`);
    
    // Add translation hook if needed (only for client components)
    if (isClientComponent && needsTranslationHook(content)) {
      content = addTranslationHook(content, filePath);
      totalChanges++;
      if (verbose) console.log(`    Added translation hook`);
    }
    
    // Skip server components for now (they need getTranslations which is async)
    if (!isClientComponent) {
      if (verbose) console.log(`  Skipping ${filePath}: server component (needs getTranslations)`);
      return { changes: 0 };
    }
    
    // Fix hardcoded strings
    const { content: fixedContent, changes } = fixHardcodedStrings(content, filePath);
    content = fixedContent;
    totalChanges += changes;
    if (verbose && changes > 0) console.log(`    Fixed ${changes} hardcoded strings`);
    
    if (totalChanges > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    
    return { changes: totalChanges };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { changes: 0 };
  }
}

function getFilesWithHardcodedStrings() {
  try {
    const output = execSync(
      'npm run i18n:scan 2>&1',
      { cwd: ROOT_DIR, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
    
    const files = new Set();
    const lines = output.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match file paths - handle ANSI color codes
      // Pattern: app/... or components/... (may have color codes)
      // Also check if next line has [JSX], [OBJ], or [PROP]
      const hasHardcoded = i < lines.length - 1 && 
        (lines[i + 1].includes('[JSX]') || lines[i + 1].includes('[OBJ]') || lines[i + 1].includes('[PROP]'));
      
      if (hasHardcoded) {
        // Try to extract file path from current or previous lines
        for (let j = Math.max(0, i - 2); j <= i; j++) {
          const testLine = lines[j];
          // Remove ANSI codes and match file path
          const cleanLine = testLine.replace(/\x1b\[[0-9;]*m/g, '');
          const match = cleanLine.match(/^(app\/[^\s]+|components\/[^\s]+)/);
          if (match) {
            const filePath = match[1];
            if (filePath && (filePath.endsWith('.tsx') || filePath.endsWith('.ts'))) {
              files.add(filePath);
              break;
            }
          }
        }
      }
    }
    
    // If no files found via scanner, use all TSX/TS files
    if (files.size === 0) {
      console.log('No files found in scanner output, processing all TSX/TS files...');
      try {
        const allFiles = execSync(
          'find app components -type f \\( -name "*.tsx" -o -name "*.ts" \\)',
          { cwd: ROOT_DIR, encoding: 'utf8' }
        ).trim().split('\n').filter(f => f);
        allFiles.forEach(f => files.add(f));
      } catch (e) {
        console.error('Failed to find files:', e.message);
      }
    }
    
    return Array.from(files);
  } catch (e) {
    console.error('Failed to get files:', e.message);
    // Fallback: return all TSX/TS files
    try {
      return execSync(
        'find app components -type f \\( -name "*.tsx" -o -name "*.ts" \\)',
        { cwd: ROOT_DIR, encoding: 'utf8' }
      ).trim().split('\n').filter(f => f);
    } catch (e2) {
      return [];
    }
  }
}

function saveEnJson() {
  // Sort keys recursively
  function sortKeys(obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return obj;
    }
    
    const sorted = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = sortKeys(obj[key]);
    });
    return sorted;
  }
  
  enJson = sortKeys(enJson);
  fs.writeFileSync(EN_JSON_PATH, JSON.stringify(enJson, null, 2) + '\n', 'utf8');
}

function main() {
  console.log('Getting files with hardcoded strings...');
  const files = getFilesWithHardcodedStrings();
  console.log(`Found ${files.length} files with hardcoded strings`);
  
  if (files.length === 0) {
    console.log('No files found. Exiting.');
    return;
  }
  
  let totalChanges = 0;
  const processed = [];
  
  // Process files in batches
  const batchSize = 50;
  console.log(`Files to process: ${files.slice(0, 10).join(', ')}...`);
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)}...`);
    
    for (const file of batch) {
      const filePath = path.join(ROOT_DIR, file);
      const verbose = file.includes('scim') || file.includes('identity');
      if (!fs.existsSync(filePath)) {
        if (verbose) console.log(`  File not found: ${filePath}`);
        continue;
      }
      
      const { changes } = processFile(filePath, verbose);
      if (changes > 0) {
        processed.push({ file, changes });
        totalChanges += changes;
      }
    }
    
    console.log(`Processed ${Math.min(i + batchSize, files.length)}/${files.length} files, ${totalChanges} changes so far...`);
  }
  
  // Save en.json
  if (keysToAdd.size > 0) {
    console.log(`\nSaving ${keysToAdd.size} new translation keys to en.json...`);
    saveEnJson();
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Files processed: ${processed.length}`);
  console.log(`Total changes: ${totalChanges}`);
  console.log(`New translation keys added: ${keysToAdd.size}`);
  
  if (processed.length > 0) {
    console.log(`\nTop 10 files with most changes:`);
    processed.sort((a, b) => b.changes - a.changes).slice(0, 10).forEach(({ file, changes }) => {
      console.log(`  ${file}: ${changes} changes`);
    });
  }
}

if (require.main === module) {
  main();
}

module.exports = { processFile, fixHardcodedStrings, addTranslationHook };
