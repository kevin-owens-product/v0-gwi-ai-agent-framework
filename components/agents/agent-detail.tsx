"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Play, Star, Copy, Users, Clock, Zap, BookOpen, Code, MessageSquare } from "lucide-react"
import Link from "next/link"

const agentData = {
  id: "audience-strategist",
  name: "Audience Strategist",
  description:
    "Analyzes consumer segments, identifies high-value audiences, and recommends targeting strategies based on demographic and behavioral data from GWI surveys.",
  longDescription: `The Audience Strategist agent is designed to help marketing and research teams understand their target audiences at a deeper level. It leverages GWI's comprehensive consumer data to:

- Identify and profile distinct audience segments
- Analyze demographic, psychographic, and behavioral characteristics
- Compare audiences across markets and time periods
- Generate targeting recommendations for campaigns
- Surface unexpected audience insights and opportunities

This agent works best when combined with other agents like the Creative Brief Builder or Trend Forecaster for end-to-end campaign planning.`,
  icon: Users,
  color: "bg-chart-1/20 text-chart-1",
  category: "Analysis",
  type: "official",
  rating: 4.9,
  reviews: 342,
  usage: "12.4K",
  avgDuration: "2.3 min",
  successRate: "98%",
  tags: ["Segmentation", "Targeting", "Demographics", "Psychographics", "Behavioral"],
  capabilities: [
    "Segment identification and profiling",
    "Cross-market audience comparison",
    "Demographic and psychographic analysis",
    "Behavioral pattern recognition",
    "Targeting strategy recommendations",
    "Audience sizing and overlap analysis",
  ],
  dataSources: ["GWI Core", "GWI USA", "GWI Zeitgeist", "Custom Uploads"],
  outputFormats: ["Markdown", "JSON", "Slides", "PDF Report"],
  examplePrompts: [
    "Identify high-value audience segments for sustainable fashion in the EU",
    "Compare Gen Z vs Millennial attitudes toward electric vehicles",
    "Find audiences most likely to adopt plant-based diets in the next year",
    "Profile heavy social media users who are also premium brand buyers",
  ],
}

export function AgentDetail({ id }: { id: string }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/agents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className={`w-16 h-16 rounded-2xl ${agentData.color} flex items-center justify-center flex-shrink-0`}>
            <agentData.icon className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{agentData.name}</h1>
              <Badge variant="secondary" className="bg-accent/10 text-accent border-0">
                Official
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-chart-3 fill-chart-3" />
                <span className="text-sm font-medium text-foreground">{agentData.rating}</span>
                <span className="text-sm text-muted-foreground">({agentData.reviews} reviews)</span>
              </div>
            </div>
            <p className="text-muted-foreground mt-2 max-w-2xl">{agentData.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {agentData.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-12 lg:ml-0">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Copy className="h-4 w-4" />
            Clone
          </Button>
          <Link href={`/dashboard/playground?agent=${id}`}>
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Open in Playground
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Uses", value: agentData.usage, icon: Zap },
          { label: "Avg Duration", value: agentData.avgDuration, icon: Clock },
          { label: "Success Rate", value: agentData.successRate, icon: Users },
          { label: "Data Sources", value: agentData.dataSources.length.toString(), icon: BookOpen },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>About This Agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <p className="text-muted-foreground whitespace-pre-line">{agentData.longDescription}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Capabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {agentData.capabilities.map((capability) => (
                      <li key={capability} className="flex items-center gap-3 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-foreground">{capability}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Data Sources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {agentData.dataSources.map((source) => (
                    <div key={source} className="flex items-center gap-2 p-2 rounded-lg bg-secondary">
                      <div className="w-2 h-2 rounded-full bg-chart-5" />
                      <span className="text-sm text-foreground">{source}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Output Formats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {agentData.outputFormats.map((format) => (
                    <div key={format} className="flex items-center gap-2 p-2 rounded-lg bg-secondary">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{format}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Example Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentData.examplePrompts.map((prompt, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border group hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-foreground">{prompt}</p>
                  </div>
                  <Link href={`/dashboard/playground?agent=${id}&prompt=${encodeURIComponent(prompt)}`}>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Try this
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-secondary p-4 font-mono text-sm">
                <pre className="text-muted-foreground overflow-x-auto">
                  {`POST /api/agents/audience-strategist/run

{
  "prompt": "Your research question here",
  "dataSources": ["gwi-core", "gwi-usa"],
  "outputFormat": "markdown",
  "options": {
    "temperature": 0.7,
    "maxTokens": 4096,
    "enableMemory": true,
    "enableCitations": true
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>User Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  user: "Sarah M.",
                  rating: 5,
                  comment: "Incredibly accurate audience insights. Saved us weeks of manual research.",
                  date: "2 days ago",
                },
                {
                  user: "James T.",
                  rating: 5,
                  comment: "The segmentation recommendations were spot-on for our Q4 campaign.",
                  date: "1 week ago",
                },
                {
                  user: "Lisa K.",
                  rating: 4,
                  comment: "Great for initial exploration. Would love more granular demographic breakdowns.",
                  date: "2 weeks ago",
                },
              ].map((review, i) => (
                <div key={i} className="p-4 rounded-lg border border-border bg-secondary/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-accent">
                          {review.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">{review.user}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`h-4 w-4 ${j < review.rating ? "text-chart-3 fill-chart-3" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">{review.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
