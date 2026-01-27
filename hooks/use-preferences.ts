/**
 * User Preferences Hook
 *
 * Hook for fetching and updating user preferences with optimistic updates.
 * Supports theme, language, timezone, and other user settings.
 *
 * @prompt-id forge-v4.1:feature:dark-mode:003
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 *
 * @module hooks/use-preferences
 */

"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"

/**
 * Theme enum matching Prisma schema
 */
export type Theme = "LIGHT" | "DARK" | "SYSTEM"

/**
 * User preferences shape matching the database model
 */
export interface UserPreferences {
  id: string
  userId: string
  theme: Theme
  language: string
  timezone: string
  dateFormat: string
  timeFormat: string
  keyboardShortcuts: boolean
  customShortcuts: Record<string, string>
  emailNotifications: boolean
  pushNotifications: boolean
  inAppNotifications: boolean
  weeklyDigest: boolean
  compactMode: boolean
  sidebarCollapsed: boolean
  defaultDashboard: string | null
  recentItems: string[]
  pinnedItems: string[]
  tourCompleted: boolean
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

/**
 * Partial preferences for updates
 */
export type PreferencesUpdate = Partial<Omit<UserPreferences, "id" | "userId" | "createdAt" | "updatedAt">>

/**
 * Default preferences for new users
 */
export const defaultPreferences: Omit<UserPreferences, "id" | "userId" | "createdAt" | "updatedAt"> = {
  theme: "SYSTEM",
  language: "en",
  timezone: "UTC",
  dateFormat: "MMM dd, yyyy",
  timeFormat: "HH:mm",
  keyboardShortcuts: true,
  customShortcuts: {},
  emailNotifications: true,
  pushNotifications: true,
  inAppNotifications: true,
  weeklyDigest: true,
  compactMode: false,
  sidebarCollapsed: false,
  defaultDashboard: null,
  recentItems: [],
  pinnedItems: [],
  tourCompleted: false,
  metadata: {},
}

/**
 * Fetcher function for SWR
 */
async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    const error = new Error("Failed to fetch preferences")
    throw error
  }
  return response.json()
}

/**
 * Hook for managing user preferences with optimistic updates.
 *
 * @returns Object with preferences data, loading state, and mutation functions
 *
 * @example
 * Basic usage
 * ```tsx
 * function SettingsPage() {
 *   const { preferences, updatePreferences, isLoading } = usePreferences()
 *
 *   if (isLoading) return <Spinner />
 *
 *   return (
 *     <div>
 *       <p>Current theme: {preferences?.theme}</p>
 *       <button onClick={() => updatePreferences({ theme: 'DARK' })}>
 *         Switch to Dark
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example
 * With theme integration
 * ```tsx
 * function ThemeSync() {
 *   const { preferences, updatePreferences } = usePreferences()
 *   const { setTheme } = useTheme()
 *
 *   const handleThemeChange = async (theme: Theme) => {
 *     setTheme(theme.toLowerCase())
 *     await updatePreferences({ theme })
 *   }
 *
 *   return <ThemeToggle onThemeChange={handleThemeChange} />
 * }
 * ```
 */
