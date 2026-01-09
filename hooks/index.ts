/**
 * GWI AI Agent Framework - Custom Hooks
 *
 * This module exports all custom hooks for the application.
 */

// Organization & Auth
export { OrganizationProvider, useOrganization, useCurrentOrg, useOrgRole, useOrgPlan } from './use-organization'

// Permissions
export {
  usePermissions,
  useCanCreateAgents,
  useCanDeleteAgents,
  useCanExecuteAgents,
  useCanManageTeam,
  useCanManageBilling,
  useCanViewAuditLogs,
} from './use-permissions'

// Agents
export { useAgents, useAgent } from './use-agents'

// Team Management
export { useTeamMembers, useInvitations } from './use-team'
export type { TeamMember, Invitation } from './use-team'

// API Keys
export { useApiKeys } from './use-api-keys'
export type { ApiKey, ApiKeyWithSecret } from './use-api-keys'

// Audit Log
export { useAuditLog } from './use-audit-log'
export type { AuditLogEntry } from './use-audit-log'

// Billing
export { useBilling, useSubscription, useUsage } from './use-billing'
export type { Subscription, UsageMetrics, Invoice } from './use-billing'

// Data Sources
export { useDataSources, useDataSource } from './use-data-sources'
export type { DataSource, DataSourceType, DataSourceStatus } from './use-data-sources'

// Insights
export { useInsights, useInsight } from './use-insights'
export type { Insight, InsightType } from './use-insights'

// Utilities
export { useDebounce } from './use-debounce'
export { useLocalStorage } from './use-local-storage'
