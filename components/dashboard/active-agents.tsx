"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Lightbulb, Target, PieChart, Bot, Loader2 } from "lucide-react"
import Link from "next/link"

interface Agent {
  id: string
  name: string
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  type: string
  _count?: {
    runs: number
  }
}

// Map agent types to icons
const typeIcons: Record<string, typeof Users> = {
  RESEARCH: Users,
  ANALYSIS: PieChart,
  MONITORING: Target,
  REPORTING: Lightbulb,
  CUSTOM: Bot,
}

// Demo agents shown when API returns empty or errors
const demoAgents = [
  { id: "1", name: "Audience Strategist", type: "RESEARCH", status: "ACTIVE" as const, _count: { runs: 3 } },
  { id: "2", name: "Creative Brief Builder", type: "REPORTING", status: "ACTIVE" as const, _count: { runs: 1 } },
  { id: "3", name: "Competitive Tracker", type: "MONITORING", status: "ACTIVE" as const, _count: { runs: 0 } },
  { id: "4", name: "Trend Forecaster", type: "ANALYSIS", status: "ACTIVE" as const, _count: { runs: 0 } },
  { id: "5", name: "Survey Analyst", type: "ANALYSIS", status: "ACTIVE" as const, _count: { runs: 0 } },
]

export function ActiveAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const t = useTranslations('dashboard.activeAgents')

  useEffect(() => {
    async function fetchAgents() {
      try {
        const response = await fetch('/api/v1/agents?status=ACTIVE&limit=5')
        if (!response.ok) {
          setAgents(demoAgents)
          return
        }
        const data = await response.json()
        const fetchedAgents = data.agents || data.data || []

        if (fetchedAgents.length === 0) {
          setAgents(demoAgents)
        } else {
          setAgents(fetchedAgents.slice(0, 5))
        }
      } catch (err) {
        console.error('Failed to fetch active agents:', err)
        setAgents(demoAgents)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgents()
  }, [])

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">{t('title')}</CardTitle>
        <Link href="/dashboard/agents">
          <Button variant="ghost" size="sm">
            {t('manage')}
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          agents.map((agent) => {
            const Icon = typeIcons[agent.type] || Bot
            const isActive = agent._count?.runs && agent._count.runs > 0
            return (
              <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? "bg-accent/20" : "bg-muted"}`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? "text-accent" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {isActive ? t('activeTasks', { count: agent._count?.runs || 0 }) : t('idle')}
                  </p>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${isActive ? "bg-chart-5 animate-pulse" : "bg-muted-foreground/30"}`}
                />
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
