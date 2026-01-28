/**
 * @prompt-id forge-v4.1:feature:data-export:009
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * Export History Table Component
 *
 * Displays a table of all data export requests with status and download options
 */

'use client'

import { useState } from 'react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  FileJson,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface ExportRecord {
  id: string
  type: string
  status: string
  format: string
  fileSize: number | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  expiresAt: string | null
  error: string | null
  downloadAvailable?: boolean
}

interface ExportHistoryTableProps {
  exports: ExportRecord[]
  loading?: boolean
  onRefresh?: () => void
}

const STATUS_CONFIG = {
  PENDING: {
    key: 'pending',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock,
  },
  PROCESSING: {
    key: 'processing',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Loader2,
  },
  COMPLETED: {
    key: 'completed',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle,
  },
  FAILED: {
    key: 'failed',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
  },
  EXPIRED: {
    key: 'expired',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    icon: AlertTriangle,
  },
  CANCELLED: {
    key: 'cancelled',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    icon: XCircle,
  },
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function ExportHistoryTable({
  exports,
  loading = false,
}: ExportHistoryTableProps) {
  const t = useTranslations('dataExport.history')
  const tStatus = useTranslations('dataExport.status.statuses')
  const tTable = useTranslations('ui.table')
  const tEmpty = useTranslations('ui.empty')

  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (exportId: string) => {
    setDownloading(exportId)
    try {
      window.location.href = `/api/v1/data-export/download/${exportId}`
      toast.success(t('downloadStarted'))
    } catch (_error) {
      toast.error(t('downloadFailed'), {
        description: t('tryAgainLater'),
      })
    } finally {
      setTimeout(() => setDownloading(null), 1000)
    }
  }

  const handleViewDetails = (exportId: string) => {
    // Could open a modal or navigate to details page
    toast.info('Export ID: ' + exportId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (exports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileJson className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">{tTable('noResults')}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {tEmpty('getStarted')}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('columns.type')}</TableHead>
            <TableHead>{t('columns.status')}</TableHead>
            <TableHead>{t('columns.size')}</TableHead>
            <TableHead>{t('columns.requested')}</TableHead>
            <TableHead>{t('columns.expires')}</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exports.map((exp) => {
            const status =
              STATUS_CONFIG[exp.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING
            const StatusIcon = status.icon
            const isExpired =
              exp.expiresAt && exp.status === 'COMPLETED' && new Date() > new Date(exp.expiresAt)

            return (
              <TableRow key={exp.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {exp.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={isExpired ? STATUS_CONFIG.EXPIRED.color : status.color}>
                    <StatusIcon
                      className={`mr-1 h-3 w-3 ${exp.status === 'PROCESSING' ? 'animate-spin' : ''}`}
                    />
                    {isExpired ? tStatus('expired') : tStatus(status.key)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {exp.fileSize ? formatBytes(exp.fileSize) : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {format(new Date(exp.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(exp.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {exp.expiresAt && exp.status === 'COMPLETED' ? (
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {format(new Date(exp.expiresAt), 'MMM d, yyyy')}
                      </span>
                      <span
                        className={`text-xs ${
                          isExpired ? 'text-red-500' : 'text-muted-foreground'
                        }`}
                      >
                        {isExpired
                          ? tStatus('expired')
                          : formatDistanceToNow(new Date(exp.expiresAt), { addSuffix: true })}
                      </span>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{t('actions')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {exp.downloadAvailable && !isExpired && (
                        <DropdownMenuItem
                          onClick={() => handleDownload(exp.id)}
                          disabled={downloading === exp.id}
                        >
                          {downloading === exp.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          {t('download')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleViewDetails(exp.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t('viewDetails')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
