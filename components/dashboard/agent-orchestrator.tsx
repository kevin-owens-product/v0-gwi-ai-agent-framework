"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Lightbulb, Target, TrendingUp, PieChart, ArrowRight, Play } from "lucide-react"
import Link from "next/link"

const agents = [
  {
    name: "Audience Strategist",
    icon: Users,
    status: "active",
    tasks: 3,
    load: 75,
  },
  {
    name: "Creative Brief Builder",
    icon: Lightbulb,
    status: "active",
    tasks: 1,
    load: 45,
  },
  {
    name: "Competitive Tracker",
    icon: Target,
    status: "idle",
    tasks: 0,
    load: 0,
  },
  {
    name: "Trend Forecaster",
    icon: TrendingUp,
    status: "idle",
    tasks: 0,
    load: 0,
  },
  {
    name: "Survey Analyst",
    icon: PieChart,
    status: "active",
    tasks: 2,
    load: 60,
  },
]

export function AgentOrchestrator() {
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
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors group"
          >
            <div className={`p-2 rounded-lg ${agent.status === "active" ? "bg-emerald-500/10" : "bg-muted"}`}>
              <agent.icon
                className={`h-4 w-4 ${agent.status === "active" ? "text-emerald-400" : "text-muted-foreground"}`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground truncate">{agent.name}</p>
                <div className="flex items-center gap-2">
                  {agent.status === "active" ? (
                    <span className="text-xs text-muted-foreground">
                      {agent.tasks} task{agent.tasks !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                  )}
                </div>
              </div>

              {agent.status === "active" && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${agent.load}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{agent.load}%</span>
                </div>
              )}
            </div>

            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                agent.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/30"
              }`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
