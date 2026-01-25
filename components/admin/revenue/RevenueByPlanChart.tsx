/**
 * @prompt-id forge-v4.1:feature:revenue-analytics:008
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PlanBreakdown {
  plan: string
  customerCount: number
  mrr: number
  percentage: number
}

interface RevenueByPlanChartProps {
  data: PlanBreakdown[]
  totalMrr: number
  isLoading?: boolean
}

const PLAN_COLORS: Record<string, string> = {
  STARTER: "#94a3b8", // slate-400
  PROFESSIONAL: "#3b82f6", // blue-500
  ENTERPRISE: "#8b5cf6", // violet-500
}

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
}

export function RevenueByPlanChart({ data, totalMrr, isLoading }: RevenueByPlanChartProps) {
  const sortedData = useMemo(() => {
    const planOrder = ["ENTERPRISE", "PROFESSIONAL", "STARTER"]
    return [...data].sort((a, b) =>
      planOrder.indexOf(a.plan) - planOrder.indexOf(b.plan)
    )
  }, [data])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Plan</CardTitle>
          <CardDescription>Loading plan distribution...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse">
              <div className="w-48 h-48 rounded-full bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0 || totalMrr === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Plan</CardTitle>
          <CardDescription>Distribution across plan tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No revenue data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate pie chart segments
  let cumulativePercentage = 0
  const segments = sortedData.map((item) => {
    const startAngle = cumulativePercentage * 3.6 // 360 degrees / 100
    cumulativePercentage += item.percentage
    const endAngle = cumulativePercentage * 3.6

    return {
      ...item,
      startAngle,
      endAngle,
      color: PLAN_COLORS[item.plan] || "#6b7280",
    }
  })

  // Create SVG path for pie segment
  const createPieSegment = (
    startAngle: number,
    endAngle: number,
    radius: number,
    innerRadius: number = 0
  ) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180
    const endRad = ((endAngle - 90) * Math.PI) / 180

    const x1 = Math.cos(startRad) * radius + radius
    const y1 = Math.sin(startRad) * radius + radius
    const x2 = Math.cos(endRad) * radius + radius
    const y2 = Math.sin(endRad) * radius + radius

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

    if (innerRadius > 0) {
      const innerX1 = Math.cos(startRad) * innerRadius + radius
      const innerY1 = Math.sin(startRad) * innerRadius + radius
      const innerX2 = Math.cos(endRad) * innerRadius + radius
      const innerY2 = Math.sin(endRad) * innerRadius + radius

      return `M ${x1} ${y1}
              A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
              L ${innerX2} ${innerY2}
              A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}
              Z`
    }

    return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Plan</CardTitle>
        <CardDescription>Distribution across plan tiers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-8">
          {/* Donut chart */}
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {segments.map((segment) => {
                // Handle full circle case
                if (segment.percentage >= 99.9) {
                  return (
                    <circle
                      key={segment.plan}
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="40"
                    />
                  )
                }

                return (
                  <path
                    key={segment.plan}
                    d={createPieSegment(segment.startAngle, segment.endAngle, 100, 60)}
                    fill={segment.color}
                    className="transition-opacity hover:opacity-80 cursor-pointer"
                  />
                )
              })}
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{formatCurrency(totalMrr)}</span>
              <span className="text-xs text-muted-foreground">Total MRR</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-4">
            {sortedData.map((item) => (
              <div key={item.plan} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: PLAN_COLORS[item.plan] || "#6b7280" }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {PLAN_DISPLAY_NAMES[item.plan] || item.plan}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {item.customerCount} customers
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatCurrency(item.mrr)}</span>
                    <span>({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ARPU by plan */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">ARPU by Plan</h4>
          <div className="grid grid-cols-3 gap-4">
            {sortedData.map((item) => (
              <div key={item.plan} className="text-center">
                <div className="text-lg font-semibold">
                  {item.customerCount > 0
                    ? formatCurrency(item.mrr / item.customerCount)
                    : "$0"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {PLAN_DISPLAY_NAMES[item.plan] || item.plan}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
