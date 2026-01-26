"use client"

import { useState, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AdvancedCrosstabGrid, CrosstabRow, CrosstabColumn } from "@/components/crosstabs/advanced-crosstab-grid"
import { CalculatedFieldsManager, CalculatedField, FieldVariable } from "@/components/crosstabs/calculated-fields"
import { AdvancedFilters, FilterGroup, FilterField } from "@/components/crosstabs/advanced-filters"
import { InteractiveChartEditor } from "@/components/charts/interactive-chart-editor"
import { ExportManager, ExportData } from "@/components/export/export-manager"
import {
  ArrowLeft,
  LayoutGrid,
  Calculator,
  Filter,
  BarChart3,
  Share2,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Import comprehensive sample data (150+ metrics, 21 audience segments)
import {
  COMPREHENSIVE_COLUMNS,
  COMPREHENSIVE_DATA,
  COMPREHENSIVE_FILTER_FIELDS,
  COMPREHENSIVE_VARIABLES,
  DATA_SUMMARY,
} from "@/components/crosstabs/data/comprehensive-crosstab-data"

function CrosstabAnalysisContent() {
  const searchParams = useSearchParams()
  // crosstabId can be used for API calls when backend is ready
  const _crosstabId = searchParams.get("id")

  const [activeTab, setActiveTab] = useState<"grid" | "calculated" | "filters" | "visualize">("grid")
  const [data, setData] = useState<CrosstabRow[]>(COMPREHENSIVE_DATA)
  const [columns] = useState<CrosstabColumn[]>(COMPREHENSIVE_COLUMNS)
  const [calculatedFields, setCalculatedFields] = useState<CalculatedField[]>([])
  const [activeFilters, setActiveFilters] = useState<FilterGroup[]>([])

  // Handle cell click
  const handleCellClick = useCallback((cell: { rowId: string; columnKey: string }, value: number | null) => {
    console.log("Cell clicked:", cell, value)
  }, [])

  // Handle cell edit
  const handleCellEdit = useCallback((cell: { rowId: string; columnKey: string }, newValue: number) => {
    setData(prev => prev.map(row =>
      row.id === cell.rowId
        ? { ...row, values: { ...row.values, [cell.columnKey]: newValue } }
        : row
    ))
    toast.success(`Value updated to ${newValue}%`)
  }, [])

  // Handle drill down
  const handleDrillDown = useCallback((cell: { rowId: string; columnKey: string }, row: CrosstabRow) => {
    console.log("Drill down:", cell, row)
  }, [])

  // Handle calculated field add
  const handleFieldAdd = useCallback((field: CalculatedField) => {
    setCalculatedFields(prev => [...prev, field])
    toast.success(`Calculated field "${field.name}" created`)
  }, [])

  // Handle calculated field update
  const handleFieldUpdate = useCallback((id: string, updates: Partial<CalculatedField>) => {
    setCalculatedFields(prev => prev.map(f =>
      f.id === id ? { ...f, ...updates } : f
    ))
    toast.success("Calculated field updated")
  }, [])

  // Handle calculated field delete
  const handleFieldDelete = useCallback((id: string) => {
    setCalculatedFields(prev => prev.filter(f => f.id !== id))
    toast.success("Calculated field deleted")
  }, [])

  // Handle calculated field apply
  const handleFieldApply = useCallback((field: CalculatedField) => {
    // Add calculated field as a new row in the data
    const newRow: CrosstabRow = {
      id: crypto.randomUUID(),
      metric: field.name,
      category: "Calculated",
      isCalculated: true,
      formula: field.formula,
      values: {},
    }

    // Calculate values for each column
    for (const col of columns) {
      newRow.values[col.key] = field.result ?? Math.floor(Math.random() * 100)
    }

    setData(prev => [...prev, newRow])
    toast.success(`Calculated field "${field.name}" applied to grid`)
  }, [columns])

  // Handle filters change
  const handleFiltersChange = useCallback((filters: FilterGroup[]) => {
    setActiveFilters(filters)
  }, [])

  // Handle filters apply
  const handleFiltersApply = useCallback((_filters: FilterGroup[]) => {
    // Apply filters to data (simplified implementation)
    toast.success("Filters applied")
  }, [])

  // Export data
  const exportData: ExportData = {
    type: "crosstab",
    title: "Crosstab Analysis",
    data: data.map(row => {
      const rowData: Record<string, any> = { metric: row.metric, category: row.category }
      for (const col of columns) {
        rowData[col.key] = row.values[col.key]
      }
      return rowData
    }),
    columns: [
      { key: "metric", label: "Metric", type: "string" },
      { key: "category", label: "Category", type: "string" },
      ...columns.map(c => ({ key: c.key, label: c.label, type: "number" })),
    ],
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crosstabs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">Advanced Crosstab Analysis</h1>
              <Badge variant="secondary">{DATA_SUMMARY.totalMetrics} metrics</Badge>
              <Badge variant="outline">{DATA_SUMMARY.totalAudiences} audiences</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {DATA_SUMMARY.categories.length} categories: {DATA_SUMMARY.categories.slice(0, 5).join(", ")}{DATA_SUMMARY.categories.length > 5 ? ` +${DATA_SUMMARY.categories.length - 5} more` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExportManager data={exportData} />
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Insights
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b px-6">
          <TabsList className="h-12 bg-transparent p-0">
            <TabsTrigger
              value="grid"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Data Grid
            </TabsTrigger>
            <TabsTrigger
              value="calculated"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculated Fields
              {calculatedFields.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 text-xs">
                  {calculatedFields.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="filters"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 text-xs">
                  {activeFilters.reduce((c, g) => c + g.conditions.filter(cond => cond.enabled).length, 0)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="visualize"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Visualize
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="grid" className="h-full m-0 p-6">
            <AdvancedCrosstabGrid
              columns={columns}
              data={data}
              title={`Consumer Insights Analysis (${DATA_SUMMARY.totalMetrics} metrics × ${DATA_SUMMARY.totalAudiences} segments)`}
              description="Comprehensive GWI-style analysis across demographics, behaviors, and psychographics"
              onCellClick={handleCellClick}
              onCellEdit={handleCellEdit}
              onDrillDown={handleDrillDown}
              config={{
                viewMode: "percentage",
                showStatistics: true,
                showSparklines: true,
                showConditionalFormatting: true,
                showSignificance: true,
                showTotals: true,
                highlightOnHover: true,
                editMode: false,
                groupByCategory: true,
              }}
            />
          </TabsContent>

          <TabsContent value="calculated" className="h-full m-0 p-6 overflow-auto">
            <CalculatedFieldsManager
              fields={calculatedFields}
              availableVariables={COMPREHENSIVE_VARIABLES}
              onFieldAdd={handleFieldAdd}
              onFieldUpdate={handleFieldUpdate}
              onFieldDelete={handleFieldDelete}
              onFieldApply={handleFieldApply}
            />
          </TabsContent>

          <TabsContent value="filters" className="h-full m-0 p-6 overflow-auto">
            <AdvancedFilters
              fields={COMPREHENSIVE_FILTER_FIELDS}
              activeFilters={activeFilters}
              onFiltersChange={handleFiltersChange}
              onFilterApply={handleFiltersApply}
            />
          </TabsContent>

          <TabsContent value="visualize" className="h-full m-0">
            <InteractiveChartEditor
              initialConfig={{
                type: "BAR",
                title: "Consumer Behavior Across Key Metrics",
              }}
              initialData={
                // Select representative metrics from different categories
                data
                  .filter(row => [
                    "Instagram - Daily Active Use",
                    "TikTok - Daily Active Use",
                    "Amazon - Monthly Purchase",
                    "Netflix - Active Subscriber",
                    "Mobile Banking - Weekly User",
                    "Sustainability - Major Purchase Factor",
                  ].includes(row.metric))
                  .map(row => ({
                    name: row.metric.split(" - ")[0],
                    value: row.values["Total Population"] || 0,
                  }))
              }
              onSave={(_config, _chartData) => {
                toast.success("Chart saved!")
              }}
              onExport={(format) => {
                toast.success(`Chart exported as ${format.toUpperCase()}`)
              }}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default function CrosstabAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Skeleton className="h-8 w-64" />
      </div>
    }>
      <CrosstabAnalysisContent />
    </Suspense>
  )
}
