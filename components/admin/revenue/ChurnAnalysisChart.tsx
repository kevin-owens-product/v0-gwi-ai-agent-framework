/**
 * @prompt-id forge-v4.1:feature:revenue-analytics:010
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react"

interface ChurnDataPoint {
  date: string
  churnMrr: number
  churnedCustomers: number
  totalMrr: number
  totalCustomers: number
}

interface ChurnAnalysisChartProps {
  data: ChurnDataPoint[]
  netRevenueRetention: number
  isLoading?: boolean
}

export function ChurnAnalysisChart({
  data,
  netRevenueRetention,
  isLoading,
}: ChurnAnalysisChartProps) {
  const t = useTranslations("admin.analytics.churnAnalysis")

  const churnMetrics = useMemo(() => {
    if (data.length === 0) {
      return {
        avgChurnRate: 0,
        avgRevenueChurn: 0,
        trend: "stable" as const,
        latestChurnRate: 0,
        latestRevenueChurn: 0,
      }
    }

    // Calculate churn rates
    const churnRates = data.map(point => {
      const baseCustomers = point.totalCustomers + point.churnedCustomers
      const baseMrr = point.totalMrr + point.churnMrr
      return {
        date: point.date,
        customerChurnRate: baseCustomers > 0 ? (point.churnedCustomers / baseCustomers) * 100 : 0,
        revenueChurnRate: baseMrr > 0 ? (point.churnMrr / baseMrr) * 100 : 0,
        churnedCustomers: point.churnedCustomers,
        churnMrr: point.churnMrr,
      }
    })

    const avgChurnRate = churnRates.reduce((sum, r) => sum + r.customerChurnRate, 0) / churnRates.length
    const avgRevenueChurn = churnRates.reduce((sum, r) => sum + r.revenueChurnRate, 0) / churnRates.length

    // Determine trend
    let trend: "improving" | "worsening" | "stable" = "stable"
    if (churnRates.length >= 2) {
      const recent = churnRates.slice(-3)
      const earlier = churnRates.slice(0, 3)
      const recentAvg = recent.reduce((sum, r) => sum + r.customerChurnRate, 0) / recent.length
      const earlierAvg = earlier.reduce((sum, r) => sum + r.customerChurnRate, 0) / earlier.length

      if (recentAvg < earlierAvg * 0.9) trend = "improving"
      else if (recentAvg > earlierAvg * 1.1) trend = "worsening"
    }

    const latest = churnRates[churnRates.length - 1]

    return {
      avgChurnRate,
      avgRevenueChurn,
      trend,
      latestChurnRate: latest?.customerChurnRate || 0,
      latestRevenueChurn: latest?.revenueChurnRate || 0,
      churnRates,
    }
  }, [data])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  }

  const getChurnStatus = (rate: number) => {
    if (rate <= 2) return { label: t("status.excellent"), color: "text-green-500", bgColor: "bg-green-500" }
    if (rate <= 5) return { label: t("status.good"), color: "text-blue-500", bgColor: "bg-blue-500" }
    if (rate <= 8) return { label: t("status.moderate"), color: "text-yellow-500", bgColor: "bg-yellow-500" }
    return { label: t("status.high"), color: "text-red-500", bgColor: "bg-red-500" }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("loading")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const churnStatus = getChurnStatus(churnMetrics.latestChurnRate)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {churnMetrics.trend === "improving" && (
              <Badge variant="default" className="bg-green-500 gap-1">
                <TrendingDown className="h-3 w-3" />
                {t("trend.improving")}
              </Badge>
            )}
            {churnMetrics.trend === "worsening" && (
              <Badge variant="destructive" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {t("trend.worsening")}
              </Badge>
            )}
            {churnMetrics.trend === "stable" && (
              <Badge variant="secondary">{t("trend.stable")}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("metrics.customerChurn")}</span>
              {churnMetrics.latestChurnRate > 5 && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <div className={`text-2xl font-bold ${churnStatus.color}`}>
              {churnMetrics.latestChurnRate.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {churnStatus.label} - {t("metrics.lastPeriod")}
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="text-sm text-muted-foreground">{t("metrics.revenueChurn")}</div>
            <div className={`text-2xl font-bold ${getChurnStatus(churnMetrics.latestRevenueChurn).color}`}>
              {churnMetrics.latestRevenueChurn.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {t("metrics.monthlyMrrChurn")}
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <div className="text-sm text-muted-foreground">{t("metrics.nrr")}</div>
            <div className={`text-2xl font-bold ${netRevenueRetention >= 100 ? "text-green-500" : "text-yellow-500"}`}>
              {netRevenueRetention.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {netRevenueRetention >= 100 ? t("metrics.growingFromExisting") : t("metrics.netContraction")}
            </div>
          </div>
        </div>

        {/* Churn Trend Chart */}
        {data.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">{t("churnTrend")}</h4>
            <div className="h-32 flex items-end gap-1">
              {churnMetrics.churnRates?.map((point) => {
                const maxRate = Math.max(
                  ...churnMetrics.churnRates!.map(r => Math.max(r.customerChurnRate, r.revenueChurnRate)),
                  10 // Minimum scale
                )
                const customerHeight = (point.customerChurnRate / maxRate) * 100
                const revenueHeight = (point.revenueChurnRate / maxRate) * 100

                return (
                  <div
                    key={point.date}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                      <div className="bg-popover text-popover-foreground rounded-md shadow-lg p-2 text-xs whitespace-nowrap">
                        <div className="font-medium mb-1">{formatDate(point.date)}</div>
                        <div>{t("tooltip.customer")}: {point.customerChurnRate.toFixed(2)}%</div>
                        <div>{t("tooltip.revenue")}: {point.revenueChurnRate.toFixed(2)}%</div>
                        <div>{t("tooltip.lostCustomers", { count: point.churnedCustomers })}</div>
                        <div>{t("tooltip.lostRevenue")}: {formatCurrency(point.churnMrr)}</div>
                      </div>
                    </div>

                    <div className="w-full flex gap-0.5 items-end h-full">
                      {/* Customer churn bar */}
                      <div
                        className="flex-1 bg-red-400 rounded-t transition-all cursor-pointer hover:bg-red-500"
                        style={{ height: `${customerHeight}%`, minHeight: customerHeight > 0 ? "2px" : "0" }}
                      />
                      {/* Revenue churn bar */}
                      <div
                        className="flex-1 bg-orange-400 rounded-t transition-all cursor-pointer hover:bg-orange-500"
                        style={{ height: `${revenueHeight}%`, minHeight: revenueHeight > 0 ? "2px" : "0" }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              {churnMetrics.churnRates?.filter((_, i, arr) =>
                i === 0 || i === arr.length - 1 || i % Math.ceil(arr.length / 4) === 0
              ).map(point => (
                <span key={point.date}>{formatDate(point.date)}</span>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-400" />
                <span>{t("legend.customerChurn")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-orange-400" />
                <span>{t("legend.revenueChurn")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Churn Benchmarks */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">{t("benchmarks.title")}</h4>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{t("benchmarks.yourCustomerChurn")}</span>
                <span className={churnStatus.color}>{churnMetrics.latestChurnRate.toFixed(2)}%</span>
              </div>
              <div className="relative">
                <Progress value={Math.min(churnMetrics.latestChurnRate * 10, 100)} className="h-2" />
                {/* Benchmark markers */}
                <div className="absolute top-0 left-[20%] h-2 w-0.5 bg-green-500" title={t("benchmarks.excellentTooltip")} />
                <div className="absolute top-0 left-[50%] h-2 w-0.5 bg-yellow-500" title={t("benchmarks.averageTooltip")} />
                <div className="absolute top-0 left-[80%] h-2 w-0.5 bg-red-500" title={t("benchmarks.highTooltip")} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span className="text-green-500">{t("benchmarks.excellent")}</span>
                <span className="text-yellow-500">{t("benchmarks.average")}</span>
                <span className="text-red-500">{t("benchmarks.high")}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
