"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Lightbulb, Target, TrendingUp, PieChart, ArrowRight, Play, Bot, Loader2, Inbox } from "lucide-react"
import Link from "next/link"

interface Agent {
  id: string
  name: string
  type: string
  status: string
  _count?: { runs: number }
}

interface AgentOrchestratorProps {
  orgId?: string
}

const typeIcons: Record<string, typeof Users> = {
  RESEARCH: Users,
  ANALYSIS: Lightbulb,
  REPORTING: Target,
  MONITORING: TrendingUp,
  CUSTOM: PieChart,
}

// Demo agents shown when API is unavailable
const demoAgents: Agent[] = [
  {
    id: "audience-explorer",
    name: "Audience Explorer",
    type: "RESEARCH",
    status: "ACTIVE",
    _count: { runs: 1247 },
  },
  {
    id: "culture-tracker",
    name: "Culture Tracker",
    type: "MONITORING",
    status: "ACTIVE",
    _count: { runs: 2103 },
  },
  {
    id: "brand-analyst",
    name: "Brand Analyst",
    type: "ANALYSIS",
    status: "ACTIVE",
    _count: { runs: 1456 },
  },
  {
    id: "campaign-strategist",
    name: "Campaign Strategist",
    type: "REPORTING",
    status: "ACTIVE",
    _count: { runs: 1089 },
  },
  {
    id: "trend-forecaster",
    name: "Trend Forecaster",
    type: "ANALYSIS",
    status: "DRAFT",
    _count: { runs: 0 },
  },
]

export function AgentOrchestrator({ orgId }: AgentOrchestratorProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAgents() {
      try {
        const response = await fetch('/api/v1/agents?limit=5')
        if (response.ok) {
          const data = await response.json()
          const fetchedAgents = data.agents || []
          // Use demo data if API returns empty
          setAgents(fetchedAgents.length > 0 ? fetchedAgents : demoAgents)
        } else {
          // Use demo data on API error
          setAgents(demoAgents)
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error)
        // Use demo data on error
        setAgents(demoAgents)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgents()
  }, [orgId])

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-medium">Agent Orchestrator</CardTitle>
        <Link href="/dashboard/agents">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            Manage
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bot className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No agents yet</p>
            <Link href="/dashboard/agents/new">
              <Button variant="outline" size="sm" className="mt-2">
                Create Agent
              </Button>
            </Link>
          </div>
        ) : (
          agents.map((agent) => {
            const Icon = typeIcons[agent.type] || Bot
            const isActive = agent.status === "ACTIVE"
            const runCount = agent._count?.runs || 0

            return (
              <Link key={agent.id} href={`/dashboard/agents/${agent.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors group cursor-pointer">
                  <div className={`p-2 rounded-lg ${isActive ? "bg-emerald-500/10" : "bg-muted"}`}>
                    <Icon
                      className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-muted-foreground"}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">{agent.name}</p>
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <span className="text-xs text-muted-foreground">
                            {runCount} run{runCount !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={async (e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              try {
                                const response = await fetch(`/api/v1/agents/${agent.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'ACTIVE' }),
                                })
                                if (response.ok) {
                                  setAgents(prev =>
                                    prev.map(a =>
                                      a.id === agent.id ? { ...a, status: 'ACTIVE' } : a
                                    )
                                  )
                                }
                              } catch (error) {
                                console.error('Failed to activate agent:', error)
                              }
                            }}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground capitalize">
                        {agent.type.toLowerCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className={`text-xs ${isActive ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {agent.status.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isActive ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/30"
                    }`}
                  />
                </div>
              </Link>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
