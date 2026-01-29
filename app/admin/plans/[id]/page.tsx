"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Save,
  Loader2,
  Package,
  DollarSign,
  Settings2,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

interface Feature {
  id: string
  key: string
  name: string
  description: string | null
  category: string
  valueType: string
  defaultValue: unknown
}

interface PlanFeature {
  id: string
  featureId: string
  value: unknown
  limit: number | null
  feature: Feature
}

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
  stripePriceIdMonthly: string | null
  stripePriceIdYearly: string | null
  limits: Record<string, number>
  metadata: Record<string, unknown>
  features: PlanFeature[]
  _count: {
    tenantEntitlements: number
  }
}

const LIMIT_FIELDS = [
  { key: "agentRuns", label: "Agent Runs", description: "Monthly agent run limit" },
  { key: "teamSeats", label: "Team Seats", description: "Max team members" },
  { key: "dataSources", label: "Data Sources", description: "Max connected data sources" },
  { key: "apiCallsPerMin", label: "API Rate Limit", description: "API calls per minute" },
  { key: "retentionDays", label: "Data Retention", description: "Data retention in days" },
  { key: "tokensPerMonth", label: "Tokens", description: "Monthly token allowance" },
  { key: "dashboards", label: "Dashboards", description: "Max dashboards" },
  { key: "reports", label: "Reports", description: "Max reports" },
  { key: "workflows", label: "Workflows", description: "Max workflows" },
  { key: "brandTrackings", label: "Brand Trackings", description: "Max brand trackings" },
]

