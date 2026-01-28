"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
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
  Building2,
  ArrowLeft,
  Gavel,
  Users,
  Download,
  CheckCircle,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface Organization {
  id: string
  name: string
  slug: string
}

interface LegalHold {
  id: string
  name: string
  description: string | null
  caseNumber: string | null
  orgId: string | null
  custodians: string[]
  startDate: string
  endDate: string | null
  status: string
  scope: Record<string, unknown>
  notes: string | null
  createdBy: string
  releasedBy: string | null
  releasedAt: string | null
  createdAt: string
  organization: Organization | null
  exportCount: number
  custodianCount: number
}

export default function LegalHoldsPage() {
  const t = useTranslations("admin.compliance.legalHolds")
  const tCommon = useTranslations("common")

  const STATUS_OPTIONS = [
    { value: "all", label: t("filters.allStatus") },
    { value: "ACTIVE", label: t("status.active") },
    { value: "RELEASED", label: t("status.released") },
    { value: "EXPIRED", label: t("status.expired") },
  ]
  const [legalHolds, setLegalHolds] = useState<LegalHold[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [holdToRelease, setHoldToRelease] = useState<LegalHold | null>(null)
  const [newHold, setNewHold] = useState({
    name: "",
    description: "",
    caseNumber: "",
    startDate: new Date().toISOString().split("T")[0],
  })

  const fetchLegalHolds = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      })
      const response = await fetch(`/api/admin/compliance/legal-holds?${params}`, {
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
      setLegalHolds(data.legalHolds || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch legal holds:", error)
      setLegalHolds([])
    } finally {
      setIsLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchLegalHolds()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchLegalHolds])

  const handleCreateHold = async () => {
    if (!newHold.name) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/compliance/legal-holds", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHold),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.createFailed"))
      }

      setCreateDialogOpen(false)
      setNewHold({
        name: "",
        description: "",
        caseNumber: "",
        startDate: new Date().toISOString().split("T")[0],
      })
      fetchLegalHolds()
    } catch (error) {
      console.error("Failed to create legal hold:", error)
      showErrorToast(error instanceof Error ? error.message : t("errors.createFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReleaseHold = async () => {
    if (!holdToRelease) return

    try {
      const response = await fetch(`/api/admin/compliance/legal-holds/${holdToRelease.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RELEASED" }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.releaseFailed"))
      }

      fetchLegalHolds()
    } catch (error) {
      console.error("Failed to release legal hold:", error)
      toast.error(error instanceof Error ? error.message : t("errors.releaseFailed"))
    } finally {
      setHoldToRelease(null)
    }
  }

  const handleBulkRelease = async (ids: string[]) => {
    try {
      const results = await Promise.allSettled(
        ids.map(id =>
          fetch(`/api/admin/compliance/legal-holds/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "RELEASED" }),
          })
        )
      )

      const failed = results.filter(r => r.status === "rejected").length
      if (failed > 0) {
        toast.error(t("bulk.failedToRelease", { failed, total: ids.length }))
      }

      fetchLegalHolds()
    } catch (error) {
      console.error("Failed to release legal holds:", error)
      toast.error(error instanceof Error ? error.message : t("errors.releaseFailed"))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />{t("status.active")}</Badge>
      case "RELEASED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t("status.released")}</Badge>
      case "EXPIRED":
        return <Badge variant="secondary">{t("status.expired")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Define columns for AdminDataTable
  const columns: Column<LegalHold>[] = [
    {
      id: "name",
      header: t("columns.legalHold"),
      cell: (hold) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Gavel className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <p className="font-medium">{hold.name}</p>
            {hold.description && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {hold.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "caseNumber",
      header: t("columns.caseNumber"),
      cell: (hold) => (
        hold.caseNumber ? (
          <Badge variant="outline" className="font-mono">
            {hold.caseNumber}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      id: "organization",
      header: t("columns.organization"),
      cell: (hold) => (
        hold.organization ? (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{hold.organization.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{t("platformWide")}</span>
        )
      ),
    },
    {
      id: "status",
      header: t("columns.status"),
      cell: (hold) => getStatusBadge(hold.status),
    },
    {
      id: "custodians",
      header: t("columns.custodians"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (hold) => (
        <div className="flex items-center justify-center gap-1">
          <Users className="h-3 w-3 text-muted-foreground" />
          {hold.custodianCount}
        </div>
      ),
    },
    {
      id: "exports",
      header: t("columns.exports"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (hold) => (
        <div className="flex items-center justify-center gap-1">
          <Download className="h-3 w-3 text-muted-foreground" />
          {hold.exportCount}
        </div>
      ),
    },
    {
      id: "startDate",
      header: t("columns.startDate"),
      cell: (hold) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(hold.startDate).toLocaleDateString()}
        </div>
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<LegalHold>[] = [
    {
      label: t("actions.viewOrganization"),
      icon: <Building2 className="h-4 w-4" />,
      href: (hold) => `/admin/tenants/${hold.orgId}`,
      hidden: (hold) => !hold.organization,
    },
    {
      label: t("actions.releaseHold"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (hold) => setHoldToRelease(hold),
      variant: "destructive",
      hidden: (hold) => hold.status !== "ACTIVE",
      separator: true,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("bulk.releaseSelected"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: handleBulkRelease,
      variant: "destructive",
      confirmTitle: t("bulk.releaseHoldsTitle"),
      confirmDescription: t("bulk.releaseHoldsConfirm"),
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
                  <Gavel className="h-5 w-5 text-primary" />
                  {t("title")}
                </CardTitle>
                <CardDescription>
                  {t("description", { total })}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchLegalHolds} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {tCommon("refresh")}
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("dialog.createTitle")}
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("columns.status")} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <AdminDataTable
            data={legalHolds}
            columns={columns}
            getRowId={(hold) => hold.id}
            isLoading={isLoading}
            emptyMessage={t("noLegalHolds")}
            viewHref={(hold) => `/admin/compliance/legal-holds/${hold.id}`}
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

      {/* Create Legal Hold Dialog */}
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
                value={newHold.name}
                onChange={(e) => setNewHold({ ...newHold, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caseNumber">{t("fields.caseNumber")}</Label>
                <Input
                  id="caseNumber"
                  placeholder={t("placeholders.caseNumber")}
                  value={newHold.caseNumber}
                  onChange={(e) => setNewHold({ ...newHold, caseNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">{t("fields.startDate")} {t("fields.required")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newHold.startDate}
                  onChange={(e) => setNewHold({ ...newHold, startDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("fields.description")}</Label>
              <Textarea
                id="description"
                placeholder={t("placeholders.description")}
                value={newHold.description}
                onChange={(e) => setNewHold({ ...newHold, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleCreateHold}
              disabled={!newHold.name || isSubmitting}
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

      {/* Release Confirmation Dialog */}
      <ConfirmationDialog
        open={!!holdToRelease}
        onOpenChange={(open) => !open && setHoldToRelease(null)}
        title={t("dialog.releaseTitle")}
        description={t("dialog.releaseDescription", { name: holdToRelease?.name || "" })}
        confirmText={tCommon("release")}
        onConfirm={handleReleaseHold}
        variant="destructive"
      />
    </div>
  )
}
