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
  Globe2,
  Heart,
  TrendingUp,
  Search,
  Bot,
  Store,
  Star,
  Brain,
  Target,
  MessageSquare,
  BarChart3,
  BookOpen,
  Package,
  Calendar,
  Presentation,
  FileText,
  PenTool,
  LineChart,
  MessageCircle,
  ListOrdered,
  CheckCircle,
  DollarSign,
  Rocket,
  Map,
  ClipboardList,
  Activity,
  Eye,
  PieChart,
  Lightbulb,
  Zap,
  Layers,
  Shield,
  UserCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlayground } from "@/app/dashboard/playground/page"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { getInstalledAgents, iconMap, type StoreAgent, uninstallAgent } from "@/lib/store-agents"
import { allSolutionAgents, solutionAreas, getAgentById, type SolutionAgent } from "@/lib/solution-agents"

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

// Icon map for solution agents
const solutionIconMap: Record<string, React.ElementType> = {
  Users,
  UserCircle,
  Brain,
  Globe,
  Globe2,
  Heart,
  Target,
  MessageSquare,
  TrendingUp,
  BarChart3,
  BookOpen,
  Package,
  Calendar,
  Presentation,
  Settings,
  FileText,
  PenTool,
  LineChart,
  MessageCircle,
  Search,
  ListOrdered,
  CheckCircle,
  DollarSign,
  Rocket,
  Map,
  ClipboardList,
  Activity,
  Eye,
  PieChart,
  Lightbulb,
  Zap,
  Layers,
  Shield,
}

// Color map for solution areas
const solutionColorMap: Record<string, string> = {
  core: "text-purple-500",
  sales: "text-blue-500",
  insights: "text-cyan-500",
  "ad-sales": "text-orange-500",
  marketing: "text-pink-500",
  "product-development": "text-green-500",
  "market-research": "text-indigo-500",
  innovation: "text-amber-500",
}

// Generate session history with relative timestamps (called lazily to avoid hydration mismatch)
function getSessionHistory() {
  const now = Date.now()
  return [
    {
      id: "1",
      name: "Gen Z Sustainability Analysis",
      timestamp: new Date(now - 2 * 60 * 60 * 1000),
      agent: "audience-explorer",
    },
    {
      id: "2",
      name: "US vs UK Market Comparison",
      timestamp: new Date(now - 24 * 60 * 60 * 1000),
      agent: "global-perspective",
    },
    {
      id: "3",
      name: "Brand Perception Deep Dive",
      timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000),
      agent: "brand-analyst",
    },
    {
      id: "4",
      name: "Q1 Trend Forecast",
      timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000),
      agent: "culture-tracker",
    },
  ]
}

