"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

const PIPELINE_TYPES = [
  { value: "ETL", label: "ETL (Extract, Transform, Load)" },
  { value: "TRANSFORMATION", label: "Transformation" },
  { value: "AGGREGATION", label: "Aggregation" },
  { value: "EXPORT", label: "Export" },
  { value: "SYNC", label: "Sync" },
]

const SCHEDULE_PRESETS = [
  { value: "", label: "Manual (No Schedule)" },
  { value: "0 * * * *", label: "Every Hour" },
  { value: "0 */6 * * *", label: "Every 6 Hours" },
  { value: "0 0 * * *", label: "Daily at Midnight" },
  { value: "0 0 * * 0", label: "Weekly (Sunday)" },
  { value: "0 0 1 * *", label: "Monthly (1st)" },
  { value: "custom", label: "Custom Cron Expression" },
]

export function PipelineEditor({ pipeline }: PipelineEditorProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [scheduleMode, setScheduleMode] = useState<string>(
    pipeline?.schedule
      ? SCHEDULE_PRESETS.some(p => p.value === pipeline.schedule)
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
      newErrors.name = "Pipeline name is required"
    }

    if (!formData.type) {
      newErrors.type = "Pipeline type is required"
    }

    try {
      JSON.parse(formData.configuration)
    } catch {
      newErrors.configuration = "Invalid JSON configuration"
    }

    if (formData.schedule && !isValidCron(formData.schedule)) {
      newErrors.schedule = "Invalid cron expression"
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

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        type: formData.type,
        configuration: JSON.parse(formData.configuration),
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
        setErrors({ submit: errorData.error || "Failed to save pipeline" })
      }
    } catch (error) {
      console.error("Failed to save pipeline:", error)
      setErrors({ submit: "An unexpected error occurred" })
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
        setErrors({ submit: errorData.error || "Failed to delete pipeline" })
      }
    } catch (error) {
      console.error("Failed to delete pipeline:", error)
      setErrors({ submit: "An unexpected error occurred" })
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
            <CardTitle>Pipeline Settings</CardTitle>
            <CardDescription>
              Configure the basic settings for this data pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Pipeline Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter pipeline name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter pipeline description (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Pipeline Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select pipeline type" />
                </SelectTrigger>
                <SelectContent>
                  {PIPELINE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
                <Label htmlFor="isActive">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this pipeline
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
            <CardTitle>Schedule</CardTitle>
            <CardDescription>
              Configure when this pipeline should run automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="schedulePreset">Schedule Preset</Label>
              <Select
                value={scheduleMode}
                onValueChange={handleSchedulePresetChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_PRESETS.map((preset) => (
                    <SelectItem key={preset.value || "manual"} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {scheduleMode === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="schedule">Custom Cron Expression</Label>
                <Input
                  id="schedule"
                  value={formData.schedule}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule: e.target.value })
                  }
                  placeholder="e.g., 0 */2 * * * (every 2 hours)"
                  className={errors.schedule ? "border-red-500" : ""}
                />
                <p className="text-sm text-muted-foreground">
                  Format: minute hour day-of-month month day-of-week
                </p>
                {errors.schedule && (
                  <p className="text-sm text-red-500">{errors.schedule}</p>
                )}
              </div>
            )}

            {formData.schedule && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium">Current Schedule:</p>
                <code className="text-sm text-slate-600">{formData.schedule}</code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Define the pipeline configuration as JSON
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="configuration">Configuration JSON *</Label>
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
                Define source, destination, and transformation settings
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
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Pipeline
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the
                      pipeline &quot;{pipeline.name}&quot; and all associated run history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Pipeline
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
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {pipeline ? "Save Changes" : "Create Pipeline"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
