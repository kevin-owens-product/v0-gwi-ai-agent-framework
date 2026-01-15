#!/usr/bin/env node
/**
 * Render Build Script
 *
 * This script handles the complete build process for Render deployments.
 * It ensures the Next.js build completes and verifies the output exists.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, description) {
  console.log(`\n==> ${description}...`);
  console.log(`    Running: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', env: process.env });
    console.log(`==> ${description} completed successfully`);
  } catch (error) {
    console.error(`==> ERROR: ${description} failed`);
    console.error(error.message);
    process.exit(1);
  }
}

function main() {
  console.log('========================================');
  console.log('  Render Build Script');
  console.log('========================================');
  console.log(`  Node version: ${process.version}`);
  console.log(`  Working directory: ${process.cwd()}`);
  console.log('========================================\n');

  // Step 1: Generate Prisma client
  run('npx prisma generate', 'Generating Prisma client');

  // Step 2: Run database migrations
  run('npm run db:migrate', 'Running database migrations');

  // Step 3: Build Next.js
  run('npx next build', 'Building Next.js application');

  // Step 4: Verify build output
  console.log('\n==> Verifying build output...');
  const nextDir = path.join(process.cwd(), '.next');
  const buildIdPath = path.join(nextDir, 'BUILD_ID');

  if (!fs.existsSync(nextDir)) {
    console.error('ERROR: .next directory does not exist!');
    console.error('The Next.js build may have failed silently.');
    process.exit(1);
  }

  if (!fs.existsSync(buildIdPath)) {
    console.error('ERROR: .next/BUILD_ID does not exist!');
    console.error('The Next.js build may be incomplete.');
    process.exit(1);
  }

  const buildId = fs.readFileSync(buildIdPath, 'utf8').trim();
  console.log(`==> Build verified successfully`);
  console.log(`    BUILD_ID: ${buildId}`);

  // List .next directory contents
  console.log('\n==> .next directory contents:');
  const items = fs.readdirSync(nextDir);
  items.forEach(item => {
    const stat = fs.statSync(path.join(nextDir, item));
    const type = stat.isDirectory() ? 'DIR ' : 'FILE';
    console.log(`    ${type} ${item}`);
  });

  // Step 5: Seed database
  run('npm run db:seed', 'Seeding database');

  console.log('\n========================================');
  console.log('  Build completed successfully!');
  console.log('========================================\n');
}

main();
