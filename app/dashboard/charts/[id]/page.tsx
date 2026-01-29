"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  Download,
  Share2,
  MoreHorizontal,
  BarChart3,
  Loader2,
  Copy,
  Check,
  Trash2,
  Eye,
  FileJson,
  FileImage,
  FileText,
  Table,
  Maximize2,
  TrendingUp,
  Calculator,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { ChartRenderer, generateSampleData, StatisticalAnalysisPanel } from "@/components/charts"
import type { ChartType } from "@/components/charts"
import { Table as DataTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ChartData {
  id: string
  name: string
  description?: string
  type: ChartType
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  config: {
    audienceId?: string
    metric?: string
    timePeriod?: string
    showLegend?: boolean
    showGrid?: boolean
    showTooltip?: boolean
    dimensions?: string[]
    measures?: string[]
    filters?: { field: string; operator: string; value: string }[]
  }
  dataSource?: string
  data?: unknown
  createdAt?: string
  updatedAt?: string
}

export default function ChartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { status: sessionStatus } = useSession()
  const t = useTranslations("dashboard.charts.detail")
  const [chart, setChart] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"chart" | "data" | "analysis">("chart")
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    async function fetchChart() {
      if (sessionStatus === "loading") return
      if (sessionStatus === "unauthenticated") {
        router.push("/login")
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/v1/charts/${id}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            setChart(null)
            return
          }
          throw new Error("Failed to fetch chart")
        }

        const result = await response.json()
        const chartData = result.data || result
        setChart(chartData)
      } catch (error) {
        console.error("Error fetching chart:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChart()
  }, [id, sessionStatus, router])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/v1/charts/${id}`, {
        method: "DELETE",
        credentials: "include",
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

  const handleExport = async (format: "json" | "csv" | "png" | "pdf") => {
    if (!chart) return

    const exportData = {
      chart: {
        id: chart.id,
        name: chart.name,
        description: chart.description,
        type: chart.type,
        config: chart.config,
      },
      data: chart.data || generateSampleData(chart.type, 6),
      metadata: {
        exportedAt: new Date().toISOString(),
        createdAt: chart.createdAt,
      },
    }

    const dateStr = new Date().toISOString().split("T")[0]

    if (format === "csv") {
      // Convert data to CSV
      const data = chart.data || generateSampleData(chart.type, 6)
      const csvContent = [
        "Label,Value",
        ...(Array.isArray(data)
          ? data.map((d: { name?: string; label?: string; value?: number }) =>
              `"${d.name || d.label || ""}","${d.value || 0}"`
            )
          : []),
      ].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `chart-${chart.id}-${dateStr}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === "png") {
      // TODO: Implement PNG export using canvas
      alert("PNG export coming soon")
    } else {
      const content = JSON.stringify(exportData, null, 2)
      const blob = new Blob([content], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `chart-${chart.id}-${dateStr}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  if (isLoading || sessionStatus === "loading") {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-96" />
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
            <p className="text-muted-foreground mt-1">The chart you're looking for doesn't exist</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Chart Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This chart may have been deleted or you don't have permission to view it.
          </p>
          <Link href="/dashboard/charts">
            <Button>Back to Charts</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const chartData = chart.data || generateSampleData(chart.type, 6)

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/charts">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{chart.name}</h1>
              <Badge variant={chart.status === "PUBLISHED" ? "default" : "secondary"}>
                {chart.status}
              </Badge>
            </div>
            {chart.description && (
              <p className="text-sm text-muted-foreground max-w-2xl">{chart.description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
          <Link href={`/dashboard/charts/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
                <MoreHorizontal className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileJson className="h-4 w-4 mr-2" /> Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <Table className="h-4 w-4 mr-2" /> Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("png")}>
                <FileImage className="h-4 w-4 mr-2" /> Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="h-4 w-4 mr-2" /> Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="chart">
            <BarChart3 className="h-4 w-4 mr-2" />
            Chart
          </TabsTrigger>
          <TabsTrigger value="data">
            <Table className="h-4 w-4 mr-2" />
            Data
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <Calculator className="h-4 w-4 mr-2" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{chart.name}</CardTitle>
              {chart.description && <CardDescription>{chart.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full">
                <ChartRenderer
                  type={chart.type}
                  data={chartData}
                  config={{
                    showLegend: chart.config.showLegend !== false,
                    showGrid: chart.config.showGrid !== false,
                    showTooltip: chart.config.showTooltip !== false,
                    height: 500,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
              <CardDescription>View chart data in tabular format</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(chartData) &&
                    chartData.map((point: { name?: string; label?: string; value?: number }, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{point.name || point.label || `Point ${index + 1}`}</TableCell>
                        <TableCell className="text-right">{point.value || 0}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </DataTable>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <StatisticalAnalysisPanel
            data={Array.isArray(chartData) ? chartData : []}
            xField="name"
            yField="value"
          />
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
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
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
