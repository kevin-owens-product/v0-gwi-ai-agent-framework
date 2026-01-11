"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Target,
  PieChart,
  Play,
  Settings,
  Brain,
  FileText,
  Loader2,
  Bot,
} from "lucide-react"
import Link from "next/link"

interface Agent {
  id: string
  name: string
  description: string | null
  type: 'RESEARCH' | 'ANALYSIS' | 'REPORTING' | 'MONITORING' | 'CUSTOM'
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  configuration: Record<string, unknown>
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    name: string | null
    email: string
  }
  _count?: {
    runs: number
  }
}

// Map agent types to icons and colors
const typeConfig: Record<string, { icon: typeof Users; color: string }> = {
  RESEARCH: { icon: Users, color: "bg-chart-1/20 text-chart-1" },
  ANALYSIS: { icon: PieChart, color: "bg-chart-2/20 text-chart-2" },
  REPORTING: { icon: FileText, color: "bg-chart-3/20 text-chart-3" },
  MONITORING: { icon: Target, color: "bg-chart-4/20 text-chart-4" },
  CUSTOM: { icon: Brain, color: "bg-chart-5/20 text-chart-5" },
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-emerald-500/10 text-emerald-400",
  PAUSED: "bg-yellow-500/10 text-yellow-400",
  ARCHIVED: "bg-red-500/10 text-red-400",
}

