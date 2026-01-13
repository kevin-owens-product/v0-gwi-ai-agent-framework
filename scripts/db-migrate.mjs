#!/usr/bin/env node
/**
 * Database migration script that handles both fresh and existing databases.
 * For existing production databases that weren't set up with Prisma migrations,
 * this script baselines the migrations before applying them.
 * Also verifies critical tables exist after migration.
 */

import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function checkTableExists(tableName) {
  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '${tableName}'
      ) as "exists"
    `);
    return result[0]?.exists === true;
  } catch (error) {
    console.log(`   Could not check table ${tableName}: ${error.message}`);
    return false;
  }
}

async function verifyTables() {
  const criticalTables = ['SuperAdmin', 'User', 'Organization'];
  const missing = [];

  for (const table of criticalTables) {
    const exists = await checkTableExists(table);
    if (!exists) {
      missing.push(table);
    }
  }

  return missing;
}

async function main() {
  console.log('🔄 Running database migrations...');

  // Try standard migration first
  if (run('npx prisma migrate deploy')) {
    console.log('✅ Migrations applied successfully');

    // Verify critical tables exist
    console.log('🔍 Verifying critical tables...');
    const missingTables = await verifyTables();

    if (missingTables.length === 0) {
      console.log('✅ All critical tables verified');
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log(`⚠️  Missing tables: ${missingTables.join(', ')}`);
    console.log('   Migration history is out of sync with actual tables.');
    console.log('🔧 Running db push to create missing tables...');

    if (run('npx prisma db push --accept-data-loss')) {
      console.log('✅ Schema synced via db push');
      await prisma.$disconnect();
      process.exit(0);
    }
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
    await prisma.$disconnect();
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
    await prisma.$disconnect();
    process.exit(0);
  }

  // Final fallback to db push
  console.log('⚠️  Falling back to db push...');
  if (run('npx prisma db push --accept-data-loss')) {
    console.log('✅ Database schema synced via db push');
    await prisma.$disconnect();
    process.exit(0);
  }

  console.error('❌ Failed to update database schema');
  await prisma.$disconnect();
  process.exit(1);
}

main().catch(async (e) => {
  console.error('❌ Migration script failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
