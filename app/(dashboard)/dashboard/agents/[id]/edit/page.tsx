"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

type AgentType = "RESEARCH" | "ANALYSIS" | "REPORTING" | "MONITORING" | "CUSTOM"
type AgentStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED"

interface AgentConfiguration {
  systemPrompt?: string
  examplePrompts?: string[]
  temperature?: number
  maxTokens?: number
  enableMemory?: boolean
  requireCitations?: boolean
  dataSources?: string[]
  outputFormats?: string[]
  tags?: string[]
  model?: string
  tools?: string[]
}

interface Agent {
  id: string
  name: string
  description: string | null
  type: AgentType
  status: AgentStatus
  configuration: AgentConfiguration
  createdAt: string
  updatedAt: string
}

export default function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { status: sessionStatus } = useSession()
  const t = useTranslations("dashboard.agents.edit")
  const tCommon = useTranslations("common")

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<AgentType>("CUSTOM")
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("DRAFT")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [model, setModel] = useState("gpt-4")
  const [temperature, setTemperature] = useState("0.7")
  const [maxTokens, setMaxTokens] = useState(4096)
  const [enableMemory, setEnableMemory] = useState(true)
  const [requireCitations, setRequireCitations] = useState(true)
  const [dataSources, setDataSources] = useState<string[]>([])
  const [outputFormats, setOutputFormats] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [examplePrompts, setExamplePrompts] = useState<string[]>(["", "", ""])
  const [tools, setTools] = useState<string[]>([])

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch agent data on mount
  useEffect(() => {
    if (sessionStatus === "loading") return
    if (sessionStatus === "unauthenticated") {
      router.push("/login")
      return
    }

    async function fetchAgent() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/v1/agents/${id}`)
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to fetch agent")
        }
        const data = await response.json()
        const agent: Agent = data.data

        // Populate form state from agent data
        setName(agent.name)
        setDescription(agent.description || "")
        setType(agent.type)
        setAgentStatus(agent.status)

        const config = agent.configuration || {}
        setSystemPrompt(config.systemPrompt || "")
        setModel(config.model || "gpt-4")
        setTemperature(String(config.temperature ?? 0.7))
        setMaxTokens(config.maxTokens ?? 4096)
        setEnableMemory(config.enableMemory ?? true)
        setRequireCitations(config.requireCitations ?? true)
        setDataSources(config.dataSources || [])
        setOutputFormats(config.outputFormats || [])
        setTags(config.tags || [])
        setTools(config.tools || [])

        const prompts = config.examplePrompts || []
        setExamplePrompts(prompts.length > 0 ? prompts : ["", "", ""])
      } catch (err) {
        console.error("Failed to fetch agent:", err)
        setError(err instanceof Error ? err.message : tCommon('errors.agentFetchFailed'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgent()
  }, [id, router, sessionStatus, tCommon])

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const toggleDataSource = (source: string) => {
    if (dataSources.includes(source)) {
      setDataSources(dataSources.filter((s) => s !== source))
    } else {
      setDataSources([...dataSources, source])
    }
  }

  const toggleOutputFormat = (format: string) => {
    if (outputFormats.includes(format)) {
      setOutputFormats(outputFormats.filter((f) => f !== format))
    } else {
      setOutputFormats([...outputFormats, format])
    }
  }

  const toggleTool = (tool: string) => {
    if (tools.includes(tool)) {
      setTools(tools.filter((t) => t !== tool))
    } else {
      setTools([...tools, tool])
    }
  }

  const updateExamplePrompt = (index: number, value: string) => {
    const newPrompts = [...examplePrompts]
    newPrompts[index] = value
    setExamplePrompts(newPrompts)
  }

  const addExamplePrompt = () => {
    setExamplePrompts([...examplePrompts, ""])
  }

  const removeExamplePrompt = (index: number) => {
    if (examplePrompts.length > 1) {
      setExamplePrompts(examplePrompts.filter((_, i) => i !== index))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = t("validation.nameRequired")
    } else if (name.length > 100) {
      newErrors.name = t("validation.nameTooLong")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const configuration: AgentConfiguration = {
        systemPrompt: systemPrompt.trim() || undefined,
        examplePrompts: examplePrompts.filter((p) => p.trim()),
        temperature: parseFloat(temperature),
        maxTokens,
        enableMemory,
        requireCitations,
        dataSources,
        outputFormats,
        tags,
        model,
        tools,
      }

      const response = await fetch(`/api/v1/agents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          status: agentStatus,
          configuration,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update agent")
      }

      toast.success(t("toast.updateSuccess"))
      router.push(`/dashboard/agents/${id}`)
    } catch (err) {
      console.error("Failed to update agent:", err)
      toast.error(err instanceof Error ? err.message : tCommon('errors.agentUpdateFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading state while checking session
  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-lg font-medium mb-2">{t("loadError")}</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Link href="/dashboard/agents">
          <Button>{t("backToAgents")}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/agents/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/agents/${id}`)}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("saveChanges")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t("basicInfo.title")}</CardTitle>
              <CardDescription>
                {t("basicInfo.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("basicInfo.agentName")} *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("basicInfo.agentNamePlaceholder")}
                  className={`bg-secondary ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{tCommon("description")}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("basicInfo.descriptionPlaceholder")}
                  className="bg-secondary min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">{t("basicInfo.agentType")}</Label>
                  <Select
                    value={type}
                    onValueChange={(v) => setType(v as AgentType)}
                  >
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RESEARCH">{t("types.research")}</SelectItem>
                      <SelectItem value="ANALYSIS">{t("types.analysis")}</SelectItem>
                      <SelectItem value="REPORTING">{t("types.reporting")}</SelectItem>
                      <SelectItem value="MONITORING">{t("types.monitoring")}</SelectItem>
                      <SelectItem value="CUSTOM">{t("types.custom")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{tCommon("status")}</Label>
                  <Select
                    value={agentStatus}
                    onValueChange={(v) => setAgentStatus(v as AgentStatus)}
                  >
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">{t("statuses.draft")}</SelectItem>
                      <SelectItem value="ACTIVE">{t("statuses.active")}</SelectItem>
                      <SelectItem value="PAUSED">{t("statuses.paused")}</SelectItem>
                      <SelectItem value="ARCHIVED">{t("statuses.archived")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("basicInfo.tags")}</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder={t("basicInfo.addTagPlaceholder")}
                    className="bg-secondary"
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Button variant="outline" onClick={addTag} type="button">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          type="button"
                          className="hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Prompt */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("systemPrompt.title")}</CardTitle>
                <CardDescription>
                  {t("systemPrompt.description")}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-2 text-accent">
                <Sparkles className="h-4 w-4" />
                {t("systemPrompt.generateWithAI")}
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder={t("systemPrompt.placeholder")}
                className="bg-secondary min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {t("systemPrompt.hint")}
              </p>
            </CardContent>
          </Card>

          {/* Model Configuration */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t("modelConfig.title")}</CardTitle>
              <CardDescription>
                {t("modelConfig.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">{t("modelConfig.model")}</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">{t("models.gpt4")}</SelectItem>
                    <SelectItem value="gpt-4-turbo">{t("models.gpt4Turbo")}</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">{t("models.gpt35Turbo")}</SelectItem>
                    <SelectItem value="claude-3-opus">{t("models.claude3Opus")}</SelectItem>
                    <SelectItem value="claude-3-sonnet">{t("models.claude3Sonnet")}</SelectItem>
                    <SelectItem value="claude-3-haiku">{t("models.claude3Haiku")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">{t("modelConfig.temperature")}</Label>
                  <Select value={temperature} onValueChange={setTemperature}>
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.0">{t("modelConfig.temperatures.deterministic")}</SelectItem>
                      <SelectItem value="0.3">{t("modelConfig.temperatures.precise")}</SelectItem>
                      <SelectItem value="0.5">{t("modelConfig.temperatures.balanced")}</SelectItem>
                      <SelectItem value="0.7">{t("modelConfig.temperatures.creative")}</SelectItem>
                      <SelectItem value="0.9">{t("modelConfig.temperatures.exploratory")}</SelectItem>
                      <SelectItem value="1.0">{t("modelConfig.temperatures.maximum")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">{t("modelConfig.maxTokens")}</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={maxTokens}
                    onChange={(e) =>
                      setMaxTokens(parseInt(e.target.value) || 4096)
                    }
                    className="bg-secondary"
                    min={1}
                    max={128000}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Example Prompts */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t("examplePrompts.title")}</CardTitle>
              <CardDescription>
                {t("examplePrompts.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {examplePrompts.map((prompt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">
                    {i + 1}.
                  </span>
                  <Input
                    value={prompt}
                    onChange={(e) => updateExamplePrompt(i, e.target.value)}
                    placeholder={t("examplePrompts.placeholder", { number: i + 1 })}
                    className="bg-secondary"
                  />
                  {examplePrompts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExamplePrompt(i)}
                      type="button"
                      className="hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={addExamplePrompt}
                type="button"
              >
                <Plus className="h-4 w-4" />
                {t("examplePrompts.addExample")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Data Sources */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t("dataSources.title")}</CardTitle>
              <CardDescription>
                {t("dataSources.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "GWI Core", label: t("dataSourceOptions.gwiCore") },
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "GWI USA", label: t("dataSourceOptions.gwiUsa") },
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "GWI Zeitgeist", label: t("dataSourceOptions.gwiZeitgeist") },
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "Custom Uploads", label: t("dataSourceOptions.customUploads") },
              ].map(
                (source) => (
                  <div
                    key={source.key}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <span className="text-sm text-foreground">{source.label}</span>
                    <Switch
                      checked={dataSources.includes(source.key)}
                      onCheckedChange={() => toggleDataSource(source.key)}
                    />
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Output Formats */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t("outputFormats.title")}</CardTitle>
              <CardDescription>
                {t("outputFormats.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "Markdown", label: t("outputFormatOptions.markdown") },
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "JSON", label: t("outputFormatOptions.json") },
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "Slides", label: t("outputFormatOptions.slides") },
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "PDF Report", label: t("outputFormatOptions.pdfReport") },
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "CSV", label: t("outputFormatOptions.csv") },
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "HTML", label: t("outputFormatOptions.html") },
              ].map(
                (format) => (
                  <div
                    key={format.key}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <span className="text-sm text-foreground">{format.label}</span>
                    <Switch
                      checked={outputFormats.includes(format.key)}
                      onCheckedChange={() => toggleOutputFormat(format.key)}
                    />
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Tools */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t("tools.title")}</CardTitle>
              <CardDescription>
                {t("tools.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "Web Search", label: t("toolOptions.webSearch") },
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "Data Analysis", label: t("toolOptions.dataAnalysis") },
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "Chart Generation", label: t("toolOptions.chartGeneration") },
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "Report Builder", label: t("toolOptions.reportBuilder") },
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "API Calls", label: t("toolOptions.apiCalls") },
                // eslint-disable-next-line local/no-hardcoded-strings
                { key: "File Processing", label: t("toolOptions.fileProcessing") },
              ].map((tool) => (
                <div
                  key={tool.key}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <span className="text-sm text-foreground">{tool.label}</span>
                  <Switch
                    checked={tools.includes(tool.key)}
                    onCheckedChange={() => toggleTool(tool.key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t("advancedSettings.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">{t("advancedSettings.enableMemory")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("advancedSettings.enableMemoryDescription")}
                  </p>
                </div>
                <Switch
                  checked={enableMemory}
                  onCheckedChange={setEnableMemory}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">{t("advancedSettings.requireCitations")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("advancedSettings.requireCitationsDescription")}
                  </p>
                </div>
                <Switch
                  checked={requireCitations}
                  onCheckedChange={setRequireCitations}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
