"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Building2,
  Users,
  Bot,
  Workflow,
  Loader2,
  Ban,
  CheckCircle,
  Activity,
  Calendar,
  AlertTriangle,
  Edit,
  Save,
  X,
  Coins,
  Sparkles,
  Plus,
  Trash2,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { showErrorToast } from "@/lib/toast-utils"

interface Member {
  id: string
  role: string
  joinedAt: string
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
}

interface Agent {
  id: string
  name: string
  status: string
  createdAt: string
}

interface WorkflowItem {
  id: string
  name: string
  status: string
  createdAt: string
}

interface Suspension {
  id: string
  reason: string
  suspensionType: string
  createdAt: string
  isActive: boolean
  expiresAt: string | null
  suspendedBy: string // Super admin ID
}

interface HealthScore {
  overallScore: number
  engagementScore: number
  usageScore: number
  riskLevel: string
  churnProbability: number
  recommendations: string[]
  calculatedAt: string
}

interface Plan {
  id: string
  name: string
  displayName: string
}

interface Feature {
  id: string
  key: string
  name: string
  category: string
}

interface TenantEntitlement {
  id: string
  planId: string | null
  featureId: string | null
  value: unknown
  limit: number | null
  isActive: boolean
  expiresAt: string | null
  grantedBy: string | null
  reason: string | null
  createdAt: string
  plan: Plan | null
  feature: Feature | null
}

interface EntitlementsData {
  planId: string | null
  planName: string | null
  planTier: string
  limits: Record<string, number>
  features: Array<{
    key: string
    name: string
    category: string
    valueType: string
    value: unknown
    limit: number | null
    isOverride: boolean
  }>
}

