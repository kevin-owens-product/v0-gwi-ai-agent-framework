#!/usr/bin/env node
/**
 * Database migration script that handles both fresh and existing databases.
 * For existing production databases that weren't set up with Prisma migrations,
 * this script baselines the migrations before applying them.
 */

import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';

function run(cmd, options = {}) {
  try {
    execSync(cmd, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    return false;
  }
}

function runSilent(cmd) {
  try {
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

console.log('🔄 Running database migrations...');

// Try standard migration first
if (run('npx prisma migrate deploy')) {
  console.log('✅ Migrations applied successfully');
  process.exit(0);
}

console.log('⚠️  Standard migration failed, attempting to baseline existing database...');

// Get list of migrations
const migrationsDir = join(process.cwd(), 'prisma', 'migrations');
let migrations = [];

try {
  migrations = readdirSync(migrationsDir)
    .filter(f => /^\d+/.test(f))
    .sort();
} catch {
  console.log('No migrations directory found');
}

if (migrations.length === 0) {
  console.log('No migrations found, using db push...');
  run('npx prisma db push --accept-data-loss');
  process.exit(0);
}

console.log(`📋 Found ${migrations.length} migrations to baseline`);

// Mark each migration as applied (baseline)
for (const migration of migrations) {
  console.log(`   Resolving ${migration}...`);
  runSilent(`npx prisma migrate resolve --applied "${migration}"`);
}

// Try to deploy again
console.log('🚀 Applying any pending migrations...');
if (run('npx prisma migrate deploy')) {
  console.log('✅ Database schema is up to date');
  process.exit(0);
}

// Final fallback to db push
console.log('⚠️  Falling back to db push...');
if (run('npx prisma db push --accept-data-loss')) {
  console.log('✅ Database schema synced via db push');
  process.exit(0);
}

console.error('❌ Failed to update database schema');
process.exit(1);
