"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
  Target,
  Activity,
  Sparkles,
  Maximize2,
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
  AdvancedChartRenderer,
  generateAdvancedSampleData,
  type AdvancedChartType,
  type GWIChartTemplate,
} from "@/components/charts"
import { cn } from "@/lib/utils"

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
  data?: any[]
  config?: Record<string, any>
  template?: GWIChartTemplate
  category?: string
  insights?: ChartInsight[]
}

interface ChartInsight {
  type: "increase" | "decrease" | "neutral" | "highlight"
  title: string
  description: string
  value?: string
}

// Demo chart data with insights
const demoCharts: Record<string, Chart> = {
  "1": {
    id: "1",
    name: "Social Media Platform Penetration by Generation",
    type: "GROUPED_BAR",
    audience: "All Adults 18-65",
    metric: "Platform Usage (%)",
    updatedAt: "2 hours ago",
    views: 1247,
    createdBy: "Sarah Chen",
    description: "Comparative analysis of social media platform adoption rates across Gen Z, Millennials, Gen X, and Boomers with statistical significance indicators",
    dataSource: "GWI Core Q4 2024",
    timePeriod: "Oct-Dec 2024",
    template: "social-platform-reach",
    category: "Social Media",
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
    views: 892,
    createdBy: "Marcus Johnson",
    description: "24-month trend analysis of purchase intent across major retail categories with seasonal adjustment and YoY comparison",
    dataSource: "GWI Commerce",
    timePeriod: "Jan 2023 - Dec 2024",
    template: "media-consumption-trend",
    category: "E-commerce",
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
    views: 2341,
    createdBy: "Emily Thompson",
    description: "Multi-dimensional brand health comparison featuring awareness, consideration, preference, and advocacy metrics across top 8 competitors",
    dataSource: "GWI Brand Tracker",
    timePeriod: "Q4 2024",
    template: "brand-health-tracker",
    category: "Brand",
    insights: [
      { type: "increase", title: "Above Benchmark", description: "4 of 5 metrics exceed industry benchmark", value: "80%" },
      { type: "highlight", title: "Top Metric", description: "Brand awareness leads at 72%", value: "72%" },
    ],
  },
  "4": {
    id: "4",
    name: "Media Consumption Time Share",
    type: "DONUT",
    audience: "Eco-Conscious Millennials",
    metric: "Daily Minutes",
    updatedAt: "6 hours ago",
    views: 1567,
    createdBy: "Alex Rivera",
    description: "Distribution of daily media consumption time across streaming, social, gaming, traditional TV, podcasts, and news platforms",
    dataSource: "GWI Core Q4 2024",
    timePeriod: "Nov 2024",
    template: "market-share",
    category: "Media",
    insights: [
      { type: "increase", title: "Streaming Dominant", description: "Streaming captures 32% of media time", value: "32%" },
      { type: "decrease", title: "TV Decline", description: "Traditional TV down to 14%", value: "14%" },
    ],
  },
  "5": {
    id: "5",
    name: "Cross-Market Sustainability Attitudes",
    type: "HORIZONTAL_BAR",
    audience: "Premium Consumers",
    metric: "Agreement Index",
    updatedAt: "2 days ago",
    views: 743,
    createdBy: "Victoria Wells",
    description: "Comparative analysis of sustainability attitudes and willingness to pay premium across 12 key markets with cultural context",
    dataSource: "GWI Zeitgeist",
    timePeriod: "Q3-Q4 2024",
    template: "regional-breakdown",
    category: "Consumer Insights",
    insights: [
      { type: "highlight", title: "APAC Leads", description: "Asia Pacific shows highest sustainability concern", value: "85%" },
    ],
  },
  "6": {
    id: "6",
    name: "Streaming Service Subscriber Journey",
    type: "FUNNEL",
    audience: "Cord-Cutters",
    metric: "Subscriber %",
    updatedAt: "12 hours ago",
    views: 1089,
    createdBy: "Kevin Zhang",
    description: "Subscriber growth trajectories for major streaming platforms including churn analysis and multi-subscription behavior patterns",
    dataSource: "GWI Entertainment",
    timePeriod: "2022-2024",
    template: "conversion-funnel",
    category: "Media",
    insights: [
      { type: "decrease", title: "Funnel Drop-off", description: "52% drop-off between awareness and purchase", value: "-52%" },
      { type: "highlight", title: "Loyalty Rate", description: "Strong loyalty among subscribers", value: "67%" },
    ],
  },
  "7": {
    id: "7",
    name: "Gen Z Financial Product Adoption",
    type: "RADAR",
    audience: "Gen Z (18-25)",
    metric: "Usage Rate (%)",
    updatedAt: "1 day ago",
    views: 654,
    createdBy: "Isabella Martinez",
    description: "Adoption rates of fintech products including BNPL, crypto, neobanks, and investment apps with demographic breakdowns",
    dataSource: "GWI Finance",
    timePeriod: "Q4 2024",
    template: "purchase-drivers",
    category: "Finance",
    insights: [
      { type: "increase", title: "BNPL Surge", description: "Buy Now Pay Later up 35% among Gen Z", value: "+35%" },
    ],
  },
  "8": {
    id: "8",
    name: "Content Format Preference",
    type: "TREEMAP",
    audience: "Social Media Active Users",
    metric: "Engagement Share",
    updatedAt: "3 days ago",
    views: 987,
    createdBy: "Noah Williams",
    description: "Distribution of engagement across content formats: short video, long-form, articles, podcasts, and social posts",
    dataSource: "GWI Social",
    timePeriod: "Q4 2024",
    template: "content-preference",
    category: "Content",
    insights: [
      { type: "highlight", title: "Video Dominates", description: "Short videos capture 28% of engagement", value: "28%" },
    ],
  },
  "9": {
    id: "9",
    name: "Health & Wellness Spending Trends",
    type: "LINE",
    audience: "Health-Optimized Professionals",
    metric: "Monthly Spend ($)",
    updatedAt: "8 hours ago",
    views: 1432,
    createdBy: "Dr. James Park",
    description: "Tracking monthly spend across supplements, fitness, mental wellness apps, and preventive healthcare with income segment analysis",
    dataSource: "GWI Health",
    timePeriod: "2023-2024",
    template: "media-consumption-trend",
    category: "Health",
    insights: [
      { type: "increase", title: "Mental Wellness", description: "Mental health app spending up 42%", value: "+42%" },
    ],
  },
  "10": {
    id: "10",
    name: "Audience Segment Correlation",
    type: "BUBBLE",
    audience: "All Segments",
    metric: "Engagement vs. Spending",
    updatedAt: "5 hours ago",
    views: 876,
    createdBy: "Victoria Wells",
    description: "Correlation analysis of engagement levels and spending patterns across audience segments",
    dataSource: "GWI Core Q4 2024",
    timePeriod: "Q4 2024",
    template: "audience-correlation",
    category: "Audience",
    insights: [
      { type: "highlight", title: "High Value", description: "High engagers spend 2.3x more on average", value: "2.3x" },
    ],
  },
  "11": {
    id: "11",
    name: "Marketing Attribution Analysis",
    type: "WATERFALL",
    audience: "Campaign Audiences",
    metric: "Awareness Contribution",
    updatedAt: "1 hour ago",
    views: 1123,
    createdBy: "Marketing Team",
    description: "Channel contribution to brand awareness lift from baseline through all marketing touchpoints",
    dataSource: "GWI Brand Tracker",
    timePeriod: "Q4 2024",
    template: "attribution-waterfall",
    category: "Marketing",
    insights: [
      { type: "highlight", title: "Social Impact", description: "Social media contributes 15% to awareness", value: "+15%" },
      { type: "increase", title: "Total Lift", description: "Campaign drove 40% awareness increase", value: "+40%" },
    ],
  },
  "12": {
    id: "12",
    name: "Digital Behavior by Generation",
    type: "HEATMAP",
    audience: "All Demographics",
    metric: "Adoption Rate",
    updatedAt: "30 minutes ago",
    views: 2156,
    createdBy: "Research Team",
    description: "Technology adoption matrix showing behavior patterns across generational cohorts",
    dataSource: "GWI Core Q4 2024",
    timePeriod: "Q4 2024",
    template: "generation-comparison",
    category: "Demographics",
    insights: [
      { type: "highlight", title: "Gen Z Leads", description: "Gen Z leads adoption in 4 of 6 categories", value: "67%" },
      { type: "decrease", title: "Gap Widening", description: "Generational gap increased 12% vs. last year", value: "+12%" },
    ],
  },
}

