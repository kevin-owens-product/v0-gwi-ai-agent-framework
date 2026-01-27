"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ChartRenderer, ChartType, generateSampleData } from "@/components/charts/chart-renderer"
import { cn } from "@/lib/utils"
import {
  GripVertical,
  Plus,
  Settings,
  Trash2,
  Copy,
  Maximize2,
  MoreHorizontal,
  Edit2,
  Lock,
  Unlock,
  EyeOff,
  Layers,
  LayoutGrid,
  Save,
  Download,
  Undo2,
  Redo2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Table,
  FileText,
  Image as ImageIcon,
  Target,
  TrendingUp,
  Activity,
  Type,
} from "lucide-react"

// Widget Types
type WidgetType = "chart" | "metric" | "table" | "text" | "image" | "kpi"

interface WidgetConfig {
  chartType?: ChartType
  title?: string
  subtitle?: string
  dataSource?: string
  refreshInterval?: number
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  backgroundColor?: string
  textContent?: string
  imageUrl?: string
  kpiValue?: string | number
  kpiChange?: number
  kpiTarget?: number
}

interface Widget {
  id: string
  type: WidgetType
  x: number
  y: number
  width: number
  height: number
  config: WidgetConfig
  isLocked: boolean
  isVisible: boolean
  zIndex: number
}

interface DashboardState {
  id: string
  name: string
  description: string
  widgets: Widget[]
  gridColumns: number
  gridRows: number
  backgroundColor: string
  isEditing: boolean
  lastModified: Date
}

interface HistoryEntry {
  widgets: Widget[]
  timestamp: Date
}

interface AdvancedDashboardBuilderProps {
  initialState?: Partial<DashboardState>
  onSave?: (state: DashboardState) => void
  onExport?: (format: string, state: DashboardState) => void
  className?: string
}

const MIN_WIDGET_SIZE = 2
const DEFAULT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

const widgetTypeIcons: Record<WidgetType, React.ReactNode> = {
  chart: <BarChart3 className="h-4 w-4" />,
  metric: <Target className="h-4 w-4" />,
  table: <Table className="h-4 w-4" />,
  text: <Type className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  kpi: <TrendingUp className="h-4 w-4" />,
}