// Demo agents shown when API returns empty or errors
const demoAgents: Agent[] = [
  {
    id: "audience-explorer",
    name: "Audience Explorer",
    description: "Discover and analyze consumer segments, build detailed personas, and uncover behavioral patterns across global markets using GWI data.",
    type: "RESEARCH",
    status: "ACTIVE",
    configuration: { model: "gpt-4o", temperature: 0.7, enableCitations: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: { id: "system", name: "GWI", email: "system@gwi.com" },
    _count: { runs: 1247 },
  },
  {
    id: "persona-architect",
    name: "Persona Architect",
    description: "Create rich, data-driven personas based on real consumer data. Visualize motivations, pain points, media habits, and journey maps.",
    type: "RESEARCH",
    status: "ACTIVE",
    configuration: { model: "gpt-4o", temperature: 0.8, outputFormat: "rich" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: { id: "system", name: "GWI", email: "system@gwi.com" },
    _count: { runs: 892 },
  },
  {
    id: "motivation-decoder",
    name: "Motivation Decoder",
    description: "Analyze the 'why' behind consumer behavior - values, beliefs, emotional drivers, and decision factors that shape purchasing decisions.",
    type: "ANALYSIS",
    status: "ACTIVE",
    configuration: { model: "gpt-4o", temperature: 0.6, reasoningMode: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: { id: "system", name: "GWI", email: "system@gwi.com" },
    _count: { runs: 654 },
  },
  {
    id: "culture-tracker",
    name: "Culture Tracker",
    description: "Monitor cultural shifts, emerging movements, and societal trends that shape consumer behavior. Track viral content and sentiment.",
    type: "MONITORING",
    status: "ACTIVE",
    configuration: { model: "gpt-4o", temperature: 0.7, sources: ["zeitgeist", "social"] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: { id: "system", name: "GWI", email: "system@gwi.com" },
    _count: { runs: 2103 },
  },
  {
    id: "brand-analyst",
    name: "Brand Relationship Analyst",
    description: "Examine how consumers connect with brands emotionally and functionally. Analyze brand perception, loyalty, and competitive positioning.",
    type: "ANALYSIS",
    status: "ACTIVE",
    configuration: { model: "gpt-4o", temperature: 0.7, enableBenchmarks: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: { id: "system", name: "GWI", email: "system@gwi.com" },
    _count: { runs: 1456 },
  },
  {
    id: "global-perspective",
    name: "Global Perspective Agent",
    description: "Compare consumer behaviors across markets and cultures. Identify universal truths and local nuances for international strategy.",
    type: "RESEARCH",
    status: "ACTIVE",
    configuration: { model: "gpt-4o", temperature: 0.7, markets: ["all"] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: { id: "system", name: "GWI", email: "system@gwi.com" },
    _count: { runs: 987 },
  },
  {
    id: "trend-forecaster",
    name: "Trend Forecaster",
    description: "Predict emerging consumer trends using historical data patterns, social signals, and market indicators. Generate actionable forecasts.",
    type: "ANALYSIS",
    status: "ACTIVE",
    configuration: { model: "gpt-4o", temperature: 0.5, forecastHorizon: "12months" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: { id: "system", name: "GWI", email: "system@gwi.com" },
    _count: { runs: 743 },
  },
  {
    id: "campaign-strategist",
    name: "Campaign Strategist",
    description: "Design data-driven marketing campaigns with audience targeting, channel recommendations, and message optimization based on consumer insights.",
    type: "REPORTING",
    status: "ACTIVE",
    configuration: { model: "gpt-4o", temperature: 0.8, outputFormat: "presentation" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: { id: "system", name: "GWI", email: "system@gwi.com" },
    _count: { runs: 1089 },
  },
  {
    id: "competitive-intel",
    name: "Competitive Intelligence",
    description: "Track competitor brand perception, market share, and consumer sentiment. Generate competitive analysis reports and opportunity maps.",
    type: "MONITORING",
    status: "ACTIVE",
    configuration: { model: "gpt-4o", temperature: 0.6, trackCompetitors: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: { id: "system", name: "GWI", email: "system@gwi.com" },
    _count: { runs: 1567 },
  },
  {
    id: "survey-analyst",
    name: "Survey Analyst",
    description: "Analyze survey data with statistical rigor. Generate cross-tabs, significance tests, and visualizations from custom research data.",
    type: "ANALYSIS",
    status: "ACTIVE",
    configuration: { model: "gpt-4o", temperature: 0.4, enableStatistics: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: { id: "system", name: "GWI", email: "system@gwi.com" },
    _count: { runs: 621 },
  },
]

export function AgentGrid({ filter, search }: { filter: string; search?: string }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [_usingDemoData, setUsingDemoData] = useState(false)

  useEffect(() => {
    async function fetchAgents() {
      setIsLoading(true)
      setError(null)
      setUsingDemoData(false)
      try {
        const params = new URLSearchParams()
        if (filter !== 'all' && filter !== 'official' && filter !== 'community') {
          // For 'custom' filter, show user's own agents (CUSTOM type)
          if (filter === 'custom') {
            params.append('type', 'CUSTOM')
          }
        }
        if (search) {
          params.append('search', search)
        }

        const response = await fetch(`/api/v1/agents?${params.toString()}`)
        if (!response.ok) {
          // Use demo data on error
          let filteredDemo = demoAgents
          if (search) {
            const searchLower = search.toLowerCase()
            filteredDemo = demoAgents.filter(a =>
              a.name.toLowerCase().includes(searchLower) ||
              a.description?.toLowerCase().includes(searchLower)
            )
          }
          setAgents(filteredDemo)
          setUsingDemoData(true)
          return
        }
        const data = await response.json()
        const fetchedAgents = data.agents || data.data || []

        // If no agents returned, use demo data
        if (fetchedAgents.length === 0 && filter === 'all') {
          let filteredDemo = demoAgents
          if (search) {
            const searchLower = search.toLowerCase()
            filteredDemo = demoAgents.filter(a =>
              a.name.toLowerCase().includes(searchLower) ||
              a.description?.toLowerCase().includes(searchLower)
            )
          }
          setAgents(filteredDemo)
          setUsingDemoData(true)
        } else {
          setAgents(fetchedAgents)
        }
      } catch (err) {
        console.error('Failed to fetch agents:', err)
        // Use demo data on error
        let filteredDemo = demoAgents
        if (search) {
          const searchLower = search.toLowerCase()
          filteredDemo = demoAgents.filter(a =>
            a.name.toLowerCase().includes(searchLower) ||
            a.description?.toLowerCase().includes(searchLower)
          )
        }
        setAgents(filteredDemo)
        setUsingDemoData(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgents()
  }, [filter, search])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm text-red-400 mb-2">Error loading agents</p>
        <p className="text-xs">{error}</p>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Bot className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium mb-1">No agents found</p>
        <p className="text-sm mb-4">Create your first agent to get started</p>
        <Link href="/dashboard/agents/new">
          <Button>Create Agent</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {agents.map((agent) => {
        const config = typeConfig[agent.type] || typeConfig.CUSTOM
        const Icon = config.icon
        const runCount = agent._count?.runs || 0

        return (
          <Card key={agent.id} className="bg-card border-border hover:border-muted-foreground/30 transition-all group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center`}>
                  <Icon className="h-6 w-6" />
                </div>
                <Badge className={statusColors[agent.status]}>
                  {agent.status.toLowerCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/agents/${agent.id}`}>
                    <h3 className="font-semibold text-foreground hover:text-accent transition-colors">{agent.name}</h3>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {agent.description || "No description provided"}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4">
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {agent.type.toLowerCase()}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{runCount} runs</span>
                  <span>by {agent.creator?.name || 'Unknown'}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-0 gap-2">
              <Link href={`/dashboard/playground?agent=${agent.id}`} className="flex-1">
                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  disabled={agent.status !== 'ACTIVE'}
                >
                  <Play className="h-4 w-4" />
                  Run Agent
                </Button>
              </Link>
              <Link href={`/dashboard/agents/${agent.id}`}>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
