"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Database,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Settings,
  Clock,
  Play,
  Pause,
  Key,
  Building2,
  Users,
  Copy,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { toast } from "sonner"
import Link from "next/link"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface Organization {
  id: string
  name: string
  slug: string
}

interface SCIMIntegration {
  id: string
  orgId: string
  status: string
  endpoint: string | null
  bearerToken: string | null
  tokenPrefix: string | null
  syncUsers: boolean
  syncGroups: boolean
  autoDeactivate: boolean
  defaultRole: string
  usersProvisioned: number
  usersSynced: number
  groupsSynced: number
  lastSyncAt: string | null
  createdAt: string
  organization: Organization | null
}

const statusOptions = [
  { value: "CONFIGURING", label: "Configuring" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "ERROR", label: "Error" },
]

export default function SCIMListingPage() {
  const router = useRouter()
  const [scimIntegrations, setScimIntegrations] = useState<SCIMIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const [newIntegration, setNewIntegration] = useState({
    orgId: "",
    syncUsers: true,
    syncGroups: true,
    autoDeactivate: true,
    defaultRole: "MEMBER",
  })

  useEffect(() => {
    fetchSCIMIntegrations()
  }, [statusFilter, pagination.page])

  const fetchSCIMIntegrations = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("search", search)
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())

      const response = await fetch(`/api/admin/identity/scim?${params}`)
      const data = await response.json()
      setScimIntegrations(data.scimIntegrations || [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch SCIM integrations:", error)
      toast.error("Failed to fetch SCIM integrations")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIntegration = async () => {
    if (!newIntegration.orgId) {
      toast.error("Organization ID is required")
      return
    }

    try {
      const response = await fetch("/api/admin/identity/scim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIntegration),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create SCIM integration")
      }

      const data = await response.json()
      setNewToken(data.scimIntegration.bearerToken)
      toast.success("SCIM integration created successfully")
      setNewIntegration({
        orgId: "",
        syncUsers: true,
        syncGroups: true,
        autoDeactivate: true,
        defaultRole: "MEMBER",
      })
      fetchSCIMIntegrations()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create SCIM integration")
    }
  }

  const handleToggleStatus = async (integration: SCIMIntegration) => {
    const newStatus = integration.status === "ACTIVE" ? "PAUSED" : "ACTIVE"

    try {
      const response = await fetch(`/api/admin/identity/scim/${integration.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      toast.success(`SCIM integration ${newStatus === "ACTIVE" ? "activated" : "paused"} successfully`)
      fetchSCIMIntegrations()
    } catch (error) {
      toast.error("Failed to update SCIM status")
    }
  }

  const handleDelete = async (integration: SCIMIntegration) => {
    try {
      const response = await fetch(`/api/admin/identity/scim/${integration.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete")
      }

      toast.success("SCIM integration deleted successfully")
      fetchSCIMIntegrations()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete SCIM integration")
    }
  }

  const handleBulkActivate = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/identity/scim/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ACTIVE" }),
          })
        )
      )
      toast.success(`${ids.length} integration(s) activated successfully`)
      fetchSCIMIntegrations()
    } catch (error) {
      toast.error("Failed to activate integrations")
    }
  }

  const handleBulkPause = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/identity/scim/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "PAUSED" }),
          })
        )
      )
      toast.success(`${ids.length} integration(s) paused successfully`)
      fetchSCIMIntegrations()
    } catch (error) {
      toast.error("Failed to pause integrations")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "CONFIGURING":
        return (
          <Badge variant="secondary">
            <Settings className="h-3 w-3 mr-1" />
            Configuring
          </Badge>
        )
      case "PAUSED":
        return (
          <Badge variant="outline">
            <Pause className="h-3 w-3 mr-1" />
            Paused
          </Badge>
        )
      case "ERROR":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredIntegrations = scimIntegrations.filter(
    (integration) =>
      integration.organization?.name.toLowerCase().includes(search.toLowerCase()) ||
      integration.orgId.toLowerCase().includes(search.toLowerCase())
  )

  // Column definitions
  const columns: Column<SCIMIntegration>[] = [
    {
      id: "organization",
      header: "Organization",
      cell: (integration) => (
        <Link href={`/admin/identity/scim/${integration.id}`} className="hover:underline">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {integration.organization?.name || integration.orgId}
              </p>
              {integration.organization && (
                <p className="text-xs text-muted-foreground">
                  {integration.organization.slug}
                </p>
              )}
            </div>
          </div>
        </Link>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (integration) => getStatusBadge(integration.status),
    },
    {
      id: "syncSettings",
      header: "Sync Settings",
      cell: (integration) => (
        <div className="flex flex-col gap-1">
          <Badge variant={integration.syncUsers ? "default" : "secondary"} className="text-xs w-fit">
            Users: {integration.syncUsers ? "On" : "Off"}
          </Badge>
          <Badge variant={integration.syncGroups ? "default" : "secondary"} className="text-xs w-fit">
            Groups: {integration.syncGroups ? "On" : "Off"}
          </Badge>
        </div>
      ),
    },
    {
      id: "users",
      header: "Users",
      cell: (integration) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{integration.usersProvisioned}</span>
        </div>
      ),
    },
    {
      id: "groups",
      header: "Groups",
      cell: (integration) => <span>{integration.groupsSynced}</span>,
    },
    {
      id: "lastSync",
      header: "Last Sync",
      cell: (integration) =>
        integration.lastSyncAt ? (
          <span className="flex items-center gap-1 text-sm">
            <Clock className="h-3 w-3" />
            {new Date(integration.lastSyncAt).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">Never</span>
        ),
    },
  ]

  // Row actions
  const rowActions: RowAction<SCIMIntegration>[] = [
    {
      label: "Activate",
      icon: <Play className="h-4 w-4" />,
      onClick: handleToggleStatus,
      hidden: (integration) => integration.status === "ACTIVE",
    },
    {
      label: "Pause",
      icon: <Pause className="h-4 w-4" />,
      onClick: handleToggleStatus,
      hidden: (integration) => integration.status !== "ACTIVE",
    },
  ]

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: "Activate Selected",
      icon: <Play className="h-4 w-4" />,
      onClick: handleBulkActivate,
      confirmTitle: "Activate Integrations",
      confirmDescription: "Are you sure you want to activate the selected SCIM integrations?",
    },
    {
      label: "Pause Selected",
      icon: <Pause className="h-4 w-4" />,
      onClick: handleBulkPause,
      confirmTitle: "Pause Integrations",
      confirmDescription: "Are you sure you want to pause the selected SCIM integrations?",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            SCIM Integrations
          </h1>
          <p className="text-muted-foreground">
            Manage automated user provisioning with SCIM 2.0
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) setNewToken(null)
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add SCIM Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            {newToken ? (
              <>
                <DialogHeader>
                  <DialogTitle>SCIM Integration Created</DialogTitle>
                  <DialogDescription>
                    Save the bearer token below. It will not be shown again.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertTitle>Bearer Token</AlertTitle>
                    <AlertDescription className="mt-2">
                      <div className="bg-muted p-3 rounded-lg font-mono text-sm break-all">
                        {newToken}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => copyToClipboard(newToken)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Token
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    setIsCreateOpen(false)
                    setNewToken(null)
                  }}>
                    Done
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Create SCIM Integration</DialogTitle>
                  <DialogDescription>
                    Configure SCIM 2.0 provisioning for an organization
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="orgId">Organization ID</Label>
                    <Input
                      id="orgId"
                      placeholder="Enter organization ID"
                      value={newIntegration.orgId}
                      onChange={(e) =>
                        setNewIntegration({ ...newIntegration, orgId: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Default Role</Label>
                    <Select
                      value={newIntegration.defaultRole}
                      onValueChange={(value) =>
                        setNewIntegration({ ...newIntegration, defaultRole: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="syncUsers"
                      checked={newIntegration.syncUsers}
                      onCheckedChange={(checked) =>
                        setNewIntegration({ ...newIntegration, syncUsers: checked })
                      }
                    />
                    <Label htmlFor="syncUsers">Sync Users</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="syncGroups"
                      checked={newIntegration.syncGroups}
                      onCheckedChange={(checked) =>
                        setNewIntegration({ ...newIntegration, syncGroups: checked })
                      }
                    />
                    <Label htmlFor="syncGroups">Sync Groups</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="autoDeactivate"
                      checked={newIntegration.autoDeactivate}
                      onCheckedChange={(checked) =>
                        setNewIntegration({ ...newIntegration, autoDeactivate: checked })
                      }
                    />
                    <Label htmlFor="autoDeactivate">Auto-deactivate removed users</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateIntegration} disabled={!newIntegration.orgId}>
                    Create Integration
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{scimIntegrations.length}</div>
            <p className="text-xs text-muted-foreground">Total Integrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {scimIntegrations.filter((i) => i.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {scimIntegrations.reduce((acc, i) => acc + i.usersProvisioned, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Users Provisioned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-500">
              {scimIntegrations.reduce((acc, i) => acc + i.groupsSynced, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Groups Synced</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search integrations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* SCIM Integrations Table */}
      <AdminDataTable
        data={filteredIntegrations}
        columns={columns}
        getRowId={(integration) => integration.id}
        isLoading={loading}
        emptyMessage="No SCIM integrations found"
        viewHref={(integration) => `/admin/identity/scim/${integration.id}`}
        onDelete={handleDelete}
        deleteConfirmTitle="Delete SCIM Integration"
        deleteConfirmDescription={(integration) =>
          `Are you sure you want to delete the SCIM integration for ${integration.organization?.name || integration.orgId}? This action cannot be undone.`
        }
        rowActions={rowActions}
        bulkActions={bulkActions}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={(page) => setPagination({ ...pagination, page })}
      />
    </div>
  )
}
