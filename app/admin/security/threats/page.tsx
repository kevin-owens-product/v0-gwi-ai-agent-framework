"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Zap,
  Search,
  Filter,
  Shield,
  Clock,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bug,
  ShieldAlert,
  Skull,
  Activity,
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
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"
import { toast } from "sonner"

interface ThreatEvent {
  id: string
  type: string
  severity: string
  source: string
  orgId: string | null
  userId: string | null
  description: string
  details: Record<string, unknown>
  indicators: unknown[]
  status: string
  mitigatedBy: string | null
  mitigatedAt: string | null
  mitigation: string | null
  relatedEvents: string[]
  createdAt: string
  updatedAt: string
}

const threatTypes = [
  { value: "BRUTE_FORCE", label: "Brute Force" },
  { value: "CREDENTIAL_STUFFING", label: "Credential Stuffing" },
  { value: "PHISHING_ATTEMPT", label: "Phishing Attempt" },
  { value: "ACCOUNT_TAKEOVER", label: "Account Takeover" },
  { value: "DATA_BREACH", label: "Data Breach" },
  { value: "MALWARE_DETECTED", label: "Malware Detected" },
  { value: "RANSOMWARE", label: "Ransomware" },
  { value: "DLP_VIOLATION", label: "DLP Violation" },
  { value: "INSIDER_THREAT", label: "Insider Threat" },
  { value: "API_ABUSE", label: "API Abuse" },
  { value: "BOT_ATTACK", label: "Bot Attack" },
  { value: "DDOS_ATTEMPT", label: "DDoS Attempt" },
  { value: "SUSPICIOUS_ACTIVITY", label: "Suspicious Activity" },
  { value: "COMPLIANCE_VIOLATION", label: "Compliance Violation" },
]

const severities = [
  { value: "INFO", label: "Info" },
  { value: "WARNING", label: "Warning" },
  { value: "CRITICAL", label: "Critical" },
]

const statuses = [
  { value: "ACTIVE", label: "Active" },
  { value: "CONTAINED", label: "Contained" },
  { value: "MITIGATED", label: "Mitigated" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "FALSE_POSITIVE", label: "False Positive" },
]

const threatTypeIcons: Record<string, React.ReactNode> = {
  BRUTE_FORCE: <Zap className="h-4 w-4" />,
  CREDENTIAL_STUFFING: <Zap className="h-4 w-4" />,
  MALWARE_DETECTED: <Bug className="h-4 w-4" />,
  RANSOMWARE: <Skull className="h-4 w-4" />,
  DATA_BREACH: <ShieldAlert className="h-4 w-4" />,
  ACCOUNT_TAKEOVER: <ShieldAlert className="h-4 w-4" />,
  DDOS_ATTEMPT: <Activity className="h-4 w-4" />,
  DEFAULT: <AlertCircle className="h-4 w-4" />,
}

