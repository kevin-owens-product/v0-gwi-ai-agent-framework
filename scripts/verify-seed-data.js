#!/usr/bin/env node
/**
 * Verify Seed Data Script
 * 
 * This script checks if seed data exists in the database
 * and provides login credentials for testing.
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('\n🔍 Verifying Seed Data...\n')

  try {
    // Check Super Admins
    const superAdminCount = await prisma.superAdmin.count()
    const superAdmins = await prisma.superAdmin.findMany({
      take: 5,
      select: {
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Check Organizations
    const orgCount = await prisma.organization.count()
    const orgs = await prisma.organization.findMany({
      take: 5,
      select: {
        name: true,
        slug: true,
        planTier: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Check Users
    const userCount = await prisma.user.count()
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        email: true,
        name: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Check Support Tickets
    const ticketCount = await prisma.supportTicket.count()
    const tickets = await prisma.supportTicket.findMany({
      take: 5,
      select: {
        subject: true,
        status: true,
        priority: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Display Results
    console.log('═══════════════════════════════════════════════════════')
    console.log('  DATABASE SEED DATA VERIFICATION')
    console.log('═══════════════════════════════════════════════════════\n')

    console.log(`✅ Super Admins: ${superAdminCount}`)
    if (superAdmins.length > 0) {
      console.log('   Sample admins:')
      superAdmins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.role}) - ${admin.isActive ? 'Active' : 'Inactive'}`)
      })
    }

    console.log(`\n✅ Organizations: ${orgCount}`)
    if (orgs.length > 0) {
      console.log('   Sample organizations:')
      orgs.forEach(org => {
        console.log(`   - ${org.name} (${org.planTier})`)
      })
    }

    console.log(`\n✅ Users: ${userCount}`)
    if (users.length > 0) {
      console.log('   Sample users:')
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.name})`)
      })
    }

    console.log(`\n✅ Support Tickets: ${ticketCount}`)
    if (tickets.length > 0) {
      console.log('   Sample tickets:')
      tickets.forEach(ticket => {
        console.log(`   - ${ticket.subject} [${ticket.status}]`)
      })
    }

    console.log('\n═══════════════════════════════════════════════════════')
    console.log('  ADMIN LOGIN CREDENTIALS')
    console.log('═══════════════════════════════════════════════════════\n')

    console.log('To access the admin portal:')
    console.log('1. Go to: http://localhost:3000/login?type=admin')
    console.log('2. Use one of these credentials:\n')

    const demoAdmin = superAdmins.find(a => a.email.includes('demo'))
    if (demoAdmin) {
      console.log(`   📧 Email: ${demoAdmin.email}`)
      console.log('   🔑 Password: demo123')
      console.log('   👤 Role: SUPER_ADMIN (full access)\n')
    }

    console.log('   📧 Email: superadmin@gwi.com')
    console.log('   🔑 Password: SuperAdmin123!')
    console.log('   👤 Role: SUPER_ADMIN (full access)\n')

    console.log('   📧 Email: admin@gwi.com')
    console.log('   🔑 Password: Admin123!')
    console.log('   👤 Role: ADMIN (standard admin ops)\n')

    console.log('═══════════════════════════════════════════════════════\n')

    if (superAdminCount === 0 || orgCount === 0 || userCount === 0) {
      console.log('⚠️  WARNING: Some seed data is missing!')
      console.log('   Run: npm run db:seed\n')
      process.exit(1)
    } else {
      console.log('✅ All seed data verified successfully!\n')
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ Error verifying seed data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
