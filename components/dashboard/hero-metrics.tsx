"use client"

import { Card } from "@/components/ui/card"
import { Bot, Zap, TrendingUp, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

interface MetricsData {
  totalAgents: number
  activeAgents: number
  weeklyInsights: number
  monthlyRuns: number
  successRate: number
  avgResponseTime: number
}

interface HeroMetricsProps {
  metrics?: MetricsData
}

function generateSparkData(finalValue: number, count: number = 8): { v: number }[] {
  const data: { v: number }[] = []
  if (finalValue === 0) {
    return Array(count).fill({ v: 0 })
  }
  const variation = finalValue * 0.2
  for (let i = 0; i < count - 1; i++) {
    const progress = i / (count - 1)
    const randomVariation = (Math.random() - 0.5) * variation * 0.5
    data.push({ v: Math.max(0, finalValue * (0.7 + progress * 0.3) + randomVariation) })
  }
  data.push({ v: finalValue })
  return data
}

const colorMap = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    stroke: "#10b981",
    fill: "rgba(16, 185, 129, 0.1)",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    stroke: "#3b82f6",
    fill: "rgba(59, 130, 246, 0.1)",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    stroke: "#8b5cf6",
    fill: "rgba(139, 92, 246, 0.1)",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    stroke: "#f59e0b",
    fill: "rgba(245, 158, 11, 0.1)",
  },
}

const defaultMetrics: MetricsData = {
  totalAgents: 0,
  activeAgents: 0,
  weeklyInsights: 0,
  monthlyRuns: 0,
  successRate: 0,
  avgResponseTime: 0,
}

export function HeroMetrics({ metrics = defaultMetrics }: HeroMetricsProps) {
  const metricsConfig = [
    {
      label: "Active Agents",
      value: metrics.activeAgents.toString(),
      change: `${metrics.totalAgents} total`,
      trend: "up" as const,
      description: "Running now",
      icon: Bot,
      color: "emerald",
      sparkData: generateSparkData(metrics.activeAgents),
    },
    {
      label: "Insights Generated",
      value: metrics.weeklyInsights.toLocaleString(),
      change: `${metrics.monthlyRuns} runs`,
      trend: "up" as const,
      description: "This week",
      icon: Zap,
      color: "blue",
      sparkData: generateSparkData(metrics.weeklyInsights),
    },
    {
      label: "Success Rate",
      value: `${metrics.successRate}%`,
      change: metrics.successRate >= 90 ? "Excellent" : metrics.successRate >= 70 ? "Good" : metrics.successRate > 0 ? "Needs attention" : "No data",
      trend: metrics.successRate >= 70 ? "up" as const : "down" as const,
      description: "Completed runs",
      icon: TrendingUp,
      color: "violet",
      sparkData: generateSparkData(metrics.successRate),
    },
    {
      label: "Avg. Response",
      value: metrics.avgResponseTime > 0 ? `${metrics.avgResponseTime}s` : "N/A",
      change: metrics.avgResponseTime === 0 ? "No data" : metrics.avgResponseTime < 2 ? "Fast" : metrics.avgResponseTime < 5 ? "Normal" : "Slow",
      trend: metrics.avgResponseTime < 3 || metrics.avgResponseTime === 0 ? "up" as const : "down" as const,
      description: "Per run",
      icon: Clock,
      color: "amber",
      sparkData: generateSparkData(metrics.avgResponseTime || 1),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricsConfig.map((metric) => {
        const colors = colorMap[metric.color as keyof typeof colorMap]
        return (
          <Card
            key={metric.label}
            className="relative overflow-hidden bg-card/50 border-border/50 p-5 hover:bg-card/80 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <metric.icon className={`h-4 w-4 ${colors.text}`} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${metric.trend === "up" ? "text-emerald-400" : "text-red-400"}`}
              >
                {metric.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {metric.change}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-semibold tracking-tight text-foreground">{metric.value}</p>
              <p className="text-xs text-muted-foreground">
                {metric.label} · {metric.description}
              </p>
            </div>

            {/* Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-12 opacity-50 group-hover:opacity-70 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metric.sparkData}>
                  <defs>
                    <linearGradient id={`gradient-${metric.color}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={colors.stroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={colors.stroke}
                    strokeWidth={1.5}
                    fill={`url(#gradient-${metric.color})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