export default function ThreatEventsPage() {
  const router = useRouter()
  const [threats, setThreats] = useState<ThreatEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [stats, setStats] = useState<Record<string, number>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  })

  useEffect(() => {
    fetchThreats()
  }, [typeFilter, severityFilter, statusFilter, sortBy, sortOrder, pagination.offset])

  const fetchThreats = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (typeFilter !== "all") params.set("type", typeFilter)
      if (severityFilter !== "all") params.set("severity", severityFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("search", search)
      params.set("sortBy", sortBy)
      params.set("sortOrder", sortOrder)
      params.set("limit", pagination.limit.toString())
      params.set("offset", pagination.offset.toString())

      const response = await fetch(`/api/admin/security/threats?${params}`)
      const data = await response.json()
      setThreats(data.threats || [])
      setStats(data.stats || {})
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        hasMore: data.pagination?.hasMore || false,
      }))
    } catch (error) {
      console.error("Failed to fetch threats:", error)
      toast.error("Failed to fetch threat events")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, offset: 0 }))
    fetchThreats()
  }

  const handleStatusChange = async (threat: ThreatEvent, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/security/threats/${threat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update threat")
      }

      toast.success(`Threat status updated to ${newStatus}`)
      fetchThreats()
    } catch (error) {
      toast.error("Failed to update threat status")
    }
  }

  const handleBulkStatusChange = async (ids: string[], newStatus: string) => {
    try {
      const promises = ids.map((id) =>
        fetch(`/api/admin/security/threats/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
      )

      await Promise.all(promises)
      toast.success(`${ids.length} threat(s) updated to ${newStatus}`)
      fetchThreats()
      setSelectedIds(new Set())
    } catch (error) {
      toast.error("Failed to update threats")
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="destructive">{severity}</Badge>
      case "WARNING":
        return <Badge variant="default" className="bg-yellow-500">{severity}</Badge>
      case "INFO":
        return <Badge variant="secondary">{severity}</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="destructive">{status}</Badge>
      case "CONTAINED":
        return <Badge variant="default" className="bg-orange-500">{status}</Badge>
      case "MITIGATED":
        return <Badge variant="default" className="bg-blue-500">{status}</Badge>
      case "RESOLVED":
        return <Badge variant="default" className="bg-green-500">{status}</Badge>
      case "FALSE_POSITIVE":
        return <Badge variant="secondary">{status.replace("_", " ")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getThreatIcon = (type: string) => threatTypeIcons[type] || threatTypeIcons.DEFAULT

  const filteredThreats = threats.filter(
    (threat) =>
      threat.description?.toLowerCase().includes(search.toLowerCase()) ||
      threat.source?.toLowerCase().includes(search.toLowerCase())
  )

  // Define columns for AdminDataTable
  const columns: Column<ThreatEvent>[] = [
    {
      id: "icon",
      header: "",
      cell: (threat) => getThreatIcon(threat.type),
      className: "w-[40px]",
    },
    {
      id: "type",
      header: "Type",
      cell: (threat) => (
        <Badge variant="outline">
          {threat.type.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      id: "description",
      header: "Description",
      cell: (threat) => (
        <p className="truncate max-w-[250px]">{threat.description}</p>
      ),
    },
    {
      id: "source",
      header: "Source",
      cell: (threat) => (
        <div className="flex items-center gap-1 text-sm">
          <Globe className="h-3 w-3" />
          {threat.source}
        </div>
      ),
    },
    {
      id: "severity",
      header: "Severity",
      cell: (threat) => getSeverityBadge(threat.severity),
    },
    {
      id: "status",
      header: "Status",
      cell: (threat) => getStatusBadge(threat.status),
    },
    {
      id: "indicators",
      header: "Indicators",
      cell: (threat) => (
        <Badge variant="secondary">
          {Array.isArray(threat.indicators) ? threat.indicators.length : 0} IOCs
        </Badge>
      ),
    },
    {
      id: "createdAt",
      header: "Time",
      cell: (threat) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {new Date(threat.createdAt).toLocaleString()}
        </div>
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<ThreatEvent>[] = [
    {
      label: "Mark Contained",
      icon: <Shield className="h-4 w-4" />,
      onClick: (threat) => handleStatusChange(threat, "CONTAINED"),
      hidden: (threat) => threat.status !== "ACTIVE",
    },
    {
      label: "Mark Mitigated",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (threat) => handleStatusChange(threat, "MITIGATED"),
      hidden: (threat) => threat.status !== "ACTIVE" && threat.status !== "CONTAINED",
    },
    {
      label: "Mark Resolved",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (threat) => handleStatusChange(threat, "RESOLVED"),
      hidden: (threat) => threat.status === "RESOLVED",
    },
    {
      label: "Mark False Positive",
      icon: <XCircle className="h-4 w-4" />,
      onClick: (threat) => handleStatusChange(threat, "FALSE_POSITIVE"),
      hidden: (threat) => threat.status === "FALSE_POSITIVE",
      separator: true,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: "Mark as Contained",
      icon: <Shield className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "CONTAINED"),
      confirmTitle: "Mark threats as Contained",
      confirmDescription: "Are you sure you want to mark the selected threats as contained?",
    },
    {
      label: "Mark as Mitigated",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "MITIGATED"),
      confirmTitle: "Mark threats as Mitigated",
      confirmDescription: "Are you sure you want to mark the selected threats as mitigated?",
    },
    {
      label: "Mark as Resolved",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "RESOLVED"),
      confirmTitle: "Mark threats as Resolved",
      confirmDescription: "Are you sure you want to mark the selected threats as resolved?",
    },
    {
      label: "Mark as False Positive",
      icon: <XCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "FALSE_POSITIVE"),
      confirmTitle: "Mark threats as False Positive",
      confirmDescription: "Are you sure you want to mark the selected threats as false positive?",
      separator: true,
    },
  ]

  // Calculate pagination for AdminDataTable
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * pagination.limit
    setPagination((prev) => ({ ...prev, offset: newOffset }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Zap className="h-8 w-8 text-orange-500" />
            Threat Events
          </h1>
          <p className="text-muted-foreground">
            Monitor and respond to security threats across the platform
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">Total Threats</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">{stats.ACTIVE || 0}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">{stats.CONTAINED || 0}</div>
            <p className="text-xs text-muted-foreground">Contained</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">{stats.MITIGATED || 0}</div>
            <p className="text-xs text-muted-foreground">Mitigated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{stats.RESOLVED || 0}</div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search threats..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {threatTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {severities.map((severity) => (
                  <SelectItem key={severity.value} value={severity.value}>
                    {severity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
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

      {/* Threats Table */}
      <AdminDataTable
        data={filteredThreats}
        columns={columns}
        getRowId={(threat) => threat.id}
        isLoading={loading}
        emptyMessage="No threat events found"
        viewHref={(threat) => `/admin/security/threats/${threat.id}`}
        rowActions={rowActions}
        bulkActions={bulkActions}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        page={currentPage}
        totalPages={totalPages}
        total={pagination.total}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
