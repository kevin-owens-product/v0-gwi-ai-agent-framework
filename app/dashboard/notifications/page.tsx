"use client"

import { useState } from "react"
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
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PageTracker } from "@/components/tracking/PageTracker"

type Notification = {
  id: string
  type: "workflow" | "agent" | "team" | "system" | "report"
  title: string
  description: string
  time: string
  read: boolean
  actionUrl?: string
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "workflow",
    title: "Workflow completed",
    description: "Your 'Weekly Competitive Analysis' workflow has finished running",
    time: "5 minutes ago",
    read: false,
    actionUrl: "/dashboard/workflows/1",
  },
  {
    id: "2",
    type: "agent",
    title: "New agent available",
    description: "The 'Trend Forecaster Pro' agent is now available in the Agent Store",
    time: "1 hour ago",
    read: false,
    actionUrl: "/dashboard/store/trend-forecaster-pro",
  },
  {
    id: "3",
    type: "team",
    title: "Team member joined",
    description: "Sarah Chen has joined your workspace",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "4",
    type: "system",
    title: "Usage limit approaching",
    description: "You've used 80% of your monthly query limit",
    time: "3 hours ago",
    read: true,
    actionUrl: "/dashboard/settings/billing",
  },
  {
    id: "5",
    type: "report",
    title: "Report ready for download",
    description: "Your 'Q4 Consumer Insights' report is ready",
    time: "5 hours ago",
    read: true,
    actionUrl: "/dashboard/reports/q4-consumer-insights",
  },
  {
    id: "6",
    type: "workflow",
    title: "Workflow failed",
    description: "The 'Daily Brand Tracking' workflow encountered an error",
    time: "1 day ago",
    read: true,
    actionUrl: "/dashboard/workflows/2",
  },
  {
    id: "7",
    type: "agent",
    title: "Agent update available",
    description: "Audience Strategist Pro has been updated to v2.5.0",
    time: "2 days ago",
    read: true,
  },
  {
    id: "8",
    type: "system",
    title: "Scheduled maintenance",
    description: "Platform maintenance scheduled for this Sunday, 2-4 AM UTC",
    time: "3 days ago",
    read: true,
  },
]

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
  const [notifications, setNotifications] = useState(initialNotifications)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const unreadCount = notifications.filter((n) => !n.read).length
  const allRead = unreadCount === 0

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setSelectedIds((prev) => prev.filter((i) => i !== id))
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

  return (
    <div className="space-y-6">
      <PageTracker pageName="Notifications" metadata={{ unreadCount }} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "You're all caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/settings/notifications">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          {!allRead && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Actions Bar */}
      {selectedIds.length > 0 && (
        <Card>
          <CardContent className="py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteSelected}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="workflow">Workflows</TabsTrigger>
          <TabsTrigger value="agent">Agents</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
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
                  <span className="text-sm text-muted-foreground">Select all</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filterByType(type).length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No notifications</p>
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
                                {notification.title}
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
                                  View details
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
