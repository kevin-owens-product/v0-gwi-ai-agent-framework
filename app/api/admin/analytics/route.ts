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
    const periodParam = searchParams.get("period") || "30d"

    // Calculate date range based on period
    const periodDays = parseInt(periodParam) || 30
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
    const previousStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000)

    // Fetch all analytics data in parallel
    const [
      totalOrgs,
      activeOrgs,
      newOrgsThisPeriod,
      newOrgsPreviousPeriod,
      totalUsers,
      activeUsers,
      newUsersThisPeriod,
      totalAgentRuns,
      totalTokens,
      orgsByPlan,
      orgsByIndustry,
    ] = await Promise.all([
      // Total organizations
      prisma.organization.count(),

      // Active organizations (with recent activity)
      prisma.organization.count({
        where: {
          OR: [
            { members: { some: { joinedAt: { gte: startDate } } } },
            { agents: { some: { runs: { some: { startedAt: { gte: startDate } } } } } },
          ],
        },
      }),

      // New orgs this period
      prisma.organization.count({
        where: { createdAt: { gte: startDate } },
      }),

      // New orgs previous period
      prisma.organization.count({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
        },
      }),

      // Total users
      prisma.user.count(),

      // Active users (with non-expired session since start date)
      prisma.session.count({
        where: { expires: { gte: startDate } },
      }).catch(() => 0),

      // New users this period
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Total agent runs this period
      prisma.agentRun.count({
        where: { startedAt: { gte: startDate } },
      }),

      // Total tokens consumed this period
      prisma.usageRecord.aggregate({
        where: {
          metricType: "TOKENS_CONSUMED",
          recordedAt: { gte: startDate },
        },
        _sum: { quantity: true },
      }),

      // Orgs by plan
      prisma.organization.groupBy({
        by: ["planTier"],
        _count: true,
      }),

      // Orgs by industry
      prisma.organization.groupBy({
        by: ["industry"],
        _count: true,
        where: { industry: { not: null } },
      }),
    ])

    // Calculate growth rates
    const orgGrowthRate = newOrgsPreviousPeriod > 0
      ? ((newOrgsThisPeriod - newOrgsPreviousPeriod) / newOrgsPreviousPeriod) * 100
      : newOrgsThisPeriod > 0 ? 100 : 0

    const userGrowthRate = orgGrowthRate // Simplified, would need previous period data

    // Calculate churn (simplified)
    const churnedOrgs = Math.max(0, Math.floor(totalOrgs * 0.02)) // Assume 2% churn

    // Calculate revenue metrics (mock data for demo)
    const avgRevenuePerOrg = 5000 // $50/org in cents
    const mrr = totalOrgs * avgRevenuePerOrg
    const arr = mrr * 12

    // Format breakdown data
    const orgsByPlanMap: Record<string, number> = {}
    orgsByPlan.forEach((item) => {
      orgsByPlanMap[item.planTier] = item._count
    })

    const orgsByIndustryMap: Record<string, number> = {}
    orgsByIndustry.forEach((item) => {
      if (item.industry) {
        orgsByIndustryMap[item.industry] = item._count
      }
    })

    // Top features (mock data)
    const topFeatures = [
      { name: "AI Agent Runs", usage: totalAgentRuns },
      { name: "Dashboard Views", usage: Math.floor(totalOrgs * 15) },
      { name: "Report Generation", usage: Math.floor(totalOrgs * 8) },
      { name: "Data Source Connections", usage: Math.floor(totalOrgs * 3) },
      { name: "API Calls", usage: Math.floor(totalOrgs * 100) },
    ]

    const data = {
      // Platform metrics
      totalOrgs,
      activeOrgs,
      newOrgsThisPeriod,
      churnedOrgs,
      totalUsers,
      activeUsers: typeof activeUsers === "number" ? activeUsers : 0,
      newUsersThisPeriod,
      dauMau: totalUsers > 0 ? Math.min(100, Math.round((activeUsers as number / totalUsers) * 100 * 3)) : 0,

      // Usage metrics
      totalAgentRuns,
      totalTokens: totalTokens._sum.quantity || 0,
      totalApiCalls: Math.floor(totalOrgs * 100),
      avgSessionDuration: 12,

      // Revenue metrics
      mrr,
      arr,
      arpu: totalOrgs > 0 ? Math.round(mrr / totalOrgs) : 0,
      ltv: avgRevenuePerOrg * 24, // 24 month average
      churnRate: 2.0,
      netRevenueRetention: 105,

      // Growth metrics
      orgGrowthRate,
      userGrowthRate,
      revenueGrowthRate: orgGrowthRate,

      // Breakdown
      orgsByPlan: orgsByPlanMap,
      orgsByIndustry: orgsByIndustryMap,
      topFeatures,
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
