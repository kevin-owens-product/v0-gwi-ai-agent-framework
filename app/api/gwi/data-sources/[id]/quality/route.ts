import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("gwiToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "datasources:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const dataSource = await prisma.gWIDataSourceConnection.findUnique({
      where: { id },
      include: {
        qualityRules: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!dataSource) {
      return NextResponse.json(
        { error: "Data source not found" },
        { status: 404 }
      )
    }

    // Calculate quality score (simplified - in production would analyze actual data)
    const totalRules = dataSource.qualityRules.length
    const errorRules = dataSource.qualityRules.filter(
      (r) => r.severity === "error"
    ).length
    const warningRules = dataSource.qualityRules.filter(
      (r) => r.severity === "warning"
    ).length

    // Placeholder quality score calculation
    const qualityScore = totalRules > 0
      ? Math.max(0, 100 - errorRules * 10 - warningRules * 5)
      : 100

    return NextResponse.json({
      qualityRules: dataSource.qualityRules,
      qualityScore,
      metrics: {
        totalRules,
        errorRules,
        warningRules,
      },
    })
  } catch (error) {
    console.error("Failed to fetch quality rules:", error)
    return NextResponse.json(
      { error: "Failed to fetch quality rules" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get("gwiToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "datasources:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const dataSource = await prisma.gWIDataSourceConnection.findUnique({
      where: { id },
    })

    if (!dataSource) {
      return NextResponse.json(
        { error: "Data source not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, field, ruleType, ruleConfig, severity = "error", isActive = true } = body

    if (!name || !field || !ruleType || !ruleConfig) {
      return NextResponse.json(
        { error: "Name, field, ruleType, and ruleConfig are required" },
        { status: 400 }
      )
    }

    const validRuleTypes = ["required", "format", "range", "custom"]
    if (!validRuleTypes.includes(ruleType)) {
      return NextResponse.json(
        { error: `Invalid ruleType. Must be one of: ${validRuleTypes.join(", ")}` },
        { status: 400 }
      )
    }

    const validSeverities = ["error", "warning"]
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: `Invalid severity. Must be one of: ${validSeverities.join(", ")}` },
        { status: 400 }
      )
    }

    const qualityRule = await prisma.dataQualityRule.create({
      data: {
        dataSourceId: id,
        name,
        field,
        ruleType,
        ruleConfig,
        severity,
        isActive,
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_QUALITY_RULE",
        resourceType: "data_quality_rule",
        resourceId: qualityRule.id,
        newState: {
          dataSourceId: id,
          name,
          ruleType,
          severity,
        },
      },
    })

    return NextResponse.json(qualityRule, { status: 201 })
  } catch (error) {
    console.error("Failed to create quality rule:", error)
    return NextResponse.json(
      { error: "Failed to create quality rule" },
      { status: 500 }
    )
  }
}
