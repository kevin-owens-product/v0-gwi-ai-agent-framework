"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Lightbulb,
  Target,
  TrendingUp,
  PieChart,
  Globe,
  Star,
  Play,
  Settings,
  Brain,
  FileText,
} from "lucide-react"
import Link from "next/link"

const agents = [
  {
    id: "audience-strategist",
    name: "Audience Strategist",
    description:
      "Analyzes consumer segments, identifies high-value audiences, and recommends targeting strategies based on demographic and behavioral data.",
    icon: Users,
    color: "bg-chart-1/20 text-chart-1",
    category: "Analysis",
    type: "official",
    rating: 4.9,
    usage: "12.4K",
    tags: ["Segmentation", "Targeting", "Demographics"],
  },
  {
    id: "creative-brief",
    name: "Creative Brief Builder",
    description:
      "Generates comprehensive creative briefs with audience insights, messaging recommendations, channel strategies, and campaign frameworks.",
    icon: Lightbulb,
    color: "bg-chart-2/20 text-chart-2",
    category: "Content",
    type: "official",
    rating: 4.8,
    usage: "8.7K",
    tags: ["Creative", "Briefs", "Campaigns"],
  },
  {
    id: "competitive-tracker",
    name: "Competitive Tracker",
    description:
      "Monitors competitor positioning, tracks market share trends, analyzes competitive strategies, and identifies market opportunities.",
    icon: Target,
    color: "bg-chart-3/20 text-chart-3",
    category: "Analysis",
    type: "official",
    rating: 4.7,
    usage: "6.2K",
    tags: ["Competition", "Market Share", "Strategy"],
  },
  {
    id: "trend-forecaster",
    name: "Trend Forecaster",
    description:
      "Predicts emerging consumer trends using historical data patterns, cultural signals, and predictive modeling techniques.",
    icon: TrendingUp,
    color: "bg-chart-4/20 text-chart-4",
    category: "Prediction",
    type: "official",
    rating: 4.6,
    usage: "5.8K",
    tags: ["Trends", "Forecasting", "Prediction"],
  },
  {
    id: "survey-analyst",
    name: "Survey Analyst",
    description:
      "Automates survey data analysis, generates statistical summaries, identifies key findings, and creates visual reports.",
    icon: PieChart,
    color: "bg-chart-5/20 text-chart-5",
    category: "Analysis",
    type: "official",
    rating: 4.8,
    usage: "9.1K",
    tags: ["Surveys", "Statistics", "Reports"],
  },
  {
    id: "market-expander",
    name: "Market Expander",
    description:
      "Evaluates new market opportunities by analyzing cross-market consumer behaviors, preferences, and market entry strategies.",
    icon: Globe,
    color: "bg-accent/20 text-accent",
    category: "Strategy",
    type: "official",
    rating: 4.5,
    usage: "3.4K",
    tags: ["Expansion", "Markets", "Strategy"],
  },
  {
    id: "insight-summarizer",
    name: "Insight Summarizer",
    description:
      "Condenses complex research findings into executive summaries, key takeaways, and actionable recommendations.",
    icon: FileText,
    color: "bg-chart-1/20 text-chart-1",
    category: "Content",
    type: "community",
    rating: 4.4,
    usage: "2.1K",
    tags: ["Summaries", "Executive", "Reports"],
  },
  {
    id: "brand-health",
    name: "Brand Health Monitor",
    description:
      "Tracks brand perception metrics, sentiment analysis, and brand equity indicators across target demographics.",
    icon: Brain,
    color: "bg-chart-2/20 text-chart-2",
    category: "Analysis",
    type: "community",
    rating: 4.3,
    usage: "1.8K",
    tags: ["Brand", "Perception", "Sentiment"],
  },
]

export function AgentGrid({ filter }: { filter: string }) {
  const filteredAgents = filter === "all" ? agents : agents.filter((a) => a.type === filter)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredAgents.map((agent) => (
        <Card key={agent.id} className="bg-card border-border hover:border-muted-foreground/30 transition-all group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${agent.color} flex items-center justify-center`}>
                <agent.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-chart-3 fill-chart-3" />
                <span className="text-sm font-medium text-foreground">{agent.rating}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/agents/${agent.id}`}>
                  <h3 className="font-semibold text-foreground hover:text-accent transition-colors">{agent.name}</h3>
                </Link>
                {agent.type === "official" && (
                  <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-0">
                    Official
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {agent.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{agent.category}</span>
                <span>{agent.usage} uses</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-6 pb-6 pt-0 gap-2">
            <Link href={`/dashboard/playground?agent=${agent.id}`} className="flex-1">
              <Button variant="secondary" className="w-full gap-2">
                <Play className="h-4 w-4" />
                Try Agent
              </Button>
            </Link>
            <Link href={`/dashboard/agents/${agent.id}`}>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
