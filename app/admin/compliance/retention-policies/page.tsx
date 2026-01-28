"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { showErrorToast } from "@/lib/toast-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Loader2,
  RefreshCw,
  Plus,
  ArrowLeft,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Database,
  Timer,
} from "lucide-react"
import Link from "next/link"

interface RetentionPolicy {
  id: string
  name: string
  description: string | null
  dataType: string
  retentionDays: number
  retentionPeriod: string
  scope: string
  targetOrgs: string[]
  targetPlans: string[]
  deleteAction: string
  isActive: boolean
  lastRun: string | null
  nextRun: string | null
  daysUntilNextRun: number | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export default function RetentionPoliciesPage() {
  const t = useTranslations("admin.compliance.retentionPolicies")
  const tCommon = useTranslations("common")

  const SCOPE_OPTIONS = [
    { value: "all", label: t("filters.allScopes") },
    { value: "PLATFORM", label: t("filters.platformWide") },
    { value: "ORGANIZATION", label: t("filters.organization") },
    { value: "PLAN", label: t("filters.byPlan") },
  ]

  const DATA_TYPE_OPTIONS = [
    { value: "all", label: t("filters.allTypes") },
    { value: "AGENT_RUNS", label: t("dataTypes.agentRuns") },
    { value: "AUDIT_LOGS", label: t("dataTypes.auditLogs") },
    { value: "USER_SESSIONS", label: t("dataTypes.userSessions") },
    { value: "TEMP_FILES", label: t("dataTypes.tempFiles") },
    { value: "NOTIFICATIONS", label: t("dataTypes.notifications") },
    { value: "ANALYTICS", label: t("dataTypes.analytics") },
  ]
  const [policies, setPolicies] = useState<RetentionPolicy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [scopeFilter, setScopeFilter] = useState("all")
  const [dataTypeFilter, setDataTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newPolicy, setNewPolicy] = useState({
    name: "",
    description: "",
    dataType: "AGENT_RUNS",
    retentionDays: 90,
    scope: "PLATFORM",
    deleteAction: "SOFT_DELETE",
    isActive: true,
  })

  const fetchPolicies = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(scopeFilter !== "all" && { scope: scopeFilter }),
        ...(dataTypeFilter !== "all" && { dataType: dataTypeFilter }),
        ...(statusFilter !== "all" && { isActive: statusFilter }),
      })
      const response = await fetch(`/api/admin/compliance/retention-policies?${params}`, {
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data = await response.json()
      setPolicies(data.policies || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch retention policies:", error)
      setPolicies([])
    } finally {
      setIsLoading(false)
    }
  }, [page, search, scopeFilter, dataTypeFilter, statusFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPolicies()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchPolicies])

  const handleCreatePolicy = async () => {
    if (!newPolicy.name || !newPolicy.dataType) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/compliance/retention-policies", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPolicy),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.createFailed"))
      }

      setCreateDialogOpen(false)
      setNewPolicy({
        name: "",
        description: "",
        dataType: "AGENT_RUNS",
        retentionDays: 90,
        scope: "PLATFORM",
        deleteAction: "SOFT_DELETE",
        isActive: true,
      })
      fetchPolicies()
    } catch (error) {
      console.error("Failed to create retention policy:", error)
      showErrorToast(error instanceof Error ? error.message : t("errors.createFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (policy: RetentionPolicy) => {
    try {
      const response = await fetch(`/api/admin/compliance/retention-policies/${policy.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !policy.isActive }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.updateFailed"))
      }

      fetchPolicies()
    } catch (error) {
      console.error("Failed to update policy:", error)
      toast.error(error instanceof Error ? error.message : t("errors.updateFailed"))
    }
  }

  const handleDeletePolicy = async (policy: RetentionPolicy) => {
    try {
      const response = await fetch(`/api/admin/compliance/retention-policies/${policy.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.deleteFailed"))
      }

      fetchPolicies()
    } catch (error) {
      console.error("Failed to delete policy:", error)
      toast.error(error instanceof Error ? error.message : t("errors.deleteFailed"))
    }
  }

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case "PLATFORM":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">{t("scope.platform")}</Badge>
      case "ORGANIZATION":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">{t("scope.organization")}</Badge>
      case "PLAN":
        return <Badge variant="outline" className="border-green-500 text-green-500">{t("scope.plan")}</Badge>
      default:
        return <Badge variant="outline">{scope}</Badge>
    }
  }

  const getDeleteActionBadge = (action: string) => {
    switch (action) {
      case "SOFT_DELETE":
        return <Badge variant="secondary">{t("deleteAction.softDelete")}</Badge>
      case "HARD_DELETE":
        return <Badge variant="destructive">{t("deleteAction.hardDelete")}</Badge>
      case "ARCHIVE":
        return <Badge variant="outline">{t("deleteAction.archive")}</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  // Define table columns
  const columns: Column<RetentionPolicy>[] = [
    {
      id: "policy",
      header: t("columns.policy"),
      cell: (policy) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Database className="h-4 w-4 text-purple-500" />
          </div>
          <div>
            <p className="font-medium">{policy.name}</p>
            {policy.description && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {policy.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "dataType",
      header: t("columns.dataType"),
      cell: (policy) => {
        const dataTypeMap: Record<string, string> = {
          "AGENT_RUNS": "agentRuns",
          "AUDIT_LOGS": "auditLogs",
          "USER_SESSIONS": "userSessions",
          "TEMP_FILES": "tempFiles",
          "NOTIFICATIONS": "notifications",
          "ANALYTICS": "analytics",
        }
        const dataTypeKey = dataTypeMap[policy.dataType] || policy.dataType.toLowerCase().replace(/_/g, "")
        return <Badge variant="outline">{t(`dataTypes.${dataTypeKey}`)}</Badge>
      },
    },
    {
      id: "retention",
      header: t("columns.retention"),
      cell: (policy) => (
        <div className="flex items-center gap-1">
          <Timer className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">{policy.retentionPeriod}</span>
        </div>
      ),
    },
    {
      id: "scope",
      header: t("columns.scope"),
      cell: (policy) => getScopeBadge(policy.scope),
    },
    {
      id: "action",
      header: t("columns.action"),
      cell: (policy) => getDeleteActionBadge(policy.deleteAction),
    },
    {
      id: "status",
      header: t("columns.status"),
      cell: (policy) =>
        policy.isActive ? (
          <Badge className="bg-green-500">{t("status.active")}</Badge>
        ) : (
          <Badge variant="secondary">{t("status.inactive")}</Badge>
        ),
    },
    {
      id: "nextRun",
      header: t("columns.nextRun"),
      cell: (policy) =>
        policy.nextRun ? (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            {policy.daysUntilNextRun !== null && policy.daysUntilNextRun <= 0
              ? t("nextRun.today")
              : t("nextRun.days", { days: policy.daysUntilNextRun })}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<RetentionPolicy>[] = [
    {
      label: t("actions.activate"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: handleToggleStatus,
      hidden: (policy) => policy.isActive,
    },
    {
      label: t("actions.deactivate"),
      icon: <XCircle className="h-4 w-4" />,
      onClick: handleToggleStatus,
      hidden: (policy) => !policy.isActive,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("bulk.enableSelected"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: async (ids) => {
        for (const id of ids) {
          const policy = policies.find((p) => p.id === id)
          if (policy && !policy.isActive) {
            await handleToggleStatus(policy)
          }
        }
        setSelectedIds(new Set())
      },
    },
    {
      label: t("bulk.disableSelected"),
      icon: <XCircle className="h-4 w-4" />,
      onClick: async (ids) => {
        for (const id of ids) {
          const policy = policies.find((p) => p.id === id)
          if (policy && policy.isActive) {
            await handleToggleStatus(policy)
          }
        }
        setSelectedIds(new Set())
      },
    },
    {
      label: t("bulk.deleteSelected"),
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive" as const,
      separator: true,
      confirmTitle: t("bulk.deletePoliciesTitle"),
      confirmDescription: t("bulk.deletePoliciesConfirm"),
      onClick: async (ids) => {
        for (const id of ids) {
          const policy = policies.find((p) => p.id === id)
          if (policy) {
            await handleDeletePolicy(policy)
          }
        }
        setSelectedIds(new Set())
      },
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/compliance">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {tCommon("back")}
                </Link>
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {t("title")}
                </CardTitle>
                <CardDescription>
                  {t("description", { total })}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchPolicies} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {tCommon("refresh")}
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("actions.addPolicy")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("filters.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={dataTypeFilter} onValueChange={setDataTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("columns.dataType")} />
              </SelectTrigger>
              <SelectContent>
                {DATA_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("columns.scope")} />
              </SelectTrigger>
              <SelectContent>
                {SCOPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t("columns.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("status.all")}</SelectItem>
                <SelectItem value="true">{t("status.active")}</SelectItem>
                <SelectItem value="false">{t("status.inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <AdminDataTable
            data={policies}
            columns={columns}
            getRowId={(policy) => policy.id}
            isLoading={isLoading}
            emptyMessage={t("noPolicies")}
            onDelete={handleDeletePolicy}
            deleteConfirmTitle={t("dialog.deleteTitle")}
            deleteConfirmDescription={(policy) =>
              t("dialog.deleteDescription", { name: policy.name })
            }
            rowActions={rowActions}
            bulkActions={bulkActions}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>

      {/* Create Policy Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("dialog.createTitle")}</DialogTitle>
            <DialogDescription>
              {t("dialog.createDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("fields.name")} {t("fields.required")}</Label>
              <Input
                id="name"
                placeholder={t("placeholders.name")}
                value={newPolicy.name}
                onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("fields.dataType")} {t("fields.required")}</Label>
                <Select
                  value={newPolicy.dataType}
                  onValueChange={(value) => setNewPolicy({ ...newPolicy, dataType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retentionDays">{t("fields.retentionDays")} {t("fields.required")}</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  min="-1"
                  placeholder={t("placeholders.retentionDays")}
                  value={newPolicy.retentionDays}
                  onChange={(e) => setNewPolicy({ ...newPolicy, retentionDays: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">{t("hints.retentionDaysForever")}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("fields.scope")}</Label>
                <Select
                  value={newPolicy.scope}
                  onValueChange={(value) => setNewPolicy({ ...newPolicy, scope: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCOPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("fields.deleteAction")}</Label>
                <Select
                  value={newPolicy.deleteAction}
                  onValueChange={(value) => setNewPolicy({ ...newPolicy, deleteAction: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOFT_DELETE">{t("deleteAction.softDelete")}</SelectItem>
                    <SelectItem value="HARD_DELETE">{t("deleteAction.hardDelete")}</SelectItem>
                    <SelectItem value="ARCHIVE">{t("deleteAction.archive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("fields.description")}</Label>
              <Textarea
                id="description"
                placeholder={t("placeholders.description")}
                value={newPolicy.description}
                onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleCreatePolicy}
              disabled={!newPolicy.name || !newPolicy.dataType || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {tCommon("creating")}
                </>
              ) : (
                t("dialog.createTitle")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
