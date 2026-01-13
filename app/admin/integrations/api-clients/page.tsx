"use client"

import { useEffect, useState } from "react"
import {
  Key,
  Plus,
  Search,
  Copy,
  Eye,
  EyeOff,
  MoreHorizontal,
  Edit,
  Trash,
  Power,
  PowerOff,
  Activity,
  Clock,
  Building2,
  RefreshCw,
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

const clientTypes = [
  { value: "CONFIDENTIAL", label: "Confidential (Server-side)" },
  { value: "PUBLIC", label: "Public (SPA/Mobile)" },
  { value: "SERVICE", label: "Service (Machine-to-Machine)" },
]

export default function APIClientsPage() {
  const [clients, setClients] = useState<APIClient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [showSecret, setShowSecret] = useState<string | null>(null)

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

      toast.success("API Client Created - Make sure to copy the client secret!")

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
      toast.error("Failed to create API client")
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

      toast.success(`Client ${newStatus === "ACTIVE" ? "activated" : "suspended"}`)
      fetchClients()
    } catch (error) {
      toast.error("Failed to update client status")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Value copied to clipboard")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Active</Badge>
      case "SUSPENDED":
        return <Badge className="bg-yellow-500">Suspended</Badge>
      case "REVOKED":
        return <Badge variant="destructive">Revoked</Badge>
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

  return (
    <div className="space-y-6">
      {/* Secret Display Dialog */}
      <Dialog open={!!showSecret} onOpenChange={() => setShowSecret(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client Secret Generated</DialogTitle>
            <DialogDescription>
              Copy this secret now - it will not be shown again!
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
            {showSecret}
          </div>
          <DialogFooter>
            <Button onClick={() => copyToClipboard(showSecret!)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Secret
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Key className="h-8 w-8 text-primary" />
            API Clients
          </h1>
          <p className="text-muted-foreground">
            Manage OAuth clients and API access credentials
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create API Client</DialogTitle>
              <DialogDescription>
                Create a new OAuth client for API access
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  placeholder="My API Client"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this client used for?"
                  value={newClient.description}
                  onChange={(e) =>
                    setNewClient({ ...newClient, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Client Type</Label>
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
                  <Label htmlFor="orgId">Organization ID</Label>
                  <Input
                    id="orgId"
                    placeholder="Organization ID"
                    value={newClient.orgId}
                    onChange={(e) =>
                      setNewClient({ ...newClient, orgId: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rateLimit">Rate Limit (requests/minute)</Label>
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
                <Label htmlFor="redirectUris">Redirect URIs (one per line)</Label>
                <Textarea
                  id="redirectUris"
                  placeholder="https://example.com/callback"
                  value={newClient.redirectUris}
                  onChange={(e) =>
                    setNewClient({ ...newClient, redirectUris: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="allowedScopes">Allowed Scopes (comma-separated)</Label>
                <Input
                  id="allowedScopes"
                  placeholder="read, write, admin"
                  value={newClient.allowedScopes}
                  onChange={(e) =>
                    setNewClient({ ...newClient, allowedScopes: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateClient}
                disabled={!newClient.name || !newClient.orgId}
              >
                Create Client
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
            <p className="text-xs text-muted-foreground">Total Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {clients.filter((c) => c.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {formatNumber(clients.reduce((acc, c) => acc + c.totalRequests, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {clients.filter((c) => c.status === "SUSPENDED").length}
            </div>
            <p className="text-xs text-muted-foreground">Suspended</p>
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
                  placeholder="Search clients..."
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
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="REVOKED">Revoked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Last Used</TableHead>
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
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No API clients found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Client
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        {client.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {client.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{client.orgName || client.orgId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.type}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatNumber(client.totalRequests)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.lastUsedAt ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(client.lastUsedAt).toLocaleDateString()}
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
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Rotate Secret
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(client)}>
                            {client.status === "ACTIVE" ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            Revoke
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
    </div>
  )
}
