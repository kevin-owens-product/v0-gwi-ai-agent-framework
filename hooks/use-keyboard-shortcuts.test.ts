/**
 * Keyboard Shortcuts Hook Tests
 *
 * @module hooks/use-keyboard-shortcuts.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useKeyboardShortcuts, useShortcutHandler } from "./use-keyboard-shortcuts"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, "localStorage", { value: localStorageMock })

describe("useKeyboardShortcuts", () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()

    // Mock Mac platform
    Object.defineProperty(navigator, "platform", {
      value: "MacIntel",
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns default enabled state", () => {
    const { result } = renderHook(() => useKeyboardShortcuts())

    expect(result.current.enabled).toBe(true)
  })

  it("returns default shortcuts", () => {
    const { result } = renderHook(() => useKeyboardShortcuts())

    expect(result.current.shortcuts).toBeDefined()
    expect(result.current.shortcuts.length).toBeGreaterThan(0)
  })

  it("allows toggling enabled state", () => {
    const { result } = renderHook(() => useKeyboardShortcuts())

    act(() => {
      result.current.setEnabled(false)
    })

    expect(result.current.enabled).toBe(false)
  })

  it("initializes pendingKey as null", () => {
    const { result } = renderHook(() => useKeyboardShortcuts())

    expect(result.current.pendingKey).toBeNull()
  })

  it("provides custom shortcuts updating function", () => {
    const { result } = renderHook(() => useKeyboardShortcuts())

    expect(typeof result.current.updateCustomShortcuts).toBe("function")
  })

  it("provides reset function", () => {
    const { result } = renderHook(() => useKeyboardShortcuts())

    expect(typeof result.current.resetToDefaults).toBe("function")
  })

  it("provides handler registration functions", () => {
    const { result } = renderHook(() => useKeyboardShortcuts())

    expect(typeof result.current.registerHandler).toBe("function")
    expect(typeof result.current.unregisterHandler).toBe("function")
  })

  it("calls handler when shortcut is triggered", async () => {
    const mockHandler = vi.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        handlers: {
          openCommandPalette: mockHandler,
        },
      })
    )

    // Simulate Cmd+K keydown
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    })

    act(() => {
      window.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalled()
    })
  })

  it("does not call handler when shortcuts are disabled", async () => {
    const mockHandler = vi.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        enabled: false,
        handlers: {
          openCommandPalette: mockHandler,
        },
      })
    )

    // Simulate Cmd+K keydown
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    })

    act(() => {
      window.dispatchEvent(event)
    })

    // Wait a bit to ensure handler is not called
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(mockHandler).not.toHaveBeenCalled()
  })

  it("does not trigger shortcuts when typing in input", async () => {
    const mockHandler = vi.fn()

    renderHook(() =>
      useKeyboardShortcuts({
        handlers: {
          openCommandPalette: mockHandler,
        },
      })
    )

    // Create a mock input element
    const input = document.createElement("input")
    document.body.appendChild(input)
    input.focus()

    // Simulate keydown with input as target
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    })
    Object.defineProperty(event, "target", { value: input })

    act(() => {
      window.dispatchEvent(event)
    })

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(mockHandler).not.toHaveBeenCalled()

    // Cleanup
    document.body.removeChild(input)
  })

  it("updates custom shortcuts", () => {
    const { result } = renderHook(() => useKeyboardShortcuts())

    act(() => {
      result.current.updateCustomShortcuts({
        bindings: { "command-palette": "mod+shift+p" },
        disabled: [],
      })
    })

    expect(result.current.customShortcuts.bindings["command-palette"]).toBe("mod+shift+p")
  })

  it("resets to defaults", () => {
    const { result } = renderHook(() => useKeyboardShortcuts())

    // First update custom shortcuts
    act(() => {
      result.current.updateCustomShortcuts({
        bindings: { "command-palette": "mod+shift+p" },
        disabled: ["toggle-sidebar"],
      })
    })

    // Then reset
    act(() => {
      result.current.resetToDefaults()
    })

    expect(result.current.customShortcuts.bindings).toEqual({})
    expect(result.current.customShortcuts.disabled).toEqual([])
  })

  it("handles sequence shortcuts", async () => {
    const { result } = renderHook(() => useKeyboardShortcuts())

    // Press 'g' first
    act(() => {
      const gEvent = new KeyboardEvent("keydown", {
        key: "g",
        bubbles: true,
      })
      window.dispatchEvent(gEvent)
    })

    // Check pendingKey is set (may need a brief wait)
    await waitFor(() => {
      expect(result.current.pendingKey).toBe("g")
    })
  })

  it("clears pending key after timeout", async () => {
    const { result } = renderHook(() => useKeyboardShortcuts())

    // Press 'g' first
    act(() => {
      const gEvent = new KeyboardEvent("keydown", {
        key: "g",
        bubbles: true,
      })
      window.dispatchEvent(gEvent)
    })

    // Wait for timeout (1.5 seconds)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1600))
    })

    expect(result.current.pendingKey).toBeNull()
  })
})

describe("useShortcutHandler", () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()

    Object.defineProperty(navigator, "platform", {
      value: "MacIntel",
      configurable: true,
    })
  })

  it("calls handler for specific action", async () => {
    const mockHandler = vi.fn()

    renderHook(() => useShortcutHandler("save", mockHandler))

    // Simulate Cmd+S keydown
    const event = new KeyboardEvent("keydown", {
      key: "s",
      metaKey: true,
      bubbles: true,
    })

    act(() => {
      window.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalled()
    })
  })

  it("does not call handler for different shortcuts", async () => {
    const mockHandler = vi.fn()

    renderHook(() => useShortcutHandler("save", mockHandler))

    // Simulate Cmd+K keydown (not save)
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    })

    act(() => {
      window.dispatchEvent(event)
    })

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(mockHandler).not.toHaveBeenCalled()
  })
})
