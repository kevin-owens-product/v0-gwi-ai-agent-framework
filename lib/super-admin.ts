import { prisma, withRetry } from './db'
import { randomBytes } from 'crypto'
import { createHash } from 'crypto'
import bcrypt from 'bcryptjs'
import type { SuperAdminRole } from '@prisma/client'
import { Prisma } from '@prisma/client'

// Account lockout configuration
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes

// In-memory store for login attempts (in production, use Redis)
const loginAttempts = new Map<string, { count: number; lockedUntil?: Date }>()

// Super Admin Permissions
export const SUPER_ADMIN_PERMISSIONS = {
  // Tenant Management
  'tenants:read': 'View all organizations',
  'tenants:write': 'Create and edit organizations',
  'tenants:suspend': 'Suspend organizations',
  'tenants:delete': 'Delete organizations',
  'tenants:impersonate': 'Impersonate tenant users',

  // User Management
  'users:read': 'View all users',
  'users:write': 'Edit user details',
  'users:ban': 'Ban/unban users',
  'users:delete': 'Delete users',

  // Platform Analytics
  'analytics:read': 'View platform analytics',
  'analytics:export': 'Export analytics data',

  // Feature Flags
  'features:read': 'View feature flags',
  'features:write': 'Manage feature flags',

  // System Rules
  'rules:read': 'View system rules',
  'rules:write': 'Manage system rules',

  // Support
  'support:read': 'View support tickets',
  'support:write': 'Respond to tickets',
  'support:manage': 'Manage ticket assignments',

  // System Config
  'config:read': 'View system configuration',
  'config:write': 'Modify system configuration',

  // Audit
  'audit:read': 'View platform audit logs',

  // Notifications
  'notifications:read': 'View system notifications',
  'notifications:write': 'Create system notifications',

  // Billing Admin
  'billing:read': 'View all billing info',
  'billing:write': 'Manage billing overrides',

  // Super Admin Management
  'admins:read': 'View other admins',
  'admins:write': 'Manage admin accounts',

  // Full Access
  'super:*': 'Full super admin access',
} as const

export type SuperAdminPermission = keyof typeof SUPER_ADMIN_PERMISSIONS

// Role-based permissions
export const SUPER_ADMIN_ROLE_PERMISSIONS: Record<SuperAdminRole, SuperAdminPermission[]> = {
  SUPER_ADMIN: ['super:*'],
  ADMIN: [
    'tenants:read', 'tenants:write', 'tenants:suspend',
    'users:read', 'users:write', 'users:ban',
    'analytics:read', 'analytics:export',
    'features:read', 'features:write',
    'rules:read', 'rules:write',
    'support:read', 'support:write', 'support:manage',
    'config:read',
    'audit:read',
    'notifications:read', 'notifications:write',
    'billing:read',
    'admins:read',
  ],
  SUPPORT: [
    'tenants:read',
    'users:read',
    'analytics:read',
    'features:read',
    'support:read', 'support:write',
    'audit:read',
    'notifications:read',
    'billing:read',
  ],
  ANALYST: [
    'tenants:read',
    'users:read',
    'analytics:read', 'analytics:export',
    'features:read',
    'audit:read',
  ],
}

// Check if admin has permission
export function hasSuperAdminPermission(
  role: SuperAdminRole,
  permission: SuperAdminPermission
): boolean {
  const permissions = SUPER_ADMIN_ROLE_PERMISSIONS[role] || []
  if (permissions.includes('super:*')) return true
  return permissions.includes(permission)
}

// Hash password for super admin using bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Support legacy SHA256 hashes during migration
  if (hash.length === 64 && /^[a-f0-9]+$/.test(hash)) {
    const sha256Hash = createHash('sha256').update(password).digest('hex')
    return sha256Hash === hash
  }
  return bcrypt.compare(password, hash)
}

