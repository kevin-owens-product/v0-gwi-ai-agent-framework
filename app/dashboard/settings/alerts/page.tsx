/**
 * @prompt-id forge-v4.1:feature:custom-alerts:011
 * @generated-at 2024-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// Tabs component not currently used
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertForm,
  AlertStatusBadge,
  AlertHistoryTimeline,
} from "@/components/alerts"
import {
  useAlerts,
  useAlertHistory,
  type CustomAlert,
  type CreateAlertInput,
  type UpdateAlertInput,
} from "@/hooks/use-alerts"
import { toast } from "sonner"
import { PageTracker } from "@/components/tracking/PageTracker"
import { useTranslations } from "next-intl"
import {
  Bell,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  History,
  Filter,
  BellOff,
} from "lucide-react"

export default function AlertsSettingsPage() {
  const t = useTranslations("settings.alerts")

  const ENTITY_TYPE_LABELS: Record<string, string> = {
    metric: t("entityTypes.metric"),
    audience: t("entityTypes.audience"),
    brand: t("entityTypes.brand"),
    report: t("entityTypes.report"),
    agent: t("entityTypes.agent"),
    workflow: t("entityTypes.workflow"),
  }
  const {
    alerts,
    isLoading,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
  } = useAlerts()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingAlert, setEditingAlert] = useState<CustomAlert | null>(null)
  const [viewingHistoryAlert, setViewingHistoryAlert] = useState<CustomAlert | null>(null)
  const [deletingAlert, setDeletingAlert] = useState<CustomAlert | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = !searchQuery ||
      alert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === 'all' || alert.entityType === filterType

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && alert.isActive) ||
      (filterStatus === 'inactive' && !alert.isActive)

    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateAlert = async (data: CreateAlertInput | UpdateAlertInput) => {
    setIsSubmitting(true)
    try {
      await createAlert(data as CreateAlertInput)
      toast.success(t('toast.alertCreated'))
      setIsCreateDialogOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.createFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateAlert = async (data: CreateAlertInput | UpdateAlertInput) => {
    if (!editingAlert) return

    setIsSubmitting(true)
    try {
      await updateAlert(editingAlert.id, data as UpdateAlertInput)
      toast.success(t('toast.alertUpdated'))
      setEditingAlert(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toast.updateFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAlert = async () => {
    if (!deletingAlert) return

    try {
      await deleteAlert(deletingAlert.id)
      toast.success(t('toast.alertDeleted'))
      setDeletingAlert(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.deleteFailed'))
    }
  }

  const handleToggleAlert = async (alert: CustomAlert) => {
    try {
      await toggleAlert(alert.id, !alert.isActive)
      toast.success(alert.isActive ? t('toast.alertDisabled') : t('toast.alertEnabled'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.toggleFailed'))
    }
  }

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (isLoading && alerts.length === 0) {
    return (
      <div className="p-6 max-w-6xl">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardContent className="p-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full mb-4" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl">
      <PageTracker pageName="Settings - Alerts" metadata={{ totalAlerts: alerts.length }} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{alerts.length}</p>
                  <p className="text-sm text-muted-foreground">{t("totalAlerts")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Bell className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {alerts.filter(a => a.isActive).length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("active")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Bell className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {alerts.reduce((sum, a) => sum + a.triggerCount, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("totalTriggers")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <BellOff className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {alerts.filter(a => !a.isActive).length}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("paused")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>{t("yourAlerts")}</CardTitle>
                <CardDescription>
                  {t("yourAlertsDescription")}
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("createAlert")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchAlerts")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={t("entityType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allTypes")}</SelectItem>
                    {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder={t("allStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allStatus")}</SelectItem>
                    <SelectItem value="active">{t("active")}</SelectItem>
                    <SelectItem value="inactive">{t("paused")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Alerts Table */}
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">
                  {alerts.length === 0 ? t("noAlertsYet") : t("noMatchingAlerts")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {alerts.length === 0
                    ? t("createFirstAlert")
                    : t("adjustFilters")}
                </p>
                {alerts.length === 0 && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("createAlert")}
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("tableHeaders.alert")}</TableHead>
                    <TableHead>{t("tableHeaders.type")}</TableHead>
                    <TableHead>{t("tableHeaders.condition")}</TableHead>
                    <TableHead>{t("tableHeaders.channels")}</TableHead>
                    <TableHead>{t("tableHeaders.lastTriggered")}</TableHead>
                    <TableHead>{t("tableHeaders.status")}</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{alert.name}</p>
                          {alert.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {alert.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ENTITY_TYPE_LABELS[alert.entityType] || alert.entityType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {alert.condition.metric}{' '}
                          {alert.condition.operator === 'gt' ? '>' :
                           alert.condition.operator === 'lt' ? '<' :
                           alert.condition.operator === 'gte' ? '>=' :
                           alert.condition.operator === 'lte' ? '<=' :
                           alert.condition.operator === 'eq' ? '=' : '!='}{' '}
                          {alert.condition.value}
                          {alert.condition.unit ? ` ${alert.condition.unit}` : ''}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {alert.channels.slice(0, 2).map((channel) => (
                            <Badge key={channel} variant="secondary" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                          {alert.channels.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{alert.channels.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {alert.triggerCount > 0 ? (
                          <div>
                            <p>{formatRelativeTime(alert.lastTriggeredAt)}</p>
                            <p className="text-xs">{alert.triggerCount} {t("total")}</p>
                          </div>
                        ) : (
                          t("never")
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={alert.isActive}
                            onCheckedChange={() => handleToggleAlert(alert)}
                            className="scale-90"
                          />
                          <AlertStatusBadge
                            status={alert.isActive ? 'ACTIVE' : 'INACTIVE'}
                            size="sm"
                            showIcon={false}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingAlert(alert)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setViewingHistoryAlert(alert)}>
                              <History className="h-4 w-4 mr-2" />
                              {t("viewHistory")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingAlert(alert)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Alert Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("createNewAlert")}</DialogTitle>
            <DialogDescription>
              {t("createNewAlertDescription")}
            </DialogDescription>
          </DialogHeader>
          <AlertForm
            onSubmit={handleCreateAlert}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Alert Dialog */}
      <Dialog open={!!editingAlert} onOpenChange={() => setEditingAlert(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("editAlert")}</DialogTitle>
            <DialogDescription>
              {t("editAlertDescription")}
            </DialogDescription>
          </DialogHeader>
          {editingAlert && (
            <AlertForm
              alert={editingAlert}
              onSubmit={handleUpdateAlert}
              onCancel={() => setEditingAlert(null)}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Alert History Dialog */}
      <Dialog open={!!viewingHistoryAlert} onOpenChange={() => setViewingHistoryAlert(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("alertHistory", { name: viewingHistoryAlert?.name || "" })}</DialogTitle>
            <DialogDescription>
              {t("alertHistoryDescription")}
            </DialogDescription>
          </DialogHeader>
          {viewingHistoryAlert && (
            <AlertHistoryView alertId={viewingHistoryAlert.id} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAlert} onOpenChange={() => setDeletingAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteAlert")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteAlertDescription", { name: deletingAlert?.name || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAlert}
              className="bg-destructive text-destructive-foreground"
            >
              {t("deleteAlert")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Separate component for alert history to handle its own data fetching
function AlertHistoryView({ alertId }: { alertId: string }) {
  const t = useTranslations("settings.alerts")
  const { history, isLoading, fetchHistory, acknowledgeAlert } = useAlertHistory(alertId)

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleAcknowledge = async (
    historyId: string,
    status: 'ACKNOWLEDGED' | 'RESOLVED' | 'IGNORED',
    notes?: string
  ) => {
    try {
      await acknowledgeAlert({ historyId, status, notes })
      toast.success(t('toast.alertAcknowledged'))
    } catch {
      toast.error(t('toast.acknowledgeFailed'))
    }
  }

  return (
    <AlertHistoryTimeline
      history={history}
      isLoading={isLoading}
      onAcknowledge={handleAcknowledge}
    />
  )
}
