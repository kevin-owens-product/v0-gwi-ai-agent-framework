import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(
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

    if (!hasGWIPermission(session.admin.role, "surveys:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify survey exists
    const survey = await prisma.survey.findUnique({
      where: { id },
    })

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const routingRules = await prisma.surveyRoutingRule.findMany({
      where: { surveyId: id },
      include: {
        sourceQuestion: {
          select: { id: true, code: true, text: true },
        },
        targetQuestion: {
          select: { id: true, code: true, text: true },
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    })

    return NextResponse.json(routingRules)
  } catch (error) {
    console.error("Failed to fetch routing rules:", error)
    return NextResponse.json(
      { error: "Failed to fetch routing rules" },
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

    if (!hasGWIPermission(session.admin.role, "surveys:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify survey exists
    const survey = await prisma.survey.findUnique({
      where: { id },
    })

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const body = await request.json()
    const {
      sourceQuestionId,
      condition,
      targetQuestionId,
      action,
      priority = 0,
      isActive = true,
    } = body

    if (!condition || !action) {
      return NextResponse.json(
        { error: "Condition and action are required" },
        { status: 400 }
      )
    }

    // Validate action
    const validActions = ["skip_to", "show_if", "hide_if", "end_survey"]
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
        { status: 400 }
      )
    }

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

    const routingRule = await prisma.surveyRoutingRule.create({
      data: {
        surveyId: id,
        sourceQuestionId: sourceQuestionId || null,
        condition,
        targetQuestionId: targetQuestionId || null,
        action,
        priority,
        isActive,
      },
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
        action: "CREATE_ROUTING_RULE",
        resourceType: "survey_routing",
        resourceId: routingRule.id,
        newState: {
          surveyId: id,
          action,
          priority,
        },
      },
    })

    return NextResponse.json(routingRule, { status: 201 })
  } catch (error) {
    console.error("Failed to create routing rule:", error)
    return NextResponse.json(
      { error: "Failed to create routing rule" },
      { status: 500 }
    )
  }
}
