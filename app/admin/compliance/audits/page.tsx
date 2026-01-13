"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  MoreHorizontal,
  Eye,
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

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Framework</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : audits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No audits found
                    </TableCell>
                  </TableRow>
                ) : (
                  audits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{audit.framework.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {audit.framework.code}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {audit.organization ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{audit.organization.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Platform-wide</span>
                        )}
                      </TableCell>
                      <TableCell>{getTypeBadge(audit.type)}</TableCell>
                      <TableCell>{getStatusBadge(audit.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(audit.scheduledDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {audit.auditor || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {audit.score !== null ? (
                          <span className={
                            audit.score >= 80 ? "text-green-500 font-bold" :
                            audit.score >= 60 ? "text-yellow-500 font-bold" :
                            "text-red-500 font-bold"
                          }>
                            {audit.score}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/compliance/audits/${audit.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/compliance/frameworks/${audit.frameworkId}`}>
                                <Shield className="h-4 w-4 mr-2" />
                                View Framework
                              </Link>
                            </DropdownMenuItem>
                            {audit.organization && (
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/tenants/${audit.orgId}`}>
                                  <Building2 className="h-4 w-4 mr-2" />
                                  View Organization
                                </Link>
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
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
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
