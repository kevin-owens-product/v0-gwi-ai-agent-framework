import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                planTier: true,
              },
            },
          },
        },
        _count: {
          select: {
            sessions: true,
          },
        },
        sessions: {
          select: {
            id: true,
            createdAt: true,
            expires: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get ban status
    const activeBan = await prisma.userBan.findFirst({
      where: {
        userId: id,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        bannedByAdmin: {
          select: { name: true, email: true },
        },
      },
    })

    // Get ban history
    const banHistory = await prisma.userBan.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        bannedByAdmin: {
          select: { name: true, email: true },
        },
      },
    })

    // Get recent activity
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentSessions = await prisma.session.count({
      where: {
        userId: id,
        createdAt: { gte: thirtyDaysAgo },
      },
    })

    // Get user's agent runs count across all orgs
    const orgIds = user.memberships.map(m => m.organization.id)
    const agentRunsCount = await prisma.agentRun.count({
      where: {
        orgId: { in: orgIds },
        startedAt: { gte: thirtyDaysAgo },
      },
    })

    // Get audit log entries for this user
    const auditLogs = await prisma.platformAuditLog.findMany({
      where: { targetUserId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return NextResponse.json({
      user: {
        ...user,
        isBanned: !!activeBan,
        activeBan,
        banHistory,
        stats: {
          recentSessions,
          agentRunsLast30Days: agentRunsCount,
        },
        auditLogs,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { name, email } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (email) updateData.email = email

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
