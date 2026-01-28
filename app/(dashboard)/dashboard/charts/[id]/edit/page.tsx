"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
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
const chartTypes: { value: ChartType; labelKey: string; icon: React.ReactNode }[] = [
  { value: "BAR", labelKey: "chartTypes.bar", icon: <BarChart3 className="h-4 w-4" /> },
  { value: "LINE", labelKey: "chartTypes.line", icon: <LineChart className="h-4 w-4" /> },
  { value: "AREA", labelKey: "chartTypes.area", icon: <Activity className="h-4 w-4" /> },
  { value: "PIE", labelKey: "chartTypes.pie", icon: <PieChart className="h-4 w-4" /> },
  { value: "DONUT", labelKey: "chartTypes.donut", icon: <Circle className="h-4 w-4" /> },
  { value: "RADAR", labelKey: "chartTypes.radar", icon: <Target className="h-4 w-4" /> },
  { value: "SCATTER", labelKey: "chartTypes.scatter", icon: <Grid3X3 className="h-4 w-4" /> },
  { value: "FUNNEL", labelKey: "chartTypes.funnel", icon: <Triangle className="h-4 w-4" /> },
  { value: "TREEMAP", labelKey: "chartTypes.treemap", icon: <GitBranch className="h-4 w-4" /> },
  { value: "HEATMAP", labelKey: "chartTypes.heatmap", icon: <Grid3X3 className="h-4 w-4" /> },
]

// Status options
const statusOptions = [
  { value: "DRAFT", labelKey: "statuses.draft" },
  { value: "PUBLISHED", labelKey: "statuses.published" },
  { value: "ARCHIVED", labelKey: "statuses.archived" },
]

// Time period options
const timePeriodOptions = [
  { value: "7d", labelKey: "timePeriods.last7Days" },
  { value: "30d", labelKey: "timePeriods.last30Days" },
  { value: "90d", labelKey: "timePeriods.last90Days" },
  { value: "6m", labelKey: "timePeriods.last6Months" },
  { value: "12m", labelKey: "timePeriods.last12Months" },
  { value: "custom", labelKey: "timePeriods.customRange" },
]

// Audience options (demo data)
const audienceOptions = [
  { value: "all-adults", labelKey: "audienceOptions.allAdults18Plus" },
  { value: "eco-millennials", labelKey: "audienceOptions.ecoConsciousMillennials" },
  { value: "tech-adopters", labelKey: "audienceOptions.techEarlyAdopters" },
  { value: "genz-creators", labelKey: "audienceOptions.genZContentCreators" },
  { value: "premium-shoppers", labelKey: "audienceOptions.premiumShoppers" },
]