export function usePreferences() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<Error | null>(null)

  const { data, error, isLoading, mutate: revalidate } = useSWR<UserPreferences>(
    "/api/v1/preferences",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      dedupingInterval: 5000,
    }
  )

  /**
   * Update user preferences with optimistic update
   */
  const updatePreferences = useCallback(
    async (updates: PreferencesUpdate): Promise<UserPreferences | null> => {
      setIsUpdating(true)
      setUpdateError(null)

      // Store current data for rollback
      const previousData = data

      try {
        // Optimistic update
        if (data) {
          await revalidate(
            { ...data, ...updates, updatedAt: new Date().toISOString() },
            false
          )
        }

        const response = await fetch("/api/v1/preferences", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to update preferences")
        }

        const updatedPreferences = await response.json()

        // Update cache with server response
        await revalidate(updatedPreferences, false)

        return updatedPreferences
      } catch (err) {
        // Rollback on error
        if (previousData) {
          await revalidate(previousData, false)
        }

        const error = err instanceof Error ? err : new Error("Unknown error")
        setUpdateError(error)
        return null
      } finally {
        setIsUpdating(false)
      }
    },
    [data, revalidate]
  )

  /**
   * Update a single preference field
   */
  const updatePreference = useCallback(
    async <K extends keyof PreferencesUpdate>(
      key: K,
      value: PreferencesUpdate[K]
    ): Promise<UserPreferences | null> => {
      return updatePreferences({ [key]: value })
    },
    [updatePreferences]
  )

  /**
   * Reset preferences to defaults
   */
  const resetPreferences = useCallback(async (): Promise<UserPreferences | null> => {
    return updatePreferences(defaultPreferences)
  }, [updatePreferences])

  /**
   * Refresh preferences from server
   */
  const refreshPreferences = useCallback(async () => {
    await revalidate()
  }, [revalidate])

  return {
    preferences: data,
    isLoading,
    isUpdating,
    error: error || updateError,
    updatePreferences,
    updatePreference,
    resetPreferences,
    refreshPreferences,
  }
}

/**
 * Hook specifically for theme preference management.
 *
 * @returns Object with theme-specific functions
 *
 * @example
 * ```tsx
 * function ThemeSettings() {
 *   const { theme, setTheme, isUpdating } = useThemePreference()
 *
 *   return (
 *     <select
 *       value={theme}
 *       onChange={(e) => setTheme(e.target.value as Theme)}
 *       disabled={isUpdating}
 *     >
 *       <option value="LIGHT">Light</option>
 *       <option value="DARK">Dark</option>
 *       <option value="SYSTEM">System</option>
 *     </select>
 *   )
 * }
 * ```
 */
export function useThemePreference() {
  const { preferences, updatePreference, isLoading, isUpdating } = usePreferences()

  const setTheme = useCallback(
    async (theme: Theme) => {
      return updatePreference("theme", theme)
    },
    [updatePreference]
  )

  return {
    theme: preferences?.theme || "SYSTEM",
    setTheme,
    isLoading,
    isUpdating,
  }
}

/**
 * Hook for notification preferences
 */
export function useNotificationPreferences() {
  const { preferences, updatePreferences, isLoading, isUpdating } = usePreferences()

  const setNotificationPreferences = useCallback(
    async (updates: {
      emailNotifications?: boolean
      pushNotifications?: boolean
      inAppNotifications?: boolean
      weeklyDigest?: boolean
    }) => {
      return updatePreferences(updates)
    },
    [updatePreferences]
  )

  return {
    emailNotifications: preferences?.emailNotifications ?? true,
    pushNotifications: preferences?.pushNotifications ?? true,
    inAppNotifications: preferences?.inAppNotifications ?? true,
    weeklyDigest: preferences?.weeklyDigest ?? true,
    setNotificationPreferences,
    isLoading,
    isUpdating,
  }
}

/**
 * Hook for display preferences (compact mode, sidebar, etc.)
 */
export function useDisplayPreferences() {
  const { preferences, updatePreferences, isLoading, isUpdating } = usePreferences()

  const setCompactMode = useCallback(
    async (enabled: boolean) => {
      return updatePreferences({ compactMode: enabled })
    },
    [updatePreferences]
  )

  const setSidebarCollapsed = useCallback(
    async (collapsed: boolean) => {
      return updatePreferences({ sidebarCollapsed: collapsed })
    },
    [updatePreferences]
  )

  return {
    compactMode: preferences?.compactMode ?? false,
    sidebarCollapsed: preferences?.sidebarCollapsed ?? false,
    setCompactMode,
    setSidebarCollapsed,
    isLoading,
    isUpdating,
  }
}
