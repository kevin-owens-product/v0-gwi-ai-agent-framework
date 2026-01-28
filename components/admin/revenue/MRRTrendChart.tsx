/**
 * @prompt-id forge-v4.1:feature:revenue-analytics:007
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricDataPoint {
  date: string
  mrr: number
  arr: number
  newMrr: number
  expansionMrr: number
  contractionMrr: number
  churnMrr: number
  netNewMrr: number
}

interface MRRTrendChartProps {
  data: MetricDataPoint[]
  isLoading?: boolean
}

export function MRRTrendChart({ data, isLoading }: MRRTrendChartProps) {
  const t = useTranslations("admin.analytics.mrrTrend")

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Sort by date ascending for proper display
    return [...data].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [data])

  const stats = useMemo(() => {
    if (chartData.length < 2) {
      return { growthRate: 0, trend: "stable" as const }
    }

    const latest = chartData[chartData.length - 1]
    const previous = chartData[chartData.length - 2]
    const growthRate = previous.mrr > 0
      ? ((latest.mrr - previous.mrr) / previous.mrr) * 100
      : 0

    return {
      growthRate,
      trend: growthRate > 1 ? "up" : growthRate < -1 ? "down" : "stable",
    }
  }, [chartData])

  const maxMrr = useMemo(() => {
    if (chartData.length === 0) return 100
    return Math.max(...chartData.map(d => d.mrr)) * 1.1 // Add 10% padding
  }, [chartData])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("loading")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="bg-muted rounded"
                  style={{
                    width: "24px",
                    height: `${Math.random() * 100 + 50}px`,
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            {t("noData")}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {stats.trend === "up" && (
              <Badge variant="default" className="bg-green-500 gap-1">
                <TrendingUp className="h-3 w-3" />
                +{stats.growthRate.toFixed(1)}%
              </Badge>
            )}
            {stats.trend === "down" && (
              <Badge variant="destructive" className="gap-1">
                <TrendingDown className="h-3 w-3" />
                {stats.growthRate.toFixed(1)}%
              </Badge>
            )}
            {stats.trend === "stable" && (
              <Badge variant="secondary">{t("stable")}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(maxMrr)}</span>
            <span>{formatCurrency(maxMrr * 0.75)}</span>
            <span>{formatCurrency(maxMrr * 0.5)}</span>
            <span>{formatCurrency(maxMrr * 0.25)}</span>
            <span>$0</span>
          </div>

          {/* Chart area */}
          <div className="ml-16 h-64 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-t border-muted h-0" />
              ))}
            </div>

            {/* Bars */}
            <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-around gap-1 px-1">
              {chartData.map((point) => {
                const height = (point.mrr / maxMrr) * 100
                const newMrrHeight = (point.newMrr / maxMrr) * 100
                const expansionHeight = (point.expansionMrr / maxMrr) * 100

                return (
                  <div
                    key={point.date}
                    className="flex-1 flex flex-col items-center group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                      <div className="bg-popover text-popover-foreground rounded-md shadow-lg p-3 text-xs whitespace-nowrap">
                        <div className="font-medium mb-2">{formatDate(point.date)}</div>
                        <div className="space-y-1">
                          <div className="flex justify-between gap-4">
                            <span>{t("tooltip.mrr")}:</span>
                            <span className="font-medium">{formatCurrency(point.mrr)}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-green-500">
                            <span>{t("tooltip.new")}:</span>
                            <span>+{formatCurrency(point.newMrr)}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-blue-500">
                            <span>{t("tooltip.expansion")}:</span>
                            <span>+{formatCurrency(point.expansionMrr)}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-orange-500">
                            <span>{t("tooltip.contraction")}:</span>
                            <span>-{formatCurrency(point.contractionMrr)}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-red-500">
                            <span>{t("tooltip.churn")}:</span>
                            <span>-{formatCurrency(point.churnMrr)}</span>
                          </div>
                          <div className="border-t pt-1 mt-1 flex justify-between gap-4">
                            <span>{t("tooltip.netNew")}:</span>
                            <span className={point.netNewMrr >= 0 ? "text-green-500" : "text-red-500"}>
                              {point.netNewMrr >= 0 ? "+" : ""}{formatCurrency(point.netNewMrr)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stacked bar */}
                    <div
                      className="w-full flex flex-col justify-end rounded-t transition-all cursor-pointer hover:opacity-80"
                      style={{ height: `${height}%` }}
                    >
                      {/* Base MRR (excluding new and expansion) */}
                      <div
                        className="bg-primary/80 rounded-t w-full"
                        style={{
                          height: `${Math.max(0, height - newMrrHeight - expansionHeight)}%`,
                          minHeight: height > 0 ? "2px" : "0",
                        }}
                      />
                      {/* Expansion MRR */}
                      {expansionHeight > 0 && (
                        <div
                          className="bg-blue-500 w-full"
                          style={{ height: `${expansionHeight}%` }}
                        />
                      )}
                      {/* New MRR */}
                      {newMrrHeight > 0 && (
                        <div
                          className="bg-green-500 w-full"
                          style={{ height: `${newMrrHeight}%` }}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="ml-16 mt-2 flex justify-around">
            {chartData.map((point, index) => (
              <div
                key={point.date}
                className="flex-1 text-center text-xs text-muted-foreground"
              >
                {index % Math.ceil(chartData.length / 6) === 0 || chartData.length <= 6
                  ? formatDate(point.date)
                  : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/80" />
            <span>{t("legend.existingMrr")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>{t("legend.expansion")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>{t("legend.new")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
