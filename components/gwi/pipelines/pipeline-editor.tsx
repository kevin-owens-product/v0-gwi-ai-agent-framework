"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, Loader2, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Pipeline {
  id: string
  name: string
  description: string | null
  type: string
  configuration: Record<string, unknown>
  schedule: string | null
  isActive: boolean
}

interface PipelineEditorProps {
  pipeline?: Pipeline
}

const PIPELINE_TYPE_VALUES = ["ETL", "TRANSFORMATION", "AGGREGATION", "EXPORT", "SYNC"] as const

const SCHEDULE_PRESET_VALUES = ["", "0 * * * *", "0 */6 * * *", "0 0 * * *", "0 0 * * 0", "0 0 1 * *", "custom"] as const

export function PipelineEditor({ pipeline }: PipelineEditorProps) {
  const router = useRouter()
  const t = useTranslations("gwi.editors.pipeline")
  const tCommon = useTranslations("gwi.editors.common")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [scheduleMode, setScheduleMode] = useState<string>(
    pipeline?.schedule
      ? SCHEDULE_PRESET_VALUES.some(p => p === pipeline.schedule)
        ? pipeline.schedule
        : "custom"
      : ""
  )
  const [formData, setFormData] = useState({
    name: pipeline?.name || "",
    description: pipeline?.description || "",
    type: pipeline?.type || "ETL",
    configuration: JSON.stringify(pipeline?.configuration || {}, null, 2),
    schedule: pipeline?.schedule || "",
    isActive: pipeline?.isActive ?? true,
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t("validation.nameRequired")
    }

    if (!formData.type) {
      newErrors.type = t("validation.typeRequired")
    }

    try {
      JSON.parse(formData.configuration)
    } catch {
      newErrors.configuration = t("validation.invalidJsonConfig")
    }

    if (formData.schedule && !isValidCron(formData.schedule)) {
      newErrors.schedule = t("validation.invalidCron")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidCron = (cron: string): boolean => {
    if (!cron) return true
    const parts = cron.trim().split(/\s+/)
    return parts.length === 5
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const url = pipeline
        ? `/api/gwi/pipelines/${pipeline.id}`
        : "/api/gwi/pipelines"
      const method = pipeline ? "PATCH" : "POST"

      // Parse configuration safely
      let parsedConfiguration
      try {
        parsedConfiguration = formData.configuration?.trim() 
          ? JSON.parse(formData.configuration.trim())
          : {}
      } catch (parseError) {
        setErrors({ submit: t("errors.invalidJsonConfig") || "Invalid JSON format for configuration" })
        setIsLoading(false)
        return
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        type: formData.type,
        configuration: parsedConfiguration,
        schedule: formData.schedule || null,
        isActive: formData.isActive,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        if (!pipeline) {
          router.push(`/gwi/pipelines/${data.id}`)
        } else {
          router.refresh()
        }
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || t("errors.failedToSave") })
      }
    } catch (error) {
      console.error("Failed to save pipeline:", error)
      setErrors({ submit: t("errors.unexpectedError") })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!pipeline) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/gwi/pipelines/${pipeline.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/gwi/pipelines")
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || t("errors.failedToDelete") })
      }
    } catch (error) {
      console.error("Failed to delete pipeline:", error)
      setErrors({ submit: t("errors.unexpectedError") })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSchedulePresetChange = (value: string) => {
    setScheduleMode(value)
    if (value !== "custom") {
      setFormData({ ...formData, schedule: value })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("pipelineSettings")}</CardTitle>
            <CardDescription>
              {t("pipelineSettingsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t("pipelineName")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("placeholders.pipelineName")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{tCommon("description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t("placeholders.description")}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t("pipelineType")} *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("placeholders.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {PIPELINE_TYPE_VALUES.map((typeValue) => (
                    <SelectItem key={typeValue} value={typeValue}>
                      {t(`types.${typeValue}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">{tCommon("active")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("activeDescription")}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>{t("schedule")}</CardTitle>
            <CardDescription>
              {t("scheduleDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="schedulePreset">{t("schedulePreset")}</Label>
              <Select
                value={scheduleMode}
                onValueChange={handleSchedulePresetChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("placeholders.selectSchedule")} />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_PRESET_VALUES.map((presetValue) => (
                    <SelectItem key={presetValue || "manual"} value={presetValue}>
                      {t(`schedulePresets.${presetValue || "manual"}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {scheduleMode === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="schedule">{t("customCronExpression")}</Label>
                <Input
                  id="schedule"
                  value={formData.schedule}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule: e.target.value })
                  }
                  placeholder={t("placeholders.customCron")}
                  className={errors.schedule ? "border-red-500" : ""}
                />
                <p className="text-sm text-muted-foreground">
                  {t("cronFormat")}
                </p>
                {errors.schedule && (
                  <p className="text-sm text-red-500">{errors.schedule}</p>
                )}
              </div>
            )}

            {formData.schedule && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium">{t("currentSchedule")}</p>
                <code className="text-sm text-slate-600">{formData.schedule}</code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>{t("configuration")}</CardTitle>
            <CardDescription>
              {t("configurationDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="configuration">{t("configurationJson")} *</Label>
              <Textarea
                id="configuration"
                value={formData.configuration}
                onChange={(e) =>
                  setFormData({ ...formData, configuration: e.target.value })
                }
                placeholder='{"source": "...", "destination": "...", "transformations": []}'
                rows={10}
                className={`font-mono text-sm ${errors.configuration ? "border-red-500" : ""}`}
              />
              {errors.configuration && (
                <p className="text-sm text-red-500">{errors.configuration}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {t("configurationHint")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between gap-2">
          <div>
            {pipeline && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {tCommon("deleting")}
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("deletePipeline")}
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteDialogTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("deleteDialogDescription", { name: pipeline.name })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {t("deletePipeline")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className="flex gap-2">
            {errors.submit && (
              <p className="text-sm text-red-500 self-center">{errors.submit}</p>
            )}
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tCommon("saving")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {pipeline ? tCommon("saveChanges") : t("createPipeline")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
