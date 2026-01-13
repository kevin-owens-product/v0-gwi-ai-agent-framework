"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Info,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TrendDataPoint {
  version: number
  date: string
  value: number
  confidence?: number
}

interface TrendAnalysis {
  metric: string
  dataPoints: TrendDataPoint[]
  direction: "increasing" | "decreasing" | "stable" | "volatile"
  changePercent: number
  trendStrength: number
}

interface TrendShift {
  metric: string
  shiftType: "reversal" | "acceleration" | "deceleration" | "breakout"
  previousDirection: "increasing" | "decreasing" | "stable"
  newDirection: "increasing" | "decreasing" | "stable"
  magnitude: number
  detectedAt: string
  significance: "low" | "medium" | "high"
}

interface InsightEvolution {
  previousInsights: string[]
  currentInsights: string[]
  addedInsights: string[]
  removedInsights: string[]
  consistentInsights: string[]
  evolutionSummary: string
}

interface EvolutionData {
  analysisType: string
  referenceId: string
  trends: TrendAnalysis[]
  comparison?: {
    insightEvolution: InsightEvolution
    shifts: TrendShift[]
    metricChanges: Array<{
      metric: string
      fromValue: number
      toValue: number
      changePercent: number
      isSignificant: boolean
    }>
  }
  explanation?: {
    explanation: string
    factors: string[]
    recommendations: string[]
  }
  confidenceHistory: Array<{
    version: number
    date: string
    confidence: number | null
  }>
}

interface EvolutionChartProps {
  analysisType: string
  referenceId: string
  title?: string
  className?: string
}

const DIRECTION_ICONS = {
  increasing: <TrendingUp className="h-4 w-4 text-green-500" />,
  decreasing: <TrendingDown className="h-4 w-4 text-red-500" />,
  stable: <Minus className="h-4 w-4 text-gray-500" />,
  volatile: <Activity className="h-4 w-4 text-amber-500" />,
}

const DIRECTION_COLORS = {
  increasing: "text-green-600",
  decreasing: "text-red-600",
  stable: "text-gray-600",
  volatile: "text-amber-600",
}

