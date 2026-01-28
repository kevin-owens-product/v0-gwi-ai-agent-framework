"use client"

import { useState, useEffect, use, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  BarChart3,
  Download,
  Share2,
  Edit,
  MoreHorizontal,
  Eye,
  Calendar,
  Users,
  Loader2,
  Copy,
  Check,
  Trash2,
  Activity,
  Sparkles,
  Maximize2,
  Table,
  Filter,
  MessageSquare,
  History,
  Code,
  Mail,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  Layers,
  Clock,
  Star,
  StarOff,
  Bookmark,
  Info,
  Play,
  Pause,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AdvancedChartRenderer,
  generateAdvancedSampleData,
  type AdvancedChartType,
  type GWIChartTemplate,
} from "@/components/charts"
import { cn } from "@/lib/utils"
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
  audience?: string
  metric?: string
  views?: number
  createdBy?: string
  dataSource?: string
  timePeriod?: string
  updatedAt?: string
  createdAt?: string
  data?: ChartDataPoint[]
  config?: Record<string, string | number | boolean | string[] | undefined>
  template?: GWIChartTemplate
  category?: string
  insights?: ChartInsight[]
  sampleSize?: number
  confidenceLevel?: number
  methodology?: string
}

interface ChartInsight {
  type: "increase" | "decrease" | "neutral" | "highlight"
  title: string
  description: string
  value?: string
}

interface Annotation {
  id: string
  dataPointIndex: number
  text: string
  author: string
  createdAt: string
  type: "note" | "highlight" | "question"
}

interface ActivityItem {
  id: string
  action: string
  user: string
  timestamp: string
  details?: string
}

// Demo data
const demoCharts: Record<string, Chart> = {
  "1": {
    id: "1",
    name: "Social Media Platform Penetration by Generation",
    type: "GROUPED_BAR",
    audience: "All Adults 18-65",
    metric: "Platform Usage (%)",
    updatedAt: "2 hours ago",
    createdAt: "2024-10-15",
    views: 1247,
    createdBy: "Sarah Chen",
    description: "Comparative analysis of social media platform adoption rates across Gen Z, Millennials, Gen X, and Boomers with statistical significance indicators",
    dataSource: "GWI Core Q4 2024",
    timePeriod: "Oct-Dec 2024",
    template: "social-platform-reach",
    category: "Social Media",
    sampleSize: 12500,
    confidenceLevel: 95,
    methodology: "Online panel survey with quota sampling across demographics",
    insights: [
      { type: "increase", title: "TikTok Growth", description: "TikTok usage up 24% among Millennials", value: "+24%" },
      { type: "decrease", title: "Facebook Decline", description: "Facebook usage down 9% among Gen Z", value: "-9%" },
      { type: "highlight", title: "Top Platform", description: "YouTube remains #1 across all generations", value: "89%" },
    ],
  },
  "2": {
    id: "2",
    name: "E-commerce Purchase Intent Trajectory",
    type: "AREA",
    audience: "Online Shoppers",
    metric: "Purchase Intent Index",
    updatedAt: "4 hours ago",
    createdAt: "2024-09-20",
    views: 892,
    createdBy: "Marcus Johnson",
    description: "24-month trend analysis of purchase intent across major retail categories with seasonal adjustment and YoY comparison",
    dataSource: "GWI Commerce",
    timePeriod: "Jan 2023 - Dec 2024",
    template: "media-consumption-trend",
    category: "E-commerce",
    sampleSize: 8400,
    confidenceLevel: 95,
    methodology: "Continuous tracking study with monthly data collection",
    insights: [
      { type: "increase", title: "Holiday Surge", description: "Peak intent in December up 18% vs. last year", value: "+18%" },
      { type: "neutral", title: "Steady Growth", description: "Average monthly growth of 2.3%", value: "2.3%" },
    ],
  },
  "3": {
    id: "3",
    name: "Brand Health Dashboard",
    type: "BULLET",
    audience: "Category Buyers",
    metric: "Brand Health Score",
    updatedAt: "1 day ago",
    createdAt: "2024-11-01",
    views: 2341,
    createdBy: "Emily Thompson",
    description: "Multi-dimensional brand health comparison featuring awareness, consideration, preference, and advocacy metrics across top 8 competitors",
    dataSource: "GWI Brand Tracker",
    timePeriod: "Q4 2024",
    template: "brand-health-tracker",
    category: "Brand",
    sampleSize: 5200,
    confidenceLevel: 95,
    methodology: "Brand tracking study with aided and unaided recall measures",
    insights: [
      { type: "increase", title: "Above Benchmark", description: "4 of 5 metrics exceed industry benchmark", value: "80%" },
      { type: "highlight", title: "Top Metric", description: "Brand awareness leads at 72%", value: "72%" },
    ],
  },
}

