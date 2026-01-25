/**
 * Admin Components Barrel Export
 *
 * Centralized exports for all admin portal-specific components.
 *
 * @module components/admin
 */

// Layout
export { AdminSidebar } from "./sidebar"
export { AdminHeader } from "./header"

// Data Display
export { AdminDataTable } from "./data-table"

// Bulk Operations
export {
  BulkSelectCheckbox,
  BulkActionBar,
  BulkActionButton,
  BulkProgressDialog,
} from "./bulk-operations"
export type {
  BulkSelectCheckboxProps,
  BulkActionBarProps,
  BulkAction,
  BulkOperationResult,
  BulkActionButtonProps,
  BulkProgressDialogProps,
  BulkOperationProgress,
  BulkOperationStatus,
} from "./bulk-operations"
