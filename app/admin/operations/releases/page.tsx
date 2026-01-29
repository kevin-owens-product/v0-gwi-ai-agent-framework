"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import {
  Rocket,
  Plus,
  Search,
  Calendar,
  CheckCircle,
  RefreshCw,
  Play,
  Undo,
  XCircle,
  Trash2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { Progress } from "@/components/ui/progress"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface Release {
  id: string
  version: string
  name: string | null
  description: string | null
  type: string
  status: string
  features: unknown[]
  bugFixes: unknown[]
  breakingChanges: unknown[]
  rolloutStrategy: string
  rolloutPercentage: number
  rolloutRegions: string[]
  plannedDate: string | null
  startedAt: string | null
  completedAt: string | null
  rollbackedAt: string | null
  changelogUrl: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export default function ReleasesPage() {
  const t = useTranslations("admin.operations.releases")
  const tCommon = useTranslations("common")
  const [releases, setReleases] = useState<Release[]>([])
  
  const typeOptions = [
    { value: "MAJOR", label: t("type.major"), color: "bg-purple-500" },
    { value: "MINOR", label: t("type.minor"), color: "bg-blue-500" },
    { value: "PATCH", label: t("type.patch"), color: "bg-green-500" },
    { value: "HOTFIX", label: t("type.hotfix"), color: "bg-red-500" },
  ]

  const statusOptions = [
    { value: "PLANNED", label: t("status.planned") },
    { value: "IN_DEVELOPMENT", label: t("status.inDevelopment") },
    { value: "STAGING", label: t("status.staging") },
    { value: "ROLLING_OUT", label: t("status.rollingOut") },
    { value: "COMPLETED", label: t("status.completed") },
    { value: "ROLLBACK", label: t("status.rollback") },
    { value: "CANCELLED", label: t("status.cancelled") },
  ]

  const strategyOptions = [
    { value: "BIG_BANG", label: t("strategy.bigBang") },
    { value: "STAGED", label: t("strategy.staged") },
    { value: "CANARY", label: t("strategy.canary") },
    { value: "BLUE_GREEN", label: t("strategy.blueGreen") },
    { value: "RING", label: t("strategy.ring") },
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

  const [newRelease, setNewRelease] = useState({
    version: "",
    name: "",
    description: "",
    type: "MINOR",
    rolloutStrategy: "STAGED",
    plannedDate: "",
    changelogUrl: "",
  })

  useEffect(() => {
    fetchReleases()
  }, [statusFilter, typeFilter, page])

  const fetchReleases = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(search && { search }),
      })

      const response = await fetch(`/api/admin/operations/releases?${params}`)
      const data = await response.json()
      setReleases(data.releases || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch releases:", error)
      showErrorToast(t("errors.createFailed"))
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRelease = async () => {
    try {
      const response = await fetch("/api/admin/operations/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRelease),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t("errors.createFailed"))
      }

      showSuccessToast(t("messages.releaseCreated"))
      setIsCreateOpen(false)
      setNewRelease({
        version: "",
        name: "",
        description: "",
        type: "MINOR",
        rolloutStrategy: "STAGED",
        plannedDate: "",
        changelogUrl: "",
      })
      fetchReleases()
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : t("errors.createFailed"))
    }
  }

  const handleUpdateStatus = async (releaseId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/operations/releases/${releaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      showSuccessToast(t("messages.releaseCreated"))
      fetchReleases()
    } catch (error) {
      showErrorToast(t("errors.updateFailed"))
    }
  }

  const handleDelete = async (release: Release) => {
    try {
      const response = await fetch(`/api/admin/operations/releases/${release.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t("errors.deleteFailed"))
      }

      showSuccessToast(tCommon("delete"))
      fetchReleases()
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : t("errors.deleteFailed"))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PLANNED":
        return <Badge variant="outline">{t("status.planned")}</Badge>
      case "IN_DEVELOPMENT":
        return <Badge className="bg-blue-500">{t("status.inDevelopment")}</Badge>
      case "STAGING":
        return <Badge className="bg-yellow-500">{t("status.staging")}</Badge>
      case "ROLLING_OUT":
        return <Badge className="bg-orange-500">{t("status.rollingOut")}</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-500">{t("status.completed")}</Badge>
      case "ROLLBACK":
        return <Badge className="bg-red-500">{t("status.rollback")}</Badge>
      case "CANCELLED":
        return <Badge variant="secondary">{t("status.cancelled")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const opt = typeOptions.find((o) => o.value === type)
    return <Badge className={opt?.color || "bg-gray-500"}>{opt?.label || type}</Badge>
  }

  const filteredReleases = releases.filter(
    (r) =>
      r.version.toLowerCase().includes(search.toLowerCase()) ||
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
  )

  const activeReleases = releases.filter((r) =>
    ["IN_DEVELOPMENT", "STAGING", "ROLLING_OUT"].includes(r.status)
  )

  // Define columns for AdminDataTable
  const columns: Column<Release>[] = [
    {
      id: "release",
      header: t("columns.release"),
      cell: (release) => (
        <div>
          <Link
            href={`/admin/operations/releases/${release.id}`}
            className="font-medium hover:underline"
          >
            v{release.version}
            {release.name && (
              <span className="text-muted-foreground ml-1">
                ({release.name})
              </span>
            )}
          </Link>
          {release.description && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {release.description}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "type",
      header: t("columns.type"),
      cell: (release) => getTypeBadge(release.type),
    },
    {
      id: "status",
      header: t("columns.status"),
      cell: (release) => getStatusBadge(release.status),
    },
    {
      id: "rollout",
      header: t("columns.rollout"),
      cell: (release) =>
        release.status === "ROLLING_OUT" ? (
          <div className="flex items-center gap-2">
            <Progress value={release.rolloutPercentage} className="w-16" />
            <span className="text-xs">{release.rolloutPercentage}%</span>
          </div>
        ) : (
          <Badge variant="outline">{t(`strategy.${release.rolloutStrategy.toLowerCase().replace("_", "")}`)}</Badge>
        ),
    },
    {
      id: "planned",
      header: t("columns.plannedDate"),
      cell: (release) =>
        release.plannedDate ? (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3" />
            {new Date(release.plannedDate).toLocaleDateString()}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: "features",
      header: tCommon("features"),
      cell: (release) => (
        <div className="flex gap-1">
          {Array.isArray(release.features) && release.features.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {release.features.length} {tCommon("features")}
            </Badge>
          )}
          {Array.isArray(release.bugFixes) && release.bugFixes.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {release.bugFixes.length} fixes
            </Badge>
          )}
        </div>
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<Release>[] = [
    {
      label: t("actions.startRollout"),
      icon: <Play className="h-4 w-4" />,
      onClick: (release) => handleUpdateStatus(release.id, "ROLLING_OUT"),
      hidden: (release) => release.status !== "STAGING",
    },
    {
      label: t("actions.complete"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (release) => handleUpdateStatus(release.id, "COMPLETED"),
      hidden: (release) => release.status !== "ROLLING_OUT",
    },
    {
      label: t("actions.rollback"),
      icon: <Undo className="h-4 w-4" />,
      onClick: (release) => handleUpdateStatus(release.id, "ROLLBACK"),
      variant: "destructive" as const,
      hidden: (release) => release.status !== "ROLLING_OUT",
    },
    {
      label: t("actions.cancel"),
      icon: <XCircle className="h-4 w-4" />,
      onClick: (release) => handleUpdateStatus(release.id, "CANCELLED"),
      hidden: (release) => !["PLANNED", "IN_DEVELOPMENT"].includes(release.status),
    },
  ]

  const bulkActions: BulkAction[] = [
    {
      label: tCommon("delete"),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async (ids) => {
        for (const id of ids) {
          try {
            const response = await fetch(`/api/admin/operations/releases/${id}`, {
              method: "DELETE",
            })
            if (!response.ok) {
              throw new Error(t("errors.deleteFailed"))
            }
          } catch (error) {
            showErrorToast(t("errors.deleteFailed"))
          }
        }
        showSuccessToast(tCommon("delete"))
        fetchReleases()
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
            <Rocket className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description", { total })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReleases}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {tCommon("refresh")}
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("createRelease")}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="version">{t("fields.version")}</Label>
                    <Input
                      id="version"
                      placeholder={t("placeholders.versionExample")}
                      value={newRelease.version}
                      onChange={(e) =>
                        setNewRelease({ ...newRelease, version: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">{t("fields.name")} ({tCommon("optional")})</Label>
                    <Input
                      id="name"
                      placeholder={t("placeholders.codeNameExample")}
                      value={newRelease.name}
                      onChange={(e) =>
                        setNewRelease({ ...newRelease, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t("fields.description")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("new.placeholders.description")}
                    rows={3}
                    value={newRelease.description}
                    onChange={(e) =>
                      setNewRelease({ ...newRelease, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t("fields.type")}</Label>
                    <Select
                      value={newRelease.type}
                      onValueChange={(value) =>
                        setNewRelease({ ...newRelease, type: value })
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
                    <Label>{t("fields.rolloutStrategy")}</Label>
                    <Select
                      value={newRelease.rolloutStrategy}
                      onValueChange={(value) =>
                        setNewRelease({ ...newRelease, rolloutStrategy: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {strategyOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t("fields.plannedDate")}</Label>
                    <Input
                      type="date"
                      value={newRelease.plannedDate}
                      onChange={(e) =>
                        setNewRelease({ ...newRelease, plannedDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t("fields.changelogUrl")} ({tCommon("optional")})</Label>
                    <Input
                      placeholder="https://..."
                      value={newRelease.changelogUrl}
                      onChange={(e) =>
                        setNewRelease({ ...newRelease, changelogUrl: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {tCommon("cancel")}
                </Button>
                <Button onClick={handleCreateRelease} disabled={!newRelease.version}>
                  {t("dialog.createTitle")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Releases Alert */}
      {activeReleases.length > 0 && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Rocket className="h-8 w-8 text-blue-500" />
              <div className="flex-1">
                <h3 className="font-semibold">
                  {activeReleases.length} {t("status.rollingOut")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeReleases.map((r) => `v${r.version}`).join(", ")}
                </p>
              </div>
              {activeReleases.some((r) => r.status === "ROLLING_OUT") && (
                <div className="text-right">
                  <p className="text-sm font-medium">{t("status.rollingOut")}</p>
                  <Progress
                    value={activeReleases.find((r) => r.status === "ROLLING_OUT")?.rolloutPercentage || 0}
                    className="w-32 mt-1"
                  />
                </div>
              )}
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
              {releases.filter((r) => r.status === "IN_DEVELOPMENT").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("status.inDevelopment")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">
              {releases.filter((r) => r.status === "ROLLING_OUT").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("status.rollingOut")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {releases.filter((r) => r.status === "COMPLETED").length}
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

      {/* Table */}
      <AdminDataTable
        data={filteredReleases}
        columns={columns}
        getRowId={(release) => release.id}
        isLoading={loading}
        emptyMessage={t("noReleases")}
        viewHref={(release) => `/admin/operations/releases/${release.id}`}
        onDelete={handleDelete}
        deleteConfirmTitle={tCommon("delete")}
        deleteConfirmDescription={(release) =>
          t("errors.deleteFailed")
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
