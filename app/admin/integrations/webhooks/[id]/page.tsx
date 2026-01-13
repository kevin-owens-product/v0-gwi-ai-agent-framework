"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Webhook,
  Loader2,
  Building2,
  Activity,
  Calendar,
  Clock,
  Edit,
  Save,
  X,
  Power,
  PowerOff,
  Trash,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Organization {
  id: string
  name: string
  slug: string
}

interface Delivery {
  id: string
  eventType: string
  status: string
  httpStatus: number | null
  response: string | null
  error: string | null
  attempts: number
  createdAt: string
  deliveredAt: string | null
}

interface HealthMetrics {
  totalLast7Days: number
  successfulLast7Days: number
  failedLast7Days: number
  averageResponseTime: number
  successRate: number
}

interface WebhookEndpoint {
  id: string
  name: string | null
  description: string | null
  url: string
  status: string
  orgId: string
  events: string[]
  timeout: number
  retryPolicy: { maxRetries?: number; retryDelay?: number }
  isHealthy: boolean
  consecutiveFailures: number
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  lastDeliveryAt: string | null
  lastStatus: number | null
  disabledAt: string | null
  disabledReason: string | null
  createdAt: string
  updatedAt: string
  organization: Organization | null
  deliveries: Delivery[]
  healthMetrics: HealthMetrics
}

const webhookEvents = [
  "user.created",
  "user.updated",
  "user.deleted",
  "organization.created",
  "organization.updated",
  "agent.run.completed",
  "workflow.completed",
  "report.generated",
  "subscription.changed",
]

