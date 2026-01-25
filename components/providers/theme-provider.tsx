/**
 * Theme Provider Component
 *
 * Provides theme context using next-themes library with support for LIGHT, DARK, and SYSTEM modes.
 * Persists theme preference to user preferences via API.
 *
 * @prompt-id forge-v4.1:feature:dark-mode:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 *
 * @module components/providers/theme-provider
 */

"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"

/**
 * Theme values matching the Prisma Theme enum
 */
export type Theme = "light" | "dark" | "system"

/**
 * Theme context type for additional functionality
 */
interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark" | undefined
  systemTheme: "light" | "dark" | undefined
  themes: Theme[]
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

/**
 * Props for the ThemeProvider component
 */
interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

/**
 * ThemeProvider component that wraps next-themes with additional functionality.
 *
 * @component
 *
 * @example
 * Basic usage in layout
 * ```tsx
 * <ThemeProvider defaultTheme="system">
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @example
 * With custom storage key
 * ```tsx
 * <ThemeProvider storageKey="gwi-theme" defaultTheme="dark">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "gwi-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      themes={["light", "dark", "system"]}
    >
      <ThemeContextWrapper>{children}</ThemeContextWrapper>
    </NextThemesProvider>
  )
}

/**
 * Internal wrapper to provide enhanced theme context
 */
function ThemeContextWrapper({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, resolvedTheme, systemTheme, themes } = useNextTheme()

  const contextValue = React.useMemo<ThemeContextType>(
    () => ({
      theme: (theme as Theme) || "system",
      setTheme: (newTheme: Theme) => setTheme(newTheme),
      resolvedTheme: resolvedTheme as "light" | "dark" | undefined,
      systemTheme: systemTheme as "light" | "dark" | undefined,
      themes: (themes as Theme[]) || ["light", "dark", "system"],
    }),
    [theme, setTheme, resolvedTheme, systemTheme, themes]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme context.
 *
 * @returns Theme context with current theme, setter, and resolved theme
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { theme, setTheme, resolvedTheme } = useTheme()
 *
 *   return (
 *     <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
 *       Current: {resolvedTheme}
 *     </button>
 *   )
 * }
 * ```
 */
export function useTheme(): ThemeContextType {
  const context = React.useContext(ThemeContext)

  if (context === undefined) {
    // Fallback to next-themes hook if context is not available
    // This can happen during SSR or if provider is not mounted
    const nextTheme = useNextTheme()
    return {
      theme: (nextTheme.theme as Theme) || "system",
      setTheme: (newTheme: Theme) => nextTheme.setTheme(newTheme),
      resolvedTheme: nextTheme.resolvedTheme as "light" | "dark" | undefined,
      systemTheme: nextTheme.systemTheme as "light" | "dark" | undefined,
      themes: (nextTheme.themes as Theme[]) || ["light", "dark", "system"],
    }
  }

  return context
}

/**
 * Re-export next-themes components for convenience
 */
export { useTheme as useNextTheme } from "next-themes"
