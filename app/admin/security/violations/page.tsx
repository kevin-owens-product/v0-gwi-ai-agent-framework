"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  Globe,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
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
import { toast } from "sonner"

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
  const router = useRouter()
  const [violations, setViolations] = useState<SecurityViolation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
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
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("violationType")}
                >
                  <div className="flex items-center gap-2">
                    Type
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("severity")}
                >
                  <div className="flex items-center gap-2">
                    Severity
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Policy</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-2">
                    Status
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-2">
                    Time
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={9}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredViolations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No security violations found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredViolations.map((violation) => (
                  <TableRow
                    key={violation.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/admin/security/violations/${violation.id}`)}
                  >
                    <TableCell>{getViolationIcon(violation.violationType)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {violation.violationType.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="truncate max-w-[250px]">{violation.description}</p>
                    </TableCell>
                    <TableCell>{getSeverityBadge(violation.severity)}</TableCell>
                    <TableCell>
                      <p className="text-sm truncate max-w-[150px]">
                        {violation.policy?.name || "N/A"}
                      </p>
                    </TableCell>
                    <TableCell>{getStatusBadge(violation.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        {violation.ipAddress || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(violation.createdAt).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/security/violations/${violation.id}`)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {violation.status !== "INVESTIGATING" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(violation, "INVESTIGATING")
                              }}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Mark Investigating
                            </DropdownMenuItem>
                          )}
                          {violation.status !== "RESOLVED" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(violation, "RESOLVED")
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Resolved
                            </DropdownMenuItem>
                          )}
                          {violation.status !== "FALSE_POSITIVE" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(violation, "FALSE_POSITIVE")
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Mark False Positive
                            </DropdownMenuItem>
                          )}
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
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pagination.offset + 1} to{" "}
            {Math.min(pagination.offset + pagination.limit, pagination.total)} of{" "}
            {pagination.total} violations
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  offset: Math.max(0, prev.offset - prev.limit),
                }))
              }
              disabled={pagination.offset === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  offset: prev.offset + prev.limit,
                }))
              }
              disabled={!pagination.hasMore}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
