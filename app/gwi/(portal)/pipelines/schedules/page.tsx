import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Clock,
  Calendar,
  Play,
  Pause,
  Edit,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Workflow,
} from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

async function getScheduledPipelines() {
  const pipelines = await prisma.dataPipeline.findMany({
    where: {
      schedule: { not: null },
    },
    include: {
      createdBy: { select: { name: true } },
      runs: {
        take: 1,
        orderBy: { startedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const activeCount = pipelines.filter((p) => p.isActive).length

  return { pipelines, activeCount }
}

function parseSchedule(cron: string): string {
  // Simple cron parser for common patterns
  const parts = cron.split(" ")
  if (parts.length !== 5) return cron

  if (cron === "0 * * * *") return "Every hour"
  if (cron === "0 0 * * *") return "Daily at midnight"
  if (cron === "0 0 * * 0") return "Weekly on Sunday"
  if (cron === "0 0 1 * *") return "Monthly on the 1st"
  if (cron.startsWith("*/")) return `Every ${parts[0].slice(2)} minutes`
  if (parts[1].startsWith("*/")) return `Every ${parts[1].slice(2)} hours`

  return cron
}

async function SchedulesContent() {
  const { pipelines, activeCount } = await getScheduledPipelines()
  const t = await getTranslations('gwi.pipelines.schedules')
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
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/gwi/pipelines/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('newSchedule')}
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pipelines.length}</p>
                <p className="text-sm text-muted-foreground">{t('totalSchedules')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">{t('activeSchedules')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Pause className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pipelines.length - activeCount}</p>
                <p className="text-sm text-muted-foreground">{t('pausedSchedules')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('scheduledPipelines')}</CardTitle>
          <CardDescription>
            {t('scheduledPipelinesDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {pipelines.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pipeline')}</TableHead>
                  <TableHead>{t('schedule')}</TableHead>
                  <TableHead>{tCommon('type')}</TableHead>
                  <TableHead>{t('lastRun')}</TableHead>
                  <TableHead>{t('nextRun')}</TableHead>
                  <TableHead>{tCommon('active')}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pipelines.map((pipeline) => {
                  const lastRun = pipeline.runs[0]
                  return (
                    <TableRow key={pipeline.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                            <Workflow className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <Link
                              href={`/gwi/pipelines/${pipeline.id}`}
                              className="font-medium hover:text-emerald-600"
                            >
                              {pipeline.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {t('by', { name: pipeline.createdBy.name })}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {parseSchedule(pipeline.schedule!)}
                            </p>
                            <code className="text-xs text-muted-foreground">
                              {pipeline.schedule}
                            </code>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{pipeline.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {lastRun ? (
                          <span className="text-sm">
                            {new Date(lastRun.startedAt).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{t('never')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {t('calculatedAtRuntime')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch checked={pipeline.isActive} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-green-600">
                              <Play className="mr-2 h-4 w-4" />
                              {t('runNow')}
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/gwi/pipelines/${pipeline.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                {t('editSchedule')}
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('noScheduledPipelines')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('noScheduledPipelinesDescription')}
              </p>
              <Button asChild>
                <Link href="/gwi/pipelines/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('createScheduledPipeline')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function PipelineSchedulesPage() {
  const t = await getTranslations('gwi.pipelines.schedules')

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
      <SchedulesContent />
    </Suspense>
  )
}
