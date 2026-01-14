"use client"

import { useState, useEffect, useCallback } from "react"
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
import { AdminDataTable, Column, BulkAction } from "@/components/admin/data-table"
import {
  Search,
  CreditCard,
  Plus,
  RefreshCw,
  Check,
  X,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Plan {
  id: string
  name: string
  displayName: string
  description: string | null
  tier: string
  isActive: boolean
  isPublic: boolean
  sortOrder: number
  monthlyPrice: number
  yearlyPrice: number
  limits: Record<string, number>
  createdAt: string
  _count: {
    features: number
    tenantEntitlements: number
  }
}

export default function PlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tierFilter, setTierFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchPlans = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(tierFilter !== "all" && { tier: tierFilter }),
        ...(statusFilter !== "all" && { isActive: statusFilter }),
      })
      const response = await fetch(`/api/admin/plans?${params}`)
      const data = await response.json()
      setPlans(data.plans)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error("Failed to fetch plans:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, tierFilter, statusFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPlans()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchPlans])

  const handleDelete = async (plan: Plan) => {
    try {
      const response = await fetch(`/api/admin/plans/${plan.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchPlans()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete plan")
      }
    } catch (error) {
      console.error("Failed to delete plan:", error)
      throw error
    }
  }

  const handleBulkStatusUpdate = async (planIds: string[], isActive: boolean) => {
    try {
      await Promise.all(
        planIds.map((id) =>
          fetch(`/api/admin/plans/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive }),
          })
        )
      )
      fetchPlans()
    } catch (error) {
      console.error("Failed to update plans:", error)
      throw error
    }
  }

  const formatPrice = (cents: number) => {
    if (cents === 0) return "Free"
    return `$${(cents / 100).toFixed(0)}`
  }

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case "ENTERPRISE":
        return "default"
      case "PROFESSIONAL":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Column definitions
  const columns: Column<Plan>[] = [
    {
      id: "plan",
      header: "Plan",
      cell: (plan) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{plan.displayName}</p>
            <p className="text-xs text-muted-foreground">{plan.name}</p>
          </div>
        </div>
      ),
    },
    {
      id: "tier",
      header: "Tier",
      cell: (plan) => (
        <Badge variant={getTierBadgeVariant(plan.tier)}>
          {plan.tier}
        </Badge>
      ),
    },
    {
      id: "monthly",
      header: "Monthly",
      headerClassName: "text-right",
      className: "text-right",
      cell: (plan) => (
        <div className="font-medium">
          {formatPrice(plan.monthlyPrice)}
          {plan.monthlyPrice > 0 && <span className="text-xs text-muted-foreground">/mo</span>}
        </div>
      ),
    },
    {
      id: "yearly",
      header: "Yearly",
      headerClassName: "text-right",
      className: "text-right",
      cell: (plan) => (
        <div className="font-medium">
          {formatPrice(plan.yearlyPrice)}
          {plan.yearlyPrice > 0 && <span className="text-xs text-muted-foreground">/yr</span>}
        </div>
      ),
    },
    {
      id: "features",
      header: "Features",
      headerClassName: "text-center",
      className: "text-center",
      cell: (plan) => <Badge variant="outline">{plan._count.features}</Badge>,
    },
    {
      id: "tenants",
      header: "Tenants",
      headerClassName: "text-center",
      className: "text-center",
      cell: (plan) => <Badge variant="outline">{plan._count.tenantEntitlements}</Badge>,
    },
    {
      id: "status",
      header: "Status",
      cell: (plan) => (
        <div className="flex items-center gap-2">
          {plan.isActive ? (
            <Badge variant="default" className="bg-green-500">
              <Check className="h-3 w-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary">
              <X className="h-3 w-3 mr-1" />
              Inactive
            </Badge>
          )}
          {plan.isPublic && (
            <Badge variant="outline" className="text-xs">Public</Badge>
          )}
        </div>
      ),
    },
  ]

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: "Activate Plans",
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusUpdate(ids, true),
      confirmTitle: "Activate Plans",
      confirmDescription: "Are you sure you want to activate the selected plans?",
    },
    {
      label: "Deactivate Plans",
      icon: <XCircle className="h-4 w-4" />,
      onClick: (ids) => handleBulkStatusUpdate(ids, false),
      confirmTitle: "Deactivate Plans",
      confirmDescription: "Are you sure you want to deactivate the selected plans?",
      separator: true,
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plan Management
              </CardTitle>
              <CardDescription>
                Manage subscription plans and their features ({total} total)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchPlans} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => router.push("/admin/plans/new")} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Plan
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
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
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
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <AdminDataTable
            data={plans}
            columns={columns}
            getRowId={(plan) => plan.id}
            isLoading={isLoading}
            emptyMessage="No plans found"
            viewHref={(plan) => `/admin/plans/${plan.id}`}
            editHref={(plan) => `/admin/plans/${plan.id}?edit=true`}
            onDelete={handleDelete}
            deleteConfirmTitle="Delete Plan"
            deleteConfirmDescription={(plan) =>
              `Are you sure you want to delete "${plan.displayName}"? This action cannot be undone.${
                plan._count.tenantEntitlements > 0
                  ? " Warning: This plan has active tenant entitlements."
                  : ""
              }`
            }
            bulkActions={bulkActions}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
