"use client"

/**
 * @prompt-id forge-v4.1:feature:bulk-operations:005
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type BulkOperationStatus =
  | "idle"
  | "processing"
  | "completed"
  | "completed_with_errors"
  | "cancelled"

export interface BulkOperationProgress {
  /** Total number of items to process */
  total: number
  /** Number of items processed so far */
  processed: number
  /** Number of successful operations */
  succeeded: number
  /** Number of failed operations */
  failed: number
  /** Current operation status */
  status: BulkOperationStatus
  /** Current item being processed (optional) */
  currentItem?: string
  /** Error messages for failed items */
  errors?: string[]
}

export interface BulkProgressDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when the dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** Current progress of the operation */
  progress: BulkOperationProgress | null
  /** Title for the dialog */
  title?: string
  /** Description for the dialog */
  description?: string
  /** Label for the items being processed */
  itemLabel?: string
  /** Callback when the operation is cancelled (if supported) */
  onCancel?: () => void
  /** Whether cancellation is supported */
  canCancel?: boolean
}

/**
 * A dialog component that shows progress during bulk operations.
 * Displays a progress bar, success/failure counts, and error details.
 *
 * @example
 * ```tsx
 * const [progress, setProgress] = useState<BulkOperationProgress | null>(null)
 *
 * const handleBulkDelete = async (ids: string[]) => {
 *   setProgress({ total: ids.length, processed: 0, succeeded: 0, failed: 0, status: "processing" })
 *
 *   for (let i = 0; i < ids.length; i++) {
 *     try {
 *       await deleteItem(ids[i])
 *       setProgress(prev => ({ ...prev!, processed: i + 1, succeeded: prev!.succeeded + 1 }))
 *     } catch {
 *       setProgress(prev => ({ ...prev!, processed: i + 1, failed: prev!.failed + 1 }))
 *     }
 *   }
 *
 *   setProgress(prev => ({ ...prev!, status: "completed" }))
 * }
 *
 * <BulkProgressDialog
 *   open={progress !== null}
 *   onOpenChange={(open) => !open && setProgress(null)}
 *   progress={progress}
 *   title="Deleting Items"
 *   itemLabel="item"
 * />
 * ```
 */
export function BulkProgressDialog({
  open,
  onOpenChange,
  progress,
  title,
  description,
  itemLabel = "item",
  onCancel,
  canCancel = false,
}: BulkProgressDialogProps) {
  const t = useTranslations("admin.bulk.progress")
  const [showErrors, setShowErrors] = useState(false)

  // Use translations for defaults
  const dialogTitle = title || t("title")
  const dialogDescription = description || t("description")

  // Auto-expand errors when there are any
  useEffect(() => {
    if (progress?.errors && progress.errors.length > 0 && progress.status !== "processing") {
      setShowErrors(true)
    }
  }, [progress?.errors, progress?.status])

  if (!progress) return null

  const percentComplete = progress.total > 0
    ? Math.round((progress.processed / progress.total) * 100)
    : 0

  const hasErrors = progress.failed > 0 || (progress.errors && progress.errors.length > 0)
  const isProcessing = progress.status === "processing"

  const getStatusIcon = () => {
    switch (progress.status) {
      case "processing":
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "completed_with_errors":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (progress.status) {
      case "processing":
        return progress.currentItem
          ? t("status.processingItem", { item: progress.currentItem })
          : t("status.processing")
      case "completed":
        return t("status.completed")
      case "completed_with_errors":
        return t("status.completedWithErrors")
      case "cancelled":
        return t("status.cancelled")
      default:
        return ""
    }
  }

  const itemsLabel = `${itemLabel}${progress.total !== 1 ? "s" : ""}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("progress")}</span>
              <span className="font-medium">{percentComplete}%</span>
            </div>
            <Progress value={percentComplete} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {t("processed", { processed: progress.processed, total: progress.total, itemLabel: itemsLabel })}
            </p>
          </div>

          {/* Status badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {t("succeeded", { count: progress.succeeded })}
            </Badge>
            {progress.failed > 0 && (
              <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
                <XCircle className="h-3 w-3 mr-1" />
                {t("failed", { count: progress.failed })}
              </Badge>
            )}
          </div>

          {/* Status text */}
          <p className="text-sm text-muted-foreground">{getStatusText()}</p>

          {/* Error details */}
          {hasErrors && progress.errors && progress.errors.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => setShowErrors(!showErrors)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showErrors ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {showErrors ? t("hideErrors", { count: progress.errors.length }) : t("showErrors", { count: progress.errors.length })}
              </button>

              {showErrors && (
                <ScrollArea className="h-[120px] w-full rounded-md border p-2">
                  <div className="space-y-1">
                    {progress.errors.map((error, index) => (
                      <p key={index} className="text-xs text-destructive font-mono">
                        {error}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {isProcessing && canCancel && onCancel && (
            <Button variant="outline" onClick={onCancel}>
              {t("cancel")}
            </Button>
          )}
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className={cn(isProcessing && "opacity-50 cursor-not-allowed")}
          >
            {isProcessing ? t("pleaseWait") : t("done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BulkProgressDialog
