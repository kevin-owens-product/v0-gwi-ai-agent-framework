"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  Building2,
  Users,
  Bot,
  Workflow,
  Eye,
  Ban,
  CheckCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Plus,
  Network,
  ChevronDown,
  GitBranch,
  Trash2,
  Settings,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

interface Tenant {
  id: string
  name: string
  slug: string
  planTier: string
  orgType?: string
  parentOrgId?: string | null
  hierarchyLevel?: number
  allowChildOrgs?: boolean
  createdAt: string
  isSuspended: boolean
  subscription: {
    status: string
  } | null
  _count: {
    members: number
    agents: number
    workflows: number
    childOrgs?: number
  }
  suspension?: {
    reason: string
    suspensionType: string
    expiresAt: string | null
  }
}

const ORG_TYPE_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  AGENCY: "Agency",
  HOLDING_COMPANY: "Holding Company",
  SUBSIDIARY: "Subsidiary",
  BRAND: "Brand",
  SUB_BRAND: "Sub-Brand",
  DIVISION: "Division",
  DEPARTMENT: "Department",
  FRANCHISE: "Franchise",
  FRANCHISEE: "Franchisee",
  RESELLER: "Reseller",
  CLIENT: "Client",
  REGIONAL: "Regional",
  PORTFOLIO_COMPANY: "Portfolio Company",
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [suspendReason, setSuspendReason] = useState("")
  const [suspendType, setSuspendType] = useState("FULL")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Bulk action state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkAction, setBulkAction] = useState("")
  const [bulkData, setBulkData] = useState<Record<string, string>>({})

  // Create tenant state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [parentOrgs, setParentOrgs] = useState<Array<{ id: string; name: string }>>([])
  const [newTenant, setNewTenant] = useState({
    name: "",
    slug: "",
    planTier: "STARTER",
    orgType: "STANDARD",
    parentOrgId: "",
    industry: "",
    companySize: "",
    country: "",
    timezone: "UTC",
    ownerEmail: "",
    ownerName: "",
    allowChildOrgs: false,
  })

  const fetchTenants = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(planFilter !== "all" && { planTier: planFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      })
      const response = await fetch(`/api/admin/tenants?${params}`, {
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
      setTenants(data.tenants || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
      setSelectedIds(new Set())
      setSelectAll(false)
    } catch (error) {
      console.error("Failed to fetch tenants:", error)
      setTenants([])
      setTotalPages(1)
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, planFilter, statusFilter])

  const fetchParentOrgs = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/tenants?limit=200", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setParentOrgs(
          (data.tenants || [])
            .filter((t: Tenant) => t.allowChildOrgs)
            .map((t: Tenant) => ({ id: t.id, name: t.name }))
        )
      }
    } catch (error) {
      console.error("Failed to fetch parent orgs:", error)
    }
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTenants()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchTenants])

  useEffect(() => {
    fetchParentOrgs()
  }, [fetchParentOrgs])

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedIds(new Set(tenants.map(t => t.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
    setSelectAll(newSelected.size === tenants.length)
  }

  const handleSuspend = async () => {
    if (!selectedTenant || !suspendReason) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/tenants/${selectedTenant.id}/suspend`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: suspendReason,
          suspensionType: suspendType,
        }),
      })
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/admin/login"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to suspend tenant")
      }
      setSuspendDialogOpen(false)
      setSuspendReason("")
      fetchTenants()
    } catch (error) {
      console.error("Failed to suspend tenant:", error)
      alert(error instanceof Error ? error.message : "Failed to suspend tenant")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLiftSuspension = async (tenantId: string) => {
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/suspend`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/admin/login"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to lift suspension")
      }
      fetchTenants()
    } catch (error) {
      console.error("Failed to lift suspension:", error)
      alert(error instanceof Error ? error.message : "Failed to lift suspension")
    }
  }

  const handleBulkAction = async () => {
    if (selectedIds.size === 0) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/tenants/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: bulkAction,
          tenantIds: Array.from(selectedIds),
          data: bulkData,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/admin/login"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Bulk operation failed")
      }

      const result = await response.json()
      alert(`Bulk operation completed: ${result.success} succeeded, ${result.failed} failed`)
      setBulkDialogOpen(false)
      setBulkAction("")
      setBulkData({})
      fetchTenants()
    } catch (error) {
      console.error("Bulk operation failed:", error)
      alert(error instanceof Error ? error.message : "Bulk operation failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateTenant = async () => {
    if (!newTenant.name) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/tenants", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTenant,
          companySize: newTenant.companySize || undefined,
          parentOrgId: newTenant.parentOrgId || undefined,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/admin/login"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to create tenant")
      }

      setCreateDialogOpen(false)
      setNewTenant({
        name: "",
        slug: "",
        planTier: "STARTER",
        orgType: "STANDARD",
        parentOrgId: "",
        industry: "",
        companySize: "",
        country: "",
        timezone: "UTC",
        ownerEmail: "",
        ownerName: "",
        allowChildOrgs: false,
      })
      fetchTenants()
      fetchParentOrgs()
    } catch (error) {
      console.error("Failed to create tenant:", error)
      alert(error instanceof Error ? error.message : "Failed to create tenant")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openBulkDialog = (action: string) => {
    setBulkAction(action)
    setBulkData({})
    setBulkDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tenant Management</CardTitle>
              <CardDescription>
                Manage all organizations on the platform ({total} total)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchTenants} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/hierarchy">
                  <Network className="h-4 w-4 mr-2" />
                  Hierarchy
                </Link>
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Tenant
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
                placeholder="Search by name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="STARTER">Starter</SelectItem>
                <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-4 p-3 mb-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedIds.size} selected
              </span>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => openBulkDialog("suspend")}>
                      <Ban className="h-4 w-4 mr-2" />
                      Suspend All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openBulkDialog("unsuspend")}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Unsuspend All
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openBulkDialog("updatePlan")}>
                      <Settings className="h-4 w-4 mr-2" />
                      Change Plan
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openBulkDialog("enableHierarchy")}>
                      <GitBranch className="h-4 w-4 mr-2" />
                      Enable Hierarchy
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => openBulkDialog("delete")}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedIds(new Set())
                    setSelectAll(false)
                  }}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="text-center">Children</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No tenants found
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((tenant) => (
                    <TableRow key={tenant.id} className={selectedIds.has(tenant.id) ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(tenant.id)}
                          onCheckedChange={(checked) => handleSelectOne(tenant.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{tenant.name}</p>
                              {(tenant.hierarchyLevel ?? 0) > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Level {tenant.hierarchyLevel}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{tenant.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {ORG_TYPE_LABELS[tenant.orgType || "STANDARD"] || tenant.orgType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          tenant.planTier === "ENTERPRISE" ? "default" :
                          tenant.planTier === "PROFESSIONAL" ? "secondary" : "outline"
                        }>
                          {tenant.planTier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tenant.isSuspended ? (
                          <Badge variant="destructive">Suspended</Badge>
                        ) : tenant.subscription?.status === "ACTIVE" ? (
                          <Badge variant="default" className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">{tenant.subscription?.status || "Trial"}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {tenant._count.members}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {tenant.allowChildOrgs ? (
                          <div className="flex items-center justify-center gap-1">
                            <GitBranch className="h-3 w-3 text-muted-foreground" />
                            {tenant._count.childOrgs ?? 0}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(tenant.createdAt).toLocaleDateString()}
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
                              <Link href={`/admin/tenants/${tenant.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Impersonate
                            </DropdownMenuItem>
                            {tenant.allowChildOrgs && (
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/hierarchy?root=${tenant.id}`}>
                                  <GitBranch className="h-4 w-4 mr-2" />
                                  View Hierarchy
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {tenant.isSuspended ? (
                              <DropdownMenuItem onClick={() => handleLiftSuspension(tenant.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Lift Suspension
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedTenant(tenant)
                                  setSuspendDialogOpen(true)
                                }}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend
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
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Organization</DialogTitle>
            <DialogDescription>
              Suspend {selectedTenant?.name}. Users will be unable to access the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Suspension Type</Label>
              <Select value={suspendType} onValueChange={setSuspendType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL">Full Suspension</SelectItem>
                  <SelectItem value="PARTIAL">Partial (Limited Access)</SelectItem>
                  <SelectItem value="BILLING_HOLD">Billing Hold</SelectItem>
                  <SelectItem value="INVESTIGATION">Under Investigation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Enter the reason for suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={!suspendReason || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suspending...
                </>
              ) : (
                "Suspend Organization"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkAction === "delete" && <AlertTriangle className="h-5 w-5 inline mr-2 text-destructive" />}
              Bulk {bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1)}
            </DialogTitle>
            <DialogDescription>
              This action will affect {selectedIds.size} organization(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {bulkAction === "suspend" && (
              <>
                <div className="space-y-2">
                  <Label>Suspension Type</Label>
                  <Select
                    value={bulkData.suspensionType || "FULL"}
                    onValueChange={(v) => setBulkData({ ...bulkData, suspensionType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL">Full Suspension</SelectItem>
                      <SelectItem value="PARTIAL">Partial</SelectItem>
                      <SelectItem value="BILLING_HOLD">Billing Hold</SelectItem>
                      <SelectItem value="INVESTIGATION">Investigation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="Enter reason..."
                    value={bulkData.reason || ""}
                    onChange={(e) => setBulkData({ ...bulkData, reason: e.target.value })}
                    rows={2}
                  />
                </div>
              </>
            )}
            {bulkAction === "updatePlan" && (
              <div className="space-y-2">
                <Label>New Plan Tier</Label>
                <Select
                  value={bulkData.planTier || ""}
                  onValueChange={(v) => setBulkData({ ...bulkData, planTier: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STARTER">Starter</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {bulkAction === "delete" && (
              <div className="p-4 bg-destructive/10 rounded-lg text-destructive text-sm">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                This action cannot be undone. Organizations with child organizations cannot be deleted.
              </div>
            )}
            {(bulkAction === "unsuspend" || bulkAction === "enableHierarchy") && (
              <p className="text-sm text-muted-foreground">
                Click confirm to proceed with this action on all selected organizations.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={bulkAction === "delete" ? "destructive" : "default"}
              onClick={handleBulkAction}
              disabled={isSubmitting || (bulkAction === "updatePlan" && !bulkData.planTier)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Tenant Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Add a new tenant organization to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  placeholder="Acme Corporation"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (auto-generated if empty)</Label>
                <Input
                  id="slug"
                  placeholder="acme-corporation"
                  value={newTenant.slug}
                  onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Tier</Label>
                <Select
                  value={newTenant.planTier}
                  onValueChange={(value) => setNewTenant({ ...newTenant, planTier: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STARTER">Starter</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Organization Type</Label>
                <Select
                  value={newTenant.orgType}
                  onValueChange={(value) => setNewTenant({ ...newTenant, orgType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORG_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Parent Organization Selection */}
            <div className="space-y-2">
              <Label>Parent Organization (for hierarchy)</Label>
              <Select
                value={newTenant.parentOrgId}
                onValueChange={(value) => setNewTenant({ ...newTenant, parentOrgId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (root organization)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (root organization)</SelectItem>
                  {parentOrgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a parent to create this organization as a child in the hierarchy
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="Technology"
                  value={newTenant.industry}
                  onChange={(e) => setNewTenant({ ...newTenant, industry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Company Size</Label>
                <Select
                  value={newTenant.companySize}
                  onValueChange={(value) => setNewTenant({ ...newTenant, companySize: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOLO">Solo (1)</SelectItem>
                    <SelectItem value="SMALL">Small (2-10)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (11-50)</SelectItem>
                    <SelectItem value="LARGE">Large (51-200)</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise (201-1000)</SelectItem>
                    <SelectItem value="GLOBAL">Global (1000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="United States"
                  value={newTenant.country}
                  onChange={(e) => setNewTenant({ ...newTenant, country: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  placeholder="UTC"
                  value={newTenant.timezone}
                  onChange={(e) => setNewTenant({ ...newTenant, timezone: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-3">Owner Information (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Owner Email</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    placeholder="owner@example.com"
                    value={newTenant.ownerEmail}
                    onChange={(e) => setNewTenant({ ...newTenant, ownerEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    placeholder="John Doe"
                    value={newTenant.ownerName}
                    onChange={(e) => setNewTenant({ ...newTenant, ownerName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="allowChildOrgs"
                checked={newTenant.allowChildOrgs}
                onCheckedChange={(checked) => setNewTenant({ ...newTenant, allowChildOrgs: checked as boolean })}
              />
              <Label htmlFor="allowChildOrgs" className="text-sm">
                Allow child organizations (enables hierarchy features)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTenant}
              disabled={!newTenant.name || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
