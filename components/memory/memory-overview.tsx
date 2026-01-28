"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, ChevronRight, Trash2, RefreshCw } from "lucide-react"

const projects = [
  {
    name: "Gen Z Sustainability",
    memories: 847,
    lastUpdated: "2 hours ago",
    agents: ["Audience Strategist", "Trend Forecaster"],
    size: "156 MB",
  },
  {
    name: "Q4 Campaign Planning",
    memories: 523,
    lastUpdated: "1 day ago",
    agents: ["Creative Brief Builder"],
    size: "98 MB",
  },
  {
    name: "Competitor Analysis",
    memories: 312,
    lastUpdated: "3 days ago",
    agents: ["Competitive Tracker"],
    size: "67 MB",
  },
]

const recentMemories = [
  {
    id: "1",
    type: "insight",
    content:
      "Gen Z consumers show 67% higher engagement with sustainability messaging when it includes specific environmental impact metrics.",
    source: "Audience Strategist",
    project: "Gen Z Sustainability",
    timestamp: "2 hours ago",
    confidence: 94,
  },
  {
    id: "2",
    type: "context",
    content: "User prefers concise bullet-point summaries over narrative formats for audience insights.",
    source: "System",
    project: "Global",
    timestamp: "1 day ago",
    confidence: 100,
  },
  {
    id: "3",
    type: "finding",
    content:
      "Cross-market comparison reveals EU markets are 2.3x more likely to pay premium for sustainable products vs. NA.",
    source: "Market Expander",
    project: "Gen Z Sustainability",
    timestamp: "2 days ago",
    confidence: 89,
  },
]

export function MemoryOverview() {
  const t = useTranslations("memory")
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("overview.projectMemory")}</CardTitle>
          <Button variant="ghost" size="sm">
            {t("overview.viewAll")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.name}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Brain className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground truncate">{project.name}</h4>
                  <span className="text-xs text-muted-foreground">{project.size}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("overview.memoriesCount", { count: project.memories.toLocaleString() })} · {project.lastUpdated}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {project.agents.map((agent) => (
                    <Badge key={agent} variant="secondary" className="text-xs">
                      {agent}
                    </Badge>
                  ))}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("overview.recentMemories")}</CardTitle>
          <Button variant="ghost" size="sm" className="gap-2">
            <RefreshCw className="h-3 w-3" />
            {t("overview.refresh")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentMemories.map((memory) => (
            <div key={memory.id} className="p-4 rounded-lg border border-border bg-secondary/30 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {memory.type}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-chart-5 font-medium">{memory.confidence}%</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-foreground">{memory.content}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {memory.source} · {memory.project}
                </span>
                <span>{memory.timestamp}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
