"use client"

import { useState, useEffect, useCallback } from "react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Rocket,
  ArrowLeft,
  Loader2,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Play,
  Undo,
  XCircle,
  Edit,
  Save,
  X,
  User,
  Bug,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

interface Release {
  id: string
  version: string
  name: string | null
  description: string | null
  type: string
  status: string
  features: Array<{ title: string; description?: string }>
  bugFixes: Array<{ title: string; description?: string }>
  breakingChanges: Array<{ title: string; description?: string }>
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
  creatorDetails?: { id: string; name: string; email: string; role: string } | null
  relatedMaintenance?: Array<{
    id: string
    title: string
    type: string
    status: string
    scheduledStart: string
    scheduledEnd: string
  }>
  relatedIncidents?: Array<{
    id: string
    title: string
    severity: string
    status: string
    startedAt: string
  }>
  auditLogs?: Array<{
    id: string
    action: string
    details: Record<string, unknown>
    timestamp: string
  }>
}

const typeOptions = [
  { value: "MAJOR", label: "Major", color: "bg-purple-500" },
  { value: "MINOR", label: "Minor", color: "bg-blue-500" },
  { value: "PATCH", label: "Patch", color: "bg-green-500" },
  { value: "HOTFIX", label: "Hotfix", color: "bg-red-500" },
]

