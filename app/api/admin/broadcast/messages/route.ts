import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { Prisma } from "@prisma/client"

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

    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!body.content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    if (!body.type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 })
    }

    // Validate type
    const validTypes = ["ANNOUNCEMENT", "PRODUCT_UPDATE", "MAINTENANCE", "SECURITY_ALERT", "MARKETING", "SURVEY"]
    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ error: "Invalid broadcast type" }, { status: 400 })
    }

    // Validate priority if provided
    const validPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"]
    if (body.priority && !validPriorities.includes(body.priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 })
    }

    // Validate target type if provided
    const validTargetTypes = ["ALL", "SPECIFIC_ORGS", "SPECIFIC_PLANS", "SPECIFIC_ROLES"]
    if (body.targetType && !validTargetTypes.includes(body.targetType)) {
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 })
    }

    // Validate channels if provided
    const validChannels = ["IN_APP", "EMAIL", "PUSH", "SMS", "SLACK"]
    if (body.channels) {
      const invalidChannels = body.channels.filter((c: string) => !validChannels.includes(c))
      if (invalidChannels.length > 0) {
        return NextResponse.json({ error: `Invalid channels: ${invalidChannels.join(", ")}` }, { status: 400 })
      }
    }

    const message = await prisma.broadcastMessage.create({
      data: {
        title: body.title.trim(),
        content: body.content.trim(),
        contentHtml: body.contentHtml || null,
        type: body.type,
        priority: body.priority || "NORMAL",
        targetType: body.targetType || "ALL",
        targetOrgs: body.targetOrgs || [],
        targetPlans: body.targetPlans || [],
        targetRoles: body.targetRoles || [],
        channels: body.channels || ["IN_APP"],
        status: "DRAFT",
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        createdBy: session.admin.id,
        metadata: body.metadata || {},
      },
    })

    // Log the action
    await prisma.platformAuditLog.create({
      data: {
        action: "broadcast_message_created",
        resourceType: "broadcast_message",
        resourceId: message.id,
        actorType: "SUPER_ADMIN",
        actorId: session.admin.id,
        details: {
          title: message.title,
          type: message.type,
          targetType: message.targetType,
        },
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error("Create broadcast message error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
