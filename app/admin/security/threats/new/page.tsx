"use client"

import { useState } from "react"
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
import { ArrowLeft, Save, Loader2, Zap } from "lucide-react"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
import { useAdmin } from "@/components/providers/admin-provider"

const threatTypeValues = [
  "BRUTE_FORCE",
  "CREDENTIAL_STUFFING",
  "PHISHING_ATTEMPT",
  "ACCOUNT_TAKEOVER",
  "DATA_BREACH",
  "MALWARE_DETECTED",
  "RANSOMWARE",
  "DLP_VIOLATION",
  "INSIDER_THREAT",
  "API_ABUSE",
  "BOT_ATTACK",
  "DDOS_ATTEMPT",
  "SUSPICIOUS_ACTIVITY",
  "COMPLIANCE_VIOLATION",
] as const

const severityValues = ["INFO", "WARNING", "CRITICAL"] as const

const statusValues = ["ACTIVE", "CONTAINED", "MITIGATED", "RESOLVED", "FALSE_POSITIVE"] as const

export default function NewThreatEventPage() {
  const t = useTranslations("admin.security.threats")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    type: "SUSPICIOUS_ACTIVITY",
    severity: "WARNING",
    source: "",
    description: "",
    status: "ACTIVE",
    orgId: "",
    userId: "",
    indicators: "",
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.permissions.includes("security:write")

  const handleCreate = async () => {
    if (!formData.type || !formData.source || !formData.description) {
      showErrorToast(t("new.errors.requiredFields"))
      return
    }

    setIsSaving(true)
    try {
      // Parse indicators from comma-separated string
      const indicatorsArray = formData.indicators
        ? formData.indicators.split(",").map((i) => i.trim()).filter(Boolean)
        : []

      const response = await fetch("/api/admin/security/threats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          severity: formData.severity,
          source: formData.source,
          description: formData.description,
          status: formData.status,
          orgId: formData.orgId || undefined,
          userId: formData.userId || undefined,
          indicators: indicatorsArray,
          details: {},
        }),
      })

      if (response.ok) {
        const data = await response.json()
        showSuccessToast(t("new.messages.createSuccess"))
        router.push(`/admin/security/threats/${data.threat.id}`)
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("new.errors.createFailed"))
      }
    } catch (error) {
      console.error("Failed to create threat:", error)
      showErrorToast(t("new.errors.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("new.noPermission")}</p>
        <Link href="/admin/security/threats">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("new.backToThreats")}
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
          <Link href="/admin/security/threats">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-orange-500" />
              {t("new.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("new.subtitle")}
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          disabled={isSaving || !formData.source || !formData.description}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {tCommon("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("new.logThreat")}
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("new.threatDetails")}</CardTitle>
          <CardDescription>
            {t("new.threatDetailsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("new.threatType")} *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {threatTypeValues.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`types.${type.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>{t("new.severity")} *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {severityValues.map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {t(`severities.${severity.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="source">{t("new.source")} *</Label>
              <Input
                id="source"
                placeholder={t("new.sourcePlaceholder")}
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {t("new.sourceHint")}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">{t("new.description")} *</Label>
              <Textarea
                id="description"
                placeholder={t("new.descriptionPlaceholder")}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label>{t("new.initialStatus")}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusValues.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`statuses.${status === "FALSE_POSITIVE" ? "falsePositive" : status.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="indicators">{t("new.iocs")}</Label>
              <Textarea
                id="indicators"
                placeholder={t("new.iocsPlaceholder")}
                value={formData.indicators}
                onChange={(e) => setFormData({ ...formData, indicators: e.target.value })}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                {t("new.iocsHint")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional Context */}
      <Card>
        <CardHeader>
          <CardTitle>{t("new.additionalContext")}</CardTitle>
          <CardDescription>
            {t("new.additionalContextDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="orgId">{t("new.organizationId")}</Label>
              <Input
                id="orgId"
                placeholder={t("new.organizationIdPlaceholder")}
                value={formData.orgId}
                onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {t("new.organizationIdHint")}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="userId">{t("new.userId")}</Label>
              <Input
                id="userId"
                placeholder={t("new.userIdPlaceholder")}
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {t("new.userIdHint")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
