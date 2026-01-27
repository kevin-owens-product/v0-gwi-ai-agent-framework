"use client"

import { useEffect, useState } from "react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Database,
  Timer,
  Save,
  CheckCircle,
  XCircle,
  Building,
  Trash2,
  Play,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface RetentionPolicy {
  id: string
  name: string
  description: string | null
  dataType: string
  retentionDays: number
  retentionPeriod: string
  scope: string
  targetOrgs: string[]
  targetPlans: string[]
  deleteAction: string
  isActive: boolean
  lastRun: string | null
  nextRun: string | null
  daysUntilNextRun: number | null
  targetOrganizations: Array<{ id: string; name: string; slug: string }>
  createdBy: string
  createdAt: string
  updatedAt: string
}

const DATA_TYPES = [
  { value: "AGENT_RUNS", label: "Agent Runs" },
  { value: "AUDIT_LOGS", label: "Audit Logs" },
  { value: "USER_SESSIONS", label: "User Sessions" },
  { value: "TEMP_FILES", label: "Temp Files" },
  { value: "NOTIFICATIONS", label: "Notifications" },
  { value: "ANALYTICS", label: "Analytics" },
]

const SCOPES = [
  { value: "PLATFORM", label: "Platform-wide" },
  { value: "ORGANIZATION", label: "Organization" },
  { value: "PLAN", label: "By Plan" },
]

const DELETE_ACTIONS = [
  { value: "SOFT_DELETE", label: "Soft Delete" },
  { value: "HARD_DELETE", label: "Hard Delete" },
  { value: "ARCHIVE", label: "Archive" },
]

export default function RetentionPolicyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [policy, setPolicy] = useState<RetentionPolicy | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dataType: "",
    retentionDays: 90,
    scope: "",
    deleteAction: "",
    isActive: true,
  })

  useEffect(() => {
    if (params.id) {
      fetchPolicy()
    }
  }, [params.id])

  const fetchPolicy = async () => {
    try {
      const response = await fetch(`/api/admin/compliance/retention-policies/${params.id}`, {
        credentials: "include",
      })
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        throw new Error("Policy not found")
      }
      const data = await response.json()
      setPolicy(data.policy)
      setFormData({
        name: data.policy.name,
        description: data.policy.description || "",
        dataType: data.policy.dataType,
        retentionDays: data.policy.retentionDays,
        scope: data.policy.scope,
        deleteAction: data.policy.deleteAction,
        isActive: data.policy.isActive,
      })
    } catch (error) {
      console.error("Failed to fetch policy:", error)
      toast.error("Failed to fetch retention policy")
      router.push("/admin/compliance/retention-policies")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!policy) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/compliance/retention-policies/${policy.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update policy")
      }

      toast.success("Retention policy updated successfully")
      fetchPolicy()
    } catch (error) {
      toast.error("Failed to update retention policy")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!policy) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/compliance/retention-policies/${policy.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete policy")
      }

      toast.success("Retention policy deleted")
      router.push("/admin/compliance/retention-policies")
    } catch (error) {
      toast.error("Failed to delete retention policy")
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleToggleActive = async () => {
    if (!policy) return

    try {
      const response = await fetch(`/api/admin/compliance/retention-policies/${policy.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !policy.isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update policy status")
      }

      toast.success(`Policy ${policy.isActive ? "deactivated" : "activated"} successfully`)
      fetchPolicy()
    } catch (error) {
      toast.error("Failed to update policy status")
    }
  }

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case "PLATFORM":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Platform</Badge>
      case "ORGANIZATION":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Organization</Badge>
      case "PLAN":
        return <Badge variant="outline" className="border-green-500 text-green-500">Plan</Badge>
      default:
        return <Badge variant="outline">{scope}</Badge>
    }
  }

  const getDeleteActionBadge = (action: string) => {
    switch (action) {
      case "SOFT_DELETE":
        return <Badge variant="secondary">Soft Delete</Badge>
      case "HARD_DELETE":
        return <Badge variant="destructive">Hard Delete</Badge>
      case "ARCHIVE":
        return <Badge variant="outline">Archive</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!policy) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Retention policy not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/compliance/retention-policies")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Policies
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/compliance/retention-policies")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Database className="h-6 w-6 text-purple-500" />
              {policy.name}
            </h1>
            <p className="text-sm text-muted-foreground">ID: {policy.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getScopeBadge(policy.scope)}
          {policy.isActive ? (
            <Badge className="bg-green-500">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details / Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Details</CardTitle>
              <CardDescription>
                Configure the retention policy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Policy Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Type</Label>
                  <Select
                    value={formData.dataType}
                    onValueChange={(value) => setFormData({ ...formData, dataType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retentionDays">Retention Days</Label>
                  <Input
                    id="retentionDays"
                    type="number"
                    min="-1"
                    value={formData.retentionDays}
                    onChange={(e) => setFormData({ ...formData, retentionDays: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">Use -1 for forever</p>
                </div>
                <div className="space-y-2">
                  <Label>Scope</Label>
                  <Select
                    value={formData.scope}
                    onValueChange={(value) => setFormData({ ...formData, scope: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCOPES.map((scope) => (
                        <SelectItem key={scope.value} value={scope.value}>
                          {scope.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Delete Action</Label>
                  <Select
                    value={formData.deleteAction}
                    onValueChange={(value) => setFormData({ ...formData, deleteAction: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DELETE_ACTIONS.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Policy Active</Label>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Execution Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Execution Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Last Run</Label>
                  <p className="mt-1">
                    {policy.lastRun
                      ? new Date(policy.lastRun).toLocaleString()
                      : "Never executed"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Next Run</Label>
                  <p className="mt-1">
                    {policy.nextRun ? (
                      <span className="flex items-center gap-2">
                        {new Date(policy.nextRun).toLocaleString()}
                        {policy.daysUntilNextRun !== null && (
                          <Badge variant="outline">
                            {policy.daysUntilNextRun <= 0 ? "Today" : `${policy.daysUntilNextRun} days`}
                          </Badge>
                        )}
                      </span>
                    ) : (
                      "Not scheduled"
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Retention Period</Label>
                  <p className="mt-1 flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    {policy.retentionPeriod}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Delete Action</Label>
                  <div className="mt-1">{getDeleteActionBadge(policy.deleteAction)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Organizations */}
          {policy.targetOrganizations && policy.targetOrganizations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Target Organizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {policy.targetOrganizations.map((org) => (
                    <Badge key={org.id} variant="outline">
                      {org.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleToggleActive}
              >
                {policy.isActive ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Deactivate Policy
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activate Policy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Deleting..." : "Delete Policy"}
              </Button>
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <ConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title="Delete Retention Policy"
            description="Are you sure you want to delete this retention policy? This action cannot be undone."
            confirmLabel="Delete"
            onConfirm={handleDelete}
            variant="destructive"
          />

          <Card>
            <CardHeader>
              <CardTitle>Policy Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p>{new Date(policy.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p>{new Date(policy.updatedAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Created By</Label>
                <p className="font-mono text-xs">{policy.createdBy}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
