"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  TicketCheck,
  Building2,
  Clock,
  User,
  Loader2,
  RefreshCw,
  Send,
  AlertTriangle,
  MessageSquare,
  UserPlus,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"
import { useAdmin } from "@/components/providers/admin-provider"

interface Ticket {
  id: string
  ticketNumber: string
  orgId: string
  userId: string | null
  subject: string
  description: string
  category: string
  priority: string
  status: string
  assignedTo: string | null
  createdAt: string
  updatedAt: string
  responses: {
    id: string
    responderId: string
    responderType: string
    message: string
    isInternal: boolean
    createdAt: string
  }[]
}

export default function SupportPage() {
  const t = useTranslations("admin.support")
  const tCommon = useTranslations("common")
  const { admin } = useAdmin()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTickets = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(priorityFilter !== "all" && { priority: priorityFilter }),
      })
      const response = await fetch(`/api/admin/support?${params}`)
      const data = await response.json()
      setTickets(data.tickets)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter, priorityFilter])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/admin/support/${ticketId}`)
      const data = await response.json()
      setSelectedTicket(data.ticket)
      setSheetOpen(true)
    } catch (error) {
      console.error("Failed to fetch ticket details:", error)
    }
  }

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return
    setIsSubmitting(true)
    try {
      await fetch(`/api/admin/support/${selectedTicket.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyMessage,
          isInternal,
        }),
      })
      setReplyMessage("")
      fetchTicketDetails(selectedTicket.id)
    } catch (error) {
      console.error("Failed to send reply:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchTickets()
      if (selectedTicket?.id === ticketId) {
        fetchTicketDetails(ticketId)
      }
    } catch (error) {
      console.error("Failed to update ticket status:", error)
    }
  }

  const handleAssign = async (ticketId: string) => {
    try {
      await fetch(`/api/admin/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: admin.id }),
      })
      fetchTickets()
    } catch (error) {
      console.error("Failed to assign ticket:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "bg-red-500/10 text-red-500 border-red-500/20"
      case "HIGH": return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "MEDIUM": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default: return "bg-secondary"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-green-500"
      case "IN_PROGRESS": return "bg-blue-500"
      case "WAITING_ON_CUSTOMER": return "bg-amber-500"
      case "RESOLVED": return "bg-slate-500"
      case "CLOSED": return "bg-slate-400"
      default: return "bg-secondary"
    }
  }

  const handleBulkClose = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/support/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "CLOSED" }),
          })
        )
      )
      fetchTickets()
    } catch (error) {
      console.error("Failed to close tickets:", error)
    }
  }

  const handleBulkResolve = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/support/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "RESOLVED" }),
          })
        )
      )
      fetchTickets()
    } catch (error) {
      console.error("Failed to resolve tickets:", error)
    }
  }

  // Define columns for the data table
  const columns: Column<Ticket>[] = [
    {
      id: "ticket",
      header: t("ticket"),
      cell: (ticket) => (
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
            ticket.priority === "URGENT" ? "bg-red-500/10" :
            ticket.priority === "HIGH" ? "bg-amber-500/10" : "bg-primary/10"
          }`}>
            <TicketCheck className={`h-4 w-4 ${
              ticket.priority === "URGENT" ? "text-red-500" :
              ticket.priority === "HIGH" ? "text-amber-500" : "text-primary"
            }`} />
          </div>
          <div>
            <p className="font-medium truncate max-w-[200px]">{ticket.subject}</p>
            <p className="text-xs text-muted-foreground">{ticket.ticketNumber}</p>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: t("category"),
      cell: (ticket) => <Badge variant="outline">{ticket.category}</Badge>,
    },
    {
      id: "priority",
      header: t("priority"),
      cell: (ticket) => (
        <Badge className={getPriorityColor(ticket.priority)}>
          {ticket.priority === "URGENT" && <AlertTriangle className="h-3 w-3 mr-1" />}
          {ticket.priority}
        </Badge>
      ),
    },
    {
      id: "status",
      header: tCommon("status"),
      cell: (ticket) => (
        <Badge className={getStatusColor(ticket.status)}>
          {ticket.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      id: "assigned",
      header: t("assigned"),
      cell: (ticket) => (
        ticket.assignedTo ? (
          <div className="flex items-center gap-1 text-sm">
            <User className="h-3 w-3 text-muted-foreground" />
            {t("assignedLabel")}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{t("unassigned")}</span>
        )
      ),
    },
    {
      id: "created",
      header: t("created"),
      cell: (ticket) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          {new Date(ticket.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<Ticket>[] = [
    {
      label: t("assignToMe"),
      icon: <UserPlus className="h-4 w-4" />,
      onClick: (ticket) => handleAssign(ticket.id),
      hidden: (ticket) => !!ticket.assignedTo,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("resolveSelected"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: handleBulkResolve,
      confirmTitle: t("resolveTicketsTitle"),
      confirmDescription: t("confirmResolve"),
    },
    {
      label: t("closeSelected"),
      icon: <XCircle className="h-4 w-4" />,
      onClick: handleBulkClose,
      separator: true,
      confirmTitle: t("closeTicketsTitle"),
      confirmDescription: t("confirmClose"),
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>
                {t("description", { total })}
              </CardDescription>
            </div>
            <Button onClick={fetchTickets} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              {tCommon("refresh")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={tCommon("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="OPEN">{t("statuses.open")}</SelectItem>
                <SelectItem value="IN_PROGRESS">{t("statuses.inProgress")}</SelectItem>
                <SelectItem value="WAITING_ON_CUSTOMER">{t("statuses.waitingOnCustomer")}</SelectItem>
                <SelectItem value="WAITING_ON_INTERNAL">{t("statuses.waitingInternal")}</SelectItem>
                <SelectItem value="RESOLVED">{t("statuses.resolved")}</SelectItem>
                <SelectItem value="CLOSED">{t("statuses.closed")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("priority")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allPriority")}</SelectItem>
                <SelectItem value="URGENT">{t("priorities.urgent")}</SelectItem>
                <SelectItem value="HIGH">{t("priorities.high")}</SelectItem>
                <SelectItem value="MEDIUM">{t("priorities.medium")}</SelectItem>
                <SelectItem value="LOW">{t("priorities.low")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <AdminDataTable
            data={tickets}
            columns={columns}
            getRowId={(ticket) => ticket.id}
            isLoading={isLoading}
            emptyMessage={t("noTickets")}
            viewHref={(ticket) => `/admin/support/${ticket.id}`}
            rowActions={rowActions}
            bulkActions={bulkActions}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>

      {/* Ticket Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedTicket && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <TicketCheck className="h-5 w-5" />
                  {selectedTicket.ticketNumber}
                </SheetTitle>
                <SheetDescription>{selectedTicket.subject}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Ticket Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{tCommon("status")}</p>
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(v) => handleStatusChange(selectedTicket.id, v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">{t("statuses.open")}</SelectItem>
                        <SelectItem value="IN_PROGRESS">{t("statuses.inProgress")}</SelectItem>
                        <SelectItem value="WAITING_ON_CUSTOMER">{t("statuses.waitingOnCustomer")}</SelectItem>
                        <SelectItem value="WAITING_ON_INTERNAL">{t("statuses.waitingInternal")}</SelectItem>
                        <SelectItem value="RESOLVED">{t("statuses.resolved")}</SelectItem>
                        <SelectItem value="CLOSED">{t("statuses.closed")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("priority")}</p>
                    <Badge className={`mt-1 ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("category")}</p>
                    <Badge variant="outline" className="mt-1">{selectedTicket.category}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("organization")}</p>
                    <div className="flex items-center gap-1 mt-1 text-sm">
                      <Building2 className="h-3 w-3" />
                      {selectedTicket.orgId}
                    </div>
                  </div>
                </div>

                {/* Original Description */}
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">{t("originalRequest")}</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Responses */}
                <div className="space-y-4">
                  <p className="font-medium">{t("conversation")}</p>
                  {selectedTicket.responses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("noResponses")}</p>
                  ) : (
                    selectedTicket.responses.map((response) => (
                      <div
                        key={response.id}
                        className={`rounded-lg border p-4 ${
                          response.isInternal ? "bg-amber-500/5 border-amber-500/20" :
                          response.responderType === "admin" ? "bg-primary/5 border-primary/20" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={response.responderType === "admin" ? "default" : "secondary"}>
                              {response.responderType === "admin" ? t("supportLabel") : t("customerLabel")}
                            </Badge>
                            {response.isInternal && (
                              <Badge variant="outline" className="text-amber-500 border-amber-500/20">
                                {t("internalNote")}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(response.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{response.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Form */}
                <div className="space-y-4 pt-4 border-t">
                  <Textarea
                    placeholder={t("replyPlaceholder")}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      {t("internalNoteLabel")}
                    </label>
                    <Button onClick={handleReply} disabled={!replyMessage.trim() || isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {t("sendReply")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
