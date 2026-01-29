"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  ArrowLeft,
  Database,
  Loader2,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  Settings,
  Pause,
  Play,
  Building2,
  Users,
  RefreshCw,
  Clock,
  Key,
  Copy,
  AlertTriangle,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

interface Organization {
  id: string
  name: string
  slug: string
  planTier: string
}

interface SSOConfig {
  id: string
  provider: string
  status: string
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
  syncErrors: string[]
  metadata: Record<string, unknown>
  createdBy: string | null
  createdAt: string
  updatedAt: string
  organization: Organization | null
  ssoConfig: SSOConfig | null
  userCount: number
}

export default function SCIMDetailPage() {
  const params = useParams()
  const router = useRouter()
  const scimId = params.id as string
  const t = useTranslations("admin.identity.scim")
  const tIdentity = useTranslations("admin.identity")

  const [scimIntegration, setScimIntegration] = useState<SCIMIntegration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRegeneratingToken, setIsRegeneratingToken] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)

  const [editForm, setEditForm] = useState({
    syncUsers: true,
    syncGroups: true,
    autoDeactivate: true,
    defaultRole: "MEMBER",
  })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRegenerateTokenDialog, setShowRegenerateTokenDialog] = useState(false)

  const fetchSCIMIntegration = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/identity/scim/${scimId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch SCIM integration")
      }
      const data = await response.json()
      setScimIntegration(data.scimIntegration)
      setEditForm({
        syncUsers: data.scimIntegration.syncUsers,
        syncGroups: data.scimIntegration.syncGroups,
        autoDeactivate: data.scimIntegration.autoDeactivate,
        defaultRole: data.scimIntegration.defaultRole,
      })
    } catch (error) {
      console.error("Failed to fetch SCIM integration:", error)
      showErrorToast(t("toast.loadFailed"))
    } finally {
      setIsLoading(false)
    }
  }, [scimId])

  useEffect(() => {
    fetchSCIMIntegration()
  }, [fetchSCIMIntegration])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/identity/scim/${scimId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        showSuccessToast(t("toast.updated"))
        setIsEditing(false)
        fetchSCIMIntegration()
      } else {
        throw new Error(t("toast.updateFailed"))
      }
    } catch (error) {
      console.error("Failed to update SCIM integration:", error)
      showErrorToast(t("toast.updateFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async () => {
    const newStatus = scimIntegration?.status === "ACTIVE" ? "PAUSED" : "ACTIVE"
    try {
      const response = await fetch(`/api/admin/identity/scim/${scimId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        showSuccessToast(newStatus === "ACTIVE" ? t("toast.activated") : t("toast.paused"))
        fetchSCIMIntegration()
      }
    } catch (error) {
      showErrorToast(t("toast.updateStatusFailed"))
    }
  }

  const handleRegenerateTokenClick = () => {
    setShowRegenerateTokenDialog(true)
  }

  const handleRegenerateTokenConfirm = useCallback(async () => {
    setIsRegeneratingToken(true)
    try {
      const response = await fetch(`/api/admin/identity/scim/${scimId}/token`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate token")
      }

      const data = await response.json()
      setNewToken(data.scimIntegration.bearerToken)
      showSuccessToast(t("toast.tokenRegenerated"))
      fetchSCIMIntegration()
    } catch (error) {
      showErrorToast(t("toast.regenerateTokenFailed"))
    } finally {
      setIsRegeneratingToken(false)
      setShowRegenerateTokenDialog(false)
    }
  }, [scimId, fetchSCIMIntegration])

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/identity/scim/${scimId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        showSuccessToast(t("toast.deleted"))
        router.push("/admin/identity/scim")
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : t("toast.deleteFailed"))
    } finally {
      setShowDeleteDialog(false)
    }
  }, [scimId, router])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showSuccessToast(t("toast.copied"))
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!scimIntegration) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">SCIM integration not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/identity/scim">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {scimIntegration.organization?.name || "SCIM Integration"}
            </h1>
            <div className="flex items-center gap-2">
              {getStatusBadge(scimIntegration.status)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={scimIntegration.status === "ACTIVE" ? "secondary" : "default"}
            onClick={handleToggleStatus}
          >
            {scimIntegration.status === "ACTIVE" ? (
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
          </Button>
          <Button variant="destructive" onClick={handleDeleteClick}>
            Delete
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete SCIM Integration"
        description="Are you sure you want to delete this SCIM integration? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />

      <ConfirmationDialog
        open={showRegenerateTokenDialog}
        onOpenChange={setShowRegenerateTokenDialog}
        title="Regenerate Token"
        description="Are you sure you want to regenerate the token? The current token will be invalidated and you will need to update your identity provider configuration."
        confirmText={isRegeneratingToken ? "Regenerating..." : "Regenerate"}
        onConfirm={handleRegenerateTokenConfirm}
        variant="destructive"
      />

      {/* New Token Alert */}
      {newToken && (
        <Alert>
          <Key className="h-4 w-4" />
          <AlertTitle>New Bearer Token Generated</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">
              Save this token now. It will not be shown again.
            </p>
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
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 ml-2"
              onClick={() => setNewToken(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoint">Endpoint</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(scimIntegration.status)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users Provisioned</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scimIntegration.usersProvisioned}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users Synced</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scimIntegration.usersSynced}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Groups Synced</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scimIntegration.groupsSynced}</div>
              </CardContent>
            </Card>
          </div>

          {/* Organization Details */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organization</span>
                <span className="font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {scimIntegration.organization?.name || scimIntegration.orgId}
                </span>
              </div>
              {scimIntegration.organization && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slug</span>
                    <span className="font-medium">{scimIntegration.organization.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <Badge variant="outline">{scimIntegration.organization.planTier}</Badge>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Members</span>
                <span className="font-medium">{scimIntegration.userCount} users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {scimIntegration.lastSyncAt
                    ? new Date(scimIntegration.lastSyncAt).toLocaleString()
                    : "Never"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(scimIntegration.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* SSO Configuration */}
          {scimIntegration.ssoConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Linked SSO Configuration</CardTitle>
                <CardDescription>
                  SSO is configured for this organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider</span>
                  <Badge variant="outline">{scimIntegration.ssoConfig.provider}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={scimIntegration.ssoConfig.status === "ACTIVE" ? "default" : "secondary"}>
                    {scimIntegration.ssoConfig.status}
                  </Badge>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/admin/identity/sso/${scimIntegration.ssoConfig.id}`}>
                    View SSO Configuration
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Sync Errors */}
          {scimIntegration.syncErrors && scimIntegration.syncErrors.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Sync Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scimIntegration.syncErrors.map((error, i) => (
                    <li key={i} className="text-sm text-destructive">
                      {typeof error === 'string' ? error : JSON.stringify(error)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="endpoint" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SCIM Endpoint Configuration</CardTitle>
              <CardDescription>
                Use these details to configure your identity provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>SCIM Base URL</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}${scimIntegration.endpoint}`}
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(`${window.location.origin}${scimIntegration.endpoint}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bearer Token</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={scimIntegration.bearerToken || "Token hidden"}
                    className="font-mono"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Token prefix: {scimIntegration.tokenPrefix || "N/A"}
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleRegenerateTokenClick}
                  disabled={isRegeneratingToken}
                >
                  {isRegeneratingToken ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Regenerate Token
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Warning: Regenerating the token will invalidate the current token.
                  You will need to update your identity provider configuration.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Endpoints</CardTitle>
              <CardDescription>
                SCIM 2.0 endpoints available for this integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>GET /Users</span>
                  <Badge variant="outline">List users</Badge>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>POST /Users</span>
                  <Badge variant="outline">Create user</Badge>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>GET /Users/:id</span>
                  <Badge variant="outline">Get user</Badge>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>PUT /Users/:id</span>
                  <Badge variant="outline">Update user</Badge>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>PATCH /Users/:id</span>
                  <Badge variant="outline">Patch user</Badge>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>DELETE /Users/:id</span>
                  <Badge variant="outline">Delete user</Badge>
                </div>
                {scimIntegration.syncGroups && (
                  <>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>GET /Groups</span>
                      <Badge variant="outline">List groups</Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>POST /Groups</span>
                      <Badge variant="outline">Create group</Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>GET /Groups/:id</span>
                      <Badge variant="outline">Get group</Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>PUT /Groups/:id</span>
                      <Badge variant="outline">Update group</Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>DELETE /Groups/:id</span>
                      <Badge variant="outline">Delete group</Badge>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sync Settings</CardTitle>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label>Default Role</Label>
                    <Select
                      value={editForm.defaultRole}
                      onValueChange={(value) => setEditForm({ ...editForm, defaultRole: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIEWER">{tIdentity("roles.viewer")}</SelectItem>
                        <SelectItem value="MEMBER">{tIdentity("roles.member")}</SelectItem>
                        <SelectItem value="ADMIN">{tIdentity("roles.admin")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sync Users</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable user provisioning via SCIM
                      </p>
                    </div>
                    <Switch
                      checked={editForm.syncUsers}
                      onCheckedChange={(checked) =>
                        setEditForm({ ...editForm, syncUsers: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sync Groups</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable group provisioning via SCIM
                      </p>
                    </div>
                    <Switch
                      checked={editForm.syncGroups}
                      onCheckedChange={(checked) =>
                        setEditForm({ ...editForm, syncGroups: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Deactivate</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically deactivate users removed via SCIM
                      </p>
                    </div>
                    <Switch
                      checked={editForm.autoDeactivate}
                      onCheckedChange={(checked) =>
                        setEditForm({ ...editForm, autoDeactivate: checked })
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Default Role</span>
                    <Badge variant="outline">{scimIntegration.defaultRole}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-muted-foreground">Sync Users</span>
                      <p className="text-xs text-muted-foreground">
                        User provisioning via SCIM
                      </p>
                    </div>
                    <Badge variant={scimIntegration.syncUsers ? "default" : "secondary"}>
                      {scimIntegration.syncUsers ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-muted-foreground">Sync Groups</span>
                      <p className="text-xs text-muted-foreground">
                        Group provisioning via SCIM
                      </p>
                    </div>
                    <Badge variant={scimIntegration.syncGroups ? "default" : "secondary"}>
                      {scimIntegration.syncGroups ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-muted-foreground">Auto-Deactivate</span>
                      <p className="text-xs text-muted-foreground">
                        Deactivate users removed via SCIM
                      </p>
                    </div>
                    <Badge variant={scimIntegration.autoDeactivate ? "default" : "secondary"}>
                      {scimIntegration.autoDeactivate ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
