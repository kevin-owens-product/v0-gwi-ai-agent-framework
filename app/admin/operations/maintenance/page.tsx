"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Wrench,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreHorizontal,
  ExternalLink,
  RefreshCw,
  Play,
  Pause,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface MaintenanceWindow {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  affectedServices: string[]
  affectedRegions: string[]
  scheduledStart: string
  scheduledEnd: string
  actualStart: string | null
  actualEnd: string | null
  notifyBefore: number
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

const typeOptions = [
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "UPGRADE", label: "Upgrade" },
  { value: "MIGRATION", label: "Migration" },
  { value: "SECURITY_PATCH", label: "Security Patch" },
]

const statusOptions = [
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXTENDED", label: "Extended" },
]

const serviceOptions = [
  "API Gateway",
  "Authentication",
  "Database",
  "File Storage",
  "Messaging",
  "Search",
  "Analytics",
  "Payments",
  "Notifications",
]

export default function MaintenancePage() {
  const [windows, setWindows] = useState<MaintenanceWindow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [newWindow, setNewWindow] = useState({
    title: "",
    description: "",
    type: "SCHEDULED",
    affectedServices: [] as string[],
    scheduledStart: "",
    scheduledEnd: "",
    notifyBefore: 24,
  })

  useEffect(() => {
    fetchWindows()
  }, [statusFilter, typeFilter, page])

  const fetchWindows = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
      })

      const response = await fetch(`/api/admin/operations/maintenance?${params}`)
      const data = await response.json()
      setWindows(data.windows || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch maintenance windows:", error)
      toast.error("Failed to load maintenance windows")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWindow = async () => {
    try {
      const response = await fetch("/api/admin/operations/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWindow),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create maintenance window")
      }

      toast.success("Maintenance window scheduled")
      setIsCreateOpen(false)
      setNewWindow({
        title: "",
        description: "",
        type: "SCHEDULED",
        affectedServices: [],
        scheduledStart: "",
        scheduledEnd: "",
        notifyBefore: 24,
      })
      fetchWindows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create maintenance window")
    }
  }

  const handleUpdateStatus = async (windowId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/operations/maintenance/${windowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      toast.success("Maintenance window updated")
      fetchWindows()
    } catch (error) {
      toast.error("Failed to update maintenance window")
    }
  }

  const handleDelete = async (windowId: string) => {
    if (!confirm("Are you sure you want to delete this maintenance window?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/operations/maintenance/${windowId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete maintenance window")
      }

      toast.success("Maintenance window deleted")
      fetchWindows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete maintenance window")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Badge className="bg-blue-500">Scheduled</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-yellow-500">In Progress</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>
      case "EXTENDED":
        return <Badge className="bg-orange-500">Extended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "EMERGENCY":
        return <Badge className="bg-red-500">Emergency</Badge>
      case "SECURITY_PATCH":
        return <Badge className="bg-purple-500">Security</Badge>
      default:
        return <Badge variant="outline">{type.replace("_", " ")}</Badge>
    }
  }

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diff = endDate.getTime() - startDate.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const filteredWindows = windows.filter(
    (w) =>
      w.title.toLowerCase().includes(search.toLowerCase()) ||
      w.description?.toLowerCase().includes(search.toLowerCase())
  )

  const upcomingWindows = windows.filter(
    (w) => w.status === "SCHEDULED" && new Date(w.scheduledStart) > new Date()
  )
  const inProgressWindows = windows.filter((w) => w.status === "IN_PROGRESS")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wrench className="h-8 w-8 text-primary" />
            Maintenance Windows
          </h1>
          <p className="text-muted-foreground">
            Schedule and manage platform maintenance windows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchWindows}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Maintenance Window</DialogTitle>
                <DialogDescription>
                  Create a new scheduled maintenance window
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Database upgrade"
                    value={newWindow.title}
                    onChange={(e) =>
                      setNewWindow({ ...newWindow, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the maintenance..."
                    rows={3}
                    value={newWindow.description}
                    onChange={(e) =>
                      setNewWindow({ ...newWindow, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select
                      value={newWindow.type}
                      onValueChange={(value) =>
                        setNewWindow({ ...newWindow, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Notify Before (hours)</Label>
                    <Input
                      type="number"
                      value={newWindow.notifyBefore}
                      onChange={(e) =>
                        setNewWindow({
                          ...newWindow,
                          notifyBefore: parseInt(e.target.value) || 24,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Time</Label>
                    <Input
                      type="datetime-local"
                      value={newWindow.scheduledStart}
                      onChange={(e) =>
                        setNewWindow({ ...newWindow, scheduledStart: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Time</Label>
                    <Input
                      type="datetime-local"
                      value={newWindow.scheduledEnd}
                      onChange={(e) =>
                        setNewWindow({ ...newWindow, scheduledEnd: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Affected Services</Label>
                  <div className="flex flex-wrap gap-2">
                    {serviceOptions.map((service) => (
                      <Badge
                        key={service}
                        variant={
                          newWindow.affectedServices.includes(service)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          const services = newWindow.affectedServices.includes(service)
                            ? newWindow.affectedServices.filter((s) => s !== service)
                            : [...newWindow.affectedServices, service]
                          setNewWindow({ ...newWindow, affectedServices: services })
                        }}
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateWindow}
                  disabled={
                    !newWindow.title ||
                    !newWindow.scheduledStart ||
                    !newWindow.scheduledEnd
                  }
                >
                  Schedule Maintenance
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerts */}
      {inProgressWindows.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <h3 className="font-semibold">
                  {inProgressWindows.length} Maintenance In Progress
                </h3>
                <p className="text-sm text-muted-foreground">
                  {inProgressWindows.map((w) => w.title).join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Total Windows</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {upcomingWindows.length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {inProgressWindows.length}
            </div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {windows.filter((w) => w.status === "COMPLETED").length}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
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
                  placeholder="Search maintenance windows..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Maintenance Window</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Services</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredWindows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No maintenance windows found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredWindows.map((window) => (
                  <TableRow key={window.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/admin/operations/maintenance/${window.id}`}
                          className="font-medium hover:underline"
                        >
                          {window.title}
                        </Link>
                        {window.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {window.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(window.type)}</TableCell>
                    <TableCell>{getStatusBadge(window.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(window.scheduledStart).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(window.scheduledStart).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDuration(window.scheduledStart, window.scheduledEnd)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {window.affectedServices.slice(0, 2).map((service) => (
                          <Badge key={service} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {window.affectedServices.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{window.affectedServices.length - 2}
                          </Badge>
                        )}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/operations/maintenance/${window.id}`}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {window.status === "SCHEDULED" && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(window.id, "IN_PROGRESS")}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Maintenance
                            </DropdownMenuItem>
                          )}
                          {window.status === "IN_PROGRESS" && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(window.id, "COMPLETED")}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete
                            </DropdownMenuItem>
                          )}
                          {window.status === "SCHEDULED" && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(window.id, "CANCELLED")}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={() => handleDelete(window.id)}
                          >
                            Delete
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
