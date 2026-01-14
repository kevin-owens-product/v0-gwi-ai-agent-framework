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
    const period = searchParams.get("period") || undefined
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (type) {
      where.type = type
    }

    if (period) {
      where.period = period
    }

    if (startDate || endDate) {
      where.periodStart = {}
      if (startDate) {
        (where.periodStart as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.periodStart as Record<string, Date>).lte = new Date(endDate)
      }
    }

    const [snapshots, total] = await Promise.all([
      prisma.analyticsSnapshot.findMany({
        where,
        orderBy: { periodStart: "desc" },
        skip,
        take: limit,
      }),
      prisma.analyticsSnapshot.count({ where }),
    ])

    return NextResponse.json({
      snapshots,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get analytics snapshots error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics snapshots" },
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
    const { type, period } = body

    if (!type || !period) {
      return NextResponse.json(
        { error: "Type and period are required" },
        { status: 400 }
      )
    }

    // Calculate period dates
    const periodEnd = new Date()
    let periodStart: Date

    switch (period) {
      case "daily":
        periodStart = new Date(periodEnd)
        periodStart.setDate(periodStart.getDate() - 1)
        break
      case "weekly":
        periodStart = new Date(periodEnd)
        periodStart.setDate(periodStart.getDate() - 7)
        break
      case "monthly":
        periodStart = new Date(periodEnd)
        periodStart.setMonth(periodStart.getMonth() - 1)
        break
      default:
        periodStart = new Date(periodEnd)
        periodStart.setDate(periodStart.getDate() - 30)
    }

    // Gather actual platform metrics
    const [
      totalOrgs,
      activeOrgs,
      newOrgs,
      totalUsers,
      activeUsersCount,
      newUsers,
      totalAgentRuns,
      totalTokens,
      totalApiCalls,
      orgsByPlan,
      orgsByRegion,
      orgsByIndustry,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({
        where: {
          OR: [
            { members: { some: { joinedAt: { gte: periodStart } } } },
            { agents: { some: { runs: { some: { startedAt: { gte: periodStart } } } } } },
          ],
        },
      }),
      prisma.organization.count({
        where: { createdAt: { gte: periodStart } },
      }),
      prisma.user.count(),
      // Count active sessions (with valid expires)
      prisma.session.count({
        where: { expires: { gte: new Date() } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: periodStart } },
      }),
      prisma.agentRun.count({
        where: { startedAt: { gte: periodStart } },
      }),
      prisma.usageRecord.aggregate({
        where: {
          metricType: "TOKENS_CONSUMED",
          recordedAt: { gte: periodStart },
        },
        _sum: { quantity: true },
      }),
      prisma.usageRecord.aggregate({
        where: {
          metricType: "API_CALLS",
          recordedAt: { gte: periodStart },
        },
        _sum: { quantity: true },
      }),
      prisma.organization.groupBy({
        by: ["planTier"],
        _count: true,
      }),
      prisma.organization.groupBy({
        by: ["country"],
        _count: true,
        where: { country: { not: null } },
      }),
      prisma.organization.groupBy({
        by: ["industry"],
        _count: true,
        where: { industry: { not: null } },
      }),
    ])

    // Calculate churn (simplified)
    const churnedOrgs = Math.max(0, Math.floor(totalOrgs * 0.02))

    // Calculate revenue metrics (mock)
    const avgRevenuePerOrg = 5000
    const mrr = totalOrgs * avgRevenuePerOrg
    const arr = mrr * 12
    const newMrr = newOrgs * avgRevenuePerOrg
    const churnedMrr = churnedOrgs * avgRevenuePerOrg
    const expansionMrr = Math.floor(mrr * 0.05)

    // Format breakdown data
    const orgsByPlanMap: Record<string, number> = {}
    orgsByPlan.forEach((item) => {
      orgsByPlanMap[item.planTier] = item._count
    })

    const orgsByRegionMap: Record<string, number> = {}
    orgsByRegion.forEach((item) => {
      if (item.country) {
        orgsByRegionMap[item.country] = item._count
      }
    })

    const orgsByIndustryMap: Record<string, number> = {}
    orgsByIndustry.forEach((item) => {
      if (item.industry) {
        orgsByIndustryMap[item.industry] = item._count
      }
    })

    // Create the snapshot
    const snapshot = await prisma.analyticsSnapshot.create({
      data: {
        type,
        period,
        periodStart,
        periodEnd,
        totalOrgs,
        activeOrgs,
        newOrgs,
        churnedOrgs,
        totalUsers,
        activeUsers: activeUsersCount,
        newUsers,
        totalAgentRuns,
        totalTokens: BigInt(totalTokens._sum.quantity || 0),
        totalApiCalls: BigInt(totalApiCalls._sum.quantity || 0),
        totalStorage: BigInt(0),
        mrr,
        arr,
        newMrr,
        churnedMrr,
        expansionMrr,
        orgsByPlan: orgsByPlanMap,
        orgsByRegion: orgsByRegionMap,
        orgsByIndustry: orgsByIndustryMap,
        metrics: {
          arpu: totalOrgs > 0 ? Math.round(mrr / totalOrgs) : 0,
          ltv: avgRevenuePerOrg * 24,
          churnRate: 2.0,
          netRevenueRetention: 105,
        },
        metadata: {
          triggeredBy: session.admin.id,
          triggeredAt: new Date().toISOString(),
        },
      },
    })

    // Log the action
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_ANALYTICS_SNAPSHOT",
        resourceType: "analytics_snapshot",
        resourceId: snapshot.id,
        details: { type, period },
      },
    })

    // Convert BigInt to string for JSON serialization
    const serializedSnapshot = {
      ...snapshot,
      totalTokens: snapshot.totalTokens.toString(),
      totalApiCalls: snapshot.totalApiCalls.toString(),
      totalStorage: snapshot.totalStorage.toString(),
    }

    return NextResponse.json({ snapshot: serializedSnapshot })
  } catch (error) {
    console.error("Create analytics snapshot error:", error)
    return NextResponse.json(
      { error: "Failed to create analytics snapshot" },
      { status: 500 }
    )
  }
}
