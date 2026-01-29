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
      select: { id: true, code: true, displayLogic: true },
    })

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ displayLogic: question.displayLogic })
  } catch (error) {
    console.error("Failed to fetch display logic:", error)
    return NextResponse.json(
      { error: "Failed to fetch display logic" },
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
    const { displayLogic } = body

    const updatedQuestion = await prisma.surveyQuestion.update({
      where: { id: questionId },
      data: { displayLogic: displayLogic || null },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_QUESTION_DISPLAY_LOGIC",
        resourceType: "survey_question",
        resourceId: questionId,
        previousState: { displayLogic: question.displayLogic },
        newState: { displayLogic },
      },
    })

    return NextResponse.json({ displayLogic: updatedQuestion.displayLogic })
  } catch (error) {
    console.error("Failed to update display logic:", error)
    return NextResponse.json(
      { error: "Failed to update display logic" },
      { status: 500 }
    )
  }
}
