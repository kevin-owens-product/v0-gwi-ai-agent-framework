"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  Search,
  Filter,
  Shield,
  Clock,
  Globe,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  AlertCircle,
  Ban,
  FileWarning,
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
import { toast } from "sonner"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface SecurityViolation {
  id: string
  policyId: string
  orgId: string | null
  userId: string | null
  violationType: string
  severity: string
  description: string
  details: Record<string, unknown>
  ipAddress: string | null
  userAgent: string | null
  resourceType: string | null
  resourceId: string | null
  status: string
  resolvedBy: string | null
  resolvedAt: string | null
  resolution: string | null
  createdAt: string
  policy: {
    id: string
    name: string
    type: string
  }
}

const violationTypes = [
  { value: "WEAK_PASSWORD", label: "Weak Password" },
  { value: "FAILED_MFA", label: "Failed MFA" },
  { value: "SUSPICIOUS_LOGIN", label: "Suspicious Login" },
  { value: "IP_BLOCKED", label: "IP Blocked" },
  { value: "UNAUTHORIZED_ACCESS", label: "Unauthorized Access" },
  { value: "DATA_EXFILTRATION", label: "Data Exfiltration" },
  { value: "FILE_POLICY_VIOLATION", label: "File Policy Violation" },
  { value: "EXTERNAL_SHARING_BLOCKED", label: "External Sharing Blocked" },
  { value: "SESSION_VIOLATION", label: "Session Violation" },
  { value: "DEVICE_NOT_COMPLIANT", label: "Device Not Compliant" },
  { value: "API_ABUSE", label: "API Abuse" },
  { value: "RATE_LIMIT_EXCEEDED", label: "Rate Limit Exceeded" },
  { value: "BRUTE_FORCE_DETECTED", label: "Brute Force Detected" },
  { value: "IMPOSSIBLE_TRAVEL", label: "Impossible Travel" },
  { value: "ANOMALOUS_BEHAVIOR", label: "Anomalous Behavior" },
]

const severities = [
  { value: "INFO", label: "Info" },
  { value: "WARNING", label: "Warning" },
  { value: "CRITICAL", label: "Critical" },
]

const statuses = [
  { value: "OPEN", label: "Open" },
  { value: "INVESTIGATING", label: "Investigating" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "FALSE_POSITIVE", label: "False Positive" },
  { value: "ESCALATED", label: "Escalated" },
]

const violationTypeIcons: Record<string, React.ReactNode> = {
  WEAK_PASSWORD: <Shield className="h-4 w-4" />,
  FAILED_MFA: <Shield className="h-4 w-4" />,
  SUSPICIOUS_LOGIN: <AlertTriangle className="h-4 w-4" />,
  IP_BLOCKED: <Ban className="h-4 w-4" />,
  UNAUTHORIZED_ACCESS: <XCircle className="h-4 w-4" />,
  DATA_EXFILTRATION: <FileWarning className="h-4 w-4" />,
  BRUTE_FORCE_DETECTED: <AlertCircle className="h-4 w-4" />,
  DEFAULT: <AlertTriangle className="h-4 w-4" />,
}

