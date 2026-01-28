"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  ArrowLeft,
  Shield,
  Save,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  Key,
  Clock,
  Smartphone,
  Globe,
  FileText,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

interface SecurityViolation {
  id: string
  violationType: string
  severity: string
  description: string
  status: string
  createdAt: string
}

interface SecurityPolicy {
  id: string
  name: string
  description: string | null
  type: string
  scope: string
  isActive: boolean
  enforcementMode: string
  priority: number
  targetOrgs: string[]
  targetPlans: string[]
  settings: Record<string, unknown>
  violations: SecurityViolation[]
  _count: { violations: number }
  createdAt: string
  updatedAt: string
}

const policyTypeIcons: Record<string, React.ReactNode> = {
  PASSWORD: <Key className="h-4 w-4" />,
  SESSION: <Clock className="h-4 w-4" />,
  MFA: <Smartphone className="h-4 w-4" />,
  IP_ALLOWLIST: <Globe className="h-4 w-4" />,
  DLP: <FileText className="h-4 w-4" />,
  DEVICE_TRUST: <Smartphone className="h-4 w-4" />,
  API_ACCESS: <Key className="h-4 w-4" />,
  DEFAULT: <Shield className="h-4 w-4" />,
}

const policyTypeValues = [
  "PASSWORD",
  "SESSION",
  "MFA",
  "IP_ALLOWLIST",
  "DATA_ACCESS",
  "FILE_SHARING",
  "DLP",
  "ENCRYPTION",
  "DEVICE_TRUST",
  "API_ACCESS",
] as const

const scopeValues = [
  "PLATFORM",
  "ENTERPRISE_ONLY",
  "SPECIFIC_ORGS",
  "SPECIFIC_PLANS",
] as const

const enforcementModeValues = [
  "MONITOR",
  "WARN",
  "ENFORCE",
  "STRICT",
] as const

