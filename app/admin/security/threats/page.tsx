"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
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

const THREAT_TYPE_KEYS = [
  "BRUTE_FORCE",
  "CREDENTIAL_STUFFING",
  "PHISHING_ATTEMPT",
  "ACCOUNT_TAKEOVER",
  "DATA_BREACH",
  "MALWARE_DETECTED",
  "RANSOMWARE",
  "DLP_VIOLATION",
  "INSIDER_THREAT",
  "API_ABUSE",
  "BOT_ATTACK",
  "DDOS_ATTEMPT",
  "SUSPICIOUS_ACTIVITY",
  "COMPLIANCE_VIOLATION",
] as const

const SEVERITY_KEYS = ["INFO", "WARNING", "CRITICAL"] as const

const STATUS_KEYS = ["ACTIVE", "CONTAINED", "MITIGATED", "RESOLVED", "FALSE_POSITIVE"] as const

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
  useRouter()
  const t = useTranslations("admin.threats")
  const tCommon = useTranslations("common")

  const [threats, setThreats] = useState<ThreatEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy] = useState("createdAt")
  const [sortOrder] = useState("desc")
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
      toast.error(t("errors.fetchFailed"))
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
        throw new Error(t("errors.updateFailed"))
      }

      toast.success(t("messages.statusUpdated", { status: t(`statuses.${newStatus.toLowerCase()}`) }))
      fetchThreats()
    } catch (error) {
      toast.error(t("errors.updateFailed"))
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
      toast.success(t("messages.bulkStatusUpdated", { count: ids.length, status: t(`statuses.${newStatus.toLowerCase()}`) }))
      fetchThreats()
      setSelectedIds(new Set())
    } catch (error) {
      toast.error(t("errors.bulkUpdateFailed"))
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="destructive">{t(`severities.${severity.toLowerCase()}`)}</Badge>
      case "WARNING":
        return <Badge variant="default" className="bg-yellow-500">{t(`severities.${severity.toLowerCase()}`)}</Badge>
      case "INFO":
        return <Badge variant="secondary">{t(`severities.${severity.toLowerCase()}`)}</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="destructive">{t(`statuses.${status.toLowerCase()}`)}</Badge>
      case "CONTAINED":
        return <Badge variant="default" className="bg-orange-500">{t(`statuses.${status.toLowerCase()}`)}</Badge>
      case "MITIGATED":
        return <Badge variant="default" className="bg-blue-500">{t(`statuses.${status.toLowerCase()}`)}</Badge>
      case "RESOLVED":
        return <Badge variant="default" className="bg-green-500">{t(`statuses.${status.toLowerCase()}`)}</Badge>
      case "FALSE_POSITIVE":
        return <Badge variant="secondary">{t(`statuses.falsePositive`)}</Badge>
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
      header: t("columns.type"),
      cell: (threat) => (
        <Badge variant="outline">
          {t(`types.${threat.type.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      id: "description",
      header: tCommon("description"),
      cell: (threat) => (
        <p className="truncate max-w-[250px]">{threat.description}</p>
      ),
    },
    {
      id: "source",
      header: t("columns.source"),
      cell: (threat) => (
        <div className="flex items-center gap-1 text-sm">
          <Globe className="h-3 w-3" />
          {threat.source}
        </div>
      ),
    },
    {
      id: "severity",
      header: t("columns.severity"),
      cell: (threat) => getSeverityBadge(threat.severity),
    },
    {
      id: "status",
      header: tCommon("status"),
      cell: (threat) => getStatusBadge(threat.status),
    },
    {
      id: "indicators",
      header: t("columns.indicators"),
      cell: (threat) => (
        <Badge variant="secondary">
          {Array.isArray(threat.indicators) ? threat.indicators.length : 0} {t("iocs")}
        </Badge>
      ),
    },
    {
      id: "createdAt",
      header: t("columns.time"),
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
      label: t("actions.markContained"),
      icon: <Shield className="h-4 w-4" />,
      onClick: (threat) => handleStatusChange(threat, "CONTAINED"),
      hidden: (threat) => threat.status !== "ACTIVE",
    },
    {
      label: t("actions.markMitigated"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (threat) => handleStatusChange(threat, "MITIGATED"),
      hidden: (threat) => threat.status !== "ACTIVE" && threat.status !== "CONTAINED",
    },
    {
      label: t("actions.markResolved"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (threat) => handleStatusChange(threat, "RESOLVED"),
      hidden: (threat) => threat.status === "RESOLVED",
    },
    {
      label: t("actions.markFalsePositive"),
      icon: <XCircle className="h-4 w-4" />,
      onClick: (threat) => handleStatusChange(threat, "FALSE_POSITIVE"),
      hidden: (threat) => threat.status === "FALSE_POSITIVE",
      separator: true,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.markAsContained"),
      icon: <Shield className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "CONTAINED"),
      confirmTitle: t("dialogs.markContained"),
      confirmDescription: t("dialogs.markContainedDescription"),
    },
    {
      label: t("actions.markAsMitigated"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "MITIGATED"),
      confirmTitle: t("dialogs.markMitigated"),
      confirmDescription: t("dialogs.markMitigatedDescription"),
    },
    {
      label: t("actions.markAsResolved"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "RESOLVED"),
      confirmTitle: t("dialogs.markResolved"),
      confirmDescription: t("dialogs.markResolvedDescription"),
    },
    {
      label: t("actions.markAsFalsePositive"),
      icon: <XCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusChange(ids, "FALSE_POSITIVE"),
      confirmTitle: t("dialogs.markFalsePositive"),
      confirmDescription: t("dialogs.markFalsePositiveDescription"),
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
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">{t("stats.totalThreats")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">{stats.ACTIVE || 0}</div>
            <p className="text-xs text-muted-foreground">{t("statuses.active")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">{stats.CONTAINED || 0}</div>
            <p className="text-xs text-muted-foreground">{t("statuses.contained")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">{stats.MITIGATED || 0}</div>
            <p className="text-xs text-muted-foreground">{t("statuses.mitigated")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{stats.RESOLVED || 0}</div>
            <p className="text-xs text-muted-foreground">{t("statuses.resolved")}</p>
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
                <SelectValue placeholder={t("columns.type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                {THREAT_TYPE_KEYS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`types.${type.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("columns.severity")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allSeverities")}</SelectItem>
                {SEVERITY_KEYS.map((severity) => (
                  <SelectItem key={severity} value={severity}>
                    {t(`severities.${severity.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={tCommon("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
                {STATUS_KEYS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`statuses.${status.toLowerCase().replace("_", "")}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSearch}>
              {tCommon("search")}
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
        emptyMessage={t("noThreats")}
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
