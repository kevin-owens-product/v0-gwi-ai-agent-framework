/**
 * @prompt-id forge-v4.1:feature:customer-health-scoring:006
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle, AlertOctagon, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type ChurnRisk = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

interface ChurnRiskBadgeProps {
  risk: ChurnRisk
  showIcon?: boolean
  size?: "default" | "lg"
  className?: string
}

export function ChurnRiskBadge({
  risk,
  showIcon = true,
  size = "default",
  className,
}: ChurnRiskBadgeProps) {
  const t = useTranslations("admin.analytics.churnRisk")

  const config = {
    LOW: {
      label: t("low"),
      icon: CheckCircle,
      variant: "default" as const,
      className: "bg-green-500 hover:bg-green-500/80",
    },
    MEDIUM: {
      label: t("medium"),
      icon: AlertCircle,
      variant: "default" as const,
      className: "bg-amber-500 hover:bg-amber-500/80",
    },
    HIGH: {
      label: t("high"),
      icon: AlertTriangle,
      variant: "default" as const,
      className: "bg-orange-500 hover:bg-orange-500/80",
    },
    CRITICAL: {
      label: t("critical"),
      icon: AlertOctagon,
      variant: "destructive" as const,
      className: "",
    },
  }

  const { label, icon: Icon, variant, className: riskClassName } = config[risk]

  return (
    <Badge
      variant={variant}
      className={cn(
        "gap-1",
        riskClassName,
        size === "lg" && "text-sm px-3 py-1",
        className
      )}
    >
      {showIcon && <Icon className={cn("h-3 w-3", size === "lg" && "h-4 w-4")} />}
      {label}
    </Badge>
  )
}

export function getChurnRiskColor(risk: ChurnRisk): string {
  switch (risk) {
    case "LOW":
      return "text-green-500"
    case "MEDIUM":
      return "text-amber-500"
    case "HIGH":
      return "text-orange-500"
    case "CRITICAL":
      return "text-red-500"
    default:
      return "text-muted-foreground"
  }
}

export function getChurnRiskBackgroundColor(risk: ChurnRisk): string {
  switch (risk) {
    case "LOW":
      return "bg-green-500/10"
    case "MEDIUM":
      return "bg-amber-500/10"
    case "HIGH":
      return "bg-orange-500/10"
    case "CRITICAL":
      return "bg-red-500/10"
    default:
      return "bg-muted"
  }
}
