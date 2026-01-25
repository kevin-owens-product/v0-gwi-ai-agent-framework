/**
 * User Preferences Hook Tests
 *
 * @prompt-id forge-v4.1:feature:dark-mode:008
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { usePreferences, useThemePreference, defaultPreferences } from "./use-preferences"

// Mock SWR
vi.mock("swr", () => ({
  default: vi.fn(),
  mutate: vi.fn(),
}))

import useSWR from "swr"

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("usePreferences", () => {
  const mockPreferences = {
    id: "pref_123",
    userId: "user_456",
    theme: "DARK" as const,
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
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-25T00:00:00Z",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPreferences),
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it("returns preferences data from SWR", async () => {
    const mockMutate = vi.fn()

    ;(useSWR as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPreferences,
      error: null,
      isLoading: false,
      mutate: mockMutate,
    })

    const { result } = renderHook(() => usePreferences())

    expect(result.current.preferences).toEqual(mockPreferences)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("returns loading state", () => {
    ;(useSWR as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      mutate: vi.fn(),
    })

    const { result } = renderHook(() => usePreferences())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.preferences).toBeUndefined()
  })

  it("returns error state", () => {
    const error = new Error("Failed to fetch")

    ;(useSWR as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      error,
      isLoading: false,
      mutate: vi.fn(),
    })

    const { result } = renderHook(() => usePreferences())

    expect(result.current.error).toEqual(error)
  })

  it("updatePreferences calls PATCH endpoint", async () => {
    const mockMutate = vi.fn()

    ;(useSWR as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPreferences,
      error: null,
      isLoading: false,
      mutate: mockMutate,
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...mockPreferences, theme: "LIGHT" }),
    })

    const { result } = renderHook(() => usePreferences())

    await act(async () => {
      await result.current.updatePreferences({ theme: "LIGHT" })
    })

    expect(mockFetch).toHaveBeenCalledWith("/api/v1/preferences", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ theme: "LIGHT" }),
    })
  })

  it("updatePreference updates a single field", async () => {
    const mockMutate = vi.fn()

    ;(useSWR as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPreferences,
      error: null,
      isLoading: false,
      mutate: mockMutate,
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...mockPreferences, compactMode: true }),
    })

    const { result } = renderHook(() => usePreferences())

    await act(async () => {
      await result.current.updatePreference("compactMode", true)
    })

    expect(mockFetch).toHaveBeenCalledWith("/api/v1/preferences", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ compactMode: true }),
    })
  })

  it("handles update failure with rollback", async () => {
    const mockMutate = vi.fn()

    ;(useSWR as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPreferences,
      error: null,
      isLoading: false,
      mutate: mockMutate,
    })

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Update failed" }),
    })

    const { result } = renderHook(() => usePreferences())

    await act(async () => {
      const updated = await result.current.updatePreferences({ theme: "LIGHT" })
      expect(updated).toBeNull()
    })

    expect(result.current.error).toBeTruthy()
  })

  it("resetPreferences resets to defaults", async () => {
    const mockMutate = vi.fn()

    ;(useSWR as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPreferences,
      error: null,
      isLoading: false,
      mutate: mockMutate,
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...mockPreferences, ...defaultPreferences }),
    })

    const { result } = renderHook(() => usePreferences())

    await act(async () => {
      await result.current.resetPreferences()
    })

    expect(mockFetch).toHaveBeenCalledWith("/api/v1/preferences", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(defaultPreferences),
    })
  })
})

describe("useThemePreference", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns theme from preferences", () => {
    const mockPreferences = {
      theme: "DARK" as const,
    }

    ;(useSWR as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockPreferences,
      error: null,
      isLoading: false,
      mutate: vi.fn(),
    })

    const { result } = renderHook(() => useThemePreference())

    expect(result.current.theme).toBe("DARK")
  })

  it("returns SYSTEM as default theme when no preferences", () => {
    ;(useSWR as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      mutate: vi.fn(),
    })

    const { result } = renderHook(() => useThemePreference())

    expect(result.current.theme).toBe("SYSTEM")
  })

  it("setTheme updates theme preference", async () => {
    const mockMutate = vi.fn()

    ;(useSWR as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { theme: "LIGHT" },
      error: null,
      isLoading: false,
      mutate: mockMutate,
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ theme: "DARK" }),
    })

    const { result } = renderHook(() => useThemePreference())

    await act(async () => {
      await result.current.setTheme("DARK")
    })

    expect(mockFetch).toHaveBeenCalledWith("/api/v1/preferences", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ theme: "DARK" }),
    })
  })
})

describe("defaultPreferences", () => {
  it("has correct default values", () => {
    expect(defaultPreferences.theme).toBe("SYSTEM")
    expect(defaultPreferences.language).toBe("en")
    expect(defaultPreferences.timezone).toBe("UTC")
    expect(defaultPreferences.keyboardShortcuts).toBe(true)
    expect(defaultPreferences.emailNotifications).toBe(true)
    expect(defaultPreferences.compactMode).toBe(false)
    expect(defaultPreferences.sidebarCollapsed).toBe(false)
    expect(defaultPreferences.tourCompleted).toBe(false)
  })

  it("has empty arrays for recent and pinned items", () => {
    expect(defaultPreferences.recentItems).toEqual([])
    expect(defaultPreferences.pinnedItems).toEqual([])
  })

  it("has empty objects for customShortcuts and metadata", () => {
    expect(defaultPreferences.customShortcuts).toEqual({})
    expect(defaultPreferences.metadata).toEqual({})
  })
})
