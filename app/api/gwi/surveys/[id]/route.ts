import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"
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

    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        questions: { orderBy: { order: "asc" } },
        distributions: true,
        _count: {
          select: {
            responses: true,
          },
        },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    return NextResponse.json(survey)
  } catch (error) {
    console.error("Failed to fetch survey:", error)
    return NextResponse.json(
      { error: "Failed to fetch survey" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const existingSurvey = await prisma.survey.findUnique({
      where: { id },
    })

    if (!existingSurvey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, status } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status

    // Increment version on significant changes
    if (status && status !== existingSurvey.status) {
      updateData.version = existingSurvey.version + 1
    }

    const survey = await prisma.survey.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_SURVEY",
        resourceType: "survey",
        resourceId: survey.id,
        previousState: {
          name: existingSurvey.name,
          description: existingSurvey.description,
          status: existingSurvey.status,
        },
        newState: updateData as Prisma.InputJsonValue,
      },
    })

    return NextResponse.json(survey)
  } catch (error) {
    console.error("Failed to update survey:", error)
    return NextResponse.json(
      { error: "Failed to update survey" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    if (!hasGWIPermission(session.admin.role, "surveys:delete")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const survey = await prisma.survey.findUnique({
      where: { id },
    })

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    await prisma.survey.delete({
      where: { id },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_SURVEY",
        resourceType: "survey",
        resourceId: id,
        previousState: {
          name: survey.name,
          description: survey.description,
          status: survey.status,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete survey:", error)
    return NextResponse.json(
      { error: "Failed to delete survey" },
      { status: 500 }
    )
  }
}
