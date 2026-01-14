"use client"

import { useState, useEffect, useCallback } from "react"
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
  FileText,
} from "lucide-react"
import Link from "next/link"
import { AdminDataTable, Column, RowAction } from "@/components/admin/data-table"

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

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "EXPIRED", label: "Expired" },
]

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "GDPR_EXPORT", label: "GDPR Export" },
  { value: "USER_DATA", label: "User Data" },
  { value: "ORG_DATA", label: "Org Data" },
  { value: "LEGAL_HOLD", label: "Legal Hold" },
  { value: "BACKUP", label: "Backup" },
]

export default function DataExportsPage() {
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
          window.location.href = "/admin/login"
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
        throw new Error(data.error || "Failed to create data export")
      }

      setCreateDialogOpen(false)
      setNewExport({
        type: "USER_DATA",
        format: "json",
      })
      fetchExports()
    } catch (error) {
      console.error("Failed to create data export:", error)
      alert(error instanceof Error ? error.message : "Failed to create data export")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "PROCESSING":
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Processing</Badge>
      case "PENDING":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "FAILED":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case "EXPIRED":
        return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "GDPR_EXPORT":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">GDPR</Badge>
      case "USER_DATA":
        return <Badge variant="outline">User Data</Badge>
      case "ORG_DATA":
        return <Badge variant="outline">Org Data</Badge>
      case "LEGAL_HOLD":
        return <Badge variant="outline" className="border-red-500 text-red-500">Legal Hold</Badge>
      case "BACKUP":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Backup</Badge>
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
      header: "Export",
      cell: (exp) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Download className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="font-mono text-xs">{exp.id.slice(0, 8)}...</p>
            <p className="text-xs text-muted-foreground">
              by {exp.requestedByUser?.name || exp.requestedByUser?.email || "Unknown"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (exp) => getTypeBadge(exp.type),
    },
    {
      id: "subject",
      header: "Subject",
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
      header: "Status",
      cell: (exp) => getStatusBadge(exp.status),
    },
    {
      id: "format",
      header: "Format",
      cell: (exp) => (
        <Badge variant="outline" className="uppercase">
          {exp.format}
        </Badge>
      ),
    },
    {
      id: "size",
      header: "Size",
      cell: (exp) => (
        <span className="text-muted-foreground">{formatFileSize(exp.fileSize)}</span>
      ),
    },
    {
      id: "requested",
      header: "Requested",
      cell: (exp) => (
        <span className="text-muted-foreground">
          {new Date(exp.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<DataExport>[] = [
    {
      label: "Download File",
      icon: <ExternalLink className="h-4 w-4" />,
      href: (exp) => exp.fileUrl || "#",
      hidden: (exp) => !exp.fileUrl || exp.status !== "COMPLETED",
    },
    {
      label: "View Legal Hold",
      icon: <Gavel className="h-4 w-4" />,
      href: (exp) => `/admin/compliance/legal-holds/${exp.legalHoldId}`,
      hidden: (exp) => !exp.legalHold,
    },
    {
      label: "View User",
      icon: <User className="h-4 w-4" />,
      href: (exp) => `/admin/users/${exp.userId}`,
      hidden: (exp) => !exp.user,
    },
    {
      label: "View Organization",
      icon: <Building2 className="h-4 w-4" />,
      href: (exp) => `/admin/tenants/${exp.orgId}`,
      hidden: (exp) => !exp.organization,
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
                  Back
                </Link>
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Data Exports
                </CardTitle>
                <CardDescription>
                  GDPR requests, user data exports, and legal hold exports - {total} total
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchExports} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
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
                <SelectValue placeholder="Type" />
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
            emptyMessage="No data exports found"
            viewHref={(exp) => `/admin/compliance/data-exports/${exp.id}`}
            rowActions={rowActions}
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
            <DialogTitle>Create Data Export</DialogTitle>
            <DialogDescription>
              Request a new data export. The export will be processed asynchronously.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Type</Label>
              <Select
                value={newExport.type}
                onValueChange={(value) => setNewExport({ ...newExport, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER_DATA">User Data</SelectItem>
                  <SelectItem value="ORG_DATA">Organization Data</SelectItem>
                  <SelectItem value="GDPR_EXPORT">GDPR Export</SelectItem>
                  <SelectItem value="BACKUP">Backup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={newExport.format}
                onValueChange={(value) => setNewExport({ ...newExport, format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="zip">ZIP Archive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateExport} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Export"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
