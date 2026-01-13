"use client"

import { useEffect, useState } from "react"
import {
  AlertCircle,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  MoreHorizontal,
  Edit,
  MessageSquare,
  Users,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Incident {
  id: string
  title: string
  description: string
  severity: string
  status: string
  type: string
  affectedServices: string[]
  affectedRegions: string[]
  impact: string | null
  rootCause: string | null
  responders: string[]
  startedAt: string
  detectedAt: string
  acknowledgedAt: string | null
  mitigatedAt: string | null
  resolvedAt: string | null
  updates: { id: string; message: string; status: string | null; createdAt: string }[]
}

const severityOptions = [
  { value: "MINOR", label: "Minor", color: "bg-blue-500" },
  { value: "MODERATE", label: "Moderate", color: "bg-yellow-500" },
  { value: "MAJOR", label: "Major", color: "bg-orange-500" },
  { value: "CRITICAL", label: "Critical", color: "bg-red-500" },
]

const statusOptions = [
  { value: "INVESTIGATING", label: "Investigating" },
  { value: "IDENTIFIED", label: "Identified" },
  { value: "MONITORING", label: "Monitoring" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "POSTMORTEM", label: "Postmortem" },
]

const typeOptions = [
  { value: "OUTAGE", label: "Outage" },
  { value: "DEGRADATION", label: "Degradation" },
  { value: "SECURITY", label: "Security" },
  { value: "DATA_ISSUE", label: "Data Issue" },
  { value: "THIRD_PARTY", label: "Third Party" },
  { value: "CAPACITY", label: "Capacity" },
  { value: "NETWORK", label: "Network" },
  { value: "DATABASE", label: "Database" },
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

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [newUpdate, setNewUpdate] = useState("")

  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    severity: "MODERATE",
    type: "OUTAGE",
    affectedServices: [] as string[],
  })

  useEffect(() => {
    fetchIncidents()
  }, [statusFilter, severityFilter])

  const fetchIncidents = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (severityFilter !== "all") params.set("severity", severityFilter)
      if (search) params.set("search", search)

      const response = await fetch(`/api/admin/operations/incidents?${params}`)
      const data = await response.json()
      setIncidents(data.incidents || [])
    } catch (error) {
      console.error("Failed to fetch incidents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIncident = async () => {
    try {
      const response = await fetch("/api/admin/operations/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIncident),
      })

      if (!response.ok) {
        throw new Error("Failed to create incident")
      }

      toast.success("Incident has been logged and team notified")

      setIsCreateOpen(false)
      setNewIncident({
        title: "",
        description: "",
        severity: "MODERATE",
        type: "OUTAGE",
        affectedServices: [],
      })
      fetchIncidents()
    } catch (error) {
      toast.error("Failed to create incident")
    }
  }

  const handleUpdateStatus = async (incidentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/operations/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update incident")
      }

      toast.success("Incident status updated")
      fetchIncidents()
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident((prev) => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      toast.error("Failed to update incident")
    }
  }

  const handleAddUpdate = async () => {
    if (!selectedIncident || !newUpdate) return

    try {
      const response = await fetch(`/api/admin/operations/incidents/${selectedIncident.id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newUpdate }),
      })

      if (!response.ok) {
        throw new Error("Failed to add update")
      }

      toast.success("Update added to incident")
      setNewUpdate("")
      fetchIncidents()
    } catch (error) {
      toast.error("Failed to add update")
    }
  }

  const getSeverityBadge = (severity: string) => {
    const opt = severityOptions.find((o) => o.value === severity)
    return <Badge className={opt?.color || "bg-gray-500"}>{opt?.label || severity}</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <Badge className="bg-green-500">Resolved</Badge>
      case "MONITORING":
        return <Badge className="bg-blue-500">Monitoring</Badge>
      case "IDENTIFIED":
        return <Badge className="bg-yellow-500">Identified</Badge>
      case "INVESTIGATING":
        return <Badge className="bg-orange-500">Investigating</Badge>
      case "POSTMORTEM":
        return <Badge variant="secondary">Postmortem</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredIncidents = incidents.filter(
    (incident) =>
      incident.title.toLowerCase().includes(search.toLowerCase()) ||
      incident.description.toLowerCase().includes(search.toLowerCase())
  )

  const activeIncidents = incidents.filter(
    (i) => !["RESOLVED", "POSTMORTEM"].includes(i.status)
  )

  return (
    <div className="space-y-6">
      {/* Incident Detail Sheet */}
      <Sheet open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          {selectedIncident && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(selectedIncident.severity)}
                  {getStatusBadge(selectedIncident.status)}
                </div>
                <SheetTitle>{selectedIncident.title}</SheetTitle>
                <SheetDescription>
                  Started {new Date(selectedIncident.startedAt).toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedIncident.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Affected Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.affectedServices.map((service) => (
                      <Badge key={service} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Update Status</h4>
                  <Select
                    value={selectedIncident.status}
                    onValueChange={(value) =>
                      handleUpdateStatus(selectedIncident.id, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  <div className="space-y-4">
                    {selectedIncident.updates.map((update) => (
                      <div key={update.id} className="flex gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <p className="text-sm">{update.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(update.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Add Update</h4>
                  <Textarea
                    placeholder="Enter status update..."
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                  />
                  <Button
                    className="mt-2"
                    onClick={handleAddUpdate}
                    disabled={!newUpdate}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Post Update
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-primary" />
            Incidents
          </h1>
          <p className="text-muted-foreground">
            Manage and track platform incidents and outages
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report New Incident</DialogTitle>
              <DialogDescription>
                Log a new incident to track and communicate with users
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Incident Title</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the incident"
                  value={newIncident.title}
                  onChange={(e) =>
                    setNewIncident({ ...newIncident, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the incident..."
                  rows={4}
                  value={newIncident.description}
                  onChange={(e) =>
                    setNewIncident({ ...newIncident, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Severity</Label>
                  <Select
                    value={newIncident.severity}
                    onValueChange={(value) =>
                      setNewIncident({ ...newIncident, severity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select
                    value={newIncident.type}
                    onValueChange={(value) =>
                      setNewIncident({ ...newIncident, type: value })
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
              </div>
              <div className="grid gap-2">
                <Label>Affected Services</Label>
                <div className="flex flex-wrap gap-2">
                  {serviceOptions.map((service) => (
                    <Badge
                      key={service}
                      variant={
                        newIncident.affectedServices.includes(service)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => {
                        const services = newIncident.affectedServices.includes(service)
                          ? newIncident.affectedServices.filter((s) => s !== service)
                          : [...newIncident.affectedServices, service]
                        setNewIncident({ ...newIncident, affectedServices: services })
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
                onClick={handleCreateIncident}
                disabled={!newIncident.title || !newIncident.description}
              >
                Report Incident
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Incidents Alert */}
      {activeIncidents.length > 0 && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold">
                  {activeIncidents.length} Active Incident{activeIncidents.length !== 1 ? "s" : ""}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeIncidents.filter((i) => i.severity === "CRITICAL").length} critical,{" "}
                  {activeIncidents.filter((i) => i.severity === "MAJOR").length} major
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
            <div className="text-2xl font-bold">{incidents.length}</div>
            <p className="text-xs text-muted-foreground">Total Incidents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">
              {activeIncidents.length}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {incidents.filter((i) => i.status === "RESOLVED").length}
            </div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {incidents.filter((i) => i.status === "POSTMORTEM").length}
            </div>
            <p className="text-xs text-muted-foreground">In Postmortem</p>
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
                  placeholder="Search incidents..."
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
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                {severityOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Incidents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Affected Services</TableHead>
                <TableHead>Duration</TableHead>
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
              ) : filteredIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <p className="text-muted-foreground">No incidents found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredIncidents.map((incident) => (
                  <TableRow
                    key={incident.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{incident.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Started {new Date(incident.startedAt).toLocaleString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                    <TableCell>{getStatusBadge(incident.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{incident.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {incident.affectedServices.slice(0, 2).map((service) => (
                          <Badge key={service} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {incident.affectedServices.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{incident.affectedServices.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {incident.resolvedAt ? (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(
                            (new Date(incident.resolvedAt).getTime() -
                              new Date(incident.startedAt).getTime()) /
                              60000
                          )}{" "}
                          min
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-500">Ongoing</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedIncident(incident)
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
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
