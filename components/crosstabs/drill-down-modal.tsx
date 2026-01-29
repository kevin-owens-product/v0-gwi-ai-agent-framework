"use client"

import React, { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, TrendingUp } from "lucide-react"
import { ChartRenderer, ChartType } from "@/components/charts/chart-renderer"
import { Table as DataTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DrillDownData {
  metric: string
  audience: string
  value: number
  breakdown?: Array<{ category: string; value: number; percentage: number }>
  timeSeries?: Array<{ period: string; value: number }>
  demographics?: Record<string, number>
}

interface DrillDownModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: DrillDownData | null
  onExport?: (format: "csv" | "json") => void
}

export function DrillDownModal({
  open,
  onOpenChange,
  data,
  onExport,
}: DrillDownModalProps) {
  const [viewMode, setViewMode] = useState<"breakdown" | "trend" | "demographics">("breakdown")
  const [chartType, setChartType] = useState<ChartType>("BAR")

  const chartData = useMemo(() => {
    if (!data) return []
    
    if (viewMode === "breakdown" && data.breakdown) {
      return data.breakdown.map(item => ({
        name: item.category,
        value: item.value,
      }))
    }
    
    if (viewMode === "trend" && data.timeSeries) {
      return data.timeSeries.map(item => ({
        name: item.period,
        value: item.value,
      }))
    }
    
    if (viewMode === "demographics" && data.demographics) {
      return Object.entries(data.demographics).map(([key, value]) => ({
        name: key,
        value: value as number,
      }))
    }
    
    return []
  }, [data, viewMode])

  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Drill-Down: {data.metric} - {data.audience}
          </DialogTitle>
          <DialogDescription>
            Detailed analysis for {data.metric} in {data.audience} audience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-xs text-muted-foreground">Value</div>
              <div className="text-lg font-bold">{data.value.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Metric</div>
              <div className="text-sm font-medium">{data.metric}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Audience</div>
              <div className="text-sm font-medium">{data.audience}</div>
            </div>
          </div>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="trend">Trend</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
            </TabsList>

            <TabsContent value="breakdown" className="space-y-4">
              {data.breakdown && data.breakdown.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <Label>Chart Type</Label>
                    <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BAR">Bar Chart</SelectItem>
                        <SelectItem value="PIE">Pie Chart</SelectItem>
                        <SelectItem value="DONUT">Donut Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ChartRenderer
                    type={chartType}
                    data={chartData}
                    config={{
                      height: 300,
                      showLegend: true,
                      showGrid: true,
                      showTooltip: true,
                    }}
                  />
                  <DataTable>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.breakdown.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.category}</TableCell>
                          <TableCell className="text-right">{item.value.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </DataTable>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No breakdown data available
                </div>
              )}
            </TabsContent>

            <TabsContent value="trend" className="space-y-4">
              {data.timeSeries && data.timeSeries.length > 0 ? (
                <>
                  <ChartRenderer
                    type="LINE"
                    data={chartData}
                    config={{
                      height: 300,
                      showLegend: false,
                      showGrid: true,
                      showTooltip: true,
                    }}
                  />
                  <DataTable>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.timeSeries.map((item, index) => {
                        const prevValue = index > 0 ? data.timeSeries![index - 1].value : null
                        const change = prevValue !== null ? item.value - prevValue : null
                        const changePercent = change !== null && prevValue !== 0
                          ? ((change / prevValue) * 100).toFixed(1)
                          : null
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.period}</TableCell>
                            <TableCell className="text-right">{item.value.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              {changePercent && (
                                <Badge variant={change! > 0 ? "default" : "destructive"}>
                                  {change! > 0 ? "+" : ""}{changePercent}%
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </DataTable>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No trend data available
                </div>
              )}
            </TabsContent>

            <TabsContent value="demographics" className="space-y-4">
              {data.demographics && Object.keys(data.demographics).length > 0 ? (
                <>
                  <ChartRenderer
                    type="BAR"
                    data={chartData}
                    config={{
                      height: 300,
                      showLegend: false,
                      showGrid: true,
                      showTooltip: true,
                    }}
                  />
                  <DataTable>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Demographic</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(data.demographics).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{key}</TableCell>
                          <TableCell className="text-right">{value.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </DataTable>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No demographic data available
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onExport?.("csv")}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport?.("json")}>
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
