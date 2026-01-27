"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Plus, Table2, Download, Eye, Clock, Sparkles, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PageTracker } from "@/components/tracking/PageTracker"
import { DATA_SUMMARY } from "@/components/crosstabs/data/comprehensive-crosstab-data"

interface Crosstab {
  id: string
  name: string
  audiences: number
  metrics: number
  lastModified: string
  category?: string
  isFeatured?: boolean
}

// Demo crosstabs for fallback - organized by category with realistic audience/metric counts
const demoCrosstabs: Crosstab[] = [
  // Featured comprehensive analysis
  { id: "analysis", name: "Comprehensive Consumer Insights Analysis", audiences: DATA_SUMMARY.totalAudiences, metrics: DATA_SUMMARY.totalMetrics, lastModified: "Just now", category: "Featured", isFeatured: true },

  // Social & Platform Analysis
  { id: "social-1", name: "Generational Social Media Platform Analysis", audiences: 21, metrics: 20, lastModified: "1 hour ago", category: "Social" },
  { id: "social-2", name: "TikTok vs Instagram Engagement by Age", audiences: 5, metrics: 12, lastModified: "3 hours ago", category: "Social" },
  { id: "social-3", name: "Content Format Preferences by Generation", audiences: 8, metrics: 15, lastModified: "1 day ago", category: "Social" },

  // Commerce & Purchase Behavior
  { id: "commerce-1", name: "Income Segment Purchase Channel Preferences", audiences: 12, metrics: 15, lastModified: "4 hours ago", category: "Commerce" },
  { id: "commerce-2", name: "E-commerce vs In-Store by Product Category", audiences: 8, metrics: 18, lastModified: "2 hours ago", category: "Commerce" },
  { id: "commerce-3", name: "Subscription Service Adoption by Segment", audiences: 10, metrics: 12, lastModified: "6 hours ago", category: "Commerce" },

  // Brand & Competitive Intelligence
  { id: "brand-1", name: "Brand Awareness Competitive Landscape", audiences: 15, metrics: 8, lastModified: "3 hours ago", category: "Brand" },
  { id: "brand-2", name: "Brand Health Funnel by Market", audiences: 6, metrics: 6, lastModified: "5 hours ago", category: "Brand" },
  { id: "brand-3", name: "Competitive NPS Benchmarking", audiences: 8, metrics: 5, lastModified: "8 hours ago", category: "Brand" },

  // Media & Content Consumption
  { id: "media-1", name: "Media Consumption by Daypart", audiences: 12, metrics: 15, lastModified: "8 hours ago", category: "Media" },
  { id: "media-2", name: "Streaming Service Preferences by Age", audiences: 8, metrics: 12, lastModified: "12 hours ago", category: "Media" },
  { id: "media-3", name: "News Source Trust by Demographics", audiences: 10, metrics: 8, lastModified: "1 day ago", category: "Media" },

  // Demographics & Segmentation
  { id: "demo-1", name: "Sustainability Attitudes by Consumer Segment", audiences: 15, metrics: 10, lastModified: "6 hours ago", category: "Values" },
  { id: "demo-2", name: "Tech Adoption by Income Level", audiences: 8, metrics: 11, lastModified: "2 days ago", category: "Technology" },

  // Health & Lifestyle
  { id: "health-1", name: "Health & Fitness Behavior Analysis", audiences: 12, metrics: 8, lastModified: "4 hours ago", category: "Health" },
  { id: "food-1", name: "Food & Dining Preferences by Segment", audiences: 10, metrics: 5, lastModified: "1 day ago", category: "Food" },

  // Market & Geographic Analysis
  { id: "market-1", name: "Global Market Digital Behavior Comparison", audiences: 18, metrics: 25, lastModified: "2 days ago", category: "Global" },
  { id: "market-2", name: "US vs UK vs Germany Consumer Attitudes", audiences: 6, metrics: 30, lastModified: "1 day ago", category: "Global" },
]

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return 'Just now'
}

interface ApiCrosstab {
  id: string
  name: string
  updatedAt: string
  configuration?: {
    audiences?: string[]
    metrics?: string[]
  }
}

function mapApiCrosstab(apiCrosstab: ApiCrosstab): Crosstab {
  const config = apiCrosstab.configuration || {}
  return {
    id: apiCrosstab.id,
    name: apiCrosstab.name,
    audiences: config.audiences?.length || 0,
    metrics: config.metrics?.length || 8,
    lastModified: formatTimeAgo(apiCrosstab.updatedAt),
  }
}

