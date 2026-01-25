/**
 * @prompt-id forge-v4.1:feature:revenue-analytics:002
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { MetricPeriod } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const period = (searchParams.get("period") as MetricPeriod) || "MONTHLY"
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")
    const limit = parseInt(searchParams.get("limit") || "12", 10)

    // Build query filters
    const where: Record<string, unknown> = {
      period,
    }

    if (startDateParam) {
      where.date = {
        ...((where.date as object) || {}),
        gte: new Date(startDateParam),
      }
    }

    if (endDateParam) {
      where.date = {
        ...((where.date as object) || {}),
        lte: new Date(endDateParam),
      }
    }

    // Fetch revenue metrics
    const metrics = await prisma.revenueMetric.findMany({
      where,
      orderBy: { date: "desc" },
      take: Math.min(limit, 100),
    })

    // Calculate summary statistics
    const latestMetric = metrics[0]
    const previousMetric = metrics[1]

    let mrrGrowthRate = 0
    let customerGrowthRate = 0

    if (latestMetric && previousMetric) {
      const currentMrr = Number(latestMetric.mrr)
      const previousMrr = Number(previousMetric.mrr)
      mrrGrowthRate = previousMrr > 0
        ? ((currentMrr - previousMrr) / previousMrr) * 100
        : 0

      customerGrowthRate = previousMetric.totalCustomers > 0
        ? ((latestMetric.totalCustomers - previousMetric.totalCustomers) / previousMetric.totalCustomers) * 100
        : 0
    }

    // Calculate churn rate
    const churnRate = latestMetric && Number(latestMetric.mrr) > 0
      ? (Number(latestMetric.churnMrr) / (Number(latestMetric.mrr) + Number(latestMetric.churnMrr))) * 100
      : 0

    // Calculate net revenue retention
    const nrr = latestMetric
      ? ((Number(latestMetric.mrr) - Number(latestMetric.churnMrr) + Number(latestMetric.expansionMrr)) /
         (Number(latestMetric.mrr) - Number(latestMetric.netNewMrr) + Number(latestMetric.churnMrr))) * 100
      : 100

    const summary = {
      currentMrr: latestMetric ? Number(latestMetric.mrr) : 0,
      currentArr: latestMetric ? Number(latestMetric.arr) : 0,
      mrrGrowthRate,
      customerGrowthRate,
      totalCustomers: latestMetric?.totalCustomers || 0,
      churnRate: Math.round(churnRate * 100) / 100,
      netRevenueRetention: Math.round(Math.min(nrr, 200) * 100) / 100, // Cap at 200%
      arpu: latestMetric ? Number(latestMetric.arpu) : 0,
      ltv: latestMetric ? Number(latestMetric.ltv) : 0,
    }

    // Format metrics for response
    const formattedMetrics = metrics.map(metric => ({
      id: metric.id,
      date: metric.date.toISOString(),
      period: metric.period,
      mrr: Number(metric.mrr),
      arr: Number(metric.arr),
      newMrr: Number(metric.newMrr),
      expansionMrr: Number(metric.expansionMrr),
      contractionMrr: Number(metric.contractionMrr),
      churnMrr: Number(metric.churnMrr),
      netNewMrr: Number(metric.netNewMrr),
      totalCustomers: metric.totalCustomers,
      newCustomers: metric.newCustomers,
      churnedCustomers: metric.churnedCustomers,
      arpu: Number(metric.arpu),
      ltv: Number(metric.ltv),
      cac: metric.cac ? Number(metric.cac) : null,
      byPlan: metric.byPlan,
      byRegion: metric.byRegion,
      byCohort: metric.byCohort,
      createdAt: metric.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      summary,
      metrics: formattedMetrics,
      period,
    })
  } catch (error) {
    console.error("Get revenue metrics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch revenue metrics" },
      { status: 500 }
    )
  }
}
