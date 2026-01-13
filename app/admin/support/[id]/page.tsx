"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  TicketCheck,
  Loader2,
  Calendar,
  Building2,
  User,
  Clock,
  AlertTriangle,
  Send,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"

interface Response {
  id: string
  responderId: string
  responderType: string
  message: string
  isInternal: boolean
  createdAt: string
}

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
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
  responses: Response[]
}

export default function SupportTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { admin } = useAdmin()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [replyMessage, setReplyMessage] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTicket = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/support/${ticketId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch ticket")
      }
      const data = await response.json()
      setTicket(data.ticket)
    } catch (error) {
      console.error("Failed to fetch ticket:", error)
    } finally {
      setIsLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  const handleReply = async () => {
    if (!replyMessage.trim()) return
    setIsSubmitting(true)
    try {
      await fetch(`/api/admin/support/${ticketId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyMessage,
          isInternal,
        }),
      })
      setReplyMessage("")
      setIsInternal(false)
      fetchTicket()
    } catch (error) {
      console.error("Failed to send reply:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await fetch(`/api/admin/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchTicket()
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    try {
      await fetch(`/api/admin/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      })
      fetchTicket()
    } catch (error) {
      console.error("Failed to update priority:", error)
    }
  }

  const handleAssign = async () => {
    try {
      await fetch(`/api/admin/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: admin.id }),
      })
      fetchTicket()
    } catch (error) {
      console.error("Failed to assign ticket:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "bg-red-500"
      case "HIGH": return "bg-amber-500"
      case "MEDIUM": return "bg-blue-500"
      default: return "bg-slate-500"
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Ticket not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/support">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
            ticket.priority === "URGENT" ? "bg-red-500/10" :
            ticket.priority === "HIGH" ? "bg-amber-500/10" : "bg-primary/10"
          }`}>
            <TicketCheck className={`h-6 w-6 ${
              ticket.priority === "URGENT" ? "text-red-500" :
              ticket.priority === "HIGH" ? "text-amber-500" : "text-primary"
            }`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{ticket.ticketNumber}</h1>
            <p className="text-muted-foreground">{ticket.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
            {ticket.priority === "URGENT" && <AlertTriangle className="h-3 w-3 mr-1" />}
            {ticket.priority}
          </Badge>
          <Badge className={`${getStatusColor(ticket.status)} text-white`}>
            {ticket.status.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Request */}
          <Card>
            <CardHeader>
              <CardTitle>Original Request</CardTitle>
              <CardDescription>
                Submitted on {new Date(ticket.createdAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Conversation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation
              </CardTitle>
              <CardDescription>
                {ticket.responses.length} response(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.responses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No responses yet</p>
              ) : (
                ticket.responses.map((response) => (
                  <div
                    key={response.id}
                    className={`rounded-lg border p-4 ${
                      response.isInternal ? "bg-amber-500/5 border-amber-500/20" :
                      response.responderType === "admin" ? "bg-primary/5 border-primary/20" : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={response.responderType === "admin" ? "default" : "secondary"}>
                          {response.responderType === "admin" ? "Support Agent" : "Customer"}
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
                    <p className="whitespace-pre-wrap">{response.message}</p>
                  </div>
                ))
              )}

              {/* Reply Form */}
              <div className="pt-4 border-t space-y-4">
                <Label>Reply</Label>
                <Textarea
                  placeholder="Type your response..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="internal"
                      checked={isInternal}
                      onCheckedChange={(checked) => setIsInternal(checked as boolean)}
                    />
                    <label htmlFor="internal" className="text-sm">
                      Internal note (not visible to customer)
                    </label>
                  </div>
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Badge variant="outline">{ticket.category}</Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Assigned To</Label>
                {ticket.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Assigned</span>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleAssign}>
                    Assign to me
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono">{ticket.orgId}</span>
              </div>
              {ticket.userId && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">{ticket.userId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Updated:</span>
                <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
              </div>
              {ticket.resolvedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <TicketCheck className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Resolved:</span>
                  <span>{new Date(ticket.resolvedAt).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
