import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check permission
    if (!hasGWIPermission(session.admin.role, "surveys:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const surveys = await prisma.survey.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: {
          select: {
            questions: true,
            responses: true,
            distributions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(surveys)
  } catch (error) {
    console.error("Failed to fetch surveys:", error)
    return NextResponse.json(
      { error: "Failed to fetch surveys" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check permission
    if (!hasGWIPermission(session.admin.role, "surveys:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, status = "DRAFT" } = body

    if (!name) {
      return NextResponse.json(
        { error: "Survey name is required" },
        { status: 400 }
      )
    }

    const survey = await prisma.survey.create({
      data: {
        name,
        description,
        status,
        createdById: session.admin.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_SURVEY",
        resourceType: "survey",
        resourceId: survey.id,
        newState: { name, description, status },
      },
    })

    return NextResponse.json(survey, { status: 201 })
  } catch (error) {
    console.error("Failed to create survey:", error)
    return NextResponse.json(
      { error: "Failed to create survey" },
      { status: 500 }
    )
  }
}
