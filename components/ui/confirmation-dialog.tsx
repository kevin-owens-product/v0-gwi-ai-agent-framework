"use client"

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
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm: () => void
  onCancel?: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  isLoading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmationDialogProps) {
  const handleCancel = () => {
    onCancel?.()
    onOpenChange?.(false)
  }

  const handleConfirm = () => {
    onConfirm()
    if (!isLoading) {
      onOpenChange?.(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              variant === "destructive" &&
                buttonVariants({ variant: "destructive" })
            )}
          >
            {isLoading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook for easier confirmation dialog usage
import { useState, useCallback } from "react"

interface UseConfirmationOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export function useConfirmation(options: UseConfirmationOptions) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const confirm = useCallback((action: () => void) => {
    setPendingAction(() => action)
    setIsOpen(true)
  }, [])

  const handleConfirm = useCallback(() => {
    pendingAction?.()
    setIsOpen(false)
    setPendingAction(null)
  }, [pendingAction])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    setPendingAction(null)
  }, [])

  const dialogProps = {
    open: isOpen,
    onOpenChange: setIsOpen,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
    ...options,
  }

  return { confirm, dialogProps, ConfirmationDialog }
}
