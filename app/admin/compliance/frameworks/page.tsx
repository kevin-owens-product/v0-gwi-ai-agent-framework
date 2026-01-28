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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Loader2,
  RefreshCw,
  Plus,
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface ComplianceFramework {
  id: string
  name: string
  code: string
  description: string | null
  version: string | null
  requirements: unknown[]
  controls: unknown[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  attestationCount: number
  auditCount: number
}

export default function FrameworksPage() {
  const t = useTranslations("admin.compliance.frameworks")
  const tCommon = useTranslations("common")
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newFramework, setNewFramework] = useState({
    name: "",
    code: "",
    description: "",
    version: "",
    isActive: true,
  })

  const fetchFrameworks = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(statusFilter !== "all" && { isActive: statusFilter }),
      })
      const response = await fetch(`/api/admin/compliance/frameworks?${params}`, {
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
      setFrameworks(data.frameworks || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch frameworks:", error)
      setFrameworks([])
    } finally {
      setIsLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchFrameworks()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchFrameworks])

  const handleCreateFramework = async () => {
    if (!newFramework.name || !newFramework.code) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/compliance/frameworks", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFramework),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || t("errors.createFailed"))
      }

      setCreateDialogOpen(false)
      setNewFramework({
        name: "",
        code: "",
        description: "",
        version: "",
        isActive: true,
      })
      fetchFrameworks()
    } catch (error) {
      console.error("Failed to create framework:", error)
      showErrorToast(error instanceof Error ? error.message : t("errors.createFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (framework: ComplianceFramework) => {
    try {
      const response = await fetch(`/api/admin/compliance/frameworks/${framework.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !framework.isActive }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.updateFailed"))
      }

      fetchFrameworks()
    } catch (error) {
      console.error("Failed to update framework:", error)
      toast.error(error instanceof Error ? error.message : t("errors.updateFailed"))
    }
  }

  const handleDeleteFramework = async (framework: ComplianceFramework) => {
    try {
      const response = await fetch(`/api/admin/compliance/frameworks/${framework.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.deleteFailed"))
      }

      fetchFrameworks()
    } catch (error) {
      console.error("Failed to delete framework:", error)
      toast.error(error instanceof Error ? error.message : t("errors.deleteFailed"))
    }
  }

  const handleBulkToggleStatus = async (ids: string[], isActive: boolean) => {
    try {
      const promises = ids.map((id) =>
        fetch(`/api/admin/compliance/frameworks/${id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        })
      )

      const results = await Promise.all(promises)
      const failed = results.filter((r) => !r.ok)

      if (failed.length > 0) {
        throw new Error(t("errors.bulkUpdateFailed"))
      }

      fetchFrameworks()
    } catch (error) {
      console.error("Failed to update frameworks:", error)
      toast.error(error instanceof Error ? error.message : t("errors.bulkUpdateFailed"))
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const promises = ids.map((id) =>
        fetch(`/api/admin/compliance/frameworks/${id}`, {
          method: "DELETE",
          credentials: "include",
        })
      )

      const results = await Promise.all(promises)
      const failed = results.filter((r) => !r.ok)

      if (failed.length > 0) {
        throw new Error(t("errors.bulkDeleteFailed"))
      }

      fetchFrameworks()
    } catch (error) {
      console.error("Failed to delete frameworks:", error)
      toast.error(error instanceof Error ? error.message : t("errors.bulkDeleteFailed"))
    }
  }

  // Column definitions
  const columns: Column<ComplianceFramework>[] = [
    {
      id: "framework",
      header: t("columns.framework"),
      cell: (framework) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{framework.name}</p>
            {framework.description && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {framework.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "code",
      header: t("columns.code"),
      cell: (framework) => <Badge variant="outline">{framework.code}</Badge>,
    },
    {
      id: "version",
      header: t("columns.version"),
      cell: (framework) => (
        <span className="text-muted-foreground">{framework.version || "-"}</span>
      ),
    },
    {
      id: "status",
      header: t("columns.status"),
      cell: (framework) =>
        framework.isActive ? (
          <Badge className="bg-green-500">{t("status.active")}</Badge>
        ) : (
          <Badge variant="secondary">{t("status.inactive")}</Badge>
        ),
    },
    {
      id: "attestations",
      header: t("columns.attestations"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (framework) => (
        <div className="flex items-center justify-center gap-1">
          <FileText className="h-3 w-3 text-muted-foreground" />
          {framework.attestationCount}
        </div>
      ),
    },
    {
      id: "audits",
      header: t("columns.audits"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (framework) => (
        <div className="flex items-center justify-center gap-1">
          <FileText className="h-3 w-3 text-muted-foreground" />
          {framework.auditCount}
        </div>
      ),
    },
    {
      id: "updated",
      header: t("columns.updated"),
      cell: (framework) => (
        <span className="text-muted-foreground">
          {new Date(framework.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  // Row actions
  const rowActions: RowAction<ComplianceFramework>[] = [
    {
      label: t("actions.activate"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: handleToggleStatus,
      hidden: (framework) => framework.isActive,
    },
    {
      label: t("actions.deactivate"),
      icon: <XCircle className="h-4 w-4" />,
      onClick: handleToggleStatus,
      hidden: (framework) => !framework.isActive,
    },
  ]

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.enableSelected"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkToggleStatus(ids, true),
    },
    {
      label: t("actions.disableSelected"),
      icon: <XCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkToggleStatus(ids, false),
    },
    {
      label: t("actions.deleteSelected"),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      separator: true,
      confirmTitle: t("dialogs.bulkDeleteTitle"),
      confirmDescription: (ids) => t("dialogs.bulkDeleteDescription", { count: ids.length }),
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
                  <Shield className="h-5 w-5 text-primary" />
                  {t("title")}
                </CardTitle>
                <CardDescription>
                  {t("description")} - {total} {tCommon("total")}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchFrameworks} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {tCommon("refresh")}
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("createFramework")}
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
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.all")}</SelectItem>
                <SelectItem value="true">{t("filters.active")}</SelectItem>
                <SelectItem value="false">{t("filters.inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <AdminDataTable
            data={frameworks}
            columns={columns}
            getRowId={(framework) => framework.id}
            isLoading={isLoading}
            emptyMessage={t("noFrameworks")}
            viewHref={(framework) => `/admin/compliance/frameworks/${framework.id}`}
            onDelete={handleDeleteFramework}
            deleteConfirmTitle={t("dialogs.deleteTitle")}
            deleteConfirmDescription={(framework) =>
              t("dialogs.deleteDescription", { name: framework.name })
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

      {/* Create Framework Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("dialogs.createTitle")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.createDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("form.name")} *</Label>
              <Input
                id="name"
                placeholder={t("form.namePlaceholder")}
                value={newFramework.name}
                onChange={(e) => setNewFramework({ ...newFramework, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t("form.code")} *</Label>
                <Input
                  id="code"
                  placeholder={t("form.codePlaceholder")}
                  value={newFramework.code}
                  onChange={(e) => setNewFramework({ ...newFramework, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">{t("form.version")}</Label>
                <Input
                  id="version"
                  placeholder={t("form.versionPlaceholder")}
                  value={newFramework.version}
                  onChange={(e) => setNewFramework({ ...newFramework, version: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("form.description")}</Label>
              <Textarea
                id="description"
                placeholder={t("form.descriptionPlaceholder")}
                value={newFramework.description}
                onChange={(e) => setNewFramework({ ...newFramework, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleCreateFramework}
              disabled={!newFramework.name || !newFramework.code || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {tCommon("creating")}
                </>
              ) : (
                t("createFramework")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
