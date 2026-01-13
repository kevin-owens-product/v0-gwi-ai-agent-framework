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
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const type = searchParams.get("type") || undefined
    const isActive = searchParams.get("isActive")
    const search = searchParams.get("search") || undefined

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (type) {
      where.type = type
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true"
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [reports, total] = await Promise.all([
      prisma.customReport.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.customReport.count({ where }),
    ])

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get custom reports error:", error)
    return NextResponse.json(
      { error: "Failed to fetch custom reports" },
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
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      type,
      query,
      schedule,
      recipients,
      format,
    } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      )
    }

    // Calculate next run time if scheduled
    let nextRunAt = null
    if (schedule) {
      // Simple schedule parsing - for production, use a cron parser
      const now = new Date()
      if (schedule === "daily") {
        nextRunAt = new Date(now)
        nextRunAt.setDate(nextRunAt.getDate() + 1)
        nextRunAt.setHours(0, 0, 0, 0)
      } else if (schedule === "weekly") {
        nextRunAt = new Date(now)
        nextRunAt.setDate(nextRunAt.getDate() + (7 - nextRunAt.getDay()))
        nextRunAt.setHours(0, 0, 0, 0)
      } else if (schedule === "monthly") {
        nextRunAt = new Date(now)
        nextRunAt.setMonth(nextRunAt.getMonth() + 1)
        nextRunAt.setDate(1)
        nextRunAt.setHours(0, 0, 0, 0)
      }
    }

    const report = await prisma.customReport.create({
      data: {
        name,
        description: description || null,
        type,
        query: query || {},
        schedule: schedule || null,
        recipients: recipients || [],
        format: format || "csv",
        isActive: true,
        nextRunAt,
        createdBy: session.admin.id,
        metadata: {
          createdAt: new Date().toISOString(),
        },
      },
    })

    // Log the action
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_CUSTOM_REPORT",
        resourceType: "custom_report",
        resourceId: report.id,
        details: { name, type },
      },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Create custom report error:", error)
    return NextResponse.json(
      { error: "Failed to create custom report" },
      { status: 500 }
    )
  }
}
