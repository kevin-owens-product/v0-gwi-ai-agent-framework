"use client"

import { useState, useEffect, useMemo, use, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
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
  Plus,
  Loader2,
  Copy,
  Check,
  Trash2,
  Filter,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Grid3X3,
  Rows3,
  LayoutGrid,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Target,
  PieChart,
  LineChart,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChartRenderer, generateSampleData } from "@/components/charts"
import type { ChartType } from "@/components/charts"

// Mock dashboard data - 10 advanced examples
const dashboardData: Record<string, {
  id: string
  name: string
  description: string
  charts: { id: string; name: string; type: ChartType; category?: string; dataSource?: string }[]
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
      { id: "c1", name: "Multi-Channel Engagement Rates", type: "BAR", category: "Engagement", dataSource: "GWI Core" },
      { id: "c2", name: "Full-Funnel Conversion Analysis", type: "FUNNEL", category: "Conversion", dataSource: "GWI Core" },
      { id: "c3", name: "Weekly Performance Trajectory", type: "LINE", category: "Performance", dataSource: "Internal" },
      { id: "c4", name: "Audience Reach by Demographic", type: "PIE", category: "Audience", dataSource: "GWI Core" },
      { id: "c5", name: "ROI by Campaign & Creative", type: "BAR", category: "ROI", dataSource: "Internal" },
      { id: "c6", name: "CTR Trend with Benchmarks", type: "AREA", category: "Performance", dataSource: "GWI Core" },
      { id: "c7", name: "Brand Lift by Exposure Level", type: "RADAR", category: "Brand", dataSource: "GWI Core" },
      { id: "c8", name: "CPA Optimization Tracker", type: "LINE", category: "Cost", dataSource: "Internal" },
      { id: "c9", name: "Attribution Model Comparison", type: "BAR", category: "Attribution", dataSource: "Internal" },
      { id: "c10", name: "Budget Allocation Efficiency", type: "DONUT", category: "Budget", dataSource: "Internal" },
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
      { id: "c1", name: "Social Platform Penetration by Gen", type: "BAR", category: "Social", dataSource: "GWI Core" },
      { id: "c2", name: "Omnichannel Shopping Mix", type: "PIE", category: "Commerce", dataSource: "GWI Core" },
      { id: "c3", name: "Brand Loyalty Evolution (3Y)", type: "LINE", category: "Brand", dataSource: "GWI Core" },
      { id: "c4", name: "Sustainability Attitude Segments", type: "TREEMAP", category: "Sustainability", dataSource: "GWI Zeitgeist" },
      { id: "c5", name: "Device Ecosystem Usage", type: "DONUT", category: "Technology", dataSource: "GWI Core" },
      { id: "c6", name: "Content Format Preferences", type: "BAR", category: "Media", dataSource: "GWI Core" },
      { id: "c7", name: "Purchase Decision Drivers", type: "RADAR", category: "Commerce", dataSource: "GWI Core" },
      { id: "c8", name: "Generational Breakdown", type: "PIE", category: "Demographics", dataSource: "GWI Core" },
      { id: "c9", name: "Regional Behavior Variations", type: "BAR", category: "Regional", dataSource: "GWI Core" },
      { id: "c10", name: "YoY Trend Comparison", type: "AREA", category: "Trends", dataSource: "GWI Core" },
      { id: "c11", name: "Emerging Behavior Indicators", type: "BAR", category: "Trends", dataSource: "GWI Zeitgeist" },
      { id: "c12", name: "Category Market Share", type: "DONUT", category: "Market Share", dataSource: "GWI Core" },
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
      { id: "c1", name: "Unaided vs Aided Awareness", type: "BAR", category: "Awareness", dataSource: "GWI Brand Tracker" },
      { id: "c2", name: "NPS Trend Analysis", type: "LINE", category: "NPS", dataSource: "Internal" },
      { id: "c3", name: "Share of Voice Distribution", type: "PIE", category: "SOV", dataSource: "Social Listening" },
      { id: "c4", name: "Sentiment Score by Channel", type: "RADAR", category: "Sentiment", dataSource: "Social Listening" },
      { id: "c5", name: "Purchase Consideration Funnel", type: "FUNNEL", category: "Funnel", dataSource: "GWI Brand Tracker" },
      { id: "c6", name: "Brand Attribute Mapping", type: "BAR", category: "Attributes", dataSource: "GWI Brand Tracker" },
      { id: "c7", name: "Competitive Positioning Matrix", type: "SCATTER", category: "Positioning", dataSource: "GWI Brand Tracker" },
      { id: "c8", name: "Brand Advocacy Index", type: "AREA", category: "Advocacy", dataSource: "GWI Core" },
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
      { id: "c1", name: "Platform Time Allocation", type: "DONUT", category: "Platforms", dataSource: "GWI Core" },
      { id: "c2", name: "Content Consumption by Format", type: "BAR", category: "Content", dataSource: "GWI Core" },
      { id: "c3", name: "Shopping Journey Mapping", type: "FUNNEL", category: "Commerce", dataSource: "GWI Core" },
      { id: "c4", name: "Influencer Trust Levels", type: "BAR", category: "Influencers", dataSource: "GWI Zeitgeist" },
      { id: "c5", name: "Values & Causes Alignment", type: "RADAR", category: "Values", dataSource: "GWI Core" },
      { id: "c6", name: "Brand Discovery Channels", type: "PIE", category: "Discovery", dataSource: "GWI Core" },
      { id: "c7", name: "Purchase Influence Factors", type: "BAR", category: "Influence", dataSource: "GWI Core" },
      { id: "c8", name: "Cross-Market Comparison", type: "BAR", category: "Regional", dataSource: "GWI Core" },
      { id: "c9", name: "Emerging Trend Radar", type: "RADAR", category: "Trends", dataSource: "GWI Zeitgeist" },
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
      { id: "c1", name: "Funnel Drop-off Analysis", type: "FUNNEL", category: "Funnel", dataSource: "Internal" },
      { id: "c2", name: "Cart Abandonment Reasons", type: "PIE", category: "Cart", dataSource: "Internal" },
      { id: "c3", name: "Revenue by Channel", type: "BAR", category: "Revenue", dataSource: "Internal" },
      { id: "c4", name: "Payment Method Preferences", type: "DONUT", category: "Payments", dataSource: "GWI Core" },
      { id: "c5", name: "AOV Trend by Segment", type: "LINE", category: "AOV", dataSource: "Internal" },
      { id: "c6", name: "Repeat Purchase Patterns", type: "AREA", category: "Retention", dataSource: "Internal" },
      { id: "c7", name: "Cross-sell/Upsell Success", type: "BAR", category: "Cross-sell", dataSource: "Internal" },
      { id: "c8", name: "Mobile vs Desktop Split", type: "PIE", category: "Device", dataSource: "Internal" },
      { id: "c9", name: "Seasonal Performance", type: "LINE", category: "Seasonality", dataSource: "Internal" },
      { id: "c10", name: "Customer Lifetime Value", type: "TREEMAP", category: "CLV", dataSource: "Internal" },
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
      { id: "c1", name: "Channel Efficiency Matrix", type: "BAR", category: "Efficiency", dataSource: "Internal" },
      { id: "c2", name: "Budget Allocation Current", type: "DONUT", category: "Budget", dataSource: "Internal" },
      { id: "c3", name: "Reach Curve Analysis", type: "AREA", category: "Reach", dataSource: "GWI Core" },
      { id: "c4", name: "Frequency Distribution", type: "BAR", category: "Frequency", dataSource: "Internal" },
      { id: "c5", name: "Cross-Channel Synergy", type: "RADAR", category: "Synergy", dataSource: "Internal" },
      { id: "c6", name: "Daypart Performance", type: "BAR", category: "Daypart", dataSource: "GWI Media" },
      { id: "c7", name: "Creative Fatigue Tracker", type: "LINE", category: "Creative", dataSource: "Internal" },
      { id: "c8", name: "Incremental Reach by Medium", type: "BAR", category: "Reach", dataSource: "GWI Core" },
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
      { id: "c1", name: "Sustainability Segment Sizes", type: "PIE", category: "Segments", dataSource: "GWI Core" },
      { id: "c2", name: "Willingness to Pay Premium", type: "BAR", category: "Pricing", dataSource: "GWI Core" },
      { id: "c3", name: "ESG Awareness Trend", type: "AREA", category: "Awareness", dataSource: "GWI Zeitgeist" },
      { id: "c4", name: "Green Product Adoption", type: "FUNNEL", category: "Adoption", dataSource: "GWI Core" },
      { id: "c5", name: "Brand ESG Perception", type: "RADAR", category: "Perception", dataSource: "GWI Brand Tracker" },
      { id: "c6", name: "Greenwashing Skepticism", type: "BAR", category: "Skepticism", dataSource: "GWI Zeitgeist" },
      { id: "c7", name: "Sustainable Behavior Index", type: "LINE", category: "Behavior", dataSource: "GWI Core" },
      { id: "c8", name: "Category Sustainability Importance", type: "BAR", category: "Category", dataSource: "GWI Core" },
      { id: "c9", name: "Gen Comparison on ESG", type: "BAR", category: "Generational", dataSource: "GWI Core" },
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
      { id: "c1", name: "Platform Subscriber Share", type: "DONUT", category: "Market Share", dataSource: "GWI Core" },
      { id: "c2", name: "Multi-Subscription Patterns", type: "BAR", category: "Subscriptions", dataSource: "GWI Core" },
      { id: "c3", name: "Churn Risk Indicators", type: "FUNNEL", category: "Churn", dataSource: "Internal" },
      { id: "c4", name: "Content Genre Preferences", type: "TREEMAP", category: "Content", dataSource: "GWI Core" },
      { id: "c5", name: "Viewing Time by Daypart", type: "AREA", category: "Viewing", dataSource: "GWI Core" },
      { id: "c6", name: "Ad-Tier Adoption Rate", type: "LINE", category: "Ad-tier", dataSource: "GWI Zeitgeist" },
      { id: "c7", name: "Device Preference Split", type: "PIE", category: "Device", dataSource: "GWI Core" },
      { id: "c8", name: "Binge vs Linear Viewing", type: "BAR", category: "Viewing", dataSource: "GWI Core" },
      { id: "c9", name: "Password Sharing Behavior", type: "BAR", category: "Behavior", dataSource: "GWI Zeitgeist" },
      { id: "c10", name: "Content Discovery Methods", type: "RADAR", category: "Discovery", dataSource: "GWI Core" },
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
      { id: "c1", name: "Digital Banking Adoption", type: "AREA", category: "Banking", dataSource: "GWI Core" },
      { id: "c2", name: "Fintech Product Usage", type: "BAR", category: "Fintech", dataSource: "GWI Core" },
      { id: "c3", name: "Investment App Penetration", type: "BAR", category: "Investing", dataSource: "GWI Core" },
      { id: "c4", name: "BNPL Usage by Demo", type: "BAR", category: "BNPL", dataSource: "GWI Zeitgeist" },
      { id: "c5", name: "Trust in Financial Institutions", type: "RADAR", category: "Trust", dataSource: "GWI Core" },
      { id: "c6", name: "Crypto Ownership Trends", type: "LINE", category: "Crypto", dataSource: "GWI Zeitgeist" },
      { id: "c7", name: "Insurance Product Gaps", type: "FUNNEL", category: "Insurance", dataSource: "GWI Core" },
      { id: "c8", name: "Financial Wellness Score", type: "DONUT", category: "Wellness", dataSource: "GWI Core" },
      { id: "c9", name: "Advisory Preference", type: "PIE", category: "Advisory", dataSource: "GWI Core" },
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
      { id: "c1", name: "Wellness Priority Rankings", type: "BAR", category: "Priorities", dataSource: "GWI Core" },
      { id: "c2", name: "Fitness App Market Share", type: "DONUT", category: "Fitness", dataSource: "GWI Core" },
      { id: "c3", name: "Supplement Category Growth", type: "AREA", category: "Supplements", dataSource: "GWI Core" },
      { id: "c4", name: "Mental Health Awareness", type: "LINE", category: "Mental Health", dataSource: "GWI Zeitgeist" },
      { id: "c5", name: "Wearable Adoption Rates", type: "BAR", category: "Wearables", dataSource: "GWI Core" },
      { id: "c6", name: "Telehealth Usage Patterns", type: "FUNNEL", category: "Telehealth", dataSource: "GWI Core" },
      { id: "c7", name: "Diet & Nutrition Trends", type: "TREEMAP", category: "Nutrition", dataSource: "GWI Core" },
      { id: "c8", name: "Sleep Optimization Behaviors", type: "RADAR", category: "Sleep", dataSource: "GWI Core" },
      { id: "c9", name: "Preventive Care Spending", type: "LINE", category: "Spending", dataSource: "Internal" },
      { id: "c10", name: "Wellness Spend by Segment", type: "PIE", category: "Spending", dataSource: "GWI Core" },
    ],
    lastModified: "2 hours ago",
    views: 1923,
    createdBy: "Noah Williams",
    isPublic: true,
    category: "Health & Wellness",
  },
}

