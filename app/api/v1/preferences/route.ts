/**
 * User Preferences API Route
 *
 * Handles GET and PATCH operations for user preferences including theme, language, and notifications.
 *
 * @prompt-id forge-v4.1:feature:dark-mode:004
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 *
 * @module app/api/v1/preferences/route
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

/**
 * Theme enum validation
 */
const ThemeEnum = z.enum(["LIGHT", "DARK", "SYSTEM"])

/**
 * Preferences update schema
 */
const PreferencesUpdateSchema = z.object({
  theme: ThemeEnum.optional(),
  language: z.string().min(2).max(10).optional(),
  timezone: z.string().max(100).optional(),
  dateFormat: z.string().max(50).optional(),
  timeFormat: z.string().max(50).optional(),
  keyboardShortcuts: z.boolean().optional(),
  customShortcuts: z.record(z.string(), z.string()).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  compactMode: z.boolean().optional(),
  sidebarCollapsed: z.boolean().optional(),
  defaultDashboard: z.string().nullable().optional(),
  recentItems: z.array(z.string()).optional(),
  pinnedItems: z.array(z.string()).optional(),
  tourCompleted: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

type PreferencesUpdate = z.infer<typeof PreferencesUpdateSchema>

/**
 * GET /api/v1/preferences
 *
 * Retrieves the current user's preferences. Creates default preferences if none exist.
 *
 * @returns User preferences object
 *
 * @example Response
 * ```json
 * {
 *   "id": "clx...",
 *   "userId": "user_123",
 *   "theme": "DARK",
 *   "language": "en",
 *   ...
 * }
 * ```
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Try to find existing preferences
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    })

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
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
          recentItems: [],
          pinnedItems: [],
          tourCompleted: false,
          metadata: {},
        },
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("Error fetching preferences:", error)
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/v1/preferences
 *
 * Updates the current user's preferences. Supports partial updates.
 *
 * @param request - Request with JSON body containing preference updates
 * @returns Updated preferences object
 *
 * @example Request body
 * ```json
 * {
 *   "theme": "DARK",
 *   "compactMode": true
 * }
 * ```
 *
 * @example Response
 * ```json
 * {
 *   "id": "clx...",
 *   "userId": "user_123",
 *   "theme": "DARK",
 *   "compactMode": true,
 *   ...
 * }
 * ```
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate the update payload
    const validationResult = PreferencesUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid preferences data",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      )
    }

    const updates = validationResult.data

    // Check if preferences exist
    const existingPreferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    })

    let preferences

    if (existingPreferences) {
      // Update existing preferences
      preferences = await prisma.userPreferences.update({
        where: { userId: session.user.id },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new preferences with updates
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
          theme: updates.theme || "SYSTEM",
          language: updates.language || "en",
          timezone: updates.timezone || "UTC",
          dateFormat: updates.dateFormat || "MMM dd, yyyy",
          timeFormat: updates.timeFormat || "HH:mm",
          keyboardShortcuts: updates.keyboardShortcuts ?? true,
          customShortcuts: updates.customShortcuts || {},
          emailNotifications: updates.emailNotifications ?? true,
          pushNotifications: updates.pushNotifications ?? true,
          inAppNotifications: updates.inAppNotifications ?? true,
          weeklyDigest: updates.weeklyDigest ?? true,
          compactMode: updates.compactMode ?? false,
          sidebarCollapsed: updates.sidebarCollapsed ?? false,
          defaultDashboard: updates.defaultDashboard || null,
          recentItems: updates.recentItems || [],
          pinnedItems: updates.pinnedItems || [],
          tourCompleted: updates.tourCompleted ?? false,
          metadata: updates.metadata || {},
        },
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("Error updating preferences:", error)
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/v1/preferences
 *
 * Replaces all user preferences. Requires all fields.
 * This is useful for bulk preference resets or migrations.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate the full payload
    const validationResult = PreferencesUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid preferences data",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      )
    }

    const updates = validationResult.data

    // Upsert preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        ...updates,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        theme: updates.theme || "SYSTEM",
        language: updates.language || "en",
        timezone: updates.timezone || "UTC",
        dateFormat: updates.dateFormat || "MMM dd, yyyy",
        timeFormat: updates.timeFormat || "HH:mm",
        keyboardShortcuts: updates.keyboardShortcuts ?? true,
        customShortcuts: updates.customShortcuts || {},
        emailNotifications: updates.emailNotifications ?? true,
        pushNotifications: updates.pushNotifications ?? true,
        inAppNotifications: updates.inAppNotifications ?? true,
        weeklyDigest: updates.weeklyDigest ?? true,
        compactMode: updates.compactMode ?? false,
        sidebarCollapsed: updates.sidebarCollapsed ?? false,
        defaultDashboard: updates.defaultDashboard || null,
        recentItems: updates.recentItems || [],
        pinnedItems: updates.pinnedItems || [],
        tourCompleted: updates.tourCompleted ?? false,
        metadata: updates.metadata || {},
      },
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("Error replacing preferences:", error)
    return NextResponse.json(
      { error: "Failed to replace preferences" },
      { status: 500 }
    )
  }
}
