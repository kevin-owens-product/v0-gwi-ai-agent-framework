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
import { Save, Loader2, Trash2 } from "lucide-react"

interface AgentTemplate {
  id: string
  name: string
  description: string | null
  category: string
  configuration: Record<string, unknown>
  defaultTools: string[] | null
  defaultPrompts: Record<string, string> | null
  isPublished: boolean
  version: number
}

interface AgentTemplateEditorProps {
  template?: AgentTemplate
}

const CATEGORY_VALUES = ["analysis", "classification", "data_quality", "reporting", "automation", "integration"] as const

export function AgentTemplateEditor({ template }: AgentTemplateEditorProps) {
  const router = useRouter()
  const t = useTranslations("gwi.editors.agentTemplate")
  const tCommon = useTranslations("gwi.editors.common")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    category: template?.category || "analysis",
    configuration: template?.configuration
      ? JSON.stringify(template.configuration, null, 2)
      : JSON.stringify(
          {
            model: "gpt-4-turbo",
            temperature: 0.3,
            maxIterations: 10,
            capabilities: [],
          },
          null,
          2
        ),
    defaultTools: template?.defaultTools
      ? JSON.stringify(template.defaultTools, null, 2)
      : JSON.stringify([], null, 2),
    defaultPrompts: template?.defaultPrompts
      ? JSON.stringify(template.defaultPrompts, null, 2)
      : JSON.stringify(
          {
            system: "",
          },
          null,
          2
        ),
    isPublished: template?.isPublished || false,
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t("validation.nameRequired")
    }

    if (!formData.category) {
      newErrors.category = t("validation.categoryRequired")
    }

    try {
      JSON.parse(formData.configuration)
    } catch {
      newErrors.configuration = t("validation.invalidJsonFormat")
    }

    try {
      const tools = JSON.parse(formData.defaultTools)
      if (!Array.isArray(tools)) {
        newErrors.defaultTools = t("validation.mustBeJsonArray")
      }
    } catch {
      newErrors.defaultTools = t("validation.invalidJsonFormat")
    }

    try {
      JSON.parse(formData.defaultPrompts)
    } catch {
      newErrors.defaultPrompts = t("validation.invalidJsonFormat")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const url = template
        ? `/api/gwi/agents/templates/${template.id}`
        : "/api/gwi/agents/templates"
      const method = template ? "PATCH" : "POST"

      // Parse JSON fields safely
      let parsedConfiguration, parsedTools, parsedPrompts
      try {
        parsedConfiguration = formData.configuration?.trim()
          ? JSON.parse(formData.configuration.trim())
          : {}
        parsedTools = formData.defaultTools?.trim()
          ? JSON.parse(formData.defaultTools.trim())
          : []
        parsedPrompts = formData.defaultPrompts?.trim()
          ? JSON.parse(formData.defaultPrompts.trim())
          : {}
      } catch (parseError) {
        setErrors({ submit: t("errors.invalidJsonFormat") || "Invalid JSON format" })
        setIsLoading(false)
        return
      }

      const payload = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        configuration: parsedConfiguration,
        defaultTools: parsedTools,
        defaultPrompts: parsedPrompts,
        isPublished: formData.isPublished,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        if (!template) {
          router.push(`/gwi/agents/templates/${data.id}`)
        } else {
          router.refresh()
        }
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || t("errors.failedToSave") })
      }
    } catch (error) {
      console.error("Failed to save agent template:", error)
      setErrors({ submit: t("errors.failedToSave") })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!template) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/gwi/agents/templates/${template.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/gwi/agents")
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || t("errors.failedToDelete") })
      }
    } catch (error) {
      console.error("Failed to delete agent template:", error)
      setErrors({ submit: t("errors.failedToDelete") })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("templateSettings")}</CardTitle>
            <CardDescription>
              {t("templateSettingsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t("templateName")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("placeholders.templateName")}
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
              <Label htmlFor="category">{t("category")} *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("placeholders.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_VALUES.map((catValue) => (
                    <SelectItem key={catValue} value={catValue}>
                      {t(`categories.${catValue}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="published">{t("published")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("publishedDescription")}
                </p>
              </div>
              <Switch
                id="published"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublished: checked })
                }
              />
            </div>
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
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="configuration">{t("configurationJson")} *</Label>
              <Textarea
                id="configuration"
                value={formData.configuration}
                onChange={(e) =>
                  setFormData({ ...formData, configuration: e.target.value })
                }
                placeholder="{}"
                rows={10}
                className={`font-mono text-sm ${errors.configuration ? "border-red-500" : ""}`}
              />
              {errors.configuration && (
                <p className="text-sm text-red-500">{errors.configuration}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("configurationExample")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Default Tools */}
        <Card>
          <CardHeader>
            <CardTitle>{t("defaultTools")}</CardTitle>
            <CardDescription>
              {t("defaultToolsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="defaultTools">{t("toolsJson")}</Label>
              <Textarea
                id="defaultTools"
                value={formData.defaultTools}
                onChange={(e) =>
                  setFormData({ ...formData, defaultTools: e.target.value })
                }
                placeholder="[]"
                rows={4}
                className={`font-mono text-sm ${errors.defaultTools ? "border-red-500" : ""}`}
              />
              {errors.defaultTools && (
                <p className="text-sm text-red-500">{errors.defaultTools}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("toolsExample")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Default Prompts */}
        <Card>
          <CardHeader>
            <CardTitle>{t("defaultPrompts")}</CardTitle>
            <CardDescription>
              {t("defaultPromptsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="defaultPrompts">{t("promptsJson")}</Label>
              <Textarea
                id="defaultPrompts"
                value={formData.defaultPrompts}
                onChange={(e) =>
                  setFormData({ ...formData, defaultPrompts: e.target.value })
                }
                placeholder="{}"
                rows={6}
                className={`font-mono text-sm ${errors.defaultPrompts ? "border-red-500" : ""}`}
              />
              {errors.defaultPrompts && (
                <p className="text-sm text-red-500">{errors.defaultPrompts}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("promptsExample")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Version Info (for existing templates) */}
        {template && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("templateInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("currentVersion", { version: template.version })}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <div>
            {template && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {tCommon("deleting")}
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("deleteTemplate")}
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteDialogTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("deleteDialogDescription", { name: template.name })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {tCommon("delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tCommon("saving")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {template ? tCommon("saveChanges") : t("createTemplate")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