// Check if account is locked
function isAccountLocked(email: string): { locked: boolean; remainingMs?: number } {
  const attempt = loginAttempts.get(email)
  if (!attempt?.lockedUntil) return { locked: false }

  const now = new Date()
  if (attempt.lockedUntil > now) {
    return { locked: true, remainingMs: attempt.lockedUntil.getTime() - now.getTime() }
  }

  // Lockout expired, reset attempts
  loginAttempts.delete(email)
  return { locked: false }
}

// Record failed login attempt
function recordFailedAttempt(email: string): { locked: boolean; attemptsRemaining: number } {
  const attempt = loginAttempts.get(email) || { count: 0 }
  attempt.count++

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS)
    loginAttempts.set(email, attempt)
    return { locked: true, attemptsRemaining: 0 }
  }

  loginAttempts.set(email, attempt)
  return { locked: false, attemptsRemaining: MAX_LOGIN_ATTEMPTS - attempt.count }
}

// Clear login attempts on successful login
function clearLoginAttempts(email: string): void {
  loginAttempts.delete(email)
}

// Generate session token
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

// Create super admin session
export async function createSuperAdminSession(
  adminId: string,
  ipAddress?: string,
  userAgent?: string
) {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Use retry wrapper for session creation to handle transient connection failures
  const session = await withRetry(
    () => prisma.superAdminSession.create({
      data: {
        adminId,
        token,
        ipAddress,
        userAgent,
        expiresAt,
      },
    }),
    'session creation'
  )

  // Update last login with retry
  await withRetry(
    () => prisma.superAdmin.update({
      where: { id: adminId },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    }),
    'update last login'
  )

  return { session, token }
}

// Validate session token
export async function validateSuperAdminSession(token: string) {
  // Use retry wrapper for session validation to handle transient connection failures
  const session = await withRetry(
    () => prisma.superAdminSession.findUnique({
      where: { token },
      include: { admin: true },
    }),
    'session validation'
  )

  if (!session) return null
  if (session.expiresAt < new Date()) {
    // Non-critical cleanup - don't fail if this errors
    prisma.superAdminSession.delete({ where: { id: session.id } }).catch(console.error)
    return null
  }
  if (!session.admin.isActive) return null

  return session
}

// Authenticate super admin
export async function authenticateSuperAdmin(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    // Check if account is locked
    const lockStatus = isAccountLocked(email)
    if (lockStatus.locked) {
      const remainingMinutes = Math.ceil((lockStatus.remainingMs || 0) / 60000)
      return {
        success: false,
        error: `Account temporarily locked. Try again in ${remainingMinutes} minutes.`
      }
    }

    // Use retry wrapper for database lookup to handle transient connection failures
    const admin = await withRetry(
      () => prisma.superAdmin.findUnique({ where: { email } }),
      'admin lookup'
    )

    if (!admin || !admin.isActive) {
      // Record failed attempt even for non-existent users (prevent user enumeration)
      recordFailedAttempt(email)
      return { success: false, error: 'Invalid credentials' }
    }

    // Verify password using bcrypt (with legacy SHA256 support)
    const isValidPassword = await verifyPassword(password, admin.passwordHash)
    if (!isValidPassword) {
      const attemptResult = recordFailedAttempt(email)

      // Log failed attempt (non-blocking)
      logPlatformAudit({
        action: 'login_failed',
        resourceType: 'super_admin',
        resourceId: admin.id,
        details: {
          email,
          reason: 'invalid_password',
          attemptsRemaining: attemptResult.attemptsRemaining,
          accountLocked: attemptResult.locked
        },
        ipAddress,
        userAgent,
      }).catch(() => {}) // Silently ignore audit failures

      if (attemptResult.locked) {
        return {
          success: false,
          error: 'Too many failed attempts. Account locked for 30 minutes.'
        }
      }

      return { success: false, error: 'Invalid credentials' }
    }

    // Clear failed attempts on successful login
    clearLoginAttempts(email)

    const { session, token } = await createSuperAdminSession(admin.id, ipAddress, userAgent)

    // Log successful login (non-blocking)
    logPlatformAudit({
      adminId: admin.id,
      action: 'login',
      resourceType: 'super_admin',
      resourceId: admin.id,
      details: { email },
      ipAddress,
      userAgent,
    }).catch(() => {}) // Silently ignore audit failures

    return {
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      token,
      expiresAt: session.expiresAt,
    }
  } catch (error) {
    // Log error server-side only, don't expose details to client
    console.error('authenticateSuperAdmin error:', error)
    throw error
  }
}

