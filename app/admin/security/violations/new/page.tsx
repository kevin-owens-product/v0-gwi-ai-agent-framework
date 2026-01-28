"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
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
import { ArrowLeft, Save, Loader2, AlertTriangle } from "lucide-react"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
import { useAdmin } from "@/components/providers/admin-provider"

interface SecurityPolicy {
  id: string
  name: string
  type: string
}

const violationTypeKeys = [
  "WEAK_PASSWORD",
  "FAILED_MFA",
  "SUSPICIOUS_LOGIN",
  "IP_BLOCKED",
  "UNAUTHORIZED_ACCESS",
  "DATA_EXFILTRATION",
  "FILE_POLICY_VIOLATION",
  "EXTERNAL_SHARING_BLOCKED",
  "SESSION_VIOLATION",
  "DEVICE_NOT_COMPLIANT",
  "API_ABUSE",
  "RATE_LIMIT_EXCEEDED",
  "BRUTE_FORCE_DETECTED",
  "IMPOSSIBLE_TRAVEL",
  "ANOMALOUS_BEHAVIOR",
] as const

const severityKeys = ["INFO", "WARNING", "CRITICAL"] as const

const statusKeys = ["OPEN", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE", "ESCALATED"] as const

export default function NewSecurityViolationPage() {
  const t = useTranslations("admin.security.violations")
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)
  const [policies, setPolicies] = useState<SecurityPolicy[]>([])
  const [loadingPolicies, setLoadingPolicies] = useState(true)

  const [formData, setFormData] = useState({
    policyId: "",
    violationType: "SUSPICIOUS_LOGIN",
    severity: "WARNING",
    description: "",
    status: "OPEN",
    ipAddress: "",
    userAgent: "",
    orgId: "",
    userId: "",
    resourceType: "",
    resourceId: "",
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.permissions.includes("security:write")

  useEffect(() => {
    async function fetchPolicies() {
      try {
        const response = await fetch("/api/admin/security/policies")
        if (response.ok) {
          const data = await response.json()
          setPolicies(data.policies || [])
        }
      } catch (error) {
        console.error("Failed to fetch policies:", error)
        showErrorToast(t("toast.loadPoliciesFailed"))
      } finally {
        setLoadingPolicies(false)
      }
    }
    fetchPolicies()
  }, [])

  const handleCreate = async () => {
    if (!formData.policyId || !formData.violationType || !formData.description) {
      showErrorToast(t("validation.requiredFields"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/security/violations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyId: formData.policyId,
          violationType: formData.violationType,
          severity: formData.severity,
          description: formData.description,
          status: formData.status,
          ipAddress: formData.ipAddress || undefined,
          userAgent: formData.userAgent || undefined,
          orgId: formData.orgId || undefined,
          userId: formData.userId || undefined,
          resourceType: formData.resourceType || undefined,
          resourceId: formData.resourceId || undefined,
          details: {},
        }),
      })

      if (response.ok) {
        const data = await response.json()
        showSuccessToast(t("toast.createSuccess"))
        router.push(`/admin/security/violations/${data.violation.id}`)
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("toast.createFailed"))
      }
    } catch (error) {
      console.error("Failed to create violation:", error)
      showErrorToast(t("toast.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("noPermissionCreate")}</p>
        <Link href="/admin/security/violations">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToViolations")}
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
          <Link href="/admin/security/violations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("actions.back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              {t("new.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("new.description")}
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          disabled={isSaving || !formData.policyId || !formData.description}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("actions.creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("actions.recordViolation")}
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("form.violationDetails")}</CardTitle>
          <CardDescription>
            {t("form.violationDetailsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t("form.securityPolicy")} *</Label>
              <Select
                value={formData.policyId}
                onValueChange={(value) => setFormData({ ...formData, policyId: value })}
                disabled={loadingPolicies}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPolicies ? t("form.loadingPolicies") : t("form.selectPolicy")} />
                </SelectTrigger>
                <SelectContent>
                  {policies.map((policy) => (
                    <SelectItem key={policy.id} value={policy.id}>
                      {policy.name} ({policy.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("form.policyHint")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("form.violationType")} *</Label>
                <Select
                  value={formData.violationType}
                  onValueChange={(value) => setFormData({ ...formData, violationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {violationTypeKeys.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`violationTypes.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>{t("form.severity")} *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {severityKeys.map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {t(`severities.${severity}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">{t("form.description")} *</Label>
              <Textarea
                id="description"
                placeholder={t("form.descriptionPlaceholder")}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label>{t("form.initialStatus")}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusKeys.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`statuses.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("form.sourceInformation")}</CardTitle>
          <CardDescription>
            {t("form.sourceInformationDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ipAddress">{t("form.ipAddress")}</Label>
              <Input
                id="ipAddress"
                placeholder={t("form.ipAddressPlaceholder")}
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="userAgent">{t("form.userAgent")}</Label>
              <Input
                id="userAgent"
                placeholder={t("form.userAgentPlaceholder")}
                value={formData.userAgent}
                onChange={(e) => setFormData({ ...formData, userAgent: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context */}
      <Card>
        <CardHeader>
          <CardTitle>{t("form.additionalContext")}</CardTitle>
          <CardDescription>
            {t("form.additionalContextDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="orgId">{t("form.organizationId")}</Label>
              <Input
                id="orgId"
                placeholder={t("form.organizationIdPlaceholder")}
                value={formData.orgId}
                onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="userId">{t("form.userId")}</Label>
              <Input
                id="userId"
                placeholder={t("form.userIdPlaceholder")}
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="resourceType">{t("form.resourceType")}</Label>
              <Input
                id="resourceType"
                placeholder={t("form.resourceTypePlaceholder")}
                value={formData.resourceType}
                onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="resourceId">{t("form.resourceId")}</Label>
              <Input
                id="resourceId"
                placeholder={t("form.resourceIdPlaceholder")}
                value={formData.resourceId}
                onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
