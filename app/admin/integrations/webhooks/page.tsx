"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Webhook,
  Plus,
  Search,
  Power,
  PowerOff,
  Activity,
  Clock,
  Building2,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

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
  const t = useTranslations("admin.integrations.webhooks")
  const tCommon = useTranslations("common")
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [healthFilter, setHealthFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [showSecret, setShowSecret] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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
  const [total, setTotal] = useState(0)

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
      setTotal(data.total || 0)
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
        throw new Error(data.error || t("toast.createFailed"))
      }

      const data = await response.json()

      showSuccessToast(t("toast.webhookCreated"))

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
      showErrorToast(error instanceof Error ? error.message : t("toast.createFailed"))
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
        throw new Error(t("toast.updateStatusFailed"))
      }

      showSuccessToast(newStatus === "ACTIVE" ? t("toast.activated") : t("toast.paused"))
      fetchWebhooks()
    } catch (error) {
      showErrorToast(t("toast.updateStatusFailed"))
    }
  }

  const handleTestWebhook = async (webhook: WebhookEndpoint) => {
    try {
      const response = await fetch(`/api/admin/integrations/webhooks/${webhook.id}/test`, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        showSuccessToast(t("toast.testSuccess"))
      } else {
        showErrorToast(t("toast.testFailed", { error: data.delivery?.error || "Unknown error" }))
      }
      fetchWebhooks()
    } catch (error) {
      showErrorToast(t("toast.testError"))
    }
  }

  const handleDeleteWebhook = async (webhook: WebhookEndpoint) => {
    try {
      const response = await fetch(`/api/admin/integrations/webhooks/${webhook.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(t("toast.deleteFailed"))
      }

      showSuccessToast(t("toast.deleted"))
      fetchWebhooks()
    } catch (error) {
      showErrorToast(t("toast.deleteFailed"))
    }
  }

  const handleBulkStatusChange = async (ids: string[], newStatus: string) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/integrations/webhooks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      )
      showSuccessToast(newStatus === "ACTIVE" ? t("toast.activated") : t("toast.paused"))
      fetchWebhooks()
    } catch (error) {
      showErrorToast(t("toast.updateStatusFailed"))
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/integrations/webhooks/${id}`, {
            method: "DELETE",
          })
        )
      )
      showSuccessToast(t("toast.deleted"))
      fetchWebhooks()
    } catch (error) {
      showErrorToast(t("toast.deleteFailed"))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showSuccessToast(tCommon("copied"))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">{t("status.active")}</Badge>
      case "PAUSED":
        return <Badge className="bg-yellow-500">{t("status.paused")}</Badge>
      case "DISABLED":
        return <Badge variant="secondary">{t("status.disabled")}</Badge>
      case "FAILED":
        return <Badge variant="destructive">{tCommon("failed")}</Badge>
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

  // Define columns for the data table
  const columns: Column<WebhookEndpoint>[] = [
    {
      id: "webhook",
      header: t("columns.webhook"),
      cell: (webhook) => (
        <div>
          <p className="font-medium">{webhook.name || tCommon("unnamed")}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
            {webhook.url}
          </p>
        </div>
      ),
    },
    {
      id: "organization",
      header: t("columns.organization"),
      cell: (webhook) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{webhook.orgName || webhook.orgId}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: t("columns.status"),
      cell: (webhook) => getStatusBadge(webhook.status),
    },
    {
      id: "health",
      header: t("columns.health"),
      cell: (webhook) => (
        <div className="flex items-center gap-2">
          {getHealthIndicator(webhook)}
          {webhook.consecutiveFailures > 0 && (
            <span className="text-xs text-muted-foreground">
              {webhook.consecutiveFailures} {tCommon("failures")}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "deliveries",
      header: t("columns.deliveries"),
      cell: (webhook) => (
        <div className="flex items-center gap-1">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatNumber(webhook.totalDeliveries)}</span>
        </div>
      ),
    },
    {
      id: "successRate",
      header: t("columns.successRate"),
      cell: (webhook) =>
        webhook.totalDeliveries > 0 ? (
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
        ),
    },
    {
      id: "lastDelivery",
      header: t("columns.lastDelivery"),
      cell: (webhook) =>
        webhook.lastDeliveryAt ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(webhook.lastDeliveryAt).toLocaleDateString()}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{tCommon("never")}</span>
        ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<WebhookEndpoint>[] = [
    {
      label: t("actions.test"),
      icon: <Send className="h-4 w-4" />,
      onClick: handleTestWebhook,
    },
    {
      label: t("actions.pause"),
      icon: <PowerOff className="h-4 w-4" />,
      onClick: handleToggleStatus,
      hidden: (webhook) => webhook.status !== "ACTIVE",
    },
    {
      label: t("actions.activate"),
      icon: <Power className="h-4 w-4" />,
      onClick: handleToggleStatus,
      hidden: (webhook) => webhook.status === "ACTIVE",
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.activate"),
      icon: <Power className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "ACTIVE"),
      confirmTitle: t("actions.activate"),
      confirmDescription: t("bulk.deleteConfirm"),
    },
    {
      label: t("actions.pause"),
      icon: <PowerOff className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "PAUSED"),
      confirmTitle: t("actions.pause"),
      confirmDescription: t("bulk.deleteConfirm"),
    },
    {
      label: t("bulk.deleteSelected"),
      icon: <Trash className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      separator: true,
      confirmTitle: t("bulk.deleteTitle"),
      confirmDescription: t("bulk.deleteConfirm"),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Secret Display Dialog */}
      <Dialog open={!!showSecret} onOpenChange={() => setShowSecret(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialog.secretTitle")}</DialogTitle>
            <DialogDescription>
              {t("dialog.secretDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
            {showSecret}
          </div>
          <DialogFooter>
            <Button onClick={() => copyToClipboard(showSecret!)}>
              {tCommon("copy")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Webhook className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description", { total })}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("createWebhook")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("dialog.createTitle")}</DialogTitle>
              <DialogDescription>
                {t("dialog.createDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("fields.name")}</Label>
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
                  <Label htmlFor="orgId">{t("fields.organization")}</Label>
                  <Input
                    id="orgId"
                    placeholder={t("fields.organization")}
                    value={newWebhook.orgId}
                    onChange={(e) =>
                      setNewWebhook({ ...newWebhook, orgId: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">{t("fields.url")}</Label>
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
                <Label htmlFor="description">{t("fields.description")} ({tCommon("optional")})</Label>
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
                <Label>{t("fields.events")}</Label>
                <div className="flex flex-wrap gap-2">
                  {webhookEvents.map((event) => (
                    <Badge
                      key={event}
                      variant={newWebhook.events.includes(event) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleEvent(event)}
                    >
                      {(() => {
                        const key = event.split('.').map((part, i) => 
                          i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
                        ).join('')
                        return t(`events.${key}`) || event
                      })()}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timeout">{t("fields.timeout")}</Label>
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
                {tCommon("cancel")}
              </Button>
              <Button
                onClick={handleCreateWebhook}
                disabled={!newWebhook.url || !newWebhook.orgId}
              >
                {t("dialog.createTitle")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">{tCommon("total")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {webhooks.filter((w) => w.status === "ACTIVE" && w.isHealthy).length}
            </div>
            <p className="text-xs text-muted-foreground">{t("health.healthy")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {webhooks.filter((w) => !w.isHealthy && w.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("health.unhealthy")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {formatNumber(webhooks.reduce((acc, w) => acc + w.totalDeliveries, 0))}
            </div>
            <p className="text-xs text-muted-foreground">{t("columns.deliveries")}</p>
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
                  placeholder={tCommon("search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                <SelectItem value="ACTIVE">{t("status.active")}</SelectItem>
                <SelectItem value="PAUSED">{t("status.paused")}</SelectItem>
                <SelectItem value="DISABLED">{t("status.disabled")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={healthFilter} onValueChange={setHealthFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.health")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allHealth")}</SelectItem>
                <SelectItem value="true">{t("health.healthy")}</SelectItem>
                <SelectItem value="false">{t("health.unhealthy")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks Table */}
      <AdminDataTable
        data={filteredWebhooks}
        columns={columns}
        getRowId={(webhook) => webhook.id}
        isLoading={loading}
        emptyMessage={t("noWebhooks")}
        viewHref={(webhook) => `/admin/integrations/webhooks/${webhook.id}`}
        onDelete={handleDeleteWebhook}
        deleteConfirmTitle={tCommon("delete")}
        deleteConfirmDescription={(webhook) =>
          t("bulk.deleteConfirm")
        }
        rowActions={rowActions}
        bulkActions={bulkActions}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  )
}
