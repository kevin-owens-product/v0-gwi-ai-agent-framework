"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
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
        throw new Error("Failed to fetch device")
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
      toast.error("Failed to fetch device")
    } finally {
      setIsLoading(false)
    }
  }, [deviceId])

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
        toast.success("Device updated successfully")
        setIsEditing(false)
        fetchDevice()
      } else {
        throw new Error("Failed to update device")
      }
    } catch (error) {
      toast.error("Failed to update device")
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
        throw new Error("Failed to trust device")
      }
      toast.success("Device trusted successfully")
      fetchDevice()
    } catch (error) {
      toast.error("Failed to trust device")
    }
  }

  const handleRevoke = async () => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}/revoke`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to revoke device")
      }
      toast.success("Device trust revoked")
      fetchDevice()
    } catch (error) {
      toast.error("Failed to revoke device trust")
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete device")
      }
      toast.success("Device deleted")
      router.push("/admin/identity/devices")
    } catch (error) {
      toast.error("Failed to delete device")
    } finally {
      setIsDeleting(false)
    }
  }

  const getTrustStatusBadge = (status: string) => {
    switch (status) {
      case "TRUSTED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Trusted</Badge>
      case "PENDING":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "REVOKED":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Revoked</Badge>
      case "BLOCKED":
        return <Badge variant="destructive"><ShieldOff className="h-3 w-3 mr-1" />Blocked</Badge>
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
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Device not found</p>
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
              Back
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
            <Badge className="bg-green-500">Compliant</Badge>
          ) : (
            <Badge variant="destructive">Non-Compliant</Badge>
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
                <p className="font-medium text-destructive">Device Non-Compliant</p>
                <p className="text-sm text-muted-foreground">
                  This device does not meet the organization security requirements
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Device Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Device Details</CardTitle>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
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
                      <Label>Device Name</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Enter device name"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Mark as Compliant</p>
                        <p className="text-xs text-muted-foreground">Override compliance status</p>
                      </div>
                      <Switch
                        checked={editForm.isCompliant}
                        onCheckedChange={(checked) => setEditForm({ ...editForm, isCompliant: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">MDM Managed</p>
                        <p className="text-xs text-muted-foreground">Device is managed by MDM</p>
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
                      <span className="text-muted-foreground">Device ID</span>
                      <span className="font-mono text-xs">{device.deviceId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium">{device.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform</span>
                      <span className="font-medium">{device.platform || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">OS Version</span>
                      <span className="font-medium">{device.osVersion || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model</span>
                      <span className="font-medium">{device.model || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manufacturer</span>
                      <span className="font-medium">{device.manufacturer || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MDM Managed</span>
                      <span>{device.isManaged ? "Yes" : "No"}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{device.user.name || "No name"}</p>
                    <p className="text-sm text-muted-foreground">{device.user.email}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-2">Organizations</p>
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
                      View User Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location & Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Last Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Active</p>
                    <p className="font-medium">
                      {device.lastActiveAt
                        ? new Date(device.lastActiveAt).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last IP</p>
                    <p className="font-medium font-mono">{device.lastIpAddress || "Unknown"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Location</p>
                    <p className="font-medium">{device.lastLocation || "Unknown"}</p>
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
              <CardTitle>Trust Management</CardTitle>
              <CardDescription>Manage device trust status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Trust Status</p>
                  <p className="text-sm text-muted-foreground">
                    Current status: {device.trustStatus}
                  </p>
                </div>
                <div className="flex gap-2">
                  {device.trustStatus !== "TRUSTED" && (
                    <Button onClick={handleTrust}>
                      <Shield className="h-4 w-4 mr-2" />
                      Trust Device
                    </Button>
                  )}
                  {device.trustStatus === "TRUSTED" && (
                    <Button variant="destructive" onClick={handleRevoke}>
                      <ShieldOff className="h-4 w-4 mr-2" />
                      Revoke Trust
                    </Button>
                  )}
                </div>
              </div>

              {device.trustedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Trusted on {new Date(device.trustedAt).toLocaleString()}
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Device
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Device security compliance checks</CardDescription>
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
                      <p className="font-medium">Overall Compliance</p>
                      <p className="text-sm text-muted-foreground">
                        {device.isCompliant ? "Device meets all requirements" : "Device does not meet requirements"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={device.isCompliant ? "default" : "destructive"}>
                    {device.isCompliant ? "Compliant" : "Non-Compliant"}
                  </Badge>
                </div>

                {device.lastComplianceCheck && (
                  <p className="text-sm text-muted-foreground">
                    Last checked: {new Date(device.lastComplianceCheck).toLocaleString()}
                  </p>
                )}

                {Array.isArray(device.complianceChecks) && device.complianceChecks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Compliance Checks</p>
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
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent administrative actions on this device</CardDescription>
            </CardHeader>
            <CardContent>
              {device.activityLogs && device.activityLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Date</TableHead>
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
                <p className="text-center text-muted-foreground py-4">No activity logs available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Device</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this device? This action cannot be undone.
              The user will need to re-register this device to use it again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Device"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
