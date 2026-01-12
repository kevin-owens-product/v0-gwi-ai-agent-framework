#!/usr/bin/env node

/**
 * Script to add tracking to all page files
 *
 * This script automatically adds the PageTracker component to all pages
 * that don't already have tracking implemented.
 *
 * Usage: node scripts/add-tracking-to-pages.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Page name mappings from path to human-readable name
const PAGE_NAMES = {
  '/dashboard/page.tsx': 'Dashboard Home',
  '/dashboard/agents/page.tsx': 'Agents List',
  '/dashboard/agents/new/page.tsx': 'New Agent',
  '/dashboard/agents/[id]/page.tsx': 'Agent Detail',
  '/dashboard/workflows/page.tsx': 'Workflows List',
  '/dashboard/workflows/new/page.tsx': 'New Workflow',
  '/dashboard/workflows/[id]/page.tsx': 'Workflow Detail',
  '/dashboard/workflows/[id]/edit/page.tsx': 'Edit Workflow',
  '/dashboard/reports/page.tsx': 'Reports List',
  '/dashboard/reports/new/page.tsx': 'New Report',
  '/dashboard/reports/[id]/page.tsx': 'Report Viewer',
  '/dashboard/reports/[id]/edit/page.tsx': 'Edit Report',
  '/dashboard/audiences/page.tsx': 'Audiences List',
  '/dashboard/audiences/new/page.tsx': 'New Audience',
  '/dashboard/audiences/[id]/page.tsx': 'Audience Detail',
  '/dashboard/crosstabs/page.tsx': 'Crosstabs List',
  '/dashboard/crosstabs/new/page.tsx': 'New Crosstab',
  '/dashboard/crosstabs/[id]/page.tsx': 'Crosstab Detail',
  '/dashboard/crosstabs/analysis/page.tsx': 'Crosstab Analysis',
  '/dashboard/charts/page.tsx': 'Charts List',
  '/dashboard/charts/new/page.tsx': 'New Chart',
  '/dashboard/charts/[id]/page.tsx': 'Chart Detail',
  '/dashboard/dashboards/page.tsx': 'Dashboards List',
  '/dashboard/dashboards/new/page.tsx': 'New Dashboard',
  '/dashboard/dashboards/[id]/page.tsx': 'Dashboard Detail',
  '/dashboard/dashboards/builder/page.tsx': 'Dashboard Builder',
  '/dashboard/brand-tracking/page.tsx': 'Brand Tracking List',
  '/dashboard/brand-tracking/new/page.tsx': 'New Brand Tracking',
  '/dashboard/brand-tracking/[id]/page.tsx': 'Brand Tracking Detail',
  '/dashboard/analytics/page.tsx': 'Analytics',
  '/dashboard/playground/page.tsx': 'Playground',
  '/dashboard/inbox/page.tsx': 'Inbox',
  '/dashboard/insights/page.tsx': 'Insights List',
  '/dashboard/insights/[id]/page.tsx': 'Insight Detail',
  '/dashboard/memory/page.tsx': 'Memory Browser',
  '/dashboard/integrations/page.tsx': 'Integrations',
  '/dashboard/store/page.tsx': 'Agent Store',
  '/dashboard/store/[id]/page.tsx': 'Agent Store Detail',
  '/dashboard/templates/page.tsx': 'Templates',
  '/dashboard/teams/page.tsx': 'Teams',
  '/dashboard/projects/page.tsx': 'Projects List',
  '/dashboard/projects/[id]/page.tsx': 'Project Detail',
  '/dashboard/notifications/page.tsx': 'Notifications',
  '/dashboard/help/page.tsx': 'Help & Support',
  '/dashboard/settings/page.tsx': 'Settings',
  '/dashboard/settings/general/page.tsx': 'General Settings',
  '/dashboard/settings/profile/page.tsx': 'Profile Settings',
  '/dashboard/settings/appearance/page.tsx': 'Appearance Settings',
  '/dashboard/settings/team/page.tsx': 'Team Settings',
  '/dashboard/settings/billing/page.tsx': 'Billing Settings',
  '/dashboard/settings/api-keys/page.tsx': 'API Keys',
  '/dashboard/settings/security/page.tsx': 'Security Settings',
  '/dashboard/settings/notifications/page.tsx': 'Notification Settings',
  '/dashboard/settings/audit-log/page.tsx': 'Audit Log',
};

function getPageName(filePath) {
  // Convert absolute path to relative path from app directory
  const relativePath = filePath.replace(/.*\/app/, '');
  return PAGE_NAMES[relativePath] || 'Unknown Page';
}

function hasTracking(content) {
  // Check if file already has tracking
  return content.includes('usePageViewTracking') ||
         content.includes('PageTracker') ||
         content.includes('@/hooks/useEventTracking');
}

function isClientComponent(content) {
  return content.includes('"use client"') || content.includes("'use client'");
}

function addClientDirective(content) {
  // Add "use client" at the top if not present
  if (!isClientComponent(content)) {
    return '"use client"\n\n' + content;
  }
  return content;
}

function addTrackingImport(content) {
  // Find the last import statement
  const importRegex = /^import .* from ['"].*['"];?$/gm;
  const imports = content.match(importRegex);

  if (imports) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length + 1;

    const trackingImport = "\nimport { PageTracker } from '@/components/tracking/PageTracker';";
    return content.slice(0, insertPosition) + trackingImport + content.slice(insertPosition);
  }

  // If no imports, add at the beginning after "use client"
  const clientDirectiveMatch = content.match(/['"]use client['"]\s*\n/);
  if (clientDirectiveMatch) {
    const insertPosition = clientDirectiveMatch.index + clientDirectiveMatch[0].length;
    return content.slice(0, insertPosition) +
           "\nimport { PageTracker } from '@/components/tracking/PageTracker';\n" +
           content.slice(insertPosition);
  }

  return content;
}

function addTrackerComponent(content, pageName) {
  // Find the return statement in the default export
  const returnMatch = content.match(/export default function .*?\{[\s\S]*?return \(/);

  if (returnMatch) {
    const insertPosition = returnMatch.index + returnMatch[0].length;
    const tracker = `\n      <PageTracker pageName="${pageName}" />`;
    return content.slice(0, insertPosition) + tracker + content.slice(insertPosition);
  }

  return content;
}

async function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has tracking
    if (hasTracking(content)) {
      console.log(`✓ ${filePath} - Already has tracking`);
      return { processed: false, reason: 'already-tracked' };
    }

    // Skip if it's a server component (for now)
    if (!isClientComponent(content)) {
      console.log(`⚠ ${filePath} - Server component, skipping`);
      return { processed: false, reason: 'server-component' };
    }

    const pageName = getPageName(filePath);

    // Add tracking import
    content = addTrackingImport(content);

    // Add tracker component
    content = addTrackerComponent(content, pageName);

    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');

    console.log(`✓ ${filePath} - Added tracking: "${pageName}"`);
    return { processed: true, pageName };

  } catch (error) {
    console.error(`✗ ${filePath} - Error: ${error.message}`);
    return { processed: false, reason: 'error', error: error.message };
  }
}

async function main() {
  console.log('🔍 Finding all page files...\n');

  // Find all page.tsx files in the app directory
  const pageFiles = await glob('app/**/page.tsx', {
    cwd: process.cwd(),
    absolute: true,
  });

  console.log(`Found ${pageFiles.length} page files\n`);
  console.log('📝 Adding tracking...\n');

  const results = {
    processed: 0,
    alreadyTracked: 0,
    serverComponent: 0,
    errors: 0,
  };

  for (const file of pageFiles) {
    const result = await processFile(file);

    if (result.processed) {
      results.processed++;
    } else if (result.reason === 'already-tracked') {
      results.alreadyTracked++;
    } else if (result.reason === 'server-component') {
      results.serverComponent++;
    } else if (result.reason === 'error') {
      results.errors++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  ✓ Processed: ${results.processed}`);
  console.log(`  ✓ Already tracked: ${results.alreadyTracked}`);
  console.log(`  ⚠ Server components (skipped): ${results.serverComponent}`);
  console.log(`  ✗ Errors: ${results.errors}`);
  console.log(`\nTotal pages: ${pageFiles.length}`);
}

main().catch(console.error);
