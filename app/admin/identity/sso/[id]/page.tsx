"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Key,
  Loader2,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  Settings,
  TestTube,
  Pause,
  Play,
  Building2,
  Users,
  Globe,
  Shield,
  RefreshCw,
  Clock,
  AlertTriangle,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

interface Organization {
  id: string
  name: string
  slug: string
  planTier: string
}

interface Domain {
  id: string
  domain: string
  status: string
  ssoEnforced: boolean
}

interface SSOConfig {
  id: string
  orgId: string
  provider: string
  status: string
  displayName: string | null
  // SAML
  entityId: string | null
  ssoUrl: string | null
  sloUrl: string | null
  certificate: string | null
  // OIDC
  clientId: string | null
  clientSecret: string | null
  discoveryUrl: string | null
  authorizationUrl: string | null
  tokenUrl: string | null
  userInfoUrl: string | null
  // Settings
  defaultRole: string
  jitProvisioning: boolean
  autoDeactivate: boolean
  attributeMapping: Record<string, unknown>
  allowedDomains: string[]
  lastSyncAt: string | null
  syncErrors: string[]
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  organization: Organization | null
  domains: Domain[]
  userCount: number
}

interface TestResult {
  success: boolean
  step: string
  message: string
  details?: Record<string, unknown>
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

export default function SSODetailPage() {
  const params = useParams()
  const router = useRouter()
  const ssoId = params.id as string

  const [ssoConfig, setSsoConfig] = useState<SSOConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[] | null>(null)

  const [editForm, setEditForm] = useState({
    displayName: "",
    provider: "SAML",
    // SAML
    entityId: "",
    ssoUrl: "",
    sloUrl: "",
    certificate: "",
    // OIDC
    clientId: "",
    clientSecret: "",
    discoveryUrl: "",
    authorizationUrl: "",
    tokenUrl: "",
    userInfoUrl: "",
    // Settings
    defaultRole: "MEMBER",
    jitProvisioning: true,
    autoDeactivate: false,
    allowedDomains: "",
  })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const fetchSSOConfig = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/identity/sso/${ssoId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch SSO configuration")
      }
      const data = await response.json()
      setSsoConfig(data.ssoConfig)
      setEditForm({
        displayName: data.ssoConfig.displayName || "",
        provider: data.ssoConfig.provider,
        entityId: data.ssoConfig.entityId || "",
        ssoUrl: data.ssoConfig.ssoUrl || "",
        sloUrl: data.ssoConfig.sloUrl || "",
        certificate: data.ssoConfig.certificate === "[CERTIFICATE]" ? "" : data.ssoConfig.certificate || "",
        clientId: data.ssoConfig.clientId || "",
        clientSecret: "",
        discoveryUrl: data.ssoConfig.discoveryUrl || "",
        authorizationUrl: data.ssoConfig.authorizationUrl || "",
        tokenUrl: data.ssoConfig.tokenUrl || "",
        userInfoUrl: data.ssoConfig.userInfoUrl || "",
        defaultRole: data.ssoConfig.defaultRole,
        jitProvisioning: data.ssoConfig.jitProvisioning,
        autoDeactivate: data.ssoConfig.autoDeactivate,
        allowedDomains: data.ssoConfig.allowedDomains?.join(", ") || "",
      })
    } catch (error) {
      console.error("Failed to fetch SSO config:", error)
      toast.error("Failed to fetch SSO configuration")
    } finally {
      setIsLoading(false)
    }
  }, [ssoId])

  useEffect(() => {
    fetchSSOConfig()
  }, [fetchSSOConfig])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updateData: Record<string, unknown> = {
        displayName: editForm.displayName || null,
        defaultRole: editForm.defaultRole,
        jitProvisioning: editForm.jitProvisioning,
        autoDeactivate: editForm.autoDeactivate,
        allowedDomains: editForm.allowedDomains.split(",").map((d) => d.trim()).filter(Boolean),
      }

      // Add SAML or OIDC fields based on provider
      if (["SAML", "OKTA", "AZURE_AD", "PING_IDENTITY"].includes(editForm.provider)) {
        updateData.entityId = editForm.entityId || null
        updateData.ssoUrl = editForm.ssoUrl || null
        updateData.sloUrl = editForm.sloUrl || null
        if (editForm.certificate) {
          updateData.certificate = editForm.certificate
        }
      } else if (["OIDC", "GOOGLE_WORKSPACE"].includes(editForm.provider)) {
        updateData.clientId = editForm.clientId || null
        if (editForm.clientSecret) {
          updateData.clientSecret = editForm.clientSecret
        }
        updateData.discoveryUrl = editForm.discoveryUrl || null
        updateData.authorizationUrl = editForm.authorizationUrl || null
        updateData.tokenUrl = editForm.tokenUrl || null
        updateData.userInfoUrl = editForm.userInfoUrl || null
      }

      const response = await fetch(`/api/admin/identity/sso/${ssoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast.success("SSO configuration updated")
        setIsEditing(false)
        fetchSSOConfig()
      } else {
        throw new Error("Failed to update SSO configuration")
      }
    } catch (error) {
      console.error("Failed to update SSO config:", error)
      toast.error("Failed to update SSO configuration")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    setTestResults(null)
    try {
      const response = await fetch(`/api/admin/identity/sso/${ssoId}/test`, {
        method: "POST",
      })
      const data = await response.json()
      setTestResults(data.results)

      if (data.success) {
        toast.success("All tests passed!")
      } else {
        toast.error("Some tests failed")
      }
      fetchSSOConfig()
    } catch (error) {
      console.error("Failed to test SSO config:", error)
      toast.error("Failed to test SSO configuration")
    } finally {
      setIsTesting(false)
    }
  }

  const handleToggleStatus = async () => {
    const newStatus = ssoConfig?.status === "ACTIVE" ? "DISABLED" : "ACTIVE"
    try {
      const response = await fetch(`/api/admin/identity/sso/${ssoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success(`SSO ${newStatus === "ACTIVE" ? "activated" : "disabled"} successfully`)
        fetchSSOConfig()
      }
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/identity/sso/${ssoId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("SSO configuration deleted successfully")
        router.push("/admin/identity/sso")
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete SSO configuration")
    } finally {
      setShowDeleteDialog(false)
    }
  }, [ssoId, router])

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

  const isSAMLProvider = ["SAML", "OKTA", "AZURE_AD", "PING_IDENTITY"].includes(ssoConfig?.provider || "")
  const isOIDCProvider = ["OIDC", "GOOGLE_WORKSPACE", "ONELOGIN"].includes(ssoConfig?.provider || "")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!ssoConfig) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">SSO configuration not found</p>
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
            <Link href="/admin/identity/sso">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {ssoConfig.displayName || ssoConfig.organization?.name || "SSO Configuration"}
            </h1>
            <div className="flex items-center gap-2">
              {getStatusBadge(ssoConfig.status)}
              <Badge variant="outline">
                {ssoProviders.find((p) => p.value === ssoConfig.provider)?.label || ssoConfig.provider}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTest} disabled={isTesting}>
            {isTesting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Test Configuration
          </Button>
          <Button
            variant={ssoConfig.status === "ACTIVE" ? "secondary" : "default"}
            onClick={handleToggleStatus}
          >
            {ssoConfig.status === "ACTIVE" ? (
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
          </Button>
          <Button variant="destructive" onClick={handleDeleteClick}>
            Delete
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete SSO Configuration"
        description="Are you sure you want to delete this SSO configuration? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          {testResults && <TabsTrigger value="test-results">Test Results</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(ssoConfig.status)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ssoConfig.userCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Domains</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ssoConfig.domains.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {ssoConfig.lastSyncAt
                    ? new Date(ssoConfig.lastSyncAt).toLocaleDateString()
                    : "Never"}
                </div>
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
                  {ssoConfig.organization?.name || ssoConfig.orgId}
                </span>
              </div>
              {ssoConfig.organization && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slug</span>
                    <span className="font-medium">{ssoConfig.organization.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <Badge variant="outline">{ssoConfig.organization.planTier}</Badge>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider</span>
                <Badge variant="outline">
                  {ssoProviders.find((p) => p.value === ssoConfig.provider)?.label}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(ssoConfig.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Sync Errors */}
          {ssoConfig.syncErrors && ssoConfig.syncErrors.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Sync Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {ssoConfig.syncErrors.map((error, i) => (
                    <li key={i} className="text-sm text-destructive">
                      {error}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {isSAMLProvider ? "SAML Configuration" : "OIDC Configuration"}
                </CardTitle>
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
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                      placeholder="e.g., Acme Corp SSO"
                    />
                  </div>

                  {isSAMLProvider && (
                    <>
                      <div className="space-y-2">
                        <Label>Entity ID (Issuer)</Label>
                        <Input
                          value={editForm.entityId}
                          onChange={(e) => setEditForm({ ...editForm, entityId: e.target.value })}
                          placeholder="https://idp.example.com/entity"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SSO URL</Label>
                        <Input
                          value={editForm.ssoUrl}
                          onChange={(e) => setEditForm({ ...editForm, ssoUrl: e.target.value })}
                          placeholder="https://idp.example.com/sso"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SLO URL (Optional)</Label>
                        <Input
                          value={editForm.sloUrl}
                          onChange={(e) => setEditForm({ ...editForm, sloUrl: e.target.value })}
                          placeholder="https://idp.example.com/slo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>X.509 Certificate</Label>
                        <Textarea
                          value={editForm.certificate}
                          onChange={(e) => setEditForm({ ...editForm, certificate: e.target.value })}
                          placeholder="-----BEGIN CERTIFICATE-----..."
                          rows={6}
                          className="font-mono text-sm"
                        />
                      </div>
                    </>
                  )}

                  {isOIDCProvider && (
                    <>
                      <div className="space-y-2">
                        <Label>Client ID</Label>
                        <Input
                          value={editForm.clientId}
                          onChange={(e) => setEditForm({ ...editForm, clientId: e.target.value })}
                          placeholder="your-client-id"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Client Secret</Label>
                        <Input
                          type="password"
                          value={editForm.clientSecret}
                          onChange={(e) => setEditForm({ ...editForm, clientSecret: e.target.value })}
                          placeholder="Leave blank to keep existing"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Discovery URL (Optional)</Label>
                        <Input
                          value={editForm.discoveryUrl}
                          onChange={(e) => setEditForm({ ...editForm, discoveryUrl: e.target.value })}
                          placeholder="https://idp.example.com/.well-known/openid-configuration"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Authorization URL</Label>
                        <Input
                          value={editForm.authorizationUrl}
                          onChange={(e) => setEditForm({ ...editForm, authorizationUrl: e.target.value })}
                          placeholder="https://idp.example.com/authorize"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Token URL</Label>
                        <Input
                          value={editForm.tokenUrl}
                          onChange={(e) => setEditForm({ ...editForm, tokenUrl: e.target.value })}
                          placeholder="https://idp.example.com/token"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>User Info URL (Optional)</Label>
                        <Input
                          value={editForm.userInfoUrl}
                          onChange={(e) => setEditForm({ ...editForm, userInfoUrl: e.target.value })}
                          placeholder="https://idp.example.com/userinfo"
                        />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Display Name</span>
                    <span className="font-medium">{ssoConfig.displayName || "-"}</span>
                  </div>

                  {isSAMLProvider && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entity ID</span>
                        <span className="font-medium">{ssoConfig.entityId || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SSO URL</span>
                        <span className="font-medium text-sm break-all">{ssoConfig.ssoUrl || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SLO URL</span>
                        <span className="font-medium text-sm break-all">{ssoConfig.sloUrl || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Certificate</span>
                        <Badge variant={ssoConfig.certificate ? "default" : "secondary"}>
                          {ssoConfig.certificate ? "Configured" : "Not Set"}
                        </Badge>
                      </div>
                    </>
                  )}

                  {isOIDCProvider && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Client ID</span>
                        <span className="font-medium">{ssoConfig.clientId || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Client Secret</span>
                        <Badge variant={ssoConfig.clientSecret ? "default" : "secondary"}>
                          {ssoConfig.clientSecret ? "Configured" : "Not Set"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discovery URL</span>
                        <span className="font-medium text-sm break-all">{ssoConfig.discoveryUrl || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Authorization URL</span>
                        <span className="font-medium text-sm break-all">{ssoConfig.authorizationUrl || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Token URL</span>
                        <span className="font-medium text-sm break-all">{ssoConfig.tokenUrl || "-"}</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Provisioning Settings</CardTitle>
                {!isEditing && (
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
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Just-in-Time Provisioning</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically create user accounts on first SSO login
                      </p>
                    </div>
                    <Switch
                      checked={editForm.jitProvisioning}
                      onCheckedChange={(checked) =>
                        setEditForm({ ...editForm, jitProvisioning: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Deactivate</Label>
                      <p className="text-sm text-muted-foreground">
                        Deactivate users removed from the identity provider
                      </p>
                    </div>
                    <Switch
                      checked={editForm.autoDeactivate}
                      onCheckedChange={(checked) =>
                        setEditForm({ ...editForm, autoDeactivate: checked })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Allowed Domains (comma-separated)</Label>
                    <Input
                      value={editForm.allowedDomains}
                      onChange={(e) => setEditForm({ ...editForm, allowedDomains: e.target.value })}
                      placeholder="example.com, corp.example.com"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Default Role</span>
                    <Badge variant="outline">{ssoConfig.defaultRole}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-muted-foreground">JIT Provisioning</span>
                      <p className="text-xs text-muted-foreground">
                        Auto-create users on first login
                      </p>
                    </div>
                    <Badge variant={ssoConfig.jitProvisioning ? "default" : "secondary"}>
                      {ssoConfig.jitProvisioning ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-muted-foreground">Auto-Deactivate</span>
                      <p className="text-xs text-muted-foreground">
                        Deactivate removed users
                      </p>
                    </div>
                    <Badge variant={ssoConfig.autoDeactivate ? "default" : "secondary"}>
                      {ssoConfig.autoDeactivate ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Allowed Domains</span>
                    <span className="font-medium">
                      {ssoConfig.allowedDomains?.length > 0
                        ? ssoConfig.allowedDomains.join(", ")
                        : "All domains"}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Linked Domains</CardTitle>
              <CardDescription>
                Domains associated with this organization that can use SSO
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ssoConfig.domains.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>SSO Enforced</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ssoConfig.domains.map((domain) => (
                      <TableRow key={domain.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{domain.domain}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={domain.status === "VERIFIED" ? "default" : "secondary"}
                          >
                            {domain.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={domain.ssoEnforced ? "default" : "outline"}
                          >
                            {domain.ssoEnforced ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Enforced
                              </>
                            ) : (
                              "Optional"
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/identity/domains/${domain.id}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No domains linked to this organization</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/admin/identity/domains">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Domain
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {testResults && (
          <TabsContent value="test-results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  Results from the last configuration test
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Step</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testResults.map((result, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{result.step}</TableCell>
                        <TableCell>
                          {result.success ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Passed
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{result.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
