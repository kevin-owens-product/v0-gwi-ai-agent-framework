"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  FileText,
  Settings,
  Sparkles,
  Trash2,
  Users,
  Zap,
  AlertCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PageTracker } from "@/components/tracking/PageTracker"
import { toast } from "sonner"

type Notification = {
  id: string
  type: "workflow" | "agent" | "team" | "system" | "report"
  title: string
  description: string
  time: string
  read: boolean
  actionUrl?: string
}

const getIcon = (type: Notification["type"]) => {
  switch (type) {
    case "workflow":
      return Zap
    case "agent":
      return Sparkles
    case "team":
      return Users
    case "system":
      return AlertCircle
    case "report":
      return FileText
    default:
      return Bell
  }
}

export default function NotificationsPage() {
  const t = useTranslations("notifications")
  const tCommon = useTranslations("common")

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch('/api/v1/notifications', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (response.ok) {
          const data = await response.json()
          const formatted = (data.notifications || []).map((n: any) => ({
            ...n,
            time: formatTimeAgo(n.time),
          }))
          setNotifications(formatted)
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        toast.error('Failed to load notifications')
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/v1/notifications', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds: [id] }),
      })
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/v1/notifications', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true }),
      })
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setSelectedIds((prev) => prev.filter((i) => i !== id))
  }

  const allRead = unreadCount === 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const deleteSelected = () => {
    setNotifications((prev) => prev.filter((n) => !selectedIds.includes(n.id)))
    setSelectedIds([])
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const selectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(notifications.map((n) => n.id))
    }
  }

  const filterByType = (type: string) => {
    if (type === "all") return notifications
    return notifications.filter((n) => n.type === type)
  }

  // Get translated notification title (fallback to title if translation not found)
  const getNotificationTitle = (title: string, titleKey?: string) => {
    if (titleKey) {
      try {
        return t(`titles.${titleKey}`)
      } catch {
        return title
      }
    }
    return title
  }

  return (
    <div className="space-y-6">
      <PageTracker pageName="Notifications" metadata={{ unreadCount }} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("page.title")}</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? t("page.description", { count: unreadCount })
              : t("page.allCaughtUp")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/settings/notifications">
              <Settings className="mr-2 h-4 w-4" />
              {t("page.settings")}
            </Link>
          </Button>
          {!allRead && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              {t("page.markAllRead")}
            </Button>
          )}
        </div>
      </div>

      {/* Actions Bar */}
      {selectedIds.length > 0 && (
        <Card>
          <CardContent className="py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("page.selected", { count: selectedIds.length })}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                {tCommon("cancel")}
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteSelected}>
                <Trash2 className="mr-2 h-4 w-4" />
                {tCommon("delete")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            {t("types.all")}
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="workflow">{t("types.workflow")}</TabsTrigger>
          <TabsTrigger value="agent">{t("types.agent")}</TabsTrigger>
          <TabsTrigger value="team">{t("types.team")}</TabsTrigger>
          <TabsTrigger value="system">{t("types.system")}</TabsTrigger>
        </TabsList>

        {["all", "workflow", "agent", "team", "system", "report"].map((type) => (
          <TabsContent key={type} value={type} className="mt-6">
            <Card>
              <CardHeader className="py-3 border-b">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedIds.length === notifications.length && notifications.length > 0}
                    onCheckedChange={selectAll}
                  />
                  <span className="text-sm text-muted-foreground">{t("page.selectAll")}</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filterByType(type).length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>{t("page.noNotifications")}</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filterByType(type).map((notification) => {
                      const Icon = getIcon(notification.type)
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors",
                            !notification.read && "bg-primary/5",
                          )}
                        >
                          <Checkbox
                            checked={selectedIds.includes(notification.id)}
                            onCheckedChange={() => toggleSelect(notification.id)}
                          />
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                              notification.type === "system" ? "bg-yellow-500/10" : "bg-primary/10",
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5",
                                notification.type === "system" ? "text-yellow-600" : "text-primary",
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn("font-medium", !notification.read && "text-foreground")}>
                                {getNotificationTitle(notification.title)}
                              </span>
                              {!notification.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{notification.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {notification.time}
                              </span>
                              {notification.actionUrl && (
                                <Link href={notification.actionUrl} className="text-xs text-primary hover:underline">
                                  {t("page.viewDetails")}
                                </Link>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
