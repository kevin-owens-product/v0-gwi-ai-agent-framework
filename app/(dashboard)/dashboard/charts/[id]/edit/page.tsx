"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
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
  ArrowLeft,
  Save,
  Loader2,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Target,
  Circle,
  Grid3X3,
  Triangle,
  GitBranch,
  AlertCircle,
  Plus,
  X,
  Eye,
} from "lucide-react"
import { ChartRenderer, generateSampleData } from "@/components/charts"
import type { ChartType } from "@/components/charts"

// Chart type options with icons
const chartTypes: { value: ChartType; label: string; icon: React.ReactNode }[] = [
  { value: "BAR", label: "Bar Chart", icon: <BarChart3 className="h-4 w-4" /> },
  { value: "LINE", label: "Line Chart", icon: <LineChart className="h-4 w-4" /> },
  { value: "AREA", label: "Area Chart", icon: <Activity className="h-4 w-4" /> },
  { value: "PIE", label: "Pie Chart", icon: <PieChart className="h-4 w-4" /> },
  { value: "DONUT", label: "Donut Chart", icon: <Circle className="h-4 w-4" /> },
  { value: "RADAR", label: "Radar Chart", icon: <Target className="h-4 w-4" /> },
  { value: "SCATTER", label: "Scatter Plot", icon: <Grid3X3 className="h-4 w-4" /> },
  { value: "FUNNEL", label: "Funnel Chart", icon: <Triangle className="h-4 w-4" /> },
  { value: "TREEMAP", label: "Treemap", icon: <GitBranch className="h-4 w-4" /> },
  { value: "HEATMAP", label: "Heatmap", icon: <Grid3X3 className="h-4 w-4" /> },
]

// Status options
const statusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
]

// Time period options
const timePeriodOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "6m", label: "Last 6 months" },
  { value: "12m", label: "Last 12 months" },
  { value: "custom", label: "Custom range" },
]

// Audience options (demo data)
const audienceOptions = [
  { value: "all-adults", label: "All Adults 18+" },
  { value: "eco-millennials", label: "Eco-Conscious Millennials" },
  { value: "tech-adopters", label: "Tech Early Adopters" },
  { value: "genz-creators", label: "Gen Z Content Creators" },
  { value: "premium-shoppers", label: "Premium Shoppers" },
]

// Data source options (demo data)
const dataSourceOptions = [
  { value: "gwi-core", label: "GWI Core Q4 2024" },
  { value: "gwi-usa", label: "GWI USA" },
  { value: "gwi-uk", label: "GWI UK" },
  { value: "gwi-zeitgeist", label: "GWI Zeitgeist" },
  { value: "custom", label: "Custom Data Source" },
]

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
  data?: any
  createdAt?: string
  updatedAt?: string
}

interface FilterRule {
  field: string
  operator: string
  value: string
}