const CHART_TYPE_ICONS: Record<string, React.ReactNode> = {
  BAR: <BarChart3 className="h-4 w-4" />,
  LINE: <LineChart className="h-4 w-4" />,
  PIE: <PieChart className="h-4 w-4" />,
  DONUT: <PieChart className="h-4 w-4" />,
  AREA: <TrendingUp className="h-4 w-4" />,
  SCATTER: <Target className="h-4 w-4" />,
  RADAR: <Target className="h-4 w-4" />,
  FUNNEL: <Filter className="h-4 w-4" />,
  HEATMAP: <Grid3X3 className="h-4 w-4" />,
  TREEMAP: <LayoutGrid className="h-4 w-4" />,
}

function formatChartTypeName(type: ChartType): string {
  const typeMap: Record<ChartType, string> = {
    BAR: "Bar",
    LINE: "Line",
    PIE: "Pie",
    DONUT: "Donut",
    AREA: "Area",
    SCATTER: "Scatter",
    HEATMAP: "Heatmap",
    TREEMAP: "Treemap",
    FUNNEL: "Funnel",
    RADAR: "Radar",
  }
  return typeMap[type] || type
}

interface DashboardType {
  id: string
  name: string
  description: string
  charts: { id: string; name: string; type: ChartType; category?: string; dataSource?: string }[]
  lastModified: string
  views: number
  createdBy: string
  isPublic: boolean
  category: string
}

