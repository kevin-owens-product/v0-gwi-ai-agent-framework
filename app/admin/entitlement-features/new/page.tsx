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
  Sparkles,
  Settings,
  Tag,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"

export default function NewEntitlementFeaturePage() {
  const router = useRouter()
  const t = useTranslations("admin.entitlementFeatures.new")
  const tMain = useTranslations("admin.entitlementFeatures")
  const tCommon = useTranslations("common")
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const CATEGORIES = [
    { value: "CORE", label: tMain("categories.core") },
    { value: "ANALYTICS", label: tMain("categories.analytics") },
    { value: "AGENTS", label: tMain("categories.agents") },
    { value: "INTEGRATIONS", label: tMain("categories.integrations") },
    { value: "SECURITY", label: tMain("categories.security") },
    { value: "SUPPORT", label: tMain("categories.support") },
    { value: "CUSTOMIZATION", label: tMain("categories.customization") },
    { value: "API", label: tMain("categories.api") },
    { value: "ADVANCED", label: tMain("categories.advanced") },
  ]

  const VALUE_TYPES = [
    { value: "BOOLEAN", label: tMain("valueTypes.boolean"), defaultValue: false },
    { value: "NUMBER", label: tMain("valueTypes.number"), defaultValue: 0 },
    { value: "STRING", label: tMain("valueTypes.string"), defaultValue: "" },
    { value: "JSON", label: tMain("valueTypes.json"), defaultValue: {} },
  ]

  const [formData, setFormData] = useState({
    key: "",
    name: "",
    description: "",
    category: "CORE",
    valueType: "BOOLEAN",
    defaultValue: false as unknown,
    isActive: true,
    sortOrder: 0,
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.role === "ADMIN"

  const generateKey = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      key: prev.key || generateKey(name),
    }))
  }

  const handleValueTypeChange = (valueType: string) => {
    const typeInfo = VALUE_TYPES.find(t => t.value === valueType)
    setFormData(prev => ({
      ...prev,
      valueType,
      defaultValue: typeInfo?.defaultValue ?? false,
    }))
  }

  const handleCreate = async () => {
    if (!formData.key || !formData.name) {
      showErrorToast(t("validation.keyAndNameRequired"))
      return
    }

    // Validate key format
    if (!/^[a-z][a-z0-9_]*$/.test(formData.key)) {
      showErrorToast(t("validation.keyFormatInvalid"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/entitlement-features", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: formData.key,
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category,
          valueType: formData.valueType,
          defaultValue: formData.defaultValue,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/entitlement-features/${data.feature.id}`)
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("toast.createFailed"))
      }
    } catch (error) {
      console.error("Failed to create feature:", error)
      showErrorToast(t("toast.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("noPermission")}</p>
        <Link href="/admin/entitlement-features">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToFeatures")}
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
          <Link href="/admin/entitlement-features">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.key || !formData.name}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("createFeature")}
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {t("sections.featureDetails")}
            </CardTitle>
            <CardDescription>
              {t("sections.featureDetailsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fields.displayName")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t("placeholders.displayName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key">{t("fields.featureKey")} *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                  placeholder={t("placeholders.featureKey")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("hints.snakeCaseFormat")}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("fields.description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t("placeholders.description")}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {t("sections.categoryClassification")}
            </CardTitle>
            <CardDescription>
              {t("sections.categoryDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t("fields.category")}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">{t("fields.sortOrder")}</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                />
                <p className="text-xs text-muted-foreground">
                  {t("hints.sortOrderLower")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("sections.valueConfiguration")}
            </CardTitle>
            <CardDescription>
              {t("sections.valueDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t("fields.valueType")}</Label>
                <Select
                  value={formData.valueType}
                  onValueChange={handleValueTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VALUE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("fields.defaultValue")}</Label>
                {formData.valueType === "BOOLEAN" ? (
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={formData.defaultValue === true}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, defaultValue: checked }))}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.defaultValue ? t("status.enabled") : t("status.disabled")}
                    </span>
                  </div>
                ) : formData.valueType === "NUMBER" ? (
                  <Input
                    type="number"
                    value={formData.defaultValue as number}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: parseInt(e.target.value) || 0 }))}
                  />
                ) : (
                  <Input
                    value={String(formData.defaultValue)}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                    placeholder={formData.valueType === "JSON" ? t("placeholders.jsonDefault") : ""}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>{t("fields.active")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("hints.inactiveFeatures")}
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