// Expandable Solution Area Component
function SolutionAreaSection({
  area,
  agents,
  selectedAgent,
  onSelect,
}: {
  area: typeof solutionAreas[0]
  agents: SolutionAgent[]
  selectedAgent: string
  onSelect: (agent: SolutionAgent) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const color = solutionColorMap[area.slug] || "text-primary"

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
      >
        <span className={cn("text-sm font-medium", color)}>{area.name}</span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] h-4 px-1.5">{area.agentCount}</Badge>
          <ChevronRight className={cn("h-4 w-4 transition-transform text-muted-foreground", expanded && "rotate-90")} />
        </div>
      </button>
      {expanded && (
        <div className="space-y-1.5 mt-1.5 ml-2">
          {agents.map((solutionAgent) => {
            const IconComponent = solutionIconMap[solutionAgent.icon] || Sparkles
            const isSelected = selectedAgent === solutionAgent.id
            return (
              <button
                key={solutionAgent.id}
                onClick={() => onSelect(solutionAgent)}
                className={cn(
                  "w-full text-left p-2.5 rounded-lg border transition-all",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground/30",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0",
                      isSelected ? "bg-primary/20" : "bg-secondary",
                    )}
                  >
                    <IconComponent className={cn("h-3.5 w-3.5", color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground line-clamp-1">{solutionAgent.name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{solutionAgent.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function PlaygroundSidebar() {
  const { config, setConfig, setMessages, resetChat: _resetChat, customAgent, setCustomAgent } = usePlayground()
  const [collapsed, setCollapsed] = useState(false)
  const [sessions, setSessions] = useState(() => getSessionHistory())
  const [installedStoreAgents, setInstalledStoreAgents] = useState<StoreAgent[]>([])

  // Load installed agents on mount and listen for changes
  useEffect(() => {
    const loadInstalledAgents = () => {
      setInstalledStoreAgents(getInstalledAgents())
    }

    loadInstalledAgents()

    // Listen for install/uninstall events
    const handleInstall = () => loadInstalledAgents()
    const handleUninstall = () => loadInstalledAgents()

    window.addEventListener("agent-installed", handleInstall)
    window.addEventListener("agent-uninstalled", handleUninstall)

    return () => {
      window.removeEventListener("agent-installed", handleInstall)
      window.removeEventListener("agent-uninstalled", handleUninstall)
    }
  }, [])

  const handleAgentChange = (agentId: string) => {
    setConfig((prev) => ({ ...prev, selectedAgent: agentId }))

    // Check if it's a built-in agent
    const builtInAgent = agents.find(a => a.id === agentId)
    if (builtInAgent) {
      setCustomAgent(null)
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
      return
    }

    // Check if it's a solution agent
    const solutionAgent = getAgentById(agentId)
    if (solutionAgent) {
      setCustomAgent({
        id: solutionAgent.id,
        name: solutionAgent.name,
        description: solutionAgent.description,
        isSolutionAgent: true,
        solutionAgent: solutionAgent,
      })
      const greeting = `Hello! I'm the ${solutionAgent.name}. ${solutionAgent.description}\n\nHere are some things I can help you with:\n${solutionAgent.capabilities.slice(0, 3).map(c => `• ${c}`).join('\n')}\n\nTry asking me something like: "${solutionAgent.examplePrompts[0]}"`
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content: greeting,
          status: "complete",
        },
      ])
      return
    }

    // Check if it's an installed store agent
    const storeAgent = installedStoreAgents.find(a => a.id === agentId)
    if (storeAgent) {
      setCustomAgent({
        id: storeAgent.id,
        name: storeAgent.name,
        description: storeAgent.description,
        isStoreAgent: true,
        storeAgent: storeAgent,
      })
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content: storeAgent.greeting,
          status: "complete",
        },
      ])
    }
  }

  const handleSolutionAgentSelect = (solutionAgent: SolutionAgent) => {
    setConfig((prev) => ({ ...prev, selectedAgent: solutionAgent.id }))
    setCustomAgent({
      id: solutionAgent.id,
      name: solutionAgent.name,
      description: solutionAgent.description,
      isSolutionAgent: true,
      solutionAgent: solutionAgent,
    })
    const greeting = `Hello! I'm the ${solutionAgent.name}. ${solutionAgent.description}\n\nHere are some things I can help you with:\n${solutionAgent.capabilities.slice(0, 3).map(c => `• ${c}`).join('\n')}\n\nTry asking me something like: "${solutionAgent.examplePrompts[0]}"`
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: greeting,
        status: "complete",
      },
    ])
  }

  const handleStoreAgentSelect = (storeAgent: StoreAgent) => {
    setConfig((prev) => ({ ...prev, selectedAgent: storeAgent.id }))
    setCustomAgent({
      id: storeAgent.id,
      name: storeAgent.name,
      description: storeAgent.description,
      isStoreAgent: true,
      storeAgent: storeAgent,
    })
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: storeAgent.greeting,
        status: "complete",
      },
    ])
  }

  const handleRemoveStoreAgent = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    uninstallAgent(agentId)
    // If the removed agent was selected, switch to default
    if (config.selectedAgent === agentId) {
      handleAgentChange("audience-explorer")
    }
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
              {/* Installed Store Agents Section */}
              {installedStoreAgents.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="h-3.5 w-3.5 text-primary" />
                    <Label className="text-xs text-muted-foreground">From Store</Label>
                  </div>
                  <div className="space-y-2">
                    {installedStoreAgents.map((storeAgent) => {
                      const IconComponent = iconMap[storeAgent.iconName]
                      const isSelected = config.selectedAgent === storeAgent.id
                      return (
                        <button
                          key={storeAgent.id}
                          onClick={() => handleStoreAgentSelect(storeAgent)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border transition-all group relative",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-muted-foreground/30",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                isSelected ? "bg-primary/20" : "bg-secondary",
                              )}
                            >
                              {IconComponent && <IconComponent className={cn("h-4 w-4", storeAgent.color)} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground">{storeAgent.name}</p>
                                <div className="flex items-center gap-1 text-yellow-500">
                                  <Star className="h-3 w-3 fill-current" />
                                  <span className="text-[10px]">{storeAgent.rating}</span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">{storeAgent.description}</p>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 mt-1.5 bg-primary/20 text-primary">
                                {storeAgent.category}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                              onClick={(e) => handleRemoveStoreAgent(storeAgent.id, e)}
                              title="Remove agent"
                            >
                              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Custom agent from API */}
              {customAgent && !customAgent.isStoreAgent && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-3.5 w-3.5 text-violet-500" />
                    <Label className="text-xs text-muted-foreground">Custom Agent</Label>
                  </div>
                  <button
                    onClick={() => {
                      setConfig((prev) => ({ ...prev, selectedAgent: customAgent.id }))
                      setMessages([
                        {
                          id: Date.now().toString(),
                          role: "assistant",
                          content: `Hello! I'm ${customAgent.name}. ${customAgent.description || "How can I help you today?"}`,
                          status: "complete",
                        },
                      ])
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all",
                      config.selectedAgent === customAgent.id
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-muted-foreground/30",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          config.selectedAgent === customAgent.id ? "bg-accent/20" : "bg-secondary",
                        )}
                      >
                        <Bot className="h-4 w-4 text-violet-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{customAgent.name}</p>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-violet-500/20 text-violet-400">
                            Custom
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{customAgent.description || "Custom agent"}</p>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Built-in Agents */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Built-in Agents</Label>
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

              {/* Solution Agents by Area */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <Label className="text-xs text-muted-foreground">Solution Agents ({allSolutionAgents.length})</Label>
                </div>
                <div className="space-y-3">
                  {solutionAreas.map((area) => {
                    const areaAgents = allSolutionAgents.filter(a => a.solutionAreaSlug === area.slug)
                    return (
                      <SolutionAreaSection
                        key={area.slug}
                        area={area}
                        agents={areaAgents}
                        selectedAgent={config.selectedAgent}
                        onSelect={handleSolutionAgentSelect}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Browse Store Link */}
              <Link href="/dashboard/agents" className="block mt-4">
                <Button variant="outline" size="sm" className="w-full text-xs bg-transparent gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Browse All Agents
                </Button>
              </Link>
              <Link href="/dashboard/store" className="block">
                <Button variant="outline" size="sm" className="w-full mt-2 text-xs bg-transparent gap-2">
                  <Store className="h-3.5 w-3.5" />
                  Browse Agent Store
                </Button>
              </Link>
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
