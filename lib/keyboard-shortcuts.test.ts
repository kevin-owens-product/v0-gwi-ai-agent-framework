/**
 * Keyboard Shortcuts Library Tests
 *
 * @module lib/keyboard-shortcuts.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  parseKeyBinding,
  formatKeyBinding,
  matchesKeyBinding,
  getShortcutsByCategory,
  mergeShortcuts,
  detectConflicts,
  DEFAULT_SHORTCUTS,
  CATEGORY_LABELS,
  type CustomShortcuts,
  type ShortcutDefinition,
} from "./keyboard-shortcuts"

describe("keyboard-shortcuts", () => {
  describe("parseKeyBinding", () => {
    it("parses simple key", () => {
      const result = parseKeyBinding("escape")
      expect(result.isSequence).toBe(false)
      expect(result.keys).toHaveLength(1)
      expect(result.keys[0].key).toBe("escape")
      expect(result.keys[0].modifiers.mod).toBe(false)
    })

    it("parses key with modifier", () => {
      const result = parseKeyBinding("mod+k")
      expect(result.isSequence).toBe(false)
      expect(result.keys).toHaveLength(1)
      expect(result.keys[0].key).toBe("k")
      expect(result.keys[0].modifiers.mod).toBe(true)
    })

    it("parses key with multiple modifiers", () => {
      const result = parseKeyBinding("mod+shift+p")
      expect(result.keys[0].modifiers.mod).toBe(true)
      expect(result.keys[0].modifiers.shift).toBe(true)
      expect(result.keys[0].modifiers.alt).toBe(false)
    })

    it("parses key sequence", () => {
      const result = parseKeyBinding("g d")
      expect(result.isSequence).toBe(true)
      expect(result.keys).toHaveLength(2)
      expect(result.keys[0].key).toBe("g")
      expect(result.keys[1].key).toBe("d")
    })

    it("handles uppercase in binding", () => {
      const result = parseKeyBinding("MOD+K")
      expect(result.keys[0].key).toBe("k")
      expect(result.keys[0].modifiers.mod).toBe(true)
    })
  })

  describe("formatKeyBinding", () => {
    it("formats simple key for Mac", () => {
      const result = formatKeyBinding("escape", "mac")
      expect(result).toBe("Esc")
    })

    it("formats simple key for other platforms", () => {
      const result = formatKeyBinding("escape", "other")
      expect(result).toBe("Esc")
    })

    it("formats modifier key for Mac", () => {
      const result = formatKeyBinding("mod+k", "mac")
      expect(result).toContain("\u2318") // Command symbol
      expect(result).toContain("K")
    })

    it("formats modifier key for other platforms", () => {
      const result = formatKeyBinding("mod+k", "other")
      expect(result).toBe("Ctrl+K")
    })

    it("formats key sequence", () => {
      const result = formatKeyBinding("g d", "mac")
      expect(result).toContain("then")
      expect(result).toContain("G")
      expect(result).toContain("D")
    })

    it("formats shift modifier for Mac", () => {
      const result = formatKeyBinding("shift+k", "mac")
      expect(result).toContain("\u21E7") // Shift symbol
    })

    it("formats alt modifier for Mac", () => {
      const result = formatKeyBinding("alt+k", "mac")
      expect(result).toContain("\u2325") // Option symbol
    })

    it("formats special keys", () => {
      expect(formatKeyBinding("enter", "mac")).toBe("\u21B5")
      expect(formatKeyBinding("backspace", "mac")).toBe("\u232B")
      expect(formatKeyBinding("arrowup", "mac")).toBe("\u2191")
    })
  })

  describe("matchesKeyBinding", () => {
    const createKeyboardEvent = (options: {
      key: string
      metaKey?: boolean
      ctrlKey?: boolean
      shiftKey?: boolean
      altKey?: boolean
    }): KeyboardEvent => {
      return {
        key: options.key,
        metaKey: options.metaKey ?? false,
        ctrlKey: options.ctrlKey ?? false,
        shiftKey: options.shiftKey ?? false,
        altKey: options.altKey ?? false,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as KeyboardEvent
    }

    beforeEach(() => {
      // Mock Mac platform
      Object.defineProperty(navigator, "platform", {
        value: "MacIntel",
        configurable: true,
      })
    })

    it("matches simple key", () => {
      const event = createKeyboardEvent({ key: "Escape" })
      const result = matchesKeyBinding(event, "escape")
      expect(result.matches).toBe(true)
    })

    it("matches key with mod on Mac", () => {
      const event = createKeyboardEvent({ key: "k", metaKey: true })
      const result = matchesKeyBinding(event, "mod+k")
      expect(result.matches).toBe(true)
    })

    it("does not match without required modifier", () => {
      const event = createKeyboardEvent({ key: "k" })
      const result = matchesKeyBinding(event, "mod+k")
      expect(result.matches).toBe(false)
    })

    it("does not match with extra modifier", () => {
      const event = createKeyboardEvent({ key: "k", metaKey: true, shiftKey: true })
      const result = matchesKeyBinding(event, "mod+k")
      expect(result.matches).toBe(false)
    })

    it("handles first key of sequence", () => {
      const event = createKeyboardEvent({ key: "g" })
      const result = matchesKeyBinding(event, "g d")
      expect(result.matches).toBe(false)
      expect(result.pendingKey).toBe("g")
    })

    it("matches second key of sequence", () => {
      const event = createKeyboardEvent({ key: "d" })
      const result = matchesKeyBinding(event, "g d", "g")
      expect(result.matches).toBe(true)
    })

    it("does not match wrong second key in sequence", () => {
      const event = createKeyboardEvent({ key: "x" })
      const result = matchesKeyBinding(event, "g d", "g")
      expect(result.matches).toBe(false)
    })

    it("matches ? shortcut with shift+/", () => {
      const event = createKeyboardEvent({ key: "/", shiftKey: true })
      const result = matchesKeyBinding(event, "?")
      expect(result.matches).toBe(true)
    })
  })

  describe("getShortcutsByCategory", () => {
    it("groups shortcuts by category", () => {
      const grouped = getShortcutsByCategory(DEFAULT_SHORTCUTS)

      expect(grouped.navigation).toBeDefined()
      expect(grouped.actions).toBeDefined()
      expect(grouped.ui).toBeDefined()
      expect(grouped.editing).toBeDefined()
    })

    it("includes navigation shortcuts", () => {
      const grouped = getShortcutsByCategory(DEFAULT_SHORTCUTS)
      const navigationIds = grouped.navigation.map((s) => s.id)

      expect(navigationIds).toContain("command-palette")
      expect(navigationIds).toContain("go-dashboard")
    })

    it("includes UI shortcuts", () => {
      const grouped = getShortcutsByCategory(DEFAULT_SHORTCUTS)
      const uiIds = grouped.ui.map((s) => s.id)

      expect(uiIds).toContain("toggle-sidebar")
      expect(uiIds).toContain("close-modal")
      expect(uiIds).toContain("show-shortcuts")
    })
  })

  describe("mergeShortcuts", () => {
    const defaults: ShortcutDefinition[] = [
      {
        id: "test-1",
        name: "Test 1",
        description: "Test shortcut 1",
        category: "actions",
        defaultBinding: "mod+1",
        customizable: true,
        enabledByDefault: true,
        action: "test1",
      },
      {
        id: "test-2",
        name: "Test 2",
        description: "Test shortcut 2",
        category: "actions",
        defaultBinding: "mod+2",
        customizable: true,
        enabledByDefault: true,
        action: "test2",
      },
    ]

    it("returns defaults when no customizations", () => {
      const custom: CustomShortcuts = { bindings: {}, disabled: [] }
      const merged = mergeShortcuts(defaults, custom)

      expect(merged[0].defaultBinding).toBe("mod+1")
      expect(merged[1].defaultBinding).toBe("mod+2")
    })

    it("applies custom bindings", () => {
      const custom: CustomShortcuts = {
        bindings: { "test-1": "mod+shift+1" },
        disabled: [],
      }
      const merged = mergeShortcuts(defaults, custom)

      expect(merged[0].defaultBinding).toBe("mod+shift+1")
      expect(merged[1].defaultBinding).toBe("mod+2")
    })

    it("disables specified shortcuts", () => {
      const custom: CustomShortcuts = {
        bindings: {},
        disabled: ["test-1"],
      }
      const merged = mergeShortcuts(defaults, custom)

      expect(merged[0].enabledByDefault).toBe(false)
      expect(merged[1].enabledByDefault).toBe(true)
    })
  })

  describe("detectConflicts", () => {
    it("detects binding conflicts", () => {
      const shortcuts: ShortcutDefinition[] = [
        {
          id: "test-1",
          name: "Test 1",
          description: "",
          category: "actions",
          defaultBinding: "mod+k",
          customizable: true,
          enabledByDefault: true,
          action: "test1",
        },
        {
          id: "test-2",
          name: "Test 2",
          description: "",
          category: "actions",
          defaultBinding: "mod+k",
          customizable: true,
          enabledByDefault: true,
          action: "test2",
        },
      ]

      const conflicts = detectConflicts(shortcuts)

      expect(conflicts).toHaveLength(1)
      expect(conflicts[0].binding).toBe("mod+k")
      expect(conflicts[0].shortcutIds).toContain("test-1")
      expect(conflicts[0].shortcutIds).toContain("test-2")
    })

    it("ignores disabled shortcuts in conflict detection", () => {
      const shortcuts: ShortcutDefinition[] = [
        {
          id: "test-1",
          name: "Test 1",
          description: "",
          category: "actions",
          defaultBinding: "mod+k",
          customizable: true,
          enabledByDefault: true,
          action: "test1",
        },
        {
          id: "test-2",
          name: "Test 2",
          description: "",
          category: "actions",
          defaultBinding: "mod+k",
          customizable: true,
          enabledByDefault: false, // Disabled
          action: "test2",
        },
      ]

      const conflicts = detectConflicts(shortcuts)

      expect(conflicts).toHaveLength(0)
    })

    it("returns empty array when no conflicts", () => {
      const shortcuts: ShortcutDefinition[] = [
        {
          id: "test-1",
          name: "Test 1",
          description: "",
          category: "actions",
          defaultBinding: "mod+1",
          customizable: true,
          enabledByDefault: true,
          action: "test1",
        },
        {
          id: "test-2",
          name: "Test 2",
          description: "",
          category: "actions",
          defaultBinding: "mod+2",
          customizable: true,
          enabledByDefault: true,
          action: "test2",
        },
      ]

      const conflicts = detectConflicts(shortcuts)

      expect(conflicts).toHaveLength(0)
    })
  })

  describe("DEFAULT_SHORTCUTS", () => {
    it("has required fields for all shortcuts", () => {
      DEFAULT_SHORTCUTS.forEach((shortcut) => {
        expect(shortcut.id).toBeDefined()
        expect(shortcut.name).toBeDefined()
        expect(shortcut.description).toBeDefined()
        expect(shortcut.category).toBeDefined()
        expect(shortcut.defaultBinding).toBeDefined()
        expect(shortcut.action).toBeDefined()
        expect(typeof shortcut.customizable).toBe("boolean")
        expect(typeof shortcut.enabledByDefault).toBe("boolean")
      })
    })

    it("has command palette shortcut", () => {
      const cmdPalette = DEFAULT_SHORTCUTS.find((s) => s.id === "command-palette")
      expect(cmdPalette).toBeDefined()
      expect(cmdPalette?.defaultBinding).toBe("mod+k")
    })

    it("has navigation sequence shortcuts", () => {
      const goDashboard = DEFAULT_SHORTCUTS.find((s) => s.id === "go-dashboard")
      expect(goDashboard).toBeDefined()
      expect(goDashboard?.defaultBinding).toBe("g d")
    })
  })

  describe("CATEGORY_LABELS", () => {
    it("has labels for all categories", () => {
      expect(CATEGORY_LABELS.navigation).toBe("Navigation")
      expect(CATEGORY_LABELS.actions).toBe("Actions")
      expect(CATEGORY_LABELS.ui).toBe("Interface")
      expect(CATEGORY_LABELS.editing).toBe("Editing")
    })
  })
})
