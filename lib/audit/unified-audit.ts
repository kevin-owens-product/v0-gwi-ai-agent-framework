/**
 * Unified Cross-Portal Audit Logging System
 *
 * This module provides a unified audit logging interface for all three portals:
 * - User Dashboard (USER portal)
 * - Admin Portal (ADMIN portal)
 * - GWI Team Portal (GWI portal)
 *
 * It consolidates the separate audit logging systems (AuditLog, PlatformAuditLog,
 * GWIAuditLog) into a single unified model (PortalAuditLog) while maintaining
 * backward compatibility.
 */

import { prisma } from "@/lib/db"
import { Prisma, PortalType } from "@prisma/client"
import type { NextRequest } from "next/server"
import type { PortalSession } from "@/lib/auth/portal-session"

// ============================================================================
// Types
// ============================================================================

/**
 * Audit actions that can be logged across all portals
 */
export type AuditAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "execute"
  | "export"
  | "import"
  | "login"
  | "logout"
  | "invite"
  | "join"
  | "leave"
  | "approve"
  | "reject"
  | "suspend"
  | "reactivate"
  | "configure"
  | "deploy"
  | "analyze"
  | "acknowledge"
  | "archive"
  | "restore"

/**
 * Resource types that can be audited across all portals
 */
export type AuditResourceType =
  // User portal resources
  | "user"
  | "organization"
  | "agent"
  | "agent_run"
  | "insight"
  | "data_source"
  | "settings"
  | "api_key"
  | "invitation"
  | "workflow"
  | "report"
  | "dashboard"
  | "audience"
  | "crosstab"
  | "chart"
  | "template"
  | "team_member"
  | "memory"
  | "comment"
  | "shared_link"
  | "alert"
  | "brand_tracking"
  // Admin portal resources
  | "tenant"
  | "super_admin"
  | "admin_role"
  | "platform_settings"
  | "feature_flag"
  | "system_rule"
  | "billing"
  | "subscription"
  // GWI portal resources
  | "survey"
  | "question"
  | "taxonomy"
  | "taxonomy_category"
  | "taxonomy_attribute"
  | "pipeline"
  | "pipeline_run"
  | "llm_config"
  | "prompt_template"
  | "agent_template"
  | "gwi_data_source"
  | "monitoring_alert"
  | "gwi_api_key"
  | "portal_settings"

/**
 * Context information for audit logging
 */
export interface AuditContext {
  /** Portal type */
  portal: PortalType
  /** User ID for user portal sessions */
  userId?: string
  /** Admin ID for admin/gwi portal sessions */
  adminId?: string
  /** User's email address */
  email?: string
  /** User's role */
  role?: string
  /** Organization ID context */
  orgId?: string
  /** IP address from request */
  ipAddress?: string
  /** User agent from request */
  userAgent?: string
}

/**
 * Input for creating an audit log entry
 */
export interface AuditLogInput {
  /** Action being performed */
  action: AuditAction | string
  /** Type of resource being acted upon */
  resourceType: AuditResourceType | string
  /** ID of the specific resource */
  resourceId?: string
  /** State before the action (for updates/deletes) */
  previousState?: Record<string, unknown>
  /** State after the action (for creates/updates) */
  newState?: Record<string, unknown>
  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Full audit log entry with context
 */
export interface AuditLogEntry extends AuditLogInput {
  context: AuditContext
}

/**
 * Options for querying audit logs
 */
export interface AuditLogQueryOptions {
  /** Filter by portal type(s) */
  portals?: PortalType[]
  /** Filter by user ID */
  userId?: string
  /** Filter by admin ID */
  adminId?: string
  /** Filter by organization ID */
  orgId?: string
  /** Filter by action(s) */
  actions?: string[]
  /** Filter by resource type(s) */
  resourceTypes?: string[]
  /** Filter by resource ID */
  resourceId?: string
  /** Start date for time range */
  startDate?: Date
  /** End date for time range */
  endDate?: Date
  /** Maximum number of results */
  limit?: number
  /** Number of results to skip */
  offset?: number
  /** Order by field */
  orderBy?: "createdAt" | "action" | "resourceType"
  /** Order direction */
  orderDirection?: "asc" | "desc"
}

/**
 * Result of an audit log query
 */
export interface AuditLogQueryResult {
  logs: Array<{
    id: string
    portal: PortalType
    userId: string | null
    adminId: string | null
    action: string
    resourceType: string
    resourceId: string | null
    previousState: Prisma.JsonValue | null
    newState: Prisma.JsonValue | null
    metadata: Prisma.JsonValue | null
    orgId: string | null
    createdAt: Date
  }>
  total: number
  hasMore: boolean
}

// ============================================================================
// Audit Context Creation
// ============================================================================

/**
 * Maps the internal portal type to the Prisma PortalType enum
 */
function mapPortalType(type: "user" | "admin" | "gwi"): PortalType {
  switch (type) {
    case "user":
      return "USER"
    case "admin":
      return "ADMIN"
    case "gwi":
      return "GWI"
  }
}

/**
 * Extracts request metadata (IP address, user agent) from a request
 *
 * @param request - The incoming HTTP request
 * @returns Object containing IP address and user agent
 */
export function getRequestMetadata(request: NextRequest | Request): {
  ipAddress: string | undefined
  userAgent: string | undefined
} {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined,
    userAgent: request.headers.get("user-agent") || undefined,
  }
}

