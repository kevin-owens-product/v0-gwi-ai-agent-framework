"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  ArrowLeft,
  Shield,
  Loader2,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  Lock,
  Smartphone,
  Fingerprint,
  HardDrive,
  AlertTriangle,
  Trash,
  Power,
  PowerOff,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface DevicePolicy {
  id: string
  name: string
  description: string | null
  scope: string
  targetOrgs: string[]
  targetPlans: string[]
  requireEncryption: boolean
  requirePasscode: boolean
  requireBiometric: boolean
  requireMDM: boolean
  minOSVersion: Record<string, string>
  allowedPlatforms: string[]
  blockedPlatforms: string[]
  blockOnViolation: boolean
  wipeOnViolation: boolean
  notifyOnViolation: boolean
  isActive: boolean
  priority: number
  createdBy: string | null
  createdAt: string
  updatedAt: string
  affectedDevicesCount?: number
}

const scopeOptions = [
  { value: "PLATFORM", label: "Platform-wide" },
  { value: "ENTERPRISE_ONLY", label: "Enterprise Only" },
  { value: "SPECIFIC_ORGS", label: "Specific Organizations" },
  { value: "SPECIFIC_PLANS", label: "Specific Plans" },
]

const platformOptions = [
  { value: "iOS", label: "iOS" },
  { value: "Android", label: "Android" },
  { value: "Windows", label: "Windows" },
  { value: "macOS", label: "macOS" },
  { value: "Linux", label: "Linux" },
]

