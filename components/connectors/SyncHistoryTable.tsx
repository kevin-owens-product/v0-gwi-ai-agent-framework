/**
 * @prompt-id forge-v4.1:feature:data-connectors:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import type { SyncLog } from '@/hooks/use-connectors'
import type { DataSyncStatus } from '@prisma/client'

interface SyncHistoryTableProps {
  connectorId: string
  syncLogs?: SyncLog[]
  fetchSyncHistory?: (options: {
    page?: number
    limit?: number
    status?: DataSyncStatus
  }) => Promise<{
    data: SyncLog[]
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>
  isLoading?: boolean
  onRefresh?: () => void
}

const STATUS_CONFIG: Record<DataSyncStatus, {
  icon: React.ComponentType<{ className?: string }>
  label: string
  className: string
}> = {
  COMPLETED: {
    icon: CheckCircle2,
    label: 'Completed',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  RUNNING: {
    icon: Loader2,
    label: 'Running',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  PENDING: {
    icon: Clock,
    label: 'Pending',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  FAILED: {
    icon: XCircle,
    label: 'Failed',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  CANCELLED: {
    icon: AlertTriangle,
    label: 'Cancelled',
    className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  },
}

export function SyncHistoryTable({
  connectorId,
  syncLogs: initialLogs,
  fetchSyncHistory,
  isLoading: initialLoading,
  onRefresh,
}: SyncHistoryTableProps) {
  const tTable = useTranslations('ui.table')
  const tPagination = useTranslations('ui.pagination')
  const tCommon = useTranslations('common')

  const [logs, setLogs] = useState<SyncLog[]>(initialLogs || [])
  const [isLoading, setIsLoading] = useState(initialLoading || false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<DataSyncStatus | 'all'>('all')

  const loadData = useCallback(async () => {
    if (!fetchSyncHistory) return

    setIsLoading(true)
    try {
      const result = await fetchSyncHistory({
        page,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      setLogs(result.data)
      setTotalPages(result.meta.totalPages)
    } catch (error) {
      console.error('Failed to fetch sync history:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchSyncHistory, page, statusFilter])

  useEffect(() => {
    if (fetchSyncHistory) {
      loadData()
    }
  }, [loadData, fetchSyncHistory])

  useEffect(() => {
    if (initialLogs) {
      setLogs(initialLogs)
    }
  }, [initialLogs])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatDuration = (start: Date, end: Date | null): string => {
    if (!end) return 'In progress'
    const ms = new Date(end).getTime() - new Date(start).getTime()
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      loadData()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as DataSyncStatus | 'all')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="RUNNING">Running</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {tCommon('refresh')}
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead className="text-right">Records</TableHead>
              <TableHead className="text-right">Data</TableHead>
              <TableHead className="text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {tTable('noResults')}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const statusConfig = STATUS_CONFIG[log.status]
                const StatusIcon = statusConfig.icon

                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={statusConfig.className} variant="outline">
                          <StatusIcon
                            className={`mr-1 h-3 w-3 ${
                              log.status === 'RUNNING' ? 'animate-spin' : ''
                            }`}
                          />
                          {statusConfig.label}
                        </Badge>
                        {log.error && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-sm">{log.error}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-sm">
                              {formatDistanceToNow(new Date(log.startedAt), { addSuffix: true })}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">
                              {format(new Date(log.startedAt), 'PPpp')}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm">
                        {log.recordsProcessed.toLocaleString()}
                        {log.recordsFailed > 0 && (
                          <span className="text-destructive ml-1">
                            (-{log.recordsFailed})
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm text-muted-foreground">
                        {formatBytes(log.bytesTransferred)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(log.startedAt, log.completedAt)}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {tPagination('page', { current: page, total: totalPages })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              {tPagination('previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
            >
              {tPagination('next')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
