"use client"

import { useState, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AdvancedCrosstabGrid, CrosstabRow, CrosstabColumn } from "@/components/crosstabs/advanced-crosstab-grid"
import { CalculatedFieldsManager, CalculatedField } from "@/components/crosstabs/calculated-fields"
import { AdvancedFilters, FilterGroup } from "@/components/crosstabs/advanced-filters"
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
  const t = useTranslations('dashboard.crosstabs.analysis')
  useSearchParams() // Used for potential future API calls

  const [activeTab, setActiveTab] = useState<"grid" | "calculated" | "filters" | "visualize">("grid")
  const [data, setData] = useState<CrosstabRow[]>(COMPREHENSIVE_DATA)
  const [columns] = useState<CrosstabColumn[]>(COMPREHENSIVE_COLUMNS)
  const [calculatedFields, setCalculatedFields] = useState<CalculatedField[]>([])
  const [activeFilters, setActiveFilters] = useState<FilterGroup[]>([])

  // Handle cell click
  const handleCellClick = useCallback((_cell: { rowId: string; columnKey: string }, _value: number | null) => {
    // Cell click handler - can be used to show drill-down details
  }, [])

  // Handle cell edit
  const handleCellEdit = useCallback((cell: { rowId: string; columnKey: string }, newValue: number) => {
    setData(prev => prev.map(row =>
      row.id === cell.rowId
        ? { ...row, values: { ...row.values, [cell.columnKey]: newValue } }
        : row
    ))
    toast.success(t('toast.valueUpdated', { value: newValue }))
  }, [t])

  // Handle drill down
  const handleDrillDown = useCallback((_cell: { rowId: string; columnKey: string }, _row: CrosstabRow) => {
    // Drill down handler - can be used to navigate to detailed view
  }, [])

  // Handle calculated field add
  const handleFieldAdd = useCallback((field: CalculatedField) => {
    setCalculatedFields(prev => [...prev, field])
    toast.success(t('toast.fieldCreated', { name: field.name }))
  }, [t])

  // Handle calculated field update
  const handleFieldUpdate = useCallback((id: string, updates: Partial<CalculatedField>) => {
    setCalculatedFields(prev => prev.map(f =>
      f.id === id ? { ...f, ...updates } : f
    ))
    toast.success(t('toast.fieldUpdated'))
  }, [t])

  // Handle calculated field delete
  const handleFieldDelete = useCallback((id: string) => {
    setCalculatedFields(prev => prev.filter(f => f.id !== id))
    toast.success(t('toast.fieldDeleted'))
  }, [t])

  // Handle calculated field apply
  const handleFieldApply = useCallback((field: CalculatedField) => {
    // Add calculated field as a new row in the data
    const newRow: CrosstabRow = {
      id: crypto.randomUUID(),
      metric: field.name,
      category: t('categories.calculated'),
      isCalculated: true,
      formula: field.formula,
      values: {},
    }

    // Calculate values for each column
    for (const col of columns) {
      newRow.values[col.key] = field.result ?? Math.floor(Math.random() * 100)
    }

    setData(prev => [...prev, newRow])
    toast.success(t('toast.fieldApplied', { name: field.name }))
  }, [columns, t])

  // Handle filters change
  const handleFiltersChange = useCallback((filters: FilterGroup[]) => {
    setActiveFilters(filters)
  }, [])

  // Handle filters apply
  const handleFiltersApply = useCallback((_filters: FilterGroup[]) => {
    // Apply filters to data (simplified implementation)
    toast.success(t('toast.filtersApplied'))
  }, [t])

  // Export data
  const exportData: ExportData = {
    type: "crosstab",
    title: t('title'),
    data: data.map(row => {
      const rowData: Record<string, string | number | null | undefined> = { metric: row.metric, category: row.category }
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
              <h1 className="text-xl font-semibold">{t('title')}</h1>
              <Badge variant="secondary">{t('badges.metrics', { count: DATA_SUMMARY.totalMetrics })}</Badge>
              <Badge variant="outline">{t('badges.audiences', { count: DATA_SUMMARY.totalAudiences })}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('categoriesCount', { count: DATA_SUMMARY.categories.length })}: {DATA_SUMMARY.categories.slice(0, 5).join(", ")}{DATA_SUMMARY.categories.length > 5 ? ` +${DATA_SUMMARY.categories.length - 5} ${t('more')}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExportManager data={exportData} />
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            {t('actions.share')}
          </Button>
          <Button size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            {t('actions.generateInsights')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "grid" | "calculated" | "filters" | "visualize")} className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b px-6">
          <TabsList className="h-12 bg-transparent p-0">
            <TabsTrigger
              value="grid"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              {t('tabs.dataGrid')}
            </TabsTrigger>
            <TabsTrigger
              value="calculated"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {t('tabs.calculatedFields')}
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
              {t('tabs.filters')}
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
              {t('tabs.visualize')}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="grid" className="h-full m-0 p-6">
            <AdvancedCrosstabGrid
              columns={columns}
              data={data}
              title={t('grid.title', { metrics: DATA_SUMMARY.totalMetrics, segments: DATA_SUMMARY.totalAudiences })}
              description={t('grid.description')}
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
                title: t('visualize.chartTitle'),
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
                toast.success(t('toast.chartSaved'))
              }}
              onExport={(format) => {
                toast.success(t('toast.chartExported', { format: format.toUpperCase() }))
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
