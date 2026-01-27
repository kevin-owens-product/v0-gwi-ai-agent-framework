/**
 * User Preferences API Route Tests
 *
 * @prompt-id forge-v4.1:feature:dark-mode:009
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import { GET, PATCH, PUT } from "./route"

// Mock auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

// Mock db
vi.mock("@/lib/db", () => ({
  prisma: {
    userPreferences: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

describe("GET /api/v1/preferences", () => {
  const mockPreferences = {
    id: "pref_123",
    userId: "user_456",
    theme: "DARK",
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
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 if not authenticated", async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe("Unauthorized")
  })

  it("returns existing preferences", async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user_456" },
    })
    ;(prisma.userPreferences.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockPreferences
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe("pref_123")
    expect(data.theme).toBe("DARK")
  })

  it("creates default preferences if none exist", async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user_456" },
    })
    ;(prisma.userPreferences.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(prisma.userPreferences.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockPreferences,
      theme: "SYSTEM",
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.userPreferences.create).toHaveBeenCalled()
    expect(data.theme).toBe("SYSTEM")
  })
})

describe("PATCH /api/v1/preferences", () => {
  const mockPreferences = {
    id: "pref_123",
    userId: "user_456",
    theme: "DARK",
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
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 if not authenticated", async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const request = new NextRequest("http://localhost/api/v1/preferences", {
      method: "PATCH",
      body: JSON.stringify({ theme: "LIGHT" }),
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe("Unauthorized")
  })

  it("validates request body", async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user_456" },
    })

    const request = new NextRequest("http://localhost/api/v1/preferences", {
      method: "PATCH",
      body: JSON.stringify({ theme: "INVALID" }),
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Invalid preferences data")
  })

  it("updates existing preferences", async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user_456" },
    })
    ;(prisma.userPreferences.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockPreferences
    )
    ;(prisma.userPreferences.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockPreferences,
      theme: "LIGHT",
    })

    const request = new NextRequest("http://localhost/api/v1/preferences", {
      method: "PATCH",
      body: JSON.stringify({ theme: "LIGHT" }),
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.theme).toBe("LIGHT")
    expect(prisma.userPreferences.update).toHaveBeenCalledWith({
      where: { userId: "user_456" },
      data: expect.objectContaining({ theme: "LIGHT" }),
    })
  })

  it("creates preferences if they do not exist", async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user_456" },
    })
    ;(prisma.userPreferences.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(prisma.userPreferences.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockPreferences,
      theme: "LIGHT",
    })

    const request = new NextRequest("http://localhost/api/v1/preferences", {
      method: "PATCH",
      body: JSON.stringify({ theme: "LIGHT" }),
    })

    const response = await PATCH(request)
    void await response.json()

    expect(response.status).toBe(200)
    expect(prisma.userPreferences.create).toHaveBeenCalled()
  })

  it("validates theme enum values", async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user_456" },
    })

    const request = new NextRequest("http://localhost/api/v1/preferences", {
      method: "PATCH",
      body: JSON.stringify({ theme: "light" }), // lowercase should fail
    })

    const response = await PATCH(request)

    expect(response.status).toBe(400)
  })

  it("accepts valid theme values", async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user_456" },
    })
    ;(prisma.userPreferences.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockPreferences
    )
    ;(prisma.userPreferences.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockPreferences,
      theme: "SYSTEM",
    })

    const request = new NextRequest("http://localhost/api/v1/preferences", {
      method: "PATCH",
      body: JSON.stringify({ theme: "SYSTEM" }),
    })

    const response = await PATCH(request)

    expect(response.status).toBe(200)
  })

  it("allows partial updates", async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user_456" },
    })
    ;(prisma.userPreferences.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockPreferences
    )
    ;(prisma.userPreferences.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockPreferences,
      compactMode: true,
    })

    const request = new NextRequest("http://localhost/api/v1/preferences", {
      method: "PATCH",
      body: JSON.stringify({ compactMode: true }),
    })

    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.compactMode).toBe(true)
  })
})

describe("PUT /api/v1/preferences", () => {
  const mockPreferences = {
    id: "pref_123",
    userId: "user_456",
    theme: "DARK",
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
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 if not authenticated", async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const request = new NextRequest("http://localhost/api/v1/preferences", {
      method: "PUT",
      body: JSON.stringify({ theme: "LIGHT" }),
    })

    const response = await PUT(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe("Unauthorized")
  })

  it("upserts preferences", async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "user_456" },
    })
    ;(prisma.userPreferences.upsert as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockPreferences
    )

    const request = new NextRequest("http://localhost/api/v1/preferences", {
      method: "PUT",
      body: JSON.stringify({
        theme: "LIGHT",
        language: "es",
      }),
    })

    const response = await PUT(request)

    expect(response.status).toBe(200)
    expect(prisma.userPreferences.upsert).toHaveBeenCalled()
  })
})
