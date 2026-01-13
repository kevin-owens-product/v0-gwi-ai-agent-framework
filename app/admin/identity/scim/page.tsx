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
  MoreHorizontal,
  Edit,
  Trash,
  Play,
  Pause,
  Key,
  Building2,
  Users,
  RefreshCw,
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
import { Switch } from "@/components/ui/switch"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { toast } from "sonner"
import Link from "next/link"

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

  const handleDelete = async (integrationId: string) => {
    if (!confirm("Are you sure you want to delete this SCIM integration?")) return

    try {
      const response = await fetch(`/api/admin/identity/scim/${integrationId}`, {
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
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sync Settings</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Groups</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredIntegrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No SCIM integrations found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Integration
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredIntegrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{getStatusBadge(integration.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={integration.syncUsers ? "default" : "secondary"} className="text-xs w-fit">
                          Users: {integration.syncUsers ? "On" : "Off"}
                        </Badge>
                        <Badge variant={integration.syncGroups ? "default" : "secondary"} className="text-xs w-fit">
                          Groups: {integration.syncGroups ? "On" : "Off"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{integration.usersProvisioned}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span>{integration.groupsSynced}</span>
                    </TableCell>
                    <TableCell>
                      {integration.lastSyncAt ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {new Date(integration.lastSyncAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Never</span>
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
                            <Link href={`/admin/identity/scim/${integration.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              View / Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(integration)}>
                            {integration.status === "ACTIVE" ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(integration.id)}
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
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} integrations
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
