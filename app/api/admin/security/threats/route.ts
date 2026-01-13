import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"

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
    const type = searchParams.get("type")
    const severity = searchParams.get("severity")
    const status = searchParams.get("status")
    const orgId = searchParams.get("orgId")
    const userId = searchParams.get("userId")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)
    const cursor = searchParams.get("cursor")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: Record<string, unknown> = {}

    if (type && type !== "all") {
      where.type = type
    }
    if (severity && severity !== "all") {
      where.severity = severity
    }
    if (status && status !== "all") {
      where.status = status
    }
    if (orgId) {
      where.orgId = orgId
    }
    if (userId) {
      where.userId = userId
    }
    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { source: { contains: search, mode: "insensitive" } },
        { mitigation: { contains: search, mode: "insensitive" } },
      ]
    }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        (where.createdAt as Record<string, unknown>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.createdAt as Record<string, unknown>).lte = new Date(endDate)
      }
    }

    // Cursor-based pagination
    if (cursor) {
      where.id = { lt: cursor }
    }

    const orderBy: Record<string, string> = {}
    orderBy[sortBy] = sortOrder

    const [threats, total] = await Promise.all([
      prisma.threatEvent.findMany({
        where,
        orderBy,
        take: limit,
        skip: cursor ? 0 : offset,
      }),
      prisma.threatEvent.count({ where }),
    ])

    const nextCursor = threats.length === limit ? threats[threats.length - 1]?.id : null

    // Get aggregated stats
    const stats = await prisma.threatEvent.groupBy({
      by: ["status"],
      _count: { status: true },
    })

    const statusCounts = stats.reduce(
      (acc: Record<string, number>, item: { status: string; _count: { status: number } }) => {
        acc[item.status] = item._count.status
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      threats,
      stats: statusCounts,
      pagination: {
        total,
        limit,
        offset: cursor ? 0 : offset,
        hasMore: threats.length === limit,
        nextCursor,
      },
    })
  } catch (error) {
    console.error("Threat events fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch threat events" },
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
      type,
      severity,
      source,
      orgId,
      userId,
      description,
      details,
      indicators,
      status: threatStatus,
      relatedEvents,
    } = body

    if (!type || !source || !description) {
      return NextResponse.json(
        { error: "type, source, and description are required" },
        { status: 400 }
      )
    }

    const threat = await prisma.threatEvent.create({
      data: {
        type,
        severity: severity || "WARNING",
        source,
        orgId,
        userId,
        description,
        details: details || {},
        indicators: indicators || [],
        status: threatStatus || "ACTIVE",
        relatedEvents: relatedEvents || [],
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "create_threat_event",
      resourceType: "threat_event",
      resourceId: threat.id,
      targetOrgId: orgId,
      targetUserId: userId,
      details: { type, severity, source },
    })

    return NextResponse.json({ threat }, { status: 201 })
  } catch (error) {
    console.error("Threat event creation error:", error)
    return NextResponse.json(
      { error: "Failed to create threat event" },
      { status: 500 }
    )
  }
}
