"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Plus, X, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ConditionalRule {
  id: string
  widgetId: string
  condition: {
    field: string
    operator: "equals" | "greater_than" | "less_than" | "contains" | "between"
    value: string | number | [number, number]
  }
  action: "show" | "hide" | "highlight"
  enabled: boolean
}

interface ConditionalDisplayManagerProps {
  widgets: Array<{ id: string; title: string; type: string }>
  rules: ConditionalRule[]
  onRulesChange: (rules: ConditionalRule[]) => void
  className?: string
}

export function ConditionalDisplayManager({
  widgets,
  rules,
  onRulesChange,
  className,
}: ConditionalDisplayManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newRule, setNewRule] = useState<Partial<ConditionalRule>>({
    condition: { field: "", operator: "equals", value: "" },
    action: "show",
    enabled: true,
  })

  const handleAddRule = () => {
    if (!newRule.widgetId || !newRule.condition?.field) return

    const rule: ConditionalRule = {
      id: crypto.randomUUID(),
      widgetId: newRule.widgetId,
      condition: {
        field: newRule.condition.field,
        operator: newRule.condition.operator || "equals",
        value: newRule.condition.value || "",
      },
      action: newRule.action || "show",
      enabled: newRule.enabled ?? true,
    }

    onRulesChange([...rules, rule])
    setShowAddDialog(false)
    setNewRule({
      condition: { field: "", operator: "equals", value: "" },
      action: "show",
      enabled: true,
    })
  }

  const handleRemoveRule = (id: string) => {
    onRulesChange(rules.filter((r) => r.id !== id))
  }

  const handleToggleRule = (id: string) => {
    onRulesChange(
      rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    )
  }

  const getActionIcon = (action: ConditionalRule["action"]) => {
    return action === "show" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Conditional Display Rules
          </CardTitle>
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No conditional display rules configured</p>
            <p className="text-xs mt-2">Add rules to show/hide widgets based on conditions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => {
              const widget = widgets.find((w) => w.id === rule.widgetId)
              return (
                <div key={rule.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActionIcon(rule.action)}
                      <span className="text-sm font-medium">
                        {rule.action === "show" ? "Show" : rule.action === "hide" ? "Hide" : "Highlight"}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {widget?.title || rule.widgetId}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        when {rule.condition.field} {rule.condition.operator} {String(rule.condition.value)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => handleToggleRule(rule.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveRule(rule.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {/* Add Rule Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle className="text-base">Add Conditional Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Widget</Label>
                <Select
                  value={newRule.widgetId}
                  onValueChange={(v) => setNewRule({ ...newRule, widgetId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select widget" />
                  </SelectTrigger>
                  <SelectContent>
                    {widgets.map((widget) => (
                      <SelectItem key={widget.id} value={widget.id}>
                        {widget.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select
                  value={newRule.action}
                  onValueChange={(v) => setNewRule({ ...newRule, action: v as ConditionalRule["action"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="show">Show Widget</SelectItem>
                    <SelectItem value="hide">Hide Widget</SelectItem>
                    <SelectItem value="highlight">Highlight Widget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition Field</Label>
                <Input
                  placeholder="Field name"
                  value={newRule.condition?.field || ""}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      condition: { ...newRule.condition!, field: e.target.value },
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Operator</Label>
                  <Select
                    value={newRule.condition?.operator}
                    onValueChange={(v) =>
                      setNewRule({
                        ...newRule,
                        condition: { ...newRule.condition!, operator: v as ConditionalRule["condition"]["operator"] },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="between">Between</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    placeholder="Condition value"
                    value={String(newRule.condition?.value || "")}
                    onChange={(e) =>
                      setNewRule({
                        ...newRule,
                        condition: { ...newRule.condition!, value: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newRule.enabled ?? true}
                  onCheckedChange={(checked) => setNewRule({ ...newRule, enabled: checked })}
                />
                <Label>Enabled</Label>
              </div>
            </CardContent>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddRule}
                disabled={!newRule.widgetId || !newRule.condition?.field}
              >
                Add Rule
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  )
}
