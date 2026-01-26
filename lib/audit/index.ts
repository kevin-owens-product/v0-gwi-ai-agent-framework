/**
 * Unified Audit Logging Module
 *
 * This module exports all audit-related functionality for use across
 * the application's three portals (User Dashboard, Admin Portal, GWI Portal).
 *
 * @example
 * import {
 *   createAuditContext,
 *   logAuditEvent,
 *   queryAuditLogs,
 * } from '@/lib/audit'
 */

export {
  // Types
  type AuditAction,
  type AuditResourceType,
  type AuditContext,
  type AuditLogInput,
  type AuditLogEntry,
  type AuditLogQueryOptions,
  type AuditLogQueryResult,
  // Context creation
  createAuditContext,
  createUserAuditContext,
  createAdminAuditContext,
  createGWIAuditContext,
  getRequestMetadata,
  // Logging functions
  logAuditEvent,
  logAudit,
  logBatchAuditEvents,
  logUserAudit,
  logAdminAudit,
  logGWIAudit,
  // Query functions
  queryAuditLogs,
  getPortalAuditLogs,
  getUserPortalAuditLogs,
  getAdminPortalAuditLogs,
  getGWIPortalAuditLogs,
  getResourceAuditLogs,
  getUserAuditLogs,
  getAdminAuditLogs,
  getOrgAuditLogs,
  // Statistics
  getAuditLogStats,
  // Re-exports
  PortalType,
} from "./unified-audit"
