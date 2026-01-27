import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingText } from "@/components/ui/loading-text"
import { EmptyState } from "@/components/ui/empty-state"
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
import { ArrowLeft, Activity, CheckCircle, XCircle, Clock, Loader2, Eye } from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

const statusConfig = {
  PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  RUNNING: { color: "bg-blue-100 text-blue-700", icon: Loader2 },
  COMPLETED: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  FAILED: { color: "bg-red-100 text-red-700", icon: XCircle },
  CANCELLED: { color: "bg-gray-100 text-gray-700", icon: XCircle },
}

async function getPipelineRuns() {
  const runs = await prisma.pipelineRun.findMany({
    include: {
      pipeline: { select: { id: true, name: true, type: true } },
    },
    orderBy: { startedAt: "desc" },
    take: 100,
  })

  const pipelines = await prisma.dataPipeline.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return { runs, pipelines }
}

async function PipelineRunsContent() {
  const { runs, pipelines } = await getPipelineRuns()
  const t = await getTranslations('gwi.pipelines.runs')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/gwi/pipelines">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder={t('filterByPipeline')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allPipelines')}</SelectItem>
                {pipelines.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="PENDING">{t('statuses.pending')}</SelectItem>
                <SelectItem value="RUNNING">{t('statuses.running')}</SelectItem>
                <SelectItem value="COMPLETED">{t('statuses.completed')}</SelectItem>
                <SelectItem value="FAILED">{t('statuses.failed')}</SelectItem>
                <SelectItem value="CANCELLED">{t('statuses.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Runs Table */}
      <Card>
        <CardContent className="p-0">
          {runs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pipeline')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('started')}</TableHead>
                  <TableHead>{t('completed')}</TableHead>
                  <TableHead>{t('records')}</TableHead>
                  <TableHead>{t('duration')}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => {
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
                        <Link
                          href={`/gwi/pipelines/${run.pipeline.id}`}
                          className="font-medium hover:text-emerald-600"
                        >
                          {run.pipeline.name}
                        </Link>
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
                                ({run.recordsFailed} {t('failed')})
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
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={Activity}
              title={t('noRunsYet')}
              description={t('runsWillAppear')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function PipelineRunsPage() {
  const t = await getTranslations('gwi.pipelines.runs')

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <LoadingText />
          </div>
        </div>
      }
    >
      <PipelineRunsContent />
    </Suspense>
  )
}
