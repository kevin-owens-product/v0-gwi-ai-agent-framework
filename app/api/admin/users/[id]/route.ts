import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { logAdminActivity, AdminActivityAction, AdminResourceType } from "@/lib/admin-activity"
import { cookies } from "next/headers"

export async function GET(
  _request: NextRequest,
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

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const now = new Date()

    // Run all queries in parallel to avoid N+1 problem
    const [user, activeBan, banHistory, activeSessions, auditLogs] = await Promise.all([
      // Main user query with relations
      prisma.user.findUnique({
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
              expires: true,
              ipAddress: true,
              userAgent: true,
            },
            orderBy: { expires: "desc" },
            take: 5,
          },
        },
      }),
      // Get active ban
      prisma.userBan.findFirst({
        where: {
          userId: id,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } },
          ],
        },
      }),
      // Get ban history
      prisma.userBan.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // Count active sessions
      prisma.session.count({
        where: {
          userId: id,
          expires: { gte: now },
        },
      }),
      // Get audit logs
      prisma.platformAuditLog.findMany({
        where: { targetUserId: id },
        orderBy: { timestamp: "desc" },
        take: 10,
      }),
    ])

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get agent runs count (depends on user.memberships, so runs after)
    const orgIds = user.memberships.map(m => m.organization.id)
    const agentRunsCount = orgIds.length > 0
      ? await prisma.agentRun.count({
          where: {
            orgId: { in: orgIds },
            startedAt: { gte: thirtyDaysAgo },
          },
        })
      : 0

    return NextResponse.json({
      user: {
        ...user,
        isBanned: !!activeBan,
        activeBan,
        banHistory,
        stats: {
          activeSessions,
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

    // Log admin activity
    await logAdminActivity({
      adminId: session.admin.id,
      action: AdminActivityAction.USER_UPDATE,
      resourceType: AdminResourceType.USER,
      resourceId: id,
      description: `Updated user: ${user.name || user.email}`,
      metadata: {
        updatedFields: Object.keys(updateData),
        userEmail: user.email,
      },
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
