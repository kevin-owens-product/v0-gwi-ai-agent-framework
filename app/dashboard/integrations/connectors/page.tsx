/**
 * @prompt-id forge-v4.1:feature:data-connectors:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Plug,
  RefreshCw,
  Database,
  AlertTriangle,
} from 'lucide-react'
import { ConnectorCard } from '@/components/connectors/ConnectorCard'
import { ConnectorTypeSelector } from '@/components/connectors/ConnectorTypeSelector'
import { useConnectors } from '@/hooks/use-connectors'
import { CONNECTOR_CATEGORIES, type ConnectorProviderConfig } from '@/lib/connectors'
import { PageTracker } from '@/components/tracking/PageTracker'

export default function ConnectorsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'configured' | 'available'>('configured')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const {
    connectors,
    meta,
    isLoading,
    error,
    fetchConnectors,
    updateConnector,
    deleteConnector,
    triggerSync,
    testConnection,
  } = useConnectors({
    search: search || undefined,
    type: typeFilter !== 'all' ? (typeFilter as any) : undefined,
  })

  useEffect(() => {
    fetchConnectors()
  }, [fetchConnectors])

  const handleSync = async (id: string) => {
    try {
      await triggerSync(id)
      toast.success('Sync started')
      // Refresh after a short delay to show updated status
      setTimeout(() => fetchConnectors(), 2000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start sync')
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await updateConnector(id, { isActive })
      toast.success(isActive ? 'Connector enabled' : 'Connector disabled')
      fetchConnectors()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update connector')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteConnector(id)
      toast.success('Connector deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete connector')
    }
  }

  const handleTest = async (id: string) => {
    try {
      const result = await testConnection(id)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to test connection')
    }
  }

  const handleProviderSelect = (provider: ConnectorProviderConfig) => {
    router.push(`/dashboard/integrations/connectors/new?provider=${provider.id}`)
  }

  // Group connectors by status
  const activeConnectors = connectors.filter((c) => c.isActive)
  const errorConnectors = connectors.filter((c) => c.lastSyncStatus === 'FAILED')

  return (
    <div className="space-y-6">
      <PageTracker pageName="Data Connectors" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Data Connectors</h1>
          <p className="text-muted-foreground">
            Connect external data sources to enrich your insights
          </p>
        </div>
        <Link href="/dashboard/integrations/connectors/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Connector
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          icon={Plug}
          label="Total Connectors"
          value={connectors.length}
          isLoading={isLoading}
        />
        <StatsCard
          icon={RefreshCw}
          label="Active"
          value={activeConnectors.length}
          isLoading={isLoading}
          className="text-emerald-600"
        />
        <StatsCard
          icon={AlertTriangle}
          label="With Errors"
          value={errorConnectors.length}
          isLoading={isLoading}
          className={errorConnectors.length > 0 ? 'text-destructive' : ''}
        />
        <StatsCard
          icon={Database}
          label="Data Sources"
          value={new Set(connectors.map((c) => c.type)).size}
          isLoading={isLoading}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="configured">
              Configured
              {connectors.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {connectors.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
          </TabsList>

          {activeTab === 'configured' && (
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search connectors..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {CONNECTOR_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <TabsContent value="configured" className="mt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : connectors.length === 0 ? (
            <div className="text-center py-12">
              <Plug className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No connectors configured</h3>
              <p className="text-muted-foreground mb-4">
                Connect your first data source to get started
              </p>
              <Link href="/dashboard/integrations/connectors/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Connector
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connectors.map((connector) => (
                <ConnectorCard
                  key={connector.id}
                  connector={connector}
                  onSync={handleSync}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onTest={handleTest}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page <= 1}
                onClick={() => {
                  /* TODO: implement pagination */
                }}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => {
                  /* TODO: implement pagination */
                }}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          <ConnectorTypeSelector onSelect={handleProviderSelect} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  isLoading?: boolean
  className?: string
}

function StatsCard({ icon: Icon, label, value, isLoading, className }: StatsCardProps) {
  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-muted ${className}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="h-6 w-12" />
          ) : (
            <p className={`text-2xl font-semibold ${className}`}>{value}</p>
          )}
        </div>
      </div>
    </div>
  )
}
