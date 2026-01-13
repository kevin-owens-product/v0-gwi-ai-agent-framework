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
  ArrowLeft,
  Key,
  Loader2,
  Building2,
  Activity,
  Calendar,
  Clock,
  Edit,
  Save,
  X,
  Copy,
  RefreshCw,
  Power,
  PowerOff,
  Trash,
  Shield,
  Gauge,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Organization {
  id: string
  name: string
  slug: string
}

interface UsageStats {
  totalRequests: number
  lastUsedAt: string | null
  rateLimit: number
  dailyLimit: number | null
  monthlyLimit: number | null
}

interface APIClient {
  id: string
  name: string
  description: string | null
  clientId: string
  type: string
  status: string
  orgId: string
  redirectUris: string[]
  allowedScopes: string[]
  allowedGrants: string[]
  rateLimit: number
  dailyLimit: number | null
  monthlyLimit: number | null
  totalRequests: number
  lastUsedAt: string | null
  createdAt: string
  updatedAt: string
  organization: Organization | null
  usageStats: UsageStats
}

const clientTypes = [
  { value: "CONFIDENTIAL", label: "Confidential (Server-side)" },
  { value: "PUBLIC", label: "Public (SPA/Mobile)" },
  { value: "SERVICE", label: "Service (Machine-to-Machine)" },
]

