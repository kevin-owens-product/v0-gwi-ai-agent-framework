"use client"

import { cn } from "@/lib/utils"
import { CheckCircle, AlertCircle, AlertTriangle, XCircle } from "lucide-react"

export type SystemStatus = "operational" | "degraded" | "partial_outage" | "major_outage"

interface StatusBadgeProps {
  status: SystemStatus
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const statusConfig: Record<
  SystemStatus,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    bgColor: string
    textColor: string
    dotColor: string
  }
> = {
  operational: {
    label: "All Systems Operational",
    icon: CheckCircle,
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
    dotColor: "bg-green-500",
  },
  degraded: {
    label: "Degraded Performance",
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-500",
    dotColor: "bg-yellow-500",
  },
  partial_outage: {
    label: "Partial Outage",
    icon: AlertCircle,
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-500",
    dotColor: "bg-orange-500",
  },
  major_outage: {
    label: "Major Outage",
    icon: XCircle,
    bgColor: "bg-red-500/10",
    textColor: "text-red-500",
    dotColor: "bg-red-500",
  },
}

const sizeConfig = {
  sm: {
    container: "px-2 py-1 text-xs gap-1.5",
    icon: "h-3 w-3",
    dot: "h-1.5 w-1.5",
  },
  md: {
    container: "px-3 py-1.5 text-sm gap-2",
    icon: "h-4 w-4",
    dot: "h-2 w-2",
  },
  lg: {
    container: "px-4 py-2 text-base gap-2.5",
    icon: "h-5 w-5",
    dot: "h-2.5 w-2.5",
  },
}

export function StatusBadge({
  status,
  showLabel = true,
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status]
  const sizes = sizeConfig[size]

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        config.bgColor,
        config.textColor,
        sizes.container,
        className
      )}
    >
      <span
        className={cn(
          "rounded-full animate-pulse",
          config.dotColor,
          sizes.dot
        )}
      />
      {showLabel && <span>{config.label}</span>}
    </div>
  )
}

export function StatusBadgeCompact({
  status,
  className,
}: {
  status: SystemStatus
  className?: string
}) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        config.textColor,
        className
      )}
      title={config.label}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="sr-only">{config.label}</span>
    </div>
  )
}
