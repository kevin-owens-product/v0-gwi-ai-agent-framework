"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  Loader2,
  Calendar,
  Bot,
  BarChart3,
  Share2,
  Download,
  Copy,
  Check,
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
    id: string
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

// Demo insights for when API is unavailable
const demoInsights: Record<string, Insight> = {
  "insight-1": {
    id: "insight-1",
    title: "Gen Z shows 67% higher engagement with sustainability messaging compared to other generations",
    type: "audience",
    confidenceScore: 0.94,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    data: {
      summary: "Generation Z consumers demonstrate significantly higher engagement rates with sustainability-focused marketing messages, with a 67% increase in engagement compared to other generational cohorts.",
      key_findings: [
        "67% higher engagement with eco-friendly product messaging",
        "82% consider environmental impact before purchase",
        "3x more likely to share sustainability content on social media",
        "Willing to pay 15-20% premium for sustainable products"
      ],
      demographics: {
        age_range: "18-27",
        sample_size: "24,500 respondents",
        markets: ["USA", "UK", "Germany", "France", "Canada"]
      },
      recommendations: [
        "Prioritize authentic sustainability messaging in campaigns",
        "Highlight specific environmental impact metrics",
        "Partner with eco-conscious influencers"
      ]
    },
    agentRun: { id: "run-1", agent: { id: "audience-explorer", name: "Audience Explorer", type: "RESEARCH" } }
  },
  "insight-2": {
    id: "insight-2",
    title: "Brand loyalty among millennials declined 12% YoY, driven by price sensitivity",
    type: "trend",
    confidenceScore: 0.89,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    data: {
      summary: "Year-over-year brand loyalty metrics for millennials (ages 28-43) show a 12% decline, primarily driven by increased price sensitivity in the current economic climate.",
      key_findings: [
        "12% decline in brand loyalty YoY",
        "Price sensitivity increased by 23%",
        "58% of millennials switched to private label products",
        "Quality remains important but secondary to value"
      ],
      trend_analysis: {
        current_year: 0.62,
        previous_year: 0.74,
        change: -0.12,
        projection_next_year: 0.58
      },
      recommendations: [
        "Introduce value-tier product lines",
        "Strengthen loyalty programs with tangible rewards",
        "Communicate value proposition clearly"
      ]
    },
    agentRun: { id: "run-2", agent: { id: "trend-forecaster", name: "Trend Forecaster", type: "ANALYSIS" } }
  },
  "insight-3": {
    id: "insight-3",
    title: "Competitor X gained 8% market share in APAC through influencer partnerships",
    type: "competitive",
    confidenceScore: 0.91,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    data: {
      summary: "Competitor X has successfully captured 8% additional market share in APAC markets through strategic influencer partnerships, particularly in South Korea and Japan.",
      competitor_analysis: {
        market_share_gain: "8%",
        primary_markets: ["South Korea", "Japan", "Singapore"],
        strategy: "Micro-influencer partnerships",
        investment_level: "Estimated $12M"
      },
      key_findings: [
        "45 influencer partnerships launched in Q3",
        "Focus on beauty and lifestyle verticals",
        "User-generated content increased 340%",
        "Brand awareness up 28% in target demographics"
      ],
      recommendations: [
        "Develop counter-strategy for influencer marketing",
        "Identify untapped micro-influencers in APAC",
        "Consider partnership with local KOLs"
      ]
    },
    agentRun: { id: "run-3", agent: { id: "competitive-intel", name: "Competitive Intelligence", type: "MONITORING" } }
  },
  "insight-4": {
    id: "insight-4",
    title: "Purchase intent correlates strongly with social proof indicators (r=0.78)",
    type: "analysis",
    confidenceScore: 0.86,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    data: {
      summary: "Statistical analysis reveals a strong positive correlation (r=0.78) between social proof indicators (reviews, ratings, testimonials) and purchase intent across all demographics.",
      statistical_analysis: {
        correlation_coefficient: 0.78,
        p_value: "<0.001",
        sample_size: 45000,
        confidence_interval: "95%"
      },
      social_proof_factors: [
        { factor: "Customer reviews", impact: "High", weight: 0.32 },
        { factor: "Star ratings", impact: "High", weight: 0.28 },
        { factor: "User photos", impact: "Medium", weight: 0.22 },
        { factor: "Expert endorsements", impact: "Medium", weight: 0.18 }
      ],
      recommendations: [
        "Invest in review collection programs",
        "Display ratings prominently in purchase flow",
        "Encourage user-generated visual content"
      ]
    },
    agentRun: { id: "run-4", agent: { id: "survey-analyst", name: "Survey Analyst", type: "ANALYSIS" } }
  },
  "insight-5": {
    id: "insight-5",
    title: "Mobile commerce adoption accelerated 34% in emerging markets this quarter",
    type: "research",
    confidenceScore: 0.92,
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    data: {
      summary: "Mobile commerce (m-commerce) adoption in emerging markets has accelerated by 34% quarter-over-quarter, driven by improved mobile infrastructure and digital payment adoption.",
      market_breakdown: {
        india: { growth: "42%", penetration: "68%" },
        brazil: { growth: "38%", penetration: "55%" },
        indonesia: { growth: "35%", penetration: "61%" },
        mexico: { growth: "28%", penetration: "48%" }
      },
      key_findings: [
        "34% QoQ growth in mobile commerce",
        "Digital wallet adoption up 52%",
        "Average mobile order value increased 18%",
        "Peak shopping hours shifted to 8-10 PM local time"
      ],
      recommendations: [
        "Optimize mobile checkout experience",
        "Integrate local payment methods",
        "Consider mobile-first product launches"
      ]
    },
    agentRun: { id: "run-5", agent: { id: "global-perspective", name: "Global Perspective Agent", type: "RESEARCH" } }
  },
  "insight-6": {
    id: "insight-6",
    title: "TikTok surpasses Instagram as primary discovery platform for Gen Z consumers",
    type: "trend",
    confidenceScore: 0.93,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    data: {
      summary: "TikTok has overtaken Instagram as the primary product and brand discovery platform among Gen Z consumers, with 72% citing TikTok as their go-to discovery channel.",
      platform_comparison: {
        tiktok: { discovery_rate: "72%", engagement: "High", avg_time: "52 min/day" },
        instagram: { discovery_rate: "58%", engagement: "Medium", avg_time: "34 min/day" },
        youtube: { discovery_rate: "45%", engagement: "Medium", avg_time: "41 min/day" }
      },
      key_findings: [
        "72% of Gen Z discover products on TikTok",
        "#TikTokMadeMeBuyIt drives significant purchase behavior",
        "Short-form video content most effective for discovery",
        "Authentic creator content outperforms branded content 3:1"
      ],
      recommendations: [
        "Shift discovery budget allocation to TikTok",
        "Develop TikTok-native content strategy",
        "Partner with authentic creators over celebrities"
      ]
    },
    agentRun: { id: "run-6", agent: { id: "culture-tracker", name: "Culture Tracker", type: "MONITORING" } }
  },
  "insight-7": {
    id: "insight-7",
    title: "Health-conscious consumers willing to pay 45% premium for functional foods",
    type: "audience",
    confidenceScore: 0.88,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    data: {
      summary: "Health-conscious consumers demonstrate willingness to pay significant premiums (up to 45%) for functional foods that offer specific health benefits beyond basic nutrition.",
      price_sensitivity: {
        premium_tolerance: "45%",
        category_leaders: ["Immunity boosters", "Gut health", "Mental wellness"],
        purchase_frequency: "2.3x per week"
      },
      key_findings: [
        "45% premium willingness for functional benefits",
        "Immunity and gut health are top priorities",
        "Clean label requirements are non-negotiable",
        "Science-backed claims increase trust by 67%"
      ],
      recommendations: [
        "Develop functional product lines with clear benefits",
        "Invest in clinical studies for credibility",
        "Use transparent labeling practices"
      ]
    },
    agentRun: { id: "run-7", agent: { id: "audience-explorer", name: "Audience Explorer", type: "RESEARCH" } }
  },
  "insight-8": {
    id: "insight-8",
    title: "Remote work has permanently shifted commuter media consumption patterns",
    type: "research",
    confidenceScore: 0.85,
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    data: {
      summary: "The shift to remote and hybrid work has fundamentally changed media consumption patterns, with traditional commute-time media seeing 28% decline while at-home consumption patterns emerge.",
      consumption_shifts: {
        podcast_commute: "-28%",
        podcast_home: "+42%",
        morning_tv: "-15%",
        streaming_daytime: "+35%"
      },
      key_findings: [
        "28% decline in commute-time media consumption",
        "42% increase in at-home podcast listening",
        "Peak podcast hours shifted to lunch breaks",
        "Background streaming during work hours up 35%"
      ],
      recommendations: [
        "Adjust daypart targeting strategies",
        "Develop content for background consumption",
        "Consider hybrid work schedules in media planning"
      ]
    },
    agentRun: { id: "run-8", agent: { id: "trend-forecaster", name: "Trend Forecaster", type: "ANALYSIS" } }
  },
  "insight-9": {
    id: "insight-9",
    title: "Brand authenticity scores predict customer lifetime value with 71% accuracy",
    type: "analysis",
    confidenceScore: 0.90,
    createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    data: {
      summary: "Predictive modeling reveals that brand authenticity scores are strong indicators of customer lifetime value (CLV), with 71% prediction accuracy across tested segments.",
      model_performance: {
        accuracy: "71%",
        precision: "0.73",
        recall: "0.68",
        f1_score: "0.70"
      },
      authenticity_factors: [
        { factor: "Transparent communication", weight: 0.28 },
        { factor: "Consistent values", weight: 0.25 },
        { factor: "Social responsibility", weight: 0.24 },
        { factor: "Customer advocacy", weight: 0.23 }
      ],
      recommendations: [
        "Invest in brand authenticity measurement",
        "Develop authentic storytelling campaigns",
        "Prioritize transparency in crisis communications"
      ]
    },
    agentRun: { id: "run-9", agent: { id: "brand-analyst", name: "Brand Relationship Analyst", type: "ANALYSIS" } }
  },
  "insight-10": {
    id: "insight-10",
    title: "Subscription fatigue reached critical levels with 62% of consumers cancelling services",
    type: "trend",
    confidenceScore: 0.91,
    createdAt: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(),
    data: {
      summary: "Consumer subscription fatigue has reached critical levels, with 62% of consumers reporting cancellation of at least one subscription service in the past 6 months.",
      cancellation_data: {
        overall_rate: "62%",
        avg_subscriptions_cancelled: 2.4,
        top_reasons: ["Cost consolidation", "Unused services", "Price increases"]
      },
      key_findings: [
        "62% cancelled at least one subscription",
        "Average household reduced from 6.2 to 4.1 subscriptions",
        "Streaming services hit hardest at 45% churn",
        "Bundle deals seeing 28% higher retention"
      ],
      recommendations: [
        "Develop flexible pricing tiers",
        "Create bundle partnerships for value",
        "Implement win-back campaigns for churned subscribers"
      ]
    },
    agentRun: { id: "run-10", agent: { id: "trend-forecaster", name: "Trend Forecaster", type: "ANALYSIS" } }
  }
}

