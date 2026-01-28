"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
  BarChart3,
  Users,
  Building2,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AnalyticsData {
  // Platform metrics
  totalOrgs: number
  activeOrgs: number
  newOrgsThisPeriod: number
  churnedOrgs: number
  totalUsers: number
  activeUsers: number
  newUsersThisPeriod: number
  dauMau: number

  // Usage metrics
  totalAgentRuns: number
  totalTokens: number
  totalApiCalls: number
  avgSessionDuration: number

  // Revenue metrics
  mrr: number
  arr: number
  arpu: number
  ltv: number
  churnRate: number
  netRevenueRetention: number

  // Growth metrics
  orgGrowthRate: number
  userGrowthRate: number
  revenueGrowthRate: number

  // Breakdown
  orgsByPlan: Record<string, number>
  orgsByIndustry: Record<string, number>
  topFeatures: { name: string; usage: number }[]
}

export default function AnalyticsPage() {
  const t = useTranslations("admin.analytics")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30d")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [period, fetchAnalytics])

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

  const formatPercent = (value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("loading")}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
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
              <SelectItem value="7d">{t("periods.last7Days")}</SelectItem>
              <SelectItem value="30d">{t("periods.last30Days")}</SelectItem>
              <SelectItem value="90d">{t("periods.last90Days")}</SelectItem>
              <SelectItem value="365d">{t("periods.lastYear")}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {t("actions.refresh")}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("actions.export")}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="growth">{t("tabs.growth")}</TabsTrigger>
          <TabsTrigger value="usage">{t("tabs.usage")}</TabsTrigger>
          <TabsTrigger value="revenue">{t("tabs.revenue")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("metrics.totalOrganizations")}</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data?.totalOrgs || 0)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {(data?.orgGrowthRate || 0) >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={(data?.orgGrowthRate || 0) >= 0 ? "text-green-500" : "text-red-500"}>
                    {formatPercent(Math.abs(data?.orgGrowthRate || 0))}
                  </span>
                  <span className="ml-1">{t("metrics.vsLastPeriod")}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("metrics.totalUsers")}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data?.totalUsers || 0)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {(data?.userGrowthRate || 0) >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={(data?.userGrowthRate || 0) >= 0 ? "text-green-500" : "text-red-500"}>
                    {formatPercent(Math.abs(data?.userGrowthRate || 0))}
                  </span>
                  <span className="ml-1">{t("metrics.vsLastPeriod")}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("metrics.monthlyRecurringRevenue")}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data?.mrr || 0)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {(data?.revenueGrowthRate || 0) >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={(data?.revenueGrowthRate || 0) >= 0 ? "text-green-500" : "text-red-500"}>
                    {formatPercent(Math.abs(data?.revenueGrowthRate || 0))}
                  </span>
                  <span className="ml-1">{t("metrics.vsLastPeriod")}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("metrics.agentRuns")}</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data?.totalAgentRuns || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {t("metrics.tokensConsumed", { count: formatNumber(data?.totalTokens || 0) })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Overview */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("cards.organizationDistribution")}</CardTitle>
                <CardDescription>{t("cards.organizationsByPlanTier")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data?.orgsByPlan || {}).map(([plan, count]) => (
                    <div key={plan} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={plan === "ENTERPRISE" ? "default" : "secondary"}>
                          {plan}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatNumber(count)}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatPercent((count / (data?.totalOrgs || 1)) * 100)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("cards.topFeatures")}</CardTitle>
                <CardDescription>{t("cards.mostUsedPlatformFeatures")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(data?.topFeatures || []).slice(0, 5).map((feature, index) => (
                    <div key={feature.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">#{index + 1}</span>
                        <span className="text-sm font-medium">{feature.name}</span>
                      </div>
                      <span className="text-sm">{t("metrics.uses", { count: formatNumber(feature.usage) })}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("metrics.activeOrganizations")}</p>
                    <p className="text-2xl font-bold">{formatNumber(data?.activeOrgs || 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t("metrics.of")} {formatNumber(data?.totalOrgs || 0)}</p>
                    <p className="text-lg font-semibold text-green-500">
                      {formatPercent(((data?.activeOrgs || 0) / (data?.totalOrgs || 1)) * 100)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("metrics.dauMauRatio")}</p>
                    <p className="text-2xl font-bold">{formatPercent(data?.dauMau || 0)}</p>
                  </div>
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("metrics.userEngagementIndicator")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("metrics.avgSessionDuration")}</p>
                    <p className="text-2xl font-bold">{data?.avgSessionDuration || 0} {t("metrics.minutes")}</p>
                  </div>
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t("metrics.averageTimePerSession")}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("growth.newOrganizations")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  +{formatNumber(data?.newOrgsThisPeriod || 0)}
                </div>
                <p className="text-xs text-muted-foreground">{t("growth.thisPeriod")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("growth.churnedOrganizations")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  -{formatNumber(data?.churnedOrgs || 0)}
                </div>
                <p className="text-xs text-muted-foreground">{t("growth.thisPeriod")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("growth.newUsers")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  +{formatNumber(data?.newUsersThisPeriod || 0)}
                </div>
                <p className="text-xs text-muted-foreground">{t("growth.thisPeriod")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("growth.netGrowth")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(data?.orgGrowthRate || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {(data?.orgGrowthRate || 0) >= 0 ? "+" : ""}{formatPercent(data?.orgGrowthRate || 0)}
                </div>
                <p className="text-xs text-muted-foreground">{t("growth.organizationGrowthRate")}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("usage.totalAgentRuns")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data?.totalAgentRuns || 0)}</div>
                <p className="text-xs text-muted-foreground">{t("growth.thisPeriod")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("usage.tokensConsumed")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data?.totalTokens || 0)}</div>
                <p className="text-xs text-muted-foreground">{t("growth.thisPeriod")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("usage.apiCalls")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data?.totalApiCalls || 0)}</div>
                <p className="text-xs text-muted-foreground">{t("growth.thisPeriod")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("usage.activeUsers")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data?.activeUsers || 0)}</div>
                <p className="text-xs text-muted-foreground">{t("growth.thisPeriod")}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("revenue.mrr")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data?.mrr || 0)}</div>
                <p className="text-xs text-muted-foreground">{t("revenue.monthlyRecurringRevenue")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("revenue.arr")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data?.arr || 0)}</div>
                <p className="text-xs text-muted-foreground">{t("revenue.annualRecurringRevenue")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("revenue.arpu")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data?.arpu || 0)}</div>
                <p className="text-xs text-muted-foreground">{t("revenue.avgRevenuePerUser")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("revenue.churnRate")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(data?.churnRate || 0) > 5 ? "text-red-500" : "text-green-500"}`}>
                  {formatPercent(data?.churnRate || 0)}
                </div>
                <p className="text-xs text-muted-foreground">{t("revenue.monthlyChurn")}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("revenue.customerLtv")}</p>
                    <p className="text-2xl font-bold">{formatCurrency(data?.ltv || 0)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t("revenue.averageLifetimeValue")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("revenue.netRevenueRetention")}</p>
                    <p className={`text-2xl font-bold ${(data?.netRevenueRetention || 0) >= 100 ? "text-green-500" : "text-yellow-500"}`}>
                      {formatPercent(data?.netRevenueRetention || 0)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t("revenue.includingExpansions")}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
