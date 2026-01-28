"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Puzzle,
  Plus,
  Search,
  Star,
  Building2,
  Download,
  CheckCircle,
  Clock,
  Shield,
  XCircle,
  Trash,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface IntegrationApp {
  id: string
  slug: string
  name: string
  description: string | null
  shortDescription: string | null
  category: string
  developer: string
  developerUrl: string | null
  iconUrl: string | null
  status: string
  isOfficial: boolean
  isFeatured: boolean
  installCount: number
  rating: number | null
  reviewCount: number
  publishedAt: string | null
  createdAt: string
  _count: {
    installations: number
  }
}

export default function IntegrationAppsPage() {
  const t = useTranslations("admin.integrations.apps")
  const tCommon = useTranslations("common")

  const categories = [
    { value: "PRODUCTIVITY", label: t("categories.productivity") },
    { value: "COMMUNICATION", label: t("categories.communication") },
    { value: "PROJECT_MANAGEMENT", label: t("categories.projectManagement") },
    { value: "CRM", label: t("categories.crm") },
    { value: "ANALYTICS", label: t("categories.analytics") },
    { value: "SECURITY", label: t("categories.security") },
    { value: "DEVELOPER_TOOLS", label: t("categories.developerTools") },
    { value: "HR", label: t("categories.hr") },
    { value: "FINANCE", label: t("categories.finance") },
    { value: "MARKETING", label: t("categories.marketing") },
    { value: "CUSTOMER_SUPPORT", label: t("categories.customerSupport") },
    { value: "OTHER", label: t("categories.other") },
  ]

  const statuses = [
    { value: "DRAFT", label: t("status.draft") },
    { value: "PENDING_REVIEW", label: t("status.pendingReview") },
    { value: "APPROVED", label: t("status.approved") },
    { value: "PUBLISHED", label: t("status.published") },
    { value: "DEPRECATED", label: t("status.deprecated") },
    { value: "REMOVED", label: t("status.removed") },
  ]

  const [apps, setApps] = useState<IntegrationApp[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [newApp, setNewApp] = useState({
    name: "",
    shortDescription: "",
    description: "",
    category: "OTHER",
    developer: "",
    developerUrl: "",
    iconUrl: "",
    isOfficial: false,
    isFeatured: false,
  })

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchApps()
  }, [statusFilter, categoryFilter, page])

  const fetchApps = async () => {
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (categoryFilter !== "all") params.set("category", categoryFilter)
      if (search) params.set("search", search)

      const response = await fetch(`/api/admin/integrations/apps?${params}`)
      const data = await response.json()
      setApps(data.apps || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
      setCategoryCounts(data.categoryCounts || {})
    } catch (error) {
      console.error("Failed to fetch apps:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateApp = async () => {
    try {
      const response = await fetch("/api/admin/integrations/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newApp),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create app")
      }

      toast.success(t("toast.appCreated"))

      setIsCreateOpen(false)
      setNewApp({
        name: "",
        shortDescription: "",
        description: "",
        category: "OTHER",
        developer: "",
        developerUrl: "",
        iconUrl: "",
        isOfficial: false,
        isFeatured: false,
      })
      fetchApps()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t("toast.createFailed"))
    }
  }

  const handleToggleFeatured = async (app: IntegrationApp) => {
    try {
      const response = await fetch(`/api/admin/integrations/apps/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !app.isFeatured }),
      })

      if (!response.ok) {
        throw new Error("Failed to update app")
      }

      toast.success(app.isFeatured ? t("toast.removedFromFeatured") : t("toast.addedToFeatured"))
      fetchApps()
    } catch (error) {
      toast.error(t("toast.updateFailed"))
    }
  }

  const handleUpdateStatus = async (app: IntegrationApp, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/integrations/apps/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update app")
      }

      toast.success(t("toast.statusUpdated", { status: newStatus.toLowerCase() }))
      fetchApps()
    } catch (error) {
      toast.error(t("toast.updateStatusFailed"))
    }
  }

  const handleDeleteApp = async (app: IntegrationApp) => {
    try {
      const response = await fetch(`/api/admin/integrations/apps/${app.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete app")
      }

      toast.success(t("toast.appDeleted"))
      fetchApps()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t("toast.deleteFailed"))
    }
  }

  const handleBulkStatusUpdate = async (ids: string[], newStatus: string) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/integrations/apps/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      )
      toast.success(t("toast.bulkStatusUpdated", { count: ids.length, status: newStatus.toLowerCase() }))
      fetchApps()
    } catch (error) {
      toast.error(t("toast.bulkUpdateFailed"))
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/integrations/apps/${id}`, {
            method: "DELETE",
          })
        )
      )
      toast.success(t("toast.bulkDeleted", { count: ids.length }))
      fetchApps()
    } catch (error) {
      toast.error(t("toast.bulkDeleteFailed"))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-500">{t("status.published")}</Badge>
      case "APPROVED":
        return <Badge className="bg-blue-500">{t("status.approved")}</Badge>
      case "PENDING_REVIEW":
        return <Badge className="bg-yellow-500">{t("status.pendingReview")}</Badge>
      case "DRAFT":
        return <Badge variant="outline">{t("status.draft")}</Badge>
      case "DEPRECATED":
        return <Badge variant="secondary">{t("status.deprecated")}</Badge>
      case "REMOVED":
        return <Badge variant="destructive">{t("status.removed")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.slug.toLowerCase().includes(search.toLowerCase()) ||
      app.developer.toLowerCase().includes(search.toLowerCase()) ||
      app.description?.toLowerCase().includes(search.toLowerCase())
  )

  // Column definitions
  const columns: Column<IntegrationApp>[] = [
    {
      id: "app",
      header: t("table.app"),
      cell: (app) => (
        <div className="flex items-center gap-3">
          {app.iconUrl ? (
            <img
              src={app.iconUrl}
              alt={app.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Puzzle className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{app.name}</p>
              {app.isOfficial && (
                <span title={t("badges.official")}>
                  <Shield className="h-4 w-4 text-blue-500" />
                </span>
              )}
              {app.isFeatured && (
                <span title={t("badges.featured")}>
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {app.shortDescription || app.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: t("table.category"),
      cell: (app) => (
        <Badge variant="outline">
          {categories.find((c) => c.value === app.category)?.label || app.category}
        </Badge>
      ),
    },
    {
      id: "developer",
      header: t("table.developer"),
      cell: (app) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{app.developer}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: t("table.status"),
      cell: (app) => getStatusBadge(app.status),
    },
    {
      id: "installs",
      header: t("table.installs"),
      cell: (app) => (
        <div className="flex items-center gap-1">
          <Download className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatNumber(app.installCount)}</span>
        </div>
      ),
    },
    {
      id: "rating",
      header: t("table.rating"),
      cell: (app) =>
        app.rating ? (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm">{app.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({app.reviewCount})</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{t("table.noReviews")}</span>
        ),
    },
  ]

  // Row actions
  const rowActions: RowAction<IntegrationApp>[] = [
    {
      label: t("actions.makeFeatured"),
      icon: <Star className="h-4 w-4" />,
      onClick: handleToggleFeatured,
      hidden: (app) => app.isFeatured,
    },
    {
      label: t("actions.removeFeatured"),
      icon: <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />,
      onClick: handleToggleFeatured,
      hidden: (app) => !app.isFeatured,
    },
    {
      separator: true,
      label: t("actions.approve"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (app) => handleUpdateStatus(app, "APPROVED"),
      hidden: (app) => app.status === "APPROVED",
    },
    {
      label: t("actions.publish"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (app) => handleUpdateStatus(app, "PUBLISHED"),
      hidden: (app) => app.status === "PUBLISHED",
    },
    {
      label: t("actions.deprecate"),
      icon: <Clock className="h-4 w-4" />,
      onClick: (app) => handleUpdateStatus(app, "DEPRECATED"),
      hidden: (app) => app.status === "DEPRECATED",
    },
    {
      label: t("actions.remove"),
      icon: <XCircle className="h-4 w-4" />,
      onClick: (app) => handleUpdateStatus(app, "REMOVED"),
      variant: "destructive",
      hidden: (app) => app.status === "REMOVED",
    },
  ]

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("bulkActions.approveSelected"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusUpdate(ids, "APPROVED"),
      confirmTitle: t("bulkActions.approveConfirmTitle"),
      confirmDescription: t("bulkActions.approveConfirmDescription"),
    },
    {
      label: t("bulkActions.publishSelected"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusUpdate(ids, "PUBLISHED"),
      confirmTitle: t("bulkActions.publishConfirmTitle"),
      confirmDescription: t("bulkActions.publishConfirmDescription"),
    },
    {
      label: t("bulkActions.deprecateSelected"),
      icon: <Clock className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusUpdate(ids, "DEPRECATED"),
      confirmTitle: t("bulkActions.deprecateConfirmTitle"),
      confirmDescription: t("bulkActions.deprecateConfirmDescription"),
    },
    {
      separator: true,
      label: t("bulkActions.deleteSelected"),
      icon: <Trash className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      confirmTitle: t("bulkActions.deleteConfirmTitle"),
      confirmDescription: t("bulkActions.deleteConfirmDescription"),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Puzzle className="h-8 w-8 text-primary" />
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
              {t("createButton")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("createDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("createDialog.description")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("form.appNameRequired")}</Label>
                  <Input
                    id="name"
                    placeholder={t("form.appNamePlaceholder")}
                    value={newApp.name}
                    onChange={(e) =>
                      setNewApp({ ...newApp, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("form.categoryRequired")}</Label>
                  <Select
                    value={newApp.category}
                    onValueChange={(value) =>
                      setNewApp({ ...newApp, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shortDescription">{t("form.shortDescription")}</Label>
                <Input
                  id="shortDescription"
                  placeholder={t("form.shortDescriptionPlaceholder")}
                  value={newApp.shortDescription}
                  onChange={(e) =>
                    setNewApp({ ...newApp, shortDescription: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">{t("form.fullDescription")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("form.fullDescriptionPlaceholder")}
                  value={newApp.description}
                  onChange={(e) =>
                    setNewApp({ ...newApp, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="developer">{t("form.developerRequired")}</Label>
                  <Input
                    id="developer"
                    placeholder={t("form.developerPlaceholder")}
                    value={newApp.developer}
                    onChange={(e) =>
                      setNewApp({ ...newApp, developer: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="developerUrl">{t("form.developerUrl")}</Label>
                  <Input
                    id="developerUrl"
                    placeholder={t("form.developerUrlPlaceholder")}
                    value={newApp.developerUrl}
                    onChange={(e) =>
                      setNewApp({ ...newApp, developerUrl: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iconUrl">{t("form.iconUrl")}</Label>
                <Input
                  id="iconUrl"
                  placeholder={t("form.iconUrlPlaceholder")}
                  value={newApp.iconUrl}
                  onChange={(e) =>
                    setNewApp({ ...newApp, iconUrl: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isOfficial"
                    checked={newApp.isOfficial}
                    onCheckedChange={(checked) =>
                      setNewApp({ ...newApp, isOfficial: checked as boolean })
                    }
                  />
                  <Label htmlFor="isOfficial">{t("form.officialApp")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isFeatured"
                    checked={newApp.isFeatured}
                    onCheckedChange={(checked) =>
                      setNewApp({ ...newApp, isFeatured: checked as boolean })
                    }
                  />
                  <Label htmlFor="isFeatured">{t("form.featuredApp")}</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button
                onClick={handleCreateApp}
                disabled={!newApp.name || !newApp.developer}
              >
                {t("createButton")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{apps.length}</div>
            <p className="text-xs text-muted-foreground">{t("stats.totalApps")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {apps.filter((a) => a.status === "PUBLISHED").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.published")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {formatNumber(apps.reduce((acc, a) => acc + a.installCount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.totalInstalls")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {apps.filter((a) => a.isFeatured).length}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.featured")}</p>
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
                  placeholder={t("filters.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={tCommon("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("table.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label} {categoryCounts[cat.value] ? `(${categoryCounts[cat.value]})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Apps Table */}
      <AdminDataTable<IntegrationApp>
        data={filteredApps}
        columns={columns}
        getRowId={(app) => app.id}
        isLoading={loading}
        emptyMessage={t("table.noAppsFound")}
        viewHref={(app) => `/admin/integrations/apps/${app.id}`}
        onDelete={handleDeleteApp}
        deleteConfirmTitle={t("deleteDialog.title")}
        deleteConfirmDescription={(app) =>
          t("deleteDialog.description", { name: app.name })
        }
        rowActions={rowActions}
        bulkActions={bulkActions}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        enableSelection={true}
      />
    </div>
  )
}
