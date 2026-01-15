/**
 * Minimal Seed Script - Memory-Optimized for Render Deployments
 *
 * Creates only essential data for the application to function:
 * - 2 super admin accounts
 * - 3 essential plans (Starter, Professional, Enterprise)
 * - 5 core features
 * - 1 demo organization with admin user
 * - Basic system configuration
 *
 * Memory usage: ~50-80MB (vs ~400-500MB for full seed)
 */

import { PrismaClient, Role, PlanTier } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Helper to hash passwords
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Helper to hash super admin passwords (SHA256 for super admins)
function hashSuperAdminPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Helper to safely run operations that might fail due to missing tables
async function safeCreate<T>(
  operation: () => Promise<T>,
  fallbackMessage: string
): Promise<T | null> {
  try {
    return await operation()
  } catch (error: unknown) {
    const prismaError = error as { code?: string }
    if (prismaError?.code === 'P2021') {
      console.log(`⚠️  Skipping: ${fallbackMessage} (table not migrated)`)
      return null
    }
    throw error
  }
}

async function main() {
  console.log('🌱 Starting MINIMAL database seed (memory-optimized)...')
  console.log('   This creates only essential data for the app to run.\n')

  const startTime = Date.now()

  // ==================== SUPER ADMINS ====================
  console.log('👑 Creating super admin accounts...')

  const existingSuperAdmin = await safeCreate(
    () => prisma.superAdmin.findFirst({ where: { email: 'superadmin@gwi.com' } }),
    'SuperAdmin lookup'
  )

  if (!existingSuperAdmin) {
    await safeCreate(
      () => prisma.superAdmin.create({
        data: {
          email: 'superadmin@gwi.com',
          name: 'Super Admin',
          passwordHash: hashSuperAdminPassword('SuperAdmin123!'),
          role: 'SUPER_ADMIN',
          isActive: true,
          mfaEnabled: false,
        }
      }),
      'SuperAdmin creation'
    )

    await safeCreate(
      () => prisma.superAdmin.create({
        data: {
          email: 'demo@gwi.com',
          name: 'Demo Super Admin',
          passwordHash: hashSuperAdminPassword('demo123'),
          role: 'PLATFORM_ADMIN',
          isActive: true,
          mfaEnabled: false,
        }
      }),
      'Demo SuperAdmin creation'
    )

    console.log('   ✓ Created 2 super admin accounts')
  } else {
    console.log('   ✓ Super admins already exist, skipping')
  }

  // ==================== FEATURES ====================
  console.log('🎯 Creating core features...')

  const existingFeature = await safeCreate(
    () => prisma.feature.findFirst({ where: { code: 'ADVANCED_ANALYTICS' } }),
    'Feature lookup'
  )

  let features: { advancedAnalytics?: any; customBranding?: any; sso?: any; apiAccess?: any; auditLog?: any } = {}

  if (!existingFeature) {
    features.advancedAnalytics = await safeCreate(
      () => prisma.feature.create({
        data: {
          name: 'Advanced Analytics',
          code: 'ADVANCED_ANALYTICS',
          description: 'Access to advanced analytics and reporting features',
          category: 'ANALYTICS',
          isActive: true,
        }
      }),
      'Advanced Analytics feature'
    )

    features.customBranding = await safeCreate(
      () => prisma.feature.create({
        data: {
          name: 'Custom Branding',
          code: 'CUSTOM_BRANDING',
          description: 'Customize your workspace with your brand',
          category: 'CUSTOMIZATION',
          isActive: true,
        }
      }),
      'Custom Branding feature'
    )

    features.sso = await safeCreate(
      () => prisma.feature.create({
        data: {
          name: 'Single Sign-On',
          code: 'SSO',
          description: 'Enterprise SSO integration',
          category: 'SECURITY',
          isActive: true,
        }
      }),
      'SSO feature'
    )

    features.apiAccess = await safeCreate(
      () => prisma.feature.create({
        data: {
          name: 'API Access',
          code: 'API_ACCESS',
          description: 'Programmatic API access',
          category: 'INTEGRATION',
          isActive: true,
        }
      }),
      'API Access feature'
    )

    features.auditLog = await safeCreate(
      () => prisma.feature.create({
        data: {
          name: 'Audit Log',
          code: 'AUDIT_LOG',
          description: 'Complete audit trail of all actions',
          category: 'SECURITY',
          isActive: true,
        }
      }),
      'Audit Log feature'
    )

    console.log('   ✓ Created 5 core features')
  } else {
    console.log('   ✓ Features already exist, skipping')
  }

  // ==================== PLANS ====================
  console.log('📋 Creating subscription plans...')

  const existingPlan = await safeCreate(
    () => prisma.plan.findFirst({ where: { code: 'STARTER' } }),
    'Plan lookup'
  )

  if (!existingPlan) {
    await safeCreate(
      () => prisma.plan.create({
        data: {
          name: 'Starter',
          code: 'STARTER',
          description: 'Perfect for small teams getting started',
          tier: 'STARTER',
          monthlyPrice: 29,
          yearlyPrice: 290,
          maxUsers: 5,
          maxAgents: 3,
          maxDataSources: 5,
          features: ['basic_analytics', 'email_support'],
          isActive: true,
          isPublic: true,
          sortOrder: 1,
        }
      }),
      'Starter plan'
    )

    await safeCreate(
      () => prisma.plan.create({
        data: {
          name: 'Professional',
          code: 'PROFESSIONAL',
          description: 'For growing teams that need more power',
          tier: 'PROFESSIONAL',
          monthlyPrice: 99,
          yearlyPrice: 990,
          maxUsers: 25,
          maxAgents: 10,
          maxDataSources: 25,
          features: ['advanced_analytics', 'custom_branding', 'api_access', 'priority_support'],
          isActive: true,
          isPublic: true,
          sortOrder: 2,
        }
      }),
      'Professional plan'
    )

    await safeCreate(
      () => prisma.plan.create({
        data: {
          name: 'Enterprise',
          code: 'ENTERPRISE',
          description: 'For large organizations with advanced needs',
          tier: 'ENTERPRISE',
          monthlyPrice: 499,
          yearlyPrice: 4990,
          maxUsers: -1, // Unlimited
          maxAgents: -1,
          maxDataSources: -1,
          features: ['all_features', 'sso', 'audit_log', 'dedicated_support', 'custom_contracts'],
          isActive: true,
          isPublic: true,
          sortOrder: 3,
        }
      }),
      'Enterprise plan'
    )

    console.log('   ✓ Created 3 subscription plans')
  } else {
    console.log('   ✓ Plans already exist, skipping')
  }

  // ==================== DEMO ORGANIZATION ====================
  console.log('🏢 Creating demo organization...')

  const existingOrg = await prisma.organization.findFirst({
    where: { slug: 'demo-org' }
  })

  if (!existingOrg) {
    const demoOrg = await prisma.organization.create({
      data: {
        name: 'Demo Organization',
        slug: 'demo-org',
        planTier: PlanTier.PROFESSIONAL,
        settings: {
          theme: 'system',
          timezone: 'America/New_York',
          features: { advancedAnalytics: true }
        }
      }
    })

    // Create demo user
    const demoPassword = await hashPassword('demo123')
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        name: 'Demo User',
        passwordHash: demoPassword,
        emailVerified: new Date(),
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
      }
    })

    // Create organization membership
    await prisma.organizationMember.create({
      data: {
        userId: demoUser.id,
        organizationId: demoOrg.id,
        role: Role.ADMIN,
      }
    })

    console.log('   ✓ Created demo organization with admin user')
    console.log('   📧 Demo login: demo@example.com / demo123')
  } else {
    console.log('   ✓ Demo organization already exists, skipping')
  }

  // ==================== SYSTEM CONFIG ====================
  console.log('⚙️  Creating system configuration...')

  const existingConfig = await safeCreate(
    () => prisma.systemConfig.findFirst({ where: { key: 'platform.name' } }),
    'SystemConfig lookup'
  )

  if (!existingConfig) {
    await safeCreate(
      () => prisma.systemConfig.createMany({
        data: [
          { key: 'platform.name', value: 'GWI AI Platform', category: 'general', isPublic: true },
          { key: 'platform.version', value: '1.0.0', category: 'general', isPublic: true },
          { key: 'maintenance.enabled', value: 'false', category: 'maintenance', isPublic: true },
        ],
        skipDuplicates: true,
      }),
      'SystemConfig creation'
    )
    console.log('   ✓ Created system configuration')
  } else {
    console.log('   ✓ System configuration already exists, skipping')
  }

  // ==================== FEATURE FLAGS ====================
  console.log('🚩 Creating feature flags...')

  const existingFlag = await safeCreate(
    () => prisma.featureFlag.findFirst({ where: { key: 'new_dashboard' } }),
    'FeatureFlag lookup'
  )

  if (!existingFlag) {
    await safeCreate(
      () => prisma.featureFlag.createMany({
        data: [
          { key: 'new_dashboard', name: 'New Dashboard', enabled: true, rolloutPercentage: 100, description: 'Enable new dashboard UI' },
          { key: 'ai_features', name: 'AI Features', enabled: true, rolloutPercentage: 100, description: 'Enable AI-powered features' },
        ],
        skipDuplicates: true,
      }),
      'FeatureFlag creation'
    )
    console.log('   ✓ Created feature flags')
  } else {
    console.log('   ✓ Feature flags already exist, skipping')
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log('\n========================================')
  console.log('  Minimal Seed Completed!')
  console.log('========================================')
  console.log(`  Duration: ${duration}s`)
  console.log('  Created: Super admins, plans, features, demo org')
  console.log('  Demo login: demo@example.com / demo123')
  console.log('  Super admin: superadmin@gwi.com / SuperAdmin123!')
  console.log('========================================\n')
}

main()
  .catch((e) => {
    console.error('❌ Minimal seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
