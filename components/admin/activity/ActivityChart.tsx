/**
 * @prompt-id forge-v4.1:feature:admin-activity:007
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, BarChart3, PieChart, TrendingUp } from "lucide-react"

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

interface ActivityChartProps {
  stats: ActivityStats | null
  isLoading?: boolean
}

function formatActionName(action: string): string {
  return action
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatHour(hour: number): string {
  if (hour === 0) return "12a"
  if (hour === 12) return "12p"
  if (hour < 12) return `${hour}a`
  return `${hour - 12}p`
}

// Simple bar chart component
function SimpleBarChart({
  data,
  maxHeight = 120,
}: {
  data: { label: string; value: number }[]
  maxHeight?: number
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="flex items-end gap-1 h-[120px]">
      {data.map((item, index) => {
        const height = (item.value / maxValue) * maxHeight
        return (
          <div
            key={index}
            className="flex flex-col items-center flex-1 min-w-0"
          >
            <div
              className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors cursor-pointer group relative"
              style={{ height: `${height}px` }}
              title={`${item.label}: ${item.value}`}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                {item.value}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Horizontal bar chart for rankings
function HorizontalBarChart({
  data,
}: {
  data: { label: string; value: number; color?: string }[]
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const width = (item.value / maxValue) * 100
        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate max-w-[200px]">{item.label}</span>
              <span className="text-muted-foreground ml-2">{item.value}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Donut-style breakdown
function StatusBreakdown({
  data,
}: {
  data: { status: string; count: number }[]
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  const statusColors: Record<string, string> = {
    success: "bg-green-500",
    failure: "bg-red-500",
    pending: "bg-amber-500",
  }

  return (
    <div className="space-y-4">
      <div className="flex h-4 rounded-full overflow-hidden bg-muted">
        {data.map((item, index) => {
          const width = total > 0 ? (item.count / total) * 100 : 0
          return (
            <div
              key={index}
              className={`${statusColors[item.status] || "bg-secondary"} transition-all`}
              style={{ width: `${width}%` }}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                statusColors[item.status] || "bg-secondary"
              }`}
            />
            <span className="text-sm capitalize">{item.status}</span>
            <span className="text-sm text-muted-foreground">
              ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ActivityChart({ stats, isLoading = false }: ActivityChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  // Prepare daily activity data for chart (last 14 days)
  const recentDays = stats.dailyActivityData.slice(-14)
  const dailyChartData = recentDays.map((d) => ({
    label: formatDate(d.date),
    value: d.count,
  }))

  // Prepare hourly distribution data
  const hourlyChartData = stats.hourlyDistribution.map((count, hour) => ({
    label: formatHour(hour),
    value: count,
  }))

  // Prepare top actions data
  const topActionsData = stats.activitiesByAction.slice(0, 8).map((a) => ({
    label: formatActionName(a.action),
    value: a.count,
  }))

  // Prepare resource distribution data
  const resourceData = stats.activitiesByResource.slice(0, 8).map((r) => ({
    label: r.resourceType.replace(/_/g, " ").charAt(0).toUpperCase() +
      r.resourceType.replace(/_/g, " ").slice(1),
    value: r.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Activity Analytics
        </CardTitle>
        <CardDescription>
          Visual breakdown of admin activity patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Daily Trend</span>
              <span className="sm:hidden">Daily</span>
            </TabsTrigger>
            <TabsTrigger value="hourly" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Hourly</span>
              <span className="sm:hidden">Hours</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Top Actions</span>
              <span className="sm:hidden">Actions</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Status</span>
              <span className="sm:hidden">Status</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-4">
                Daily Activity (Last 14 Days)
              </h4>
              <SimpleBarChart data={dailyChartData} />
            </div>
          </TabsContent>

          <TabsContent value="hourly" className="space-y-4">
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-4">
                Activity by Hour of Day
              </h4>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <SimpleBarChart data={hourlyChartData} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {stats.busiestHours.slice(0, 3).map((hourData, index) => (
                  <Badge key={hourData.hour} variant="secondary">
                    #{index + 1} Busiest: {formatHour(hourData.hour)} ({hourData.count} activities)
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 pt-4">
              <div>
                <h4 className="text-sm font-medium mb-4">Top Actions</h4>
                <HorizontalBarChart data={topActionsData} />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-4">By Resource Type</h4>
                <HorizontalBarChart data={resourceData} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-4">Status Breakdown</h4>
              <StatusBreakdown data={stats.activitiesByStatus} />

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-500">
                        {stats.activitiesByStatus.find((s) => s.status === "success")?.count || 0}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Successful Operations
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-500">
                        {stats.activitiesByStatus.find((s) => s.status === "failure")?.count || 0}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Failed Operations
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-500">
                        {stats.activitiesByStatus.find((s) => s.status === "pending")?.count || 0}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pending Operations
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
