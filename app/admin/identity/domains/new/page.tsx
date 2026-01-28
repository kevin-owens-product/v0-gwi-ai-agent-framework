"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
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
  ArrowLeft,
  Save,
  Loader2,
  Globe,
  Building2,
  Search,
  Info,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

interface Organization {
  id: string
  name: string
  slug: string
}

const verificationMethodKeys = ["DNS_TXT", "DNS_CNAME", "META_TAG", "FILE_UPLOAD"] as const

export default function NewDomainPage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const t = useTranslations("admin.identity.domains")
  const tCommon = useTranslations("common")
  const [isSaving, setIsSaving] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [orgSearch, setOrgSearch] = useState("")
  const [loadingOrgs, setLoadingOrgs] = useState(false)

  const [formData, setFormData] = useState({
    domain: "",
    orgId: "",
    verificationMethod: "DNS_TXT",
    autoJoin: false,
    ssoEnforced: false,
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

  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
    return domainRegex.test(domain)
  }

  const handleCreate = async () => {
    if (!formData.domain || !formData.orgId) {
      showErrorToast(t("errors.domainAndOrgRequired"))
      return
    }

    if (!validateDomain(formData.domain)) {
      showErrorToast(t("errors.invalidDomain"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/identity/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: formData.domain.toLowerCase().trim(),
          orgId: formData.orgId,
          verificationMethod: formData.verificationMethod,
          autoJoin: formData.autoJoin,
          ssoEnforced: formData.ssoEnforced,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        showSuccessToast(t("messages.domainAdded"))
        router.push(`/admin/identity/domains/${data.domain.id}`)
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("errors.addFailed"))
      }
    } catch (error) {
      console.error("Failed to add domain:", error)
      showErrorToast(t("errors.addFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("errors.noPermission")}</p>
        <Link href="/admin/identity/domains">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToDomains")}
          </Button>
        </Link>
      </div>
    )
  }

  const getMethodLabel = (method: string) => {
    return t(`verificationMethods.${method.toLowerCase()}.label`)
  }

  const getMethodDescription = (method: string) => {
    return t(`verificationMethods.${method.toLowerCase()}.description`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/identity/domains">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              {t("new.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("new.description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.domain || !formData.orgId}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("new.adding")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("new.addDomain")}
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("new.domainDetails")}</CardTitle>
            <CardDescription>
              {t("new.domainDetailsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t("form.domain")} *</Label>
              <Input
                value={formData.domain}
                onChange={(e) => setFormData((prev) => ({ ...prev, domain: e.target.value }))}
                placeholder={t("form.domainPlaceholder")}
              />
              <p className="text-xs text-muted-foreground">
                {t("form.domainHint")}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("form.organization")} *</Label>
              <Select
                value={formData.orgId}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, orgId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectOrganization")} />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t("form.searchOrganizations")}
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
                    <div className="p-4 text-center text-muted-foreground">{tCommon("loading")}</div>
                  ) : organizations.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">{t("form.noOrganizationsFound")}</div>
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
              <Label>{t("form.verificationMethod")}</Label>
              <Select
                value={formData.verificationMethod}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, verificationMethod: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {verificationMethodKeys.map((method) => (
                    <SelectItem key={method} value={method}>
                      <div>
                        <p>{getMethodLabel(method)}</p>
                        <p className="text-xs text-muted-foreground">{getMethodDescription(method)}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("new.domainSettings")}</CardTitle>
            <CardDescription>
              {t("new.domainSettingsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("form.autoJoin")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("form.autoJoinDescription")}
                </p>
              </div>
              <Switch
                checked={formData.autoJoin}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, autoJoin: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("form.ssoEnforced")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("form.ssoEnforcedDescription")}
                </p>
              </div>
              <Switch
                checked={formData.ssoEnforced}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, ssoEnforced: checked }))
                }
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{t("new.verificationRequired")}</AlertTitle>
              <AlertDescription>
                {t("new.verificationRequiredDescription", { method: getMethodLabel(formData.verificationMethod).toLowerCase() })}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
