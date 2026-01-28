"use client"

/**
 * @prompt-id forge-v4.1:feature:bulk-operations:004
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { ReactNode, useState } from "react"
import { useTranslations } from "next-intl"
import { Button, ButtonProps } from "@/components/ui/button"
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
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BulkActionButtonProps {
  /** The label to display on the button */
  label: string
  /** Icon to display before the label */
  icon?: ReactNode
  /** Number of items that will be affected */
  selectedCount: number
  /** The IDs of selected items */
  selectedIds: string[]
  /** Handler for the action - receives selected IDs */
  onClick: (selectedIds: string[]) => Promise<void> | void
  /** Whether to require confirmation before executing */
  requiresConfirmation?: boolean
  /** Title for the confirmation dialog */
  confirmTitle?: string
  /** Description for the confirmation dialog */
  confirmDescription?: string | ((count: number) => string)
  /** Text for the confirm button */
  confirmButtonText?: string
  /** Whether this is a destructive action */
  destructive?: boolean
  /** Label for the items (e.g., "users", "tenants") */
  itemLabel?: string
  /** Callback after action completes successfully */
  onSuccess?: () => void
  /** Callback after action fails */
  onError?: (error: Error) => void
  /** Button is disabled */
  disabled?: boolean
  /** Button variant */
  variant?: ButtonProps["variant"]
  /** Button class name */
  className?: string
}

/**
 * A button component for triggering bulk actions with optional confirmation.
 * Shows loading state and handles errors gracefully.
 *
 * @example
 * ```tsx
 * <BulkActionButton
 *   label="Ban Selected"
 *   icon={<Ban className="h-4 w-4" />}
 *   selectedCount={5}
 *   selectedIds={["id1", "id2", "id3", "id4", "id5"]}
 *   onClick={async (ids) => await banUsers(ids)}
 *   requiresConfirmation
 *   confirmTitle="Ban Users"
 *   confirmDescription={(count) => `Are you sure you want to ban ${count} users?`}
 *   destructive
 *   itemLabel="user"
 *   onSuccess={() => refetch()}
 * />
 * ```
 */
export function BulkActionButton({
  label,
  icon,
  selectedCount,
  selectedIds,
  onClick,
  requiresConfirmation = false,
  confirmTitle,
  confirmDescription,
  confirmButtonText,
  destructive = false,
  itemLabel = "item",
  onSuccess,
  onError,
  disabled,
  variant,
  className,
}: BulkActionButtonProps) {
  const t = useTranslations("admin.bulk")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Use translations for defaults
  const dialogTitle = confirmTitle || t("confirmAction")
  const dialogConfirmText = confirmButtonText || t("confirm")

  const handleClick = () => {
    if (requiresConfirmation) {
      setIsDialogOpen(true)
    } else {
      executeAction()
    }
  }

  const executeAction = async () => {
    setIsLoading(true)
    try {
      await onClick(selectedIds)
      onSuccess?.()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Bulk action failed:", error)
      onError?.(error instanceof Error ? error : new Error("Action failed"))
    } finally {
      setIsLoading(false)
    }
  }

  const getDescription = (): string => {
    if (typeof confirmDescription === "function") {
      return confirmDescription(selectedCount)
    }
    if (confirmDescription) {
      return confirmDescription
    }
    const itemsLabel = `${itemLabel}${selectedCount !== 1 ? "s" : ""}`
    return t("defaultConfirmDescription", { count: selectedCount, itemLabel: itemsLabel })
  }

  const buttonVariant = variant ?? (destructive ? "destructive" : "default")

  return (
    <>
      <Button
        variant={buttonVariant}
        onClick={handleClick}
        disabled={disabled || isLoading || selectedCount === 0}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {label}
        {selectedCount > 0 && (
          <span className="ml-1 text-xs opacity-70">({selectedCount})</span>
        )}
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                executeAction()
              }}
              disabled={isLoading}
              className={cn(
                destructive &&
                  "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("processing")}
                </>
              ) : (
                dialogConfirmText
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default BulkActionButton