export default function InsightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [insight, setInsight] = useState<Insight | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchInsight() {
      try {
        const response = await fetch(`/api/v1/insights/${id}`)
        if (!response.ok) {
          // Try demo data if API fails
          if (demoInsights[id]) {
            setInsight(demoInsights[id])
            return
          }
          if (response.status === 404) {
            setError("Insight not found")
          } else {
            setError("Failed to load insight")
          }
          return
        }
        const data = await response.json()
        setInsight(data.data)
      } catch (err) {
        // Try demo data on error
        if (demoInsights[id]) {
          setInsight(demoInsights[id])
        } else {
          setError("Failed to load insight")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsight()
  }, [id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const handleCopy = () => {
    if (insight) {
      navigator.clipboard.writeText(
        `${insight.title}\n\n${JSON.stringify(insight.data, null, 2)}`
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !insight) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/insights">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Insights
          </Link>
        </Button>
        <Card className="bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{error || "Insight not found"}</h3>
            <p className="text-muted-foreground text-center">
              This insight may have been deleted or you don&apos;t have access to it.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/insights">View All Insights</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const Icon = typeIcons[insight.type.toLowerCase()] || Lightbulb
  const confidence = insight.confidenceScore
    ? Math.round(insight.confidenceScore * 100)
    : null

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/insights">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Insights
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="outline" className="capitalize">
              {insight.type.toLowerCase()}
            </Badge>
            {confidence && (
              <Badge variant="secondary" className="text-emerald-500">
                <BarChart3 className="h-3 w-3 mr-1" />
                {confidence}% confidence
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">{insight.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(insight.createdAt)}
            </div>
            {insight.agentRun?.agent && (
              <div className="flex items-center gap-1">
                <Bot className="h-4 w-4" />
                via {insight.agentRun.agent.name}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Insight Details</CardTitle>
          <CardDescription>
            Raw data and findings from this insight
          </CardDescription>
        </CardHeader>
        <CardContent>
          {typeof insight.data === "object" ? (
            <div className="space-y-4">
              {Object.entries(insight.data).map(([key, value]) => (
                <div key={key} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <h4 className="text-sm font-medium text-muted-foreground capitalize mb-2">
                    {key.replace(/_/g, " ")}
                  </h4>
                  {typeof value === "string" ? (
                    <p className="text-foreground">{value}</p>
                  ) : Array.isArray(value) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {value.map((item, index) => (
                        <li key={index} className="text-foreground">
                          {typeof item === "string" ? item : JSON.stringify(item)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground">{String(insight.data)}</p>
          )}
        </CardContent>
      </Card>

      {/* Related Actions */}
      <Card className="bg-muted/30">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="p-3 rounded-full bg-primary/10">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Want to explore more?</h3>
              <p className="text-sm text-muted-foreground">
                Run more queries in the playground to generate additional insights.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/playground">Open Playground</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
