/**
 * Keyboard Shortcuts System
 *
 * Defines all available keyboard shortcuts with their default bindings,
 * categories, and metadata. Supports both single-key shortcuts and
 * key sequences (e.g., "g then d" for go to dashboard).
 *
 * @module lib/keyboard-shortcuts
 */

export type ShortcutCategory =
  | "navigation"
  | "actions"
  | "ui"
  | "editing"

export interface ShortcutDefinition {
  /** Unique identifier for the shortcut */
  id: string
  /** Human-readable name */
  name: string
  /** Description of what the shortcut does */
  description: string
  /** Category for grouping in UI */
  category: ShortcutCategory
  /** Default key binding (e.g., "mod+k" or "g d" for sequence) */
  defaultBinding: string
  /** Whether this shortcut can be customized */
  customizable: boolean
  /** Whether this shortcut is enabled by default */
  enabledByDefault: boolean
  /** Action identifier for programmatic use */
  action: string
  /** Optional context where shortcut is active (e.g., "dashboard") */
  context?: string
}

/**
 * Parse a key binding string into individual keys
 * Handles modifier keys (mod/ctrl/meta, shift, alt) and sequences
 */
export function parseKeyBinding(binding: string): {
  isSequence: boolean
  keys: Array<{
    key: string
    modifiers: {
      mod: boolean // ctrl on Windows/Linux, cmd on Mac
      shift: boolean
      alt: boolean
    }
  }>
} {
  const parts = binding.toLowerCase().split(" ")
  const keys = parts.map((part) => {
    const keyParts = part.split("+")
    const key = keyParts[keyParts.length - 1]
    const modifiers = {
      mod: keyParts.includes("mod"),
      shift: keyParts.includes("shift"),
      alt: keyParts.includes("alt"),
    }
    return { key, modifiers }
  })

  return {
    isSequence: parts.length > 1 && !parts[0].includes("+"),
    keys,
  }
}

/**
 * Format a key binding for display
 * Converts internal format to user-friendly display
 */
export function formatKeyBinding(binding: string, platform: "mac" | "other" = "mac"): string {
  const { isSequence, keys } = parseKeyBinding(binding)

  const formatKey = (k: { key: string; modifiers: { mod: boolean; shift: boolean; alt: boolean } }) => {
    const parts: string[] = []

    if (k.modifiers.mod) {
      parts.push(platform === "mac" ? "\u2318" : "Ctrl")
    }
    if (k.modifiers.shift) {
      parts.push(platform === "mac" ? "\u21E7" : "Shift")
    }
    if (k.modifiers.alt) {
      parts.push(platform === "mac" ? "\u2325" : "Alt")
    }

    // Format special keys
    let displayKey = k.key.toUpperCase()
    if (k.key === "escape" || k.key === "esc") displayKey = "Esc"
    if (k.key === "enter" || k.key === "return") displayKey = "\u21B5"
    if (k.key === "backspace") displayKey = "\u232B"
    if (k.key === "delete") displayKey = "Del"
    if (k.key === "arrowup") displayKey = "\u2191"
    if (k.key === "arrowdown") displayKey = "\u2193"
    if (k.key === "arrowleft") displayKey = "\u2190"
    if (k.key === "arrowright") displayKey = "\u2192"
    if (k.key === "/") displayKey = "/"
    if (k.key === "?") displayKey = "?"

    parts.push(displayKey)

    return platform === "mac" ? parts.join("") : parts.join("+")
  }

  if (isSequence) {
    return keys.map(formatKey).join(" then ")
  }

  return formatKey(keys[0])
}

/**
 * Check if a keyboard event matches a key binding
 */
export function matchesKeyBinding(
  event: KeyboardEvent,
  binding: string,
  pendingKey?: string
): { matches: boolean; pendingKey?: string } {
  const { isSequence, keys } = parseKeyBinding(binding)
  const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac")

  const eventKey = event.key.toLowerCase()
  const hasModifier = isMac ? event.metaKey : event.ctrlKey

  if (isSequence) {
    // Handle key sequences (e.g., "g d" for go to dashboard)
    const currentKey = keys[pendingKey ? 1 : 0]

    if (pendingKey) {
      // We're waiting for the second key
      if (
        eventKey === currentKey.key &&
        !currentKey.modifiers.mod &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        return { matches: true }
      }
      // Wrong key, reset sequence
      return { matches: false }
    } else {
      // Check first key of sequence
      if (
        eventKey === currentKey.key &&
        !currentKey.modifiers.mod &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        return { matches: false, pendingKey: eventKey }
      }
    }
    return { matches: false }
  }

  // Handle single key shortcuts
  const target = keys[0]

  const modMatches = target.modifiers.mod ? hasModifier : (!event.metaKey && !event.ctrlKey)
  // Special case: "?" key naturally requires shift on most keyboards
  const isQuestionMark = target.key === "?"
  const shiftMatches = target.modifiers.shift
    ? event.shiftKey
    : (isQuestionMark ? true : !event.shiftKey)
  const altMatches = target.modifiers.alt ? event.altKey : !event.altKey
  const keyMatches = eventKey === target.key ||
    (target.key === "?" && eventKey === "/" && event.shiftKey)

  return {
    matches: modMatches && shiftMatches && altMatches && keyMatches,
  }
}

/**
 * Default shortcut definitions
 */
