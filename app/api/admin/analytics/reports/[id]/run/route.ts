import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { Prisma } from "@prisma/client"

export async function POST(
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
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { id } = await params

    const report = await prisma.customReport.findUnique({
      where: { id },
    })

    if (!report) {
      return NextResponse.json(
        { error: "Custom report not found" },
        { status: 404 }
      )
    }

    if (!report.isActive) {
      return NextResponse.json(
        { error: "Report is inactive and cannot be run" },
        { status: 400 }
      )
    }

    // Log that report run started
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "RUN_CUSTOM_REPORT",
        resourceType: "custom_report",
        resourceId: id,
        details: {
          reportName: report.name,
          reportType: report.type,
          triggeredAt: new Date().toISOString(),
        },
      },
    })

    // Execute the report based on type
    let result: Record<string, unknown> = {}

    try {
      switch (report.type) {
        case "USAGE":
          result = await generateUsageReport(report.query as Record<string, unknown>)
          break
        case "REVENUE":
          result = await generateRevenueReport(report.query as Record<string, unknown>)
          break
        case "SECURITY":
          result = await generateSecurityReport(report.query as Record<string, unknown>)
          break
        case "COMPLIANCE":
          result = await generateComplianceReport(report.query as Record<string, unknown>)
          break
        case "USER_ACTIVITY":
          result = await generateUserActivityReport(report.query as Record<string, unknown>)
          break
        case "CUSTOM_SQL":
          // Custom SQL reports would need safe execution environment
          result = { message: "Custom SQL reports require manual execution" }
          break
        default:
          result = { message: "Unknown report type" }
      }

      // Update the report with last run info
      await prisma.customReport.update({
        where: { id },
        data: {
          lastRunAt: new Date(),
          lastResult: result as Prisma.InputJsonValue,
          // Calculate next run time if scheduled
          nextRunAt: report.schedule ? calculateNextRun(report.schedule) : null,
        },
      })

      // Log successful completion
      await prisma.platformAuditLog.create({
        data: {
          adminId: session.admin.id,
          action: "CUSTOM_REPORT_COMPLETED",
          resourceType: "custom_report",
          resourceId: id,
          details: {
            reportName: report.name,
            completedAt: new Date().toISOString(),
            resultSummary: {
              recordCount: result.recordCount || 0,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        result,
        runAt: new Date().toISOString(),
      })
    } catch (runError) {
      // Log failed execution
      await prisma.platformAuditLog.create({
        data: {
          adminId: session.admin.id,
          action: "CUSTOM_REPORT_FAILED",
          resourceType: "custom_report",
          resourceId: id,
          details: {
            reportName: report.name,
            error: runError instanceof Error ? runError.message : "Unknown error",
            failedAt: new Date().toISOString(),
          },
        },
      })

      throw runError
    }
  } catch (error) {
    console.error("Run custom report error:", error)
    return NextResponse.json(
      { error: "Failed to run custom report" },
      { status: 500 }
    )
  }
}

// Helper function to calculate next run time
function calculateNextRun(schedule: string): Date {
  const now = new Date()
  const nextRun = new Date(now)

  switch (schedule) {
    case "daily":
      nextRun.setDate(nextRun.getDate() + 1)
      nextRun.setHours(0, 0, 0, 0)
      break
    case "weekly":
      nextRun.setDate(nextRun.getDate() + (7 - nextRun.getDay()))
      nextRun.setHours(0, 0, 0, 0)
      break
    case "monthly":
      nextRun.setMonth(nextRun.getMonth() + 1)
      nextRun.setDate(1)
      nextRun.setHours(0, 0, 0, 0)
      break
    default:
      // For cron expressions or other formats, default to next day
      nextRun.setDate(nextRun.getDate() + 1)
      nextRun.setHours(0, 0, 0, 0)
  }

  return nextRun
}

// Report generation functions
async function generateUsageReport(query: Record<string, unknown>) {
  const days = (query.days as number) || 30
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [agentRuns, tokenUsage, apiCalls, activeOrgs, activeUsers] = await Promise.all([
    prisma.agentRun.count({
      where: { startedAt: { gte: startDate } },
    }),
    prisma.usageRecord.aggregate({
      where: {
        metricType: "TOKENS_CONSUMED",
        recordedAt: { gte: startDate },
      },
      _sum: { quantity: true },
    }),
    prisma.usageRecord.aggregate({
      where: {
        metricType: "API_CALLS",
        recordedAt: { gte: startDate },
      },
      _sum: { quantity: true },
    }),
    prisma.organization.count({
      where: {
        agents: { some: { runs: { some: { startedAt: { gte: startDate } } } } },
      },
    }),
    // Count sessions with valid expires (active sessions)
    prisma.session.count({
      where: { expires: { gte: new Date() } },
    }),
  ])

  return {
    period: `${days} days`,
    generatedAt: new Date().toISOString(),
    metrics: {
      agentRuns,
      tokenUsage: tokenUsage._sum.quantity || 0,
      apiCalls: apiCalls._sum.quantity || 0,
      activeOrgs,
      activeSessions: activeUsers,
    },
    recordCount: 5,
  }
}

async function generateRevenueReport(query: Record<string, unknown>) {
  const days = (query.days as number) || 30
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [totalOrgs, orgsByPlan, newOrgs] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.groupBy({
      by: ["planTier"],
      _count: true,
    }),
    prisma.organization.count({
      where: { createdAt: { gte: startDate } },
    }),
  ])

  // Calculate revenue estimates
  const planPricing: Record<string, number> = {
    STARTER: 0,
    PROFESSIONAL: 9900,
    ENTERPRISE: 49900,
  }

  const revenueByPlan: Record<string, number> = {}
  let totalMrr = 0

  for (const item of orgsByPlan) {
    const price = planPricing[item.planTier] || 0
    const revenue = item._count * price
    revenueByPlan[item.planTier] = revenue
    totalMrr += revenue
  }

  return {
    period: `${days} days`,
    generatedAt: new Date().toISOString(),
    metrics: {
      totalOrgs,
      newOrgs,
      mrr: totalMrr,
      arr: totalMrr * 12,
      revenueByPlan,
      arpu: totalOrgs > 0 ? Math.round(totalMrr / totalOrgs) : 0,
    },
    recordCount: Object.keys(revenueByPlan).length,
  }
}

