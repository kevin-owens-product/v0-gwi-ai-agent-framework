"use client"

import { useState, useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChartRenderer, ChartType, ChartDataPoint, generateSampleData } from "./chart-renderer"
import { cn } from "@/lib/utils"
import {
  Database,
  BarChart3,
  LineChart,
  PieChart,
  AreaChart as AreaChartIcon,
  Radar,
  GitBranch,
  Binary,
  Eye,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Grid,
  Layers,
  Save,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react"

interface ChartConfig {
  type: ChartType
  title: string
  subtitle?: string
  data: ChartDataPoint[]
  colors: string[]
  showLegend: boolean
  showGrid: boolean
  showTooltip: boolean
  showLabels: boolean
  showDataValues: boolean
  legendPosition: "top" | "bottom" | "left" | "right"
  xAxisLabel?: string
  yAxisLabel?: string
  xAxisKey: string
  yAxisKey: string
  height: number
  animated: boolean
  stacked: boolean
  curved: boolean
  fillOpacity: number
  strokeWidth: number
  borderRadius: number
  sortOrder: "none" | "asc" | "desc"
  filterThreshold?: number
}

interface DataColumn {
  key: string
  label: string
  type: "number" | "string" | "date"
}

interface InteractiveChartEditorProps {
  initialConfig?: Partial<ChartConfig>
  initialData?: ChartDataPoint[]
  availableColumns?: DataColumn[]
  onSave?: (config: ChartConfig, data: ChartDataPoint[]) => void
  onExport?: (format: string, config: ChartConfig, data: ChartDataPoint[]) => void
  className?: string
}

const CHART_TYPES: { type: ChartType; labelKey: string; icon: React.ReactNode; descriptionKey: string }[] = [
  { type: "BAR", labelKey: "bar", icon: <BarChart3 className="h-4 w-4" />, descriptionKey: "barDescription" },
  { type: "LINE", labelKey: "line", icon: <LineChart className="h-4 w-4" />, descriptionKey: "lineDescription" },
  { type: "AREA", labelKey: "area", icon: <AreaChartIcon className="h-4 w-4" />, descriptionKey: "areaDescription" },
  { type: "PIE", labelKey: "pie", icon: <PieChart className="h-4 w-4" />, descriptionKey: "pieDescription" },
  { type: "DONUT", labelKey: "donut", icon: <PieChart className="h-4 w-4" />, descriptionKey: "donutDescription" },
  { type: "RADAR", labelKey: "radar", icon: <Radar className="h-4 w-4" />, descriptionKey: "radarDescription" },
  { type: "SCATTER", labelKey: "scatter", icon: <Binary className="h-4 w-4" />, descriptionKey: "scatterDescription" },
  { type: "FUNNEL", labelKey: "funnel", icon: <GitBranch className="h-4 w-4 rotate-180" />, descriptionKey: "funnelDescription" },
  { type: "TREEMAP", labelKey: "treemap", icon: <Grid className="h-4 w-4" />, descriptionKey: "treemapDescription" },
  { type: "HEATMAP", labelKey: "heatmap", icon: <Layers className="h-4 w-4" />, descriptionKey: "heatmapDescription" },
]

const PRESET_COLORS = [
  { name: "Default", colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"] },
  { name: "Ocean", colors: ["#0ea5e9", "#06b6d4", "#14b8a6", "#22c55e", "#84cc16", "#eab308"] },
  { name: "Sunset", colors: ["#f43f5e", "#ec4899", "#d946ef", "#a855f7", "#8b5cf6", "#6366f1"] },
  { name: "Forest", colors: ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0", "#dcfce7"] },
  { name: "Warm", colors: ["#dc2626", "#ea580c", "#d97706", "#ca8a04", "#65a30d", "#16a34a"] },
  { name: "Cool", colors: ["#2563eb", "#4f46e5", "#7c3aed", "#9333ea", "#c026d3", "#db2777"] },
  { name: "Monochrome", colors: ["#18181b", "#3f3f46", "#52525b", "#71717a", "#a1a1aa", "#d4d4d8"] },
  { name: "Pastel", colors: ["#fca5a5", "#fdba74", "#fde047", "#86efac", "#93c5fd", "#c4b5fd"] },
]

const DEFAULT_CONFIG: ChartConfig = {
  type: "BAR",
  title: "Chart Title",
  data: [],
  colors: PRESET_COLORS[0].colors,
  showLegend: true,
  showGrid: true,
  showTooltip: true,
  showLabels: true,
  showDataValues: false,
  legendPosition: "top",
  xAxisKey: "name",
  yAxisKey: "value",
  height: 300,
  animated: true,
  stacked: false,
  curved: true,
  fillOpacity: 0.3,
  strokeWidth: 2,
  borderRadius: 4,
  sortOrder: "none",
}

export function InteractiveChartEditor({
  initialConfig,
  initialData,
  availableColumns: _availableColumns = [],
  onSave,
  onExport,
  className,
}: InteractiveChartEditorProps) {
  const t = useTranslations("charts.editor")
  const [config, setConfig] = useState<ChartConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
    data: initialData || generateSampleData(initialConfig?.type || "BAR", 6),
  })
  const [_editingDataPoint, setEditingDataPoint] = useState<number | null>(null)
  const [showDataEditor, setShowDataEditor] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [selectedColorPreset, setSelectedColorPreset] = useState("Default")
  const [customColor, setCustomColor] = useState("#3b82f6")
  const [zoomLevel, setZoomLevel] = useState(100)
  const [expandedSection, setExpandedSection] = useState<string | null>("type")

  // Processed data based on sorting and filtering
  const processedData = useMemo(() => {
    let data = [...config.data]

    // Apply filter threshold
    if (config.filterThreshold !== undefined) {
      data = data.filter(d => d.value >= config.filterThreshold!)
    }

    // Apply sorting
    if (config.sortOrder !== "none") {
      data.sort((a, b) => {
        const aVal = a.value
        const bVal = b.value
        return config.sortOrder === "asc" ? aVal - bVal : bVal - aVal
      })
    }

    return data
  }, [config.data, config.sortOrder, config.filterThreshold])

  // Update config
  const updateConfig = useCallback((updates: Partial<ChartConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])

  // Add data point
  const addDataPoint = useCallback(() => {
    const newPoint: ChartDataPoint = {
      name: `Item ${config.data.length + 1}`,
      value: Math.floor(Math.random() * 100) + 10,
    }
    updateConfig({ data: [...config.data, newPoint] })
  }, [config.data, updateConfig])

  // Update data point
  const updateDataPoint = useCallback((index: number, updates: Partial<ChartDataPoint>) => {
    const newData = [...config.data]
    newData[index] = { ...newData[index], ...updates } as ChartDataPoint
    updateConfig({ data: newData })
  }, [config.data, updateConfig])

  // Delete data point
  const deleteDataPoint = useCallback((index: number) => {
    const newData = config.data.filter((_, i) => i !== index)
    updateConfig({ data: newData })
    setEditingDataPoint(null)
  }, [config.data, updateConfig])

  // Apply color preset
  const applyColorPreset = useCallback((preset: typeof PRESET_COLORS[0]) => {
    setSelectedColorPreset(preset.name)
    updateConfig({ colors: preset.colors })
  }, [updateConfig])

  // Add custom color
  const addCustomColor = useCallback(() => {
    if (!config.colors.includes(customColor)) {
      updateConfig({ colors: [...config.colors, customColor] })
    }
  }, [config.colors, customColor, updateConfig])

  // Remove color
  const removeColor = useCallback((index: number) => {
    if (config.colors.length > 1) {
      const newColors = config.colors.filter((_, i) => i !== index)
      updateConfig({ colors: newColors })
    }
  }, [config.colors, updateConfig])

  // Section header component
  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <button
      className="flex items-center justify-between w-full py-2 hover:bg-muted/50 rounded px-2 -mx-2"
      onClick={() => setExpandedSection(expandedSection === section ? null : section)}
    >
      <span className="text-sm font-medium">{title}</span>
      {expandedSection === section ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  )

  return (
    <div className={cn("flex h-full", className)}>
      {/* Sidebar */}
      <div className="w-80 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">{t("title")}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Chart Type Section */}
            <div>
              <SectionHeader title={t("sections.chartType")} section="type" />
              {expandedSection === "type" && (
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {CHART_TYPES.map((chart) => (
                    <TooltipProvider key={chart.type}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              "flex flex-col items-center justify-center p-2 rounded border transition-colors",
                              config.type === chart.type
                                ? "border-primary bg-primary/10"
                                : "border-transparent hover:border-muted-foreground/20 hover:bg-muted/50"
                            )}
                            onClick={() => {
                              updateConfig({ type: chart.type })
                              // Regenerate sample data for the new chart type
                              if (!initialData) {
                                updateConfig({ data: generateSampleData(chart.type, 6) })
                              }
                            }}
                          >
                            {chart.icon}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p className="font-medium">{t(`chartTypes.${chart.labelKey}`)}</p>
                          <p className="text-xs text-muted-foreground">{t(`chartTypes.${chart.descriptionKey}`)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Title & Labels Section */}
            <div>
              <SectionHeader title={t("sections.titleAndLabels")} section="labels" />
              {expandedSection === "labels" && (
                <div className="space-y-3 mt-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("labels.chartTitle")}</Label>
                    <Input
                      value={config.title}
                      onChange={(e) => updateConfig({ title: e.target.value })}
                      placeholder={t("labels.chartTitlePlaceholder")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("labels.subtitle")}</Label>
                    <Input
                      value={config.subtitle || ""}
                      onChange={(e) => updateConfig({ subtitle: e.target.value })}
                      placeholder={t("labels.subtitlePlaceholder")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t("labels.xAxisLabel")}</Label>
                      <Input
                        value={config.xAxisLabel || ""}
                        onChange={(e) => updateConfig({ xAxisLabel: e.target.value })}
                        placeholder={t("labels.xAxis")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t("labels.yAxisLabel")}</Label>
                      <Input
                        value={config.yAxisLabel || ""}
                        onChange={(e) => updateConfig({ yAxisLabel: e.target.value })}
                        placeholder={t("labels.yAxis")}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Colors Section */}
            <div>
              <SectionHeader title={t("sections.colors")} section="colors" />
              {expandedSection === "colors" && (
                <div className="space-y-3 mt-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("colors.presets")}</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_COLORS.map((preset) => (
                        <TooltipProvider key={preset.name}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className={cn(
                                  "p-1.5 rounded border transition-all",
                                  selectedColorPreset === preset.name
                                    ? "border-primary ring-1 ring-primary"
                                    : "border-transparent hover:border-muted-foreground/30"
                                )}
                                onClick={() => applyColorPreset(preset)}
                              >
                                <div className="flex gap-0.5">
                                  {preset.colors.slice(0, 4).map((color, i) => (
                                    <div
                                      key={i}
                                      className="w-3 h-3 rounded-sm"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>{preset.name}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("colors.current")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {config.colors.map((color, i) => (
                        <div key={i} className="relative group">
                          <div
                            className="w-8 h-8 rounded border cursor-pointer hover:ring-2 ring-offset-1 ring-primary/50"
                            style={{ backgroundColor: color }}
                          />
                          <button
                            className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            onClick={() => removeColor(i)}
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </div>
                      ))}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-8 h-8 rounded border border-dashed flex items-center justify-center hover:border-primary hover:bg-muted/50 transition-colors">
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48">
                          <div className="space-y-2">
                            <Label className="text-xs">{t("colors.custom")}</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                className="w-10 h-8 p-0 border-0"
                              />
                              <Input
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                className="flex-1 h-8 text-xs"
                              />
                            </div>
                            <Button size="sm" className="w-full" onClick={addCustomColor}>
                              {t("colors.addColor")}
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Display Options Section */}
            <div>
              <SectionHeader title={t("sections.displayOptions")} section="display" />
              {expandedSection === "display" && (
                <div className="space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{t("display.showLegend")}</Label>
                    <Switch
                      checked={config.showLegend}
                      onCheckedChange={(v) => updateConfig({ showLegend: v })}
                    />
                  </div>
                  {config.showLegend && (
                    <div className="space-y-1.5 pl-4">
                      <Label className="text-xs text-muted-foreground">{t("display.legendPosition")}</Label>
                      <Select
                        value={config.legendPosition}
                        onValueChange={(v) => updateConfig({ legendPosition: v as any })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">{t("display.positions.top")}</SelectItem>
                          <SelectItem value="bottom">{t("display.positions.bottom")}</SelectItem>
                          <SelectItem value="left">{t("display.positions.left")}</SelectItem>
                          <SelectItem value="right">{t("display.positions.right")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{t("display.showGrid")}</Label>
                    <Switch
                      checked={config.showGrid}
                      onCheckedChange={(v) => updateConfig({ showGrid: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{t("display.showTooltip")}</Label>
                    <Switch
                      checked={config.showTooltip}
                      onCheckedChange={(v) => updateConfig({ showTooltip: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{t("display.showLabels")}</Label>
                    <Switch
                      checked={config.showLabels}
                      onCheckedChange={(v) => updateConfig({ showLabels: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{t("display.showDataValues")}</Label>
                    <Switch
                      checked={config.showDataValues}
                      onCheckedChange={(v) => updateConfig({ showDataValues: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">{t("display.animation")}</Label>
                    <Switch
                      checked={config.animated}
                      onCheckedChange={(v) => updateConfig({ animated: v })}
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Style Options Section */}
            <div>
              <SectionHeader title={t("sections.styleOptions")} section="style" />
              {expandedSection === "style" && (
                <div className="space-y-3 mt-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <Label className="text-xs">{t("style.chartHeight")}</Label>
                      <span className="text-xs text-muted-foreground">{config.height}px</span>
                    </div>
                    <Slider
                      value={[config.height]}
                      onValueChange={([v]) => updateConfig({ height: v })}
                      min={200}
                      max={600}
                      step={20}
                    />
                  </div>
                  {(config.type === "BAR" || config.type === "AREA") && (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <Label className="text-xs">{t("style.fillOpacity")}</Label>
                          <span className="text-xs text-muted-foreground">{Math.round(config.fillOpacity * 100)}%</span>
                        </div>
                        <Slider
                          value={[config.fillOpacity * 100]}
                          onValueChange={([v]) => updateConfig({ fillOpacity: v / 100 })}
                          min={10}
                          max={100}
                          step={5}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <Label className="text-xs">{t("style.borderRadius")}</Label>
                          <span className="text-xs text-muted-foreground">{config.borderRadius}px</span>
                        </div>
                        <Slider
                          value={[config.borderRadius]}
                          onValueChange={([v]) => updateConfig({ borderRadius: v })}
                          min={0}
                          max={20}
                          step={1}
                        />
                      </div>
                    </>
                  )}
                  {(config.type === "LINE" || config.type === "AREA") && (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <Label className="text-xs">{t("style.strokeWidth")}</Label>
                          <span className="text-xs text-muted-foreground">{config.strokeWidth}px</span>
                        </div>
                        <Slider
                          value={[config.strokeWidth]}
                          onValueChange={([v]) => updateConfig({ strokeWidth: v })}
                          min={1}
                          max={5}
                          step={0.5}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{t("style.curvedLines")}</Label>
                        <Switch
                          checked={config.curved}
                          onCheckedChange={(v) => updateConfig({ curved: v })}
                        />
                      </div>
                    </>
                  )}
                  {config.type === "BAR" && (
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">{t("style.stacked")}</Label>
                      <Switch
                        checked={config.stacked}
                        onCheckedChange={(v) => updateConfig({ stacked: v })}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Data & Sorting Section */}
            <div>
              <SectionHeader title={t("sections.dataAndSorting")} section="data" />
              {expandedSection === "data" && (
                <div className="space-y-3 mt-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("data.sortOrder")}</Label>
                    <Select
                      value={config.sortOrder}
                      onValueChange={(v) => updateConfig({ sortOrder: v as any })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("data.sortOrders.original")}</SelectItem>
                        <SelectItem value="asc">{t("data.sortOrders.ascending")}</SelectItem>
                        <SelectItem value="desc">{t("data.sortOrders.descending")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("data.filterThreshold")}</Label>
                    <Input
                      type="number"
                      value={config.filterThreshold ?? ""}
                      onChange={(e) => updateConfig({
                        filterThreshold: e.target.value ? parseFloat(e.target.value) : undefined
                      })}
                      placeholder={t("data.noFilter")}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowDataEditor(true)}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {t("data.editData", { count: config.data.length })}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="p-4 border-t space-y-2">
          <Button className="w-full" onClick={() => onSave?.(config, processedData)}>
            <Save className="h-4 w-4 mr-2" />
            {t("actions.saveChart")}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onExport?.("png", config, processedData)}
            >
              <Download className="h-4 w-4 mr-2" />
              {t("actions.png")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onExport?.("svg", config, processedData)}
            >
              <Download className="h-4 w-4 mr-2" />
              {t("actions.svg")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onExport?.("csv", config, processedData)}
            >
              <Download className="h-4 w-4 mr-2" />
              {t("actions.csv")}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col bg-muted/30">
        {/* Preview Toolbar */}
        <div className="p-2 border-b bg-background flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {t(`chartTypes.${CHART_TYPES.find(c => c.type === config.type)?.labelKey}`)} {t("preview.chart")}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {t("preview.dataPoints", { count: processedData.length })}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs w-12 text-center">{zoomLevel}%</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant={previewMode ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {t("preview.preview")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateConfig({ data: generateSampleData(config.type, 6) })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("preview.regenerate")}
            </Button>
          </div>
        </div>

        {/* Chart Preview */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <Card
            className="w-full max-w-4xl shadow-lg transition-transform"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{config.title || t("preview.untitledChart")}</CardTitle>
              {config.subtitle && (
                <p className="text-sm text-muted-foreground">{config.subtitle}</p>
              )}
            </CardHeader>
            <CardContent>
              <ChartRenderer
                type={config.type}
                data={processedData}
                config={{
                  colors: config.colors,
                  showLegend: config.showLegend,
                  showGrid: config.showGrid,
                  showTooltip: config.showTooltip,
                  height: config.height,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Data Editor Sheet */}
      <Sheet open={showDataEditor} onOpenChange={setShowDataEditor}>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>{t("dataEditor.title")}</SheetTitle>
          </SheetHeader>

          <div className="py-4 space-y-4">
            <Button variant="outline" size="sm" onClick={addDataPoint}>
              <Plus className="h-4 w-4 mr-2" />
              {t("dataEditor.addDataPoint")}
            </Button>

            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-2">
                {config.data.map((point, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={point.name}
                          onChange={(e) => updateDataPoint(index, { name: e.target.value })}
                          placeholder={t("dataEditor.labelPlaceholder")}
                          className="h-8"
                        />
                        <Input
                          type="number"
                          value={point.value}
                          onChange={(e) => updateDataPoint(index, { value: parseFloat(e.target.value) || 0 })}
                          placeholder={t("dataEditor.valuePlaceholder")}
                          className="h-8"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: config.colors[index % config.colors.length] }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteDataPoint(index)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
