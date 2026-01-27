"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  Building2,
  Users,
  Ban,
  CheckCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Plus,
  Network,
  GitBranch,
  Trash2,
  CreditCard,
  FolderTree,
} from "lucide-react"
import Link from "next/link"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

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

export default function TenantsPage() {
  const t = useTranslations("admin.tenants")
  const tCommon = useTranslations("common")
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [suspendReason, setSuspendReason] = useState("")
  const [suspendType, setSuspendType] = useState("FULL")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          window.location.href = "/login?type=admin"
          return
        }
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data = await response.json()
      setTenants(data.tenants || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
      setSelectedIds(new Set())
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
          window.location.href = "/login?type=admin"
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
      toast.error(error instanceof Error ? error.message : "Failed to suspend tenant")
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
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to lift suspension")
      }
      fetchTenants()
    } catch (error) {
      console.error("Failed to lift suspension:", error)
      toast.error(error instanceof Error ? error.message : "Failed to lift suspension")
    }
  }

  const handleDeleteTenant = async (tenant: Tenant) => {
    try {
      const response = await fetch(`/api/admin/tenants/${tenant.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to delete tenant")
      }
      fetchTenants()
    } catch (error) {
      console.error("Failed to delete tenant:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete tenant")
    }
  }

  const handleBulkSuspend = async (ids: string[]) => {
    try {
      const response = await fetch("/api/admin/tenants/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suspend",
          tenantIds: ids,
          data: { suspensionType: "FULL", reason: "Bulk suspension" },
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Bulk operation failed")
      }
      fetchTenants()
    } catch (error) {
      console.error("Bulk operation failed:", error)
      toast.error(error instanceof Error ? error.message : "Bulk operation failed")
    }
  }

  const handleBulkUnsuspend = async (ids: string[]) => {
    try {
      const response = await fetch("/api/admin/tenants/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unsuspend",
          tenantIds: ids,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Bulk operation failed")
      }
      fetchTenants()
    } catch (error) {
      console.error("Bulk operation failed:", error)
      toast.error(error instanceof Error ? error.message : "Bulk operation failed")
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const response = await fetch("/api/admin/tenants/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          tenantIds: ids,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Bulk operation failed")
      }
      fetchTenants()
    } catch (error) {
      console.error("Bulk operation failed:", error)
      toast.error(error instanceof Error ? error.message : "Bulk operation failed")
    }
  }

  const handleBulkChangePlan = async (ids: string[], planTier: string) => {
    try {
      const response = await fetch("/api/admin/tenants/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updatePlan",
          tenantIds: ids,
          data: { planTier },
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Bulk plan change failed")
      }
      fetchTenants()
    } catch (error) {
      console.error("Bulk plan change failed:", error)
      toast.error(error instanceof Error ? error.message : "Bulk plan change failed")
    }
  }

  const handleBulkEnableHierarchy = async (ids: string[]) => {
    try {
      const response = await fetch("/api/admin/tenants/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enableHierarchy",
          tenantIds: ids,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Bulk enable hierarchy failed")
      }
      fetchTenants()
    } catch (error) {
      console.error("Bulk enable hierarchy failed:", error)
      toast.error(error instanceof Error ? error.message : "Bulk enable hierarchy failed")
    }
  }

  const handleBulkDisableHierarchy = async (ids: string[]) => {
    try {
      const response = await fetch("/api/admin/tenants/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "disableHierarchy",
          tenantIds: ids,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Bulk disable hierarchy failed")
      }
      fetchTenants()
    } catch (error) {
      console.error("Bulk disable hierarchy failed:", error)
      toast.error(error instanceof Error ? error.message : "Bulk disable hierarchy failed")
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
          parentOrgId: newTenant.parentOrgId && newTenant.parentOrgId !== "none" ? newTenant.parentOrgId : undefined,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
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
      toast.error(error instanceof Error ? error.message : "Failed to create tenant")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Define columns for the data table
  const columns: Column<Tenant>[] = [
    {
      id: "organization",
      header: t("organization"),
      cell: (tenant) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{tenant.name}</p>
              {(tenant.hierarchyLevel ?? 0) > 0 && (
                <Badge variant="outline" className="text-xs">
                  {t("level", { level: tenant.hierarchyLevel ?? 0 })}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{tenant.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: t("type"),
      cell: (tenant) => (
        <Badge variant="outline" className="text-xs">
          {t(`orgTypes.${tenant.orgType || "STANDARD"}` as any)}
        </Badge>
      ),
    },
    {
      id: "plan",
      header: t("plan"),
      cell: (tenant) => (
        <Badge variant={
          tenant.planTier === "ENTERPRISE" ? "default" :
          tenant.planTier === "PROFESSIONAL" ? "secondary" : "outline"
        }>
          {tenant.planTier}
        </Badge>
      ),
    },
    {
      id: "status",
      header: t("status"),
      cell: (tenant) => (
        tenant.isSuspended ? (
          <Badge variant="destructive">{t("suspended")}</Badge>
        ) : tenant.subscription?.status === "ACTIVE" ? (
          <Badge variant="default" className="bg-green-500">{t("active")}</Badge>
        ) : (
          <Badge variant="secondary">{tenant.subscription?.status || t("trial")}</Badge>
        )
      ),
    },
    {
      id: "members",
      header: t("members"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (tenant) => (
        <div className="flex items-center justify-center gap-1">
          <Users className="h-3 w-3 text-muted-foreground" />
          {tenant._count.members}
        </div>
      ),
    },
    {
      id: "children",
      header: t("children"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (tenant) => (
        tenant.allowChildOrgs ? (
          <div className="flex items-center justify-center gap-1">
            <GitBranch className="h-3 w-3 text-muted-foreground" />
            {tenant._count.childOrgs ?? 0}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      id: "created",
      header: t("created"),
      cell: (tenant) => (
        <span className="text-muted-foreground">
          {new Date(tenant.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<Tenant>[] = [
    {
      label: t("impersonate"),
      icon: <ExternalLink className="h-4 w-4" />,
      onClick: (tenant) => {
        console.log("Impersonate", tenant.id)
      },
    },
    {
      label: t("viewHierarchy"),
      icon: <GitBranch className="h-4 w-4" />,
      href: (tenant) => `/admin/hierarchy?root=${tenant.id}`,
      hidden: (tenant) => !tenant.allowChildOrgs,
    },
    {
      label: t("liftSuspension"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (tenant) => handleLiftSuspension(tenant.id),
      hidden: (tenant) => !tenant.isSuspended,
      separator: true,
    },
    {
      label: t("suspend"),
      icon: <Ban className="h-4 w-4" />,
      onClick: (tenant) => {
        setSelectedTenant(tenant)
        setSuspendDialogOpen(true)
      },
      variant: "destructive",
      hidden: (tenant) => tenant.isSuspended,
      separator: true,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("suspendAll"),
      icon: <Ban className="h-4 w-4" />,
      onClick: handleBulkSuspend,
      confirmTitle: t("suspendOrganization"),
      confirmDescription: t("confirmSuspend"),
    },
    {
      label: t("unsuspendAll"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: handleBulkUnsuspend,
      confirmTitle: t("unsuspendAll"),
      confirmDescription: t("confirmUnsuspend"),
    },
    {
      label: t("upgradeToStarter"),
      icon: <CreditCard className="h-4 w-4" />,
      onClick: (ids) => handleBulkChangePlan(ids, "STARTER"),
      separator: true,
      confirmTitle: t("upgradeToStarter"),
      confirmDescription: t("confirmChangePlan", { plan: "Starter" }),
    },
    {
      label: t("upgradeToProfessional"),
      icon: <CreditCard className="h-4 w-4" />,
      onClick: (ids) => handleBulkChangePlan(ids, "PROFESSIONAL"),
      confirmTitle: t("upgradeToProfessional"),
      confirmDescription: t("confirmChangePlan", { plan: "Professional" }),
    },
    {
      label: t("upgradeToEnterprise"),
      icon: <CreditCard className="h-4 w-4" />,
      onClick: (ids) => handleBulkChangePlan(ids, "ENTERPRISE"),
      confirmTitle: t("upgradeToEnterprise"),
      confirmDescription: t("confirmChangePlan", { plan: "Enterprise" }),
    },
    {
      label: t("enableHierarchy"),
      icon: <FolderTree className="h-4 w-4" />,
      onClick: handleBulkEnableHierarchy,
      separator: true,
      confirmTitle: t("enableHierarchy"),
      confirmDescription: t("confirmEnableHierarchy"),
    },
    {
      label: t("disableHierarchy"),
      icon: <FolderTree className="h-4 w-4" />,
      onClick: handleBulkDisableHierarchy,
      confirmTitle: t("disableHierarchy"),
      confirmDescription: t("confirmDisableHierarchy"),
    },
    {
      label: t("deleteAll"),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      separator: true,
      confirmTitle: t("deleteOrganization"),
      confirmDescription: t("confirmDeleteAll"),
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>
                {t("description", { total })}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchTenants} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("refresh")}
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/hierarchy">
                  <Network className="h-4 w-4 mr-2" />
                  {t("hierarchy")}
                </Link>
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("addTenant")}
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
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("plan")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allPlans")}</SelectItem>
                <SelectItem value="STARTER">Starter</SelectItem>
                <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="active">{t("active")}</SelectItem>
                <SelectItem value="suspended">{t("suspended")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <AdminDataTable
            data={tenants}
            columns={columns}
            getRowId={(tenant) => tenant.id}
            isLoading={isLoading}
            emptyMessage={t("noTenants")}
            viewHref={(tenant) => `/admin/tenants/${tenant.id}`}
            editHref={(tenant) => `/admin/tenants/${tenant.id}/edit`}
            onDelete={handleDeleteTenant}
            deleteConfirmTitle={t("deleteOrganization")}
            deleteConfirmDescription={(tenant) =>
              t("confirmDelete", { name: tenant.name })
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

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("suspendOrganization")}</DialogTitle>
            <DialogDescription>
              {t("suspendDescription", { name: selectedTenant?.name || "" })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("suspensionType")}</Label>
              <Select value={suspendType} onValueChange={setSuspendType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL">{t("fullSuspension")}</SelectItem>
                  <SelectItem value="PARTIAL">{t("partialSuspension")}</SelectItem>
                  <SelectItem value="BILLING_HOLD">{t("billingHold")}</SelectItem>
                  <SelectItem value="INVESTIGATION">{t("underInvestigation")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("reason")}</Label>
              <Textarea
                placeholder={t("reasonPlaceholder")}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={!suspendReason || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("suspending")}
                </>
              ) : (
                t("suspendOrganization")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Tenant Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("createNewOrganization")}</DialogTitle>
            <DialogDescription>
              {t("addNewTenant")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("organizationName")} *</Label>
                <Input
                  id="name"
                  placeholder={t("organizationNamePlaceholder")}
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">{t("slug")}</Label>
                <Input
                  id="slug"
                  placeholder={t("slugPlaceholder")}
                  value={newTenant.slug}
                  onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("planTier")}</Label>
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
                <Label>{t("organizationType")}</Label>
                <Select
                  value={newTenant.orgType}
                  onValueChange={(value) => setNewTenant({ ...newTenant, orgType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["STANDARD", "AGENCY", "HOLDING_COMPANY", "SUBSIDIARY", "BRAND", "SUB_BRAND", "DIVISION", "DEPARTMENT", "FRANCHISE", "FRANCHISEE", "RESELLER", "CLIENT", "REGIONAL", "PORTFOLIO_COMPANY"] as const).map((value) => (
                      <SelectItem key={value} value={value}>{t(`orgTypes.${value}` as any)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Parent Organization Selection */}
            <div className="space-y-2">
              <Label>{t("parentOrganization")}</Label>
              <Select
                value={newTenant.parentOrgId}
                onValueChange={(value) => setNewTenant({ ...newTenant, parentOrgId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("noneRootOrganization")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("noneRootOrganization")}</SelectItem>
                  {parentOrgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("parentOrgHint")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">{t("industry")}</Label>
                <Input
                  id="industry"
                  placeholder={t("industryPlaceholder")}
                  value={newTenant.industry}
                  onChange={(e) => setNewTenant({ ...newTenant, industry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("companySize")}</Label>
                <Select
                  value={newTenant.companySize}
                  onValueChange={(value) => setNewTenant({ ...newTenant, companySize: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectSize")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOLO">{t("soloSize")}</SelectItem>
                    <SelectItem value="SMALL">{t("smallSize")}</SelectItem>
                    <SelectItem value="MEDIUM">{t("mediumSize")}</SelectItem>
                    <SelectItem value="LARGE">{t("largeSize")}</SelectItem>
                    <SelectItem value="ENTERPRISE">{t("enterpriseSize")}</SelectItem>
                    <SelectItem value="GLOBAL">{t("globalSize")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">{t("country")}</Label>
                <Input
                  id="country"
                  placeholder={t("countryPlaceholder")}
                  value={newTenant.country}
                  onChange={(e) => setNewTenant({ ...newTenant, country: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">{t("timezone")}</Label>
                <Input
                  id="timezone"
                  placeholder={t("timezonePlaceholder")}
                  value={newTenant.timezone}
                  onChange={(e) => setNewTenant({ ...newTenant, timezone: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-3">{t("ownerInformation")}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">{t("ownerEmail")}</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    placeholder={t("ownerEmailPlaceholder")}
                    value={newTenant.ownerEmail}
                    onChange={(e) => setNewTenant({ ...newTenant, ownerEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">{t("ownerName")}</Label>
                  <Input
                    id="ownerName"
                    placeholder={t("ownerNamePlaceholder")}
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
                {t("allowChildOrgs")}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleCreateTenant}
              disabled={!newTenant.name || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("creating")}
                </>
              ) : (
                t("createOrganization")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
