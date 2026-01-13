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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  User,
  Calendar,
  Shield,
  Activity,
  Send,
  Edit,
  Save,
  X,
} from "lucide-react"
import { toast } from "sonner"

interface IncidentUpdate {
  id: string
  message: string
  status: string | null
  isPublic: boolean
  postedBy: string | null
  createdAt: string
  poster?: {
    id: string
    name: string
    email: string
  } | null
}

interface Incident {
  id: string
  title: string
  description: string
  severity: string
  status: string
  type: string
  affectedServices: string[]
  affectedOrgs: string[]
  affectedRegions: string[]
  impact: string | null
  rootCause: string | null
  timeline: Array<{ timestamp: string; event: string; actor: string }>
  responders: string[]
  commanderId: string | null
  startedAt: string
  detectedAt: string
  acknowledgedAt: string | null
  mitigatedAt: string | null
  resolvedAt: string | null
  postmortemUrl: string | null
  createdAt: string
  updatedAt: string
  updates: IncidentUpdate[]
  affectedOrgDetails?: Array<{ id: string; name: string; slug: string; planTier: string }>
  responderDetails?: Array<{ id: string; name: string; email: string; role: string }>
  commanderDetails?: { id: string; name: string; email: string; role: string } | null
}

const severityOptions = [
  { value: "MINOR", label: "Minor", color: "bg-blue-500" },
  { value: "MODERATE", label: "Moderate", color: "bg-yellow-500" },
  { value: "MAJOR", label: "Major", color: "bg-orange-500" },
  { value: "CRITICAL", label: "Critical", color: "bg-red-500" },
]

const statusOptions = [
  { value: "INVESTIGATING", label: "Investigating" },
  { value: "IDENTIFIED", label: "Identified" },
  { value: "MONITORING", label: "Monitoring" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "POSTMORTEM", label: "Postmortem" },
]

const typeOptions = [
  { value: "OUTAGE", label: "Outage" },
  { value: "DEGRADATION", label: "Degradation" },
  { value: "SECURITY", label: "Security" },
  { value: "DATA_ISSUE", label: "Data Issue" },
  { value: "THIRD_PARTY", label: "Third Party" },
  { value: "CAPACITY", label: "Capacity" },
  { value: "NETWORK", label: "Network" },
  { value: "DATABASE", label: "Database" },
]

