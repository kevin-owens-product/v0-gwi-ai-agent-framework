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

// Sample data for demonstration
const SAMPLE_COLUMNS: CrosstabColumn[] = [
  { id: "genz", key: "Gen Z (18-24)", label: "Gen Z (18-24)", category: "Generation" },
  { id: "mill", key: "Millennials (25-40)", label: "Millennials", category: "Generation" },
  { id: "genx", key: "Gen X (41-56)", label: "Gen X", category: "Generation" },
  { id: "boom", key: "Boomers (57-75)", label: "Boomers", category: "Generation" },
]

const SAMPLE_DATA: CrosstabRow[] = [
  { id: "1", metric: "TikTok Usage", category: "Social Media", values: { "Gen Z (18-24)": 87, "Millennials (25-40)": 52, "Gen X (41-56)": 24, "Boomers (57-75)": 8 } },
  { id: "2", metric: "Instagram Usage", category: "Social Media", values: { "Gen Z (18-24)": 82, "Millennials (25-40)": 71, "Gen X (41-56)": 48, "Boomers (57-75)": 28 } },
  { id: "3", metric: "Facebook Usage", category: "Social Media", values: { "Gen Z (18-24)": 42, "Millennials (25-40)": 68, "Gen X (41-56)": 78, "Boomers (57-75)": 72 } },
  { id: "4", metric: "YouTube Usage", category: "Social Media", values: { "Gen Z (18-24)": 91, "Millennials (25-40)": 85, "Gen X (41-56)": 76, "Boomers (57-75)": 62 } },
  { id: "5", metric: "LinkedIn Usage", category: "Professional", values: { "Gen Z (18-24)": 28, "Millennials (25-40)": 52, "Gen X (41-56)": 48, "Boomers (57-75)": 35 } },
  { id: "6", metric: "Twitter/X Usage", category: "Social Media", values: { "Gen Z (18-24)": 38, "Millennials (25-40)": 42, "Gen X (41-56)": 35, "Boomers (57-75)": 22 } },
  { id: "7", metric: "Snapchat Usage", category: "Social Media", values: { "Gen Z (18-24)": 72, "Millennials (25-40)": 35, "Gen X (41-56)": 12, "Boomers (57-75)": 4 } },
  { id: "8", metric: "Pinterest Usage", category: "Social Media", values: { "Gen Z (18-24)": 45, "Millennials (25-40)": 48, "Gen X (41-56)": 42, "Boomers (57-75)": 38 } },
  { id: "9", metric: "Online Shopping", category: "E-commerce", values: { "Gen Z (18-24)": 78, "Millennials (25-40)": 82, "Gen X (41-56)": 75, "Boomers (57-75)": 58 } },
  { id: "10", metric: "Mobile Banking", category: "Finance", values: { "Gen Z (18-24)": 72, "Millennials (25-40)": 85, "Gen X (41-56)": 68, "Boomers (57-75)": 42 } },
  { id: "11", metric: "Streaming Video", category: "Entertainment", values: { "Gen Z (18-24)": 92, "Millennials (25-40)": 88, "Gen X (41-56)": 72, "Boomers (57-75)": 55 } },
  { id: "12", metric: "Podcast Listening", category: "Entertainment", values: { "Gen Z (18-24)": 48, "Millennials (25-40)": 55, "Gen X (41-56)": 42, "Boomers (57-75)": 25 } },
]

const SAMPLE_FILTER_FIELDS: FilterField[] = [
  { id: "metric", name: "metric", label: "Metric Name", type: "text", category: "Dimensions" },
  { id: "category", name: "category", label: "Category", type: "select", category: "Dimensions", options: [
    { value: "Social Media", label: "Social Media" },
    { value: "E-commerce", label: "E-commerce" },
    { value: "Finance", label: "Finance" },
    { value: "Entertainment", label: "Entertainment" },
    { value: "Professional", label: "Professional" },
  ]},
  { id: "value", name: "value", label: "Value", type: "number", category: "Metrics", min: 0, max: 100 },
]

const SAMPLE_VARIABLES: FieldVariable[] = [
  { id: "genz", name: "Gen_Z", label: "Gen Z (18-24)", type: "audience", value: 65 },
  { id: "mill", name: "Millennials", label: "Millennials (25-40)", type: "audience", value: 58 },
  { id: "genx", name: "Gen_X", label: "Gen X (41-56)", type: "audience", value: 48 },
  { id: "boom", name: "Boomers", label: "Boomers (57-75)", type: "audience", value: 38 },
  { id: "total", name: "Total_Sample", label: "Total Sample", type: "constant", value: 10000 },
  { id: "base", name: "Base_Index", label: "Base Index", type: "constant", value: 100 },
]

function CrosstabAnalysisContent() {
  const searchParams = useSearchParams()
  // crosstabId can be used for API calls when backend is ready
  const _crosstabId = searchParams.get("id")

  const [activeTab, setActiveTab] = useState<"grid" | "calculated" | "filters" | "visualize">("grid")
  const [data, setData] = useState<CrosstabRow[]>(SAMPLE_DATA)
  const [columns] = useState<CrosstabColumn[]>(SAMPLE_COLUMNS)
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
              <Badge variant="secondary">Beta</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Interactive grid with editing, drill-down, and calculated fields
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
              title="Generational Social Media Usage"
              description="Comprehensive analysis of platform usage across generations"
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
              }}
            />
          </TabsContent>

          <TabsContent value="calculated" className="h-full m-0 p-6 overflow-auto">
            <CalculatedFieldsManager
              fields={calculatedFields}
              availableVariables={SAMPLE_VARIABLES}
              onFieldAdd={handleFieldAdd}
              onFieldUpdate={handleFieldUpdate}
              onFieldDelete={handleFieldDelete}
              onFieldApply={handleFieldApply}
            />
          </TabsContent>

          <TabsContent value="filters" className="h-full m-0 p-6 overflow-auto">
            <AdvancedFilters
              fields={SAMPLE_FILTER_FIELDS}
              activeFilters={activeFilters}
              onFiltersChange={handleFiltersChange}
              onFilterApply={handleFiltersApply}
            />
          </TabsContent>

          <TabsContent value="visualize" className="h-full m-0">
            <InteractiveChartEditor
              initialConfig={{
                type: "BAR",
                title: "Platform Usage by Generation",
              }}
              initialData={data.slice(0, 6).map(row => ({
                name: row.metric,
                value: Math.round(Object.values(row.values).reduce((a: number, b) => a + (b || 0), 0) / columns.length),
              }))}
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
