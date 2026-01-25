/**
 * @prompt-id forge-v4.1:feature:revenue-analytics:006
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Target,
  Percent,
  Activity,
} from "lucide-react"

interface RevenueOverviewCardsProps {
  summary: {
    currentMrr: number
    currentArr: number
    mrrGrowthRate: number
    customerGrowthRate: number
    totalCustomers: number
    churnRate: number
    netRevenueRetention: number
    arpu: number
    ltv: number
  }
  isLoading?: boolean
}

export function RevenueOverviewCards({ summary, isLoading }: RevenueOverviewCardsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 bg-muted rounded w-20" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-24 mb-2" />
              <div className="h-3 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "Monthly Recurring Revenue",
      value: formatCurrency(summary.currentMrr),
      change: summary.mrrGrowthRate,
      icon: DollarSign,
      description: "Current MRR",
    },
    {
      title: "Annual Recurring Revenue",
      value: formatCurrency(summary.currentArr),
      change: summary.mrrGrowthRate,
      icon: BarChart3,
      description: "Annualized revenue",
    },
    {
      title: "Total Customers",
      value: summary.totalCustomers.toLocaleString(),
      change: summary.customerGrowthRate,
      icon: Users,
      description: "Active subscriptions",
    },
    {
      title: "ARPU",
      value: formatCurrency(summary.arpu),
      icon: Target,
      description: "Avg revenue per user",
    },
    {
      title: "Customer LTV",
      value: formatCurrency(summary.ltv),
      icon: Activity,
      description: "Lifetime value",
    },
    {
      title: "Churn Rate",
      value: `${summary.churnRate.toFixed(2)}%`,
      icon: TrendingDown,
      description: "Monthly churn",
      inverse: true,
    },
    {
      title: "Net Revenue Retention",
      value: `${summary.netRevenueRetention.toFixed(1)}%`,
      icon: Percent,
      description: "NRR (including expansion)",
      threshold: 100,
    },
    {
      title: "MRR Growth",
      value: formatPercent(summary.mrrGrowthRate),
      change: summary.mrrGrowthRate,
      icon: TrendingUp,
      description: "Month over month",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        const isPositive = card.inverse
          ? (card.change ?? 0) < 0
          : (card.change ?? 0) >= 0
        const showTrend = card.change !== undefined

        // Special handling for threshold-based coloring (like NRR)
        let valueColor = ""
        if (card.threshold !== undefined) {
          const numValue = parseFloat(card.value)
          valueColor = numValue >= card.threshold ? "text-green-500" : "text-yellow-500"
        } else if (card.inverse) {
          // For inverse metrics like churn, lower is better
          const numValue = parseFloat(card.value)
          valueColor = numValue <= 5 ? "text-green-500" : numValue <= 10 ? "text-yellow-500" : "text-red-500"
        }

        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${valueColor}`}>
                {card.value}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {showTrend && (
                  <>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={isPositive ? "text-green-500" : "text-red-500"}>
                      {formatPercent(card.change!)}
                    </span>
                    <span className="ml-1">vs last period</span>
                  </>
                )}
                {!showTrend && <span>{card.description}</span>}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
