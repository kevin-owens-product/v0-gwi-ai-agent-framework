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
  Database,
  RefreshCw,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Server,
  Shield,
} from "lucide-react"
import { DataSourceEditor } from "@/components/gwi/data-sources/data-source-editor"

const syncStatusConfig: Record<string, { color: string; icon: typeof CheckCircle; label: string }> = {
  synced: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Synced" },
  syncing: { color: "bg-blue-100 text-blue-700", icon: RefreshCw, label: "Syncing" },
  pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Pending" },
  error: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Error" },
}

async function getDataSource(id: string) {
  const dataSource = await prisma.gWIDataSourceConnection.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      organization: { select: { id: true, name: true, slug: true } },
    },
  })

  return dataSource
}

function sanitizeDataSource(dataSource: NonNullable<Awaited<ReturnType<typeof getDataSource>>>) {
  return {
    id: dataSource.id,
    name: dataSource.name,
    type: dataSource.type,
    configuration: dataSource.configuration as Record<string, unknown>,
    isActive: dataSource.isActive,
    syncStatus: dataSource.syncStatus,
    lastSyncAt: dataSource.lastSyncAt,
    createdAt: dataSource.createdAt,
    updatedAt: dataSource.updatedAt,
    credentials: dataSource.credentials ? { encrypted: true } : null,
    connectionString: dataSource.connectionString ? "***" : null,
  }
}

async function DataSourceDetail({ id }: { id: string }) {
  const dataSource = await getDataSource(id)

  if (!dataSource) {
    notFound()
  }

  const sanitizedDataSource = sanitizeDataSource(dataSource)
  const statusConfig = syncStatusConfig[dataSource.syncStatus] || syncStatusConfig.pending
  const StatusIcon = statusConfig.icon
  const config = dataSource.configuration as Record<string, string | undefined>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/gwi/data-sources">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Database className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{dataSource.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{dataSource.type}</Badge>
                  <Badge className={`${statusConfig.color} gap-1`}>
                    <StatusIcon
                      className={`h-3 w-3 ${dataSource.syncStatus === "syncing" ? "animate-spin" : ""}`}
                    />
                    {statusConfig.label}
                  </Badge>
                  {dataSource.isActive ? (
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-blue-600 border-blue-200">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Now
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Server className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold capitalize">{dataSource.type}</p>
                <p className="text-sm text-muted-foreground">Connection Type</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {dataSource.isActive ? "Active" : "Inactive"}
                </p>
                <p className="text-sm text-muted-foreground">Status</p>
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
                <p className="text-2xl font-bold">
                  {dataSource.lastSyncAt
                    ? new Date(dataSource.lastSyncAt).toLocaleDateString()
                    : "Never"}
                </p>
                <p className="text-sm text-muted-foreground">Last Sync</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {dataSource.credentials ? "Yes" : "No"}
                </p>
                <p className="text-sm text-muted-foreground">Credentials Set</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Log */}
      {dataSource.errorLog && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">Sync Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-red-700 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(dataSource.errorLog, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <DataSourceEditor dataSource={sanitizedDataSource} />
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Recent sync operations and configuration changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No activity recorded yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Activity will be logged when sync operations are performed
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Data Source Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-mono text-xs">{dataSource.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created By</dt>
              <dd className="font-medium">{dataSource.createdBy.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created At</dt>
              <dd className="font-medium">
                {new Date(dataSource.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last Updated</dt>
              <dd className="font-medium">
                {new Date(dataSource.updatedAt).toLocaleDateString()}
              </dd>
            </div>
            {dataSource.organization && (
              <div>
                <dt className="text-muted-foreground">Organization</dt>
                <dd className="font-medium">{dataSource.organization.name}</dd>
              </div>
            )}
            {config?.database && (
              <div>
                <dt className="text-muted-foreground">Database</dt>
                <dd className="font-medium">{config.database}</dd>
              </div>
            )}
            {config?.host && (
              <div>
                <dt className="text-muted-foreground">Host</dt>
                <dd className="font-medium">{config.host}</dd>
              </div>
            )}
            {config?.schema && (
              <div>
                <dt className="text-muted-foreground">Schema</dt>
                <dd className="font-medium">{config.schema}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function DataSourceDetailPage({
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
      <DataSourceDetail id={id} />
    </Suspense>
  )
}
