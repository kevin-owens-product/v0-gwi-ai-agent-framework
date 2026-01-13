"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
} from "lucide-react"
import Link from "next/link"
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
  const { admin } = useAdmin()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>
                Manage customer support requests ({total} total)
              </CardDescription>
            </div>
            <Button onClick={fetchTickets} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="WAITING_ON_CUSTOMER">Waiting on Customer</SelectItem>
                <SelectItem value="WAITING_ON_INTERNAL">Waiting Internal</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority === "URGENT" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.assignedTo ? (
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            Assigned
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssign(ticket.id)}
                          >
                            Assign to me
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/support/${ticket.id}`}>
                            <MessageSquare className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
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
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Select
                      value={selectedTicket.status}
                      onValueChange={(v) => handleStatusChange(selectedTicket.id, v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="WAITING_ON_CUSTOMER">Waiting on Customer</SelectItem>
                        <SelectItem value="WAITING_ON_INTERNAL">Waiting Internal</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <Badge className={`mt-1 ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <Badge variant="outline" className="mt-1">{selectedTicket.category}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Organization</p>
                    <div className="flex items-center gap-1 mt-1 text-sm">
                      <Building2 className="h-3 w-3" />
                      {selectedTicket.orgId}
                    </div>
                  </div>
                </div>

                {/* Original Description */}
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">Original Request</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Responses */}
                <div className="space-y-4">
                  <p className="font-medium">Conversation</p>
                  {selectedTicket.responses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No responses yet</p>
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
                              {response.responderType === "admin" ? "Support" : "Customer"}
                            </Badge>
                            {response.isInternal && (
                              <Badge variant="outline" className="text-amber-500 border-amber-500/20">
                                Internal Note
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
                    placeholder="Type your response..."
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
                      Internal note (not visible to customer)
                    </label>
                    <Button onClick={handleReply} disabled={!replyMessage.trim() || isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
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