export default function EditChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()

  // Form state
  const [chart, setChart] = useState<ChartData | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [chartType, setChartType] = useState<ChartType>("BAR")
  const [chartStatus, setChartStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT")
  const [dataSource, setDataSource] = useState("")
  const [audienceId, setAudienceId] = useState("")
  const [metric, setMetric] = useState("")
  const [timePeriod, setTimePeriod] = useState("12m")
  const [dimensions, setDimensions] = useState<string[]>([])
  const [measures, setMeasures] = useState<string[]>([])
  const [filters, setFilters] = useState<FilterRule[]>([])
  const [showLegend, setShowLegend] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [newDimension, setNewDimension] = useState("")
  const [newMeasure, setNewMeasure] = useState("")

  // Fetch chart data
  useEffect(() => {
    async function fetchChart() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/v1/charts/${id}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("Chart not found")
          } else if (response.status === 401) {
            setError("You must be logged in to edit this chart")
          } else if (response.status === 403) {
            setError("You do not have permission to edit this chart")
          } else {
            setError("Failed to load chart")
          }
          return
        }

        const result = await response.json()
        const chartData = result.data || result

        setChart(chartData)
        setName(chartData.name || "")
        setDescription(chartData.description || "")
        setChartType(chartData.type || "BAR")
        setChartStatus(chartData.status || "DRAFT")
        setDataSource(chartData.dataSource || "")

        // Extract config values
        const config = chartData.config || {}
        setAudienceId(config.audienceId || "")
        setMetric(config.metric || "")
        setTimePeriod(config.timePeriod || "12m")
        setDimensions(config.dimensions || [])
        setMeasures(config.measures || [])
        setFilters(config.filters || [])
        setShowLegend(config.showLegend !== false)
        setShowGrid(config.showGrid !== false)
        setShowTooltip(config.showTooltip !== false)
      } catch (err) {
        console.error("Error fetching chart:", err)
        setError("Failed to load chart. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchChart()
  }, [id])

  // Track changes
  useEffect(() => {
    if (!chart) return

    const config = chart.config || {}
    const hasFormChanges =
      name !== (chart.name || "") ||
      description !== (chart.description || "") ||
      chartType !== (chart.type || "BAR") ||
      chartStatus !== (chart.status || "DRAFT") ||
      dataSource !== (chart.dataSource || "") ||
      audienceId !== (config.audienceId || "") ||
      metric !== (config.metric || "") ||
      timePeriod !== (config.timePeriod || "12m") ||
      JSON.stringify(dimensions) !== JSON.stringify(config.dimensions || []) ||
      JSON.stringify(measures) !== JSON.stringify(config.measures || []) ||
      JSON.stringify(filters) !== JSON.stringify(config.filters || []) ||
      showLegend !== (config.showLegend !== false) ||
      showGrid !== (config.showGrid !== false) ||
      showTooltip !== (config.showTooltip !== false)

    setHasChanges(hasFormChanges)
  }, [
    chart, name, description, chartType, chartStatus, dataSource,
    audienceId, metric, timePeriod, dimensions, measures, filters,
    showLegend, showGrid, showTooltip
  ])

  // Handle save
  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a chart name")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/charts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          type: chartType,
          status: chartStatus,
          dataSource: dataSource || undefined,
          config: {
            audienceId: audienceId || undefined,
            metric: metric || undefined,
            timePeriod,
            dimensions: dimensions.length > 0 ? dimensions : undefined,
            measures: measures.length > 0 ? measures : undefined,
            filters: filters.length > 0 ? filters : undefined,
            showLegend,
            showGrid,
            showTooltip,
          },
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Failed to save chart")
      }

      // Navigate back to chart detail page
      router.push(`/dashboard/charts/${id}`)
    } catch (err) {
      console.error("Error saving chart:", err)
      setError(err instanceof Error ? err.message : "Failed to save chart. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle cancel with unsaved changes
  const handleCancel = () => {
    if (hasChanges) {
      setShowDiscardDialog(true)
    } else {
      router.push(`/dashboard/charts/${id}`)
    }
  }

  // Add dimension
  const handleAddDimension = () => {
    if (newDimension.trim() && !dimensions.includes(newDimension.trim())) {
      setDimensions([...dimensions, newDimension.trim()])
      setNewDimension("")
    }
  }

  // Remove dimension
  const handleRemoveDimension = (dim: string) => {
    setDimensions(dimensions.filter(d => d !== dim))
  }

  // Add measure
  const handleAddMeasure = () => {
    if (newMeasure.trim() && !measures.includes(newMeasure.trim())) {
      setMeasures([...measures, newMeasure.trim()])
      setNewMeasure("")
    }
  }

  // Remove measure
  const handleRemoveMeasure = (measure: string) => {
    setMeasures(measures.filter(m => m !== measure))
  }

  // Add filter
  const handleAddFilter = () => {
    setFilters([...filters, { field: "", operator: "equals", value: "" }])
  }

  // Update filter
  const handleUpdateFilter = (index: number, updates: Partial<FilterRule>) => {
    const newFilters = [...filters]
    newFilters[index] = { ...newFilters[index], ...updates }
    setFilters(newFilters)
  }

  // Remove filter
  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  // Auth loading
  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Not authenticated
  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to edit this chart.</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Error state
  if (error && !chart) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/charts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Chart</h1>
        </div>
        <Card className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link href="/dashboard/charts">
            <Button>Back to Charts</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Edit Chart</h1>
              {hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved changes
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Modify your chart configuration and settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/charts/${id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Card className="border-destructive bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set the name and description for your chart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Chart Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter chart name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this chart shows"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={chartStatus}
                    onValueChange={(value: "DRAFT" | "PUBLISHED" | "ARCHIVED") => setChartStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataSource">Data Source</Label>
                  <Select value={dataSource} onValueChange={setDataSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSourceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart Type */}
          <Card>
            <CardHeader>
              <CardTitle>Chart Type</CardTitle>
              <CardDescription>
                Select the visualization type for your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {chartTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setChartType(type.value)}
                    className={`p-3 border rounded-lg flex flex-col items-center gap-2 hover:bg-accent transition-colors ${
                      chartType === type.value ? "border-primary bg-accent" : ""
                    }`}
                  >
                    {type.icon}
                    <span className="text-xs">{type.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Data Configuration</CardTitle>
              <CardDescription>
                Configure the data for your chart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select value={audienceId} onValueChange={setAudienceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {audienceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timePeriod">Time Period</Label>
                  <Select value={timePeriod} onValueChange={setTimePeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      {timePeriodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metric">Primary Metric</Label>
                <Input
                  id="metric"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  placeholder="e.g., Social Media Usage (%)"
                />
              </div>

              <Separator />

              {/* Dimensions */}
              <div className="space-y-2">
                <Label>Dimensions</Label>
                <p className="text-xs text-muted-foreground">
                  Categories for grouping your data (e.g., Age Group, Region)
                </p>
                <div className="flex gap-2">
                  <Input
                    value={newDimension}
                    onChange={(e) => setNewDimension(e.target.value)}
                    placeholder="Add a dimension"
                    onKeyDown={(e) => e.key === "Enter" && handleAddDimension()}
                  />
                  <Button variant="outline" onClick={handleAddDimension}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {dimensions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dimensions.map((dim) => (
                      <Badge key={dim} variant="secondary" className="gap-1">
                        {dim}
                        <button
                          onClick={() => handleRemoveDimension(dim)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Measures */}
              <div className="space-y-2">
                <Label>Measures</Label>
                <p className="text-xs text-muted-foreground">
                  Numeric values to display (e.g., Count, Percentage)
                </p>
                <div className="flex gap-2">
                  <Input
                    value={newMeasure}
                    onChange={(e) => setNewMeasure(e.target.value)}
                    placeholder="Add a measure"
                    onKeyDown={(e) => e.key === "Enter" && handleAddMeasure()}
                  />
                  <Button variant="outline" onClick={handleAddMeasure}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {measures.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {measures.map((m) => (
                      <Badge key={m} variant="secondary" className="gap-1">
                        {m}
                        <button
                          onClick={() => handleRemoveMeasure(m)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Filters */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Filters</Label>
                    <p className="text-xs text-muted-foreground">
                      Add conditions to filter your data
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddFilter}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Filter
                  </Button>
                </div>
                {filters.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {filters.map((filter, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={filter.field}
                          onChange={(e) => handleUpdateFilter(index, { field: e.target.value })}
                          placeholder="Field"
                          className="flex-1"
                        />
                        <Select
                          value={filter.operator}
                          onValueChange={(value) => handleUpdateFilter(index, { operator: value })}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not equals</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="greater_than">Greater than</SelectItem>
                            <SelectItem value="less_than">Less than</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={filter.value}
                          onChange={(e) => handleUpdateFilter(index, { value: e.target.value })}
                          placeholder="Value"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFilter(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                How your chart will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <ChartRenderer
                  type={chartType}
                  data={generateSampleData(chartType, 6)}
                  config={{
                    showLegend,
                    showGrid,
                    showTooltip,
                    height: 200,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Display Options */}
          <Card>
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
              <CardDescription>
                Customize chart appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showLegend">Show Legend</Label>
                <Switch
                  id="showLegend"
                  checked={showLegend}
                  onCheckedChange={setShowLegend}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showGrid">Show Grid</Label>
                <Switch
                  id="showGrid"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showTooltip">Show Tooltip</Label>
                <Switch
                  id="showTooltip"
                  checked={showTooltip}
                  onCheckedChange={setShowTooltip}
                />
              </div>
            </CardContent>
          </Card>

          {/* Chart Info */}
          {chart && (
            <Card>
              <CardHeader>
                <CardTitle>Chart Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-xs">{chart.id}</span>
                </div>
                {chart.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(chart.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                {chart.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{new Date(chart.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Discard Changes Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push(`/dashboard/charts/${id}`)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