export default function SecurityViolationsPage() {
  useRouter()
  const [violations, setViolations] = useState<SecurityViolation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  })

  useEffect(() => {
    fetchViolations()
  }, [typeFilter, severityFilter, statusFilter, sortBy, sortOrder, pagination.offset])

  const fetchViolations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (typeFilter !== "all") params.set("violationType", typeFilter)
      if (severityFilter !== "all") params.set("severity", severityFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("search", search)
      params.set("sortBy", sortBy)
      params.set("sortOrder", sortOrder)
      params.set("limit", pagination.limit.toString())
      params.set("offset", pagination.offset.toString())

      const response = await fetch(`/api/admin/security/violations?${params}`)
      const data = await response.json()
      setViolations(data.violations || [])
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        hasMore: data.pagination?.hasMore || false,
      }))
    } catch (error) {
      console.error("Failed to fetch violations:", error)
      toast.error("Failed to fetch security violations")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, offset: 0 }))
    fetchViolations()
  }

  const handleStatusChange = async (violation: SecurityViolation, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/security/violations/${violation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update violation")
      }

      toast.success(`Violation status updated to ${newStatus}`)
      fetchViolations()
    } catch (error) {
      toast.error("Failed to update violation status")
    }
  }

  const handleBulkStatusChange = async (ids: string[], newStatus: string) => {
    try {
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/security/violations/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      )

      const failedCount = results.filter((r) => !r.ok).length
      if (failedCount > 0) {
        toast.error(`${failedCount} violation(s) failed to update`)
      } else {
        toast.success(`${ids.length} violation(s) updated to ${newStatus}`)
      }
      fetchViolations()
    } catch (error) {
      toast.error("Failed to update violations")
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
      case "OPEN":
        return <Badge variant="destructive">{status}</Badge>
      case "INVESTIGATING":
        return <Badge variant="default" className="bg-blue-500">{status}</Badge>
      case "RESOLVED":
        return <Badge variant="default" className="bg-green-500">{status}</Badge>
      case "FALSE_POSITIVE":
        return <Badge variant="secondary">{status.replace("_", " ")}</Badge>
      case "ESCALATED":
        return <Badge variant="destructive" className="bg-purple-500">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getViolationIcon = (type: string) => violationTypeIcons[type] || violationTypeIcons.DEFAULT

  const filteredViolations = violations.filter(
    (violation) =>
      violation.description?.toLowerCase().includes(search.toLowerCase()) ||
      violation.ipAddress?.toLowerCase().includes(search.toLowerCase())
  )

  // Column definitions for AdminDataTable
  const columns: Column<SecurityViolation>[] = [
    {
      id: "icon",
      header: "",
      cell: (violation) => getViolationIcon(violation.violationType),
      className: "w-[40px]",
    },
    {
      id: "type",
      header: (
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort("violationType")}>
          Type
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (violation) => (
        <Badge variant="outline">
          {violation.violationType.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      id: "description",
      header: "Description",
      cell: (violation) => (
        <p className="truncate max-w-[250px]">{violation.description}</p>
      ),
    },
    {
      id: "severity",
      header: (
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort("severity")}>
          Severity
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (violation) => getSeverityBadge(violation.severity),
    },
    {
      id: "policy",
      header: "Policy",
      cell: (violation) => (
        <p className="text-sm truncate max-w-[150px]">
          {violation.policy?.name || "N/A"}
        </p>
      ),
    },
    {
      id: "status",
      header: (
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort("status")}>
          Status
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (violation) => getStatusBadge(violation.status),
    },
    {
      id: "ipAddress",
      header: "IP Address",
      cell: (violation) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Globe className="h-3 w-3" />
          {violation.ipAddress || "N/A"}
        </div>
      ),
    },
    {
      id: "createdAt",
      header: (
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort("createdAt")}>
          Time
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (violation) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {new Date(violation.createdAt).toLocaleString()}
        </div>
      ),
    },
  ]

  // Row actions for individual violations
  const rowActions: RowAction<SecurityViolation>[] = [
    {
      label: "Mark Investigating",
      icon: <Clock className="h-4 w-4" />,
      onClick: (violation) => handleStatusChange(violation, "INVESTIGATING"),
      hidden: (violation) => violation.status === "INVESTIGATING",
    },
    {
      label: "Mark Resolved",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (violation) => handleStatusChange(violation, "RESOLVED"),
      hidden: (violation) => violation.status === "RESOLVED",
    },
    {
      label: "Mark False Positive",
      icon: <XCircle className="h-4 w-4" />,
      onClick: (violation) => handleStatusChange(violation, "FALSE_POSITIVE"),
      hidden: (violation) => violation.status === "FALSE_POSITIVE",
      separator: true,
    },
  ]

  // Bulk actions for selected violations
  const bulkActions: BulkAction[] = [
    {
      label: "Mark as Investigating",
      icon: <Clock className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "INVESTIGATING"),
      confirmTitle: "Mark as Investigating",
      confirmDescription: "Are you sure you want to mark these violations as investigating?",
    },
    {
      label: "Mark as Resolved",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "RESOLVED"),
      confirmTitle: "Mark as Resolved",
      confirmDescription: "Are you sure you want to mark these violations as resolved?",
    },
    {
      label: "Mark as False Positive",
      icon: <XCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "FALSE_POSITIVE"),
      confirmTitle: "Mark as False Positive",
      confirmDescription: "Are you sure you want to mark these violations as false positives?",
      separator: true,
    },
  ]

  const stats = {
    total: pagination.total,
    open: violations.filter((v) => v.status === "OPEN").length,
    critical: violations.filter((v) => v.severity === "CRITICAL").length,
    resolved: violations.filter((v) => v.status === "RESOLVED").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            Security Violations
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage security policy violations across the platform
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Violations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{stats.resolved}</div>
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
                  placeholder="Search violations..."
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
                {violationTypes.map((type) => (
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

      {/* Violations Table */}
      <AdminDataTable
        data={filteredViolations}
        columns={columns}
        getRowId={(violation) => violation.id}
        isLoading={loading}
        emptyMessage="No security violations found"
        viewHref={(violation) => `/admin/security/violations/${violation.id}`}
        rowActions={rowActions}
        bulkActions={bulkActions}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        page={Math.floor(pagination.offset / pagination.limit) + 1}
        totalPages={Math.ceil(pagination.total / pagination.limit)}
        total={pagination.total}
        onPageChange={(page) =>
          setPagination((prev) => ({
            ...prev,
            offset: (page - 1) * prev.limit,
          }))
        }
      />
    </div>
  )
}
