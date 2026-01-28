"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
  AlertCircle,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Activity,
  MessageSquare,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface Incident {
  id: string
  title: string
  description: string
  severity: string
  status: string
  type: string
  affectedServices: string[]
  affectedRegions: string[]
  impact: string | null
  rootCause: string | null
  responders: string[]
  startedAt: string
  detectedAt: string
  acknowledgedAt: string | null
  mitigatedAt: string | null
  resolvedAt: string | null
  updates: { id: string; message: string; status: string | null; createdAt: string }[]
}

export default function IncidentsPage() {
  const t = useTranslations("admin.operations.incidents")
  const tCommon = useTranslations("common")
  const tOps = useTranslations("admin.operations")

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

  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [newUpdate, setNewUpdate] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    severity: "MODERATE",
    type: "OUTAGE",
    affectedServices: [] as string[],
  })

  const severityOptions = [
    { value: "MINOR", label: tOps("severity.minor"), color: "bg-blue-500" },
    { value: "MODERATE", label: tOps("severity.moderate"), color: "bg-yellow-500" },
    { value: "MAJOR", label: tOps("severity.major"), color: "bg-orange-500" },
    { value: "CRITICAL", label: tOps("severity.critical"), color: "bg-red-500" },
  ]

  const statusOptions = [
    { value: "INVESTIGATING", label: t("status.investigating") },
    { value: "IDENTIFIED", label: t("status.identified") },
    { value: "MONITORING", label: t("status.monitoring") },
    { value: "RESOLVED", label: t("status.resolved") },
    { value: "POSTMORTEM", label: t("status.postmortem") },
  ]

  const typeOptions = [
    { value: "OUTAGE", label: t("type.outage") },
    { value: "DEGRADATION", label: t("type.degradation") },
    { value: "SECURITY", label: t("type.security") },
    { value: "DATA_ISSUE", label: t("type.dataIssue") },
    { value: "THIRD_PARTY", label: t("type.thirdParty") },
    { value: "CAPACITY", label: t("type.capacity") },
    { value: "NETWORK", label: t("type.network") },
    { value: "DATABASE", label: t("type.database") },
  ]

  useEffect(() => {
    fetchIncidents()
  }, [statusFilter, severityFilter])

  const fetchIncidents = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (severityFilter !== "all") params.set("severity", severityFilter)
      if (search) params.set("search", search)

      const response = await fetch(`/api/admin/operations/incidents?${params}`)
      const data = await response.json()
      setIncidents(data.incidents || [])
    } catch (error) {
      console.error("Failed to fetch incidents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIncident = async () => {
    try {
      const response = await fetch("/api/admin/operations/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIncident),
      })

      if (!response.ok) {
        throw new Error("Failed to create incident")
      }

      toast.success(t("toast.incidentCreated"))

      setIsCreateOpen(false)
      setNewIncident({
        title: "",
        description: "",
        severity: "MODERATE",
        type: "OUTAGE",
        affectedServices: [],
      })
      fetchIncidents()
    } catch (error) {
      toast.error(t("toast.createFailed"))
    }
  }

  const handleUpdateStatus = async (incidentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/operations/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update incident")
      }

      toast.success(t("toast.statusUpdated"))
      fetchIncidents()
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident((prev) => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      toast.error(t("toast.updateFailed"))
    }
  }

  const handleAddUpdate = async () => {
    if (!selectedIncident || !newUpdate) return

    try {
      const response = await fetch(`/api/admin/operations/incidents/${selectedIncident.id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newUpdate }),
      })

      if (!response.ok) {
        throw new Error("Failed to add update")
      }

      toast.success(t("toast.updateAdded"))
      setNewUpdate("")
      fetchIncidents()
    } catch (error) {
      toast.error(t("toast.addUpdateFailed"))
    }
  }

  const getSeverityBadge = (severity: string) => {
    const opt = severityOptions.find((o) => o.value === severity)
    return <Badge className={opt?.color || "bg-gray-500"}>{opt?.label || severity}</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <Badge className="bg-green-500">{t("status.resolved")}</Badge>
      case "MONITORING":
        return <Badge className="bg-blue-500">{t("status.monitoring")}</Badge>
      case "IDENTIFIED":
        return <Badge className="bg-yellow-500">{t("status.identified")}</Badge>
      case "INVESTIGATING":
        return <Badge className="bg-orange-500">{t("status.investigating")}</Badge>
      case "POSTMORTEM":
        return <Badge variant="secondary">{t("status.postmortem")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredIncidents = incidents.filter(
    (incident) =>
      incident.title.toLowerCase().includes(search.toLowerCase()) ||
      incident.description.toLowerCase().includes(search.toLowerCase())
  )

  const activeIncidents = incidents.filter(
    (i) => !["RESOLVED", "POSTMORTEM"].includes(i.status)
  )

  // Define columns for AdminDataTable
  const columns: Column<Incident>[] = [
    {
      id: "incident",
      header: t("table.incident"),
      cell: (incident) => (
        <div>
          <p className="font-medium">{incident.title}</p>
          <p className="text-xs text-muted-foreground">
            {t("table.started")} {new Date(incident.startedAt).toLocaleString()}
          </p>
        </div>
      ),
    },
    {
      id: "severity",
      header: t("table.severity"),
      cell: (incident) => getSeverityBadge(incident.severity),
    },
    {
      id: "status",
      header: t("table.status"),
      cell: (incident) => getStatusBadge(incident.status),
    },
    {
      id: "type",
      header: t("table.type"),
      cell: (incident) => <Badge variant="outline">{incident.type}</Badge>,
    },
    {
      id: "affectedServices",
      header: t("table.affectedServices"),
      cell: (incident) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {incident.affectedServices.slice(0, 2).map((service) => (
            <Badge key={service} variant="secondary" className="text-xs">
              {service}
            </Badge>
          ))}
          {incident.affectedServices.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{incident.affectedServices.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "duration",
      header: t("table.duration"),
      cell: (incident) =>
        incident.resolvedAt ? (
          <span className="text-xs text-muted-foreground">
            {Math.round(
              (new Date(incident.resolvedAt).getTime() -
                new Date(incident.startedAt).getTime()) /
                60000
            )}{" "}
            {t("table.min")}
          </span>
        ) : (
          <span className="text-xs text-yellow-500">{t("table.ongoing")}</span>
        ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<Incident>[] = [
    {
      label: t("actions.viewDetails"),
      icon: <ExternalLink className="h-4 w-4" />,
      onClick: (incident) => setSelectedIncident(incident),
    },
    {
      label: t("actions.changeStatus"),
      icon: <Activity className="h-4 w-4" />,
      onClick: (incident) => setSelectedIncident(incident),
    },
    {
      label: t("actions.addUpdate"),
      icon: <MessageSquare className="h-4 w-4" />,
      onClick: (incident) => {
        setSelectedIncident(incident)
        setNewUpdate("")
      },
      separator: true,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("bulk.markResolved"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: async (selectedIds) => {
        try {
          await Promise.all(
            selectedIds.map((id) =>
              fetch(`/api/admin/operations/incidents/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "RESOLVED" }),
              })
            )
          )
          toast.success(t("toast.bulkResolved", { count: selectedIds.length }))
          fetchIncidents()
        } catch (error) {
          toast.error(t("toast.bulkUpdateFailed"))
        }
      },
      confirmTitle: t("bulk.confirmResolveTitle"),
      confirmDescription: t("bulk.confirmResolveDescription"),
    },
    {
      label: t("bulk.markMonitoring"),
      icon: <Activity className="h-4 w-4" />,
      onClick: async (selectedIds) => {
        try {
          await Promise.all(
            selectedIds.map((id) =>
              fetch(`/api/admin/operations/incidents/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "MONITORING" }),
              })
            )
          )
          toast.success(t("toast.bulkMonitoring", { count: selectedIds.length }))
          fetchIncidents()
        } catch (error) {
          toast.error(t("toast.bulkUpdateFailed"))
        }
      },
    },
    {
      label: t("bulk.markInvestigating"),
      icon: <AlertTriangle className="h-4 w-4" />,
      onClick: async (selectedIds) => {
        try {
          await Promise.all(
            selectedIds.map((id) =>
              fetch(`/api/admin/operations/incidents/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "INVESTIGATING" }),
              })
            )
          )
          toast.success(t("toast.bulkInvestigating", { count: selectedIds.length }))
          fetchIncidents()
        } catch (error) {
          toast.error(t("toast.bulkUpdateFailed"))
        }
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Incident Detail Sheet */}
      <Sheet open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          {selectedIncident && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(selectedIncident.severity)}
                  {getStatusBadge(selectedIncident.status)}
                </div>
                <SheetTitle>{selectedIncident.title}</SheetTitle>
                <SheetDescription>
                  {t("table.started")} {new Date(selectedIncident.startedAt).toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="font-medium mb-2">{t("detail.description")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedIncident.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("detail.affectedServices")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.affectedServices.map((service) => (
                      <Badge key={service} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("detail.updateStatus")}</h4>
                  <Select
                    value={selectedIncident.status}
                    onValueChange={(value) =>
                      handleUpdateStatus(selectedIncident.id, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("detail.timeline")}</h4>
                  <div className="space-y-4">
                    {selectedIncident.updates.map((update) => (
                      <div key={update.id} className="flex gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <p className="text-sm">{update.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(update.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("detail.addUpdate")}</h4>
                  <Textarea
                    placeholder={t("detail.updatePlaceholder")}
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                  />
                  <Button
                    className="mt-2"
                    onClick={handleAddUpdate}
                    disabled={!newUpdate}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t("detail.postUpdate")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("reportIncident")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("dialog.title")}</DialogTitle>
              <DialogDescription>
                {t("dialog.description")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">{t("form.incidentTitle")}</Label>
                <Input
                  id="title"
                  placeholder={t("form.titlePlaceholder")}
                  value={newIncident.title}
                  onChange={(e) =>
                    setNewIncident({ ...newIncident, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">{t("form.description")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("form.descriptionPlaceholder")}
                  rows={4}
                  value={newIncident.description}
                  onChange={(e) =>
                    setNewIncident({ ...newIncident, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t("form.severity")}</Label>
                  <Select
                    value={newIncident.severity}
                    onValueChange={(value) =>
                      setNewIncident({ ...newIncident, severity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t("form.type")}</Label>
                  <Select
                    value={newIncident.type}
                    onValueChange={(value) =>
                      setNewIncident({ ...newIncident, type: value })
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
              </div>
              <div className="grid gap-2">
                <Label>{t("form.affectedServices")}</Label>
                <div className="flex flex-wrap gap-2">
                  {serviceOptions.map((service) => (
                    <Badge
                      key={service}
                      variant={
                        newIncident.affectedServices.includes(service)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => {
                        const services = newIncident.affectedServices.includes(service)
                          ? newIncident.affectedServices.filter((s) => s !== service)
                          : [...newIncident.affectedServices, service]
                        setNewIncident({ ...newIncident, affectedServices: services })
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
                onClick={handleCreateIncident}
                disabled={!newIncident.title || !newIncident.description}
              >
                {t("reportIncident")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Incidents Alert */}
      {activeIncidents.length > 0 && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold">
                  {t("activeAlert.title", { count: activeIncidents.length })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("activeAlert.breakdown", {
                    critical: activeIncidents.filter((i) => i.severity === "CRITICAL").length,
                    major: activeIncidents.filter((i) => i.severity === "MAJOR").length,
                  })}
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
            <div className="text-2xl font-bold">{incidents.length}</div>
            <p className="text-xs text-muted-foreground">{t("stats.totalIncidents")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">
              {activeIncidents.length}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.active")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {incidents.filter((i) => i.status === "RESOLVED").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.resolved")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {incidents.filter((i) => i.status === "POSTMORTEM").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.inPostmortem")}</p>
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
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filter.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.allStatus")}</SelectItem>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filter.severity")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.allSeverity")}</SelectItem>
                {severityOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Incidents Table */}
      <AdminDataTable
        data={filteredIncidents}
        columns={columns}
        getRowId={(incident) => incident.id}
        isLoading={loading}
        emptyMessage={t("emptyMessage")}
        rowActions={rowActions}
        bulkActions={bulkActions}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        enableSelection={true}
      />
    </div>
  )
}
