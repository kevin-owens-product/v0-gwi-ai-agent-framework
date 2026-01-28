"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"
import {
  FileText,
  Plus,
  RefreshCw,
  Play,
  Trash2,
  Search,
  Calendar,
  Clock,
  Filter,
} from "lucide-react"
import Link from "next/link"

interface CustomReport {
  id: string
  name: string
  description: string | null
  type: string
  query: Record<string, unknown>
  schedule: string | null
  recipients: string[]
  format: string
  isActive: boolean
  lastRunAt: string | null
  nextRunAt: string | null
  lastResult: Record<string, unknown> | null
  createdBy: string | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function CustomReportsPage() {
  const t = useTranslations("admin.analytics.reports")
  const tCommon = useTranslations("admin.analytics")
  const [reports, setReports] = useState<CustomReport[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [, setRunningReportId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Filter state
  const [filterType, setFilterType] = useState<string>("all")
  const [filterActive, setFilterActive] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const REPORT_TYPES = [
    { value: "USAGE", label: t("types.usage") },
    { value: "REVENUE", label: t("types.revenue") },
    { value: "SECURITY", label: t("types.security") },
    { value: "COMPLIANCE", label: t("types.compliance") },
    { value: "USER_ACTIVITY", label: t("types.userActivity") },
    { value: "CUSTOM_SQL", label: t("types.customSql") },
  ]

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", currentPage.toString())
      params.set("limit", "10")

      if (filterType && filterType !== "all") {
        params.set("type", filterType)
      }
      if (filterActive && filterActive !== "all") {
        params.set("isActive", filterActive)
      }
      if (searchQuery) {
        params.set("search", searchQuery)
      }

      const response = await fetch(`/api/admin/analytics/reports?${params}`)
      const data = await response.json()
      setReports(data.reports)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [currentPage, filterType, filterActive, fetchReports])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchReports()
  }

  const handleRunReport = async (reportId: string) => {
    setRunningReportId(reportId)
    try {
      const response = await fetch(`/api/admin/analytics/reports/${reportId}/run`, {
        method: "POST",
      })

      if (response.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error("Failed to run report:", error)
    } finally {
      setRunningReportId(null)
    }
  }

  const handleToggleActive = async (report: CustomReport) => {
    try {
      await fetch(`/api/admin/analytics/reports/${report.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !report.isActive }),
      })
      fetchReports()
    } catch (error) {
      console.error("Failed to toggle report status:", error)
    }
  }

  const handleDeleteReport = async (report: CustomReport) => {
    try {
      await fetch(`/api/admin/analytics/reports/${report.id}`, {
        method: "DELETE",
      })
      fetchReports()
    } catch (error) {
      console.error("Failed to delete report:", error)
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/admin/analytics/reports/${id}`, {
            method: "DELETE",
          })
        )
      )
      fetchReports()
    } catch (error) {
      console.error("Failed to bulk delete reports:", error)
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      USAGE: "bg-green-500/10 text-green-500",
      REVENUE: "bg-yellow-500/10 text-yellow-500",
      SECURITY: "bg-red-500/10 text-red-500",
      COMPLIANCE: "bg-purple-500/10 text-purple-500",
      USER_ACTIVITY: "bg-blue-500/10 text-blue-500",
      CUSTOM_SQL: "bg-orange-500/10 text-orange-500",
    }
    return colors[type] || "bg-gray-500/10 text-gray-500"
  }

  const formatSchedule = (schedule: string | null) => {
    if (!schedule) return t("schedules.onDemand")
    const schedules: Record<string, string> = {
      daily: t("schedules.daily"),
      weekly: t("schedules.weekly"),
      monthly: t("schedules.monthly"),
    }
    return schedules[schedule] || schedule
  }

  // Define columns for AdminDataTable
  const columns: Column<CustomReport>[] = [
    {
      id: "report",
      header: t("table.report"),
      cell: (report) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{report.name}</p>
            {report.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {report.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: t("table.type"),
      cell: (report) => (
        <Badge className={getTypeColor(report.type)}>
          {report.type}
        </Badge>
      ),
    },
    {
      id: "schedule",
      header: t("table.schedule"),
      cell: (report) => (
        <div className="flex items-center gap-1 text-sm">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {formatSchedule(report.schedule)}
        </div>
      ),
    },
    {
      id: "lastRun",
      header: t("table.lastRun"),
      cell: (report) =>
        report.lastRunAt ? (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {new Date(report.lastRunAt).toLocaleDateString()}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">{t("table.never")}</span>
        ),
    },
    {
      id: "nextRun",
      header: t("table.nextRun"),
      cell: (report) =>
        report.nextRunAt ? (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {new Date(report.nextRunAt).toLocaleDateString()}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        ),
    },
    {
      id: "active",
      header: t("table.active"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (report) => (
        <Switch
          checked={report.isActive}
          onCheckedChange={() => handleToggleActive(report)}
        />
      ),
    },
  ]

  // Define row actions (created dynamically to access current runningReportId)
  const rowActions: RowAction<CustomReport>[] = [
    {
      label: t("actions.runNow"),
      icon: <Play className="h-4 w-4" />,
      onClick: (report) => handleRunReport(report.id),
      hidden: (report) => !report.isActive,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.deleteSelected"),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      confirmTitle: t("confirmDelete.title"),
      confirmDescription: t("confirmDelete.description"),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchReports} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {tCommon("actions.refresh")}
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/analytics/reports/new">
              <Plus className="h-4 w-4 mr-2" />
              {t("actions.newReport")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("summary.totalReports")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("summary.activeReports")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {reports.filter(r => r.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("summary.scheduledReports")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {reports.filter(r => r.schedule).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("summary.runToday")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => {
                if (!r.lastRunAt) return false
                const today = new Date()
                const runDate = new Date(r.lastRunAt)
                return runDate.toDateString() === today.toDateString()
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">{t("filters.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("filters.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.allTypes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterActive} onValueChange={setFilterActive}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.allStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                <SelectItem value="true">{t("filters.active")}</SelectItem>
                <SelectItem value="false">{t("filters.inactive")}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>{t("actions.search")}</Button>
            <Button
              variant="outline"
              onClick={() => {
                setFilterType("all")
                setFilterActive("all")
                setSearchQuery("")
                setCurrentPage(1)
              }}
            >
              {t("actions.clear")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("table.title")}</CardTitle>
          <CardDescription>
            {t("table.description", { count: pagination?.total || 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminDataTable
            data={reports}
            columns={columns}
            getRowId={(report) => report.id}
            isLoading={isLoading}
            emptyMessage={t("table.noReports")}
            viewHref={(report) => `/admin/analytics/reports/${report.id}`}
            onDelete={handleDeleteReport}
            deleteConfirmTitle={t("confirmDelete.title")}
            deleteConfirmDescription={(report) =>
              t("confirmDelete.singleDescription", { name: report.name })
            }
            rowActions={rowActions}
            bulkActions={bulkActions}
            page={pagination?.page || 1}
            totalPages={pagination?.totalPages || 1}
            total={pagination?.total}
            onPageChange={setCurrentPage}
            enableSelection={true}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>
    </div>
  )
}