const statusOptions = [
  { value: "PLANNED", label: "Planned" },
  { value: "IN_DEVELOPMENT", label: "In Development" },
  { value: "STAGING", label: "Staging" },
  { value: "ROLLING_OUT", label: "Rolling Out" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ROLLBACK", label: "Rollback" },
  { value: "CANCELLED", label: "Cancelled" },
]

const strategyOptions = [
  { value: "BIG_BANG", label: "Big Bang" },
  { value: "STAGED", label: "Staged" },
  { value: "CANARY", label: "Canary" },
  { value: "BLUE_GREEN", label: "Blue-Green" },
  { value: "RING", label: "Ring" },
]

export default function ReleaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const releaseId = params.id as string
  const t = useTranslations("admin.operations.releases")

  const [release, setRelease] = useState<Release | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Release>>({})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const fetchRelease = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/operations/releases/${releaseId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch release")
      }
      const data = await response.json()
      setRelease(data.release)
      setEditForm({
        version: data.release.version,
        name: data.release.name,
        description: data.release.description,
        type: data.release.type,
        rolloutStrategy: data.release.rolloutStrategy,
        plannedDate: data.release.plannedDate,
        changelogUrl: data.release.changelogUrl,
        features: data.release.features || [],
        bugFixes: data.release.bugFixes || [],
        breakingChanges: data.release.breakingChanges || [],
      })
    } catch (error) {
      console.error("Failed to fetch release:", error)
      showErrorToast(t("toast.loadFailed"))
    } finally {
      setIsLoading(false)
    }
  }, [releaseId])

  useEffect(() => {
    fetchRelease()
  }, [fetchRelease])

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/operations/releases/${releaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error(t("toast.updateStatusFailed"))
      showSuccessToast(t("toast.statusUpdated"))
      fetchRelease()
    } catch (error) {
      console.error(error)
      showErrorToast(t("toast.updateStatusFailed"))
    }
  }

  const handleRolloutChange = async (percentage: number) => {
    try {
      const response = await fetch(`/api/admin/operations/releases/${releaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rolloutPercentage: percentage }),
      })
      if (!response.ok) throw new Error("Failed to update rollout")
      fetchRelease()
    } catch (error) {
      console.error(error)
        showErrorToast(t("toast.updateRolloutFailed"))
    }
  }

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/admin/operations/releases/${releaseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!response.ok) throw new Error(t("toast.updateFailed"))
      showSuccessToast(t("toast.updated"))
      setIsEditing(false)
      fetchRelease()
    } catch (error) {
      console.error(error)
      showErrorToast(t("toast.updateFailed"))
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/operations/releases/${releaseId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete")
      }
      showSuccessToast(t("toast.deleted"))
      router.push("/admin/operations/releases")
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : t("toast.deleteFailed"))
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PLANNED":
        return <Badge variant="outline">Planned</Badge>
      case "IN_DEVELOPMENT":
        return <Badge className="bg-blue-500">In Development</Badge>
      case "STAGING":
        return <Badge className="bg-yellow-500">Staging</Badge>
      case "ROLLING_OUT":
        return <Badge className="bg-orange-500">Rolling Out</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>
      case "ROLLBACK":
        return <Badge className="bg-red-500">Rollback</Badge>
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const opt = typeOptions.find((o) => o.value === type)
    return <Badge className={opt?.color || "bg-gray-500"}>{opt?.label || type}</Badge>
  }

  const addItem = (field: "features" | "bugFixes" | "breakingChanges") => {
    const current = (editForm[field] as Array<{ title: string; description?: string }>) || []
    setEditForm({
      ...editForm,
      [field]: [...current, { title: "", description: "" }],
    })
  }

  const updateItem = (
    field: "features" | "bugFixes" | "breakingChanges",
    index: number,
    key: "title" | "description",
    value: string
  ) => {
    const current = (editForm[field] as Array<{ title: string; description?: string }>) || []
    const updated = [...current]
    updated[index] = { ...updated[index], [key]: value }
    setEditForm({ ...editForm, [field]: updated })
  }

  const removeItem = (field: "features" | "bugFixes" | "breakingChanges", index: number) => {
    const current = (editForm[field] as Array<{ title: string; description?: string }>) || []
    setEditForm({
      ...editForm,
      [field]: current.filter((_, i) => i !== index),
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!release) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Release not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/operations/releases">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
            release.type === "MAJOR" ? "bg-purple-500/10" :
            release.type === "HOTFIX" ? "bg-red-500/10" : "bg-primary/10"
          }`}>
            <Rocket className={`h-6 w-6 ${
              release.type === "MAJOR" ? "text-purple-500" :
              release.type === "HOTFIX" ? "text-red-500" : "text-primary"
            }`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              v{release.version}
              {release.name && (
                <span className="text-muted-foreground ml-2">({release.name})</span>
              )}
            </h1>
            <p className="text-muted-foreground">
              {release.plannedDate
                ? `Planned for ${new Date(release.plannedDate).toLocaleDateString()}`
                : "No planned date"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getTypeBadge(release.type)}
          {getStatusBadge(release.status)}
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Rollout Progress */}
      {release.status === "ROLLING_OUT" && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Play className="h-8 w-8 text-orange-500" />
              <div className="flex-1">
                <h3 className="font-semibold">Rollout in Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Currently deployed to {release.rolloutPercentage}% of users
                </p>
                <div className="mt-3">
                  <Slider
                    value={[release.rolloutPercentage]}
                    onValueCommit={([value]) => handleRolloutChange(value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleStatusChange("COMPLETED")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </Button>
                <Button variant="destructive" onClick={() => handleStatusChange("ROLLBACK")}>
                  <Undo className="h-4 w-4 mr-2" />
                  Rollback
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Features</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {Array.isArray(release.features) ? release.features.length : 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Bug Fixes</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {Array.isArray(release.bugFixes) ? release.bugFixes.length : 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Breaking Changes</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {Array.isArray(release.breakingChanges) ? release.breakingChanges.length : 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Related Incidents</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {release.relatedIncidents?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="changes">Changes</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={4}
                      placeholder="Describe the release..."
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {release.description || "No description provided"}
                    </p>
                  )}
                </CardContent>
              </Card>

              {release.changelogUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle>Changelog</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={release.changelogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Full Changelog
                    </a>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="changes" className="space-y-4">
              {/* Features */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                      Features
                    </CardTitle>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addItem("features")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-3">
                      {(editForm.features as Array<{ title: string; description?: string }>)?.map(
                        (feature, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="Feature title"
                              value={feature.title}
                              onChange={(e) =>
                                updateItem("features", index, "title", e.target.value)
                              }
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem("features", index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      )}
                      {(!editForm.features || (editForm.features as unknown[]).length === 0) && (
                        <p className="text-muted-foreground text-sm">
                          No features added yet
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Array.isArray(release.features) && release.features.length > 0 ? (
                        release.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>{feature.title}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No features documented</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bug Fixes */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="h-5 w-5 text-green-500" />
                      Bug Fixes
                    </CardTitle>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addItem("bugFixes")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-3">
                      {(editForm.bugFixes as Array<{ title: string; description?: string }>)?.map(
                        (fix, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="Bug fix title"
                              value={fix.title}
                              onChange={(e) =>
                                updateItem("bugFixes", index, "title", e.target.value)
                              }
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem("bugFixes", index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      )}
                      {(!editForm.bugFixes || (editForm.bugFixes as unknown[]).length === 0) && (
                        <p className="text-muted-foreground text-sm">
                          No bug fixes added yet
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Array.isArray(release.bugFixes) && release.bugFixes.length > 0 ? (
                        release.bugFixes.map((fix, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Bug className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>{fix.title}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No bug fixes documented</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Breaking Changes */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      Breaking Changes
                    </CardTitle>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addItem("breakingChanges")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-3">
                      {(editForm.breakingChanges as Array<{ title: string; description?: string }>)?.map(
                        (change, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="Breaking change title"
                              value={change.title}
                              onChange={(e) =>
                                updateItem("breakingChanges", index, "title", e.target.value)
                              }
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem("breakingChanges", index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      )}
                      {(!editForm.breakingChanges || (editForm.breakingChanges as unknown[]).length === 0) && (
                        <p className="text-muted-foreground text-sm">
                          No breaking changes added yet
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Array.isArray(release.breakingChanges) && release.breakingChanges.length > 0 ? (
                        release.breakingChanges.map((change, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                            <span>{change.title}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No breaking changes</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="related" className="space-y-4">
              {/* Related Incidents */}
              {release.relatedIncidents && release.relatedIncidents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Related Incidents</CardTitle>
                    <CardDescription>
                      Incidents that occurred during this release
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {release.relatedIncidents.map((incident) => (
                        <div
                          key={incident.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <AlertTriangle className={`h-4 w-4 ${
                              incident.severity === "CRITICAL" ? "text-red-500" :
                              incident.severity === "MAJOR" ? "text-orange-500" : "text-yellow-500"
                            }`} />
                            <div>
                              <Link
                                href={`/admin/operations/incidents/${incident.id}`}
                                className="font-medium hover:underline"
                              >
                                {incident.title}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {new Date(incident.startedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={incident.status === "RESOLVED" ? "default" : "secondary"}>
                            {incident.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Related Maintenance */}
              {release.relatedMaintenance && release.relatedMaintenance.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Related Maintenance</CardTitle>
                    <CardDescription>
                      Maintenance windows during this release
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {release.relatedMaintenance.map((maintenance) => (
                        <div
                          key={maintenance.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <Link
                                href={`/admin/operations/maintenance/${maintenance.id}`}
                                className="font-medium hover:underline"
                              >
                                {maintenance.title}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {new Date(maintenance.scheduledStart).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{maintenance.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Audit Log */}
              {release.auditLogs && release.auditLogs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {release.auditLogs.map((log) => (
                        <div key={log.id} className="flex items-center gap-3 text-sm">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="capitalize">{log.action.toLowerCase()}</span>
                          <span className="text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {release.status === "STAGING" && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange("ROLLING_OUT")}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Rollout
                </Button>
              )}
              {release.status === "ROLLING_OUT" && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => handleStatusChange("COMPLETED")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Rollout
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => handleStatusChange("ROLLBACK")}
                  >
                    <Undo className="h-4 w-4 mr-2" />
                    Rollback
                  </Button>
                </>
              )}
              {["PLANNED", "IN_DEVELOPMENT"].includes(release.status) && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleStatusChange("CANCELLED")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Release
                </Button>
              )}
              {["COMPLETED", "CANCELLED", "ROLLBACK"].includes(release.status) && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Release
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <ConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title="Delete Release"
            description="Are you sure you want to delete this release? This action cannot be undone."
            confirmText="Delete"
            onConfirm={handleDelete}
            variant="destructive"
          />

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={release.status} onValueChange={handleStatusChange}>
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
            </CardContent>
          </Card>

          {/* Release Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Type</Label>
                {isEditing ? (
                  <Select
                    value={editForm.type}
                    onValueChange={(v) => setEditForm({ ...editForm, type: v })}
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
                ) : (
                  getTypeBadge(release.type)
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Rollout Strategy</Label>
                {isEditing ? (
                  <Select
                    value={editForm.rolloutStrategy}
                    onValueChange={(v) => setEditForm({ ...editForm, rolloutStrategy: v })}
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
                ) : (
                  <Badge variant="outline">{release.rolloutStrategy.replace("_", " ")}</Badge>
                )}
              </div>

              {release.status === "ROLLING_OUT" && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Rollout Progress</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={release.rolloutPercentage} className="flex-1" />
                    <span className="text-sm">{release.rolloutPercentage}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {release.plannedDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Planned:</span>
                  <span>{new Date(release.plannedDate).toLocaleDateString()}</span>
                </div>
              )}
              {release.startedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Play className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Started:</span>
                  <span>{new Date(release.startedAt).toLocaleString()}</span>
                </div>
              )}
              {release.completedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Completed:</span>
                  <span>{new Date(release.completedAt).toLocaleString()}</span>
                </div>
              )}
              {release.rollbackedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Undo className="h-4 w-4 text-red-500" />
                  <span className="text-muted-foreground">Rolled back:</span>
                  <span>{new Date(release.rollbackedAt).toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Creator Info */}
          {release.creatorDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Created By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{release.creatorDetails.name}</p>
                    <p className="text-sm text-muted-foreground">{release.creatorDetails.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
