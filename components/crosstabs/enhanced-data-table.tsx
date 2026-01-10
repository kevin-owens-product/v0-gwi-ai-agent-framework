"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, ArrowUp, ArrowDown, Settings2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface CrosstabData {
  metric: string
  values: Record<string, number>
}

interface EnhancedDataTableProps {
  audiences: string[]
  data: CrosstabData[]
  baseAudience?: string
  showSignificance?: boolean
  className?: string
}

type SortConfig = {
  column: string
  direction: "asc" | "desc"
} | null

type ViewMode = "percentage" | "index" | "difference"

export function EnhancedDataTable({
  audiences,
  data,
  baseAudience,
  showSignificance = true,
  className,
}: EnhancedDataTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("percentage")
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [hoveredCol, setHoveredCol] = useState<string | null>(null)
  const [selectedBase, setSelectedBase] = useState<string>(baseAudience || audiences[0])
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(audiences))

  // Calculate statistics for each metric
  const metricStats = useMemo(() => {
    const stats: Record<string, { mean: number; stdDev: number; min: number; max: number }> = {}

    for (const row of data) {
      const values = Object.values(row.values)
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const stdDev = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      )
      stats[row.metric] = {
        mean,
        stdDev,
        min: Math.min(...values),
        max: Math.max(...values),
      }
    }

    return stats
  }, [data])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      let aValue: number
      let bValue: number

      if (sortConfig.column === "metric") {
        return sortConfig.direction === "asc"
          ? a.metric.localeCompare(b.metric)
          : b.metric.localeCompare(a.metric)
      }

      aValue = a.values[sortConfig.column] || 0
      bValue = b.values[sortConfig.column] || 0

      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
    })
  }, [data, sortConfig])

  // Handle sort
  const handleSort = (column: string) => {
    if (sortConfig?.column === column) {
      if (sortConfig.direction === "asc") {
        setSortConfig({ column, direction: "desc" })
      } else {
        setSortConfig(null)
      }
    } else {
      setSortConfig({ column, direction: "asc" })
    }
  }

  // Get cell value based on view mode
  const getCellValue = (value: number, metric: string): string => {
    const baseValue = sortedData.find(d => d.metric === metric)?.values[selectedBase] || 0

    switch (viewMode) {
      case "index":
        // Index = (value / base) * 100
        return baseValue ? Math.round((value / baseValue) * 100).toString() : "-"
      case "difference":
        // Difference from base
        const diff = value - baseValue
        return diff > 0 ? `+${diff}` : diff.toString()
      default:
        return `${value}%`
    }
  }

  // Get cell color based on value
  const getCellColor = (value: number, metric: string): string => {
    const stats = metricStats[metric]
    if (!stats) return ""

    if (viewMode === "difference") {
      const baseValue = sortedData.find(d => d.metric === metric)?.values[selectedBase] || 0
      const diff = value - baseValue
      if (diff > 20) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      if (diff > 10) return "bg-green-50 dark:bg-green-900/20 text-green-600"
      if (diff < -20) return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
      if (diff < -10) return "bg-red-50 dark:bg-red-900/20 text-red-600"
      return ""
    }

    if (viewMode === "index") {
      const baseValue = sortedData.find(d => d.metric === metric)?.values[selectedBase] || 0
      const index = baseValue ? (value / baseValue) * 100 : 100
      if (index >= 130) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      if (index >= 115) return "bg-green-50 dark:bg-green-900/20 text-green-600"
      if (index <= 70) return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
      if (index <= 85) return "bg-red-50 dark:bg-red-900/20 text-red-600"
      return ""
    }

    // Percentage mode
    if (value >= 70) return "text-emerald-600 dark:text-emerald-400 font-semibold"
    if (value <= 30) return "text-amber-600 dark:text-amber-400"
    return ""
  }

  // Check statistical significance (simplified)
  const isSignificant = (value: number, metric: string): boolean => {
    const stats = metricStats[metric]
    if (!stats || !showSignificance) return false
    const zScore = Math.abs(value - stats.mean) / stats.stdDev
    return zScore > 1.96 // 95% confidence
  }

  // Get trend indicator
  const getTrendIndicator = (value: number, metric: string) => {
    const stats = metricStats[metric]
    if (!stats) return null

    if (value === stats.max) return <TrendingUp className="h-3 w-3 text-green-500 inline ml-1" />
    if (value === stats.min) return <TrendingDown className="h-3 w-3 text-red-500 inline ml-1" />
    return null
  }

  // Sparkline component
  const Sparkline = ({ values, metric }: { values: number[]; metric: string }) => {
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1

    return (
      <div className="flex items-end gap-0.5 h-4 w-16">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex-1 bg-primary/60 rounded-t-sm transition-all"
            style={{ height: `${((v - min) / range) * 100}%`, minHeight: "2px" }}
          />
        ))}
      </div>
    )
  }

  const visibleAudiences = audiences.filter(a => visibleColumns.has(a))

  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {sortedData.length} metrics × {visibleAudiences.length} audiences
          </Badge>
          {viewMode !== "percentage" && (
            <Badge variant="secondary" className="text-xs">
              Base: {selectedBase}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                View: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Display Mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={viewMode === "percentage"}
                onCheckedChange={() => setViewMode("percentage")}
              >
                Percentage (%)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={viewMode === "index"}
                onCheckedChange={() => setViewMode("index")}
              >
                Index (vs. base)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={viewMode === "difference"}
                onCheckedChange={() => setViewMode("difference")}
              >
                Difference (± from base)
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Base Audience</DropdownMenuLabel>
              {audiences.map(audience => (
                <DropdownMenuCheckboxItem
                  key={audience}
                  checked={selectedBase === audience}
                  onCheckedChange={() => setSelectedBase(audience)}
                >
                  {audience}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns ({visibleAudiences.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Visible Audiences</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {audiences.map(audience => (
                <DropdownMenuCheckboxItem
                  key={audience}
                  checked={visibleColumns.has(audience)}
                  onCheckedChange={(checked) => {
                    const newSet = new Set(visibleColumns)
                    if (checked) {
                      newSet.add(audience)
                    } else {
                      newSet.delete(audience)
                    }
                    setVisibleColumns(newSet)
                  }}
                >
                  {audience}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort("metric")}
                >
                  <div className="flex items-center gap-2">
                    Metric
                    {sortConfig?.column === "metric" ? (
                      sortConfig.direction === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-center w-20">Trend</TableHead>
                {visibleAudiences.map((audience) => (
                  <TableHead
                    key={audience}
                    className={cn(
                      "text-center cursor-pointer hover:bg-muted/50 transition-colors",
                      hoveredCol === audience && "bg-muted/30",
                      selectedBase === audience && viewMode !== "percentage" && "bg-primary/10"
                    )}
                    onClick={() => handleSort(audience)}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="truncate max-w-24">{audience}</span>
                      {sortConfig?.column === audience ? (
                        sortConfig.direction === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row) => {
                const rowValues = visibleAudiences.map(a => row.values[a] || 0)
                return (
                  <TableRow
                    key={row.metric}
                    className={cn(
                      "transition-colors",
                      hoveredRow === row.metric && "bg-muted/30"
                    )}
                    onMouseEnter={() => setHoveredRow(row.metric)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <TableCell className="font-medium">{row.metric}</TableCell>
                    <TableCell className="text-center">
                      <Sparkline values={rowValues} metric={row.metric} />
                    </TableCell>
                    {visibleAudiences.map((audience) => {
                      const value = row.values[audience] || 0
                      const significant = isSignificant(value, row.metric)
                      return (
                        <TableCell
                          key={audience}
                          className={cn(
                            "text-center font-mono transition-colors",
                            getCellColor(value, row.metric),
                            hoveredCol === audience && "bg-muted/20",
                            selectedBase === audience && viewMode !== "percentage" && "bg-primary/5"
                          )}
                          onMouseEnter={() => setHoveredCol(audience)}
                          onMouseLeave={() => setHoveredCol(null)}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-default">
                                {getCellValue(value, row.metric)}
                                {significant && <span className="text-primary">*</span>}
                                {getTrendIndicator(value, row.metric)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs space-y-1">
                                <div className="font-medium">{audience}</div>
                                <div>{row.metric}: {value}%</div>
                                {significant && (
                                  <div className="text-green-400">Statistically significant</div>
                                )}
                                <div className="text-muted-foreground">
                                  Avg: {Math.round(metricStats[row.metric]?.mean || 0)}%
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30" />
            High (≥70% or Index ≥130)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/30" />
            Low (≤30% or Index ≤70)
          </span>
          {showSignificance && (
            <span>* Statistically significant (p &lt; 0.05)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3 w-3 text-green-500" />
          Highest in row
          <TrendingDown className="h-3 w-3 text-red-500" />
          Lowest in row
        </div>
      </div>
    </div>
  )
}
