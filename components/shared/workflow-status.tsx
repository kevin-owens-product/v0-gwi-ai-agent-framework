"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  FileEdit,
  Eye,
  CheckCircle2,
  Archive,
  Clock,
  Send,
  UserPlus,
  Calendar,
  AlertCircle,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type WorkflowStatus = "draft" | "in_review" | "approved" | "archived"

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus
  className?: string
}

interface Reviewer {
  id: string
  name: string
  email: string
  avatar?: string
  status: "pending" | "approved" | "rejected"
  reviewedAt?: string
}

interface WorkflowHistoryItem {
  id: string
  status: WorkflowStatus
  changedBy: string
  changedAt: string
  comment?: string
}

interface WorkflowStatusManagerProps {
  resourceType: "audience" | "crosstab"
  resourceId: string
  resourceName: string
  currentStatus: WorkflowStatus
  reviewers: Reviewer[]
  dueDate?: string
  history: WorkflowHistoryItem[]
  onStatusChange?: (newStatus: WorkflowStatus, comment?: string) => void
  onAddReviewer?: (userId: string) => void
  onRemoveReviewer?: (userId: string) => void
  onSetDueDate?: (date: string) => void
  className?: string
}

const statusConfig: Record<WorkflowStatus, {
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
}> = {
  draft: {
    label: "Draft",
    icon: <FileEdit className="h-4 w-4" />,
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
  in_review: {
    label: "In Review",
    icon: <Eye className="h-4 w-4" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  approved: {
    label: "Approved",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  archived: {
    label: "Archived",
    icon: <Archive className="h-4 w-4" />,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
}

export function WorkflowStatusBadge({ status, className }: WorkflowStatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge className={cn("gap-1", config.bgColor, config.color, className)}>
      {config.icon}
      {config.label}
    </Badge>
  )
}

export function WorkflowStatusManager({
  resourceType: _resourceType,
  resourceId: _resourceId,
  resourceName,
  currentStatus,
  reviewers,
  dueDate,
  history,
  onStatusChange,
  onAddReviewer: _onAddReviewer,
  onRemoveReviewer: _onRemoveReviewer,
  onSetDueDate: _onSetDueDate,
  className,
}: WorkflowStatusManagerProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<WorkflowStatus>(currentStatus)
  const [statusComment, setStatusComment] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async () => {
    setIsUpdating(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    onStatusChange?.(newStatus, statusComment)
    setShowStatusDialog(false)
    setStatusComment("")
    setIsUpdating(false)
  }

  const getNextStatuses = (current: WorkflowStatus): WorkflowStatus[] => {
    switch (current) {
      case "draft":
        return ["in_review", "archived"]
      case "in_review":
        return ["draft", "approved", "archived"]
      case "approved":
        return ["draft", "archived"]
      case "archived":
        return ["draft"]
      default:
        return []
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const approvedCount = reviewers.filter(r => r.status === "approved").length
  const _pendingCount = reviewers.filter(r => r.status === "pending").length

  const isDueSoon = dueDate && new Date(dueDate).getTime() - Date.now() < 24 * 60 * 60 * 1000
  const isOverdue = dueDate && new Date(dueDate) < new Date()

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Status</span>
            <div className="flex items-center gap-2">
              <WorkflowStatusBadge status={currentStatus} />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStatusDialog(true)}
          >
            Change Status
          </Button>
        </div>
      </Card>

      {/* Due Date */}
      {(dueDate || currentStatus === "in_review") && (
        <Card className={cn(
          "p-4",
          isOverdue && "border-red-500 bg-red-50 dark:bg-red-900/10",
          isDueSoon && !isOverdue && "border-amber-500 bg-amber-50 dark:bg-amber-900/10"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className={cn(
                "h-4 w-4",
                isOverdue ? "text-red-500" : isDueSoon ? "text-amber-500" : "text-muted-foreground"
              )} />
              <div>
                <span className="text-sm font-medium">Due Date</span>
                {dueDate ? (
                  <p className={cn(
                    "text-sm",
                    isOverdue ? "text-red-600" : isDueSoon ? "text-amber-600" : "text-muted-foreground"
                  )}>
                    {formatDate(dueDate)}
                    {isOverdue && " (Overdue)"}
                    {isDueSoon && !isOverdue && " (Due soon)"}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not set</p>
                )}
              </div>
            </div>
            {isOverdue && <AlertCircle className="h-5 w-5 text-red-500" />}
          </div>
        </Card>
      )}

      {/* Reviewers */}
      {(reviewers.length > 0 || currentStatus === "in_review") && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Reviewers</span>
            <Badge variant="secondary" className="text-xs">
              {approvedCount}/{reviewers.length} approved
            </Badge>
          </div>

          <div className="space-y-2">
            {reviewers.map((reviewer) => (
              <div
                key={reviewer.id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={reviewer.avatar} />
                    <AvatarFallback className="text-xs">
                      {reviewer.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{reviewer.name}</span>
                </div>
                <Badge
                  className={cn(
                    "text-xs",
                    reviewer.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : reviewer.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {reviewer.status === "approved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {reviewer.status === "rejected" && <AlertCircle className="h-3 w-3 mr-1" />}
                  {reviewer.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                  {reviewer.status}
                </Badge>
              </div>
            ))}
          </div>

          {currentStatus === "in_review" && (
            <Button variant="outline" size="sm" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Reviewer
            </Button>
          )}
        </Card>
      )}

      {/* History */}
      <Card className="p-4 space-y-3">
        <span className="text-sm font-medium">History</span>
        <div className="space-y-2">
          {history.slice(0, 5).map((item, _index) => (
            <div key={item.id} className="flex items-start gap-2 text-sm">
              <div className="mt-1">
                {statusConfig[item.status].icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.changedBy}</span>
                  <span className="text-muted-foreground">changed to</span>
                  <Badge variant="outline" className="text-xs">
                    {statusConfig[item.status].label}
                  </Badge>
                </div>
                {item.comment && (
                  <p className="text-muted-foreground text-xs mt-1">"{item.comment}"</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDate(item.changedAt)} at {formatTime(item.changedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              Update the workflow status for "{resourceName}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <WorkflowStatusBadge status={currentStatus} />
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as WorkflowStatus)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getNextStatuses(currentStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        {statusConfig[status].icon}
                        {statusConfig[status].label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Comment (optional)</span>
              <Textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Add a note about this status change..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Update Status
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
