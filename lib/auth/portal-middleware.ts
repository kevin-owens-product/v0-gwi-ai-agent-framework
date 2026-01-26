/**
 * Portal Middleware Helpers
 *
 * This module provides middleware utilities for protecting API routes
 * across all three portals with consistent authentication and authorization.
 */

import { NextRequest, NextResponse } from "next/server"
import {
  getPortalSession,
  getPortalSessionByType,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessResource,
  type PortalSession,
  type PortalType,
} from "./portal-session"
import {
  createAuditContext as createUnifiedAuditContext,
  logAudit,
  type AuditContext,
  type AuditLogInput,
} from "@/lib/audit/unified-audit"

// ============================================================================
// Types
// ============================================================================

/**
 * Options for authentication middleware
 */
export interface AuthOptions {
  /** Required permissions (all must be present) */
  requiredPermissions?: string[]
  /** Alternative permissions (any one is sufficient) */
  anyPermissions?: string[]
  /** Custom authorization check */
  authorize?: (session: PortalSession) => boolean | Promise<boolean>
}

/**
 * Result of authentication middleware
 */
export interface AuthResult {
  success: true
  session: PortalSession
}

/**
 * Error result from authentication middleware
 */
export interface AuthError {
  success: false
  error: string
  status: 401 | 403
  response: NextResponse
}

/**
 * Combined type for auth middleware result
 */
export type AuthMiddlewareResult = AuthResult | AuthError

/**
 * Handler function type for protected routes
 */
export type ProtectedHandler<T = unknown> = (
  request: NextRequest,
  session: PortalSession,
  context?: T
) => Promise<NextResponse> | NextResponse

// ============================================================================
// Core Middleware Functions
// ============================================================================

/**
 * Authenticates a request and returns the portal session
 *
 * @param request - The incoming HTTP request
 * @param options - Authentication options
 * @returns Authentication result with session or error
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   const auth = await authenticateRequest(request, {
 *     requiredPermissions: ['surveys:read']
 *   })
 *
 *   if (!auth.success) return auth.response
 *   const { session } = auth
 *   // ... handle authenticated request
 * }
 */
