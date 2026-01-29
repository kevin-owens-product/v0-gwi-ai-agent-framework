"use client"

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export type ErrorType = 'network' | 'notFound' | 'unauthorized' | 'server' | 'unknown' | null

interface UseApiErrorHandlerOptions {
  toolName: string
  showToast?: boolean
}

interface UseApiErrorHandlerReturn {
  error: string | null
  errorType: ErrorType
  handleError: (error: unknown, response?: Response) => void
  clearError: () => void
  retry: () => void
  retryCount: number
}

/**
 * Shared hook for consistent API error handling across all GWI tools.
 * Handles different error types (network, 404, 500, 401, 403) and provides
 * toast notifications and retry functionality.
 *
 * @param options - Configuration options
 * @param options.toolName - Name of the tool (e.g., 'crosstabs', 'audiences')
 * @param options.showToast - Whether to show toast notifications (default: true)
 * @returns Error handling state and functions
 */
export function useApiErrorHandler(
  options: UseApiErrorHandlerOptions
): UseApiErrorHandlerReturn {
  const { toolName, showToast = true } = options
  const t = useTranslations(`dashboard.${toolName}.detail.errors`)
  const tCommon = useTranslations('common.errors')

  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<ErrorType>(null)
  const [retryCount, setRetryCount] = useState(0)

  const handleError = useCallback(
    (error: unknown, response?: Response) => {
      let errorMessage: string
      let type: ErrorType = 'unknown'

      if (!response) {
        // Network error or no response
        type = 'network'
        errorMessage = t('networkError')
      } else {
        switch (response.status) {
          case 404:
            type = 'notFound'
            errorMessage = t('notFound')
            break
          case 401:
          case 403:
            type = 'unauthorized'
            errorMessage = t('unauthorized')
            break
          case 500:
          case 502:
          case 503:
            type = 'server'
            errorMessage = t('serverError')
            break
          default:
            type = 'unknown'
            errorMessage = t('loadFailed')
        }
      }

      setError(errorMessage)
      setErrorType(type)

      if (showToast) {
        toast.error(errorMessage)
      }

      // Log to console for debugging
      console.error(`[${toolName}] Error:`, error, response ? `Status: ${response.status}` : 'Network error')
    },
    [toolName, t, showToast]
  )

  const clearError = useCallback(() => {
    setError(null)
    setErrorType(null)
    setRetryCount(0)
  }, [])

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1)
    setError(null)
    setErrorType(null)
  }, [])

  return {
    error,
    errorType,
    handleError,
    clearError,
    retry,
    retryCount,
  }
}