export default function SecurityPolicyDetailPage() {
  const t = useTranslations("admin.security.policies")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const params = useParams()
  const [policy, setPolicy] = useState<SecurityPolicy | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    scope: "",
    enforcementMode: "",
    priority: 0,
    isActive: true,
  })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchPolicy()
    }
  }, [params.id])

  const fetchPolicy = async () => {
    try {
      const response = await fetch(`/api/admin/security/policies/${params.id}`)
      if (!response.ok) {
        throw new Error("Policy not found")
      }
      const data = await response.json()
      setPolicy(data.policy)
      setFormData({
        name: data.policy.name,
        description: data.policy.description || "",
        type: data.policy.type,
        scope: data.policy.scope,
        enforcementMode: data.policy.enforcementMode,
        priority: data.policy.priority,
        isActive: data.policy.isActive,
      })
    } catch (error) {
      console.error("Failed to fetch policy:", error)
      showErrorToast(t("toast.fetchFailed"))
      router.push("/admin/security/policies")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!policy) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/security/policies/${policy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update policy")
      }

      showSuccessToast(t("toast.policyUpdated"))
      fetchPolicy()
    } catch (error) {
      showErrorToast(t("toast.updateFailed"))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = useCallback(async () => {
    if (!policy) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/security/policies/${policy.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete policy")
      }

      showSuccessToast(t("toast.policyDeleted"))
      router.push("/admin/security/policies")
    } catch (error) {
      showErrorToast(t("toast.deleteFailed"))
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }, [policy, router])

  const handleToggleActive = async () => {
    if (!policy) return

    try {
      const response = await fetch(`/api/admin/security/policies/${policy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !policy.isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update policy status")
      }

      showSuccessToast(policy.isActive ? t("toast.policyDisabled") : t("toast.policyEnabled"))
      fetchPolicy()
    } catch (error) {
      showErrorToast(t("toast.statusUpdateFailed"))
    }
  }

  const getPolicyIcon = (type: string) => policyTypeIcons[type] || policyTypeIcons.DEFAULT

  const getEnforcementBadge = (mode: string) => {
    switch (mode) {
      case "STRICT":
        return <Badge variant="destructive">{mode}</Badge>
      case "ENFORCE":
        return <Badge>{mode}</Badge>
      case "WARN":
        return <Badge variant="default" className="bg-yellow-500">{mode}</Badge>
      case "MONITOR":
        return <Badge variant="secondary">{mode}</Badge>
      default:
        return <Badge variant="outline">{mode}</Badge>
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="destructive">{severity}</Badge>
      case "WARNING":
        return <Badge variant="default" className="bg-yellow-500">{severity}</Badge>
      case "INFO":
        return <Badge variant="secondary">{severity}</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="destructive">{status}</Badge>
      case "RESOLVED":
        return <Badge variant="default" className="bg-green-500">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t("detail.policyNotFound")}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/security/policies")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("detail.backToPolicies")}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/security/policies")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tCommon("back")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {getPolicyIcon(policy.type)}
              {policy.name}
            </h1>
            <p className="text-sm text-muted-foreground">{t("detail.id")}: {policy.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getEnforcementBadge(policy.enforcementMode)}
          {policy.isActive ? (
            <Badge className="bg-green-500">{t("statuses.active")}</Badge>
          ) : (
            <Badge variant="secondary">{t("statuses.inactive")}</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details / Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.policyConfiguration")}</CardTitle>
              <CardDescription>
                {t("detail.configureSettings")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("form.policyName")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("form.policyType")}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {policyTypeValues.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`policyTypes.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("form.description")}</Label>
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
                  <Label>{t("form.scope")}</Label>
                  <Select
                    value={formData.scope}
                    onValueChange={(value) => setFormData({ ...formData, scope: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scopeValues.map((scope) => (
                        <SelectItem key={scope} value={scope}>
                          {t(`scopeOptions.${scope}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("form.enforcementMode")}</Label>
                  <Select
                    value={formData.enforcementMode}
                    onValueChange={(value) => setFormData({ ...formData, enforcementMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {enforcementModeValues.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {t(`enforcementModes.${mode}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">{t("form.priority")}</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  />
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
                  <Label htmlFor="isActive">{t("form.policyActive")}</Label>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? tCommon("saving") : tCommon("saveChanges")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Violations */}
          {policy.violations && policy.violations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  {t("detail.recentViolations")} ({policy._count?.violations || 0} {t("detail.total")})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("table.type")}</TableHead>
                      <TableHead>{t("table.severity")}</TableHead>
                      <TableHead>{t("table.status")}</TableHead>
                      <TableHead>{t("table.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policy.violations.map((violation) => (
                      <TableRow
                        key={violation.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/admin/security/violations/${violation.id}`)}
                      >
                        <TableCell>{violation.violationType.replace(/_/g, " ")}</TableCell>
                        <TableCell>{getSeverityBadge(violation.severity)}</TableCell>
                        <TableCell>{getStatusBadge(violation.status)}</TableCell>
                        <TableCell>{new Date(violation.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => router.push("/admin/security/violations")}
                >
                  {t("detail.viewAllViolations")}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Policy Settings JSON */}
          {policy.settings && Object.keys(policy.settings).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.policySettings")}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto">
                  {JSON.stringify(policy.settings, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.quickActions")}</CardTitle>
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
                    {t("actions.disable")}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t("actions.enable")}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive"
                onClick={handleDeleteClick}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? tCommon("deleting") : t("deletePolicy")}
              </Button>
            </CardContent>
          </Card>

          <ConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title={t("confirmations.deleteTitle")}
            description={t("confirmations.deleteDescription")}
            confirmText={deleting ? tCommon("deleting") : tCommon("delete")}
            onConfirm={handleDeleteConfirm}
            variant="destructive"
          />

          <Card>
            <CardHeader>
              <CardTitle>{t("detail.statistics")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("detail.totalViolations")}</span>
                <Badge variant={policy._count?.violations > 0 ? "destructive" : "secondary"}>
                  {policy._count?.violations || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("detail.priorityLevel")}</span>
                <Badge variant="outline">{policy.priority}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("detail.policyInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-muted-foreground">{t("detail.created")}</Label>
                <p>{new Date(policy.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("detail.lastUpdated")}</Label>
                <p>{new Date(policy.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
