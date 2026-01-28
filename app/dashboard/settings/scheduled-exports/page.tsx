/**
 * @prompt-id forge-v4.1:feature:scheduled-exports:009
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 */

"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Pencil,
  Trash2,
  Loader2,
  Clock,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileJson,
  File,
  Calendar,
  CheckCircle2,
  XCircle,
  History,
  Mail,
} from "lucide-react"
import { PageTracker } from "@/components/tracking/PageTracker"
import { useTranslations } from "next-intl"
import { ScheduledExportForm } from "@/components/scheduled-exports/ScheduledExportForm"
import { ExportHistoryTable } from "@/components/scheduled-exports/ExportHistoryTable"
import { describeCronExpression } from "@/components/scheduled-exports/CronScheduleBuilder"
import {
  useScheduledExports,
  useScheduledExport,
  type ScheduledExport,
  type ExportFormat,
  type ExportStatus,
  type CreateScheduledExportInput,
  type UpdateScheduledExportInput,
} from "@/hooks/use-scheduled-exports"

const FORMAT_ICONS: Record<ExportFormat, React.ReactNode> = {
  PDF: <FileText className="h-4 w-4" />,
  EXCEL: <FileSpreadsheet className="h-4 w-4" />,
  CSV: <File className="h-4 w-4" />,
  POWERPOINT: <FileText className="h-4 w-4" />,
  PNG: <FileImage className="h-4 w-4" />,
  JSON: <FileJson className="h-4 w-4" />,
}

