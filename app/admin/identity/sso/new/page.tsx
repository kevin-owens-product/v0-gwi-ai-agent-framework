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
import { useTranslations } from "next-intl"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

interface Organization {
  id: string
  name: string
  slug: string
}

export default function NewSSOPage() {
  const router = useRouter()
  const t = useTranslations("admin.identity.sso.new")
  const tMain = useTranslations("admin.identity.sso")
  const tCommon = useTranslations("common")
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const ssoProviders = [
    { value: "SAML", label: tMain("providers.saml") },
    { value: "OIDC", label: tMain("providers.oidc") },
    { value: "AZURE_AD", label: tMain("providers.azure") },
    { value: "OKTA", label: tMain("providers.okta") },
    { value: "GOOGLE_WORKSPACE", label: tMain("providers.google") },
    { value: "ONELOGIN", label: tMain("providers.onelogin") },
    { value: "PING_IDENTITY", label: tMain("providers.pingidentity") },
    { value: "CUSTOM", label: tMain("providers.custom") },
  ]

  const defaultRoles = [
    { value: "VIEWER", label: t("roles.viewer") },
    { value: "MEMBER", label: t("roles.member") },
    { value: "ADMIN", label: t("roles.admin") },
  ]
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
      showErrorToast(t("validation.organizationAndProviderRequired"))
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
        showSuccessToast(t("toast.createSuccess"))
        router.push(`/admin/identity/sso/${data.ssoConfig.id}`)
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("toast.createFailed"))
      }
    } catch (error) {
      console.error("Failed to create SSO config:", error)
      showErrorToast(t("toast.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("noPermission")}</p>
        <Link href="/admin/identity/sso">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToSSO")}
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
              {t("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Key className="h-6 w-6 text-primary" />
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.orgId}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("createConfiguration")}
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basic">{t("tabs.basic")}</TabsTrigger>
          <TabsTrigger value="provider">{t("tabs.provider")}</TabsTrigger>
          <TabsTrigger value="provisioning">{t("tabs.provisioning")}</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.organizationProvider")}</CardTitle>
              <CardDescription>
                {t("sections.organizationProviderDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t("fields.organization")} *</Label>
                <Select
                  value={formData.orgId}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, orgId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("placeholders.selectOrganization")} />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t("placeholders.searchOrganizations")}
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
                      <div className="p-4 text-center text-muted-foreground">{t("placeholders.loading")}</div>
                    ) : organizations.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">{t("placeholders.noOrganizationsFound")}</div>
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
                <Label>{t("fields.ssoProvider")} *</Label>
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
                <Label>{t("fields.displayName")}</Label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                  placeholder={t("placeholders.displayName")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("hints.displayName")}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t("fields.allowedEmailDomains")}</Label>
                <Input
                  value={formData.allowedDomains}
                  onChange={(e) => setFormData((prev) => ({ ...prev, allowedDomains: e.target.value }))}
                  placeholder={t("placeholders.allowedDomains")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("hints.allowedDomains")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="provider" className="space-y-6">
          {isSAMLProvider && (
            <Card>
              <CardHeader>
                <CardTitle>{t("sections.samlConfiguration")}</CardTitle>
                <CardDescription>
                  {t("sections.samlConfigurationDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t("fields.entityId")}</Label>
                  <Input
                    value={formData.entityId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, entityId: e.target.value }))}
                    placeholder={t("placeholders.entityId")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("fields.ssoUrl")}</Label>
                  <Input
                    value={formData.ssoUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ssoUrl: e.target.value }))}
                    placeholder={t("placeholders.ssoUrl")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("fields.sloUrl")}</Label>
                  <Input
                    value={formData.sloUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sloUrl: e.target.value }))}
                    placeholder={t("placeholders.sloUrl")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("fields.certificate")}</Label>
                  <Textarea
                    value={formData.certificate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, certificate: e.target.value }))}
                    placeholder={t("placeholders.certificate")}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("hints.certificate")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {isOIDCProvider && formData.provider !== "SAML" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("sections.oidcConfiguration")}</CardTitle>
                <CardDescription>
                  {t("sections.oidcConfigurationDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("fields.clientId")}</Label>
                    <Input
                      value={formData.clientId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, clientId: e.target.value }))}
                      placeholder={t("placeholders.clientId")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("fields.clientSecret")}</Label>
                    <Input
                      type="password"
                      value={formData.clientSecret}
                      onChange={(e) => setFormData((prev) => ({ ...prev, clientSecret: e.target.value }))}
                      placeholder={t("placeholders.clientSecret")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("fields.discoveryUrl")}</Label>
                  <Input
                    value={formData.discoveryUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discoveryUrl: e.target.value }))}
                    placeholder={t("placeholders.discoveryUrl")}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("hints.discoveryUrl")}
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <p className="text-sm font-medium">{t("hints.manualUrlConfig")}</p>

                  <div className="space-y-2">
                    <Label>{t("fields.authorizationUrl")}</Label>
                    <Input
                      value={formData.authorizationUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, authorizationUrl: e.target.value }))}
                      placeholder={t("placeholders.authorizationUrl")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("fields.tokenUrl")}</Label>
                    <Input
                      value={formData.tokenUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tokenUrl: e.target.value }))}
                      placeholder={t("placeholders.tokenUrl")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("fields.userInfoUrl")}</Label>
                    <Input
                      value={formData.userInfoUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, userInfoUrl: e.target.value }))}
                      placeholder={t("placeholders.userInfoUrl")}
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
              <CardTitle>{t("sections.userProvisioning")}</CardTitle>
              <CardDescription>
                {t("sections.userProvisioningDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t("fields.defaultRole")}</Label>
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
                  {t("hints.defaultRole")}
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("fields.jitProvisioning")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("hints.jitProvisioning")}
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
                  <Label>{t("fields.autoDeactivate")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("hints.autoDeactivate")}
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
