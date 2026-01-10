"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Download,
  Share2,
  Edit,
  MoreHorizontal,
  Eye,
  Calendar,
  Users,
  LayoutDashboard,
  BarChart3,
  LineChart,
  PieChart,
  Plus,
  Settings,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock dashboard data - 10 advanced examples
const dashboardData: Record<string, {
  id: string
  name: string
  description: string
  charts: { id: string; name: string; type: "bar" | "line" | "pie" }[]
  lastModified: string
  views: number
  createdBy: string
  isPublic: boolean
  category: string
}> = {
  "1": {
    id: "1",
    name: "Q4 2024 Campaign Performance Hub",
    description: "Comprehensive performance analytics for Q4 marketing campaigns across all channels with real-time KPI tracking",
    charts: [
      { id: "c1", name: "Multi-Channel Engagement Rates", type: "bar" },
      { id: "c2", name: "Full-Funnel Conversion Analysis", type: "bar" },
      { id: "c3", name: "Weekly Performance Trajectory", type: "line" },
      { id: "c4", name: "Audience Reach by Demographic", type: "pie" },
      { id: "c5", name: "ROI by Campaign & Creative", type: "bar" },
      { id: "c6", name: "CTR Trend with Benchmarks", type: "line" },
      { id: "c7", name: "Brand Lift by Exposure Level", type: "bar" },
      { id: "c8", name: "CPA Optimization Tracker", type: "line" },
      { id: "c9", name: "Attribution Model Comparison", type: "bar" },
      { id: "c10", name: "Budget Allocation Efficiency", type: "pie" },
    ],
    lastModified: "1 hour ago",
    views: 2341,
    createdBy: "Sarah Chen",
    isPublic: false,
    category: "Campaign Analytics",
  },
  "2": {
    id: "2",
    name: "Global Consumer Trends 2024",
    description: "Annual consumer behavior analysis covering digital habits, purchase patterns, and emerging lifestyle trends across 48 markets",
    charts: [
      { id: "c1", name: "Social Platform Penetration by Gen", type: "bar" },
      { id: "c2", name: "Omnichannel Shopping Mix", type: "pie" },
      { id: "c3", name: "Brand Loyalty Evolution (3Y)", type: "line" },
      { id: "c4", name: "Sustainability Attitude Segments", type: "bar" },
      { id: "c5", name: "Device Ecosystem Usage", type: "pie" },
      { id: "c6", name: "Content Format Preferences", type: "bar" },
      { id: "c7", name: "Purchase Decision Drivers", type: "bar" },
      { id: "c8", name: "Generational Breakdown", type: "pie" },
      { id: "c9", name: "Regional Behavior Variations", type: "bar" },
      { id: "c10", name: "YoY Trend Comparison", type: "line" },
      { id: "c11", name: "Emerging Behavior Indicators", type: "bar" },
      { id: "c12", name: "Category Market Share", type: "pie" },
    ],
    lastModified: "4 hours ago",
    views: 5672,
    createdBy: "Marcus Johnson",
    isPublic: true,
    category: "Market Research",
  },
  "3": {
    id: "3",
    name: "Competitive Brand Health Tracker",
    description: "Real-time monitoring of brand perception metrics vs. key competitors with sentiment analysis and advocacy tracking",
    charts: [
      { id: "c1", name: "Unaided vs Aided Awareness", type: "bar" },
      { id: "c2", name: "NPS Trend Analysis", type: "line" },
      { id: "c3", name: "Share of Voice Distribution", type: "pie" },
      { id: "c4", name: "Sentiment Score by Channel", type: "bar" },
      { id: "c5", name: "Purchase Consideration Funnel", type: "bar" },
      { id: "c6", name: "Brand Attribute Mapping", type: "bar" },
      { id: "c7", name: "Competitive Positioning Matrix", type: "bar" },
      { id: "c8", name: "Brand Advocacy Index", type: "line" },
    ],
    lastModified: "2 days ago",
    views: 3892,
    createdBy: "Emily Thompson",
    isPublic: true,
    category: "Brand Intelligence",
  },
  "4": {
    id: "4",
    name: "Gen Z Insights Command Center",
    description: "Deep-dive analysis of Gen Z consumer behaviors, platform preferences, and brand relationships across global markets",
    charts: [
      { id: "c1", name: "Platform Time Allocation", type: "pie" },
      { id: "c2", name: "Content Consumption by Format", type: "bar" },
      { id: "c3", name: "Shopping Journey Mapping", type: "line" },
      { id: "c4", name: "Influencer Trust Levels", type: "bar" },
      { id: "c5", name: "Values & Causes Alignment", type: "bar" },
      { id: "c6", name: "Brand Discovery Channels", type: "pie" },
      { id: "c7", name: "Purchase Influence Factors", type: "bar" },
      { id: "c8", name: "Cross-Market Comparison", type: "bar" },
      { id: "c9", name: "Emerging Trend Radar", type: "bar" },
    ],
    lastModified: "6 hours ago",
    views: 4521,
    createdBy: "Alex Rivera",
    isPublic: true,
    category: "Audience Intelligence",
  },
  "5": {
    id: "5",
    name: "E-commerce Performance Analytics",
    description: "End-to-end e-commerce funnel analysis with cart behavior, payment preferences, and cross-channel attribution",
    charts: [
      { id: "c1", name: "Funnel Drop-off Analysis", type: "bar" },
      { id: "c2", name: "Cart Abandonment Reasons", type: "pie" },
      { id: "c3", name: "Revenue by Channel", type: "bar" },
      { id: "c4", name: "Payment Method Preferences", type: "pie" },
      { id: "c5", name: "AOV Trend by Segment", type: "line" },
      { id: "c6", name: "Repeat Purchase Patterns", type: "line" },
      { id: "c7", name: "Cross-sell/Upsell Success", type: "bar" },
      { id: "c8", name: "Mobile vs Desktop Split", type: "pie" },
      { id: "c9", name: "Seasonal Performance", type: "line" },
      { id: "c10", name: "Customer Lifetime Value", type: "bar" },
    ],
    lastModified: "3 hours ago",
    views: 2987,
    createdBy: "Victoria Wells",
    isPublic: false,
    category: "Commerce Analytics",
  },
  "6": {
    id: "6",
    name: "Media Mix Optimization Center",
    description: "Cross-channel media performance analysis with budget allocation recommendations and reach/frequency optimization",
    charts: [
      { id: "c1", name: "Channel Efficiency Matrix", type: "bar" },
      { id: "c2", name: "Budget Allocation Current", type: "pie" },
      { id: "c3", name: "Reach Curve Analysis", type: "line" },
      { id: "c4", name: "Frequency Distribution", type: "bar" },
      { id: "c5", name: "Cross-Channel Synergy", type: "bar" },
      { id: "c6", name: "Daypart Performance", type: "bar" },
      { id: "c7", name: "Creative Fatigue Tracker", type: "line" },
      { id: "c8", name: "Incremental Reach by Medium", type: "bar" },
    ],
    lastModified: "8 hours ago",
    views: 1876,
    createdBy: "Kevin Zhang",
    isPublic: false,
    category: "Media Planning",
  },
  "7": {
    id: "7",
    name: "Sustainability & ESG Tracker",
    description: "Consumer sustainability attitudes, brand perception on ESG issues, and green product adoption patterns",
    charts: [
      { id: "c1", name: "Sustainability Segment Sizes", type: "pie" },
      { id: "c2", name: "Willingness to Pay Premium", type: "bar" },
      { id: "c3", name: "ESG Awareness Trend", type: "line" },
      { id: "c4", name: "Green Product Adoption", type: "bar" },
      { id: "c5", name: "Brand ESG Perception", type: "bar" },
      { id: "c6", name: "Greenwashing Skepticism", type: "bar" },
      { id: "c7", name: "Sustainable Behavior Index", type: "line" },
      { id: "c8", name: "Category Sustainability Importance", type: "bar" },
      { id: "c9", name: "Gen Comparison on ESG", type: "bar" },
    ],
    lastModified: "1 day ago",
    views: 2234,
    createdBy: "Dr. James Park",
    isPublic: true,
    category: "ESG & Sustainability",
  },
  "8": {
    id: "8",
    name: "Streaming & Entertainment Landscape",
    description: "Comprehensive analysis of streaming platform usage, content preferences, and subscriber behavior patterns",
    charts: [
      { id: "c1", name: "Platform Subscriber Share", type: "pie" },
      { id: "c2", name: "Multi-Subscription Patterns", type: "bar" },
      { id: "c3", name: "Churn Risk Indicators", type: "bar" },
      { id: "c4", name: "Content Genre Preferences", type: "bar" },
      { id: "c5", name: "Viewing Time by Daypart", type: "line" },
      { id: "c6", name: "Ad-Tier Adoption Rate", type: "line" },
      { id: "c7", name: "Device Preference Split", type: "pie" },
      { id: "c8", name: "Binge vs Linear Viewing", type: "bar" },
      { id: "c9", name: "Password Sharing Behavior", type: "bar" },
      { id: "c10", name: "Content Discovery Methods", type: "pie" },
    ],
    lastModified: "5 hours ago",
    views: 3456,
    createdBy: "Isabella Martinez",
    isPublic: true,
    category: "Entertainment",
  },
  "9": {
    id: "9",
    name: "Financial Services Consumer Insights",
    description: "Banking, fintech, and investment behavior analysis with product adoption and trust metrics by segment",
    charts: [
      { id: "c1", name: "Digital Banking Adoption", type: "line" },
      { id: "c2", name: "Fintech Product Usage", type: "bar" },
      { id: "c3", name: "Investment App Penetration", type: "bar" },
      { id: "c4", name: "BNPL Usage by Demo", type: "bar" },
      { id: "c5", name: "Trust in Financial Institutions", type: "bar" },
      { id: "c6", name: "Crypto Ownership Trends", type: "line" },
      { id: "c7", name: "Insurance Product Gaps", type: "bar" },
      { id: "c8", name: "Financial Wellness Score", type: "pie" },
      { id: "c9", name: "Advisory Preference", type: "pie" },
    ],
    lastModified: "12 hours ago",
    views: 2789,
    createdBy: "David Chen",
    isPublic: false,
    category: "Financial Services",
  },
  "10": {
    id: "10",
    name: "Health & Wellness Market Monitor",
    description: "Consumer health priorities, wellness product adoption, and fitness behavior trends across demographics",
    charts: [
      { id: "c1", name: "Wellness Priority Rankings", type: "bar" },
      { id: "c2", name: "Fitness App Market Share", type: "pie" },
      { id: "c3", name: "Supplement Category Growth", type: "line" },
      { id: "c4", name: "Mental Health Awareness", type: "line" },
      { id: "c5", name: "Wearable Adoption Rates", type: "bar" },
      { id: "c6", name: "Telehealth Usage Patterns", type: "bar" },
      { id: "c7", name: "Diet & Nutrition Trends", type: "bar" },
      { id: "c8", name: "Sleep Optimization Behaviors", type: "bar" },
      { id: "c9", name: "Preventive Care Spending", type: "line" },
      { id: "c10", name: "Wellness Spend by Segment", type: "pie" },
    ],
    lastModified: "2 hours ago",
    views: 1923,
    createdBy: "Noah Williams",
    isPublic: true,
    category: "Health & Wellness",
  },
}

