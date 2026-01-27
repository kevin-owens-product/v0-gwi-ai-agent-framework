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

    if (!hasGWIPermission(session.admin.role, "surveys:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const questions = await prisma.surveyQuestion.findMany({
      where: { surveyId: id },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error("Failed to fetch questions:", error)
    return NextResponse.json(
      { error: "Failed to fetch questions" },
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
      code,
      text,
      type,
      options,
      validationRules,
      order,
      required = true,
      taxonomyLinks,
    } = body

    if (!code || !text || !type) {
      return NextResponse.json(
        { error: "Code, text, and type are required" },
        { status: 400 }
      )
    }

    // Get the next order if not provided
    let questionOrder = order
    if (questionOrder === undefined) {
      const lastQuestion = await prisma.surveyQuestion.findFirst({
        where: { surveyId: id },
        orderBy: { order: "desc" },
      })
      questionOrder = lastQuestion ? lastQuestion.order + 1 : 0
    }

    const question = await prisma.surveyQuestion.create({
      data: {
        surveyId: id,
        code,
        text,
        type,
        options,
        validationRules,
        order: questionOrder,
        required,
        taxonomyLinks,
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_QUESTION",
        resourceType: "survey_question",
        resourceId: question.id,
        newState: { surveyId: id, code, text, type },
      },
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error("Failed to create question:", error)
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    )
  }
}
