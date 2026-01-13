"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
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

const typeConfig: Record<string, { color: string; label: string }> = {
  ANNOUNCEMENT: { color: "bg-blue-500", label: "Announcement" },
  PRODUCT_UPDATE: { color: "bg-purple-500", label: "Product Update" },
  MAINTENANCE: { color: "bg-amber-500", label: "Maintenance" },
  SECURITY_ALERT: { color: "bg-red-500", label: "Security Alert" },
  MARKETING: { color: "bg-green-500", label: "Marketing" },
  SURVEY: { color: "bg-indigo-500", label: "Survey" },
}

export default function BroadcastMessageDetailPage() {
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
      toast.error("Failed to load broadcast message")
    } finally {
      setIsLoading(false)
    }
  }, [messageId])

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

      toast.success("Broadcast message sent successfully")
      fetchMessage()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error("Please select a date and time")
      return
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`)
    if (scheduledFor <= new Date()) {
      toast.error("Scheduled time must be in the future")
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

      toast.success("Broadcast message scheduled")
      setScheduleDialogOpen(false)
      fetchMessage()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to schedule message")
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

      toast.success("Broadcast message cancelled")
      fetchMessage()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel message")
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

      toast.success("Broadcast message deleted")
      router.push("/admin/broadcast/messages")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete message")
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
            Sent
          </Badge>
        )
      case "SCHEDULED":
        return (
          <Badge className="bg-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        )
      case "SENDING":
        return (
          <Badge className="bg-yellow-500">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Sending
          </Badge>
        )
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>
      case "CANCELLED":
        return (
          <Badge variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive">Urgent</Badge>
      case "HIGH":
        return <Badge className="bg-orange-500">High</Badge>
      case "NORMAL":
        return <Badge variant="secondary">Normal</Badge>
      default:
        return <Badge variant="outline">Low</Badge>
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
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Broadcast message not found</p>
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
              Back
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
                  Edit
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setScheduleDialogOpen(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
              <Button onClick={handleSendNow} disabled={isSending}>
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Now
              </Button>
            </>
          )}
          {message.status === "SCHEDULED" && (
            <Button variant="outline" onClick={handleCancel}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            className="text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Stats</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{message.totalRecipients.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{message.delivered.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {message.opened.toLocaleString()} opened
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clickRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {message.clicked.toLocaleString()} clicked
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Message Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{config.label}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <p className="font-medium">{message.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Audience</p>
                  <p className="font-medium">{message.targetType.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Channels</p>
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
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {message.sentAt ? "Sent" : message.scheduledFor ? "Scheduled For" : "Last Updated"}
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
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-medium">
                    {message.creator.name || message.creator.email}
                  </p>
                </div>
              )}
              {message.expiresAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
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
              <CardTitle>Message Content</CardTitle>
              <CardDescription>The content that will be shown to recipients</CardDescription>
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
                <h4 className="font-medium mb-2">Plain Text Content</h4>
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
              <CardTitle>Target Audience</CardTitle>
              <CardDescription>
                {message.targetType === "ALL"
                  ? "This message targets all active users"
                  : message.targetType === "SPECIFIC_PLANS"
                    ? `This message targets users on ${message.targetPlans.join(", ")} plans`
                    : message.targetType === "SPECIFIC_ORGS"
                      ? `This message targets ${message.targetOrgs.length} specific organization(s)`
                      : `This message targets users with ${message.targetRoles.join(", ")} roles`}
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
                      {message.totalRecipients.toLocaleString()} estimated recipients
                    </p>
                  </div>
                </div>

                {message.targetPlans.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Target Plans</h4>
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
                    <h4 className="font-medium mb-2">Target Organizations</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Organization</TableHead>
                          <TableHead>Plan</TableHead>
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
                    <h4 className="font-medium mb-2">Target Roles</h4>
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
                <CardTitle>Delivery Funnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Recipients</span>
                    <span className="font-medium">{message.totalRecipients.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "100%" }} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Delivered</span>
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
                    <span className="text-sm">Opened</span>
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
                    <span className="text-sm">Clicked</span>
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
                <CardTitle>Channel Breakdown</CardTitle>
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
                          <p className="text-sm text-muted-foreground">Delivery channel</p>
                        </div>
                        <Badge variant="outline">Active</Badge>
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
                Performance Metrics
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
                  <p className="text-sm text-muted-foreground">Delivery Rate</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold">{openRate}%</p>
                  <p className="text-sm text-muted-foreground">Open Rate</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold">{clickRate}%</p>
                  <p className="text-sm text-muted-foreground">Click Rate</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold">
                    {message.totalRecipients - message.delivered}
                  </p>
                  <p className="text-sm text-muted-foreground">Failed</p>
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
                Activity History
              </CardTitle>
              <CardDescription>Recent actions on this broadcast message</CardDescription>
            </CardHeader>
            <CardContent>
              {message.auditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Date</TableHead>
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
                <p className="text-muted-foreground text-center py-8">No history available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Broadcast</DialogTitle>
            <DialogDescription>Choose when this message should be sent</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
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
              Delete Broadcast Message
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{message.title}&quot;? This action cannot be
              undone.
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
    </div>
  )
}
