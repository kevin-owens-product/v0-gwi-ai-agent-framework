"use client"

import { useEffect, useState } from "react"
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

const categories = [
  { value: "PRODUCTIVITY", label: "Productivity" },
  { value: "COMMUNICATION", label: "Communication" },
  { value: "PROJECT_MANAGEMENT", label: "Project Management" },
  { value: "CRM", label: "CRM" },
  { value: "ANALYTICS", label: "Analytics" },
  { value: "SECURITY", label: "Security" },
  { value: "DEVELOPER_TOOLS", label: "Developer Tools" },
  { value: "HR", label: "HR" },
  { value: "FINANCE", label: "Finance" },
  { value: "MARKETING", label: "Marketing" },
  { value: "CUSTOMER_SUPPORT", label: "Customer Support" },
  { value: "OTHER", label: "Other" },
]

const statuses = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DEPRECATED", label: "Deprecated" },
  { value: "REMOVED", label: "Removed" },
]

export default function IntegrationAppsPage() {
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

      toast.success("Integration app created")

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
      toast.error(error instanceof Error ? error.message : "Failed to create app")
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

      toast.success(app.isFeatured ? "Removed from featured" : "Added to featured")
      fetchApps()
    } catch (error) {
      toast.error("Failed to update app")
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

      toast.success(`Status updated to ${newStatus.toLowerCase()}`)
      fetchApps()
    } catch (error) {
      toast.error("Failed to update status")
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

      toast.success("Integration app deleted")
      fetchApps()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete app")
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
      toast.success(`${ids.length} app(s) updated to ${newStatus.toLowerCase()}`)
      fetchApps()
    } catch (error) {
      toast.error("Failed to update apps")
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
      toast.success(`${ids.length} app(s) deleted`)
      fetchApps()
    } catch (error) {
      toast.error("Failed to delete apps")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-500">Published</Badge>
      case "APPROVED":
        return <Badge className="bg-blue-500">Approved</Badge>
      case "PENDING_REVIEW":
        return <Badge className="bg-yellow-500">Pending Review</Badge>
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>
      case "DEPRECATED":
        return <Badge variant="secondary">Deprecated</Badge>
      case "REMOVED":
        return <Badge variant="destructive">Removed</Badge>
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
      header: "App",
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
                <span title="Official">
                  <Shield className="h-4 w-4 text-blue-500" />
                </span>
              )}
              {app.isFeatured && (
                <span title="Featured">
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
      header: "Category",
      cell: (app) => (
        <Badge variant="outline">
          {categories.find((c) => c.value === app.category)?.label || app.category}
        </Badge>
      ),
    },
    {
      id: "developer",
      header: "Developer",
      cell: (app) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{app.developer}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (app) => getStatusBadge(app.status),
    },
    {
      id: "installs",
      header: "Installs",
      cell: (app) => (
        <div className="flex items-center gap-1">
          <Download className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatNumber(app.installCount)}</span>
        </div>
      ),
    },
    {
      id: "rating",
      header: "Rating",
      cell: (app) =>
        app.rating ? (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm">{app.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({app.reviewCount})</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No reviews</span>
        ),
    },
  ]

  // Row actions
  const rowActions: RowAction<IntegrationApp>[] = [
    {
      label: "Make Featured",
      icon: <Star className="h-4 w-4" />,
      onClick: handleToggleFeatured,
      hidden: (app) => app.isFeatured,
    },
    {
      label: "Remove Featured",
      icon: <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />,
      onClick: handleToggleFeatured,
      hidden: (app) => !app.isFeatured,
    },
    {
      separator: true,
      label: "Approve",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (app) => handleUpdateStatus(app, "APPROVED"),
      hidden: (app) => app.status === "APPROVED",
    },
    {
      label: "Publish",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (app) => handleUpdateStatus(app, "PUBLISHED"),
      hidden: (app) => app.status === "PUBLISHED",
    },
    {
      label: "Deprecate",
      icon: <Clock className="h-4 w-4" />,
      onClick: (app) => handleUpdateStatus(app, "DEPRECATED"),
      hidden: (app) => app.status === "DEPRECATED",
    },
    {
      label: "Remove",
      icon: <XCircle className="h-4 w-4" />,
      onClick: (app) => handleUpdateStatus(app, "REMOVED"),
      variant: "destructive",
      hidden: (app) => app.status === "REMOVED",
    },
  ]

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: "Approve Selected",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusUpdate(ids, "APPROVED"),
      confirmTitle: "Approve Apps",
      confirmDescription: "Are you sure you want to approve the selected apps?",
    },
    {
      label: "Publish Selected",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusUpdate(ids, "PUBLISHED"),
      confirmTitle: "Publish Apps",
      confirmDescription: "Are you sure you want to publish the selected apps?",
    },
    {
      label: "Deprecate Selected",
      icon: <Clock className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusUpdate(ids, "DEPRECATED"),
      confirmTitle: "Deprecate Apps",
      confirmDescription: "Are you sure you want to deprecate the selected apps?",
    },
    {
      separator: true,
      label: "Delete Selected",
      icon: <Trash className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      confirmTitle: "Delete Apps",
      confirmDescription: "Are you sure you want to delete the selected apps? This action cannot be undone.",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Puzzle className="h-8 w-8 text-primary" />
            Integration Apps
          </h1>
          <p className="text-muted-foreground">
            Manage the integration app marketplace
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create App
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Integration App</DialogTitle>
              <DialogDescription>
                Add a new integration app to the marketplace
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">App Name *</Label>
                  <Input
                    id="name"
                    placeholder="My Integration"
                    value={newApp.name}
                    onChange={(e) =>
                      setNewApp({ ...newApp, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Category *</Label>
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
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  placeholder="A brief description of the app"
                  value={newApp.shortDescription}
                  onChange={(e) =>
                    setNewApp({ ...newApp, shortDescription: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the integration"
                  value={newApp.description}
                  onChange={(e) =>
                    setNewApp({ ...newApp, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="developer">Developer *</Label>
                  <Input
                    id="developer"
                    placeholder="Developer name"
                    value={newApp.developer}
                    onChange={(e) =>
                      setNewApp({ ...newApp, developer: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="developerUrl">Developer URL</Label>
                  <Input
                    id="developerUrl"
                    placeholder="https://developer.com"
                    value={newApp.developerUrl}
                    onChange={(e) =>
                      setNewApp({ ...newApp, developerUrl: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iconUrl">Icon URL</Label>
                <Input
                  id="iconUrl"
                  placeholder="https://example.com/icon.png"
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
                  <Label htmlFor="isOfficial">Official App</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isFeatured"
                    checked={newApp.isFeatured}
                    onCheckedChange={(checked) =>
                      setNewApp({ ...newApp, isFeatured: checked as boolean })
                    }
                  />
                  <Label htmlFor="isFeatured">Featured App</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateApp}
                disabled={!newApp.name || !newApp.developer}
              >
                Create App
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
            <p className="text-xs text-muted-foreground">Total Apps</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {apps.filter((a) => a.status === "PUBLISHED").length}
            </div>
            <p className="text-xs text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {formatNumber(apps.reduce((acc, a) => acc + a.installCount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Total Installs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {apps.filter((a) => a.isFeatured).length}
            </div>
            <p className="text-xs text-muted-foreground">Featured</p>
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
                  placeholder="Search apps..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
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
        emptyMessage="No integration apps found"
        viewHref={(app) => `/admin/integrations/apps/${app.id}`}
        onDelete={handleDeleteApp}
        deleteConfirmTitle="Delete Integration App"
        deleteConfirmDescription={(app) =>
          `Are you sure you want to delete "${app.name}"? This action cannot be undone.`
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