export default function DevicePolicyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const policyId = params?.id as string | undefined
  const isNew = !policyId

  const [policy, setPolicy] = useState<DevicePolicy | null>(null)
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isEditing, setIsEditing] = useState(isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    scope: "PLATFORM",
    targetOrgs: [] as string[],
    targetPlans: [] as string[],
    requireEncryption: false,
    requirePasscode: false,
    requireBiometric: false,
    requireMDM: false,
    minOSVersion: {} as Record<string, string>,
    allowedPlatforms: [] as string[],
    blockedPlatforms: [] as string[],
    blockOnViolation: false,
    wipeOnViolation: false,
    notifyOnViolation: true,
    isActive: true,
    priority: 0,
  })

  const fetchPolicy = useCallback(async () => {
    if (!policyId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/devices/policies/${policyId}`)
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?type=admin")
          return
        }
        throw new Error("Failed to fetch policy")
      }
      const data = await response.json()
      setPolicy(data.policy)
      setEditForm({
        name: data.policy.name,
        description: data.policy.description || "",
        scope: data.policy.scope,
        targetOrgs: data.policy.targetOrgs || [],
        targetPlans: data.policy.targetPlans || [],
        requireEncryption: data.policy.requireEncryption,
        requirePasscode: data.policy.requirePasscode,
        requireBiometric: data.policy.requireBiometric,
        requireMDM: data.policy.requireMDM,
        minOSVersion: data.policy.minOSVersion || {},
        allowedPlatforms: data.policy.allowedPlatforms || [],
        blockedPlatforms: data.policy.blockedPlatforms || [],
        blockOnViolation: data.policy.blockOnViolation,
        wipeOnViolation: data.policy.wipeOnViolation,
        notifyOnViolation: data.policy.notifyOnViolation,
        isActive: data.policy.isActive,
        priority: data.policy.priority,
      })
    } catch (error) {
      console.error("Failed to fetch policy:", error)
      toast.error("Failed to fetch device policy")
    } finally {
      setIsLoading(false)
    }
  }, [policyId, router])

  useEffect(() => {
    if (!isNew) {
      fetchPolicy()
    }
  }, [fetchPolicy, isNew])

  const handleSave = async () => {
    if (!editForm.name) {
      toast.error("Policy name is required")
      return
    }

    setIsSaving(true)
    try {
      const url = isNew
        ? "/api/admin/devices/policies"
        : `/api/admin/devices/policies/${policyId}`

      const response = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save policy")
      }

      const data = await response.json()
      toast.success(isNew ? "Policy created successfully" : "Policy updated successfully")

      if (isNew) {
        router.push(`/admin/devices/policies/${data.policy.id}`)
      } else {
        setIsEditing(false)
        fetchPolicy()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save policy")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async () => {
    if (!policy) return

    try {
      const response = await fetch(`/api/admin/devices/policies/${policyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !policy.isActive }),
      })

      if (response.ok) {
        toast.success(`Policy ${policy.isActive ? "disabled" : "enabled"} successfully`)
        fetchPolicy()
      }
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/devices/policies/${policyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Policy deleted successfully")
        router.push("/admin/devices/policies")
      } else {
        throw new Error("Failed to delete policy")
      }
    } catch (error) {
      toast.error("Failed to delete policy")
    } finally {
      setShowDeleteDialog(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isNew && !policy) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Policy not found</p>
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
            <Link href="/admin/devices/policies">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? "Create Device Policy" : policy?.name || "Device Policy"}
            </h1>
            {!isNew && (
              <div className="flex items-center gap-2">
                <Badge variant={policy?.isActive ? "default" : "outline"}>
                  {policy?.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="secondary">
                  {policy?.scope.replace(/_/g, " ")}
                </Badge>
              </div>
            )}
          </div>
        </div>
        {!isNew && (
          <div className="flex items-center gap-2">
            <Button
              variant={policy?.isActive ? "secondary" : "default"}
              onClick={handleToggleActive}
            >
              {policy?.isActive ? (
                <>
                  <PowerOff className="h-4 w-4 mr-2" />
                  Disable
                </>
              ) : (
                <>
                  <Power className="h-4 w-4 mr-2" />
                  Enable
                </>
              )}
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <ConfirmationDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              title="Delete Policy"
              description="Are you sure you want to delete this policy? This action cannot be undone."
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={handleDelete}
            />
          </div>
        )}
      </div>

      {isNew || isEditing ? (
        // Edit/Create Form
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isNew ? "Policy Details" : "Edit Policy"}</CardTitle>
              {!isNew && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Policy Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Enterprise Device Requirements"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this policy enforces..."
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Scope</Label>
                  <Select
                    value={editForm.scope}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, scope: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scopeOptions.map((scope) => (
                        <SelectItem key={scope.value} value={scope.value}>
                          {scope.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority (higher = first)</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={editForm.priority}
                    onChange={(e) =>
                      setEditForm({ ...editForm, priority: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Device Requirements */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Device Requirements</h3>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Require Encryption
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Device must have storage encryption enabled
                    </p>
                  </div>
                  <Switch
                    checked={editForm.requireEncryption}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, requireEncryption: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      Require Passcode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Device must have a passcode/PIN configured
                    </p>
                  </div>
                  <Switch
                    checked={editForm.requirePasscode}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, requirePasscode: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Fingerprint className="h-4 w-4" />
                      Require Biometric
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Device must have biometric authentication enabled
                    </p>
                  </div>
                  <Switch
                    checked={editForm.requireBiometric}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, requireBiometric: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Require MDM
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Device must be enrolled in MDM
                    </p>
                  </div>
                  <Switch
                    checked={editForm.requireMDM}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, requireMDM: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Enforcement Actions */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Enforcement Actions</h3>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Block on Violation
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Block access when device is non-compliant
                    </p>
                  </div>
                  <Switch
                    checked={editForm.blockOnViolation}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, blockOnViolation: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Wipe on Violation
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Remote wipe device data on violation (use with caution)
                    </p>
                  </div>
                  <Switch
                    checked={editForm.wipeOnViolation}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, wipeOnViolation: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notify on Violation</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notification when policy is violated
                    </p>
                  </div>
                  <Switch
                    checked={editForm.notifyOnViolation}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, notifyOnViolation: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={editForm.isActive}
                  onCheckedChange={(checked) =>
                    setEditForm({ ...editForm, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">
                  {isNew ? "Enable policy immediately" : "Policy is active"}
                </Label>
              </div>
            </div>

            {isNew && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" asChild>
                  <Link href="/admin/devices/policies">Cancel</Link>
                </Button>
                <Button onClick={handleSave} disabled={isSaving || !editForm.name}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Policy"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // View Mode
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="enforcement">Enforcement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Badge variant={policy?.isActive ? "default" : "outline"}>
                    {policy?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scope</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">
                    {policy?.scope.replace(/_/g, " ")}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Priority</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{policy?.priority}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Created</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">
                    {policy?.createdAt
                      ? new Date(policy.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Policy Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Policy Details</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{policy?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium max-w-[60%] text-right">
                    {policy?.description || "No description"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scope</span>
                  <Badge variant="secondary">
                    {policy?.scope.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority</span>
                  <span className="font-medium">{policy?.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created By</span>
                  <span className="font-mono text-sm">
                    {policy?.createdBy || "System"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">
                    {policy?.updatedAt
                      ? new Date(policy.updatedAt).toLocaleString()
                      : "Unknown"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Requirements</CardTitle>
                <CardDescription>
                  Requirements that devices must meet to be compliant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span>Require Encryption</span>
                  </div>
                  <Badge variant={policy?.requireEncryption ? "default" : "secondary"}>
                    {policy?.requireEncryption ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Required
                      </>
                    ) : (
                      "Not Required"
                    )}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span>Require Passcode</span>
                  </div>
                  <Badge variant={policy?.requirePasscode ? "default" : "secondary"}>
                    {policy?.requirePasscode ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Required
                      </>
                    ) : (
                      "Not Required"
                    )}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-muted-foreground" />
                    <span>Require Biometric</span>
                  </div>
                  <Badge variant={policy?.requireBiometric ? "default" : "secondary"}>
                    {policy?.requireBiometric ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Required
                      </>
                    ) : (
                      "Not Required"
                    )}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span>Require MDM</span>
                  </div>
                  <Badge variant={policy?.requireMDM ? "default" : "secondary"}>
                    {policy?.requireMDM ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Required
                      </>
                    ) : (
                      "Not Required"
                    )}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Platform Restrictions */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Restrictions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allowed Platforms</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {policy?.allowedPlatforms && policy.allowedPlatforms.length > 0 ? (
                      policy.allowedPlatforms.map((platform) => (
                        <Badge key={platform} variant="outline">
                          {platform}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">All platforms</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blocked Platforms</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {policy?.blockedPlatforms && policy.blockedPlatforms.length > 0 ? (
                      policy.blockedPlatforms.map((platform) => (
                        <Badge key={platform} variant="destructive">
                          {platform}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enforcement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enforcement Actions</CardTitle>
                <CardDescription>
                  Actions taken when a device violates this policy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Block on Violation</p>
                    <p className="text-sm text-muted-foreground">
                      Block access when device is non-compliant
                    </p>
                  </div>
                  <Badge
                    variant={policy?.blockOnViolation ? "destructive" : "secondary"}
                  >
                    {policy?.blockOnViolation ? (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Enabled
                      </>
                    ) : (
                      "Disabled"
                    )}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-destructive">Wipe on Violation</p>
                    <p className="text-sm text-muted-foreground">
                      Remote wipe device data on violation
                    </p>
                  </div>
                  <Badge
                    variant={policy?.wipeOnViolation ? "destructive" : "secondary"}
                  >
                    {policy?.wipeOnViolation ? (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Enabled
                      </>
                    ) : (
                      "Disabled"
                    )}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Notify on Violation</p>
                    <p className="text-sm text-muted-foreground">
                      Send notification when policy is violated
                    </p>
                  </div>
                  <Badge variant={policy?.notifyOnViolation ? "default" : "secondary"}>
                    {policy?.notifyOnViolation ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enabled
                      </>
                    ) : (
                      "Disabled"
                    )}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {policy?.wipeOnViolation && (
              <Card className="border-destructive bg-destructive/10">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium text-destructive">Warning: Wipe on Violation Enabled</p>
                      <p className="text-sm text-muted-foreground">
                        This policy will remotely wipe device data when violations occur.
                        Use with extreme caution.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
