"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
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

export default function RetentionPolicyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const t = useTranslations("admin.compliance.retentionPolicies.detail")
  const tMain = useTranslations("admin.compliance.retentionPolicies")
  const tCommon = useTranslations("common")
  
  const DATA_TYPES = [
    { value: "AGENT_RUNS", label: tMain("dataTypes.agentRuns") },
    { value: "AUDIT_LOGS", label: tMain("dataTypes.auditLogs") },
    { value: "USER_SESSIONS", label: tMain("dataTypes.userSessions") },
    { value: "TEMP_FILES", label: tMain("dataTypes.tempFiles") },
    { value: "NOTIFICATIONS", label: tMain("dataTypes.notifications") },
    { value: "ANALYTICS", label: tMain("dataTypes.analytics") },
  ]

  const SCOPES = [
    { value: "PLATFORM", label: tMain("filters.platformWide") },
    { value: "ORGANIZATION", label: tMain("filters.organization") },
    { value: "PLAN", label: tMain("filters.byPlan") },
  ]

  const DELETE_ACTIONS = [
    { value: "SOFT_DELETE", label: tMain("deleteAction.softDelete") },
    { value: "HARD_DELETE", label: tMain("deleteAction.hardDelete") },
    { value: "ARCHIVE", label: tMain("deleteAction.archive") },
  ]
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
  }, [params.id, fetchPolicy])

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
        throw new Error(t("messages.fetchFailed"))
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
      toast.error(t("messages.fetchFailed"))
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
        throw new Error(t("messages.updateFailed"))
      }

      toast.success(t("messages.updateSuccess"))
      fetchPolicy()
    } catch {
      toast.error(t("messages.updateFailed"))
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
        throw new Error(t("messages.deleteFailed"))
      }

      toast.success(t("messages.deleteSuccess"))
      router.push("/admin/compliance/retention-policies")
    } catch {
      toast.error(t("messages.deleteFailed"))
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
        throw new Error(t("messages.updateStatusFailed"))
      }

      toast.success(policy.isActive ? t("messages.deactivateSuccess") : t("messages.activateSuccess"))
      fetchPolicy()
    } catch {
      toast.error(t("messages.updateStatusFailed"))
    }
  }

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case "PLATFORM":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">{tMain("scope.platform")}</Badge>
      case "ORGANIZATION":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">{tMain("scope.organization")}</Badge>
      case "PLAN":
        return <Badge variant="outline" className="border-green-500 text-green-500">{tMain("scope.plan")}</Badge>
      default:
        return <Badge variant="outline">{scope}</Badge>
    }
  }

  const getDeleteActionBadge = (action: string) => {
    switch (action) {
      case "SOFT_DELETE":
        return <Badge variant="secondary">{tMain("deleteAction.softDelete")}</Badge>
      case "HARD_DELETE":
        return <Badge variant="destructive">{tMain("deleteAction.hardDelete")}</Badge>
      case "ARCHIVE":
        return <Badge variant="outline">{tMain("deleteAction.archive")}</Badge>
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
        <p className="text-muted-foreground">{t("notFound")}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/compliance/retention-policies")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToPolicies")}
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
            {t("back")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Database className="h-6 w-6 text-purple-500" />
              {policy.name}
            </h1>
            <p className="text-sm text-muted-foreground">{t("policyId", { id: policy.id })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getScopeBadge(policy.scope)}
          {policy.isActive ? (
            <Badge className="bg-green-500">{tMain("status.active")}</Badge>
          ) : (
            <Badge variant="secondary">{tMain("status.inactive")}</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details / Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.policyDetails")}</CardTitle>
              <CardDescription>
                {t("sections.detailsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("fields.name")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("fields.dataType")}</Label>
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
                <Label htmlFor="description">{t("fields.description")}</Label>
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
                  <Label htmlFor="retentionDays">{t("fields.retentionDays")}</Label>
                  <Input
                    id="retentionDays"
                    type="number"
                    min="-1"
                    value={formData.retentionDays}
                    onChange={(e) => setFormData({ ...formData, retentionDays: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">{tMain("hints.retentionDaysForever")}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t("fields.scope")}</Label>
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
                  <Label>{t("fields.deleteAction")}</Label>
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
                  <Label htmlFor="isActive">{t("fields.isActive")}</Label>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? t("save.saving") : t("save.saveChanges")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Execution Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t("sections.executionSchedule")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t("fields.lastRun")}</Label>
                  <p className="mt-1">
                    {policy.lastRun
                      ? new Date(policy.lastRun).toLocaleString()
                      : t("fields.neverExecuted")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("fields.nextRun")}</Label>
                  <p className="mt-1">
                    {policy.nextRun ? (
                      <span className="flex items-center gap-2">
                        {new Date(policy.nextRun).toLocaleString()}
                        {policy.daysUntilNextRun !== null && (
                          <Badge variant="outline">
                            {policy.daysUntilNextRun <= 0 ? tMain("nextRun.today") : tMain("nextRun.days", { days: policy.daysUntilNextRun })}
                          </Badge>
                        )}
                      </span>
                    ) : (
                      t("fields.notScheduled")
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("fields.retentionPeriod")}</Label>
                  <p className="mt-1 flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    {policy.retentionPeriod}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("fields.deleteAction")}</Label>
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
                  {t("sections.targetOrganizations")}
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
              <CardTitle>{t("quickActions.title")}</CardTitle>
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
                    {t("quickActions.deactivatePolicy")}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t("quickActions.activatePolicy")}
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
                {deleting ? t("quickActions.deleting") : t("quickActions.deletePolicy")}
              </Button>
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <ConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title={t("deleteDialog.title")}
            description={t("deleteDialog.description")}
            confirmText={tCommon("delete")}
            onConfirm={handleDelete}
            variant="destructive"
          />

          <Card>
            <CardHeader>
              <CardTitle>{t("policyInfo.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-muted-foreground">{t("fields.created")}</Label>
                <p>{new Date(policy.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("fields.lastUpdated")}</Label>
                <p>{new Date(policy.updatedAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("fields.createdBy")}</Label>
                <p className="font-mono text-xs">{policy.createdBy}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
