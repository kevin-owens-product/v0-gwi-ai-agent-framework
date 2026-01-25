"use client"

/**
 * Dashboard Shell Component
 *
 * Client-side wrapper that provides keyboard shortcuts context
 * and other interactive features for the dashboard.
 *
 * @module components/dashboard/dashboard-shell
 */

import { type ReactNode } from "react"
import { KeyboardShortcutsProvider } from "@/components/providers/keyboard-shortcuts-provider"

interface DashboardShellProps {
  children: ReactNode
}

/**
 * Client-side shell for the dashboard that provides:
 * - Keyboard shortcuts handling
 * - Command palette
 * - Shortcuts help modal
 */
export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <KeyboardShortcutsProvider>
      {children}
    </KeyboardShortcutsProvider>
  )
}
