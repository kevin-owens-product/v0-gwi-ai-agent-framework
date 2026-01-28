"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
  Loader2,
  RefreshCw,
  Plus,
  Building2,
  ArrowLeft,
  Download,
  User,
  Gavel,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Trash2,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface Organization {
  id: string
  name: string
  slug: string
}

interface DataUser {
  id: string
  name: string | null
  email: string
}

interface LegalHold {
  id: string
  name: string
  caseNumber: string | null
}

interface DataExport {
  id: string
  type: string
  requestedBy: string
  orgId: string | null
  userId: string | null
  legalHoldId: string | null
  status: string
  scope: Record<string, unknown>
  format: string
  fileUrl: string | null
  fileSize: number | null
  expiresAt: string | null
  error: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  organization: Organization | null
  user: DataUser | null
  requestedByUser: DataUser | null
  legalHold: LegalHold | null
}

export default function DataExportsPage() {
  const t = useTranslations("admin.compliance")
  const tCommon = useTranslations("common")
  const [exports, setExports] = useState<DataExport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newExport, setNewExport] = useState({
    type: "USER_DATA",
    format: "json",
  })

  const STATUS_OPTIONS = [
    { value: "all", label: t("dataExports.filters.allStatus") },
    { value: "PENDING", label: t("dataExports.status.pending") },
    { value: "PROCESSING", label: t("dataExports.status.processing") },
    { value: "COMPLETED", label: t("dataExports.status.completed") },
    { value: "FAILED", label: t("dataExports.status.failed") },
    { value: "EXPIRED", label: t("dataExports.status.expired") },
  ]

  const TYPE_OPTIONS = [
    { value: "all", label: t("dataExports.filters.allTypes") },
    { value: "GDPR_EXPORT", label: t("dataExports.types.gdprExport") },
    { value: "USER_DATA", label: t("dataExports.types.userData") },
    { value: "ORG_DATA", label: t("dataExports.types.orgData") },
    { value: "LEGAL_HOLD", label: t("dataExports.types.legalHold") },
    { value: "BACKUP", label: t("dataExports.types.backup") },
  ]

  const fetchExports = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
      })
      const response = await fetch(`/api/admin/compliance/data-exports?${params}`, {
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
      setExports(data.exports || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch data exports:", error)
      setExports([])
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter, typeFilter])

  useEffect(() => {
    fetchExports()
  }, [fetchExports])

  const handleCreateExport = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/compliance/data-exports", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExport),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("dataExports.errors.createFailed"))
      }

      setCreateDialogOpen(false)
      setNewExport({
        type: "USER_DATA",
        format: "json",
      })
      fetchExports()
    } catch (error) {
      console.error("Failed to create data export:", error)
      toast.error(error instanceof Error ? error.message : t("dataExports.errors.createFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t("dataExports.status.completed")}</Badge>
      case "PROCESSING":
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />{t("dataExports.status.processing")}</Badge>
      case "PENDING":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{t("dataExports.status.pending")}</Badge>
      case "FAILED":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t("dataExports.status.failed")}</Badge>
      case "EXPIRED":
        return <Badge variant="outline" className="text-muted-foreground">{t("dataExports.status.expired")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "GDPR_EXPORT":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">{t("dataExports.types.gdpr")}</Badge>
      case "USER_DATA":
        return <Badge variant="outline">{t("dataExports.types.userData")}</Badge>
      case "ORG_DATA":
        return <Badge variant="outline">{t("dataExports.types.orgData")}</Badge>
      case "LEGAL_HOLD":
        return <Badge variant="outline" className="border-red-500 text-red-500">{t("dataExports.types.legalHold")}</Badge>
      case "BACKUP":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">{t("dataExports.types.backup")}</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return "-"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  // Define columns for AdminDataTable
  const columns: Column<DataExport>[] = [
    {
      id: "export",
      header: t("dataExports.columns.export"),
      cell: (exp) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Download className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="font-mono text-xs">{exp.id.slice(0, 8)}...</p>
            <p className="text-xs text-muted-foreground">
              {t("dataExports.by")} {exp.requestedByUser?.name || exp.requestedByUser?.email || t("dataExports.unknown")}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: t("dataExports.columns.type"),
      cell: (exp) => getTypeBadge(exp.type),
    },
    {
      id: "subject",
      header: t("dataExports.columns.subject"),
      cell: (exp) => {
        if (exp.user) {
          return (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{exp.user.name || exp.user.email}</span>
            </div>
          )
        }
        if (exp.organization) {
          return (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{exp.organization.name}</span>
            </div>
          )
        }
        if (exp.legalHold) {
          return (
            <div className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-muted-foreground" />
              <span>{exp.legalHold.name}</span>
            </div>
          )
        }
        return <span className="text-muted-foreground">-</span>
      },
    },
    {
      id: "status",
      header: t("dataExports.columns.status"),
      cell: (exp) => getStatusBadge(exp.status),
    },
    {
      id: "format",
      header: t("dataExports.columns.format"),
      cell: (exp) => (
        <Badge variant="outline" className="uppercase">
          {exp.format}
        </Badge>
      ),
    },
    {
      id: "size",
      header: t("dataExports.columns.size"),
      cell: (exp) => (
        <span className="text-muted-foreground">{formatFileSize(exp.fileSize)}</span>
      ),
    },
    {
      id: "requested",
      header: t("dataExports.columns.requested"),
      cell: (exp) => (
        <span className="text-muted-foreground">
          {new Date(exp.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  // Handle delete export
  const handleDeleteExport = async (exp: DataExport) => {
    try {
      const response = await fetch(`/api/admin/compliance/data-exports/${exp.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("dataExports.errors.deleteFailed"))
      }
      fetchExports()
    } catch (error) {
      console.error("Failed to delete export:", error)
      throw error
    }
  }

  // Handle retry export
  const handleRetryExport = async (exp: DataExport) => {
    try {
      const response = await fetch(`/api/admin/compliance/data-exports/${exp.id}/retry`, {
        method: "POST",
        credentials: "include",
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("dataExports.errors.retryFailed"))
      }
      fetchExports()
    } catch (error) {
      console.error("Failed to retry export:", error)
      toast.error(error instanceof Error ? error.message : t("dataExports.errors.retryFailed"))
    }
  }

  // Define row actions
  const rowActions: RowAction<DataExport>[] = [
    {
      label: t("dataExports.actions.downloadFile"),
      icon: <ExternalLink className="h-4 w-4" />,
      href: (exp) => exp.fileUrl || "#",
      hidden: (exp) => !exp.fileUrl || exp.status !== "COMPLETED",
    },
    {
      label: t("dataExports.actions.retryExport"),
      icon: <RotateCcw className="h-4 w-4" />,
      onClick: handleRetryExport,
      hidden: (exp) => exp.status !== "FAILED",
    },
    {
      label: t("dataExports.actions.viewLegalHold"),
      icon: <Gavel className="h-4 w-4" />,
      href: (exp) => `/admin/compliance/legal-holds/${exp.legalHoldId}`,
      hidden: (exp) => !exp.legalHold,
    },
    {
      label: t("dataExports.actions.viewUser"),
      icon: <User className="h-4 w-4" />,
      href: (exp) => `/admin/users/${exp.userId}`,
      hidden: (exp) => !exp.user,
    },
    {
      label: t("dataExports.actions.viewOrganization"),
      icon: <Building2 className="h-4 w-4" />,
      href: (exp) => `/admin/tenants/${exp.orgId}`,
      hidden: (exp) => !exp.organization,
    },
  ]

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("dataExports.bulk.retryFailed"),
      icon: <RotateCcw className="h-4 w-4" />,
      onClick: async (ids) => {
        const failedExports = exports.filter((e) => ids.includes(e.id) && e.status === "FAILED")
        if (failedExports.length === 0) {
          toast.info(t("dataExports.bulk.noFailedSelected"))
          return
        }
        try {
          await Promise.all(
            failedExports.map((exp) =>
              fetch(`/api/admin/compliance/data-exports/${exp.id}/retry`, {
                method: "POST",
                credentials: "include",
              })
            )
          )
          fetchExports()
          setSelectedIds(new Set())
        } catch (error) {
          console.error("Failed to retry exports:", error)
        }
      },
      confirmTitle: t("dataExports.bulk.retryFailedTitle"),
      confirmDescription: t("dataExports.bulk.retryFailedConfirm"),
    },
    {
      separator: true,
      label: t("dataExports.bulk.deleteSelected"),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async (ids) => {
        try {
          await Promise.all(
            ids.map((id) =>
              fetch(`/api/admin/compliance/data-exports/${id}`, {
                method: "DELETE",
                credentials: "include",
              })
            )
          )
          fetchExports()
          setSelectedIds(new Set())
        } catch (error) {
          console.error("Failed to delete exports:", error)
        }
      },
      variant: "destructive",
      confirmTitle: t("dataExports.bulk.deleteExportsTitle"),
      confirmDescription: t("dataExports.bulk.deleteExportsConfirm"),
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
                  <Download className="h-5 w-5 text-primary" />
                  {t("dataExports.title")}
                </CardTitle>
                <CardDescription>
                  {t("dataExports.description", { total })}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchExports} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {tCommon("refresh")}
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("dataExports.newExport")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("dataExports.filters.status")} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("dataExports.filters.type")} />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <AdminDataTable
            data={exports}
            columns={columns}
            getRowId={(exp) => exp.id}
            isLoading={isLoading}
            emptyMessage={t("dataExports.noExports")}
            viewHref={(exp) => `/admin/compliance/data-exports/${exp.id}`}
            rowActions={rowActions}
            bulkActions={bulkActions}
            onDelete={handleDeleteExport}
            deleteConfirmTitle={t("dataExports.deleteTitle")}
            deleteConfirmDescription={(exp) =>
              t("dataExports.deleteConfirm", { type: exp.type.replace("_", " ") })
            }
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>

      {/* Create Export Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("dataExports.dialog.createTitle")}</DialogTitle>
            <DialogDescription>
              {t("dataExports.dialog.createDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("dataExports.fields.exportType")}</Label>
              <Select
                value={newExport.type}
                onValueChange={(value) => setNewExport({ ...newExport, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER_DATA">{t("dataExports.types.userData")}</SelectItem>
                  <SelectItem value="ORG_DATA">{t("dataExports.types.orgData")}</SelectItem>
                  <SelectItem value="GDPR_EXPORT">{t("dataExports.types.gdprExport")}</SelectItem>
                  <SelectItem value="BACKUP">{t("dataExports.types.backup")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("dataExports.fields.format")}</Label>
              <Select
                value={newExport.format}
                onValueChange={(value) => setNewExport({ ...newExport, format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">{t("dataExports.formats.json")}</SelectItem>
                  <SelectItem value="csv">{t("dataExports.formats.csv")}</SelectItem>
                  <SelectItem value="zip">{t("dataExports.formats.zip")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleCreateExport} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {tCommon("creating")}
                </>
              ) : (
                t("dataExports.createExport")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