export default function WebhookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const webhookId = params.id as string

  const [webhook, setWebhook] = useState<WebhookEndpoint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    url: "",
    timeout: 30,
    events: [] as string[],
  })

  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [deliveriesPage, setDeliveriesPage] = useState(1)
  const [deliveriesTotalPages, setDeliveriesTotalPages] = useState(1)
  const [deliveriesLoading, setDeliveriesLoading] = useState(false)
  const [deliveryStats, setDeliveryStats] = useState({
    PENDING: 0,
    DELIVERED: 0,
    FAILED: 0,
    RETRYING: 0,
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const fetchWebhook = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/integrations/webhooks/${webhookId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch webhook")
      }
      const data = await response.json()
      setWebhook(data.webhook)
      setEditForm({
        name: data.webhook.name || "",
        description: data.webhook.description || "",
        url: data.webhook.url,
        timeout: data.webhook.timeout,
        events: data.webhook.events,
      })
    } catch (error) {
      console.error("Failed to fetch webhook:", error)
      toast.error("Failed to load webhook")
    } finally {
      setIsLoading(false)
    }
  }, [webhookId])

  const fetchDeliveries = useCallback(async () => {
    setDeliveriesLoading(true)
    try {
      const response = await fetch(
        `/api/admin/integrations/webhooks/${webhookId}/deliveries?page=${deliveriesPage}`
      )
      if (response.ok) {
        const data = await response.json()
        setDeliveries(data.deliveries)
        setDeliveriesTotalPages(data.totalPages)
        setDeliveryStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch deliveries:", error)
    } finally {
      setDeliveriesLoading(false)
    }
  }, [webhookId, deliveriesPage])

  useEffect(() => {
    fetchWebhook()
  }, [fetchWebhook])

  useEffect(() => {
    fetchDeliveries()
  }, [fetchDeliveries])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/integrations/webhooks/${webhookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name || null,
          description: editForm.description || null,
          url: editForm.url,
          timeout: editForm.timeout,
          events: editForm.events,
        }),
      })
      if (response.ok) {
        setIsEditing(false)
        fetchWebhook()
        toast.success("Webhook updated")
      } else {
        toast.error("Failed to update webhook")
      }
    } catch (error) {
      console.error("Failed to update webhook:", error)
      toast.error("Failed to update webhook")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!webhook) return
    try {
      const newStatus = webhook.status === "ACTIVE" ? "PAUSED" : "ACTIVE"
      const response = await fetch(`/api/admin/integrations/webhooks/${webhookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        fetchWebhook()
        toast.success(`Webhook ${newStatus === "ACTIVE" ? "activated" : "paused"}`)
      }
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleTestWebhook = async () => {
    setIsTesting(true)
    try {
      const response = await fetch(`/api/admin/integrations/webhooks/${webhookId}/test`, {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        toast.success("Test webhook delivered successfully")
      } else {
        toast.error(`Test failed: ${data.delivery?.error || "Unknown error"}`)
      }
      fetchWebhook()
      fetchDeliveries()
    } catch (error) {
      toast.error("Failed to send test webhook")
    } finally {
      setIsTesting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/integrations/webhooks/${webhookId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Webhook deleted")
        router.push("/admin/integrations/webhooks")
      } else {
        toast.error("Failed to delete webhook")
      }
    } catch (error) {
      toast.error("Failed to delete webhook")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const toggleEvent = (event: string) => {
    setEditForm(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Active</Badge>
      case "PAUSED":
        return <Badge className="bg-yellow-500">Paused</Badge>
      case "DISABLED":
        return <Badge variant="secondary">Disabled</Badge>
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <Badge className="bg-green-500">Delivered</Badge>
      case "PENDING":
        return <Badge className="bg-blue-500">Pending</Badge>
      case "RETRYING":
        return <Badge className="bg-yellow-500">Retrying</Badge>
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!webhook) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Webhook not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook</DialogTitle>
            <DialogDescription>
              This will permanently delete this webhook and all its delivery history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/integrations/webhooks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Webhook className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{webhook.name || "Unnamed Webhook"}</h1>
            <p className="text-sm text-muted-foreground truncate max-w-[400px]">{webhook.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTestWebhook} disabled={isTesting || webhook.status !== "ACTIVE"}>
            {isTesting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Test
          </Button>
          <Button
            variant={webhook.status === "ACTIVE" ? "outline" : "default"}
            onClick={handleToggleStatus}
          >
            {webhook.status === "ACTIVE" ? (
              <>
                <PowerOff className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Power className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Health Banner */}
      {!webhook.isHealthy && webhook.status === "ACTIVE" && (
        <Card className="border-yellow-500 bg-yellow-500/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium text-yellow-700">Webhook Unhealthy</p>
                <p className="text-sm text-muted-foreground">
                  {webhook.consecutiveFailures} consecutive failures.
                  {webhook.disabledReason && ` Reason: ${webhook.disabledReason}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                {webhook.isHealthy ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
              </CardHeader>
              <CardContent>
                {getStatusBadge(webhook.status)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(webhook.totalDeliveries)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  webhook.healthMetrics.successRate >= 95 ? "text-green-500" :
                  webhook.healthMetrics.successRate >= 80 ? "text-yellow-500" : "text-red-500"
                }`}>
                  {webhook.healthMetrics.successRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{webhook.healthMetrics.totalLast7Days}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Webhook Details */}
            <Card>
              <CardHeader>
                <CardTitle>Webhook Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{webhook.name || "Unnamed"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">URL</span>
                  <span className="font-medium text-right max-w-[200px] truncate">
                    {webhook.url}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timeout</span>
                  <span className="font-medium">{webhook.timeout}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(webhook.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Delivery</span>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {webhook.lastDeliveryAt
                      ? new Date(webhook.lastDeliveryAt).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>The organization this webhook belongs to</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {webhook.organization ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{webhook.organization.name}</p>
                        <p className="text-sm text-muted-foreground">{webhook.organization.slug}</p>
                      </div>
                    </div>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/admin/tenants/${webhook.organization.id}`}>
                        View Organization
                      </Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">Organization not found</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subscribed Events */}
          <Card>
            <CardHeader>
              <CardTitle>Subscribed Events</CardTitle>
              <CardDescription>Events this webhook listens to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {webhook.events.length > 0 ? (
                  webhook.events.map((event, i) => (
                    <Badge key={i} variant="secondary">{event}</Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">No events configured (will receive all events)</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Health Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Health Metrics (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Successful</span>
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    {webhook.healthMetrics.successfulLast7Days}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">Failed</span>
                  </div>
                  <div className="text-2xl font-bold text-red-500">
                    {webhook.healthMetrics.failedLast7Days}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Total</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {webhook.healthMetrics.totalLast7Days}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-6">
          {/* Delivery Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-500">{deliveryStats.PENDING}</div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-500">{deliveryStats.DELIVERED}</div>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-500">{deliveryStats.RETRYING}</div>
                <p className="text-xs text-muted-foreground">Retrying</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-500">{deliveryStats.FAILED}</div>
                <p className="text-xs text-muted-foreground">Failed</p>
              </CardContent>
            </Card>
          </div>

          {/* Deliveries Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Delivery History</CardTitle>
                  <CardDescription>Recent webhook delivery attempts</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchDeliveries} disabled={deliveriesLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${deliveriesLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>HTTP Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Delivered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveriesLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}>
                          <div className="h-10 bg-muted animate-pulse rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : deliveries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No deliveries yet</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    deliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell>
                          <Badge variant="outline">{delivery.eventType}</Badge>
                        </TableCell>
                        <TableCell>{getDeliveryStatusBadge(delivery.status)}</TableCell>
                        <TableCell>
                          {delivery.httpStatus ? (
                            <code className={`text-sm ${
                              delivery.httpStatus >= 200 && delivery.httpStatus < 300
                                ? "text-green-500"
                                : "text-red-500"
                            }`}>
                              {delivery.httpStatus}
                            </code>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{delivery.attempts}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(delivery.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {delivery.deliveredAt
                            ? new Date(delivery.deliveredAt).toLocaleString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {deliveriesTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeliveriesPage(p => Math.max(1, p - 1))}
                    disabled={deliveriesPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {deliveriesPage} of {deliveriesTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeliveriesPage(p => Math.min(deliveriesTotalPages, p + 1))}
                    disabled={deliveriesPage === deliveriesTotalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Edit Webhook Settings</CardTitle>
                  <CardDescription>Update webhook configuration</CardDescription>
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Webhook Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Optional name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={editForm.timeout}
                    onChange={(e) => setEditForm({ ...editForm, timeout: parseInt(e.target.value) || 30 })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Endpoint URL</Label>
                <Input
                  id="url"
                  value={editForm.url}
                  onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                  disabled={!isEditing}
                  placeholder="https://example.com/webhooks"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  disabled={!isEditing}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Subscribed Events</Label>
                <div className="flex flex-wrap gap-2">
                  {webhookEvents.map((event) => (
                    <Badge
                      key={event}
                      variant={editForm.events.includes(event) ? "default" : "outline"}
                      className={isEditing ? "cursor-pointer" : ""}
                      onClick={() => isEditing && toggleEvent(event)}
                    >
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} className="mt-4">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Settings
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
