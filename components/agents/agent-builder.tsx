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
import { ArrowLeft, Save, Play, Plus, X, Sparkles } from "lucide-react"
import Link from "next/link"

export function AgentBuilder() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
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
          <Button variant="outline" className="gap-2 bg-transparent">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button className="gap-2">
            <Play className="h-4 w-4" />
            Test Agent
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
                <Label>Agent Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Brand Perception Analyzer"
                  className="mt-1.5 bg-secondary"
                />
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
                <Label>Category</Label>
                <Select defaultValue="analysis">
                  <SelectTrigger className="mt-1.5 bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="content">Content Generation</SelectItem>
                    <SelectItem value="prediction">Prediction</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                    <SelectItem value="automation">Automation</SelectItem>
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">{i}.</span>
                  <Input placeholder={`Example prompt ${i}...`} className="bg-secondary" />
                </div>
              ))}
              <Button variant="ghost" size="sm" className="gap-2">
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
                  <Switch defaultChecked={source === "GWI Core"} />
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
                  <Switch defaultChecked={format === "Markdown"} />
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
                <Select defaultValue="0.7">
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
                <Input type="number" defaultValue={4096} className="mt-1.5 bg-secondary" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Enable Memory</Label>
                  <p className="text-xs text-muted-foreground">Remember past conversations</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Require Citations</Label>
                  <p className="text-xs text-muted-foreground">Always include data sources</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
