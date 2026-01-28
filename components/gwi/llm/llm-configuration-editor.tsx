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

interface LLMConfiguration {
  id: string
  name: string
  provider: string
  model: string
  apiKeyRef: string
  defaultParams: Record<string, unknown> | null
  rateLimits: Record<string, unknown> | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface LLMConfigurationEditorProps {
  configuration?: LLMConfiguration
}

const PROVIDER_VALUES = ["openai", "anthropic", "google", "azure", "cohere", "mistral"] as const

const MODELS_BY_PROVIDER: Record<string, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
  anthropic: ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
  google: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"],
  azure: ["gpt-4o", "gpt-4", "gpt-35-turbo"],
  cohere: ["command-r-plus", "command-r", "command"],
  mistral: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest"],
}

export function LLMConfigurationEditor({ configuration }: LLMConfigurationEditorProps) {
  const router = useRouter()
  const t = useTranslations("gwi.editors.llmConfiguration")
  const tCommon = useTranslations("gwi.editors.common")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: configuration?.name || "",
    provider: configuration?.provider || "",
    model: configuration?.model || "",
    apiKeyRef: configuration?.apiKeyRef || "",
    isActive: configuration?.isActive ?? true,
    defaultParams: configuration?.defaultParams
      ? JSON.stringify(configuration.defaultParams, null, 2)
      : '{\n  "temperature": 0.7,\n  "max_tokens": 4096\n}',
    rateLimits: configuration?.rateLimits
      ? JSON.stringify(configuration.rateLimits, null, 2)
      : '{\n  "requests_per_minute": 60,\n  "tokens_per_minute": 100000\n}',
  })

  const availableModels = formData.provider
    ? MODELS_BY_PROVIDER[formData.provider] || []
    : []

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError(t("validation.nameRequired"))
      return false
    }
    if (!formData.provider) {
      setError(t("validation.providerRequired"))
      return false
    }
    if (!formData.model) {
      setError(t("validation.modelRequired"))
      return false
    }
    if (!formData.apiKeyRef.trim()) {
      setError(t("validation.apiKeyRefRequired"))
      return false
    }

    // Validate JSON fields
    try {
      JSON.parse(formData.defaultParams)
    } catch {
      setError(t("validation.invalidParamsJson"))
      return false
    }

    try {
      JSON.parse(formData.rateLimits)
    } catch {
      setError(t("validation.invalidRateLimitsJson"))
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const url = configuration
        ? `/api/gwi/llm/configurations/${configuration.id}`
        : "/api/gwi/llm/configurations"
      const method = configuration ? "PATCH" : "POST"

      // Parse JSON fields safely
      let parsedParams, parsedRateLimits
      try {
        parsedParams = formData.defaultParams?.trim()
          ? JSON.parse(formData.defaultParams.trim())
          : {}
        parsedRateLimits = formData.rateLimits?.trim()
          ? JSON.parse(formData.rateLimits.trim())
          : {}
      } catch (parseError) {
        setError(t("validation.invalidJsonFormat") || "Invalid JSON format")
        setIsLoading(false)
        return
      }

      const payload = {
        name: formData.name.trim(),
        provider: formData.provider,
        model: formData.model,
        apiKeyRef: formData.apiKeyRef.trim(),
        isActive: formData.isActive,
        defaultParams: parsedParams,
        rateLimits: parsedRateLimits,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.failedToSave"))
      }

      const data = await response.json()
      if (!configuration) {
        router.push(`/gwi/llm/configurations/${data.id}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.failedToSave"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!configuration) return

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/gwi/llm/configurations/${configuration.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.failedToDelete"))
      }

      router.push("/gwi/llm")
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.failedToDelete"))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleProviderChange = (provider: string) => {
    setFormData({
      ...formData,
      provider,
      model: "", // Reset model when provider changes
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t("basicInformation")}</CardTitle>
            <CardDescription>
              {t("basicInformationDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t("configurationName")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("placeholders.configurationName")}
                required
              />
              <p className="text-sm text-muted-foreground">
                {t("configurationNameHint")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">{t("provider")}</Label>
                <Select
                  value={formData.provider}
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("placeholders.selectProvider")} />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_VALUES.map((providerValue) => (
                      <SelectItem key={providerValue} value={providerValue}>
                        {t(`providers.${providerValue}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">{t("model")}</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) =>
                    setFormData({ ...formData, model: value })
                  }
                  disabled={!formData.provider}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("placeholders.selectModel")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((modelValue) => (
                      <SelectItem key={modelValue} value={modelValue}>
                        {t(`models.${modelValue.replace(/[.-]/g, "_")}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKeyRef">{t("apiKeyRef")}</Label>
              <Input
                id="apiKeyRef"
                value={formData.apiKeyRef}
                onChange={(e) =>
                  setFormData({ ...formData, apiKeyRef: e.target.value })
                }
                placeholder={t("placeholders.apiKeyRef")}
                required
              />
              <p className="text-sm text-muted-foreground">
                {t("apiKeyRefHint")}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">{t("activeStatus")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("activeStatusDescription")}
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

        <Card>
          <CardHeader>
            <CardTitle>{t("modelParameters")}</CardTitle>
            <CardDescription>
              {t("modelParametersDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="defaultParams">{t("defaultParamsJson")}</Label>
              <Textarea
                id="defaultParams"
                value={formData.defaultParams}
                onChange={(e) =>
                  setFormData({ ...formData, defaultParams: e.target.value })
                }
                className="font-mono text-sm"
                rows={6}
              />
              <p className="text-sm text-muted-foreground">
                {t("defaultParamsHint")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("rateLimits")}</CardTitle>
            <CardDescription>
              {t("rateLimitsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="rateLimits">{t("rateLimitsJson")}</Label>
              <Textarea
                id="rateLimits"
                value={formData.rateLimits}
                onChange={(e) =>
                  setFormData({ ...formData, rateLimits: e.target.value })
                }
                className="font-mono text-sm"
                rows={6}
              />
              <p className="text-sm text-muted-foreground">
                {t("rateLimitsHint")}
              </p>
            </div>
          </CardContent>
        </Card>

        {configuration && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("configurationInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">{t("id")}</dt>
                  <dd className="font-mono text-xs">{configuration.id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("createdAt")}</dt>
                  <dd className="font-medium">
                    {new Date(configuration.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("lastUpdated")}</dt>
                  <dd className="font-medium">
                    {new Date(configuration.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{tCommon("status")}</dt>
                  <dd className="font-medium">
                    {configuration.isActive ? tCommon("active") : tCommon("inactive")}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between gap-2 pt-4">
          <div>
            {configuration && (
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
                        {t("deleteConfiguration")}
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteDialogTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("deleteDialogDescription")}
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
                  {configuration ? tCommon("saveChanges") : t("createConfiguration")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
