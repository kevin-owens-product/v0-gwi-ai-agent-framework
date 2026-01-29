"use client"

import { useEffect } from "react"

/**
 * Suppresses harmless portal cleanup errors in development mode.
 * These errors occur when React portals (used by Radix UI components)
 * try to clean up DOM nodes that have already been removed.
 * 
 * This is a known issue with React Strict Mode + Radix UI portals
 * and doesn't affect functionality.
 */
export function ErrorSuppression() {
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return
    }

    // Override console.error to filter out portal cleanup errors
    const originalConsoleError = console.error
    console.error = (...args: unknown[]) => {
      const errorMessage = args[0]?.toString() || ''
      const isPortalCleanupError =
        errorMessage.includes('removeChild') ||
        errorMessage.includes('NotFoundError') ||
        (errorMessage.includes('Failed to execute') && errorMessage.includes('removeChild'))

      if (isPortalCleanupError) {
        // Suppress these errors - they're harmless
        console.warn('[Suppressed] Portal cleanup error (safe to ignore):', ...args)
        return
      }

      // Log all other errors normally
      originalConsoleError.apply(console, args)
    }

    // Also catch unhandled errors
    const handleError = (event: ErrorEvent) => {
        event.message?.includes('removeChild') ||
        event.error?.name === 'NotFoundError' ||
        (event.message?.includes('Failed to execute') && event.message?.includes('removeChild'))

      if (isPortalCleanupError) {
        event.preventDefault()
        console.warn('[Suppressed] Portal cleanup error (safe to ignore):', event.error)
        return false
      }
    }

    window.addEventListener('error', handleError)

    return () => {
      console.error = originalConsoleError
      window.removeEventListener('error', handleError)
    }
  }, [])

  return null
}
