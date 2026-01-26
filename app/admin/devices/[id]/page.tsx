"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
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

  const [device, setDevice] = useState<Device | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editForm, setEditForm] = useState({
    name: "",
    isManaged: false,
  })

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
      toast.error("Failed to fetch device")
    } finally {
      setIsLoading(false)
    }
  }, [deviceId, router])

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
        const data = await response.json()
        throw new Error(data.error || "Failed to trust device")
      }
      toast.success("Device trusted successfully")
      fetchDevice()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to trust device")
    }
  }

  const handleRevoke = async () => {
    if (!confirm("Are you sure you want to revoke trust for this device?")) return

    try {
      const response = await fetch(`/api/admin/devices/${deviceId}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Revoked by admin" }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to revoke device")
      }
      toast.success("Device trust revoked")
      fetchDevice()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to revoke device")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this device? This action cannot be undone.")) return

    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Device deleted successfully")
        router.push("/admin/devices")
      } else {
        throw new Error("Failed to delete device")
      }
    } catch (error) {
      toast.error("Failed to delete device")
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
            Trusted
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "BLOCKED":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Blocked
          </Badge>
        )
      case "REVOKED":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            <ShieldX className="h-3 w-3 mr-1" />
            Revoked
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
            <Link href="/admin/devices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
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
              <Badge variant="outline">{device.type}</Badge>
              {device.isManaged && (
                <Badge variant="secondary">
                  <Settings className="h-3 w-3 mr-1" />
                  MDM Managed
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {device.trustStatus === "PENDING" && (
            <Button onClick={handleTrust}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Approve Trust
            </Button>
          )}
          {device.trustStatus === "TRUSTED" && (
            <Button variant="secondary" onClick={handleRevoke}>
              <ShieldX className="h-4 w-4 mr-2" />
              Revoke Trust
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
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
                <p className="font-medium text-destructive">Device Non-Compliant</p>
                <p className="text-sm text-muted-foreground">
                  This device does not meet the required compliance standards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trust Status</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getTrustStatusBadge(device.trustStatus)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance</CardTitle>
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {device.isCompliant ? (
                  <Badge className="bg-green-500">Compliant</Badge>
                ) : (
                  <Badge variant="destructive">Non-Compliant</Badge>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Active</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {device.lastActiveAt
                    ? new Date(device.lastActiveAt).toLocaleDateString()
                    : "Never"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
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
                <CardTitle>Device Details</CardTitle>
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
                    <Label>Device Name</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Enter device name"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>MDM Managed</Label>
                      <p className="text-sm text-muted-foreground">
                        Mark this device as MDM managed
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
                    <span className="text-muted-foreground">Device ID</span>
                    <span className="font-mono text-sm">{device.deviceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{device.name || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline">{device.type}</Badge>
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
                    <span className="text-muted-foreground">Manufacturer</span>
                    <span className="font-medium">{device.manufacturer || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-medium">{device.model || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">App Version</span>
                    <span className="font-medium">{device.appVersion || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MDM Managed</span>
                    <Badge variant={device.isManaged ? "default" : "secondary"}>
                      {device.isManaged ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {device.mdmEnrolledAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MDM Enrolled</span>
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
              <CardTitle>Last Known Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  IP Address
                </span>
                <span className="font-mono">{device.lastIpAddress || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </span>
                <span className="font-medium">{device.lastLocation || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last Seen
                </span>
                <span className="font-medium">
                  {device.lastActiveAt
                    ? new Date(device.lastActiveAt).toLocaleString()
                    : "Never"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Trust Info */}
          {device.trustStatus === "TRUSTED" && (
            <Card>
              <CardHeader>
                <CardTitle>Trust Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trusted At</span>
                  <span className="font-medium">
                    {device.trustedAt
                      ? new Date(device.trustedAt).toLocaleString()
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved By</span>
                  <span className="font-mono text-sm">
                    {device.trustedBy || "System"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Checks</CardTitle>
              <CardDescription>
                Last checked: {device.lastComplianceCheck
                  ? new Date(device.lastComplianceCheck).toLocaleString()
                  : "Never"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Array.isArray(device.complianceChecks) && device.complianceChecks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Check</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
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
                              Passed
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
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
                  <p className="text-muted-foreground">No compliance checks recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">{device.user.name || "No name"}</p>
                  <p className="text-sm text-muted-foreground">{device.user.email}</p>
                </div>
                <Button variant="outline" size="sm" asChild className="ml-auto">
                  <Link href={`/admin/users/${device.user.id}`}>
                    View User
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {device.user.memberships.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Organizations</CardTitle>
                <CardDescription>Organizations this user belongs to</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Slug</TableHead>
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
                              View
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
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent actions related to this device</CardDescription>
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
                  <p className="text-muted-foreground">No activity recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
