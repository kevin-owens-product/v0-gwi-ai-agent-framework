"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Bell,
  Loader2,
  Calendar,
  Edit,
  Save,
  X,
  AlertTriangle,
  Info,
  Wrench,
  Sparkles,
  Gift,
  Users,
  Clock,
} from "lucide-react"
import Link from "next/link"

interface Organization {
  id: string
  name: string
  slug: string
  planTier: string
}

interface AuditLog {
  id: string
  action: string
  resourceType: string
  details: Record<string, unknown>
  timestamp: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  targetType: string
  targetOrgs: string[]
  targetPlans: string[]
  isActive: boolean
  scheduledFor: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  targetOrgDetails: Organization[]
  auditLogs: AuditLog[]
}

const notificationTypeConfig: Record<string, { icon: typeof Bell; color: string; label: string }> = {
  INFO: { icon: Info, color: "bg-blue-500", label: "Information" },
  WARNING: { icon: AlertTriangle, color: "bg-amber-500", label: "Warning" },
  ALERT: { icon: AlertTriangle, color: "bg-red-500", label: "Alert" },
  MAINTENANCE: { icon: Wrench, color: "bg-slate-500", label: "Maintenance" },
  FEATURE: { icon: Sparkles, color: "bg-purple-500", label: "Feature" },
  PROMOTION: { icon: Gift, color: "bg-green-500", label: "Promotion" },
}

