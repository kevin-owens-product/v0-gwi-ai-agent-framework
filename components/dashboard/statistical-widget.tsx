"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatisticalWidgetProps {
  title: string
  value: number
  previousValue?: number
  confidenceInterval?: [number, number]
  significance?: "high" | "medium" | "low" | null
  trend?: "up" | "down" | "stable"
  unit?: string
  description?: string
  className?: string
}

export function StatisticalWidget({
  title,
  value,
  previousValue,
  confidenceInterval,
  significance,
  trend,
  unit = "",
  description,
  className,
}: StatisticalWidgetProps) {
  const change = previousValue !== undefined ? value - previousValue : null
  const changePercent = change !== null && previousValue !== 0 
    ? ((change / previousValue) * 100).toFixed(1)
    : null

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-emerald-500" />
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getSignificanceBadge = () => {
    if (!significance) return null
    const colors = {
      high: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      low: "bg-red-500/10 text-red-500 border-red-500/20",
    }
    return (
      <Badge variant="outline" className={cn("text-xs", colors[significance])}>
        {significance === "high" ? "High Confidence" : 
         significance === "medium" ? "Medium Confidence" : "Low Confidence"}
      </Badge>
    )
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {getSignificanceBadge()}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {value.toLocaleString()}{unit}
          </span>
          {change !== null && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={cn(
                "text-sm font-medium",
                change > 0 ? "text-emerald-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
              )}>
                {change > 0 ? "+" : ""}{changePercent}%
              </span>
            </div>
          )}
        </div>
        {confidenceInterval && (
          <div className="text-xs text-muted-foreground">
            95% CI: {confidenceInterval[0].toLocaleString()}{unit} - {confidenceInterval[1].toLocaleString()}{unit}
          </div>
        )}
        {previousValue !== undefined && (
          <div className="text-xs text-muted-foreground">
            Previous: {previousValue.toLocaleString()}{unit}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
