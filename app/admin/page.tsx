import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/db"
import { getTranslations } from "@/lib/i18n/server"
import {
  Building2,
  Users,
  Bot,
  Zap,
  TrendingUp,
  TrendingDown,
  TicketCheck,
  AlertTriangle,
  DollarSign,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

  const [
    totalOrgs,
    orgsLastMonth,
    orgsPreviousMonth,
    totalUsers,
    usersLastMonth,
    usersPreviousMonth,
    totalAgentRuns,
    runsLastMonth,
    runsPreviousMonth,
    totalTokens,
    openTickets,
    urgentTickets,
    suspendedOrgs,
    atRiskTenants,
    orgsByPlan,
    recentOrgs,
    recentTickets,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.organization.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.agentRun.count(),
    prisma.agentRun.count({ where: { startedAt: { gte: thirtyDaysAgo } } }),
    prisma.agentRun.count({ where: { startedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.usageRecord.aggregate({
      where: { metricType: "TOKENS_CONSUMED" },
      _sum: { quantity: true },
    }),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.supportTicket.count({ where: { priority: "URGENT", status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.organizationSuspension.count({ where: { isActive: true } }),
    prisma.tenantHealthScore.count({ where: { riskLevel: { in: ["AT_RISK", "CRITICAL"] } } }),
    prisma.organization.groupBy({ by: ["planTier"], _count: true }),
    prisma.organization.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { members: true } } },
    }),
    prisma.supportTicket.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
  ])

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  return {
    totalOrgs,
    orgGrowth: calculateGrowth(orgsLastMonth, orgsPreviousMonth),
    totalUsers,
    userGrowth: calculateGrowth(usersLastMonth, usersPreviousMonth),
    totalAgentRuns,
    runGrowth: calculateGrowth(runsLastMonth, runsPreviousMonth),
    totalTokens: totalTokens._sum.quantity || 0,
    openTickets,
    urgentTickets,
    suspendedOrgs,
    atRiskTenants,
    orgsByPlan: orgsByPlan.reduce((acc, item) => {
      acc[item.planTier] = item._count
      return acc
    }, {} as Record<string, number>),
    recentOrgs,
    recentTickets,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  const t = await getTranslations("admin.dashboard")

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("totalTenants")}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrgs.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.orgGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={stats.orgGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {stats.orgGrowth}%
              </span>
              <span className="ml-1">{t("vsLastMonth")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("totalUsers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.userGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={stats.userGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {stats.userGrowth}%
              </span>
              <span className="ml-1">{t("vsLastMonth")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("agentRuns")}</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgentRuns.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.runGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={stats.runGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {stats.runGrowth}%
              </span>
              <span className="ml-1">{t("vsLastMonth")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("tokensUsed")}</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalTokens / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">{t("totalPlatformConsumption")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={stats.urgentTickets > 0 ? "border-red-500/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("urgentTickets")}</CardTitle>
            <TicketCheck className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.urgentTickets}</div>
            <p className="text-xs text-muted-foreground">{t("totalOpen", { count: stats.openTickets })}</p>
          </CardContent>
        </Card>

        <Card className={stats.atRiskTenants > 0 ? "border-amber-500/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("atRiskTenants")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.atRiskTenants}</div>
            <p className="text-xs text-muted-foreground">{t("requireAttention")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("suspended")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspendedOrgs}</div>
            <p className="text-xs text-muted-foreground">{t("organizations")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("enterprise")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orgsByPlan.ENTERPRISE || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("pro", { count: stats.orgsByPlan.PROFESSIONAL || 0 })}, {t("starter", { count: stats.orgsByPlan.STARTER || 0 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("recentSignups")}</CardTitle>
                <CardDescription>{t("newOrgsLastDays")}</CardDescription>
              </div>
              <Link href="/admin/tenants">
                <Button variant="outline" size="sm">{t("viewAll")}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrgs.map((org) => (
                <div key={org.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("members", { count: org._count.members })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-secondary">
                      {org.planTier}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {stats.recentOrgs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("noRecentSignups")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("openSupportTickets")}</CardTitle>
                <CardDescription>{t("ticketsRequiringAttention")}</CardDescription>
              </div>
              <Link href="/admin/support">
                <Button variant="outline" size="sm">{t("viewAll")}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                      ticket.priority === "URGENT" ? "bg-red-500/10" :
                      ticket.priority === "HIGH" ? "bg-amber-500/10" : "bg-secondary"
                    }`}>
                      <TicketCheck className={`h-4 w-4 ${
                        ticket.priority === "URGENT" ? "text-red-500" :
                        ticket.priority === "HIGH" ? "text-amber-500" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">{ticket.ticketNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      ticket.priority === "URGENT" ? "bg-red-500/10 text-red-500" :
                      ticket.priority === "HIGH" ? "bg-amber-500/10 text-amber-500" :
                      "bg-secondary"
                    }`}>
                      {ticket.priority}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ticket.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
              ))}
              {stats.recentTickets.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("noOpenTickets")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
