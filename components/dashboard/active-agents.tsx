import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Lightbulb, Target, TrendingUp, PieChart } from "lucide-react"
import Link from "next/link"

const agents = [
  { name: "Audience Strategist", icon: Users, status: "active", tasks: 3 },
  { name: "Creative Brief Builder", icon: Lightbulb, status: "active", tasks: 1 },
  { name: "Competitive Tracker", icon: Target, status: "idle", tasks: 0 },
  { name: "Trend Forecaster", icon: TrendingUp, status: "idle", tasks: 0 },
  { name: "Survey Analyst", icon: PieChart, status: "idle", tasks: 0 },
]

export function ActiveAgents() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">Active Agents</CardTitle>
        <Link href="/dashboard/agents">
          <Button variant="ghost" size="sm">
            Manage
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {agents.map((agent) => (
          <div key={agent.name} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${agent.status === "active" ? "bg-accent/20" : "bg-muted"}`}
            >
              <agent.icon
                className={`h-4 w-4 ${agent.status === "active" ? "text-accent" : "text-muted-foreground"}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{agent.name}</p>
              <p className="text-xs text-muted-foreground">
                {agent.status === "active" ? `${agent.tasks} active tasks` : "Idle"}
              </p>
            </div>
            <div
              className={`w-2 h-2 rounded-full ${agent.status === "active" ? "bg-chart-5 animate-pulse" : "bg-muted-foreground/30"}`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