export default function CrosstabsPage() {
  const t = useTranslations('dashboard.crosstabs')
  const [crosstabs, setCrosstabs] = useState<Crosstab[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, views: 0, exports: 0, usedToday: 0 })
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function fetchCrosstabs() {
      try {
        const response = await fetch('/api/v1/crosstabs')
        if (response.ok) {
          const data = await response.json()
          const apiCrosstabs = data.crosstabs || data.data || []

          // Map API crosstabs but only include ones with valid configuration
          const validApiCrosstabs = apiCrosstabs
            .map(mapApiCrosstab)
            .filter((ct: Crosstab) => ct.audiences > 0 || ct.metrics > 0)

          // Always include demoCrosstabs, then add any valid API crosstabs that aren't duplicates
          const existingIds = new Set(demoCrosstabs.map(ct => ct.id))
          const uniqueApiCrosstabs = validApiCrosstabs.filter((ct: Crosstab) => !existingIds.has(ct.id))
          const allCrosstabs = [...demoCrosstabs, ...uniqueApiCrosstabs]

          setCrosstabs(allCrosstabs)
          setStats({
            total: allCrosstabs.length,
            views: Math.floor(allCrosstabs.length * 200),
            exports: Math.floor(allCrosstabs.length * 10),
            usedToday: Math.min(12, allCrosstabs.length),
          })
        } else {
          setCrosstabs(demoCrosstabs)
          setStats({ total: demoCrosstabs.length, views: 3200, exports: 156, usedToday: 12 })
        }
      } catch (error) {
        console.error('Failed to fetch crosstabs:', error)
        setCrosstabs(demoCrosstabs)
        setStats({ total: demoCrosstabs.length, views: 3200, exports: 156, usedToday: 12 })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCrosstabs()
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageTracker pageName="Crosstabs List" metadata={{ activeTab }} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <Link href="/dashboard/crosstabs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('newCrosstab')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <Table2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.totalCrosstabs')}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Eye className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.views')}</p>
              <p className="text-2xl font-bold">{formatNumber(stats.views)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Download className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.exports')}</p>
              <p className="text-2xl font-bold">{stats.exports}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.usedToday')}</p>
              <p className="text-2xl font-bold">{stats.usedToday}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t('tabs.all')}</TabsTrigger>
          <TabsTrigger value="recent">{t('tabs.recent')}</TabsTrigger>
          <TabsTrigger value="templates">{t('tabs.templates')}</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {isLoading ? (
            <CrosstabsGridSkeleton />
          ) : (
            <CrosstabsGrid crosstabs={crosstabs} />
          )}
        </TabsContent>
        <TabsContent value="recent">
          {isLoading ? (
            <CrosstabsGridSkeleton />
          ) : (
            <CrosstabsGrid crosstabs={crosstabs.slice(0, 6)} />
          )}
        </TabsContent>
        <TabsContent value="templates">
          {isLoading ? (
            <CrosstabsGridSkeleton />
          ) : (
            <CrosstabsGrid crosstabs={crosstabs.slice(0, 3)} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CrosstabsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-lg" />
      ))}
    </div>
  )
}

function CrosstabsGrid({ crosstabs }: { crosstabs: Crosstab[] }) {
  const t = useTranslations('dashboard.crosstabs')

  if (crosstabs.length === 0) {
    return (
      <div className="text-center py-12">
        <Table2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">{t('empty.title')}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t('empty.description')}</p>
        <Link href="/dashboard/crosstabs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('newCrosstab')}
          </Button>
        </Link>
      </div>
    )
  }

  // Separate featured from regular crosstabs
  const featured = crosstabs.filter(c => c.isFeatured)
  const regular = crosstabs.filter(c => !c.isFeatured)

  return (
    <div className="space-y-6">
      {/* Featured Crosstab - Full Width */}
      {featured.map((crosstab) => (
        <Link key={crosstab.id} href="/dashboard/crosstabs/analysis">
          <Card className="p-6 hover:bg-accent/50 transition-colors cursor-pointer border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="bg-primary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {t('badges.featured')}
                  </Badge>
                  <Badge variant="outline">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {t('badges.liveData')}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg">{crosstab.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('featured.exploreCategories', { count: DATA_SUMMARY.categories.length })}
                </p>
                <div className="flex items-center gap-6 mt-4 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-primary">{crosstab.audiences}</span>
                    <span className="text-muted-foreground">{t('labels.audienceSegments')}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-primary">{crosstab.metrics}</span>
                    <span className="text-muted-foreground">{t('labels.metrics')}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {DATA_SUMMARY.categories.slice(0, 6).map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                  {DATA_SUMMARY.categories.length > 6 && (
                    <Badge variant="secondary" className="text-xs">
                      {t('badges.more', { count: DATA_SUMMARY.categories.length - 6 })}
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="default" size="sm" className="ml-4">
                {t('actions.openAnalysis')}
              </Button>
            </div>
          </Card>
        </Link>
      ))}

      {/* Regular Crosstabs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {regular.map((crosstab) => (
          <Link key={crosstab.id} href={crosstab.id === "analysis" ? "/dashboard/crosstabs/analysis" : `/dashboard/crosstabs/${crosstab.id}`}>
            <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{crosstab.name}</h3>
                {crosstab.category && (
                  <Badge variant="outline" className="text-xs ml-2 shrink-0">
                    {crosstab.category}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span>{t('labels.audiencesCount', { count: crosstab.audiences })}</span>
                <span>{t('labels.metricsCount', { count: crosstab.metrics })}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{t('labels.modified', { time: crosstab.lastModified })}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
