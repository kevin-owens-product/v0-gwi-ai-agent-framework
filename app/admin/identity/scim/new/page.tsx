"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Save,
  Loader2,
  Database,
  Building2,
  Search,
  Key,
  Copy,
  AlertTriangle,
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

export default function NewSCIMPage() {
  const router = useRouter()
  const t = useTranslations("admin.identity.scim.new")
  const tMain = useTranslations("admin.identity.scim")
  const tCommon = useTranslations("common")
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const defaultRoles = [
    { value: "VIEWER", label: t("roles.viewer") },
    { value: "MEMBER", label: t("roles.member") },
    { value: "ADMIN", label: t("roles.admin") },
  ]
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [orgSearch, setOrgSearch] = useState("")
  const [loadingOrgs, setLoadingOrgs] = useState(false)
  const [tokenDialog, setTokenDialog] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [newEndpoint, setNewEndpoint] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    orgId: "",
    syncUsers: true,
    syncGroups: true,
    autoDeactivate: true,
    defaultRole: "MEMBER",
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showSuccessToast(tMain("toast.copied"))
  }

  const handleCreate = async () => {
    if (!formData.orgId) {
      showErrorToast(t("validation.organizationRequired"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/identity/scim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        // Show token dialog
        setNewToken(data.scimIntegration.bearerToken)
        setNewEndpoint(data.scimIntegration.endpoint)
        setTokenDialog(true)
        showSuccessToast(t("toast.createSuccess"))
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("toast.createFailed"))
      }
    } catch (error) {
      console.error("Failed to create SCIM integration:", error)
      showErrorToast(t("toast.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleTokenDialogClose = () => {
    setTokenDialog(false)
    router.push("/admin/identity/scim")
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("noPermission")}</p>
        <Link href="/admin/identity/scim">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToSCIM")}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/identity/scim">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("back")}
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
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
                {t("createIntegration")}
              </>
            )}
          </Button>
        </div>

        {/* Content */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.organization")}</CardTitle>
              <CardDescription>
                {t("sections.organizationDescription")}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("sections.syncSettings")}</CardTitle>
              <CardDescription>
                {t("sections.syncSettingsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("fields.syncUsers")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("hints.syncUsers")}
                  </p>
                </div>
                <Switch
                  checked={formData.syncUsers}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, syncUsers: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("fields.syncGroups")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("hints.syncGroups")}
                  </p>
                </div>
                <Switch
                  checked={formData.syncGroups}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, syncGroups: checked }))
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

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{tCommon("important")}</AlertTitle>
                <AlertDescription>
                  {t("hints.important")}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Token Dialog */}
      <Dialog open={tokenDialog} onOpenChange={setTokenDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <Key className="h-4 w-4" />
              <AlertTitle>{t("dialog.bearerToken")}</AlertTitle>
              <AlertDescription className="mt-2">
                <div className="bg-muted p-3 rounded-lg font-mono text-sm break-all">
                  {newToken}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => newToken && copyToClipboard(newToken)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t("dialog.copyToken")}
                </Button>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>{t("dialog.scimEndpointUrl")}</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}${newEndpoint}`}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => newEndpoint && copyToClipboard(`${window.location.origin}${newEndpoint}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleTokenDialogClose}>
              {t("dialog.done")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
