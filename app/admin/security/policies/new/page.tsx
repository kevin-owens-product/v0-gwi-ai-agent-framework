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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Lock } from "lucide-react"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
import { useAdmin } from "@/components/providers/admin-provider"

const policyTypeValues = [
  "PASSWORD",
  "SESSION",
  "MFA",
  "IP_ALLOWLIST",
  "DATA_ACCESS",
  "FILE_SHARING",
  "EXTERNAL_SHARING",
  "DLP",
  "ENCRYPTION",
  "DEVICE_TRUST",
  "API_ACCESS",
  "RETENTION",
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

export default function NewSecurityPolicyPage() {
  const t = useTranslations("admin.security.policies")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "PASSWORD",
    scope: "PLATFORM",
    enforcementMode: "ENFORCE",
    priority: 0,
    isActive: true,
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.permissions.includes("security:write")

  const handleCreate = async () => {
    if (!formData.name) {
      showErrorToast(t("validation.policyNameRequired"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/security/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        showSuccessToast(t("toast.policyCreated"))
        router.push(`/admin/security/policies/${data.policy.id}`)
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("toast.createFailed"))
      }
    } catch (error) {
      console.error("Failed to create policy:", error)
      showErrorToast(t("toast.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("new.noPermission")}</p>
        <Link href="/admin/security/policies">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("detail.backToPolicies")}
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
          <Link href="/admin/security/policies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              {t("new.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("new.description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {tCommon("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("new.createPolicy")}
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("new.policyDetails")}</CardTitle>
          <CardDescription>
            {t("new.policyDetailsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("form.policyName")} *</Label>
              <Input
                id="name"
                placeholder={t("form.policyNamePlaceholder")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">{t("form.description")}</Label>
              <Textarea
                id="description"
                placeholder={t("form.descriptionPlaceholder")}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("form.policyType")} *</Label>
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

              <div className="grid gap-2">
                <Label>{t("form.scope")} *</Label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("form.enforcementMode")} *</Label>
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
                <p className="text-xs text-muted-foreground">
                  {formData.enforcementMode === "MONITOR" && t("enforcementDescriptions.MONITOR")}
                  {formData.enforcementMode === "WARN" && t("enforcementDescriptions.WARN")}
                  {formData.enforcementMode === "ENFORCE" && t("enforcementDescriptions.ENFORCE")}
                  {formData.enforcementMode === "STRICT" && t("enforcementDescriptions.STRICT")}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">{t("form.priority")}</Label>
                <Input
                  id="priority"
                  type="number"
                  placeholder="0"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  {t("form.priorityDescription")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">{t("form.enableImmediately")}</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
