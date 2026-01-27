"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Puzzle,
  Loader2,
  Building2,
  Calendar,
  Clock,
  Edit,
  Save,
  X,
  Trash,
  Star,
  Download,
  Shield,
  ExternalLink,
  CheckCircle,
  PauseCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Organization {
  id: string
  name: string
  slug: string
  planTier?: string
}

interface Installation {
  id: string
  orgId: string
  status: string
  installedBy: string
  grantedScopes: string[]
  lastUsedAt: string | null
  createdAt: string
  organization?: Organization
}

interface InstallStats {
  ACTIVE: number
  PAUSED: number
  UNINSTALLED: number
}

interface IntegrationApp {
  id: string
  slug: string
  name: string
  description: string | null
  shortDescription: string | null
  category: string
  developer: string
  developerUrl: string | null
  supportUrl: string | null
  privacyUrl: string | null
  iconUrl: string | null
  bannerUrl: string | null
  status: string
  isOfficial: boolean
  isFeatured: boolean
  requiredScopes: string[]
  optionalScopes: string[]
  setupInstructions: string | null
  configSchema: Record<string, unknown>
  installCount: number
  rating: number | null
  reviewCount: number
  allowedPlans: string[]
  blockedOrgs: string[]
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  installations: Installation[]
  installStats: InstallStats
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

export default function IntegrationAppDetailPage() {
  const params = useParams()
  const router = useRouter()
  const appId = params.id as string

  const [app, setApp] = useState<IntegrationApp | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    shortDescription: "",
    description: "",
    category: "",
    developer: "",
    developerUrl: "",
    supportUrl: "",
    privacyUrl: "",
    iconUrl: "",
    bannerUrl: "",
    setupInstructions: "",
    isOfficial: false,
    isFeatured: false,
  })

  const [installations, setInstallations] = useState<Installation[]>([])
  const [installsPage, setInstallsPage] = useState(1)
  const [installsTotalPages, setInstallsTotalPages] = useState(1)
  const [installsLoading, setInstallsLoading] = useState(false)
  const [installStats, setInstallStats] = useState<InstallStats>({
    ACTIVE: 0,
    PAUSED: 0,
    UNINSTALLED: 0,
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchApp = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/integrations/apps/${appId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch app")
      }
      const data = await response.json()
      setApp(data.app)
      setEditForm({
        name: data.app.name,
        shortDescription: data.app.shortDescription || "",
        description: data.app.description || "",
        category: data.app.category,
        developer: data.app.developer,
        developerUrl: data.app.developerUrl || "",
        supportUrl: data.app.supportUrl || "",
        privacyUrl: data.app.privacyUrl || "",
        iconUrl: data.app.iconUrl || "",
        bannerUrl: data.app.bannerUrl || "",
        setupInstructions: data.app.setupInstructions || "",
        isOfficial: data.app.isOfficial,
        isFeatured: data.app.isFeatured,
      })
    } catch (error) {
      console.error("Failed to fetch app:", error)
      toast.error("Failed to load integration app")
    } finally {
      setIsLoading(false)
    }
  }, [appId])

  const fetchInstallations = useCallback(async () => {
    setInstallsLoading(true)
    try {
      const response = await fetch(
        `/api/admin/integrations/apps/${appId}/installs?page=${installsPage}`
      )
      if (response.ok) {
        const data = await response.json()
        setInstallations(data.installs)
        setInstallsTotalPages(data.totalPages)
        setInstallStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch installations:", error)
    } finally {
      setInstallsLoading(false)
    }
  }, [appId, installsPage])

  useEffect(() => {
    fetchApp()
  }, [fetchApp])

  useEffect(() => {
    fetchInstallations()
  }, [fetchInstallations])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/integrations/apps/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          shortDescription: editForm.shortDescription || null,
          description: editForm.description || null,
          category: editForm.category,
          developer: editForm.developer,
          developerUrl: editForm.developerUrl || null,
          supportUrl: editForm.supportUrl || null,
          privacyUrl: editForm.privacyUrl || null,
          iconUrl: editForm.iconUrl || null,
          bannerUrl: editForm.bannerUrl || null,
          setupInstructions: editForm.setupInstructions || null,
          isOfficial: editForm.isOfficial,
          isFeatured: editForm.isFeatured,
        }),
      })
      if (response.ok) {
        setIsEditing(false)
        fetchApp()
        toast.success("Integration app updated")
      } else {
        toast.error("Failed to update app")
      }
    } catch (error) {
      console.error("Failed to update app:", error)
      toast.error("Failed to update app")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/integrations/apps/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        fetchApp()
        toast.success(`Status updated to ${newStatus.toLowerCase()}`)
      }
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/integrations/apps/${appId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Integration app deleted")
        router.push("/admin/integrations/apps")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete app")
      }
    } catch (error) {
      toast.error("Failed to delete app")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
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

  const getInstallStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Active</Badge>
      case "PAUSED":
        return <Badge className="bg-yellow-500">Paused</Badge>
      case "UNINSTALLED":
        return <Badge variant="secondary">Uninstalled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Integration app not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Integration App</DialogTitle>
            <DialogDescription>
              This will permanently delete this app and all its installation records.
              {app._count.installations > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This app has {app._count.installations} active installations!
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/integrations/apps">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          {app.iconUrl ? (
            <img
              src={app.iconUrl}
              alt={app.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Puzzle className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{app.name}</h1>
              {app.isOfficial && (
                <span title="Official">
                  <Shield className="h-5 w-5 text-blue-500" />
                </span>
              )}
              {app.isFeatured && (
                <span title="Featured">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{app.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={app.status} onValueChange={handleUpdateStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="installations">Installations ({app._count.installations})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(app.status)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Installs</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(app.installCount)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {app.rating ? (
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold">{app.rating.toFixed(1)}</span>
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                ) : (
                  <span className="text-muted-foreground">No reviews</span>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Category</CardTitle>
                <Puzzle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant="outline">
                  {categories.find(c => c.value === app.category)?.label || app.category}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* App Details */}
            <Card>
              <CardHeader>
                <CardTitle>App Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{app.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slug</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{app.slug}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline">
                    {categories.find(c => c.value === app.category)?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Developer</span>
                  <span className="font-medium">{app.developer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Published</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {app.publishedAt
                      ? new Date(app.publishedAt).toLocaleDateString()
                      : "Not published"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
                <CardDescription>External resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.developerUrl && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Developer Website</span>
                    <a
                      href={app.developerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary flex items-center gap-1 hover:underline"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {app.supportUrl && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Support</span>
                    <a
                      href={app.supportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary flex items-center gap-1 hover:underline"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {app.privacyUrl && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Privacy Policy</span>
                    <a
                      href={app.privacyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary flex items-center gap-1 hover:underline"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {!app.developerUrl && !app.supportUrl && !app.privacyUrl && (
                  <p className="text-muted-foreground">No links configured</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {app.description ? (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{app.description}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No description provided</p>
              )}
            </CardContent>
          </Card>

          {/* Scopes */}
          <Card>
            <CardHeader>
              <CardTitle>Required Scopes</CardTitle>
              <CardDescription>Permissions required by this integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {app.requiredScopes.length > 0 ? (
                  app.requiredScopes.map((scope, i) => (
                    <Badge key={i} variant="secondary">{scope}</Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">No required scopes</span>
                )}
              </div>
              {app.optionalScopes.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm text-muted-foreground">Optional Scopes</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {app.optionalScopes.map((scope, i) => (
                      <Badge key={i} variant="outline">{scope}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="installations" className="space-y-6">
          {/* Install Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-green-500">{installStats.ACTIVE}</div>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <PauseCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-500">{installStats.PAUSED}</div>
                    <p className="text-xs text-muted-foreground">Paused</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-bold">{installStats.UNINSTALLED}</div>
                    <p className="text-xs text-muted-foreground">Uninstalled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Installations Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Installation History</CardTitle>
                  <CardDescription>Organizations using this app</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchInstallations} disabled={installsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${installsLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Installed</TableHead>
                    <TableHead>Last Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installsLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}>
                          <div className="h-10 bg-muted animate-pulse rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : installations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">No installations yet</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    installations.map((install) => (
                      <TableRow key={install.id}>
                        <TableCell>
                          {install.organization ? (
                            <Link
                              href={`/admin/tenants/${install.organization.id}`}
                              className="flex items-center gap-2 hover:underline"
                            >
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{install.organization.name}</p>
                                <p className="text-xs text-muted-foreground">{install.organization.slug}</p>
                              </div>
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">{install.orgId}</span>
                          )}
                        </TableCell>
                        <TableCell>{getInstallStatusBadge(install.status)}</TableCell>
                        <TableCell>
                          {install.organization?.planTier ? (
                            <Badge variant="outline">{install.organization.planTier}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(install.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {install.lastUsedAt
                            ? new Date(install.lastUsedAt).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {installsTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInstallsPage(p => Math.max(1, p - 1))}
                    disabled={installsPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {installsPage} of {installsTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInstallsPage(p => Math.min(installsTotalPages, p + 1))}
                    disabled={installsPage === installsTotalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Edit App Settings</CardTitle>
                  <CardDescription>Update integration app configuration</CardDescription>
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">App Name *</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={editForm.category}
                    onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                    disabled={!isEditing}
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
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={editForm.shortDescription}
                  onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })}
                  disabled={!isEditing}
                  placeholder="A brief description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="developer">Developer *</Label>
                  <Input
                    id="developer"
                    value={editForm.developer}
                    onChange={(e) => setEditForm({ ...editForm, developer: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="developerUrl">Developer URL</Label>
                  <Input
                    id="developerUrl"
                    value={editForm.developerUrl}
                    onChange={(e) => setEditForm({ ...editForm, developerUrl: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="supportUrl">Support URL</Label>
                  <Input
                    id="supportUrl"
                    value={editForm.supportUrl}
                    onChange={(e) => setEditForm({ ...editForm, supportUrl: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="privacyUrl">Privacy Policy URL</Label>
                  <Input
                    id="privacyUrl"
                    value={editForm.privacyUrl}
                    onChange={(e) => setEditForm({ ...editForm, privacyUrl: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="iconUrl">Icon URL</Label>
                  <Input
                    id="iconUrl"
                    value={editForm.iconUrl}
                    onChange={(e) => setEditForm({ ...editForm, iconUrl: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://example.com/icon.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bannerUrl">Banner URL</Label>
                  <Input
                    id="bannerUrl"
                    value={editForm.bannerUrl}
                    onChange={(e) => setEditForm({ ...editForm, bannerUrl: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://example.com/banner.png"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="setupInstructions">Setup Instructions</Label>
                <Textarea
                  id="setupInstructions"
                  value={editForm.setupInstructions}
                  onChange={(e) => setEditForm({ ...editForm, setupInstructions: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Instructions for setting up this integration..."
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isOfficial"
                    checked={editForm.isOfficial}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, isOfficial: checked as boolean })
                    }
                    disabled={!isEditing}
                  />
                  <Label htmlFor="isOfficial">Official App</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isFeatured"
                    checked={editForm.isFeatured}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, isFeatured: checked as boolean })
                    }
                    disabled={!isEditing}
                  />
                  <Label htmlFor="isFeatured">Featured App</Label>
                </div>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} className="mt-4">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Settings
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
