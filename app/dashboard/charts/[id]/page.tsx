"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { ChartRenderer, generateSampleData } from "@/components/charts"
import type { ChartType } from "@/components/charts"

interface Chart {
  id: string
  name: string
  type: ChartType
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
}

// Demo chart data as fallback
const demoCharts: Record<string, Chart> = {
  "1": {
    id: "1",
    name: "Social Media Platform Penetration by Generation",
    type: "BAR",
    audience: "All Adults 18-65",
    metric: "Platform Usage (%)",
    updatedAt: "2 hours ago",
    views: 1234,
    createdBy: "Sarah Chen",
    description: "Comparative analysis of social media platform adoption rates across Gen Z, Millennials, Gen X, and Boomers with statistical significance indicators",
    dataSource: "GWI Core Q4 2024",
    timePeriod: "Oct-Dec 2024",
  },
  "2": {
    id: "2",
    name: "E-commerce Purchase Intent Trajectory",
    type: "LINE",
    audience: "Online Shoppers",
    metric: "Purchase Intent Index",
    updatedAt: "4 hours ago",
    views: 892,
    createdBy: "Marcus Johnson",
    description: "24-month trend analysis of purchase intent across major retail categories with seasonal adjustment and YoY comparison",
    dataSource: "GWI Commerce",
    timePeriod: "Jan 2023 - Dec 2024",
  },
  "3": {
    id: "3",
    name: "Competitive Brand Health Dashboard",
    type: "BAR",
    audience: "Category Buyers",
    metric: "Brand Health Score",
    updatedAt: "1 day ago",
    views: 567,
    createdBy: "Emily Thompson",
    description: "Multi-dimensional brand health comparison featuring awareness, consideration, preference, and advocacy metrics across top 8 competitors",
    dataSource: "GWI Brand Tracker",
    timePeriod: "Q4 2024",
  },
  "4": {
    id: "4",
    name: "Media Consumption Time Share",
    type: "PIE",
    audience: "Eco-Conscious Millennials",
    metric: "Daily Minutes",
    updatedAt: "6 hours ago",
    views: 445,
    createdBy: "Alex Rivera",
    description: "Distribution of daily media consumption time across streaming, social, gaming, traditional TV, podcasts, and news platforms",
    dataSource: "GWI Core Q4 2024",
    timePeriod: "Nov 2024",
  },
  "5": {
    id: "5",
    name: "Cross-Market Sustainability Attitudes",
    type: "BAR",
    audience: "Premium Consumers",
    metric: "Agreement Index",
    updatedAt: "2 days ago",
    views: 723,
    createdBy: "Victoria Wells",
    description: "Comparative analysis of sustainability attitudes and willingness to pay premium across 12 key markets with cultural context",
    dataSource: "GWI Zeitgeist",
    timePeriod: "Q3-Q4 2024",
  },
  "6": {
    id: "6",
    name: "Streaming Service Subscriber Journey",
    type: "LINE",
    audience: "Cord-Cutters",
    metric: "Subscriber %",
    updatedAt: "12 hours ago",
    views: 1089,
    createdBy: "Kevin Zhang",
    description: "Subscriber growth trajectories for major streaming platforms including churn analysis and multi-subscription behavior patterns",
    dataSource: "GWI Entertainment",
    timePeriod: "2022-2024",
  },
  "7": {
    id: "7",
    name: "Gen Z Financial Product Adoption",
    type: "AREA",
    audience: "Gen Z (18-25)",
    metric: "Usage Rate (%)",
    updatedAt: "1 day ago",
    views: 634,
    createdBy: "Isabella Martinez",
    description: "Adoption rates of fintech products including BNPL, crypto, neobanks, and investment apps with demographic breakdowns",
    dataSource: "GWI Finance",
    timePeriod: "Q4 2024",
  },
  "8": {
    id: "8",
    name: "Influencer Trust by Category",
    type: "DONUT",
    audience: "Social Media Active Users",
    metric: "Trust Score",
    updatedAt: "3 days ago",
    views: 512,
    createdBy: "Noah Williams",
    description: "Consumer trust distribution across influencer categories: celebrities, macro-influencers, micro-influencers, and nano-influencers by product category",
    dataSource: "GWI Social",
    timePeriod: "Q4 2024",
  },
  "9": {
    id: "9",
    name: "Health & Wellness Spending Trends",
    type: "LINE",
    audience: "Health-Optimized Professionals",
    metric: "Monthly Spend ($)",
    updatedAt: "8 hours ago",
    views: 378,
    createdBy: "Dr. James Park",
    description: "Tracking monthly spend across supplements, fitness, mental wellness apps, and preventive healthcare with income segment analysis",
    dataSource: "GWI Health",
    timePeriod: "2023-2024",
  },
  "10": {
    id: "10",
    name: "Luxury Purchase Drivers Analysis",
    type: "RADAR",
    audience: "Luxury Experience Seekers",
    metric: "Importance Score",
    updatedAt: "5 hours ago",
    views: 456,
    createdBy: "Victoria Wells",
    description: "Ranked analysis of luxury purchase motivators including exclusivity, craftsmanship, heritage, sustainability, and social signaling",
    dataSource: "GWI Luxury",
    timePeriod: "Q4 2024",
  },
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

export default function ChartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [chart, setChart] = useState<Chart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [copied, setCopied] = useState(false)

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
            // Fallback to demo data
            setChart(demoCharts[id] || null)
          }
        } else {
          // Fallback to demo data
          setChart(demoCharts[id] || null)
        }
      } catch (error) {
        console.error("Failed to fetch chart:", error)
        // Fallback to demo data
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
            <h1 className="text-3xl font-bold">{chart.name}</h1>
            <p className="text-muted-foreground mt-1">{chart.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent" onClick={() => handleExport("json")} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {isExporting ? "Exporting..." : "Export"}
          </Button>
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
              <DropdownMenuItem onClick={handleDuplicate}>Duplicate</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/dashboards/new?chart=${chart.id}`}>Add to Dashboard</Link>
              </DropdownMenuItem>
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
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Modified {chart.updatedAt || "Recently"}</span>
        </div>
        {chart.views && (
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{chart.views} views</span>
          </div>
        )}
        {chart.createdBy && (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Created by {chart.createdBy}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <ChartRenderer
                type={chart.type}
                data={chart.data || generateSampleData(chart.type, 8)}
                config={{
                  showLegend: true,
                  showGrid: true,
                  showTooltip: true,
                  height: 350,
                }}
              />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Chart Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge variant="secondary" className="mt-1">
                  {formatChartType(chart.type)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Audience</p>
                <p className="font-medium">{chart.audience}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metric</p>
                <p className="font-medium">{chart.metric}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => handleExport("png")} disabled={isExporting}>
                {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Export as PNG
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => handleExport("csv")} disabled={isExporting}>
                {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Export as CSV
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
