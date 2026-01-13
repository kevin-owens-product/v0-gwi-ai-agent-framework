"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DropdownMenuSeparator,
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
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  MoreHorizontal,
  Eye,
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

const SCOPE_OPTIONS = [
  { value: "all", label: "All Scopes" },
  { value: "PLATFORM", label: "Platform-wide" },
  { value: "ORGANIZATION", label: "Organization" },
  { value: "PLAN", label: "By Plan" },
]

const DATA_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "AGENT_RUNS", label: "Agent Runs" },
  { value: "AUDIT_LOGS", label: "Audit Logs" },
  { value: "USER_SESSIONS", label: "User Sessions" },
  { value: "TEMP_FILES", label: "Temp Files" },
  { value: "NOTIFICATIONS", label: "Notifications" },
  { value: "ANALYTICS", label: "Analytics" },
]

export default function RetentionPoliciesPage() {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [scopeFilter, setScopeFilter] = useState("all")
  const [dataTypeFilter, setDataTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

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
          window.location.href = "/admin/login"
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
        throw new Error(data.error || "Failed to create retention policy")
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
      alert(error instanceof Error ? error.message : "Failed to create retention policy")
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
        throw new Error(data.error || "Failed to update policy")
      }

      fetchPolicies()
    } catch (error) {
      console.error("Failed to update policy:", error)
      alert(error instanceof Error ? error.message : "Failed to update policy")
    }
  }

  const handleDeletePolicy = async (policy: RetentionPolicy) => {
    if (!confirm(`Are you sure you want to delete the policy "${policy.name}"?`)) return

    try {
      const response = await fetch(`/api/admin/compliance/retention-policies/${policy.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete policy")
      }

      fetchPolicies()
    } catch (error) {
      console.error("Failed to delete policy:", error)
      alert(error instanceof Error ? error.message : "Failed to delete policy")
    }
  }

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case "PLATFORM":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Platform</Badge>
      case "ORGANIZATION":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Org</Badge>
      case "PLAN":
        return <Badge variant="outline" className="border-green-500 text-green-500">Plan</Badge>
      default:
        return <Badge variant="outline">{scope}</Badge>
    }
  }

  const getDeleteActionBadge = (action: string) => {
    switch (action) {
      case "SOFT_DELETE":
        return <Badge variant="secondary">Soft Delete</Badge>
      case "HARD_DELETE":
        return <Badge variant="destructive">Hard Delete</Badge>
      case "ARCHIVE":
        return <Badge variant="outline">Archive</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
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
                  <Calendar className="h-5 w-5 text-primary" />
                  Data Retention Policies
                </CardTitle>
                <CardDescription>
                  Configure data retention rules and automatic cleanup - {total} total
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchPolicies} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
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
                placeholder="Search by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={dataTypeFilter} onValueChange={setDataTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Data Type" />
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
                <SelectValue placeholder="Scope" />
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
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Retention</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Run</TableHead>
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
                ) : policies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No retention policies found
                    </TableCell>
                  </TableRow>
                ) : (
                  policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{policy.dataType.replace(/_/g, " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{policy.retentionPeriod}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getScopeBadge(policy.scope)}</TableCell>
                      <TableCell>{getDeleteActionBadge(policy.deleteAction)}</TableCell>
                      <TableCell>
                        {policy.isActive ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {policy.nextRun ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {policy.daysUntilNextRun !== null && policy.daysUntilNextRun <= 0
                              ? "Today"
                              : `${policy.daysUntilNextRun} days`}
                          </div>
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
                            <DropdownMenuItem onClick={() => handleToggleStatus(policy)}>
                              {policy.isActive ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeletePolicy(policy)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
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

      {/* Create Policy Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Retention Policy</DialogTitle>
            <DialogDescription>
              Create a new data retention policy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Policy Name *</Label>
              <Input
                id="name"
                placeholder="Agent Runs 90 Day Retention"
                value={newPolicy.name}
                onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Type *</Label>
                <Select
                  value={newPolicy.dataType}
                  onValueChange={(value) => setNewPolicy({ ...newPolicy, dataType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGENT_RUNS">Agent Runs</SelectItem>
                    <SelectItem value="AUDIT_LOGS">Audit Logs</SelectItem>
                    <SelectItem value="USER_SESSIONS">User Sessions</SelectItem>
                    <SelectItem value="TEMP_FILES">Temp Files</SelectItem>
                    <SelectItem value="NOTIFICATIONS">Notifications</SelectItem>
                    <SelectItem value="ANALYTICS">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retentionDays">Retention Days *</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  min="-1"
                  placeholder="90"
                  value={newPolicy.retentionDays}
                  onChange={(e) => setNewPolicy({ ...newPolicy, retentionDays: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">Use -1 for forever</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Scope</Label>
                <Select
                  value={newPolicy.scope}
                  onValueChange={(value) => setNewPolicy({ ...newPolicy, scope: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLATFORM">Platform-wide</SelectItem>
                    <SelectItem value="ORGANIZATION">Organization</SelectItem>
                    <SelectItem value="PLAN">By Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Delete Action</Label>
                <Select
                  value={newPolicy.deleteAction}
                  onValueChange={(value) => setNewPolicy({ ...newPolicy, deleteAction: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOFT_DELETE">Soft Delete</SelectItem>
                    <SelectItem value="HARD_DELETE">Hard Delete</SelectItem>
                    <SelectItem value="ARCHIVE">Archive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose of this retention policy..."
                value={newPolicy.description}
                onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePolicy}
              disabled={!newPolicy.name || !newPolicy.dataType || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Policy"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
