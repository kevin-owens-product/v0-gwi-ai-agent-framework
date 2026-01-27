"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Plus,
  BarChart3,
  TrendingUp,
  Eye,
  Share2,
  Filter,
  Grid3X3,
  List,
  Sparkles,
  Download,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  AdvancedChartRenderer,
  generateAdvancedSampleData,
  ChartTemplateGallery,
  ChartComparison,
  comparisonScenarios,
  type AdvancedChartType,
  type GWIChartTemplate,
} from "@/components/charts"
import { PageTracker } from "@/components/tracking/PageTracker"
import { useTranslations } from "next-intl"

interface ChartDataPoint {
  name: string
  value?: number
  [key: string]: string | number | undefined
}

interface Chart {
  id: string
  name: string
  type: AdvancedChartType
  description?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  data?: ChartDataPoint[]
  config?: Record<string, string | number | boolean>
  template?: GWIChartTemplate
  views?: number
  category?: string
}

// Advanced demo charts with realistic GWI data
const advancedDemoCharts: Chart[] = [
  {
    id: "1",
    name: "Social Media Platform Penetration by Generation",
    type: "GROUPED_BAR",
    description: "Digital natives vs. traditional users",
    updatedAt: "2 hours ago",
    template: "social-platform-reach",
    views: 1247,
    category: "Social Media",
  },
  {
    id: "2",
    name: "E-commerce Purchase Intent Trajectory",
    type: "AREA",
    description: "Q1-Q4 2024 trend analysis",
    updatedAt: "4 hours ago",
    template: "media-consumption-trend",
    views: 892,
    category: "E-commerce",
  },
  {
    id: "3",
    name: "Brand Health Dashboard",
    type: "BULLET",
    description: "Key metrics vs. industry benchmark",
    updatedAt: "1 day ago",
    template: "brand-health-tracker",
    views: 2341,
    category: "Brand",
  },
  {
    id: "4",
    name: "Media Consumption Time Share",
    type: "DONUT",
    description: "Share of daily media hours by platform",
    updatedAt: "6 hours ago",
    template: "market-share",
    views: 1567,
    category: "Media",
  },
  {
    id: "5",
    name: "Cross-Market Sustainability Attitudes",
    type: "HORIZONTAL_BAR",
    description: "Regional comparison of eco-conscious consumers",
    updatedAt: "2 days ago",
    template: "regional-breakdown",
    views: 743,
    category: "Consumer Insights",
  },
  {
    id: "6",
    name: "Streaming Service Subscriber Journey",
    type: "FUNNEL",
    description: "Conversion funnel analysis",
    updatedAt: "12 hours ago",
    template: "conversion-funnel",
    views: 1089,
    category: "Media",
  },
  {
    id: "7",
    name: "Gen Z Financial Product Adoption",
    type: "RADAR",
    description: "Multi-dimensional behavior analysis",
    updatedAt: "1 day ago",
    template: "purchase-drivers",
    views: 654,
    category: "Finance",
  },
  {
    id: "8",
    name: "Content Format Preference",
    type: "TREEMAP",
    description: "Share of engagement by content type",
    updatedAt: "3 days ago",
    template: "content-preference",
    views: 987,
    category: "Content",
  },
  {
    id: "9",
    name: "Health & Wellness Spending Trends",
    type: "LINE",
    description: "YoY growth in wellness categories",
    updatedAt: "8 hours ago",
    template: "media-consumption-trend",
    views: 1432,
    category: "Health",
  },
  {
    id: "10",
    name: "Audience Segment Correlation",
    type: "BUBBLE",
    description: "Engagement vs. spending analysis",
    updatedAt: "5 hours ago",
    template: "audience-correlation",
    views: 876,
    category: "Audience",
  },
  {
    id: "11",
    name: "Marketing Attribution Analysis",
    type: "WATERFALL",
    description: "Channel contribution to awareness",
    updatedAt: "1 hour ago",
    template: "attribution-waterfall",
    views: 1123,
    category: "Marketing",
  },
  {
    id: "12",
    name: "Digital Behavior by Generation",
    type: "HEATMAP",
    description: "Technology adoption matrix",
    updatedAt: "30 minutes ago",
    template: "generation-comparison",
    views: 2156,
    category: "Demographics",
  },
]

