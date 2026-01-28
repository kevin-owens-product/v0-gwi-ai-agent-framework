"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock, CheckCircle, Search, Activity } from "lucide-react"

export interface IncidentUpdate {
  id: string
  status: string
  message: string
  createdAt: string
  isPublic: boolean
}

export interface Incident {
  id: string
  title: string
  description: string
  status: string
  impact: string
  affectedSystems: string[]
  startedAt: string
  resolvedAt: string | null
  updates: IncidentUpdate[]
}

interface IncidentCardProps {
  incident: Incident
  showUpdates?: boolean
  maxUpdates?: number
  className?: string
}

const statusIconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  INVESTIGATING: Search,
  IDENTIFIED: AlertCircle,
  MONITORING: Activity,
  RESOLVED: CheckCircle,
  POSTMORTEM: Clock,
}

const statusColorMap: Record<
  string,
  { color: string; bgColor: string }
> = {
  INVESTIGATING: { color: "text-orange-500", bgColor: "bg-orange-500" },
  IDENTIFIED: { color: "text-yellow-500", bgColor: "bg-yellow-500" },
  MONITORING: { color: "text-blue-500", bgColor: "bg-blue-500" },
  RESOLVED: { color: "text-green-500", bgColor: "bg-green-500" },
  POSTMORTEM: { color: "text-gray-500", bgColor: "bg-gray-500" },
}

const impactColorMap: Record<string, string> = {
  NONE: "bg-gray-500",
  MINOR: "bg-yellow-500",
  MAJOR: "bg-orange-500",
  CRITICAL: "bg-red-500",
}

export function IncidentCard({
  incident,
  showUpdates = true,
  maxUpdates = 5,
  className,
}: IncidentCardProps) {
  const t = useTranslations("status.incident")

  const statusKey = incident.status.toLowerCase() as "investigating" | "identified" | "monitoring" | "resolved" | "postmortem"
  const impactKey = incident.impact.toLowerCase() as "none" | "minor" | "major" | "critical"

  const StatusIcon = statusIconMap[incident.status] || statusIconMap.INVESTIGATING
  const statusColors = statusColorMap[incident.status] || statusColorMap.INVESTIGATING
  const impactColor = impactColorMap[incident.impact] || impactColorMap.NONE

  const isResolved = incident.status === "RESOLVED" || incident.status === "POSTMORTEM"

  const publicUpdates = incident.updates
    .filter((u) => u.isPublic)
    .slice(0, maxUpdates)

  return (
    <Card className={cn("", isResolved && "opacity-75", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-5 w-5", statusColors.color)} />
              <CardTitle className="text-lg">{incident.title}</CardTitle>
            </div>
            <CardDescription>{incident.description}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={cn(statusColors.bgColor, "text-white")}>
              {t(`status.${statusKey}`)}
            </Badge>
            <Badge variant="outline" className={cn("border-2", `border-${impactColor.replace('bg-', '')}`)}>
              {t("impact")}: {t(`impactLevel.${impactKey}`)}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {incident.affectedSystems.map((system) => (
            <Badge key={system} variant="secondary">
              {system}
            </Badge>
          ))}
        </div>
      </CardHeader>
      {showUpdates && publicUpdates.length > 0 && (
        <CardContent>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">{t("updates")}</h4>
            <div className="space-y-4 border-l-2 border-muted pl-4">
              {publicUpdates.map((update) => {
                const updateStatusKey = update.status.toLowerCase() as "investigating" | "identified" | "monitoring" | "resolved" | "postmortem"
                const updateStatusColors = statusColorMap[update.status] || statusColorMap.INVESTIGATING
                return (
                  <div key={update.id} className="relative">
                    <div
                      className={cn(
                        "absolute -left-[21px] h-3 w-3 rounded-full",
                        updateStatusColors.bgColor
                      )}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {t(`status.${updateStatusKey}`)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(update.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{update.message}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("started", { time: new Date(incident.startedAt).toLocaleString() })}</span>
            {incident.resolvedAt && (
              <span>{t("resolved", { time: new Date(incident.resolvedAt).toLocaleString() })}</span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
