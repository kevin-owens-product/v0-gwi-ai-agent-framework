/**
 * @prompt-id forge-v4.1:feature:revenue-analytics:005
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { getRevenueForecast } from "@/lib/revenue-metrics"
import { prisma } from "@/lib/db"

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
    const months = Math.min(parseInt(searchParams.get("months") || "12", 10), 24)

    // Get forecast data
    const forecast = await getRevenueForecast(months)

    // Get historical data for comparison
    const historicalMetrics = await prisma.revenueMetric.findMany({
      where: { period: "MONTHLY" },
      orderBy: { date: "desc" },
      take: 12,
    })

    const historicalData = historicalMetrics
      .map(m => ({
        period: m.date.toISOString().slice(0, 7),
        mrr: Number(m.mrr),
        arr: Number(m.arr),
        isActual: true,
      }))
      .reverse()

    // Calculate trend metrics
    let trendDirection: "up" | "down" | "stable" = "stable"
    let avgGrowthRate = 0

    if (historicalData.length >= 2) {
      const recentMrr = historicalData[historicalData.length - 1]?.mrr || 0
      const olderMrr = historicalData[0]?.mrr || 0

      if (recentMrr > olderMrr * 1.05) {
        trendDirection = "up"
      } else if (recentMrr < olderMrr * 0.95) {
        trendDirection = "down"
      }

      // Calculate CAGR (Compound Annual Growth Rate)
      if (olderMrr > 0 && historicalData.length > 1) {
        const periods = historicalData.length
        avgGrowthRate = (Math.pow(recentMrr / olderMrr, 1 / periods) - 1) * 100
      }
    }

    // Calculate projected totals
    const projectedEndOfYear = forecast.find(
      f => f.period.endsWith("-12") || forecast.indexOf(f) === forecast.length - 1
    )

    // Scenario analysis
    const scenarios = {
      conservative: {
        description: "Assumes 50% of projected growth",
        projectedMrr: forecast[months - 1]
          ? forecast[months - 1].projectedMrr * 0.75
          : 0,
        projectedArr: forecast[months - 1]
          ? forecast[months - 1].projectedArr * 0.75
          : 0,
      },
      moderate: {
        description: "Based on historical trends",
        projectedMrr: forecast[months - 1]?.projectedMrr || 0,
        projectedArr: forecast[months - 1]?.projectedArr || 0,
      },
      optimistic: {
        description: "Assumes 150% of projected growth",
        projectedMrr: forecast[months - 1]
          ? forecast[months - 1].projectedMrr * 1.25
          : 0,
        projectedArr: forecast[months - 1]
          ? forecast[months - 1].projectedArr * 1.25
          : 0,
      },
    }

    return NextResponse.json({
      success: true,
      forecast: forecast.map(f => ({
        ...f,
        isActual: false,
      })),
      historical: historicalData,
      analysis: {
        trendDirection,
        avgMonthlyGrowthRate: Math.round(avgGrowthRate * 100) / 100,
        dataPointsAnalyzed: historicalData.length,
        forecastPeriods: months,
        confidenceLevel: forecast[0]?.confidence || 0,
      },
      scenarios,
      projections: {
        endOfForecast: {
          period: forecast[months - 1]?.period || "N/A",
          mrr: forecast[months - 1]?.projectedMrr || 0,
          arr: forecast[months - 1]?.projectedArr || 0,
          confidence: forecast[months - 1]?.confidence || 0,
        },
        nextQuarter: {
          period: forecast[2]?.period || "N/A",
          mrr: forecast[2]?.projectedMrr || 0,
          arr: forecast[2]?.projectedArr || 0,
          confidence: forecast[2]?.confidence || 0,
        },
      },
    })
  } catch (error) {
    console.error("Get revenue forecast error:", error)
    return NextResponse.json(
      { error: "Failed to generate revenue forecast" },
      { status: 500 }
    )
  }
}
