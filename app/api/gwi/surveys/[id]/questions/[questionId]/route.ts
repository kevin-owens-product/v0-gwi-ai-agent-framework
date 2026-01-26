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
      where: {
        id: questionId,
        surveyId: id,
      },
      include: {
        survey: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    })

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Fetch response statistics for this question
    const responses = await prisma.surveyResponse.findMany({
      where: { surveyId: id },
      select: { answers: true, completedAt: true },
    })

    // Calculate statistics based on question type
    const questionCode = question.code
    const answeredResponses = responses.filter((r) => {
      const answers = r.answers as Record<string, unknown>
      return answers && answers[questionCode] !== undefined
    })

    const completedResponses = answeredResponses.filter((r) => r.completedAt)

    // Build response distribution for select-type questions
    let responseDistribution: Record<string, number> = {}
    if (
      question.type === "SINGLE_SELECT" ||
      question.type === "MULTI_SELECT"
    ) {
      answeredResponses.forEach((r) => {
        const answers = r.answers as Record<string, unknown>
        const answer = answers[questionCode]
        if (Array.isArray(answer)) {
          // Multi-select
          answer.forEach((a) => {
            const key = String(a)
            responseDistribution[key] = (responseDistribution[key] || 0) + 1
          })
        } else if (answer !== undefined && answer !== null) {
          // Single-select
          const key = String(answer)
          responseDistribution[key] = (responseDistribution[key] || 0) + 1
        }
      })
    } else if (question.type === "SCALE" || question.type === "NUMERIC") {
      // For scale/numeric, calculate average and distribution
      const values: number[] = []
      answeredResponses.forEach((r) => {
        const answers = r.answers as Record<string, unknown>
        const answer = answers[questionCode]
        if (typeof answer === "number") {
          values.push(answer)
          const key = String(answer)
          responseDistribution[key] = (responseDistribution[key] || 0) + 1
        }
      })
    }

    const stats = {
      totalResponses: responses.length,
      answeredCount: answeredResponses.length,
      completedCount: completedResponses.length,
      responseRate:
        responses.length > 0
          ? Math.round((answeredResponses.length / responses.length) * 100)
          : 0,
      distribution: responseDistribution,
    }

    return NextResponse.json({
      ...question,
      stats,
    })
  } catch (error) {
    console.error("Failed to fetch question:", error)
    return NextResponse.json(
      { error: "Failed to fetch question" },
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

    const existingQuestion = await prisma.surveyQuestion.findFirst({
      where: {
        id: questionId,
        surveyId: id,
      },
    })

    if (!existingQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    const body = await request.json()
    const {
      code,
      text,
      type,
      options,
      validationRules,
      order,
      required,
      taxonomyLinks,
    } = body

    const updateData: Record<string, unknown> = {}
    if (code !== undefined) updateData.code = code
    if (text !== undefined) updateData.text = text
    if (type !== undefined) updateData.type = type
    if (options !== undefined) updateData.options = options
    if (validationRules !== undefined) updateData.validationRules = validationRules
    if (order !== undefined) updateData.order = order
    if (required !== undefined) updateData.required = required
    if (taxonomyLinks !== undefined) updateData.taxonomyLinks = taxonomyLinks

    const question = await prisma.surveyQuestion.update({
      where: { id: questionId },
      data: updateData,
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_QUESTION",
        resourceType: "survey_question",
        resourceId: question.id,
        previousState: {
          code: existingQuestion.code,
          text: existingQuestion.text,
          type: existingQuestion.type,
        },
        newState: updateData as Record<string, string | number | boolean | null>,
      },
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error("Failed to update question:", error)
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    if (!hasGWIPermission(session.admin.role, "surveys:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const question = await prisma.surveyQuestion.findFirst({
      where: {
        id: questionId,
        surveyId: id,
      },
    })

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    await prisma.surveyQuestion.delete({
      where: { id: questionId },
    })

    // Reorder remaining questions
    await prisma.$executeRaw`
      UPDATE "SurveyQuestion"
      SET "order" = "order" - 1
      WHERE "surveyId" = ${id} AND "order" > ${question.order}
    `

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_QUESTION",
        resourceType: "survey_question",
        resourceId: questionId,
        previousState: {
          code: question.code,
          text: question.text,
          type: question.type,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete question:", error)
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    )
  }
}
