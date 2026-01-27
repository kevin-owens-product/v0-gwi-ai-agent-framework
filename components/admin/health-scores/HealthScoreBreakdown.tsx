/**
 * @prompt-id forge-v4.1:feature:customer-health-scoring:007
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  Activity,
  Users,
  Headphones,
  CreditCard,
  TrendingUp,
  Info,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface HealthScoreBreakdownProps {
  usageScore: number
  engagementScore: number
  supportScore: number
  paymentScore: number
  growthScore: number
  metadata?: {
    calculationDetails?: {
      apiCalls?: number
      logins?: number
      featureUsageCount?: number
      activeUsers?: number
      totalMembers?: number
      ticketCount?: number
      avgResolutionTime?: number
      paymentSuccess?: number
      paymentFailures?: number
      userGrowth?: number
      usageGrowth?: number
    }
  }
  className?: string
}

export function HealthScoreBreakdown({
  usageScore,
  engagementScore,
  supportScore,
  paymentScore,
  growthScore,
  metadata,
  className,
}: HealthScoreBreakdownProps) {
  const getScoreColor = (value: number) => {
    if (value >= 70) return "text-green-500"
    if (value >= 50) return "text-amber-500"
    if (value >= 30) return "text-orange-500"
    return "text-red-500"
  }

  const details = metadata?.calculationDetails

  const components = [
    {
      name: "Usage",
      score: usageScore,
      weight: "25%",
      icon: Activity,
      description: "API calls, token usage, and feature utilization",
      detail: details ? `${details.apiCalls?.toLocaleString() || 0} API calls, ${details.featureUsageCount || 0} features used` : undefined,
    },
    {
      name: "Engagement",
      score: engagementScore,
      weight: "25%",
      icon: Users,
      description: "Active users and login frequency",
      detail: details ? `${details.activeUsers || 0}/${details.totalMembers || 0} active users, ${details.logins || 0} logins` : undefined,
    },
    {
      name: "Support",
      score: supportScore,
      weight: "15%",
      icon: Headphones,
      description: "Ticket volume and resolution time",
      detail: details ? `${details.ticketCount || 0} tickets, ~${details.avgResolutionTime || 0}h avg resolution` : undefined,
    },
    {
      name: "Payment",
      score: paymentScore,
      weight: "20%",
      icon: CreditCard,
      description: "Payment success rate and billing health",
      detail: details ? `${details.paymentSuccess || 0} successful, ${details.paymentFailures || 0} failed` : undefined,
    },
    {
      name: "Growth",
      score: growthScore,
      weight: "15%",
      icon: TrendingUp,
      description: "User and usage growth trends",
      detail: details ? `${details.userGrowth || 0}% user growth, ${details.usageGrowth || 0}% usage growth` : undefined,
    },
  ]

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Score Breakdown</CardTitle>
        <CardDescription>Detailed analysis of health score components</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TooltipProvider>
          {components.map((component) => {
            const Icon = component.icon
            return (
              <div key={component.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{component.name}</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-medium">{component.description}</p>
                        {component.detail && (
                          <p className="text-xs text-muted-foreground mt-1">{component.detail}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {component.weight}
                    </span>
                    <span className={cn("font-bold tabular-nums", getScoreColor(component.score))}>
                      {component.score}
                    </span>
                  </div>
                </div>
                <Progress
                  value={component.score}
                  className="h-2"
                />
              </div>
            )
          })}
        </TooltipProvider>

        {/* Weight explanation */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Overall score is calculated as: Usage (25%) + Engagement (25%) + Support (15%) + Payment (20%) + Growth (15%)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
