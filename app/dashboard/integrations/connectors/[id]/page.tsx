/**
 * @prompt-id forge-v4.1:feature:data-connectors:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  ChevronLeft,
  RefreshCw,
  Plug,
  Settings,
  Clock,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  History,
} from 'lucide-react'
import { useConnector } from '@/hooks/use-connectors'
import { useConnectors } from '@/hooks/use-connectors'
import { ConnectorForm } from '@/components/connectors/ConnectorForm'
import { SyncHistoryTable } from '@/components/connectors/SyncHistoryTable'
import { PageTracker } from '@/components/tracking/PageTracker'
import type { DataSyncStatus } from '@prisma/client'
import { formatDistanceToNow, format } from 'date-fns'

interface ConnectorDetailPageProps {
  params: Promise<{ id: string }>
}

const STATUS_CONFIG: Record<DataSyncStatus | 'NEVER', {
  icon: React.ComponentType<{ className?: string }>
  label: string
  className: string
}> = {
  COMPLETED: {
    icon: CheckCircle2,
    label: 'Last sync successful',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  RUNNING: {
    icon: Loader2,
    label: 'Syncing...',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  PENDING: {
    icon: Clock,
    label: 'Sync pending',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  FAILED: {
    icon: XCircle,
    label: 'Last sync failed',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  CANCELLED: {
    icon: AlertTriangle,
    label: 'Sync cancelled',
    className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  },
  NEVER: {
    icon: Clock,
    label: 'Never synced',
    className: 'bg-muted text-muted-foreground',
  },
}

export default function ConnectorDetailPage({ params }: ConnectorDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'configuration' | 'history'>('overview')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const {
    connector,
    isLoading,
    error,
    fetchConnector,
    triggerSync,
    testConnection,
    fetchSyncHistory,
  } = useConnector(id)

  const { deleteConnector } = useConnectors()

  useEffect(() => {
    fetchConnector()
  }, [fetchConnector])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await triggerSync()
      toast.success('Sync started')
      // Refresh after a short delay to show updated status
      setTimeout(() => fetchConnector(), 2000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start sync')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    setTestResult(null)
    try {
      const result = await testConnection()
      setTestResult(result)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Test failed',
      })
      toast.error(err instanceof Error ? err.message : 'Failed to test connection')
    } finally {
      setIsTesting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteConnector(id)
      toast.success('Connector deleted')
      router.push('/dashboard/integrations/connectors')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete connector')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <PageSkeleton />
  }

  if (error || !connector) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/integrations/connectors">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Connectors
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Connector not found'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const status = connector.lastSyncStatus || 'NEVER'
  const statusConfig = STATUS_CONFIG[status]
  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-6">
      <PageTracker pageName="Connector Detail" metadata={{ connectorId: id }} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/integrations/connectors">
            <Button variant="ghost" size="icon" className="mt-1">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              {connector.providerMeta?.icon ? (
                <img
                  src={connector.providerMeta.icon}
                  alt={connector.providerMeta.name}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <Plug className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{connector.name}</h1>
              <p className="text-muted-foreground">
                {connector.providerMeta?.name || connector.provider}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-14 sm:ml-0">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isTesting}
          >
            {isTesting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plug className="h-4 w-4 mr-2" />
            )}
            Test
          </Button>
          <Button
            onClick={handleSync}
            disabled={isSyncing || !connector.isActive}
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Now
          </Button>
        </div>
      </div>

      {/* Test result alert */}
      {testResult && (
        <Alert className={testResult.success ? 'border-emerald-500/50' : 'border-destructive/50'}>
          {testResult.success ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
          <AlertDescription>{testResult.message}</AlertDescription>
        </Alert>
      )}

      {/* Status cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Badge className={statusConfig.className} variant="outline">
                <StatusIcon className={`mr-1 h-3 w-3 ${status === 'RUNNING' ? 'animate-spin' : ''}`} />
                {statusConfig.label}
              </Badge>
            </div>
            {connector.lastSyncAt && (
              <p className="text-sm text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(connector.lastSyncAt), { addSuffix: true })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={connector.isActive ? 'default' : 'secondary'} className="mt-1">
              {connector.isActive ? 'Active' : 'Paused'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Syncs</p>
            <p className="text-2xl font-semibold">{connector._count.syncLogs}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Error Count</p>
            <p className={`text-2xl font-semibold ${connector.errorCount > 0 ? 'text-destructive' : ''}`}>
              {connector.errorCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="overview">
            <Clock className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Sync History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Connector details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {connector.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1">{connector.description}</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Provider</p>
                  <p className="mt-1">{connector.providerMeta?.name || connector.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="mt-1">{connector.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sync Schedule</p>
                  <p className="mt-1">{connector.syncSchedule || 'Manual only'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="mt-1">{format(new Date(connector.createdAt), 'PPP')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent sync logs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Syncs</CardTitle>
              <CardDescription>Last {connector.syncLogs?.length || 0} sync operations</CardDescription>
            </CardHeader>
            <CardContent>
              {connector.syncLogs && connector.syncLogs.length > 0 ? (
                <SyncHistoryTable
                  connectorId={id}
                  syncLogs={connector.syncLogs}
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No sync history yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="mt-6">
          <ConnectorForm
            mode="edit"
            initialData={{
              id: connector.id,
              name: connector.name,
              description: connector.description,
              provider: connector.provider,
              type: connector.type,
              config: connector.config as Record<string, unknown>,
              syncSchedule: connector.syncSchedule,
              isActive: connector.isActive,
            }}
            onSuccess={() => {
              toast.success('Connector updated')
              fetchConnector()
            }}
          />

          {/* Danger zone */}
          <Card className="mt-6 border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete this connector</p>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone. All sync history will be deleted.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>Complete history of data synchronization operations</CardDescription>
            </CardHeader>
            <CardContent>
              <SyncHistoryTable
                connectorId={id}
                fetchSyncHistory={fetchSyncHistory}
                onRefresh={fetchConnector}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connector</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{connector.name}"? This action cannot be undone.
              All sync history will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-96 rounded-lg" />
    </div>
  )
}
