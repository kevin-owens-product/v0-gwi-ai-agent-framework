/**
 * @prompt-id forge-v4.1:feature:scheduled-exports:006
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 */

"use client"

import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileJson,
  File,
  AlertCircle,
} from "lucide-react"
import type { ExportHistory, ExportFormat, ExportStatus } from "@/hooks/use-scheduled-exports"

interface ExportHistoryTableProps {
  history: ExportHistory[]
  isLoading?: boolean
  className?: string
}

const FORMAT_ICONS: Record<ExportFormat, React.ReactNode> = {
  PDF: <FileText className="h-4 w-4" />,
  EXCEL: <FileSpreadsheet className="h-4 w-4" />,
  CSV: <File className="h-4 w-4" />,
  POWERPOINT: <FileText className="h-4 w-4" />,
  PNG: <FileImage className="h-4 w-4" />,
  JSON: <FileJson className="h-4 w-4" />,
}

const STATUS_CONFIG: Record<ExportStatus, { icon: React.ReactNode; label: string; className: string }> = {
  PENDING: {
    icon: <Clock className="h-4 w-4" />,
    label: 'Pending',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  PROCESSING: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    label: 'Processing',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  COMPLETED: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: 'Completed',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  FAILED: {
    icon: <XCircle className="h-4 w-4" />,
    label: 'Failed',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return '-'
  const start = new Date(startedAt).getTime()
  const end = new Date(completedAt).getTime()
  const durationMs = end - start

  if (durationMs < 1000) return `${durationMs}ms`
  if (durationMs < 60000) return `${(durationMs / 1000).toFixed(1)}s`
  return `${Math.floor(durationMs / 60000)}m ${Math.floor((durationMs % 60000) / 1000)}s`
}

export function ExportHistoryTable({
  history,
  isLoading,
  className,
}: ExportHistoryTableProps) {
  const tTable = useTranslations('ui.table')
  const tEmpty = useTranslations('ui.empty')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mb-4 opacity-50" />
        <p className="font-medium">{tTable('noResults')}</p>
        <p className="text-sm">{tEmpty('getStarted')}</p>
      </div>
    )
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item) => {
            const statusConfig = STATUS_CONFIG[item.status]
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <Badge variant="outline" className={statusConfig.className}>
                    <span className="mr-1.5">{statusConfig.icon}</span>
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {FORMAT_ICONS[item.format]}
                    <span>{item.format}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(item.startedAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDuration(item.startedAt, item.completedAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatFileSize(item.fileSize)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.recipientCount > 0 ? (
                    <Badge variant="secondary">{item.recipientCount}</Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {item.status === 'COMPLETED' && item.fileUrl && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={item.fileUrl} download>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download export</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {item.status === 'FAILED' && item.error && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">{item.error}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

// Compact version for inline display
export function ExportHistoryCompact({
  history,
  limit = 3,
}: {
  history: ExportHistory[]
  limit?: number
}) {
  const tTable = useTranslations('ui.table')
  const recentHistory = history.slice(0, limit)

  if (recentHistory.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{tTable('noResults')}</p>
    )
  }

  return (
    <div className="space-y-2">
      {recentHistory.map((item) => {
        const statusConfig = STATUS_CONFIG[item.status]
        return (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <span className={cn("p-1 rounded", statusConfig.className)}>
                {statusConfig.icon}
              </span>
              <div>
                <p className="text-sm font-medium">{formatDate(item.startedAt)}</p>
                <p className="text-xs text-muted-foreground">
                  {item.format} {item.fileSize && `(${formatFileSize(item.fileSize)})`}
                </p>
              </div>
            </div>
            {item.status === 'COMPLETED' && item.fileUrl && (
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a href={item.fileUrl} download>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
