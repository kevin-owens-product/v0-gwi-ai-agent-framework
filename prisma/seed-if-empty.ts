import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking if database needs seeding...')

  try {
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
  } catch (error) {
    // Handle case where tables don't exist yet (migrations pending)
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes('does not exist') || errorMessage.includes('P2021')) {
      console.log('⚠️  Some tables do not exist yet. This may indicate pending migrations.')
      console.log('   Attempting to run seed anyway (it will create tables if using db push)...')

      try {
        execSync('npm run db:seed', { stdio: 'inherit' })
      } catch (seedError) {
        console.log('⚠️  Seed failed, but continuing build. You may need to run seed manually.')
        console.log('   Error:', seedError instanceof Error ? seedError.message : String(seedError))
        // Don't fail the build - the app can still work, admin features just won't have data
        return
      }
    } else {
      console.log('⚠️  Database check failed, but continuing build.')
      console.log('   Error:', errorMessage)
      // Don't fail the build
      return
    }
  }
}

main()
  .catch((e) => {
    console.error('⚠️  Seed check encountered an error:', e)
    // Exit with 0 to not fail the build - seed is optional
    process.exit(0)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
