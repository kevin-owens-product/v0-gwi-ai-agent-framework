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

// Reports
export { useReportForm } from './use-report-form'

// Collaboration
export { useComments, useComment } from './use-comments'
export type { Comment } from './use-comments'
export { useSharedLinks, useSharedLink, usePublicSharedContent } from './use-shared-links'
export type { SharedLink, SharedLinkView, SharedLinkPermission } from './use-shared-links'

// Saved Views & Favorites
export {
  useSavedViews,
  useSavedView,
  usePinnedViews,
  useFavorites,
  useRecentViews,
} from './use-saved-views'
export type {
  SavedView,
  SavedViewType,
  SavedViewFilters,
  CreateSavedViewInput,
  UpdateSavedViewInput,
} from './use-saved-views'

// Scheduled Exports
export {
  useScheduledExports,
  useScheduledExport,
  useExportHistory,
} from './use-scheduled-exports'
export type {
  ScheduledExport,
  ScheduledExportWithHistory,
  ExportHistory,
  ExportFormat,
  ExportStatus,
  EntityType,
  CreateScheduledExportInput,
  UpdateScheduledExportInput,
} from './use-scheduled-exports'

// User Preferences
export {
  usePreferences,
  useThemePreference,
  useNotificationPreferences,
  useDisplayPreferences,
  defaultPreferences,
} from './use-preferences'
export type { UserPreferences, PreferencesUpdate, Theme } from './use-preferences'

// Utilities
export { useDebounce } from './use-debounce'
export { useLocalStorage } from './use-local-storage'

// Bulk Selection
export { useBulkSelection, useBulkSelectionWithVisibility } from './use-bulk-selection'
export type { BulkSelectionOptions, BulkSelectionResult } from './use-bulk-selection'

// Keyboard Shortcuts
export { useKeyboardShortcuts, useShortcutHandler } from './use-keyboard-shortcuts'
export type { ShortcutHandlers, UseKeyboardShortcutsOptions, UseKeyboardShortcutsReturn } from './use-keyboard-shortcuts'

// Custom Alerts
export { useAlerts, useAlert, useAlertHistory } from './use-alerts'
export type {
  CustomAlert,
  AlertHistoryEntry,
  AlertCondition,
  AlertChannel,
  AlertStatus,
  AlertOperator,
  AlertEntityType,
  CreateAlertInput,
  UpdateAlertInput,
  AcknowledgeAlertInput,
} from './use-alerts'

// Data Connectors
export { useConnectors, useConnector } from './use-connectors'
export type {
  Connector,
  ConnectorWithHistory,
  SyncLog,
  CreateConnectorInput,
  UpdateConnectorInput,
} from './use-connectors'

// API Error Handling
export { useApiErrorHandler } from './use-api-error-handler'
export type { ErrorType } from './use-api-error-handler'

// Async Operations
export { useAsyncOperation } from './use-async-operation'
