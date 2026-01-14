"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"
import {
  Search,
  Sparkles,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  RefreshCw,
  Check,
  X,
} from "lucide-react"

const CATEGORIES = [
  { value: "CORE", label: "Core" },
  { value: "ANALYTICS", label: "Analytics" },
  { value: "AGENTS", label: "Agents" },
  { value: "INTEGRATIONS", label: "Integrations" },
  { value: "SECURITY", label: "Security" },
  { value: "SUPPORT", label: "Support" },
  { value: "CUSTOMIZATION", label: "Customization" },
  { value: "API", label: "API" },
  { value: "ADVANCED", label: "Advanced" },
]

const VALUE_TYPES = [
  { value: "BOOLEAN", label: "Boolean (on/off)" },
  { value: "NUMBER", label: "Number" },
  { value: "STRING", label: "String" },
  { value: "JSON", label: "JSON" },
]

interface Feature {
  id: string
  key: string
  name: string
  description: string | null
  category: string
  valueType: string
  defaultValue: unknown
  isActive: boolean
  sortOrder: number
  createdAt: string
  _count: {
    plans: number
    tenantEntitlements: number
  }
}

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    key: "",
    name: "",
    description: "",
    category: "CORE",
    valueType: "BOOLEAN",
    defaultValue: false as unknown,
    isActive: true,
    sortOrder: 0,
  })

  const resetForm = () => {
    setFormData({
      key: "",
      name: "",
      description: "",
      category: "CORE",
      valueType: "BOOLEAN",
      defaultValue: false,
      isActive: true,
      sortOrder: 0,
    })
  }

  const fetchFeatures = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
        ...(statusFilter !== "all" && { isActive: statusFilter }),
      })
      const response = await fetch(`/api/admin/entitlement-features?${params}`)
      const data = await response.json()
      setFeatures(data.features)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error("Failed to fetch features:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, categoryFilter, statusFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchFeatures()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchFeatures])

  const handleCreate = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/entitlement-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setCreateDialogOpen(false)
        resetForm()
        fetchFeatures()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create feature")
      }
    } catch (error) {
      console.error("Failed to create feature:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedFeature) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/entitlement-features/${selectedFeature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setEditDialogOpen(false)
        setSelectedFeature(null)
        resetForm()
        fetchFeatures()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update feature")
      }
    } catch (error) {
      console.error("Failed to update feature:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (feature: Feature) => {
    setSelectedFeature(feature)
    setFormData({
      key: feature.key,
      name: feature.name,
      description: feature.description || "",
      category: feature.category,
      valueType: feature.valueType,
      defaultValue: feature.defaultValue,
      isActive: feature.isActive,
      sortOrder: feature.sortOrder,
    })
    setEditDialogOpen(true)
  }

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      CORE: "bg-blue-500",
      ANALYTICS: "bg-purple-500",
      AGENTS: "bg-green-500",
      INTEGRATIONS: "bg-yellow-500",
      SECURITY: "bg-red-500",
      SUPPORT: "bg-pink-500",
      CUSTOMIZATION: "bg-orange-500",
      API: "bg-cyan-500",
      ADVANCED: "bg-indigo-500",
    }
    return colors[category] || "bg-gray-500"
  }

  // Handle delete for AdminDataTable
  const handleDeleteFeature = async (feature: Feature) => {
    try {
      const response = await fetch(`/api/admin/entitlement-features/${feature.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchFeatures()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete feature")
      }
    } catch (error) {
      console.error("Failed to delete feature:", error)
      throw error
    }
  }

  // Handle bulk enable/disable
  const handleBulkToggleActive = async (ids: string[], isActive: boolean) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/entitlement-features/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive }),
          })
        )
      )
      fetchFeatures()
    } catch (error) {
      console.error("Failed to bulk update features:", error)
      throw error
    }
  }

  // Column definitions
  const columns: Column<Feature>[] = [
    {
      id: "feature",
      header: "Feature",
      cell: (feature) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{feature.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{feature.key}</p>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: (feature) => (
        <Badge className={getCategoryBadgeColor(feature.category)}>
          {feature.category}
        </Badge>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (feature) => <Badge variant="outline">{feature.valueType}</Badge>,
    },
    {
      id: "default",
      header: "Default",
      cell: (feature) => (
        <span className="font-mono text-sm">
          {typeof feature.defaultValue === "boolean"
            ? feature.defaultValue ? "true" : "false"
            : String(feature.defaultValue)}
        </span>
      ),
    },
    {
      id: "plans",
      header: "Plans",
      headerClassName: "text-center",
      className: "text-center",
      cell: (feature) => <Badge variant="outline">{feature._count.plans}</Badge>,
    },
    {
      id: "status",
      header: "Status",
      cell: (feature) =>
        feature.isActive ? (
          <Badge variant="default" className="bg-green-500">
            <Check className="h-3 w-3 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">
            <X className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        ),
    },
  ]

  // Row actions
  const rowActions: RowAction<Feature>[] = [
    {
      label: "Edit Feature",
      icon: <Pencil className="h-4 w-4" />,
      onClick: openEditDialog,
    },
  ]

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: "Enable Selected",
      icon: <Check className="h-4 w-4" />,
      onClick: (ids) => handleBulkToggleActive(ids, true),
      confirmTitle: "Enable Features",
      confirmDescription: "Are you sure you want to enable the selected features?",
    },
    {
      label: "Disable Selected",
      icon: <X className="h-4 w-4" />,
      onClick: (ids) => handleBulkToggleActive(ids, false),
      confirmTitle: "Disable Features",
      confirmDescription: "Are you sure you want to disable the selected features?",
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
                <Sparkles className="h-5 w-5" />
                Feature Management
              </CardTitle>
              <CardDescription>
                Manage entitlement features that can be assigned to plans ({total} total)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchFeatures} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => { resetForm(); setCreateDialogOpen(true) }} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Feature
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
                placeholder="Search by key, name, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
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

          {/* AdminDataTable */}
          <AdminDataTable
            data={features}
            columns={columns}
            getRowId={(feature) => feature.id}
            isLoading={isLoading}
            emptyMessage="No features found"
            rowActions={rowActions}
            onDelete={(feature) => {
              // Check if feature is used in plans before deleting
              if (feature._count.plans > 0) {
                alert(`Cannot delete this feature as it is used by ${feature._count.plans} plan(s)`)
                return Promise.reject(new Error("Feature is in use"))
              }
              return handleDeleteFeature(feature)
            }}
            deleteConfirmTitle="Delete Feature"
            deleteConfirmDescription={(feature) =>
              `Are you sure you want to delete "${feature.name}"? This action cannot be undone.`
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

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateDialogOpen(false)
          setEditDialogOpen(false)
          setSelectedFeature(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editDialogOpen ? "Edit Feature" : "Create New Feature"}</DialogTitle>
            <DialogDescription>
              {editDialogOpen
                ? "Update the feature details below."
                : "Define a new entitlement feature that can be assigned to plans."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Feature Key</Label>
                <Input
                  value={formData.key}
                  onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                  placeholder="advanced_analytics"
                  disabled={editDialogOpen}
                />
                <p className="text-xs text-muted-foreground">snake_case format</p>
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Advanced Analytics"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this feature enables..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value Type</Label>
                <Select
                  value={formData.valueType}
                  onValueChange={(value) => {
                    let defaultValue: unknown = false
                    if (value === "NUMBER") defaultValue = 0
                    if (value === "STRING") defaultValue = ""
                    if (value === "JSON") defaultValue = {}
                    setFormData(prev => ({ ...prev, valueType: value, defaultValue }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VALUE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Value</Label>
                {formData.valueType === "BOOLEAN" ? (
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={formData.defaultValue === true}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, defaultValue: checked }))}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.defaultValue ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                ) : formData.valueType === "NUMBER" ? (
                  <Input
                    type="number"
                    value={formData.defaultValue as number}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: parseInt(e.target.value) || 0 }))}
                  />
                ) : (
                  <Input
                    value={String(formData.defaultValue)}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateDialogOpen(false)
              setEditDialogOpen(false)
              setSelectedFeature(null)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={editDialogOpen ? handleUpdate : handleCreate} disabled={isSubmitting || !formData.key || !formData.name}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editDialogOpen ? "Updating..." : "Creating..."}
                </>
              ) : (
                editDialogOpen ? "Update Feature" : "Create Feature"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
