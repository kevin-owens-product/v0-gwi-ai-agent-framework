"use client"

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

const statusConfig: Record<
  string,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
  }
> = {
  INVESTIGATING: {
    label: "Investigating",
    icon: Search,
    color: "text-orange-500",
    bgColor: "bg-orange-500",
  },
  IDENTIFIED: {
    label: "Identified",
    icon: AlertCircle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
  },
  MONITORING: {
    label: "Monitoring",
    icon: Activity,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500",
  },
  POSTMORTEM: {
    label: "Postmortem",
    icon: Clock,
    color: "text-gray-500",
    bgColor: "bg-gray-500",
  },
}

const impactConfig: Record<
  string,
  { label: string; color: string }
> = {
  NONE: { label: "None", color: "bg-gray-500" },
  MINOR: { label: "Minor", color: "bg-yellow-500" },
  MAJOR: { label: "Major", color: "bg-orange-500" },
  CRITICAL: { label: "Critical", color: "bg-red-500" },
}

export function IncidentCard({
  incident,
  showUpdates = true,
  maxUpdates = 5,
  className,
}: IncidentCardProps) {
  const statusInfo = statusConfig[incident.status] || statusConfig.INVESTIGATING
  const impactInfo = impactConfig[incident.impact] || impactConfig.NONE
  const StatusIcon = statusInfo.icon
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
              <StatusIcon className={cn("h-5 w-5", statusInfo.color)} />
              <CardTitle className="text-lg">{incident.title}</CardTitle>
            </div>
            <CardDescription>{incident.description}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={cn(statusInfo.bgColor, "text-white")}>
              {statusInfo.label}
            </Badge>
            <Badge variant="outline" className={cn("border-2", `border-${impactInfo.color.replace('bg-', '')}`)}>
              Impact: {impactInfo.label}
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
            <h4 className="text-sm font-semibold text-muted-foreground">Updates</h4>
            <div className="space-y-4 border-l-2 border-muted pl-4">
              {publicUpdates.map((update, index) => {
                const updateStatusInfo = statusConfig[update.status] || statusConfig.INVESTIGATING
                return (
                  <div key={update.id} className="relative">
                    <div
                      className={cn(
                        "absolute -left-[21px] h-3 w-3 rounded-full",
                        updateStatusInfo.bgColor
                      )}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {updateStatusInfo.label}
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
            <span>Started: {new Date(incident.startedAt).toLocaleString()}</span>
            {incident.resolvedAt && (
              <span>Resolved: {new Date(incident.resolvedAt).toLocaleString()}</span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
