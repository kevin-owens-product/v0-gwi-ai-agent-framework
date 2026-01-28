"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { showErrorToast } from "@/lib/toast-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Scale,
  Plus,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  AlertTriangle,
  Shield,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface SystemRule {
  id: string
  name: string
  description: string | null
  type: string
  conditions: Record<string, unknown>
  actions: Record<string, unknown>
  isActive: boolean
  priority: number
  appliesTo: string[]
  excludeOrgs: string[]
  triggerCount: number
  lastTriggered: string | null
  createdAt: string
}

export default function RulesPage() {
  const t = useTranslations("admin.rules")
  const tCommon = useTranslations("common")
  const [rules, setRules] = useState<SystemRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<SystemRule | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const ruleTypes = [
    { value: "RATE_LIMIT", label: t("types.rateLimit"), icon: Clock },
    { value: "CONTENT_POLICY", label: t("types.contentPolicy"), icon: AlertTriangle },
    { value: "SECURITY", label: t("types.security"), icon: Shield },
    { value: "BILLING", label: t("types.billing"), icon: Zap },
    { value: "USAGE", label: t("types.usage"), icon: Zap },
    { value: "COMPLIANCE", label: t("types.compliance"), icon: Scale },
    { value: "NOTIFICATION", label: t("types.notification"), icon: Zap },
    { value: "AUTO_SUSPEND", label: t("types.autoSuspend"), icon: AlertTriangle },
  ]

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "RATE_LIMIT",
    conditions: "{}",
    actions: "{}",
    isActive: true,
    priority: 0,
  })

  const fetchRules = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/rules")
      const data = await response.json()
      setRules(data.rules)
    } catch (error) {
      console.error("Failed to fetch rules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [])

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "RATE_LIMIT",
      conditions: "{}",
      actions: "{}",
      isActive: true,
      priority: 0,
    })
    setEditingRule(null)
  }

  const handleOpenDialog = (rule?: SystemRule) => {
    if (rule) {
      setEditingRule(rule)
      setFormData({
        name: rule.name,
        description: rule.description || "",
        type: rule.type,
        conditions: JSON.stringify(rule.conditions, null, 2),
        actions: JSON.stringify(rule.actions, null, 2),
        isActive: rule.isActive,
        priority: rule.priority,
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      let conditions, actions
      try {
        conditions = JSON.parse(formData.conditions)
        actions = JSON.parse(formData.actions)
      } catch {
        showErrorToast(t("errors.invalidJson"))
        setIsSubmitting(false)
        return
      }

      const url = editingRule
        ? `/api/admin/rules/${editingRule.id}`
        : "/api/admin/rules"
      const method = editingRule ? "PATCH" : "POST"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          conditions,
          actions,
        }),
      })

      setDialogOpen(false)
      resetForm()
      fetchRules()
    } catch (error) {
      console.error("Failed to save rule:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (rule: SystemRule) => {
    try {
      await fetch(`/api/admin/rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rule.isActive }),
      })
      fetchRules()
    } catch (error) {
      console.error("Failed to toggle rule:", error)
    }
  }

  const handleDelete = async (ruleId: string) => {
    try {
      await fetch(`/api/admin/rules/${ruleId}`, { method: "DELETE" })
      fetchRules()
    } catch (error) {
      console.error("Failed to delete rule:", error)
    }
  }

  const getRuleTypeInfo = (type: string) => {
    return ruleTypes.find(t => t.value === type) || ruleTypes[0]
  }

  const handleBulkEnable = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/admin/rules/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: true }),
          })
        )
      )
      fetchRules()
    } catch (error) {
      console.error("Failed to enable rules:", error)
    }
  }

  const handleBulkDisable = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/admin/rules/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: false }),
          })
        )
      )
      fetchRules()
    } catch (error) {
      console.error("Failed to disable rules:", error)
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/admin/rules/${id}`, { method: "DELETE" })
        )
      )
      fetchRules()
    } catch (error) {
      console.error("Failed to delete rules:", error)
    }
  }

  // Define columns for the data table
  const columns: Column<SystemRule>[] = [
    {
      id: "rule",
      header: t("columns.rule"),
      cell: (rule) => {
        const typeInfo = getRuleTypeInfo(rule.type)
        const TypeIcon = typeInfo.icon
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <TypeIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{rule.name}</p>
              {rule.description && (
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {rule.description}
                </p>
              )}
            </div>
          </div>
        )
      },
    },
    {
      id: "type",
      header: t("columns.type"),
      cell: (rule) => {
        const typeInfo = getRuleTypeInfo(rule.type)
        return <Badge variant="outline">{typeInfo.label}</Badge>
      },
    },
    {
      id: "priority",
      header: t("columns.priority"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (rule) => <Badge variant="secondary">{rule.priority}</Badge>,
    },
    {
      id: "status",
      header: t("columns.status"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (rule) => (
        <Switch
          checked={rule.isActive}
          onCheckedChange={() => handleToggle(rule)}
        />
      ),
    },
    {
      id: "triggers",
      header: t("columns.triggers"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (rule) => <span className="text-sm font-medium">{rule.triggerCount}</span>,
    },
    {
      id: "lastTriggered",
      header: t("columns.lastTriggered"),
      cell: (rule) => (
        <span className="text-muted-foreground">
          {rule.lastTriggered
            ? new Date(rule.lastTriggered).toLocaleDateString()
            : tCommon("never")}
        </span>
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<SystemRule>[] = [
    {
      label: t("editRule"),
      icon: <Pencil className="h-4 w-4" />,
      onClick: (rule) => handleOpenDialog(rule),
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("enableAll"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: handleBulkEnable,
      confirmTitle: t("enableSelectedRules"),
      confirmDescription: t("enableConfirm"),
    },
    {
      label: t("disableAll"),
      icon: <XCircle className="h-4 w-4" />,
      onClick: handleBulkDisable,
      confirmTitle: t("disableSelectedRules"),
      confirmDescription: t("disableConfirm"),
    },
    {
      label: t("deleteAll"),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      separator: true,
      confirmTitle: t("deleteSelectedRules"),
      confirmDescription: t("deleteConfirm"),
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
              <Button onClick={fetchRules} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {tCommon("refresh")}
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("newRule")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRule ? t("editSystemRule") : t("createSystemRule")}
                    </DialogTitle>
                    <DialogDescription>
                      {t("configurePlatformWide")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("ruleName")}</Label>
                        <Input
                          placeholder={t("placeholders.ruleName")}
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("type")}</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ruleTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("description")}</Label>
                      <Textarea
                        placeholder={t("placeholders.description")}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("priority")}</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.priority}
                          onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                        />
                        <p className="text-xs text-muted-foreground">{t("higherPriority")}</p>
                      </div>
                      <div className="flex items-center justify-between pt-6">
                        <div className="space-y-0.5">
                          <Label>{t("active")}</Label>
                          <p className="text-xs text-muted-foreground">{t("enableThisRule")}</p>
                        </div>
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("conditions")}</Label>
                      <Textarea
                        placeholder={t("placeholders.conditions")}
                        value={formData.conditions}
                        onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("actions")}</Label>
                      <Textarea
                        placeholder={t("placeholders.actions")}
                        value={formData.actions}
                        onChange={(e) => setFormData(prev => ({ ...prev, actions: e.target.value }))}
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      {t("cancel")}
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.name || isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t("saving")}
                        </>
                      ) : editingRule ? (
                        t("updateRule")
                      ) : (
                        t("createRuleButton")
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
            data={rules}
            columns={columns}
            getRowId={(rule) => rule.id}
            isLoading={isLoading}
            emptyMessage={t("noRulesConfigured")}
            viewHref={(rule) => `/admin/rules/${rule.id}`}
            onDelete={(rule) => handleDelete(rule.id)}
            deleteConfirmTitle={t("deleteRule")}
            deleteConfirmDescription={(rule) =>
              t("deleteRuleConfirm", { name: rule.name })
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
