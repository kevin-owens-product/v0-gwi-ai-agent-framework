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
} from "lucide-react"
import Link from "next/link"

interface Tenant {
  id: string
  name: string
  slug: string
  planTier: string
  createdAt: string
  isSuspended: boolean
  subscription: {
    status: string
  } | null
  _count: {
    members: number
    agents: number
    workflows: number
  }
  suspension?: {
    reason: string
    suspensionType: string
    expiresAt: string | null
  }
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

  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [suspendReason, setSuspendReason] = useState("")
  const [suspendType, setSuspendType] = useState("FULL")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const response = await fetch(`/api/admin/tenants?${params}`)
      const data = await response.json()
      setTenants(data.tenants)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error("Failed to fetch tenants:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, planFilter, statusFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTenants()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchTenants])

  const handleSuspend = async () => {
    if (!selectedTenant || !suspendReason) return
    setIsSubmitting(true)
    try {
      await fetch(`/api/admin/tenants/${selectedTenant.id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: suspendReason,
          suspensionType: suspendType,
        }),
      })
      setSuspendDialogOpen(false)
      setSuspendReason("")
      fetchTenants()
    } catch (error) {
      console.error("Failed to suspend tenant:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLiftSuspension = async (tenantId: string) => {
    try {
      await fetch(`/api/admin/tenants/${tenantId}/suspend`, {
        method: "DELETE",
      })
      fetchTenants()
    } catch (error) {
      console.error("Failed to lift suspension:", error)
    }
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
            <Button onClick={fetchTenants} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
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

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="text-center">Agents</TableHead>
                  <TableHead className="text-center">Workflows</TableHead>
                  <TableHead>Created</TableHead>
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
                ) : tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No tenants found
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{tenant.name}</p>
                            <p className="text-xs text-muted-foreground">{tenant.slug}</p>
                          </div>
                        </div>
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
                        <div className="flex items-center justify-center gap-1">
                          <Bot className="h-3 w-3 text-muted-foreground" />
                          {tenant._count.agents}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Workflow className="h-3 w-3 text-muted-foreground" />
                          {tenant._count.workflows}
                        </div>
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
                Page {page} of {totalPages}
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
    </div>
  )
}
