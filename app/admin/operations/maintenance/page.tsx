"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import {
  Wrench,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  XCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

interface MaintenanceWindow {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  affectedServices: string[]
  affectedRegions: string[]
  scheduledStart: string
  scheduledEnd: string
  actualStart: string | null
  actualEnd: string | null
  notifyBefore: number
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export default function MaintenancePage() {
  const t = useTranslations("admin.operations.maintenance")
  const tCommon = useTranslations("common")
  const tOps = useTranslations("admin.operations")
  const [windows, setWindows] = useState<MaintenanceWindow[]>([])

  const serviceOptions = [
    tOps("services.apiGateway"),
    tOps("services.authentication"),
    tOps("services.database"),
    tOps("services.fileStorage"),
    tOps("services.messaging"),
    tOps("services.search"),
    tOps("services.analytics"),
    tOps("services.payments"),
    tOps("services.notifications"),
  ]
  
  const typeOptions = [
    { value: "SCHEDULED", label: t("type.scheduled") },
    { value: "EMERGENCY", label: t("type.emergency") },
    { value: "UPGRADE", label: t("type.upgrade") },
    { value: "MIGRATION", label: t("type.migration") },
    { value: "SECURITY_PATCH", label: t("type.securityPatch") },
  ]

  const statusOptions = [
    { value: "SCHEDULED", label: t("status.scheduled") },
    { value: "IN_PROGRESS", label: t("status.inProgress") },
    { value: "COMPLETED", label: t("status.completed") },
    { value: "CANCELLED", label: t("status.cancelled") },
    { value: "EXTENDED", label: t("status.extended") },
  ]
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [newWindow, setNewWindow] = useState({
    title: "",
    description: "",
    type: "SCHEDULED",
    affectedServices: [] as string[],
    scheduledStart: "",
    scheduledEnd: "",
    notifyBefore: 24,
  })

  useEffect(() => {
    fetchWindows()
  }, [statusFilter, typeFilter, page])

  const fetchWindows = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
      })

      const response = await fetch(`/api/admin/operations/maintenance?${params}`)
      const data = await response.json()
      setWindows(data.windows || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch maintenance windows:", error)
      showErrorToast(t("errors.createFailed"))
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWindow = async () => {
    try {
      const response = await fetch("/api/admin/operations/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWindow),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t("errors.createFailed"))
      }

      showSuccessToast(t("messages.windowScheduled"))
      setIsCreateOpen(false)
      setNewWindow({
        title: "",
        description: "",
        type: "SCHEDULED",
        affectedServices: [],
        scheduledStart: "",
        scheduledEnd: "",
        notifyBefore: 24,
      })
      fetchWindows()
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : t("errors.createFailed"))
    }
  }

  const handleUpdateStatus = async (windowId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/operations/maintenance/${windowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      showSuccessToast(t("messages.windowStarted"))
      fetchWindows()
    } catch (error) {
      showErrorToast(t("errors.updateFailed"))
    }
  }

  const handleDelete = async (window: MaintenanceWindow) => {
    try {
      const response = await fetch(`/api/admin/operations/maintenance/${window.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t("errors.deleteFailed"))
      }

      showSuccessToast(t("messages.windowCancelled"))
      fetchWindows()
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : t("errors.deleteFailed"))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Badge className="bg-blue-500">{t("status.scheduled")}</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-yellow-500">{t("status.inProgress")}</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-500">{t("status.completed")}</Badge>
      case "CANCELLED":
        return <Badge variant="secondary">{t("status.cancelled")}</Badge>
      case "EXTENDED":
        return <Badge className="bg-orange-500">{t("status.extended")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "EMERGENCY":
        return <Badge className="bg-red-500">{t("type.emergency")}</Badge>
      case "SECURITY_PATCH":
        return <Badge className="bg-purple-500">{t("type.securityPatch")}</Badge>
      case "SCHEDULED":
        return <Badge variant="outline">{t("type.scheduled")}</Badge>
      case "UPGRADE":
        return <Badge variant="outline">{t("type.upgrade")}</Badge>
      case "MIGRATION":
        return <Badge variant="outline">{t("type.migration")}</Badge>
      default:
        return <Badge variant="outline">{type.replace("_", " ")}</Badge>
    }
  }

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diff = endDate.getTime() - startDate.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const filteredWindows = windows.filter(
    (w) =>
      w.title.toLowerCase().includes(search.toLowerCase()) ||
      w.description?.toLowerCase().includes(search.toLowerCase())
  )

  const upcomingWindows = windows.filter(
    (w) => w.status === "SCHEDULED" && new Date(w.scheduledStart) > new Date()
  )
  const inProgressWindows = windows.filter((w) => w.status === "IN_PROGRESS")

  // Define columns for AdminDataTable
  const columns: Column<MaintenanceWindow>[] = [
    {
      id: "window",
      header: t("columns.window"),
      cell: (window) => (
        <div>
          <Link
            href={`/admin/operations/maintenance/${window.id}`}
            className="font-medium hover:underline"
          >
            {window.title}
          </Link>
          {window.description && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {window.description}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "type",
      header: t("columns.type"),
      cell: (window) => getTypeBadge(window.type),
    },
    {
      id: "status",
      header: t("columns.status"),
      cell: (window) => getStatusBadge(window.status),
    },
    {
      id: "scheduled",
      header: t("columns.scheduledStart"),
      cell: (window) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(window.scheduledStart).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(window.scheduledStart).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
    },
    {
      id: "duration",
      header: t("columns.duration"),
      cell: (window) => formatDuration(window.scheduledStart, window.scheduledEnd),
    },
    {
      id: "services",
      header: t("columns.affectedServices"),
      cell: (window) => (
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {window.affectedServices.slice(0, 2).map((service) => (
            <Badge key={service} variant="secondary" className="text-xs">
              {service}
            </Badge>
          ))}
          {window.affectedServices.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{window.affectedServices.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<MaintenanceWindow>[] = [
    {
      label: t("actions.start"),
      icon: <Play className="h-4 w-4" />,
      onClick: (window) => handleUpdateStatus(window.id, "IN_PROGRESS"),
      hidden: (window) => window.status !== "SCHEDULED",
    },
    {
      label: t("actions.complete"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (window) => handleUpdateStatus(window.id, "COMPLETED"),
      hidden: (window) => window.status !== "IN_PROGRESS",
    },
    {
      label: t("actions.cancel"),
      icon: <XCircle className="h-4 w-4" />,
      onClick: (window) => handleUpdateStatus(window.id, "CANCELLED"),
      hidden: (window) => window.status !== "SCHEDULED",
      separator: true,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("bulk.cancelSelected"),
      icon: <XCircle className="h-4 w-4" />,
      onClick: async (selectedIds) => {
        try {
          await Promise.all(
            selectedIds.map((id) =>
              fetch(`/api/admin/operations/maintenance/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CANCELLED" }),
              })
            )
          )
          showSuccessToast(t("messages.windowCancelled"))
          fetchWindows()
        } catch (error) {
          showErrorToast(t("errors.updateFailed"))
        }
      },
      variant: "destructive",
      confirmTitle: t("bulk.cancelTitle"),
      confirmDescription: t("bulk.cancelConfirm"),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wrench className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description", { total })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchWindows}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {tCommon("refresh")}
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("createWindow")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t("dialog.createTitle")}</DialogTitle>
                <DialogDescription>
                  {t("dialog.createDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">{t("fields.title")}</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Database upgrade"
                    value={newWindow.title}
                    onChange={(e) =>
                      setNewWindow({ ...newWindow, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t("fields.description")}</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the maintenance..."
                    rows={3}
                    value={newWindow.description}
                    onChange={(e) =>
                      setNewWindow({ ...newWindow, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t("fields.type")}</Label>
                    <Select
                      value={newWindow.type}
                      onValueChange={(value) =>
                        setNewWindow({ ...newWindow, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t("fields.notifyBefore")}</Label>
                    <Input
                      type="number"
                      value={newWindow.notifyBefore}
                      onChange={(e) =>
                        setNewWindow({
                          ...newWindow,
                          notifyBefore: parseInt(e.target.value) || 24,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t("fields.scheduledStart")}</Label>
                    <Input
                      type="datetime-local"
                      value={newWindow.scheduledStart}
                      onChange={(e) =>
                        setNewWindow({ ...newWindow, scheduledStart: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t("fields.scheduledEnd")}</Label>
                    <Input
                      type="datetime-local"
                      value={newWindow.scheduledEnd}
                      onChange={(e) =>
                        setNewWindow({ ...newWindow, scheduledEnd: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>{t("fields.affectedServices")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {serviceOptions.map((service) => (
                      <Badge
                        key={service}
                        variant={
                          newWindow.affectedServices.includes(service)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          const services = newWindow.affectedServices.includes(service)
                            ? newWindow.affectedServices.filter((s) => s !== service)
                            : [...newWindow.affectedServices, service]
                          setNewWindow({ ...newWindow, affectedServices: services })
                        }}
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {tCommon("cancel")}
                </Button>
                <Button
                  onClick={handleCreateWindow}
                  disabled={
                    !newWindow.title ||
                    !newWindow.scheduledStart ||
                    !newWindow.scheduledEnd
                  }
                >
                  {t("dialog.createTitle")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerts */}
      {inProgressWindows.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <h3 className="font-semibold">
                  {inProgressWindows.length} {t("status.inProgress")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {inProgressWindows.map((w) => w.title).join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">{tCommon("total")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {upcomingWindows.length}
            </div>
            <p className="text-xs text-muted-foreground">{t("status.scheduled")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {inProgressWindows.length}
            </div>
            <p className="text-xs text-muted-foreground">{t("status.inProgress")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {windows.filter((w) => w.status === "COMPLETED").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("status.completed")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={tCommon("search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <AdminDataTable
        data={filteredWindows}
        columns={columns}
        getRowId={(window) => window.id}
        isLoading={loading}
        emptyMessage={t("noWindows")}
        viewHref={(window) => `/admin/operations/maintenance/${window.id}`}
        onDelete={handleDelete}
        deleteConfirmTitle="Delete Maintenance Window"
        deleteConfirmDescription={(window) =>
          `Are you sure you want to delete the maintenance window "${window.title}"? This action cannot be undone.`
        }
        rowActions={rowActions}
        bulkActions={bulkActions}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  )
}
