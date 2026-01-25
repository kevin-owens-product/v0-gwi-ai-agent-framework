"use client"

import { cn } from "@/lib/utils"
import { StatusBadge, SystemStatus } from "./StatusBadge"
import { CheckCircle, AlertCircle, AlertTriangle, XCircle, Server } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SystemComponent {
  name: string
  status: SystemStatus
  description?: string
}

interface StatusOverviewProps {
  overallStatus: SystemStatus
  components: SystemComponent[]
  lastUpdated?: Date
  className?: string
}

const statusConfig: Record<
  SystemStatus,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    bgColor: string
    borderColor: string
    textColor: string
  }
> = {
  operational: {
    label: "Operational",
    icon: CheckCircle,
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    textColor: "text-green-500",
  },
  degraded: {
    label: "Degraded",
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    textColor: "text-yellow-500",
  },
  partial_outage: {
    label: "Partial Outage",
    icon: AlertCircle,
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    textColor: "text-orange-500",
  },
  major_outage: {
    label: "Major Outage",
    icon: XCircle,
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    textColor: "text-red-500",
  },
}

function ComponentStatus({ component }: { component: SystemComponent }) {
  const config = statusConfig[component.status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border",
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-center gap-3">
        <Server className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">{component.name}</p>
          {component.description && (
            <p className="text-sm text-muted-foreground">{component.description}</p>
          )}
        </div>
      </div>
      <div className={cn("flex items-center gap-2", config.textColor)}>
        <Icon className="h-5 w-5" />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    </div>
  )
}

export function StatusOverview({
  overallStatus,
  components,
  lastUpdated,
  className,
}: StatusOverviewProps) {
  const config = statusConfig[overallStatus]
  const Icon = config.icon

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Icon className={cn("h-8 w-8", config.textColor)} />
            <div>
              <StatusBadge status={overallStatus} size="lg" />
              {lastUpdated && (
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              )}
            </div>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {components.map((component) => (
          <ComponentStatus key={component.name} component={component} />
        ))}
      </CardContent>
    </Card>
  )
}
