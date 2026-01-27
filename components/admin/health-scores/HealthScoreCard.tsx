/**
 * @prompt-id forge-v4.1:feature:customer-health-scoring:005
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { HeartPulse, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface HealthScoreCardProps {
  title: string
  score: number
  description?: string
  trend?: number // Percentage change from previous period
  size?: "default" | "large"
  className?: string
}

export function HealthScoreCard({
  title,
  score,
  description,
  trend,
  size = "default",
  className,
}: HealthScoreCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 70) return "text-green-500"
    if (value >= 50) return "text-amber-500"
    if (value >= 30) return "text-orange-500"
    return "text-red-500"
  }

  const getTrendIcon = () => {
    if (trend === undefined || trend === null) return null
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getTrendColor = () => {
    if (trend === undefined || trend === null) return ""
    if (trend > 0) return "text-green-500"
    if (trend < 0) return "text-red-500"
    return "text-muted-foreground"
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className={cn("flex flex-row items-center justify-between", size === "large" ? "pb-4" : "pb-2")}>
        <div>
          <CardTitle className={cn("font-medium", size === "large" ? "text-lg" : "text-sm")}>
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-1">{description}</CardDescription>
          )}
        </div>
        <HeartPulse className={cn("text-muted-foreground", size === "large" ? "h-5 w-5" : "h-4 w-4")} />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className={cn("font-bold", getScoreColor(score), size === "large" ? "text-4xl" : "text-2xl")}>
              {score}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          {trend !== undefined && trend !== null && (
            <div className={cn("flex items-center gap-1 text-sm", getTrendColor())}>
              {getTrendIcon()}
              <span>{trend > 0 ? "+" : ""}{trend}%</span>
            </div>
          )}
        </div>
        <Progress
          value={score}
          className={cn("mt-3", size === "large" ? "h-3" : "h-2")}
        />
      </CardContent>
    </Card>
  )
}
