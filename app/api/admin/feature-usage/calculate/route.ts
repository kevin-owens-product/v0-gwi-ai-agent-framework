/**
 * @prompt-id forge-v4.1:feature:feature-usage-analytics:004
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * Feature Metrics Calculation API
 * POST: Aggregate feature usage for a specified period
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { calculateFeatureMetrics, TRACKABLE_FEATURES } from "@/lib/feature-tracking"
import { MetricPeriod } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      date = new Date().toISOString(),
      period = "MONTHLY",
    } = body

    // Validate period
    const validPeriods: MetricPeriod[] = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]
    if (!validPeriods.includes(period as MetricPeriod)) {
      return NextResponse.json(
        { error: `Invalid period. Must be one of: ${validPeriods.join(", ")}` },
        { status: 400 }
      )
    }

    // Calculate metrics for all features
    const metrics = await calculateFeatureMetrics(
      new Date(date),
      period as MetricPeriod
    )

    // Summarize results
    const succeeded = metrics.filter(m => m.totalEvents > 0 || m.activeUsers > 0).length
    const totalFeatures = Object.keys(TRACKABLE_FEATURES).length

    return NextResponse.json({
      success: true,
      date,
      period,
      calculated: succeeded,
      total: totalFeatures,
      metrics: metrics.map(m => ({
        featureKey: m.featureKey,
        featureName: m.featureName,
        activeUsers: m.activeUsers,
        totalEvents: m.totalEvents,
        adoptionRate: m.adoptionRate,
        retentionRate: m.retentionRate,
      })),
    })
  } catch (error) {
    console.error("Calculate feature metrics error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
