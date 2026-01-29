"use client"

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface UseAsyncOperationOptions {
  toolName: string
  successMessage?: string
  errorMessage?: string
  showToast?: boolean
}

interface UseAsyncOperationReturn<T> {
  execute: (operation: () => Promise<T>) => Promise<T | undefined>
  isLoading: boolean
}

/**
 * Shared hook for async operations (export, delete, duplicate, save) across all GWI tools.
 * Manages loading state automatically and handles errors with toast notifications.
 *
 * @param options - Configuration options
 * @param options.toolName - Name of the tool (e.g., 'crosstabs', 'audiences')
 * @param options.successMessage - Custom success message (optional, uses default if not provided)
 * @param options.errorMessage - Custom error message (optional, uses default if not provided)
 * @param options.showToast - Whether to show toast notifications (default: true)
 * @returns Loading state and operation executor function
 */
export function useAsyncOperation<T>(
  options: UseAsyncOperationOptions
): UseAsyncOperationReturn<T> {
  const { toolName, successMessage, errorMessage, showToast = true } = options
  const t = useTranslations(`dashboard.${toolName}.detail.toast`)
  const tErrors = useTranslations(`dashboard.${toolName}.detail.errors`)

  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | undefined> => {
      setIsLoading(true)
      try {
        const result = await operation()
        
        if (showToast) {
          const message = successMessage || t('saveSuccess')
          toast.success(message)
        }
        
        return result
      } catch (error) {
        const message = errorMessage || tErrors('loadFailed')
        
        if (showToast) {
          toast.error(message)
        }
        
        // Log to console for debugging
        console.error(`[${toolName}] Operation failed:`, error)
        
        // Re-throw error so caller can handle it if needed
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [toolName, successMessage, errorMessage, showToast, t, tErrors]
  )

  return {
    execute,
    isLoading,
  }
}
