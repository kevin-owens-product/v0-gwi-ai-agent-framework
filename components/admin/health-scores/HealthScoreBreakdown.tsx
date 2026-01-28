/**
 * @prompt-id forge-v4.1:feature:customer-health-scoring:007
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useTranslations } from "next-intl"
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
  const t = useTranslations("admin.healthScores.breakdown")
  
  const getScoreColor = (value: number) => {
    if (value >= 70) return "text-green-500"
    if (value >= 50) return "text-amber-500"
    if (value >= 30) return "text-orange-500"
    return "text-red-500"
  }

  const details = metadata?.calculationDetails

  const components = [
    {
      name: t("usage.name"),
      score: usageScore,
      weight: t("usage.weight"),
      icon: Activity,
      description: t("usage.description"),
      detail: details ? `${t("apiCalls", { count: details.apiCalls?.toLocaleString() || 0 })}, ${t("featuresUsed", { count: details.featureUsageCount || 0 })}` : undefined,
    },
    {
      name: t("engagement.name"),
      score: engagementScore,
      weight: t("engagement.weight"),
      icon: Users,
      description: t("engagement.description"),
      detail: details ? `${t("activeUsers", { active: details.activeUsers || 0, total: details.totalMembers || 0 })}, ${t("logins", { count: details.logins || 0 })}` : undefined,
    },
    {
      name: t("support.name"),
      score: supportScore,
      weight: t("support.weight"),
      icon: Headphones,
      description: t("support.description"),
      detail: details ? `${t("tickets", { count: details.ticketCount || 0 })}, ${t("avgResolution", { hours: details.avgResolutionTime || 0 })}` : undefined,
    },
    {
      name: t("payment.name"),
      score: paymentScore,
      weight: t("payment.weight"),
      icon: CreditCard,
      description: t("payment.description"),
      detail: details ? `${t("paymentSuccess", { count: details.paymentSuccess || 0 })}, ${t("paymentFailures", { count: details.paymentFailures || 0 })}` : undefined,
    },
    {
      name: t("growth.name"),
      score: growthScore,
      weight: t("growth.weight"),
      icon: TrendingUp,
      description: t("growth.description"),
      detail: details ? `${t("userGrowth", { percent: details.userGrowth || 0 })}, ${t("usageGrowth", { percent: details.usageGrowth || 0 })}` : undefined,
    },
  ]

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
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
            {t("formula")}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
