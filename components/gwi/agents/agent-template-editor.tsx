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

const CATEGORIES = [
  { value: "analysis", label: "Analysis" },
  { value: "classification", label: "Classification" },
  { value: "data_quality", label: "Data Quality" },
  { value: "reporting", label: "Reporting" },
  { value: "automation", label: "Automation" },
  { value: "integration", label: "Integration" },
]

export function AgentTemplateEditor({ template }: AgentTemplateEditorProps) {
  const router = useRouter()
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
      newErrors.name = "Name is required"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    try {
      JSON.parse(formData.configuration)
    } catch {
      newErrors.configuration = "Invalid JSON format"
    }

    try {
      const tools = JSON.parse(formData.defaultTools)
      if (!Array.isArray(tools)) {
        newErrors.defaultTools = "Must be a JSON array"
      }
    } catch {
      newErrors.defaultTools = "Invalid JSON format"
    }

    try {
      JSON.parse(formData.defaultPrompts)
    } catch {
      newErrors.defaultPrompts = "Invalid JSON format"
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

      const payload = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        configuration: JSON.parse(formData.configuration),
        defaultTools: JSON.parse(formData.defaultTools),
        defaultPrompts: JSON.parse(formData.defaultPrompts),
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
        setErrors({ submit: errorData.error || "Failed to save template" })
      }
    } catch (error) {
      console.error("Failed to save agent template:", error)
      setErrors({ submit: "Failed to save template" })
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
        setErrors({ submit: errorData.error || "Failed to delete template" })
      }
    } catch (error) {
      console.error("Failed to delete agent template:", error)
      setErrors({ submit: "Failed to delete template" })
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
            <CardTitle>Template Settings</CardTitle>
            <CardDescription>
              Configure the basic settings for this agent template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter template name"
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
                placeholder="Describe what this agent template does"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
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
                <Label htmlFor="published">Published</Label>
                <p className="text-sm text-muted-foreground">
                  Make this template available for use
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
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Define the agent&apos;s model settings and capabilities (JSON format)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="configuration">Configuration JSON *</Label>
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
                Example: {`{ "model": "gpt-4-turbo", "temperature": 0.3, "maxIterations": 10, "capabilities": ["data_analysis"] }`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Default Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Default Tools</CardTitle>
            <CardDescription>
              List of tool names this agent can use by default (JSON array)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="defaultTools">Tools JSON</Label>
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
                Example: {`["survey_query", "llm_invoke", "report_generator"]`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Default Prompts */}
        <Card>
          <CardHeader>
            <CardTitle>Default Prompts</CardTitle>
            <CardDescription>
              Define the default prompts for this agent (JSON object)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="defaultPrompts">Prompts JSON</Label>
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
                Example: {`{ "system": "You are an expert analyst...", "template": "Analysis Template" }`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Version Info (for existing templates) */}
        {template && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Template Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Current Version: {template.version}
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
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Template
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Agent Template</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{template.name}&quot;? This
                      action cannot be undone.
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
                  {template ? "Save Changes" : "Create Template"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
