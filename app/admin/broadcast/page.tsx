"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Megaphone,
  Plus,
  Search,
  Send,
  Users,
  Building2,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  Calendar,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// Tabs import removed - unused
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

export default function BroadcastCenterPage() {
  const t = useTranslations("admin.broadcast")
  const tCommon = useTranslations("common")

  const [messages, setMessages] = useState<BroadcastMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [newMessage, setNewMessage] = useState({
    title: "",
    content: "",
    type: "ANNOUNCEMENT",
    priority: "NORMAL",
    targetType: "ALL",
    channels: ["IN_APP"],
  })

  const messageTypes = [
    { value: "ANNOUNCEMENT", label: t("types.announcement") },
    { value: "PRODUCT_UPDATE", label: t("types.productUpdate") },
    { value: "MAINTENANCE", label: t("types.maintenance") },
    { value: "SECURITY_ALERT", label: t("types.securityAlert") },
    { value: "MARKETING", label: t("types.marketing") },
    { value: "SURVEY", label: t("types.survey") },
  ]

  const priorityOptions = [
    { value: "LOW", label: t("priority.low") },
    { value: "NORMAL", label: t("priority.normal") },
    { value: "HIGH", label: t("priority.high") },
    { value: "URGENT", label: t("priority.urgent") },
  ]

  const targetOptions = [
    { value: "ALL", label: t("target.allUsers") },
    { value: "SPECIFIC_ORGS", label: t("target.specificOrgs") },
    { value: "SPECIFIC_PLANS", label: t("target.specificPlans") },
  ]

  useEffect(() => {
    fetchMessages()
  }, [statusFilter, fetchMessages])

  const fetchMessages = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("search", search)

      const response = await fetch(`/api/admin/broadcast?${params}`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMessage = async () => {
    try {
      const response = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      })

      if (!response.ok) {
        throw new Error("Failed to create message")
      }

      toast.success(t("toast.messageCreated"))
      setIsCreateOpen(false)
      setNewMessage({
        title: "",
        content: "",
        type: "ANNOUNCEMENT",
        priority: "NORMAL",
        targetType: "ALL",
        channels: ["IN_APP"],
      })
      fetchMessages()
    } catch {
      toast.error(t("toast.createFailed"))
    }
  }

  const handleSendMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/broadcast/${messageId}/send`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      toast.success(t("toast.messageSent"))
      fetchMessages()
    } catch {
      toast.error(t("toast.sendFailed"))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return <Badge className="bg-green-500">{t("status.sent")}</Badge>
      case "SCHEDULED":
        return <Badge className="bg-blue-500">{t("status.scheduled")}</Badge>
      case "SENDING":
        return <Badge className="bg-yellow-500">{t("status.sending")}</Badge>
      case "DRAFT":
        return <Badge variant="secondary">{t("status.draft")}</Badge>
      case "CANCELLED":
        return <Badge variant="outline">{t("status.cancelled")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive">{t("priority.urgent")}</Badge>
      case "HIGH":
        return <Badge className="bg-orange-500">{t("priority.high")}</Badge>
      case "NORMAL":
        return <Badge variant="secondary">{t("priority.normal")}</Badge>
      default:
        return <Badge variant="outline">{t("priority.low")}</Badge>
    }
  }

  const filteredMessages = messages.filter(
    (msg) =>
      msg.title.toLowerCase().includes(search.toLowerCase()) ||
      msg.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("newBroadcast")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("createDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("createDialog.description")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">{t("form.title")}</Label>
                <Input
                  id="title"
                  placeholder={t("form.titlePlaceholder")}
                  value={newMessage.title}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">{t("form.content")}</Label>
                <Textarea
                  id="content"
                  placeholder={t("form.contentPlaceholder")}
                  rows={5}
                  value={newMessage.content}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, content: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t("form.messageType")}</Label>
                  <Select
                    value={newMessage.type}
                    onValueChange={(value) =>
                      setNewMessage({ ...newMessage, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {messageTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t("form.priority")}</Label>
                  <Select
                    value={newMessage.priority}
                    onValueChange={(value) =>
                      setNewMessage({ ...newMessage, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{t("form.targetAudience")}</Label>
                <Select
                  value={newMessage.targetType}
                  onValueChange={(value) =>
                    setNewMessage({ ...newMessage, targetType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {targetOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateMessage}
                disabled={!newMessage.title || !newMessage.content}
              >
                {t("actions.saveDraft")}
              </Button>
              <Button
                onClick={() => {
                  handleCreateMessage()
                  // Would also send immediately in real implementation
                }}
                disabled={!newMessage.title || !newMessage.content}
              >
                <Send className="h-4 w-4 mr-2" />
                {t("actions.sendNow")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">{t("stats.totalMessages")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {messages.filter((m) => m.status === "SENT").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("status.sent")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {messages.filter((m) => m.status === "SCHEDULED").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("status.scheduled")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {messages.filter((m) => m.status === "DRAFT").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.drafts")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={tCommon("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.allStatus")}</SelectItem>
                <SelectItem value="DRAFT">{t("status.draft")}</SelectItem>
                <SelectItem value="SCHEDULED">{t("status.scheduled")}</SelectItem>
                <SelectItem value="SENT">{t("status.sent")}</SelectItem>
                <SelectItem value="CANCELLED">{t("status.cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.title")}</TableHead>
                <TableHead>{t("table.type")}</TableHead>
                <TableHead>{t("table.priority")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.target")}</TableHead>
                <TableHead>{t("table.deliveryStats")}</TableHead>
                <TableHead>{t("table.date")}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t("empty.noMessages")}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("empty.createFirst")}
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{message.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {message.content}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {message.type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(message.priority)}</TableCell>
                    <TableCell>{getStatusBadge(message.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {message.targetType === "ALL" ? (
                          <Users className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs">
                          {message.targetType.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {message.status === "SENT" ? (
                        <div className="text-xs">
                          <p>{t("delivery.delivered", { count: message.delivered.toLocaleString() })}</p>
                          <p className="text-muted-foreground">
                            {t("delivery.opened", {
                              count: message.opened,
                              percent: message.totalRecipients > 0 ? Math.round((message.opened / message.totalRecipients) * 100) : 0
                            })}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {message.sentAt
                          ? new Date(message.sentAt).toLocaleDateString()
                          : message.scheduledFor
                          ? `${t("delivery.scheduledFor")}: ${new Date(message.scheduledFor).toLocaleDateString()}`
                          : new Date(message.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            {t("actions.viewDetails")}
                          </DropdownMenuItem>
                          {message.status === "DRAFT" && (
                            <>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                {tCommon("edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSendMessage(message.id)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {t("actions.sendNow")}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                {t("actions.schedule")}
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            {tCommon("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
