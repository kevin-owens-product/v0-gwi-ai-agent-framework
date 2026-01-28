"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Loader2,
  Shield,
  ShieldOff,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  User,
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Save,
  Trash2,
  Globe,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Membership {
  id: string
  role: string
  organization: {
    id: string
    name: string
    slug: string
  }
}

interface AuditLog {
  id: string
  action: string
  details: Record<string, unknown>
  timestamp: string
  adminId: string | null
}

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
  complianceChecks: unknown[]
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
    memberships: Membership[]
  }
  activityLogs: AuditLog[]
}

const deviceTypeIcons: Record<string, React.ReactNode> = {
  PHONE: <Smartphone className="h-6 w-6" />,
  TABLET: <Tablet className="h-6 w-6" />,
  LAPTOP: <Laptop className="h-6 w-6" />,
  DESKTOP: <Monitor className="h-6 w-6" />,
}

export default function DeviceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const deviceId = params.id as string
  const t = useTranslations("admin.identity.devices")
  const tCommon = useTranslations("common")

  const [device, setDevice] = useState<Device | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", isCompliant: true, isManaged: false })
  const [isSaving, setIsSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchDevice = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`)
      if (!response.ok) {
        throw new Error(t("errors.fetchFailed"))
      }
      const data = await response.json()
      setDevice(data.device)
      setEditForm({
        name: data.device.name || "",
        isCompliant: data.device.isCompliant,
        isManaged: data.device.isManaged,
      })
    } catch (error) {
      console.error("Failed to fetch device:", error)
      toast.error(t("errors.fetchFailed"))
    } finally {
      setIsLoading(false)
    }
  }, [deviceId, t])

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
    } catch (error) {
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
        throw new Error(t("errors.trustFailed"))
      }
      toast.success(t("messages.deviceTrusted"))
      fetchDevice()
    } catch (error) {
      toast.error(t("errors.trustFailed"))
    }
  }

  const handleRevoke = async () => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}/revoke`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error(t("errors.revokeFailed"))
      }
      toast.success(t("messages.trustRevoked"))
      fetchDevice()
    } catch (error) {
      toast.error(t("errors.revokeFailed"))
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(t("errors.deleteFailed"))
      }
      toast.success(t("messages.deviceDeleted"))
      router.push("/admin/identity/devices")
    } catch (error) {
      toast.error(t("errors.deleteFailed"))
    } finally {
      setIsDeleting(false)
    }
  }

  const getTrustStatusBadge = (status: string) => {
    switch (status) {
      case "TRUSTED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t("statuses.trusted")}</Badge>
      case "PENDING":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{t("statuses.pending")}</Badge>
      case "REVOKED":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t("statuses.revoked")}</Badge>
      case "BLOCKED":
        return <Badge variant="destructive"><ShieldOff className="h-3 w-3 mr-1" />{t("statuses.blocked")}</Badge>
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
            <Link href="/admin/identity/devices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            {deviceTypeIcons[device.type] || <Smartphone className="h-6 w-6" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{device.name || device.deviceId}</h1>
            <p className="text-muted-foreground">
              {device.manufacturer} {device.model} - {device.platform} {device.osVersion}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getTrustStatusBadge(device.trustStatus)}
          {device.isCompliant ? (
            <Badge className="bg-green-500">{t("compliance.compliant")}</Badge>
          ) : (
            <Badge variant="destructive">{t("compliance.nonCompliant")}</Badge>
          )}
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
          <TabsTrigger value="security">{t("tabs.security")}</TabsTrigger>
          <TabsTrigger value="activity">{t("tabs.activity")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Device Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("detail.deviceDetails")}</CardTitle>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        {tCommon("cancel")}
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("form.deviceName")}</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder={t("form.deviceNamePlaceholder")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t("form.markAsCompliant")}</p>
                        <p className="text-xs text-muted-foreground">{t("form.markAsCompliantDescription")}</p>
                      </div>
                      <Switch
                        checked={editForm.isCompliant}
                        onCheckedChange={(checked) => setEditForm({ ...editForm, isCompliant: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t("form.mdmManaged")}</p>
                        <p className="text-xs text-muted-foreground">{t("form.mdmManagedDescription")}</p>
                      </div>
                      <Switch
                        checked={editForm.isManaged}
                        onCheckedChange={(checked) => setEditForm({ ...editForm, isManaged: checked })}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("detail.deviceId")}</span>
                      <span className="font-mono text-xs">{device.deviceId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("detail.type")}</span>
                      <span className="font-medium">{device.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("detail.platform")}</span>
                      <span className="font-medium">{device.platform || t("unknown")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("detail.osVersion")}</span>
                      <span className="font-medium">{device.osVersion || t("unknown")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("detail.model")}</span>
                      <span className="font-medium">{device.model || t("unknown")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("detail.manufacturer")}</span>
                      <span className="font-medium">{device.manufacturer || t("unknown")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("detail.mdmManaged")}</span>
                      <span>{device.isManaged ? tCommon("yes") : tCommon("no")}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.userInformation")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{device.user.name || t("detail.noName")}</p>
                    <p className="text-sm text-muted-foreground">{device.user.email}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2">{t("detail.organizations")}</p>
                  <div className="space-y-2">
                    {device.user.memberships.map((membership) => (
                      <div key={membership.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{membership.organization.name}</span>
                        </div>
                        <Badge variant="outline">{membership.role}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/admin/users/${device.user.id}`}>
                      {t("actions.viewUserProfile")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location & Activity */}
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.lastActivity")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("detail.lastActive")}</p>
                    <p className="font-medium">
                      {device.lastActiveAt
                        ? new Date(device.lastActiveAt).toLocaleString()
                        : t("never")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("detail.lastIp")}</p>
                    <p className="font-medium font-mono">{device.lastIpAddress || t("unknown")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("detail.lastLocation")}</p>
                    <p className="font-medium">{device.lastLocation || t("unknown")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Trust Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("security.trustManagement")}</CardTitle>
              <CardDescription>{t("security.trustManagementDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">{t("security.trustStatus")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("security.currentStatus", { status: device.trustStatus })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {device.trustStatus !== "TRUSTED" && (
                    <Button onClick={handleTrust}>
                      <Shield className="h-4 w-4 mr-2" />
                      {t("actions.trustDevice")}
                    </Button>
                  )}
                  {device.trustStatus === "TRUSTED" && (
                    <Button variant="destructive" onClick={handleRevoke}>
                      <ShieldOff className="h-4 w-4 mr-2" />
                      {t("actions.revokeTrust")}
                    </Button>
                  )}
                </div>
              </div>

              {device.trustedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {t("security.trustedOn", { date: new Date(device.trustedAt).toLocaleString() })}
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("actions.deleteDevice")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t("compliance.title")}</CardTitle>
              <CardDescription>{t("compliance.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {device.isCompliant ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{t("compliance.overallCompliance")}</p>
                      <p className="text-sm text-muted-foreground">
                        {device.isCompliant ? t("compliance.meetsRequirements") : t("compliance.doesNotMeetRequirements")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={device.isCompliant ? "default" : "destructive"}>
                    {device.isCompliant ? t("compliance.compliant") : t("compliance.nonCompliant")}
                  </Badge>
                </div>

                {device.lastComplianceCheck && (
                  <p className="text-sm text-muted-foreground">
                    {t("compliance.lastChecked", { date: new Date(device.lastComplianceCheck).toLocaleString() })}
                  </p>
                )}

                {Array.isArray(device.complianceChecks) && device.complianceChecks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{t("compliance.complianceChecks")}</p>
                    {(device.complianceChecks as Array<{ name: string; passed: boolean }>).map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded border">
                        <span>{check.name}</span>
                        {check.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
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
                      <TableHead>{t("activity.action")}</TableHead>
                      <TableHead>{t("activity.details")}</TableHead>
                      <TableHead>{t("activity.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {device.activityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline">{log.action}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
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
                <p className="text-center text-muted-foreground py-4">{t("activity.noLogs")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogs.deleteDevice")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.deleteDeviceDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {tCommon("deleting")}
                </>
              ) : (
                t("actions.deleteDevice")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
