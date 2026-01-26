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

const ORG_TYPE_OPTIONS = [
  { value: "STANDARD", label: "Standard" },
  { value: "AGENCY", label: "Agency" },
  { value: "HOLDING_COMPANY", label: "Holding Company" },
  { value: "SUBSIDIARY", label: "Subsidiary" },
  { value: "BRAND", label: "Brand" },
  { value: "SUB_BRAND", label: "Sub-Brand" },
  { value: "DIVISION", label: "Division" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "FRANCHISE", label: "Franchise" },
  { value: "FRANCHISEE", label: "Franchisee" },
  { value: "RESELLER", label: "Reseller" },
  { value: "CLIENT", label: "Client" },
  { value: "REGIONAL", label: "Regional" },
  { value: "PORTFOLIO_COMPANY", label: "Portfolio Company" },
]

const PLAN_TIERS = [
  { value: "STARTER", label: "Starter" },
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "ENTERPRISE", label: "Enterprise" },
]

const COMPANY_SIZES = [
  { value: "SOLO", label: "Solo (1)" },
  { value: "SMALL", label: "Small (2-10)" },
  { value: "MEDIUM", label: "Medium (11-50)" },
  { value: "LARGE", label: "Large (51-200)" },
  { value: "ENTERPRISE", label: "Enterprise (201-1000)" },
  { value: "GLOBAL", label: "Global (1000+)" },
]

interface ParentOrg {
  id: string
  name: string
}

export default function NewTenantPage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)
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
      alert("Organization name is required")
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
        alert(data.error || "Failed to create organization")
      }
    } catch (error) {
      console.error("Failed to create organization:", error)
      alert("Failed to create organization")
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">You don&apos;t have permission to create organizations</p>
        <Link href="/admin/tenants">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tenants
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
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create New Organization</h1>
            <p className="text-sm text-muted-foreground">
              Add a new tenant organization to the platform
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Organization
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
              Organization Details
            </CardTitle>
            <CardDescription>
              Basic information about the organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Acme Corporation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (auto-generated if empty)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="acme-corporation"
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier, lowercase with hyphens
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Organization Type</Label>
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
                <Label>Industry</Label>
                <Input
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="Technology, Healthcare, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Company Size</Label>
                <Select
                  value={formData.companySize}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, companySize: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
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
                <Label>Domain</Label>
                <Input
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="acme.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Location & Timezone
            </CardTitle>
            <CardDescription>
              Regional settings for the organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="United States"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                  placeholder="UTC"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plan & Subscription
            </CardTitle>
            <CardDescription>
              Subscription tier and billing settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Plan Tier</Label>
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
              Hierarchy Settings
            </CardTitle>
            <CardDescription>
              Configure organization hierarchy and parent relationships
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Parent Organization</Label>
              <Select
                value={formData.parentOrgId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, parentOrgId: value }))}
                disabled={isLoadingParents}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingParents ? "Loading..." : "None (root organization)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (root organization)</SelectItem>
                  {parentOrgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a parent to create this organization as a child in the hierarchy
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>Allow Child Organizations</Label>
                <p className="text-xs text-muted-foreground">
                  Enable hierarchy features and allow creating sub-organizations
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
              Owner Information (Optional)
            </CardTitle>
            <CardDescription>
              Automatically create an owner user for this organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Owner Email</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                  placeholder="owner@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              If provided, a user will be created (or existing user added) as the organization owner
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding (Optional)</CardTitle>
            <CardDescription>
              Custom branding settings for the organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandColor">Brand Color</Label>
                <Input
                  id="brandColor"
                  value={formData.brandColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
