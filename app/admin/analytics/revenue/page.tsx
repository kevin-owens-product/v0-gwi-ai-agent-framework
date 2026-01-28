/**
 * @prompt-id forge-v4.1:feature:revenue-analytics:012
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useEffect, useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DollarSign,
  RefreshCw,
  Download,
  Calculator,
  TrendingUp,
  BarChart3,
  Calendar,
  Loader2,
} from "lucide-react"

import {
  RevenueOverviewCards,
  MRRTrendChart,
  RevenueByPlanChart,
  CohortAnalysisTable,
  ChurnAnalysisChart,
} from "@/components/admin/revenue"

interface RevenueSummary {
  currentMrr: number
  currentArr: number
  mrrGrowthRate: number
  customerGrowthRate: number
  totalCustomers: number
  churnRate: number
  netRevenueRetention: number
  arpu: number
  ltv: number
}

interface RevenueMetric {
  id: string
  date: string
  period: string
  mrr: number
  arr: number
  newMrr: number
  expansionMrr: number
  contractionMrr: number
  churnMrr: number
  netNewMrr: number
  totalCustomers: number
  newCustomers: number
  churnedCustomers: number
  arpu: number
  ltv: number
  byPlan: Record<string, { customerCount: number; mrr: number; percentage: number }>
  byRegion: Record<string, { customerCount: number; mrr: number; percentage: number }>
}

interface MRRBreakdown {
  totalMrr: number
  totalArr: number
  growthRate: number
  netRevenueRetention: number
  byPlan: Array<{
    plan: string
    customerCount: number
    mrr: number
    percentage: number
  }>
  byCohort: Array<{
    cohortDate: string
    initialCustomers: number
    currentCustomers: number
    initialMrr: number
    currentMrr: number
    retentionRate: number
    revenueRetention: number
    monthsActive: number
  }>
}

interface RevenueForecast {
  period: string
  projectedMrr: number
  projectedArr: number
  confidence: number
  lowerBound: number
  upperBound: number
}

export default function RevenueAnalyticsPage() {
  const t = useTranslations("admin.analytics.revenue")
  const tCommon = useTranslations("admin.analytics")
  const [summary, setSummary] = useState<RevenueSummary | null>(null)
  const [metrics, setMetrics] = useState<RevenueMetric[]>([])
  const [mrrBreakdown, setMrrBreakdown] = useState<MRRBreakdown | null>(null)
  const [forecast, setForecast] = useState<RevenueForecast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [period, setPeriod] = useState("MONTHLY")
  const [activeTab, setActiveTab] = useState("overview")

  const fetchRevenueData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [metricsRes, mrrRes, forecastRes] = await Promise.all([
        fetch(`/api/admin/revenue?period=${period}&limit=12`),
        fetch("/api/admin/revenue/mrr"),
        fetch("/api/admin/revenue/forecast?months=12"),
      ])

      if (metricsRes.ok) {
        const data = await metricsRes.json()
        setSummary(data.summary)
        setMetrics(data.metrics)
      }

      if (mrrRes.ok) {
        const data = await mrrRes.json()
        setMrrBreakdown(data)
      }

      if (forecastRes.ok) {
        const data = await forecastRes.json()
        setForecast(data.forecast)
      }
    } catch (error) {
      console.error("Failed to fetch revenue data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchRevenueData()
  }, [fetchRevenueData])

  const calculateMetrics = async () => {
    setIsCalculating(true)
    try {
      const response = await fetch("/api/admin/revenue/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, date: new Date().toISOString() }),
      })

      if (response.ok) {
        // Refresh data after calculation
        await fetchRevenueData()
      }
    } catch (error) {
      console.error("Failed to calculate metrics:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const exportData = () => {
    const exportData = {
      summary,
      metrics,
      mrrBreakdown,
      forecast,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `revenue-analytics-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">{tCommon("periodOptions.daily")}</SelectItem>
              <SelectItem value="WEEKLY">{tCommon("periodOptions.weekly")}</SelectItem>
              <SelectItem value="MONTHLY">{tCommon("periodOptions.monthly")}</SelectItem>
              <SelectItem value="QUARTERLY">{tCommon("periodOptions.quarterly")}</SelectItem>
              <SelectItem value="YEARLY">{tCommon("periodOptions.yearly")}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchRevenueData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {tCommon("actions.refresh")}
          </Button>
          <Button variant="outline" onClick={calculateMetrics} disabled={isCalculating}>
            {isCalculating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            {t("actions.calculate")}
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            {tCommon("actions.export")}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {summary && (
        <RevenueOverviewCards summary={summary} isLoading={isLoading} />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {t("tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t("tabs.trends")}
          </TabsTrigger>
          <TabsTrigger value="cohorts" className="gap-2">
            <DollarSign className="h-4 w-4" />
            {t("tabs.cohorts")}
          </TabsTrigger>
          <TabsTrigger value="forecast" className="gap-2">
            <Calendar className="h-4 w-4" />
            {t("tabs.forecast")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* MRR Trend */}
            <MRRTrendChart data={metrics} isLoading={isLoading} />

            {/* Revenue by Plan */}
            {mrrBreakdown && (
              <RevenueByPlanChart
                data={mrrBreakdown.byPlan}
                totalMrr={mrrBreakdown.totalMrr}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Churn Analysis */}
          <ChurnAnalysisChart
            data={metrics.map(m => ({
              date: m.date,
              churnMrr: m.churnMrr,
              churnedCustomers: m.churnedCustomers,
              totalMrr: m.mrr,
              totalCustomers: m.totalCustomers,
            }))}
            netRevenueRetention={summary?.netRevenueRetention || 100}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <MRRTrendChart data={metrics} isLoading={isLoading} />

          {/* Detailed Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t("metricsHistory.title")}</CardTitle>
              <CardDescription>{t("metricsHistory.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3">{t("metricsHistory.date")}</th>
                      <th className="text-right p-3">{t("metricsHistory.mrr")}</th>
                      <th className="text-right p-3">{t("metricsHistory.new")}</th>
                      <th className="text-right p-3">{t("metricsHistory.expansion")}</th>
                      <th className="text-right p-3">{t("metricsHistory.contraction")}</th>
                      <th className="text-right p-3">{t("metricsHistory.churn")}</th>
                      <th className="text-right p-3">{t("metricsHistory.netNew")}</th>
                      <th className="text-right p-3">{t("metricsHistory.customers")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-muted-foreground">
                          {t("metricsHistory.noData")}
                        </td>
                      </tr>
                    ) : (
                      metrics.map((metric) => (
                        <tr key={metric.id} className="border-b">
                          <td className="p-3">
                            {new Date(metric.date).toLocaleDateString()}
                          </td>
                          <td className="text-right p-3 font-medium">
                            {formatCurrency(metric.mrr)}
                          </td>
                          <td className="text-right p-3 text-green-500">
                            +{formatCurrency(metric.newMrr)}
                          </td>
                          <td className="text-right p-3 text-blue-500">
                            +{formatCurrency(metric.expansionMrr)}
                          </td>
                          <td className="text-right p-3 text-orange-500">
                            -{formatCurrency(metric.contractionMrr)}
                          </td>
                          <td className="text-right p-3 text-red-500">
                            -{formatCurrency(metric.churnMrr)}
                          </td>
                          <td className={`text-right p-3 ${metric.netNewMrr >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {metric.netNewMrr >= 0 ? "+" : ""}{formatCurrency(metric.netNewMrr)}
                          </td>
                          <td className="text-right p-3">
                            {metric.totalCustomers}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-6">
          {mrrBreakdown && (
            <CohortAnalysisTable
              data={mrrBreakdown.byCohort}
              isLoading={isLoading}
            />
          )}

          {/* Plan Distribution Details */}
          {mrrBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle>{t("planDistribution.title")}</CardTitle>
                <CardDescription>{t("planDistribution.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {mrrBreakdown.byPlan.map((plan) => (
                    <div key={plan.plan} className="p-4 rounded-lg border">
                      <div className="text-lg font-semibold">{plan.plan}</div>
                      <div className="text-2xl font-bold mt-2">
                        {formatCurrency(plan.mrr)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("planDistribution.customers", { count: plan.customerCount, percentage: plan.percentage.toFixed(1) })}
                      </div>
                      <div className="mt-2 text-sm">
                        {t("planDistribution.arpu")}: {plan.customerCount > 0 ? formatCurrency(plan.mrr / plan.customerCount) : "$0"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("forecast.title")}</CardTitle>
              <CardDescription>{t("forecast.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {forecast.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  {t("forecast.noData")}
                </div>
              ) : (
                <>
                  {/* Forecast Chart */}
                  <div className="h-64 relative mb-6">
                    <div className="absolute inset-0 flex items-end gap-1 px-4">
                      {forecast.map((point) => {
                        const maxMrr = Math.max(...forecast.map(f => f.upperBound)) * 1.1
                        const height = (point.projectedMrr / maxMrr) * 100
                        const lowerHeight = (point.lowerBound / maxMrr) * 100
                        const upperHeight = (point.upperBound / maxMrr) * 100

                        return (
                          <div
                            key={point.period}
                            className="flex-1 flex flex-col items-center group relative"
                          >
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                              <div className="bg-popover text-popover-foreground rounded-md shadow-lg p-2 text-xs whitespace-nowrap">
                                <div className="font-medium">{point.period}</div>
                                <div>{t("forecast.projected")}: {formatCurrency(point.projectedMrr)}</div>
                                <div>{t("forecast.range")}: {formatCurrency(point.lowerBound)} - {formatCurrency(point.upperBound)}</div>
                                <div>{t("forecast.confidence")}: {point.confidence}%</div>
                              </div>
                            </div>

                            {/* Confidence range */}
                            <div
                              className="absolute w-3/4 bg-primary/10 rounded"
                              style={{
                                bottom: `${lowerHeight}%`,
                                height: `${upperHeight - lowerHeight}%`,
                              }}
                            />

                            {/* Projected value bar */}
                            <div
                              className="w-full bg-primary rounded-t transition-all cursor-pointer hover:bg-primary/80 relative z-10"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="flex justify-between px-4 text-xs text-muted-foreground">
                    {forecast.filter((_, i) => i % 2 === 0).map(point => (
                      <span key={point.period}>{point.period}</span>
                    ))}
                  </div>

                  {/* Forecast Table */}
                  <div className="rounded-md border mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3">{t("forecast.period")}</th>
                          <th className="text-right p-3">{t("forecast.projectedMrr")}</th>
                          <th className="text-right p-3">{t("forecast.projectedArr")}</th>
                          <th className="text-right p-3">{t("forecast.lowerBound")}</th>
                          <th className="text-right p-3">{t("forecast.upperBound")}</th>
                          <th className="text-right p-3">{t("forecast.confidenceLabel")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecast.map((point) => (
                          <tr key={point.period} className="border-b">
                            <td className="p-3 font-medium">{point.period}</td>
                            <td className="text-right p-3">{formatCurrency(point.projectedMrr)}</td>
                            <td className="text-right p-3">{formatCurrency(point.projectedArr)}</td>
                            <td className="text-right p-3 text-muted-foreground">
                              {formatCurrency(point.lowerBound)}
                            </td>
                            <td className="text-right p-3 text-muted-foreground">
                              {formatCurrency(point.upperBound)}
                            </td>
                            <td className={`text-right p-3 ${point.confidence >= 80 ? "text-green-500" : point.confidence >= 60 ? "text-yellow-500" : "text-red-500"}`}>
                              {point.confidence}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
