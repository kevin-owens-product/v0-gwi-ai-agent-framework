"use client"

/**
 * Keyboard Shortcuts Provider
 *
 * Provides global keyboard shortcut handling and context for the application.
 * Integrates with the command palette and shortcuts modal.
 *
 * @module components/providers/keyboard-shortcuts-provider
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { useKeyboardShortcuts, type UseKeyboardShortcutsReturn } from "@/hooks/use-keyboard-shortcuts"
import { CommandPalette } from "@/components/ui/command-palette"
import { ShortcutsModal } from "@/components/ui/shortcuts-modal"

interface KeyboardShortcutsContextValue extends UseKeyboardShortcutsReturn {
  isCommandPaletteOpen: boolean
  openCommandPalette: () => void
  closeCommandPalette: () => void
  isShortcutsModalOpen: boolean
  openShortcutsModal: () => void
  closeShortcutsModal: () => void
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | undefined>(
  undefined
)

interface KeyboardShortcutsProviderProps {
  children: ReactNode
  /** Callback when sidebar toggle is triggered */
  onToggleSidebar?: () => void
  /** Callback when save is triggered */
  onSave?: () => void
  /** Callback when new item is triggered */
  onNewItem?: () => void
  /** Callback when search is triggered */
  onSearch?: () => void
  /** Callback when refresh is triggered */
  onRefresh?: () => void
}

/**
 * Provider component that sets up keyboard shortcuts for the application.
 * Renders the command palette and shortcuts modal.
 *
 * @example
 * ```tsx
 * function DashboardLayout({ children }) {
 *   const [sidebarOpen, setSidebarOpen] = useState(true)
 *
 *   return (
 *     <KeyboardShortcutsProvider
 *       onToggleSidebar={() => setSidebarOpen(prev => !prev)}
 *     >
 *       <Sidebar open={sidebarOpen} />
 *       {children}
 *     </KeyboardShortcutsProvider>
 *   )
 * }
 * ```
 */
export function KeyboardShortcutsProvider({
  children,
  onToggleSidebar,
  onSave,
  onNewItem,
  onSearch,
  onRefresh,
}: KeyboardShortcutsProviderProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false)

  const openCommandPalette = useCallback(() => setIsCommandPaletteOpen(true), [])
  const closeCommandPalette = useCallback(() => setIsCommandPaletteOpen(false), [])
  const openShortcutsModal = useCallback(() => setIsShortcutsModalOpen(true), [])
  const closeShortcutsModal = useCallback(() => setIsShortcutsModalOpen(false), [])

  // Close any open modals
  const closeModal = useCallback(() => {
    setIsCommandPaletteOpen(false)
    setIsShortcutsModalOpen(false)
  }, [])

  const shortcutsReturn = useKeyboardShortcuts({
    handlers: {
      openCommandPalette,
      closeCommandPalette,
      toggleSidebar: onToggleSidebar,
      closeModal,
      showShortcuts: openShortcutsModal,
      newItem: onNewItem,
      save: onSave,
      search: onSearch || openCommandPalette, // Default search to command palette
      refresh: onRefresh,
    },
  })

  const contextValue: KeyboardShortcutsContextValue = {
    ...shortcutsReturn,
    isCommandPaletteOpen,
    openCommandPalette,
    closeCommandPalette,
    isShortcutsModalOpen,
    openShortcutsModal,
    closeShortcutsModal,
  }

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}

      {/* Command Palette */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
      />

      {/* Shortcuts Help Modal */}
      <ShortcutsModal
        open={isShortcutsModalOpen}
        onOpenChange={setIsShortcutsModalOpen}
        shortcuts={shortcutsReturn.shortcuts}
      />
    </KeyboardShortcutsContext.Provider>
  )
}

/**
 * Hook to access keyboard shortcuts context
 */
export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext)
  if (context === undefined) {
    throw new Error(
      "useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider"
    )
  }
  return context
}

/**
 * Hook to open the command palette
 */
export function useCommandPalette() {
  const { isCommandPaletteOpen, openCommandPalette, closeCommandPalette } =
    useKeyboardShortcutsContext()
  return {
    isOpen: isCommandPaletteOpen,
    open: openCommandPalette,
    close: closeCommandPalette,
  }
}

/**
 * Hook to open the shortcuts modal
 */
export function useShortcutsModal() {
  const { isShortcutsModalOpen, openShortcutsModal, closeShortcutsModal } =
    useKeyboardShortcutsContext()
  return {
    isOpen: isShortcutsModalOpen,
    open: openShortcutsModal,
    close: closeShortcutsModal,
  }
}
