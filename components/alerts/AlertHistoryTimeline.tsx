/**
 * @prompt-id forge-v4.1:feature:custom-alerts:008
 * @generated-at 2024-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertStatusBadge } from "./AlertStatusBadge"
import type { AlertHistoryEntry, AlertStatus } from "@/hooks/use-alerts"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  MoreVertical,
  MessageSquare,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface AlertHistoryTimelineProps {
  history: AlertHistoryEntry[]
  isLoading?: boolean
  onAcknowledge?: (historyId: string, status: 'ACKNOWLEDGED' | 'RESOLVED' | 'IGNORED', notes?: string) => Promise<void>
  className?: string
}

export function AlertHistoryTimeline({
  history,
  isLoading = false,
  onAcknowledge,
  className,
}: AlertHistoryTimelineProps) {
  const t = useTranslations("alerts")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [acknowledgeDialog, setAcknowledgeDialog] = useState<{
    historyId: string
    status: 'ACKNOWLEDGED' | 'RESOLVED' | 'IGNORED'
  } | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t("history.justNow")
    if (diffMins < 60) return t("history.minutesAgo", { count: diffMins })
    if (diffHours < 24) return t("history.hoursAgo", { count: diffHours })
    if (diffDays === 1) return t("history.yesterday")
    if (diffDays < 7) return t("history.daysAgo", { count: diffDays })
    return formatDate(dateString)
  }

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case 'TRIGGERED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'ACKNOWLEDGED':
        return <Bell className="h-4 w-4 text-amber-500" />
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'IGNORED':
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const handleAcknowledge = async () => {
    if (!acknowledgeDialog || !onAcknowledge) return

    setIsSubmitting(true)
    try {
      await onAcknowledge(acknowledgeDialog.historyId, acknowledgeDialog.status, notes)
      setAcknowledgeDialog(null)
      setNotes('')
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Group history by date
  const groupedHistory = history.reduce((groups, entry) => {
    const date = new Date(entry.triggeredAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, AlertHistoryEntry[]>)

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h4 className="font-medium mb-2">{t("history.noHistory")}</h4>
        <p className="text-sm text-muted-foreground">
          {t("history.noHistoryDescription")}
        </p>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

        {/* Grouped by date */}
        {Object.entries(groupedHistory).map(([date, entries]) => (
          <div key={date} className="mb-6">
            {/* Date header */}
            <div className="relative pl-10 mb-3">
              <div className="absolute left-2 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {formatDate(entries[0].triggeredAt)}
              </span>
            </div>

            {/* Entries for this date */}
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className="absolute left-2.5 w-3 h-3 rounded-full bg-background border-2 border-muted-foreground" />

                  <Card
                    className={cn(
                      "p-4 transition-all hover:border-primary/50",
                      entry.status === 'TRIGGERED' && "border-l-4 border-l-red-500"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getStatusIcon(entry.status)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <AlertStatusBadge status={entry.status} size="sm" />
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTime(entry.triggeredAt)}
                            </div>
                          </div>

                          {/* Condition snapshot */}
                          <p className="text-sm text-muted-foreground mt-1">
                            {entry.condition.metric}{' '}
                            <span className="font-medium">
                              {entry.condition.operator === 'gt' ? '>' :
                               entry.condition.operator === 'lt' ? '<' :
                               entry.condition.operator === 'gte' ? '>=' :
                               entry.condition.operator === 'lte' ? '<=' :
                               entry.condition.operator === 'eq' ? '=' : '!='}
                            </span>{' '}
                            {entry.condition.value}
                            {entry.condition.unit ? ` ${entry.condition.unit}` : ''}
                          </p>

                          {/* Current value */}
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">{t("history.currentValue")}: </span>
                            <span className="font-medium text-red-600 dark:text-red-400">
                              {JSON.stringify(entry.currentValue)}
                            </span>
                            {entry.previousValue !== null && (
                              <>
                                <span className="text-muted-foreground"> ({t("history.was")} </span>
                                <span>{JSON.stringify(entry.previousValue)}</span>
                                <span className="text-muted-foreground">)</span>
                              </>
                            )}
                          </div>

                          {/* Notification channels */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">{t("history.notifiedVia")}:</span>
                            {entry.notifiedVia.map((channel) => (
                              <Badge key={channel} variant="outline" className="text-xs">
                                {t(`form.channels.${channel}`)}
                              </Badge>
                            ))}
                          </div>

                          {/* Notes */}
                          {entry.notes && (
                            <div className="mt-3 p-2 bg-muted rounded-md text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{t("history.notes")}</span>
                              </div>
                              {entry.notes}
                            </div>
                          )}

                          {/* Acknowledged info */}
                          {entry.acknowledgedAt && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {entry.status === 'ACKNOWLEDGED' ? t("history.acknowledged") :
                               entry.status === 'RESOLVED' ? t("history.resolved") : t("history.ignored")}{' '}
                              {formatRelativeTime(entry.acknowledgedAt)}
                              {entry.acknowledgedBy && ` ${t("history.by")} ${entry.acknowledgedBy}`}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Action menu */}
                        {entry.status === 'TRIGGERED' && onAcknowledge && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setAcknowledgeDialog({
                                  historyId: entry.id,
                                  status: 'ACKNOWLEDGED',
                                })}
                              >
                                <Bell className="h-4 w-4 mr-2" />
                                {t("history.actions.acknowledge")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setAcknowledgeDialog({
                                  historyId: entry.id,
                                  status: 'RESOLVED',
                                })}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {t("history.actions.markResolved")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setAcknowledgeDialog({
                                  historyId: entry.id,
                                  status: 'IGNORED',
                                })}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                {t("history.actions.ignore")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {/* Expand/collapse */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleExpanded(entry.id)}
                        >
                          {expandedItems.has(entry.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expandedItems.has(entry.id) && (
                      <div className="mt-4 pt-4 border-t text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-muted-foreground">{t("history.alertId")}:</span>
                            <p className="font-mono text-xs">{entry.alertId}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("history.historyId")}:</span>
                            <p className="font-mono text-xs">{entry.id}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("history.triggeredAt")}:</span>
                            <p>{new Date(entry.triggeredAt).toLocaleString()}</p>
                          </div>
                          {entry.resolvedAt && (
                            <div>
                              <span className="text-muted-foreground">{t("history.resolvedAt")}:</span>
                              <p>{new Date(entry.resolvedAt).toLocaleString()}</p>
                            </div>
                          )}
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

      {/* Acknowledge Dialog */}
      <Dialog open={!!acknowledgeDialog} onOpenChange={() => setAcknowledgeDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {acknowledgeDialog?.status === 'ACKNOWLEDGED' && t("history.dialog.acknowledgeTitle")}
              {acknowledgeDialog?.status === 'RESOLVED' && t("history.dialog.resolveTitle")}
              {acknowledgeDialog?.status === 'IGNORED' && t("history.dialog.ignoreTitle")}
            </DialogTitle>
            <DialogDescription>
              {acknowledgeDialog?.status === 'ACKNOWLEDGED' &&
                t("history.dialog.acknowledgeDescription")}
              {acknowledgeDialog?.status === 'RESOLVED' &&
                t("history.dialog.resolveDescription")}
              {acknowledgeDialog?.status === 'IGNORED' &&
                t("history.dialog.ignoreDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("history.dialog.notesLabel")}</label>
              <Textarea
                placeholder={t("history.dialog.notesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcknowledgeDialog(null)}>
              {t("history.dialog.cancel")}
            </Button>
            <Button onClick={handleAcknowledge} disabled={isSubmitting}>
              {isSubmitting ? t("history.dialog.saving") : t("history.dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AlertHistoryTimeline
