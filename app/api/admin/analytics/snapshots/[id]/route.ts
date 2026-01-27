import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
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
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { id } = await params

    const snapshot = await prisma.analyticsSnapshot.findUnique({
      where: { id },
    })

    if (!snapshot) {
      return NextResponse.json(
        { error: "Analytics snapshot not found" },
        { status: 404 }
      )
    }

    // Get previous snapshot for comparison
    const previousSnapshot = await prisma.analyticsSnapshot.findFirst({
      where: {
        type: snapshot.type,
        period: snapshot.period,
        periodStart: { lt: snapshot.periodStart },
      },
      orderBy: { periodStart: "desc" },
    })

    // Calculate deltas if previous snapshot exists
    let deltas = null
    if (previousSnapshot) {
      deltas = {
        totalOrgs: snapshot.totalOrgs - previousSnapshot.totalOrgs,
        activeOrgs: snapshot.activeOrgs - previousSnapshot.activeOrgs,
        totalUsers: snapshot.totalUsers - previousSnapshot.totalUsers,
        activeUsers: snapshot.activeUsers - previousSnapshot.activeUsers,
        totalAgentRuns: snapshot.totalAgentRuns - previousSnapshot.totalAgentRuns,
        mrr: snapshot.mrr - previousSnapshot.mrr,
        arr: snapshot.arr - previousSnapshot.arr,
        totalOrgsPercent: previousSnapshot.totalOrgs > 0
          ? ((snapshot.totalOrgs - previousSnapshot.totalOrgs) / previousSnapshot.totalOrgs) * 100
          : 0,
        mrrPercent: previousSnapshot.mrr > 0
          ? ((snapshot.mrr - previousSnapshot.mrr) / previousSnapshot.mrr) * 100
          : 0,
      }
    }

    // Get related audit logs
    const auditLogs = await prisma.platformAuditLog.findMany({
      where: {
        resourceType: "analytics_snapshot",
        resourceId: id,
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    })

    // Convert BigInt to string for JSON serialization
    const serializedSnapshot = {
      ...snapshot,
      totalTokens: snapshot.totalTokens.toString(),
      totalApiCalls: snapshot.totalApiCalls.toString(),
      totalStorage: snapshot.totalStorage.toString(),
    }

    const serializedPrevious = previousSnapshot
      ? {
          ...previousSnapshot,
          totalTokens: previousSnapshot.totalTokens.toString(),
          totalApiCalls: previousSnapshot.totalApiCalls.toString(),
          totalStorage: previousSnapshot.totalStorage.toString(),
        }
      : null

    return NextResponse.json({
      snapshot: serializedSnapshot,
      previousSnapshot: serializedPrevious,
      deltas,
      auditLogs,
    })
  } catch (error) {
    console.error("Get analytics snapshot error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics snapshot" },
      { status: 500 }
    )
  }
}
