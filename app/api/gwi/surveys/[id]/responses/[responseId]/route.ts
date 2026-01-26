import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  try {
    const { id, responseId } = await params
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

    const response = await prisma.surveyResponse.findFirst({
      where: {
        id: responseId,
        surveyId: id,
      },
      include: {
        survey: {
          select: {
            id: true,
            name: true,
            questions: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    })

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Failed to fetch response:", error)
    return NextResponse.json(
      { error: "Failed to fetch response" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  try {
    const { id, responseId } = await params
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

    const existingResponse = await prisma.surveyResponse.findFirst({
      where: {
        id: responseId,
        surveyId: id,
      },
    })

    if (!existingResponse) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 })
    }

    const body = await request.json()
    const { answers, metadata, completedAt } = body

    const updateData: Record<string, unknown> = {}
    if (answers !== undefined) updateData.answers = answers
    if (metadata !== undefined) updateData.metadata = metadata
    if (completedAt !== undefined) {
      updateData.completedAt = completedAt ? new Date(completedAt) : null
    }

    const response = await prisma.surveyResponse.update({
      where: { id: responseId },
      data: updateData,
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_RESPONSE",
        resourceType: "survey_response",
        resourceId: response.id,
        previousState: {
          answers: existingResponse.answers,
          metadata: existingResponse.metadata,
          completedAt: existingResponse.completedAt,
        },
        newState: updateData,
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Failed to update response:", error)
    return NextResponse.json(
      { error: "Failed to update response" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  try {
    const { id, responseId } = await params
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

    const response = await prisma.surveyResponse.findFirst({
      where: {
        id: responseId,
        surveyId: id,
      },
    })

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 })
    }

    await prisma.surveyResponse.delete({
      where: { id: responseId },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_RESPONSE",
        resourceType: "survey_response",
        resourceId: responseId,
        previousState: {
          surveyId: response.surveyId,
          respondentId: response.respondentId,
          completedAt: response.completedAt,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete response:", error)
    return NextResponse.json(
      { error: "Failed to delete response" },
      { status: 500 }
    )
  }
}
