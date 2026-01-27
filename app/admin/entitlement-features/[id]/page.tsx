"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
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

const CATEGORY_KEYS = ["CORE", "ANALYTICS", "SECURITY", "INTEGRATION", "AI", "SUPPORT", "COMPLIANCE"] as const

const VALUE_TYPE_KEYS = ["BOOLEAN", "NUMBER", "STRING", "JSON"] as const

export default function FeatureDetailPage() {
  const router = useRouter()
  const params = useParams()
  const t = useTranslations("admin.entitlementFeatures")
  const tCommon = useTranslations("common")

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
      toast.error(t("errors.fetchFailed"))
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
          toast.error(t("errors.invalidJson"))
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

      toast.success(t("messages.featureUpdated"))
      fetchFeature()
    } catch (error) {
      toast.error(t("errors.updateFailed"))
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

      toast.success(t("messages.featureDeleted"))
      router.push("/admin/entitlement-features")
    } catch (error) {
      toast.error(t("errors.deleteFailed"))
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }, [feature, router, t])

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

      toast.success(feature.isActive ? t("messages.featureDisabled") : t("messages.featureEnabled"))
      fetchFeature()
    } catch (error) {
      toast.error(t("errors.statusUpdateFailed"))
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
    return <Badge className={colors[category] || ""}>{t(`categories.${category.toLowerCase()}`)}</Badge>
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "ENTERPRISE":
        return <Badge className="bg-purple-500">{t("plans.enterprise")}</Badge>
      case "PROFESSIONAL":
        return <Badge className="bg-blue-500">{t("plans.professional")}</Badge>
      case "STARTER":
        return <Badge variant="secondary">{t("plans.starter")}</Badge>
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
        <p className="text-muted-foreground">{t("featureNotFound")}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/entitlement-features")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToFeatures")}
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
            {tCommon("back")}
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
            <Badge className="bg-green-500">{tCommon("active")}</Badge>
          ) : (
            <Badge variant="secondary">{tCommon("inactive")}</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details / Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.featureConfiguration")}</CardTitle>
              <CardDescription>
                {t("detail.featureConfigurationDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("form.featureName")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">{t("form.featureKey")}</Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="font-mono"
                    placeholder={t("form.featureKeyPlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{tCommon("description")}</Label>
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
                  <Label>{t("columns.category")}</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_KEYS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {t(`categories.${cat.toLowerCase()}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("form.valueType")}</Label>
                  <Select
                    value={formData.valueType}
                    onValueChange={(value) => setFormData({ ...formData, valueType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VALUE_TYPE_KEYS.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`valueTypes.${type.toLowerCase()}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultValue">{t("form.defaultValue")}</Label>
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
                      <SelectItem value="true">{t("form.trueEnabled")}</SelectItem>
                      <SelectItem value="false">{t("form.falseDisabled")}</SelectItem>
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
                  <Label htmlFor="isActive">{t("form.featureActive")}</Label>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? t("form.saving") : t("form.saveChanges")}
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
                  {t("detail.tenantOverrides")} ({feature._count?.entitlements || 0})
                </CardTitle>
                <CardDescription>
                  {t("detail.tenantOverridesDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("detail.organization")}</TableHead>
                      <TableHead>{t("detail.plan")}</TableHead>
                      <TableHead>{tCommon("status")}</TableHead>
                      <TableHead>{t("detail.expires")}</TableHead>
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
                            <Badge className="bg-green-500">{tCommon("enabled")}</Badge>
                          ) : (
                            <Badge variant="secondary">{tCommon("disabled")}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {entitlement.expiresAt ? (
                            <span className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3" />
                              {new Date(entitlement.expiresAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{t("detail.never")}</span>
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
                <CardTitle>{t("detail.metadata")}</CardTitle>
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
              <CardTitle>{t("detail.quickActions")}</CardTitle>
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
                    {t("actions.disableFeature")}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t("actions.enableFeature")}
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
                {deleting ? t("form.deleting") : t("actions.deleteFeature")}
              </Button>
            </CardContent>
          </Card>

          <ConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title={t("dialogs.deleteFeature")}
            description={t("dialogs.deleteFeatureDetailDescription")}
            confirmText={deleting ? t("form.deleting") : tCommon("delete")}
            onConfirm={handleDeleteConfirm}
            variant="destructive"
          />

          <Card>
            <CardHeader>
              <CardTitle>{t("detail.statistics")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t("detail.tenantOverrides")}
                </span>
                <Badge variant="outline">{feature._count?.entitlements || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("form.valueType")}</span>
                <Badge variant="secondary">{t(`valueTypes.${feature.valueType.toLowerCase()}`)}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("detail.featureInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-muted-foreground">{t("detail.created")}</Label>
                <p>{new Date(feature.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("detail.lastUpdated")}</Label>
                <p>{new Date(feature.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
