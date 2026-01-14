import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { Prisma } from "@prisma/client"

// This route handles /api/admin/broadcast which forwards to the messages endpoint
// for backwards compatibility with frontend calls

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
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const status = searchParams.get("status") || ""
    const channel = searchParams.get("channel") || ""
    const priority = searchParams.get("priority") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const where: Prisma.BroadcastMessageWhereInput = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ]
    }

    if (type) {
      where.type = type as Prisma.EnumBroadcastTypeFilter["equals"]
    }

    if (status) {
      where.status = status as Prisma.EnumBroadcastStatusFilter["equals"]
    }

    if (channel) {
      where.channels = { has: channel as "IN_APP" | "EMAIL" | "PUSH" | "SMS" | "SLACK" }
    }

    if (priority) {
      where.priority = priority as Prisma.EnumBroadcastPriorityFilter["equals"]
    }

    const [messages, total] = await Promise.all([
      prisma.broadcastMessage.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.broadcastMessage.count({ where }),
    ])

    // Get statistics
    const stats = await prisma.broadcastMessage.groupBy({
      by: ["status"],
      _count: { status: true },
    })

    const statusCounts = stats.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        draft: statusCounts.DRAFT || 0,
        scheduled: statusCounts.SCHEDULED || 0,
        sending: statusCounts.SENDING || 0,
        sent: statusCounts.SENT || 0,
        cancelled: statusCounts.CANCELLED || 0,
      },
    })
  } catch (error) {
    console.error("Get broadcast messages error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