const chartCategories = [
  "All",
  "Social Media",
  "Brand",
  "Media",
  "E-commerce",
  "Consumer Insights",
  "Demographics",
  "Marketing",
]

export default function ChartsPage() {
  const t = useTranslations("dashboard.charts")
  const [charts, setCharts] = useState<Chart[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, views: 0, shares: 0, exports: 0 })
  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showTemplates, setShowTemplates] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    async function fetchCharts() {
      // Helper to calculate stats from chart data
      const calculateStats = (chartList: Chart[]) => {
        const totalViews = chartList.reduce((sum, c) => sum + (c.views || 0), 0)
        return {
          total: chartList.length,
          views: totalViews,
          shares: Math.floor(totalViews * 0.15), // ~15% share rate
          exports: Math.floor(totalViews * 0.06), // ~6% export rate
        }
      }

      try {
        const response = await fetch("/api/v1/charts")
        if (response.ok) {
          const data = await response.json()
          const chartsData = data.charts || data.data || []

          // Always include demo charts, then add valid API charts
          const existingIds = new Set(advancedDemoCharts.map(c => c.id))
          const validApiCharts = chartsData.filter((c: Chart) => !existingIds.has(c.id))
          const allCharts = [...advancedDemoCharts, ...validApiCharts]

          setCharts(allCharts)
          setStats(calculateStats(allCharts))
        } else {
          setCharts(advancedDemoCharts)
          setStats(calculateStats(advancedDemoCharts))
        }
      } catch (error) {
        console.error("Failed to fetch charts:", error)
        setCharts(advancedDemoCharts)
        setStats(calculateStats(advancedDemoCharts))
      } finally {
        setIsLoading(false)
      }
    }
    fetchCharts()
  }, [])

  // Filter charts
  const filteredCharts = charts.filter((chart) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !chart.name.toLowerCase().includes(query) &&
        !chart.description?.toLowerCase().includes(query)
      ) {
        return false
      }
    }
    if (selectedCategory !== "All" && chart.category !== selectedCategory) {
      return false
    }
    return true
  })

  const handleCreateFromTemplate = (template: GWIChartTemplate, _config: Record<string, unknown>) => {
    // Navigate to create page with template pre-selected
    window.location.href = `/dashboard/charts/new?template=${template}`
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageTracker pageName={t("pageTracker")} metadata={{ activeTab, viewMode }} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowTemplates(!showTemplates)}>
            <Sparkles className="h-4 w-4 mr-2" />
            {t("templates")}
          </Button>
          <Button variant="outline" onClick={() => setShowComparison(!showComparison)}>
            <TrendingUp className="h-4 w-4 mr-2" />
            {t("compare")}
          </Button>
          <Link href="/dashboard/charts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("newChart")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalCharts")}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalViews")}</p>
                <p className="text-2xl font-bold">
                  {stats.views >= 1000 ? `${(stats.views / 1000).toFixed(1)}K` : stats.views}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Share2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("shares")}</p>
                <p className="text-2xl font-bold">{stats.shares}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Download className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("exports")}</p>
                <p className="text-2xl font-bold">{stats.exports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Gallery */}
      {showTemplates && (
        <Card>
          <CardContent className="p-6">
            <ChartTemplateGallery onCreateChart={handleCreateFromTemplate} />
          </CardContent>
        </Card>
      )}

      {/* Comparison View */}
      {showComparison && (
        <ChartComparison
          data={comparisonScenarios.brandHealth}
          title={t("comparison.title")}
          description={t("comparison.description")}
        />
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chartCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "All" ? t("allCategory") : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t("allCharts")} ({filteredCharts.length})</TabsTrigger>
          <TabsTrigger value="recent">{t("recent")}</TabsTrigger>
          <TabsTrigger value="popular">{t("mostViewed")}</TabsTrigger>
          <TabsTrigger value="favorites">{t("favorites")}</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {isLoading ? (
            <ChartsGridSkeleton viewMode={viewMode} />
          ) : (
            <ChartsGrid charts={filteredCharts} viewMode={viewMode} />
          )}
        </TabsContent>
        <TabsContent value="recent">
          {isLoading ? (
            <ChartsGridSkeleton viewMode={viewMode} />
          ) : (
            <ChartsGrid
              charts={filteredCharts.slice(0, 6)}
              viewMode={viewMode}
            />
          )}
        </TabsContent>
        <TabsContent value="popular">
          {isLoading ? (
            <ChartsGridSkeleton viewMode={viewMode} />
          ) : (
            <ChartsGrid
              charts={[...filteredCharts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6)}
              viewMode={viewMode}
            />
          )}
        </TabsContent>
        <TabsContent value="favorites">
          {isLoading ? (
            <ChartsGridSkeleton viewMode={viewMode} />
          ) : (
            <ChartsGrid charts={filteredCharts.slice(0, 3)} viewMode={viewMode} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ChartsGridSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-lg" />
      ))}
    </div>
  )
}