// Data source options (demo data)
const dataSourceOptions = [
  { value: "gwi-core", labelKey: "dataSourceOptions.gwiCoreQ4" },
  { value: "gwi-usa", labelKey: "dataSourceOptions.gwiUsa" },
  { value: "gwi-uk", labelKey: "dataSourceOptions.gwiUk" },
  { value: "gwi-zeitgeist", labelKey: "dataSourceOptions.gwiZeitgeist" },
  { value: "custom", labelKey: "dataSourceOptions.customDataSource" },
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
  data?: unknown
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
  const { status: sessionStatus } = useSession()
  const t = useTranslations("dashboard.charts.edit")
  const tCommon = useTranslations("common")

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

        const response = await fetch(`/api/v1/charts/${id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError(t("errors.notFound"))
          } else if (response.status === 401) {
            setError(t("errors.unauthorized"))
          } else if (response.status === 403) {
            setError(t("errors.forbidden"))
          } else {
            setError(t("errors.loadFailed"))
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
        setError(t("errors.loadFailedRetry"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchChart()
  }, [id, t])

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
      setError(t("errors.nameRequired"))
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/charts/${id}`, {
        method: "PATCH",
        credentials: 'include',
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
      setError(err instanceof Error ? err.message : t("errors.saveFailedRetry"))
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
          <h2 className="text-xl font-semibold mb-2">{t("authRequired")}</h2>
          <p className="text-muted-foreground mb-4">{t("pleaseSignIn")}</p>
          <Link href="/login">
            <Button>{t("signIn")}</Button>
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
          <h1 className="text-3xl font-bold">{t("title")}</h1>
        </div>
        <Card className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{tCommon("error")}</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link href="/dashboard/charts">
            <Button>{t("backToCharts")}</Button>
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
              <h1 className="text-2xl font-bold">{t("title")}</h1>
              {hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  {t("unsavedChanges")}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/charts/${id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              {t("preview")}
            </Button>
          </Link>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("saving")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t("saveChanges")}
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
              <CardTitle>{t("basicInfo.title")}</CardTitle>
              <CardDescription>
                {t("basicInfo.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("basicInfo.chartName")} *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("basicInfo.chartNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{tCommon("description")}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("basicInfo.descriptionPlaceholder")}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">{tCommon("status")}</Label>
                  <Select
                    value={chartStatus}
                    onValueChange={(value: "DRAFT" | "PUBLISHED" | "ARCHIVED") => setChartStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("basicInfo.selectStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataSource">{t("basicInfo.dataSource")}</Label>
                  <Select value={dataSource} onValueChange={setDataSource}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("basicInfo.selectDataSource")} />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSourceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.labelKey)}
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
              <CardTitle>{t("chartType.title")}</CardTitle>
              <CardDescription>
                {t("chartType.description")}
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
                    <span className="text-xs">{t(type.labelKey).split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>{t("dataConfig.title")}</CardTitle>
              <CardDescription>
                {t("dataConfig.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audience">{t("dataConfig.targetAudience")}</Label>
                  <Select value={audienceId} onValueChange={setAudienceId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("dataConfig.selectAudience")} />
                    </SelectTrigger>
                    <SelectContent>
                      {audienceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timePeriod">{t("dataConfig.timePeriod")}</Label>
                  <Select value={timePeriod} onValueChange={setTimePeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("dataConfig.selectTimePeriod")} />
                    </SelectTrigger>
                    <SelectContent>
                      {timePeriodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metric">{t("dataConfig.primaryMetric")}</Label>
                <Input
                  id="metric"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  placeholder={t("dataConfig.primaryMetricPlaceholder")}
                />
              </div>

              <Separator />

              {/* Dimensions */}
              <div className="space-y-2">
                <Label>{t("dataConfig.dimensions")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("dataConfig.dimensionsHint")}
                </p>
                <div className="flex gap-2">
                  <Input
                    value={newDimension}
                    onChange={(e) => setNewDimension(e.target.value)}
                    placeholder={t("dataConfig.addDimension")}
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
                <Label>{t("dataConfig.measures")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("dataConfig.measuresHint")}
                </p>
                <div className="flex gap-2">
                  <Input
                    value={newMeasure}
                    onChange={(e) => setNewMeasure(e.target.value)}
                    placeholder={t("dataConfig.addMeasure")}
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
                    <Label>{t("dataConfig.filters")}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t("dataConfig.filtersHint")}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddFilter}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("dataConfig.addFilter")}
                  </Button>
                </div>
                {filters.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {filters.map((filter, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={filter.field}
                          onChange={(e) => handleUpdateFilter(index, { field: e.target.value })}
                          placeholder={t("dataConfig.field")}
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
                            <SelectItem value="equals">{t("dataConfig.operators.equals")}</SelectItem>
                            <SelectItem value="not_equals">{t("dataConfig.operators.notEquals")}</SelectItem>
                            <SelectItem value="contains">{t("dataConfig.operators.contains")}</SelectItem>
                            <SelectItem value="greater_than">{t("dataConfig.operators.greaterThan")}</SelectItem>
                            <SelectItem value="less_than">{t("dataConfig.operators.lessThan")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={filter.value}
                          onChange={(e) => handleUpdateFilter(index, { value: e.target.value })}
                          placeholder={t("dataConfig.value")}
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
              <CardTitle>{t("preview.title")}</CardTitle>
              <CardDescription>
                {t("preview.description")}
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
              <CardTitle>{t("displayOptions.title")}</CardTitle>
              <CardDescription>
                {t("displayOptions.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showLegend">{t("displayOptions.showLegend")}</Label>
                <Switch
                  id="showLegend"
                  checked={showLegend}
                  onCheckedChange={setShowLegend}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showGrid">{t("displayOptions.showGrid")}</Label>
                <Switch
                  id="showGrid"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showTooltip">{t("displayOptions.showTooltip")}</Label>
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
                <CardTitle>{t("chartInfo.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("chartInfo.id")}</span>
                  <span className="font-mono text-xs">{chart.id}</span>
                </div>
                {chart.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("chartInfo.created")}</span>
                    <span>{new Date(chart.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                {chart.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("chartInfo.lastUpdated")}</span>
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
            <AlertDialogTitle>{t("discardDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("discardDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("discardDialog.keepEditing")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push(`/dashboard/charts/${id}`)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("discardDialog.discardChanges")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
