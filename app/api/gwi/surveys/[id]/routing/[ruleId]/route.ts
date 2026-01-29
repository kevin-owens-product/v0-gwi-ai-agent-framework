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

    if (!hasGWIPermission(session.admin.role, "surveys:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify routing rule exists and belongs to survey
    const existingRule = await prisma.surveyRoutingRule.findFirst({
      where: { id: ruleId, surveyId: id },
    })

    if (!existingRule) {
      return NextResponse.json(
        { error: "Routing rule not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      sourceQuestionId,
      condition,
      targetQuestionId,
      action,
      priority,
      isActive,
    } = body

    const updateData: Record<string, unknown> = {}
    if (sourceQuestionId !== undefined) updateData.sourceQuestionId = sourceQuestionId || null
    if (condition !== undefined) updateData.condition = condition
    if (targetQuestionId !== undefined) updateData.targetQuestionId = targetQuestionId || null
    if (action !== undefined) {
      const validActions = ["skip_to", "show_if", "hide_if", "end_survey"]
      if (!validActions.includes(action)) {
        return NextResponse.json(
          { error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
          { status: 400 }
        )
      }
      updateData.action = action
    }
    if (priority !== undefined) updateData.priority = priority
    if (isActive !== undefined) updateData.isActive = isActive

    // Validate questions exist if provided
    if (sourceQuestionId) {
      const sourceQuestion = await prisma.surveyQuestion.findFirst({
        where: { id: sourceQuestionId, surveyId: id },
      })
      if (!sourceQuestion) {
        return NextResponse.json(
          { error: "Source question not found" },
          { status: 404 }
        )
      }
    }

    if (targetQuestionId) {
      const targetQuestion = await prisma.surveyQuestion.findFirst({
        where: { id: targetQuestionId, surveyId: id },
      })
      if (!targetQuestion) {
        return NextResponse.json(
          { error: "Target question not found" },
          { status: 404 }
        )
      }
    }

    const routingRule = await prisma.surveyRoutingRule.update({
      where: { id: ruleId },
      data: updateData,
      include: {
        sourceQuestion: {
          select: { id: true, code: true, text: true },
        },
        targetQuestion: {
          select: { id: true, code: true, text: true },
        },
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_ROUTING_RULE",
        resourceType: "survey_routing",
        resourceId: routingRule.id,
        previousState: {
          action: existingRule.action,
          priority: existingRule.priority,
        },
        newState: updateData,
      },
    })

    return NextResponse.json(routingRule)
  } catch (error) {
    console.error("Failed to update routing rule:", error)
    return NextResponse.json(
      { error: "Failed to update routing rule" },
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

    if (!hasGWIPermission(session.admin.role, "surveys:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify routing rule exists and belongs to survey
    const existingRule = await prisma.surveyRoutingRule.findFirst({
      where: { id: ruleId, surveyId: id },
    })

    if (!existingRule) {
      return NextResponse.json(
        { error: "Routing rule not found" },
        { status: 404 }
      )
    }

    await prisma.surveyRoutingRule.delete({
      where: { id: ruleId },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_ROUTING_RULE",
        resourceType: "survey_routing",
        resourceId: ruleId,
        previousState: {
          action: existingRule.action,
          surveyId: id,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete routing rule:", error)
    return NextResponse.json(
      { error: "Failed to delete routing rule" },
      { status: 500 }
    )
  }
}
