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

const PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google AI" },
  { value: "azure", label: "Azure OpenAI" },
  { value: "cohere", label: "Cohere" },
  { value: "mistral", label: "Mistral AI" },
]

const MODELS_BY_PROVIDER: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  anthropic: [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
    { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
  ],
  google: [
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    { value: "gemini-pro", label: "Gemini Pro" },
  ],
  azure: [
    { value: "gpt-4o", label: "GPT-4o (Azure)" },
    { value: "gpt-4", label: "GPT-4 (Azure)" },
    { value: "gpt-35-turbo", label: "GPT-3.5 Turbo (Azure)" },
  ],
  cohere: [
    { value: "command-r-plus", label: "Command R+" },
    { value: "command-r", label: "Command R" },
    { value: "command", label: "Command" },
  ],
  mistral: [
    { value: "mistral-large-latest", label: "Mistral Large" },
    { value: "mistral-medium-latest", label: "Mistral Medium" },
    { value: "mistral-small-latest", label: "Mistral Small" },
  ],
}

export function LLMConfigurationEditor({ configuration }: LLMConfigurationEditorProps) {
  const router = useRouter()
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
      setError("Configuration name is required")
      return false
    }
    if (!formData.provider) {
      setError("Provider is required")
      return false
    }
    if (!formData.model) {
      setError("Model is required")
      return false
    }
    if (!formData.apiKeyRef.trim()) {
      setError("API key reference is required")
      return false
    }

    // Validate JSON fields
    try {
      JSON.parse(formData.defaultParams)
    } catch {
      setError("Default parameters must be valid JSON")
      return false
    }

    try {
      JSON.parse(formData.rateLimits)
    } catch {
      setError("Rate limits must be valid JSON")
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

      const payload = {
        name: formData.name.trim(),
        provider: formData.provider,
        model: formData.model,
        apiKeyRef: formData.apiKeyRef.trim(),
        isActive: formData.isActive,
        defaultParams: JSON.parse(formData.defaultParams),
        rateLimits: JSON.parse(formData.rateLimits),
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save configuration")
      }

      const data = await response.json()
      if (!configuration) {
        router.push(`/gwi/llm/configurations/${data.id}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save configuration")
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
        throw new Error(data.error || "Failed to delete configuration")
      }

      router.push("/gwi/llm")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete configuration")
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
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Configure the basic settings for this LLM configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Configuration Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Production GPT-4o, Analysis Claude"
                required
              />
              <p className="text-sm text-muted-foreground">
                A descriptive name to identify this configuration
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select
                  value={formData.provider}
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) =>
                    setFormData({ ...formData, model: value })
                  }
                  disabled={!formData.provider}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKeyRef">API Key Reference</Label>
              <Input
                id="apiKeyRef"
                value={formData.apiKeyRef}
                onChange={(e) =>
                  setFormData({ ...formData, apiKeyRef: e.target.value })
                }
                placeholder="e.g., OPENAI_API_KEY, env:ANTHROPIC_KEY"
                required
              />
              <p className="text-sm text-muted-foreground">
                Environment variable name or secret reference for the API key
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this configuration for use
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
            <CardTitle>Model Parameters</CardTitle>
            <CardDescription>
              Default parameters sent with each request to the model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="defaultParams">Default Parameters (JSON)</Label>
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
                Common parameters: temperature, max_tokens, top_p, frequency_penalty
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate Limits</CardTitle>
            <CardDescription>
              Configure rate limiting for this model configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="rateLimits">Rate Limits (JSON)</Label>
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
                Configure requests_per_minute, tokens_per_minute, concurrent_requests
              </p>
            </div>
          </CardContent>
        </Card>

        {configuration && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Configuration Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">ID</dt>
                  <dd className="font-mono text-xs">{configuration.id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created At</dt>
                  <dd className="font-medium">
                    {new Date(configuration.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Last Updated</dt>
                  <dd className="font-medium">
                    {new Date(configuration.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium">
                    {configuration.isActive ? "Active" : "Inactive"}
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
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Configuration
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this LLM configuration? This action
                      cannot be undone. All usage records associated with this
                      configuration will also be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {configuration ? "Save Changes" : "Create Configuration"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