export function EvolutionChart({
  analysisType,
  referenceId,
  title,
  className,
}: EvolutionChartProps) {
  const [data, setData] = useState<EvolutionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [periods, setPeriods] = useState(12)

  useEffect(() => {
    fetchEvolution()
  }, [analysisType, referenceId, periods])

  const fetchEvolution = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/v1/evolution/${analysisType}/${referenceId}?periods=${periods}&includeComparison=true&includeTrends=true`
      )
      if (response.ok) {
        const result = await response.json()
        setData(result)
        if (result.trends?.length > 0 && !selectedMetric) {
          setSelectedMetric(result.trends[0].metric)
        }
      }
    } catch (error) {
      console.error("Failed to fetch evolution:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  }

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${(value * 100).toFixed(1)}%`
  }

  const selectedTrend = data?.trends?.find((t) => t.metric === selectedMetric)

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h4 className="font-medium mb-2">No Evolution Data</h4>
        <p className="text-sm text-muted-foreground">
          Analysis evolution data is not yet available.
        </p>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">{title || "Analysis Evolution"}</h3>
              <p className="text-sm text-muted-foreground">
                How your analysis has changed over time
              </p>
            </div>
          </div>
          <Select value={String(periods)} onValueChange={(v) => setPeriods(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Last 6</SelectItem>
              <SelectItem value="12">Last 12</SelectItem>
              <SelectItem value="24">Last 24</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="confidence">Confidence</TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          {/* Metric Selector */}
          {data.trends && data.trends.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                {data.trends.map((trend) => (
                  <Button
                    key={trend.metric}
                    variant={selectedMetric === trend.metric ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMetric(trend.metric)}
                    className="capitalize"
                  >
                    {DIRECTION_ICONS[trend.direction]}
                    <span className="ml-2">{trend.metric.replace(/_/g, " ")}</span>
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Selected Metric Chart */}
          {selectedTrend && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium capitalize">
                    {selectedTrend.metric.replace(/_/g, " ")} Trend
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {DIRECTION_ICONS[selectedTrend.direction]}
                    <span className={cn("text-sm font-medium", DIRECTION_COLORS[selectedTrend.direction])}>
                      {selectedTrend.direction}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({formatPercent(selectedTrend.changePercent)} overall)
                    </span>
                  </div>
                </div>
                <Badge variant="secondary">
                  Trend strength: {(selectedTrend.trendStrength * 100).toFixed(0)}%
                </Badge>
              </div>

              {/* Simple sparkline visualization */}
              <div className="h-48 relative">
                <div className="absolute inset-0 flex items-end justify-between gap-1">
                  {selectedTrend.dataPoints.map((point, i) => {
                    const min = Math.min(...selectedTrend.dataPoints.map((p) => p.value))
                    const max = Math.max(...selectedTrend.dataPoints.map((p) => p.value))
                    const range = max - min || 1
                    const height = ((point.value - min) / range) * 100

                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end gap-1"
                      >
                        <div
                          className={cn(
                            "w-full rounded-t transition-all hover:opacity-80",
                            selectedTrend.direction === "increasing"
                              ? "bg-green-500"
                              : selectedTrend.direction === "decreasing"
                              ? "bg-red-500"
                              : "bg-primary"
                          )}
                          style={{ height: `${Math.max(height, 5)}%` }}
                          title={`v${point.version}: ${point.value}`}
                        />
                        <span className="text-xs text-muted-foreground">
                          v{point.version}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Data points table */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-4 text-sm overflow-x-auto pb-2">
                  {selectedTrend.dataPoints.map((point, i) => (
                    <div key={i} className="flex-shrink-0 text-center">
                      <div className="text-muted-foreground text-xs">
                        {formatDate(point.date)}
                      </div>
                      <div className="font-medium">{point.value.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Trend Shifts */}
          {data.comparison?.shifts && data.comparison.shifts.length > 0 && (
            <Card className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Detected Trend Shifts
              </h4>
              <div className="space-y-3">
                {data.comparison.shifts.map((shift, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded-lg border-l-4",
                      shift.significance === "high"
                        ? "border-l-red-500 bg-red-50 dark:bg-red-900/20"
                        : shift.significance === "medium"
                        ? "border-l-amber-500 bg-amber-50 dark:bg-amber-900/20"
                        : "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium capitalize">
                          {shift.metric.replace(/_/g, " ")}
                        </span>
                        <span className="mx-2 text-muted-foreground">—</span>
                        <span className="text-sm capitalize">{shift.shiftType}</span>
                      </div>
                      <Badge
                        variant={
                          shift.significance === "high"
                            ? "destructive"
                            : shift.significance === "medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {shift.significance}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {shift.previousDirection} → {shift.newDirection}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {data.comparison?.insightEvolution ? (
            <>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Insight Evolution Summary</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.comparison.insightEvolution.evolutionSummary}
                </p>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Added Insights */}
                {data.comparison.insightEvolution.addedInsights.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <ArrowUp className="h-4 w-4 text-green-500" />
                      New Insights
                    </h4>
                    <div className="space-y-2">
                      {data.comparison.insightEvolution.addedInsights.map((insight, i) => (
                        <div
                          key={i}
                          className="p-2 rounded bg-green-50 dark:bg-green-900/20 text-sm"
                        >
                          <Lightbulb className="h-4 w-4 text-green-600 inline mr-2" />
                          {insight}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Removed Insights */}
                {data.comparison.insightEvolution.removedInsights.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <ArrowDown className="h-4 w-4 text-red-500" />
                      Outdated Insights
                    </h4>
                    <div className="space-y-2">
                      {data.comparison.insightEvolution.removedInsights.map((insight, i) => (
                        <div
                          key={i}
                          className="p-2 rounded bg-red-50 dark:bg-red-900/20 text-sm line-through opacity-75"
                        >
                          {insight}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Consistent Insights */}
              {data.comparison.insightEvolution.consistentInsights.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Minus className="h-4 w-4 text-gray-500" />
                    Consistent Insights
                  </h4>
                  <div className="space-y-2">
                    {data.comparison.insightEvolution.consistentInsights.map((insight, i) => (
                      <div key={i} className="p-2 rounded bg-muted text-sm">
                        <Lightbulb className="h-4 w-4 text-primary inline mr-2" />
                        {insight}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="font-medium mb-2">No Insight Evolution Data</h4>
              <p className="text-sm text-muted-foreground">
                Need at least two analysis versions to show evolution.
              </p>
            </Card>
          )}

          {/* Explanation */}
          {data.explanation && (
            <Card className="p-4">
              <h4 className="font-medium mb-3">Analysis Explanation</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {data.explanation.explanation}
              </p>

              {data.explanation.factors.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-2">Contributing Factors</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {data.explanation.factors.map((factor, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.explanation.recommendations.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-2">Recommendations</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {data.explanation.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}
        </TabsContent>

        {/* Confidence Tab */}
        <TabsContent value="confidence" className="space-y-4">
          {data.confidenceHistory && data.confidenceHistory.length > 0 ? (
            <Card className="p-4">
              <h4 className="font-medium mb-4">Analysis Confidence Over Time</h4>

              {/* Simple confidence chart */}
              <div className="h-48 relative mb-4">
                <div className="absolute inset-0 flex items-end justify-between gap-1">
                  {data.confidenceHistory.map((point, i) => {
                    const confidence = point.confidence ?? 0
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end gap-1"
                      >
                        <div
                          className={cn(
                            "w-full rounded-t transition-all hover:opacity-80",
                            confidence >= 0.8
                              ? "bg-green-500"
                              : confidence >= 0.6
                              ? "bg-amber-500"
                              : "bg-red-500"
                          )}
                          style={{ height: `${confidence * 100}%` }}
                          title={`v${point.version}: ${(confidence * 100).toFixed(0)}%`}
                        />
                        <span className="text-xs text-muted-foreground">
                          v{point.version}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-green-500" />
                  <span className="text-xs text-muted-foreground">High (≥80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-amber-500" />
                  <span className="text-xs text-muted-foreground">Medium (60-80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-red-500" />
                  <span className="text-xs text-muted-foreground">Low (&lt;60%)</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="font-medium mb-2">No Confidence Data</h4>
              <p className="text-sm text-muted-foreground">
                Confidence tracking is not yet available for this analysis.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
