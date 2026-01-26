/**
 * Unified Portal Session Management
 *
 * This module provides a unified interface for managing authentication sessions
 * across all three portals: User Dashboard, Admin Portal, and GWI Portal.
 */

import { cookies } from "next/headers"
import { auth } from "@/lib/auth"
import { validateSuperAdminSession } from "@/lib/super-admin"
import {
  GWI_ROLE_PERMISSIONS,
  type GWIPermission,
  hasGWIPermission,
} from "@/lib/gwi-permissions"
import {
  SUPER_ADMIN_ROLE_PERMISSIONS,
  type SuperAdminPermission,
  hasSuperAdminPermission,
} from "@/lib/super-admin"
import type { SuperAdminRole } from "@prisma/client"

// ============================================================================
// Types
// ============================================================================

/**
 * The three portal types in the application
 */
export type PortalType = "user" | "admin" | "gwi"

/**
 * Unified portal session interface
 * Provides a consistent structure for session data across all portals
 */
export interface PortalSession {
  /** The type of portal this session belongs to */
  type: PortalType
  /** Unique identifier for the authenticated user */
  userId: string
  /** User's email address */
  email: string
  /** Display name of the user */
  name: string | null
  /** User's role within the portal */
  role: string
  /** Organization ID (for user portal sessions) */
  organizationId?: string
  /** Permissions granted to this session */
  permissions: string[]
  /** When this session expires */
  expiresAt: Date
  /** Raw session data for portal-specific operations */
  raw: UserSession | AdminSession | GWISession
}

/**
 * User portal session (NextAuth-based)
 */
export interface UserSession {
  type: "user"
  user: {
    id: string
    email: string
    name: string | null
  }
}

/**
 * Admin portal session
 */
export interface AdminSession {
  type: "admin"
  adminId: string
  admin: {
    id: string
    email: string
    name: string
    role: SuperAdminRole
    isActive: boolean
  }
  expiresAt: Date
}

/**
 * GWI portal session (same structure as admin but accessed via gwiToken)
 */
export interface GWISession {
  type: "gwi"
  adminId: string
  admin: {
    id: string
    email: string
    name: string
    role: SuperAdminRole
    isActive: boolean
  }
  expiresAt: Date
}

// ============================================================================
// Portal Detection
// ============================================================================

/**
 * Path patterns for each portal type
 */
const PORTAL_PATH_PATTERNS: Record<PortalType, RegExp[]> = {
  user: [/^\/dashboard/, /^\/settings/, /^\/projects/, /^\/agents/],
  admin: [/^\/admin/, /^\/api\/admin/],
  gwi: [/^\/gwi/, /^\/api\/gwi/],
}

/**
 * Detects the portal type from a request pathname
 *
 * @param pathname - The URL pathname to analyze
 * @returns The detected portal type, defaults to 'user' if no match
 *
 * @example
 * detectPortalType('/admin/tenants') // returns 'admin'
 * detectPortalType('/gwi/surveys') // returns 'gwi'
 * detectPortalType('/dashboard') // returns 'user'
 */
export function detectPortalType(pathname: string): PortalType {
  for (const [portal, patterns] of Object.entries(PORTAL_PATH_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(pathname)) {
        return portal as PortalType
      }
    }
  }
  return "user" // Default to user portal
}

/**
 * Gets the cookie name used for authentication for a given portal type
 *
 * @param portalType - The portal type
 * @returns The cookie name used for that portal's authentication
 */
export function getPortalCookieName(portalType: PortalType): string | null {
  switch (portalType) {
    case "admin":
      return "adminToken"
    case "gwi":
      return "gwiToken"
    case "user":
      return null // User portal uses NextAuth session cookies
  }
}

// ============================================================================
// Session Retrieval
// ============================================================================

/**
 * Gets the unified portal session from an HTTP request
 *
 * This function automatically detects the portal type from the request URL
 * and retrieves the appropriate session.
 *
 * @param request - The incoming HTTP request
 * @returns The portal session if authenticated, null otherwise
 *
 * @example
 * const session = await getPortalSession(request)
 * if (!session) {
 *   return new Response('Unauthorized', { status: 401 })
 * }
 */
