"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Star, Download, TrendingUp, Users, BarChart3, Zap, Globe, Target, Check } from "lucide-react"

interface MarketplaceAgent {
  id: string
  name: string
  description: string
  category: "marketing" | "research" | "analytics" | "sales" | "support" | "general"
  rating: number
  downloads: number
  author: string
  verified: boolean
  tags: string[]
  capabilities: string[]
  installed: boolean
}

const marketplaceAgents: MarketplaceAgent[] = [
  {
    id: "sentiment-tracker",
    name: "Social Sentiment Tracker",
    description: "Real-time social media sentiment analysis across major platforms. Tracks brand mentions, sentiment shifts, and emerging conversations.",
    category: "marketing",
    rating: 4.8,
    downloads: 12500,
    author: "GWI Labs",
    verified: true,
    tags: ["social media", "sentiment", "real-time"],
    capabilities: ["Sentiment Analysis", "Brand Monitoring", "Trend Detection", "Alert System"],
    installed: false,
  },
  {
    id: "purchase-path-analyzer",
    name: "Purchase Path Analyzer",
    description: "Maps complete consumer purchase journeys from awareness to conversion. Identifies key decision points and drop-off stages.",
    category: "research",
    rating: 4.9,
    downloads: 8300,
    author: "GWI Labs",
    verified: true,
    tags: ["customer journey", "conversion", "funnel analysis"],
    capabilities: ["Journey Mapping", "Touchpoint Analysis", "Conversion Optimization", "Path Visualization"],
    installed: false,
  },
  {
    id: "competitor-intel",
    name: "Competitive Intelligence Engine",
    description: "Automated competitor monitoring and analysis. Tracks market positioning, messaging, and consumer perception shifts.",
    category: "analytics",
    rating: 4.7,
    downloads: 15200,
    author: "GWI Labs",
    verified: true,
    tags: ["competitive analysis", "market intelligence", "positioning"],
    capabilities: ["Competitor Tracking", "Share of Voice", "Positioning Maps", "SWOT Analysis"],
    installed: true,
  },
  {
    id: "campaign-optimizer",
    name: "Campaign Performance Optimizer",
    description: "AI-powered campaign analysis and optimization recommendations. Analyzes creative, targeting, and messaging effectiveness.",
    category: "marketing",
    rating: 4.6,
    downloads: 9800,
    author: "GWI Labs",
    verified: true,
    tags: ["campaigns", "optimization", "performance"],
    capabilities: ["Performance Analysis", "A/B Testing", "Creative Scoring", "Recommendation Engine"],
    installed: false,
  },
  {
    id: "trend-forecaster-pro",
    name: "Trend Forecaster Pro",
    description: "Advanced predictive analytics for emerging consumer trends. Uses machine learning to forecast trend adoption curves.",
    category: "research",
    rating: 5.0,
    downloads: 6100,
    author: "GWI Labs",
    verified: true,
    tags: ["trends", "forecasting", "predictive"],
    capabilities: ["Trend Prediction", "Adoption Curves", "Risk Assessment", "Scenario Planning"],
    installed: false,
  },
  {
    id: "market-sizer",
    name: "Market Size Estimator",
    description: "Calculate addressable market sizes across segments and geographies. Includes TAM, SAM, SOM calculations.",
    category: "analytics",
    rating: 4.5,
    downloads: 5400,
    author: "GWI Labs",
    verified: true,
    tags: ["market sizing", "TAM", "forecasting"],
    capabilities: ["TAM/SAM/SOM", "Segment Sizing", "Growth Projections", "Market Entry Analysis"],
    installed: false,
  },
  {
    id: "influencer-match",
    name: "Influencer Match Engine",
    description: "Match your brand with optimal influencers based on audience alignment and engagement patterns.",
    category: "marketing",
    rating: 4.4,
    downloads: 11200,
    author: "Community",
    verified: false,
    tags: ["influencer marketing", "partnerships", "social"],
    capabilities: ["Influencer Discovery", "Audience Overlap", "Engagement Scoring", "ROI Prediction"],
    installed: false,
  },
  {
    id: "retention-predictor",
    name: "Customer Retention Predictor",
    description: "Identify at-risk customers and predict churn probability. Provides personalized retention strategies.",
    category: "analytics",
    rating: 4.7,
    downloads: 7600,
    author: "GWI Labs",
    verified: true,
    tags: ["retention", "churn", "customer success"],
    capabilities: ["Churn Prediction", "Risk Scoring", "Retention Strategies", "Win-back Campaigns"],
    installed: false,
  },
  {
    id: "segment-discovery",
    name: "Segment Discovery AI",
    description: "Automatically discover hidden consumer segments in your data using unsupervised machine learning.",
    category: "research",
    rating: 4.9,
    downloads: 4800,
    author: "GWI Labs",
    verified: true,
    tags: ["segmentation", "clustering", "AI"],
    capabilities: ["Auto-Segmentation", "Cluster Analysis", "Segment Profiling", "Opportunity Scoring"],
    installed: false,
  },
  {
    id: "price-sensitivity",
    name: "Price Sensitivity Analyzer",
    description: "Analyze price elasticity and optimize pricing strategies across segments and markets.",
    category: "analytics",
    rating: 4.6,
    downloads: 3900,
    author: "Community",
    verified: false,
    tags: ["pricing", "elasticity", "revenue"],
    capabilities: ["Price Elasticity", "Optimal Pricing", "Competitive Pricing", "Revenue Modeling"],
    installed: false,
  },
  {
    id: "content-resonance",
    name: "Content Resonance Scorer",
    description: "Score content ideas based on audience relevance and predicted engagement. Optimize messaging for maximum impact.",
    category: "marketing",
    rating: 4.8,
    downloads: 10500,
    author: "GWI Labs",
    verified: true,
    tags: ["content", "engagement", "messaging"],
    capabilities: ["Content Scoring", "Topic Analysis", "Engagement Prediction", "Message Testing"],
    installed: false,
  },
  {
    id: "market-expansion",
    name: "Market Expansion Advisor",
    description: "Evaluate new market opportunities and expansion strategies. Risk assessment and go-to-market recommendations.",
    category: "research",
    rating: 4.7,
    downloads: 4200,
    author: "GWI Labs",
    verified: true,
    tags: ["expansion", "market entry", "strategy"],
    capabilities: ["Opportunity Scoring", "Market Assessment", "Risk Analysis", "GTM Strategy"],
    installed: false,
  },
]

