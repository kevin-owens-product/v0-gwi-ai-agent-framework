/**
 * @prompt-id forge-v4.1:feature:feature-usage-analytics:002
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * Feature Usage Analytics API
 * GET: Retrieve feature usage metrics with filtering
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { MetricPeriod } from "@prisma/client"
import { TRACKABLE_FEATURES } from "@/lib/feature-tracking"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const featureKey = searchParams.get("featureKey")
    const period = (searchParams.get("period") as MetricPeriod) || "MONTHLY"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const category = searchParams.get("category")

    // Build filter conditions
    const where: Record<string, unknown> = {
      period,
    }

    if (featureKey) {
      where.featureKey = featureKey
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        (where.date as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.date as Record<string, Date>).lte = new Date(endDate)
      }
    }

    // Fetch metrics
    const metrics = await prisma.featureUsageMetric.findMany({
      where,
      orderBy: [{ date: "desc" }, { featureKey: "asc" }],
    })

    // Filter by category if specified
    let filteredMetrics = metrics
    if (category) {
      filteredMetrics = metrics.filter(m => {
        const featureInfo = TRACKABLE_FEATURES[m.featureKey as keyof typeof TRACKABLE_FEATURES]
        return featureInfo?.category === category
      })
    }

    // Calculate summary statistics
    const latestMetrics = new Map<string, typeof metrics[0]>()
    for (const metric of filteredMetrics) {
      if (!latestMetrics.has(metric.featureKey)) {
        latestMetrics.set(metric.featureKey, metric)
      }
    }

    const latestValues = Array.from(latestMetrics.values())
    const summary = {
      totalFeatures: latestValues.length,
      totalEvents: latestValues.reduce((sum, m) => sum + m.totalEvents, 0),
      totalActiveUsers: latestValues.reduce((sum, m) => sum + m.activeUsers, 0),
      avgAdoptionRate: latestValues.length > 0
        ? Number((latestValues.reduce((sum, m) => sum + Number(m.adoptionRate), 0) / latestValues.length).toFixed(2))
        : 0,
      avgRetentionRate: latestValues.length > 0
        ? Number((latestValues.reduce((sum, m) => sum + Number(m.retentionRate), 0) / latestValues.length).toFixed(2))
        : 0,
    }

    // Get available categories
    const categories = [...new Set(
      Object.values(TRACKABLE_FEATURES).map(f => f.category)
    )].sort()

    // Get top features by adoption
    const topFeatures = latestValues
      .sort((a, b) => Number(b.adoptionRate) - Number(a.adoptionRate))
      .slice(0, 5)
      .map(m => ({
        featureKey: m.featureKey,
        featureName: m.featureName,
        adoptionRate: Number(m.adoptionRate),
        activeUsers: m.activeUsers,
      }))

    // Get underutilized features
    const underutilizedFeatures = latestValues
      .filter(m => Number(m.adoptionRate) < 20)
      .sort((a, b) => Number(a.adoptionRate) - Number(b.adoptionRate))
      .slice(0, 5)
      .map(m => ({
        featureKey: m.featureKey,
        featureName: m.featureName,
        adoptionRate: Number(m.adoptionRate),
        totalEvents: m.totalEvents,
      }))

    return NextResponse.json({
      metrics: filteredMetrics.map(m => ({
        ...m,
        adoptionRate: Number(m.adoptionRate),
        retentionRate: Number(m.retentionRate),
        category: TRACKABLE_FEATURES[m.featureKey as keyof typeof TRACKABLE_FEATURES]?.category || 'unknown',
      })),
      summary,
      categories,
      topFeatures,
      underutilizedFeatures,
    })
  } catch (error) {
    console.error("Get feature usage error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
