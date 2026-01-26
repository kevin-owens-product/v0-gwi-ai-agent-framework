"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  Loader2,
  Key,
  Building2,
  Search,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"
import { toast } from "sonner"

interface Organization {
  id: string
  name: string
  slug: string
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

const defaultRoles = [
  { value: "VIEWER", label: "Viewer" },
  { value: "MEMBER", label: "Member" },
  { value: "ADMIN", label: "Admin" },
]

export default function NewSSOPage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [orgSearch, setOrgSearch] = useState("")
  const [loadingOrgs, setLoadingOrgs] = useState(false)

  const [formData, setFormData] = useState({
    orgId: "",
    provider: "SAML",
    displayName: "",
    // SAML fields
    entityId: "",
    ssoUrl: "",
    sloUrl: "",
    certificate: "",
    // OIDC fields
    clientId: "",
    clientSecret: "",
    discoveryUrl: "",
    authorizationUrl: "",
    tokenUrl: "",
    userInfoUrl: "",
    // Common settings
    defaultRole: "MEMBER",
    jitProvisioning: true,
    autoDeactivate: false,
    allowedDomains: "",
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.role === "ADMIN"

  useEffect(() => {
    searchOrganizations("")
  }, [])

  const searchOrganizations = async (query: string) => {
    setLoadingOrgs(true)
    try {
      const response = await fetch(`/api/admin/tenants?search=${encodeURIComponent(query)}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.tenants || [])
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error)
    } finally {
      setLoadingOrgs(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.orgId || !formData.provider) {
      toast.error("Organization and provider are required")
      return
    }

    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {
        orgId: formData.orgId,
        provider: formData.provider,
        displayName: formData.displayName || null,
        defaultRole: formData.defaultRole,
        jitProvisioning: formData.jitProvisioning,
        autoDeactivate: formData.autoDeactivate,
        allowedDomains: formData.allowedDomains
          ? formData.allowedDomains.split(",").map((d) => d.trim())
          : [],
      }

      // Add provider-specific fields
      if (formData.provider === "SAML" || formData.provider === "CUSTOM") {
        payload.entityId = formData.entityId || null
        payload.ssoUrl = formData.ssoUrl || null
        payload.sloUrl = formData.sloUrl || null
        payload.certificate = formData.certificate || null
      }

      if (formData.provider === "OIDC" || formData.provider === "CUSTOM") {
        payload.clientId = formData.clientId || null
        payload.clientSecret = formData.clientSecret || null
        payload.discoveryUrl = formData.discoveryUrl || null
        payload.authorizationUrl = formData.authorizationUrl || null
        payload.tokenUrl = formData.tokenUrl || null
        payload.userInfoUrl = formData.userInfoUrl || null
      }

      const response = await fetch("/api/admin/identity/sso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("SSO configuration created successfully")
        router.push(`/admin/identity/sso/${data.ssoConfig.id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to create SSO configuration")
      }
    } catch (error) {
      console.error("Failed to create SSO config:", error)
      toast.error("Failed to create SSO configuration")
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">You don&apos;t have permission to create SSO configurations</p>
        <Link href="/admin/identity/sso">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to SSO Configurations
          </Button>
        </Link>
      </div>
    )
  }

  const isSAMLProvider = ["SAML", "CUSTOM"].includes(formData.provider)
  const isOIDCProvider = ["OIDC", "AZURE_AD", "OKTA", "GOOGLE_WORKSPACE", "ONELOGIN", "PING_IDENTITY", "CUSTOM"].includes(formData.provider)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/identity/sso">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Key className="h-6 w-6 text-primary" />
              Create SSO Configuration
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure Single Sign-On for an organization
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.orgId}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Configuration
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="provider">Provider Configuration</TabsTrigger>
          <TabsTrigger value="provisioning">User Provisioning</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization & Provider</CardTitle>
              <CardDescription>
                Select the organization and SSO provider type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Organization *</Label>
                <Select
                  value={formData.orgId}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, orgId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search organizations..."
                          value={orgSearch}
                          onChange={(e) => {
                            setOrgSearch(e.target.value)
                            searchOrganizations(e.target.value)
                          }}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    {loadingOrgs ? (
                      <div className="p-4 text-center text-muted-foreground">Loading...</div>
                    ) : organizations.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">No organizations found</div>
                    ) : (
                      organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {org.name}
                            <span className="text-muted-foreground">({org.slug})</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>SSO Provider *</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, provider: v }))}
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

              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                  placeholder="e.g., Acme Corp SSO"
                />
                <p className="text-xs text-muted-foreground">
                  A friendly name for this SSO configuration
                </p>
              </div>

              <div className="space-y-2">
                <Label>Allowed Email Domains</Label>
                <Input
                  value={formData.allowedDomains}
                  onChange={(e) => setFormData((prev) => ({ ...prev, allowedDomains: e.target.value }))}
                  placeholder="acme.com, acme.org"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of email domains allowed to use this SSO
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="provider" className="space-y-6">
          {isSAMLProvider && (
            <Card>
              <CardHeader>
                <CardTitle>SAML Configuration</CardTitle>
                <CardDescription>
                  Configure SAML 2.0 settings from your Identity Provider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Entity ID / Issuer</Label>
                  <Input
                    value={formData.entityId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, entityId: e.target.value }))}
                    placeholder="https://idp.example.com/entity"
                  />
                </div>

                <div className="space-y-2">
                  <Label>SSO URL (Login URL)</Label>
                  <Input
                    value={formData.ssoUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ssoUrl: e.target.value }))}
                    placeholder="https://idp.example.com/sso"
                  />
                </div>

                <div className="space-y-2">
                  <Label>SLO URL (Logout URL)</Label>
                  <Input
                    value={formData.sloUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sloUrl: e.target.value }))}
                    placeholder="https://idp.example.com/slo"
                  />
                </div>

                <div className="space-y-2">
                  <Label>X.509 Certificate</Label>
                  <Textarea
                    value={formData.certificate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, certificate: e.target.value }))}
                    placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste the public certificate from your Identity Provider
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {isOIDCProvider && formData.provider !== "SAML" && (
            <Card>
              <CardHeader>
                <CardTitle>OIDC Configuration</CardTitle>
                <CardDescription>
                  Configure OpenID Connect settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client ID</Label>
                    <Input
                      value={formData.clientId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, clientId: e.target.value }))}
                      placeholder="your-client-id"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Client Secret</Label>
                    <Input
                      type="password"
                      value={formData.clientSecret}
                      onChange={(e) => setFormData((prev) => ({ ...prev, clientSecret: e.target.value }))}
                      placeholder="your-client-secret"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Discovery URL</Label>
                  <Input
                    value={formData.discoveryUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discoveryUrl: e.target.value }))}
                    placeholder="https://idp.example.com/.well-known/openid-configuration"
                  />
                  <p className="text-xs text-muted-foreground">
                    If provided, other URLs will be auto-discovered
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <p className="text-sm font-medium">Manual URL Configuration (optional if discovery URL is provided)</p>

                  <div className="space-y-2">
                    <Label>Authorization URL</Label>
                    <Input
                      value={formData.authorizationUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, authorizationUrl: e.target.value }))}
                      placeholder="https://idp.example.com/authorize"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Token URL</Label>
                    <Input
                      value={formData.tokenUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tokenUrl: e.target.value }))}
                      placeholder="https://idp.example.com/token"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>User Info URL</Label>
                    <Input
                      value={formData.userInfoUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, userInfoUrl: e.target.value }))}
                      placeholder="https://idp.example.com/userinfo"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="provisioning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Provisioning Settings</CardTitle>
              <CardDescription>
                Configure how users are provisioned through SSO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Default Role</Label>
                <Select
                  value={formData.defaultRole}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, defaultRole: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Role assigned to users when they first sign in via SSO
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Just-in-Time Provisioning</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically create user accounts on first SSO login
                  </p>
                </div>
                <Switch
                  checked={formData.jitProvisioning}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, jitProvisioning: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Deactivate</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically deactivate users removed from Identity Provider
                  </p>
                </div>
                <Switch
                  checked={formData.autoDeactivate}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, autoDeactivate: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
