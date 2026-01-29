"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Bell, Mail, MessageSquare, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export interface AlertRule {
  id: string
  name: string
  metric: string
  condition: "above" | "below" | "change_increase" | "change_decrease" | "trend" | "anomaly"
  threshold: number
  enabled: boolean
  channels: Array<"email" | "slack" | "in_app">
  recipients?: string[]
  escalation?: {
    enabled: boolean
    levels: Array<{ delay: number; recipients: string[] }>
  }
}

interface AdvancedAlertSystemProps {
  alertRules: AlertRule[]
  onRulesChange: (rules: AlertRule[]) => void
}

const METRIC_OPTIONS = [
  { value: "awareness", label: "Awareness" },
  { value: "consideration", label: "Consideration" },
  { value: "preference", label: "Preference" },
  { value: "loyalty", label: "Loyalty" },
  { value: "nps", label: "Net Promoter Score" },
  { value: "sentiment", label: "Sentiment Score" },
  { value: "market_share", label: "Market Share" },
]

const CONDITION_OPTIONS = [
  { value: "above", label: "Above threshold" },
  { value: "below", label: "Below threshold" },
  { value: "change_increase", label: "Significant increase" },
  { value: "change_decrease", label: "Significant decrease" },
  { value: "trend", label: "Sustained trend" },
  { value: "anomaly", label: "Anomaly detected" },
]

export function AdvancedAlertSystem({ alertRules, onRulesChange }: AdvancedAlertSystemProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    name: "",
    metric: "awareness",
    condition: "below",
    threshold: 50,
    enabled: true,
    channels: ["email"],
  })

  const addRule = () => {
    if (!newRule.name || !newRule.metric) return

    const rule: AlertRule = {
      id: `alert-${Date.now()}`,
      name: newRule.name,
      metric: newRule.metric,
      condition: newRule.condition || "below",
      threshold: newRule.threshold || 50,
      enabled: newRule.enabled !== false,
      channels: newRule.channels || ["email"],
      recipients: newRule.recipients,
      escalation: newRule.escalation,
    }

    onRulesChange([...alertRules, rule])
    setNewRule({
      name: "",
      metric: "awareness",
      condition: "below",
      threshold: 50,
      enabled: true,
      channels: ["email"],
    })
    setShowAddDialog(false)
  }

  const removeRule = (id: string) => {
    onRulesChange(alertRules.filter((r) => r.id !== id))
  }

  const updateRule = (id: string, updates: Partial<AlertRule>) => {
    onRulesChange(alertRules.map((r) => (r.id === id ? { ...r, ...updates } : r)))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Advanced Alert System
            </CardTitle>
            <CardDescription>
              Configure automated alerts for brand health metrics
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alertRules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No alert rules configured</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
              Create First Alert
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {alertRules.map((rule) => (
              <div key={rule.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge variant={rule.enabled ? "default" : "secondary"}>
                        {rule.enabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        <span className="font-medium">Metric:</span> {METRIC_OPTIONS.find((m) => m.value === rule.metric)?.label}
                      </div>
                      <div>
                        <span className="font-medium">Condition:</span> {CONDITION_OPTIONS.find((c) => c.value === rule.condition)?.label}
                      </div>
                      <div>
                        <span className="font-medium">Threshold:</span> {rule.threshold}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Channels:</span>
                        {rule.channels.map((channel) => (
                          <Badge key={channel} variant="outline" className="text-xs">
                            {channel === "email" && <Mail className="h-3 w-3 mr-1" />}
                            {channel === "slack" && <MessageSquare className="h-3 w-3 mr-1" />}
                            {channel === "in_app" && <Bell className="h-3 w-3 mr-1" />}
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => updateRule(rule.id, { enabled: checked })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRule(rule.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddDialog && (
          <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
            <div className="space-y-2">
              <Label>Alert Name</Label>
              <Input
                placeholder="e.g., Low Awareness Alert"
                value={newRule.name || ""}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Metric</Label>
                <Select
                  value={newRule.metric}
                  onValueChange={(value) => setNewRule({ ...newRule, metric: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METRIC_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select
                  value={newRule.condition}
                  onValueChange={(value: AlertRule["condition"]) =>
                    setNewRule({ ...newRule, condition: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Threshold</Label>
              <Input
                type="number"
                value={newRule.threshold || ""}
                onChange={(e) => setNewRule({ ...newRule, threshold: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notification Channels</Label>
              <div className="flex gap-2">
                {(["email", "slack", "in_app"] as const).map((channel) => (
                  <label key={channel} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newRule.channels?.includes(channel)}
                      onChange={(e) => {
                        const channels = newRule.channels || []
                        if (e.target.checked) {
                          setNewRule({ ...newRule, channels: [...channels, channel] })
                        } else {
                          setNewRule({
                            ...newRule,
                            channels: channels.filter((c) => c !== channel),
                          })
                        }
                      }}
                    />
                    <span className="text-sm capitalize">{channel.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addRule} className="flex-1">
                Add Alert
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
