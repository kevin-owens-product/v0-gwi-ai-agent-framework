/**
 * @prompt-id forge-v4.1:feature:feature-usage-analytics:010
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 *
 * Feature Usage Analytics Admin Page
 * Comprehensive dashboard for tracking feature adoption and usage
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  RefreshCw,
  Calculator,
  Loader2,
  AlertTriangle,
  Zap,
  Calendar,
} from "lucide-react"
import {
  FeatureAdoptionChart,
  FeatureUsageHeatmap,
  FeatureUsageTable,
  AdoptionTrendChart,
} from "@/components/admin/feature-usage"

interface FeatureMetric {
  id: string
  date: string
  period: string
  featureKey: string
  featureName: string
  totalUsers: number
  activeUsers: number
  totalEvents: number
  uniqueSessions: number
  avgTimeSpent: number
  adoptionRate: number
  retentionRate: number
  byPlan: Record<string, number>
  byUserRole: Record<string, number>
  category: string
}

interface Summary {
  totalFeatures: number
  totalEvents: number
  totalActiveUsers: number
  avgAdoptionRate: number
  avgRetentionRate: number
}

interface TopFeature {
  featureKey: string
  featureName: string
  adoptionRate: number
  activeUsers: number
}

interface UnderutilizedFeature {
  featureKey: string
  featureName: string
  adoptionRate: number
  totalEvents: number
}

interface ApiResponse {
  metrics: FeatureMetric[]
  summary: Summary
  categories: string[]
  topFeatures: TopFeature[]
  underutilizedFeatures: UnderutilizedFeature[]
}

export default function FeatureUsageAnalyticsPage() {
  const t = useTranslations("admin.analytics.features")
  const tCommon = useTranslations("admin.analytics")
  const [data, setData] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [period, setPeriod] = useState("MONTHLY")
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/feature-usage?period=${period}`)
      if (!response.ok) {
        throw new Error(t("errors.fetchFailed"))
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.unknown"))
      console.error("Failed to fetch feature usage:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [period, fetchData])

  const calculateMetrics = async () => {
    setIsCalculating(true)
    try {
      await fetch("/api/admin/feature-usage/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      })
      await fetchData()
    } catch (err) {
      console.error("Failed to calculate metrics:", err)
    } finally {
      setIsCalculating(false)
    }
  }

  // Prepare trend data
  const trendData = useMemo(() => {
    if (!data?.metrics) return []

    // Group metrics by date
    const byDate = new Map<string, { date: string; [key: string]: string | number }>()
    for (const metric of data.metrics) {
      const dateKey = metric.date.split("T")[0]
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, { date: dateKey })
      }
      byDate.get(dateKey)![metric.featureKey] = metric.adoptionRate
    }

    return Array.from(byDate.values())
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [data?.metrics])

  // Get unique features for trend chart
  const uniqueFeatures = useMemo(() => {
    if (!data?.metrics) return []

    const seen = new Set<string>()
    return data.metrics
      .filter(m => {
        if (seen.has(m.featureKey)) return false
        seen.add(m.featureKey)
        return true
      })
      .map(m => ({
        featureKey: m.featureKey,
        featureName: m.featureName,
        category: m.category,
      }))
  }, [data?.metrics])

  // Get latest metrics for each feature
  const latestMetrics = useMemo(() => {
    if (!data?.metrics) return []

    const latest = new Map<string, FeatureMetric>()
    for (const metric of data.metrics) {
      if (!latest.has(metric.featureKey) ||
          new Date(metric.date) > new Date(latest.get(metric.featureKey)!.date)) {
        latest.set(metric.featureKey, metric)
      }
    }
    return Array.from(latest.values())
  }, [data?.metrics])

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchData}>{t("actions.retry")}</Button>
      </div>
    )
  }

  const summary = data?.summary || {
    totalFeatures: 0,
    totalEvents: 0,
    totalActiveUsers: 0,
    avgAdoptionRate: 0,
    avgRetentionRate: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
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
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {tCommon("actions.refresh")}
          </Button>
          <Button
            onClick={calculateMetrics}
            disabled={isCalculating}
          >
            {isCalculating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            {t("actions.recalculate")}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("summary.totalFeatures")}</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalFeatures}</div>
            <p className="text-xs text-muted-foreground">{t("summary.trackedFeatures")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("summary.totalEvents")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t("summary.thisPeriod")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("summary.activeUsers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalActiveUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t("summary.usingFeatures")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("summary.avgAdoption")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.avgAdoptionRate >= 50 ? "text-green-500" : "text-amber-500"}`}>
              {summary.avgAdoptionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{t("summary.acrossAllFeatures")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("summary.avgRetention")}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.avgRetentionRate >= 50 ? "text-green-500" : "text-amber-500"}`}>
              {summary.avgRetentionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{t("summary.periodOverPeriod")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top & Underutilized Features */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              {t("topFeatures.title")}
            </CardTitle>
            <CardDescription>{t("topFeatures.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.topFeatures && data.topFeatures.length > 0 ? (
                data.topFeatures.map((feature, index) => (
                  <div key={feature.featureKey} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground font-mono">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{feature.featureName}</p>
                        <p className="text-xs text-muted-foreground">{t("topFeatures.activeUsers", { count: feature.activeUsers })}</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      {feature.adoptionRate.toFixed(1)}%
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">{t("noData")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t("underutilized.title")}
            </CardTitle>
            <CardDescription>{t("underutilized.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.underutilizedFeatures && data.underutilizedFeatures.length > 0 ? (
                data.underutilizedFeatures.map((feature) => (
                  <div key={feature.featureKey} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{feature.featureName}</p>
                      <p className="text-xs text-muted-foreground">{t("underutilized.totalEvents", { count: feature.totalEvents })}</p>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {feature.adoptionRate.toFixed(1)}%
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {t("underutilized.allGood")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="heatmap">{t("tabs.planBreakdown")}</TabsTrigger>
          <TabsTrigger value="trends">{t("tabs.trends")}</TabsTrigger>
          <TabsTrigger value="details">{t("tabs.allFeatures")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FeatureAdoptionChart
            data={latestMetrics.map(m => ({
              featureKey: m.featureKey,
              featureName: m.featureName,
              adoptionRate: m.adoptionRate,
              activeUsers: m.activeUsers,
              category: m.category,
            }))}
          />
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-6">
          <FeatureUsageHeatmap
            data={latestMetrics.map(m => ({
              featureKey: m.featureKey,
              featureName: m.featureName,
              category: m.category,
              totalEvents: m.totalEvents,
              byPlan: m.byPlan,
            }))}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <AdoptionTrendChart
            data={trendData}
            features={uniqueFeatures}
          />
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <FeatureUsageTable
            data={latestMetrics}
            categories={data?.categories || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
