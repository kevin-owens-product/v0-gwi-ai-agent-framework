"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
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

export default function APIClientDetailPage() {
  const t = useTranslations("admin.integrations.apiClients")
  const tCommon = useTranslations("common")

  const clientTypes = [
    { value: "CONFIDENTIAL", label: t("clientTypes.confidential") },
    { value: "PUBLIC", label: t("clientTypes.public") },
    { value: "SERVICE", label: t("clientTypes.service") },
  ]

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
      toast.error(t("toast.loadFailed"))
    } finally {
      setIsLoading(false)
    }
  }, [clientId, t])

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
        toast.success(t("toast.updated"))
      } else {
        toast.error(t("toast.updateFailed"))
      }
    } catch (error) {
      console.error("Failed to update client:", error)
      toast.error(t("toast.updateFailed"))
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
        toast.success(newStatus === "ACTIVE" ? t("toast.activated") : t("toast.suspended"))
      }
    } catch (error) {
      toast.error(t("toast.updateStatusFailed"))
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
        toast.success(t("toast.secretRotated"))
      } else {
        toast.error(t("toast.rotateSecretFailed"))
      }
    } catch (error) {
      toast.error(t("toast.rotateSecretFailed"))
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
        toast.success(t("toast.revoked"))
        router.push("/admin/integrations/api-clients")
      } else {
        toast.error(t("toast.revokeFailed"))
      }
    } catch (error) {
      toast.error(t("toast.revokeFailed"))
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
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
          {tCommon("back")}
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">{t("detail.notFound")}</p>
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
            <DialogTitle>{t("secretDialog.newTitle")}</DialogTitle>
            <DialogDescription>
              {t("secretDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
            {newSecret}
          </div>
          <DialogFooter>
            <Button onClick={() => copyToClipboard(newSecret!)}>
              <Copy className="h-4 w-4 mr-2" />
              {t("secretDialog.copySecret")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rotate Secret Confirmation */}
      <Dialog open={rotateDialogOpen} onOpenChange={setRotateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rotateDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("rotateDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRotateDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleRotateSecret} disabled={isRotating}>
              {isRotating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {t("actions.rotateSecret")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("revokeDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("revokeDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash className="h-4 w-4 mr-2" />
              )}
              {t("actions.revokeClient")}
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
              {tCommon("back")}
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
                {t("actions.rotateSecret")}
              </Button>
              <Button
                variant={client.status === "ACTIVE" ? "outline" : "default"}
                onClick={handleToggleStatus}
              >
                {client.status === "ACTIVE" ? (
                  <>
                    <PowerOff className="h-4 w-4 mr-2" />
                    {t("actions.suspend")}
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4 mr-2" />
                    {t("actions.activate")}
                  </>
                )}
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                <Trash className="h-4 w-4 mr-2" />
                {t("actions.revoke")}
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
                <p className="font-medium text-destructive">{t("detail.revokedBanner.title")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("detail.revokedBanner.description")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="settings">{t("tabs.settings")}</TabsTrigger>
          <TabsTrigger value="usage">{t("tabs.usageStats")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{tCommon("status")}</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(client.status)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("detail.totalRequests")}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(client.totalRequests)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("detail.rateLimit")}</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{client.rateLimit}/min</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{tCommon("type")}</CardTitle>
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
                  <CardTitle>{t("detail.clientDetails")}</CardTitle>
                  {!isEditing && client.status !== "REVOKED" && (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tCommon("name")}</span>
                  <span className="font-medium">{client.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tCommon("description")}</span>
                  <span className="font-medium text-right max-w-[200px] truncate">
                    {client.description || t("detail.noDescription")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("table.clientId")}</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {client.clientId.substring(0, 16)}...
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tCommon("type")}</span>
                  <Badge variant="outline">{client.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("detail.created")}</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(client.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("detail.lastUsed")}</span>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {client.lastUsedAt
                      ? new Date(client.lastUsedAt).toLocaleDateString()
                      : t("table.never")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.organization")}</CardTitle>
                <CardDescription>{t("detail.organizationDescription")}</CardDescription>
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
                        {t("detail.viewOrganization")}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">{t("detail.organizationNotFound")}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Scopes & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.scopesPermissions")}</CardTitle>
              <CardDescription>{t("detail.scopesPermissionsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">{t("detail.allowedScopes")}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {client.allowedScopes.length > 0 ? (
                    client.allowedScopes.map((scope, i) => (
                      <Badge key={i} variant="secondary">{scope}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">{t("detail.noScopes")}</span>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">{t("detail.allowedGrants")}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {client.allowedGrants.map((grant, i) => (
                    <Badge key={i} variant="outline">{grant}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">{t("detail.redirectUris")}</Label>
                <div className="mt-2 space-y-1">
                  {client.redirectUris.length > 0 ? (
                    client.redirectUris.map((uri, i) => (
                      <code key={i} className="block text-xs bg-muted px-2 py-1 rounded">
                        {uri}
                      </code>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">{t("detail.noRedirectUris")}</span>
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
                  <CardTitle>{t("settings.editTitle")}</CardTitle>
                  <CardDescription>{t("settings.editDescription")}</CardDescription>
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-1" />
                      {tCommon("cancel")}
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      {tCommon("save")}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("form.clientName")}</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    disabled={!isEditing || client.status === "REVOKED"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("form.clientType")}</Label>
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
                <Label htmlFor="description">{tCommon("description")}</Label>
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
                  <Label htmlFor="rateLimit">{t("settings.rateLimitPerMin")}</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={editForm.rateLimit}
                    onChange={(e) => setEditForm({ ...editForm, rateLimit: parseInt(e.target.value) || 1000 })}
                    disabled={!isEditing || client.status === "REVOKED"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyLimit">{t("settings.dailyLimit")}</Label>
                  <Input
                    id="dailyLimit"
                    type="number"
                    value={editForm.dailyLimit}
                    onChange={(e) => setEditForm({ ...editForm, dailyLimit: e.target.value })}
                    disabled={!isEditing || client.status === "REVOKED"}
                    placeholder={t("settings.noLimit")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyLimit">{t("settings.monthlyLimit")}</Label>
                  <Input
                    id="monthlyLimit"
                    type="number"
                    value={editForm.monthlyLimit}
                    onChange={(e) => setEditForm({ ...editForm, monthlyLimit: e.target.value })}
                    disabled={!isEditing || client.status === "REVOKED"}
                    placeholder={t("settings.noLimit")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="redirectUris">{t("form.redirectUris")}</Label>
                <Textarea
                  id="redirectUris"
                  value={editForm.redirectUris}
                  onChange={(e) => setEditForm({ ...editForm, redirectUris: e.target.value })}
                  disabled={!isEditing || client.status === "REVOKED"}
                  placeholder={t("form.redirectUrisPlaceholder")}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowedScopes">{t("form.allowedScopes")}</Label>
                <Input
                  id="allowedScopes"
                  value={editForm.allowedScopes}
                  onChange={(e) => setEditForm({ ...editForm, allowedScopes: e.target.value })}
                  disabled={!isEditing || client.status === "REVOKED"}
                  placeholder={t("form.allowedScopesPlaceholder")}
                />
              </div>
              {!isEditing && client.status !== "REVOKED" && (
                <Button onClick={() => setIsEditing(true)} className="mt-4">
                  <Edit className="h-4 w-4 mr-2" />
                  {t("settings.editSettings")}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("usage.totalRequests")}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(client.usageStats.totalRequests)}</div>
                <p className="text-xs text-muted-foreground">{t("usage.allTime")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("detail.rateLimit")}</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{client.usageStats.rateLimit}</div>
                <p className="text-xs text-muted-foreground">{t("usage.requestsPerMinute")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("detail.lastUsed")}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {client.usageStats.lastUsedAt
                    ? new Date(client.usageStats.lastUsedAt).toLocaleDateString()
                    : t("table.never")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {client.usageStats.lastUsedAt
                    ? new Date(client.usageStats.lastUsedAt).toLocaleTimeString()
                    : t("usage.noActivity")}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("usage.rateLimits")}</CardTitle>
              <CardDescription>{t("usage.rateLimitsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{t("usage.perMinute")}</p>
                    <p className="text-sm text-muted-foreground">{t("usage.perMinuteDescription")}</p>
                  </div>
                  <div className="text-2xl font-bold">{client.rateLimit}</div>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{t("usage.dailyLimit")}</p>
                    <p className="text-sm text-muted-foreground">{t("usage.dailyLimitDescription")}</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {client.dailyLimit ? formatNumber(client.dailyLimit) : t("usage.unlimited")}
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{t("usage.monthlyLimit")}</p>
                    <p className="text-sm text-muted-foreground">{t("usage.monthlyLimitDescription")}</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {client.monthlyLimit ? formatNumber(client.monthlyLimit) : t("usage.unlimited")}
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
