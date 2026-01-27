import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Workflow,
  BarChart3,
  Zap,
  RefreshCw,
} from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

async function getPipelineHealthData() {
  const [pipelines, recentRuns] = await Promise.all([
    prisma.dataPipeline.findMany({
      include: {
        runs: {
          take: 10,
          orderBy: { startedAt: "desc" },
        },
        _count: {
          select: { runs: true },
        },
      },
    }),
    prisma.pipelineRun.findMany({
      take: 20,
      orderBy: { startedAt: "desc" },
      include: {
        pipeline: { select: { name: true, type: true } },
      },
    }),
  ])

  // Calculate stats
  const totalRuns = recentRuns.length
  const completedRuns = recentRuns.filter((r) => r.status === "COMPLETED").length
  const failedRuns = recentRuns.filter((r) => r.status === "FAILED").length
  const successRate = totalRuns > 0 ? (completedRuns / totalRuns) * 100 : 0

  // Calculate average duration
  const completedWithDuration = recentRuns.filter(
    (r) => r.status === "COMPLETED" && r.completedAt
  )
  const avgDuration =
    completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, r) => {
          const duration = new Date(r.completedAt!).getTime() - new Date(r.startedAt).getTime()
          return sum + duration
        }, 0) / completedWithDuration.length
      : 0

  return {
    pipelines,
    recentRuns,
    totalRuns,
    completedRuns,
    failedRuns,
    successRate,
    avgDuration: Math.round(avgDuration / 1000), // in seconds
  }
}

const runStatusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
  COMPLETED: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  RUNNING: { color: "bg-blue-100 text-blue-700", icon: RefreshCw },
  PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  FAILED: { color: "bg-red-100 text-red-700", icon: XCircle },
  CANCELLED: { color: "bg-slate-100 text-slate-700", icon: XCircle },
}

async function PipelineHealthContent() {
  const stats = await getPipelineHealthData()
  const t = await getTranslations('gwi.monitoring.pipelineHealth')
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

      {/* Health Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">{t('successRate')}</p>
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
                <p className="text-2xl font-bold">{stats.totalRuns}</p>
                <p className="text-sm text-muted-foreground">{t('totalRuns')}</p>
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
                <p className="text-sm text-muted-foreground">{t('failedRuns')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgDuration}s</p>
                <p className="text-sm text-muted-foreground">{t('avgDuration')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('pipelinePerformance')}
          </CardTitle>
          <CardDescription>{t('performanceChartDescription')}</CardDescription>
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

      {/* Pipeline Health by Type */}
      <Card>
        <CardHeader>
          <CardTitle>{t('healthByPipeline')}</CardTitle>
          <CardDescription>{t('healthByPipelineDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.pipelines.length > 0 ? (
            <div className="space-y-4">
              {stats.pipelines.map((pipeline) => {
                const runs = pipeline.runs
                const completed = runs.filter((r) => r.status === "COMPLETED").length
                const failed = runs.filter((r) => r.status === "FAILED").length
                const rate = runs.length > 0 ? (completed / runs.length) * 100 : 100
                const lastRun = runs[0]

                return (
                  <div
                    key={pipeline.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Workflow className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/gwi/pipelines/${pipeline.id}`}
                            className="font-medium hover:text-emerald-600"
                          >
                            {pipeline.name}
                          </Link>
                          <Badge variant="outline">{pipeline.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-600">{completed} {t('passed')}</span>
                          <span className="text-red-600">{failed} {t('failed')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={rate} className="flex-1 h-2" />
                        <span className="text-sm font-medium w-16 text-right">
                          {rate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    {lastRun && (
                      <Badge className={runStatusConfig[lastRun.status]?.color || "bg-slate-100"}>
                        {lastRun.status}
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('noPipelines')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Runs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('recentRuns')}</CardTitle>
            <CardDescription>{t('recentRunsDescription')}</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/gwi/pipelines/runs">{tCommon('viewAll')}</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {stats.recentRuns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pipeline')}</TableHead>
                  <TableHead>{tCommon('status')}</TableHead>
                  <TableHead>{t('started')}</TableHead>
                  <TableHead>{t('duration')}</TableHead>
                  <TableHead>{t('records')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentRuns.slice(0, 10).map((run) => {
                  const statusConfig = runStatusConfig[run.status] || runStatusConfig.PENDING
                  const StatusIcon = statusConfig.icon
                  const duration = run.completedAt
                    ? Math.round(
                        (new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000
                      )
                    : null

                  return (
                    <TableRow key={run.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Workflow className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{run.pipeline.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig.color} gap-1`}>
                          <StatusIcon
                            className={`h-3 w-3 ${
                              run.status === "RUNNING" ? "animate-spin" : ""
                            }`}
                          />
                          {run.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(run.startedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {duration !== null ? `${duration}s` : "-"}
                      </TableCell>
                      <TableCell>
                        {run.recordsProcessed !== null
                          ? run.recordsProcessed.toLocaleString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('noRunsYet')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function PipelineHealthPage() {
  const t = await getTranslations('gwi.monitoring.pipelineHealth')

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
      <PipelineHealthContent />
    </Suspense>
  )
}
