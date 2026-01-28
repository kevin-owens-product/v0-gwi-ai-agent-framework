"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
  AlertCircle,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ExternalLink,
  Eye,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
// Tabs imports removed - unused
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
import { Switch } from "@/components/ui/switch"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface Incident {
  id: string
  title: string
  description: string
  status: string
  impact: string
  affectedSystems: string[]
  startedAt: string
  resolvedAt: string | null
  isPublic: boolean
  postmortemUrl: string | null
  updates: { id: string; status: string; message: string; createdAt: string; isPublic: boolean }[]
}

// Subscription interface removed - unused

export default function AdminStatusPage() {
  const t = useTranslations("admin.status")
  const tCommon = useTranslations("common")
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [impactFilter, setImpactFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [newUpdate, setNewUpdate] = useState("")
  const [newUpdateStatus, setNewUpdateStatus] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const statusOptions = [
    { value: "INVESTIGATING", label: t("status.investigating") },
    { value: "IDENTIFIED", label: t("status.identified") },
    { value: "MONITORING", label: t("status.monitoring") },
    { value: "RESOLVED", label: t("status.resolved") },
    { value: "POSTMORTEM", label: t("status.postmortem") },
  ]

  const impactOptions = [
    { value: "NONE", label: t("impact.none"), color: "bg-gray-500" },
    { value: "MINOR", label: t("impact.minor"), color: "bg-yellow-500" },
    { value: "MAJOR", label: t("impact.major"), color: "bg-orange-500" },
    { value: "CRITICAL", label: t("impact.critical"), color: "bg-red-500" },
  ]

  const systemOptions = [
    t("systems.apiGateway"),
    t("systems.authentication"),
    t("systems.database"),
    t("systems.fileStorage"),
    t("systems.analytics"),
    t("systems.search"),
    t("systems.notifications"),
    t("systems.messaging"),
    t("systems.payments"),
  ]

  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    status: "INVESTIGATING",
    impact: "MINOR",
    affectedSystems: [] as string[],
    isPublic: true,
  })

  useEffect(() => {
    fetchIncidents()
  }, [statusFilter, impactFilter])

  const fetchIncidents = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (impactFilter !== "all") params.set("impact", impactFilter)
      if (search) params.set("search", search)

      const response = await fetch(`/api/admin/status/incidents?${params}`)
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
      const response = await fetch("/api/admin/status/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIncident),
      })

      if (!response.ok) {
        throw new Error("Failed to create incident")
      }

      showSuccessToast(t("toast.incidentCreated"))

      setIsCreateOpen(false)
      setNewIncident({
        title: "",
        description: "",
        status: "INVESTIGATING",
        impact: "MINOR",
        affectedSystems: [],
        isPublic: true,
      })
      fetchIncidents()
    } catch (error) {
      showErrorToast(t("toast.createFailed"))
    }
  }

  const handleUpdateStatus = async (incidentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/status/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update incident")
      }

      showSuccessToast(t("toast.incidentUpdated"))
      fetchIncidents()
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
    } catch (error) {
      showErrorToast(t("toast.updateFailed"))
    }
  }

  const handleAddUpdate = async () => {
    if (!selectedIncident || !newUpdate) return

    try {
      const response = await fetch(
        `/api/admin/status/incidents/${selectedIncident.id}/updates`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: newUpdate,
            status: newUpdateStatus || undefined,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to add update")
      }

      showSuccessToast(t("toast.updatePosted"))
      setNewUpdate("")
      setNewUpdateStatus("")
      fetchIncidents()
    } catch (error) {
      showErrorToast(t("toast.addUpdateFailed"))
    }
  }

  const handleDeleteIncident = async (incidentId: string) => {
    try {
      const response = await fetch(`/api/admin/status/incidents/${incidentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete incident")
      }

      showSuccessToast(t("toast.incidentDeleted"))
      fetchIncidents()
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident(null)
      }
    } catch (error) {
      showErrorToast(t("toast.deleteFailed"))
    }
  }

  const getImpactBadge = (impact: string) => {
    const opt = impactOptions.find((o) => o.value === impact)
    return <Badge className={opt?.color || "bg-gray-500"}>{opt?.label || impact}</Badge>
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
      header: t("columns.incident"),
      cell: (incident) => (
        <div className="flex items-start gap-2">
          {incident.isPublic ? (
            <Eye className="h-4 w-4 text-muted-foreground mt-1" />
          ) : (
            <span className="h-4 w-4" />
          )}
          <div>
            <p className="font-medium">{incident.title}</p>
            <p className="text-xs text-muted-foreground">
              {t("detail.started")} {new Date(incident.startedAt).toLocaleString()}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "impact",
      header: t("columns.impact"),
      cell: (incident) => getImpactBadge(incident.impact),
    },
    {
      id: "status",
      header: t("columns.status"),
      cell: (incident) => getStatusBadge(incident.status),
    },
    {
      id: "affectedSystems",
      header: t("columns.affectedSystems"),
      cell: (incident) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {incident.affectedSystems.slice(0, 2).map((system) => (
            <Badge key={system} variant="secondary" className="text-xs">
              {system}
            </Badge>
          ))}
          {incident.affectedSystems.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{incident.affectedSystems.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "updates",
      header: t("columns.updates"),
      cell: (incident) => (
        <span className="text-muted-foreground">{incident.updates.length}</span>
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
      label: t("actions.addUpdate"),
      icon: <MessageSquare className="h-4 w-4" />,
      onClick: (incident) => {
        setSelectedIncident(incident)
        setNewUpdate("")
        setNewUpdateStatus("")
      },
    },
    {
      label: t("actions.delete"),
      icon: <AlertCircle className="h-4 w-4" />,
      onClick: (incident) => handleDeleteIncident(incident.id),
      variant: "destructive",
      separator: true,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.markAsResolved"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: async (selectedIds) => {
        try {
          await Promise.all(
            selectedIds.map((id) =>
              fetch(`/api/admin/status/incidents/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "RESOLVED" }),
              })
            )
          )
          showSuccessToast(t("toast.markedResolved", { count: selectedIds.length }))
          fetchIncidents()
        } catch (error) {
          showErrorToast(t("toast.updateIncidentsFailed"))
        }
      },
      confirmTitle: t("actions.markIncidentsResolved"),
      confirmDescription: t("actions.markResolvedConfirm"),
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
                  {getImpactBadge(selectedIncident.impact)}
                  {getStatusBadge(selectedIncident.status)}
                  {selectedIncident.isPublic && (
                    <Badge variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      {t("detail.public")}
                    </Badge>
                  )}
                </div>
                <SheetTitle>{selectedIncident.title}</SheetTitle>
                <SheetDescription>
                  {t("detail.started")} {new Date(selectedIncident.startedAt).toLocaleString()}
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
                  <h4 className="font-medium mb-2">{t("detail.affectedSystems")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.affectedSystems.map((system) => (
                      <Badge key={system} variant="outline">
                        {system}
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
                          <div className="flex items-center gap-2">
                            {getStatusBadge(update.status)}
                            {!update.isPublic && (
                              <Badge variant="outline" className="text-xs">{t("detail.internal")}</Badge>
                            )}
                          </div>
                          <p className="text-sm mt-1">{update.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(update.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("detail.postUpdate")}</h4>
                  <div className="space-y-3">
                    <Select
                      value={newUpdateStatus}
                      onValueChange={setNewUpdateStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("detail.changeStatusOptional")} />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder={t("detail.enterStatusUpdate")}
                      value={newUpdate}
                      onChange={(e) => setNewUpdate(e.target.value)}
                    />
                    <Button
                      onClick={handleAddUpdate}
                      disabled={!newUpdate}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t("detail.postUpdateButton")}
                    </Button>
                  </div>
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
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/status" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              {t("viewPublicPage")}
            </a>
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("createIncident")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t("createStatusPageIncident")}</DialogTitle>
                <DialogDescription>
                  {t("createNewIncident")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">{t("incidentTitle")}</Label>
                  <Input
                    id="title"
                    placeholder={t("placeholders.incidentTitle")}
                    value={newIncident.title}
                    onChange={(e) =>
                      setNewIncident({ ...newIncident, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("placeholders.description")}
                    rows={4}
                    value={newIncident.description}
                    onChange={(e) =>
                      setNewIncident({ ...newIncident, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t("impact")}</Label>
                    <Select
                      value={newIncident.impact}
                      onValueChange={(value) =>
                        setNewIncident({ ...newIncident, impact: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {impactOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t("status")}</Label>
                    <Select
                      value={newIncident.status}
                      onValueChange={(value) =>
                        setNewIncident({ ...newIncident, status: value })
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
                </div>
                <div className="grid gap-2">
                  <Label>{t("affectedSystems")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {systemOptions.map((system) => (
                      <Badge
                        key={system}
                        variant={
                          newIncident.affectedSystems.includes(system)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          const systems = newIncident.affectedSystems.includes(system)
                            ? newIncident.affectedSystems.filter((s) => s !== system)
                            : [...newIncident.affectedSystems, system]
                          setNewIncident({ ...newIncident, affectedSystems: systems })
                        }}
                      >
                        {system}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isPublic"
                    checked={newIncident.isPublic}
                    onCheckedChange={(checked) =>
                      setNewIncident({ ...newIncident, isPublic: checked })
                    }
                  />
                  <Label htmlFor="isPublic">{t("displayOnPublic")}</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleCreateIncident}
                  disabled={!newIncident.title || !newIncident.description}
                >
                  {t("createIncident")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Incidents Alert */}
      {activeIncidents.length > 0 && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="font-semibold">
                  {activeIncidents.length} {t("active")} {activeIncidents.length !== 1 ? tCommon("incidents") : tCommon("incident")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeIncidents.filter((i) => i.impact === "CRITICAL").length} {t("critical")},{" "}
                  {activeIncidents.filter((i) => i.impact === "MAJOR").length} {t("major")},{" "}
                  {activeIncidents.filter((i) => i.impact === "MINOR").length} {t("minor")}
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
            <p className="text-xs text-muted-foreground">{t("totalIncidents")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">
              {activeIncidents.length}
            </div>
            <p className="text-xs text-muted-foreground">{t("active")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {incidents.filter((i) => i.status === "RESOLVED").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("resolved")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {incidents.filter((i) => i.isPublic).length}
            </div>
            <p className="text-xs text-muted-foreground">{t("public")}</p>
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
                <SelectValue placeholder={t("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={impactFilter} onValueChange={setImpactFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("impact")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allImpact")}</SelectItem>
                {impactOptions.map((opt) => (
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
        emptyMessage={t("noIncidentsFound")}
        rowActions={rowActions}
        bulkActions={bulkActions}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        enableSelection={true}
      />
    </div>
  )
}
