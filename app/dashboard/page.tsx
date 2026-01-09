import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { HeroMetrics } from "@/components/dashboard/hero-metrics"
import { LiveActivityFeed } from "@/components/dashboard/live-activity-feed"
import { AgentOrchestrator } from "@/components/dashboard/agent-orchestrator"
import { InsightsPanel } from "@/components/dashboard/insights-panel"
import { PerformanceCharts } from "@/components/dashboard/performance-charts"

async function getDashboardData(orgId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const [
    agentCount,
    activeAgentCount,
    weeklyInsights,
    monthlyRuns,
    recentRuns,
    recentAuditLogs,
    completedRunsCount,
    totalRunsCount,
  ] = await Promise.all([
    // Total agents
    prisma.agent.count({ where: { orgId } }),

    // Active agents
    prisma.agent.count({ where: { orgId, status: "ACTIVE" } }),

    // Insights this week
    prisma.insight.count({
      where: {
        orgId,
        createdAt: { gte: startOfWeek },
      },
    }),

    // Agent runs this month
    prisma.agentRun.count({
      where: {
        orgId,
        startedAt: { gte: startOfMonth },
      },
    }),

    // Recent agent runs with details
    prisma.agentRun.findMany({
      where: { orgId },
      include: {
        agent: { select: { id: true, name: true, type: true } },
        insights: { select: { id: true } },
      },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),

    // Recent audit logs
    prisma.auditLog.findMany({
      where: { orgId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { timestamp: "desc" },
      take: 5,
    }),

    // Completed runs for success rate
    prisma.agentRun.count({
      where: { orgId, status: "COMPLETED" },
    }),

    // Total runs for success rate
    prisma.agentRun.count({
      where: { orgId },
    }),
  ])

  const successRate = totalRunsCount > 0 ? Math.round((completedRunsCount / totalRunsCount) * 100) : 0

  // Get average response time from completed runs
  const completedRunsWithTime = await prisma.agentRun.findMany({
    where: { orgId, status: "COMPLETED", completedAt: { not: null } },
    select: { startedAt: true, completedAt: true },
    take: 100,
    orderBy: { completedAt: "desc" },
  })

  let avgResponseTime = 0
  if (completedRunsWithTime.length > 0) {
    const totalTime = completedRunsWithTime.reduce((acc, run) => {
      if (run.completedAt) {
        return acc + (run.completedAt.getTime() - run.startedAt.getTime())
      }
      return acc
    }, 0)
    avgResponseTime = Math.round(totalTime / completedRunsWithTime.length / 1000 * 10) / 10
  }

  return {
    metrics: {
      totalAgents: agentCount,
      activeAgents: activeAgentCount,
      weeklyInsights,
      monthlyRuns,
      successRate,
      avgResponseTime,
    },
    recentRuns,
    recentActivity: recentAuditLogs,
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Get current organization ID
  const cookieStore = await cookies()
  const memberships = await prisma.organizationMember.findMany({
    where: { userId: session.user.id },
    include: { organization: true },
    orderBy: { joinedAt: "asc" },
  })

  if (memberships.length === 0) return null

  const currentOrgId = cookieStore.get("currentOrgId")?.value || memberships[0].organization.id
  const dashboardData = await getDashboardData(currentOrgId)

  const formattedActivities = dashboardData.recentRuns.map(run => ({
    id: run.id,
    type: run.status === "COMPLETED" ? "completed" as const :
          run.status === "RUNNING" ? "running" as const :
          run.status === "FAILED" ? "warning" as const : "scheduled" as const,
    title: `${run.agent.name} Run`,
    agent: run.agent.name,
    time: formatRelativeTime(run.startedAt),
    insights: run.insights.length,
    href: `/dashboard/agents/${run.agent.id}`,
    progress: run.status === "RUNNING" ? 50 : undefined,
    message: run.status === "FAILED" ? "Run failed" : undefined,
  }))

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <HeroMetrics metrics={dashboardData.metrics} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <PerformanceCharts orgId={currentOrgId} />
          <LiveActivityFeed activities={formattedActivities} />
        </div>
        <div className="space-y-6">
          <AgentOrchestrator orgId={currentOrgId} />
          <InsightsPanel orgId={currentOrgId} />
        </div>
      </div>
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
}