type LayoutView = "grid" | "list" | "compact"

export default function DashboardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dashboard, setDashboard] = useState<DashboardType | null>(null)

  // Filter state
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChartTypes, setSelectedChartTypes] = useState<Set<ChartType>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedDataSources, setSelectedDataSources] = useState<Set<string>>(new Set())
  const [layoutView, setLayoutView] = useState<LayoutView>("grid")

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
                type: w.type || "BAR",
                category: w.category || "General",
                dataSource: w.dataSource || "Unknown",
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

  // Get unique categories and data sources
  const { categories, dataSources, chartTypes } = useMemo(() => {
    if (!dashboard) return { categories: [], dataSources: [], chartTypes: [] }

    const cats = new Set(dashboard.charts.map(c => c.category).filter(Boolean))
    const sources = new Set(dashboard.charts.map(c => c.dataSource).filter(Boolean))
    const types = new Set(dashboard.charts.map(c => c.type))

    return {
      categories: Array.from(cats) as string[],
      dataSources: Array.from(sources) as string[],
      chartTypes: Array.from(types) as ChartType[],
    }
  }, [dashboard])

  // Filtered charts
  const filteredCharts = useMemo(() => {
    if (!dashboard) return []

    return dashboard.charts.filter(chart => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!chart.name.toLowerCase().includes(query) &&
            !chart.category?.toLowerCase().includes(query)) {
          return false
        }
      }

      // Chart type filter
      if (selectedChartTypes.size > 0 && !selectedChartTypes.has(chart.type)) {
        return false
      }

      // Category filter
      if (selectedCategories.size > 0 && chart.category && !selectedCategories.has(chart.category)) {
        return false
      }

      // Data source filter
      if (selectedDataSources.size > 0 && chart.dataSource && !selectedDataSources.has(chart.dataSource)) {
        return false
      }

      return true
    })
  }, [dashboard, searchQuery, selectedChartTypes, selectedCategories, selectedDataSources])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchQuery) count++
    if (selectedChartTypes.size > 0) count++
    if (selectedCategories.size > 0) count++
    if (selectedDataSources.size > 0) count++
    return count
  }, [searchQuery, selectedChartTypes, selectedCategories, selectedDataSources])

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedChartTypes(new Set())
    setSelectedCategories(new Set())
    setSelectedDataSources(new Set())
  }, [])

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
        charts: filteredCharts.map(chart => ({
          id: chart.id,
          name: chart.name,
          type: chart.type,
          category: chart.category,
          dataSource: chart.dataSource,
        })),
        filters: {
          searchQuery,
          selectedChartTypes: Array.from(selectedChartTypes),
          selectedCategories: Array.from(selectedCategories),
          selectedDataSources: Array.from(selectedDataSources),
        },
        metadata: {
          views: dashboard.views,
          lastModified: dashboard.lastModified,
          totalCharts: dashboard.charts.length,
          filteredCharts: filteredCharts.length,
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

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/v1/dashboards/${id}`, { method: "DELETE" })
      if (response.ok) {
        router.push("/dashboard/dashboards")
      }
    } catch (error) {
      console.error("Delete failed:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDuplicate = async () => {
    try {
      const response = await fetch("/api/v1/dashboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${dashboard.name} (Copy)`,
          description: dashboard.description,
          charts: dashboard.charts.map((c) => c.id),
          isPublic: dashboard.isPublic,
        }),
      })
      if (response.ok) {
        router.push("/dashboard/dashboards")
      }
    } catch (error) {
      console.error("Duplicate failed:", error)
    }
  }

  const getLayoutGridClass = () => {
    switch (layoutView) {
      case "list":
        return "grid gap-4 grid-cols-1"
      case "compact":
        return "grid gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      default:
        return "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
          {/* Filter Button */}
          <Sheet open={showFilterPanel} onOpenChange={setShowFilterPanel}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="bg-transparent relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[450px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>Filter Charts</span>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </SheetTitle>
                <SheetDescription>
                  Filter and search through dashboard charts
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Search Charts</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Chart Types */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Chart Types</Label>
                    {selectedChartTypes.size > 0 && (
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedChartTypes(new Set())}>
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {chartTypes.map(type => (
                      <Button
                        key={type}
                        variant={selectedChartTypes.has(type) ? "secondary" : "outline"}
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          const newSet = new Set(selectedChartTypes)
                          if (newSet.has(type)) {
                            newSet.delete(type)
                          } else {
                            newSet.add(type)
                          }
                          setSelectedChartTypes(newSet)
                        }}
                      >
                        {CHART_TYPE_ICONS[type]}
                        <span className="ml-1">{formatChartTypeName(type)}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Categories</Label>
                      {selectedCategories.size > 0 && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedCategories(new Set())}>
                          Clear
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {categories.map(category => (
                          <label
                            key={category}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedCategories.has(category)}
                              onCheckedChange={(checked) => {
                                const newSet = new Set(selectedCategories)
                                if (checked) {
                                  newSet.add(category)
                                } else {
                                  newSet.delete(category)
                                }
                                setSelectedCategories(newSet)
                              }}
                            />
                            <span>{category}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {dashboard.charts.filter(c => c.category === category).length}
                            </Badge>
                          </label>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Data Sources */}
                {dataSources.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Data Sources</Label>
                      {selectedDataSources.size > 0 && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedDataSources(new Set())}>
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {dataSources.map(source => (
                        <label
                          key={source}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedDataSources.has(source)}
                            onCheckedChange={(checked) => {
                              const newSet = new Set(selectedDataSources)
                              if (checked) {
                                newSet.add(source)
                              } else {
                                newSet.delete(source)
                              }
                              setSelectedDataSources(newSet)
                            }}
                          />
                          <span>{source}</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {dashboard.charts.filter(c => c.dataSource === source).length}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results summary */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredCharts.length} of {dashboard.charts.length} charts
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>

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
          <Link href={`/dashboard/dashboards/builder?id=${dashboard.id}`}>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate}>Duplicate</DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied!" : "Copy Link"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Dashboard</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{dashboard.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Meta info and toolbar */}
      <div className="flex items-center justify-between">
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
            <span>{filteredCharts.length} of {dashboard.charts.length} charts</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search charts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-48"
            />
          </div>

          {/* Layout toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={layoutView === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2 rounded-r-none"
              onClick={() => setLayoutView("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={layoutView === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2 rounded-none border-x"
              onClick={() => setLayoutView("list")}
            >
              <Rows3 className="h-4 w-4" />
            </Button>
            <Button
              variant={layoutView === "compact" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2 rounded-l-none"
              onClick={() => setLayoutView("compact")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active filters badges */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchQuery}"
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
            </Badge>
          )}
          {selectedChartTypes.size > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedChartTypes.size} chart type{selectedChartTypes.size > 1 ? 's' : ''}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedChartTypes(new Set())} />
            </Badge>
          )}
          {selectedCategories.size > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedCategories.size} categor{selectedCategories.size > 1 ? 'ies' : 'y'}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategories(new Set())} />
            </Badge>
          )}
          {selectedDataSources.size > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedDataSources.size} data source{selectedDataSources.size > 1 ? 's' : ''}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDataSources(new Set())} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleClearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Charts Grid */}
      {filteredCharts.length > 0 ? (
        <div className={getLayoutGridClass()}>
          {filteredCharts.map((chart) => (
            <Card
              key={chart.id}
              className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
                layoutView === "list" ? "flex items-center gap-4" : ""
              }`}
            >
              <div className={`bg-muted rounded-lg overflow-hidden ${
                layoutView === "list" ? "w-48 h-24" :
                layoutView === "compact" ? "aspect-square" : "aspect-video mb-3"
              }`}>
                <ChartRenderer
                  type={chart.type}
                  data={generateSampleData(chart.type, 6)}
                  config={{
                    showLegend: false,
                    showGrid: false,
                    showTooltip: true,
                    height: layoutView === "list" ? 96 : layoutView === "compact" ? 100 : 120,
                  }}
                />
              </div>
              <div className={layoutView === "list" ? "flex-1" : ""}>
                <h3 className={`font-medium ${layoutView === "compact" ? "text-xs truncate" : "text-sm"}`}>
                  {chart.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {CHART_TYPE_ICONS[chart.type]}
                    <span className="ml-1">{formatChartTypeName(chart.type)}</span>
                  </Badge>
                  {chart.category && layoutView !== "compact" && (
                    <Badge variant="secondary" className="text-xs">
                      {chart.category}
                    </Badge>
                  )}
                </div>
                {chart.dataSource && layoutView === "list" && (
                  <p className="text-xs text-muted-foreground mt-1">Source: {chart.dataSource}</p>
                )}
              </div>
            </Card>
          ))}

          {/* Add Chart Card */}
          <Link href="/dashboard/charts/new">
            <Card className={`p-4 border-dashed hover:bg-accent/50 transition-colors cursor-pointer h-full ${
              layoutView === "list" ? "flex items-center justify-center" : ""
            }`}>
              <div className={`flex items-center justify-center ${
                layoutView === "list" ? "" :
                layoutView === "compact" ? "aspect-square" : "aspect-video rounded-lg mb-3"
              }`}>
                <div className="text-center">
                  <Plus className={`text-muted-foreground mx-auto mb-2 ${
                    layoutView === "compact" ? "h-6 w-6" : "h-8 w-8"
                  }`} />
                  <p className={`text-muted-foreground ${layoutView === "compact" ? "text-xs" : "text-sm"}`}>
                    Add Chart
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No charts match your filters</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search query to see more charts.
          </p>
          <Button onClick={handleClearFilters}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </Card>
      )}

      {/* AI Insights Panel */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Dashboard Insights</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium text-sm mb-2">Chart Distribution</h4>
            <p className="text-sm text-muted-foreground">
              {chartTypes.length} chart types used across {categories.length} categories.
              Most common: {chartTypes.length > 0 ? formatChartTypeName(chartTypes[0]) : 'N/A'} charts.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium text-sm mb-2">Data Sources</h4>
            <p className="text-sm text-muted-foreground">
              {dataSources.length} data source{dataSources.length !== 1 ? 's' : ''} powering this dashboard.
              {dataSources.length > 0 && ` Primary: ${dataSources[0]}.`}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium text-sm mb-2">Current View</h4>
            <p className="text-sm text-muted-foreground">
              {filteredCharts.length} of {dashboard.charts.length} charts displayed
              {activeFilterCount > 0 ? ` with ${activeFilterCount} active filter${activeFilterCount !== 1 ? 's' : ''}.` : '.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