function formatChartType(type: AdvancedChartType): string {
  const typeMap: Record<string, string> = {
    BAR: "Bar Chart",
    HORIZONTAL_BAR: "Horizontal Bar",
    GROUPED_BAR: "Grouped Bar",
    STACKED_BAR: "Stacked Bar",
    LINE: "Line Chart",
    MULTI_LINE: "Multi-Line",
    AREA: "Area Chart",
    STACKED_AREA: "Stacked Area",
    PIE: "Pie Chart",
    DONUT: "Donut Chart",
    RADAR: "Radar Chart",
    SCATTER: "Scatter Plot",
    BUBBLE: "Bubble Chart",
    FUNNEL: "Funnel Chart",
    TREEMAP: "Treemap",
    HEATMAP: "Heatmap",
    COMBO: "Combo Chart",
    WATERFALL: "Waterfall",
    BULLET: "Bullet Chart",
    METRIC: "Metric",
    SPARKLINE: "Sparkline",
    COMPARISON_BAR: "Comparison",
  }
  return typeMap[type] || type
}

export default function ChartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [chart, setChart] = useState<Chart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    async function fetchChart() {
      try {
        const response = await fetch(`/api/v1/charts/${id}`)
        if (response.ok) {
          const data = await response.json()
          const apiChart = data.data || data
          if (apiChart && apiChart.id) {
            setChart(apiChart)
          } else {
            setChart(demoCharts[id] || null)
          }
        } else {
          setChart(demoCharts[id] || null)
        }
      } catch (error) {
        console.error("Failed to fetch chart:", error)
        setChart(demoCharts[id] || null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchChart()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/charts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!chart) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/charts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Chart Not Found</h1>
            <p className="text-muted-foreground mt-1">The requested chart could not be found</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Chart not found</h2>
          <p className="text-muted-foreground mb-4">
            The chart you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/charts">
            <Button>Back to Charts</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handleExport = async (format: "json" | "csv" | "png" = "json") => {
    setIsExporting(true)
    try {
      const exportData = {
        chart: { id: chart.id, name: chart.name, type: chart.type, audience: chart.audience, metric: chart.metric },
        metadata: { exportedAt: new Date().toISOString(), createdBy: chart.createdBy, dataSource: chart.dataSource },
        data: chart.data || generateAdvancedSampleData(chart.type, chart.template),
      }
      const content = JSON.stringify(exportData, null, 2)
      const blob = new Blob([content], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `chart-${chart.id}-${new Date().toISOString().split("T")[0]}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/v1/charts/${id}`, { method: "DELETE" })
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

  const handleDuplicate = async () => {
    try {
      const response = await fetch("/api/v1/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${chart.name} (Copy)`, type: chart.type, audience: chart.audience, metric: chart.metric }),
      })
      if (response.ok) {
        router.push("/dashboard/charts")
      }
    } catch (error) {
      console.error("Duplicate failed:", error)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/charts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{chart.name}</h1>
              {chart.category && (
                <Badge variant="outline" className="text-xs">
                  {chart.category}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{chart.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            <Maximize2 className="h-4 w-4 mr-2" />
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
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
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("png")}>Export as PNG</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href={`/dashboard/charts/new?edit=${chart.id}`}>
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
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/dashboards/new?chart=${chart.id}`}>
                  <Target className="h-4 w-4 mr-2" />
                  Add to Dashboard
                </Link>
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
                <AlertDialogTitle>Delete Chart</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{chart.name}"? This action cannot be undone.
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

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <Badge variant="secondary">{formatChartType(chart.type)}</Badge>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Modified {chart.updatedAt || "Recently"}</span>
        </div>
        {chart.views && (
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{chart.views.toLocaleString()} views</span>
          </div>
        )}
        {chart.createdBy && (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Created by {chart.createdBy}</span>
          </div>
        )}
        {chart.dataSource && (
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span>{chart.dataSource}</span>
          </div>
        )}
      </div>

      <div className={cn("grid gap-6", isFullscreen ? "" : "lg:grid-cols-3")}>
        {/* Main Chart */}
        <div className={cn(isFullscreen ? "" : "lg:col-span-2")}>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className={cn("bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg overflow-hidden", isFullscreen ? "min-h-[600px]" : "min-h-[400px]")}>
                <AdvancedChartRenderer
                  type={chart.type}
                  data={chart.data || generateAdvancedSampleData(chart.type, chart.template)}
                  config={{
                    showLegend: true,
                    showGrid: true,
                    showTooltip: true,
                    showBenchmark: true,
                    showChange: true,
                    height: isFullscreen ? 600 : 400,
                    animate: true,
                    formatter: "percentage",
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
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {chart.insights.map((insight, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded-lg border-l-4",
                        insight.type === "increase" && "bg-green-500/10 border-green-500",
                        insight.type === "decrease" && "bg-red-500/10 border-red-500",
                        insight.type === "neutral" && "bg-muted border-muted-foreground",
                        insight.type === "highlight" && "bg-primary/10 border-primary"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{insight.title}</span>
                        {insight.value && (
                          <span
                            className={cn(
                              "font-bold text-sm",
                              insight.type === "increase" && "text-green-500",
                              insight.type === "decrease" && "text-red-500",
                              insight.type === "highlight" && "text-primary"
                            )}
                          >
                            {insight.value}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Chart Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Chart Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {chart.audience && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Audience</p>
                    <p className="font-medium">{chart.audience}</p>
                  </div>
                )}
                {chart.metric && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Metric</p>
                    <p className="font-medium">{chart.metric}</p>
                  </div>
                )}
                {chart.dataSource && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Data Source</p>
                    <p className="font-medium">{chart.dataSource}</p>
                  </div>
                )}
                {chart.timePeriod && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Time Period</p>
                    <p className="font-medium">{chart.timePeriod}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExport("png")} disabled={isExporting}>
                  {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Download PNG
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExport("csv")} disabled={isExporting}>
                  {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Download CSV
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Link Copied!" : "Copy Share Link"}
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/dashboard/charts/new?duplicate=${chart.id}`}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate Chart
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
