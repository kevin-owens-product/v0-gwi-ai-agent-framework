"use client"

import { useEffect, useState } from "react"
import {
  Webhook,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  Power,
  PowerOff,
  Activity,
  Clock,
  Building2,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"

interface WebhookEndpoint {
  id: string
  name: string | null
  description: string | null
  url: string
  status: string
  orgId: string
  orgName?: string
  events: string[]
  isHealthy: boolean
  consecutiveFailures: number
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  lastDeliveryAt: string | null
  lastStatus: number | null
  createdAt: string
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

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [healthFilter, setHealthFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [showSecret, setShowSecret] = useState<string | null>(null)

  const [newWebhook, setNewWebhook] = useState({
    name: "",
    description: "",
    url: "",
    orgId: "",
    events: [] as string[],
    timeout: 30,
  })

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchWebhooks()
  }, [statusFilter, healthFilter, page])

  const fetchWebhooks = async () => {
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (healthFilter !== "all") params.set("isHealthy", healthFilter)
      if (search) params.set("search", search)

      const response = await fetch(`/api/admin/integrations/webhooks?${params}`)
      const data = await response.json()
      setWebhooks(data.webhooks || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error("Failed to fetch webhooks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWebhook = async () => {
    try {
      const response = await fetch("/api/admin/integrations/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWebhook),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create webhook")
      }

      const data = await response.json()

      toast.success("Webhook created - Make sure to save the signing secret!")

      if (data.secret) {
        setShowSecret(data.secret)
      }

      setIsCreateOpen(false)
      setNewWebhook({
        name: "",
        description: "",
        url: "",
        orgId: "",
        events: [],
        timeout: 30,
      })
      fetchWebhooks()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create webhook")
    }
  }

  const handleToggleStatus = async (webhook: WebhookEndpoint) => {
    try {
      const newStatus = webhook.status === "ACTIVE" ? "PAUSED" : "ACTIVE"
      const response = await fetch(`/api/admin/integrations/webhooks/${webhook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update webhook")
      }

      toast.success(`Webhook ${newStatus === "ACTIVE" ? "activated" : "paused"}`)
      fetchWebhooks()
    } catch (error) {
      toast.error("Failed to update webhook status")
    }
  }

  const handleTestWebhook = async (webhook: WebhookEndpoint) => {
    try {
      const response = await fetch(`/api/admin/integrations/webhooks/${webhook.id}/test`, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Test webhook delivered successfully")
      } else {
        toast.error(`Test failed: ${data.delivery?.error || "Unknown error"}`)
      }
      fetchWebhooks()
    } catch (error) {
      toast.error("Failed to send test webhook")
    }
  }

  const handleDeleteWebhook = async (webhook: WebhookEndpoint) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return

    try {
      const response = await fetch(`/api/admin/integrations/webhooks/${webhook.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete webhook")
      }

      toast.success("Webhook deleted")
      fetchWebhooks()
    } catch (error) {
      toast.error("Failed to delete webhook")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
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

  const getHealthIndicator = (webhook: WebhookEndpoint) => {
    if (webhook.isHealthy) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (webhook.consecutiveFailures > 5) {
      return <XCircle className="h-4 w-4 text-red-500" />
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const filteredWebhooks = webhooks.filter(
    (webhook) =>
      webhook.name?.toLowerCase().includes(search.toLowerCase()) ||
      webhook.url.toLowerCase().includes(search.toLowerCase()) ||
      webhook.orgName?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleEvent = (event: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Secret Display Dialog */}
      <Dialog open={!!showSecret} onOpenChange={() => setShowSecret(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webhook Signing Secret</DialogTitle>
            <DialogDescription>
              Copy this secret now - it will not be shown again! Use this to verify webhook signatures.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
            {showSecret}
          </div>
          <DialogFooter>
            <Button onClick={() => copyToClipboard(showSecret!)}>
              Copy Secret
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Webhook className="h-8 w-8 text-primary" />
            Webhooks
          </h1>
          <p className="text-muted-foreground">
            Manage webhook endpoints and monitor deliveries
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Webhook Endpoint</DialogTitle>
              <DialogDescription>
                Create a new webhook endpoint to receive event notifications
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Webhook Name</Label>
                  <Input
                    id="name"
                    placeholder="My Webhook"
                    value={newWebhook.name}
                    onChange={(e) =>
                      setNewWebhook({ ...newWebhook, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="orgId">Organization ID</Label>
                  <Input
                    id="orgId"
                    placeholder="Organization ID"
                    value={newWebhook.orgId}
                    onChange={(e) =>
                      setNewWebhook({ ...newWebhook, orgId: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">Endpoint URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/webhooks"
                  value={newWebhook.url}
                  onChange={(e) =>
                    setNewWebhook({ ...newWebhook, url: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What is this webhook used for?"
                  value={newWebhook.description}
                  onChange={(e) =>
                    setNewWebhook({ ...newWebhook, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Events to subscribe</Label>
                <div className="flex flex-wrap gap-2">
                  {webhookEvents.map((event) => (
                    <Badge
                      key={event}
                      variant={newWebhook.events.includes(event) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleEvent(event)}
                    >
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={newWebhook.timeout}
                  onChange={(e) =>
                    setNewWebhook({ ...newWebhook, timeout: parseInt(e.target.value) || 30 })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateWebhook}
                disabled={!newWebhook.url || !newWebhook.orgId}
              >
                Create Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{webhooks.length}</div>
            <p className="text-xs text-muted-foreground">Total Webhooks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {webhooks.filter((w) => w.status === "ACTIVE" && w.isHealthy).length}
            </div>
            <p className="text-xs text-muted-foreground">Healthy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {webhooks.filter((w) => !w.isHealthy && w.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">Unhealthy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {formatNumber(webhooks.reduce((acc, w) => acc + w.totalDeliveries, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Total Deliveries</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search webhooks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="DISABLED">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={healthFilter} onValueChange={setHealthFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health</SelectItem>
                <SelectItem value="true">Healthy</SelectItem>
                <SelectItem value="false">Unhealthy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Webhook</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Deliveries</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Last Delivery</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredWebhooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Webhook className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No webhooks found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Webhook
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredWebhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{webhook.name || "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {webhook.url}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{webhook.orgName || webhook.orgId}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getHealthIndicator(webhook)}
                        {webhook.consecutiveFailures > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {webhook.consecutiveFailures} failures
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatNumber(webhook.totalDeliveries)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {webhook.totalDeliveries > 0 ? (
                        <span className={`font-medium ${
                          (webhook.successfulDeliveries / webhook.totalDeliveries) >= 0.95
                            ? "text-green-500"
                            : (webhook.successfulDeliveries / webhook.totalDeliveries) >= 0.8
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}>
                          {((webhook.successfulDeliveries / webhook.totalDeliveries) * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {webhook.lastDeliveryAt ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(webhook.lastDeliveryAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/integrations/webhooks/${webhook.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTestWebhook(webhook)}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Test
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(webhook)}>
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
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteWebhook(webhook)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
