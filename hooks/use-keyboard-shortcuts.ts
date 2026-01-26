"use client"

/**
 * Keyboard Shortcuts Hook
 *
 * Provides global keyboard shortcut handling with support for:
 * - Single key shortcuts with modifiers
 * - Key sequences (e.g., "g then d")
 * - Custom user shortcuts
 * - Conflict detection
 * - Context-aware activation
 *
 * @module hooks/use-keyboard-shortcuts
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  DEFAULT_SHORTCUTS,
  matchesKeyBinding,
  mergeShortcuts,
  type CustomShortcuts,
  type ShortcutDefinition,
} from "@/lib/keyboard-shortcuts"
import { useLocalStorage } from "./use-local-storage"

export interface ShortcutHandlers {
  openCommandPalette?: () => void
  closeCommandPalette?: () => void
  toggleSidebar?: () => void
  closeModal?: () => void
  showShortcuts?: () => void
  newItem?: () => void
  save?: () => void
  search?: () => void
  refresh?: () => void
  navigateTo?: (path: string) => void
  custom?: Record<string, () => void>
}

export interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are globally enabled */
  enabled?: boolean
  /** Custom action handlers */
  handlers?: ShortcutHandlers
  /** Override default shortcuts */
  shortcuts?: ShortcutDefinition[]
}

export interface UseKeyboardShortcutsReturn {
  /** Whether shortcuts are enabled */
  enabled: boolean
  /** Toggle shortcuts on/off */
  setEnabled: (enabled: boolean) => void
  /** Currently active shortcuts */
  shortcuts: ShortcutDefinition[]
  /** Update custom shortcuts */
  updateCustomShortcuts: (custom: CustomShortcuts) => void
  /** Custom shortcuts settings */
  customShortcuts: CustomShortcuts
  /** Reset to defaults */
  resetToDefaults: () => void
  /** Current pending key for sequences */
  pendingKey: string | null
  /** Register a shortcut handler */
  registerHandler: (action: string, handler: () => void) => void
  /** Unregister a shortcut handler */
  unregisterHandler: (action: string) => void
}

const DEFAULT_CUSTOM_SHORTCUTS: CustomShortcuts = {
  bindings: {},
  disabled: [],
}