export default function IncidentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const incidentId = params.id as string

  const [incident, setIncident] = useState<Incident | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Incident>>({})
  const [newUpdate, setNewUpdate] = useState("")
  const [updateStatus, setUpdateStatus] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchIncident = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/operations/incidents/${incidentId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch incident")
      }
      const data = await response.json()
      setIncident(data.incident)
      setEditForm({
        title: data.incident.title,
        description: data.incident.description,
        severity: data.incident.severity,
        type: data.incident.type,
        impact: data.incident.impact,
        rootCause: data.incident.rootCause,
        postmortemUrl: data.incident.postmortemUrl,
      })
    } catch (error) {
      console.error("Failed to fetch incident:", error)
      toast.error("Failed to load incident")
    } finally {
      setIsLoading(false)
    }
  }, [incidentId])

  useEffect(() => {
    fetchIncident()
  }, [fetchIncident])

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/operations/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error("Failed to update status")
      toast.success("Status updated")
      fetchIncident()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update status")
    }
  }

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/admin/operations/incidents/${incidentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!response.ok) throw new Error("Failed to update incident")
      toast.success("Incident updated")
      setIsEditing(false)
      fetchIncident()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update incident")
    }
  }

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/operations/incidents/${incidentId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newUpdate,
          status: updateStatus || undefined,
        }),
      })
      if (!response.ok) throw new Error("Failed to add update")
      toast.success("Update posted")
      setNewUpdate("")
      setUpdateStatus("")
      fetchIncident()
    } catch (error) {
      console.error(error)
      toast.error("Failed to add update")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSeverityBadge = (severity: string) => {
    const opt = severityOptions.find((o) => o.value === severity)
    return <Badge className={opt?.color || "bg-gray-500"}>{opt?.label || severity}</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <Badge className="bg-green-500">Resolved</Badge>
      case "MONITORING":
        return <Badge className="bg-blue-500">Monitoring</Badge>
      case "IDENTIFIED":
        return <Badge className="bg-yellow-500">Identified</Badge>
      case "INVESTIGATING":
        return <Badge className="bg-orange-500">Investigating</Badge>
      case "POSTMORTEM":
        return <Badge variant="secondary">Postmortem</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDuration = (start: string, end: string | null) => {
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : new Date()
    const diff = endDate.getTime() - startDate.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Incident not found</p>
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
            <Link href="/admin/operations/incidents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
            incident.severity === "CRITICAL" ? "bg-red-500/10" :
            incident.severity === "MAJOR" ? "bg-orange-500/10" :
            incident.severity === "MODERATE" ? "bg-yellow-500/10" : "bg-blue-500/10"
          }`}>
            <AlertCircle className={`h-6 w-6 ${
              incident.severity === "CRITICAL" ? "text-red-500" :
              incident.severity === "MAJOR" ? "text-orange-500" :
              incident.severity === "MODERATE" ? "text-yellow-500" : "text-blue-500"
            }`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{incident.title}</h1>
            <p className="text-muted-foreground">
              Started {new Date(incident.startedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getSeverityBadge(incident.severity)}
          {getStatusBadge(incident.status)}
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Duration</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {formatDuration(incident.startedAt, incident.resolvedAt)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Services Affected</span>
            </div>
            <p className="text-2xl font-bold mt-1">{incident.affectedServices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Updates</span>
            </div>
            <p className="text-2xl font-bold mt-1">{incident.updates.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Responders</span>
            </div>
            <p className="text-2xl font-bold mt-1">{incident.responders.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="updates">Updates ({incident.updates.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
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
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{incident.description}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editForm.impact || ""}
                      onChange={(e) => setEditForm({ ...editForm, impact: e.target.value })}
                      placeholder="Describe the impact of this incident..."
                      rows={3}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {incident.impact || "No impact documented yet"}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Root Cause</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editForm.rootCause || ""}
                      onChange={(e) => setEditForm({ ...editForm, rootCause: e.target.value })}
                      placeholder="Document the root cause..."
                      rows={3}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {incident.rootCause || "Root cause not yet identified"}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Affected Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {incident.affectedServices.map((service) => (
                      <Badge key={service} variant="outline">
                        {service}
                      </Badge>
                    ))}
                    {incident.affectedServices.length === 0 && (
                      <span className="text-muted-foreground">No services specified</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Incident Timeline</CardTitle>
                  <CardDescription>
                    Chronological events during this incident
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {incident.timeline.map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          {index < incident.timeline.length - 1 && (
                            <div className="w-px h-full bg-border flex-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{event.event}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(event.timestamp).toLocaleString()}</span>
                            <span>-</span>
                            <User className="h-3 w-3" />
                            <span>{event.actor}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="updates" className="space-y-4">
              {/* Add Update Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Post Update</CardTitle>
                  <CardDescription>
                    Add a status update to this incident
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your update..."
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <Select value={updateStatus} onValueChange={setUpdateStatus}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Change status (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No status change</SelectItem>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddUpdate} disabled={!newUpdate.trim() || isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Post Update
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Updates List */}
              <Card>
                <CardHeader>
                  <CardTitle>Update History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {incident.updates.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No updates yet</p>
                  ) : (
                    incident.updates.map((update) => (
                      <div key={update.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {update.status && getStatusBadge(update.status)}
                            {update.isPublic ? (
                              <Badge variant="outline">Public</Badge>
                            ) : (
                              <Badge variant="secondary">Internal</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(update.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{update.message}</p>
                        {update.poster && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{update.poster.name || update.poster.email}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={incident.status} onValueChange={handleStatusChange}>
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

          {/* Incident Info */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Severity</Label>
                {isEditing ? (
                  <Select
                    value={editForm.severity}
                    onValueChange={(v) => setEditForm({ ...editForm, severity: v })}
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
                ) : (
                  getSeverityBadge(incident.severity)
                )}
              </div>

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
                  <Badge variant="outline">{incident.type}</Badge>
                )}
              </div>

              {incident.postmortemUrl && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Postmortem</Label>
                  <a
                    href={incident.postmortemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block"
                  >
                    View Postmortem
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Key Times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-muted-foreground">Detected:</span>
                <span>{new Date(incident.detectedAt).toLocaleString()}</span>
              </div>
              {incident.acknowledgedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">Acknowledged:</span>
                  <span>{new Date(incident.acknowledgedAt).toLocaleString()}</span>
                </div>
              )}
              {incident.mitigatedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Mitigated:</span>
                  <span>{new Date(incident.mitigatedAt).toLocaleString()}</span>
                </div>
              )}
              {incident.resolvedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Resolved:</span>
                  <span>{new Date(incident.resolvedAt).toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Responders */}
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {incident.commanderDetails && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Incident Commander</Label>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{incident.commanderDetails.name}</p>
                      <p className="text-xs text-muted-foreground">{incident.commanderDetails.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {incident.responderDetails && incident.responderDetails.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Responders</Label>
                  {incident.responderDetails.map((responder) => (
                    <div key={responder.id} className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-3 w-3" />
                      </div>
                      <span className="text-sm">{responder.name || responder.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
