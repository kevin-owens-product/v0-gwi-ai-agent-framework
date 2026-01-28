"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  ArrowLeft,
  Megaphone,
  Edit,
  Trash,
  Send,
  Calendar,
  XCircle,
  Clock,
  CheckCircle,
  Users,
  Building2,
  Crown,
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Loader2,
  AlertTriangle,
  Eye,
  MousePointer,
  TrendingUp,
  History,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

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

interface Creator {
  id: string
  email: string
  name: string | null
}

interface BroadcastMessage {
  id: string
  title: string
  content: string
  contentHtml: string | null
  type: string
  priority: string
  status: string
  targetType: string
  targetOrgs: string[]
  targetPlans: string[]
  targetRoles: string[]
  channels: string[]
  totalRecipients: number
  delivered: number
  opened: number
  clicked: number
  scheduledFor: string | null
  sentAt: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  targetOrgDetails: Organization[]
  auditLogs: AuditLog[]
  creator: Creator | null
}

const channelIcons: Record<string, typeof Bell> = {
  IN_APP: Bell,
  EMAIL: Mail,
  PUSH: Smartphone,
  SMS: MessageSquare,
  SLACK: MessageSquare,
}

export default function BroadcastMessageDetailPage() {
  const t = useTranslations("admin.broadcast")
  const tCommon = useTranslations("common")

  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const messageId = params.id as string
  const showScheduleDialog = searchParams.get("schedule") === "true"

  const [message, setMessage] = useState<BroadcastMessage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(showScheduleDialog)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const typeConfig: Record<string, { color: string; label: string }> = {
    ANNOUNCEMENT: { color: "bg-blue-500", label: t("types.announcement") },
    PRODUCT_UPDATE: { color: "bg-purple-500", label: t("types.productUpdate") },
    MAINTENANCE: { color: "bg-amber-500", label: t("types.maintenance") },
    SECURITY_ALERT: { color: "bg-red-500", label: t("types.securityAlert") },
    MARKETING: { color: "bg-green-500", label: t("types.marketing") },
    SURVEY: { color: "bg-indigo-500", label: t("types.survey") },
  }

  const fetchMessage = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/broadcast/messages/${messageId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch message")
      }
      const data = await response.json()
      setMessage(data.message)
    } catch (error) {
      console.error("Failed to fetch message:", error)
      toast.error(t("toast.loadFailed"))
    } finally {
      setIsLoading(false)
    }
  }, [messageId, t])

  useEffect(() => {
    fetchMessage()
  }, [fetchMessage])

  const handleSendNow = async () => {
    setIsSending(true)
    try {
      const response = await fetch(`/api/admin/broadcast/messages/${messageId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send message")
      }

      toast.success(t("toast.messageSent"))
      fetchMessage()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.sendFailed"))
    } finally {
      setIsSending(false)
    }
  }

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error(t("validation.selectDateTime"))
      return
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`)
    if (scheduledFor <= new Date()) {
      toast.error(t("validation.futureTime"))
      return
    }

    setIsSending(true)
    try {
      const response = await fetch(`/api/admin/broadcast/messages/${messageId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledFor: scheduledFor.toISOString() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to schedule message")
      }

      toast.success(t("toast.messageScheduled"))
      setScheduleDialogOpen(false)
      fetchMessage()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.scheduleFailed"))
    } finally {
      setIsSending(false)
    }
  }

  const handleCancel = async () => {
    try {
      const response = await fetch(`/api/admin/broadcast/messages/${messageId}/cancel`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to cancel message")
      }

      toast.success(t("toast.messageCancelled"))
      fetchMessage()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.cancelFailed"))
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/broadcast/messages/${messageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete message")
      }

      toast.success(t("toast.messageDeleted"))
      router.push("/admin/broadcast/messages")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.deleteFailed"))
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("status.sent")}
          </Badge>
        )
      case "SCHEDULED":
        return (
          <Badge className="bg-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            {t("status.scheduled")}
          </Badge>
        )
      case "SENDING":
        return (
          <Badge className="bg-yellow-500">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            {t("status.sending")}
          </Badge>
        )
      case "DRAFT":
        return <Badge variant="secondary">{t("status.draft")}</Badge>
      case "CANCELLED":
        return (
          <Badge variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            {t("status.cancelled")}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive">{t("priority.urgent")}</Badge>
      case "HIGH":
        return <Badge className="bg-orange-500">{t("priority.high")}</Badge>
      case "NORMAL":
        return <Badge variant="secondary">{t("priority.normal")}</Badge>
      default:
        return <Badge variant="outline">{t("priority.low")}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!message) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("back")}
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">{t("empty.messageNotFound")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const config = typeConfig[message.type] || typeConfig.ANNOUNCEMENT
  const openRate = message.totalRecipients > 0 ? Math.round((message.opened / message.totalRecipients) * 100) : 0
  const clickRate = message.opened > 0 ? Math.round((message.clicked / message.opened) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/broadcast/messages">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Link>
          </Button>
          <div className={`h-12 w-12 rounded-lg ${config.color}/10 flex items-center justify-center`}>
            <Megaphone className={`h-6 w-6 ${config.color.replace("bg-", "text-")}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{message.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(message.status)}
              <Badge className={`${config.color} text-white`}>{config.label}</Badge>
              {getPriorityBadge(message.priority)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {message.status === "DRAFT" && (
            <>
              <Button variant="outline" asChild>
                <Link href={`/admin/broadcast/messages/${message.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  {tCommon("edit")}
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setScheduleDialogOpen(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                {t("actions.schedule")}
              </Button>
              <Button onClick={handleSendNow} disabled={isSending}>
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {t("actions.sendNow")}
              </Button>
            </>
          )}
          {message.status === "SCHEDULED" && (
            <Button variant="outline" onClick={handleCancel}>
              <XCircle className="h-4 w-4 mr-2" />
              {tCommon("cancel")}
            </Button>
          )}
          <Button
            variant="outline"
            className="text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="h-4 w-4 mr-2" />
            {tCommon("delete")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
          <TabsTrigger value="targeting">{t("tabs.targeting")}</TabsTrigger>
          <TabsTrigger value="delivery">{t("tabs.deliveryStats")}</TabsTrigger>
          <TabsTrigger value="history">{t("tabs.history")}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.totalRecipients")}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{message.totalRecipients.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.delivered")}</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{message.delivered.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.openRate")}</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {t("stats.opened", { count: message.opened.toLocaleString() })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.clickRate")}</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clickRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {t("stats.clicked", { count: message.clicked.toLocaleString() })}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("details.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("table.type")}</p>
                  <p className="font-medium">{config.label}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("table.priority")}</p>
                  <p className="font-medium">{message.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("form.targetAudience")}</p>
                  <p className="font-medium">{message.targetType.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("table.channels")}</p>
                  <div className="flex gap-2 mt-1">
                    {message.channels.map((channel) => {
                      const Icon = channelIcons[channel] || Bell
                      return (
                        <div
                          key={channel}
                          className="flex items-center gap-1 text-sm"
                        >
                          <Icon className="h-4 w-4" />
                          {channel.replace("_", " ")}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("details.created")}</p>
                  <p className="font-medium">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {message.sentAt ? t("details.sent") : message.scheduledFor ? t("details.scheduledFor") : t("details.lastUpdated")}
                  </p>
                  <p className="font-medium">
                    {message.sentAt
                      ? new Date(message.sentAt).toLocaleString()
                      : message.scheduledFor
                        ? new Date(message.scheduledFor).toLocaleString()
                        : new Date(message.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {message.creator && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("details.createdBy")}</p>
                  <p className="font-medium">
                    {message.creator.name || message.creator.email}
                  </p>
                </div>
              )}
              {message.expiresAt && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("details.expires")}</p>
                  <p className="font-medium">
                    {new Date(message.expiresAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>{t("content.title")}</CardTitle>
              <CardDescription>{t("content.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="max-w-lg mx-auto bg-background rounded-lg shadow-lg border">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Megaphone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-1">
                          {message.type.replace("_", " ")}
                        </Badge>
                        <h3 className="font-semibold">{message.title}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {message.contentHtml ? (
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: message.contentHtml }}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  <div className="px-4 pb-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {message.sentAt
                        ? new Date(message.sentAt).toLocaleString()
                        : new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">{t("content.plainText")}</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Targeting Tab */}
        <TabsContent value="targeting">
          <Card>
            <CardHeader>
              <CardTitle>{t("targeting.title")}</CardTitle>
              <CardDescription>
                {message.targetType === "ALL"
                  ? t("targeting.allUsersDescription")
                  : message.targetType === "SPECIFIC_PLANS"
                    ? t("targeting.specificPlansDescription", { plans: message.targetPlans.join(", ") })
                    : message.targetType === "SPECIFIC_ORGS"
                      ? t("targeting.specificOrgsDescription", { count: message.targetOrgs.length })
                      : t("targeting.specificRolesDescription", { roles: message.targetRoles.join(", ") })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {message.targetType === "ALL" ? (
                      <Users className="h-5 w-5 text-primary" />
                    ) : message.targetType === "SPECIFIC_PLANS" ? (
                      <Crown className="h-5 w-5 text-primary" />
                    ) : (
                      <Building2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{message.targetType.replace(/_/g, " ")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("targeting.estimatedRecipients", { count: message.totalRecipients.toLocaleString() })}
                    </p>
                  </div>
                </div>

                {message.targetPlans.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">{t("targeting.targetPlans")}</h4>
                    <div className="flex gap-2">
                      {message.targetPlans.map((plan) => (
                        <Badge key={plan} variant="outline">
                          {plan}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {message.targetOrgDetails.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">{t("targeting.targetOrganizations")}</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("targeting.organization")}</TableHead>
                          <TableHead>{t("targeting.plan")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {message.targetOrgDetails.map((org) => (
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
                  </div>
                )}

                {message.targetRoles.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">{t("targeting.targetRoles")}</h4>
                    <div className="flex gap-2">
                      {message.targetRoles.map((role) => (
                        <Badge key={role} variant="outline">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Stats Tab */}
        <TabsContent value="delivery" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("deliveryStats.funnel")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("stats.totalRecipients")}</span>
                    <span className="font-medium">{message.totalRecipients.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "100%" }} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("stats.delivered")}</span>
                    <span className="font-medium">{message.delivered.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${message.totalRecipients > 0 ? (message.delivered / message.totalRecipients) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("deliveryStats.opened")}</span>
                    <span className="font-medium">{message.opened.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${message.totalRecipients > 0 ? (message.opened / message.totalRecipients) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("deliveryStats.clicked")}</span>
                    <span className="font-medium">{message.clicked.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{
                        width: `${message.totalRecipients > 0 ? (message.clicked / message.totalRecipients) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("deliveryStats.channelBreakdown")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {message.channels.map((channel) => {
                    const Icon = channelIcons[channel] || Bell
                    return (
                      <div key={channel} className="flex items-center gap-4 p-3 rounded-lg border">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{channel.replace("_", " ")}</p>
                          <p className="text-sm text-muted-foreground">{t("deliveryStats.deliveryChannel")}</p>
                        </div>
                        <Badge variant="outline">{tCommon("active")}</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t("deliveryStats.performanceMetrics")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold">
                    {message.totalRecipients > 0
                      ? Math.round((message.delivered / message.totalRecipients) * 100)
                      : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">{t("deliveryStats.deliveryRate")}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold">{openRate}%</p>
                  <p className="text-sm text-muted-foreground">{t("stats.openRate")}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold">{clickRate}%</p>
                  <p className="text-sm text-muted-foreground">{t("stats.clickRate")}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold">
                    {message.totalRecipients - message.delivered}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("deliveryStats.failed")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                {t("history.title")}
              </CardTitle>
              <CardDescription>{t("history.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {message.auditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("history.action")}</TableHead>
                      <TableHead>{t("history.details")}</TableHead>
                      <TableHead>{t("table.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {message.auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {Object.entries(log.details)
                            .slice(0, 3)
                            .map(([key, value]) => `${key}: ${String(value)}`)
                            .join(", ")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">{t("history.noHistory")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("scheduleDialog.title")}</DialogTitle>
            <DialogDescription>{t("scheduleDialog.description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t("scheduleDialog.date")}</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("scheduleDialog.time")}</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleSchedule} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("scheduleDialog.scheduling")}
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  {t("actions.schedule")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("deleteDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description", { title: message.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("deleteDialog.deleting")}
                </>
              ) : (
                tCommon("delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
