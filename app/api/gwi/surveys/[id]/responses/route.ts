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

    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status") // "completed" | "incomplete" | null
    const respondentId = searchParams.get("respondentId")

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = { surveyId: id }

    if (status === "completed") {
      where.completedAt = { not: null }
    } else if (status === "incomplete") {
      where.completedAt = null
    }

    if (respondentId) {
      where.respondentId = { contains: respondentId, mode: "insensitive" }
    }

    // Get responses with pagination
    const [responses, total] = await Promise.all([
      prisma.surveyResponse.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.surveyResponse.count({ where }),
    ])

    return NextResponse.json({
      responses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Failed to fetch responses:", error)
    return NextResponse.json(
      { error: "Failed to fetch responses" },
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

    // Verify survey exists and is active
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } },
    })

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const body = await request.json()
    const { respondentId, answers, metadata, completedAt } = body

    if (!respondentId) {
      return NextResponse.json(
        { error: "Respondent ID is required" },
        { status: 400 }
      )
    }

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Answers object is required" },
        { status: 400 }
      )
    }

    // Create the response
    const response = await prisma.surveyResponse.create({
      data: {
        surveyId: id,
        respondentId,
        answers,
        metadata: metadata || null,
        completedAt: completedAt ? new Date(completedAt) : null,
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_RESPONSE",
        resourceType: "survey_response",
        resourceId: response.id,
        newState: {
          surveyId: id,
          respondentId,
          completed: !!completedAt,
        },
      },
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Failed to create response:", error)
    return NextResponse.json(
      { error: "Failed to create response" },
      { status: 500 }
    )
  }
}
