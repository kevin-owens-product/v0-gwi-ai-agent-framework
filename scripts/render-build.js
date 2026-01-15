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

function copyDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

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

  // Step 5: Copy public and static folders to standalone directory
  console.log('\n==> Preparing standalone deployment...');
  const standaloneDir = path.join(nextDir, 'standalone');
  const publicDir = path.join(process.cwd(), 'public');
  const staticDir = path.join(nextDir, 'static');

  if (fs.existsSync(standaloneDir)) {
    // Copy public folder to standalone
    if (fs.existsSync(publicDir)) {
      const standalonePublic = path.join(standaloneDir, 'public');
      console.log('    Copying public/ to .next/standalone/public/');
      copyDirectory(publicDir, standalonePublic);
    }

    // Copy .next/static to standalone/.next/static
    if (fs.existsSync(staticDir)) {
      const standaloneStatic = path.join(standaloneDir, '.next', 'static');
      console.log('    Copying .next/static/ to .next/standalone/.next/static/');
      fs.mkdirSync(path.join(standaloneDir, '.next'), { recursive: true });
      copyDirectory(staticDir, standaloneStatic);
    }

    console.log('==> Standalone deployment prepared successfully');
  } else {
    console.log('    Warning: standalone directory not found, skipping copy');
  }

  // Step 6: Seed database
  run('npm run db:seed', 'Seeding database');

  console.log('\n========================================');
  console.log('  Build completed successfully!');
  console.log('========================================\n');
}

main();
