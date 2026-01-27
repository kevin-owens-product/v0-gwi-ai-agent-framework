/**
 * @prompt-id forge-v4.1:feature:customer-health-scoring:003
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"
import { calculateHealthScore, getHealthScoreHistory } from "@/lib/health-score"
import { cookies } from "next/headers"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
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

    const { orgId } = await params

    // Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        slug: true,
        planTier: true,
        createdAt: true,
        _count: {
          select: {
            members: true,
            agents: true,
            workflows: true,
          },
        },
        subscription: {
          select: {
            status: true,
            currentPeriodEnd: true,
          },
        },
      },
    })

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Get latest health score
    const latestScore = await prisma.customerHealthScore.findFirst({
      where: { orgId },
      orderBy: { calculatedAt: "desc" },
    })

    // Get health score history (last 30 days)
    const history = await getHealthScoreHistory(orgId, 30)

    // Get additional org metrics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [agentRuns, supportTickets, lastActivity] = await Promise.all([
      prisma.agentRun.count({
        where: { orgId, startedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.supportTicket.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          ticketNumber: true,
          subject: true,
          status: true,
          priority: true,
          createdAt: true,
        },
      }),
      prisma.agentRun.findFirst({
        where: { orgId },
        orderBy: { startedAt: "desc" },
        select: { startedAt: true },
      }),
    ])

    return NextResponse.json({
      organization: org,
      healthScore: latestScore,
      history: history.reverse(), // Oldest first for charting
      metrics: {
        agentRunsLast30Days: agentRuns,
        lastActivityAt: lastActivity?.startedAt || null,
      },
      recentTickets: supportTickets,
    })
  } catch (error) {
    console.error("Get org health score error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
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

    const { orgId } = await params

    // Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true },
    })

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Calculate new health score
    const healthScore = await calculateHealthScore(orgId)

    // Log the action
    await logPlatformAudit({
      adminId: session.admin.id,
      action: "recalculate_health_score",
      resourceType: "organization",
      resourceId: orgId,
      targetOrgId: orgId,
      details: {
        overallScore: healthScore.overallScore,
        churnRisk: healthScore.churnRisk,
      },
    })

    return NextResponse.json({
      success: true,
      healthScore,
    })
  } catch (error) {
    console.error("Recalculate health score error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
