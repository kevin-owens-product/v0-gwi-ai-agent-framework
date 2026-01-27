import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Brain,
  Settings,
  BarChart3,
  Clock,
  DollarSign,
  Zap,
  Activity,
} from "lucide-react"
import { LLMConfigurationEditor } from "@/components/gwi/llm/llm-configuration-editor"
import { getTranslations } from "@/lib/i18n/server"

async function getLLMConfiguration(id: string) {
  const configuration = await prisma.lLMConfiguration.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          usageRecords: true,
        },
      },
    },
  })

  return configuration
}

async function getUsageStats(configurationId: string) {
  const [aggregateStats, recentUsage] = await Promise.all([
    prisma.lLMUsageRecord.aggregate({
      where: { configurationId },
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalCost: true,
      },
      _avg: {
        latencyMs: true,
      },
      _count: true,
    }),
    prisma.lLMUsageRecord.findMany({
      where: { configurationId },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ])

  return {
    totalRequests: aggregateStats._count,
    totalTokens:
      (aggregateStats._sum.promptTokens || 0) +
      (aggregateStats._sum.completionTokens || 0),
    promptTokens: aggregateStats._sum.promptTokens || 0,
    completionTokens: aggregateStats._sum.completionTokens || 0,
    totalCost: Number(aggregateStats._sum.totalCost || 0),
    avgLatency: Math.round(aggregateStats._avg.latencyMs || 0),
    recentUsage,
  }
}

async function LLMConfigurationDetail({ id }: { id: string }) {
  const configuration = await getLLMConfiguration(id)

  if (!configuration) {
    notFound()
  }

  const usageStats = await getUsageStats(id)
  const t = await getTranslations('gwi.llm.configurations')
  const tCommon = await getTranslations('common')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/gwi/llm">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {configuration.name}
              </h1>
              <Badge
                className={
                  configuration.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-700"
                }
              >
                {configuration.isActive ? tCommon('active') : tCommon('inactive')}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {configuration.provider} / {configuration.model}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {usageStats.totalRequests.toLocaleString()}
                </p>
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
                  {(usageStats.totalTokens / 1000).toFixed(1)}K
                </p>
                <p className="text-sm text-muted-foreground">{t('totalTokens')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${usageStats.totalCost.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">{t('totalCost')}</p>
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
                <p className="text-2xl font-bold">{usageStats.avgLatency}ms</p>
                <p className="text-sm text-muted-foreground">{t('avgLatency')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('settings')}
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('usageHistory')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <LLMConfigurationEditor
            configuration={{
              id: configuration.id,
              name: configuration.name,
              provider: configuration.provider,
              model: configuration.model,
              apiKeyRef: configuration.apiKeyRef,
              defaultParams: configuration.defaultParams as Record<string, unknown> | null,
              rateLimits: configuration.rateLimits as Record<string, unknown> | null,
              isActive: configuration.isActive,
              createdAt: configuration.createdAt.toISOString(),
              updatedAt: configuration.updatedAt.toISOString(),
            }}
          />
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>{t('usageHistory')}</CardTitle>
              <CardDescription>
                {t('usageHistoryDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usageStats.recentUsage.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                    <div>{t('timestamp')}</div>
                    <div>{t('promptTokens')}</div>
                    <div>{t('completionTokens')}</div>
                    <div>{t('latency')}</div>
                    <div>{t('cost')}</div>
                  </div>
                  {usageStats.recentUsage.map((usage) => (
                    <div
                      key={usage.id}
                      className="grid grid-cols-5 gap-4 text-sm py-2 border-b last:border-0"
                    >
                      <div className="text-muted-foreground">
                        {new Date(usage.createdAt).toLocaleString()}
                      </div>
                      <div>{usage.promptTokens.toLocaleString()}</div>
                      <div>{usage.completionTokens.toLocaleString()}</div>
                      <div>{usage.latencyMs}ms</div>
                      <div className="font-medium">
                        ${Number(usage.totalCost).toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{t('noUsageRecords')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('usageWillAppear')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Token Breakdown */}
          {usageStats.totalTokens > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{t('tokenBreakdown')}</CardTitle>
                <CardDescription>
                  {t('tokenBreakdownDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t('promptTokens')}
                    </span>
                    <span className="font-medium">
                      {usageStats.promptTokens.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${
                          (usageStats.promptTokens / usageStats.totalTokens) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t('completionTokens')}
                    </span>
                    <span className="font-medium">
                      {usageStats.completionTokens.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${
                          (usageStats.completionTokens / usageStats.totalTokens) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default async function LLMConfigurationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-200 rounded animate-pulse" />
            <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-16 bg-slate-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      }
    >
      <LLMConfigurationDetail id={id} />
    </Suspense>
  )
}
