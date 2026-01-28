"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Loader2,
  Rocket,
  Calendar,
  Tag,
  Plus,
  X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslations } from "next-intl"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

export default function NewReleasePage() {
  const router = useRouter()
  const t = useTranslations("admin.operations.releases.new")
  const tMain = useTranslations("admin.operations.releases")
  const tCommon = useTranslations("common")
  const [isSaving, setIsSaving] = useState(false)

  const typeOptions = [
    { value: "MAJOR", label: tMain("type.major"), description: t("typeDescriptions.major") },
    { value: "MINOR", label: tMain("type.minor"), description: t("typeDescriptions.minor") },
    { value: "PATCH", label: tMain("type.patch"), description: t("typeDescriptions.patch") },
    { value: "HOTFIX", label: tMain("type.hotfix"), description: t("typeDescriptions.hotfix") },
  ]

  const strategyOptions = [
    { value: "BIG_BANG", label: tMain("strategy.bigBang"), description: t("strategyDescriptions.bigBang") },
    { value: "STAGED", label: tMain("strategy.staged"), description: t("strategyDescriptions.staged") },
    { value: "CANARY", label: tMain("strategy.canary"), description: t("strategyDescriptions.canary") },
    { value: "BLUE_GREEN", label: tMain("strategy.blueGreen"), description: t("strategyDescriptions.blueGreen") },
    { value: "RING", label: tMain("strategy.ring"), description: t("strategyDescriptions.ring") },
  ]
  const [newFeature, setNewFeature] = useState("")
  const [newBugFix, setNewBugFix] = useState("")

  const [formData, setFormData] = useState({
    version: "",
    name: "",
    description: "",
    type: "MINOR",
    rolloutStrategy: "STAGED",
    plannedDate: "",
    changelogUrl: "",
    features: [] as string[],
    bugFixes: [] as string[],
  })

  const handleCreate = async () => {
    if (!formData.version) {
      showErrorToast(t("validation.versionRequired"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/operations/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          plannedDate: formData.plannedDate || null,
          changelogUrl: formData.changelogUrl || null,
          name: formData.name || null,
          description: formData.description || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("toast.createFailed"))
      }

      const data = await response.json()
      showSuccessToast(t("toast.createSuccess"))
      router.push(`/admin/operations/releases/${data.release.id}`)
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : t("toast.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const addBugFix = () => {
    if (newBugFix.trim()) {
      setFormData(prev => ({
        ...prev,
        bugFixes: [...prev.bugFixes, newBugFix.trim()],
      }))
      setNewBugFix("")
    }
  }

  const removeBugFix = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bugFixes: prev.bugFixes.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/operations/releases">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.version}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("createRelease")}
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.releaseDetails")}</CardTitle>
            <CardDescription>
              {t("sections.releaseDetailsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">{t("fields.version")} *</Label>
                <Input
                  id="version"
                  placeholder={t("placeholders.version")}
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t("fields.name")}</Label>
                <Input
                  id="name"
                  placeholder={t("placeholders.name")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("fields.description")}</Label>
              <Textarea
                id="description"
                placeholder={t("placeholders.description")}
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("fields.type")}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {opt.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("fields.rolloutStrategy")}</Label>
                <Select
                  value={formData.rolloutStrategy}
                  onValueChange={(value) =>
                    setFormData({ ...formData, rolloutStrategy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {strategyOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {opt.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plannedDate">{t("fields.plannedDate")}</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="plannedDate"
                    type="date"
                    className="pl-10"
                    value={formData.plannedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, plannedDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="changelogUrl">{t("fields.changelogUrl")}</Label>
                <Input
                  id="changelogUrl"
                  placeholder={t("placeholders.changelogUrl")}
                  value={formData.changelogUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, changelogUrl: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features & Bug Fixes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {t("sections.features")}
              </CardTitle>
              <CardDescription>
                {t("sections.featuresDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t("actions.addFeature")}
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addFeature()}
                />
                <Button onClick={addFeature} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {feature}
                    <button onClick={() => removeFeature(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {formData.features.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("actions.noFeatures")}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {t("sections.bugFixes")}
              </CardTitle>
              <CardDescription>
                {t("sections.bugFixesDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t("actions.addBugFix")}
                  value={newBugFix}
                  onChange={(e) => setNewBugFix(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addBugFix()}
                />
                <Button onClick={addBugFix} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.bugFixes.map((fix, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {fix}
                    <button onClick={() => removeBugFix(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {formData.bugFixes.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("actions.noBugFixes")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
