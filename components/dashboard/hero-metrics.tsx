"use client"

import { Card } from "@/components/ui/card"
import { Bot, Zap, TrendingUp, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

const metrics = [
  {
    label: "Active Agents",
    value: "12",
    change: "+2",
    trend: "up",
    description: "Running now",
    icon: Bot,
    color: "emerald",
    sparkData: [{ v: 8 }, { v: 9 }, { v: 8 }, { v: 10 }, { v: 9 }, { v: 11 }, { v: 10 }, { v: 12 }],
  },
  {
    label: "Insights Generated",
    value: "3,241",
    change: "+18%",
    trend: "up",
    description: "This week",
    icon: Zap,
    color: "blue",
    sparkData: [{ v: 2100 }, { v: 2400 }, { v: 2200 }, { v: 2800 }, { v: 2600 }, { v: 3000 }, { v: 2900 }, { v: 3241 }],
  },
  {
    label: "Accuracy Rate",
    value: "94.2%",
    change: "+2.1%",
    trend: "up",
    description: "Verified insights",
    icon: TrendingUp,
    color: "violet",
    sparkData: [{ v: 89 }, { v: 90 }, { v: 91 }, { v: 90 }, { v: 92 }, { v: 93 }, { v: 93 }, { v: 94.2 }],
  },
  {
    label: "Avg. Response",
    value: "1.2s",
    change: "-0.3s",
    trend: "up",
    description: "Per query",
    icon: Clock,
    color: "amber",
    sparkData: [{ v: 1.8 }, { v: 1.7 }, { v: 1.6 }, { v: 1.5 }, { v: 1.4 }, { v: 1.3 }, { v: 1.3 }, { v: 1.2 }],
  },
]

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

export function HeroMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
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