export function AdvancedDashboardBuilder({
  initialState,
  onSave,
  onExport,
  className,
}: AdvancedDashboardBuilderProps) {
  const t = useTranslations('dashboard.builder')
  const tCommon = useTranslations('common')

  const [dashboard, setDashboard] = useState<DashboardState>({
    id: initialState?.id || crypto.randomUUID(),
    name: initialState?.name || t('untitledDashboard'),
    description: initialState?.description || "",
    widgets: initialState?.widgets || [],
    gridColumns: initialState?.gridColumns || 12,
    gridRows: initialState?.gridRows || 8,
    backgroundColor: initialState?.backgroundColor || "transparent",
    isEditing: true,
    lastModified: new Date(),
  })

  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [resizingWidget, setResizingWidget] = useState<string | null>(null)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showWidgetPalette, setShowWidgetPalette] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWidgetEditor, setShowWidgetEditor] = useState(false)
  const [fullscreenWidget, setFullscreenWidget] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showGridLines, setShowGridLines] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [zoom, setZoom] = useState(100)

  const containerRef = useRef<HTMLDivElement>(null)
  const initialDragPos = useRef({ x: 0, y: 0 })
  const initialWidgetState = useRef<Widget | null>(null)

  // Save to history
  const saveToHistory = useCallback((widgets: Widget[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ widgets: JSON.parse(JSON.stringify(widgets)), timestamp: new Date() })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setDashboard(prev => ({
        ...prev,
        widgets: JSON.parse(JSON.stringify(history[historyIndex - 1].widgets)),
      }))
    }
  }, [history, historyIndex])

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setDashboard(prev => ({
        ...prev,
        widgets: JSON.parse(JSON.stringify(history[historyIndex + 1].widgets)),
      }))
    }
  }, [history, historyIndex])

  // Add widget
  const addWidget = useCallback((type: WidgetType, config?: Partial<WidgetConfig>) => {
    const widgetTypeNames: Record<WidgetType, string> = {
      chart: t('widgetTypes.chart'),
      metric: t('widgetTypes.metric'),
      table: t('widgetTypes.table'),
      text: t('widgetTypes.text'),
      image: t('widgetTypes.image'),
      kpi: t('widgetTypes.kpi'),
    }
    const newWidget: Widget = {
      id: crypto.randomUUID(),
      type,
      x: 0,
      y: 0,
      width: type === "kpi" || type === "metric" ? 3 : 4,
      height: type === "kpi" || type === "metric" ? 2 : 3,
      config: {
        title: t('newWidget', { type: widgetTypeNames[type] }),
        chartType: type === "chart" ? "BAR" : undefined,
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        colors: DEFAULT_COLORS,
        ...config,
      },
      isLocked: false,
      isVisible: true,
      zIndex: dashboard.widgets.length,
    }

    const updatedWidgets = [...dashboard.widgets, newWidget]
    setDashboard(prev => ({ ...prev, widgets: updatedWidgets, lastModified: new Date() }))
    saveToHistory(updatedWidgets)
    setSelectedWidget(newWidget.id)
    setShowWidgetPalette(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboard.widgets, saveToHistory])

  // Update widget
  const updateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    const updatedWidgets = dashboard.widgets.map(w =>
      w.id === id ? { ...w, ...updates } : w
    )
    setDashboard(prev => ({ ...prev, widgets: updatedWidgets, lastModified: new Date() }))
  }, [dashboard.widgets])

  // Delete widget
  const deleteWidget = useCallback((id: string) => {
    const updatedWidgets = dashboard.widgets.filter(w => w.id !== id)
    setDashboard(prev => ({ ...prev, widgets: updatedWidgets, lastModified: new Date() }))
    saveToHistory(updatedWidgets)
    if (selectedWidget === id) setSelectedWidget(null)
  }, [dashboard.widgets, selectedWidget, saveToHistory])

  // Duplicate widget
  const duplicateWidget = useCallback((id: string) => {
    const widget = dashboard.widgets.find(w => w.id === id)
    if (!widget) return

    const newWidget: Widget = {
      ...JSON.parse(JSON.stringify(widget)),
      id: crypto.randomUUID(),
      x: Math.min(widget.x + 1, dashboard.gridColumns - widget.width),
      y: Math.min(widget.y + 1, dashboard.gridRows - widget.height),
      zIndex: dashboard.widgets.length,
    }

    const updatedWidgets = [...dashboard.widgets, newWidget]
    setDashboard(prev => ({ ...prev, widgets: updatedWidgets, lastModified: new Date() }))
    saveToHistory(updatedWidgets)
    setSelectedWidget(newWidget.id)
  }, [dashboard.widgets, dashboard.gridColumns, dashboard.gridRows, saveToHistory])

  // Snap to grid
  const snapPosition = useCallback((value: number): number => {
    if (!snapToGrid) return value
    return Math.round(value)
  }, [snapToGrid])

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent, widgetId: string) => {
    const widget = dashboard.widgets.find(w => w.id === widgetId)
    if (!widget || widget.isLocked) return

    e.preventDefault()
    setDraggedWidget(widgetId)
    setSelectedWidget(widgetId)
    initialDragPos.current = { x: e.clientX, y: e.clientY }
    initialWidgetState.current = { ...widget }

    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const cellWidth = rect.width / dashboard.gridColumns
      const cellHeight = rect.height / dashboard.gridRows
      setDragOffset({
        x: e.clientX - rect.left - widget.x * cellWidth,
        y: e.clientY - rect.top - widget.y * cellHeight,
      })
    }
  }, [dashboard.widgets, dashboard.gridColumns, dashboard.gridRows])

  // Handle drag
  const handleDrag = useCallback((e: MouseEvent) => {
    if (!draggedWidget || !containerRef.current || !initialWidgetState.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const cellWidth = rect.width / dashboard.gridColumns
    const cellHeight = rect.height / dashboard.gridRows

    let newX = Math.floor((e.clientX - rect.left - dragOffset.x) / cellWidth)
    let newY = Math.floor((e.clientY - rect.top - dragOffset.y) / cellHeight)

    newX = Math.max(0, Math.min(newX, dashboard.gridColumns - initialWidgetState.current.width))
    newY = Math.max(0, Math.min(newY, dashboard.gridRows - initialWidgetState.current.height))

    newX = snapPosition(newX)
    newY = snapPosition(newY)

    updateWidget(draggedWidget, { x: newX, y: newY })
  }, [draggedWidget, dashboard.gridColumns, dashboard.gridRows, dragOffset, snapPosition, updateWidget])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (draggedWidget) {
      saveToHistory(dashboard.widgets)
    }
    setDraggedWidget(null)
    initialWidgetState.current = null
  }, [draggedWidget, dashboard.widgets, saveToHistory])

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, widgetId: string, direction: string) => {
    const widget = dashboard.widgets.find(w => w.id === widgetId)
    if (!widget || widget.isLocked) return

    e.preventDefault()
    e.stopPropagation()
    setResizingWidget(widgetId)
    setResizeDirection(direction)
    setSelectedWidget(widgetId)
    initialDragPos.current = { x: e.clientX, y: e.clientY }
    initialWidgetState.current = { ...widget }
  }, [dashboard.widgets])

  // Handle resize
  const handleResize = useCallback((e: MouseEvent) => {
    if (!resizingWidget || !containerRef.current || !initialWidgetState.current || !resizeDirection) return

    const rect = containerRef.current.getBoundingClientRect()
    const cellWidth = rect.width / dashboard.gridColumns
    const cellHeight = rect.height / dashboard.gridRows

    const deltaX = Math.round((e.clientX - initialDragPos.current.x) / cellWidth)
    const deltaY = Math.round((e.clientY - initialDragPos.current.y) / cellHeight)

    let newWidth = initialWidgetState.current.width
    let newHeight = initialWidgetState.current.height
    let newX = initialWidgetState.current.x
    let newY = initialWidgetState.current.y

    if (resizeDirection.includes("e")) {
      newWidth = Math.max(MIN_WIDGET_SIZE, initialWidgetState.current.width + deltaX)
      newWidth = Math.min(newWidth, dashboard.gridColumns - newX)
    }
    if (resizeDirection.includes("w")) {
      const widthDelta = Math.min(deltaX, initialWidgetState.current.width - MIN_WIDGET_SIZE)
      newX = initialWidgetState.current.x + widthDelta
      newWidth = initialWidgetState.current.width - widthDelta
      newX = Math.max(0, newX)
    }
    if (resizeDirection.includes("s")) {
      newHeight = Math.max(MIN_WIDGET_SIZE, initialWidgetState.current.height + deltaY)
      newHeight = Math.min(newHeight, dashboard.gridRows - newY)
    }
    if (resizeDirection.includes("n")) {
      const heightDelta = Math.min(deltaY, initialWidgetState.current.height - MIN_WIDGET_SIZE)
      newY = initialWidgetState.current.y + heightDelta
      newHeight = initialWidgetState.current.height - heightDelta
      newY = Math.max(0, newY)
    }

    updateWidget(resizingWidget, { x: newX, y: newY, width: newWidth, height: newHeight })
  }, [resizingWidget, resizeDirection, dashboard.gridColumns, dashboard.gridRows, updateWidget])

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    if (resizingWidget) {
      saveToHistory(dashboard.widgets)
    }
    setResizingWidget(null)
    setResizeDirection(null)
    initialWidgetState.current = null
  }, [resizingWidget, dashboard.widgets, saveToHistory])

  // Mouse event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedWidget) handleDrag(e)
      if (resizingWidget) handleResize(e)
    }

    const handleMouseUp = () => {
      handleDragEnd()
      handleResizeEnd()
    }

    if (draggedWidget || resizingWidget) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [draggedWidget, resizingWidget, handleDrag, handleResize, handleDragEnd, handleResizeEnd])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedWidget) {
        deleteWidget(selectedWidget)
      }
      if (e.key === "Escape") {
        setSelectedWidget(null)
        setFullscreenWidget(null)
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault()
          undo()
        }
        if ((e.key === "z" && e.shiftKey) || e.key === "y") {
          e.preventDefault()
          redo()
        }
        if (e.key === "d" && selectedWidget) {
          e.preventDefault()
          duplicateWidget(selectedWidget)
        }
        if (e.key === "s") {
          e.preventDefault()
          onSave?.(dashboard)
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedWidget, deleteWidget, duplicateWidget, undo, redo, onSave, dashboard])

  // Render widget content
  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case "chart":
        return (
          <ChartRenderer
            type={widget.config.chartType || "BAR"}
            data={generateSampleData(widget.config.chartType || "BAR", 6)}
            config={{
              colors: widget.config.colors,
              showLegend: widget.config.showLegend,
              showGrid: widget.config.showGrid,
              showTooltip: widget.config.showTooltip,
              height: 200,
            }}
          />
        )

      case "kpi":
        return (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <span className="text-3xl font-bold">{widget.config.kpiValue || "0"}</span>
            {widget.config.kpiChange !== undefined && (
              <span className={cn(
                "text-sm flex items-center gap-1",
                widget.config.kpiChange >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {widget.config.kpiChange >= 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {Math.abs(widget.config.kpiChange)}%
              </span>
            )}
            {widget.config.kpiTarget && (
              <span className="text-xs text-muted-foreground mt-1">
                {t('target')}: {widget.config.kpiTarget}
              </span>
            )}
          </div>
        )

      case "metric":
        return (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <Activity className="h-8 w-8 text-primary mb-2" />
            <span className="text-2xl font-bold">{widget.config.kpiValue || "0"}</span>
            <span className="text-sm text-muted-foreground">{widget.config.subtitle || t('widgetTypes.metric')}</span>
          </div>
        )

      case "text":
        return (
          <div className="p-4 h-full overflow-auto prose prose-sm dark:prose-invert">
            {widget.config.textContent || t('enterTextContent')}
          </div>
        )

      case "image":
        return widget.config.imageUrl ? (
          <img
            src={widget.config.imageUrl}
            alt={widget.config.title || "Image"}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <ImageIcon className="h-12 w-12" />
          </div>
        )

      case "table":
        return (
          <div className="p-2 text-xs">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1">{t('table.name')}</th>
                  <th className="text-right p-1">{t('table.value')}</th>
                  <th className="text-right p-1">{t('table.change')}</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map(i => (
                  <tr key={i} className="border-b border-muted">
                    <td className="p-1">{t('table.item', { number: i })}</td>
                    <td className="text-right p-1">{Math.floor(Math.random() * 100)}</td>
                    <td className="text-right p-1 text-green-600">+{Math.floor(Math.random() * 20)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      default:
        return <div className="flex items-center justify-center h-full text-muted-foreground">{t('unknownWidgetType')}</div>
    }
  }

  // Render resize handles
  const renderResizeHandles = (widgetId: string) => {
    const directions = ["n", "e", "s", "w", "ne", "nw", "se", "sw"]
    const cursorMap: Record<string, string> = {
      n: "ns-resize", s: "ns-resize",
      e: "ew-resize", w: "ew-resize",
      ne: "nesw-resize", sw: "nesw-resize",
      nw: "nwse-resize", se: "nwse-resize",
    }

    return directions.map(dir => (
      <div
        key={dir}
        className={cn(
          "absolute bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10",
          dir === "n" && "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3",
          dir === "s" && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3",
          dir === "e" && "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3",
          dir === "w" && "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3",
          dir === "ne" && "top-0 right-0 -translate-y-1/2 translate-x-1/2 w-3 h-3",
          dir === "nw" && "top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-3 h-3",
          dir === "se" && "bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-3 h-3",
          dir === "sw" && "bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-3 h-3"
        )}
        style={{ cursor: cursorMap[dir] }}
        onMouseDown={(e) => handleResizeStart(e, widgetId, dir)}
      />
    ))
  }

  const selectedWidgetData = selectedWidget ? dashboard.widgets.find(w => w.id === selectedWidget) : null

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWidgetPalette(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('addWidget')}
          </Button>

          <div className="h-6 w-px bg-border mx-2" />

          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={historyIndex <= 0}
            title={t('undoShortcut')}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title={t('redoShortcut')}
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border mx-2" />

          <Button
            variant={showGridLines ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowGridLines(!showGridLines)}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            {t('grid')}
          </Button>

          <Button
            variant={snapToGrid ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSnapToGrid(!snapToGrid)}
          >
            <Layers className="h-4 w-4 mr-2" />
            {t('snap')}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {t('widgetsCount', { count: dashboard.widgets.length })}
          </Badge>

          <Select value={zoom.toString()} onValueChange={(v) => setZoom(parseInt(v))}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50%</SelectItem>
              <SelectItem value="75">75%</SelectItem>
              <SelectItem value="100">100%</SelectItem>
              <SelectItem value="125">125%</SelectItem>
              <SelectItem value="150">150%</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-border mx-2" />

          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {tCommon('export')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('exportFormat')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExport?.("pdf", dashboard)}>
                <FileText className="h-4 w-4 mr-2" />
                {t('export.pdf')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.("png", dashboard)}>
                <ImageIcon className="h-4 w-4 mr-2" />
                {t('export.png')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.("json", dashboard)}>
                <FileText className="h-4 w-4 mr-2" />
                {t('export.json')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={() => onSave?.(dashboard)}>
            <Save className="h-4 w-4 mr-2" />
            {tCommon('save')}
          </Button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 overflow-auto bg-muted/30 p-4">
        <div
          ref={containerRef}
          className="relative bg-background rounded-lg shadow-sm border mx-auto"
          style={{
            width: `${(100 * zoom) / 100}%`,
            aspectRatio: `${dashboard.gridColumns}/${dashboard.gridRows}`,
            maxWidth: "1200px",
            backgroundImage: showGridLines
              ? `
                linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
              `
              : "none",
            backgroundSize: `${100 / dashboard.gridColumns}% ${100 / dashboard.gridRows}%`,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedWidget(null)
          }}
        >
          {dashboard.widgets.filter(w => w.isVisible).map((widget) => (
            <div
              key={widget.id}
              className={cn(
                "absolute group transition-shadow rounded-lg overflow-hidden",
                selectedWidget === widget.id && "ring-2 ring-primary ring-offset-2",
                draggedWidget === widget.id && "opacity-80 shadow-xl",
                widget.isLocked && "cursor-not-allowed"
              )}
              style={{
                left: `${(widget.x / dashboard.gridColumns) * 100}%`,
                top: `${(widget.y / dashboard.gridRows) * 100}%`,
                width: `${(widget.width / dashboard.gridColumns) * 100}%`,
                height: `${(widget.height / dashboard.gridRows) * 100}%`,
                zIndex: widget.zIndex,
              }}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedWidget(widget.id)
              }}
            >
              <Card className="h-full">
                <CardHeader className="p-2 pb-0 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    {dashboard.isEditing && !widget.isLocked && (
                      <div
                        className="cursor-move opacity-50 hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => handleDragStart(e, widget.id)}
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>
                    )}
                    <CardTitle className="text-sm font-medium truncate">
                      {widget.config.title}
                    </CardTitle>
                    {widget.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </div>

                  {dashboard.isEditing && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedWidget(widget.id)
                          setShowWidgetEditor(true)
                        }}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          {tCommon('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateWidget(widget.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          {t('duplicate')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFullscreenWidget(widget.id)}>
                          <Maximize2 className="h-4 w-4 mr-2" />
                          {t('fullscreen')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateWidget(widget.id, { isLocked: !widget.isLocked })}>
                          {widget.isLocked ? (
                            <>
                              <Unlock className="h-4 w-4 mr-2" />
                              {t('unlock')}
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              {t('lock')}
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateWidget(widget.id, { isVisible: false })}>
                          <EyeOff className="h-4 w-4 mr-2" />
                          {t('hide')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteWidget(widget.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {tCommon('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </CardHeader>
                <CardContent className="p-2 h-[calc(100%-2.5rem)]">
                  {renderWidgetContent(widget)}
                </CardContent>
              </Card>

              {/* Resize handles */}
              {dashboard.isEditing && selectedWidget === widget.id && !widget.isLocked && (
                renderResizeHandles(widget.id)
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Widget Palette Dialog */}
      <Dialog open={showWidgetPalette} onOpenChange={setShowWidgetPalette}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('addWidget')}</DialogTitle>
            <DialogDescription>
              {t('chooseWidgetType')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 py-4">
            {([
              { type: "chart" as WidgetType, labelKey: "widgetTypes.chart", descKey: "widgetDescriptions.chart" },
              { type: "kpi" as WidgetType, labelKey: "widgetTypes.kpiCard", descKey: "widgetDescriptions.kpi" },
              { type: "metric" as WidgetType, labelKey: "widgetTypes.metric", descKey: "widgetDescriptions.metric" },
              { type: "table" as WidgetType, labelKey: "widgetTypes.table", descKey: "widgetDescriptions.table" },
              { type: "text" as WidgetType, labelKey: "widgetTypes.text", descKey: "widgetDescriptions.text" },
              { type: "image" as WidgetType, labelKey: "widgetTypes.image", descKey: "widgetDescriptions.image" },
            ]).map((item) => (
              <button
                key={item.type}
                className="flex flex-col items-center p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors"
                onClick={() => addWidget(item.type)}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  {widgetTypeIcons[item.type]}
                </div>
                <span className="font-medium text-sm">{t(item.labelKey)}</span>
                <span className="text-xs text-muted-foreground text-center mt-1">{t(item.descKey)}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Widget Editor Dialog */}
      <Dialog open={showWidgetEditor} onOpenChange={setShowWidgetEditor}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('editWidget')}</DialogTitle>
          </DialogHeader>

          {selectedWidgetData && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
                <TabsTrigger value="data">{t('tabs.data')}</TabsTrigger>
                <TabsTrigger value="style">{t('tabs.style')}</TabsTrigger>
                <TabsTrigger value="advanced">{t('tabs.advanced')}</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t('fields.title')}</Label>
                  <Input
                    value={selectedWidgetData.config.title || ""}
                    onChange={(e) => updateWidget(selectedWidgetData.id, {
                      config: { ...selectedWidgetData.config, title: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('fields.subtitle')}</Label>
                  <Input
                    value={selectedWidgetData.config.subtitle || ""}
                    onChange={(e) => updateWidget(selectedWidgetData.id, {
                      config: { ...selectedWidgetData.config, subtitle: e.target.value }
                    })}
                  />
                </div>
                {selectedWidgetData.type === "chart" && (
                  <div className="space-y-2">
                    <Label>{t('fields.chartType')}</Label>
                    <Select
                      value={selectedWidgetData.config.chartType}
                      onValueChange={(v) => updateWidget(selectedWidgetData.id, {
                        config: { ...selectedWidgetData.config, chartType: v as ChartType }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BAR">{t('chartTypes.bar')}</SelectItem>
                        <SelectItem value="LINE">{t('chartTypes.line')}</SelectItem>
                        <SelectItem value="AREA">{t('chartTypes.area')}</SelectItem>
                        <SelectItem value="PIE">{t('chartTypes.pie')}</SelectItem>
                        <SelectItem value="DONUT">{t('chartTypes.donut')}</SelectItem>
                        <SelectItem value="RADAR">{t('chartTypes.radar')}</SelectItem>
                        <SelectItem value="SCATTER">{t('chartTypes.scatter')}</SelectItem>
                        <SelectItem value="FUNNEL">{t('chartTypes.funnel')}</SelectItem>
                        <SelectItem value="TREEMAP">{t('chartTypes.treemap')}</SelectItem>
                        <SelectItem value="HEATMAP">{t('chartTypes.heatmap')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {selectedWidgetData.type === "text" && (
                  <div className="space-y-2">
                    <Label>{t('fields.content')}</Label>
                    <Textarea
                      value={selectedWidgetData.config.textContent || ""}
                      onChange={(e) => updateWidget(selectedWidgetData.id, {
                        config: { ...selectedWidgetData.config, textContent: e.target.value }
                      })}
                      rows={4}
                    />
                  </div>
                )}
                {(selectedWidgetData.type === "kpi" || selectedWidgetData.type === "metric") && (
                  <>
                    <div className="space-y-2">
                      <Label>{t('fields.value')}</Label>
                      <Input
                        value={selectedWidgetData.config.kpiValue?.toString() || ""}
                        onChange={(e) => updateWidget(selectedWidgetData.id, {
                          config: { ...selectedWidgetData.config, kpiValue: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('fields.changePercent')}</Label>
                      <Input
                        type="number"
                        value={selectedWidgetData.config.kpiChange?.toString() || ""}
                        onChange={(e) => updateWidget(selectedWidgetData.id, {
                          config: { ...selectedWidgetData.config, kpiChange: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('fields.target')}</Label>
                      <Input
                        type="number"
                        value={selectedWidgetData.config.kpiTarget?.toString() || ""}
                        onChange={(e) => updateWidget(selectedWidgetData.id, {
                          config: { ...selectedWidgetData.config, kpiTarget: parseFloat(e.target.value) || undefined }
                        })}
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="data" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t('fields.dataSource')}</Label>
                  <Select
                    value={selectedWidgetData.config.dataSource || "sample"}
                    onValueChange={(v) => updateWidget(selectedWidgetData.id, {
                      config: { ...selectedWidgetData.config, dataSource: v }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sample">{t('dataSources.sample')}</SelectItem>
                      <SelectItem value="api">{t('dataSources.api')}</SelectItem>
                      <SelectItem value="crosstab">{t('dataSources.crosstab')}</SelectItem>
                      <SelectItem value="custom">{t('dataSources.custom')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('fields.refreshInterval')}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={selectedWidgetData.config.refreshInterval?.toString() || "0"}
                    onChange={(e) => updateWidget(selectedWidgetData.id, {
                      config: { ...selectedWidgetData.config, refreshInterval: parseInt(e.target.value) || 0 }
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{t('refreshIntervalHint')}</p>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4 py-4">
                {selectedWidgetData.type === "chart" && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label>{t('style.showLegend')}</Label>
                      <Switch
                        checked={selectedWidgetData.config.showLegend}
                        onCheckedChange={(v) => updateWidget(selectedWidgetData.id, {
                          config: { ...selectedWidgetData.config, showLegend: v }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t('style.showGrid')}</Label>
                      <Switch
                        checked={selectedWidgetData.config.showGrid}
                        onCheckedChange={(v) => updateWidget(selectedWidgetData.id, {
                          config: { ...selectedWidgetData.config, showGrid: v }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t('style.showTooltip')}</Label>
                      <Switch
                        checked={selectedWidgetData.config.showTooltip}
                        onCheckedChange={(v) => updateWidget(selectedWidgetData.id, {
                          config: { ...selectedWidgetData.config, showTooltip: v }
                        })}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label>{t('style.backgroundColor')}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={selectedWidgetData.config.backgroundColor || "#ffffff"}
                      onChange={(e) => updateWidget(selectedWidgetData.id, {
                        config: { ...selectedWidgetData.config, backgroundColor: e.target.value }
                      })}
                      className="w-12 h-8 p-0 border-0"
                    />
                    <Input
                      value={selectedWidgetData.config.backgroundColor || "transparent"}
                      onChange={(e) => updateWidget(selectedWidgetData.id, {
                        config: { ...selectedWidgetData.config, backgroundColor: e.target.value }
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('advanced.lockWidget')}</Label>
                    <p className="text-xs text-muted-foreground">{t('advanced.lockWidgetHint')}</p>
                  </div>
                  <Switch
                    checked={selectedWidgetData.isLocked}
                    onCheckedChange={(v) => updateWidget(selectedWidgetData.id, { isLocked: v })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('advanced.zIndex')}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={selectedWidgetData.zIndex}
                    onChange={(e) => updateWidget(selectedWidgetData.id, {
                      zIndex: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWidgetEditor(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={() => {
              saveToHistory(dashboard.widgets)
              setShowWidgetEditor(false)
            }}>
              {tCommon('saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dashboard Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dashboardSettings')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('settings.dashboardName')}</Label>
              <Input
                value={dashboard.name}
                onChange={(e) => setDashboard(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{tCommon('description')}</Label>
              <Textarea
                value={dashboard.description}
                onChange={(e) => setDashboard(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('settings.gridColumns')}</Label>
                <Select
                  value={dashboard.gridColumns.toString()}
                  onValueChange={(v) => setDashboard(prev => ({ ...prev, gridColumns: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="16">16</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('settings.gridRows')}</Label>
                <Select
                  value={dashboard.gridRows.toString()}
                  onValueChange={(v) => setDashboard(prev => ({ ...prev, gridRows: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              {tCommon('cancel')}
            </Button>
            <Button onClick={() => setShowSettings(false)}>
              {t('saveSettings')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Widget Modal */}
      <Dialog open={!!fullscreenWidget} onOpenChange={() => setFullscreenWidget(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          {fullscreenWidget && (() => {
            const widget = dashboard.widgets.find(w => w.id === fullscreenWidget)
            if (!widget) return null
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{widget.config.title}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 min-h-0 py-4">
                  {renderWidgetContent(widget)}
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
