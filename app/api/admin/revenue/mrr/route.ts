/**
 * @prompt-id forge-v4.1:feature:revenue-analytics:004
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { getMRRBreakdown, calculateNetRevenueRetention } from "@/lib/revenue-metrics"

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
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    const startDate = startDateParam ? new Date(startDateParam) : undefined
    const endDate = endDateParam ? new Date(endDateParam) : undefined

    // Get MRR breakdown
    const breakdown = await getMRRBreakdown(startDate, endDate)

    // Calculate Net Revenue Retention
    const nrr = await calculateNetRevenueRetention(12) // 12 month NRR

    // Format cohort data for response
    const cohortAnalysis = breakdown.byCohort.map(cohort => ({
      cohortDate: cohort.cohortDate,
      initialCustomers: cohort.initialCustomers,
      currentCustomers: cohort.currentCustomers,
      initialMrr: cohort.initialMrr / 100, // Convert cents to dollars
      currentMrr: cohort.currentMrr / 100,
      retentionRate: cohort.retentionRate,
      revenueRetention: cohort.revenueRetention,
      monthsActive: getMonthsDifference(new Date(cohort.cohortDate), new Date()),
    }))

    // Sort cohorts by date descending
    cohortAnalysis.sort((a, b) => b.cohortDate.localeCompare(a.cohortDate))

    // Format plan breakdown
    const planBreakdown = Object.entries(breakdown.byPlan).map(([plan, data]) => ({
      plan,
      customerCount: data.customerCount,
      mrr: data.mrr / 100, // Convert cents to dollars
      percentage: Math.round(data.percentage * 100) / 100,
    }))

    return NextResponse.json({
      success: true,
      totalMrr: breakdown.total,
      totalArr: breakdown.total * 12,
      growthRate: Math.round(breakdown.growthRate * 100) / 100,
      netRevenueRetention: Math.round(nrr * 100) / 100,
      byPlan: planBreakdown,
      byCohort: cohortAnalysis.slice(0, 12), // Last 12 cohorts
      summary: {
        totalCustomers: planBreakdown.reduce((sum, p) => sum + p.customerCount, 0),
        avgMrrPerCustomer: planBreakdown.reduce((sum, p) => sum + p.customerCount, 0) > 0
          ? breakdown.total / planBreakdown.reduce((sum, p) => sum + p.customerCount, 0)
          : 0,
        topPlan: planBreakdown.sort((a, b) => b.mrr - a.mrr)[0]?.plan || "N/A",
        cohortCount: cohortAnalysis.length,
      },
    })
  } catch (error) {
    console.error("Get MRR breakdown error:", error)
    return NextResponse.json(
      { error: "Failed to fetch MRR breakdown" },
      { status: 500 }
    )
  }
}

function getMonthsDifference(startDate: Date, endDate: Date): number {
  return (
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth())
  )
}