async function generateSecurityReport(query: Record<string, unknown>) {
  const days = (query.days as number) || 30
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [violations, threats, blockedIps, suspensions] = await Promise.all([
    prisma.securityViolation.count({
      where: { createdAt: { gte: startDate } },
    }),
    prisma.threatEvent.count({
      where: { createdAt: { gte: startDate } },
    }),
    prisma.iPBlocklist.count({
      where: { createdAt: { gte: startDate } },
    }),
    prisma.organizationSuspension.count({
      where: { createdAt: { gte: startDate } },
    }),
  ])

  const violationsByType = await prisma.securityViolation.groupBy({
    by: ["violationType"],
    _count: true,
    where: { createdAt: { gte: startDate } },
  })

  return {
    period: `${days} days`,
    generatedAt: new Date().toISOString(),
    metrics: {
      totalViolations: violations,
      totalThreats: threats,
      blockedIps,
      suspensions,
      violationsByType: Object.fromEntries(
        violationsByType.map((v) => [v.violationType, v._count])
      ),
    },
    recordCount: violationsByType.length,
  }
}

async function generateComplianceReport(query: Record<string, unknown>) {
  const [frameworks, attestations, audits, legalHolds] = await Promise.all([
    prisma.complianceFramework.count({ where: { isActive: true } }),
    prisma.complianceAttestation.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.complianceAudit.count({
      where: {
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
    }),
    prisma.legalHold.count({ where: { status: "ACTIVE" } }),
  ])

  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      activeFrameworks: frameworks,
      attestationsByStatus: Object.fromEntries(
        attestations.map((a) => [a.status, a._count])
      ),
      pendingAudits: audits,
      activeLegalHolds: legalHolds,
    },
    recordCount: attestations.length,
  }
}

async function generateUserActivityReport(query: Record<string, unknown>) {
  const days = (query.days as number) || 30
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [totalUsers, newUsers, activeSessions, auditActions] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: startDate } },
    }),
    // Count sessions with valid expires (active sessions)
    prisma.session.count({
      where: { expires: { gte: new Date() } },
    }),
    prisma.auditLog.groupBy({
      by: ["action"],
      _count: true,
      where: { timestamp: { gte: startDate } },
      orderBy: { _count: { action: "desc" } },
      take: 10,
    }),
  ])

  return {
    period: `${days} days`,
    generatedAt: new Date().toISOString(),
    metrics: {
      totalUsers,
      newUsers,
      activeSessions,
      topActions: Object.fromEntries(
        auditActions.map((a) => [a.action, a._count])
      ),
    },
    recordCount: auditActions.length,
  }
}
