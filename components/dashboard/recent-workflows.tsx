"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Play, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface Workflow {
  id: string
  name: string
  status: 'completed' | 'running' | 'scheduled' | 'failed'
  agents: string[]
  lastRun: string
  insights: number
}

const statusConfig = {
  completed: { icon: CheckCircle2, color: "text-chart-5", bg: "bg-chart-5/10" },
  running: { icon: Play, color: "text-accent", bg: "bg-accent/10" },
  scheduled: { icon: Clock, color: "text-chart-3", bg: "bg-chart-3/10" },
  failed: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
}

// Demo workflows shown when API returns empty or errors
const demoWorkflows: Workflow[] = [
  {
    id: "1",
    name: "Gen Z Sustainability Analysis",
    status: "completed",
    agents: ["Audience Strategist", "Trend Forecaster"],
    lastRun: "2 hours ago",
    insights: 24,
  },
  {
    id: "2",
    name: "Q4 Campaign Brief Generation",
    status: "running",
    agents: ["Creative Brief Builder"],
    lastRun: "Running now",
    insights: 8,
  },
  {
    id: "3",
    name: "Competitor Market Share Tracking",
    status: "scheduled",
    agents: ["Competitive Tracker"],
    lastRun: "Scheduled for 6pm",
    insights: 0,
  },
  {
    id: "4",
    name: "EU Market Expansion Research",
    status: "failed",
    agents: ["Market Expander", "Survey Analyst"],
    lastRun: "Yesterday",
    insights: 12,
  },
]

export function RecentWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchWorkflows() {
      try {
        // TODO: Replace with actual workflows API when available
        const response = await fetch('/api/v1/workflows?limit=4')
        if (!response.ok) {
          setWorkflows(demoWorkflows)
          return
        }
        const data = await response.json()
        const fetchedWorkflows = data.workflows || data.data || []

        if (fetchedWorkflows.length === 0) {
          setWorkflows(demoWorkflows)
        } else {
          setWorkflows(fetchedWorkflows.slice(0, 4))
        }
      } catch (err) {
        // Workflows API not available yet, use demo data
        setWorkflows(demoWorkflows)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkflows()
  }, [])

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">Recent Workflows</CardTitle>
        <Link href="/dashboard/workflows">
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          workflows.map((workflow) => {
            const status = statusConfig[workflow.status]
            return (
              <div
                key={workflow.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg ${status.bg} flex items-center justify-center flex-shrink-0`}>
                  <status.icon className={`h-5 w-5 ${status.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground truncate">{workflow.name}</h4>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {workflow.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {workflow.agents.join(" → ")} · {workflow.lastRun}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-foreground">{workflow.insights}</p>
                  <p className="text-xs text-muted-foreground">insights</p>
                </div>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
