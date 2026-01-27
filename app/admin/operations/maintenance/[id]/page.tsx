"use client"

import { useState, useEffect, useCallback } from "react"
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
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  Wrench,
  ArrowLeft,
  Loader2,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Play,
  XCircle,
  Edit,
  Save,
  X,
  User,
  Activity,
} from "lucide-react"
import { toast } from "sonner"

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
  creatorDetails?: { id: string; name: string; email: string; role: string } | null
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

// typeOptions array removed - unused

const statusOptions = [
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXTENDED", label: "Extended" },
]

const serviceOptions = [
  "API Gateway",
  "Authentication",
  "Database",
  "File Storage",
  "Messaging",
  "Search",
  "Analytics",
  "Payments",
  "Notifications",
]

export default function MaintenanceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const windowId = params.id as string

  const [window, setWindow] = useState<MaintenanceWindow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<MaintenanceWindow>>({})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const fetchWindow = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/operations/maintenance/${windowId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch maintenance window")
      }
      const data = await response.json()
      setWindow(data.window)
      setEditForm({
        title: data.window.title,
        description: data.window.description,
        type: data.window.type,
        affectedServices: data.window.affectedServices,
        scheduledStart: data.window.scheduledStart,
        scheduledEnd: data.window.scheduledEnd,
        notifyBefore: data.window.notifyBefore,
      })
    } catch (error) {
      console.error("Failed to fetch maintenance window:", error)
      toast.error("Failed to load maintenance window")
    } finally {
      setIsLoading(false)
    }
  }, [windowId])

  useEffect(() => {
    fetchWindow()
  }, [fetchWindow])

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/operations/maintenance/${windowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error("Failed to update status")
      toast.success("Status updated")
      fetchWindow()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update status")
    }
  }

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/admin/operations/maintenance/${windowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!response.ok) throw new Error("Failed to update maintenance window")
      toast.success("Maintenance window updated")
      setIsEditing(false)
      fetchWindow()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update maintenance window")
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/operations/maintenance/${windowId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete")
      }
      toast.success("Maintenance window deleted")
      router.push("/admin/operations/maintenance")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete maintenance window")
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Badge className="bg-blue-500">Scheduled</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-yellow-500">In Progress</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>
      case "EXTENDED":
        return <Badge className="bg-orange-500">Extended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "EMERGENCY":
        return <Badge className="bg-red-500">Emergency</Badge>
      case "SECURITY_PATCH":
        return <Badge className="bg-purple-500">Security</Badge>
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!window) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Maintenance window not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // isUpcoming removed - unused
  const isActive = window.status === "IN_PROGRESS"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/operations/maintenance">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
            window.type === "EMERGENCY" ? "bg-red-500/10" :
            window.type === "SECURITY_PATCH" ? "bg-purple-500/10" : "bg-primary/10"
          }`}>
            <Wrench className={`h-6 w-6 ${
              window.type === "EMERGENCY" ? "text-red-500" :
              window.type === "SECURITY_PATCH" ? "text-purple-500" : "text-primary"
            }`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{window.title}</h1>
            <p className="text-muted-foreground">
              Scheduled for {new Date(window.scheduledStart).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getTypeBadge(window.type)}
          {getStatusBadge(window.status)}
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

      {/* Active Warning */}
      {isActive && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <h3 className="font-semibold">Maintenance In Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Started {window.actualStart
                    ? new Date(window.actualStart).toLocaleString()
                    : "recently"}
                </p>
              </div>
              <div className="ml-auto">
                <Button onClick={() => handleStatusChange("COMPLETED")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Maintenance
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
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Duration</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {formatDuration(window.scheduledStart, window.scheduledEnd)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Services</span>
            </div>
            <p className="text-2xl font-bold mt-1">{window.affectedServices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Related Incidents</span>
            </div>
            <p className="text-2xl font-bold mt-1">{window.relatedIncidents?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Notify Before</span>
            </div>
            <p className="text-2xl font-bold mt-1">{window.notifyBefore}h</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                  placeholder="Describe the maintenance..."
                />
              ) : (
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {window.description || "No description provided"}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Affected Services</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {serviceOptions.map((service) => (
                    <Badge
                      key={service}
                      variant={
                        editForm.affectedServices?.includes(service)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => {
                        const current = editForm.affectedServices || []
                        const services = current.includes(service)
                          ? current.filter((s) => s !== service)
                          : [...current, service]
                        setEditForm({ ...editForm, affectedServices: services })
                      }}
                    >
                      {service}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {window.affectedServices.map((service) => (
                    <Badge key={service} variant="outline">
                      {service}
                    </Badge>
                  ))}
                  {window.affectedServices.length === 0 && (
                    <span className="text-muted-foreground">No services specified</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Incidents */}
          {window.relatedIncidents && window.relatedIncidents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Incidents</CardTitle>
                <CardDescription>
                  Incidents that occurred during this maintenance window
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {window.relatedIncidents.map((incident) => (
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

          {/* Audit Log */}
          {window.auditLogs && window.auditLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {window.auditLogs.map((log) => (
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {window.status === "SCHEDULED" && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => handleStatusChange("IN_PROGRESS")}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Maintenance
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleStatusChange("CANCELLED")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
              {window.status === "IN_PROGRESS" && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => handleStatusChange("COMPLETED")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleStatusChange("EXTENDED")}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Extend
                  </Button>
                </>
              )}
              {["COMPLETED", "CANCELLED"].includes(window.status) && (
                <>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete Window
                  </Button>
                  <ConfirmationDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    title="Delete Maintenance Window"
                    description="Are you sure you want to delete this maintenance window? This action cannot be undone."
                    confirmText="Delete"
                    variant="destructive"
                    onConfirm={handleDelete}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={window.status} onValueChange={handleStatusChange}>
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

          {/* Schedule Details */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Scheduled Start</Label>
                {isEditing ? (
                  <Input
                    type="datetime-local"
                    value={editForm.scheduledStart ? new Date(editForm.scheduledStart).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditForm({ ...editForm, scheduledStart: e.target.value })}
                  />
                ) : (
                  <p className="text-sm">{new Date(window.scheduledStart).toLocaleString()}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Scheduled End</Label>
                {isEditing ? (
                  <Input
                    type="datetime-local"
                    value={editForm.scheduledEnd ? new Date(editForm.scheduledEnd).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setEditForm({ ...editForm, scheduledEnd: e.target.value })}
                  />
                ) : (
                  <p className="text-sm">{new Date(window.scheduledEnd).toLocaleString()}</p>
                )}
              </div>
              {window.actualStart && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Actual Start</Label>
                  <p className="text-sm">{new Date(window.actualStart).toLocaleString()}</p>
                </div>
              )}
              {window.actualEnd && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Actual End</Label>
                  <p className="text-sm">{new Date(window.actualEnd).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Creator Info */}
          {window.creatorDetails && (
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
                    <p className="font-medium">{window.creatorDetails.name}</p>
                    <p className="text-sm text-muted-foreground">{window.creatorDetails.email}</p>
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
