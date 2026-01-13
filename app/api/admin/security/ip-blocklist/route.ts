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
    const orgId = searchParams.get("orgId")
    const isActive = searchParams.get("isActive")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)
    const cursor = searchParams.get("cursor")
    const includeExpired = searchParams.get("includeExpired") === "true"

    const where: Record<string, unknown> = {}

    if (type && type !== "all") {
      where.type = type
    }
    if (orgId) {
      where.orgId = orgId
    } else if (orgId === "null" || orgId === "platform") {
      where.orgId = null
    }
    if (isActive !== null && isActive !== undefined && isActive !== "all") {
      where.isActive = isActive === "true"
    }
    if (!includeExpired) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ]
    }
    if (search) {
      where.AND = [
        where.OR ? { OR: where.OR } : {},
        {
          OR: [
            { ipAddress: { contains: search, mode: "insensitive" } },
            { ipRange: { contains: search, mode: "insensitive" } },
            { reason: { contains: search, mode: "insensitive" } },
          ],
        },
      ]
      delete where.OR
    }

    // Cursor-based pagination
    if (cursor) {
      if (where.AND) {
        (where.AND as Record<string, unknown>[]).push({ id: { lt: cursor } })
      } else {
        where.id = { lt: cursor }
      }
    }

    const orderBy: Record<string, string> = {}
    orderBy[sortBy] = sortOrder

    const [blocklist, total] = await Promise.all([
      prisma.iPBlocklist.findMany({
        where,
        orderBy,
        take: limit,
        skip: cursor ? 0 : offset,
      }),
      prisma.iPBlocklist.count({ where }),
    ])

    const nextCursor = blocklist.length === limit ? blocklist[blocklist.length - 1]?.id : null

    // Get aggregated stats by type
    const stats = await prisma.iPBlocklist.groupBy({
      by: ["type"],
      where: { isActive: true },
      _count: { type: true },
    })

    const typeCounts = stats.reduce(
      (acc: Record<string, number>, item: { type: string; _count: { type: number } }) => {
        acc[item.type] = item._count.type
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      blocklist,
      stats: typeCounts,
      pagination: {
        total,
        limit,
        offset: cursor ? 0 : offset,
        hasMore: blocklist.length === limit,
        nextCursor,
      },
    })
  } catch (error) {
    console.error("IP blocklist fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch IP blocklist" },
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
      ipAddress,
      ipRange,
      type,
      reason,
      orgId,
      expiresAt,
      isActive,
      metadata,
    } = body

    if (!ipAddress || !reason) {
      return NextResponse.json(
        { error: "ipAddress and reason are required" },
        { status: 400 }
      )
    }

    // Validate IP address format (basic validation)
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    if (!ipv4Regex.test(ipAddress) && !ipv6Regex.test(ipAddress)) {
      return NextResponse.json(
        { error: "Invalid IP address format" },
        { status: 400 }
      )
    }

    // Check for duplicate
    const existing = await prisma.iPBlocklist.findFirst({
      where: {
        ipAddress,
        orgId: orgId || null,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "IP address already exists in blocklist for this scope" },
        { status: 409 }
      )
    }

    const blocklistEntry = await prisma.iPBlocklist.create({
      data: {
        ipAddress,
        ipRange,
        type: type || "MANUAL",
        reason,
        orgId: orgId || null,
        blockedBy: session.adminId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive ?? true,
        metadata: metadata || {},
      },
    })

    await logPlatformAudit({
      adminId: session.adminId,
      action: "create_ip_blocklist_entry",
      resourceType: "ip_blocklist",
      resourceId: blocklistEntry.id,
      targetOrgId: orgId,
      details: { ipAddress, type: type || "MANUAL", reason },
    })

    return NextResponse.json({ entry: blocklistEntry }, { status: 201 })
  } catch (error) {
    console.error("IP blocklist creation error:", error)
    return NextResponse.json(
      { error: "Failed to create IP blocklist entry" },
      { status: 500 }
    )
  }
}