// Fill remaining demo charts
for (let i = 4; i <= 12; i++) {
  demoCharts[String(i)] = {
    id: String(i),
    name: `Demo Chart ${i}`,
    type: "BAR",
    audience: "All Adults",
    metric: "Percentage",
    updatedAt: "Recently",
    views: Math.floor(Math.random() * 2000),
    createdBy: "Research Team",
    description: "Demo chart for testing",
    dataSource: "GWI Core",
    timePeriod: "Q4 2024",
    category: "General",
    sampleSize: 10000,
    confidenceLevel: 95,
    insights: [],
  }
}

const demoAnnotations: Annotation[] = [
  { id: "1", dataPointIndex: 2, text: "Investigate the spike in TikTok usage - may be related to viral campaign", author: "Sarah Chen", createdAt: "2 hours ago", type: "note" },
  { id: "2", dataPointIndex: 0, text: "Instagram data aligns with our internal tracking", author: "Marcus Johnson", createdAt: "1 day ago", type: "highlight" },
  { id: "3", dataPointIndex: 3, text: "Why is Facebook declining faster in this segment?", author: "Emily Thompson", createdAt: "3 days ago", type: "question" },
]

const demoActivity: ActivityItem[] = [
  { id: "1", action: "viewed", user: "John Smith", timestamp: "10 minutes ago" },
  { id: "2", action: "exported", user: "Sarah Chen", timestamp: "2 hours ago", details: "PNG format" },
  { id: "3", action: "commented", user: "Marcus Johnson", timestamp: "1 day ago", details: "Added annotation" },
  { id: "4", action: "shared", user: "Emily Thompson", timestamp: "2 days ago", details: "Via email to marketing team" },
  { id: "5", action: "edited", user: "Sarah Chen", timestamp: "3 days ago", details: "Updated title and description" },
  { id: "6", action: "created", user: "Sarah Chen", timestamp: "1 week ago" },
]

const relatedCharts = [
  { id: "r1", name: "Instagram Engagement by Age Group", type: "BAR", views: 892 },
  { id: "r2", name: "TikTok vs YouTube: Gen Z Deep Dive", type: "GROUPED_BAR", views: 1456 },
  { id: "r3", name: "Social Commerce Conversion Rates", type: "FUNNEL", views: 723 },
]

const timePeriodOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
  { value: "custom", label: "Custom range" },
]

const segmentOptions = [
  { value: "all", label: "All Segments" },
  { value: "genZ", label: "Gen Z (18-24)" },
  { value: "millennials", label: "Millennials (25-34)" },
  { value: "genX", label: "Gen X (35-44)" },
  { value: "boomers", label: "Boomers (45-54)" },
]

interface TreemapNode {
  name: string
  value?: number
  children?: TreemapNode[]
}

// Helper function to flatten treemap data structure
function flattenTreemapData(children: TreemapNode[]): ChartDataPoint[] {
  const result: ChartDataPoint[] = []
  for (const child of children) {
    if (child.children && Array.isArray(child.children)) {
      // Parent node - recursively flatten children
      result.push(...flattenTreemapData(child.children))
    } else {
      // Leaf node
      result.push({ name: child.name, value: child.value })
    }
  }
  return result
}

