"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Users,
  Database,
  History,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Sparkles,
  Globe,
  Heart,
  TrendingUp,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlayground } from "@/app/dashboard/playground/page"
import { useState } from "react"

const agents = [
  {
    id: "audience-explorer",
    name: "Audience Explorer",
    description: "Discover and analyze consumer segments",
    icon: Search,
    color: "text-blue-500",
    capabilities: ["Segmentation", "Demographics", "Behaviors"],
  },
  {
    id: "persona-architect",
    name: "Persona Architect",
    description: "Build rich, data-driven personas",
    icon: Users,
    color: "text-purple-500",
    capabilities: ["Personas", "Motivations", "Journeys"],
  },
  {
    id: "motivation-decoder",
    name: "Motivation Decoder",
    description: "Uncover the 'why' behind behavior",
    icon: Heart,
    color: "text-rose-500",
    capabilities: ["Values", "Emotions", "Decisions"],
  },
  {
    id: "culture-tracker",
    name: "Culture Tracker",
    description: "Monitor cultural shifts and trends",
    icon: TrendingUp,
    color: "text-emerald-500",
    capabilities: ["Trends", "Movements", "Zeitgeist"],
  },
  {
    id: "brand-analyst",
    name: "Brand Relationship Analyst",
    description: "Examine brand-consumer connections",
    icon: Sparkles,
    color: "text-amber-500",
    capabilities: ["Perception", "Loyalty", "Affinity"],
  },
  {
    id: "global-perspective",
    name: "Global Perspective",
    description: "Compare behaviors across markets",
    icon: Globe,
    color: "text-cyan-500",
    capabilities: ["Cross-Market", "Cultural", "Expansion"],
  },
]

const dataSources = [
  { id: "gwi-core", name: "GWI Core", description: "2.8B consumers, 52 markets", records: "2.8B" },
  { id: "gwi-usa", name: "GWI USA", description: "US-specific insights", records: "48M" },
  { id: "gwi-zeitgeist", name: "GWI Zeitgeist", description: "Monthly pulse trends", records: "Nov 2024" },
  { id: "custom-data", name: "Custom Upload", description: "Your uploaded data", records: "—" },
]

const sessionHistory = [
  {
    id: "1",
    name: "Gen Z Sustainability Analysis",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    agent: "audience-explorer",
  },
  {
    id: "2",
    name: "US vs UK Market Comparison",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    agent: "global-perspective",
  },
  {
    id: "3",
    name: "Brand Perception Deep Dive",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    agent: "brand-analyst",
  },
  {
    id: "4",
    name: "Q1 Trend Forecast",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    agent: "culture-tracker",
  },
]

