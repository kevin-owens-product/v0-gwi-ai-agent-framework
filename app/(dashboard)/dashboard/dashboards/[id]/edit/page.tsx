"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  LayoutGrid,
  Grid3X3,
  Rows3,
  Plus,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Users,
  Globe,
  Lock,
  AlertCircle,
} from "lucide-react"

interface Widget {
  id: string
  type: string
  title: string
  config?: Record<string, unknown>
}

interface Dashboard {
  id: string
  name: string
  description: string | null
  layout: unknown[]
  widgets: Widget[]
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  isPublic: boolean
  views: number
  createdAt: string
  updatedAt: string
}

interface EditDashboardPageProps {
  params: Promise<{ id: string }>
}

export default function EditDashboardPage({ params }: EditDashboardPageProps) {
  const { id } = use(params)
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [layoutType, setLayoutType] = useState<"grid" | "freeform" | "rows">("grid")
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT")
  const [isPublic, setIsPublic] = useState(false)
  const [widgets, setWidgets] = useState<Widget[]>([])

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboard() {
      if (sessionStatus === "loading") return
      if (!session) {
        router.push("/login")
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/v1/dashboards/${id}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("Dashboard not found")
          } else if (response.status === 401) {
            router.push("/login")
            return
          } else if (response.status === 403) {
            setError("You do not have permission to edit this dashboard")
          } else {
            setError("Failed to load dashboard")
          }
          return
        }

        const data = await response.json()
        const dashboardData = data.data || data

        setDashboard(dashboardData)
        setName(dashboardData.name || "")
        setDescription(dashboardData.description || "")
        setStatus(dashboardData.status || "DRAFT")
        setIsPublic(dashboardData.isPublic || false)
        setWidgets(Array.isArray(dashboardData.widgets) ? dashboardData.widgets : [])

        // Determine layout type from layout array
        if (Array.isArray(dashboardData.layout) && dashboardData.layout.length > 0) {
          const firstLayout = dashboardData.layout[0] as { type?: string }
          if (firstLayout?.type === "freeform") {
            setLayoutType("freeform")
          } else if (firstLayout?.type === "rows") {
            setLayoutType("rows")
          } else {
            setLayoutType("grid")
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err)
        setError("An error occurred while loading the dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [id, session, sessionStatus, router])

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Dashboard name is required")
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      const response = await fetch(`/api/v1/dashboards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          layout: [{ type: layoutType }],
          widgets,
          status,
          isPublic,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to save dashboard")
        return
      }

      setSuccessMessage("Dashboard saved successfully")
      setTimeout(() => {
        router.push(`/dashboard/dashboards/${id}`)
      }, 1000)
    } catch (err) {
      console.error("Error saving dashboard:", err)
      setError("An error occurred while saving the dashboard")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError(null)

      const response = await fetch(`/api/v1/dashboards/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to delete dashboard")
        return
      }

      router.push("/dashboard/dashboards")
    } catch (err) {
      console.error("Error deleting dashboard:", err)
      setError("An error occurred while deleting the dashboard")
    } finally {
      setIsDeleting(false)
    }
  }

  const addWidget = () => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: "chart",
      title: `Widget ${widgets.length + 1}`,
    }
    setWidgets([...widgets, newWidget])
  }

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter((w) => w.id !== widgetId))
  }

  const updateWidgetTitle = (widgetId: string, title: string) => {
    setWidgets(
      widgets.map((w) => (w.id === widgetId ? { ...w, title } : w))
    )
  }

  const updateWidgetType = (widgetId: string, type: string) => {
    setWidgets(
      widgets.map((w) => (w.id === widgetId ? { ...w, type } : w))
    )
  }

  // Loading state
  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  // Error state when dashboard not found
  if (error && !dashboard) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/dashboards">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Dashboard</h1>
          </div>
        </div>
        <Card className="p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/dashboards">
              <Button variant="outline">Back to Dashboards</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/dashboards/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Update your dashboard settings and configuration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Dashboard</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this dashboard? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the name and description of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Dashboard Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Q4 Campaign Performance"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this dashboard..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Layout Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
              <CardDescription>
                Choose how widgets are arranged on your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Layout Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setLayoutType("grid")}
                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-colors ${
                      layoutType === "grid"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent/50"
                    }`}
                  >
                    <Grid3X3 className="h-6 w-6" />
                    <span className="text-sm font-medium">Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutType("freeform")}
                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-colors ${
                      layoutType === "freeform"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent/50"
                    }`}
                  >
                    <LayoutGrid className="h-6 w-6" />
                    <span className="text-sm font-medium">Freeform</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutType("rows")}
                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-colors ${
                      layoutType === "rows"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent/50"
                    }`}
                  >
                    <Rows3 className="h-6 w-6" />
                    <span className="text-sm font-medium">Rows</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Widgets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Widgets</CardTitle>
                  <CardDescription>
                    Manage the widgets displayed on your dashboard
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addWidget}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Widget
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {widgets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <LayoutGrid className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No widgets added yet</p>
                  <p className="text-sm">Click "Add Widget" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {widgets.map((widget, index) => (
                    <div
                      key={widget.id}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      <span className="text-sm text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      <Input
                        value={widget.title}
                        onChange={(e) => updateWidgetTitle(widget.id, e.target.value)}
                        className="flex-1"
                        placeholder="Widget title"
                      />
                      <Select
                        value={widget.type}
                        onValueChange={(value) => updateWidgetType(widget.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chart">Chart</SelectItem>
                          <SelectItem value="table">Table</SelectItem>
                          <SelectItem value="metric">Metric</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeWidget(widget.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(value: "DRAFT" | "PUBLISHED" | "ARCHIVED") => setStatus(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        Draft
                      </div>
                    </SelectItem>
                    <SelectItem value="PUBLISHED">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Published
                      </div>
                    </SelectItem>
                    <SelectItem value="ARCHIVED">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Archived
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anyone with the link to view
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                {isPublic ? (
                  <>
                    <Globe className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">Visible to anyone with link</span>
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Only visible to team members</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Info */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">{dashboard?.views?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Widgets</span>
                <span className="font-medium">{widgets.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={
                    status === "PUBLISHED"
                      ? "default"
                      : status === "ARCHIVED"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {status.toLowerCase()}
                </Badge>
              </div>
              {dashboard?.createdAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(dashboard.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {dashboard?.updatedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last updated</span>
                  <span className="font-medium">
                    {new Date(dashboard.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/dashboard/dashboards/${id}`)}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
