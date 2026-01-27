"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Sparkles,
  Save,
  Trash2,
  CheckCircle,
  XCircle,
  Building,
  Clock,
  Users,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

interface TenantEntitlement {
  id: string
  orgId: string
  featureId: string
  isEnabled: boolean
  customLimits: Record<string, unknown> | null
  expiresAt: string | null
  grantedBy: string
  reason: string | null
  createdAt: string
  updatedAt: string
  organization: {
    id: string
    name: string
    slug: string
    planTier: string
  }
}

interface Feature {
  id: string
  name: string
  key: string
  description: string | null
  category: string
  valueType: string
  defaultValue: unknown
  isActive: boolean
  metadata: Record<string, unknown>
  entitlements: TenantEntitlement[]
  _count: { entitlements: number }
  createdAt: string
  updatedAt: string
}

const CATEGORIES = [
  { value: "CORE", label: "Core Features" },
  { value: "ANALYTICS", label: "Analytics" },
  { value: "SECURITY", label: "Security" },
  { value: "INTEGRATION", label: "Integrations" },
  { value: "AI", label: "AI Features" },
  { value: "SUPPORT", label: "Support" },
  { value: "COMPLIANCE", label: "Compliance" },
]

const VALUE_TYPES = [
  { value: "BOOLEAN", label: "Boolean (On/Off)" },
  { value: "NUMBER", label: "Number (Limit)" },
  { value: "STRING", label: "String (Value)" },
  { value: "JSON", label: "JSON (Complex)" },
]

export default function FeatureDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [feature, setFeature] = useState<Feature | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    category: "",
    valueType: "",
    defaultValue: "",
    isActive: true,
  })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchFeature()
    }
  }, [params.id])

  const fetchFeature = async () => {
    try {
      const response = await fetch(`/api/admin/entitlement-features/${params.id}`)
      if (!response.ok) {
        throw new Error("Feature not found")
      }
      const data = await response.json()
      setFeature(data.feature)
      setFormData({
        name: data.feature.name,
        key: data.feature.key,
        description: data.feature.description || "",
        category: data.feature.category,
        valueType: data.feature.valueType,
        defaultValue: typeof data.feature.defaultValue === 'object'
          ? JSON.stringify(data.feature.defaultValue, null, 2)
          : String(data.feature.defaultValue),
        isActive: data.feature.isActive,
      })
    } catch (error) {
      console.error("Failed to fetch feature:", error)
      toast.error("Failed to fetch feature")
      router.push("/admin/entitlement-features")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!feature) return

    try {
      setSaving(true)

      // Parse the default value based on type
      let parsedDefaultValue: unknown = formData.defaultValue
      if (formData.valueType === 'BOOLEAN') {
        parsedDefaultValue = formData.defaultValue === 'true'
      } else if (formData.valueType === 'NUMBER') {
        parsedDefaultValue = parseFloat(formData.defaultValue) || 0
      } else if (formData.valueType === 'JSON') {
        try {
          parsedDefaultValue = JSON.parse(formData.defaultValue)
        } catch {
          toast.error("Invalid JSON format")
          return
        }
      }

      const response = await fetch(`/api/admin/entitlement-features/${feature.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          defaultValue: parsedDefaultValue,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update feature")
      }

      toast.success("Feature updated successfully")
      fetchFeature()
    } catch (error) {
      toast.error("Failed to update feature")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = useCallback(async () => {
    if (!feature) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/entitlement-features/${feature.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete feature")
      }

      toast.success("Feature deleted")
      router.push("/admin/entitlement-features")
    } catch (error) {
      toast.error("Failed to delete feature")
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }, [feature, router])

  const handleToggleActive = async () => {
    if (!feature) return

    try {
      const response = await fetch(`/api/admin/entitlement-features/${feature.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !feature.isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update feature status")
      }

      toast.success(`Feature ${feature.isActive ? "disabled" : "enabled"} successfully`)
      fetchFeature()
    } catch (error) {
      toast.error("Failed to update feature status")
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      CORE: "bg-blue-500",
      ANALYTICS: "bg-purple-500",
      SECURITY: "bg-red-500",
      INTEGRATION: "bg-green-500",
      AI: "bg-yellow-500",
      SUPPORT: "bg-cyan-500",
      COMPLIANCE: "bg-orange-500",
    }
    return <Badge className={colors[category] || ""}>{category}</Badge>
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "ENTERPRISE":
        return <Badge className="bg-purple-500">Enterprise</Badge>
      case "PROFESSIONAL":
        return <Badge className="bg-blue-500">Professional</Badge>
      case "STARTER":
        return <Badge variant="secondary">Starter</Badge>
      default:
        return <Badge variant="outline">{plan}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!feature) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Feature not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/entitlement-features")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Features
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/entitlement-features")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              {feature.name}
            </h1>
            <p className="text-sm text-muted-foreground font-mono">{feature.key}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getCategoryBadge(feature.category)}
          {feature.isActive ? (
            <Badge className="bg-green-500">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details / Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Configuration</CardTitle>
              <CardDescription>
                Configure the feature settings and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Feature Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">Feature Key</Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="font-mono"
                    placeholder="feature_key_name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value Type</Label>
                  <Select
                    value={formData.valueType}
                    onValueChange={(value) => setFormData({ ...formData, valueType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VALUE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultValue">Default Value</Label>
                {formData.valueType === 'JSON' ? (
                  <Textarea
                    id="defaultValue"
                    value={formData.defaultValue}
                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                    rows={4}
                    className="font-mono text-sm"
                    placeholder='{"key": "value"}'
                  />
                ) : formData.valueType === 'BOOLEAN' ? (
                  <Select
                    value={formData.defaultValue}
                    onValueChange={(value) => setFormData({ ...formData, defaultValue: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True (Enabled)</SelectItem>
                      <SelectItem value="false">False (Disabled)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="defaultValue"
                    type={formData.valueType === 'NUMBER' ? 'number' : 'text'}
                    value={formData.defaultValue}
                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                  />
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Feature Active</Label>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Entitlements */}
          {feature.entitlements && feature.entitlements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Tenant Overrides ({feature._count?.entitlements || 0})
                </CardTitle>
                <CardDescription>
                  Organizations with custom entitlements for this feature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feature.entitlements.map((entitlement) => (
                      <TableRow key={entitlement.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{entitlement.organization.name}</p>
                            <p className="text-xs text-muted-foreground">{entitlement.organization.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getPlanBadge(entitlement.organization.planTier)}</TableCell>
                        <TableCell>
                          {entitlement.isEnabled ? (
                            <Badge className="bg-green-500">Enabled</Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {entitlement.expiresAt ? (
                            <span className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              {new Date(entitlement.expiresAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {feature.metadata && Object.keys(feature.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto">
                  {JSON.stringify(feature.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleToggleActive}
              >
                {feature.isActive ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Disable Feature
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Enable Feature
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive"
                onClick={handleDeleteClick}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Deleting..." : "Delete Feature"}
              </Button>
            </CardContent>
          </Card>

          <ConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title="Delete Feature"
            description="Are you sure you want to delete this feature? This will also remove all associated entitlements. This action cannot be undone."
            confirmText={deleting ? "Deleting..." : "Delete"}
            onConfirm={handleDeleteConfirm}
            variant="destructive"
          />

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Tenant Overrides
                </span>
                <Badge variant="outline">{feature._count?.entitlements || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Value Type</span>
                <Badge variant="secondary">{feature.valueType}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p>{new Date(feature.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p>{new Date(feature.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
