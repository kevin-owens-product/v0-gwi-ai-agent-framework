import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"

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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const impact = searchParams.get("impact")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "startedAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (impact) {
      where.impact = impact
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [incidents, total] = await Promise.all([
      prisma.statusPageIncident.findMany({
        where,
        include: {
          updates: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.statusPageIncident.count({ where }),
    ])

    return NextResponse.json({
      incidents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get status page incidents error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
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

    const body = await request.json()

    const {
      title,
      description,
      status = "INVESTIGATING",
      impact = "MINOR",
      affectedSystems = [],
      isPublic = true,
    } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      )
    }

    const incident = await prisma.statusPageIncident.create({
      data: {
        title,
        description,
        status,
        impact,
        affectedSystems,
        isPublic,
        startedAt: new Date(),
        source: "internal",
        metadata: {
          createdBy: session.admin.id,
          createdByName: session.admin.name || session.admin.email,
        },
      },
      include: {
        updates: true,
      },
    })

    // Create initial update
    await prisma.statusPageUpdate.create({
      data: {
        incidentId: incident.id,
        status,
        message: `Incident reported: ${title}`,
        isPublic,
        createdBy: session.admin.id,
      },
    })

    // Log audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE",
        resourceType: "status_page_incident",
        resourceId: incident.id,
        details: { title, status, impact },
      },
    })

    return NextResponse.json({ incident }, { status: 201 })
  } catch (error) {
    console.error("Create status page incident error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