function ChartsGrid({ charts, viewMode }: { charts: Chart[]; viewMode: "grid" | "list" }) {
  const t = useTranslations("dashboard.charts")

  if (charts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">{t("emptyState.title")}</h3>
        <p className="text-muted-foreground mb-4">
          {t("emptyState.description")}
        </p>
        <Link href="/dashboard/charts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("emptyState.action")}
          </Button>
        </Link>
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {charts.map((chart) => (
          <Link key={chart.id} href={`/dashboard/charts/${chart.id}`}>
            <Card className="hover:bg-accent/50 transition-colors">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-32 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <AdvancedChartRenderer
                    type={chart.type}
                    data={chart.data || generateAdvancedSampleData(chart.type, chart.template)}
                    config={{ showLegend: false, showGrid: false, height: 64, animate: false }}
                    template={chart.template}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{chart.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{chart.description}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {chart.category && <Badge variant="outline">{chart.category}</Badge>}
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {chart.views || 0}
                  </span>
                  <span>{chart.updatedAt}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {charts.map((chart) => (
        <Link key={chart.id} href={`/dashboard/charts/${chart.id}`}>
          <Card className="group hover:shadow-lg transition-all cursor-pointer h-full overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
              <AdvancedChartRenderer
                type={chart.type}
                data={chart.data || generateAdvancedSampleData(chart.type, chart.template)}
                config={{
                  showLegend: false,
                  showGrid: false,
                  height: 160,
                  animate: false,
                  showTooltip: false,
                }}
                template={chart.template}
              />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {chart.name}
                </h3>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {formatChartType(chart.type)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                {chart.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  {chart.category && (
                    <Badge variant="outline" className="text-xs">
                      {chart.category}
                    </Badge>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {chart.views || 0}
                  </span>
                </div>
                <span>{chart.updatedAt}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function formatChartType(type: AdvancedChartType): string {
  const typeMap: Record<string, string> = {
    BAR: "Bar",
    HORIZONTAL_BAR: "H-Bar",
    GROUPED_BAR: "Grouped",
    STACKED_BAR: "Stacked",
    LINE: "Line",
    MULTI_LINE: "Multi-Line",
    AREA: "Area",
    STACKED_AREA: "Stacked Area",
    PIE: "Pie",
    DONUT: "Donut",
    RADAR: "Radar",
    SCATTER: "Scatter",
    BUBBLE: "Bubble",
    FUNNEL: "Funnel",
    TREEMAP: "Treemap",
    HEATMAP: "Heatmap",
    COMBO: "Combo",
    WATERFALL: "Waterfall",
    BULLET: "Bullet",
    METRIC: "Metric",
    SPARKLINE: "Sparkline",
    COMPARISON_BAR: "Comparison",
  }
  return typeMap[type] || type
}