/**
 * Creates an audit context from a portal session and request
 *
 * This function should be used in API routes to create the context needed
 * for audit logging. It extracts all relevant information from the session
 * and request.
 *
 * @param session - The authenticated portal session
 * @param request - The incoming HTTP request
 * @returns Audit context for logging
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   const auth = await authenticateGWI(request)
 *   if (!auth.success) return auth.response
 *
 *   const auditContext = createAuditContext(auth.session, request)
 *
 *   // ... perform action ...
 *
 *   await logAuditEvent({
 *     context: auditContext,
 *     action: 'create',
 *     resourceType: 'survey',
 *     resourceId: survey.id,
 *     newState: survey,
 *   })
 * }
 */
export function createAuditContext(
  session: PortalSession,
  request: NextRequest | Request
): AuditContext {
  const metadata = getRequestMetadata(request)
  const portal = mapPortalType(session.type)

  return {
    portal,
    userId: session.type === "user" ? session.userId : undefined,
    adminId: session.type !== "user" ? session.userId : undefined,
    email: session.email,
    role: session.role,
    orgId: session.organizationId,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
  }
}

/**
 * Creates an audit context for user portal actions
 *
 * @param userId - The user ID
 * @param email - The user's email
 * @param orgId - The organization ID
 * @param request - The incoming HTTP request (optional)
 * @returns Audit context for user portal
 */
export function createUserAuditContext(
  userId: string,
  email: string,
  orgId: string,
  request?: NextRequest | Request
): AuditContext {
  const metadata = request ? getRequestMetadata(request) : {}

  return {
    portal: "USER",
    userId,
    email,
    orgId,
    ...metadata,
  }
}

/**
 * Creates an audit context for admin portal actions
 *
 * @param adminId - The admin ID
 * @param email - The admin's email
 * @param role - The admin's role
 * @param request - The incoming HTTP request (optional)
 * @returns Audit context for admin portal
 */
export function createAdminAuditContext(
  adminId: string,
  email: string,
  role: string,
  request?: NextRequest | Request
): AuditContext {
  const metadata = request ? getRequestMetadata(request) : {}

  return {
    portal: "ADMIN",
    adminId,
    email,
    role,
    ...metadata,
  }
}

/**
 * Creates an audit context for GWI portal actions
 *
 * @param adminId - The admin ID
 * @param email - The admin's email
 * @param role - The admin's role
 * @param request - The incoming HTTP request (optional)
 * @returns Audit context for GWI portal
 */
export function createGWIAuditContext(
  adminId: string,
  email: string,
  role: string,
  request?: NextRequest | Request
): AuditContext {
  const metadata = request ? getRequestMetadata(request) : {}

  return {
    portal: "GWI",
    adminId,
    email,
    role,
    ...metadata,
  }
}

// ============================================================================
// Audit Logging Functions
// ============================================================================

/**
 * Logs an audit event to the unified audit log
 *
 * This is the primary function for logging audit events. It accepts a complete
 * audit log entry with context and writes it to the PortalAuditLog table.
 *
 * @param entry - The complete audit log entry
 * @returns The created audit log record
 *
 * @example
 * await logAuditEvent({
 *   context: auditContext,
 *   action: 'update',
 *   resourceType: 'survey',
 *   resourceId: survey.id,
 *   previousState: oldSurvey,
 *   newState: updatedSurvey,
 *   metadata: { reason: 'Updated survey title' },
 * })
 */
export async function logAuditEvent(entry: AuditLogEntry) {
  try {
    return await prisma.portalAuditLog.create({
      data: {
        portal: entry.context.portal,
        userId: entry.context.userId,
        adminId: entry.context.adminId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        previousState: entry.previousState as Prisma.InputJsonValue,
        newState: entry.newState as Prisma.InputJsonValue,
        metadata: {
          email: entry.context.email,
          role: entry.context.role,
          ipAddress: entry.context.ipAddress,
          userAgent: entry.context.userAgent,
          ...(entry.metadata || {}),
        } as Prisma.InputJsonValue,
        orgId: entry.context.orgId,
      },
    })
  } catch (error) {
    console.error("Failed to log audit event:", error)
    // Don't throw - audit logging should not break the main operation
    return null
  }
}

