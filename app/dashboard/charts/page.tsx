"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3, TrendingUp, Eye, Share2 } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartRenderer, generateSampleData } from "@/components/charts"
import type { ChartType } from "@/components/charts"

interface Chart {
  id: string
  name: string
  type: ChartType
  description?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  data?: any[]
  config?: Record<string, any>
}

// Demo charts data as fallback
const demoCharts: Chart[] = [
  { id: "1", name: "Social Media Platform Penetration by Generation", type: "BAR", description: "All Adults 18-65", updatedAt: "2 hours ago" },
  { id: "2", name: "E-commerce Purchase Intent Trajectory", type: "LINE", description: "Online Shoppers", updatedAt: "4 hours ago" },
  { id: "3", name: "Competitive Brand Health Dashboard", type: "BAR", description: "Category Buyers", updatedAt: "1 day ago" },
  { id: "4", name: "Media Consumption Time Share", type: "PIE", description: "Eco-Conscious Millennials", updatedAt: "6 hours ago" },
  { id: "5", name: "Cross-Market Sustainability Attitudes", type: "BAR", description: "Premium Consumers", updatedAt: "2 days ago" },
  { id: "6", name: "Streaming Service Subscriber Journey", type: "LINE", description: "Cord-Cutters", updatedAt: "12 hours ago" },
  { id: "7", name: "Gen Z Financial Product Adoption", type: "AREA", description: "Gen Z (18-25)", updatedAt: "1 day ago" },
  { id: "8", name: "Influencer Trust by Category", type: "DONUT", description: "Social Media Active Users", updatedAt: "3 days ago" },
  { id: "9", name: "Health & Wellness Spending Trends", type: "LINE", description: "Health-Optimized Professionals", updatedAt: "8 hours ago" },
  { id: "10", name: "Luxury Purchase Drivers Analysis", type: "RADAR", description: "Luxury Experience Seekers", updatedAt: "5 hours ago" },
]

export default function ChartsPage() {
  const [charts, setCharts] = useState<Chart[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, views: 0, shares: 0, exports: 0 })

  useEffect(() => {
    async function fetchCharts() {
      try {
        const response = await fetch("/api/v1/charts")
        if (response.ok) {
          const data = await response.json()
          const chartsData = data.charts || data.data || []
          if (chartsData.length > 0) {
            setCharts(chartsData)
            setStats({
              total: data.total || chartsData.length,
              views: chartsData.reduce((sum: number, c: any) => sum + (c.views || 0), 0),
              shares: 0,
              exports: 0,
            })
          } else {
            // Use demo data if no charts from API
            setCharts(demoCharts)
            setStats({ total: demoCharts.length, views: 12400, shares: 234, exports: 89 })
          }
        } else {
          // Fallback to demo data
          setCharts(demoCharts)
          setStats({ total: demoCharts.length, views: 12400, shares: 234, exports: 89 })
        }
      } catch (error) {
        console.error("Failed to fetch charts:", error)
        // Fallback to demo data
        setCharts(demoCharts)
        setStats({ total: demoCharts.length, views: 12400, shares: 234, exports: 89 })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCharts()
  }, [])

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Charts</h1>
          <p className="text-muted-foreground mt-1">Visualize consumer data with interactive charts</p>
        </div>
        <Link href="/dashboard/charts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Chart
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <BarChart3 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Charts</p>
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
              <p className="text-sm text-muted-foreground">Views</p>
              <p className="text-2xl font-bold">{stats.views >= 1000 ? `${(stats.views / 1000).toFixed(1)}K` : stats.views}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Share2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shares</p>
              <p className="text-2xl font-bold">{stats.shares}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exports</p>
              <p className="text-2xl font-bold">{stats.exports}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Charts</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {isLoading ? <ChartsGridSkeleton /> : <ChartsGrid charts={charts} />}
        </TabsContent>
        <TabsContent value="recent">
          {isLoading ? <ChartsGridSkeleton /> : <ChartsGrid charts={charts.slice(0, 6)} />}
        </TabsContent>
        <TabsContent value="favorites">
          {isLoading ? <ChartsGridSkeleton /> : <ChartsGrid charts={charts.slice(0, 3)} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ChartsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-lg" />
      ))}
    </div>
  )
}

function ChartsGrid({ charts }: { charts: Chart[] }) {
  if (charts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No charts yet</h3>
        <p className="text-muted-foreground mb-4">Create your first chart to visualize consumer data</p>
        <Link href="/dashboard/charts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Chart
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {charts.map((chart) => (
        <Link key={chart.id} href={`/dashboard/charts/${chart.id}`}>
          <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
              <ChartRenderer
                type={chart.type}
                data={chart.data || generateSampleData(chart.type, 6, chart.id)}
                config={{ showLegend: false, showGrid: false, height: 140 }}
              />
            </div>
            <h3 className="font-semibold line-clamp-2">{chart.name}</h3>
            <p className="text-sm text-muted-foreground">{formatChartType(chart.type)}</p>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>{chart.updatedAt || "Recently"}</span>
              <span>{chart.description}</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function formatChartType(type: ChartType): string {
  const typeMap: Record<ChartType, string> = {
    BAR: "Bar Chart",
    LINE: "Line Chart",
    PIE: "Pie Chart",
    DONUT: "Donut Chart",
    AREA: "Area Chart",
    SCATTER: "Scatter Chart",
    HEATMAP: "Heatmap",
    TREEMAP: "Treemap",
    FUNNEL: "Funnel Chart",
    RADAR: "Radar Chart",
  }
  return typeMap[type] || type
}
