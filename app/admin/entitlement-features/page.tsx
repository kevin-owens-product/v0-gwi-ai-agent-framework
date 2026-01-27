"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
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
  Plus,
  Loader2,
  RefreshCw,
  Check,
  X,
} from "lucide-react"
import { toast } from "sonner"

const CATEGORY_KEYS = ["CORE", "ANALYTICS", "AGENTS", "INTEGRATIONS", "SECURITY", "SUPPORT", "CUSTOMIZATION", "API", "ADVANCED"] as const

const VALUE_TYPE_KEYS = ["BOOLEAN", "NUMBER", "STRING", "JSON"] as const

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
  const t = useTranslations("admin.entitlementFeatures")
  const tCommon = useTranslations("common")

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
        toast.error(data.error || t("errors.createFailed"))
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
        toast.error(data.error || t("errors.updateFailed"))
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
        toast.error(data.error || t("errors.deleteFailed"))
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
      header: t("columns.feature"),
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
      header: t("columns.category"),
      cell: (feature) => (
        <Badge className={getCategoryBadgeColor(feature.category)}>
          {t(`categories.${feature.category.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      id: "type",
      header: t("columns.type"),
      cell: (feature) => <Badge variant="outline">{t(`valueTypes.${feature.valueType.toLowerCase()}`)}</Badge>,
    },
    {
      id: "default",
      header: t("columns.default"),
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
      header: t("columns.plans"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (feature) => <Badge variant="outline">{feature._count.plans}</Badge>,
    },
    {
      id: "status",
      header: tCommon("status"),
      cell: (feature) =>
        feature.isActive ? (
          <Badge variant="default" className="bg-green-500">
            <Check className="h-3 w-3 mr-1" />
            {tCommon("active")}
          </Badge>
        ) : (
          <Badge variant="secondary">
            <X className="h-3 w-3 mr-1" />
            {tCommon("inactive")}
          </Badge>
        ),
    },
  ]

  // Row actions
  const rowActions: RowAction<Feature>[] = [
    {
      label: t("actions.editFeature"),
      icon: <Pencil className="h-4 w-4" />,
      onClick: openEditDialog,
    },
  ]

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.enableSelected"),
      icon: <Check className="h-4 w-4" />,
      onClick: (ids) => handleBulkToggleActive(ids, true),
      confirmTitle: t("dialogs.enableFeatures"),
      confirmDescription: t("dialogs.enableFeaturesDescription"),
    },
    {
      label: t("actions.disableSelected"),
      icon: <X className="h-4 w-4" />,
      onClick: (ids) => handleBulkToggleActive(ids, false),
      confirmTitle: t("dialogs.disableFeatures"),
      confirmDescription: t("dialogs.disableFeaturesDescription"),
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
                {t("title")}
              </CardTitle>
              <CardDescription>
                {t("description", { total })}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchFeatures} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {tCommon("refresh")}
              </Button>
              <Button onClick={() => { resetForm(); setCreateDialogOpen(true) }} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("newFeature")}
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t("columns.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
                {CATEGORY_KEYS.map((cat) => (
                  <SelectItem key={cat} value={cat}>{t(`categories.${cat.toLowerCase()}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={tCommon("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                <SelectItem value="true">{tCommon("active")}</SelectItem>
                <SelectItem value="false">{tCommon("inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AdminDataTable */}
          <AdminDataTable
            data={features}
            columns={columns}
            getRowId={(feature) => feature.id}
            isLoading={isLoading}
            emptyMessage={t("noFeatures")}
            rowActions={rowActions}
            onDelete={(feature) => {
              // Check if feature is used in plans before deleting
              if (feature._count.plans > 0) {
                toast.error(t("errors.featureInUse", { count: feature._count.plans }))
                return Promise.reject(new Error("Feature is in use"))
              }
              return handleDeleteFeature(feature)
            }}
            deleteConfirmTitle={t("dialogs.deleteFeature")}
            deleteConfirmDescription={(feature) =>
              t("dialogs.deleteFeatureDescription", { name: feature.name })
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
            <DialogTitle>{editDialogOpen ? t("dialogs.editFeature") : t("dialogs.createFeature")}</DialogTitle>
            <DialogDescription>
              {editDialogOpen
                ? t("dialogs.editFeatureDescription")
                : t("dialogs.createFeatureDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("form.featureKey")}</Label>
                <Input
                  value={formData.key}
                  onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                  placeholder={t("form.featureKeyPlaceholder")}
                  disabled={editDialogOpen}
                />
                <p className="text-xs text-muted-foreground">{t("form.snakeCaseFormat")}</p>
              </div>
              <div className="space-y-2">
                <Label>{t("form.displayName")}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t("form.displayNamePlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{tCommon("description")}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t("form.descriptionPlaceholder")}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("columns.category")}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_KEYS.map((cat) => (
                      <SelectItem key={cat} value={cat}>{t(`categories.${cat.toLowerCase()}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("form.valueType")}</Label>
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
                    {VALUE_TYPE_KEYS.map((type) => (
                      <SelectItem key={type} value={type}>{t(`valueTypes.${type.toLowerCase()}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("form.defaultValue")}</Label>
                {formData.valueType === "BOOLEAN" ? (
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={formData.defaultValue === true}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, defaultValue: checked }))}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.defaultValue ? tCommon("enabled") : tCommon("disabled")}
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
                <Label>{t("form.sortOrder")}</Label>
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
              <Label>{tCommon("active")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateDialogOpen(false)
              setEditDialogOpen(false)
              setSelectedFeature(null)
              resetForm()
            }}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={editDialogOpen ? handleUpdate : handleCreate} disabled={isSubmitting || !formData.key || !formData.name}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editDialogOpen ? t("form.updating") : t("form.creating")}
                </>
              ) : (
                editDialogOpen ? t("form.updateFeature") : t("form.createFeature")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
