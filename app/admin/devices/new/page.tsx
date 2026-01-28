"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
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
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

interface UserOption {
  id: string
  email: string
  name: string | null
}

// deviceTypes, platforms, and trustStatuses moved inside component to use translations

export default function NewDevicePage() {
  const router = useRouter()
  const t = useTranslations("admin.devices.new")
  const tMain = useTranslations("admin.devices")
  const tCommon = useTranslations("common")
  const { admin: currentAdmin } = useAdmin()
  
  const deviceTypes = [
    { value: "DESKTOP", label: tMain("deviceTypes.desktop"), icon: Monitor },
    { value: "LAPTOP", label: tMain("deviceTypes.laptop"), icon: Laptop },
    { value: "MOBILE", label: tMain("deviceTypes.mobile"), icon: Smartphone },
    { value: "TABLET", label: tMain("deviceTypes.tablet"), icon: Tablet },
    { value: "OTHER", label: tMain("deviceTypes.other"), icon: Smartphone },
  ]

  const platforms = [
    { value: "iOS", label: tMain("platforms.ios") },
    { value: "Android", label: tMain("platforms.android") },
    { value: "Windows", label: tMain("platforms.windows") },
    { value: "macOS", label: tMain("platforms.macos") },
    { value: "Linux", label: tMain("platforms.linux") },
    { value: "ChromeOS", label: tMain("platforms.chromeos") },
    { value: "Other", label: tMain("platforms.other") },
  ]

  const trustStatuses = [
    { value: "PENDING", label: t("trustStatuses.pending") },
    { value: "TRUSTED", label: t("trustStatuses.trusted") },
  ]
  
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
      showErrorToast(t("validation.userRequired"))
      return
    }

    if (!formData.deviceId) {
      showErrorToast(t("validation.deviceIdRequired"))
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
        showSuccessToast(t("messages.deviceRegistered"))
        router.push(`/admin/devices/${data.device.id}`)
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("errors.registerFailed"))
      }
    } catch (error) {
      console.error("Failed to register device:", error)
      showErrorToast(t("errors.registerFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("noPermission")}</p>
        <Link href="/admin/devices">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToDevices")}
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
              {tCommon("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DeviceIcon className="h-6 w-6 text-primary" />
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.userId || !formData.deviceId}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("registering")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("registerDevice")}
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.userDevice.title")}</CardTitle>
            <CardDescription>
              {t("sections.userDevice.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t("form.user")} *</Label>
              <Select
                value={formData.userId}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, userId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectUser")} />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t("form.searchUsers")}
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
                    <div className="p-4 text-center text-muted-foreground">{tCommon("loading")}</div>
                  ) : users.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">{t("noUsersFound")}</div>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {user.name || tMain("noName")}
                          <span className="text-muted-foreground">({user.email})</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("form.deviceId")} *</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.deviceId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deviceId: e.target.value }))}
                  placeholder={t("form.deviceIdPlaceholder")}
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData((prev) => ({ ...prev, deviceId: generateDeviceId() }))}
                >
                  {t("form.generate")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("form.deviceIdHelp")}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("form.deviceName")}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={t("form.deviceNamePlaceholder")}
              />
              <p className="text-xs text-muted-foreground">
                {t("form.deviceNameHelp")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sections.deviceDetails.title")}</CardTitle>
            <CardDescription>
              {t("sections.deviceDetails.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("form.deviceType")} *</Label>
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
                <Label>{t("form.platform")}</Label>
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
                <Label>{t("form.manufacturer")}</Label>
                <Input
                  value={formData.manufacturer}
                  onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                  placeholder={t("form.manufacturerPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("form.model")}</Label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                  placeholder={t("form.modelPlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("form.osVersion")}</Label>
              <Input
                value={formData.osVersion}
                onChange={(e) => setFormData((prev) => ({ ...prev, osVersion: e.target.value }))}
                placeholder={t("form.osVersionPlaceholder")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("sections.trustCompliance.title")}</CardTitle>
            <CardDescription>
              {t("sections.trustCompliance.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t("form.initialTrustStatus")}</Label>
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
                        {t(`trustStatuses.${status.value.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("form.compliant")}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t("form.compliantHelp")}
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
                    <Label>{t("form.mdmManaged")}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t("form.mdmManagedHelp")}
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
              <AlertTitle>{t("alerts.manualRegistration.title")}</AlertTitle>
              <AlertDescription>
                {t("alerts.manualRegistration.description")}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
