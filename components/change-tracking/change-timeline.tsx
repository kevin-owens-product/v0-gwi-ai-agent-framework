"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  History,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCcw,
  Trash2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ChangeTimelineEntry {
  id: string
  entityType: string
  entityId: string
  entityName: string
  changeType: "CREATE" | "UPDATE" | "DELETE" | "REGENERATE" | "RESTORE"
  summary: string
  changedFields: string[]
  isSignificant: boolean
  createdBy: string | null
  createdAt: string
}

interface ChangeTimelineProps {
  orgId?: string
  entityTypes?: string[]
  significantOnly?: boolean
  limit?: number
  onViewDetails?: (entityType: string, entityId: string) => void
  className?: string
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  audience: "Audiences",
  crosstab: "Crosstabs",
  insight: "Insights",
  chart: "Charts",
  report: "Reports",
  dashboard: "Dashboards",
  brand_tracking: "Brand Tracking",
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  audience: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  crosstab: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  insight: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  chart: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  report: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  dashboard: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  brand_tracking: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
}

export function ChangeTimeline({
  entityTypes,
  significantOnly = false,
  limit = 50,
  onViewDetails,
  className,
}: ChangeTimelineProps) {
  const [changes, setChanges] = useState<ChangeTimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [filterType, setFilterType] = useState<string>("all")
  const [showSignificantOnly, setShowSignificantOnly] = useState(significantOnly)

  useEffect(() => {
    fetchChanges()
  }, [filterType, showSignificantOnly])

  const fetchChanges = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("limit", String(limit))
      if (filterType !== "all") {
        params.set("entityTypes", filterType)
      }
      if (showSignificantOnly) {
        params.set("significantOnly", "true")
      }

      const response = await fetch(`/api/v1/changes?${params}`)
      if (response.ok) {
        const data = await response.json()
        setChanges(data.changes)
        setTotal(data.total)
      }
    } catch (error) {
      console.error("Failed to fetch changes:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getChangeIcon = (changeType: ChangeTimelineEntry["changeType"]) => {
    switch (changeType) {
      case "CREATE":
        return <Plus className="h-4 w-4 text-green-500" />
      case "UPDATE":
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />
      case "DELETE":
        return <Trash2 className="h-4 w-4 text-red-500" />
      case "REGENERATE":
        return <RefreshCcw className="h-4 w-4 text-purple-500" />
      case "RESTORE":
        return <History className="h-4 w-4 text-amber-500" />
    }
  }

  const getChangeTypeLabel = (changeType: ChangeTimelineEntry["changeType"]) => {
    switch (changeType) {
      case "CREATE":
        return "Created"
      case "UPDATE":
        return "Updated"
      case "DELETE":
        return "Deleted"
      case "REGENERATE":
        return "Regenerated"
      case "RESTORE":
        return "Restored"
    }
  }

  // Group changes by date
  const groupedChanges = changes.reduce((groups, change) => {
    const date = new Date(change.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(change)
    return groups
  }, {} as Record<string, ChangeTimelineEntry[]>)

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Change Timeline</h3>
          <Badge variant="secondary">{total} changes</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showSignificantOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSignificantOnly(!showSignificantOnly)}
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            Significant
          </Button>
        </div>
      </div>

      {/* Timeline */}
      {changes.length === 0 ? (
        <Card className="p-8 text-center">
          <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-medium mb-2">No Changes Found</h4>
          <p className="text-sm text-muted-foreground">
            There are no changes matching your current filters.
          </p>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          {/* Grouped by date */}
          {Object.entries(groupedChanges).map(([date, dayChanges]) => (
            <div key={date} className="mb-6">
              {/* Date header */}
              <div className="relative pl-10 mb-3">
                <div className="absolute left-2 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  {new Date(date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Changes for this date */}
              <div className="space-y-3">
                {dayChanges.map((change) => (
                  <div key={change.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className="absolute left-2.5 w-3 h-3 rounded-full bg-background border-2 border-muted-foreground" />

                    <Card
                      className={cn(
                        "p-4 transition-all hover:border-primary/50 cursor-pointer",
                        change.isSignificant && "border-l-4 border-l-amber-500"
                      )}
                      onClick={() => toggleExpanded(change.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getChangeIcon(change.changeType)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="secondary"
                                className={cn("text-xs", ENTITY_TYPE_COLORS[change.entityType])}
                              >
                                {ENTITY_TYPE_LABELS[change.entityType] || change.entityType}
                              </Badge>
                              <span className="font-medium">{change.entityName}</span>
                              {change.isSignificant && (
                                <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                                  Significant
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {change.summary}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>{getChangeTypeLabel(change.changeType)}</span>
                              <span>•</span>
                              <span>{formatTime(change.createdAt)}</span>
                              {change.createdBy && (
                                <>
                                  <span>•</span>
                                  <span>by {change.createdBy}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {onViewDetails && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onViewDetails(change.entityType, change.entityId)
                              }}
                            >
                              View
                            </Button>
                          )}
                          {expandedItems.has(change.id) ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Expanded content */}
                      {expandedItems.has(change.id) && change.changedFields.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Changed Fields
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {change.changedFields.map((field) => (
                              <Badge key={field} variant="outline" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