export async function getPortalSession(
  request: Request
): Promise<PortalSession | null> {
  const url = new URL(request.url)
  const portalType = detectPortalType(url.pathname)

  return getPortalSessionByType(portalType)
}

/**
 * Gets the portal session for a specific portal type
 *
 * @param portalType - The type of portal to get the session for
 * @returns The portal session if authenticated, null otherwise
 */
export async function getPortalSessionByType(
  portalType: PortalType
): Promise<PortalSession | null> {
  switch (portalType) {
    case "user":
      return getUserPortalSession()
    case "admin":
      return getAdminPortalSession()
    case "gwi":
      return getGWIPortalSession()
  }
}

/**
 * Gets the user portal session (NextAuth-based)
 */
async function getUserPortalSession(): Promise<PortalSession | null> {
  const session = await auth()

  if (!session?.user?.id || !session?.user?.email) {
    return null
  }

  // User portal sessions have a default expiry of 30 days from now
  // (NextAuth JWT sessions don't have a fixed expiry we can easily access)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  return {
    type: "user",
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name || null,
    role: "user",
    permissions: ["user:*"], // User portal has implicit permissions
    expiresAt,
    raw: {
      type: "user",
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || null,
      },
    },
  }
}

/**
 * Gets the admin portal session
 */
async function getAdminPortalSession(): Promise<PortalSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("adminToken")?.value

  if (!token) {
    return null
  }

  const session = await validateSuperAdminSession(token)
  if (!session) {
    return null
  }

  const permissions = SUPER_ADMIN_ROLE_PERMISSIONS[session.admin.role] || []

  return {
    type: "admin",
    userId: session.admin.id,
    email: session.admin.email,
    name: session.admin.name,
    role: session.admin.role,
    permissions: permissions as string[],
    expiresAt: session.expiresAt,
    raw: {
      type: "admin",
      adminId: session.adminId,
      admin: session.admin,
      expiresAt: session.expiresAt,
    },
  }
}

/**
 * Gets the GWI portal session
 */
async function getGWIPortalSession(): Promise<PortalSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("gwiToken")?.value

  if (!token) {
    return null
  }

  const session = await validateSuperAdminSession(token)
  if (!session) {
    return null
  }

  const permissions = GWI_ROLE_PERMISSIONS[session.admin.role] || []

  return {
    type: "gwi",
    userId: session.admin.id,
    email: session.admin.email,
    name: session.admin.name,
    role: session.admin.role,
    permissions: permissions as string[],
    expiresAt: session.expiresAt,
    raw: {
      type: "gwi",
      adminId: session.adminId,
      admin: session.admin,
      expiresAt: session.expiresAt,
    },
  }
}

// ============================================================================
// Permission Checking
// ============================================================================

/**
 * Checks if a portal session has a specific permission
 *
 * @param session - The portal session to check
 * @param permission - The permission to check for
 * @returns true if the session has the permission
 *
 * @example
 * if (!hasPermission(session, 'surveys:write')) {
 *   return new Response('Forbidden', { status: 403 })
 * }
 */
export function hasPermission(
  session: PortalSession,
  permission: string
): boolean {
  // Check for wildcard permissions
  const wildcardBase = permission.split(":")[0]
  if (session.permissions.includes(`${wildcardBase}:*`)) {
    return true
  }

  // Check for super wildcard
  if (
    session.permissions.includes("super:*") ||
    session.permissions.includes("gwi:*")
  ) {
    return true
  }

  // Direct permission check
  if (session.permissions.includes(permission)) {
    return true
  }

  // Portal-specific permission checks for more granular control
  switch (session.type) {
    case "admin":
      return hasSuperAdminPermission(
        session.role as SuperAdminRole,
        permission as SuperAdminPermission
      )
    case "gwi":
      return hasGWIPermission(
        session.role as SuperAdminRole,
        permission as GWIPermission
      )
    case "user":
      // User portal permissions are handled by organization membership
      return session.permissions.includes(permission)
  }
}

