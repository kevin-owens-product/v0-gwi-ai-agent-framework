"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  ArrowLeft,
  Save,
  Loader2,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Search,
  User,
  Info,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"
import { toast } from "sonner"

interface UserOption {
  id: string
  email: string
  name: string | null
}

const deviceTypes = [
  { value: "DESKTOP", label: "Desktop", icon: Monitor },
  { value: "LAPTOP", label: "Laptop", icon: Laptop },
  { value: "MOBILE", label: "Mobile", icon: Smartphone },
  { value: "TABLET", label: "Tablet", icon: Tablet },
  { value: "OTHER", label: "Other", icon: Smartphone },
]

const platforms = [
  { value: "iOS", label: "iOS" },
  { value: "Android", label: "Android" },
  { value: "Windows", label: "Windows" },
  { value: "macOS", label: "macOS" },
  { value: "Linux", label: "Linux" },
  { value: "ChromeOS", label: "ChromeOS" },
  { value: "Other", label: "Other" },
]

const trustStatuses = [
  { value: "PENDING", label: "Pending - Requires approval" },
  { value: "TRUSTED", label: "Trusted - Immediately trusted" },
]

export default function NewDevicePage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)
  const [users, setUsers] = useState<UserOption[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(false)

  const [formData, setFormData] = useState({
    userId: "",
    deviceId: "",
    name: "",
    type: "LAPTOP",
    platform: "macOS",
    osVersion: "",
    model: "",
    manufacturer: "",
    trustStatus: "PENDING",
    isCompliant: true,
    isManaged: false,
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.role === "ADMIN"

  useEffect(() => {
    searchUsers("")
  }, [])

  const searchUsers = async (query: string) => {
    setLoadingUsers(true)
    try {
      const response = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const generateDeviceId = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleCreate = async () => {
    if (!formData.userId) {
      toast.error("User is required")
      return
    }

    if (!formData.deviceId) {
      toast.error("Device ID is required")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formData.userId,
          deviceId: formData.deviceId,
          name: formData.name || null,
          type: formData.type,
          platform: formData.platform || null,
          osVersion: formData.osVersion || null,
          model: formData.model || null,
          manufacturer: formData.manufacturer || null,
          trustStatus: formData.trustStatus,
          isCompliant: formData.isCompliant,
          isManaged: formData.isManaged,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("Device registered successfully")
        router.push(`/admin/devices/${data.device.id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to register device")
      }
    } catch (error) {
      console.error("Failed to register device:", error)
      toast.error("Failed to register device")
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">You don&apos;t have permission to register devices</p>
        <Link href="/admin/devices">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Device Trust
          </Button>
        </Link>
      </div>
    )
  }

  const DeviceIcon = deviceTypes.find((t) => t.value === formData.type)?.icon || Smartphone

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/devices">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DeviceIcon className="h-6 w-6 text-primary" />
              Register New Device
            </h1>
            <p className="text-sm text-muted-foreground">
              Manually register a device for a user
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.userId || !formData.deviceId}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Registering...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Register Device
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User & Device</CardTitle>
            <CardDescription>
              Select the user and provide device identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>User *</Label>
              <Select
                value={formData.userId}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, userId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value)
                          searchUsers(e.target.value)
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  {loadingUsers ? (
                    <div className="p-4 text-center text-muted-foreground">Loading...</div>
                  ) : users.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No users found</div>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {user.name || "No name"}
                          <span className="text-muted-foreground">({user.email})</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Device ID *</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.deviceId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deviceId: e.target.value }))}
                  placeholder="unique-device-identifier"
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData((prev) => ({ ...prev, deviceId: generateDeviceId() }))}
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Unique identifier for the device (e.g., hardware ID, UUID)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Device Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="John's MacBook Pro"
              />
              <p className="text-xs text-muted-foreground">
                A friendly name to identify this device
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Details</CardTitle>
            <CardDescription>
              Provide information about the device hardware and software
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Device Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map((type) => {
                      const TypeIcon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, platform: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Manufacturer</Label>
                <Input
                  value={formData.manufacturer}
                  onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                  placeholder="Apple"
                />
              </div>

              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                  placeholder="MacBook Pro 16"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>OS Version</Label>
              <Input
                value={formData.osVersion}
                onChange={(e) => setFormData((prev) => ({ ...prev, osVersion: e.target.value }))}
                placeholder="14.0"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Trust & Compliance Settings</CardTitle>
            <CardDescription>
              Configure the initial trust status and compliance state of this device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Initial Trust Status</Label>
                <Select
                  value={formData.trustStatus}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, trustStatus: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {trustStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compliant</Label>
                    <p className="text-xs text-muted-foreground">
                      Mark device as meeting compliance requirements
                    </p>
                  </div>
                  <Switch
                    checked={formData.isCompliant}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isCompliant: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>MDM Managed</Label>
                    <p className="text-xs text-muted-foreground">
                      Device is enrolled in MDM
                    </p>
                  </div>
                  <Switch
                    checked={formData.isManaged}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isManaged: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Manual Device Registration</AlertTitle>
              <AlertDescription>
                Devices are typically registered automatically when users sign in from new devices.
                Manual registration is useful for pre-approving devices or adding devices that
                cannot self-register.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
