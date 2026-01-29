"use client"

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportManager, ExportData } from "@/components/export/export-manager"
import { cn } from "@/lib/utils"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings2,
  TrendingUp,
  TrendingDown,
  Download,
  Copy,
  Palette,
  Eye,
  Edit2,
  Plus,
  X,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  BarChart3,
  PieChart,
  LineChart,
  Calculator,
  Target,
  Search,
  ZoomIn,
} from "lucide-react"

// Data types
export interface CrosstabRow {
  id: string
  metric: string
  category?: string
  values: Record<string, number | null>
  isCalculated?: boolean
  formula?: string
  isExpanded?: boolean
  children?: CrosstabRow[]
  metadata?: {
    description?: string
    source?: string
    lastUpdated?: string
  }
}

export interface CrosstabColumn {
  id: string
  key: string
  label: string
  category?: string
  isTotal?: boolean
  isHidden?: boolean
  width?: number
  color?: string
}

export interface CellSelection {
  rowId: string
  columnKey: string
}

export interface ConditionalFormat {
  id: string
  name: string
  condition: "greater" | "less" | "equal" | "between" | "top" | "bottom"
  value: number
  value2?: number
  backgroundColor?: string
  textColor?: string
  icon?: "arrow-up" | "arrow-down" | "circle" | "star" | "flag"
  enabled: boolean
}

export interface CrosstabConfig {
  viewMode: "percentage" | "index" | "difference" | "raw"
  baseColumn: string
  showStatistics: boolean
  showSparklines: boolean
  showConditionalFormatting: boolean
  showSignificance: boolean
  significanceLevel: number
  decimalPlaces: number
  transposeGrid: boolean
  groupByCategory: boolean
  showTotals: boolean
  showRowNumbers: boolean
  freezeFirstColumn: boolean
  highlightOnHover: boolean
  editMode: boolean
}

interface AdvancedCrosstabGridProps {
  columns: CrosstabColumn[]
  data: CrosstabRow[]
  title?: string
  description?: string
  config?: Partial<CrosstabConfig>
  conditionalFormats?: ConditionalFormat[]
  onCellClick?: (cell: CellSelection, value: number | null) => void
  onCellEdit?: (cell: CellSelection, newValue: number) => void
  onDrillDown?: (cell: CellSelection, row: CrosstabRow) => void
  onExport?: (format: string) => void
  onConfigChange?: (config: CrosstabConfig) => void
  className?: string
}

const DEFAULT_CONFIG: CrosstabConfig = {
  viewMode: "percentage",
  baseColumn: "",
  showStatistics: true,
  showSparklines: true,
  showConditionalFormatting: true,
  showSignificance: true,
  significanceLevel: 0.05,
  decimalPlaces: 1,
  transposeGrid: false,
  groupByCategory: false,
  showTotals: true,
  showRowNumbers: false,
  freezeFirstColumn: true,
  highlightOnHover: true,
  editMode: false,
}

const DEFAULT_FORMATS: ConditionalFormat[] = [
  {
    id: "high",
    name: "High Values",
    condition: "greater",
    value: 70,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    textColor: "#16a34a",
    icon: "arrow-up",
    enabled: true,
  },
  {
    id: "low",
    name: "Low Values",
    condition: "less",
    value: 30,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    textColor: "#dc2626",
    icon: "arrow-down",
    enabled: true,
  },
]

