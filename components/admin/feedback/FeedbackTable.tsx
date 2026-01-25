/**
 * @prompt-id forge-v4.1:feature:feedback-nps:011
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { Badge } from "@/components/ui/badge"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"
import {
  Bug,
  Lightbulb,
  MessageSquare,
  AlertTriangle,
  ThumbsUp,
  Clock,
  User,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react"

interface FeedbackItem {
  id: string
  type: string
  category: string | null
  title: string | null
  content: string
  rating: number | null
  sentiment: string | null
  status: string
  priority: string
  assignedTo: string | null
  createdAt: string
  user?: {
    id: string
    email: string
    name: string | null
  } | null
}

interface FeedbackTableProps {
  feedbackItems: FeedbackItem[]
  isLoading: boolean
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  onStatusChange: (id: string, status: string) => void
  onPriorityChange: (id: string, priority: string) => void
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
}

const typeIcons: Record<string, typeof Bug> = {
  BUG_REPORT: Bug,
  FEATURE_REQUEST: Lightbulb,
  GENERAL: MessageSquare,
  COMPLAINT: AlertTriangle,
  PRAISE: ThumbsUp,
  NPS: FileText,
}

const typeColors: Record<string, string> = {
  BUG_REPORT: "bg-red-500/10 text-red-500",
  FEATURE_REQUEST: "bg-amber-500/10 text-amber-500",
  GENERAL: "bg-blue-500/10 text-blue-500",
  COMPLAINT: "bg-orange-500/10 text-orange-500",
  PRAISE: "bg-green-500/10 text-green-500",
  NPS: "bg-purple-500/10 text-purple-500",
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500",
  UNDER_REVIEW: "bg-amber-500",
  PLANNED: "bg-purple-500",
  IN_PROGRESS: "bg-cyan-500",
  COMPLETED: "bg-green-500",
  WONT_DO: "bg-slate-500",
  DUPLICATE: "bg-slate-400",
}

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  HIGH: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  URGENT: "bg-red-500/10 text-red-500 border-red-500/20",
}

const sentimentColors: Record<string, string> = {
  POSITIVE: "text-green-500",
  NEUTRAL: "text-slate-500",
  NEGATIVE: "text-red-500",
}

export function FeedbackTable({
  feedbackItems,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
  onStatusChange,
  onPriorityChange,
  selectedIds,
  onSelectionChange,
}: FeedbackTableProps) {
  const columns: Column<FeedbackItem>[] = [
    {
      id: "feedback",
      header: "Feedback",
      cell: (item) => {
        const Icon = typeIcons[item.type] || MessageSquare
        return (
          <div className="flex items-start gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[item.type] || "bg-secondary"}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate max-w-[250px]">
                {item.title || item.content.slice(0, 50)}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.type.replace(/_/g, " ")}
                {item.category && ` - ${item.category}`}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      id: "user",
      header: "Submitted By",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {item.user?.name || item.user?.email || "Anonymous"}
          </span>
        </div>
      ),
    },
    {
      id: "sentiment",
      header: "Sentiment",
      cell: (item) => (
        item.sentiment ? (
          <span className={`text-sm font-medium ${sentimentColors[item.sentiment]}`}>
            {item.sentiment}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
      ),
    },
    {
      id: "priority",
      header: "Priority",
      cell: (item) => (
        <Badge className={priorityColors[item.priority]}>
          {item.priority === "URGENT" && <AlertTriangle className="h-3 w-3 mr-1" />}
          {item.priority}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (item) => (
        <Badge className={statusColors[item.status]}>
          {item.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      id: "created",
      header: "Created",
      cell: (item) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="text-sm">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
      ),
    },
  ]

  const rowActions: RowAction<FeedbackItem>[] = [
    {
      label: "Mark as Reviewed",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (item) => onStatusChange(item.id, "UNDER_REVIEW"),
      hidden: (item) => item.status !== "NEW",
    },
    {
      label: "Mark as Completed",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (item) => onStatusChange(item.id, "COMPLETED"),
      hidden: (item) => item.status === "COMPLETED" || item.status === "WONT_DO",
    },
    {
      label: "Mark as Won't Do",
      icon: <XCircle className="h-4 w-4" />,
      onClick: (item) => onStatusChange(item.id, "WONT_DO"),
      hidden: (item) => item.status === "COMPLETED" || item.status === "WONT_DO",
    },
    {
      label: "Set High Priority",
      icon: <AlertTriangle className="h-4 w-4" />,
      onClick: (item) => onPriorityChange(item.id, "HIGH"),
      hidden: (item) => item.priority === "HIGH" || item.priority === "URGENT",
      separator: true,
    },
    {
      label: "Set Urgent Priority",
      icon: <AlertTriangle className="h-4 w-4" />,
      onClick: (item) => onPriorityChange(item.id, "URGENT"),
      hidden: (item) => item.priority === "URGENT",
    },
  ]

  const bulkActions: BulkAction[] = [
    {
      label: "Mark as Reviewed",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: async (ids) => {
        for (const id of ids) {
          await onStatusChange(id, "UNDER_REVIEW")
        }
      },
      confirmTitle: "Mark as Reviewed",
      confirmDescription: "Are you sure you want to mark all selected feedback as reviewed?",
    },
    {
      label: "Mark as Completed",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: async (ids) => {
        for (const id of ids) {
          await onStatusChange(id, "COMPLETED")
        }
      },
      confirmTitle: "Mark as Completed",
      confirmDescription: "Are you sure you want to mark all selected feedback as completed?",
    },
    {
      label: "Mark as Won't Do",
      icon: <XCircle className="h-4 w-4" />,
      onClick: async (ids) => {
        for (const id of ids) {
          await onStatusChange(id, "WONT_DO")
        }
      },
      separator: true,
      confirmTitle: "Mark as Won't Do",
      confirmDescription: "Are you sure you want to mark all selected feedback as won't do?",
    },
  ]

  return (
    <AdminDataTable
      data={feedbackItems}
      columns={columns}
      getRowId={(item) => item.id}
      isLoading={isLoading}
      emptyMessage="No feedback found"
      viewHref={(item) => `/admin/feedback/${item.id}`}
      rowActions={rowActions}
      bulkActions={bulkActions}
      page={page}
      totalPages={totalPages}
      total={total}
      onPageChange={onPageChange}
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
    />
  )
}
