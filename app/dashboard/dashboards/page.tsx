"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Plus, LayoutDashboard, Eye, Share2, Download } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartRenderer, generateSampleData } from "@/components/charts"
import type { ChartType } from "@/components/charts"
import { PageTracker } from "@/components/tracking/PageTracker"

interface Dashboard {
  id: string
  name: string
  charts: number
  lastModified: string
  views: number
}

// Demo dashboards for fallback
const demoDashboards: Dashboard[] = [
  { id: "1", name: "Q4 2024 Campaign Performance Hub", charts: 10, lastModified: "1 hour ago", views: 2341 },
  { id: "2", name: "Global Consumer Trends 2024", charts: 12, lastModified: "4 hours ago", views: 5672 },
  { id: "3", name: "Competitive Brand Health Tracker", charts: 8, lastModified: "2 days ago", views: 3892 },
  { id: "4", name: "Gen Z Insights Command Center", charts: 9, lastModified: "6 hours ago", views: 4521 },
  { id: "5", name: "E-commerce Performance Analytics", charts: 10, lastModified: "3 hours ago", views: 2987 },
  { id: "6", name: "Media Mix Optimization Center", charts: 8, lastModified: "8 hours ago", views: 1876 },
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

interface ApiDashboard {
  id: string
  name: string
  chartCount?: number
  updatedAt: string
  views?: number
}

function mapApiDashboard(apiDashboard: ApiDashboard): Dashboard {
  return {
    id: apiDashboard.id,
    name: apiDashboard.name,
    charts: apiDashboard.chartCount || 0,
    lastModified: formatTimeAgo(apiDashboard.updatedAt),
    views: apiDashboard.views || 0,
  }
}

export default function DashboardsPage() {
  const t = useTranslations('dashboard.dashboards')
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, views: 0, shared: 0, exports: 0 })
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function fetchDashboards() {
      // Helper to calculate stats from dashboard list
      const calculateStats = (dashboardList: Dashboard[]) => {
        const totalViews = dashboardList.reduce((sum, d) => sum + d.views, 0)
        return {
          total: dashboardList.length,
          views: totalViews,
          shared: Math.floor(totalViews * 0.05), // ~5% share rate
          exports: Math.floor(totalViews * 0.02), // ~2% export rate
        }
      }

      try {
        const response = await fetch('/api/v1/dashboards', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (response.ok) {
          const data = await response.json()
          const apiDashboards = data.dashboards || data.data || []

          // Always include demo dashboards, then add valid API dashboards
          const existingIds = new Set(demoDashboards.map(d => d.id))
          const validApiDashboards = apiDashboards
            .map(mapApiDashboard)
            .filter((d: Dashboard) => !existingIds.has(d.id))
          const allDashboards = [...demoDashboards, ...validApiDashboards]

          setDashboards(allDashboards)
          setStats(calculateStats(allDashboards))
        } else {
          setDashboards(demoDashboards)
          setStats(calculateStats(demoDashboards))
        }
      } catch (error) {
        console.error('Failed to fetch dashboards:', error)
        setDashboards(demoDashboards)
        setStats(calculateStats(demoDashboards))
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboards()
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageTracker pageName="Dashboards List" metadata={{ activeTab }} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <Link href="/dashboard/dashboards/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('newDashboard')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.totalDashboards')}</p>
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
              <p className="text-sm text-muted-foreground">{t('stats.totalViews')}</p>
              <p className="text-2xl font-bold">{formatNumber(stats.views)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Share2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.shared')}</p>
              <p className="text-2xl font-bold">{stats.shared}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Download className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('stats.exports')}</p>
              <p className="text-2xl font-bold">{stats.exports}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t('tabs.allDashboards')}</TabsTrigger>
          <TabsTrigger value="recent">{t('tabs.recent')}</TabsTrigger>
          <TabsTrigger value="favorites">{t('tabs.favorites')}</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {isLoading ? (
            <DashboardsGridSkeleton />
          ) : (
            <DashboardsGrid dashboards={dashboards} />
          )}
        </TabsContent>
        <TabsContent value="recent">
          {isLoading ? (
            <DashboardsGridSkeleton />
          ) : (
            <DashboardsGrid dashboards={dashboards.slice(0, 6)} />
          )}
        </TabsContent>
        <TabsContent value="favorites">
          {isLoading ? (
            <DashboardsGridSkeleton />
          ) : (
            <DashboardsGrid dashboards={dashboards.slice(0, 3)} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DashboardsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-lg" />
      ))}
    </div>
  )
}

function DashboardsGrid({ dashboards }: { dashboards: Dashboard[] }) {
  const t = useTranslations('dashboard.dashboards')

  if (dashboards.length === 0) {
    return (
      <div className="text-center py-12">
        <LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">{t('grid.noDashboardsYet')}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t('grid.createFirstDashboard')}</p>
        <Link href="/dashboard/dashboards/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('newDashboard')}
          </Button>
        </Link>
      </div>
    )
  }

  // Generate consistent chart types for a dashboard based on its id
  const getDashboardChartTypes = (dashboardId: string): ChartType[] => {
    const seed = parseInt(dashboardId) || 1
    const types: ChartType[] = ["BAR", "LINE", "PIE", "AREA"]
    return [
      types[seed % 4],
      types[(seed + 1) % 4],
      types[(seed + 2) % 4],
      types[(seed + 3) % 4],
    ]
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dashboards.map((dashboard) => {
        const chartTypes = getDashboardChartTypes(dashboard.id)
        return (
          <Link key={dashboard.id} href={`/dashboard/dashboards/${dashboard.id}`}>
            <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5 p-0.5">
                {chartTypes.map((type, idx) => (
                  <div key={idx} className="bg-background rounded overflow-hidden">
                    <ChartRenderer
                      type={type}
                      data={generateSampleData(type, 4)}
                      config={{ showLegend: false, showGrid: false, showTooltip: false, height: 60 }}
                    />
                  </div>
                ))}
              </div>
              <h3 className="font-semibold">{dashboard.name}</h3>
              <p className="text-sm text-muted-foreground">{t('grid.chartsCount', { count: dashboard.charts })}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>{dashboard.lastModified}</span>
                <span>{t('grid.viewsCount', { count: dashboard.views })}</span>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
