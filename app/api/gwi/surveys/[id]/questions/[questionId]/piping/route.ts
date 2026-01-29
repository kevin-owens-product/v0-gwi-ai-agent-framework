import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params
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

    const question = await prisma.surveyQuestion.findFirst({
      where: { id: questionId, surveyId: id },
      select: { id: true, code: true, text: true, pipingRules: true },
    })

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ pipingRules: question.pipingRules })
  } catch (error) {
    console.error("Failed to fetch piping rules:", error)
    return NextResponse.json(
      { error: "Failed to fetch piping rules" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params
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

    const question = await prisma.surveyQuestion.findFirst({
      where: { id: questionId, surveyId: id },
    })

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    const body = await request.json()
    const { pipingRules } = body

    const updatedQuestion = await prisma.surveyQuestion.update({
      where: { id: questionId },
      data: { pipingRules: pipingRules || null },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_QUESTION_PIPING",
        resourceType: "survey_question",
        resourceId: questionId,
        previousState: { pipingRules: question.pipingRules },
        newState: { pipingRules },
      },
    })

    return NextResponse.json({ pipingRules: updatedQuestion.pipingRules })
  } catch (error) {
    console.error("Failed to update piping rules:", error)
    return NextResponse.json(
      { error: "Failed to update piping rules" },
      { status: 500 }
    )
  }
}
