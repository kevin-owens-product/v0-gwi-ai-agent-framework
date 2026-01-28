"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { showErrorToast } from "@/lib/toast-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
} from "lucide-react"
import Link from "next/link"

export default function NewRetentionPolicyPage() {
  const router = useRouter()
  const t = useTranslations("admin.compliance.retentionPolicies.new")
  const tMain = useTranslations("admin.compliance.retentionPolicies")
  const [isSaving, setIsSaving] = useState(false)
  
  const DATA_TYPE_OPTIONS = [
    { value: "AGENT_RUNS", label: tMain("dataTypes.agentRuns") },
    { value: "AUDIT_LOGS", label: tMain("dataTypes.auditLogs") },
    { value: "USER_SESSIONS", label: tMain("dataTypes.userSessions") },
    { value: "TEMP_FILES", label: tMain("dataTypes.tempFiles") },
    { value: "NOTIFICATIONS", label: tMain("dataTypes.notifications") },
    { value: "ANALYTICS", label: tMain("dataTypes.analytics") },
  ]

  const SCOPE_OPTIONS = [
    { value: "PLATFORM", label: tMain("filters.platformWide") },
    { value: "ORGANIZATION", label: tMain("filters.organization") },
    { value: "PLAN", label: tMain("filters.byPlan") },
  ]

  const DELETE_ACTION_OPTIONS = [
    { value: "SOFT_DELETE", label: tMain("deleteAction.softDelete") },
    { value: "HARD_DELETE", label: tMain("deleteAction.hardDelete") },
    { value: "ARCHIVE", label: tMain("deleteAction.archive") },
  ]
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dataType: "AGENT_RUNS",
    retentionDays: 90,
    scope: "PLATFORM",
    deleteAction: "SOFT_DELETE",
    isActive: true,
  })

  const handleCreate = async () => {
    if (!formData.name || !formData.dataType) {
      showErrorToast(t("validation.nameAndDataTypeRequired"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/compliance/retention-policies", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          dataType: formData.dataType,
          retentionDays: formData.retentionDays,
          scope: formData.scope,
          deleteAction: formData.deleteAction,
          isActive: formData.isActive,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || t("errors.createFailed"))
      }

      const data = await response.json()
      router.push(`/admin/compliance/retention-policies/${data.policy?.id || ""}`)
    } catch (error) {
      console.error("Failed to create retention policy:", error)
      showErrorToast(error instanceof Error ? error.message : t("errors.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const getRetentionPeriodLabel = (days: number) => {
    if (days === -1) return tMain("periods.forever")
    if (days === 0) return tMain("periods.immediate")
    if (days < 30) return tMain("periods.days", { days })
    if (days < 365) return tMain("periods.months", { months: Math.round(days / 30) })
    return tMain("periods.years", { years: Math.round(days / 365) })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/compliance/retention-policies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name || !formData.dataType}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("createPolicy")}
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.policyDetails")}</CardTitle>
          <CardDescription>
            {t("sections.detailsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t("fields.name")} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("placeholders.name")}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t("fields.dataType")} *</Label>
              <Select
                value={formData.dataType}
                onValueChange={(value) => setFormData({ ...formData, dataType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATA_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="retentionDays">{t("fields.retentionDays")} *</Label>
              <Input
                id="retentionDays"
                type="number"
                min="-1"
                value={formData.retentionDays}
                onChange={(e) => setFormData({ ...formData, retentionDays: parseInt(e.target.value) || 0 })}
                placeholder={tMain("placeholders.retentionDays")}
              />
              <p className="text-xs text-muted-foreground">
                {t("hints.retentionDaysForever", { period: getRetentionPeriodLabel(formData.retentionDays) })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
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
                  {SCOPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
                  {DELETE_ACTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
              placeholder={t("placeholders.description")}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">{t("fields.activeStatus")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("hints.activeStatusDescription")}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              <strong>{t("note.title")}</strong> {t("note.text")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
