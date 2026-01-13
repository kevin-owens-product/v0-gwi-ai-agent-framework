"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Key,
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
  TestTube,
  Building2,
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
import { toast } from "sonner"
import Link from "next/link"

interface Organization {
  id: string
  name: string
  slug: string
}

interface SSOConfig {
  id: string
  orgId: string
  provider: string
  status: string
  displayName: string | null
  jitProvisioning: boolean
  autoDeactivate: boolean
  defaultRole: string
  lastSyncAt: string | null
  createdAt: string
  organization: Organization | null
}

const ssoProviders = [
  { value: "SAML", label: "SAML 2.0" },
  { value: "OIDC", label: "OpenID Connect" },
  { value: "AZURE_AD", label: "Azure AD" },
  { value: "OKTA", label: "Okta" },
  { value: "GOOGLE_WORKSPACE", label: "Google Workspace" },
  { value: "ONELOGIN", label: "OneLogin" },
  { value: "PING_IDENTITY", label: "Ping Identity" },
  { value: "CUSTOM", label: "Custom" },
]

const statusOptions = [
  { value: "CONFIGURING", label: "Configuring" },
  { value: "TESTING", label: "Testing" },
  { value: "ACTIVE", label: "Active" },
  { value: "DISABLED", label: "Disabled" },
  { value: "ERROR", label: "Error" },
]

export default function SSOListingPage() {
  const router = useRouter()
  const [ssoConfigs, setSsoConfigs] = useState<SSOConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [providerFilter, setProviderFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const [newConfig, setNewConfig] = useState({
    orgId: "",
    provider: "SAML",
    displayName: "",
    jitProvisioning: true,
    autoDeactivate: false,
    defaultRole: "MEMBER",
  })

  useEffect(() => {
    fetchSSOConfigs()
  }, [statusFilter, providerFilter, pagination.page])

  const fetchSSOConfigs = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (providerFilter !== "all") params.set("provider", providerFilter)
      if (search) params.set("search", search)
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())

      const response = await fetch(`/api/admin/identity/sso?${params}`)
      const data = await response.json()
      setSsoConfigs(data.ssoConfigs || [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch SSO configs:", error)
      toast.error("Failed to fetch SSO configurations")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateConfig = async () => {
    if (!newConfig.orgId || !newConfig.provider) {
      toast.error("Organization ID and provider are required")
      return
    }

    try {
      const response = await fetch("/api/admin/identity/sso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create SSO configuration")
      }

      toast.success("SSO configuration created successfully")
      setIsCreateOpen(false)
      setNewConfig({
        orgId: "",
        provider: "SAML",
        displayName: "",
        jitProvisioning: true,
        autoDeactivate: false,
        defaultRole: "MEMBER",
      })
      fetchSSOConfigs()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create SSO configuration")
    }
  }

  const handleToggleStatus = async (config: SSOConfig) => {
    const newStatus = config.status === "ACTIVE" ? "DISABLED" : "ACTIVE"

    try {
      const response = await fetch(`/api/admin/identity/sso/${config.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      toast.success(`SSO ${newStatus === "ACTIVE" ? "activated" : "disabled"} successfully`)
      fetchSSOConfigs()
    } catch (error) {
      toast.error("Failed to update SSO status")
    }
  }

  const handleDelete = async (configId: string) => {
    if (!confirm("Are you sure you want to delete this SSO configuration?")) return

    try {
      const response = await fetch(`/api/admin/identity/sso/${configId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete")
      }

      toast.success("SSO configuration deleted successfully")
      fetchSSOConfigs()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete SSO configuration")
    }
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
      case "TESTING":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <TestTube className="h-3 w-3 mr-1" />
            Testing
          </Badge>
        )
      case "DISABLED":
        return (
          <Badge variant="outline">
            <Pause className="h-3 w-3 mr-1" />
            Disabled
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

  const getProviderIcon = (provider: string) => {
    // All providers use Key icon for simplicity
    return <Key className="h-4 w-4" />
  }

  const filteredConfigs = ssoConfigs.filter(
    (config) =>
      config.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      config.organization?.name.toLowerCase().includes(search.toLowerCase()) ||
      config.orgId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Key className="h-8 w-8 text-primary" />
            SSO Configurations
          </h1>
          <p className="text-muted-foreground">
            Manage enterprise Single Sign-On configurations
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add SSO Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create SSO Configuration</DialogTitle>
              <DialogDescription>
                Configure Single Sign-On for an organization
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="orgId">Organization ID</Label>
                <Input
                  id="orgId"
                  placeholder="Enter organization ID"
                  value={newConfig.orgId}
                  onChange={(e) =>
                    setNewConfig({ ...newConfig, orgId: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>SSO Provider</Label>
                <Select
                  value={newConfig.provider}
                  onValueChange={(value) =>
                    setNewConfig({ ...newConfig, provider: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ssoProviders.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name (Optional)</Label>
                <Input
                  id="displayName"
                  placeholder="e.g., Acme Corp SSO"
                  value={newConfig.displayName}
                  onChange={(e) =>
                    setNewConfig({ ...newConfig, displayName: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Default Role</Label>
                <Select
                  value={newConfig.defaultRole}
                  onValueChange={(value) =>
                    setNewConfig({ ...newConfig, defaultRole: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="jitProvisioning"
                  checked={newConfig.jitProvisioning}
                  onCheckedChange={(checked) =>
                    setNewConfig({ ...newConfig, jitProvisioning: checked })
                  }
                />
                <Label htmlFor="jitProvisioning">Enable Just-in-Time Provisioning</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="autoDeactivate"
                  checked={newConfig.autoDeactivate}
                  onCheckedChange={(checked) =>
                    setNewConfig({ ...newConfig, autoDeactivate: checked })
                  }
                />
                <Label htmlFor="autoDeactivate">Auto-deactivate removed users</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateConfig} disabled={!newConfig.orgId}>
                Create Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{ssoConfigs.length}</div>
            <p className="text-xs text-muted-foreground">Total Configurations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {ssoConfigs.filter((c) => c.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {ssoConfigs.filter((c) => c.status === "CONFIGURING" || c.status === "TESTING").length}
            </div>
            <p className="text-xs text-muted-foreground">In Setup</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">
              {ssoConfigs.filter((c) => c.status === "ERROR").length}
            </div>
            <p className="text-xs text-muted-foreground">Errors</p>
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
                  placeholder="Search configurations..."
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
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {ssoProviders.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* SSO Configs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provisioning</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredConfigs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No SSO configurations found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Configuration
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <Link href={`/admin/identity/sso/${config.id}`} className="hover:underline">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {config.displayName || config.organization?.name || config.orgId}
                            </p>
                            {config.organization && (
                              <p className="text-xs text-muted-foreground">
                                {config.organization.slug}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getProviderIcon(config.provider)}
                        <Badge variant="outline">
                          {ssoProviders.find((p) => p.value === config.provider)?.label || config.provider}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(config.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={config.jitProvisioning ? "default" : "secondary"} className="text-xs w-fit">
                          JIT: {config.jitProvisioning ? "On" : "Off"}
                        </Badge>
                        {config.autoDeactivate && (
                          <Badge variant="outline" className="text-xs w-fit">
                            Auto-deactivate
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {config.lastSyncAt ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {new Date(config.lastSyncAt).toLocaleDateString()}
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
                            <Link href={`/admin/identity/sso/${config.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              View / Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(config)}>
                            {config.status === "ACTIVE" ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Disable
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
                            onClick={() => handleDelete(config.id)}
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
            {pagination.total} configurations
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