export function PlaygroundSidebar() {
  const { config, setConfig, setMessages, resetChat } = usePlayground()
  const [collapsed, setCollapsed] = useState(false)
  const [sessions, setSessions] = useState(sessionHistory)

  const handleAgentChange = (agentId: string) => {
    setConfig((prev) => ({ ...prev, selectedAgent: agentId }))

    const agentGreetings: Record<string, string> = {
      "audience-explorer":
        "Hello! I'm the Audience Explorer agent. I can help you discover and analyze consumer segments, build detailed profiles, and uncover behavioral patterns. What audience would you like to explore today?",
      "persona-architect":
        "Hi there! I'm the Persona Architect. I create rich, data-driven personas based on real consumer data. I can visualize motivations, pain points, and media habits. Who should we bring to life?",
      "motivation-decoder":
        "Welcome! I'm the Motivation Decoder. I analyze the 'why' behind consumer behavior - values, beliefs, and emotional drivers. What consumer motivations shall we unpack?",
      "culture-tracker":
        "Hello! I'm the Culture Tracker. I monitor cultural shifts, emerging movements, and societal trends that shape consumer behavior. What cultural phenomenon interests you?",
      "brand-analyst":
        "Hi! I'm the Brand Relationship Analyst. I examine how consumers connect with brands emotionally and functionally. Which brand relationships should we explore?",
      "global-perspective":
        "Welcome! I'm the Global Perspective Agent. I compare consumer behaviors across markets and cultures to identify universal truths and local nuances. Which markets shall we compare?",
    }

    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: agentGreetings[agentId] || agentGreetings["audience-explorer"],
        status: "complete",
      },
    ])
  }

  const toggleSource = (sourceId: string) => {
    setConfig((prev) => ({
      ...prev,
      selectedSources: prev.selectedSources.includes(sourceId)
        ? prev.selectedSources.filter((id) => id !== sourceId)
        : [...prev.selectedSources, sourceId],
    }))
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    return `${diffDays}d ago`
  }

  const deleteSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId))
  }

  const selectedAgent = agents.find((a) => a.id === config.selectedAgent)

  return (
    <div
      className={cn(
        "border-r border-border bg-card transition-all duration-300 flex flex-col",
        collapsed ? "w-14" : "w-80",
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!collapsed && <span className="text-sm font-semibold text-foreground">Configuration</span>}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 ml-auto">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {collapsed ? (
        <div className="flex-1 flex flex-col items-center py-4 gap-2">
          <Button
            variant={config.selectedAgent ? "secondary" : "ghost"}
            size="icon"
            className="h-10 w-10"
            title="Agents"
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10" title="Data Sources">
            <Database className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10" title="Settings">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10" title="History">
            <History className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="agents" className="w-full">
            <TabsList
              className="w-full grid grid-cols-4 bg-secondary/50 m-3 mb-0"
              style={{ width: "calc(100% - 24px)" }}
            >
              <TabsTrigger value="agents" className="text-xs px-2">
                <Users className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs px-2">
                <Database className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs px-2">
                <Settings className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs px-2">
                <History className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="p-3 space-y-3 mt-0">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Select Agent</Label>
                <div className="space-y-2">
                  {agents.map((agent) => {
                    const Icon = agent.icon
                    return (
                      <button
                        key={agent.id}
                        onClick={() => handleAgentChange(agent.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-all",
                          config.selectedAgent === agent.id
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-muted-foreground/30",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              config.selectedAgent === agent.id ? "bg-accent/20" : "bg-secondary",
                            )}
                          >
                            <Icon className={cn("h-4 w-4", agent.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{agent.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{agent.description}</p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {agent.capabilities.map((cap) => (
                                <Badge key={cap} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                  {cap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="p-3 space-y-3 mt-0">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Data Sources</Label>
                <div className="space-y-2">
                  {dataSources.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => toggleSource(source.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        config.selectedSources.includes(source.id)
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-muted-foreground/30",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{source.name}</p>
                            <Badge variant="secondary" className="text-[10px]">
                              {source.records}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{source.description}</p>
                        </div>
                        <div
                          className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ml-2",
                            config.selectedSources.includes(source.id)
                              ? "border-accent bg-accent"
                              : "border-muted-foreground/30",
                          )}
                        >
                          {config.selectedSources.includes(source.id) && (
                            <svg
                              className="w-3 h-3 text-accent-foreground"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 text-xs bg-transparent">
                  <Database className="h-3.5 w-3.5 mr-2" />
                  Upload Custom Data
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-3 space-y-6 mt-0">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Model</Label>
                  <Select
                    value={config.model}
                    onValueChange={(value) => setConfig((prev) => ({ ...prev, model: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini (Faster)</SelectItem>
                      <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Enable Memory</Label>
                    <p className="text-xs text-muted-foreground">Persist context across sessions</p>
                  </div>
                  <Switch
                    checked={config.enableMemory}
                    onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, enableMemory: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Show Citations</Label>
                    <p className="text-xs text-muted-foreground">Display source references</p>
                  </div>
                  <Switch
                    checked={config.enableCitations}
                    onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, enableCitations: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Reasoning Mode</Label>
                    <p className="text-xs text-muted-foreground">Show agent thought process</p>
                  </div>
                  <Switch
                    checked={config.reasoningMode}
                    onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, reasoningMode: checked }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-foreground">Temperature</Label>
                    <span className="text-xs font-mono text-muted-foreground">{config.temperature}</span>
                  </div>
                  <Slider
                    value={[config.temperature]}
                    onValueChange={(value) => setConfig((prev) => ({ ...prev, temperature: value[0] }))}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Output Format</Label>
                  <Select
                    value={config.outputFormat}
                    onValueChange={(value) => setConfig((prev) => ({ ...prev, outputFormat: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rich">Rich (Charts + Tables)</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="slides">Presentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Max Tokens</Label>
                  <Input
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, maxTokens: Number.parseInt(e.target.value) || 4096 }))
                    }
                    className="bg-secondary"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-3 space-y-3 mt-0">
              <div className="space-y-2">
                {sessions.map((session) => {
                  const agent = agents.find((a) => a.id === session.agent)
                  const Icon = agent?.icon || Users
                  return (
                    <div
                      key={session.id}
                      className="group w-full text-left p-3 rounded-lg border border-border hover:border-muted-foreground/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <Icon className={cn("h-4 w-4", agent?.color || "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground line-clamp-1">{session.name}</p>
                              <p className="text-xs text-muted-foreground">{formatTimestamp(session.timestamp)}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteSession(session.id)
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {sessions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No session history</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
