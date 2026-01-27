"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle } from "lucide-react"
import type { Incident } from "./IncidentCard"

interface StatusTimelineProps {
  incidents: Incident[]
  days?: number
  className?: string
}


interface DayStatus {
  date: Date
  status: "operational" | "minor" | "major" | "critical"
  incidents: Incident[]
}

export function StatusTimeline({
  incidents,
  days = 30,
  className,
}: StatusTimelineProps) {
  // Generate array of last N days
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dayStatuses: DayStatus[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Find incidents that occurred on this day
    const dayIncidents = incidents.filter((incident) => {
      const startDate = new Date(incident.startedAt)
      startDate.setHours(0, 0, 0, 0)
      const endDate = incident.resolvedAt
        ? new Date(incident.resolvedAt)
        : new Date()
      endDate.setHours(23, 59, 59, 999)

      return date >= startDate && date <= endDate
    })

    // Determine the worst impact for the day
    let status: DayStatus["status"] = "operational"
    for (const incident of dayIncidents) {
      if (incident.impact === "CRITICAL") {
        status = "major" // Map CRITICAL to major since critical isn't in DayStatus type
        break
      } else if (incident.impact === "MAJOR" && status !== "major") {
        status = "major"
      } else if (incident.impact === "MINOR" && status === "operational") {
        status = "minor"
      }
    }

    dayStatuses.push({ date, status, incidents: dayIncidents })
  }

  const statusColors: Record<DayStatus["status"], string> = {
    operational: "bg-green-500 hover:bg-green-400",
    minor: "bg-yellow-500 hover:bg-yellow-400",
    major: "bg-orange-500 hover:bg-orange-400",
    critical: "bg-red-500 hover:bg-red-400",
  }

  // Calculate uptime percentage
  const operationalDays = dayStatuses.filter((d) => d.status === "operational").length
  const uptimePercentage = ((operationalDays / days) * 100).toFixed(2)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Past {days} Days
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            {uptimePercentage}% uptime
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1">
          {dayStatuses.map((day, index) => (
            <div
              key={index}
              className="group relative flex-1"
              title={`${day.date.toLocaleDateString()}: ${
                day.status === "operational"
                  ? "No incidents"
                  : `${day.incidents.length} incident(s)`
              }`}
            >
              <div
                className={cn(
                  "h-8 rounded-sm cursor-pointer transition-colors",
                  statusColors[day.status]
                )}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-popover text-popover-foreground text-xs rounded-lg shadow-lg p-2 min-w-[150px] border">
                  <p className="font-medium">{day.date.toLocaleDateString()}</p>
                  {day.status === "operational" ? (
                    <p className="text-green-500 flex items-center gap-1 mt-1">
                      <CheckCircle className="h-3 w-3" /> No incidents
                    </p>
                  ) : (
                    <div className="mt-1 space-y-1">
                      {day.incidents.slice(0, 3).map((incident) => (
                        <p
                          key={incident.id}
                          className="text-muted-foreground truncate"
                        >
                          {incident.title}
                        </p>
                      ))}
                      {day.incidents.length > 3 && (
                        <p className="text-muted-foreground">
                          +{day.incidents.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>{dayStatuses[0]?.date.toLocaleDateString()}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-green-500" />
              Operational
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-yellow-500" />
              Minor
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-orange-500" />
              Major
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-red-500" />
              Critical
            </span>
          </div>
          <span>Today</span>
        </div>
      </CardContent>
    </Card>
  )
}
