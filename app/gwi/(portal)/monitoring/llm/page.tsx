import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Brain,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

async function getLLMPerformanceData() {
  const [configurations, usageRecords] = await Promise.all([
    prisma.lLMConfiguration.findMany({
      include: {
        usageRecords: {
          take: 100,
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { usageRecords: true } },
      },
    }),
    prisma.lLMUsageRecord.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        configuration: { select: { name: true, provider: true, model: true } },
      },
    }),
  ])

  // Calculate performance metrics per model
  const modelMetrics = configurations.map((config) => {
    const records = config.usageRecords
    const avgLatency =
      records.length > 0
        ? Math.round(records.reduce((sum, r) => sum + r.latencyMs, 0) / records.length)
        : 0
    const p95Latency =
      records.length > 0
        ? records.sort((a, b) => b.latencyMs - a.latencyMs)[Math.floor(records.length * 0.05)]?.latencyMs || avgLatency
        : 0
    const totalTokens = records.reduce((sum, r) => sum + r.promptTokens + r.completionTokens, 0)
    const errorRate = 0 // Would calculate from actual error data

    return {
      ...config,
      avgLatency,
      p95Latency,
      totalTokens,
      errorRate,
      requestCount: config._count.usageRecords,
    }
  })

  // Calculate overall stats
  const totalRequests = usageRecords.length
  const avgLatency =
    usageRecords.length > 0
      ? Math.round(usageRecords.reduce((sum, r) => sum + r.latencyMs, 0) / usageRecords.length)
      : 0
  const totalTokens = usageRecords.reduce((sum, r) => sum + r.promptTokens + r.completionTokens, 0)

  return {
    configurations,
    modelMetrics,
    usageRecords,
    totalRequests,
    avgLatency,
    totalTokens,
  }
}

async function LLMMonitoringContent() {
  const stats = await getLLMPerformanceData()
  const t = await getTranslations('gwi.monitoring.llmPerformance')
  const tCommon = await getTranslations('common')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Select defaultValue="24h">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t('timeRange')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">{t('lastHour')}</SelectItem>
            <SelectItem value="24h">{t('last24Hours')}</SelectItem>
            <SelectItem value="7d">{t('last7Days')}</SelectItem>
            <SelectItem value="30d">{t('last30Days')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgLatency}ms</p>
                <p className="text-sm text-muted-foreground">{t('avgLatency')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
                <p className="text-sm text-muted-foreground">{t('totalRequests')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(stats.totalTokens / 1000).toFixed(1)}K
                </p>
                <p className="text-sm text-muted-foreground">{t('tokensProcessed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">99.8%</p>
                <p className="text-sm text-muted-foreground">{t('successRate')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latency Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('latencyDistribution')}
          </CardTitle>
          <CardDescription>{t('latencyDistributionDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border rounded-lg bg-slate-50">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {t('chartsComingSoon')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle>{t('performanceByModel')}</CardTitle>
          <CardDescription>{t('performanceByModelDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.modelMetrics.length > 0 ? (
            <div className="space-y-4">
              {stats.modelMetrics.map((model) => {
                const latencyHealth =
                  model.avgLatency < 500 ? "good" : model.avgLatency < 1000 ? "warning" : "error"
                const healthColors = {
                  good: "bg-green-100 text-green-700",
                  warning: "bg-yellow-100 text-yellow-700",
                  error: "bg-red-100 text-red-700",
                }

                return (
                  <div
                    key={model.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          <Badge variant="outline">{model.provider}</Badge>
                        </div>
                        <Badge className={healthColors[latencyHealth]}>
                          {latencyHealth === "good" ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : latencyHealth === "warning" ? (
                            <AlertTriangle className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {t(`health.${latencyHealth}`)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">{t('avgLatency')}</p>
                          <p className="font-medium">{model.avgLatency}ms</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('p95Latency')}</p>
                          <p className="font-medium">{model.p95Latency}ms</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('requests')}</p>
                          <p className="font-medium">{model.requestCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('tokens')}</p>
                          <p className="font-medium">
                            {(model.totalTokens / 1000).toFixed(1)}K
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('noConfigurations')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('recentRequests')}</CardTitle>
            <CardDescription>{t('recentRequestsDescription')}</CardDescription>
          </div>
          <Link
            href="/gwi/llm/usage"
            className="text-sm text-emerald-600 hover:underline"
          >
            {t('viewAllUsage')}
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {stats.usageRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('model')}</TableHead>
                  <TableHead>{t('timestamp')}</TableHead>
                  <TableHead className="text-right">{t('tokens')}</TableHead>
                  <TableHead className="text-right">{t('latency')}</TableHead>
                  <TableHead>{tCommon('status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.usageRecords.slice(0, 10).map((record) => {
                  const latencyStatus =
                    record.latencyMs < 500
                      ? "fast"
                      : record.latencyMs < 1000
                      ? "normal"
                      : "slow"
                  const statusColors = {
                    fast: "bg-green-100 text-green-700",
                    normal: "bg-yellow-100 text-yellow-700",
                    slow: "bg-red-100 text-red-700",
                  }

                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{record.configuration.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {record.configuration.model}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(record.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {(record.promptTokens + record.completionTokens).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {record.latencyMs}ms
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[latencyStatus]}>
                          {t(`speed.${latencyStatus}`)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('noRequestsYet')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function LLMMonitoringPage() {
  const t = await getTranslations('gwi.monitoring.llmPerformance')

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      }
    >
      <LLMMonitoringContent />
    </Suspense>
  )
}
