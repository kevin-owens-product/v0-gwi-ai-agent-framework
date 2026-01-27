import { Suspense } from "react"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  DollarSign,
  Zap,
  Clock,
  TrendingUp,
  Brain,
  BarChart3,
  Activity,
} from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

async function getLLMUsageStats() {
  const [
    usageRecords,
    configurations,
    aggregateStats,
    recentUsage,
  ] = await Promise.all([
    prisma.lLMUsageRecord.count(),
    prisma.lLMConfiguration.findMany({
      include: {
        _count: { select: { usageRecords: true } },
        usageRecords: {
          select: {
            promptTokens: true,
            completionTokens: true,
            totalCost: true,
            latencyMs: true,
          },
        },
      },
    }),
    prisma.lLMUsageRecord.aggregate({
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalCost: true,
      },
      _avg: {
        latencyMs: true,
        promptTokens: true,
        completionTokens: true,
      },
    }),
    prisma.lLMUsageRecord.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        configuration: { select: { name: true, provider: true, model: true } },
      },
    }),
  ])

  // Calculate per-model stats
  const modelStats = configurations.map((config) => {
    const totalCost = config.usageRecords.reduce(
      (sum, r) => sum + Number(r.totalCost),
      0
    )
    const totalTokens = config.usageRecords.reduce(
      (sum, r) => sum + r.promptTokens + r.completionTokens,
      0
    )
    const avgLatency =
      config.usageRecords.length > 0
        ? Math.round(
            config.usageRecords.reduce((sum, r) => sum + r.latencyMs, 0) /
              config.usageRecords.length
          )
        : 0

    return {
      ...config,
      totalCost,
      totalTokens,
      avgLatency,
      requestCount: config._count.usageRecords,
    }
  })

  return {
    totalRequests: usageRecords,
    totalTokens:
      (aggregateStats._sum.promptTokens || 0) +
      (aggregateStats._sum.completionTokens || 0),
    totalCost: Number(aggregateStats._sum.totalCost || 0),
    avgLatency: Math.round(aggregateStats._avg.latencyMs || 0),
    modelStats,
    recentUsage,
  }
}

async function LLMUsageContent() {
  const stats = await getLLMUsageStats()
  const t = await getTranslations('gwi.llm.usage')

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
        <Select defaultValue="7d">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t('timeRange')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">{t('last24Hours')}</SelectItem>
            <SelectItem value="7d">{t('last7Days')}</SelectItem>
            <SelectItem value="30d">{t('last30Days')}</SelectItem>
            <SelectItem value="90d">{t('last90Days')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{t('totalCost')}</p>
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
                  {(stats.totalTokens / 1000000).toFixed(2)}M
                </p>
                <p className="text-sm text-muted-foreground">{t('totalTokens')}</p>
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
                <p className="text-2xl font-bold">
                  {stats.totalRequests.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">{t('totalRequests')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
      </div>

      {/* Usage Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('usageOverTime')}
          </CardTitle>
          <CardDescription>{t('usageOverTimeDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border rounded-lg bg-slate-50">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {t('usageChartsComingSoon')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t('usageByModel')}</CardTitle>
          <CardDescription>{t('usageByModelDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {stats.modelStats.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('model')}</TableHead>
                  <TableHead>{t('provider')}</TableHead>
                  <TableHead className="text-right">{t('requests')}</TableHead>
                  <TableHead className="text-right">{t('tokens')}</TableHead>
                  <TableHead className="text-right">{t('latency')}</TableHead>
                  <TableHead className="text-right">{t('cost')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.modelStats.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{model.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {model.model}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{model.provider}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {model.requestCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {(model.totalTokens / 1000).toFixed(1)}K
                    </TableCell>
                    <TableCell className="text-right">
                      {model.avgLatency}ms
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${model.totalCost.toFixed(4)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('noUsageData')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentRequests')}</CardTitle>
          <CardDescription>{t('recentRequestsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentUsage.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsage.map((usage) => (
                <div
                  key={usage.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {usage.configuration.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(usage.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="font-medium">
                        {(usage.promptTokens + usage.completionTokens).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{t('tokens')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{usage.latencyMs}ms</p>
                      <p className="text-xs text-muted-foreground">{t('latency')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-orange-600">
                        ${Number(usage.totalCost).toFixed(4)}
                      </p>
                      <p className="text-xs text-muted-foreground">{t('cost')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t('noRecentRequests')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function LLMUsagePage() {
  const t = await getTranslations('gwi.llm.usage')

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
      <LLMUsageContent />
    </Suspense>
  )
}