const categoryIcons: Record<string, any> = {
  marketing: Target,
  research: Users,
  analytics: BarChart3,
  sales: TrendingUp,
  support: Zap,
  general: Globe,
}

export function AgentMarketplace() {
  const t = useTranslations("agents.marketplace")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "recent">("popular")
  const [selectedAgent, setSelectedAgent] = useState<MarketplaceAgent | null>(null)
  const [installingAgents, setInstallingAgents] = useState<Set<string>>(new Set())

  const filteredAgents = marketplaceAgents
    .filter((agent) => {
      const matchesSearch =
        search === "" ||
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        agent.description.toLowerCase().includes(search.toLowerCase()) ||
        agent.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      const matchesCategory = category === "all" || agent.category === category
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.downloads - a.downloads
      if (sortBy === "rating") return b.rating - a.rating
      return 0 // "recent" would use createdAt in production
    })

  const handleInstall = async (agentId: string) => {
    setInstallingAgents((prev) => new Set(prev).add(agentId))
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setInstallingAgents((prev) => {
      const next = new Set(prev)
      next.delete(agentId)
      return next
    })
    // In production, would call API to install agent
    const agentIndex = marketplaceAgents.findIndex((a) => a.id === agentId)
    if (agentIndex !== -1) {
      marketplaceAgents[agentIndex].installed = true
    }
  }

  const categories = [
    { id: "all", label: t("categories.all"), count: marketplaceAgents.length },
    { id: "marketing", label: t("categories.marketing"), count: marketplaceAgents.filter((a) => a.category === "marketing").length },
    { id: "research", label: t("categories.research"), count: marketplaceAgents.filter((a) => a.category === "research").length },
    { id: "analytics", label: t("categories.analytics"), count: marketplaceAgents.filter((a) => a.category === "analytics").length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("title")}</h2>
            <p className="text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {t("agentsAvailable", { count: marketplaceAgents.length })}
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="popular">{t("sort.popular")}</option>
          <option value="rating">{t("sort.rating")}</option>
          <option value="recent">{t("sort.recent")}</option>
        </select>
      </div>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList>
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.label} ({cat.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={category} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => {
              const Icon = categoryIcons[agent.category]
              const isInstalling = installingAgents.has(agent.id)

              return (
                <Card key={agent.id} className="p-4 space-y-3 hover:border-primary transition-colors cursor-pointer" onClick={() => setSelectedAgent(agent)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
                          {agent.verified && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              <Check className="h-3 w-3 mr-1" />
                              {t("verified")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{t("byAuthor", { author: agent.author })}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {agent.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                        <span>{agent.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3.5 w-3.5" />
                        <span>{(agent.downloads / 1000).toFixed(1)}k</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={agent.installed ? "secondary" : "default"}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!agent.installed) handleInstall(agent.id)
                      }}
                      disabled={isInstalling}
                    >
                      {isInstalling ? t("installing") : agent.installed ? t("installed") : t("install")}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("noAgentsFound")}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Agent Detail Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        {selectedAgent && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {(() => {
                    const Icon = categoryIcons[selectedAgent.category]
                    return (
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    )
                  })()}
                  <div>
                    <DialogTitle className="text-xl">{selectedAgent.name}</DialogTitle>
                    <DialogDescription>{t("byAuthor", { author: selectedAgent.author })}</DialogDescription>
                  </div>
                </div>
                {selectedAgent.verified && (
                  <Badge variant="secondary">
                    <Check className="h-3 w-3 mr-1" />
                    {t("verified")}
                  </Badge>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">{selectedAgent.description}</p>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm font-medium">{selectedAgent.rating} / 5.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span className="text-sm">{t("downloadsCount", { count: selectedAgent.downloads.toLocaleString() })}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">{t("capabilities")}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedAgent.capabilities.map((capability) => (
                    <div key={capability} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">{t("tags")}</h4>
                <div className="flex gap-2 flex-wrap">
                  {selectedAgent.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  variant={selectedAgent.installed ? "secondary" : "default"}
                  onClick={() => {
                    if (!selectedAgent.installed) {
                      handleInstall(selectedAgent.id)
                    }
                  }}
                  disabled={installingAgents.has(selectedAgent.id)}
                >
                  {installingAgents.has(selectedAgent.id)
                    ? t("installing")
                    : selectedAgent.installed
                      ? t("installed")
                      : t("installAgent")}
                </Button>
                {selectedAgent.installed && (
                  <Button variant="outline" onClick={() => {
                    setSelectedAgent(null)
                    window.location.href = `/dashboard/playground?agent=${selectedAgent.id}`
                  }}>
                    {t("tryInPlayground")}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