/**
 * Logs an audit event with a simplified interface
 *
 * This is a convenience function that accepts context and input separately.
 *
 * @param context - The audit context
 * @param input - The audit log input
 * @returns The created audit log record
 */
export async function logAudit(context: AuditContext, input: AuditLogInput) {
  return logAuditEvent({ context, ...input })
}

/**
 * Logs multiple audit events in a batch
 *
 * This is useful for bulk operations where multiple resources are affected.
 *
 * @param entries - Array of audit log entries
 * @returns The count of created records
 */
export async function logBatchAuditEvents(entries: AuditLogEntry[]) {
  try {
    const result = await prisma.portalAuditLog.createMany({
      data: entries.map((entry) => ({
        portal: entry.context.portal,
        userId: entry.context.userId,
        adminId: entry.context.adminId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        previousState: entry.previousState as Prisma.InputJsonValue,
        newState: entry.newState as Prisma.InputJsonValue,
        metadata: {
          email: entry.context.email,
          role: entry.context.role,
          ipAddress: entry.context.ipAddress,
          userAgent: entry.context.userAgent,
          ...(entry.metadata || {}),
        } as Prisma.InputJsonValue,
        orgId: entry.context.orgId,
      })),
    })
    return result.count
  } catch (error) {
    console.error("Failed to log batch audit events:", error)
    return 0
  }
}

// ============================================================================
// Portal-Specific Logging Helpers
// ============================================================================

/**
 * Logs an audit event for the user portal
 *
 * @param userId - The user ID
 * @param orgId - The organization ID
 * @param input - The audit log input
 * @param request - Optional request for metadata
 */
export async function logUserAudit(
  userId: string,
  email: string,
  orgId: string,
  input: AuditLogInput,
  request?: NextRequest | Request
) {
  const context = createUserAuditContext(userId, email, orgId, request)
  return logAudit(context, input)
}

/**
 * Logs an audit event for the admin portal
 *
 * @param adminId - The admin ID
 * @param email - The admin's email
 * @param role - The admin's role
 * @param input - The audit log input
 * @param request - Optional request for metadata
 */
export async function logAdminAudit(
  adminId: string,
  email: string,
  role: string,
  input: AuditLogInput,
  request?: NextRequest | Request
) {
  const context = createAdminAuditContext(adminId, email, role, request)
  return logAudit(context, input)
}

/**
 * Logs an audit event for the GWI portal
 *
 * @param adminId - The admin ID
 * @param email - The admin's email
 * @param role - The admin's role
 * @param input - The audit log input
 * @param request - Optional request for metadata
 */
export async function logGWIAudit(
  adminId: string,
  email: string,
  role: string,
  input: AuditLogInput,
  request?: NextRequest | Request
) {
  const context = createGWIAuditContext(adminId, email, role, request)
  return logAudit(context, input)
}

// ============================================================================
// Audit Log Query Functions
// ============================================================================

/**
 * Queries audit logs with flexible filtering options
 *
 * This function allows querying audit logs across all portals with various
 * filters. It supports pagination, time range filtering, and filtering by
 * portal type, user, action, and resource type.
 *
 * @param options - Query options
 * @returns Query result with logs, total count, and pagination info
 *
 * @example
 * // Get all GWI portal audit logs for surveys
 * const result = await queryAuditLogs({
 *   portals: ['GWI'],
 *   resourceTypes: ['survey'],
 *   limit: 50,
 * })
 *
 * @example
 * // Get all audit logs for a specific organization
 * const result = await queryAuditLogs({
 *   orgId: 'org_123',
 *   startDate: new Date('2024-01-01'),
 *   limit: 100,
 * })
 */
export async function queryAuditLogs(
  options: AuditLogQueryOptions = {}
): Promise<AuditLogQueryResult> {
  const {
    portals,
    userId,
    adminId,
    orgId,
    actions,
    resourceTypes,
    resourceId,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
    orderBy = "createdAt",
    orderDirection = "desc",
  } = options

  // Build the where clause
  const where: Prisma.PortalAuditLogWhereInput = {}

  if (portals?.length) {
    where.portal = { in: portals }
  }

  if (userId) {
    where.userId = userId
  }

  if (adminId) {
    where.adminId = adminId
  }

  if (orgId) {
    where.orgId = orgId
  }

  if (actions?.length) {
    where.action = { in: actions }
  }

  if (resourceTypes?.length) {
    where.resourceType = { in: resourceTypes }
  }

  if (resourceId) {
    where.resourceId = resourceId
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) {
      where.createdAt.gte = startDate
    }
    if (endDate) {
      where.createdAt.lte = endDate
    }
  }

  // Execute the query
  const [logs, total] = await Promise.all([
    prisma.portalAuditLog.findMany({
      where,
      orderBy: { [orderBy]: orderDirection },
      take: limit,
      skip: offset,
    }),
    prisma.portalAuditLog.count({ where }),
  ])

  return {
    logs,
    total,
    hasMore: offset + logs.length < total,
  }
}