export default function APIClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<APIClient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    type: "",
    rateLimit: 1000,
    dailyLimit: "",
    monthlyLimit: "",
    redirectUris: "",
    allowedScopes: "",
  })

  const [rotateDialogOpen, setRotateDialogOpen] = useState(false)
  const [newSecret, setNewSecret] = useState<string | null>(null)
  const [isRotating, setIsRotating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchClient = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/integrations/api-clients/${clientId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch client")
      }
      const data = await response.json()
      setClient(data.client)
      setEditForm({
        name: data.client.name,
        description: data.client.description || "",
        type: data.client.type,
        rateLimit: data.client.rateLimit,
        dailyLimit: data.client.dailyLimit?.toString() || "",
        monthlyLimit: data.client.monthlyLimit?.toString() || "",
        redirectUris: data.client.redirectUris.join("\n"),
        allowedScopes: data.client.allowedScopes.join(", "),
      })
    } catch (error) {
      console.error("Failed to fetch client:", error)
      toast.error("Failed to load API client")
    } finally {
      setIsLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    fetchClient()
  }, [fetchClient])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/integrations/api-clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description || null,
          type: editForm.type,
          rateLimit: editForm.rateLimit,
          dailyLimit: editForm.dailyLimit ? parseInt(editForm.dailyLimit) : null,
          monthlyLimit: editForm.monthlyLimit ? parseInt(editForm.monthlyLimit) : null,
          redirectUris: editForm.redirectUris.split("\n").filter(Boolean),
          allowedScopes: editForm.allowedScopes.split(",").map(s => s.trim()).filter(Boolean),
        }),
      })
      if (response.ok) {
        setIsEditing(false)
        fetchClient()
        toast.success("API client updated")
      } else {
        toast.error("Failed to update client")
      }
    } catch (error) {
      console.error("Failed to update client:", error)
      toast.error("Failed to update client")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!client) return
    try {
      const newStatus = client.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
      const response = await fetch(`/api/admin/integrations/api-clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        fetchClient()
        toast.success(`Client ${newStatus === "ACTIVE" ? "activated" : "suspended"}`)
      }
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleRotateSecret = async () => {
    setIsRotating(true)
    try {
      const response = await fetch(`/api/admin/integrations/api-clients/${clientId}/rotate-secret`, {
        method: "POST",
      })
      if (response.ok) {
        const data = await response.json()
        setNewSecret(data.clientSecret)
        setRotateDialogOpen(false)
        toast.success("Client secret rotated")
      } else {
        toast.error("Failed to rotate secret")
      }
    } catch (error) {
      toast.error("Failed to rotate secret")
    } finally {
      setIsRotating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/integrations/api-clients/${clientId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Client revoked")
        router.push("/admin/integrations/api-clients")
      } else {
        toast.error("Failed to revoke client")
      }
    } catch (error) {
      toast.error("Failed to revoke client")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">API client not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* New Secret Display Dialog */}
      <Dialog open={!!newSecret} onOpenChange={() => setNewSecret(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Client Secret</DialogTitle>
            <DialogDescription>
              Copy this secret now - it will not be shown again!
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
            {newSecret}
          </div>
          <DialogFooter>
            <Button onClick={() => copyToClipboard(newSecret!)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Secret
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rotate Secret Confirmation */}
      <Dialog open={rotateDialogOpen} onOpenChange={setRotateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rotate Client Secret</DialogTitle>
            <DialogDescription>
              This will generate a new secret and invalidate the current one.
              Any applications using the current secret will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRotateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRotateSecret} disabled={isRotating}>
              {isRotating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Rotate Secret
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Client</DialogTitle>
            <DialogDescription>
              This will permanently revoke this client. All applications using this client will stop working.
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
              Revoke Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/integrations/api-clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs bg-muted px-2 py-1 rounded">{client.clientId}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(client.clientId)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {client.status !== "REVOKED" && (
            <>
              <Button variant="outline" onClick={() => setRotateDialogOpen(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Rotate Secret
              </Button>
              <Button
                variant={client.status === "ACTIVE" ? "outline" : "default"}
                onClick={handleToggleStatus}
              >
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
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                <Trash className="h-4 w-4 mr-2" />
                Revoke
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {client.status === "REVOKED" && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Client Revoked</p>
                <p className="text-sm text-muted-foreground">
                  This client has been revoked and can no longer be used.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="usage">Usage Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(client.status)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(client.totalRequests)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rate Limit</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{client.rateLimit}/min</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Type</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{client.type}</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Client Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Client Details</CardTitle>
                  {!isEditing && client.status !== "REVOKED" && (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{client.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium text-right max-w-[200px] truncate">
                    {client.description || "No description"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client ID</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {client.clientId.substring(0, 16)}...
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline">{client.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(client.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Used</span>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {client.lastUsedAt
                      ? new Date(client.lastUsedAt).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>The organization this client belongs to</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.organization ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{client.organization.name}</p>
                        <p className="text-sm text-muted-foreground">{client.organization.slug}</p>
                      </div>
                    </div>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/admin/tenants/${client.organization.id}`}>
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

          {/* Scopes & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Scopes & Permissions</CardTitle>
              <CardDescription>Allowed scopes and redirect URIs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Allowed Scopes</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {client.allowedScopes.length > 0 ? (
                    client.allowedScopes.map((scope, i) => (
                      <Badge key={i} variant="secondary">{scope}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No scopes configured</span>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Allowed Grants</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {client.allowedGrants.map((grant, i) => (
                    <Badge key={i} variant="outline">{grant}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Redirect URIs</Label>
                <div className="mt-2 space-y-1">
                  {client.redirectUris.length > 0 ? (
                    client.redirectUris.map((uri, i) => (
                      <code key={i} className="block text-xs bg-muted px-2 py-1 rounded">
                        {uri}
                      </code>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No redirect URIs configured</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Edit Client Settings</CardTitle>
                  <CardDescription>Update client configuration</CardDescription>
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
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    disabled={!isEditing || client.status === "REVOKED"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Type</Label>
                  <Select
                    value={editForm.type}
                    onValueChange={(value) => setEditForm({ ...editForm, type: value })}
                    disabled={!isEditing || client.status === "REVOKED"}
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  disabled={!isEditing || client.status === "REVOKED"}
                  rows={2}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="rateLimit">Rate Limit (req/min)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={editForm.rateLimit}
                    onChange={(e) => setEditForm({ ...editForm, rateLimit: parseInt(e.target.value) || 1000 })}
                    disabled={!isEditing || client.status === "REVOKED"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyLimit">Daily Limit (optional)</Label>
                  <Input
                    id="dailyLimit"
                    type="number"
                    value={editForm.dailyLimit}
                    onChange={(e) => setEditForm({ ...editForm, dailyLimit: e.target.value })}
                    disabled={!isEditing || client.status === "REVOKED"}
                    placeholder="No limit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyLimit">Monthly Limit (optional)</Label>
                  <Input
                    id="monthlyLimit"
                    type="number"
                    value={editForm.monthlyLimit}
                    onChange={(e) => setEditForm({ ...editForm, monthlyLimit: e.target.value })}
                    disabled={!isEditing || client.status === "REVOKED"}
                    placeholder="No limit"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="redirectUris">Redirect URIs (one per line)</Label>
                <Textarea
                  id="redirectUris"
                  value={editForm.redirectUris}
                  onChange={(e) => setEditForm({ ...editForm, redirectUris: e.target.value })}
                  disabled={!isEditing || client.status === "REVOKED"}
                  placeholder="https://example.com/callback"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowedScopes">Allowed Scopes (comma-separated)</Label>
                <Input
                  id="allowedScopes"
                  value={editForm.allowedScopes}
                  onChange={(e) => setEditForm({ ...editForm, allowedScopes: e.target.value })}
                  disabled={!isEditing || client.status === "REVOKED"}
                  placeholder="read, write, admin"
                />
              </div>
              {!isEditing && client.status !== "REVOKED" && (
                <Button onClick={() => setIsEditing(true)} className="mt-4">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Settings
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(client.usageStats.totalRequests)}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rate Limit</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{client.usageStats.rateLimit}</div>
                <p className="text-xs text-muted-foreground">Requests per minute</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Used</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {client.usageStats.lastUsedAt
                    ? new Date(client.usageStats.lastUsedAt).toLocaleDateString()
                    : "Never"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {client.usageStats.lastUsedAt
                    ? new Date(client.usageStats.lastUsedAt).toLocaleTimeString()
                    : "No activity"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
              <CardDescription>Configured rate limits for this client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Per Minute</p>
                    <p className="text-sm text-muted-foreground">Maximum requests per minute</p>
                  </div>
                  <div className="text-2xl font-bold">{client.rateLimit}</div>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Daily Limit</p>
                    <p className="text-sm text-muted-foreground">Maximum requests per day</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {client.dailyLimit ? formatNumber(client.dailyLimit) : "Unlimited"}
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Monthly Limit</p>
                    <p className="text-sm text-muted-foreground">Maximum requests per month</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {client.monthlyLimit ? formatNumber(client.monthlyLimit) : "Unlimited"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
