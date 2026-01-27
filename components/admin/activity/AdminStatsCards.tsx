/**
 * @prompt-id forge-v4.1:feature:admin-activity:006
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"

interface ActivityStats {
  totalActivities: number
  activitiesByAction: { action: string; count: number }[]
  activitiesByAdmin: {
    adminId: string
    admin?: { id: string; name: string; email: string; role: string }
    count: number
  }[]
  activitiesByResource: { resourceType: string; count: number }[]
  activitiesByStatus: { status: string; count: number }[]
  hourlyDistribution: number[]
  busiestHours: { hour: number; count: number }[]
  dailyActivityData: { date: string; count: number }[]
  avgResponseTime: number
}

interface AdminStatsCardsProps {
  stats: ActivityStats | null
  isLoading?: boolean
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM"
  if (hour === 12) return "12 PM"
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

export function AdminStatsCards({ stats, isLoading = false }: AdminStatsCardsProps) {
  const t = useTranslations("admin.activity.stats")
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center h-[120px]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const successCount =
    stats.activitiesByStatus.find((s) => s.status === "success")?.count || 0
  const failureCount =
    stats.activitiesByStatus.find((s) => s.status === "failure")?.count || 0
  const successRate =
    stats.totalActivities > 0
      ? Math.round((successCount / stats.totalActivities) * 100)
      : 0

  // Get today's activity count
  const today = new Date().toISOString().split("T")[0]
  const todayActivity =
    stats.dailyActivityData.find((d) => d.date === today)?.count || 0

  // Get yesterday's activity count for comparison
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]
  const yesterdayActivity =
    stats.dailyActivityData.find((d) => d.date === yesterday)?.count || 0

  const activityChange =
    yesterdayActivity > 0
      ? Math.round(((todayActivity - yesterdayActivity) / yesterdayActivity) * 100)
      : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("totalActivities")}</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalActivities.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">{t("today")}:</span>
            <span className="text-sm font-medium">{todayActivity}</span>
            {activityChange !== 0 && (
              <span
                className={`text-xs ${
                  activityChange > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {activityChange > 0 ? "+" : ""}
                {activityChange}%
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("successRate")}</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{successRate}%</div>
          <Progress value={successRate} className="mt-2" />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {successCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              {failureCount.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Active Admins */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("activeAdmins")}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.activitiesByAdmin.length}
          </div>
          <div className="mt-2 space-y-1">
            {stats.activitiesByAdmin.slice(0, 3).map((adminActivity) => (
              <div
                key={adminActivity.adminId}
                className="flex items-center justify-between text-xs"
              >
                <span className="truncate max-w-[100px]">
                  {adminActivity.admin?.name || t("unknown")}
                </span>
                <span className="text-muted-foreground">
                  {adminActivity.count} {t("actions")}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Avg Response Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("avgResponseTime")}</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(stats.avgResponseTime)}ms
          </div>
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">{t("busiestHours")}</p>
            <div className="flex gap-2">
              {stats.busiestHours.slice(0, 3).map((hourData, index) => (
                <span
                  key={hourData.hour}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted"
                >
                  {formatHour(hourData.hour)}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface AdminProductivityCardProps {
  stats: ActivityStats | null
  isLoading?: boolean
}

export function AdminProductivityCard({
  stats,
  isLoading = false,
}: AdminProductivityCardProps) {
  const t = useTranslations("admin.activity.stats")
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const maxCount = Math.max(...stats.activitiesByAdmin.map((a) => a.count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t("adminProductivity")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.activitiesByAdmin.slice(0, 5).map((adminActivity) => {
            const percentage = Math.round((adminActivity.count / maxCount) * 100)
            return (
              <div key={adminActivity.adminId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {adminActivity.admin?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {adminActivity.admin?.name || t("unknownAdmin")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {adminActivity.admin?.role.replace("_", " ") || t("unknownRole")}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {adminActivity.count.toLocaleString()} {t("actions")}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}

          {stats.activitiesByAdmin.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              {t("noActivityData")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
