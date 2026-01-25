/**
 * @prompt-id forge-v4.1:feature:data-export:008
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * Export Status Card Component
 *
 * Displays the current status of a data export request with progress indicator
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileJson,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ExportStatusCardProps {
  export: {
    id: string
    status: string
    type: string
    format: string
    fileSize: number | null
    createdAt: string
    startedAt: string | null
    completedAt: string | null
    expiresAt: string | null
    error: string | null
    downloadAvailable?: boolean
  }
  onDownload?: (id: string) => void
}

const STATUS_CONFIG = {
  PENDING: {
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock,
    label: 'Pending',
    progress: 10,
  },
  PROCESSING: {
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Loader2,
    label: 'Processing',
    progress: 50,
  },
  COMPLETED: {
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle,
    label: 'Completed',
    progress: 100,
  },
  FAILED: {
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
    label: 'Failed',
    progress: 0,
  },
  EXPIRED: {
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    icon: AlertTriangle,
    label: 'Expired',
    progress: 0,
  },
  CANCELLED: {
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    icon: XCircle,
    label: 'Cancelled',
    progress: 0,
  },
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function ExportStatusCard({ export: exportData, onDownload }: ExportStatusCardProps) {
  const status = STATUS_CONFIG[exportData.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING
  const StatusIcon = status.icon

  const handleDownload = () => {
    if (onDownload) {
      onDownload(exportData.id)
    } else {
      // Direct download
      window.location.href = `/api/v1/data-export/download/${exportData.id}`
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">
              {exportData.type.replace(/_/g, ' ')}
            </CardTitle>
          </div>
          <Badge className={status.color}>
            <StatusIcon
              className={`mr-1 h-3 w-3 ${exportData.status === 'PROCESSING' ? 'animate-spin' : ''}`}
            />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar for pending/processing */}
        {['PENDING', 'PROCESSING'].includes(exportData.status) && (
          <div className="space-y-2">
            <Progress value={status.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {exportData.status === 'PENDING'
                ? 'Waiting to start...'
                : 'Collecting your data...'}
            </p>
          </div>
        )}

        {/* Error message */}
        {exportData.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50 p-3">
            <p className="text-sm text-red-700 dark:text-red-300">{exportData.error}</p>
          </div>
        )}

        {/* Export details */}
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Requested</span>
            <span>{formatDistanceToNow(new Date(exportData.createdAt), { addSuffix: true })}</span>
          </div>

          {exportData.completedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed</span>
              <span>
                {formatDistanceToNow(new Date(exportData.completedAt), { addSuffix: true })}
              </span>
            </div>
          )}

          {exportData.fileSize && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">File size</span>
              <span>{formatBytes(exportData.fileSize)}</span>
            </div>
          )}

          {exportData.expiresAt && exportData.status === 'COMPLETED' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires</span>
              <span>
                {formatDistanceToNow(new Date(exportData.expiresAt), { addSuffix: true })}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">Format</span>
            <span className="uppercase">{exportData.format}</span>
          </div>
        </div>

        {/* Download button */}
        {exportData.downloadAvailable && (
          <Button onClick={handleDownload} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Export
          </Button>
        )}

        {/* Expired notice */}
        {exportData.status === 'EXPIRED' && (
          <p className="text-xs text-muted-foreground text-center">
            This export has expired. Please request a new export.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
