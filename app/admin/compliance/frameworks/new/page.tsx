"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { showErrorToast } from "@/lib/toast-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Save,
  Loader2,
  Shield,
} from "lucide-react"
import Link from "next/link"

export default function NewFrameworkPage() {
  const t = useTranslations()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    version: "",
    isActive: true,
  })

  const handleCreate = async () => {
    if (!formData.name || !formData.code) {
      showErrorToast(t("toast.error.validationError"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/compliance/frameworks", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code.toUpperCase(),
          description: formData.description || null,
          version: formData.version || null,
          isActive: formData.isActive,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || t("admin.compliance.frameworks.createFailed"))
      }

      const data = await response.json()
      router.push(`/admin/compliance/frameworks/${data.framework?.id || ""}`)
    } catch (error) {
      console.error("Failed to create framework:", error)
      showErrorToast(error instanceof Error ? error.message : t("admin.compliance.frameworks.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/compliance/frameworks">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              {t("admin.compliance.frameworks.createTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("admin.compliance.frameworks.createDescription")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name || !formData.code}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("common.creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("admin.compliance.frameworks.createButton")}
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.compliance.frameworks.details")}</CardTitle>
          <CardDescription>
            {t("admin.compliance.frameworks.detailsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t("admin.compliance.frameworks.nameRequired")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("admin.compliance.frameworks.namePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">{t("admin.compliance.frameworks.codeRequired")}</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder={t("admin.compliance.frameworks.codePlaceholder")}
              />
              <p className="text-xs text-muted-foreground">
                {t("admin.compliance.frameworks.codeHint")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">{t("common.version")}</Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder={t("admin.compliance.frameworks.versionPlaceholder")}
            />
            <p className="text-xs text-muted-foreground">
              {t("admin.compliance.frameworks.versionHint")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("common.description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t("admin.compliance.frameworks.descriptionPlaceholder")}
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">{t("admin.compliance.frameworks.activeStatus")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.compliance.frameworks.activeStatusDescription")}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
