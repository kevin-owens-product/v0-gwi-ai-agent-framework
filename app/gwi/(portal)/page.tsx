import { Suspense } from "react"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardList,
  Tags,
  Workflow,
  Brain,
  Bot,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getTranslations } from "@/lib/i18n/server"

async function getOverviewStats() {
  const [
    surveysCount,
    activeSurveys,
    taxonomyCategoriesCount,
    pipelinesCount,
    activePipelines,
    llmConfigsCount,
    agentTemplatesCount,
    dataSourcesCount,
    recentErrors,
    recentPipelineRuns,
  ] = await Promise.all([
    prisma.survey.count(),
    prisma.survey.count({ where: { status: "ACTIVE" } }),
    prisma.taxonomyCategory.count(),
    prisma.dataPipeline.count(),
    prisma.dataPipeline.count({ where: { isActive: true } }),
    prisma.lLMConfiguration.count(),
    prisma.systemAgentTemplate.count(),
    prisma.gWIDataSourceConnection.count(),
    prisma.gWIErrorLog.count({
      where: {
        resolvedAt: null,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.pipelineRun.findMany({
      take: 5,
      orderBy: { startedAt: "desc" },
      include: { pipeline: { select: { name: true } } },
    }),
  ])

  return {
    surveysCount,
    activeSurveys,
    taxonomyCategoriesCount,
    pipelinesCount,
    activePipelines,
    llmConfigsCount,
    agentTemplatesCount,
    dataSourcesCount,
    recentErrors,
    recentPipelineRuns,
  }
}

function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  href,
  trend,
}: {
  title: string
  value: number
  subValue?: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  trend?: "up" | "down" | "neutral"
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {subValue && (
              <p className="text-xs text-muted-foreground">{subValue}</p>
            )}
          </div>
          {trend && (
            <TrendingUp
              className={`h-4 w-4 ${
                trend === "up"
                  ? "text-green-500"
                  : trend === "down"
                  ? "text-red-500 rotate-180"
                  : "text-gray-400"
              }`}
            />
          )}
        </div>
        <Link
          href={href}
          className="text-xs text-emerald-600 hover:text-emerald-700 mt-2 inline-flex items-center"
        >
          View details <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </CardContent>
    </Card>
  )
}

function PipelineRunStatus({ status }: { status: string }) {
  const statusConfig = {
    COMPLETED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    RUNNING: { color: "bg-blue-100 text-blue-800", icon: Activity },
    PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    FAILED: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
    CANCELLED: { color: "bg-gray-100 text-gray-800", icon: Clock },
  }
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
  const Icon = config.icon

  return (
    <Badge className={`${config.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  )
}

async function DashboardContent() {
  const stats = await getOverviewStats()
  const t = await getTranslations('gwi')

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('dashboard.description')}
        </p>
      </div>

      {/* Alert Banner */}
      {stats.recentErrors > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">
                  {t('dashboard.unresolvedErrors', { count: stats.recentErrors })}
                </p>
                <p className="text-sm text-red-600">{t('dashboard.reviewErrors')}</p>
              </div>
            </div>
            <Button asChild variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              <Link href="/gwi/monitoring/errors">{t('dashboard.viewErrors')}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('stats.surveys')}
          value={stats.surveysCount}
          subValue={t('stats.active', { count: stats.activeSurveys })}
          icon={ClipboardList}
          href="/gwi/surveys"
          trend="up"
        />
        <StatCard
          title={t('stats.taxonomyCategories')}
          value={stats.taxonomyCategoriesCount}
          icon={Tags}
          href="/gwi/taxonomy"
        />
        <StatCard
          title={t('stats.dataPipelines')}
          value={stats.pipelinesCount}
          subValue={t('stats.active', { count: stats.activePipelines })}
          icon={Workflow}
          href="/gwi/pipelines"
          trend="neutral"
        />
        <StatCard
          title={t('stats.llmConfigurations')}
          value={stats.llmConfigsCount}
          icon={Brain}
          href="/gwi/llm"
        />
        <StatCard
          title={t('stats.agentTemplates')}
          value={stats.agentTemplatesCount}
          icon={Bot}
          href="/gwi/agents"
        />
        <StatCard
          title={t('stats.dataSources')}
          value={stats.dataSourcesCount}
          icon={Database}
          href="/gwi/data-sources"
        />
      </div>

      {/* Recent Pipeline Runs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('pipelineRuns.title')}</CardTitle>
            <CardDescription>{t('pipelineRuns.description')}</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/gwi/pipelines/runs">{t('pipelineRuns.viewAll')}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats.recentPipelineRuns.length > 0 ? (
            <div className="space-y-4">
              {stats.recentPipelineRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <Workflow className="h-8 w-8 text-muted-foreground p-1.5 bg-slate-100 rounded" />
                    <div>
                      <p className="font-medium">{run.pipeline.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('pipelineRuns.started', { date: new Date(run.startedAt).toLocaleString() })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {run.recordsProcessed !== null && (
                      <span className="text-sm text-muted-foreground">
                        {t('pipelineRuns.records', { count: run.recordsProcessed.toLocaleString() })}
                      </span>
                    )}
                    <PipelineRunStatus status={run.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('pipelineRuns.noPipelines')}</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/gwi/pipelines">{t('pipelineRuns.createFirst')}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/gwi/surveys/new">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{t('quickActions.createSurvey')}</h3>
                  <p className="text-sm text-muted-foreground">{t('quickActions.createSurveyDesc')}</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/gwi/pipelines/new">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Workflow className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{t('quickActions.newPipeline')}</h3>
                  <p className="text-sm text-muted-foreground">{t('quickActions.newPipelineDesc')}</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/gwi/llm/testing">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{t('quickActions.testPrompts')}</h3>
                  <p className="text-sm text-muted-foreground">{t('quickActions.testPromptsDesc')}</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}

export default async function GWIDashboardPage() {
  const t = await getTranslations('gwi')

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('dashboard.loading')}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-0 pb-2">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-slate-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
