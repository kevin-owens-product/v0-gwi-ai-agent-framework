/**
 * @prompt-id forge-v4.1:feature:admin-activity:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { prisma } from './db'
import { Prisma } from '@prisma/client'
import { headers } from 'next/headers'

/**
 * Admin activity actions
 */
export const AdminActivityAction = {
  // User Management
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_BAN: 'user.ban',
  USER_UNBAN: 'user.unban',
  USER_IMPERSONATE: 'user.impersonate',

  // Tenant Management
  TENANT_CREATE: 'tenant.create',
  TENANT_UPDATE: 'tenant.update',
  TENANT_DELETE: 'tenant.delete',
  TENANT_SUSPEND: 'tenant.suspend',
  TENANT_UNSUSPEND: 'tenant.unsuspend',

  // Security Actions
  SECURITY_POLICY_CREATE: 'security.policy.create',
  SECURITY_POLICY_UPDATE: 'security.policy.update',
  SECURITY_POLICY_DELETE: 'security.policy.delete',
  SECURITY_IP_BLOCK: 'security.ip.block',
  SECURITY_IP_UNBLOCK: 'security.ip.unblock',
  SECURITY_SESSION_TERMINATE: 'security.session.terminate',

  // Configuration Changes
  CONFIG_UPDATE: 'config.update',
  FEATURE_FLAG_CREATE: 'feature_flag.create',
  FEATURE_FLAG_UPDATE: 'feature_flag.update',
  FEATURE_FLAG_DELETE: 'feature_flag.delete',

  // Admin Management
  ADMIN_CREATE: 'admin.create',
  ADMIN_UPDATE: 'admin.update',
  ADMIN_DELETE: 'admin.delete',
  ADMIN_LOGIN: 'admin.login',
  ADMIN_LOGOUT: 'admin.logout',

  // Compliance
  COMPLIANCE_AUDIT_CREATE: 'compliance.audit.create',
  COMPLIANCE_EXPORT: 'compliance.export',
  COMPLIANCE_LEGAL_HOLD: 'compliance.legal_hold',

  // Operations
  MAINTENANCE_SCHEDULE: 'maintenance.schedule',
  INCIDENT_CREATE: 'incident.create',
  INCIDENT_UPDATE: 'incident.update',
  RELEASE_CREATE: 'release.create',
} as const

export type AdminActivityActionType = (typeof AdminActivityAction)[keyof typeof AdminActivityAction]

/**
 * Resource types for admin activities
 */
export const AdminResourceType = {
  USER: 'user',
  TENANT: 'tenant',
  ADMIN: 'admin',
  SECURITY_POLICY: 'security_policy',
  IP_BLOCKLIST: 'ip_blocklist',
  SESSION: 'session',
  CONFIG: 'config',
  FEATURE_FLAG: 'feature_flag',
  COMPLIANCE_AUDIT: 'compliance_audit',
  DATA_EXPORT: 'data_export',
  LEGAL_HOLD: 'legal_hold',
  MAINTENANCE: 'maintenance',
  INCIDENT: 'incident',
  RELEASE: 'release',
} as const

export type AdminResourceTypeValue = (typeof AdminResourceType)[keyof typeof AdminResourceType]

interface LogAdminActivityParams {
  adminId: string
  action: AdminActivityActionType | string
  resourceType: AdminResourceTypeValue | string
  resourceId?: string
  description?: string
  metadata?: Record<string, unknown>
  status?: 'success' | 'failure' | 'pending'
  errorMessage?: string
  duration?: number
  ipAddress?: string
  userAgent?: string
}

/**
 * Log an admin activity to the database
 */
export async function logAdminActivity({
  adminId,
  action,
  resourceType,
  resourceId,
  description,
  metadata = {},
  status = 'success',
  errorMessage,
  duration,
  ipAddress,
  userAgent,
}: LogAdminActivityParams): Promise<void> {
  try {
    // Get IP and User Agent from headers if not provided
    let resolvedIpAddress = ipAddress
    let resolvedUserAgent = userAgent

    if (!resolvedIpAddress || !resolvedUserAgent) {
      try {
        const headersList = await headers()
        if (!resolvedIpAddress) {
          resolvedIpAddress =
            headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            headersList.get('x-real-ip') ||
            undefined
        }
        if (!resolvedUserAgent) {
          resolvedUserAgent = headersList.get('user-agent') || undefined
        }
      } catch {
        // Headers might not be available in all contexts
      }
    }

    await prisma.adminActivity.create({
      data: {
        adminId,
        action,
        resourceType,
        resourceId,
        description,
        metadata: metadata as Prisma.InputJsonValue,
        status,
        errorMessage,
        duration,
        ipAddress: resolvedIpAddress,
        userAgent: resolvedUserAgent,
      },
    })
  } catch (error) {
    // Log error but don't throw - activity logging should not break main flow
    console.error('Failed to log admin activity:', error)
  }
}

/**
 * Wrapper to track activity with timing
 */
