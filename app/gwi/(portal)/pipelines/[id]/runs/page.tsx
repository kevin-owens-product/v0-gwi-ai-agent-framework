import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  Play,
  BarChart3,
} from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

const statusConfig = {
  PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  RUNNING: { color: "bg-blue-100 text-blue-700", icon: Loader2 },
  COMPLETED: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  FAILED: { color: "bg-red-100 text-red-700", icon: XCircle },
  CANCELLED: { color: "bg-gray-100 text-gray-700", icon: XCircle },
}

async function getPipelineWithRuns(id: string) {
  const pipeline = await prisma.dataPipeline.findUnique({
    where: { id },
    include: {
      runs: {
        orderBy: { startedAt: "desc" },
        take: 100,
      },
      _count: {
        select: { runs: true },
      },
    },
  })

  if (!pipeline) {
    return null
  }

  // Calculate stats
  const stats = await prisma.pipelineRun.aggregate({
    where: { pipelineId: id },
    _count: { _all: true },
  })

  const successfulRuns = await prisma.pipelineRun.count({
    where: { pipelineId: id, status: "COMPLETED" },
  })

  const failedRuns = await prisma.pipelineRun.count({
    where: { pipelineId: id, status: "FAILED" },
  })

  const totalRecordsProcessed = await prisma.pipelineRun.aggregate({
    where: { pipelineId: id, status: "COMPLETED" },
    _sum: { recordsProcessed: true },
  })

  return {
    pipeline,
    stats: {
      totalRuns: stats._count._all,
      successfulRuns,
      failedRuns,
      successRate: stats._count._all > 0 ? Math.round((successfulRuns / stats._count._all) * 100) : 0,
      totalRecordsProcessed: totalRecordsProcessed._sum.recordsProcessed || 0,
    },
  }
}

async function PipelineRunsContent({ id }: { id: string }) {
  const data = await getPipelineWithRuns(id)

  if (!data) {
    notFound()
  }

  const { pipeline, stats } = data
  const t = await getTranslations('gwi.pipelines.runsPage')
  const tRuns = await getTranslations('gwi.pipelines.runs')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/gwi/pipelines/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('title', { name: pipeline.name })}
            </h1>
            <p className="text-muted-foreground">
              {t('description')}
            </p>
          </div>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Play className="mr-2 h-4 w-4" />
          {t('triggerRun')}
        </Button>
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
                <p className="text-sm text-muted-foreground">{t('failed')}</p>
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
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="PENDING">{tRuns('statuses.pending')}</SelectItem>
                <SelectItem value="RUNNING">{tRuns('statuses.running')}</SelectItem>
                <SelectItem value="COMPLETED">{tRuns('statuses.completed')}</SelectItem>
                <SelectItem value="FAILED">{tRuns('statuses.failed')}</SelectItem>
                <SelectItem value="CANCELLED">{tRuns('statuses.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('runHistory')}</CardTitle>
          <CardDescription>
            {t('totalRecordsProcessed', { count: stats.totalRecordsProcessed.toLocaleString() })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {pipeline.runs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('runId')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('started')}</TableHead>
                  <TableHead>{t('completed')}</TableHead>
                  <TableHead>{t('records')}</TableHead>
                  <TableHead>{t('duration')}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pipeline.runs.map((run) => {
                  const config = statusConfig[run.status as keyof typeof statusConfig]
                  const Icon = config?.icon || Clock
                  const duration =
                    run.completedAt && run.startedAt
                      ? Math.round(
                          (new Date(run.completedAt).getTime() -
                            new Date(run.startedAt).getTime()) /
                            1000
                        )
                      : null

                  return (
                    <TableRow key={run.id}>
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {run.id.slice(0, 12)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${config?.color} gap-1`}>
                          <Icon
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
                        {run.completedAt
                          ? new Date(run.completedAt).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {run.recordsProcessed !== null ? (
                          <div>
                            <span className="text-green-600">
                              {run.recordsProcessed.toLocaleString()}
                            </span>
                            {run.recordsFailed !== null && run.recordsFailed > 0 && (
                              <span className="text-red-600 ml-2">
                                ({t('failedCount', { count: run.recordsFailed })})
                              </span>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {duration !== null ? (
                          <span>
                            {duration >= 60
                              ? `${Math.floor(duration / 60)}m ${duration % 60}s`
                              : `${duration}s`}
                          </span>
                        ) : run.status === "RUNNING" ? (
                          <span className="text-blue-600">{t('running')}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/gwi/pipelines/${id}/runs/${run.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('noPipelineRuns')}</h3>
              <p className="text-muted-foreground">
                {t('clickTriggerRun')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function PipelineRunsPage({
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
      <PipelineRunsContent id={id} />
    </Suspense>
  )
}
