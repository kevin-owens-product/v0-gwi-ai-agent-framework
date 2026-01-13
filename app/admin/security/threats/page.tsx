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
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
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
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center gap-2">
                    Type
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Source</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("severity")}
                >
                  <div className="flex items-center gap-2">
                    Severity
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-2">
                    Status
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Indicators</TableHead>
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
              ) : filteredThreats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No threat events found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredThreats.map((threat) => (
                  <TableRow
                    key={threat.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/admin/security/threats/${threat.id}`)}
                  >
                    <TableCell>{getThreatIcon(threat.type)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {threat.type.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="truncate max-w-[250px]">{threat.description}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Globe className="h-3 w-3" />
                        {threat.source}
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(threat.severity)}</TableCell>
                    <TableCell>{getStatusBadge(threat.status)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {Array.isArray(threat.indicators) ? threat.indicators.length : 0} IOCs
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(threat.createdAt).toLocaleString()}
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
                              router.push(`/admin/security/threats/${threat.id}`)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {threat.status === "ACTIVE" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(threat, "CONTAINED")
                              }}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Mark Contained
                            </DropdownMenuItem>
                          )}
                          {(threat.status === "ACTIVE" || threat.status === "CONTAINED") && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(threat, "MITIGATED")
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Mitigated
                            </DropdownMenuItem>
                          )}
                          {threat.status !== "RESOLVED" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(threat, "RESOLVED")
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Resolved
                            </DropdownMenuItem>
                          )}
                          {threat.status !== "FALSE_POSITIVE" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(threat, "FALSE_POSITIVE")
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
            {pagination.total} threats
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
