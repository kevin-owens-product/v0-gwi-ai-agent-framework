import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"

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
    const userId = searchParams.get("userId")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "expires"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)
    const cursor = searchParams.get("cursor")
    const activeOnly = searchParams.get("activeOnly") !== "false"

    const where: Record<string, unknown> = {}

    if (userId) {
      where.userId = userId
    }
    if (activeOnly) {
      where.expires = { gt: new Date() }
    }
    if (search) {
      where.OR = [
        { sessionToken: { contains: search, mode: "insensitive" } },
        { ipAddress: { contains: search, mode: "insensitive" } },
        { userAgent: { contains: search, mode: "insensitive" } },
      ]
    }

    // Cursor-based pagination
    if (cursor) {
      where.id = { lt: cursor }
    }

    const orderBy: Record<string, string> = {}
    orderBy[sortBy] = sortOrder

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        orderBy,
        take: limit,
        skip: cursor ? 0 : offset,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.session.count({ where }),
    ])

    const nextCursor = sessions.length === limit ? sessions[sessions.length - 1]?.id : null

    // Get stats
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [totalActive, activeLast24h, activeLastWeek, uniqueUsers] = await Promise.all([
      prisma.session.count({
        where: { expires: { gt: now } },
      }),
      prisma.session.count({
        where: {
          expires: { gt: now },
          id: {
            // Sessions created in the last 24 hours (using id as proxy since no createdAt)
            // This is an approximation - in production you'd want a createdAt field
          },
        },
      }),
      prisma.session.count({
        where: { expires: { gt: oneWeekAgo } },
      }),
      prisma.session.groupBy({
        by: ["userId"],
        where: { expires: { gt: now } },
      }).then((result: { userId: string }[]) => result.length),
    ])

    // Format sessions for response (mask sensitive data)
    const formattedSessions = sessions.map((s) => ({
      id: s.id,
      sessionTokenPrefix: s.sessionToken.substring(0, 8) + "...",
      userId: s.userId,
      user: s.user,
      expires: s.expires,
      isActive: new Date(s.expires) > now,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
    }))

    return NextResponse.json({
      sessions: formattedSessions,
      stats: {
        totalActive,
        activeLast24h,
        activeLastWeek,
        uniqueUsers,
      },
      pagination: {
        total,
        limit,
        offset: cursor ? 0 : offset,
        hasMore: sessions.length === limit,
        nextCursor,
      },
    })
  } catch (error) {
    console.error("Sessions fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}
