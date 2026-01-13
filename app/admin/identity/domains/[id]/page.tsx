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
  ArrowLeft,
  Globe,
  Loader2,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Shield,
  Building2,
  Copy,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

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

interface Domain {
  id: string
  domain: string
  orgId: string
  status: string
  verificationMethod: string
  verificationToken: string
  verifiedAt: string | null
  expiresAt: string | null
  autoJoin: boolean
  ssoEnforced: boolean
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  organization: Organization | null
  ssoConfig: SSOConfig | null
}

const verificationMethods = [
  { value: "DNS_TXT", label: "DNS TXT Record" },
  { value: "DNS_CNAME", label: "DNS CNAME Record" },
  { value: "META_TAG", label: "Meta Tag" },
  { value: "FILE_UPLOAD", label: "File Upload" },
]

export default function DomainDetailPage() {
  const params = useParams()
  const router = useRouter()
  const domainId = params.id as string

  const [domain, setDomain] = useState<Domain | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [editForm, setEditForm] = useState({
    autoJoin: false,
    ssoEnforced: false,
    verificationMethod: "DNS_TXT",
  })

  const fetchDomain = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/identity/domains/${domainId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch domain")
      }
      const data = await response.json()
      setDomain(data.domain)
      setEditForm({
        autoJoin: data.domain.autoJoin,
        ssoEnforced: data.domain.ssoEnforced,
        verificationMethod: data.domain.verificationMethod,
      })
    } catch (error) {
      console.error("Failed to fetch domain:", error)
      toast.error("Failed to fetch domain details")
    } finally {
      setIsLoading(false)
    }
  }, [domainId])

  useEffect(() => {
    fetchDomain()
  }, [fetchDomain])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/identity/domains/${domainId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (response.ok) {
        toast.success("Domain settings updated")
        setIsEditing(false)
        fetchDomain()
      } else {
        throw new Error("Failed to update domain")
      }
    } catch (error) {
      console.error("Failed to update domain:", error)
      toast.error("Failed to update domain settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleVerify = async () => {
    setIsVerifying(true)
    try {
      const response = await fetch(`/api/admin/identity/domains/${domainId}/verify`, {
        method: "POST",
      })
      const data = await response.json()

      if (data.verification?.success) {
        toast.success("Domain verified successfully!")
      } else {
        toast.error(data.verification?.message || "Verification failed")
      }
      fetchDomain()
    } catch (error) {
      console.error("Failed to verify domain:", error)
      toast.error("Failed to verify domain")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this domain verification?")) return

    try {
      const response = await fetch(`/api/admin/identity/domains/${domainId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Domain deleted successfully")
        router.push("/admin/identity/domains")
      } else {
        throw new Error("Failed to delete domain")
      }
    } catch (error) {
      console.error("Failed to delete domain:", error)
      toast.error("Failed to delete domain")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "FAILED":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case "EXPIRED":
        return (
          <Badge variant="outline" className="text-yellow-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getVerificationInstructions = (method: string, token: string, domain: string) => {
    switch (method) {
      case "DNS_TXT":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Add a TXT record to your DNS settings:
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm">
              <div className="flex justify-between items-center">
                <span>Host: @</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="break-all">Value: {token}</span>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(token)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      case "DNS_CNAME":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Add a CNAME record to your DNS settings:
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm">
              <div className="flex justify-between items-center">
                <span>Host: _gwi-verification</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Points to: verify.gwi.com</span>
              </div>
            </div>
          </div>
        )
      case "META_TAG":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Add this meta tag to your homepage HTML:
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm break-all">
              <code>&lt;meta name="gwi-verification" content="{token}" /&gt;</code>
              <Button
                size="icon"
                variant="ghost"
                className="ml-2"
                onClick={() => copyToClipboard(`<meta name="gwi-verification" content="${token}" />`)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      case "FILE_UPLOAD":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Create a verification file at:
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm">
              <div>https://{domain}/.well-known/gwi-verification.txt</div>
              <div className="mt-2 flex justify-between items-center">
                <span>Contents: {token}</span>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(token)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!domain) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Domain not found</p>
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
            <Link href="/admin/identity/domains">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{domain.domain}</h1>
            <div className="flex items-center gap-2">
              {getStatusBadge(domain.status)}
              <Badge variant="outline">{domain.verificationMethod.replace("_", " ")}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {domain.status !== "VERIFIED" && (
            <Button onClick={handleVerify} disabled={isVerifying}>
              {isVerifying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Verify Now
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(domain.status)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auto-Join</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant={domain.autoJoin ? "default" : "secondary"}>
                  {domain.autoJoin ? "Enabled" : "Disabled"}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SSO Enforced</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant={domain.ssoEnforced ? "default" : "secondary"}>
                  {domain.ssoEnforced ? "Enforced" : "Optional"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Domain Details */}
          <Card>
            <CardHeader>
              <CardTitle>Domain Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Domain</span>
                <span className="font-medium">{domain.domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organization</span>
                <span className="font-medium">
                  {domain.organization?.name || domain.orgId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verification Method</span>
                <Badge variant="outline">{domain.verificationMethod.replace("_", " ")}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verified At</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {domain.verifiedAt
                    ? new Date(domain.verifiedAt).toLocaleDateString()
                    : "Not verified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(domain.createdAt).toLocaleDateString()}
                </span>
              </div>
              {domain.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(domain.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SSO Configuration */}
          {domain.ssoConfig && (
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
                  <Badge variant="outline">{domain.ssoConfig.provider}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={domain.ssoConfig.status === "ACTIVE" ? "default" : "secondary"}>
                    {domain.ssoConfig.status}
                  </Badge>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/admin/identity/sso/${domain.ssoConfig.id}`}>
                    View SSO Configuration
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification Instructions</CardTitle>
              <CardDescription>
                Follow these instructions to verify ownership of {domain.domain}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getVerificationInstructions(
                domain.verificationMethod,
                domain.verificationToken,
                domain.domain
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  After configuring the verification record, click the button below to verify.
                  DNS changes may take up to 24-48 hours to propagate.
                </p>
                <Button onClick={handleVerify} disabled={isVerifying || domain.status === "VERIFIED"}>
                  {isVerifying ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {domain.status === "VERIFIED" ? "Already Verified" : "Check Verification"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification History */}
          {domain.metadata && (domain.metadata as Record<string, unknown>).lastVerificationAttempt && (
            <Card>
              <CardHeader>
                <CardTitle>Last Verification Attempt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span>
                    {new Date((domain.metadata as Record<string, string>).lastVerificationAttempt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Result</span>
                  <span>{(domain.metadata as Record<string, string>).lastVerificationResult}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Domain Settings</CardTitle>
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
                    <Label>Verification Method</Label>
                    <Select
                      value={editForm.verificationMethod}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, verificationMethod: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {verificationMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Join</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically add users with this email domain to the organization
                      </p>
                    </div>
                    <Switch
                      checked={editForm.autoJoin}
                      onCheckedChange={(checked) =>
                        setEditForm({ ...editForm, autoJoin: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enforce SSO</Label>
                      <p className="text-sm text-muted-foreground">
                        Require users with this domain to authenticate via SSO
                      </p>
                    </div>
                    <Switch
                      checked={editForm.ssoEnforced}
                      onCheckedChange={(checked) =>
                        setEditForm({ ...editForm, ssoEnforced: checked })
                      }
                      disabled={!domain.ssoConfig}
                    />
                  </div>
                  {!domain.ssoConfig && editForm.ssoEnforced === false && (
                    <p className="text-sm text-yellow-500">
                      SSO enforcement requires an SSO configuration. Configure SSO first.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verification Method</span>
                    <Badge variant="outline">
                      {domain.verificationMethod.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-muted-foreground">Auto-Join</span>
                      <p className="text-xs text-muted-foreground">
                        Auto-add users with this domain
                      </p>
                    </div>
                    <Badge variant={domain.autoJoin ? "default" : "secondary"}>
                      {domain.autoJoin ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-muted-foreground">Enforce SSO</span>
                      <p className="text-xs text-muted-foreground">
                        Require SSO for this domain
                      </p>
                    </div>
                    <Badge variant={domain.ssoEnforced ? "default" : "secondary"}>
                      {domain.ssoEnforced ? "Enforced" : "Optional"}
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
