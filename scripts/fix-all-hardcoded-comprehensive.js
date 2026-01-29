#!/usr/bin/env node

/**
 * Comprehensive hardcoded string fixer
 * Processes all files and fixes hardcoded strings systematically
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

// Get scanner output to identify files with hardcoded strings
function getFilesWithHardcodedStrings() {
  try {
    const output = execSync(
      'npm run i18n:scan 2>&1',
      { cwd: ROOT_DIR, encoding: 'utf8' }
    );
    
    const files = new Set();
    const lines = output.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(app\/[^\s]+|components\/[^\s]+)/);
      if (match) {
        files.add(match[1]);
      }
    }
    
    return Array.from(files);
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

function generateKey(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join('_') || 'text';
}

// Comprehensive replacement patterns
const REPLACEMENTS = [
  // Common JSX text
  { pattern: />Recent changes to this feature flag</g, replacement: '>{t("common.recentChangesToFeatureFlag")}<' },
  { pattern: />Members</g, replacement: '>{t("common.members")}<' },
  { pattern: />Last Sync</g, replacement: '>{t("common.lastSync")}<' },
  { pattern: />Linked SSO Configuration</g, replacement: '>{t("common.linkedSsoConfiguration")}<' },
  { pattern: />Provider</g, replacement: '>{t("common.provider")}<' },
  { pattern: />SCIM Endpoint Configuration</g, replacement: '>{t("common.scimEndpointConfiguration")}<' },
  { pattern: />SCIM Base URL</g, replacement: '>{t("common.scimBaseUrl")}<' },
  { pattern: />Bearer Token</g, replacement: '>{t("common.bearerToken")}<' },
  { pattern: />Supported Endpoints</g, replacement: '>{t("common.supportedEndpoints")}<' },
  { pattern: />GET \/Users</g, replacement: '>{t("common.getUsers")}<' },
  { pattern: />List users</g, replacement: '>{t("common.listUsers")}<' },
  { pattern: />POST \/Users</g, replacement: '>{t("common.postUsers")}<' },
  { pattern: />Create user</g, replacement: '>{t("common.createUser")}<' },
  { pattern: />GET \/Users\/:id</g, replacement: '>{t("common.getUserById")}<' },
  { pattern: />Get user</g, replacement: '>{t("common.getUser")}<' },
  { pattern: />PUT \/Users\/:id</g, replacement: '>{t("common.putUserById")}<' },
  { pattern: />Update user</g, replacement: '>{t("common.updateUser")}<' },
  { pattern: />PATCH \/Users\/:id</g, replacement: '>{t("common.patchUserById")}<' },
  { pattern: />Patch user</g, replacement: '>{t("common.patchUser")}<' },
  { pattern: />DELETE \/Users\/:id</g, replacement: '>{t("common.deleteUserById")}<' },
  { pattern: />Delete user</g, replacement: '>{t("common.deleteUser")}<' },
  { pattern: />GET \/Groups</g, replacement: '>{t("common.getGroups")}<' },
  { pattern: />List groups</g, replacement: '>{t("common.listGroups")}<' },
  { pattern: />POST \/Groups</g, replacement: '>{t("common.postGroups")}<' },
  { pattern: />Create group</g, replacement: '>{t("common.createGroup")}<' },
  { pattern: />GET \/Groups\/:id</g, replacement: '>{t("common.getGroupById")}<' },
  { pattern: />Get group</g, replacement: '>{t("common.getGroup")}<' },
  { pattern: />PUT \/Groups\/:id</g, replacement: '>{t("common.putGroupById")}<' },
  { pattern: />Update group</g, replacement: '>{t("common.updateGroup")}<' },
  { pattern: />DELETE \/Groups\/:id</g, replacement: '>{t("common.deleteGroupById")}<' },
  { pattern: />Delete group</g, replacement: '>{t("common.deleteGroup")}<' },
  { pattern: />Sync Settings</g, replacement: '>{t("common.syncSettings")}<' },
  { pattern: />Default Role</g, replacement: '>{t("common.defaultRole")}<' },
  { pattern: />Viewer</g, replacement: '>{t("common.viewer")}<' },
  { pattern: />Member</g, replacement: '>{t("common.member")}<' },
  { pattern: />New Bearer Token Generated</g, replacement: '>{t("common.newBearerTokenGenerated")}<' },
  
  // Object literal error messages
  { pattern: /message:\s*["']Failed to create child organization["']/g, replacement: 'message: t("errors.failedToCreateChildOrganization")' },
  { pattern: /message:\s*["']Failed to create relationship["']/g, replacement: 'message: t("errors.failedToCreateRelationship")' },
  { pattern: /message:\s*["']Failed to move organization["']/g, replacement: 'message: t("errors.failedToMoveOrganization")' },
  { pattern: /message:\s*["']Failed to update relationship["']/g, replacement: 'message: t("errors.failedToUpdateRelationship")' },
  { pattern: /message:\s*["']Failed to send test email["']/g, replacement: 'message: t("errors.failedToSendTestEmail")' },
  
  // Prop replacements
  { pattern: /title=["']Delete SCIM Integration["']/g, replacement: 'title={t("dialogs.deleteScimIntegration")}' },
  { pattern: /description=["']Are you sure you want to delete this SCIM integration\?/g, replacement: 'description={t("dialogs.deleteScimIntegrationDescription")}' },
  { pattern: /title=["']Regenerate Token["']/g, replacement: 'title={t("dialogs.regenerateToken")}' },
  { pattern: /description=["']Are you sure you want to regenerate the token\?/g, replacement: 'description={t("dialogs.regenerateTokenDescription")}' },
];

function fixHardcodedStrings(content, filePath) {
  let changes = 0;
  
  for (const { pattern, replacement } of REPLACEMENTS) {
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
  
  // Add translation hook if needed
  if (needsTranslationHook(content)) {
    content = addTranslationHook(content, filePath);
    totalChanges++;
  }
  
  // Fix hardcoded strings
  const { content: content2, changes: changes2 } = fixHardcodedStrings(content, filePath);
  content = content2;
  totalChanges += changes2;
  
  return { content, changes: totalChanges };
}

function main() {
  const filesWithHardcoded = getFilesWithHardcodedStrings();
  console.log(`Found ${filesWithHardcoded.length} files with hardcoded strings`);
  
  // Process files with hardcoded strings first
  let totalChanges = 0;
  const processed = [];
  
  for (const file of filesWithHardcoded) {
    const filePath = path.join(ROOT_DIR, file);
    try {
      const { content, changes } = fixFile(filePath);
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
