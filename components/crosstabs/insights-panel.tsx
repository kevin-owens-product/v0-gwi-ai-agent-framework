"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Insight {
  id: string
  type: "highest" | "lowest" | "difference" | "outlier" | "trend" | "correlation"
  priority: "high" | "medium" | "low"
  title: string
  description: string
  metric?: string
  audience?: string
  value?: number
  comparison?: { base: string; target: string; difference: number }
  confidence: number
}

interface InsightsPanelProps {
  crosstabId: string
  className?: string
}

export function InsightsPanel({ crosstabId, className }: InsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchInsights = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/v1/crosstabs/${crosstabId}/insights`)
      if (!response.ok) throw new Error("Failed to fetch insights")

      const data = await response.json()
      if (data.success && data.data) {
        setInsights(data.data.insights)
        setSummary(data.data.summary)
      }
    } catch (err) {
      setError("Failed to generate insights")
      console.error("Insights error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [crosstabId])

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedInsights)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedInsights(newExpanded)
  }

  const copyInsight = (insight: Insight) => {
    navigator.clipboard.writeText(`${insight.title}\n${insight.description}`)
    setCopiedId(insight.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getInsightIcon = (type: Insight["type"]) => {
    switch (type) {
      case "highest":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "lowest":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "difference":
        return <Target className="h-4 w-4 text-blue-500" />
      case "outlier":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "trend":
        return <Sparkles className="h-4 w-4 text-purple-500" />
      case "correlation":
        return <Target className="h-4 w-4 text-cyan-500" />
      default:
        return <Lightbulb className="h-4 w-4 text-amber-500" />
    }
  }

  const getPriorityColor = (priority: Insight["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    }
  }

  if (isLoading) {
    return (
      <Card className={cn("p-6 space-y-4", className)}>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          <h3 className="font-semibold">Key Insights</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchInsights}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold">Key Insights</h3>
          <Badge variant="secondary" className="text-xs">
            {insights.length} findings
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchInsights}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="p-3 bg-muted/50 rounded-lg text-sm">
          {summary}
        </div>
      )}

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="border rounded-lg overflow-hidden transition-all hover:border-primary/50"
          >
            {/* Insight Header */}
            <div
              className="p-3 cursor-pointer flex items-start justify-between gap-2"
              onClick={() => toggleExpanded(insight.id)}
            >
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="space-y-1">
                  <div className="font-medium text-sm">{insight.title}</div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", getPriorityColor(insight.priority))}>
                      {insight.priority}
                    </Badge>
                    {insight.confidence && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyInsight(insight)
                  }}
                >
                  {copiedId === insight.id ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                {expandedInsights.has(insight.id) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedInsights.has(insight.id) && (
              <div className="px-3 pb-3 pt-0 space-y-2 border-t bg-muted/30">
                <p className="text-sm text-muted-foreground pt-3">
                  {insight.description}
                </p>

                {/* Additional Details */}
                <div className="flex flex-wrap gap-2">
                  {insight.metric && (
                    <Badge variant="outline" className="text-xs">
                      Metric: {insight.metric}
                    </Badge>
                  )}
                  {insight.audience && (
                    <Badge variant="outline" className="text-xs">
                      Audience: {insight.audience}
                    </Badge>
                  )}
                  {insight.value !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      Value: {insight.value}%
                    </Badge>
                  )}
                  {insight.comparison && (
                    <Badge variant="outline" className="text-xs">
                      Gap: {insight.comparison.difference} pts
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No insights state */}
      {insights.length === 0 && !isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No significant insights detected</p>
          <p className="text-sm">Try adding more data points or audiences</p>
        </div>
      )}
    </Card>
  )
}
