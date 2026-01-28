"use client"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Bot, TrendingUp, Clock, CheckCircle2 } from "lucide-react"

const agents = [
  {
    name: "Audience Strategy Agent",
    queries: 5420,
    successRate: 98.5,
    avgResponseTime: "2.3s",
    trend: "+15%",
  },
  {
    name: "Creative Brief Builder",
    queries: 3890,
    successRate: 97.2,
    avgResponseTime: "3.1s",
    trend: "+8%",
  },
  {
    name: "Trend Forecaster Agent",
    queries: 3245,
    successRate: 96.8,
    avgResponseTime: "4.2s",
    trend: "+22%",
  },
  {
    name: "Competitive Tracker",
    queries: 2890,
    successRate: 99.1,
    avgResponseTime: "2.8s",
    trend: "+5%",
  },
  {
    name: "Media Mix Agent",
    queries: 2456,
    successRate: 95.4,
    avgResponseTime: "3.5s",
    trend: "+12%",
  },
]

export function AgentPerformance() {
  const t = useTranslations("dashboard.analytics.agentPerformance")
  const maxQueries = Math.max(...agents.map((a) => a.queries))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {agents.map((agent) => (
          <div key={agent.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{agent.name}</span>
              </div>
              <Badge variant="outline" className="text-emerald-500">
                <TrendingUp className="mr-1 h-3 w-3" />
                {agent.trend}
              </Badge>
            </div>
            <Progress value={(agent.queries / maxQueries) * 100} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{agent.queries.toLocaleString()} {t("queries")}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {agent.successRate}%
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {agent.avgResponseTime}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