export async function withActivityTracking<T>(
  params: Omit<LogAdminActivityParams, 'duration' | 'status' | 'errorMessage'>,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now()

  try {
    const result = await operation()
    const duration = Date.now() - startTime

    await logAdminActivity({
      ...params,
      duration,
      status: 'success',
    })

    return result
  } catch (error) {
    const duration = Date.now() - startTime

    await logAdminActivity({
      ...params,
      duration,
      status: 'failure',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    throw error
  }
}

/**
 * Get activity statistics for the dashboard
 */
export async function getActivityStats(options?: {
  startDate?: Date
  endDate?: Date
  adminId?: string
}) {
  const { startDate, endDate, adminId } = options || {}

  const where: Prisma.AdminActivityWhereInput = {}

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  if (adminId) {
    where.adminId = adminId
  }

  // Get total activity count
  const totalActivities = await prisma.adminActivity.count({ where })

  // Get activities by action type
  const activitiesByAction = await prisma.adminActivity.groupBy({
    by: ['action'],
    where,
    _count: true,
    orderBy: { _count: { action: 'desc' } },
    take: 10,
  })

  // Get activities by admin
  const activitiesByAdmin = await prisma.adminActivity.groupBy({
    by: ['adminId'],
    where,
    _count: true,
    orderBy: { _count: { adminId: 'desc' } },
    take: 10,
  })

  // Get admin details for the top admins
  const adminIds = activitiesByAdmin.map(a => a.adminId)
  const admins = await prisma.superAdmin.findMany({
    where: { id: { in: adminIds } },
    select: { id: true, name: true, email: true, role: true },
  })

  const adminMap = new Map(admins.map(a => [a.id, a]))

  // Get activities by resource type
  const activitiesByResource = await prisma.adminActivity.groupBy({
    by: ['resourceType'],
    where,
    _count: true,
    orderBy: { _count: { resourceType: 'desc' } },
  })

  // Get success vs failure rate
  const activitiesByStatus = await prisma.adminActivity.groupBy({
    by: ['status'],
    where,
    _count: true,
  })

  // Get hourly distribution (for busiest hours)
  const recentActivities = await prisma.adminActivity.findMany({
    where: {
      ...where,
      createdAt: {
        gte: startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        ...(endDate && { lte: endDate }),
      },
    },
    select: { createdAt: true },
  })

  const hourlyDistribution = new Array(24).fill(0)
  recentActivities.forEach(activity => {
    const hour = activity.createdAt.getHours()
    hourlyDistribution[hour]++
  })

  // Find busiest hours
  const busiestHours = hourlyDistribution
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  // Get daily activity for the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const dailyActivities = await prisma.adminActivity.groupBy({
    by: ['createdAt'],
    where: {
      ...where,
      createdAt: { gte: thirtyDaysAgo },
    },
    _count: true,
  })

  // Aggregate by date
  const dailyMap = new Map<string, number>()
  dailyActivities.forEach(activity => {
    const date = activity.createdAt.toISOString().split('T')[0]
    dailyMap.set(date, (dailyMap.get(date) || 0) + activity._count)
  })

  // Fill in missing dates with 0
  const dailyActivityData: { date: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    dailyActivityData.push({
      date,
      count: dailyMap.get(date) || 0,
    })
  }

  // Get average response time
  const avgDurationResult = await prisma.adminActivity.aggregate({
    where: {
      ...where,
      duration: { not: null },
    },
    _avg: { duration: true },
  })

  return {
    totalActivities,
    activitiesByAction: activitiesByAction.map(a => ({
      action: a.action,
      count: a._count,
    })),
    activitiesByAdmin: activitiesByAdmin.map(a => ({
      adminId: a.adminId,
      admin: adminMap.get(a.adminId),
      count: a._count,
    })),
    activitiesByResource: activitiesByResource.map(a => ({
      resourceType: a.resourceType,
      count: a._count,
    })),
    activitiesByStatus: activitiesByStatus.map(a => ({
      status: a.status,
      count: a._count,
    })),
    hourlyDistribution,
    busiestHours,
    dailyActivityData,
    avgResponseTime: avgDurationResult._avg.duration || 0,
  }
}

/**
 * Get recent activities for the feed
 */
export async function getRecentActivities(options?: {
  limit?: number
  adminId?: string
  action?: string
  resourceType?: string
  startDate?: Date
  endDate?: Date
  page?: number
}) {
  const {
    limit = 50,
    adminId,
    action,
    resourceType,
    startDate,
    endDate,
    page = 1,
  } = options || {}

  const where: Prisma.AdminActivityWhereInput = {}

  if (adminId) where.adminId = adminId
  if (action) where.action = action
  if (resourceType) where.resourceType = resourceType

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const [activities, total] = await Promise.all([
    prisma.adminActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.adminActivity.count({ where }),
  ])

  // Get admin details
  const adminIds = [...new Set(activities.map(a => a.adminId))]
  const admins = await prisma.superAdmin.findMany({
    where: { id: { in: adminIds } },
    select: { id: true, name: true, email: true, role: true },
  })

  const adminMap = new Map(admins.map(a => [a.id, a]))

  return {
    activities: activities.map(activity => ({
      ...activity,
      admin: adminMap.get(activity.adminId),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
