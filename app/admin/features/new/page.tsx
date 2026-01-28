"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
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
  Flag,
  Settings,
  Percent,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"

const PLAN_OPTIONS = ["STARTER", "PROFESSIONAL", "ENTERPRISE"]

export default function NewFeatureFlagPage() {
  const t = useTranslations("admin.features")
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const FLAG_TYPES = [
    { value: "BOOLEAN", label: t("types.boolean"), description: t("types.booleanDescription") },
    { value: "STRING", label: t("types.string"), description: t("types.stringDescription") },
    { value: "NUMBER", label: t("types.number"), description: t("types.numberDescription") },
    { value: "JSON", label: t("types.json"), description: t("types.jsonDescription") },
  ]

  const [formData, setFormData] = useState({
    key: "",
    name: "",
    description: "",
    type: "BOOLEAN",
    isEnabled: false,
    rolloutPercentage: 100,
    allowedPlans: [] as string[],
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

  const togglePlan = (plan: string) => {
    setFormData(prev => ({
      ...prev,
      allowedPlans: prev.allowedPlans.includes(plan)
        ? prev.allowedPlans.filter(p => p !== plan)
        : [...prev.allowedPlans, plan],
    }))
  }

  const handleCreate = async () => {
    if (!formData.key || !formData.name) {
      toast.error(t("validation.keyRequired"))
      return
    }

    // Validate key format
    if (!/^[a-z][a-z0-9_]*$/.test(formData.key)) {
      toast.error(t("validation.keyFormat"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/features", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: formData.key,
          name: formData.name,
          description: formData.description || undefined,
          type: formData.type,
          isEnabled: formData.isEnabled,
          rolloutPercentage: formData.rolloutPercentage,
          allowedPlans: formData.allowedPlans.length > 0 ? formData.allowedPlans : undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/features/${data.flag.id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to create feature flag")
      }
    } catch (error) {
      console.error("Failed to create feature flag:", error)
      toast.error("Failed to create feature flag")
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("new.noPermission")}</p>
        <Link href="/admin/features">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("new.backToFeatures")}
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
          <Link href="/admin/features">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("new.back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{t("new.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("new.subtitle")}
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
              {t("createFlag")}
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              {t("flagDetails.title")}
            </CardTitle>
            <CardDescription>
              {t("flagDetails.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t("form.displayName")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t("form.namePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key">{t("form.key")} *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                  placeholder={t("form.keyPlaceholder")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("flagDetails.keyHint")}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("form.description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t("form.descriptionPlaceholder")}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("form.type")}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FLAG_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("rolloutConfig.title")}
            </CardTitle>
            <CardDescription>
              {t("rolloutConfig.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("rolloutConfig.enabled")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("rolloutConfig.enabledDescription")}
                </p>
              </div>
              <Switch
                checked={formData.isEnabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEnabled: checked }))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  {t("rolloutConfig.rolloutPercentage")}
                </Label>
                <span className="text-sm font-medium">{formData.rolloutPercentage}%</span>
              </div>
              <Slider
                value={[formData.rolloutPercentage]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, rolloutPercentage: value }))}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                {t("rolloutConfig.rolloutDescription")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t("planRestrictions.title")}
            </CardTitle>
            <CardDescription>
              {t("planRestrictions.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>{t("planRestrictions.allowedPlans")}</Label>
              <div className="flex gap-6">
                {PLAN_OPTIONS.map((plan) => (
                  <div key={plan} className="flex items-center gap-2">
                    <Checkbox
                      id={plan}
                      checked={formData.allowedPlans.includes(plan)}
                      onCheckedChange={() => togglePlan(plan)}
                    />
                    <label htmlFor={plan} className="text-sm cursor-pointer">
                      {plan}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("planRestrictions.allowAllDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
