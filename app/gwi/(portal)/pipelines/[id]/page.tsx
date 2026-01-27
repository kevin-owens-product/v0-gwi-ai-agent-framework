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
  Play,
  Pause,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Workflow,
  BarChart3,
} from "lucide-react"
import { PipelineEditor } from "@/components/gwi/pipelines/pipeline-editor"
import { getTranslations } from "@/lib/i18n/server"

const pipelineTypeColors: Record<string, string> = {
  ETL: "bg-blue-100 text-blue-700",
  TRANSFORMATION: "bg-purple-100 text-purple-700",
  AGGREGATION: "bg-orange-100 text-orange-700",
  EXPORT: "bg-green-100 text-green-700",
  SYNC: "bg-cyan-100 text-cyan-700",
}

const runStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  RUNNING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
}

async function getPipeline(id: string) {
  const pipeline = await prisma.dataPipeline.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, email: true } },
      runs: {
        take: 10,
        orderBy: { startedAt: "desc" },
      },
      validationRules: true,
      _count: {
        select: {
          runs: true,
          validationRules: true,
        },
      },
    },
  })

  return pipeline
}

async function getPipelineStats(id: string) {
  const [totalRuns, successfulRuns, failedRuns, totalRecordsProcessed] = await Promise.all([
    prisma.pipelineRun.count({ where: { pipelineId: id } }),
    prisma.pipelineRun.count({ where: { pipelineId: id, status: "COMPLETED" } }),
    prisma.pipelineRun.count({ where: { pipelineId: id, status: "FAILED" } }),
    prisma.pipelineRun.aggregate({
      where: { pipelineId: id, status: "COMPLETED" },
      _sum: { recordsProcessed: true },
    }),
  ])

  return {
    totalRuns,
    successfulRuns,
    failedRuns,
    successRate: totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0,
    totalRecordsProcessed: totalRecordsProcessed._sum.recordsProcessed || 0,
  }
}

async function PipelineDetail({ id }: { id: string }) {
  const pipeline = await getPipeline(id)

  if (!pipeline) {
    notFound()
  }

  const stats = await getPipelineStats(id)
  const t = await getTranslations('gwi.pipelines.detail')
  const tCommon = await getTranslations('common')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/gwi/pipelines">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{pipeline.name}</h1>
              <Badge className={pipelineTypeColors[pipeline.type]}>
                {pipeline.type}
              </Badge>
              <Badge variant={pipeline.isActive ? "default" : "secondary"}>
                {pipeline.isActive ? tCommon('active') : tCommon('inactive')}
              </Badge>
            </div>
            {pipeline.description && (
              <p className="text-muted-foreground mt-1">{pipeline.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pipeline.isActive ? (
            <Button variant="outline" className="text-yellow-600 border-yellow-300">
              <Pause className="mr-2 h-4 w-4" />
              {t('pausePipeline')}
            </Button>
          ) : (
            <Button variant="outline" className="text-green-600 border-green-300">
              <Play className="mr-2 h-4 w-4" />
              {t('activatePipeline')}
            </Button>
          )}
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Play className="mr-2 h-4 w-4" />
            {t('runNow')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRuns}</p>
                <p className="text-sm text-muted-foreground">{t('totalRuns')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.successfulRuns}</p>
                <p className="text-sm text-muted-foreground">{t('successful')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.failedRuns}</p>
                <p className="text-sm text-muted-foreground">{tCommon('failed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
                <p className="text-sm text-muted-foreground">{t('successRate')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Workflow className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRecordsProcessed.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t('recordsProcessed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="runs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="runs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {t('recentRuns')}
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t('validationRules')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="runs">
          <Card>
            <CardHeader>
              <CardTitle>{t('recentPipelineRuns')}</CardTitle>
              <CardDescription>
                {t('recentPipelineRunsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pipeline.runs.length > 0 ? (
                <div className="space-y-4">
                  {pipeline.runs.map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between border p-4 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {run.status === "COMPLETED" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : run.status === "FAILED" ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : run.status === "RUNNING" ? (
                          <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {new Date(run.startedAt).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {run.recordsProcessed !== null
                              ? t('recordsProcessedCount', { count: run.recordsProcessed })
                              : t('noRecordsProcessed')}
                            {run.recordsFailed && run.recordsFailed > 0
                              ? ` (${t('failedCount', { count: run.recordsFailed })})`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={runStatusColors[run.status]}>
                          {run.status}
                        </Badge>
                        {run.completedAt && (
                          <span className="text-sm text-muted-foreground">
                            {t('duration')}:{" "}
                            {Math.round(
                              (new Date(run.completedAt).getTime() -
                                new Date(run.startedAt).getTime()) /
                                1000
                            )}
                            s
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/gwi/pipelines/${pipeline.id}/runs`}>
                      {t('viewAllRuns')}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{t('noRunsYet')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('clickRunNow')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>{t('validationRules')}</CardTitle>
              <CardDescription>
                {t('validationRulesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pipeline.validationRules.length > 0 ? (
                <div className="space-y-4">
                  {pipeline.validationRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between border p-4 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(rule as { description?: string }).description || t('noDescription')}
                        </p>
                      </div>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? tCommon('active') : tCommon('inactive')}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    {t('addValidationRule')}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{t('noValidationRules')}</p>
                  <Button className="mt-4">{t('addValidationRule')}</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <PipelineEditor
            pipeline={{
              id: pipeline.id,
              name: pipeline.name,
              description: pipeline.description,
              type: pipeline.type,
              configuration: pipeline.configuration as Record<string, unknown>,
              schedule: pipeline.schedule,
              isActive: pipeline.isActive,
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('pipelineInformation')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">{t('schedule')}</dt>
              <dd className="font-medium">
                {pipeline.schedule ? (
                  <code className="px-2 py-1 bg-slate-100 rounded text-xs">
                    {pipeline.schedule}
                  </code>
                ) : (
                  t('manual')
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('createdBy')}</dt>
              <dd className="font-medium">{pipeline.createdBy.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('createdAt')}</dt>
              <dd className="font-medium">
                {new Date(pipeline.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('lastUpdated')}</dt>
              <dd className="font-medium">
                {new Date(pipeline.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function PipelineDetailPage({
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
          <div className="grid gap-4 md:grid-cols-5">
            {[...Array(5)].map((_, i) => (
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
      <PipelineDetail id={id} />
    </Suspense>
  )
}
