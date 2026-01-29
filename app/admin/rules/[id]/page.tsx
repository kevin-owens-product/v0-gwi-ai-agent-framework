"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Scale,
  Loader2,
  Calendar,
  Edit,
  Save,
  X,
  Zap,
  Clock,
  AlertTriangle,
  Shield,
} from "lucide-react"
import Link from "next/link"

interface Organization {
  id: string
  name: string
  slug: string
  planTier: string
}

interface AuditLog {
  id: string
  action: string
  resourceType: string
  details: Record<string, unknown>
  timestamp: string
}

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
  updatedAt: string
  appliedOrgDetails: Organization[]
  excludedOrgDetails: Organization[]
  auditLogs: AuditLog[]
}

const ruleTypeIcons: Record<string, typeof Scale> = {
  RATE_LIMIT: Clock,
  CONTENT_POLICY: AlertTriangle,
  SECURITY: Shield,
  BILLING: Zap,
  USAGE: Zap,
  COMPLIANCE: Scale,
  NOTIFICATION: Zap,
  AUTO_SUSPEND: AlertTriangle,
}

export default function SystemRuleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ruleId = params.id as string

  const [rule, setRule] = useState<SystemRule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    type: "RATE_LIMIT",
    conditions: "{}",
    actions: "{}",
    isActive: true,
    priority: 0,
  })

  const fetchRule = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/rules/${ruleId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch rule")
      }
      const data = await response.json()
      setRule(data.rule)
      setEditForm({
        name: data.rule.name,
        description: data.rule.description || "",
        type: data.rule.type,
        conditions: JSON.stringify(data.rule.conditions, null, 2),
        actions: JSON.stringify(data.rule.actions, null, 2),
        isActive: data.rule.isActive,
        priority: data.rule.priority,
      })
    } catch (error) {
      console.error("Failed to fetch rule:", error)
    } finally {
      setIsLoading(false)
    }
  }, [ruleId])

  useEffect(() => {
    fetchRule()
  }, [fetchRule])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let conditions, actions
      try {
        conditions = JSON.parse(editForm.conditions)
        actions = JSON.parse(editForm.actions)
      } catch {
        toast.error("Invalid JSON in conditions or actions")
        setIsSaving(false)
        return
      }

      const response = await fetch(`/api/admin/rules/${ruleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          conditions,
          actions,
        }),
      })
      if (response.ok) {
        setIsEditing(false)
        fetchRule()
      }
    } catch (error) {
      console.error("Failed to update rule:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async () => {
    try {
      await fetch(`/api/admin/rules/${ruleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rule?.isActive }),
      })
      fetchRule()
    } catch (error) {
      console.error("Failed to toggle rule:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!rule) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Rule not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const TypeIcon = ruleTypeIcons[rule.type] || Scale

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/rules">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <TypeIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{rule.name}</h1>
            <Badge variant="outline">{rule.type.replace(/_/g, " ")}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active:</span>
            <Switch checked={rule.isActive} onCheckedChange={handleToggle} />
            <Badge variant={rule.isActive ? "default" : "secondary"}>
              {rule.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Priority</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rule.priority}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trigger Count</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rule.triggerCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Triggered</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium">
                  {rule.lastTriggered
                    ? new Date(rule.lastTriggered).toLocaleDateString()
                    : "Never"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rule Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rule Details</CardTitle>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={editForm.type}
                        onValueChange={(v) => setEditForm({ ...editForm, type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RATE_LIMIT">{t("types.rateLimit")}</SelectItem>
                          <SelectItem value="CONTENT_POLICY">{t("types.contentPolicy")}</SelectItem>
                          <SelectItem value="SECURITY">{t("types.security")}</SelectItem>
                          <SelectItem value="BILLING">{t("types.billing")}</SelectItem>
                          <SelectItem value="USAGE">{t("types.usage")}</SelectItem>
                          <SelectItem value="COMPLIANCE">{t("types.compliance")}</SelectItem>
                          <SelectItem value="NOTIFICATION">{t("types.notification")}</SelectItem>
                          <SelectItem value="AUTO_SUSPEND">{t("types.autoSuspend")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Input
                      type="number"
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{rule.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline">{rule.type.replace(/_/g, " ")}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority</span>
                    <Badge variant="secondary">{rule.priority}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {rule.description && (
                    <div className="pt-2">
                      <span className="text-muted-foreground text-sm">Description</span>
                      <p className="mt-1">{rule.description}</p>
                    </div>
                  )}
                  <div className="flex justify-between pt-2">
                    <span className="text-muted-foreground">Created</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(rule.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Conditions</CardTitle>
              <CardDescription>When this rule should be triggered</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editForm.conditions}
                  onChange={(e) => setEditForm({ ...editForm, conditions: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />
              ) : (
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(rule.conditions, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>What happens when this rule triggers</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editForm.actions}
                  onChange={(e) => setEditForm({ ...editForm, actions: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />
              ) : (
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(rule.actions, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting" className="space-y-6">
          {/* Applied Organizations */}
          <Card>
            <CardHeader>
              <CardTitle>Applied To Organizations</CardTitle>
              <CardDescription>
                {rule.appliesTo.length === 0
                  ? "This rule applies to all organizations"
                  : `This rule applies to ${rule.appliesTo.length} specific organization(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rule.appliedOrgDetails.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rule.appliedOrgDetails.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-xs text-muted-foreground">{org.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{org.planTier}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Applies to all organizations
                </p>
              )}
            </CardContent>
          </Card>

          {/* Excluded Organizations */}
          <Card>
            <CardHeader>
              <CardTitle>Excluded Organizations</CardTitle>
              <CardDescription>
                Organizations that are exempt from this rule
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rule.excludedOrgDetails.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rule.excludedOrgDetails.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-xs text-muted-foreground">{org.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{org.planTier}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No excluded organizations
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Change History</CardTitle>
              <CardDescription>Recent changes to this rule</CardDescription>
            </CardHeader>
            <CardContent>
              {rule.auditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rule.auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No history available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
