"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, Users, Target, Lightbulb, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"

interface Insight {
  id: string
  title: string
  type: string
  confidenceScore: number | null
  createdAt: string
}

interface InsightsPanelProps {
  orgId?: string
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

// Demo insights shown when API is unavailable
const demoInsights: Insight[] = [
  {
    id: "insight-1",
    title: "Gen Z shows 67% higher engagement with sustainability messaging compared to other generations",
    type: "audience",
    confidenceScore: 0.94,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "insight-2",
    title: "Brand loyalty among millennials declined 12% YoY, driven by price sensitivity",
    type: "trend",
    confidenceScore: 0.89,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: "insight-3",
    title: "Competitor X gained 8% market share in APAC through influencer partnerships",
    type: "competitive",
    confidenceScore: 0.91,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
  },
  {
    id: "insight-4",
    title: "Purchase intent correlates strongly with social proof indicators (r=0.78)",
    type: "analysis",
    confidenceScore: 0.86,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
  },
  {
    id: "insight-5",
    title: "Mobile commerce adoption accelerated 34% in emerging markets this quarter",
    type: "research",
    confidenceScore: 0.92,
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago
  },
]

export function InsightsPanel({ orgId }: InsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchInsights() {
      try {
        const response = await fetch('/api/v1/insights?limit=5')
        if (response.ok) {
          const data = await response.json()
          const fetchedInsights = data.insights || []
          // Use demo data if API returns empty
          setInsights(fetchedInsights.length > 0 ? fetchedInsights : demoInsights)
        } else {
          // Use demo data on API error
          setInsights(demoInsights)
        }
      } catch (error) {
        console.error('Failed to fetch insights:', error)
        // Use demo data on error
        setInsights(demoInsights)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsights()
  }, [orgId])

  // Check if insight is new (created within last 24 hours)
  const isNew = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
    return diffHours < 24
  }

  const newCount = insights.filter(i => isNew(i.createdAt)).length

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">Top Insights</CardTitle>
          {newCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {newCount} new
            </Badge>
          )}
        </div>
        <Link href="/dashboard/insights">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No insights yet</p>
            <p className="text-xs">Run agents to generate insights</p>
          </div>
        ) : (
          insights.map((insight) => {
            const Icon = typeIcons[insight.type.toLowerCase()] || Lightbulb
            const insightIsNew = isNew(insight.createdAt)
            const confidence = insight.confidenceScore ? Math.round(insight.confidenceScore * 100) : null

            return (
              <Link key={insight.id} href={`/dashboard/insights/${insight.id}`}>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-accent/30 transition-all cursor-pointer group">
                  <div className="p-1.5 rounded-md bg-accent/10 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-accent" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-foreground leading-tight group-hover:text-accent transition-colors line-clamp-2">
                        {insight.title}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {insightIsNew && <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5" />}
                        <ArrowRight className="h-3 w-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{insight.type.toLowerCase()}</span>
                      {confidence && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400">{confidence}% confidence</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
