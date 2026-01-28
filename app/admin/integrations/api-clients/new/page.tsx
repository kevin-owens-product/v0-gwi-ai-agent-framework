"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Loader2,
  Key,
  Building2,
  Shield,
  Copy,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

interface Organization {
  id: string
  name: string
}

export default function NewAPIClientPage() {
  const t = useTranslations("admin.integrations.apiClients")
  const tCommon = useTranslations("common")

  const clientTypes = [
    {
      value: "CONFIDENTIAL",
      label: t("clientTypes.confidential"),
      description: t("clientTypeDescriptions.confidential"),
    },
    {
      value: "PUBLIC",
      label: t("clientTypes.public"),
      description: t("clientTypeDescriptions.public"),
    },
    {
      value: "SERVICE",
      label: t("clientTypes.service"),
      description: t("clientTypeDescriptions.service"),
    },
  ]

  const scopeOptions = [
    { value: "read", label: t("scopes.read"), description: t("scopeDescriptions.read") },
    { value: "write", label: t("scopes.write"), description: t("scopeDescriptions.write") },
    { value: "delete", label: t("scopes.delete"), description: t("scopeDescriptions.delete") },
    { value: "admin", label: t("scopes.admin"), description: t("scopeDescriptions.admin") },
  ]

  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [showSecret, setShowSecret] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "CONFIDENTIAL",
    orgId: "",
    rateLimit: 1000,
    dailyLimit: "",
    monthlyLimit: "",
    redirectUris: "",
    allowedScopes: [] as string[],
  })

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/admin/organizations?limit=100")
      const data = await response.json()
      setOrganizations(data.organizations || [])
    } catch (error) {
      console.error("Failed to fetch organizations:", error)
    } finally {
      setLoadingOrgs(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.orgId) {
      showErrorToast(t("validation.nameAndOrgRequired"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/integrations/api-clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          description: formData.description || null,
          dailyLimit: formData.dailyLimit ? parseInt(formData.dailyLimit) : null,
          monthlyLimit: formData.monthlyLimit ? parseInt(formData.monthlyLimit) : null,
          redirectUris: formData.redirectUris.split("\n").filter(Boolean),
          allowedScopes: formData.allowedScopes,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("toast.createFailed"))
      }

      const data = await response.json()

      // Show the client secret
      if (data.clientSecret) {
        setShowSecret(data.clientSecret)
      } else {
        showSuccessToast(t("toast.clientCreatedSuccess"))
        router.push("/admin/integrations/api-clients")
      }
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : t("toast.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showSuccessToast(t("toast.copied"))
  }

  const handleSecretClose = () => {
    setShowSecret(null)
    router.push("/admin/integrations/api-clients")
  }

  const toggleScope = (scope: string) => {
    setFormData(prev => ({
      ...prev,
      allowedScopes: prev.allowedScopes.includes(scope)
        ? prev.allowedScopes.filter(s => s !== scope)
        : [...prev.allowedScopes, scope],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Secret Display Dialog */}
      <Dialog open={!!showSecret} onOpenChange={handleSecretClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("secretDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("secretDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
            {showSecret}
          </div>
          <DialogFooter>
            <Button onClick={() => copyToClipboard(showSecret!)}>
              <Copy className="h-4 w-4 mr-2" />
              {t("secretDialog.copySecret")}
            </Button>
            <Button variant="outline" onClick={handleSecretClose}>
              {t("secretDialog.done")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/integrations/api-clients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Key className="h-6 w-6 text-primary" />
              {t("new.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("new.description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name || !formData.orgId}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {tCommon("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("createButton")}
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("detail.clientDetails")}</CardTitle>
            <CardDescription>
              {t("new.clientDetailsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("form.clientNameRequired")}</Label>
              <Input
                id="name"
                placeholder={t("form.clientNamePlaceholder")}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{tCommon("description")}</Label>
              <Textarea
                id="description"
                placeholder={t("form.descriptionPlaceholder")}
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {t("form.organizationRequired")}
              </Label>
              <Select
                value={formData.orgId}
                onValueChange={(value) =>
                  setFormData({ ...formData, orgId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingOrgs ? tCommon("loading") : t("form.selectOrganization")} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("form.clientType")}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clientTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {type.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card>
          <CardHeader>
            <CardTitle>{t("usage.rateLimits")}</CardTitle>
            <CardDescription>
              {t("new.rateLimitsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rateLimit">{t("form.rateLimit")}</Label>
              <Input
                id="rateLimit"
                type="number"
                min="1"
                value={formData.rateLimit}
                onChange={(e) =>
                  setFormData({ ...formData, rateLimit: parseInt(e.target.value) || 1000 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyLimit">{t("settings.dailyLimit")}</Label>
              <Input
                id="dailyLimit"
                type="number"
                min="1"
                placeholder={t("settings.noLimit")}
                value={formData.dailyLimit}
                onChange={(e) =>
                  setFormData({ ...formData, dailyLimit: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyLimit">{t("settings.monthlyLimit")}</Label>
              <Input
                id="monthlyLimit"
                type="number"
                min="1"
                placeholder={t("settings.noLimit")}
                value={formData.monthlyLimit}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyLimit: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Scopes & Redirect URIs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("new.permissions")}
            </CardTitle>
            <CardDescription>
              {t("new.permissionsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("detail.allowedScopes")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {scopeOptions.map((scope) => (
                  <div
                    key={scope.value}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      formData.allowedScopes.includes(scope.value)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleScope(scope.value)}
                  >
                    <p className="font-medium">{scope.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {scope.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirectUris">{t("form.redirectUris")}</Label>
              <Textarea
                id="redirectUris"
                placeholder={t("form.redirectUrisPlaceholderMultiline")}
                rows={4}
                value={formData.redirectUris}
                onChange={(e) =>
                  setFormData({ ...formData, redirectUris: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("form.redirectUrisHelp")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
