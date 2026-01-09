"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Play, Plus, X, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type AgentType = 'RESEARCH' | 'ANALYSIS' | 'REPORTING' | 'MONITORING' | 'CUSTOM'

export function AgentBuilder() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<AgentType>("CUSTOM")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [examplePrompts, setExamplePrompts] = useState<string[]>(["", "", ""])
  const [temperature, setTemperature] = useState("0.7")
  const [maxTokens, setMaxTokens] = useState(4096)
  const [enableMemory, setEnableMemory] = useState(true)
  const [requireCitations, setRequireCitations] = useState(true)
  const [dataSources, setDataSources] = useState<string[]>(["GWI Core"])
  const [outputFormats, setOutputFormats] = useState<string[]>(["Markdown"])

  const [isCreating, setIsCreating] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const toggleDataSource = (source: string) => {
    if (dataSources.includes(source)) {
      setDataSources(dataSources.filter(s => s !== source))
    } else {
      setDataSources([...dataSources, source])
    }
  }

  const toggleOutputFormat = (format: string) => {
    if (outputFormats.includes(format)) {
      setOutputFormats(outputFormats.filter(f => f !== format))
    } else {
      setOutputFormats([...outputFormats, format])
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Agent name is required"
    } else if (name.length > 100) {
      newErrors.name = "Agent name must be 100 characters or less"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = async (asDraft: boolean = false) => {
    if (!validateForm()) return

    const setLoading = asDraft ? setIsSavingDraft : setIsCreating
    setLoading(true)

    try {
      const configuration = {
        systemPrompt,
        examplePrompts: examplePrompts.filter(p => p.trim()),
        temperature: parseFloat(temperature),
        maxTokens,
        enableMemory,
        requireCitations,
        dataSources,
        outputFormats,
        tags,
      }

      const response = await fetch('/api/v1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          type,
          configuration,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create agent')
      }

      const data = await response.json()
      toast.success(asDraft ? 'Agent draft saved' : 'Agent created successfully')
      router.push(`/dashboard/agents/${data.id}`)
    } catch (err) {
      console.error('Failed to create agent:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to create agent')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/agents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Custom Agent</h1>
            <p className="text-muted-foreground">Build a specialized agent for your unique research needs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => handleCreate(true)}
            disabled={isSavingDraft || isCreating}
          >
            {isSavingDraft ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Draft
          </Button>
          <Button
            className="gap-2"
            onClick={() => handleCreate(false)}
            disabled={isCreating || isSavingDraft}
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Create Agent
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Agent Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Brand Perception Analyzer"
                  className={`mt-1.5 bg-secondary ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this agent does and when to use it..."
                  className="mt-1.5 bg-secondary min-h-[80px]"
                />
              </div>
              <div>
                <Label>Agent Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as AgentType)}>
                  <SelectTrigger className="mt-1.5 bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESEARCH">Research</SelectItem>
                    <SelectItem value="ANALYSIS">Analysis</SelectItem>
                    <SelectItem value="REPORTING">Reporting</SelectItem>
                    <SelectItem value="MONITORING">Monitoring</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="bg-secondary"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>System Prompt</CardTitle>
              <Button variant="ghost" size="sm" className="gap-2 text-accent">
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder={`You are a specialized research agent focused on...

Your capabilities include:
- Analyzing consumer data from GWI sources
- Identifying patterns and trends
- Generating actionable insights

When responding:
- Always cite data sources
- Provide confidence levels for insights
- Structure responses clearly with headers`}
                className="bg-secondary min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Define the agent's personality, capabilities, and response format. Be specific about data handling and
                output structure.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Example Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {examplePrompts.map((prompt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">{i + 1}.</span>
                  <Input
                    value={prompt}
                    onChange={(e) => updateExamplePrompt(i, e.target.value)}
                    placeholder={`Example prompt ${i + 1}...`}
                    className="bg-secondary"
                  />
                </div>
              ))}
              <Button variant="ghost" size="sm" className="gap-2" onClick={addExamplePrompt}>
                <Plus className="h-4 w-4" />
                Add Example
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["GWI Core", "GWI USA", "GWI Zeitgeist", "Custom Uploads"].map((source) => (
                <div key={source} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span className="text-sm text-foreground">{source}</span>
                  <Switch
                    checked={dataSources.includes(source)}
                    onCheckedChange={() => toggleDataSource(source)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Output Formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Markdown", "JSON", "Slides", "PDF Report"].map((format) => (
                <div key={format} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span className="text-sm text-foreground">{format}</span>
                  <Switch
                    checked={outputFormats.includes(format)}
                    onCheckedChange={() => toggleOutputFormat(format)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm">Default Temperature</Label>
                <Select value={temperature} onValueChange={setTemperature}>
                  <SelectTrigger className="mt-1.5 bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.3">0.3 (Precise)</SelectItem>
                    <SelectItem value="0.5">0.5 (Balanced)</SelectItem>
                    <SelectItem value="0.7">0.7 (Creative)</SelectItem>
                    <SelectItem value="0.9">0.9 (Exploratory)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Max Tokens</Label>
                <Input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
                  className="mt-1.5 bg-secondary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Enable Memory</Label>
                  <p className="text-xs text-muted-foreground">Remember past conversations</p>
                </div>
                <Switch checked={enableMemory} onCheckedChange={setEnableMemory} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Require Citations</Label>
                  <p className="text-xs text-muted-foreground">Always include data sources</p>
                </div>
                <Switch checked={requireCitations} onCheckedChange={setRequireCitations} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
