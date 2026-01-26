/**
 * Authentication Module
 *
 * This module provides unified authentication and authorization utilities
 * for all three portals: User Dashboard, Admin Portal, and GWI Portal.
 *
 * @module lib/auth
 *
 * @example
 * // Import portal session utilities
 * import {
 *   getPortalSession,
 *   hasPermission,
 *   canAccessResource,
 *   type PortalSession,
 *   type PortalType
 * } from '@/lib/auth'
 *
 * // Import middleware helpers
 * import {
 *   authenticateRequest,
 *   withAuth,
 *   withGWIAuth,
 *   withAdminAuth
 * } from '@/lib/auth'
 */

// ============================================================================
// Portal Session Management
// ============================================================================

export {
  // Types
  type PortalType,
  type PortalSession,
  type UserSession,
  type AdminSession,
  type GWISession,

  // Portal Detection
  detectPortalType,
  getPortalCookieName,

  // Session Retrieval
  getPortalSession,
  getPortalSessionByType,

  // Permission Checking
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,

  // Resource Access Control
  canAccessResource,
  canModifyResource,

  // Session Validation
  isSessionValid,
  getSessionRemainingTime,
  isSessionExpiringSoon,

  // Type Guards
  isUserSession,
  isAdminSession,
  isGWISession,
} from "./portal-session"

// ============================================================================
// Middleware Helpers
// ============================================================================

export {
  // Types
  type AuthOptions,
  type AuthResult,
  type AuthError,
  type AuthMiddlewareResult,
  type ProtectedHandler,

  // Core Middleware
  authenticateRequest,
  authenticatePortal,

  // Portal-Specific Authentication
  authenticateAdmin,
  authenticateGWI,
  authenticateUser,

  // Higher-Order Route Handlers
  withAuth,
  withAdminAuth,
  withGWIAuth,
  withUserAuth,

  // Resource Authorization
  checkResourceAccess,
  checkPermission,

  // Request Context
  getRequestMetadata,
  createAuditContext,

  // Response Helpers
  unauthorizedResponse,
  forbiddenResponse,
  loginRedirect,
} from "./portal-middleware"
