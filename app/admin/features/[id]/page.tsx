"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
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
  Flag,
  Loader2,
  Calendar,
  Edit,
  Save,
  X,
  Percent,
  Building2,
  Ban,
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

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string | null
  type: string
  defaultValue: unknown
  isEnabled: boolean
  rolloutPercentage: number
  allowedOrgs: string[]
  blockedOrgs: string[]
  allowedPlans: string[]
  createdAt: string
  updatedAt: string
  allowedOrgDetails: Organization[]
  blockedOrgDetails: Organization[]
  auditLogs: AuditLog[]
}

export default function FeatureFlagDetailPage() {
  const params = useParams()
  const router = useRouter()
  const flagId = params.id as string

  const [flag, setFlag] = useState<FeatureFlag | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    type: "BOOLEAN",
    isEnabled: false,
    rolloutPercentage: 100,
    allowedPlans: [] as string[],
  })

  const fetchFlag = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/features/${flagId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch feature flag")
      }
      const data = await response.json()
      setFlag(data.flag)
      setEditForm({
        name: data.flag.name,
        description: data.flag.description || "",
        type: data.flag.type,
        isEnabled: data.flag.isEnabled,
        rolloutPercentage: data.flag.rolloutPercentage,
        allowedPlans: data.flag.allowedPlans,
      })
    } catch (error) {
      console.error("Failed to fetch feature flag:", error)
    } finally {
      setIsLoading(false)
    }
  }, [flagId])

  useEffect(() => {
    fetchFlag()
  }, [fetchFlag])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/features/${flagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (response.ok) {
        setIsEditing(false)
        fetchFlag()
      }
    } catch (error) {
      console.error("Failed to update feature flag:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async () => {
    try {
      await fetch(`/api/admin/features/${flagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !flag?.isEnabled }),
      })
      fetchFlag()
    } catch (error) {
      console.error("Failed to toggle feature flag:", error)
    }
  }

  const togglePlan = (plan: string) => {
    setEditForm(prev => ({
      ...prev,
      allowedPlans: prev.allowedPlans.includes(plan)
        ? prev.allowedPlans.filter(p => p !== plan)
        : [...prev.allowedPlans, plan],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!flag) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Feature flag not found</p>
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
            <Link href="/admin/features">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Flag className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{flag.name}</h1>
            <code className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {flag.key}
            </code>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Switch checked={flag.isEnabled} onCheckedChange={handleToggle} />
            <Badge variant={flag.isEnabled ? "default" : "secondary"}>
              {flag.isEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rollout</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{flag.rolloutPercentage}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Allowed Orgs</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {flag.allowedOrgs.length === 0 ? "All" : flag.allowedOrgs.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked Orgs</CardTitle>
                <Ban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{flag.blockedOrgs.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Flag Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Flag Configuration</CardTitle>
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
                    <Label>Description</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={2}
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
                        <SelectItem value="BOOLEAN">Boolean</SelectItem>
                        <SelectItem value="STRING">String</SelectItem>
                        <SelectItem value="NUMBER">Number</SelectItem>
                        <SelectItem value="JSON">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Rollout Percentage</Label>
                      <span className="text-sm font-medium">{editForm.rolloutPercentage}%</span>
                    </div>
                    <Slider
                      value={[editForm.rolloutPercentage]}
                      onValueChange={([value]) => setEditForm({ ...editForm, rolloutPercentage: value })}
                      max={100}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Allowed Plans</Label>
                    <div className="flex gap-4">
                      {["STARTER", "PROFESSIONAL", "ENTERPRISE"].map((plan) => (
                        <div key={plan} className="flex items-center gap-2">
                          <Checkbox
                            id={plan}
                            checked={editForm.allowedPlans.includes(plan)}
                            onCheckedChange={() => togglePlan(plan)}
                          />
                          <label htmlFor={plan} className="text-sm">{plan}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Key</span>
                    <code className="font-mono bg-muted px-2 py-0.5 rounded">{flag.key}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{flag.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline">{flag.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rollout</span>
                    <span className="font-medium">{flag.rolloutPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Allowed Plans</span>
                    <div className="flex gap-1">
                      {flag.allowedPlans.length === 0 ? (
                        <span className="text-sm">All Plans</span>
                      ) : (
                        flag.allowedPlans.map((plan) => (
                          <Badge key={plan} variant="secondary">{plan}</Badge>
                        ))
                      )}
                    </div>
                  </div>
                  {flag.description && (
                    <div className="pt-2">
                      <span className="text-muted-foreground text-sm">Description</span>
                      <p className="mt-1">{flag.description}</p>
                    </div>
                  )}
                  <div className="flex justify-between pt-2">
                    <span className="text-muted-foreground">Created</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(flag.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting" className="space-y-6">
          {/* Allowed Organizations */}
          <Card>
            <CardHeader>
              <CardTitle>Allowed Organizations</CardTitle>
              <CardDescription>
                {flag.allowedOrgs.length === 0
                  ? "This flag is available to all organizations"
                  : `This flag is restricted to ${flag.allowedOrgs.length} specific organization(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {flag.allowedOrgDetails.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flag.allowedOrgDetails.map((org) => (
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
                  No specific organizations - available to all
                </p>
              )}
            </CardContent>
          </Card>

          {/* Blocked Organizations */}
          <Card>
            <CardHeader>
              <CardTitle>Blocked Organizations</CardTitle>
              <CardDescription>
                Organizations that are explicitly excluded from this feature
              </CardDescription>
            </CardHeader>
            <CardContent>
              {flag.blockedOrgDetails.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flag.blockedOrgDetails.map((org) => (
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
                  No blocked organizations
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Change History</CardTitle>
              <CardDescription>Recent changes to this feature flag</CardDescription>
            </CardHeader>
            <CardContent>
              {flag.auditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flag.auditLogs.map((log) => (
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