function formatChartType(type: AdvancedChartType): string {
  const typeMap: Record<string, string> = {
    BAR: "Bar Chart", HORIZONTAL_BAR: "Horizontal Bar", GROUPED_BAR: "Grouped Bar",
    STACKED_BAR: "Stacked Bar", LINE: "Line Chart", MULTI_LINE: "Multi-Line",
    AREA: "Area Chart", STACKED_AREA: "Stacked Area", PIE: "Pie Chart",
    DONUT: "Donut Chart", RADAR: "Radar Chart", SCATTER: "Scatter Plot",
    BUBBLE: "Bubble Chart", FUNNEL: "Funnel Chart", TREEMAP: "Treemap",
    HEATMAP: "Heatmap", COMBO: "Combo Chart", WATERFALL: "Waterfall",
    BULLET: "Bullet Chart", METRIC: "Metric", SPARKLINE: "Sparkline",
    COMPARISON_BAR: "Comparison",
  }
  return typeMap[type] || type
}

export default function ChartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const t = useTranslations("dashboard.charts.detail")

  // Core state
  const [chart, setChart] = useState<Chart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEmbedDialog, setShowEmbedDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Filter state
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("90d")
  const [selectedSegment, setSelectedSegment] = useState("all")
  const [showBenchmark, setShowBenchmark] = useState(true)
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(false)

  // Comparison state
  const [comparisonMode, setComparisonMode] = useState(false)

  // Data view state
  const [dataViewMode, setDataViewMode] = useState<"chart" | "table">("chart")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Annotations state
  const [annotations, setAnnotations] = useState<Annotation[]>(demoAnnotations)
  const [newAnnotation, setNewAnnotation] = useState("")
  const [showAnnotations, setShowAnnotations] = useState(true)


  // Get chart data
  const chartData = useMemo(() => {
    if (!chart) return []
    return chart.data || generateAdvancedSampleData(chart.type, chart.template)
  }, [chart])

  // Sorted data for table view
  const sortedData = useMemo(() => {
    if (!sortColumn) return chartData
    return [...chartData].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal
      }
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
  }, [chartData, sortColumn, sortDirection])

  // Fetch chart data
  useEffect(() => {
    async function fetchChart() {
      try {
        const response = await fetch(`/api/v1/charts/${id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (response.ok) {
          const data = await response.json()
          const apiChart = data.data || data
          if (apiChart && apiChart.id) {
            const config = apiChart.config || {}

            // Transform chart data - seed data has nested structure with labels/datasets
            let chartDataArray = apiChart.data
            let extractedDataKeys: string[] = []
            let extractedColors: string[] = []

            interface DatasetItem {
              label?: string
              color?: string
              data?: number[] | number
            }

            interface SeedDataShape {
              labels?: string[]
              datasets?: DatasetItem[]
              values?: number[]
              children?: TreemapNode[]
            }

            if (apiChart.data && !Array.isArray(apiChart.data)) {
              // Convert nested seed data structure to array format for chart rendering
              const seedData = apiChart.data as SeedDataShape

              if (seedData.labels && seedData.datasets) {
                // For line/bar charts with labels and datasets
                // Extract data keys from dataset labels (sanitized for use as object keys)
                extractedDataKeys = seedData.datasets.map((ds: DatasetItem) => {
                  const label = ds.label || 'value'
                  // Create a safe key name from the label
                  return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '')
                })
                extractedColors = seedData.datasets.map((ds: DatasetItem) => ds.color).filter((c): c is string => Boolean(c))

                chartDataArray = seedData.labels.map((label: string, idx: number) => {
                  const row: ChartDataPoint = { name: label }
                  seedData.datasets?.forEach((ds: DatasetItem, dsIdx: number) => {
                    const key = extractedDataKeys[dsIdx] || 'value'
                    row[key] = Array.isArray(ds.data) ? ds.data[idx] : ds.data
                  })
                  // Also add a 'value' key for simple chart types that expect it
                  if (seedData.datasets?.length === 1 && extractedDataKeys[0] !== 'value') {
                    row.value = Array.isArray(seedData.datasets[0].data) ? seedData.datasets[0].data[idx] : seedData.datasets[0].data
                  }
                  return row
                })
              } else if (seedData.values) {
                // For funnel charts with values array
                const stages = config.stages || []
                chartDataArray = seedData.values.map((value: number, idx: number) => ({
                  name: stages[idx] || `Stage ${idx + 1}`,
                  value,
                }))
              } else if (seedData.children) {
                // For treemap charts with children structure
                chartDataArray = flattenTreemapData(seedData.children)
              }
            }

            // Store extracted keys for chart config
            const chartConfig = {
              ...config,
              extractedDataKeys,
              extractedColors: extractedColors.length > 0 ? extractedColors : undefined,
            }

            // Generate insights from config if not present
            const insights = Array.isArray(apiChart.insights) ? apiChart.insights : []
            if (insights.length === 0 && config.series) {
              // Generate basic insights for charts with series
              insights.push({
                type: "highlight" as const,
                title: "Key Metrics",
                description: `Tracking ${config.series.length} series across ${apiChart.data?.labels?.length || 0} data points`,
              })
            }

            setChart({
              ...apiChart,
              data: Array.isArray(chartDataArray) ? chartDataArray : undefined,
              config: chartConfig, // Use enhanced config with extracted dataKeys
              insights,
              // Extract metadata from config or provide defaults
              audience: config.audience || apiChart.audience,
              metric: config.metric || config.yAxis?.label || apiChart.metric,
              dataSource: apiChart.dataSource || config.dataSource || "GWI Core",
              views: apiChart.views || 0,
              sampleSize: config.sampleSize || apiChart.sampleSize,
              confidenceLevel: config.confidenceLevel || apiChart.confidenceLevel || 95,
              methodology: config.methodology || apiChart.methodology,
              category: apiChart.category || getCategoryFromType(apiChart.type),
            })
          } else {
            setChart(demoCharts[id] || null)
          }
        } else {
          setChart(demoCharts[id] || null)
        }
      } catch {
        setChart(demoCharts[id] || null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchChart()
  }, [id])

  // Helper to determine category from chart type
  function getCategoryFromType(type: string): string {
    const categoryMap: Record<string, string> = {
      LINE: "Trends",
      BAR: "Comparisons",
      PIE: "Distribution",
      FUNNEL: "Conversion",
      RADAR: "Analysis",
      SCATTER: "Correlation",
      HEATMAP: "Patterns",
      SANKEY: "Flow",
      TREEMAP: "Hierarchy",
      GAUGE: "KPI",
    }
    return categoryMap[type] || "General"
  }

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      // Simulate data refresh
      console.warn("Auto-refreshing chart data...")
    }, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  // Handlers
  const handleExport = async (format: "json" | "csv" | "png" | "pdf" | "pptx" = "json") => {
    if (!chart) return
    setIsExporting(true)
    try {
      const exportData = {
        chart: { id: chart.id, name: chart.name, type: chart.type, audience: chart.audience, metric: chart.metric },
        metadata: { exportedAt: new Date().toISOString(), createdBy: chart.createdBy, dataSource: chart.dataSource },
        data: chartData,
        filters: { timePeriod: selectedTimePeriod, segment: selectedSegment },
      }

      if (format === "csv") {
        const headers = Object.keys(chartData[0] || {}).join(",")
        const rows = chartData.map(row => Object.values(row).join(",")).join("\n")
        const csvContent = `${headers}\n${rows}`
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `chart-${chart.id}-${new Date().toISOString().split("T")[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const content = JSON.stringify(exportData, null, 2)
        const blob = new Blob([content], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `chart-${chart.id}-${new Date().toISOString().split("T")[0]}.${format}`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/v1/charts/${id}`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        router.push("/dashboard/charts")
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

  const handleCopyEmbed = () => {
    const embedCode = `<iframe src="${window.location.origin}/embed/charts/${id}" width="100%" height="400" frameborder="0"></iframe>`
    navigator.clipboard.writeText(embedCode)
  }

  const handleAddAnnotation = () => {
    if (!newAnnotation.trim()) return
    const annotation: Annotation = {
      id: String(Date.now()),
      dataPointIndex: 0,
      text: newAnnotation,
      author: "You",
      createdAt: "Just now",
      type: "note",
    }
    setAnnotations([annotation, ...annotations])
    setNewAnnotation("")
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Skeleton className="h-[500px] rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  // Not found state
  if (!chart) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/charts">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-3xl font-bold">{t("notFound")}</h1>
        </div>
        <Card className="p-12 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("notFound")}</h2>
          <p className="text-muted-foreground mb-4">{t("notFoundDescription")}</p>
          <Link href="/dashboard/charts"><Button>{t("backToCharts")}</Button></Link>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn("flex-1 space-y-4 p-6", isFullscreen && "fixed inset-0 z-50 bg-background overflow-auto")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link href="/dashboard/charts">
              <Button variant="ghost" size="icon" className="mt-1">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{chart.name}</h1>
                <Badge variant="secondary">{formatChartType(chart.type)}</Badge>
                {chart.category && <Badge variant="outline">{chart.category}</Badge>}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFavorite(!isFavorite)}>
                      {isFavorite ? <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> : <StarOff className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isFavorite ? "Remove from favorites" : "Add to favorites"}</TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">{chart.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {chart.updatedAt}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {chart.views?.toLocaleString()} views</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {chart.createdBy}</span>
                <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {chart.dataSource}</span>
                {chart.sampleSize && <span className="flex items-center gap-1"><Info className="h-3 w-3" /> n={chart.sampleSize.toLocaleString()}</span>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
                  {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{autoRefresh ? "Pause auto-refresh" : "Enable auto-refresh"}</TooltipContent>
            </Tooltip>

            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="h-4 w-4 mr-2" />
              {isFullscreen ? "Exit" : "Fullscreen"}
            </Button>

            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
              {copied ? "Copied!" : "Share"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("png")}>
                  <Download className="h-4 w-4 mr-2" /> Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <Table className="h-4 w-4 mr-2" /> Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  <Code className="h-4 w-4 mr-2" /> Export as JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <Download className="h-4 w-4 mr-2" /> Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pptx")}>
                  <Download className="h-4 w-4 mr-2" /> Export to PowerPoint
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href={`/dashboard/charts/new?edit=${chart.id}`}>
              <Button size="sm"><Edit className="h-4 w-4 mr-2" /> {t("actions.edit")}</Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEmbedDialog(true)}>
                  <Code className="h-4 w-4 mr-2" /> Get Embed Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowScheduleDialog(true)}>
                  <Mail className="h-4 w-4 mr-2" /> Schedule Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> {t("actions.duplicate")}</DropdownMenuItem>
                <DropdownMenuItem><Bookmark className="h-4 w-4 mr-2" /> {t("actions.addToDashboard")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview" className="gap-2"><BarChart3 className="h-4 w-4" /> {t("tabs.overview")}</TabsTrigger>
              <TabsTrigger value="data" className="gap-2"><Table className="h-4 w-4" /> {t("tabs.data")}</TabsTrigger>
              <TabsTrigger value="filters" className="gap-2"><Filter className="h-4 w-4" /> {t("tabs.filters")}</TabsTrigger>
              <TabsTrigger value="annotations" className="gap-2"><MessageSquare className="h-4 w-4" /> {t("tabs.notes")} ({annotations.length})</TabsTrigger>
              <TabsTrigger value="activity" className="gap-2"><History className="h-4 w-4" /> {t("tabs.activity")}</TabsTrigger>
            </TabsList>

            {activeTab === "overview" && (
              <div className="flex items-center gap-2">
                <Button
                  variant={comparisonMode ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setComparisonMode(!comparisonMode)}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  {comparisonMode ? "Exit Compare" : "Compare"}
                </Button>
                <Button
                  variant={dataViewMode === "table" ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setDataViewMode(dataViewMode === "chart" ? "table" : "chart")}
                >
                  {dataViewMode === "chart" ? <Table className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className={cn("grid gap-6", isFullscreen ? "" : "lg:grid-cols-3")}>
              {/* Main Chart */}
              <div className={cn(isFullscreen ? "" : "lg:col-span-2")}>
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className={cn("bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg overflow-hidden", isFullscreen ? "min-h-[600px]" : "min-h-[400px]")}>
                      <AdvancedChartRenderer
                        type={chart.type}
                        data={Array.isArray(chart.data) && chart.data.length > 0 ? chart.data : generateAdvancedSampleData(chart.type, chart.template)}
                        config={{
                          showLegend: true,
                          showGrid: true,
                          showTooltip: true,
                          showBenchmark: true,
                          showChange: true,
                          height: isFullscreen ? 600 : 400,
                          animate: true,
                          formatter: "percentage",
                          // Pass extracted dataKeys for multi-series charts
                          dataKeys: Array.isArray(chart.config?.extractedDataKeys) && chart.config.extractedDataKeys.length > 0 ? chart.config.extractedDataKeys as string[] : undefined,
                          // Pass extracted colors if available
                          colors: Array.isArray(chart.config?.extractedColors) ? chart.config.extractedColors as string[] : undefined,
                        }}
                        template={chart.template}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              {!isFullscreen && (
                <div className="space-y-6">
                  {/* Key Insights */}
                  {chart.insights && chart.insights.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Key Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {chart.insights.map((insight, index) => (
                          <div
                            key={index}
                            className={cn(
                              "p-2 rounded-lg border-l-2 text-xs",
                              insight.type === "increase" && "bg-green-500/10 border-green-500",
                              insight.type === "decrease" && "bg-red-500/10 border-red-500",
                              insight.type === "neutral" && "bg-muted border-muted-foreground",
                              insight.type === "highlight" && "bg-primary/10 border-primary"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{insight.title}</span>
                              {insight.value && (
                                <span className={cn(
                                  "font-bold",
                                  insight.type === "increase" && "text-green-500",
                                  insight.type === "decrease" && "text-red-500",
                                  insight.type === "highlight" && "text-primary"
                                )}>
                                  {insight.value}
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground mt-0.5">{insight.description}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Methodology */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Methodology
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <div>
                        <span className="text-muted-foreground">Sample Size:</span>
                        <span className="ml-2 font-medium">{chart.sampleSize?.toLocaleString() || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="ml-2 font-medium">{chart.confidenceLevel || 95}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Period:</span>
                        <span className="ml-2 font-medium">{chart.timePeriod}</span>
                      </div>
                      {chart.methodology && (
                        <p className="text-muted-foreground pt-2 border-t">{chart.methodology}</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Related Charts */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Related Charts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {relatedCharts.map(rc => (
                        <Link key={rc.id} href={`/dashboard/charts/${rc.id}`} className="block">
                          <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-xs">
                            <div className="font-medium truncate">{rc.name}</div>
                            <div className="flex items-center gap-2 text-muted-foreground mt-0.5">
                              <Badge variant="outline" className="text-[10px] px-1">{rc.type}</Badge>
                              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {rc.views}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Raw Data</CardTitle>
                    <CardDescription>{chartData.length} data points</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder={t("data.searchPlaceholder")} className="pl-8 w-[200px]" />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
                      <Download className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="p-3 text-left font-medium w-10">#</th>
                        {chartData[0] && Object.keys(chartData[0]).map(key => (
                          <th
                            key={key}
                            className="p-3 text-left font-medium cursor-pointer hover:bg-muted"
                            onClick={() => handleSort(key)}
                          >
                            <div className="flex items-center gap-1">
                              {key}
                              {sortColumn === key && (
                                sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map((row, i) => (
                        <tr key={i} className="border-t hover:bg-muted/30">
                          <td className="p-3 text-muted-foreground">{i + 1}</td>
                          {Object.values(row).map((value, j) => (
                            <td key={j} className="p-3">
                              {typeof value === "number" ? value.toLocaleString() : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Filters Tab */}
          <TabsContent value="filters" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Time Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {timePeriodOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTimePeriod === "custom" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Start Date</Label>
                        <Input type="date" />
                      </div>
                      <div>
                        <Label className="text-xs">End Date</Label>
                        <Input type="date" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" /> Audience Segment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {segmentOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="space-y-2">
                    <Label className="text-xs">Age Range</Label>
                    <Slider defaultValue={[18, 65]} min={13} max={80} step={1} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>18</span><span>65</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" /> Display Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Show Benchmark</Label>
                    <Switch checked={showBenchmark} onCheckedChange={setShowBenchmark} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Confidence Interval</Label>
                    <Switch checked={showConfidenceInterval} onCheckedChange={setShowConfidenceInterval} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Show Annotations</Label>
                    <Switch checked={showAnnotations} onCheckedChange={setShowAnnotations} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline">Reset Filters</Button>
              <Button>Apply Filters</Button>
            </div>
          </TabsContent>

          {/* Annotations Tab */}
          <TabsContent value="annotations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Note</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Textarea
                    placeholder={t("annotations.addPlaceholder")}
                    value={newAnnotation}
                    onChange={e => setNewAnnotation(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button onClick={handleAddAnnotation} disabled={!newAnnotation.trim()}>
                    <MessageSquare className="h-4 w-4 mr-2" /> Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes & Comments ({annotations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {annotations.map(annotation => (
                      <div key={annotation.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium">{annotation.author.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{annotation.author}</p>
                              <p className="text-xs text-muted-foreground">{annotation.createdAt}</p>
                            </div>
                          </div>
                          <Badge variant={annotation.type === "question" ? "destructive" : annotation.type === "highlight" ? "default" : "secondary"}>
                            {annotation.type}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm">{annotation.text}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent activity on this chart</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {demoActivity.map(item => (
                      <div key={item.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          item.action === "viewed" && "bg-blue-500/10 text-blue-500",
                          item.action === "exported" && "bg-green-500/10 text-green-500",
                          item.action === "commented" && "bg-purple-500/10 text-purple-500",
                          item.action === "shared" && "bg-orange-500/10 text-orange-500",
                          item.action === "edited" && "bg-yellow-500/10 text-yellow-500",
                          item.action === "created" && "bg-primary/10 text-primary",
                        )}>
                          {item.action === "viewed" && <Eye className="h-4 w-4" />}
                          {item.action === "exported" && <Download className="h-4 w-4" />}
                          {item.action === "commented" && <MessageSquare className="h-4 w-4" />}
                          {item.action === "shared" && <Share2 className="h-4 w-4" />}
                          {item.action === "edited" && <Edit className="h-4 w-4" />}
                          {item.action === "created" && <Sparkles className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{item.user}</span>
                            <span className="text-muted-foreground"> {item.action} this chart</span>
                          </p>
                          {item.details && <p className="text-xs text-muted-foreground">{item.details}</p>}
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {item.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chart</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{chart.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Embed Chart</DialogTitle>
              <DialogDescription>Copy the code below to embed this chart in your website or report.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Embed Code</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
                  {`<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed/charts/${id}" width="100%" height="400" frameborder="0"></iframe>`}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Width</Label>
                  <Input defaultValue="100%" />
                </div>
                <div>
                  <Label className="text-xs">Height</Label>
                  <Input defaultValue="400px" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmbedDialog(false)}>Cancel</Button>
              <Button onClick={handleCopyEmbed}><Copy className="h-4 w-4 mr-2" /> Copy Code</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Report</DialogTitle>
              <DialogDescription>Set up automatic email delivery of this chart.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Recipients</Label>
                <Input placeholder="email@example.com, team@example.com" className="mt-2" />
              </div>
              <div>
                <Label>Frequency</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="png">PNG Image</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
              <Button><Mail className="h-4 w-4 mr-2" /> Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