export function AdvancedCrosstabGrid({
  columns: initialColumns,
  data: initialData,
  title,
  description,
  config: initialConfig,
  conditionalFormats: initialFormats,
  onCellClick,
  onCellEdit,
  onDrillDown,
  onConfigChange,
  className,
}: AdvancedCrosstabGridProps) {
  const t = useTranslations("dashboard.crosstabs.components.grid")
  const [columns, _setColumns] = useState(initialColumns)
  const [data, setData] = useState(initialData)
  const [config, setConfig] = useState<CrosstabConfig>({ ...DEFAULT_CONFIG, ...initialConfig })
  const [conditionalFormats, setConditionalFormats] = useState(initialFormats || DEFAULT_FORMATS)
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: "asc" | "desc" } | null>(null)
  const [selectedCells, setSelectedCells] = useState<CellSelection[]>([])
  const [hoveredCell, setHoveredCell] = useState<CellSelection | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<CellSelection | null>(null)
  const [editValue, setEditValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(initialColumns.filter(c => !c.isHidden).map(c => c.key)))
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showFormatDialog, setShowFormatDialog] = useState(false)
  const [showDrillDownModal, setShowDrillDownModal] = useState(false)
  const [drillDownData, setDrillDownData] = useState<{ cell: CellSelection; row: CrosstabRow } | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [columnWidths, _setColumnWidths] = useState<Record<string, number>>({})

  const tableRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update config and notify parent
  const updateConfig = useCallback((updates: Partial<CrosstabConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates }
      onConfigChange?.(newConfig)
      return newConfig
    })
  }, [onConfigChange])

  // Calculate statistics for each metric
  const statistics = useMemo(() => {
    const stats: Record<string, { mean: number; stdDev: number; min: number; max: number; sum: number; count: number }> = {}

    for (const row of data) {
      const values = Object.values(row.values).filter((v): v is number => v !== null)
      if (values.length === 0) continue

      const sum = values.reduce((a, b) => a + b, 0)
      const mean = sum / values.length
      const stdDev = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length)

      stats[row.id] = {
        mean,
        stdDev,
        min: Math.min(...values),
        max: Math.max(...values),
        sum,
        count: values.length,
      }
    }

    return stats
  }, [data])

  // Filter data by search
  const filteredData = useMemo(() => {
    if (!searchQuery) return data
    const query = searchQuery.toLowerCase()
    return data.filter(row =>
      row.metric.toLowerCase().includes(query) ||
      row.category?.toLowerCase().includes(query)
    )
  }, [data, searchQuery])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      if (sortConfig.column === "metric") {
        return sortConfig.direction === "asc"
          ? a.metric.localeCompare(b.metric)
          : b.metric.localeCompare(a.metric)
      }

      const aVal = a.values[sortConfig.column] ?? -Infinity
      const bVal = b.values[sortConfig.column] ?? -Infinity
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal
    })
  }, [filteredData, sortConfig])

  // Group data by category if enabled
  const groupedData = useMemo(() => {
    if (!config.groupByCategory) return { "": sortedData }

    const groups: Record<string, CrosstabRow[]> = {}
    for (const row of sortedData) {
      const category = row.category || "Uncategorized"
      if (!groups[category]) groups[category] = []
      groups[category].push(row)
    }
    return groups
  }, [sortedData, config.groupByCategory])

  // Get visible columns
  const visibleColumnsList = useMemo(() =>
    columns.filter(c => visibleColumns.has(c.key)),
    [columns, visibleColumns]
  )

  // Handle sort
  const handleSort = useCallback((columnKey: string) => {
    setSortConfig(prev => {
      if (prev?.column === columnKey) {
        if (prev.direction === "asc") return { column: columnKey, direction: "desc" }
        return null
      }
      return { column: columnKey, direction: "asc" }
    })
  }, [])

  // Get display value based on view mode
  const getDisplayValue = useCallback((value: number | null, rowId: string): string => {
    if (value === null) return "-"

    const baseCol = config.baseColumn || columns[0]?.key
    const baseValue = data.find(r => r.id === rowId)?.values[baseCol] ?? 0

    switch (config.viewMode) {
      case "index":
        if (!baseValue) return "-"
        return Math.round((value / baseValue) * 100).toString()
      case "difference":
        const diff = value - (baseValue || 0)
        return diff > 0 ? `+${diff.toFixed(config.decimalPlaces)}` : diff.toFixed(config.decimalPlaces)
      case "raw":
        return value.toLocaleString()
      default:
        return `${value.toFixed(config.decimalPlaces)}%`
    }
  }, [config.viewMode, config.baseColumn, config.decimalPlaces, columns, data])

  // Get cell styling based on conditional formatting
  const getCellStyle = useCallback((value: number | null, rowId: string): React.CSSProperties => {
    if (value === null || !config.showConditionalFormatting) return {}

    for (const format of conditionalFormats.filter(f => f.enabled)) {
      let matches = false

      switch (format.condition) {
        case "greater":
          matches = value > format.value
          break
        case "less":
          matches = value < format.value
          break
        case "equal":
          matches = value === format.value
          break
        case "between":
          matches = value >= format.value && value <= (format.value2 || format.value)
          break
        case "top":
          const stats = statistics[rowId]
          matches = stats && value >= stats.max - (stats.max - stats.min) * (format.value / 100)
          break
        case "bottom":
          const statsBottom = statistics[rowId]
          matches = statsBottom && value <= statsBottom.min + (statsBottom.max - statsBottom.min) * (format.value / 100)
          break
      }

      if (matches) {
        return {
          backgroundColor: format.backgroundColor,
          color: format.textColor,
        }
      }
    }

    return {}
  }, [config.showConditionalFormatting, conditionalFormats, statistics])

  // Check if value is statistically significant
  const isSignificant = useCallback((value: number | null, rowId: string): boolean => {
    if (value === null || !config.showSignificance) return false
    const stats = statistics[rowId]
    if (!stats || stats.stdDev === 0) return false
    const zScore = Math.abs(value - stats.mean) / stats.stdDev
    return zScore > 1.96 // ~95% confidence
  }, [config.showSignificance, statistics])

  // Handle cell click
  const handleCellClick = useCallback((cell: CellSelection, value: number | null, e: React.MouseEvent) => {
    if (config.editMode && value !== null) {
      setEditingCell(cell)
      setEditValue(value.toString())
      setTimeout(() => inputRef.current?.select(), 0)
    } else if (e.ctrlKey || e.metaKey) {
      setSelectedCells(prev => {
        const exists = prev.some(c => c.rowId === cell.rowId && c.columnKey === cell.columnKey)
        if (exists) {
          return prev.filter(c => !(c.rowId === cell.rowId && c.columnKey === cell.columnKey))
        }
        return [...prev, cell]
      })
    } else {
      setSelectedCells([cell])
    }
    onCellClick?.(cell, value)
  }, [config.editMode, onCellClick])

  // Handle cell edit
  const handleCellEdit = useCallback(() => {
    if (!editingCell) return

    const newValue = parseFloat(editValue)
    if (isNaN(newValue)) {
      setEditingCell(null)
      return
    }

    setData(prev => prev.map(row => {
      if (row.id === editingCell.rowId) {
        return {
          ...row,
          values: { ...row.values, [editingCell.columnKey]: newValue },
        }
      }
      return row
    }))

    onCellEdit?.(editingCell, newValue)
    setEditingCell(null)
  }, [editingCell, editValue, onCellEdit])

  // Handle drill down
  const handleDrillDown = useCallback((cell: CellSelection, row: CrosstabRow) => {
    setDrillDownData({ cell, row })
    setShowDrillDownModal(true)
    onDrillDown?.(cell, row)
  }, [onDrillDown])

  // Toggle row expansion
  const toggleRowExpansion = useCallback((rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        newSet.delete(rowId)
      } else {
        newSet.add(rowId)
      }
      return newSet
    })
  }, [])

  // Copy selected cells to clipboard
  const copyToClipboard = useCallback(async () => {
    if (selectedCells.length === 0) return

    const values = selectedCells.map(cell => {
      const row = data.find(r => r.id === cell.rowId)
      return row?.values[cell.columnKey]?.toString() || ""
    })

    await navigator.clipboard.writeText(values.join("\t"))
  }, [selectedCells, data])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditingCell(null)
        setSelectedCells([])
      }
      if (e.key === "Enter" && editingCell) {
        handleCellEdit()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedCells.length > 0) {
        copyToClipboard()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [editingCell, selectedCells, handleCellEdit, copyToClipboard])

  // Sparkline component
  const Sparkline = ({ values, max }: { values: (number | null)[]; max: number }) => {
    const validValues = values.filter((v): v is number => v !== null)
    if (validValues.length === 0) return null

    return (
      <div className="flex items-end gap-0.5 h-4 w-16">
        {validValues.map((v, i) => (
          <div
            key={i}
            className="flex-1 bg-primary/60 rounded-t-sm transition-all"
            style={{ height: `${(v / max) * 100}%`, minHeight: "2px" }}
          />
        ))}
      </div>
    )
  }

  // Export data
  const exportData: ExportData = {
    type: "crosstab",
    title: title || "Crosstab Export",
    data: sortedData.map(row => {
      const rowData: Record<string, any> = { metric: row.metric }
      for (const col of visibleColumnsList) {
        rowData[col.key] = row.values[col.key]
      }
      return rowData
    }),
    columns: [
      { key: "metric", label: "Metric", type: "string" },
      ...visibleColumnsList.map(c => ({ key: c.key, label: c.label, type: "number" })),
    ],
    metadata: {
      description,
      filters: { viewMode: config.viewMode, baseColumn: config.baseColumn },
    },
  }

  // Render cell content
  const renderCell = (row: CrosstabRow, col: CrosstabColumn) => {
    const value = row.values[col.key]
    const isEditing = editingCell?.rowId === row.id && editingCell?.columnKey === col.key
    const isSelected = selectedCells.some(c => c.rowId === row.id && c.columnKey === col.key)
    const isHovered = hoveredCell?.rowId === row.id && hoveredCell?.columnKey === col.key
    const cellStyle = getCellStyle(value, row.id)
    const significant = isSignificant(value, row.id)
    const stats = statistics[row.id]

    return (
      <ContextMenu key={`${row.id}-${col.key}`}>
        <ContextMenuTrigger asChild>
          <TableCell
            className={cn(
              "text-center font-mono text-sm cursor-pointer transition-all relative",
              isSelected && "ring-2 ring-primary ring-inset",
              isHovered && config.highlightOnHover && "bg-muted/50",
              hoveredRow === row.id && config.highlightOnHover && "bg-muted/30",
              hoveredColumn === col.key && config.highlightOnHover && "bg-muted/20",
              col.key === config.baseColumn && config.viewMode !== "percentage" && "bg-primary/5"
            )}
            style={{ ...cellStyle, width: columnWidths[col.key] }}
            onClick={(e) => handleCellClick({ rowId: row.id, columnKey: col.key }, value, e)}
            onMouseEnter={() => {
              setHoveredCell({ rowId: row.id, columnKey: col.key })
              setHoveredRow(row.id)
              setHoveredColumn(col.key)
            }}
            onMouseLeave={() => {
              setHoveredCell(null)
              setHoveredRow(null)
              setHoveredColumn(null)
            }}
            onDoubleClick={() => handleDrillDown({ rowId: row.id, columnKey: col.key }, row)}
          >
            {isEditing ? (
              <Input
                ref={inputRef}
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleCellEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCellEdit()
                  if (e.key === "Escape") setEditingCell(null)
                }}
                className="w-16 h-6 text-center text-xs p-0"
                autoFocus
              />
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1">
                      {getDisplayValue(value, row.id)}
                      {significant && <span className="text-primary">*</span>}
                      {stats && value === stats.max && <TrendingUp className="h-3 w-3 text-green-500" />}
                      {stats && value === stats.min && <TrendingDown className="h-3 w-3 text-red-500" />}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-1 text-xs">
                      <p className="font-medium">{col.label}</p>
                      <p>{row.metric}: {value !== null ? `${value}%` : "N/A"}</p>
                      {stats && typeof stats.mean === 'number' && (
                        <>
                          <Separator className="my-1" />
                          <p>{t("tooltip.mean")}: {stats.mean.toFixed(1)}%</p>
                          <p>{t("tooltip.range")}: {typeof stats.min === 'number' ? stats.min.toFixed(1) : 'N/A'} - {typeof stats.max === 'number' ? stats.max.toFixed(1) : 'N/A'}%</p>
                          {significant && <p className="text-green-600">{t("tooltip.statisticallySignificant")}</p>}
                        </>
                      )}
                      <p className="text-muted-foreground pt-1">{t("tooltip.doubleclickToDrillDown")}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </TableCell>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => handleDrillDown({ rowId: row.id, columnKey: col.key }, row)}>
            <ZoomIn className="h-4 w-4 mr-2" />
            {t("contextMenu.drillDown")}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => {
            setEditingCell({ rowId: row.id, columnKey: col.key })
            setEditValue(value?.toString() || "")
          }}>
            <Edit2 className="h-4 w-4 mr-2" />
            {t("contextMenu.editValue")}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            {t("contextMenu.copy")}
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <BarChart3 className="h-4 w-4 mr-2" />
              {t("contextMenu.visualize")}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>
                <BarChart3 className="h-4 w-4 mr-2" />
                {t("contextMenu.barChart")}
              </ContextMenuItem>
              <ContextMenuItem>
                <LineChart className="h-4 w-4 mr-2" />
                {t("contextMenu.lineChart")}
              </ContextMenuItem>
              <ContextMenuItem>
                <PieChart className="h-4 w-4 mr-2" />
                {t("contextMenu.pieChart")}
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => updateConfig({ baseColumn: col.key })}>
            <Target className="h-4 w-4 mr-2" />
            {t("contextMenu.setAsBase")}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  return (
    <Card className={cn("flex flex-col", isFullscreen && "fixed inset-4 z-50", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title || t("title")}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 w-48"
              />
            </div>

            {/* View Mode */}
            <Select
              value={config.viewMode}
              onValueChange={(v) => updateConfig({ viewMode: v as any })}
            >
              <SelectTrigger className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">{t("viewMode.percentage")}</SelectItem>
                <SelectItem value="index">{t("viewMode.index")}</SelectItem>
                <SelectItem value="difference">{t("viewMode.difference")}</SelectItem>
                <SelectItem value="raw">{t("viewMode.raw")}</SelectItem>
              </SelectContent>
            </Select>

            {/* Base Column (for Index/Difference modes) */}
            {config.viewMode !== "percentage" && config.viewMode !== "raw" && (
              <Select
                value={config.baseColumn || columns[0]?.key}
                onValueChange={(v) => updateConfig({ baseColumn: v })}
              >
                <SelectTrigger className="h-8 w-40">
                  <SelectValue placeholder={t("baseColumn")} />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col.key} value={col.key}>{col.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Column Visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  {t("columns")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t("visibleColumns")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-64">
                  {columns.map(col => (
                    <DropdownMenuCheckboxItem
                      key={col.key}
                      checked={visibleColumns.has(col.key)}
                      onCheckedChange={(checked) => {
                        const newSet = new Set(visibleColumns)
                        if (checked) newSet.add(col.key)
                        else newSet.delete(col.key)
                        setVisibleColumns(newSet)
                      }}
                    >
                      {col.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings */}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setShowSettingsDialog(true)}>
              <Settings2 className="h-4 w-4" />
            </Button>

            {/* Conditional Formatting */}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setShowFormatDialog(true)}>
              <Palette className="h-4 w-4" />
            </Button>

            {/* Edit Mode Toggle */}
            <Button
              variant={config.editMode ? "secondary" : "outline"}
              size="sm"
              onClick={() => updateConfig({ editMode: !config.editMode })}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {t("edit")}
            </Button>

            {/* Export */}
            <ExportManager data={exportData} />

            {/* Fullscreen */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Info badges */}
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {t("badges.metricsAudiences", { metrics: sortedData.length, audiences: visibleColumnsList.length })}
          </Badge>
          {selectedCells.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {t("badges.selected", { count: selectedCells.length })}
            </Badge>
          )}
          {config.viewMode !== "percentage" && (
            <Badge variant="secondary" className="text-xs">
              {t("badges.base", { name: columns.find(c => c.key === config.baseColumn)?.label || columns[0]?.label })}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full" ref={tableRef}>
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {config.showRowNumbers && (
                    <TableHead className="w-10 text-center">#</TableHead>
                  )}
                  <TableHead
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors",
                      config.freezeFirstColumn && "sticky left-0 bg-background z-10"
                    )}
                    onClick={() => handleSort("metric")}
                  >
                    <div className="flex items-center gap-2">
                      {t("table.metric")}
                      {sortConfig?.column === "metric" ? (
                        sortConfig.direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableHead>
                  {config.showSparklines && (
                    <TableHead className="text-center w-20">{t("table.trend")}</TableHead>
                  )}
                  {visibleColumnsList.map(col => (
                    <TableHead
                      key={col.key}
                      className={cn(
                        "text-center cursor-pointer hover:bg-muted/50 transition-colors",
                        hoveredColumn === col.key && config.highlightOnHover && "bg-muted/30",
                        col.key === config.baseColumn && config.viewMode !== "percentage" && "bg-primary/10"
                      )}
                      style={{ width: columnWidths[col.key], minWidth: 80 }}
                      onClick={() => handleSort(col.key)}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="truncate max-w-24">{col.label}</span>
                        {sortConfig?.column === col.key ? (
                          sortConfig.direction === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                  {config.showStatistics && (
                    <>
                      <TableHead className="text-center w-16 bg-muted/30">{t("table.avg")}</TableHead>
                      <TableHead className="text-center w-16 bg-muted/30">{t("table.min")}</TableHead>
                      <TableHead className="text-center w-16 bg-muted/30">{t("table.max")}</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedData).map(([category, rows]) => (
                  <React.Fragment key={category || 'default'}>
                    {config.groupByCategory && category && (
                      <TableRow key={`category-${category}`} className="bg-muted/50">
                        <TableCell
                          colSpan={visibleColumnsList.length + (config.showRowNumbers ? 1 : 0) + (config.showSparklines ? 1 : 0) + (config.showStatistics ? 3 : 0) + 1}
                          className="font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <ChevronDown className="h-4 w-4" />
                            {category}
                            <Badge variant="secondary" className="text-xs">{rows.length}</Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {rows.map((row, index) => {
                      const stats = statistics[row.id]
                      const rowValues = visibleColumnsList.map(c => row.values[c.key])
                      const maxValue = Math.max(...rowValues.filter((v): v is number => v !== null))

                      return (
                        <TableRow
                          key={row.id}
                          className={cn(
                            "transition-colors",
                            hoveredRow === row.id && config.highlightOnHover && "bg-muted/30",
                            row.isCalculated && "bg-blue-50/50 dark:bg-blue-950/20"
                          )}
                        >
                          {config.showRowNumbers && (
                            <TableCell className="text-center text-muted-foreground text-xs">{index + 1}</TableCell>
                          )}
                          <TableCell
                            className={cn(
                              "font-medium",
                              config.freezeFirstColumn && "sticky left-0 bg-background z-10"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {row.children && row.children.length > 0 && (
                                <button onClick={() => toggleRowExpansion(row.id)}>
                                  {expandedRows.has(row.id) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                              <span className="truncate max-w-48">{row.metric}</span>
                              {row.isCalculated && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Calculator className="h-3 w-3 text-blue-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {t("calculatedField")}: {row.formula}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          {config.showSparklines && (
                            <TableCell className="text-center">
                              <Sparkline values={rowValues} max={maxValue} />
                            </TableCell>
                          )}
                          {visibleColumnsList.map(col => renderCell(row, col))}
                          {config.showStatistics && stats && (
                            <>
                              <TableCell className="text-center font-mono text-xs bg-muted/20">
                                {typeof stats.mean === 'number' ? stats.mean.toFixed(config.decimalPlaces) : 'N/A'}%
                              </TableCell>
                              <TableCell className="text-center font-mono text-xs bg-muted/20 text-red-600">
                                {typeof stats.min === 'number' ? stats.min.toFixed(config.decimalPlaces) : 'N/A'}%
                              </TableCell>
                              <TableCell className="text-center font-mono text-xs bg-muted/20 text-green-600">
                                {typeof stats.max === 'number' ? stats.max.toFixed(config.decimalPlaces) : 'N/A'}%
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      )
                    })}
                  </React.Fragment>
                ))}

                {/* Totals Row */}
                {config.showTotals && (
                  <TableRow className="bg-muted/50 font-medium">
                    {config.showRowNumbers && <TableCell />}
                    <TableCell className={cn(config.freezeFirstColumn && "sticky left-0 bg-muted/50 z-10")}>
                      {t("table.totalAverage")}
                    </TableCell>
                    {config.showSparklines && <TableCell />}
                    {visibleColumnsList.map(col => {
                      const values = sortedData.map(r => r.values[col.key]).filter((v): v is number => v !== null)
                      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
                      return (
                        <TableCell key={col.key} className="text-center font-mono">
                          {avg.toFixed(config.decimalPlaces)}%
                        </TableCell>
                      )
                    })}
                    {config.showStatistics && <TableCell colSpan={3} />}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>

      {/* Legend */}
      <div className="px-4 py-2 border-t text-xs text-muted-foreground flex items-center gap-4">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-green-500" />
          {t("legend.highestInRow")}
        </span>
        <span className="flex items-center gap-1">
          <TrendingDown className="h-3 w-3 text-red-500" />
          {t("legend.lowestInRow")}
        </span>
        {config.showSignificance && (
          <span>* {t("legend.significant")}</span>
        )}
        <span className="ml-auto">{t("legend.drillDownHint")} {t("legend.multiSelectHint")}</span>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("settings")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>{t("settingsOptions.showStatistics")}</Label>
              <Switch
                checked={config.showStatistics}
                onCheckedChange={(v) => updateConfig({ showStatistics: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("settingsOptions.showSparklines")}</Label>
              <Switch
                checked={config.showSparklines}
                onCheckedChange={(v) => updateConfig({ showSparklines: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("settingsOptions.showSignificance")}</Label>
              <Switch
                checked={config.showSignificance}
                onCheckedChange={(v) => updateConfig({ showSignificance: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("settingsOptions.showTotals")}</Label>
              <Switch
                checked={config.showTotals}
                onCheckedChange={(v) => updateConfig({ showTotals: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("settingsOptions.showRowNumbers")}</Label>
              <Switch
                checked={config.showRowNumbers}
                onCheckedChange={(v) => updateConfig({ showRowNumbers: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("settingsOptions.freezeFirstColumn")}</Label>
              <Switch
                checked={config.freezeFirstColumn}
                onCheckedChange={(v) => updateConfig({ freezeFirstColumn: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("settingsOptions.highlightOnHover")}</Label>
              <Switch
                checked={config.highlightOnHover}
                onCheckedChange={(v) => updateConfig({ highlightOnHover: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("settingsOptions.groupByCategory")}</Label>
              <Switch
                checked={config.groupByCategory}
                onCheckedChange={(v) => updateConfig({ groupByCategory: v })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("settingsOptions.decimalPlaces")}</Label>
              <Select
                value={config.decimalPlaces.toString()}
                onValueChange={(v) => updateConfig({ decimalPlaces: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSettingsDialog(false)}>{t("done")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conditional Formatting Dialog */}
      <Dialog open={showFormatDialog} onOpenChange={setShowFormatDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("conditionalFormatting.title")}</DialogTitle>
            <DialogDescription>{t("conditionalFormatting.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {conditionalFormats.map((format, index) => (
              <Card key={format.id} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <Input
                    value={format.name}
                    onChange={(e) => {
                      const newFormats = [...conditionalFormats]
                      newFormats[index] = { ...format, name: e.target.value }
                      setConditionalFormats(newFormats)
                    }}
                    className="h-7 w-40"
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={format.enabled}
                      onCheckedChange={(v) => {
                        const newFormats = [...conditionalFormats]
                        newFormats[index] = { ...format, enabled: v }
                        setConditionalFormats(newFormats)
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setConditionalFormats(conditionalFormats.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={format.condition}
                    onValueChange={(v) => {
                      const newFormats = [...conditionalFormats]
                      newFormats[index] = { ...format, condition: v as any }
                      setConditionalFormats(newFormats)
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greater">{t("conditionalFormatting.conditions.greaterThan")}</SelectItem>
                      <SelectItem value="less">{t("conditionalFormatting.conditions.lessThan")}</SelectItem>
                      <SelectItem value="equal">{t("conditionalFormatting.conditions.equalTo")}</SelectItem>
                      <SelectItem value="between">{t("conditionalFormatting.conditions.between")}</SelectItem>
                      <SelectItem value="top">{t("conditionalFormatting.conditions.topPercent")}</SelectItem>
                      <SelectItem value="bottom">{t("conditionalFormatting.conditions.bottomPercent")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={format.value}
                    onChange={(e) => {
                      const newFormats = [...conditionalFormats]
                      newFormats[index] = { ...format, value: parseFloat(e.target.value) || 0 }
                      setConditionalFormats(newFormats)
                    }}
                    className="h-8"
                  />
                  <div className="flex gap-1">
                    <Input
                      type="color"
                      value={format.backgroundColor || "#ffffff"}
                      onChange={(e) => {
                        const newFormats = [...conditionalFormats]
                        newFormats[index] = { ...format, backgroundColor: e.target.value + "26" }
                        setConditionalFormats(newFormats)
                      }}
                      className="w-8 h-8 p-0 border-0"
                      title={t("conditionalFormatting.background")}
                    />
                    <Input
                      type="color"
                      value={format.textColor || "#000000"}
                      onChange={(e) => {
                        const newFormats = [...conditionalFormats]
                        newFormats[index] = { ...format, textColor: e.target.value }
                        setConditionalFormats(newFormats)
                      }}
                      className="w-8 h-8 p-0 border-0"
                      title={t("conditionalFormatting.text")}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setConditionalFormats([
                ...conditionalFormats,
                {
                  id: crypto.randomUUID(),
                  name: t("conditionalFormatting.newRule"),
                  condition: "greater",
                  value: 50,
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  textColor: "#2563eb",
                  enabled: true,
                }
              ])}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("conditionalFormatting.addRule")}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormatDialog(false)}>{t("conditionalFormatting.cancel")}</Button>
            <Button onClick={() => {
              updateConfig({ showConditionalFormatting: true })
              setShowFormatDialog(false)
            }}>{t("conditionalFormatting.apply")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drill Down Modal */}
      <Dialog open={showDrillDownModal} onOpenChange={setShowDrillDownModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("drillDown.title")}</DialogTitle>
            <DialogDescription>
              {drillDownData && `${drillDownData.row.metric} - ${columns.find(c => c.key === drillDownData.cell.columnKey)?.label}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {drillDownData && (
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">{t("drillDown.tabs.details")}</TabsTrigger>
                  <TabsTrigger value="breakdown">{t("drillDown.tabs.breakdown")}</TabsTrigger>
                  <TabsTrigger value="trend">{t("drillDown.tabs.trend")}</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground">{t("drillDown.currentValue")}</h4>
                      <p className="text-3xl font-bold">
                        {drillDownData.row.values[drillDownData.cell.columnKey]}%
                      </p>
                    </Card>
                    <Card className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground">{t("drillDown.average")}</h4>
                      <p className="text-3xl font-bold">
                        {typeof statistics[drillDownData.row.id]?.mean === 'number' ? statistics[drillDownData.row.id].mean.toFixed(1) : 'N/A'}%
                      </p>
                    </Card>
                  </div>
                  {drillDownData.row.metadata && (
                    <Card className="p-4">
                      <h4 className="text-sm font-medium mb-2">{t("drillDown.metadata")}</h4>
                      {drillDownData.row.metadata.description && (
                        <p className="text-sm text-muted-foreground">{drillDownData.row.metadata.description}</p>
                      )}
                      {drillDownData.row.metadata.source && (
                        <p className="text-xs text-muted-foreground mt-2">{t("drillDown.source")}: {drillDownData.row.metadata.source}</p>
                      )}
                    </Card>
                  )}
                </TabsContent>
                <TabsContent value="breakdown">
                  <div className="text-sm text-muted-foreground">
                    {t("drillDown.breakdownPlaceholder")}
                  </div>
                </TabsContent>
                <TabsContent value="trend">
                  <div className="text-sm text-muted-foreground">
                    {t("drillDown.trendPlaceholder")}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDrillDownModal(false)}>{t("drillDown.close")}</Button>
            <Button onClick={() => {
              // Export drill down data
              setShowDrillDownModal(false)
            }}>
              <Download className="h-4 w-4 mr-2" />
              {t("drillDown.export")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
