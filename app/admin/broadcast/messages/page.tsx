"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Megaphone,
  Plus,
  Search,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Building2,
  Edit,
  Trash,
  Calendar,
  Filter,
  Loader2,
  AlertTriangle,
  Mail,
  Bell,
  MessageSquare,
  Smartphone,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"
import { toast } from "sonner"

interface BroadcastMessage {
  id: string
  title: string
  content: string
  type: string
  priority: string
  status: string
  targetType: string
  channels: string[]
  totalRecipients: number
  delivered: number
  opened: number
  clicked: number
  scheduledFor: string | null
  sentAt: string | null
  createdAt: string
}

interface Stats {
  total: number
  draft: number
  scheduled: number
  sending: number
  sent: number
  cancelled: number
}

const messageTypes = [
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "PRODUCT_UPDATE", label: "Product Update" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "SECURITY_ALERT", label: "Security Alert" },
  { value: "MARKETING", label: "Marketing" },
  { value: "SURVEY", label: "Survey" },
]

const statusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "SENDING", label: "Sending" },
  { value: "SENT", label: "Sent" },
  { value: "CANCELLED", label: "Cancelled" },
]

const channelIcons: Record<string, typeof Bell> = {
  IN_APP: Bell,
  EMAIL: Mail,
  PUSH: Smartphone,
  SMS: MessageSquare,
  SLACK: MessageSquare,
}

