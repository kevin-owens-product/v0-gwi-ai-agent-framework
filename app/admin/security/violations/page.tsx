"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
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
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
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

const violationTypeKeys = [
  "WEAK_PASSWORD",
  "FAILED_MFA",
  "SUSPICIOUS_LOGIN",
  "IP_BLOCKED",
  "UNAUTHORIZED_ACCESS",
  "DATA_EXFILTRATION",
  "FILE_POLICY_VIOLATION",
  "EXTERNAL_SHARING_BLOCKED",
  "SESSION_VIOLATION",
  "DEVICE_NOT_COMPLIANT",
  "API_ABUSE",
  "RATE_LIMIT_EXCEEDED",
  "BRUTE_FORCE_DETECTED",
  "IMPOSSIBLE_TRAVEL",
  "ANOMALOUS_BEHAVIOR",
] as const

const severityKeys = ["INFO", "WARNING", "CRITICAL"] as const

const statusKeys = ["OPEN", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE", "ESCALATED"] as const

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
  const t = useTranslations("admin.security.violations")
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
      showErrorToast(t("toast.fetchFailed"))
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

      showSuccessToast(t("toast.statusUpdated", { status: t(`statuses.${newStatus}`) }))
      fetchViolations()
    } catch (error) {
      showErrorToast(t("toast.updateFailed"))
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
        showErrorToast(t("toast.bulkUpdatePartialFailed", { count: failedCount }))
      } else {
        showSuccessToast(t("toast.bulkUpdateSuccess", { count: ids.length, status: t(`statuses.${newStatus}`) }))
      }
      fetchViolations()
    } catch (error) {
      showErrorToast(t("toast.bulkUpdateFailed"))
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
        return <Badge variant="destructive">{t(`severities.${severity}`)}</Badge>
      case "WARNING":
        return <Badge variant="default" className="bg-yellow-500">{t(`severities.${severity}`)}</Badge>
      case "INFO":
        return <Badge variant="secondary">{t(`severities.${severity}`)}</Badge>
      default:
        return <Badge variant="outline">{t(`severities.${severity}`, { defaultValue: severity })}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="destructive">{t(`statuses.${status}`)}</Badge>
      case "INVESTIGATING":
        return <Badge variant="default" className="bg-blue-500">{t(`statuses.${status}`)}</Badge>
      case "RESOLVED":
        return <Badge variant="default" className="bg-green-500">{t(`statuses.${status}`)}</Badge>
      case "FALSE_POSITIVE":
        return <Badge variant="secondary">{t(`statuses.${status}`)}</Badge>
      case "ESCALATED":
        return <Badge variant="destructive" className="bg-purple-500">{t(`statuses.${status}`)}</Badge>
      default:
        return <Badge variant="outline">{t(`statuses.${status}`, { defaultValue: status })}</Badge>
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
          {t("table.type")}
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (violation) => (
        <Badge variant="outline">
          {t(`violationTypes.${violation.violationType}`)}
        </Badge>
      ),
    },
    {
      id: "description",
      header: t("table.description"),
      cell: (violation) => (
        <p className="truncate max-w-[250px]">{violation.description}</p>
      ),
    },
    {
      id: "severity",
      header: (
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort("severity")}>
          {t("table.severity")}
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (violation) => getSeverityBadge(violation.severity),
    },
    {
      id: "policy",
      header: t("table.policy"),
      cell: (violation) => (
        <p className="text-sm truncate max-w-[150px]">
          {violation.policy?.name || t("common.na")}
        </p>
      ),
    },
    {
      id: "status",
      header: (
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort("status")}>
          {t("table.status")}
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (violation) => getStatusBadge(violation.status),
    },
    {
      id: "ipAddress",
      header: t("table.ipAddress"),
      cell: (violation) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Globe className="h-3 w-3" />
          {violation.ipAddress || t("common.na")}
        </div>
      ),
    },
    {
      id: "createdAt",
      header: (
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort("createdAt")}>
          {t("table.time")}
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
      label: t("actions.markInvestigating"),
      icon: <Clock className="h-4 w-4" />,
      onClick: (violation) => handleStatusChange(violation, "INVESTIGATING"),
      hidden: (violation) => violation.status === "INVESTIGATING",
    },
    {
      label: t("actions.markResolved"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (violation) => handleStatusChange(violation, "RESOLVED"),
      hidden: (violation) => violation.status === "RESOLVED",
    },
    {
      label: t("actions.markFalsePositive"),
      icon: <XCircle className="h-4 w-4" />,
      onClick: (violation) => handleStatusChange(violation, "FALSE_POSITIVE"),
      hidden: (violation) => violation.status === "FALSE_POSITIVE",
      separator: true,
    },
  ]

  // Bulk actions for selected violations
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.markAsInvestigating"),
      icon: <Clock className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "INVESTIGATING"),
      confirmTitle: t("confirmations.markInvestigatingTitle"),
      confirmDescription: t("confirmations.markInvestigatingDescription"),
    },
    {
      label: t("actions.markAsResolved"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "RESOLVED"),
      confirmTitle: t("confirmations.markResolvedTitle"),
      confirmDescription: t("confirmations.markResolvedDescription"),
    },
    {
      label: t("actions.markAsFalsePositive"),
      icon: <XCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "FALSE_POSITIVE"),
      confirmTitle: t("confirmations.markFalsePositiveTitle"),
      confirmDescription: t("confirmations.markFalsePositiveDescription"),
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
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{t("stats.totalViolations")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">{stats.open}</div>
            <p className="text-xs text-muted-foreground">{t("stats.open")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">{t("stats.critical")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">{t("stats.resolved")}</p>
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
                  placeholder={t("searchPlaceholder")}
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
                <SelectValue placeholder={t("filters.type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                {violationTypeKeys.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`violationTypes.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.severity")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allSeverities")}</SelectItem>
                {severityKeys.map((severity) => (
                  <SelectItem key={severity} value={severity}>
                    {t(`severities.${severity}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
                {statusKeys.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`statuses.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSearch}>
              {t("actions.search")}
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
        emptyMessage={t("noViolationsFound")}
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
