"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Loader2,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  User,
  MapPin,
  Globe,
  Activity,
  Settings,
  Trash,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Device {
  id: string
  userId: string
  deviceId: string
  name: string | null
  type: string
  platform: string | null
  osVersion: string | null
  appVersion: string | null
  model: string | null
  manufacturer: string | null
  isCompliant: boolean
  complianceChecks: Array<{
    name: string
    passed: boolean
    message?: string
    checkedAt?: string
  }>
  lastComplianceCheck: string | null
  trustStatus: string
  trustedAt: string | null
  trustedBy: string | null
  lastActiveAt: string | null
  lastIpAddress: string | null
  lastLocation: string | null
  isManaged: boolean
  mdmEnrolledAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    name: string | null
    avatarUrl: string | null
    memberships: Array<{
      organization: {
        id: string
        name: string
        slug: string
      }
    }>
  }
  activityLogs: Array<{
    id: string
    action: string
    details: Record<string, unknown>
    timestamp: string
  }>
}

export default function DeviceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const deviceId = params.id as string
  const t = useTranslations("admin.devices.detail")
  const tMain = useTranslations("admin.devices")
  const tCommon = useTranslations("common")

  const [device, setDevice] = useState<Device | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editForm, setEditForm] = useState({
    name: "",
    isManaged: false,
  })
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchDevice = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`)
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?type=admin")
          return
        }
        throw new Error("Failed to fetch device")
      }
      const data = await response.json()
      setDevice(data.device)
      setEditForm({
        name: data.device.name || "",
        isManaged: data.device.isManaged,
      })
    } catch (error) {
      console.error("Failed to fetch device:", error)
      toast.error(t("errors.fetchFailed"))
    } finally {
      setIsLoading(false)
    }
  }, [deviceId, router, t])

  useEffect(() => {
    fetchDevice()
  }, [fetchDevice])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (response.ok) {
        toast.success(t("messages.deviceUpdated"))
        setIsEditing(false)
        fetchDevice()
      } else {
        throw new Error(t("errors.updateFailed"))
      }
    } catch {
      toast.error(t("errors.updateFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleTrust = async () => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}/trust`, {
        method: "POST",
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.trustFailed"))
      }
      toast.success(t("messages.deviceTrusted"))
      fetchDevice()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.trustFailed"))
    }
  }

  const handleRevokeClick = () => {
    setShowRevokeConfirm(true)
  }

  const handleConfirmRevoke = async () => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: t("revokedByAdmin") }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.revokeFailed"))
      }
      toast.success(t("messages.trustRevoked"))
      fetchDevice()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.revokeFailed"))
    } finally {
      setShowRevokeConfirm(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success(t("messages.deviceDeleted"))
        router.push("/admin/devices")
      } else {
        throw new Error(t("errors.deleteFailed"))
      }
    } catch {
      toast.error(t("errors.deleteFailed"))
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "DESKTOP":
        return <Monitor className="h-6 w-6" />
      case "LAPTOP":
        return <Laptop className="h-6 w-6" />
      case "MOBILE":
        return <Smartphone className="h-6 w-6" />
      case "TABLET":
        return <Tablet className="h-6 w-6" />
      default:
        return <Smartphone className="h-6 w-6" />
    }
  }

  const getTrustStatusBadge = (status: string) => {
    switch (status) {
      case "TRUSTED":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("trustStatuses.trusted")}
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            {t("trustStatuses.pending")}
          </Badge>
        )
      case "BLOCKED":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            {t("trustStatuses.blocked")}
          </Badge>
        )
      case "REVOKED":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            <ShieldX className="h-3 w-3 mr-1" />
            {t("trustStatuses.revoked")}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!device) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("back")}
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">{t("deviceNotFound")}</p>
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
            <Link href="/admin/devices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            {getDeviceIcon(device.type)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {device.name || device.model || device.deviceId.slice(0, 12)}
            </h1>
            <div className="flex items-center gap-2">
              {getTrustStatusBadge(device.trustStatus)}
              <Badge variant="outline">{tMain(`deviceTypes.${device.type.toLowerCase()}`)}</Badge>
              {device.isManaged && (
                <Badge variant="secondary">
                  <Settings className="h-3 w-3 mr-1" />
                  {t("mdmManaged")}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {device.trustStatus === "PENDING" && (
            <Button onClick={handleTrust}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              {t("actions.approveTrust")}
            </Button>
          )}
          {device.trustStatus === "TRUSTED" && (
            <Button variant="secondary" onClick={handleRevokeClick}>
              <ShieldX className="h-4 w-4 mr-2" />
              {t("actions.revokeTrust")}
            </Button>
          )}
          <Button variant="destructive" onClick={handleDeleteClick}>
            <Trash className="h-4 w-4 mr-2" />
            {tCommon("delete")}
          </Button>
        </div>
      </div>

      {/* Non-compliant Warning */}
      {!device.isCompliant && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">{t("compliance.nonCompliantTitle")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("compliance.nonCompliantDescription")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="compliance">{t("tabs.compliance")}</TabsTrigger>
          <TabsTrigger value="user">{t("tabs.user")}</TabsTrigger>
          <TabsTrigger value="activity">{t("tabs.activity")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.trustStatus")}</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getTrustStatusBadge(device.trustStatus)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.compliance")}</CardTitle>
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {device.isCompliant ? (
                  <Badge className="bg-green-500">{t("complianceStatuses.compliant")}</Badge>
                ) : (
                  <Badge variant="destructive">{t("complianceStatuses.nonCompliant")}</Badge>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.lastActive")}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {device.lastActiveAt
                    ? new Date(device.lastActiveAt).toLocaleDateString()
                    : t("never")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.enrolled")}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {new Date(device.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("sections.deviceDetails")}</CardTitle>
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
                    <Label>{t("form.deviceName")}</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder={t("form.deviceNamePlaceholder")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t("form.mdmManaged")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("form.mdmManagedDescription")}
                      </p>
                    </div>
                    <Switch
                      checked={editForm.isManaged}
                      onCheckedChange={(checked) =>
                        setEditForm({ ...editForm, isManaged: checked })
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.deviceId")}</span>
                    <span className="font-mono text-sm">{device.deviceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.name")}</span>
                    <span className="font-medium">{device.name || t("notSet")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.type")}</span>
                    <Badge variant="outline">{tMain(`deviceTypes.${device.type.toLowerCase()}`)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.platform")}</span>
                    <span className="font-medium">{device.platform || t("unknown")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.osVersion")}</span>
                    <span className="font-medium">{device.osVersion || t("unknown")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.manufacturer")}</span>
                    <span className="font-medium">{device.manufacturer || t("unknown")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.model")}</span>
                    <span className="font-medium">{device.model || t("unknown")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.appVersion")}</span>
                    <span className="font-medium">{device.appVersion || t("unknown")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.mdmManaged")}</span>
                    <Badge variant={device.isManaged ? "default" : "secondary"}>
                      {device.isManaged ? tCommon("yes") : tCommon("no")}
                    </Badge>
                  </div>
                  {device.mdmEnrolledAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("fields.mdmEnrolled")}</span>
                      <span className="font-medium">
                        {new Date(device.mdmEnrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Location Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.lastKnownLocation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t("fields.ipAddress")}
                </span>
                <span className="font-mono">{device.lastIpAddress || t("unknown")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t("fields.location")}
                </span>
                <span className="font-medium">{device.lastLocation || t("unknown")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t("fields.lastSeen")}
                </span>
                <span className="font-medium">
                  {device.lastActiveAt
                    ? new Date(device.lastActiveAt).toLocaleString()
                    : t("never")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Trust Info */}
          {device.trustStatus === "TRUSTED" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("sections.trustInformation")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("fields.trustedAt")}</span>
                  <span className="font-medium">
                    {device.trustedAt
                      ? new Date(device.trustedAt).toLocaleString()
                      : t("unknown")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("fields.approvedBy")}</span>
                  <span className="font-mono text-sm">
                    {device.trustedBy || t("system")}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("compliance.checksTitle")}</CardTitle>
              <CardDescription>
                {t("compliance.lastChecked")}: {device.lastComplianceCheck
                  ? new Date(device.lastComplianceCheck).toLocaleString()
                  : t("never")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Array.isArray(device.complianceChecks) && device.complianceChecks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("compliance.columns.check")}</TableHead>
                      <TableHead>{t("compliance.columns.status")}</TableHead>
                      <TableHead>{t("compliance.columns.message")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {device.complianceChecks.map((check, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{check.name}</TableCell>
                        <TableCell>
                          {check.passed ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t("compliance.passed")}
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              {t("compliance.failed")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {check.message || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t("compliance.noChecksRecorded")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("user.deviceOwner")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">{device.user.name || t("user.noName")}</p>
                  <p className="text-sm text-muted-foreground">{device.user.email}</p>
                </div>
                <Button variant="outline" size="sm" asChild className="ml-auto">
                  <Link href={`/admin/users/${device.user.id}`}>
                    {t("user.viewUser")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {device.user.memberships.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("user.organizations")}</CardTitle>
                <CardDescription>{t("user.organizationsDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("user.columns.organization")}</TableHead>
                      <TableHead>{t("user.columns.slug")}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {device.user.memberships.map((membership) => (
                      <TableRow key={membership.organization.id}>
                        <TableCell className="font-medium">
                          {membership.organization.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {membership.organization.slug}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/tenants/${membership.organization.id}`}>
                              {tCommon("viewDetails")}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("activity.title")}</CardTitle>
              <CardDescription>{t("activity.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {device.activityLogs && device.activityLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("activity.columns.action")}</TableHead>
                      <TableHead>{t("activity.columns.details")}</TableHead>
                      <TableHead>{t("activity.columns.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {device.activityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                          {JSON.stringify(log.details)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t("activity.noActivity")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmationDialog
        open={showRevokeConfirm}
        onOpenChange={setShowRevokeConfirm}
        title={t("dialogs.revokeTitle")}
        description={t("dialogs.revokeDescription")}
        confirmText={t("actions.revokeTrust")}
        variant="destructive"
        onConfirm={handleConfirmRevoke}
      />

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t("dialogs.deleteTitle")}
        description={t("dialogs.deleteDescription")}
        confirmText={tCommon("delete")}
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
