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
import { toast } from "sonner"

interface Organization {
  id: string
  name: string
  slug: string
}

const verificationMethods = [
  { value: "DNS_TXT", label: "DNS TXT Record", description: "Add a TXT record to your DNS" },
  { value: "DNS_CNAME", label: "DNS CNAME Record", description: "Add a CNAME record to your DNS" },
  { value: "META_TAG", label: "Meta Tag", description: "Add a meta tag to your website" },
  { value: "FILE_UPLOAD", label: "File Upload", description: "Upload a verification file to your website" },
]

export default function NewDomainPage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
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
      toast.error("Domain and organization are required")
      return
    }

    if (!validateDomain(formData.domain)) {
      toast.error("Please enter a valid domain (e.g., example.com)")
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
        toast.success("Domain added successfully. Please complete verification.")
        router.push(`/admin/identity/domains/${data.domain.id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to add domain")
      }
    } catch (error) {
      console.error("Failed to add domain:", error)
      toast.error("Failed to add domain")
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">You don&apos;t have permission to add domains</p>
        <Link href="/admin/identity/domains">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Domain Management
          </Button>
        </Link>
      </div>
    )
  }

  const selectedMethod = verificationMethods.find((m) => m.value === formData.verificationMethod)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/identity/domains">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Add Domain
            </h1>
            <p className="text-sm text-muted-foreground">
              Verify a domain for an organization
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.domain || !formData.orgId}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Add Domain
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Domain Details</CardTitle>
            <CardDescription>
              Enter the domain and select the organization to associate it with
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Domain *</Label>
              <Input
                value={formData.domain}
                onChange={(e) => setFormData((prev) => ({ ...prev, domain: e.target.value }))}
                placeholder="example.com"
              />
              <p className="text-xs text-muted-foreground">
                Enter the domain without http:// or www
              </p>
            </div>

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
              <Label>Verification Method</Label>
              <Select
                value={formData.verificationMethod}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, verificationMethod: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {verificationMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div>
                        <p>{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
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
            <CardTitle>Domain Settings</CardTitle>
            <CardDescription>
              Configure how this domain should behave once verified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Join</Label>
                <p className="text-xs text-muted-foreground">
                  Users with this email domain can automatically join the organization
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
                <Label>SSO Enforced</Label>
                <p className="text-xs text-muted-foreground">
                  Users with this email domain must use SSO to sign in
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
              <AlertTitle>Verification Required</AlertTitle>
              <AlertDescription>
                After adding the domain, you will need to complete the verification process
                using the {selectedMethod?.label.toLowerCase()} method. Instructions will be
                provided on the domain details page.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
