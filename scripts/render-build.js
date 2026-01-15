#!/usr/bin/env node
/**
 * Render Build Script - Optimized for Memory-Constrained Environments
 *
 * This script handles the complete build process for Render deployments (2GB limit).
 * It uses a phased approach with aggressive memory management to stay under the limit.
 *
 * Memory Budget (2GB total):
 * - OS & system processes: ~200MB
 * - Node.js base: ~100MB
 * - Available for build: ~1700MB
 * - Safety margin: ~200MB
 * - Target heap limit: 1280MB
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Memory configuration - reduced from 1536MB to leave more headroom
const NODE_MEMORY_LIMIT = process.env.NODE_MEMORY_LIMIT || '1280';

// Set memory limits with garbage collection hints
process.env.NODE_OPTIONS = [
  `--max-old-space-size=${NODE_MEMORY_LIMIT}`,
  '--gc-interval=100', // More frequent GC
  process.env.NODE_OPTIONS || ''
].filter(Boolean).join(' ').trim();

// Ensure memory-constrained mode is active
process.env.MEMORY_CONSTRAINED = 'true';

console.log(`\n========================================`);
console.log(`  Render Build Script (Memory-Optimized)`);
console.log(`========================================`);
console.log(`  Node version: ${process.version}`);
console.log(`  Working directory: ${process.cwd()}`);
console.log(`  Memory limit: ${NODE_MEMORY_LIMIT}MB`);
console.log(`========================================\n`);

function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    heapUsed: Math.round(used.heapUsed / 1024 / 1024),
    heapTotal: Math.round(used.heapTotal / 1024 / 1024),
    external: Math.round(used.external / 1024 / 1024),
    rss: Math.round(used.rss / 1024 / 1024),
  };
}

function logMemory(phase) {
  const mem = getMemoryUsage();
  console.log(`    [Memory @ ${phase}] Heap: ${mem.heapUsed}/${mem.heapTotal}MB, RSS: ${mem.rss}MB`);
}

function runPhase(cmd, description, options = {}) {
  console.log(`\n==> Phase: ${description}`);
  console.log(`    Command: ${cmd}`);
  logMemory('start');

  const startTime = Date.now();

  try {
    // Use spawnSync for better memory handling
    const result = spawnSync('sh', ['-c', cmd], {
      stdio: 'inherit',
      env: {
        ...process.env,
        // Ensure child processes also respect memory limits
        NODE_OPTIONS: process.env.NODE_OPTIONS,
        MEMORY_CONSTRAINED: 'true',
        NEXT_TELEMETRY_DISABLED: '1',
      },
      ...options,
    });

    if (result.status !== 0) {
      throw new Error(`Command exited with code ${result.status}`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`==> ${description} completed in ${duration}s`);
    logMemory('end');
    return true;
  } catch (error) {
    console.error(`==> ERROR: ${description} failed`);
    console.error(`    ${error.message}`);
    logMemory('error');
    return false;
  }
}

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

function clearCaches() {
  console.log('\n==> Clearing caches to free memory...');

  // Clear npm cache
  try {
    execSync('npm cache clean --force 2>/dev/null || true', { stdio: 'pipe' });
  } catch (e) {
    // Ignore errors
  }

  // Clear Next.js cache if it exists (but not .next build output)
  const nextCacheDir = path.join(process.cwd(), '.next', 'cache');
  if (fs.existsSync(nextCacheDir)) {
    try {
      fs.rmSync(nextCacheDir, { recursive: true, force: true });
      console.log('    Cleared .next/cache');
    } catch (e) {
      // Ignore errors
    }
  }

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
    console.log('    Forced garbage collection');
  }

  logMemory('after-clear');
}

async function main() {
  const phases = [];
  let success = true;

  // Phase 1: Prisma Client Generation
  // NOTE: Prisma generate already runs via postinstall hook during npm install
  // We skip it here to avoid duplicate generation and save ~2-3 seconds
  console.log('\n--- PHASE 1: Prisma Client Generation ---');
  console.log('==> Skipping - already generated via postinstall hook');
  phases.push('prisma-generate-skip');

  // Phase 2: Database migrations (lightweight)
  console.log('\n--- PHASE 2: Database Migration ---');
  if (!runPhase('npm run db:migrate', 'Running database migrations')) {
    // Don't fail on migration errors - the db might already be set up
    console.log('    Warning: Migration had issues, continuing...');
  }
  phases.push('db-migrate');

  // Clear caches before the heavy build phase
  clearCaches();

  // Phase 3: Next.js build (memory-intensive)
  console.log('\n--- PHASE 3: Next.js Build (Memory-Intensive) ---');
  console.log('    Using memory-optimized settings:');
  console.log('    - Sentry webpack plugin: DISABLED');
  console.log('    - Source maps: DISABLED');
  console.log('    - Worker threads: DISABLED');
  console.log('    - Parallel minification: DISABLED');
  console.log('    - Telemetry: DISABLED');

  if (!runPhase('npx next build', 'Building Next.js application')) {
    process.exit(1);
  }
  phases.push('next-build');

  // Phase 4: Verify build output
  console.log('\n--- PHASE 4: Build Verification ---');
  const nextDir = path.join(process.cwd(), '.next');
  const buildIdPath = path.join(nextDir, 'BUILD_ID');

  if (!fs.existsSync(nextDir)) {
    console.error('ERROR: .next directory does not exist!');
    process.exit(1);
  }

  if (!fs.existsSync(buildIdPath)) {
    console.error('ERROR: .next/BUILD_ID does not exist!');
    process.exit(1);
  }

  const buildId = fs.readFileSync(buildIdPath, 'utf8').trim();
  console.log(`==> Build verified: ${buildId}`);

  // List .next directory contents
  console.log('\n==> .next directory contents:');
  const items = fs.readdirSync(nextDir);
  items.forEach(item => {
    const stat = fs.statSync(path.join(nextDir, item));
    const type = stat.isDirectory() ? 'DIR ' : 'FILE';
    console.log(`    ${type} ${item}`);
  });
  phases.push('verify');

  // Phase 5: Prepare standalone deployment
  console.log('\n--- PHASE 5: Standalone Deployment Prep ---');
  const standaloneDir = path.join(nextDir, 'standalone');
  const publicDir = path.join(process.cwd(), 'public');
  const staticDir = path.join(nextDir, 'static');

  if (fs.existsSync(standaloneDir)) {
    if (fs.existsSync(publicDir)) {
      const standalonePublic = path.join(standaloneDir, 'public');
      console.log('    Copying public/ to standalone/public/');
      copyDirectory(publicDir, standalonePublic);
    }

    if (fs.existsSync(staticDir)) {
      const standaloneStatic = path.join(standaloneDir, '.next', 'static');
      console.log('    Copying .next/static/ to standalone/.next/static/');
      fs.mkdirSync(path.join(standaloneDir, '.next'), { recursive: true });
      copyDirectory(staticDir, standaloneStatic);
    }

    console.log('==> Standalone deployment prepared');
  } else {
    console.log('    Warning: standalone directory not found');
  }
  phases.push('standalone');

  // Phase 6: Database seeding (SKIPPED in production to save memory)
  console.log('\n--- PHASE 6: Database Seeding ---');
  if (process.env.SKIP_SEED !== 'true' && process.env.NODE_ENV !== 'production') {
    // Use minimal seed for memory-constrained environments
    if (process.env.MEMORY_CONSTRAINED === 'true' || process.env.USE_MINIMAL_SEED === 'true') {
      console.log('==> Running minimal seed (memory-constrained mode)');
      if (!runPhase('npm run db:seed:minimal', 'Seeding database (minimal)')) {
        console.log('    Warning: Minimal seed failed, trying seed-if-empty...');
        runPhase('npm run db:seed-if-empty', 'Seeding database (if empty)');
      }
    } else {
      runPhase('npm run db:seed', 'Seeding database');
    }
  } else {
    console.log('==> Skipping database seed (production build)');
    console.log('    To seed manually: npm run db:seed');
    console.log('    To seed if empty: npm run db:seed-if-empty');
  }
  phases.push('seed-skip');

  // Final summary
  console.log('\n========================================');
  console.log('  Build Completed Successfully!');
  console.log('========================================');
  console.log(`  Phases completed: ${phases.join(' → ')}`);
  logMemory('final');
  console.log('========================================\n');
}

main().catch((error) => {
  console.error('\n========================================');
  console.error('  Build Failed!');
  console.error('========================================');
  console.error(`  Error: ${error.message}`);
  logMemory('failure');
  process.exit(1);
});
