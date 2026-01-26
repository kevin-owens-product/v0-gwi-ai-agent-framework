import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

// Helper to get organization ID from request
function getOrganizationId(request: NextRequest): string | null {
  return request.headers.get("X-Organization-Id")
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("gwiToken")?.value

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
    const orgId = getOrganizationId(request)

    const where: Record<string, unknown> = {}

    // Filter by organization if provided
    if (orgId) {
      where.orgId = orgId
    }

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
        organization: { select: { id: true, name: true, slug: true } },
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
    const token = cookieStore.get("gwiToken")?.value

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
    const { name, description, status = "DRAFT", orgId } = body
    const headerOrgId = getOrganizationId(request)
    const organizationId = orgId || headerOrgId

    if (!name) {
      return NextResponse.json(
        { error: "Survey name is required" },
        { status: 400 }
      )
    }

    // Validate organization exists if provided
    if (organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
      })
      if (!org) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        )
      }
    }

    const survey = await prisma.survey.create({
      data: {
        name,
        description,
        status,
        createdById: session.admin.id,
        orgId: organizationId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_SURVEY",
        resourceType: "survey",
        resourceId: survey.id,
        newState: { name, description, status, orgId: organizationId },
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