export default function NotificationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const notificationId = params.id as string

  const [notification, setNotification] = useState<Notification | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    title: "",
    message: "",
    type: "INFO",
    targetType: "ALL",
    targetPlans: [] as string[],
    isActive: true,
    scheduledFor: "",
    expiresAt: "",
  })

  const fetchNotification = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch notification")
      }
      const data = await response.json()
      setNotification(data.notification)
      setEditForm({
        title: data.notification.title,
        message: data.notification.message,
        type: data.notification.type,
        targetType: data.notification.targetType,
        targetPlans: data.notification.targetPlans,
        isActive: data.notification.isActive,
        scheduledFor: data.notification.scheduledFor || "",
        expiresAt: data.notification.expiresAt || "",
      })
    } catch (error) {
      console.error("Failed to fetch notification:", error)
    } finally {
      setIsLoading(false)
    }
  }, [notificationId])

  useEffect(() => {
    fetchNotification()
  }, [fetchNotification])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          scheduledFor: editForm.scheduledFor || null,
          expiresAt: editForm.expiresAt || null,
        }),
      })
      if (response.ok) {
        setIsEditing(false)
        fetchNotification()
      }
    } catch (error) {
      console.error("Failed to update notification:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async () => {
    try {
      await fetch(`/api/admin/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !notification?.isActive }),
      })
      fetchNotification()
    } catch (error) {
      console.error("Failed to toggle notification:", error)
    }
  }

  const togglePlan = (plan: string) => {
    setEditForm(prev => ({
      ...prev,
      targetPlans: prev.targetPlans.includes(plan)
        ? prev.targetPlans.filter(p => p !== plan)
        : [...prev.targetPlans, plan],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!notification) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Notification not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const typeConfig = notificationTypeConfig[notification.type] || notificationTypeConfig.INFO
  const TypeIcon = typeConfig.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/notifications">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className={`h-12 w-12 rounded-lg ${typeConfig.color}/10 flex items-center justify-center`}>
            <TypeIcon className={`h-6 w-6 ${typeConfig.color.replace("bg-", "text-")}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{notification.title}</h1>
            <Badge className={`${typeConfig.color} text-white`}>{typeConfig.label}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active:</span>
            <Switch checked={notification.isActive} onCheckedChange={handleToggle} />
            <Badge variant={notification.isActive ? "default" : "secondary"}>
              {notification.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Target Audience</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {notification.targetType === "ALL"
                    ? "All Users"
                    : notification.targetType === "SPECIFIC_PLANS"
                    ? notification.targetPlans.join(", ")
                    : `${notification.targetOrgs.length} Org(s)`}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium">
                  {notification.scheduledFor
                    ? new Date(notification.scheduledFor).toLocaleDateString()
                    : "Immediate"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expires</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium">
                  {notification.expiresAt
                    ? new Date(notification.expiresAt).toLocaleDateString()
                    : "Never"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notification Details</CardTitle>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={editForm.type}
                        onValueChange={(v) => setEditForm({ ...editForm, type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INFO">Information</SelectItem>
                          <SelectItem value="WARNING">Warning</SelectItem>
                          <SelectItem value="ALERT">Alert</SelectItem>
                          <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                          <SelectItem value="FEATURE">Feature</SelectItem>
                          <SelectItem value="PROMOTION">Promotion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Select
                        value={editForm.targetType}
                        onValueChange={(v) => setEditForm({ ...editForm, targetType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Users</SelectItem>
                          <SelectItem value="SPECIFIC_PLANS">Specific Plans</SelectItem>
                          <SelectItem value="SPECIFIC_ORGS">Specific Orgs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      value={editForm.message}
                      onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                      rows={4}
                    />
                  </div>
                  {editForm.targetType === "SPECIFIC_PLANS" && (
                    <div className="space-y-2">
                      <Label>Target Plans</Label>
                      <div className="flex gap-4">
                        {["STARTER", "PROFESSIONAL", "ENTERPRISE"].map((plan) => (
                          <div key={plan} className="flex items-center gap-2">
                            <Checkbox
                              id={plan}
                              checked={editForm.targetPlans.includes(plan)}
                              onCheckedChange={() => togglePlan(plan)}
                            />
                            <label htmlFor={plan} className="text-sm">{plan}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Schedule For</Label>
                      <Input
                        type="datetime-local"
                        value={editForm.scheduledFor}
                        onChange={(e) => setEditForm({ ...editForm, scheduledFor: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expires At</Label>
                      <Input
                        type="datetime-local"
                        value={editForm.expiresAt}
                        onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title</span>
                    <span className="font-medium">{notification.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge className={`${typeConfig.color} text-white`}>{typeConfig.label}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target</span>
                    <Badge variant="outline">
                      {notification.targetType === "ALL" ? "All Users" :
                       notification.targetType === "SPECIFIC_PLANS" ? notification.targetPlans.join(", ") :
                       "Custom"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={notification.isActive ? "default" : "secondary"}>
                      {notification.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="pt-2">
                    <span className="text-muted-foreground text-sm">Message</span>
                    <p className="mt-1">{notification.message}</p>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-muted-foreground">Created</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preview</CardTitle>
              <CardDescription>How this notification will appear to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`rounded-lg border p-4 ${typeConfig.color}/10`}>
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-full ${typeConfig.color}/20 flex items-center justify-center`}>
                    <TypeIcon className={`h-5 w-5 ${typeConfig.color.replace("bg-", "text-")}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {notification.scheduledFor
                        ? new Date(notification.scheduledFor).toLocaleString()
                        : new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting">
          <Card>
            <CardHeader>
              <CardTitle>Target Organizations</CardTitle>
              <CardDescription>
                {notification.targetType === "ALL"
                  ? "This notification is visible to all organizations"
                  : notification.targetType === "SPECIFIC_PLANS"
                  ? `Visible to organizations on ${notification.targetPlans.join(", ")} plans`
                  : `Visible to ${notification.targetOrgs.length} specific organization(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notification.targetOrgDetails.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notification.targetOrgDetails.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-xs text-muted-foreground">{org.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{org.planTier}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {notification.targetType === "ALL"
                    ? "Available to all organizations"
                    : notification.targetType === "SPECIFIC_PLANS"
                    ? `Available to all ${notification.targetPlans.join(", ")} plans`
                    : "No specific organizations targeted"}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Change History</CardTitle>
              <CardDescription>Recent changes to this notification</CardDescription>
            </CardHeader>
            <CardContent>
              {notification.auditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notification.auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No history available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
