/**
 * @prompt-id forge-v4.1:feature:feature-usage-analytics:003
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * Feature Usage Tracking API
 * POST: Track a feature usage event
 */

import { NextRequest, NextResponse } from "next/server"
import { trackFeatureUsage, TRACKABLE_FEATURES, FeatureKey } from "@/lib/feature-tracking"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { userId, orgId, featureKey, metadata, sessionId, duration } = body

    // Validate required fields
    if (!userId || !orgId || !featureKey) {
      return NextResponse.json(
        { error: "Missing required fields: userId, orgId, featureKey" },
        { status: 400 }
      )
    }

    // Validate feature key
    if (!TRACKABLE_FEATURES[featureKey as FeatureKey]) {
      return NextResponse.json(
        { error: `Invalid feature key: ${featureKey}. See available features in TRACKABLE_FEATURES.` },
        { status: 400 }
      )
    }

    // Track the event (non-blocking)
    await trackFeatureUsage({
      userId,
      orgId,
      featureKey: featureKey as FeatureKey,
      metadata,
      sessionId,
      duration,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Track feature usage error:", error)
    return NextResponse.json(
      { error: "Failed to track feature usage" },
      { status: 500 }
    )
  }
}