export default function ScheduledExportsPage() {
  const t = useTranslations("settings.scheduledExports")

  const STATUS_CONFIG: Record<ExportStatus | 'never', { label: string; className: string; icon: React.ReactNode }> = {
    PENDING: {
      label: t("statusLabels.pending"),
      className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      icon: <Clock className="h-3 w-3" />,
    },
    PROCESSING: {
      label: t("statusLabels.processing"),
      className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    COMPLETED: {
      label: t("statusLabels.completed"),
      className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    FAILED: {
      label: t("statusLabels.failed"),
      className: 'bg-red-500/10 text-red-600 border-red-500/20',
      icon: <XCircle className="h-3 w-3" />,
    },
    never: {
      label: t("statusLabels.neverRun"),
      className: 'bg-muted text-muted-foreground border-muted',
      icon: <Clock className="h-3 w-3" />,
    },
  }

  function formatRelativeDate(dateString: string | null): string {
    if (!dateString) return t("statusLabels.neverRun")
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const absDiffMs = Math.abs(diffMs)

    const isPast = diffMs < 0

    if (absDiffMs < 60000) return isPast ? t("relativeTime.justNow") : t("relativeTime.lessThanMinute")
    if (absDiffMs < 3600000) {
      const mins = Math.round(absDiffMs / 60000)
      return isPast ? t("relativeTime.minsAgo", { count: mins }) : t("relativeTime.inMins", { count: mins })
    }
    if (absDiffMs < 86400000) {
      const hours = Math.round(absDiffMs / 3600000)
      return isPast ? t("relativeTime.hoursAgo", { count: hours }) : t("relativeTime.inHours", { count: hours })
    }
    const days = Math.round(absDiffMs / 86400000)
    return isPast ? t("relativeTime.daysAgo", { count: days }) : t("relativeTime.inDays", { count: days })
  }
  const [formOpen, setFormOpen] = useState(false)
  const [editingExport, setEditingExport] = useState<ScheduledExport | null>(null)
  const [deleteExport, setDeleteExport] = useState<ScheduledExport | null>(null)
  const [historyExportId, setHistoryExportId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const {
    exports,
    isLoading,
    createExport,
    updateExport,
    deleteExport: removeExport,
    runExport,
    refresh,
  } = useScheduledExports({
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const { export: historyExportDetails, isLoading: historyLoading } = useScheduledExport(historyExportId)

  const handleCreate = useCallback(async (data: CreateScheduledExportInput | UpdateScheduledExportInput) => {
    setIsSubmitting(true)
    try {
      await createExport(data as CreateScheduledExportInput)
      toast.success(t('toast.exportCreated'))
      setFormOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.createFailed'))
    } finally {
      setIsSubmitting(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createExport])

  const handleUpdate = useCallback(async (data: CreateScheduledExportInput | UpdateScheduledExportInput) => {
    if (!editingExport) return
    setIsSubmitting(true)
    try {
      await updateExport(editingExport.id, data as UpdateScheduledExportInput)
      toast.success(t('toast.exportUpdated'))
      setEditingExport(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.updateFailed'))
    } finally {
      setIsSubmitting(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingExport, updateExport])

  const handleDelete = useCallback(async () => {
    if (!deleteExport) return
    try {
      await removeExport(deleteExport.id)
      toast.success(t('toast.exportDeleted'))
      setDeleteExport(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.deleteFailed'))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteExport, removeExport])

  const handleToggleActive = useCallback(async (exportItem: ScheduledExport) => {
    try {
      await updateExport(exportItem.id, { isActive: !exportItem.isActive })
      toast.success(exportItem.isActive ? t('toast.exportPaused') : t('toast.exportActivated'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.updateFailed'))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateExport])

  const handleRunNow = useCallback(async (exportItem: ScheduledExport) => {
    try {
      await runExport(exportItem.id)
      toast.success(t('toast.exportStarted'))
      refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.startFailed'))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runExport, refresh])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl">
      <PageTracker pageName="Settings - Scheduled Exports" metadata={{ totalExports: exports.length }} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("yourScheduledExports")}</CardTitle>
              <CardDescription>
                {t("yourScheduledExportsDescription")}
              </CardDescription>
            </div>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("newExport")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">{t("all")}</TabsTrigger>
              <TabsTrigger value="active">{t("active")}</TabsTrigger>
              <TabsTrigger value="inactive">{t("paused")}</TabsTrigger>
            </TabsList>
          </Tabs>

          {exports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium">{t("noScheduledExports")}</p>
              <p className="text-sm">{t("createFirstExport")}</p>
              <Button className="mt-4" onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("createExport")}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("tableHeaders.name")}</TableHead>
                  <TableHead>{t("tableHeaders.schedule")}</TableHead>
                  <TableHead>{t("tableHeaders.format")}</TableHead>
                  <TableHead>{t("tableHeaders.lastRun")}</TableHead>
                  <TableHead>{t("tableHeaders.nextRun")}</TableHead>
                  <TableHead>{t("tableHeaders.status")}</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exports.map((exportItem) => {
                  const lastStatus = exportItem.lastStatus || 'never'
                  const statusConfig = STATUS_CONFIG[lastStatus]
                  return (
                    <TableRow key={exportItem.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exportItem.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {exportItem.entityType}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {describeCronExpression(exportItem.schedule)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {FORMAT_ICONS[exportItem.format]}
                          <span>{exportItem.format}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatRelativeDate(exportItem.lastRunAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {exportItem.isActive
                          ? formatRelativeDate(exportItem.nextRunAt)
                          : <span className="text-amber-500">{t("paused")}</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={statusConfig.className}>
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                          </Badge>
                          {exportItem.recipients.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              {exportItem.recipients.length}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRunNow(exportItem)}>
                              <Play className="mr-2 h-4 w-4" />
                              {t("actions.runNow")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setHistoryExportId(exportItem.id)}>
                              <History className="mr-2 h-4 w-4" />
                              {t("actions.viewHistory")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditingExport(exportItem)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              {t("actions.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(exportItem)}>
                              {exportItem.isActive ? (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  {t("actions.pause")}
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  {t("actions.activate")}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteExport(exportItem)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("actions.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Form */}
      <ScheduledExportForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isLoading={isSubmitting}
      />

      {/* Edit Form */}
      <ScheduledExportForm
        open={!!editingExport}
        onOpenChange={(open) => !open && setEditingExport(null)}
        export={editingExport}
        onSubmit={handleUpdate}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteExport} onOpenChange={() => setDeleteExport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description", { name: deleteExport?.name || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t("deleteDialog.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* History Sheet */}
      <Sheet open={!!historyExportId} onOpenChange={(open) => !open && setHistoryExportId(null)}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>{t("historySheet.title")}</SheetTitle>
            <SheetDescription>
              {historyExportDetails?.name || t("historySheet.loading")}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : historyExportDetails ? (
              <ExportHistoryTable history={historyExportDetails.exportHistory || []} />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