interface Tenant {
  id: string
  name: string
  slug: string
  planTier: string
  createdAt: string
  settings: Record<string, unknown>
  isSuspended: boolean
  suspension: Suspension | null
  suspensionHistory: Suspension[]
  subscription: {
    status: string
  } | null
  _count: {
    members: number
    agents: number
    workflows: number
    invitations: number
  }
  members: Member[]
  agents: Agent[]
  workflows: WorkflowItem[]
  stats: {
    agentRunsLast30Days: number
    totalTokensUsed: number
  }
  healthScore: HealthScore | null
}

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tenantId = params.id as string
  const t = useTranslations("admin.tenants")

  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", planTier: "" })
  const [isSaving, setIsSaving] = useState(false)

  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [suspendReason, setSuspendReason] = useState("")
  const [suspendType, setSuspendType] = useState("FULL")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Entitlements state
  const [entitlements, setEntitlements] = useState<EntitlementsData | null>(null)
  const [entitlementOverrides, setEntitlementOverrides] = useState<TenantEntitlement[]>([])
  const [allPlans, setAllPlans] = useState<Plan[]>([])
  const [allFeatures, setAllFeatures] = useState<Feature[]>([])
  const [assignPlanDialogOpen, setAssignPlanDialogOpen] = useState(false)
  const [grantFeatureDialogOpen, setGrantFeatureDialogOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState("")
  const [selectedFeatureId, setSelectedFeatureId] = useState("")
  const [featureValue, setFeatureValue] = useState<unknown>(true)
  const [featureReason, setFeatureReason] = useState("")

  const fetchTenant = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch tenant")
      }
      const data = await response.json()
      setTenant(data.tenant)
      setEditForm({ name: data.tenant.name, planTier: data.tenant.planTier })
    } catch (error) {
      console.error("Failed to fetch tenant:", error)
    } finally {
      setIsLoading(false)
    }
  }, [tenantId])

  const fetchEntitlements = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/entitlements`)
      if (response.ok) {
        const data = await response.json()
        setEntitlements(data.entitlements)
        setEntitlementOverrides(data.overrides)
      }
    } catch (error) {
      console.error("Failed to fetch entitlements:", error)
    }
  }, [tenantId])

  const fetchPlansAndFeatures = useCallback(async () => {
    try {
      const [plansRes, featuresRes] = await Promise.all([
        fetch("/api/admin/plans?limit=50"),
        fetch("/api/admin/entitlement-features?limit=100"),
      ])
      if (plansRes.ok) {
        const data = await plansRes.json()
        setAllPlans(data.plans)
      }
      if (featuresRes.ok) {
        const data = await featuresRes.json()
        setAllFeatures(data.features)
      }
    } catch (error) {
      console.error("Failed to fetch plans/features:", error)
    }
  }, [])

  useEffect(() => {
    fetchTenant()
    fetchEntitlements()
    fetchPlansAndFeatures()
  }, [fetchTenant, fetchEntitlements, fetchPlansAndFeatures])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (response.ok) {
        setIsEditing(false)
        fetchTenant()
      }
    } catch (error) {
      console.error("Failed to update tenant:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSuspend = async () => {
    if (!suspendReason) return
    setIsSubmitting(true)
    try {
      await fetch(`/api/admin/tenants/${tenantId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: suspendReason,
          suspensionType: suspendType,
        }),
      })
      setSuspendDialogOpen(false)
      setSuspendReason("")
      fetchTenant()
    } catch (error) {
      console.error("Failed to suspend tenant:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLiftSuspension = async () => {
    try {
      await fetch(`/api/admin/tenants/${tenantId}/suspend`, {
        method: "DELETE",
      })
      fetchTenant()
    } catch (error) {
      console.error("Failed to lift suspension:", error)
    }
  }

  const handleAssignPlan = async () => {
    if (!selectedPlanId) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/entitlements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "plan",
          planId: selectedPlanId,
          reason: featureReason || undefined,
        }),
      })
      if (response.ok) {
        setAssignPlanDialogOpen(false)
        setSelectedPlanId("")
        setFeatureReason("")
        fetchEntitlements()
        fetchTenant()
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("toast.assignPlanFailed"))
      }
    } catch (error) {
      console.error("Failed to assign plan:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGrantFeature = async () => {
    if (!selectedFeatureId) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/entitlements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "feature",
          featureId: selectedFeatureId,
          value: featureValue,
          reason: featureReason || undefined,
        }),
      })
      if (response.ok) {
        setGrantFeatureDialogOpen(false)
        setSelectedFeatureId("")
        setFeatureValue(true)
        setFeatureReason("")
        fetchEntitlements()
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("toast.grantFeatureFailed"))
      }
    } catch (error) {
      console.error("Failed to grant feature:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevokeEntitlement = async (entitlementId: string) => {
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/entitlements?entitlementId=${entitlementId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchEntitlements()
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("toast.revokeEntitlementFailed"))
      }
    } catch (error) {
      console.error("Failed to revoke entitlement:", error)
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Tenant not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/tenants">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{tenant.name}</h1>
            <p className="text-muted-foreground">{tenant.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tenant.isSuspended ? (
            <Button onClick={handleLiftSuspension}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Lift Suspension
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => setSuspendDialogOpen(true)}>
              <Ban className="h-4 w-4 mr-2" />
              Suspend
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {tenant.isSuspended && tenant.suspension && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Organization Suspended</p>
                <p className="text-sm text-muted-foreground">
                  {tenant.suspension.suspensionType} suspension - {tenant.suspension.reason}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members ({tenant._count.members})</TabsTrigger>
          <TabsTrigger value="entitlements">
            <Sparkles className="h-4 w-4 mr-1" />
            Entitlements
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenant._count.members}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agents</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenant._count.agents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Workflows</CardTitle>
                <Workflow className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenant._count.workflows}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Runs (30d)</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenant.stats.agentRunsLast30Days}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Organization Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Organization Details</CardTitle>
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
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Plan Tier</Label>
                      <Select
                        value={editForm.planTier}
                        onValueChange={(value) => setEditForm({ ...editForm, planTier: value })}
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
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{tenant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Slug</span>
                      <span className="font-medium">{tenant.slug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan</span>
                      <Badge variant={
                        tenant.planTier === "ENTERPRISE" ? "default" :
                        tenant.planTier === "PROFESSIONAL" ? "secondary" : "outline"
                      }>
                        {tenant.planTier}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      {tenant.isSuspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : tenant.subscription?.status === "ACTIVE" ? (
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary">{tenant.subscription?.status || "Trial"}</Badge>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Tokens</span>
                      <span className="font-medium flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        {tenant.stats.totalTokensUsed.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Health Score */}
            <Card>
              <CardHeader>
                <CardTitle>Health Score</CardTitle>
                <CardDescription>Organization engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {tenant.healthScore ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Overall Score</span>
                      <span className="text-2xl font-bold">{Math.round(tenant.healthScore.overallScore)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Engagement</span>
                      <span className="font-medium">{Math.round(tenant.healthScore.engagementScore)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Usage</span>
                      <span className="font-medium">{Math.round(tenant.healthScore.usageScore)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk Level</span>
                      <Badge variant={
                        tenant.healthScore.riskLevel === "CRITICAL" ? "destructive" :
                        tenant.healthScore.riskLevel === "AT_RISK" ? "secondary" : "default"
                      }>
                        {tenant.healthScore.riskLevel}
                      </Badge>
                    </div>
                    {tenant.healthScore.recommendations.length > 0 && (
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-2">Recommendations</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {tenant.healthScore.recommendations.map((rec, i) => (
                            <li key={i}>- {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No health score data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Agents & Workflows */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Agents</CardTitle>
              </CardHeader>
              <CardContent>
                {tenant.agents.length > 0 ? (
                  <div className="space-y-3">
                    {tenant.agents.map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{agent.name}</span>
                        </div>
                        <Badge variant={agent.status === "ACTIVE" ? "default" : "secondary"}>
                          {agent.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No agents created</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                {tenant.workflows.length > 0 ? (
                  <div className="space-y-3">
                    {tenant.workflows.map((workflow) => (
                      <div key={workflow.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Workflow className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{workflow.name}</span>
                        </div>
                        <Badge variant={workflow.status === "ACTIVE" ? "default" : "secondary"}>
                          {workflow.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No workflows created</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Organization Members</CardTitle>
              <CardDescription>Users who belong to this organization</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenant.members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.user.avatarUrl || undefined} />
                            <AvatarFallback>
                              {getInitials(member.user.name, member.user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.user.name || "No name"}</p>
                            <p className="text-xs text-muted-foreground">{member.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.role === "OWNER" ? "default" : "secondary"}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/users/${member.user.id}`}>
                            View User
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entitlements" className="space-y-6">
          {/* Current Plan & Limits */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Current Plan
                    </CardTitle>
                    <CardDescription>Assigned subscription plan</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setAssignPlanDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Change Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {entitlements ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Plan Name</span>
                      <span className="font-medium">{entitlements.planName || "Default"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Plan Tier</span>
                      <Badge variant={
                        entitlements.planTier === "ENTERPRISE" ? "default" :
                        entitlements.planTier === "PROFESSIONAL" ? "secondary" : "outline"
                      }>
                        {entitlements.planTier}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Loading...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Limits</CardTitle>
                <CardDescription>Current limits for this tenant</CardDescription>
              </CardHeader>
              <CardContent>
                {entitlements?.limits ? (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(entitlements.limits).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                        <span className="font-mono">{value === -1 ? "∞" : value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No limits configured</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Feature Entitlements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Feature Entitlements
                  </CardTitle>
                  <CardDescription>Features available to this tenant</CardDescription>
                </div>
                <Button size="sm" onClick={() => setGrantFeatureDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Grant Feature
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {entitlements?.features && entitlements.features.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entitlements.features.map((feature) => (
                      <TableRow key={feature.key}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{feature.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{feature.key}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{feature.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {typeof feature.value === "boolean"
                              ? feature.value ? "Enabled" : "Disabled"
                              : String(feature.value)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {feature.isOverride ? (
                            <Badge variant="secondary">Override</Badge>
                          ) : (
                            <Badge variant="outline">Plan</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No features configured</p>
              )}
            </CardContent>
          </Card>

          {/* Entitlement Overrides */}
          <Card>
            <CardHeader>
              <CardTitle>Entitlement Overrides</CardTitle>
              <CardDescription>Manual overrides applied to this tenant</CardDescription>
            </CardHeader>
            <CardContent>
              {entitlementOverrides.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entitlementOverrides.map((override) => (
                      <TableRow key={override.id}>
                        <TableCell>
                          <Badge variant={override.planId ? "default" : "secondary"}>
                            {override.planId ? "Plan" : "Feature"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {override.plan?.displayName || override.feature?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                          {override.reason || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(override.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={override.isActive ? "default" : "secondary"}>
                            {override.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {override.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeEntitlement(override.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No manual overrides</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Agent runs and usage over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Agent Runs</p>
                    <p className="text-2xl font-bold">{tenant.stats.agentRunsLast30Days}</p>
                  </div>
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Total Tokens Used</p>
                    <p className="text-2xl font-bold">{tenant.stats.totalTokensUsed.toLocaleString()}</p>
                  </div>
                  <Coins className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Suspension History</CardTitle>
              <CardDescription>Past and current suspensions for this organization</CardDescription>
            </CardHeader>
            <CardContent>
              {tenant.suspensionHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenant.suspensionHistory.map((suspension) => (
                      <TableRow key={suspension.id}>
                        <TableCell>
                          <Badge variant="outline">{suspension.suspensionType}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {suspension.reason}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {suspension.suspendedBy.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(suspension.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={suspension.isActive ? "destructive" : "secondary"}>
                            {suspension.isActive ? "Active" : "Lifted"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No suspension history</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Organization</DialogTitle>
            <DialogDescription>
              Suspend {tenant.name}. Users will be unable to access the platform.
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

      {/* Assign Plan Dialog */}
      <Dialog open={assignPlanDialogOpen} onOpenChange={setAssignPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Plan</DialogTitle>
            <DialogDescription>
              Assign a subscription plan to {tenant.name}. This will override their current plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Plan</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan..." />
                </SelectTrigger>
                <SelectContent>
                  {allPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Why is this plan being assigned?"
                value={featureReason}
                onChange={(e) => setFeatureReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignPlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignPlan} disabled={!selectedPlanId || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Feature Dialog */}
      <Dialog open={grantFeatureDialogOpen} onOpenChange={setGrantFeatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Feature</DialogTitle>
            <DialogDescription>
              Grant a specific feature override to {tenant.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Feature</Label>
              <Select value={selectedFeatureId} onValueChange={setSelectedFeatureId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a feature..." />
                </SelectTrigger>
                <SelectContent>
                  {allFeatures.map((feature) => (
                    <SelectItem key={feature.id} value={feature.id}>
                      {feature.name} ({feature.key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Why is this feature being granted?"
                value={featureReason}
                onChange={(e) => setFeatureReason(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantFeatureDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGrantFeature} disabled={!selectedFeatureId || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Granting...
                </>
              ) : (
                "Grant Feature"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