const ChartIcon = ({ type }: { type: "bar" | "line" | "pie" }) => {
  switch (type) {
    case "line":
      return <LineChart className="h-8 w-8 text-muted-foreground" />
    case "pie":
      return <PieChart className="h-8 w-8 text-muted-foreground" />
    default:
      return <BarChart3 className="h-8 w-8 text-muted-foreground" />
  }
}

interface DashboardType {
  id: string
  name: string
  description: string
  charts: { id: string; name: string; type: "bar" | "line" | "pie" }[]
  lastModified: string
  views: number
  createdBy: string
  isPublic: boolean
  category: string
}

export default function DashboardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dashboard, setDashboard] = useState<DashboardType | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/v1/dashboards/${id}`)
        if (response.ok) {
          const data = await response.json()
          const apiDashboard = data.data || data
          if (apiDashboard && apiDashboard.id) {
            setDashboard({
              id: apiDashboard.id,
              name: apiDashboard.name,
              description: apiDashboard.description || "",
              charts: (apiDashboard.widgets || []).map((w: any, i: number) => ({
                id: w.id || `chart-${i}`,
                name: w.title || w.name || `Chart ${i + 1}`,
                type: w.type || "bar",
              })),
              lastModified: apiDashboard.updatedAt ? formatTimeAgo(apiDashboard.updatedAt) : "Recently",
              views: apiDashboard.views || 0,
              createdBy: apiDashboard.createdByName || "Unknown",
              isPublic: apiDashboard.isPublic || false,
              category: apiDashboard.category || "Dashboard",
            })
          } else {
            // Fall back to demo data
            setDashboard(dashboardData[id] || null)
          }
        } else {
          // Fall back to demo data
          setDashboard(dashboardData[id] || null)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
        // Fall back to demo data
        setDashboard(dashboardData[id] || null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboard()
  }, [id])

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

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/dashboards">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Dashboard Not Found</h1>
            <p className="text-muted-foreground mt-1">The requested dashboard could not be found</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <LayoutDashboard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Dashboard not found</h2>
          <p className="text-muted-foreground mb-4">
            The dashboard you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/dashboards">
            <Button>Back to Dashboards</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const exportData = {
        dashboard: {
          id: dashboard.id,
          name: dashboard.name,
          description: dashboard.description,
          category: dashboard.category,
          isPublic: dashboard.isPublic,
          createdBy: dashboard.createdBy,
          exportedAt: new Date().toISOString(),
        },
        charts: dashboard.charts.map(chart => ({
          id: chart.id,
          name: chart.name,
          type: chart.type,
        })),
        metadata: {
          views: dashboard.views,
          lastModified: dashboard.lastModified,
        },
      }

      const content = JSON.stringify(exportData, null, 2)
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-${dashboard.id}-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/dashboards">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{dashboard.name}</h1>
              {dashboard.isPublic && (
                <Badge variant="secondary">Public</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{dashboard.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Chart
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Button size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Add to Report</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Modified {dashboard.lastModified}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{dashboard.views} views</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>Created by {dashboard.createdBy}</span>
        </div>
        <div className="flex items-center gap-1">
          <BarChart3 className="h-4 w-4" />
          <span>{dashboard.charts.length} charts</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dashboard.charts.map((chart) => (
          <Card key={chart.id} className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
              <ChartIcon type={chart.type} />
            </div>
            <h3 className="font-medium text-sm">{chart.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">{chart.type} chart</p>
          </Card>
        ))}

        {/* Add Chart Card */}
        <Card className="p-4 border-dashed hover:bg-accent/50 transition-colors cursor-pointer">
          <div className="aspect-video rounded-lg mb-3 flex items-center justify-center">
            <div className="text-center">
              <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Add Chart</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