export default function BroadcastMessagesPage() {
  useRouter()
  const searchParams = useSearchParams()

  const [messages, setMessages] = useState<BroadcastMessage[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<BroadcastMessage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())
      if (search) params.set("search", search)
      if (typeFilter !== "all") params.set("type", typeFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)

      const response = await fetch(`/api/admin/broadcast/messages?${params}`)
      if (!response.ok) throw new Error("Failed to fetch messages")

      const data = await response.json()
      setMessages(data.messages || [])
      setStats(data.stats)
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }))
    } catch (error) {
      console.error("Failed to fetch messages:", error)
      toast.error("Failed to load broadcast messages")
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, typeFilter, statusFilter])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchMessages()
  }

  const handleSendMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/broadcast/messages/${messageId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send message")
      }

      toast.success("Broadcast message sent successfully")
      fetchMessages()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message")
    }
  }

  const handleCancelMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/broadcast/messages/${messageId}/cancel`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to cancel message")
      }

      toast.success("Broadcast message cancelled")
      fetchMessages()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel message")
    }
  }

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/broadcast/messages/${messageToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete message")
      }

      toast.success("Broadcast message deleted")
      setDeleteDialogOpen(false)
      setMessageToDelete(null)
      fetchMessages()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete message")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkSend = async (ids: string[]) => {
    try {
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/broadcast/messages/${id}/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          })
        )
      )

      const failed = results.filter((r) => !r.ok)
      if (failed.length > 0) {
        toast.error(`Failed to send ${failed.length} message(s)`)
      } else {
        toast.success(`Successfully sent ${ids.length} message(s)`)
      }
      fetchMessages()
    } catch (error) {
      toast.error("Failed to send messages")
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/broadcast/messages/${id}`, {
            method: "DELETE",
          })
        )
      )

      const failed = results.filter((r) => !r.ok)
      if (failed.length > 0) {
        toast.error(`Failed to delete ${failed.length} message(s)`)
      } else {
        toast.success(`Successfully deleted ${ids.length} message(s)`)
      }
      fetchMessages()
    } catch (error) {
      toast.error("Failed to delete messages")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sent
          </Badge>
        )
      case "SCHEDULED":
        return (
          <Badge className="bg-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        )
      case "SENDING":
        return (
          <Badge className="bg-yellow-500">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Sending
          </Badge>
        )
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>
      case "CANCELLED":
        return (
          <Badge variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive">Urgent</Badge>
      case "HIGH":
        return <Badge className="bg-orange-500">High</Badge>
      case "NORMAL":
        return <Badge variant="secondary">Normal</Badge>
      default:
        return <Badge variant="outline">Low</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      ANNOUNCEMENT: "bg-blue-100 text-blue-800",
      PRODUCT_UPDATE: "bg-purple-100 text-purple-800",
      MAINTENANCE: "bg-amber-100 text-amber-800",
      SECURITY_ALERT: "bg-red-100 text-red-800",
      MARKETING: "bg-green-100 text-green-800",
      SURVEY: "bg-indigo-100 text-indigo-800",
    }
    return (
      <Badge className={typeColors[type] || "bg-gray-100 text-gray-800"} variant="outline">
        {type.replace("_", " ")}
      </Badge>
    )
  }

  // Define columns for the data table
  const columns: Column<BroadcastMessage>[] = [
    {
      id: "title",
      header: "Title",
      cell: (message) => (
        <Link
          href={`/admin/broadcast/messages/${message.id}`}
          className="hover:underline"
        >
          <div>
            <p className="font-medium">{message.title}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {message.content}
            </p>
          </div>
        </Link>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (message) => getTypeBadge(message.type),
    },
    {
      id: "priority",
      header: "Priority",
      cell: (message) => getPriorityBadge(message.priority),
    },
    {
      id: "status",
      header: "Status",
      cell: (message) => getStatusBadge(message.status),
    },
    {
      id: "target",
      header: "Target",
      cell: (message) => (
        <div className="flex items-center gap-1">
          {message.targetType === "ALL" ? (
            <Users className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Building2 className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-xs">
            {message.targetType.replace(/_/g, " ")}
          </span>
        </div>
      ),
    },
    {
      id: "channels",
      header: "Channels",
      cell: (message) => (
        <div className="flex gap-1">
          {message.channels.map((channel) => {
            const Icon = channelIcons[channel] || Bell
            return (
              <div
                key={channel}
                className="h-6 w-6 rounded bg-muted flex items-center justify-center"
                title={channel}
              >
                <Icon className="h-3 w-3" />
              </div>
            )
          })}
        </div>
      ),
    },
    {
      id: "delivery",
      header: "Delivery",
      cell: (message) => {
        if (message.status === "SENT") {
          return (
            <div className="text-xs">
              <p>{message.delivered.toLocaleString()} delivered</p>
              <p className="text-muted-foreground">
                {message.opened} opened (
                {message.totalRecipients > 0
                  ? Math.round((message.opened / message.totalRecipients) * 100)
                  : 0}
                %)
              </p>
            </div>
          )
        } else if (message.totalRecipients > 0) {
          return (
            <span className="text-xs text-muted-foreground">
              {message.totalRecipients.toLocaleString()} recipients
            </span>
          )
        } else {
          return <span className="text-xs text-muted-foreground">-</span>
        }
      },
    },
    {
      id: "date",
      header: "Date",
      cell: (message) => (
        <div className="text-xs">
          {message.sentAt
            ? new Date(message.sentAt).toLocaleDateString()
            : message.scheduledFor
              ? `Scheduled: ${new Date(message.scheduledFor).toLocaleDateString()}`
              : new Date(message.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<BroadcastMessage>[] = [
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      href: (message) => `/admin/broadcast/messages/${message.id}/edit`,
      hidden: (message) => message.status !== "DRAFT",
    },
    {
      label: "Send Now",
      icon: <Send className="h-4 w-4" />,
      onClick: (message) => handleSendMessage(message.id),
      hidden: (message) => message.status !== "DRAFT",
    },
    {
      label: "Schedule",
      icon: <Calendar className="h-4 w-4" />,
      href: (message) => `/admin/broadcast/messages/${message.id}?schedule=true`,
      hidden: (message) => message.status !== "DRAFT",
    },
    {
      label: "Cancel",
      icon: <XCircle className="h-4 w-4" />,
      onClick: (message) => handleCancelMessage(message.id),
      hidden: (message) => message.status !== "SCHEDULED",
    },
    {
      label: "Delete",
      icon: <Trash className="h-4 w-4" />,
      onClick: (message) => {
        setMessageToDelete(message)
        setDeleteDialogOpen(true)
      },
      variant: "destructive",
      separator: true,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: "Send Selected",
      icon: <Send className="h-4 w-4" />,
      onClick: handleBulkSend,
      confirmTitle: "Send Multiple Messages",
      confirmDescription: "Are you sure you want to send the selected messages? This action cannot be undone.",
    },
    {
      label: "Delete Selected",
      icon: <Trash className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      separator: true,
      confirmTitle: "Delete Multiple Messages",
      confirmDescription: "Are you sure you want to delete the selected messages? This action cannot be undone.",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-primary" />
            Broadcast Messages
          </h1>
          <p className="text-muted-foreground">
            Manage and send platform-wide communications
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/broadcast/messages/new">
            <Plus className="h-4 w-4 mr-2" />
            New Broadcast
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Messages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-500">{stats.draft}</div>
              <p className="text-xs text-muted-foreground">Drafts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-500">{stats.scheduled}</div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">{stats.sent}</div>
              <p className="text-xs text-muted-foreground">Sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-500">{stats.cancelled}</div>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPagination(p => ({ ...p, page: 1 })) }}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {messageTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPagination(p => ({ ...p, page: 1 })) }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <AdminDataTable
        data={messages}
        columns={columns}
        getRowId={(message) => message.id}
        isLoading={loading}
        emptyMessage="No broadcast messages found"
        viewHref={(message) => `/admin/broadcast/messages/${message.id}`}
        rowActions={rowActions}
        bulkActions={bulkActions}
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        enableSelection={true}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Broadcast Message
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{messageToDelete?.title}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
