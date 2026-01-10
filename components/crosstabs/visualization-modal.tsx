"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Download, BarChart3, LineChart, PieChart, Activity, Grid3X3, Save } from "lucide-react"
import { ChartRenderer, ChartType } from "@/components/charts/chart-renderer"

interface CrosstabData {
  metric: string
  values: Record<string, number>
}

interface VisualizationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  crosstabName: string
  audiences: string[]
  data: CrosstabData[]
  onSaveChart?: (config: ChartConfig) => void
}

interface ChartConfig {
  type: ChartType
  selectedMetric: string | "all"
  selectedAudience: string | "all"
  title: string
}

export function VisualizationModal({
  open,
  onOpenChange,
  crosstabName,
  audiences,
  data,
  onSaveChart,
}: VisualizationModalProps) {
  const [chartType, setChartType] = useState<ChartType>("BAR")
  const [selectedMetric, setSelectedMetric] = useState<string>("all")
  const [selectedAudience, setSelectedAudience] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"by-metric" | "by-audience">("by-metric")

  const chartTypes: { type: ChartType; label: string; icon: React.ReactNode; description: string }[] = [
    { type: "BAR", label: "Bar Chart", icon: <BarChart3 className="h-4 w-4" />, description: "Compare values across categories" },
    { type: "LINE", label: "Line Chart", icon: <LineChart className="h-4 w-4" />, description: "Show trends and patterns" },
    { type: "RADAR", label: "Radar Chart", icon: <Activity className="h-4 w-4" />, description: "Profile comparison" },
    { type: "PIE", label: "Pie Chart", icon: <PieChart className="h-4 w-4" />, description: "Show proportions" },
    { type: "HEATMAP", label: "Heatmap", icon: <Grid3X3 className="h-4 w-4" />, description: "Intensity visualization" },
  ]

  // Transform data for chart
  const chartData = useMemo(() => {
    if (viewMode === "by-metric") {
      // Show all audiences for selected metric(s)
      if (selectedMetric === "all") {
        // Aggregate all metrics - show average per audience
        return audiences.map(audience => {
          const avgValue = data.reduce((sum, row) => sum + (row.values[audience] || 0), 0) / data.length
          return { name: audience, value: Math.round(avgValue) }
        })
      } else {
        // Single metric - show all audiences
        const metricData = data.find(d => d.metric === selectedMetric)
        if (!metricData) return []
        return audiences.map(audience => ({
          name: audience,
          value: metricData.values[audience] || 0,
        }))
      }
    } else {
      // Show all metrics for selected audience(s)
      if (selectedAudience === "all") {
        // Aggregate all audiences - show average per metric
        return data.map(row => {
          const avgValue = audiences.reduce((sum, aud) => sum + (row.values[aud] || 0), 0) / audiences.length
          return { name: row.metric, value: Math.round(avgValue) }
        })
      } else {
        // Single audience - show all metrics
        return data.map(row => ({
          name: row.metric,
          value: row.values[selectedAudience] || 0,
        }))
      }
    }
  }, [data, audiences, selectedMetric, selectedAudience, viewMode])

  // Multi-series data for grouped charts
  const multiSeriesData = useMemo(() => {
    if (chartType === "BAR" && viewMode === "by-metric" && selectedMetric !== "all") {
      const metricData = data.find(d => d.metric === selectedMetric)
      if (!metricData) return []
      return audiences.map(audience => ({
        name: audience,
        value: metricData.values[audience] || 0,
      }))
    }
    return chartData
  }, [chartType, viewMode, selectedMetric, data, audiences, chartData])

  const handleExport = (format: "png" | "svg") => {
    // In production, this would use html2canvas or similar
    const chartTitle = selectedMetric === "all"
      ? `${crosstabName} - All Metrics`
      : `${crosstabName} - ${selectedMetric}`

    alert(`Exporting ${chartTitle} as ${format.toUpperCase()}`)
  }

  const handleSaveChart = () => {
    if (onSaveChart) {
      onSaveChart({
        type: chartType,
        selectedMetric,
        selectedAudience,
        title: `${crosstabName} - ${selectedMetric === "all" ? "Overview" : selectedMetric}`,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Visualize: {crosstabName}
          </DialogTitle>
          <DialogDescription>
            Create charts and visualizations from your cross-tab data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chart Type Selection */}
          <div className="space-y-2">
            <Label>Chart Type</Label>
            <div className="grid grid-cols-5 gap-2">
              {chartTypes.map((ct) => (
                <button
                  key={ct.type}
                  onClick={() => setChartType(ct.type)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    chartType === ct.type
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-center mb-1">{ct.icon}</div>
                  <div className="text-xs font-medium">{ct.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* View Mode and Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>View Mode</Label>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "by-metric" | "by-audience")}>
                <TabsList className="w-full">
                  <TabsTrigger value="by-metric" className="flex-1">By Metric</TabsTrigger>
                  <TabsTrigger value="by-audience" className="flex-1">By Audience</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>{viewMode === "by-metric" ? "Select Metric" : "Select Audience"}</Label>
              {viewMode === "by-metric" ? (
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Metrics (Average)</SelectItem>
                    {data.map((row) => (
                      <SelectItem key={row.metric} value={row.metric}>
                        {row.metric}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Audiences (Average)</SelectItem>
                    {audiences.map((audience) => (
                      <SelectItem key={audience} value={audience}>
                        {audience}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Chart Preview */}
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">
                {selectedMetric === "all"
                  ? "All Metrics Overview"
                  : selectedAudience === "all"
                  ? "All Audiences Overview"
                  : viewMode === "by-metric"
                  ? selectedMetric
                  : selectedAudience}
              </h4>
              <Badge variant="outline">{multiSeriesData.length} data points</Badge>
            </div>
            <ChartRenderer
              type={chartType}
              data={multiSeriesData}
              config={{
                height: 350,
                showLegend: true,
                showGrid: true,
                showTooltip: true,
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport("png")}>
                <Download className="h-4 w-4 mr-2" />
                Export PNG
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("svg")}>
                <Download className="h-4 w-4 mr-2" />
                Export SVG
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={handleSaveChart}>
                <Save className="h-4 w-4 mr-2" />
                Save to Charts
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