export const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  // Navigation shortcuts
  {
    id: "command-palette",
    name: "Command Palette",
    description: "Open the command palette to quickly search and navigate",
    category: "navigation",
    defaultBinding: "mod+k",
    customizable: true,
    enabledByDefault: true,
    action: "openCommandPalette",
  },
  {
    id: "go-dashboard",
    name: "Go to Dashboard",
    description: "Navigate to the dashboard",
    category: "navigation",
    defaultBinding: "g d",
    customizable: true,
    enabledByDefault: true,
    action: "navigateTo",
    context: "/dashboard",
  },
  {
    id: "go-agents",
    name: "Go to Agents",
    description: "Navigate to agents page",
    category: "navigation",
    defaultBinding: "g a",
    customizable: true,
    enabledByDefault: true,
    action: "navigateTo",
    context: "/dashboard/agents",
  },
  {
    id: "go-reports",
    name: "Go to Reports",
    description: "Navigate to reports page",
    category: "navigation",
    defaultBinding: "g r",
    customizable: true,
    enabledByDefault: true,
    action: "navigateTo",
    context: "/dashboard/reports",
  },
  {
    id: "go-workflows",
    name: "Go to Workflows",
    description: "Navigate to workflows page",
    category: "navigation",
    defaultBinding: "g w",
    customizable: true,
    enabledByDefault: true,
    action: "navigateTo",
    context: "/dashboard/workflows",
  },
  {
    id: "go-settings",
    name: "Go to Settings",
    description: "Navigate to settings page",
    category: "navigation",
    defaultBinding: "g s",
    customizable: true,
    enabledByDefault: true,
    action: "navigateTo",
    context: "/dashboard/settings",
  },

  // UI shortcuts
  {
    id: "toggle-sidebar",
    name: "Toggle Sidebar",
    description: "Show or hide the sidebar",
    category: "ui",
    defaultBinding: "mod+/",
    customizable: true,
    enabledByDefault: true,
    action: "toggleSidebar",
  },
  {
    id: "close-modal",
    name: "Close Modal",
    description: "Close any open modal or dialog",
    category: "ui",
    defaultBinding: "escape",
    customizable: false,
    enabledByDefault: true,
    action: "closeModal",
  },
  {
    id: "show-shortcuts",
    name: "Show Shortcuts",
    description: "Display keyboard shortcuts help",
    category: "ui",
    defaultBinding: "?",
    customizable: true,
    enabledByDefault: true,
    action: "showShortcuts",
  },

  // Action shortcuts
  {
    id: "new-item",
    name: "New",
    description: "Create a new item (context-aware)",
    category: "actions",
    defaultBinding: "mod+n",
    customizable: true,
    enabledByDefault: true,
    action: "newItem",
  },
  {
    id: "save",
    name: "Save",
    description: "Save current changes",
    category: "actions",
    defaultBinding: "mod+s",
    customizable: true,
    enabledByDefault: true,
    action: "save",
  },
  {
    id: "search",
    name: "Search",
    description: "Focus search input",
    category: "actions",
    defaultBinding: "mod+f",
    customizable: true,
    enabledByDefault: true,
    action: "search",
  },
  {
    id: "refresh",
    name: "Refresh",
    description: "Refresh current view",
    category: "actions",
    defaultBinding: "mod+r",
    customizable: true,
    enabledByDefault: true,
    action: "refresh",
  },
]

/**
 * Get shortcuts grouped by category
 */
export function getShortcutsByCategory(
  shortcuts: ShortcutDefinition[] = DEFAULT_SHORTCUTS
): Record<ShortcutCategory, ShortcutDefinition[]> {
  const categories: Record<ShortcutCategory, ShortcutDefinition[]> = {
    navigation: [],
    actions: [],
    ui: [],
    editing: [],
  }

  shortcuts.forEach((shortcut) => {
    categories[shortcut.category].push(shortcut)
  })

  return categories
}

/**
 * Category display names
 */
export const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  navigation: "Navigation",
  actions: "Actions",
  ui: "Interface",
  editing: "Editing",
}

/**
 * Custom shortcuts storage type
 */
export interface CustomShortcuts {
  bindings: Record<string, string> // shortcutId -> custom binding
  disabled: string[] // shortcutIds that are disabled
}

/**
 * Merge default shortcuts with custom settings
 */
export function mergeShortcuts(
  defaults: ShortcutDefinition[],
  custom: CustomShortcuts
): ShortcutDefinition[] {
  return defaults.map((shortcut) => ({
    ...shortcut,
    defaultBinding: custom.bindings[shortcut.id] || shortcut.defaultBinding,
    enabledByDefault: !custom.disabled.includes(shortcut.id),
  }))
}

/**
 * Detect conflicts between shortcuts
 */
export function detectConflicts(
  shortcuts: ShortcutDefinition[]
): Array<{ shortcutIds: string[]; binding: string }> {
  const bindingMap = new Map<string, string[]>()

  shortcuts.forEach((shortcut) => {
    if (shortcut.enabledByDefault) {
      const binding = shortcut.defaultBinding.toLowerCase()
      const existing = bindingMap.get(binding) || []
      existing.push(shortcut.id)
      bindingMap.set(binding, existing)
    }
  })

  const conflicts: Array<{ shortcutIds: string[]; binding: string }> = []
  bindingMap.forEach((ids, binding) => {
    if (ids.length > 1) {
      conflicts.push({ shortcutIds: ids, binding })
    }
  })

  return conflicts
}
