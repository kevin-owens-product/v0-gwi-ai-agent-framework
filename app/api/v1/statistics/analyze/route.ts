import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserMembership, getValidatedOrgId } from "@/lib/tenant"
import { hasPermission } from "@/lib/permissions"
import {
  performLinearRegression,
  performANOVA,
  performHypothesisTest,
  calculateCorrelationMatrix,
  generateForecast,
} from "@/lib/statistical-engine"

/**
 * POST /api/v1/statistics/analyze
 * Comprehensive statistical analysis endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 })
    }

    if (!hasPermission(membership.role, "charts:read")) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    const body = await request.json()
    const { analysisType, data, options } = body

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Data is required and must be an array" }, { status: 400 })
    }

    let result: unknown

    switch (analysisType) {
      case "regression":
        if (!options?.xField || !options?.yField) {
          return NextResponse.json({ error: "xField and yField are required for regression" }, { status: 400 })
        }
        result = performLinearRegression(data, options.xField, options.yField)
        break

      case "anova":
        if (!options?.groups || !Array.isArray(options.groups)) {
          return NextResponse.json({ error: "groups array is required for ANOVA" }, { status: 400 })
        }
        result = performANOVA(options.groups)
        break

      case "hypothesis-test":
        if (!options?.sample1 || !Array.isArray(options.sample1)) {
          return NextResponse.json({ error: "sample1 array is required" }, { status: 400 })
        }
        result = performHypothesisTest(
          options.sample1,
          options.sample2 || null,
          options.testType || "t-test",
          {
            alternative: options.alternative || "two-sided",
            confidenceLevel: options.confidenceLevel || 95,
            mu0: options.mu0 || 0,
          }
        )
        break

      case "correlation-matrix":
        if (!options?.fields || !Array.isArray(options.fields)) {
          return NextResponse.json({ error: "fields array is required for correlation matrix" }, { status: 400 })
        }
        result = calculateCorrelationMatrix(data, options.fields)
        break

      case "forecast":
        if (!options?.field) {
          return NextResponse.json({ error: "field is required for forecast" }, { status: 400 })
        }
        const values = data.map((row) => Number(row[options.field]) || 0).filter((v) => !isNaN(v))
        result = generateForecast(values, options.periods || 5, options.confidenceLevel || 95)
        break

      default:
        return NextResponse.json({ error: "Invalid analysis type" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      analysisType,
      result,
    })
  } catch (error) {
    console.error("Error performing statistical analysis:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
