"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  AlertTriangle,
  ArrowLeft,
  Shield,
  Clock,
  User,
  Globe,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Monitor,
  Save,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

interface SecurityViolation {
  id: string
  policyId: string
  orgId: string | null
  userId: string | null
  violationType: string
  severity: string
  description: string
  details: Record<string, unknown>
  ipAddress: string | null
  userAgent: string | null
  resourceType: string | null
  resourceId: string | null
  status: string
  resolvedBy: string | null
  resolvedAt: string | null
  resolution: string | null
  createdAt: string
  policy: {
    id: string
    name: string
    type: string
    scope: string
    enforcementMode: string
  }
}

const statusKeys = ["OPEN", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE", "ESCALATED"] as const

export default function ViolationDetailPage() {
  const t = useTranslations("admin.security.violations")
  const router = useRouter()
  const params = useParams()
  const [violation, setViolation] = useState<SecurityViolation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")
  const [resolution, setResolution] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchViolation()
    }
  }, [params.id])

  const fetchViolation = async () => {
    try {
      const response = await fetch(`/api/admin/security/violations/${params.id}`)
      if (!response.ok) {
        throw new Error("Violation not found")
      }
      const data = await response.json()
      setViolation(data.violation)
      setStatus(data.violation.status)
      setResolution(data.violation.resolution || "")
    } catch (error) {
      console.error("Failed to fetch violation:", error)
      showErrorToast(t("toast.fetchDetailsFailed"))
      router.push("/admin/security/violations")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!violation) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/security/violations/${violation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resolution: resolution || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update violation")
      }

      showSuccessToast(t("toast.updateSuccess"))
      fetchViolation()
    } catch (error) {
      showErrorToast(t("toast.updateFailed"))
    } finally {
      setSaving(false)
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="destructive" className="text-lg px-3 py-1">{t(`severities.${severity}`)}</Badge>
      case "WARNING":
        return <Badge variant="default" className="bg-yellow-500 text-lg px-3 py-1">{t(`severities.${severity}`)}</Badge>
      case "INFO":
        return <Badge variant="secondary" className="text-lg px-3 py-1">{t(`severities.${severity}`)}</Badge>
      default:
        return <Badge variant="outline" className="text-lg px-3 py-1">{t(`severities.${severity}`, { defaultValue: severity })}</Badge>
    }
  }

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "OPEN":
        return <Badge variant="destructive">{t(`statuses.${s}`)}</Badge>
      case "INVESTIGATING":
        return <Badge variant="default" className="bg-blue-500">{t(`statuses.${s}`)}</Badge>
      case "RESOLVED":
        return <Badge variant="default" className="bg-green-500">{t(`statuses.${s}`)}</Badge>
      case "FALSE_POSITIVE":
        return <Badge variant="secondary">{t(`statuses.${s}`)}</Badge>
      case "ESCALATED":
        return <Badge variant="destructive" className="bg-purple-500">{t(`statuses.${s}`)}</Badge>
      default:
        return <Badge variant="outline">{t(`statuses.${s}`, { defaultValue: s })}</Badge>
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

  if (!violation) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t("notFound")}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/security/violations")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToViolations")}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/security/violations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("actions.back")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              {t("detail.title")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("detail.id")}: {violation.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getSeverityBadge(violation.severity)}
          {getStatusBadge(violation.status)}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.violationDetails")}</CardTitle>
              <CardDescription>
                {t(`violationTypes.${violation.violationType}`)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">{t("detail.description")}</Label>
                <p className="mt-1">{violation.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t("detail.ipAddress")}
                  </Label>
                  <p className="mt-1 font-mono">{violation.ipAddress || t("common.na")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    {t("detail.userAgent")}
                  </Label>
                  <p className="mt-1 text-sm truncate">{violation.userAgent || t("common.na")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("detail.userId")}
                  </Label>
                  <p className="mt-1 font-mono text-sm">{violation.userId || t("common.na")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {t("detail.organizationId")}
                  </Label>
                  <p className="mt-1 font-mono text-sm">{violation.orgId || t("detail.platformWide")}</p>
                </div>
              </div>

              {violation.resourceType && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {t("detail.resourceType")}
                      </Label>
                      <p className="mt-1">{violation.resourceType}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t("detail.resourceId")}</Label>
                      <p className="mt-1 font-mono text-sm">{violation.resourceId || t("common.na")}</p>
                    </div>
                  </div>
                </>
              )}

              {violation.details && Object.keys(violation.details).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground">{t("detail.additionalDetails")}</Label>
                    <pre className="mt-2 p-4 bg-muted rounded-lg text-sm overflow-auto">
                      {JSON.stringify(violation.details, null, 2)}
                    </pre>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {t("detail.occurredAt")}: {new Date(violation.createdAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Policy Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("detail.relatedPolicy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t("detail.policyName")}</Label>
                  <p className="mt-1 font-medium">{violation.policy?.name || t("common.na")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("detail.policyType")}</Label>
                  <Badge variant="outline" className="mt-1">
                    {violation.policy?.type ? t(`policyTypes.${violation.policy.type}`, { defaultValue: violation.policy.type.replace(/_/g, " ") }) : t("common.na")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("detail.scope")}</Label>
                  <Badge variant="secondary" className="mt-1">
                    {violation.policy?.scope ? t(`policyScopes.${violation.policy.scope}`, { defaultValue: violation.policy.scope.replace(/_/g, " ") }) : t("common.na")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("detail.enforcementMode")}</Label>
                  <Badge
                    variant={
                      violation.policy?.enforcementMode === "STRICT"
                        ? "destructive"
                        : violation.policy?.enforcementMode === "ENFORCE"
                        ? "default"
                        : "secondary"
                    }
                    className="mt-1"
                  >
                    {violation.policy?.enforcementMode ? t(`enforcementModes.${violation.policy.enforcementMode}`, { defaultValue: violation.policy.enforcementMode }) : t("common.na")}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push(`/admin/security/policies`)}
              >
                {t("actions.viewPolicy")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resolution Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("resolution.title")}</CardTitle>
              <CardDescription>{t("resolution.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("resolution.status")}</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t("resolution.selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    {statusKeys.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`statuses.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t("resolution.notes")}</Label>
                <Textarea
                  className="mt-2"
                  placeholder={t("resolution.notesPlaceholder")}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? t("actions.saving") : t("actions.saveChanges")}
              </Button>
            </CardContent>
          </Card>

          {violation.resolvedAt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="h-5 w-5" />
                  {t("resolution.info")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-muted-foreground">{t("resolution.resolvedBy")}</Label>
                  <p className="text-sm">{violation.resolvedBy || t("resolution.system")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("resolution.resolvedAt")}</Label>
                  <p className="text-sm">
                    {new Date(violation.resolvedAt).toLocaleString()}
                  </p>
                </div>
                {violation.resolution && (
                  <div>
                    <Label className="text-muted-foreground">{t("resolution.notes")}</Label>
                    <p className="text-sm mt-1">{violation.resolution}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("quickActions.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setStatus("INVESTIGATING")
                  handleSave()
                }}
                disabled={status === "INVESTIGATING"}
              >
                <Clock className="h-4 w-4 mr-2" />
                {t("quickActions.startInvestigation")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setStatus("RESOLVED")
                  handleSave()
                }}
                disabled={status === "RESOLVED"}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {t("quickActions.markResolved")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setStatus("FALSE_POSITIVE")
                  handleSave()
                }}
                disabled={status === "FALSE_POSITIVE"}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t("quickActions.markFalsePositive")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive"
                onClick={() => {
                  setStatus("ESCALATED")
                  handleSave()
                }}
                disabled={status === "ESCALATED"}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {t("quickActions.escalate")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
