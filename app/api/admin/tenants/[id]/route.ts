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

    const tenant = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: true,
            agents: true,
            workflows: true,
            invitations: true,
          },
        },
        subscription: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { joinedAt: "asc" },
          take: 10,
        },
        agents: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        workflows: {
          select: {
            id: true,
            name: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    })

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    // Get suspension status
    const suspension = await prisma.organizationSuspension.findFirst({
      where: { orgId: id, isActive: true },
      include: {
        suspendedByAdmin: {
          select: { name: true, email: true },
        },
      },
    })

    // Get recent usage stats
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const [agentRunsCount, totalTokens, recentHealthScore] = await Promise.all([
      prisma.agentRun.count({
        where: { orgId: id, startedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.usageRecord.aggregate({
        where: { orgId: id, metricType: "TOKENS_CONSUMED" },
        _sum: { quantity: true },
      }),
      prisma.tenantHealthScore.findFirst({
        where: { orgId: id },
        orderBy: { calculatedAt: "desc" },
      }),
    ])

    // Get suspension history
    const suspensionHistory = await prisma.organizationSuspension.findMany({
      where: { orgId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        suspendedByAdmin: {
          select: { name: true, email: true },
        },
      },
    })

    return NextResponse.json({
      tenant: {
        ...tenant,
        isSuspended: !!suspension,
        suspension,
        suspensionHistory,
        stats: {
          agentRunsLast30Days: agentRunsCount,
          totalTokensUsed: totalTokens._sum.quantity || 0,
        },
        healthScore: recentHealthScore,
      },
    })
  } catch (error) {
    console.error("Get tenant error:", error)
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
    const { name, planTier, settings } = body

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (planTier) updateData.planTier = planTier
    if (settings) updateData.settings = settings

    const tenant = await prisma.organization.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ tenant })
  } catch (error) {
    console.error("Update tenant error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
