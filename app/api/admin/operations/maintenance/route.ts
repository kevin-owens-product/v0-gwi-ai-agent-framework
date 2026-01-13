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
    const type = searchParams.get("type")
    const upcoming = searchParams.get("upcoming")
    const sortBy = searchParams.get("sortBy") || "scheduledStart"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    if (upcoming === "true") {
      where.scheduledStart = { gte: new Date() }
      where.status = { in: ["SCHEDULED", "IN_PROGRESS"] }
    }

    const [windows, total] = await Promise.all([
      prisma.maintenanceWindow.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.maintenanceWindow.count({ where }),
    ])

    return NextResponse.json({
      windows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get maintenance windows error:", error)
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
      type = "SCHEDULED",
      affectedServices = [],
      affectedRegions = [],
      scheduledStart,
      scheduledEnd,
      notifyBefore = 24,
    } = body

    if (!title || !scheduledStart || !scheduledEnd) {
      return NextResponse.json(
        { error: "Title, scheduledStart, and scheduledEnd are required" },
        { status: 400 }
      )
    }

    const startDate = new Date(scheduledStart)
    const endDate = new Date(scheduledEnd)

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    const window = await prisma.maintenanceWindow.create({
      data: {
        title,
        description,
        type,
        status: "SCHEDULED",
        affectedServices,
        affectedRegions,
        scheduledStart: startDate,
        scheduledEnd: endDate,
        notifyBefore,
        createdBy: session.admin.id,
      },
    })

    // Log audit
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE",
        resourceType: "maintenance_window",
        resourceId: window.id,
        details: { title, type, scheduledStart, scheduledEnd },
      },
    })

    return NextResponse.json({ window }, { status: 201 })
  } catch (error) {
    console.error("Create maintenance window error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
