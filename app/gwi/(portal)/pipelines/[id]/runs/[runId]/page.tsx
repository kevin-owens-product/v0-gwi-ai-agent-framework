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
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  BarChart3,
  Timer,
  Database,
  StopCircle,
  FileText,
} from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

function getStatusConfig(tRuns: (key: string) => string) {
  return {
    PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock, text: tRuns('statuses.pending') },
    RUNNING: { color: "bg-blue-100 text-blue-700", icon: Loader2, text: tRuns('statuses.running') },
    COMPLETED: { color: "bg-green-100 text-green-700", icon: CheckCircle, text: tRuns('statuses.completed') },
    FAILED: { color: "bg-red-100 text-red-700", icon: XCircle, text: tRuns('statuses.failed') },
    CANCELLED: { color: "bg-gray-100 text-gray-700", icon: XCircle, text: tRuns('statuses.cancelled') },
  }
}

async function getPipelineRun(pipelineId: string, runId: string) {
  const run = await prisma.pipelineRun.findUnique({
    where: { id: runId },
    include: {
      pipeline: {
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
        },
      },
    },
  })

  if (!run || run.pipelineId !== pipelineId) {
    return null
  }

  return run
}

function formatDuration(startedAt: Date, completedAt: Date | null): string {
  if (!completedAt) {
    const seconds = Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  const seconds = Math.round(
    (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000
  )
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

interface ErrorLogEntry {
  timestamp?: string
  level?: string
  message: string
  details?: string
}

interface MetricsData {
  throughput?: number
  avgProcessingTime?: number
  memoryUsage?: number
  cpuUsage?: number
  [key: string]: unknown
}

async function PipelineRunDetailContent({
  pipelineId,
  runId,
}: {
  pipelineId: string
  runId: string
}) {
  const run = await getPipelineRun(pipelineId, runId)

  if (!run) {
    notFound()
  }

  const t = await getTranslations('gwi.pipelines.runDetail')
  const tRuns = await getTranslations('gwi.pipelines.runs')
  const statusConfig = getStatusConfig(tRuns)

  const config = statusConfig[run.status as keyof typeof statusConfig]
  const StatusIcon = config?.icon || Clock
  const duration = formatDuration(run.startedAt, run.completedAt)
  const errorLog = run.errorLog as ErrorLogEntry[] | null
  const metrics = run.metrics as MetricsData | null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/gwi/pipelines/${pipelineId}/runs`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
              <Badge className={config?.color}>
                <StatusIcon
                  className={`mr-1 h-3 w-3 ${
                    run.status === "RUNNING" ? "animate-spin" : ""
                  }`}
                />
                {config?.text}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {run.pipeline.name} - {t('runIdLabel')} {run.id}
            </p>
          </div>
        </div>
        {(run.status === "PENDING" || run.status === "RUNNING") && (
          <Button variant="destructive">
            <StopCircle className="mr-2 h-4 w-4" />
            {t('cancelRun')}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{duration}</p>
                <p className="text-sm text-muted-foreground">{t('duration')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {run.recordsProcessed !== null
                    ? run.recordsProcessed.toLocaleString()
                    : "-"}
                </p>
                <p className="text-sm text-muted-foreground">{t('recordsProcessed')}</p>
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
                <p className="text-2xl font-bold">
                  {run.recordsFailed !== null ? run.recordsFailed.toLocaleString() : "0"}
                </p>
                <p className="text-sm text-muted-foreground">{t('recordsFailed')}</p>
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
                <p className="text-2xl font-bold">
                  {run.recordsProcessed !== null && run.recordsProcessed > 0
                    ? `${Math.round(
                        ((run.recordsProcessed - (run.recordsFailed || 0)) /
                          run.recordsProcessed) *
                          100
                      )}%`
                    : "-"}
                </p>
                <p className="text-sm text-muted-foreground">{t('successRate')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('details')}
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {t('logs')}
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('metrics')}
          </TabsTrigger>
          {errorLog && errorLog.length > 0 && (
            <TabsTrigger value="errors" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t('errorsCount', { count: errorLog.length })}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>{t('runDetails')}</CardTitle>
              <CardDescription>{t('runDetailsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t('runIdField')}</dt>
                  <dd className="mt-1 font-mono text-sm bg-slate-100 px-3 py-2 rounded">
                    {run.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t('pipeline')}</dt>
                  <dd className="mt-1">
                    <Link
                      href={`/gwi/pipelines/${pipelineId}`}
                      className="text-emerald-600 hover:underline"
                    >
                      {run.pipeline.name}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t('pipelineType')}</dt>
                  <dd className="mt-1">
                    <Badge variant="outline">{run.pipeline.type}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t('status')}</dt>
                  <dd className="mt-1">
                    <Badge className={config?.color}>
                      <StatusIcon
                        className={`mr-1 h-3 w-3 ${
                          run.status === "RUNNING" ? "animate-spin" : ""
                        }`}
                      />
                      {config?.text}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t('startedAt')}</dt>
                  <dd className="mt-1">{new Date(run.startedAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Completed At</dt>
                  <dd className="mt-1">
                    {run.completedAt
                      ? new Date(run.completedAt).toLocaleString()
                      : t('inProgress')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t('duration')}</dt>
                  <dd className="mt-1">{duration}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t('recordsField')}</dt>
                  <dd className="mt-1">
                    {run.recordsProcessed !== null ? (
                      <span>
                        <span className="text-green-600">
                          {run.recordsProcessed.toLocaleString()} {t('processed')}
                        </span>
                        {run.recordsFailed !== null && run.recordsFailed > 0 && (
                          <span className="text-red-600 ml-2">
                            / {run.recordsFailed.toLocaleString()} {tRuns('failed')}
                          </span>
                        )}
                      </span>
                    ) : (
                      t('noRecordsProcessed')
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>{t('runLogs')}</CardTitle>
              <CardDescription>{t('runLogsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm max-h-96 overflow-auto">
                <div className="text-slate-400">
                  [{new Date(run.startedAt).toISOString()}] {t('pipelineRunStarted')}
                </div>
                <div className="text-slate-400">
                  [{new Date(run.startedAt).toISOString()}] {t('initializingPipeline', { name: run.pipeline.name })}
                </div>
                <div className="text-slate-400">
                  [{new Date(run.startedAt).toISOString()}] {t('pipelineTypeLog', { type: run.pipeline.type })}
                </div>
                {run.recordsProcessed !== null && (
                  <div className="text-green-400">
                    [{run.completedAt ? new Date(run.completedAt).toISOString() : "..."}]{" "}
                    {t('processedRecords', { count: run.recordsProcessed.toLocaleString() })}
                  </div>
                )}
                {run.recordsFailed !== null && run.recordsFailed > 0 && (
                  <div className="text-yellow-400">
                    [{run.completedAt ? new Date(run.completedAt).toISOString() : "..."}]{" "}
                    {t('warningFailedRecords', { count: run.recordsFailed.toLocaleString() })}
                  </div>
                )}
                {run.status === "COMPLETED" && (
                  <div className="text-green-400">
                    [{run.completedAt ? new Date(run.completedAt).toISOString() : "..."}]{" "}
                    {t('pipelineRunCompletedSuccessfully')}
                  </div>
                )}
                {run.status === "FAILED" && (
                  <div className="text-red-400">
                    [{run.completedAt ? new Date(run.completedAt).toISOString() : "..."}]{" "}
                    {t('pipelineRunFailed')}
                  </div>
                )}
                {run.status === "CANCELLED" && (
                  <div className="text-gray-400">
                    [{run.completedAt ? new Date(run.completedAt).toISOString() : "..."}]{" "}
                    {t('pipelineRunCancelled')}
                  </div>
                )}
                {run.status === "RUNNING" && (
                  <div className="text-blue-400 animate-pulse">[...] {t('pipelineIsRunning')}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>{t('performanceMetrics')}</CardTitle>
              <CardDescription>{t('performanceMetricsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {metrics.throughput !== undefined && (
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">{t('throughput')}</p>
                      <p className="text-2xl font-bold">{metrics.throughput} {t('recPerSecond')}</p>
                    </div>
                  )}
                  {metrics.avgProcessingTime !== undefined && (
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">{t('avgProcessingTime')}</p>
                      <p className="text-2xl font-bold">{metrics.avgProcessingTime}ms</p>
                    </div>
                  )}
                  {metrics.memoryUsage !== undefined && (
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">{t('memoryUsage')}</p>
                      <p className="text-2xl font-bold">{metrics.memoryUsage}MB</p>
                    </div>
                  )}
                  {metrics.cpuUsage !== undefined && (
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">{t('cpuUsage')}</p>
                      <p className="text-2xl font-bold">{metrics.cpuUsage}%</p>
                    </div>
                  )}
                  {Object.entries(metrics)
                    .filter(
                      ([key]) =>
                        !["throughput", "avgProcessingTime", "memoryUsage", "cpuUsage"].includes(
                          key
                        )
                    )
                    .map(([key, value]) => (
                      <div key={key} className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">{key}</p>
                        <p className="text-2xl font-bold">{String(value)}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{t('noMetricsAvailable')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {errorLog && errorLog.length > 0 && (
          <TabsContent value="errors">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">{t('errorLog')}</CardTitle>
                <CardDescription>{t('errorLogDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {errorLog.map((error, index) => (
                    <div
                      key={index}
                      className="p-4 border border-red-200 bg-red-50 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {error.timestamp && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(error.timestamp).toLocaleString()}
                              </span>
                            )}
                            {error.level && (
                              <Badge variant="outline" className="text-red-600 border-red-300">
                                {error.level}
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-red-700 mt-1">{error.message}</p>
                          {error.details && (
                            <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                              {error.details}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('runInformation')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">{t('pipeline')}</dt>
              <dd className="font-medium">{run.pipeline.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('type')}</dt>
              <dd className="font-medium">{run.pipeline.type}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('startedAt')}</dt>
              <dd className="font-medium">
                {new Date(run.startedAt).toLocaleDateString()}{" "}
                {new Date(run.startedAt).toLocaleTimeString()}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('duration')}</dt>
              <dd className="font-medium">{duration}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function PipelineRunDetailPage({
  params,
}: {
  params: Promise<{ id: string; runId: string }>
}) {
  const { id, runId } = await params

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            </div>
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
      <PipelineRunDetailContent pipelineId={id} runId={runId} />
    </Suspense>
  )
}