/**
 * Hook for managing global keyboard shortcuts
 *
 * @example
 * ```tsx
 * function App() {
 *   const { shortcuts, enabled, setEnabled } = useKeyboardShortcuts({
 *     handlers: {
 *       openCommandPalette: () => setCommandPaletteOpen(true),
 *       toggleSidebar: () => setSidebarOpen(prev => !prev),
 *     }
 *   })
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function useKeyboardShortcuts(
  options: UseKeyboardShortcutsOptions = {}
): UseKeyboardShortcutsReturn {
  const { enabled: initialEnabled = true, handlers = {}, shortcuts: customShortcutDefs } = options

  const router = useRouter()

  // Store keyboard shortcuts enabled state
  const [enabled, setEnabled] = useLocalStorage("keyboard-shortcuts-enabled", initialEnabled)

  // Store custom shortcut bindings
  const [customShortcuts, setCustomShortcuts] = useLocalStorage<CustomShortcuts>(
    "custom-shortcuts",
    DEFAULT_CUSTOM_SHORTCUTS
  )

  // Pending key for sequences (e.g., "g" waiting for "d")
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const pendingKeyTimeout = useRef<NodeJS.Timeout | null>(null)

  // Dynamic handlers registry
  const handlersRef = useRef<Record<string, () => void>>({})

  // Merge defaults with custom settings
  const shortcuts = customShortcutDefs
    ? customShortcutDefs
    : mergeShortcuts(DEFAULT_SHORTCUTS, customShortcuts)

  // Clear pending key after timeout
  useEffect(() => {
    if (pendingKey) {
      pendingKeyTimeout.current = setTimeout(() => {
        setPendingKey(null)
      }, 1500) // 1.5 second timeout for sequences
    }

    return () => {
      if (pendingKeyTimeout.current) {
        clearTimeout(pendingKeyTimeout.current)
      }
    }
  }, [pendingKey])

  // Register/unregister handlers
  const registerHandler = useCallback((action: string, handler: () => void) => {
    handlersRef.current[action] = handler
  }, [])

  const unregisterHandler = useCallback((action: string) => {
    delete handlersRef.current[action]
  }, [])

  // Execute shortcut action
  const executeAction = useCallback(
    (shortcut: ShortcutDefinition) => {
      const action = shortcut.action

      // Check dynamic handlers first
      if (handlersRef.current[action]) {
        handlersRef.current[action]()
        return
      }

      // Check passed handlers
      switch (action) {
        case "openCommandPalette":
          handlers.openCommandPalette?.()
          break
        case "closeCommandPalette":
          handlers.closeCommandPalette?.()
          break
        case "toggleSidebar":
          handlers.toggleSidebar?.()
          break
        case "closeModal":
          handlers.closeModal?.()
          break
        case "showShortcuts":
          handlers.showShortcuts?.()
          break
        case "newItem":
          handlers.newItem?.()
          break
        case "save":
          handlers.save?.()
          break
        case "search":
          handlers.search?.()
          break
        case "refresh":
          handlers.refresh?.()
          break
        case "navigateTo":
          if (shortcut.context) {
            if (handlers.navigateTo) {
              handlers.navigateTo(shortcut.context)
            } else {
              router.push(shortcut.context)
            }
          }
          break
        default:
          // Check custom handlers
          handlers.custom?.[action]?.()
      }
    },
    [handlers, router]
  )

  // Main keyboard event handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't capture shortcuts when typing in inputs
      const target = event.target as HTMLElement
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        (target.closest && target.closest('[role="textbox"]'))

      // Allow escape in inputs for closing
      if (isInput && event.key !== "Escape") return

      // Check each enabled shortcut
      for (const shortcut of shortcuts) {
        if (!shortcut.enabledByDefault) continue

        const result = matchesKeyBinding(event, shortcut.defaultBinding, pendingKey || undefined)

        if (result.pendingKey) {
          // Start a sequence
          event.preventDefault()
          setPendingKey(result.pendingKey)
          return
        }

        if (result.matches) {
          event.preventDefault()
          setPendingKey(null)
          executeAction(shortcut)
          return
        }
      }

      // Clear pending key if no match
      if (pendingKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
        setPendingKey(null)
      }
    },
    [enabled, shortcuts, pendingKey, executeAction]
  )

  // Attach event listener
  useEffect(() => {
    if (typeof window === "undefined") return

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  // Update custom shortcuts
  const updateCustomShortcuts = useCallback(
    (custom: CustomShortcuts) => {
      setCustomShortcuts(custom)
    },
    [setCustomShortcuts]
  )

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setCustomShortcuts(DEFAULT_CUSTOM_SHORTCUTS)
  }, [setCustomShortcuts])

  return {
    enabled,
    setEnabled,
    shortcuts,
    updateCustomShortcuts,
    customShortcuts,
    resetToDefaults,
    pendingKey,
    registerHandler,
    unregisterHandler,
  }
}

/**
 * Hook for registering a single shortcut handler
 * Useful for components that need to handle specific shortcuts
 *
 * @example
 * ```tsx
 * function SaveButton() {
 *   useShortcutHandler("save", () => {
 *     // Save logic
 *   })
 *   return <button>Save</button>
 * }
 * ```
 */
export function useShortcutHandler(
  action: string,
  handler: () => void,
  deps: unknown[] = []
) {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler, ...deps])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable

      if (isInput && event.key !== "Escape") return

      // Find matching shortcut
      const shortcut = DEFAULT_SHORTCUTS.find((s) => s.action === action)
      if (!shortcut) return

      const result = matchesKeyBinding(event, shortcut.defaultBinding)
      if (result.matches) {
        event.preventDefault()
        handlerRef.current()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [action])
}

/**
 * Context for keyboard shortcuts (to be used with provider)
 */
export type KeyboardShortcutsContextValue = UseKeyboardShortcutsReturn
