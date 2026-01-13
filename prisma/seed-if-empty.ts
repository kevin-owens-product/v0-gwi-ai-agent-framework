import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking if database needs seeding...')

  // Check if SuperAdmin table has any records
  const superAdminCount = await prisma.superAdmin.count()
  const userCount = await prisma.user.count()
  const orgCount = await prisma.organization.count()

  if (superAdminCount > 0 && userCount > 0 && orgCount > 0) {
    console.log('✅ Database already has data:')
    console.log(`   - Super Admins: ${superAdminCount}`)
    console.log(`   - Users: ${userCount}`)
    console.log(`   - Organizations: ${orgCount}`)
    console.log('   Skipping seed to preserve existing data.')
    return
  }

  console.log('📭 Database is empty or missing critical data. Running full seed...')

  // Run the full seed script
  execSync('npm run db:seed', { stdio: 'inherit' })
}

main()
  .catch((e) => {
    console.error('❌ Seed check failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
