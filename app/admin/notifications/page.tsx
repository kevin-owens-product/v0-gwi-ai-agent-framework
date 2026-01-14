"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  AlertTriangle,
  Info,
  Wrench,
  Sparkles,
  Gift,
  CheckCheck,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

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
}

const notificationTypes = [
  { value: "INFO", label: "Info", icon: Info, color: "bg-blue-500" },
  { value: "WARNING", label: "Warning", icon: AlertTriangle, color: "bg-amber-500" },
  { value: "ALERT", label: "Alert", icon: AlertTriangle, color: "bg-red-500" },
  { value: "MAINTENANCE", label: "Maintenance", icon: Wrench, color: "bg-slate-500" },
  { value: "FEATURE", label: "Feature", icon: Sparkles, color: "bg-purple-500" },
  { value: "PROMOTION", label: "Promotion", icon: Gift, color: "bg-green-500" },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "INFO",
    targetType: "ALL",
    targetPlans: [] as string[],
    isActive: true,
    scheduledFor: "",
    expiresAt: "",
  })

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/notifications")
      const data = await response.json()
      setNotifications(data.notifications)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "INFO",
      targetType: "ALL",
      targetPlans: [],
      isActive: true,
      scheduledFor: "",
      expiresAt: "",
    })
    setEditingNotification(null)
  }

  const handleOpenDialog = (notification?: Notification) => {
    if (notification) {
      setEditingNotification(notification)
      setFormData({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        targetType: notification.targetType,
        targetPlans: notification.targetPlans,
        isActive: notification.isActive,
        scheduledFor: notification.scheduledFor || "",
        expiresAt: notification.expiresAt || "",
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const url = editingNotification
        ? `/api/admin/notifications/${editingNotification.id}`
        : "/api/admin/notifications"
      const method = editingNotification ? "PATCH" : "POST"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          scheduledFor: formData.scheduledFor || null,
          expiresAt: formData.expiresAt || null,
        }),
      })

      setDialogOpen(false)
      resetForm()
      fetchNotifications()
    } catch (error) {
      console.error("Failed to save notification:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (notification: Notification) => {
    try {
      await fetch(`/api/admin/notifications/${notification.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !notification.isActive }),
      })
      fetchNotifications()
    } catch (error) {
      console.error("Failed to toggle notification:", error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await fetch(`/api/admin/notifications/${notificationId}`, { method: "DELETE" })
      fetchNotifications()
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const getTypeInfo = (type: string) => {
    return notificationTypes.find(t => t.value === type) || notificationTypes[0]
  }

  const togglePlan = (plan: string) => {
    setFormData(prev => ({
      ...prev,
      targetPlans: prev.targetPlans.includes(plan)
        ? prev.targetPlans.filter(p => p !== plan)
        : [...prev.targetPlans, plan],
    }))
  }

  const handleBulkMarkAsRead = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/admin/notifications/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: false }),
          })
        )
      )
      fetchNotifications()
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id => fetch(`/api/admin/notifications/${id}`, { method: "DELETE" }))
      )
      fetchNotifications()
    } catch (error) {
      console.error("Failed to delete notifications:", error)
    }
  }

  // Define columns
  const columns: Column<Notification>[] = [
    {
      id: "notification",
      header: "Notification",
      cell: (notification) => {
        const typeInfo = getTypeInfo(notification.type)
        const TypeIcon = typeInfo.icon
        return (
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg ${typeInfo.color}/10 flex items-center justify-center`}>
              <TypeIcon className={`h-4 w-4 ${typeInfo.color.replace("bg-", "text-")}`} />
            </div>
            <div>
              <p className="font-medium">{notification.title}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {notification.message}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      id: "type",
      header: "Type",
      cell: (notification) => {
        const typeInfo = getTypeInfo(notification.type)
        return (
          <Badge className={`${typeInfo.color} text-white`}>
            {typeInfo.label}
          </Badge>
        )
      },
    },
    {
      id: "target",
      header: "Target",
      cell: (notification) => (
        <Badge variant="outline">
          {notification.targetType === "ALL" ? "All Users" :
           notification.targetType === "SPECIFIC_PLANS" ? notification.targetPlans.join(", ") :
           "Custom"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      headerClassName: "text-center",
      className: "text-center",
      cell: (notification) => (
        <Switch
          checked={notification.isActive}
          onCheckedChange={() => handleToggle(notification)}
        />
      ),
    },
    {
      id: "schedule",
      header: "Schedule",
      cell: (notification) => (
        <span className="text-muted-foreground">
          {notification.scheduledFor
            ? new Date(notification.scheduledFor).toLocaleDateString()
            : "Immediate"}
        </span>
      ),
    },
    {
      id: "created",
      header: "Created",
      cell: (notification) => (
        <span className="text-muted-foreground">
          {new Date(notification.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<Notification>[] = [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (notification) => handleOpenDialog(notification),
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: "Mark as Inactive",
      icon: <CheckCheck className="h-4 w-4" />,
      onClick: handleBulkMarkAsRead,
      confirmTitle: "Mark Notifications as Inactive",
      confirmDescription: "Are you sure you want to mark the selected notifications as inactive?",
    },
    {
      label: "Delete Selected",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      separator: true,
      confirmTitle: "Delete Notifications",
      confirmDescription: "Are you sure you want to delete the selected notifications? This action cannot be undone.",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>
                Send announcements, alerts, and updates to platform users
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchNotifications} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Notification
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingNotification ? "Edit Notification" : "Create Notification"}
                    </DialogTitle>
                    <DialogDescription>
                      Send a notification to platform users
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {notificationTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="h-4 w-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Target Audience</Label>
                        <Select
                          value={formData.targetType}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, targetType: v }))}
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
                        placeholder="Notification title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        placeholder="Notification message..."
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    {formData.targetType === "SPECIFIC_PLANS" && (
                      <div className="space-y-2">
                        <Label>Target Plans</Label>
                        <div className="flex gap-4">
                          {["STARTER", "PROFESSIONAL", "ENTERPRISE"].map((plan) => (
                            <div key={plan} className="flex items-center gap-2">
                              <Checkbox
                                id={plan}
                                checked={formData.targetPlans.includes(plan)}
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
                        <Label>Schedule For (optional)</Label>
                        <Input
                          type="datetime-local"
                          value={formData.scheduledFor}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Expires At (optional)</Label>
                        <Input
                          type="datetime-local"
                          value={formData.expiresAt}
                          onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Active</Label>
                        <p className="text-xs text-muted-foreground">Show this notification immediately</p>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.title || !formData.message || isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : editingNotification ? (
                        "Update"
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdminDataTable
            data={notifications}
            columns={columns}
            getRowId={(notification) => notification.id}
            isLoading={isLoading}
            emptyMessage="No notifications created"
            viewHref={(notification) => `/admin/notifications/${notification.id}`}
            onDelete={(notification) => handleDelete(notification.id)}
            deleteConfirmTitle="Delete Notification"
            deleteConfirmDescription={(notification) =>
              `Are you sure you want to delete "${notification.title}"? This action cannot be undone.`
            }
            rowActions={rowActions}
            bulkActions={bulkActions}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>
    </div>
  )
}