/**
 * Gets audit logs for a specific portal
 *
 * @param portal - The portal type
 * @param options - Additional query options
 * @returns Query result
 */
export async function getPortalAuditLogs(
  portal: PortalType,
  options: Omit<AuditLogQueryOptions, "portals"> = {}
) {
  return queryAuditLogs({ ...options, portals: [portal] })
}

/**
 * Gets audit logs for the user portal
 */
export async function getUserPortalAuditLogs(
  options: Omit<AuditLogQueryOptions, "portals"> = {}
) {
  return getPortalAuditLogs("USER", options)
}

/**
 * Gets audit logs for the admin portal
 */
export async function getAdminPortalAuditLogs(
  options: Omit<AuditLogQueryOptions, "portals"> = {}
) {
  return getPortalAuditLogs("ADMIN", options)
}

/**
 * Gets audit logs for the GWI portal
 */
export async function getGWIPortalAuditLogs(
  options: Omit<AuditLogQueryOptions, "portals"> = {}
) {
  return getPortalAuditLogs("GWI", options)
}

/**
 * Gets audit logs for a specific resource
 *
 * @param resourceType - The resource type
 * @param resourceId - The resource ID
 * @param options - Additional query options
 * @returns Query result
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  options: Omit<AuditLogQueryOptions, "resourceTypes" | "resourceId"> = {}
) {
  return queryAuditLogs({
    ...options,
    resourceTypes: [resourceType],
    resourceId,
  })
}

/**
 * Gets audit logs for a specific user (across user portal)
 *
 * @param userId - The user ID
 * @param options - Additional query options
 * @returns Query result
 */
export async function getUserAuditLogs(
  userId: string,
  options: Omit<AuditLogQueryOptions, "userId"> = {}
) {
  return queryAuditLogs({ ...options, userId })
}

/**
 * Gets audit logs for a specific admin (across admin and GWI portals)
 *
 * @param adminId - The admin ID
 * @param options - Additional query options
 * @returns Query result
 */
export async function getAdminAuditLogs(
  adminId: string,
  options: Omit<AuditLogQueryOptions, "adminId"> = {}
) {
  return queryAuditLogs({ ...options, adminId })
}

/**
 * Gets audit logs for a specific organization
 *
 * @param orgId - The organization ID
 * @param options - Additional query options
 * @returns Query result
 */
export async function getOrgAuditLogs(
  orgId: string,
  options: Omit<AuditLogQueryOptions, "orgId"> = {}
) {
  return queryAuditLogs({ ...options, orgId })
}

// ============================================================================
// Audit Log Statistics
// ============================================================================

/**
 * Gets summary statistics for audit logs
 *
 * @param options - Filter options
 * @returns Summary statistics
 */
export async function getAuditLogStats(
  options: Pick<AuditLogQueryOptions, "portals" | "orgId" | "startDate" | "endDate"> = {}
) {
  const { portals, orgId, startDate, endDate } = options

  const where: Prisma.PortalAuditLogWhereInput = {}

  if (portals?.length) {
    where.portal = { in: portals }
  }

  if (orgId) {
    where.orgId = orgId
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const [
    total,
    byPortal,
    byAction,
    byResourceType,
  ] = await Promise.all([
    prisma.portalAuditLog.count({ where }),
    prisma.portalAuditLog.groupBy({
      by: ["portal"],
      where,
      _count: true,
    }),
    prisma.portalAuditLog.groupBy({
      by: ["action"],
      where,
      _count: true,
      orderBy: { _count: { action: "desc" } },
      take: 10,
    }),
    prisma.portalAuditLog.groupBy({
      by: ["resourceType"],
      where,
      _count: true,
      orderBy: { _count: { resourceType: "desc" } },
      take: 10,
    }),
  ])

  return {
    total,
    byPortal: byPortal.map((p) => ({
      portal: p.portal,
      count: p._count,
    })),
    topActions: byAction.map((a) => ({
      action: a.action,
      count: a._count,
    })),
    topResourceTypes: byResourceType.map((r) => ({
      resourceType: r.resourceType,
      count: r._count,
    })),
  }
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { PortalType } from "@prisma/client"
