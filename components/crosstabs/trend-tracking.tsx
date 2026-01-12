"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

interface TrendDataPoint {
  period: string
  [key: string]: string | number
}

interface TrendAlert {
  id: string
  metric: string
  audience: string
  type: "increase" | "decrease" | "anomaly"
  change: number
  period: string
  message: string
}

interface TrendTrackingProps {
  audiences: string[]
  metrics: string[]
  className?: string
}

// Generate mock trend data
function generateTrendData(audiences: string[], _metrics: string[]): TrendDataPoint[] {
  const periods = ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024", "Q1 2025"]
  const data: TrendDataPoint[] = []

  for (const period of periods) {
    const point: TrendDataPoint = { period }
    for (const audience of audiences) {
      // Generate base value with trend
      const baseValue = 40 + Math.random() * 30
      const periodIndex = periods.indexOf(period)
      const trend = (periodIndex * 3) + (Math.random() - 0.5) * 10
      point[audience] = Math.round(Math.max(5, Math.min(95, baseValue + trend)))
    }
    data.push(point)
  }

  return data
}

// Generate alerts from trend data
function generateAlerts(
  data: TrendDataPoint[],
  audiences: string[],
  selectedMetric: string
): TrendAlert[] {
  const alerts: TrendAlert[] = []

  if (data.length < 2) return alerts

  const latest = data[data.length - 1]
  const previous = data[data.length - 2]

  for (const audience of audiences) {
    const latestVal = latest[audience] as number
    const prevVal = previous[audience] as number
    const change = latestVal - prevVal

    if (Math.abs(change) >= 10) {
      alerts.push({
        id: `${audience}-${selectedMetric}`,
        metric: selectedMetric,
        audience,
        type: change > 0 ? "increase" : "decrease",
        change: Math.round(change),
        period: latest.period,
        message: `${audience} ${change > 0 ? "increased" : "decreased"} by ${Math.abs(Math.round(change))} points`,
      })
    }
  }

  return alerts.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
}

const colors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#0088FE",
]

export function TrendTracking({ audiences, metrics, className }: TrendTrackingProps) {
  const [selectedMetric, setSelectedMetric] = useState(metrics[0] || "")
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(audiences.slice(0, 4))
  const [timeRange, setTimeRange] = useState<"1y" | "2y" | "all">("1y")

  const trendData = useMemo(
    () => generateTrendData(audiences, metrics),
    [audiences, metrics]
  )

  const alerts = useMemo(
    () => generateAlerts(trendData, selectedAudiences, selectedMetric),
    [trendData, selectedAudiences, selectedMetric]
  )

  // Calculate overall trends
  const audienceTrends = useMemo(() => {
    if (trendData.length < 2) return {}

    const trends: Record<string, { direction: "up" | "down" | "flat"; change: number }> = {}
    const latest = trendData[trendData.length - 1]
    const first = trendData[0]

    for (const audience of audiences) {
      const change = (latest[audience] as number) - (first[audience] as number)
      trends[audience] = {
        direction: change > 5 ? "up" : change < -5 ? "down" : "flat",
        change: Math.round(change),
      }
    }

    return trends
  }, [trendData, audiences])

  const getTrendIcon = (direction: "up" | "down" | "flat") => {
    switch (direction) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const toggleAudience = (audience: string) => {
    if (selectedAudiences.includes(audience)) {
      setSelectedAudiences(selectedAudiences.filter(a => a !== audience))
    } else if (selectedAudiences.length < 6) {
      setSelectedAudiences([...selectedAudiences, audience])
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Trend Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as "1y" | "2y" | "all")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="2y">2 Years</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metric Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Tracking:</span>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metrics.map((metric) => (
                <SelectItem key={metric} value={metric}>
                  {metric}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Significant Changes Detected
            </span>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded"
              >
                <span className="text-sm">{alert.message}</span>
                <Badge
                  className={cn(
                    "text-xs",
                    alert.type === "increase"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  )}
                >
                  {alert.change > 0 ? "+" : ""}{alert.change} pts
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Audience Selector */}
      <div className="flex flex-wrap gap-2">
        {audiences.map((audience, index) => {
          const trend = audienceTrends[audience]
          const isSelected = selectedAudiences.includes(audience)
          return (
            <button
              key={audience}
              onClick={() => toggleAudience(audience)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all border",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-primary/50"
              )}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isSelected ? colors[index % colors.length] : "#ccc" }}
              />
              <span>{audience}</span>
              {trend && (
                <>
                  {getTrendIcon(trend.direction)}
                  <span
                    className={cn(
                      "text-xs",
                      trend.direction === "up"
                        ? "text-green-600"
                        : trend.direction === "down"
                        ? "text-red-600"
                        : "text-gray-500"
                    )}
                  >
                    {trend.change > 0 ? "+" : ""}{trend.change}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* Chart */}
      <Card className="p-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="period"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Legend />
              {selectedAudiences.map((audience, index) => (
                <Line
                  key={audience}
                  type="monotone"
                  dataKey={audience}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[index % colors.length], strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {selectedAudiences.slice(0, 4).map((audience, index) => {
          const trend = audienceTrends[audience]
          const latestValue = trendData[trendData.length - 1]?.[audience] as number
          return (
            <Card key={audience} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm font-medium truncate">{audience}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{latestValue}%</span>
                {trend && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon(trend.direction)}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        trend.direction === "up"
                          ? "text-green-600"
                          : trend.direction === "down"
                          ? "text-red-600"
                          : "text-gray-500"
                      )}
                    >
                      {trend.change > 0 ? "+" : ""}{trend.change}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
