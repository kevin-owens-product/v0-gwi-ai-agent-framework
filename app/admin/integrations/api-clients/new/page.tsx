"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "sonner"

const clientTypes = [
  {
    value: "CONFIDENTIAL",
    label: "Confidential (Server-side)",
    description: "For server-side applications that can securely store secrets",
  },
  {
    value: "PUBLIC",
    label: "Public (SPA/Mobile)",
    description: "For browser or mobile apps that cannot store secrets securely",
  },
  {
    value: "SERVICE",
    label: "Service (Machine-to-Machine)",
    description: "For backend services communicating with each other",
  },
]

const scopeOptions = [
  { value: "read", label: "Read", description: "Read-only access to resources" },
  { value: "write", label: "Write", description: "Create and update resources" },
  { value: "delete", label: "Delete", description: "Delete resources" },
  { value: "admin", label: "Admin", description: "Administrative operations" },
]

interface Organization {
  id: string
  name: string
}

export default function NewAPIClientPage() {
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
      toast.error("Name and organization are required")
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
        throw new Error(data.error || "Failed to create API client")
      }

      const data = await response.json()

      // Show the client secret
      if (data.clientSecret) {
        setShowSecret(data.clientSecret)
      } else {
        toast.success("API client created successfully")
        router.push("/admin/integrations/api-clients")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create API client")
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
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
            <DialogTitle>Client Secret Generated</DialogTitle>
            <DialogDescription>
              Copy this secret now - it will not be shown again!
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
            {showSecret}
          </div>
          <DialogFooter>
            <Button onClick={() => copyToClipboard(showSecret!)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Secret
            </Button>
            <Button variant="outline" onClick={handleSecretClose}>
              Done
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
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Key className="h-6 w-6 text-primary" />
              Create API Client
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new OAuth client for API access
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name || !formData.orgId}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Client
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
            <CardDescription>
              Basic information about the API client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                placeholder="My API Client"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this client used for?"
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
                Organization *
              </Label>
              <Select
                value={formData.orgId}
                onValueChange={(value) =>
                  setFormData({ ...formData, orgId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingOrgs ? "Loading..." : "Select organization"} />
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
              <Label>Client Type</Label>
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
            <CardTitle>Rate Limits</CardTitle>
            <CardDescription>
              Configure API usage limits for this client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rateLimit">Rate Limit (requests/minute)</Label>
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
              <Label htmlFor="dailyLimit">Daily Limit (optional)</Label>
              <Input
                id="dailyLimit"
                type="number"
                min="1"
                placeholder="No limit"
                value={formData.dailyLimit}
                onChange={(e) =>
                  setFormData({ ...formData, dailyLimit: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyLimit">Monthly Limit (optional)</Label>
              <Input
                id="monthlyLimit"
                type="number"
                min="1"
                placeholder="No limit"
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
              Permissions
            </CardTitle>
            <CardDescription>
              Configure allowed scopes and redirect URIs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Allowed Scopes</Label>
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
              <Label htmlFor="redirectUris">Redirect URIs (one per line)</Label>
              <Textarea
                id="redirectUris"
                placeholder="https://example.com/callback&#10;https://localhost:3000/callback"
                rows={4}
                value={formData.redirectUris}
                onChange={(e) =>
                  setFormData({ ...formData, redirectUris: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                URLs where users can be redirected after authentication
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
