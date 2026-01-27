"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
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
import { showSuccessToast, showErrorToast } from "@/lib/toast-utils"

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

const notificationTypeIcons = {
  INFO: Info,
  WARNING: AlertTriangle,
  ALERT: AlertTriangle,
  MAINTENANCE: Wrench,
  FEATURE: Sparkles,
  PROMOTION: Gift,
}

const notificationTypeColors = {
  INFO: "bg-blue-500",
  WARNING: "bg-amber-500",
  ALERT: "bg-red-500",
  MAINTENANCE: "bg-slate-500",
  FEATURE: "bg-purple-500",
  PROMOTION: "bg-green-500",
}

export default function NotificationsPage() {
  const t = useTranslations("notifications.admin")
  const tCommon = useTranslations("common")
  const tToast = useTranslations("toast")

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
      showErrorToast(tToast("error.loadFailed"))
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

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          scheduledFor: formData.scheduledFor || null,
          expiresAt: formData.expiresAt || null,
        }),
      })

      if (response.ok) {
        showSuccessToast(editingNotification ? tToast("success.updated") : tToast("success.created"))
        setDialogOpen(false)
        resetForm()
        fetchNotifications()
      } else {
        showErrorToast(editingNotification ? tToast("error.updateFailed") : tToast("error.createFailed"))
      }
    } catch (error) {
      console.error("Failed to save notification:", error)
      showErrorToast(tToast("error.saveFailed"))
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
      showErrorToast(tToast("error.updateFailed"))
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await fetch(`/api/admin/notifications/${notificationId}`, { method: "DELETE" })
      showSuccessToast(tToast("success.deleted"))
      fetchNotifications()
    } catch (error) {
      console.error("Failed to delete notification:", error)
      showErrorToast(tToast("error.deleteFailed"))
    }
  }

  const getTypeInfo = (type: string) => {
    const TypeIcon = notificationTypeIcons[type as keyof typeof notificationTypeIcons] || Info
    const color = notificationTypeColors[type as keyof typeof notificationTypeColors] || "bg-blue-500"
    return { icon: TypeIcon, color, label: t(`types.${type.toLowerCase()}`) }
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
      showSuccessToast(tToast("success.updated"))
      fetchNotifications()
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
      showErrorToast(tToast("error.updateFailed"))
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id => fetch(`/api/admin/notifications/${id}`, { method: "DELETE" }))
      )
      showSuccessToast(tToast("success.deleted"))
      fetchNotifications()
    } catch (error) {
      console.error("Failed to delete notifications:", error)
      showErrorToast(tToast("error.deleteFailed"))
    }
  }

  // Define columns
  const columns: Column<Notification>[] = [
    {
      id: "notification",
      header: t("table.notification"),
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
      header: t("table.type"),
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
      header: t("table.target"),
      cell: (notification) => (
        <Badge variant="outline">
          {notification.targetType === "ALL" ? t("form.allUsers") :
           notification.targetType === "SPECIFIC_PLANS" ? notification.targetPlans.join(", ") :
           t("table.custom")}
        </Badge>
      ),
    },
    {
      id: "status",
      header: t("table.status"),
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
      header: t("table.schedule"),
      cell: (notification) => (
        <span className="text-muted-foreground">
          {notification.scheduledFor
            ? new Date(notification.scheduledFor).toLocaleDateString()
            : t("table.immediate")}
        </span>
      ),
    },
    {
      id: "created",
      header: t("table.created"),
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
      label: t("actions.edit"),
      icon: <Pencil className="h-4 w-4" />,
      onClick: (notification) => handleOpenDialog(notification),
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.markInactive"),
      icon: <CheckCheck className="h-4 w-4" />,
      onClick: handleBulkMarkAsRead,
      confirmTitle: t("actions.markInactive"),
      confirmDescription: t("actions.markInactive"),
    },
    {
      label: t("actions.deleteSelected"),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      separator: true,
      confirmTitle: t("confirmDelete"),
      confirmDescription: t("confirmDelete"),
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>
                {t("description")}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchNotifications} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("refresh")}
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("newNotification")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingNotification ? t("editNotification") : t("createNotification")}
                    </DialogTitle>
                    <DialogDescription>
                      {t("sendNotification")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("form.type")}</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(notificationTypeIcons).map((type) => {
                              const TypeIcon = notificationTypeIcons[type as keyof typeof notificationTypeIcons]
                              return (
                                <SelectItem key={type} value={type}>
                                  <div className="flex items-center gap-2">
                                    <TypeIcon className="h-4 w-4" />
                                    {t(`types.${type.toLowerCase()}`)}
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("form.targetAudience")}</Label>
                        <Select
                          value={formData.targetType}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, targetType: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">{t("form.allUsers")}</SelectItem>
                            <SelectItem value="SPECIFIC_PLANS">{t("form.specificPlans")}</SelectItem>
                            <SelectItem value="SPECIFIC_ORGS">{t("form.specificOrgs")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("form.title")}</Label>
                      <Input
                        placeholder={t("form.titlePlaceholder")}
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("form.message")}</Label>
                      <Textarea
                        placeholder={t("form.messagePlaceholder")}
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    {formData.targetType === "SPECIFIC_PLANS" && (
                      <div className="space-y-2">
                        <Label>{t("form.targetPlans")}</Label>
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
                        <Label>{t("form.scheduleFor")}</Label>
                        <Input
                          type="datetime-local"
                          value={formData.scheduledFor}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("form.expiresAt")}</Label>
                        <Input
                          type="datetime-local"
                          value={formData.expiresAt}
                          onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{t("form.active")}</Label>
                        <p className="text-xs text-muted-foreground">{t("form.activeDescription")}</p>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      {tCommon("cancel")}
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.title || !formData.message || isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {tToast("loading.saving")}
                        </>
                      ) : editingNotification ? (
                        tCommon("save")
                      ) : (
                        tCommon("create")
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
            emptyMessage={t("empty")}
            viewHref={(notification) => `/admin/notifications/${notification.id}`}
            onDelete={(notification) => handleDelete(notification.id)}
            deleteConfirmTitle={t("confirmDelete")}
            deleteConfirmDescription={(notification) =>
              t("confirmDeleteDescription", { title: notification.title })
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
