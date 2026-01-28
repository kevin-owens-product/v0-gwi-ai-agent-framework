"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Flag,
  Plus,
  Loader2,
  RefreshCw,
  Percent,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Copy,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string | null
  type: string
  isEnabled: boolean
  rolloutPercentage: number
  allowedOrgs: string[]
  blockedOrgs: string[]
  allowedPlans: string[]
  createdAt: string
  updatedAt: string
}

export default function FeatureFlagsPage() {
  const t = useTranslations("admin.features")
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Helper function to get plan name translation
  const getPlanName = (plan: string): string => {
    const planKey = `plans.${plan}`
    const translated = (t as any)(planKey)
    // If translation returns the key path (missing translation), return the plan name
    return translated === planKey ? plan : translated
  }

  // Form state
  const [formData, setFormData] = useState({
    key: "",
    name: "",
    description: "",
    type: "BOOLEAN",
    isEnabled: false,
    rolloutPercentage: 100,
    allowedPlans: [] as string[],
  })

  const fetchFlags = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/features")
      const data = await response.json()
      setFlags(data.flags || [])
      setSelectedIds(new Set())
    } catch (error) {
      console.error("Failed to fetch feature flags:", error)
      setFlags([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFlags()
  }, [fetchFlags])

  const resetForm = () => {
    setFormData({
      key: "",
      name: "",
      description: "",
      type: "BOOLEAN",
      isEnabled: false,
      rolloutPercentage: 100,
      allowedPlans: [],
    })
    setEditingFlag(null)
  }

  const handleOpenDialog = (flag?: FeatureFlag) => {
    if (flag) {
      setEditingFlag(flag)
      setFormData({
        key: flag.key,
        name: flag.name,
        description: flag.description || "",
        type: flag.type,
        isEnabled: flag.isEnabled,
        rolloutPercentage: flag.rolloutPercentage,
        allowedPlans: flag.allowedPlans,
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const url = editingFlag
        ? `/api/admin/features/${editingFlag.id}`
        : "/api/admin/features"
      const method = editingFlag ? "PATCH" : "POST"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      setDialogOpen(false)
      resetForm()
      fetchFlags()
    } catch (error) {
      console.error("Failed to save feature flag:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await fetch(`/api/admin/features/${flag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !flag.isEnabled }),
      })
      fetchFlags()
    } catch (error) {
      console.error("Failed to toggle feature flag:", error)
    }
  }

  const handleDelete = async (flag: FeatureFlag) => {
    try {
      await fetch(`/api/admin/features/${flag.id}`, { method: "DELETE" })
      fetchFlags()
    } catch (error) {
      console.error("Failed to delete feature flag:", error)
    }
  }

  const handleBulkEnable = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/features/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isEnabled: true }),
          })
        )
      )
      fetchFlags()
    } catch (error) {
      console.error("Failed to enable feature flags:", error)
    }
  }

  const handleBulkDisable = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/features/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isEnabled: false }),
          })
        )
      )
      fetchFlags()
    } catch (error) {
      console.error("Failed to disable feature flags:", error)
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/features/${id}`, { method: "DELETE" })
        )
      )
      fetchFlags()
    } catch (error) {
      console.error("Failed to delete feature flags:", error)
    }
  }

  const togglePlan = (plan: string) => {
    setFormData(prev => ({
      ...prev,
      allowedPlans: prev.allowedPlans.includes(plan)
        ? prev.allowedPlans.filter(p => p !== plan)
        : [...prev.allowedPlans, plan],
    }))
  }

  // Define columns for the data table
  const columns: Column<FeatureFlag>[] = [
    {
      id: "flag",
      header: t("columns.flag"),
      cell: (flag) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Flag className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{flag.name}</p>
            <code className="text-xs text-muted-foreground bg-muted px-1 rounded">
              {flag.key}
            </code>
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: t("columns.type"),
      cell: (flag) => <Badge variant="outline">{flag.type}</Badge>,
    },
    {
      id: "status",
      header: t("columns.status"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (flag) => (
        <div className="flex items-center justify-center">
          <Switch
            checked={flag.isEnabled}
            onCheckedChange={() => handleToggle(flag)}
          />
        </div>
      ),
    },
    {
      id: "rollout",
      header: t("columns.rollout"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (flag) => (
        <div className="flex items-center justify-center gap-1">
          <Percent className="h-3 w-3 text-muted-foreground" />
          {flag.rolloutPercentage}%
        </div>
      ),
    },
    {
      id: "plans",
      header: t("columns.allowedPlans"),
      cell: (flag) =>
        flag.allowedPlans.length === 0 ? (
          <span className="text-xs text-muted-foreground">{t("allPlans")}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {flag.allowedPlans.map((plan) => (
              <Badge key={plan} variant="secondary" className="text-xs">
                {getPlanName(plan)}
              </Badge>
            ))}
          </div>
        ),
    },
    {
      id: "updated",
      header: t("columns.updated"),
      cell: (flag) => (
        <span className="text-muted-foreground">
          {new Date(flag.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<FeatureFlag>[] = [
    {
      label: t("actions.editFlag"),
      icon: <Flag className="h-4 w-4" />,
      onClick: (flag) => handleOpenDialog(flag),
    },
    {
      label: t("actions.copyKey"),
      icon: <Copy className="h-4 w-4" />,
      onClick: (flag) => {
        navigator.clipboard.writeText(flag.key)
      },
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.enableAll"),
      icon: <ToggleRight className="h-4 w-4" />,
      onClick: handleBulkEnable,
      confirmTitle: t("confirmations.enableTitle"),
      confirmDescription: t("confirmations.enableDescription"),
    },
    {
      label: t("actions.disableAll"),
      icon: <ToggleLeft className="h-4 w-4" />,
      onClick: handleBulkDisable,
      confirmTitle: t("confirmations.disableTitle"),
      confirmDescription: t("confirmations.disableDescription"),
    },
    {
      label: t("actions.deleteAll"),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      separator: true,
      confirmTitle: t("confirmations.deleteTitle"),
      confirmDescription: t("confirmations.deleteDescription"),
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
                {t("description")}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchFlags} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("refresh")}
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("newFlag")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingFlag ? t("editTitle") : t("createTitle")}
                    </DialogTitle>
                    <DialogDescription>
                      {editingFlag
                        ? t("updateDescription")
                        : t("createDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("form.key")}</Label>
                        <Input
                          placeholder={t("form.keyPlaceholder")}
                          value={formData.key}
                          onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                          disabled={!!editingFlag}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("form.type")}</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BOOLEAN">{t("types.boolean")}</SelectItem>
                            <SelectItem value="STRING">{t("types.string")}</SelectItem>
                            <SelectItem value="NUMBER">{t("types.number")}</SelectItem>
                            <SelectItem value="JSON">{t("types.json")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("form.name")}</Label>
                      <Input
                        placeholder={t("form.namePlaceholder")}
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("form.description")}</Label>
                      <Textarea
                        placeholder={t("form.descriptionPlaceholder")}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{t("form.enabled")}</Label>
                        <p className="text-xs text-muted-foreground">{t("form.enabledDescription")}</p>
                      </div>
                      <Switch
                        checked={formData.isEnabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEnabled: checked }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>{t("form.rolloutPercentage")}</Label>
                        <span className="text-sm font-medium">{formData.rolloutPercentage}%</span>
                      </div>
                      <Slider
                        value={[formData.rolloutPercentage]}
                        onValueChange={([value]) => setFormData(prev => ({ ...prev, rolloutPercentage: value }))}
                        max={100}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("form.allowedPlans")}</Label>
                      <div className="flex gap-4">
                        {["STARTER", "PROFESSIONAL", "ENTERPRISE"].map((plan) => (
                          <div key={plan} className="flex items-center gap-2">
                            <Checkbox
                              id={plan}
                              checked={formData.allowedPlans.includes(plan)}
                              onCheckedChange={() => togglePlan(plan)}
                            />
                            <label htmlFor={plan} className="text-sm">
                              {getPlanName(plan)}
                            </label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("form.allowAllPlans")}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      {t("cancel")}
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.key || !formData.name || isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t("saving")}
                        </>
                      ) : editingFlag ? (
                        t("updateFlag")
                      ) : (
                        t("createFlag")
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdminDataTable
            data={flags}
            columns={columns}
            getRowId={(flag) => flag.id}
            isLoading={isLoading}
            emptyMessage={t("empty")}
            viewHref={(flag) => `/admin/features/${flag.id}`}
            onDelete={handleDelete}
            deleteConfirmTitle={t("confirmations.deleteSingleTitle")}
            deleteConfirmDescription={(flag) =>
              t("confirmations.deleteSingleDescription", { name: flag.name })
            }
            rowActions={rowActions}
            bulkActions={bulkActions}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>
    </div>
  )
}
