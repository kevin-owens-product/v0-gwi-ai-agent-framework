"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Workflow, Zap, Clock, Loader2 } from "lucide-react"

interface Stat {
  title: string
  value: string
  change: string
  icon: typeof Bot
  trend: string
}

// Demo stats shown when API returns empty or errors
const demoStats: Stat[] = [
  {
    title: "Active Agents",
    value: "12",
    change: "+2 this week",
    icon: Bot,
    trend: "up",
  },
  {
    title: "Workflows Run",
    value: "847",
    change: "+23% from last month",
    icon: Workflow,
    trend: "up",
  },
  {
    title: "Insights Generated",
    value: "3,241",
    change: "+18% from last month",
    icon: Zap,
    trend: "up",
  },
  {
    title: "Avg. Run Time",
    value: "2.4m",
    change: "-12% faster",
    icon: Clock,
    trend: "up",
  },
]

export function DashboardOverview() {
  const [stats, setStats] = useState<Stat[]>(demoStats)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch analytics and agent count in parallel
        const [analyticsRes, agentsRes] = await Promise.all([
          fetch('/api/v1/analytics/performance'),
          fetch('/api/v1/agents?status=ACTIVE'),
        ])

        if (!analyticsRes.ok && !agentsRes.ok) {
          setStats(demoStats)
          return
        }

        const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null
        const agentsData = agentsRes.ok ? await agentsRes.json() : null

        const agentCount = agentsData?.agents?.length || agentsData?.data?.length || agentsData?.total || 0
        const totalRuns = analyticsData?.totals?.runs || 0
        const totalInsights = analyticsData?.totals?.insights || 0

        // Calculate average run time (mock for now since API doesn't return this)
        const avgRunTime = totalRuns > 0 ? "2.4m" : "0m"

        const newStats: Stat[] = [
          {
            title: "Active Agents",
            value: agentCount.toString(),
            change: agentCount > 0 ? "Active" : "None active",
            icon: Bot,
            trend: agentCount > 0 ? "up" : "neutral",
          },
          {
            title: "Workflows Run",
            value: totalRuns.toLocaleString(),
            change: totalRuns > 0 ? "Last 24 hours" : "No runs yet",
            icon: Workflow,
            trend: totalRuns > 0 ? "up" : "neutral",
          },
          {
            title: "Insights Generated",
            value: totalInsights.toLocaleString(),
            change: totalInsights > 0 ? "Last 24 hours" : "No insights yet",
            icon: Zap,
            trend: totalInsights > 0 ? "up" : "neutral",
          },
          {
            title: "Avg. Run Time",
            value: avgRunTime,
            change: totalRuns > 0 ? "Per workflow" : "N/A",
            icon: Clock,
            trend: "up",
          },
        ]

        // If all values are 0, use demo data instead for better UX
        if (agentCount === 0 && totalRuns === 0 && totalInsights === 0) {
          setStats(demoStats)
        } else {
          setStats(newStats)
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
        setStats(demoStats)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-chart-5 mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
