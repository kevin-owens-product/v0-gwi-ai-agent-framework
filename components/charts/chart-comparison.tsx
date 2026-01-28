"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Download,
  BarChart3,
} from "lucide-react"
import { AdvancedChartRenderer } from "./advanced-chart-renderer"
import { cn } from "@/lib/utils"

interface ComparisonDataPoint {
  name: string
  current: number
  previous?: number
  benchmark?: number
  target?: number
  change?: number
}

interface ChartComparisonProps {
  data: ComparisonDataPoint[]
  title?: string
  description?: string
  currentLabel?: string
  previousLabel?: string
  benchmarkLabel?: string
  className?: string
  showPercentageChange?: boolean
  showBenchmark?: boolean
  onPeriodChange?: (period: string) => void
}

export function ChartComparison({
  data,
  title,
  description,
  currentLabel,
  previousLabel,
  benchmarkLabel,
  className,
  showPercentageChange = true,
  showBenchmark = true,
  onPeriodChange,
}: ChartComparisonProps) {
  const t = useTranslations('dashboard.charts.comparison')

  const periods = [
    { value: "week", labelKey: "vsLastWeek" },
    { value: "month", labelKey: "vsLastMonth" },
    { value: "quarter", labelKey: "vsLastQuarter" },
    { value: "year", labelKey: "vsLastYear" },
    { value: "custom", labelKey: "customPeriod" },
  ]

  const displayTitle = title ?? t('title')
  const displayDescription = description ?? t('description')
  const displayCurrentLabel = currentLabel ?? t('currentPeriod')
  const displayPreviousLabel = previousLabel ?? t('previousPeriod')
  const displayBenchmarkLabel = benchmarkLabel ?? t('industryBenchmark')
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart")

  // Calculate summary statistics
  const summary = useMemo(() => {
    const improvements = data.filter((d) => (d.change || 0) > 0).length
    const declines = data.filter((d) => (d.change || 0) < 0).length
    const unchanged = data.filter((d) => (d.change || 0) === 0).length
    const avgChange = data.reduce((sum, d) => sum + (d.change || 0), 0) / data.length
    const aboveBenchmark = data.filter((d) => d.benchmark && d.current > d.benchmark).length

    return { improvements, declines, unchanged, avgChange, aboveBenchmark }
  }, [data])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    if (onPeriodChange) {
      onPeriodChange(period)
    }
  }

  // Prepare chart data
  const chartData = useMemo(() => {
    return data.map((d) => ({
      metric: d.name,
      current: d.current,
      previous: d.previous || 0,
      benchmark: d.benchmark || 0,
      change: d.change || 0,
    }))
  }, [data])

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {displayTitle}
            </CardTitle>
            <CardDescription>{displayDescription}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {t(`periods.${period.labelKey}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-green-500">{summary.improvements}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {t('summary.improvements')}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-red-500">{summary.declines}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              {t('summary.declines')}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-muted-foreground">{summary.unchanged}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Minus className="h-3 w-3" />
              {t('summary.unchanged')}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div
              className={cn(
                "text-2xl font-bold",
                summary.avgChange > 0 ? "text-green-500" : summary.avgChange < 0 ? "text-red-500" : ""
              )}
            >
              {summary.avgChange > 0 ? "+" : ""}
              {summary.avgChange.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">{t('summary.avgChange')}</div>
          </div>
          {showBenchmark && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">{summary.aboveBenchmark}/{data.length}</div>
              <div className="text-xs text-muted-foreground">{t('summary.aboveBenchmark')}</div>
            </div>
          )}
        </div>

        {/* View Toggle */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList>
            <TabsTrigger value="chart">{t('views.chart')}</TabsTrigger>
            <TabsTrigger value="table">{t('views.table')}</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-4">
            <AdvancedChartRenderer
              type="COMPARISON_BAR"
              data={chartData as any}
              config={{
                height: 400,
                showLegend: true,
                showGrid: true,
                showTooltip: true,
                showChange: true,
                formatter: "percentage",
              }}
            />
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground">{t('table.metric')}</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">{displayCurrentLabel}</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">{displayPreviousLabel}</th>
                    {showBenchmark && (
                      <th className="text-right p-3 font-medium text-muted-foreground">{displayBenchmarkLabel}</th>
                    )}
                    {showPercentageChange && (
                      <th className="text-right p-3 font-medium text-muted-foreground">{t('table.change')}</th>
                    )}
                    <th className="text-center p-3 font-medium text-muted-foreground">{t('table.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => {
                    const change = item.change || 0
                    const isAboveBenchmark = item.benchmark && item.current > item.benchmark

                    return (
                      <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-medium">{item.name}</td>
                        <td className="p-3 text-right">
                          <span className="font-semibold">{item.current}%</span>
                        </td>
                        <td className="p-3 text-right text-muted-foreground">
                          {item.previous !== undefined ? `${item.previous}%` : "-"}
                        </td>
                        {showBenchmark && (
                          <td className="p-3 text-right text-muted-foreground">
                            {item.benchmark !== undefined ? `${item.benchmark}%` : "-"}
                          </td>
                        )}
                        {showPercentageChange && (
                          <td className="p-3 text-right">
                            <span
                              className={cn(
                                "flex items-center justify-end gap-1",
                                change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
                              )}
                            >
                              {change > 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : change < 0 ? (
                                <TrendingDown className="h-4 w-4" />
                              ) : (
                                <Minus className="h-4 w-4" />
                              )}
                              {change > 0 ? "+" : ""}
                              {change.toFixed(1)}%
                            </span>
                          </td>
                        )}
                        <td className="p-3 text-center">
                          {isAboveBenchmark ? (
                            <Badge variant="default" className="bg-green-500">
                              {t('status.aboveBenchmark')}
                            </Badge>
                          ) : item.benchmark ? (
                            <Badge variant="secondary">{t('status.belowBenchmark')}</Badge>
                          ) : (
                            <Badge variant="outline">{t('status.notAvailable')}</Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">{displayCurrentLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span className="text-sm text-muted-foreground">{displayPreviousLabel}</span>
          </div>
          {showBenchmark && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm text-muted-foreground">{displayBenchmarkLabel}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Pre-built comparison scenarios
export const comparisonScenarios = {
  brandHealth: [
    { name: "Brand Awareness", current: 72, previous: 65, benchmark: 68, change: 10.8 },
    { name: "Ad Recall", current: 48, previous: 42, benchmark: 45, change: 14.3 },
    { name: "Purchase Intent", current: 31, previous: 28, benchmark: 25, change: 10.7 },
    { name: "Brand Favorability", current: 58, previous: 52, benchmark: 55, change: 11.5 },
    { name: "Recommendation", current: 42, previous: 38, benchmark: 40, change: 10.5 },
  ],
  socialEngagement: [
    { name: "Instagram Reach", current: 78, previous: 72, benchmark: 65, change: 8.3 },
    { name: "TikTok Engagement", current: 67, previous: 54, benchmark: 48, change: 24.1 },
    { name: "YouTube Views", current: 89, previous: 86, benchmark: 82, change: 3.5 },
    { name: "Facebook Interactions", current: 62, previous: 68, benchmark: 71, change: -8.8 },
    { name: "Twitter Impressions", current: 34, previous: 38, benchmark: 35, change: -10.5 },
  ],
  audienceGrowth: [
    { name: "Total Reach", current: 2400000, previous: 2100000, benchmark: 2200000, change: 14.3 },
    { name: "New Followers", current: 125000, previous: 98000, benchmark: 100000, change: 27.6 },
    { name: "Engagement Rate", current: 4.2, previous: 3.8, benchmark: 3.5, change: 10.5 },
    { name: "Share Rate", current: 2.1, previous: 1.9, benchmark: 1.8, change: 10.5 },
    { name: "Save Rate", current: 3.4, previous: 2.9, benchmark: 2.5, change: 17.2 },
  ],
}
