"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  Sparkles,
  Loader2,
  Search,
  Filter,
} from "lucide-react"
import Link from "next/link"

interface Insight {
  id: string
  title: string
  type: string
  confidenceScore: number | null
  createdAt: string
  data: any
  agentRun?: {
    agent?: {
      id: string
      name: string
      type: string
    }
  }
}

const typeIcons: Record<string, typeof Users> = {
  audience: Users,
  research: Users,
  competitive: Target,
  analysis: Lightbulb,
  trend: TrendingUp,
  reporting: TrendingUp,
  monitoring: Target,
  custom: Lightbulb,
}

// Demo insights for when API returns empty
const demoInsights: Insight[] = [
  {
    id: "insight-1",
    title: "Gen Z shows 67% higher engagement with sustainability messaging compared to other generations",
    type: "audience",
    confidenceScore: 0.94,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    data: {},
    agentRun: { agent: { id: "audience-explorer", name: "Audience Explorer", type: "RESEARCH" } }
  },
  {
    id: "insight-2",
    title: "Brand loyalty among millennials declined 12% YoY, driven by price sensitivity",
    type: "trend",
    confidenceScore: 0.89,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    data: {},
    agentRun: { agent: { id: "trend-forecaster", name: "Trend Forecaster", type: "ANALYSIS" } }
  },
  {
    id: "insight-3",
    title: "Competitor X gained 8% market share in APAC through influencer partnerships",
    type: "competitive",
    confidenceScore: 0.91,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    data: {},
    agentRun: { agent: { id: "competitive-intel", name: "Competitive Intelligence", type: "MONITORING" } }
  },
  {
    id: "insight-4",
    title: "Purchase intent correlates strongly with social proof indicators (r=0.78)",
    type: "analysis",
    confidenceScore: 0.86,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    data: {},
    agentRun: { agent: { id: "survey-analyst", name: "Survey Analyst", type: "ANALYSIS" } }
  },
  {
    id: "insight-5",
    title: "Mobile commerce adoption accelerated 34% in emerging markets this quarter",
    type: "research",
    confidenceScore: 0.92,
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    data: {},
    agentRun: { agent: { id: "global-perspective", name: "Global Perspective Agent", type: "RESEARCH" } }
  },
  {
    id: "insight-6",
    title: "TikTok surpasses Instagram as primary discovery platform for Gen Z consumers",
    type: "trend",
    confidenceScore: 0.93,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    data: {},
    agentRun: { agent: { id: "culture-tracker", name: "Culture Tracker", type: "MONITORING" } }
  },
  {
    id: "insight-7",
    title: "Health-conscious consumers willing to pay 45% premium for functional foods",
    type: "audience",
    confidenceScore: 0.88,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    data: {},
    agentRun: { agent: { id: "audience-explorer", name: "Audience Explorer", type: "RESEARCH" } }
  },
  {
    id: "insight-8",
    title: "Remote work has permanently shifted commuter media consumption patterns",
    type: "research",
    confidenceScore: 0.85,
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    data: {},
    agentRun: { agent: { id: "trend-forecaster", name: "Trend Forecaster", type: "ANALYSIS" } }
  },
  {
    id: "insight-9",
    title: "Brand authenticity scores predict customer lifetime value with 71% accuracy",
    type: "analysis",
    confidenceScore: 0.90,
    createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    data: {},
    agentRun: { agent: { id: "brand-analyst", name: "Brand Relationship Analyst", type: "ANALYSIS" } }
  },
  {
    id: "insight-10",
    title: "Subscription fatigue reached critical levels with 62% of consumers cancelling services",
    type: "trend",
    confidenceScore: 0.91,
    createdAt: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(),
    data: {},
    agentRun: { agent: { id: "trend-forecaster", name: "Trend Forecaster", type: "ANALYSIS" } }
  },
]

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function fetchInsights() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({ limit: "50" })
        if (typeFilter && typeFilter !== "all") {
          params.set("type", typeFilter)
        }
        const response = await fetch(`/api/v1/insights?${params}`)
        if (response.ok) {
          const data = await response.json()
          const fetchedInsights = data.insights || []
          // Use demo data if API returns empty
          if (fetchedInsights.length === 0) {
            let filtered = demoInsights
            if (typeFilter && typeFilter !== "all") {
              filtered = demoInsights.filter(i => i.type.toLowerCase() === typeFilter.toLowerCase())
            }
            setInsights(filtered)
            setTotal(filtered.length)
          } else {
            setInsights(fetchedInsights)
            setTotal(data.total || 0)
          }
        } else {
          // Use demo data on API error
          let filtered = demoInsights
          if (typeFilter && typeFilter !== "all") {
            filtered = demoInsights.filter(i => i.type.toLowerCase() === typeFilter.toLowerCase())
          }
          setInsights(filtered)
          setTotal(filtered.length)
        }
      } catch (error) {
        console.error("Failed to fetch insights:", error)
        // Use demo data on error
        let filtered = demoInsights
        if (typeFilter && typeFilter !== "all") {
          filtered = demoInsights.filter(i => i.type.toLowerCase() === typeFilter.toLowerCase())
        }
        setInsights(filtered)
        setTotal(filtered.length)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsights()
  }, [typeFilter])

  const filteredInsights = insights.filter((insight) =>
    insight.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isNew = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
    return diffHours < 24
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Insights</h1>
        <p className="text-muted-foreground">
          AI-generated insights from your agent runs
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="audience">Audience</SelectItem>
            <SelectItem value="trend">Trend</SelectItem>
            <SelectItem value="competitive">Competitive</SelectItem>
            <SelectItem value="analysis">Analysis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {isLoading ? (
          "Loading..."
        ) : (
          <>
            Showing {filteredInsights.length} of {total} insights
          </>
        )}
      </div>

      {/* Insights Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredInsights.length === 0 ? (
        <Card className="bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No insights yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Run agents to generate insights. Insights are automatically
              created when agents analyze your data.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/playground">Go to Playground</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInsights.map((insight) => {
            const Icon = typeIcons[insight.type.toLowerCase()] || Lightbulb
            const insightIsNew = isNew(insight.createdAt)
            const confidence = insight.confidenceScore
              ? Math.round(insight.confidenceScore * 100)
              : null

            return (
              <Link key={insight.id} href={`/dashboard/insights/${insight.id}`}>
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        {insightIsNew && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <CardTitle className="text-base mt-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {insight.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {insight.type.toLowerCase()}
                        </Badge>
                        {confidence && (
                          <span className="text-emerald-500 text-xs">
                            {confidence}%
                          </span>
                        )}
                      </div>
                      <span className="text-xs">
                        {formatDate(insight.createdAt)}
                      </span>
                    </div>
                    {insight.agentRun?.agent && (
                      <p className="text-xs text-muted-foreground mt-2">
                        via {insight.agentRun.agent.name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
