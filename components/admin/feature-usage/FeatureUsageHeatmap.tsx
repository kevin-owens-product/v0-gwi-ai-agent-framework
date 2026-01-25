/**
 * @prompt-id forge-v4.1:feature:feature-usage-analytics:006
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * Feature Usage Heatmap Component
 * Displays feature usage across categories and plan tiers
 */

"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface FeatureData {
  featureKey: string
  featureName: string
  category?: string
  totalEvents: number
  byPlan?: Record<string, number>
}

interface FeatureUsageHeatmapProps {
  data: FeatureData[]
  title?: string
  description?: string
}

const PLAN_TIERS = ["STARTER", "PROFESSIONAL", "ENTERPRISE"]

const CATEGORY_ORDER = [
  "agents",
  "audiences",
  "dashboards",
  "reports",
  "workflows",
  "charts",
  "crosstabs",
  "api",
  "data",
  "collaboration",
  "settings",
]

function getHeatmapColor(value: number, max: number): string {
  if (value === 0 || max === 0) return "bg-muted"

  const intensity = value / max

  if (intensity >= 0.8) return "bg-emerald-500"
  if (intensity >= 0.6) return "bg-emerald-400"
  if (intensity >= 0.4) return "bg-emerald-300"
  if (intensity >= 0.2) return "bg-emerald-200"
  return "bg-emerald-100"
}

export function FeatureUsageHeatmap({
  data,
  title = "Usage by Plan Tier",
  description = "Feature usage distribution across plan tiers",
}: FeatureUsageHeatmapProps) {
  // Organize data by category
  const organizedData = useMemo(() => {
    const byCategory: Record<string, FeatureData[]> = {}

    for (const item of data) {
      const category = item.category || "other"
      if (!byCategory[category]) {
        byCategory[category] = []
      }
      byCategory[category].push(item)
    }

    // Sort categories by predefined order
    return CATEGORY_ORDER
      .filter(cat => byCategory[cat]?.length > 0)
      .map(cat => ({
        category: cat,
        features: byCategory[cat].sort((a, b) =>
          a.featureName.localeCompare(b.featureName)
        ),
      }))
  }, [data])

  // Calculate max value for color scaling
  const maxValue = useMemo(() => {
    let max = 0
    for (const item of data) {
      if (item.byPlan) {
        for (const count of Object.values(item.byPlan)) {
          if (count > max) max = count
        }
      }
    }
    return max
  }, [data])

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No usage data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b font-medium">Feature</th>
                  {PLAN_TIERS.map(tier => (
                    <th key={tier} className="text-center p-2 border-b font-medium min-w-[100px]">
                      {tier.charAt(0) + tier.slice(1).toLowerCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {organizedData.map(({ category, features }) => (
                  <>
                    <tr key={`category-${category}`}>
                      <td
                        colSpan={PLAN_TIERS.length + 1}
                        className="bg-muted/50 p-2 font-semibold text-sm uppercase tracking-wider"
                      >
                        {category}
                      </td>
                    </tr>
                    {features.map(feature => (
                      <tr key={feature.featureKey} className="hover:bg-muted/20">
                        <td className="p-2 border-b text-sm">
                          {feature.featureName}
                        </td>
                        {PLAN_TIERS.map(tier => {
                          const value = feature.byPlan?.[tier] || 0
                          return (
                            <td key={tier} className="p-1 border-b">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "w-full h-8 rounded flex items-center justify-center text-xs font-medium cursor-default",
                                      getHeatmapColor(value, maxValue),
                                      value > 0 && "text-emerald-900"
                                    )}
                                  >
                                    {value > 0 ? value.toLocaleString() : "-"}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium">{feature.featureName}</p>
                                  <p className="text-muted-foreground">
                                    {tier}: {value.toLocaleString()} events
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Usage intensity:</span>
            <div className="flex items-center gap-1">
              <div className="w-6 h-4 rounded bg-muted" />
              <span className="text-xs text-muted-foreground">None</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-4 rounded bg-emerald-100" />
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-4 rounded bg-emerald-300" />
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-4 rounded bg-emerald-500" />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
