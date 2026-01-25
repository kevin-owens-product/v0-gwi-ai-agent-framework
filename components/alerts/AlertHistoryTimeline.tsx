/**
 * @prompt-id forge-v4.1:feature:custom-alerts:008
 * @generated-at 2024-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState } from "react"
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

const CHANNEL_LABELS: Record<string, string> = {
  EMAIL: 'Email',
  SLACK: 'Slack',
  WEBHOOK: 'Webhook',
  IN_APP: 'In-App',
  SMS: 'SMS',
}

export function AlertHistoryTimeline({
  history,
  isLoading = false,
  onAcknowledge,
  className,
}: AlertHistoryTimelineProps) {
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

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
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
        <h4 className="font-medium mb-2">No Alert History</h4>
        <p className="text-sm text-muted-foreground">
          This alert has not been triggered yet.
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
                            <span className="text-muted-foreground">Current value: </span>
                            <span className="font-medium text-red-600 dark:text-red-400">
                              {JSON.stringify(entry.currentValue)}
                            </span>
                            {entry.previousValue !== null && (
                              <>
                                <span className="text-muted-foreground"> (was </span>
                                <span>{JSON.stringify(entry.previousValue)}</span>
                                <span className="text-muted-foreground">)</span>
                              </>
                            )}
                          </div>

                          {/* Notification channels */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">Notified via:</span>
                            {entry.notifiedVia.map((channel) => (
                              <Badge key={channel} variant="outline" className="text-xs">
                                {CHANNEL_LABELS[channel] || channel}
                              </Badge>
                            ))}
                          </div>

                          {/* Notes */}
                          {entry.notes && (
                            <div className="mt-3 p-2 bg-muted rounded-md text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>Notes</span>
                              </div>
                              {entry.notes}
                            </div>
                          )}

                          {/* Acknowledged info */}
                          {entry.acknowledgedAt && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {entry.status === 'ACKNOWLEDGED' ? 'Acknowledged' :
                               entry.status === 'RESOLVED' ? 'Resolved' : 'Ignored'}{' '}
                              {formatRelativeTime(entry.acknowledgedAt)}
                              {entry.acknowledgedBy && ` by ${entry.acknowledgedBy}`}
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
                                Acknowledge
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setAcknowledgeDialog({
                                  historyId: entry.id,
                                  status: 'RESOLVED',
                                })}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setAcknowledgeDialog({
                                  historyId: entry.id,
                                  status: 'IGNORED',
                                })}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Ignore
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
                            <span className="text-muted-foreground">Alert ID:</span>
                            <p className="font-mono text-xs">{entry.alertId}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">History ID:</span>
                            <p className="font-mono text-xs">{entry.id}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Triggered At:</span>
                            <p>{new Date(entry.triggeredAt).toLocaleString()}</p>
                          </div>
                          {entry.resolvedAt && (
                            <div>
                              <span className="text-muted-foreground">Resolved At:</span>
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
              {acknowledgeDialog?.status === 'ACKNOWLEDGED' && 'Acknowledge Alert'}
              {acknowledgeDialog?.status === 'RESOLVED' && 'Resolve Alert'}
              {acknowledgeDialog?.status === 'IGNORED' && 'Ignore Alert'}
            </DialogTitle>
            <DialogDescription>
              {acknowledgeDialog?.status === 'ACKNOWLEDGED' &&
                'Mark this alert as acknowledged. You can add notes to track your response.'}
              {acknowledgeDialog?.status === 'RESOLVED' &&
                'Mark this alert as resolved. Add notes explaining how the issue was addressed.'}
              {acknowledgeDialog?.status === 'IGNORED' &&
                'Mark this alert as ignored. Consider adding notes explaining why.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="Add notes about this alert..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcknowledgeDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleAcknowledge} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AlertHistoryTimeline
