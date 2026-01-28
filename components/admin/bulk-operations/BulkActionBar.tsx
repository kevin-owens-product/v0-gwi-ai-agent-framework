"use client"

/**
 * @prompt-id forge-v4.1:feature:bulk-operations:003
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { ReactNode, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChevronDown, X, Loader2, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { BulkProgressDialog, BulkOperationProgress } from "./BulkProgressDialog"

export interface BulkAction {
  /** Unique identifier for the action */
  id: string
  /** Display label for the action */
  label: string
  /** Optional icon to display */
  icon?: ReactNode
  /** Action handler - receives selected IDs and returns a promise */
  onClick: (selectedIds: string[]) => Promise<BulkOperationResult> | void
  /** Whether this is a destructive action */
  variant?: "default" | "destructive"
  /** Whether to show a separator before this action */
  separator?: boolean
  /** Whether to show confirmation dialog */
  requiresConfirmation?: boolean
  /** Custom confirmation title */
  confirmTitle?: string
  /** Custom confirmation description */
  confirmDescription?: string | ((count: number) => string)
  /** Whether this action supports progress tracking */
  showProgress?: boolean
  /** Whether this action is disabled */
  disabled?: boolean
  /** Tooltip when disabled */
  disabledReason?: string
}

export interface BulkOperationResult {
  success: number
  failed: number
  errors?: string[]
  total?: number
}

export interface BulkActionBarProps {
  /** Number of selected items */
  selectedCount: number
  /** Array of selected item IDs */
  selectedIds: string[]
  /** Total number of items available */
  totalItems?: number
  /** Actions available for bulk operations */
  actions: BulkAction[]
  /** Callback to clear selection */
  onClearSelection: () => void
  /** Callback to select all items across pages */
  onSelectAll?: () => void
  /** Whether the bar should be fixed at the bottom of the viewport */
  fixed?: boolean
  /** Custom class name */
  className?: string
  /** Label for the items (e.g., "users", "tenants") */
  itemLabel?: string
}

/**
 * A fixed or inline action bar that appears when items are selected.
 * Provides bulk action dropdown, selection count, and clear button.
 *
 * @example
 * ```tsx
 * <BulkActionBar
 *   selectedCount={selectedIds.size}
 *   selectedIds={Array.from(selectedIds)}
 *   totalItems={100}
 *   actions={[
 *     {
 *       id: "ban",
 *       label: "Ban Selected",
 *       icon: <Ban className="h-4 w-4" />,
 *       onClick: handleBulkBan,
 *       requiresConfirmation: true,
 *       confirmTitle: "Ban Users",
 *       confirmDescription: (count) => `Ban ${count} users?`,
 *     },
 *   ]}
 *   onClearSelection={() => setSelectedIds(new Set())}
 *   fixed
 * />
 * ```
 */
export function BulkActionBar({
  selectedCount,
  selectedIds,
  totalItems,
  actions,
  onClearSelection,
  onSelectAll,
  fixed = true,
  className,
  itemLabel = "item",
}: BulkActionBarProps) {
  const t = useTranslations("admin.bulk")
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressDialogOpen, setProgressDialogOpen] = useState(false)
  const [progress, setProgress] = useState<BulkOperationProgress | null>(null)

  if (selectedCount === 0) {
    return null
  }

  const handleActionClick = async (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setPendingAction(action)
      setConfirmDialogOpen(true)
      return
    }

    await executeAction(action)
  }

  const executeAction = async (action: BulkAction) => {
    if (action.showProgress) {
      setProgress({
        total: selectedIds.length,
        processed: 0,
        succeeded: 0,
        failed: 0,
        status: "processing",
        currentItem: selectedIds[0],
      })
      setProgressDialogOpen(true)
    }

    setIsProcessing(true)

    try {
      const result = await action.onClick(selectedIds)

      if (result && action.showProgress) {
        setProgress({
          total: result.total || selectedIds.length,
          processed: result.success + result.failed,
          succeeded: result.success,
          failed: result.failed,
          status: result.failed > 0 ? "completed_with_errors" : "completed",
          errors: result.errors,
        })
      } else if (action.showProgress) {
        setProgress(prev => prev ? {
          ...prev,
          processed: selectedIds.length,
          succeeded: selectedIds.length,
          status: "completed",
        } : null)
      }

      // Clear selection on success if not showing progress
      if (!action.showProgress) {
        onClearSelection()
      }
    } catch (error) {
      console.error("Bulk action failed:", error)
      if (action.showProgress) {
        setProgress(prev => prev ? {
          ...prev,
          status: "completed_with_errors",
          errors: [error instanceof Error ? error.message : "An error occurred"],
        } : null)
      }
    } finally {
      setIsProcessing(false)
      setConfirmDialogOpen(false)
      setPendingAction(null)
    }
  }

  const handleConfirm = async () => {
    if (!pendingAction) return
    await executeAction(pendingAction)
  }

  const getConfirmDescription = () => {
    if (!pendingAction) return ""
    if (typeof pendingAction.confirmDescription === "function") {
      return pendingAction.confirmDescription(selectedCount)
    }
    return pendingAction.confirmDescription ||
      t("defaultConfirmDescription", { count: selectedCount, itemLabel: itemsLabel })
  }

  const itemsLabel = `${itemLabel}${selectedCount !== 1 ? "s" : ""}`

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-4 p-3 bg-muted rounded-lg border",
          fixed && "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 shadow-lg max-w-2xl w-[calc(100%-2rem)]",
          className
        )}
      >
        {/* Selection info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {t("selected", { count: selectedCount, itemLabel: itemsLabel })}
            </span>
          </div>

          {/* Select all across pages option */}
          {onSelectAll && totalItems && totalItems > selectedCount && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={onSelectAll}
            >
              {t("selectAll", { count: totalItems })}
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("processing")}
                  </>
                ) : (
                  <>
                    {t("actions")}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              {actions.map((action, index) => (
                <div key={action.id}>
                  {action.separator && index > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => handleActionClick(action)}
                    disabled={action.disabled || isProcessing}
                    className={cn(
                      action.variant === "destructive" && "text-destructive focus:text-destructive"
                    )}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                    {action.disabled && action.disabledReason && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        ({action.disabledReason})
                      </span>
                    )}
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-1" />
            {t("clear")}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.confirmTitle || t("confirmAction")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isProcessing}
              className={cn(
                pendingAction?.variant === "destructive" &&
                  "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("processing")}
                </>
              ) : (
                t("confirm")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Progress Dialog */}
      <BulkProgressDialog
        open={progressDialogOpen}
        onOpenChange={(open) => {
          if (!open && progress?.status !== "processing") {
            setProgressDialogOpen(false)
            setProgress(null)
            onClearSelection()
          }
        }}
        progress={progress}
        itemLabel={itemLabel}
      />
    </>
  )
}

export default BulkActionBar
