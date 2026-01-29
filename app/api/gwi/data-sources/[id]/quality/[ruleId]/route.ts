import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  try {
    const { id, ruleId } = await params
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

    const existingRule = await prisma.dataQualityRule.findFirst({
      where: { id: ruleId, dataSourceId: id },
    })

    if (!existingRule) {
      return NextResponse.json({ error: "Quality rule not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, field, ruleType, ruleConfig, severity, isActive } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (field !== undefined) updateData.field = field
    if (ruleType !== undefined) {
      const validRuleTypes = ["required", "format", "range", "custom"]
      if (!validRuleTypes.includes(ruleType)) {
        return NextResponse.json(
          { error: `Invalid ruleType. Must be one of: ${validRuleTypes.join(", ")}` },
          { status: 400 }
        )
      }
      updateData.ruleType = ruleType
    }
    if (ruleConfig !== undefined) updateData.ruleConfig = ruleConfig
    if (severity !== undefined) {
      const validSeverities = ["error", "warning"]
      if (!validSeverities.includes(severity)) {
        return NextResponse.json(
          { error: `Invalid severity. Must be one of: ${validSeverities.join(", ")}` },
          { status: 400 }
        )
      }
      updateData.severity = severity
    }
    if (isActive !== undefined) updateData.isActive = isActive

    const qualityRule = await prisma.dataQualityRule.update({
      where: { id: ruleId },
      data: updateData,
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_QUALITY_RULE",
        resourceType: "data_quality_rule",
        resourceId: ruleId,
        previousState: {
          name: existingRule.name,
          ruleType: existingRule.ruleType,
          severity: existingRule.severity,
        },
        newState: updateData,
      },
    })

    return NextResponse.json(qualityRule)
  } catch (error) {
    console.error("Failed to update quality rule:", error)
    return NextResponse.json(
      { error: "Failed to update quality rule" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  try {
    const { id, ruleId } = await params
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

    const existingRule = await prisma.dataQualityRule.findFirst({
      where: { id: ruleId, dataSourceId: id },
    })

    if (!existingRule) {
      return NextResponse.json({ error: "Quality rule not found" }, { status: 404 })
    }

    await prisma.dataQualityRule.delete({
      where: { id: ruleId },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_QUALITY_RULE",
        resourceType: "data_quality_rule",
        resourceId: ruleId,
        previousState: {
          name: existingRule.name,
          ruleType: existingRule.ruleType,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete quality rule:", error)
    return NextResponse.json(
      { error: "Failed to delete quality rule" },
      { status: 500 }
    )
  }
}