/**
 * Checks if a session has any of the specified permissions
 *
 * @param session - The portal session to check
 * @param permissions - Array of permissions (any match returns true)
 * @returns true if the session has any of the permissions
 */
export function hasAnyPermission(
  session: PortalSession,
  permissions: string[]
): boolean {
  return permissions.some((permission) => hasPermission(session, permission))
}

/**
 * Checks if a session has all of the specified permissions
 *
 * @param session - The portal session to check
 * @param permissions - Array of permissions (all must match)
 * @returns true if the session has all of the permissions
 */
export function hasAllPermissions(
  session: PortalSession,
  permissions: string[]
): boolean {
  return permissions.every((permission) => hasPermission(session, permission))
}

// ============================================================================
// Resource Access Control
// ============================================================================

/**
 * Checks if a session can access a resource belonging to a specific organization
 *
 * This is primarily used for user portal sessions where users should only
 * access resources within their organization. Admin and GWI portal sessions
 * typically have cross-organization access.
 *
 * @param session - The portal session to check
 * @param resourceOrgId - The organization ID that owns the resource
 * @returns true if the session can access the resource
 *
 * @example
 * if (!canAccessResource(session, project.organizationId)) {
 *   return new Response('Forbidden', { status: 403 })
 * }
 */
export function canAccessResource(
  session: PortalSession,
  resourceOrgId: string
): boolean {
  switch (session.type) {
    case "user":
      // User portal users can only access their own organization's resources
      return session.organizationId === resourceOrgId

    case "admin":
      // Admin portal users with certain permissions can access any org
      return (
        hasPermission(session, "tenants:read") ||
        hasPermission(session, "tenants:impersonate") ||
        hasPermission(session, "super:*")
      )

    case "gwi":
      // GWI portal users have cross-org access for their permitted areas
      return (
        hasPermission(session, "gwi:*") ||
        hasPermission(session, "datasources:read")
      )
  }
}

/**
 * Checks if a session can modify a resource belonging to a specific organization
 *
 * @param session - The portal session to check
 * @param resourceOrgId - The organization ID that owns the resource
 * @returns true if the session can modify the resource
 */
export function canModifyResource(
  session: PortalSession,
  resourceOrgId: string
): boolean {
  switch (session.type) {
    case "user":
      return session.organizationId === resourceOrgId

    case "admin":
      return (
        hasPermission(session, "tenants:write") ||
        hasPermission(session, "super:*")
      )

    case "gwi":
      return hasPermission(session, "gwi:*")
  }
}

// ============================================================================
// Session Validation Helpers
// ============================================================================

/**
 * Validates that a session is not expired
 *
 * @param session - The portal session to check
 * @returns true if the session is still valid
 */
export function isSessionValid(session: PortalSession): boolean {
  return session.expiresAt > new Date()
}

/**
 * Gets the remaining time until session expiry in milliseconds
 *
 * @param session - The portal session to check
 * @returns Remaining time in milliseconds, or 0 if expired
 */
export function getSessionRemainingTime(session: PortalSession): number {
  const remaining = session.expiresAt.getTime() - Date.now()
  return Math.max(0, remaining)
}

/**
 * Checks if a session will expire within a given time window
 *
 * @param session - The portal session to check
 * @param windowMs - Time window in milliseconds
 * @returns true if the session will expire within the window
 */
export function isSessionExpiringSoon(
  session: PortalSession,
  windowMs: number = 5 * 60 * 1000 // 5 minutes default
): boolean {
  return getSessionRemainingTime(session) < windowMs
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a session is a user portal session
 */
export function isUserSession(
  session: PortalSession
): session is PortalSession & { raw: UserSession } {
  return session.type === "user"
}

/**
 * Type guard to check if a session is an admin portal session
 */
export function isAdminSession(
  session: PortalSession
): session is PortalSession & { raw: AdminSession } {
  return session.type === "admin"
}

/**
 * Type guard to check if a session is a GWI portal session
 */
export function isGWISession(
  session: PortalSession
): session is PortalSession & { raw: GWISession } {
  return session.type === "gwi"
}
