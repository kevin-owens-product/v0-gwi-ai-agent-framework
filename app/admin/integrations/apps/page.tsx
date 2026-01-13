"use client"

import { useEffect, useState } from "react"
import {
  Puzzle,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  Star,
  Building2,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Globe,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import Link from "next/link"

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
    if (!confirm("Are you sure you want to delete this integration app?")) return

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
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Developer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Installs</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredApps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Puzzle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No integration apps found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First App
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
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
                              <Shield className="h-4 w-4 text-blue-500" title="Official" />
                            )}
                            {app.isFeatured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" title="Featured" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {app.shortDescription || app.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {categories.find(c => c.value === app.category)?.label || app.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{app.developer}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatNumber(app.installCount)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {app.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm">{app.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({app.reviewCount})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No reviews</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/integrations/apps/${app.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleFeatured(app)}>
                            <Star className={`h-4 w-4 mr-2 ${app.isFeatured ? "fill-yellow-500 text-yellow-500" : ""}`} />
                            {app.isFeatured ? "Remove Featured" : "Make Featured"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUpdateStatus(app, "PUBLISHED")}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(app, "DEPRECATED")}>
                            <Clock className="h-4 w-4 mr-2" />
                            Deprecate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteApp(app)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
