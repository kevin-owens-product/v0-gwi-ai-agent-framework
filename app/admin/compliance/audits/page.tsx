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
import { Input } from "@/components/ui/input"
import {
  Loader2,
  RefreshCw,
  Plus,
  Shield,
  Building2,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  FileSearch,
  PlayCircle,
} from "lucide-react"
import Link from "next/link"
import { AdminDataTable, Column, RowAction } from "@/components/admin/data-table"

interface Framework {
  id: string
  name: string
  code: string
}

interface Organization {
  id: string
  name: string
  slug: string
}

interface Audit {
  id: string
  frameworkId: string
  orgId: string | null
  type: string
  status: string
  scheduledDate: string
  startedAt: string | null
  completedAt: string | null
  auditor: string | null
  score: number | null
  findings: unknown[]
  recommendations: unknown[]
  reportUrl: string | null
  createdAt: string
  framework: Framework
  organization: Organization | null
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
]

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "INTERNAL", label: "Internal" },
  { value: "EXTERNAL", label: "External" },
  { value: "SELF_ASSESSMENT", label: "Self Assessment" },
  { value: "CERTIFICATION", label: "Certification" },
]

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newAudit, setNewAudit] = useState({
    frameworkId: "",
    type: "INTERNAL",
    scheduledDate: "",
    auditor: "",
  })

  const fetchAudits = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
      })
      const response = await fetch(`/api/admin/compliance/audits?${params}`, {
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
      setAudits(data.audits || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch audits:", error)
      setAudits([])
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter, typeFilter])

  const fetchFrameworks = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/compliance/frameworks?limit=100&isActive=true", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setFrameworks(data.frameworks || [])
      }
    } catch (error) {
      console.error("Failed to fetch frameworks:", error)
    }
  }, [])

  useEffect(() => {
    fetchAudits()
  }, [fetchAudits])

  useEffect(() => {
    fetchFrameworks()
  }, [fetchFrameworks])

  const handleCreateAudit = async () => {
    if (!newAudit.frameworkId || !newAudit.scheduledDate) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/compliance/audits", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAudit),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to schedule audit")
      }

      setCreateDialogOpen(false)
      setNewAudit({
        frameworkId: "",
        type: "INTERNAL",
        scheduledDate: "",
        auditor: "",
      })
      fetchAudits()
    } catch (error) {
      console.error("Failed to schedule audit:", error)
      alert(error instanceof Error ? error.message : "Failed to schedule audit")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500"><PlayCircle className="h-3 w-3 mr-1" />In Progress</Badge>
      case "SCHEDULED":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>
      case "CANCELLED":
        return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "INTERNAL":
        return <Badge variant="outline">Internal</Badge>
      case "EXTERNAL":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">External</Badge>
      case "SELF_ASSESSMENT":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Self Assessment</Badge>
      case "CERTIFICATION":
        return <Badge variant="outline" className="border-green-500 text-green-500">Certification</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // Define columns for AdminDataTable
  const columns: Column<Audit>[] = [
    {
      id: "framework",
      header: "Framework",
      cell: (audit) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{audit.framework.name}</p>
            <Badge variant="outline" className="text-xs">
              {audit.framework.code}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      id: "organization",
      header: "Organization",
      cell: (audit) =>
        audit.organization ? (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{audit.organization.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Platform-wide</span>
        ),
    },
    {
      id: "type",
      header: "Type",
      cell: (audit) => getTypeBadge(audit.type),
    },
    {
      id: "status",
      header: "Status",
      cell: (audit) => getStatusBadge(audit.status),
    },
    {
      id: "scheduledDate",
      header: "Scheduled",
      cell: (audit) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(audit.scheduledDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "auditor",
      header: "Auditor",
      cell: (audit) => (
        <span className="text-muted-foreground">{audit.auditor || "-"}</span>
      ),
    },
    {
      id: "score",
      header: "Score",
      headerClassName: "text-center",
      className: "text-center",
      cell: (audit) =>
        audit.score !== null ? (
          <span
            className={
              audit.score >= 80
                ? "text-green-500 font-bold"
                : audit.score >= 60
                ? "text-yellow-500 font-bold"
                : "text-red-500 font-bold"
            }
          >
            {audit.score}%
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<Audit>[] = [
    {
      label: "View Framework",
      icon: <Shield className="h-4 w-4" />,
      href: (audit) => `/admin/compliance/frameworks/${audit.frameworkId}`,
    },
    {
      label: "View Organization",
      icon: <Building2 className="h-4 w-4" />,
      href: (audit) => `/admin/tenants/${audit.orgId}`,
      hidden: (audit) => !audit.organization,
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
                  <FileSearch className="h-5 w-5 text-primary" />
                  Compliance Audits
                </CardTitle>
                <CardDescription>
                  Schedule and track compliance audits - {total} total
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchAudits} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Audit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[180px]">
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
            data={audits}
            columns={columns}
            getRowId={(audit) => audit.id}
            isLoading={isLoading}
            emptyMessage="No audits found"
            viewHref={(audit) => `/admin/compliance/audits/${audit.id}`}
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

      {/* Schedule Audit Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Compliance Audit</DialogTitle>
            <DialogDescription>
              Schedule a new compliance audit for a framework.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Framework *</Label>
              <Select
                value={newAudit.frameworkId}
                onValueChange={(value) => setNewAudit({ ...newAudit, frameworkId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a framework" />
                </SelectTrigger>
                <SelectContent>
                  {frameworks.map((framework) => (
                    <SelectItem key={framework.id} value={framework.id}>
                      {framework.name} ({framework.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newAudit.type}
                  onValueChange={(value) => setNewAudit({ ...newAudit, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERNAL">Internal</SelectItem>
                    <SelectItem value="EXTERNAL">External</SelectItem>
                    <SelectItem value="SELF_ASSESSMENT">Self Assessment</SelectItem>
                    <SelectItem value="CERTIFICATION">Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scheduled Date *</Label>
                <Input
                  type="date"
                  value={newAudit.scheduledDate}
                  onChange={(e) => setNewAudit({ ...newAudit, scheduledDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Auditor</Label>
              <Input
                placeholder="Auditor name or company"
                value={newAudit.auditor}
                onChange={(e) => setNewAudit({ ...newAudit, auditor: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAudit}
              disabled={!newAudit.frameworkId || !newAudit.scheduledDate || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Audit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