export async function authenticateRequest(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<AuthMiddlewareResult> {
  const session = await getPortalSession(request)

  if (!session) {
    return {
      success: false,
      error: "Unauthorized",
      status: 401,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  // Check required permissions (all must match)
  if (options.requiredPermissions?.length) {
    if (!hasAllPermissions(session, options.requiredPermissions)) {
      return {
        success: false,
        error: "Forbidden: Insufficient permissions",
        status: 403,
        response: NextResponse.json(
          { error: "Forbidden: Insufficient permissions" },
          { status: 403 }
        ),
      }
    }
  }

  // Check any permissions (any one is sufficient)
  if (options.anyPermissions?.length) {
    if (!hasAnyPermission(session, options.anyPermissions)) {
      return {
        success: false,
        error: "Forbidden: Insufficient permissions",
        status: 403,
        response: NextResponse.json(
          { error: "Forbidden: Insufficient permissions" },
          { status: 403 }
        ),
      }
    }
  }

  // Custom authorization check
  if (options.authorize) {
    const authorized = await options.authorize(session)
    if (!authorized) {
      return {
        success: false,
        error: "Forbidden",
        status: 403,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      }
    }
  }

  return { success: true, session }
}

/**
 * Authenticates a request for a specific portal type
 *
 * @param portalType - The expected portal type
 * @param request - The incoming HTTP request
 * @param options - Authentication options
 * @returns Authentication result with session or error
 */
export async function authenticatePortal(
  portalType: PortalType,
  _request: NextRequest, // Kept for API consistency; session is retrieved via cookies
  options: AuthOptions = {}
): Promise<AuthMiddlewareResult> {
  const session = await getPortalSessionByType(portalType)

  if (!session) {
    return {
      success: false,
      error: "Unauthorized",
      status: 401,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  // Verify portal type matches
  if (session.type !== portalType) {
    return {
      success: false,
      error: "Unauthorized: Invalid portal session",
      status: 401,
      response: NextResponse.json(
        { error: "Unauthorized: Invalid portal session" },
        { status: 401 }
      ),
    }
  }

  // Apply permission checks
  if (options.requiredPermissions?.length) {
    if (!hasAllPermissions(session, options.requiredPermissions)) {
      return {
        success: false,
        error: "Forbidden: Insufficient permissions",
        status: 403,
        response: NextResponse.json(
          { error: "Forbidden: Insufficient permissions" },
          { status: 403 }
        ),
      }
    }
  }

  if (options.anyPermissions?.length) {
    if (!hasAnyPermission(session, options.anyPermissions)) {
      return {
        success: false,
        error: "Forbidden: Insufficient permissions",
        status: 403,
        response: NextResponse.json(
          { error: "Forbidden: Insufficient permissions" },
          { status: 403 }
        ),
      }
    }
  }

  if (options.authorize) {
    const authorized = await options.authorize(session)
    if (!authorized) {
      return {
        success: false,
        error: "Forbidden",
        status: 403,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      }
    }
  }

  return { success: true, session }
}

// ============================================================================
// Portal-Specific Authentication
// ============================================================================

/**
 * Authenticates an admin portal request
 *
 * @param request - The incoming HTTP request
 * @param options - Authentication options
 * @returns Authentication result
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   const auth = await authenticateAdmin(request, {
 *     requiredPermissions: ['tenants:read']
 *   })
 *   if (!auth.success) return auth.response
 *   // ... handle admin request
 * }
 */
export async function authenticateAdmin(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<AuthMiddlewareResult> {
  return authenticatePortal("admin", request, options)
}

/**
 * Authenticates a GWI portal request
 *
 * @param request - The incoming HTTP request
 * @param options - Authentication options
 * @returns Authentication result
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   const auth = await authenticateGWI(request, {
 *     requiredPermissions: ['surveys:read']
 *   })
 *   if (!auth.success) return auth.response
 *   // ... handle GWI request
 * }
 */
export async function authenticateGWI(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<AuthMiddlewareResult> {
  return authenticatePortal("gwi", request, options)
}

/**
 * Authenticates a user portal request
 *
 * @param request - The incoming HTTP request
 * @param options - Authentication options
 * @returns Authentication result
 */
export async function authenticateUser(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<AuthMiddlewareResult> {
  return authenticatePortal("user", request, options)
}

// ============================================================================
// Higher-Order Route Handlers
// ============================================================================

/**
 * Creates a protected route handler that requires authentication
 *
 * @param handler - The handler function to wrap
 * @param options - Authentication options
 * @returns A route handler that checks authentication before calling the handler
 *
 * @example
 * export const GET = withAuth(async (request, session) => {
 *   return NextResponse.json({ user: session.email })
 * }, { requiredPermissions: ['surveys:read'] })
 */
export function withAuth<T = unknown>(
  handler: ProtectedHandler<T>,
  options: AuthOptions = {}
): (request: NextRequest, context?: T) => Promise<NextResponse> {
  return async (request: NextRequest, context?: T) => {
    const auth = await authenticateRequest(request, options)
    if (auth.success === false) return auth.response
    return handler(request, auth.session, context)
  }
}

/**
 * Creates a protected admin route handler
 *
 * @param handler - The handler function to wrap
 * @param options - Authentication options
 * @returns A route handler that checks admin authentication
 */
export function withAdminAuth<T = unknown>(
  handler: ProtectedHandler<T>,
  options: AuthOptions = {}
): (request: NextRequest, context?: T) => Promise<NextResponse> {
  return async (request: NextRequest, context?: T) => {
    const auth = await authenticateAdmin(request, options)
    if (auth.success === false) return auth.response
    return handler(request, auth.session, context)
  }
}

/**
 * Creates a protected GWI route handler
 *
 * @param handler - The handler function to wrap
 * @param options - Authentication options
 * @returns A route handler that checks GWI authentication
 */
export function withGWIAuth<T = unknown>(
  handler: ProtectedHandler<T>,
  options: AuthOptions = {}
): (request: NextRequest, context?: T) => Promise<NextResponse> {
  return async (request: NextRequest, context?: T) => {
    const auth = await authenticateGWI(request, options)
    if (auth.success === false) return auth.response
    return handler(request, auth.session, context)
  }
}

/**
 * Creates a protected user route handler
 *
 * @param handler - The handler function to wrap
 * @param options - Authentication options
 * @returns A route handler that checks user authentication
 */
export function withUserAuth<T = unknown>(
  handler: ProtectedHandler<T>,
  options: AuthOptions = {}
): (request: NextRequest, context?: T) => Promise<NextResponse> {
  return async (request: NextRequest, context?: T) => {
    const auth = await authenticateUser(request, options)
    if (auth.success === false) return auth.response
    return handler(request, auth.session, context)
  }
}

// ============================================================================
// Resource Authorization
// ============================================================================

/**
 * Checks if the session can access a resource in the given organization
 *
 * @param session - The portal session
 * @param resourceOrgId - The organization ID that owns the resource
 * @returns Error response if unauthorized, null if authorized
 */
export function checkResourceAccess(
  session: PortalSession,
  resourceOrgId: string
): NextResponse | null {
  if (!canAccessResource(session, resourceOrgId)) {
    return NextResponse.json(
      { error: "Forbidden: Cannot access resource in this organization" },
      { status: 403 }
    )
  }
  return null
}

/**
 * Middleware helper to check permission and return appropriate response
 *
 * @param session - The portal session
 * @param permission - The permission to check
 * @returns Error response if unauthorized, null if authorized
 */
export function checkPermission(
  session: PortalSession,
  permission: string
): NextResponse | null {
  if (!hasPermission(session, permission)) {
    return NextResponse.json(
      { error: `Forbidden: Missing required permission: ${permission}` },
      { status: 403 }
    )
  }
  return null
}

// ============================================================================
// Request Context Helpers
// ============================================================================

/**
 * Extracts common request metadata for audit logging
 *
 * @param request - The incoming HTTP request
 * @returns Object containing IP address and user agent
 */
export function getRequestMetadata(request: NextRequest): {
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
 * Creates an audit log entry context from session and request
 *
 * This function creates a unified audit context that can be used with
 * the unified audit logging system. It extracts all relevant information
 * from the session and request for comprehensive audit trails.
 *
 * @param session - The portal session
 * @param request - The incoming HTTP request
 * @returns Unified audit context ready for logging
 *
 * @example
 * const auth = await authenticateGWI(request)
 * if (!auth.success) return auth.response
 *
 * const auditContext = createAuditContext(auth.session, request)
 * await logAuditEvent({
 *   context: auditContext,
 *   action: 'create',
 *   resourceType: 'survey',
 *   resourceId: survey.id,
 * })
 */
export function createAuditContext(
  session: PortalSession,
  request: NextRequest
): AuditContext {
  return createUnifiedAuditContext(session, request)
}

/**
 * Legacy audit context format for backward compatibility
 *
 * @deprecated Use createAuditContext with the unified audit system instead
 */
export function createLegacyAuditContext(
  session: PortalSession,
  request: NextRequest
): {
  userId: string
  userEmail: string
  userRole: string
  portalType: PortalType
  ipAddress: string | undefined
  userAgent: string | undefined
} {
  const metadata = getRequestMetadata(request)
  return {
    userId: session.userId,
    userEmail: session.email,
    userRole: session.role,
    portalType: session.type,
    ...metadata,
  }
}

/**
 * Logs an audit event using the unified audit system
 *
 * This is a convenience function that combines creating an audit context
 * and logging in a single call.
 *
 * @param session - The portal session
 * @param request - The incoming HTTP request
 * @param input - The audit log input
 * @returns The created audit log record
 *
 * @example
 * await logPortalAuditEvent(session, request, {
 *   action: 'update',
 *   resourceType: 'survey',
 *   resourceId: survey.id,
 *   previousState: oldSurvey,
 *   newState: updatedSurvey,
 * })
 */
export async function logPortalAuditEvent(
  session: PortalSession,
  request: NextRequest,
  input: AuditLogInput
) {
  const context = createAuditContext(session, request)
  return logAudit(context, input)
}

// ============================================================================
// Response Helpers
// ============================================================================

/**
 * Creates a standardized unauthorized response
 *
 * @param message - Optional custom message
 * @returns NextResponse with 401 status
 */
export function unauthorizedResponse(
  message: string = "Unauthorized"
): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 })
}

/**
 * Creates a standardized forbidden response
 *
 * @param message - Optional custom message
 * @returns NextResponse with 403 status
 */
export function forbiddenResponse(
  message: string = "Forbidden"
): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 })
}

/**
 * Creates a redirect response to the appropriate login page
 *
 * @param portalType - The portal type to redirect to
 * @param returnUrl - Optional URL to return to after login
 * @returns NextResponse redirect
 */
export function loginRedirect(
  portalType: PortalType,
  returnUrl?: string
): NextResponse {
  const loginPaths: Record<PortalType, string> = {
    user: "/login",
    admin: "/login?type=admin",
    gwi: "/login?type=gwi",
  }

  let redirectUrl = loginPaths[portalType]
  if (returnUrl) {
    const separator = redirectUrl.includes("?") ? "&" : "?"
    redirectUrl += `${separator}returnUrl=${encodeURIComponent(returnUrl)}`
  }

  return NextResponse.redirect(new URL(redirectUrl, process.env.NEXTAUTH_URL))
}