// Log platform audit
export async function logPlatformAudit({
  adminId,
  action,
  resourceType,
  resourceId,
  targetOrgId,
  targetUserId,
  details = {},
  ipAddress,
  userAgent,
}: {
  adminId?: string
  action: string
  resourceType: string
  resourceId?: string
  targetOrgId?: string
  targetUserId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}) {
  return prisma.platformAuditLog.create({
    data: {
      adminId,
      action,
      resourceType,
      resourceId,
      targetOrgId,
      targetUserId,
      details: details as Prisma.InputJsonValue,
      ipAddress,
      userAgent,
    },
  })
}

// Get platform statistics
export async function getPlatformStats() {
  const [
    totalOrgs,
    activeOrgs,
    totalUsers,
    totalAgentRuns,
    totalTokensUsed,
    orgsByPlan,
    recentSignups,
    activeTickets,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({
      where: {
        members: { some: {} },
      },
    }),
    prisma.user.count(),
    prisma.agentRun.count(),
    prisma.usageRecord.aggregate({
      where: { metricType: 'TOKENS_CONSUMED' },
      _sum: { quantity: true },
    }),
    prisma.organization.groupBy({
      by: ['planTier'],
      _count: true,
    }),
    prisma.organization.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.supportTicket.count({
      where: {
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    }),
  ])

  return {
    totalOrgs,
    activeOrgs,
    totalUsers,
    totalAgentRuns,
    totalTokensUsed: totalTokensUsed._sum.quantity || 0,
    orgsByPlan: orgsByPlan.reduce((acc, item) => {
      acc[item.planTier] = item._count
      return acc
    }, {} as Record<string, number>),
    recentSignups,
    activeTickets,
  }
}

