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
import { toast } from "sonner"

interface Organization {
  id: string
  name: string
  slug: string
}

const defaultRoles = [
  { value: "VIEWER", label: "Viewer" },
  { value: "MEMBER", label: "Member" },
  { value: "ADMIN", label: "Admin" },
]

export default function NewSCIMPage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)
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
    toast.success("Copied to clipboard")
  }

  const handleCreate = async () => {
    if (!formData.orgId) {
      toast.error("Organization is required")
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
        toast.success("SCIM integration created successfully")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to create SCIM integration")
      }
    } catch (error) {
      console.error("Failed to create SCIM integration:", error)
      toast.error("Failed to create SCIM integration")
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
        <p className="text-muted-foreground">You don&apos;t have permission to create SCIM integrations</p>
        <Link href="/admin/identity/scim">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to SCIM Integrations
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
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                Create SCIM Integration
              </h1>
              <p className="text-sm text-muted-foreground">
                Configure SCIM 2.0 user provisioning for an organization
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
                Create Integration
              </>
            )}
          </Button>
        </div>

        {/* Content */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>
                Select the organization to configure SCIM provisioning for
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
                  Role assigned to users provisioned via SCIM
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>
                Configure what data should be synchronized from your Identity Provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sync Users</Label>
                  <p className="text-xs text-muted-foreground">
                    Provision and deprovision users automatically
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
                  <Label>Sync Groups</Label>
                  <p className="text-xs text-muted-foreground">
                    Sync group memberships from Identity Provider
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
                  <Label>Auto-Deactivate</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically deactivate users when removed from IdP
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
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  After creating the integration, you will receive a bearer token and endpoint URL.
                  The token will only be shown once, so make sure to save it securely.
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
            <DialogTitle>SCIM Integration Created</DialogTitle>
            <DialogDescription>
              Save the bearer token below. It will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <Key className="h-4 w-4" />
              <AlertTitle>Bearer Token</AlertTitle>
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
                  Copy Token
                </Button>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>SCIM Endpoint URL</Label>
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
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
