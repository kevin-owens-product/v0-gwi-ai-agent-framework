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
    const severity = searchParams.get("severity")
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "startedAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (severity) {
      where.severity = severity
    }

    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [incidents, total] = await Promise.all([
      prisma.platformIncident.findMany({
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
      prisma.platformIncident.count({ where }),
    ])

    return NextResponse.json({
      incidents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get incidents error:", error)
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
      severity = "MODERATE",
      type = "OUTAGE",
      affectedServices = [],
      affectedOrgs = [],
      affectedRegions = [],
      impact,
      responders = [],
    } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      )
    }

    const incident = await prisma.platformIncident.create({
      data: {
        title,
        description,
        severity,
        type,
        status: "INVESTIGATING",
        affectedServices,
        affectedOrgs,
        affectedRegions,
        impact,
        responders: [...responders, session.admin.id],
        commanderId: session.admin.id,
        startedAt: new Date(),
        detectedAt: new Date(),
        timeline: [
          {
            timestamp: new Date().toISOString(),
            event: "Incident reported",
            actor: session.admin.name || session.admin.email,
          },
        ],
      },
      include: {
        updates: true,
      },
    })

    // Create initial update
    await prisma.incidentUpdate.create({
      data: {
        incidentId: incident.id,
        message: `Incident reported: ${title}`,
        status: "INVESTIGATING",
        isPublic: true,
        postedBy: session.admin.id,
      },
    })

    // Log audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE",
        resourceType: "incident",
        resourceId: incident.id,
        details: { title, severity, type },
      },
    })

    return NextResponse.json({ incident }, { status: 201 })
  } catch (error) {
    console.error("Create incident error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