// Get tenant list with filters
export async function getTenants({
  search,
  planTier,
  status,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  page = 1,
  limit = 20,
}: {
  search?: string
  planTier?: string
  status?: 'active' | 'suspended' | 'all'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}) {
  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (planTier && planTier !== 'all') {
    where.planTier = planTier
  }

  const [tenants, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      include: {
        _count: {
          select: {
            members: true,
            agents: true,
            workflows: true,
          },
        },
        subscription: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.organization.count({ where }),
  ])

  // Get suspension status for each tenant
  const suspensions = await prisma.organizationSuspension.findMany({
    where: {
      orgId: { in: tenants.map(t => t.id) },
      isActive: true,
    },
  })

  const suspensionMap = new Map(suspensions.map(s => [s.orgId, s]))

  const tenantsWithStatus = tenants.map(tenant => ({
    ...tenant,
    isSuspended: suspensionMap.has(tenant.id),
    suspension: suspensionMap.get(tenant.id),
  }))

  // Filter by status if needed
  let filteredTenants = tenantsWithStatus
  if (status === 'suspended') {
    filteredTenants = tenantsWithStatus.filter(t => t.isSuspended)
  } else if (status === 'active') {
    filteredTenants = tenantsWithStatus.filter(t => !t.isSuspended)
  }

  return {
    tenants: filteredTenants,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

// Suspend organization
export async function suspendOrganization({
  orgId,
  reason,
  suspendedBy,
  suspensionType = 'FULL',
  expiresAt,
  notes,
}: {
  orgId: string
  reason: string
  suspendedBy: string
  suspensionType?: 'FULL' | 'PARTIAL' | 'BILLING_HOLD' | 'INVESTIGATION'
  expiresAt?: Date
  notes?: string
}) {
  const suspension = await prisma.organizationSuspension.create({
    data: {
      orgId,
      reason,
      suspendedBy,
      suspensionType,
      expiresAt,
      notes,
    },
  })

  await logPlatformAudit({
    adminId: suspendedBy,
    action: 'suspend_organization',
    resourceType: 'organization',
    resourceId: orgId,
    targetOrgId: orgId,
    details: { reason, suspensionType, expiresAt },
  })

  return suspension
}

// Lift organization suspension
export async function liftOrganizationSuspension(orgId: string, adminId: string) {
  await prisma.organizationSuspension.updateMany({
    where: { orgId, isActive: true },
    data: { isActive: false },
  })

  await logPlatformAudit({
    adminId,
    action: 'lift_suspension',
    resourceType: 'organization',
    resourceId: orgId,
    targetOrgId: orgId,
  })
}

// Ban user
export async function banUser({
  userId,
  orgId,
  reason,
  bannedBy,
  banType = 'TEMPORARY',
  expiresAt,
}: {
  userId: string
  orgId?: string
  reason: string
  bannedBy: string
  banType?: 'TEMPORARY' | 'PERMANENT' | 'SHADOW'
  expiresAt?: Date
}) {
  const ban = await prisma.userBan.create({
    data: {
      userId,
      orgId,
      reason,
      bannedBy,
      banType,
      expiresAt,
    },
  })

  await logPlatformAudit({
    adminId: bannedBy,
    action: 'ban_user',
    resourceType: 'user',
    resourceId: userId,
    targetUserId: userId,
    targetOrgId: orgId,
    details: { reason, banType, expiresAt },
  })

  return ban
}

// Lift user ban
export async function liftUserBan(banId: string, adminId: string) {
  const ban = await prisma.userBan.delete({
    where: { id: banId },
  })

  await logPlatformAudit({
    adminId,
    action: 'lift_ban',
    resourceType: 'user',
    resourceId: ban.userId,
    targetUserId: ban.userId,
  })

  return ban
}

// Get all users with filters
export async function getUsers({
  search,
  status,
  page = 1,
  limit = 20,
}: {
  search?: string
  status?: 'active' | 'banned' | 'all'
  page?: number
  limit?: number
}) {
  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        memberships: {
          include: {
            organization: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        _count: {
          select: { sessions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  // Get ban status
  const bans = await prisma.userBan.findMany({
    where: {
      userId: { in: users.map(u => u.id) },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  })

  const banMap = new Map(bans.map(b => [b.userId, b]))

  const usersWithStatus = users.map(user => ({
    ...user,
    isBanned: banMap.has(user.id),
    ban: banMap.get(user.id),
  }))

  let filteredUsers = usersWithStatus
  if (status === 'banned') {
    filteredUsers = usersWithStatus.filter(u => u.isBanned)
  } else if (status === 'active') {
    filteredUsers = usersWithStatus.filter(u => !u.isBanned)
  }

  return {
    users: filteredUsers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

// Feature flag helpers
export async function getFeatureFlags() {
  return prisma.featureFlag.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function createFeatureFlag(data: {
  key: string
  name: string
  description?: string
  type?: 'BOOLEAN' | 'STRING' | 'NUMBER' | 'JSON'
  defaultValue?: unknown
  isEnabled?: boolean
  rolloutPercentage?: number
  allowedOrgs?: string[]
  allowedPlans?: ('STARTER' | 'PROFESSIONAL' | 'ENTERPRISE')[]
  createdBy?: string
}) {
  return prisma.featureFlag.create({
    data: {
      key: data.key,
      name: data.name,
      description: data.description,
      type: data.type || 'BOOLEAN',
      defaultValue: data.defaultValue ?? false,
      isEnabled: data.isEnabled ?? false,
      rolloutPercentage: data.rolloutPercentage ?? 0,
      allowedOrgs: data.allowedOrgs ?? [],
      allowedPlans: data.allowedPlans ?? [],
      createdBy: data.createdBy,
    },
  })
}

export async function updateFeatureFlag(
  id: string,
  data: Partial<{
    name: string
    description: string
    isEnabled: boolean
    rolloutPercentage: number
    allowedOrgs: string[]
    blockedOrgs: string[]
    allowedPlans: ('STARTER' | 'PROFESSIONAL' | 'ENTERPRISE')[]
  }>
) {
  return prisma.featureFlag.update({
    where: { id },
    data,
  })
}

// Check if feature is enabled for an org
export async function isFeatureEnabled(featureKey: string, orgId: string, planTier: string) {
  const flag = await prisma.featureFlag.findUnique({
    where: { key: featureKey },
  })

  if (!flag) return false
  if (!flag.isEnabled) return false
  if (flag.blockedOrgs.includes(orgId)) return false
  if (flag.allowedOrgs.length > 0 && !flag.allowedOrgs.includes(orgId)) return false
  if (flag.allowedPlans.length > 0 && !flag.allowedPlans.includes(planTier as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE')) return false

  // Gradual rollout check
  if (flag.rolloutPercentage < 100) {
    const hash = createHash('md5').update(`${featureKey}:${orgId}`).digest('hex')
    const hashNum = parseInt(hash.substring(0, 8), 16)
    const percentage = (hashNum / 0xffffffff) * 100
    if (percentage > flag.rolloutPercentage) return false
  }

  return true
}

// Support ticket helpers
export async function getSupportTickets({
  status,
  priority,
  category,
  assignedTo,
  page = 1,
  limit = 20,
}: {
  status?: string
  priority?: string
  category?: string
  assignedTo?: string
  page?: number
  limit?: number
}) {
  const where: Record<string, unknown> = {}

  if (status && status !== 'all') where.status = status
  if (priority && priority !== 'all') where.priority = priority
  if (category && category !== 'all') where.category = category
  if (assignedTo) where.assignedTo = assignedTo

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      include: {
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supportTicket.count({ where }),
  ])

  return {
    tickets,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

// Generate unique ticket number
export async function generateTicketNumber(): Promise<string> {
  const date = new Date()
  const prefix = `TKT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`

  const lastTicket = await prisma.supportTicket.findFirst({
    where: { ticketNumber: { startsWith: prefix } },
    orderBy: { ticketNumber: 'desc' },
  })

  let sequence = 1
  if (lastTicket) {
    const lastSequence = parseInt(lastTicket.ticketNumber.split('-')[2], 10)
    sequence = lastSequence + 1
  }

  return `${prefix}-${String(sequence).padStart(5, '0')}`
}

// Tenant health score calculation
export async function calculateTenantHealthScore(orgId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    org,
    memberCount,
    activeMembers,
    agentRuns,
    recentLogins,
  ] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: orgId },
      include: { subscription: true },
    }),
    prisma.organizationMember.count({ where: { orgId } }),
    prisma.session.count({
      where: {
        user: { memberships: { some: { orgId } } },
        expires: { gt: new Date() },
      },
    }),
    prisma.agentRun.count({
      where: { orgId, startedAt: { gte: thirtyDaysAgo } },
    }),
    // Count active sessions (sessions that haven't expired)
    prisma.session.count({
      where: {
        user: { memberships: { some: { orgId } } },
        expires: { gte: new Date() },
      },
    }),
  ])

  if (!org) throw new Error('Organization not found')

  // Calculate engagement score (0-100)
  const engagementScore = Math.min(100, (recentLogins / Math.max(memberCount, 1)) * 50 + (activeMembers / Math.max(memberCount, 1)) * 50)

  // Calculate usage score (0-100)
  const expectedRuns = memberCount * 10 // Expected 10 runs per member per month
  const usageScore = Math.min(100, (agentRuns / Math.max(expectedRuns, 1)) * 100)

  // Overall score
  const overallScore = (engagementScore * 0.5 + usageScore * 0.5)

  // Determine risk level
  let riskLevel: 'HEALTHY' | 'AT_RISK' | 'CRITICAL' = 'HEALTHY'
  let churnProbability = 0.1

  if (overallScore < 30) {
    riskLevel = 'CRITICAL'
    churnProbability = 0.7
  } else if (overallScore < 60) {
    riskLevel = 'AT_RISK'
    churnProbability = 0.4
  }

  // Generate recommendations
  const recommendations: string[] = []
  if (engagementScore < 50) {
    recommendations.push('Low user engagement - consider outreach')
  }
  if (usageScore < 30) {
    recommendations.push('Low feature utilization - offer training')
  }
  if (memberCount < 3) {
    recommendations.push('Small team size - encourage team invites')
  }

  const healthScore = await prisma.tenantHealthScore.create({
    data: {
      orgId,
      overallScore,
      engagementScore,
      usageScore,
      riskLevel,
      churnProbability,
      recommendations,
      healthIndicators: {
        memberCount,
        activeMembers,
        agentRuns,
        recentLogins,
      },
    },
  })

  return healthScore
}

// System rules helpers
export async function getSystemRules() {
  return prisma.systemRule.findMany({
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  })
}

export async function createSystemRule(data: {
  name: string
  description?: string
  type: 'RATE_LIMIT' | 'CONTENT_POLICY' | 'SECURITY' | 'BILLING' | 'USAGE' | 'COMPLIANCE' | 'NOTIFICATION' | 'AUTO_SUSPEND'
  conditions: Record<string, unknown>
  actions: Record<string, unknown>
  priority?: number
  appliesTo?: string[]
  excludeOrgs?: string[]
  createdBy?: string
}) {
  return prisma.systemRule.create({
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      conditions: data.conditions as Prisma.InputJsonValue,
      actions: data.actions as Prisma.InputJsonValue,
      priority: data.priority ?? 0,
      appliesTo: data.appliesTo ?? [],
      excludeOrgs: data.excludeOrgs ?? [],
      createdBy: data.createdBy,
    },
  })
}

// System config helpers
export async function getSystemConfig(category?: string) {
  const where = category ? { category } : {}
  return prisma.systemConfig.findMany({ where })
}

export async function setSystemConfig(
  key: string,
  value: unknown,
  options?: {
    description?: string
    category?: string
    isPublic?: boolean
    updatedBy?: string
  }
) {
  return prisma.systemConfig.upsert({
    where: { key },
    update: {
      value: value as object,
      description: options?.description,
      category: options?.category,
      isPublic: options?.isPublic,
      updatedBy: options?.updatedBy,
    },
    create: {
      key,
      value: value as object,
      description: options?.description,
      category: options?.category ?? 'general',
      isPublic: options?.isPublic ?? false,
    },
  })
}

// Create super admin notification
export async function createSystemNotification(data: {
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'ALERT' | 'MAINTENANCE' | 'FEATURE' | 'PROMOTION'
  targetType?: 'ALL' | 'SPECIFIC_ORGS' | 'SPECIFIC_PLANS'
  targetOrgs?: string[]
  targetPlans?: ('STARTER' | 'PROFESSIONAL' | 'ENTERPRISE')[]
  scheduledFor?: Date
  expiresAt?: Date
  createdBy?: string
}) {
  return prisma.systemNotification.create({
    data: {
      title: data.title,
      message: data.message,
      type: data.type,
      targetType: data.targetType ?? 'ALL',
      targetOrgs: data.targetOrgs ?? [],
      targetPlans: data.targetPlans ?? [],
      scheduledFor: data.scheduledFor,
      expiresAt: data.expiresAt,
      createdBy: data.createdBy,
    },
  })
}

// Impersonation token generation
export async function createImpersonationToken(
  adminId: string,
  targetUserId: string,
  targetOrgId: string
) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await logPlatformAudit({
    adminId,
    action: 'impersonate_user',
    resourceType: 'user',
    resourceId: targetUserId,
    targetUserId,
    targetOrgId,
    details: { expiresAt },
  })

  // Store impersonation token in system config temporarily
  await setSystemConfig(`impersonation:${token}`, {
    adminId,
    targetUserId,
    targetOrgId,
    expiresAt: expiresAt.toISOString(),
  })

  return { token, expiresAt }
}
