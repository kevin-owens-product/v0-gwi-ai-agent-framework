"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react"
import { ChartRenderer } from "@/components/charts/chart-renderer"
import { cn } from "@/lib/utils"

interface ComparisonItem {
  name: string
  value: number
  change?: number
  color?: string
}

interface ComparisonWidgetProps {
  title: string
  items: ComparisonItem[]
  chartType?: "bar" | "line"
  showChange?: boolean
  baseline?: string
  className?: string
}

export function ComparisonWidget({
  title,
  items,
  chartType = "bar",
  showChange = true,
  baseline,
  className,
}: ComparisonWidgetProps) {
  const chartData = items.map(item => ({
    name: item.name,
    value: item.value,
  }))

  const baselineValue = baseline 
    ? items.find(i => i.name === baseline)?.value 
    : items[0]?.value

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          {title}
        </CardTitle>
        {baseline && (
          <Badge variant="outline" className="text-xs w-fit mt-2">
            Baseline: {baseline}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartRenderer
          type={chartType === "bar" ? "BAR" : "LINE"}
          data={chartData}
          config={{
            height: 200,
            showLegend: false,
            showGrid: true,
            showTooltip: true,
          }}
        />
        {showChange && baselineValue && (
          <div className="space-y-2 pt-2 border-t">
            {items.map((item, index) => {
              const change = baselineValue ? ((item.value - baselineValue) / baselineValue) * 100 : 0
              const isPositive = change > 0
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.value.toLocaleString()}</span>
                    {change !== 0 && (
                      <div className={cn(
                        "flex items-center gap-1 text-xs",
                        isPositive ? "text-emerald-500" : "text-red-500"
                      )}>
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(change).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
