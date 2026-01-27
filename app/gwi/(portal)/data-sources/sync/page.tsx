import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Database,
  Play,
  Pause,
  Calendar,
  Activity,
} from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

const syncStatusConfig: Record<string, { color: string; icon: typeof CheckCircle; labelKey: string }> = {
  synced: { color: "bg-green-100 text-green-700", icon: CheckCircle, labelKey: "synced" },
  syncing: { color: "bg-blue-100 text-blue-700", icon: RefreshCw, labelKey: "syncing" },
  pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock, labelKey: "pending" },
  error: { color: "bg-red-100 text-red-700", icon: XCircle, labelKey: "error" },
  paused: { color: "bg-slate-100 text-slate-700", icon: Pause, labelKey: "paused" },
}

async function getDataSourceSyncStatus() {
  const dataSources = await prisma.gWIDataSourceConnection.findMany({
    include: {
      createdBy: { select: { name: true } },
    },
    orderBy: { lastSyncAt: "desc" },
  })

  const syncedCount = dataSources.filter((ds) => ds.syncStatus === "synced").length
  const errorCount = dataSources.filter((ds) => ds.syncStatus === "error").length
  const syncingCount = dataSources.filter((ds) => ds.syncStatus === "syncing").length

  return { dataSources, syncedCount, errorCount, syncingCount }
}

async function DataSourceSyncContent() {
  const { dataSources, syncedCount, errorCount, syncingCount } = await getDataSourceSyncStatus()
  const t = await getTranslations('gwi.dataSources.sync')
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
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('syncAll')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Database className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dataSources.length}</p>
                <p className="text-sm text-muted-foreground">{t('totalSources')}</p>
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
                <p className="text-2xl font-bold">{syncedCount}</p>
                <p className="text-sm text-muted-foreground">{t('statuses.synced')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{syncingCount}</p>
                <p className="text-sm text-muted-foreground">{t('statuses.syncing')}</p>
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
                <p className="text-2xl font-bold">{errorCount}</p>
                <p className="text-sm text-muted-foreground">{t('errors')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('syncStatusTitle')}</CardTitle>
          <CardDescription>
            {t('syncStatusDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {dataSources.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dataSource')}</TableHead>
                  <TableHead>{tCommon('type')}</TableHead>
                  <TableHead>{tCommon('status')}</TableHead>
                  <TableHead>{t('lastSync')}</TableHead>
                  <TableHead>{t('nextSync')}</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataSources.map((ds) => {
                  const statusConfig = syncStatusConfig[ds.syncStatus] || syncStatusConfig.pending
                  const StatusIcon = statusConfig.icon
                  return (
                    <TableRow key={ds.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Database className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <Link
                              href={`/gwi/data-sources/${ds.id}`}
                              className="font-medium hover:text-emerald-600"
                            >
                              {ds.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {t('by', { name: ds.createdBy.name })}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ds.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig.color} gap-1`}>
                          <StatusIcon
                            className={`h-3 w-3 ${
                              ds.syncStatus === "syncing" ? "animate-spin" : ""
                            }`}
                          />
                          {t(`statuses.${statusConfig.labelKey}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ds.lastSyncAt ? (
                          <div>
                            <p className="text-sm">
                              {new Date(ds.lastSyncAt).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getRelativeTime(ds.lastSyncAt)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{t('never')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">
                          {t('scheduled')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          {ds.syncStatus === "syncing" ? (
                            <Button variant="ghost" size="sm">
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('noDataSources')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('noDataSourcesDescription')}
              </p>
              <Button asChild>
                <Link href="/gwi/data-sources">{t('goToDataSources')}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentActivity')}</CardTitle>
          <CardDescription>{t('recentActivityDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t('comingSoon')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default async function DataSourceSyncPage() {
  const t = await getTranslations('gwi.dataSources.sync')

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
      <DataSourceSyncContent />
    </Suspense>
  )
}
