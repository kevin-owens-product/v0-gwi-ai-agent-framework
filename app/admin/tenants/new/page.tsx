"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
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
  ArrowLeft,
  Save,
  Loader2,
  Building2,
  User,
  Globe,
  CreditCard,
  GitBranch,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"

interface ParentOrg {
  id: string
  name: string
}

export default function NewTenantPage() {
  const router = useRouter()
  const t = useTranslations("admin.tenants.new")
  const tMain = useTranslations("admin.tenants")
  const tCommon = useTranslations("common")
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const ORG_TYPE_OPTIONS = [
    { value: "STANDARD", label: tMain("orgTypes.STANDARD") },
    { value: "AGENCY", label: tMain("orgTypes.AGENCY") },
    { value: "HOLDING_COMPANY", label: tMain("orgTypes.HOLDING_COMPANY") },
    { value: "SUBSIDIARY", label: tMain("orgTypes.SUBSIDIARY") },
    { value: "BRAND", label: tMain("orgTypes.BRAND") },
    { value: "SUB_BRAND", label: tMain("orgTypes.SUB_BRAND") },
    { value: "DIVISION", label: tMain("orgTypes.DIVISION") },
    { value: "DEPARTMENT", label: tMain("orgTypes.DEPARTMENT") },
    { value: "FRANCHISE", label: tMain("orgTypes.FRANCHISE") },
    { value: "FRANCHISEE", label: tMain("orgTypes.FRANCHISEE") },
    { value: "RESELLER", label: tMain("orgTypes.RESELLER") },
    { value: "CLIENT", label: tMain("orgTypes.CLIENT") },
    { value: "REGIONAL", label: tMain("orgTypes.REGIONAL") },
    { value: "PORTFOLIO_COMPANY", label: tMain("orgTypes.PORTFOLIO_COMPANY") },
  ]

  const PLAN_TIERS = [
    { value: "STARTER", label: tMain("plans.starter") },
    { value: "PROFESSIONAL", label: tMain("plans.professional") },
    { value: "ENTERPRISE", label: tMain("plans.enterprise") },
  ]

  const COMPANY_SIZES = [
    { value: "SOLO", label: t("companySizes.solo") },
    { value: "SMALL", label: t("companySizes.small") },
    { value: "MEDIUM", label: t("companySizes.medium") },
    { value: "LARGE", label: t("companySizes.large") },
    { value: "ENTERPRISE", label: t("companySizes.enterprise") },
    { value: "GLOBAL", label: t("companySizes.global") },
  ]
  const [parentOrgs, setParentOrgs] = useState<ParentOrg[]>([])
  const [isLoadingParents, setIsLoadingParents] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    planTier: "STARTER",
    orgType: "STANDARD",
    parentOrgId: "",
    industry: "",
    companySize: "",
    country: "",
    timezone: "UTC",
    logoUrl: "",
    brandColor: "",
    domain: "",
    allowChildOrgs: false,
    ownerEmail: "",
    ownerName: "",
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.role === "ADMIN"

  useEffect(() => {
    async function fetchParentOrgs() {
      try {
        const response = await fetch("/api/admin/tenants?limit=200", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setParentOrgs(
            (data.tenants || [])
              .filter((t: { allowChildOrgs?: boolean }) => t.allowChildOrgs)
              .map((t: { id: string; name: string }) => ({ id: t.id, name: t.name }))
          )
        }
      } catch (error) {
        console.error("Failed to fetch parent orgs:", error)
      } finally {
        setIsLoadingParents(false)
      }
    }
    fetchParentOrgs()
  }, [])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }))
  }

  const handleCreate = async () => {
    if (!formData.name) {
      showErrorToast(t("validation.nameRequired"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/tenants", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || undefined,
          planTier: formData.planTier,
          orgType: formData.orgType,
          parentOrgId: formData.parentOrgId && formData.parentOrgId !== "none" ? formData.parentOrgId : undefined,
          industry: formData.industry || undefined,
          companySize: formData.companySize || undefined,
          country: formData.country || undefined,
          timezone: formData.timezone,
          logoUrl: formData.logoUrl || undefined,
          brandColor: formData.brandColor || undefined,
          domain: formData.domain || undefined,
          allowChildOrgs: formData.allowChildOrgs,
          ownerEmail: formData.ownerEmail || undefined,
          ownerName: formData.ownerName || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/tenants/${data.organization.id}`)
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("toast.createFailed"))
      }
    } catch (error) {
      console.error("Failed to create organization:", error)
      showErrorToast(t("toast.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("noPermission")}</p>
        <Link href="/admin/tenants">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToTenants")}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/tenants">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("createOrganization")}
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("sections.organizationDetails")}
            </CardTitle>
            <CardDescription>
              {t("sections.organizationDetailsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fields.organizationName")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t("placeholders.organizationName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">{t("fields.slug")}</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder={t("placeholders.slug")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("hints.slug")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t("fields.organizationType")}</Label>
                <Select
                  value={formData.orgType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, orgType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORG_TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("fields.industry")}</Label>
                <Input
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder={t("placeholders.industry")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t("fields.companySize")}</Label>
                <Select
                  value={formData.companySize}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, companySize: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("placeholders.selectSize")} />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("fields.domain")}</Label>
                <Input
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder={t("placeholders.domain")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("sections.locationTimezone")}
            </CardTitle>
            <CardDescription>
              {t("sections.locationTimezoneDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="country">{t("fields.country")}</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder={t("placeholders.country")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">{t("fields.timezone")}</Label>
                <Input
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                  placeholder={t("placeholders.timezone")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t("sections.planSubscription")}
            </CardTitle>
            <CardDescription>
              {t("sections.planSubscriptionDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t("fields.planTier")}</Label>
              <Select
                value={formData.planTier}
                onValueChange={(value) => setFormData(prev => ({ ...prev, planTier: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_TIERS.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              {t("sections.hierarchySettings")}
            </CardTitle>
            <CardDescription>
              {t("sections.hierarchySettingsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t("fields.parentOrganization")}</Label>
              <Select
                value={formData.parentOrgId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, parentOrgId: value }))}
                disabled={isLoadingParents}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingParents ? tCommon("loading") : t("placeholders.noneRootOrganization")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("placeholders.noneRootOrganization")}</SelectItem>
                  {parentOrgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("hints.parentOrganization")}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>{t("fields.allowChildOrgs")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("hints.allowChildOrgs")}
                </p>
              </div>
              <Switch
                checked={formData.allowChildOrgs}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowChildOrgs: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("sections.ownerInformation")}
            </CardTitle>
            <CardDescription>
              {t("sections.ownerInformationDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">{t("fields.ownerEmail")}</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                  placeholder={t("placeholders.ownerEmail")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">{t("fields.ownerName")}</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                  placeholder={t("placeholders.ownerName")}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("hints.ownerInformation")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sections.branding")}</CardTitle>
            <CardDescription>
              {t("sections.brandingDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">{t("fields.logoUrl")}</Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder={t("placeholders.logoUrl")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandColor">{t("fields.brandColor")}</Label>
                <Input
                  id="brandColor"
                  value={formData.brandColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                  placeholder={t("placeholders.brandColor")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
