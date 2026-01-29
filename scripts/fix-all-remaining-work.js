#!/usr/bin/env node

/**
 * Comprehensive fix for ALL remaining work:
 * 1. Remove unused imports (TypeScript warnings)
 * 2. Fix hardcoded strings (JSX text, props, object literals)
 * 3. Add missing translation hooks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

// Common hardcoded strings to replace
const COMMON_JSX_REPLACEMENTS = [
  { pattern: />Overview</g, replacement: '>{t("common.overview")}<' },
  { pattern: />Status</g, replacement: '>{t("common.status")}<' },
  { pattern: />Created</g, replacement: '>{t("common.created")}<' },
  { pattern: />Action</g, replacement: '>{t("common.action")}<' },
  { pattern: />Organization</g, replacement: '>{t("common.organization")}<' },
  { pattern: />Activity</g, replacement: '>{t("common.activity")}<' },
  { pattern: />History</g, replacement: '>{t("common.history")}<' },
  { pattern: />Details</g, replacement: '>{t("common.details")}<' },
  { pattern: />Settings</g, replacement: '>{t("common.settings")}<' },
  { pattern: />Endpoint</g, replacement: '>{t("common.endpoint")}<' },
  { pattern: />Boolean</g, replacement: '>{t("common.boolean")}<' },
  { pattern: />String</g, replacement: '>{t("common.string")}<' },
  { pattern: />Number</g, replacement: '>{t("common.number")}<' },
  { pattern: />Rollout</g, replacement: '>{t("common.rollout")}<' },
  { pattern: />All Plans</g, replacement: '>{t("common.allPlans")}<' },
  { pattern: />Allowed Plans</g, replacement: '>{t("common.allowedPlans")}<' },
  { pattern: />Allowed Organizations</g, replacement: '>{t("common.allowedOrganizations")}<' },
  { pattern: />Blocked Organizations</g, replacement: '>{t("common.blockedOrganizations")}<' },
  { pattern: />Change History</g, replacement: '>{t("common.changeHistory")}<' },
  { pattern: />No history available</g, replacement: '>{t("common.noHistoryAvailable")}<' },
  { pattern: />Feedback Details</g, replacement: '>{t("common.feedbackDetails")}<' },
  { pattern: />Related Feedback</g, replacement: '>{t("common.relatedFeedback")}<' },
  { pattern: />Feedback received</g, replacement: '>{t("common.feedbackReceived")}<' },
  { pattern: />Response sent</g, replacement: '>{t("common.responseSent")}<' },
  { pattern: />Last updated</g, replacement: '>{t("common.lastUpdated")}<' },
  { pattern: />Rollout Percentage</g, replacement: '>{t("common.rolloutPercentage")}<' },
  { pattern: />Flag Configuration</g, replacement: '>{t("common.flagConfiguration")}<' },
  { pattern: />Allowed Orgs</g, replacement: '>{t("common.allowedOrgs")}<' },
  { pattern: />Blocked Orgs</g, replacement: '>{t("common.blockedOrgs")}<' },
  { pattern: />Targeting</g, replacement: '>{t("common.targeting")}<' },
  { pattern: />SCIM integration not found</g, replacement: '>{t("common.scimIntegrationNotFound")}<' },
  { pattern: />Feature flag not found</g, replacement: '>{t("common.featureFlagNotFound")}<' },
  { pattern: />Users Provisioned</g, replacement: '>{t("common.usersProvisioned")}<' },
  { pattern: />Users Synced</g, replacement: '>{t("common.usersSynced")}<' },
  { pattern: />Groups Synced</g, replacement: '>{t("common.groupsSynced")}<' },
  { pattern: />Organization Details</g, replacement: '>{t("common.organizationDetails")}<' },
];

// Object literal error messages
const ERROR_MESSAGE_REPLACEMENTS = [
  { pattern: /message:\s*["']Failed to create child organization["']/g, replacement: 'message: t("errors.failedToCreateChildOrganization")' },
  { pattern: /message:\s*["']Failed to create relationship["']/g, replacement: 'message: t("errors.failedToCreateRelationship")' },
  { pattern: /message:\s*["']Failed to move organization["']/g, replacement: 'message: t("errors.failedToMoveOrganization")' },
  { pattern: /message:\s*["']Failed to update relationship["']/g, replacement: 'message: t("errors.failedToUpdateRelationship")' },
  { pattern: /message:\s*["']Failed to send test email["']/g, replacement: 'message: t("errors.failedToSendTestEmail")' },
];

// Prop replacements
const PROP_REPLACEMENTS = [
  { pattern: /title=["']Delete SCIM Integration["']/g, replacement: 'title={t("dialogs.deleteScimIntegration")}' },
  { pattern: /title=["']Regenerate Token["']/g, replacement: 'title={t("dialogs.regenerateToken")}' },
];

function findFiles() {
  try {
    return execSync(
      'find app components -type f \\( -name "*.tsx" -o -name "*.ts" \\) | head -1000',
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

function removeUnusedImports(content) {
  let changes = 0;
  
  // Remove unused toast import
  if (/import.*toast.*from.*sonner/.test(content) && !/toast\.(error|success|loading|info|warning|dismiss|promise)/.test(content)) {
    content = content.replace(/import\s+\{\s*toast[^}]*\}\s+from\s+['"]sonner['"];?\s*\n/g, '');
    content = content.replace(/import\s+toast\s+from\s+['"]sonner['"];?\s*\n/g, '');
    changes++;
  }
  
  // Remove unused useEffect
  if (/import.*useEffect.*from.*react/.test(content) && !/useEffect\(/.test(content)) {
    content = content.replace(/,\s*useEffect/g, '');
    content = content.replace(/useEffect\s*,/g, '');
    content = content.replace(/import\s+\{\s*useEffect\s*\}\s+from\s+['"]react['"];?\s*\n/g, '');
    changes++;
  }
  
  // Remove unused showSuccessToast
  if (/import.*showSuccessToast/.test(content) && !/showSuccessToast\(/.test(content)) {
    content = content.replace(/,\s*showSuccessToast/g, '');
    content = content.replace(/showSuccessToast\s*,/g, '');
    const match = content.match(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]@\/lib\/toast-utils['"]/);
    if (match) {
      const imports = match[1].split(',').map(i => i.trim()).filter(i => i !== 'showSuccessToast');
      if (imports.length === 0) {
        content = content.replace(/import\s+\{\s*[^}]+\s*\}\s+from\s+['"]@\/lib\/toast-utils['"];?\s*\n/g, '');
      } else {
        content = content.replace(/import\s+\{\s*[^}]+\s*\}\s+from\s+['"]@\/lib\/toast-utils['"]/, `import { ${imports.join(', ')} } from '@/lib/toast-utils'`);
      }
      changes++;
    }
  }
  
  // Remove unused tCommon
  if (/const\s+tCommon\s*=/.test(content) && !/tCommon\(/.test(content)) {
    content = content.replace(/const\s+tCommon\s*=\s*useTranslations\([^)]+\);\s*\n/g, '');
    changes++;
  }
  
  return { content, changes };
}

function fixHardcodedStrings(content, filePath) {
  let changes = 0;
  
  // Apply JSX text replacements
  for (const { pattern, replacement } of COMMON_JSX_REPLACEMENTS) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changes++;
    }
  }
  
  // Apply error message replacements
  for (const { pattern, replacement } of ERROR_MESSAGE_REPLACEMENTS) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changes++;
    }
  }
  
  // Apply prop replacements
  for (const { pattern, replacement } of PROP_REPLACEMENTS) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changes++;
    }
  }
  
  return { content, changes };
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let totalChanges = 0;
  
  // Step 1: Remove unused imports
  const { content: content1, changes: changes1 } = removeUnusedImports(content);
  content = content1;
  totalChanges += changes1;
  
  // Step 2: Add translation hook if needed
  if (needsTranslationHook(content)) {
    content = addTranslationHook(content, filePath);
    totalChanges++;
  }
  
  // Step 3: Fix hardcoded strings
  const { content: content2, changes: changes2 } = fixHardcodedStrings(content, filePath);
  content = content2;
  totalChanges += changes2;
  
  return { content, changes: totalChanges };
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
