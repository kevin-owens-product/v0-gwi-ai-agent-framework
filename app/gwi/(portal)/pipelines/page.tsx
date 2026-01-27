import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  Workflow,
  Play,
  Edit,
  Trash2,
  MoreHorizontal,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

const pipelineTypeColors: Record<string, string> = {
  ETL: "bg-blue-100 text-blue-700",
  TRANSFORMATION: "bg-purple-100 text-purple-700",
  AGGREGATION: "bg-orange-100 text-orange-700",
  EXPORT: "bg-green-100 text-green-700",
  SYNC: "bg-cyan-100 text-cyan-700",
}

async function getPipelines() {
  const pipelines = await prisma.dataPipeline.findMany({
    include: {
      createdBy: { select: { name: true } },
      _count: {
        select: { runs: true, validationRules: true },
      },
      runs: {
        take: 1,
        orderBy: { startedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return pipelines
}

async function PipelinesContent() {
  const pipelines = await getPipelines()
  const t = await getTranslations('gwi.pipelines')
  const tc = await getTranslations('gwi.common')

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
            {t('newPipeline')}
          </Link>
        </Button>
      </div>

      {/* Quick Links */}
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/gwi/pipelines/runs">
            <Activity className="mr-2 h-4 w-4" />
            {t('allRuns')}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/gwi/pipelines/schedules">
            <Clock className="mr-2 h-4 w-4" />
            {t('schedules')}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/gwi/pipelines/validation">
            <CheckCircle className="mr-2 h-4 w-4" />
            {t('validationRules')}
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t('searchPlaceholder')} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {/* Pipelines Table */}
      <Card>
        <CardContent className="p-0">
          {pipelines.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pipeline')}</TableHead>
                  <TableHead>{t('type')}</TableHead>
                  <TableHead>{t('schedule')}</TableHead>
                  <TableHead>{t('lastRun')}</TableHead>
                  <TableHead>{t('active')}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pipelines.map((pipeline) => {
                  const lastRun = pipeline.runs[0]
                  return (
                    <TableRow key={pipeline.id}>
                      <TableCell>
                        <div>
                          <Link
                            href={`/gwi/pipelines/${pipeline.id}`}
                            className="font-medium hover:text-emerald-600"
                          >
                            {pipeline.name}
                          </Link>
                          {pipeline.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {pipeline.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={pipelineTypeColors[pipeline.type]}>
                          {pipeline.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {pipeline.schedule ? (
                          <code className="px-2 py-1 bg-slate-100 rounded text-xs">
                            {pipeline.schedule}
                          </code>
                        ) : (
                          <span className="text-muted-foreground">{tc('manual')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lastRun ? (
                          <div className="flex items-center gap-2">
                            {lastRun.status === "COMPLETED" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : lastRun.status === "FAILED" ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : lastRun.status === "RUNNING" ? (
                              <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                            <span className="text-sm">
                              {new Date(lastRun.startedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{tc('never')}</span>
                        )}
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
                              {tc('runNow')}
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/gwi/pipelines/${pipeline.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                {tc('edit')}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/gwi/pipelines/${pipeline.id}/runs`}>
                                <Activity className="mr-2 h-4 w-4" />
                                {tc('viewRuns')}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              {tc('delete')}
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
              <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('noPipelinesYet')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('createFirstPipeline')}
              </p>
              <Button asChild>
                <Link href="/gwi/pipelines/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('createPipeline')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function PipelinesPage() {
  const t = await getTranslations('gwi.pipelines')

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
      <PipelinesContent />
    </Suspense>
  )
}
