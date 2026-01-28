"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Key,
  Plus,
  Search,
  Copy,
  Edit,
  Trash,
  Power,
  PowerOff,
  Activity,
  Clock,
  Building2,
  RefreshCw,
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
import { toast } from "sonner"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface APIClient {
  id: string
  name: string
  description: string | null
  clientId: string
  type: string
  status: string
  orgId: string
  orgName?: string
  rateLimit: number
  dailyLimit: number | null
  monthlyLimit: number | null
  totalRequests: number
  lastUsedAt: string | null
  createdAt: string
}

export default function APIClientsPage() {
  const t = useTranslations("admin.integrations.apiClients")
  const tCommon = useTranslations("common")

  const clientTypes = [
    { value: "CONFIDENTIAL", label: t("clientTypes.confidential") },
    { value: "PUBLIC", label: t("clientTypes.public") },
    { value: "SERVICE", label: t("clientTypes.service") },
  ]

  const [clients, setClients] = useState<APIClient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [showSecret, setShowSecret] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [newClient, setNewClient] = useState({
    name: "",
    description: "",
    type: "CONFIDENTIAL",
    orgId: "",
    rateLimit: 1000,
    redirectUris: "",
    allowedScopes: "",
  })

  useEffect(() => {
    fetchClients()
  }, [statusFilter])

  const fetchClients = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("search", search)

      const response = await fetch(`/api/admin/integrations/api-clients?${params}`)
      const data = await response.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error("Failed to fetch clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async () => {
    try {
      const response = await fetch("/api/admin/integrations/api-clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newClient,
          redirectUris: newClient.redirectUris.split("\n").filter(Boolean),
          allowedScopes: newClient.allowedScopes.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create client")
      }

      const data = await response.json()

      toast.success(t("toast.clientCreated"))

      // Show the secret
      if (data.clientSecret) {
        setShowSecret(data.clientSecret)
      }

      setIsCreateOpen(false)
      setNewClient({
        name: "",
        description: "",
        type: "CONFIDENTIAL",
        orgId: "",
        rateLimit: 1000,
        redirectUris: "",
        allowedScopes: "",
      })
      fetchClients()
    } catch (error) {
      toast.error(t("toast.createFailed"))
    }
  }

  const handleToggleStatus = async (client: APIClient) => {
    try {
      const newStatus = client.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
      const response = await fetch(`/api/admin/integrations/api-clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update client")
      }

      toast.success(newStatus === "ACTIVE" ? t("toast.activated") : t("toast.suspended"))
      fetchClients()
    } catch (error) {
      toast.error(t("toast.updateStatusFailed"))
    }
  }

  const handleRevokeClient = async (client: APIClient) => {
    try {
      const response = await fetch(`/api/admin/integrations/api-clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REVOKED" }),
      })

      if (!response.ok) {
        throw new Error("Failed to revoke client")
      }

      toast.success(t("toast.revoked"))
      fetchClients()
    } catch (error) {
      toast.error(t("toast.revokeFailed"))
    }
  }

  const handleBulkRevoke = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/integrations/api-clients/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "REVOKED" }),
          })
        )
      )
      toast.success(t("toast.bulkRevoked", { count: ids.length }))
      fetchClients()
      setSelectedIds(new Set())
    } catch (error) {
      toast.error(t("toast.bulkRevokeFailed"))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(t("toast.copied"))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">{t("status.active")}</Badge>
      case "SUSPENDED":
        return <Badge className="bg-yellow-500">{t("status.suspended")}</Badge>
      case "REVOKED":
        return <Badge variant="destructive">{t("status.revoked")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.clientId.toLowerCase().includes(search.toLowerCase()) ||
      client.orgName?.toLowerCase().includes(search.toLowerCase())
  )

  // Define columns for AdminDataTable
  const columns: Column<APIClient>[] = [
    {
      id: "client",
      header: t("table.client"),
      cell: (client) => (
        <div>
          <p className="font-medium">{client.name}</p>
          {client.description && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {client.description}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "clientId",
      header: t("table.clientId"),
      cell: (client) => (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {client.clientId.substring(0, 12)}...
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => copyToClipboard(client.clientId)}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
    {
      id: "organization",
      header: t("table.organization"),
      cell: (client) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{client.orgName || client.orgId}</span>
        </div>
      ),
    },
    {
      id: "type",
      header: t("table.type"),
      cell: (client) => <Badge variant="outline">{client.type}</Badge>,
    },
    {
      id: "status",
      header: t("table.status"),
      cell: (client) => getStatusBadge(client.status),
    },
    {
      id: "usage",
      header: t("table.usage"),
      cell: (client) => (
        <div className="flex items-center gap-1">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatNumber(client.totalRequests)}</span>
        </div>
      ),
    },
    {
      id: "lastUsed",
      header: t("table.lastUsed"),
      cell: (client) =>
        client.lastUsedAt ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(client.lastUsedAt).toLocaleDateString()}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{t("table.never")}</span>
        ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<APIClient>[] = [
    {
      label: tCommon("edit"),
      icon: <Edit className="h-4 w-4" />,
      onClick: () => {
        toast.info(t("toast.editComingSoon"))
      },
    },
    {
      label: t("actions.rotateSecret"),
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: () => {
        toast.info(t("toast.rotateSecretComingSoon"))
      },
    },
    {
      label: t("actions.suspend"),
      icon: <PowerOff className="h-4 w-4" />,
      onClick: handleToggleStatus,
      hidden: (client) => client.status !== "ACTIVE",
    },
    {
      label: t("actions.activate"),
      icon: <Power className="h-4 w-4" />,
      onClick: handleToggleStatus,
      hidden: (client) => client.status === "ACTIVE",
    },
    {
      label: t("actions.revoke"),
      icon: <Trash className="h-4 w-4" />,
      onClick: handleRevokeClient,
      variant: "destructive",
      separator: true,
      hidden: (client) => client.status === "REVOKED",
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("bulkActions.revokeSelected"),
      icon: <Trash className="h-4 w-4" />,
      onClick: handleBulkRevoke,
      variant: "destructive",
      confirmTitle: t("bulkActions.revokeConfirmTitle"),
      confirmDescription: t("bulkActions.revokeConfirmDescription"),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Secret Display Dialog */}
      <Dialog open={!!showSecret} onOpenChange={() => setShowSecret(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("secretDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("secretDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
            {showSecret}
          </div>
          <DialogFooter>
            <Button onClick={() => copyToClipboard(showSecret!)}>
              <Copy className="h-4 w-4 mr-2" />
              {t("secretDialog.copySecret")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Key className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("createButton")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("createDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("createDialog.description")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("form.clientName")}</Label>
                <Input
                  id="name"
                  placeholder={t("form.clientNamePlaceholder")}
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">{tCommon("description")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("form.descriptionPlaceholder")}
                  value={newClient.description}
                  onChange={(e) =>
                    setNewClient({ ...newClient, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t("form.clientType")}</Label>
                  <Select
                    value={newClient.type}
                    onValueChange={(value) =>
                      setNewClient({ ...newClient, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {clientTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="orgId">{t("form.organizationId")}</Label>
                  <Input
                    id="orgId"
                    placeholder={t("form.organizationIdPlaceholder")}
                    value={newClient.orgId}
                    onChange={(e) =>
                      setNewClient({ ...newClient, orgId: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rateLimit">{t("form.rateLimit")}</Label>
                <Input
                  id="rateLimit"
                  type="number"
                  value={newClient.rateLimit}
                  onChange={(e) =>
                    setNewClient({ ...newClient, rateLimit: parseInt(e.target.value) || 1000 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="redirectUris">{t("form.redirectUris")}</Label>
                <Textarea
                  id="redirectUris"
                  placeholder={t("form.redirectUrisPlaceholder")}
                  value={newClient.redirectUris}
                  onChange={(e) =>
                    setNewClient({ ...newClient, redirectUris: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="allowedScopes">{t("form.allowedScopes")}</Label>
                <Input
                  id="allowedScopes"
                  placeholder={t("form.allowedScopesPlaceholder")}
                  value={newClient.allowedScopes}
                  onChange={(e) =>
                    setNewClient({ ...newClient, allowedScopes: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button
                onClick={handleCreateClient}
                disabled={!newClient.name || !newClient.orgId}
              >
                {t("createButton")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">{t("stats.totalClients")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {clients.filter((c) => c.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.active")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {formatNumber(clients.reduce((acc, c) => acc + c.totalRequests, 0))}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.totalRequests")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {clients.filter((c) => c.status === "SUSPENDED").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.suspended")}</p>
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
                  placeholder={t("filters.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={tCommon("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                <SelectItem value="ACTIVE">{t("status.active")}</SelectItem>
                <SelectItem value="SUSPENDED">{t("status.suspended")}</SelectItem>
                <SelectItem value="REVOKED">{t("status.revoked")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-6">
          <AdminDataTable
            data={filteredClients}
            columns={columns}
            getRowId={(client) => client.id}
            isLoading={loading}
            emptyMessage={t("table.noClientsFound")}
            rowActions={rowActions}
            bulkActions={bulkActions}
            enableSelection={true}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>
    </div>
  )
}
