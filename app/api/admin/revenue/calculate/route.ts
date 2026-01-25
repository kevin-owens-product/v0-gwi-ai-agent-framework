/**
 * @prompt-id forge-v4.1:feature:revenue-analytics:003
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"
import { calculateRevenueMetrics, storeRevenueMetrics } from "@/lib/revenue-metrics"
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
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const period = (body.period as MetricPeriod) || "MONTHLY"
    const dateParam = body.date ? new Date(body.date) : new Date()

    // Validate period
    const validPeriods: MetricPeriod[] = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: "Invalid period. Must be one of: DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY" },
        { status: 400 }
      )
    }

    // Calculate revenue metrics
    const metrics = await calculateRevenueMetrics(dateParam, period)

    // Store in database
    const result = await storeRevenueMetrics(metrics)

    // Log the action
    await logPlatformAudit({
      adminId: session.admin.id,
      action: "calculate_revenue_metrics",
      resourceType: "revenue_metric",
      resourceId: result.id,
      details: {
        period,
        date: dateParam.toISOString(),
        mrr: Number(metrics.mrr),
        arr: Number(metrics.arr),
        totalCustomers: metrics.totalCustomers,
      },
    })

    return NextResponse.json({
      success: true,
      id: result.id,
      date: dateParam.toISOString(),
      period,
      metrics: {
        mrr: Number(metrics.mrr),
        arr: Number(metrics.arr),
        newMrr: Number(metrics.newMrr),
        expansionMrr: Number(metrics.expansionMrr),
        contractionMrr: Number(metrics.contractionMrr),
        churnMrr: Number(metrics.churnMrr),
        netNewMrr: Number(metrics.netNewMrr),
        totalCustomers: metrics.totalCustomers,
        newCustomers: metrics.newCustomers,
        churnedCustomers: metrics.churnedCustomers,
        arpu: Number(metrics.arpu),
        ltv: Number(metrics.ltv),
        byPlan: metrics.byPlan,
        byRegion: metrics.byRegion,
      },
    })
  } catch (error) {
    console.error("Calculate revenue metrics error:", error)
    return NextResponse.json(
      { error: "Failed to calculate revenue metrics" },
      { status: 500 }
    )
  }
}