export default function PlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get("edit") === "true"
  const isNewPlan = params.id === "new"

  const [plan, setPlan] = useState<Plan | null>(null)
  const [allFeatures, setAllFeatures] = useState<Feature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(isEditMode || isNewPlan)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    tier: "STARTER",
    isActive: true,
    isPublic: true,
    sortOrder: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    stripePriceIdMonthly: "",
    stripePriceIdYearly: "",
    limits: {} as Record<string, number>,
  })
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, { enabled: boolean; value: unknown; limit: number | null }>>({})

  const fetchPlan = useCallback(async () => {
    if (isNewPlan) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/plans/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch plan")
      const data = await response.json()
      setPlan(data.plan)

      // Initialize form data
      setFormData({
        name: data.plan.name,
        displayName: data.plan.displayName,
        description: data.plan.description || "",
        tier: data.plan.tier,
        isActive: data.plan.isActive,
        isPublic: data.plan.isPublic,
        sortOrder: data.plan.sortOrder,
        monthlyPrice: data.plan.monthlyPrice,
        yearlyPrice: data.plan.yearlyPrice,
        stripePriceIdMonthly: data.plan.stripePriceIdMonthly || "",
        stripePriceIdYearly: data.plan.stripePriceIdYearly || "",
        limits: data.plan.limits || {},
      })

      // Initialize selected features
      const featureMap: Record<string, { enabled: boolean; value: unknown; limit: number | null }> = {}
      for (const pf of data.plan.features) {
        featureMap[pf.featureId] = {
          enabled: true,
          value: pf.value,
          limit: pf.limit,
        }
      }
      setSelectedFeatures(featureMap)
    } catch (error) {
      console.error("Failed to fetch plan:", error)
      setError("Failed to load plan")
    } finally {
      setIsLoading(false)
    }
  }, [params.id, isNewPlan])

  const fetchAllFeatures = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/entitlement-features?limit=100")
      const data = await response.json()
      setAllFeatures(data.features)
    } catch (error) {
      console.error("Failed to fetch features:", error)
    }
  }, [])

  useEffect(() => {
    fetchPlan()
    fetchAllFeatures()
  }, [fetchPlan, fetchAllFeatures])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      // Build features array
      const features = Object.entries(selectedFeatures)
        .filter(([, data]) => data.enabled)
        .map(([featureId, data]) => ({
          featureId,
          value: data.value,
          limit: data.limit,
        }))

      const payload = {
        ...formData,
        stripePriceIdMonthly: formData.stripePriceIdMonthly || null,
        stripePriceIdYearly: formData.stripePriceIdYearly || null,
        features,
      }

      const url = isNewPlan ? "/api/admin/plans" : `/api/admin/plans/${params.id}`
      const method = isNewPlan ? "POST" : "PATCH"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save plan")
      }

      const data = await response.json()

      if (isNewPlan) {
        router.push(`/admin/plans/${data.plan.id}`)
      } else {
        setPlan(data.plan)
        setIsEditing(false)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save plan")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleFeature = (featureId: string, feature: Feature) => {
    setSelectedFeatures(prev => {
      const current = prev[featureId]
      if (current?.enabled) {
        return { ...prev, [featureId]: { ...current, enabled: false } }
      }
      return {
        ...prev,
        [featureId]: {
          enabled: true,
          value: feature.valueType === "BOOLEAN" ? true : feature.defaultValue,
          limit: null,
        },
      }
    })
  }

  const updateFeatureValue = (featureId: string, field: "value" | "limit", newValue: unknown) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [featureId]: { ...prev[featureId], [field]: newValue },
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const groupedFeatures = allFeatures.reduce((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = []
    acc[feature.category].push(feature)
    return acc
  }, {} as Record<string, Feature[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/plans">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNewPlan ? "Create New Plan" : plan?.displayName || "Plan Details"}
            </h1>
            {!isNewPlan && plan && (
              <p className="text-sm text-muted-foreground">
                {plan._count.tenantEntitlements} tenant(s) using this plan
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {!isNewPlan && !isEditing && (
            <Button onClick={() => setIsEditing(true)}>Edit Plan</Button>
          )}
          {isEditing && (
            <>
              {!isNewPlan && (
                <Button variant="outline" onClick={() => {
                  setIsEditing(false)
                  fetchPlan()
                }}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Plan
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">
            <Package className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="h-4 w-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="limits">
            <Settings2 className="h-4 w-4 mr-2" />
            Limits
          </TabsTrigger>
          <TabsTrigger value="features">
            <Sparkles className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
              <CardDescription>Basic information about this plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Internal Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="starter"
                  />
                  <p className="text-xs text-muted-foreground">Unique identifier, lowercase with underscores</p>
                </div>
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Starter Plan"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="A brief description of this plan..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Plan Tier</Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tier: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STARTER">{t("plans.starter")}</SelectItem>
                      <SelectItem value="PROFESSIONAL">{t("plans.professional")}</SelectItem>
                      <SelectItem value="ENTERPRISE">{t("plans.enterprise")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    disabled={!isEditing}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                    disabled={!isEditing}
                  />
                  <Label>Public (visible to customers)</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
              <CardDescription>Set up pricing and Stripe integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Monthly Price (cents)</Label>
                  <Input
                    type="number"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyPrice: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing}
                    placeholder="9900"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.monthlyPrice > 0 ? `$${(formData.monthlyPrice / 100).toFixed(2)}/month` : "Free"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Yearly Price (cents)</Label>
                  <Input
                    type="number"
                    value={formData.yearlyPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, yearlyPrice: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing}
                    placeholder="99900"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.yearlyPrice > 0 ? `$${(formData.yearlyPrice / 100).toFixed(2)}/year` : "Free"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Stripe Monthly Price ID</Label>
                  <Input
                    value={formData.stripePriceIdMonthly}
                    onChange={(e) => setFormData(prev => ({ ...prev, stripePriceIdMonthly: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="price_xxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stripe Yearly Price ID</Label>
                  <Input
                    value={formData.stripePriceIdYearly}
                    onChange={(e) => setFormData(prev => ({ ...prev, stripePriceIdYearly: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="price_xxx"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limits Tab */}
        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
              <CardDescription>Set numeric limits for this plan. Use -1 for unlimited.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {LIMIT_FIELDS.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <Input
                      type="number"
                      value={formData.limits[field.key] ?? ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        limits: { ...prev.limits, [field.key]: parseInt(e.target.value) || 0 },
                      }))}
                      disabled={!isEditing}
                      placeholder="-1 for unlimited"
                    />
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Configuration</CardTitle>
              <CardDescription>Select which features are included in this plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(groupedFeatures).map(([category, features]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    {category.replace("_", " ")}
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Include</TableHead>
                          <TableHead>Feature</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Limit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {features.map((feature) => {
                          const featureData = selectedFeatures[feature.id]
                          const isEnabled = featureData?.enabled ?? false

                          return (
                            <TableRow key={feature.id}>
                              <TableCell>
                                <Checkbox
                                  checked={isEnabled}
                                  onCheckedChange={() => toggleFeature(feature.id, feature)}
                                  disabled={!isEditing}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{feature.name}</p>
                                  <p className="text-xs text-muted-foreground">{feature.key}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{feature.valueType}</Badge>
                              </TableCell>
                              <TableCell>
                                {isEnabled && feature.valueType === "BOOLEAN" ? (
                                  <Switch
                                    checked={featureData?.value === true}
                                    onCheckedChange={(checked) => updateFeatureValue(feature.id, "value", checked)}
                                    disabled={!isEditing}
                                  />
                                ) : isEnabled && feature.valueType === "NUMBER" ? (
                                  <Input
                                    type="number"
                                    value={featureData?.value as number ?? ""}
                                    onChange={(e) => updateFeatureValue(feature.id, "value", parseInt(e.target.value) || 0)}
                                    disabled={!isEditing}
                                    className="w-24"
                                  />
                                ) : isEnabled ? (
                                  <Input
                                    value={String(featureData?.value ?? "")}
                                    onChange={(e) => updateFeatureValue(feature.id, "value", e.target.value)}
                                    disabled={!isEditing}
                                    className="w-32"
                                  />
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {isEnabled && feature.valueType === "NUMBER" ? (
                                  <Input
                                    type="number"
                                    value={featureData?.limit ?? ""}
                                    onChange={(e) => updateFeatureValue(feature.id, "limit", parseInt(e.target.value) || null)}
                                    disabled={!isEditing}
                                    className="w-24"
                                    placeholder="No limit"
                                  />
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}

              {allFeatures.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No features defined yet.{" "}
                  <Link href="/admin/entitlement-features/new" className="text-primary hover:underline">
                    Create a feature
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
