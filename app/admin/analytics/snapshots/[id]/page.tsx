"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Camera,
  Loader2,
  Building2,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  History,
} from "lucide-react"
import Link from "next/link"

interface AnalyticsSnapshot {
  id: string
  type: string
  period: string
  periodStart: string
  periodEnd: string
  totalOrgs: number
  activeOrgs: number
  newOrgs: number
  churnedOrgs: number
  totalUsers: number
  activeUsers: number
  newUsers: number
  totalAgentRuns: number
  totalTokens: string
  totalApiCalls: string
  totalStorage: string
  mrr: number
  arr: number
  newMrr: number
  churnedMrr: number
  expansionMrr: number
  orgsByPlan: Record<string, number>
  orgsByRegion: Record<string, number>
  orgsByIndustry: Record<string, number>
  metrics: Record<string, unknown>
  metadata: Record<string, unknown>
  createdAt: string
}

interface Deltas {
  totalOrgs: number
  activeOrgs: number
  totalUsers: number
  activeUsers: number
  totalAgentRuns: number
  mrr: number
  arr: number
  totalOrgsPercent: number
  mrrPercent: number
}

interface AuditLog {
  id: string
  action: string
  details: Record<string, unknown>
  timestamp: string
}

export default function SnapshotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const snapshotId = params.id as string
  const t = useTranslations("admin.analytics.snapshots.detail")

  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null)
  const [previousSnapshot, setPreviousSnapshot] = useState<AnalyticsSnapshot | null>(null)
  const [deltas, setDeltas] = useState<Deltas | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSnapshot = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics/snapshots/${snapshotId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch snapshot")
      }
      const data = await response.json()
      setSnapshot(data.snapshot)
      setPreviousSnapshot(data.previousSnapshot)
      setDeltas(data.deltas)
      setAuditLogs(data.auditLogs || [])
    } catch (error) {
      console.error("Failed to fetch snapshot:", error)
    } finally {
      setIsLoading(false)
    }
  }, [snapshotId])

  useEffect(() => {
    fetchSnapshot()
  }, [fetchSnapshot])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

  const formatPercent = (value: number, decimals = 1) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      PLATFORM: "bg-blue-500/10 text-blue-500",
      USAGE: "bg-green-500/10 text-green-500",
      REVENUE: "bg-yellow-500/10 text-yellow-500",
      ENGAGEMENT: "bg-purple-500/10 text-purple-500",
      SECURITY: "bg-red-500/10 text-red-500",
    }
    return colors[type] || "bg-gray-500/10 text-gray-500"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!snapshot) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">{t("notFound")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/analytics/snapshots">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Camera className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {t("snapshotTitle", { type: snapshot.type })}
              <Badge className={getTypeColor(snapshot.type)}>{snapshot.type}</Badge>
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(snapshot.periodStart).toLocaleDateString()} - {new Date(snapshot.periodEnd).toLocaleDateString()}
              <Badge variant="outline">{snapshot.period}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t("tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            <PieChart className="h-4 w-4 mr-2" />
            {t("tabs.breakdown")}
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <TrendingUp className="h-4 w-4 mr-2" />
            {t("tabs.comparison")}
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            {t("tabs.history")}
          </TabsTrigger>
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
                <div className="text-2xl font-bold">{formatNumber(snapshot.totalOrgs)}</div>
                {deltas && (
                  <div className="flex items-center text-xs">
                    {deltas.totalOrgs >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={deltas.totalOrgs >= 0 ? "text-green-500" : "text-red-500"}>
                      {formatPercent(deltas.totalOrgsPercent)}
                    </span>
                    <span className="text-muted-foreground ml-1">{t("metrics.vsPrevious")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("metrics.totalUsers")}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(snapshot.totalUsers)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Activity className="h-3 w-3 mr-1" />
                  {formatNumber(snapshot.activeUsers)} {t("metrics.active")} ({((snapshot.activeUsers / snapshot.totalUsers) * 100).toFixed(1)}%)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("metrics.monthlyRecurringRevenue")}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(snapshot.mrr)}</div>
                {deltas && (
                  <div className="flex items-center text-xs">
                    {deltas.mrr >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={deltas.mrr >= 0 ? "text-green-500" : "text-red-500"}>
                      {formatPercent(deltas.mrrPercent)}
                    </span>
                    <span className="text-muted-foreground ml-1">{t("metrics.vsPrevious")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("metrics.agentRuns")}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(snapshot.totalAgentRuns)}</div>
                <p className="text-xs text-muted-foreground">
                  {t("metrics.tokensConsumed", { count: formatNumber(parseInt(snapshot.totalTokens)) })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Growth Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("growth.newOrganizations")}</p>
                    <p className="text-2xl font-bold text-green-500">+{formatNumber(snapshot.newOrgs)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("growth.churnedOrganizations")}</p>
                    <p className="text-2xl font-bold text-red-500">-{formatNumber(snapshot.churnedOrgs)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("growth.newMrr")}</p>
                    <p className="text-2xl font-bold text-green-500">+{formatCurrency(snapshot.newMrr)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("growth.churnedMrr")}</p>
                    <p className="text-2xl font-bold text-red-500">-{formatCurrency(snapshot.churnedMrr)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("revenue.annualRecurringRevenue")}</p>
                    <p className="text-2xl font-bold">{formatCurrency(snapshot.arr)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("revenue.expansionMrr")}</p>
                    <p className="text-2xl font-bold text-blue-500">+{formatCurrency(snapshot.expansionMrr)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          {/* By Plan */}
          <Card>
            <CardHeader>
              <CardTitle>{t("breakdown.organizationsByPlan")}</CardTitle>
              <CardDescription>{t("breakdown.organizationsByPlanDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(snapshot.orgsByPlan).map(([plan, count]) => {
                  const percentage = ((count / snapshot.totalOrgs) * 100).toFixed(1)
                  return (
                    <div key={plan} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={plan === "ENTERPRISE" ? "default" : "secondary"}>
                          {plan}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-16 text-right">{formatNumber(count)}</span>
                        <span className="text-xs text-muted-foreground w-12 text-right">({percentage}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* By Industry */}
          <Card>
            <CardHeader>
              <CardTitle>{t("breakdown.organizationsByIndustry")}</CardTitle>
              <CardDescription>{t("breakdown.organizationsByIndustryDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(snapshot.orgsByIndustry).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(snapshot.orgsByIndustry)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([industry, count]) => {
                      const percentage = ((count / snapshot.totalOrgs) * 100).toFixed(1)
                      return (
                        <div key={industry} className="flex items-center justify-between">
                          <span className="text-sm">{industry}</span>
                          <div className="flex items-center gap-4">
                            <div className="w-32 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-16 text-right">{formatNumber(count)}</span>
                            <span className="text-xs text-muted-foreground w-12 text-right">({percentage}%)</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">{t("breakdown.noIndustryData")}</p>
              )}
            </CardContent>
          </Card>

          {/* By Region */}
          <Card>
            <CardHeader>
              <CardTitle>{t("breakdown.organizationsByRegion")}</CardTitle>
              <CardDescription>{t("breakdown.organizationsByRegionDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(snapshot.orgsByRegion).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(snapshot.orgsByRegion)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([region, count]) => {
                      const percentage = ((count / snapshot.totalOrgs) * 100).toFixed(1)
                      return (
                        <div key={region} className="flex items-center justify-between">
                          <span className="text-sm">{region}</span>
                          <div className="flex items-center gap-4">
                            <div className="w-32 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-16 text-right">{formatNumber(count)}</span>
                            <span className="text-xs text-muted-foreground w-12 text-right">({percentage}%)</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">{t("breakdown.noRegionData")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {previousSnapshot ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("comparison.title")}</CardTitle>
                <CardDescription>
                  {t("comparison.description", {
                    start: new Date(previousSnapshot.periodStart).toLocaleDateString(),
                    end: new Date(previousSnapshot.periodEnd).toLocaleDateString()
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("comparison.metric")}</TableHead>
                      <TableHead className="text-right">{t("comparison.previous")}</TableHead>
                      <TableHead className="text-right">{t("comparison.current")}</TableHead>
                      <TableHead className="text-right">{t("comparison.change")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{t("comparison.totalOrganizations")}</TableCell>
                      <TableCell className="text-right">{formatNumber(previousSnapshot.totalOrgs)}</TableCell>
                      <TableCell className="text-right">{formatNumber(snapshot.totalOrgs)}</TableCell>
                      <TableCell className={`text-right ${deltas && deltas.totalOrgs >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {deltas ? `${deltas.totalOrgs >= 0 ? "+" : ""}${formatNumber(deltas.totalOrgs)}` : "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t("comparison.activeOrganizations")}</TableCell>
                      <TableCell className="text-right">{formatNumber(previousSnapshot.activeOrgs)}</TableCell>
                      <TableCell className="text-right">{formatNumber(snapshot.activeOrgs)}</TableCell>
                      <TableCell className={`text-right ${deltas && deltas.activeOrgs >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {deltas ? `${deltas.activeOrgs >= 0 ? "+" : ""}${formatNumber(deltas.activeOrgs)}` : "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t("comparison.totalUsers")}</TableCell>
                      <TableCell className="text-right">{formatNumber(previousSnapshot.totalUsers)}</TableCell>
                      <TableCell className="text-right">{formatNumber(snapshot.totalUsers)}</TableCell>
                      <TableCell className={`text-right ${deltas && deltas.totalUsers >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {deltas ? `${deltas.totalUsers >= 0 ? "+" : ""}${formatNumber(deltas.totalUsers)}` : "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t("comparison.activeUsers")}</TableCell>
                      <TableCell className="text-right">{formatNumber(previousSnapshot.activeUsers)}</TableCell>
                      <TableCell className="text-right">{formatNumber(snapshot.activeUsers)}</TableCell>
                      <TableCell className={`text-right ${deltas && deltas.activeUsers >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {deltas ? `${deltas.activeUsers >= 0 ? "+" : ""}${formatNumber(deltas.activeUsers)}` : "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t("comparison.mrr")}</TableCell>
                      <TableCell className="text-right">{formatCurrency(previousSnapshot.mrr)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(snapshot.mrr)}</TableCell>
                      <TableCell className={`text-right ${deltas && deltas.mrr >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {deltas ? `${deltas.mrr >= 0 ? "+" : ""}${formatCurrency(deltas.mrr)}` : "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t("comparison.arr")}</TableCell>
                      <TableCell className="text-right">{formatCurrency(previousSnapshot.arr)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(snapshot.arr)}</TableCell>
                      <TableCell className={`text-right ${deltas && deltas.arr >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {deltas ? `${deltas.arr >= 0 ? "+" : ""}${formatCurrency(deltas.arr)}` : "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t("comparison.agentRuns")}</TableCell>
                      <TableCell className="text-right">{formatNumber(previousSnapshot.totalAgentRuns)}</TableCell>
                      <TableCell className="text-right">{formatNumber(snapshot.totalAgentRuns)}</TableCell>
                      <TableCell className={`text-right ${deltas && deltas.totalAgentRuns >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {deltas ? `${deltas.totalAgentRuns >= 0 ? "+" : ""}${formatNumber(deltas.totalAgentRuns)}` : "-"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">{t("comparison.noPrevious")}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>{t("history.auditTitle")}</CardTitle>
              <CardDescription>{t("history.auditDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("history.action")}</TableHead>
                      <TableHead>{t("history.details")}</TableHead>
                      <TableHead>{t("history.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {JSON.stringify(log.details)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">{t("history.noAuditHistory")}</p>
              )}
            </CardContent>
          </Card>

          {/* Snapshot Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>{t("metadata.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("metadata.createdAt")}</span>
                  <span>{new Date(snapshot.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("metadata.periodStart")}</span>
                  <span>{new Date(snapshot.periodStart).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("metadata.periodEnd")}</span>
                  <span>{new Date(snapshot.periodEnd).toLocaleString()}</span>
                </div>
                {snapshot.metadata && (
                  <>
                    {(snapshot.metadata as Record<string, string>).triggeredBy && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("metadata.triggeredBy")}</span>
                        <span>{(snapshot.metadata as Record<string, string>).triggeredBy}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
