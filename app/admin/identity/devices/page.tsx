"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"
import {
  Search,
  Shield,
  ShieldOff,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Ban,
} from "lucide-react"
import { toast } from "sonner"

interface Device {
  id: string
  userId: string
  deviceId: string
  name: string | null
  type: string
  platform: string | null
  osVersion: string | null
  model: string | null
  manufacturer: string | null
  isCompliant: boolean
  trustStatus: string
  trustedAt: string | null
  lastActiveAt: string | null
  lastIpAddress: string | null
  lastLocation: string | null
  createdAt: string
  user: {
    id: string
    email: string
    name: string | null
  }
}

interface Stats {
  total: number
  trusted: number
  pending: number
  nonCompliant: number
}

const deviceTypeIcons: Record<string, React.ReactNode> = {
  PHONE: <Smartphone className="h-4 w-4" />,
  TABLET: <Tablet className="h-4 w-4" />,
  LAPTOP: <Laptop className="h-4 w-4" />,
  DESKTOP: <Monitor className="h-4 w-4" />,
}

const platformColors: Record<string, string> = {
  MACOS: "bg-gray-500",
  WINDOWS: "bg-blue-500",
  IOS: "bg-slate-600",
  ANDROID: "bg-green-500",
  LINUX: "bg-orange-500",
}

const DEVICE_TYPE_KEYS = ["PHONE", "TABLET", "LAPTOP", "DESKTOP"] as const
const TRUST_STATUS_KEYS = ["TRUSTED", "PENDING", "REVOKED", "BLOCKED"] as const
const PLATFORM_KEYS = ["MACOS", "WINDOWS", "IOS", "ANDROID", "LINUX"] as const

export default function DevicesPage() {
  const t = useTranslations("admin.devices")
  const tCommon = useTranslations("common")

  const [devices, setDevices] = useState<Device[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchDevices = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(platformFilter !== "all" && { platform: platformFilter }),
      })
      const response = await fetch(`/api/admin/devices?${params}`)
      if (!response.ok) {
        throw new Error(t("errors.fetchFailed"))
      }
      const data = await response.json()
      setDevices(data.devices || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotal(data.pagination?.total || 0)
      setStats(data.stats || null)
    } catch (error) {
      console.error("Failed to fetch devices:", error)
      toast.error(t("errors.fetchFailed"))
    } finally {
      setIsLoading(false)
    }
  }, [page, search, typeFilter, statusFilter, platformFilter, t])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchDevices()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchDevices])

  const handleTrust = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}/trust`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error(t("errors.trustFailed"))
      }
      toast.success(t("messages.deviceTrusted"))
      fetchDevices()
    } catch (error) {
      toast.error(t("errors.trustFailed"))
    }
  }

  const handleRevoke = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}/revoke`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error(t("errors.revokeFailed"))
      }
      toast.success(t("messages.trustRevoked"))
      fetchDevices()
    } catch (error) {
      toast.error(t("errors.revokeFailed"))
    }
  }

  const handleBlock = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}/block`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error(t("errors.blockFailed"))
      }
      toast.success(t("messages.deviceBlocked"))
      fetchDevices()
    } catch (error) {
      toast.error(t("errors.blockFailed"))
    }
  }

  const handleBulkRevoke = async (deviceIds: string[]) => {
    try {
      const promises = deviceIds.map(id =>
        fetch(`/api/admin/devices/${id}/revoke`, { method: "POST" })
      )
      await Promise.all(promises)
      toast.success(t("messages.bulkRevoked", { count: deviceIds.length }))
      fetchDevices()
    } catch (error) {
      toast.error(t("errors.bulkRevokeFailed"))
    }
  }

  const handleBulkBlock = async (deviceIds: string[]) => {
    try {
      const promises = deviceIds.map(id =>
        fetch(`/api/admin/devices/${id}/block`, { method: "POST" })
      )
      await Promise.all(promises)
      toast.success(t("messages.bulkBlocked", { count: deviceIds.length }))
      fetchDevices()
    } catch (error) {
      toast.error(t("errors.bulkBlockFailed"))
    }
  }

  const getTrustStatusBadge = (status: string) => {
    switch (status) {
      case "TRUSTED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t("trustStatuses.trusted")}</Badge>
      case "PENDING":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{t("trustStatuses.pending")}</Badge>
      case "REVOKED":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t("trustStatuses.revoked")}</Badge>
      case "BLOCKED":
        return <Badge variant="destructive"><ShieldOff className="h-3 w-3 mr-1" />{t("trustStatuses.blocked")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Define columns for AdminDataTable
  const columns: Column<Device>[] = [
    {
      id: "device",
      header: t("columns.device"),
      cell: (device) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            {deviceTypeIcons[device.type] || <Smartphone className="h-4 w-4" />}
          </div>
          <div>
            <p className="font-medium">{device.name || device.deviceId}</p>
            <p className="text-xs text-muted-foreground">
              {device.model || device.manufacturer || t("unknownModel")}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "user",
      header: t("columns.user"),
      cell: (device) => (
        <div>
          <p className="font-medium">{device.user?.name || t("noName")}</p>
          <p className="text-xs text-muted-foreground">{device.user?.email}</p>
        </div>
      ),
    },
    {
      id: "platform",
      header: t("columns.platform"),
      cell: (device) => (
        <div className="flex items-center gap-2">
          <Badge className={platformColors[device.platform || ""] || "bg-gray-500"}>
            {device.platform ? t(`platforms.${device.platform.toLowerCase()}`) : t("unknown")}
          </Badge>
          {device.osVersion && (
            <span className="text-xs text-muted-foreground">{device.osVersion}</span>
          )}
        </div>
      ),
    },
    {
      id: "compliance",
      header: t("columns.compliance"),
      cell: (device) =>
        device.isCompliant ? (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("complianceStatuses.compliant")}
          </Badge>
        ) : (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {t("complianceStatuses.nonCompliant")}
          </Badge>
        ),
    },
    {
      id: "trustStatus",
      header: t("columns.trustStatus"),
      cell: (device) => getTrustStatusBadge(device.trustStatus),
    },
    {
      id: "lastActive",
      header: t("columns.lastActive"),
      cell: (device) =>
        device.lastActiveAt ? (
          <div className="text-muted-foreground">
            <p className="text-sm">{new Date(device.lastActiveAt).toLocaleDateString()}</p>
            <p className="text-xs">{device.lastLocation || device.lastIpAddress || ""}</p>
          </div>
        ) : (
          <span className="text-muted-foreground">{t("never")}</span>
        ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<Device>[] = [
    {
      label: t("actions.trustDevice"),
      icon: <Shield className="h-4 w-4" />,
      onClick: (device) => handleTrust(device.id),
      hidden: (device) => device.trustStatus !== "PENDING" && device.trustStatus !== "REVOKED",
    },
    {
      label: t("actions.revokeTrust"),
      icon: <ShieldOff className="h-4 w-4" />,
      onClick: (device) => handleRevoke(device.id),
      variant: "destructive",
      hidden: (device) => device.trustStatus !== "TRUSTED",
      separator: true,
    },
    {
      label: t("actions.blockDevice"),
      icon: <Ban className="h-4 w-4" />,
      onClick: (device) => handleBlock(device.id),
      variant: "destructive",
      hidden: (device) => device.trustStatus === "BLOCKED",
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.bulkRevokeTrust"),
      icon: <ShieldOff className="h-4 w-4" />,
      onClick: handleBulkRevoke,
      variant: "destructive",
      confirmTitle: t("dialogs.revokeMultiple"),
      confirmDescription: t("dialogs.revokeMultipleDescription"),
    },
    {
      label: t("actions.bulkBlockDevices"),
      icon: <Ban className="h-4 w-4" />,
      onClick: handleBulkBlock,
      variant: "destructive",
      confirmTitle: t("dialogs.blockMultiple"),
      confirmDescription: t("dialogs.blockMultipleDescription"),
      separator: true,
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("title")}
              </CardTitle>
              <CardDescription>
                {t("description", { total })}
              </CardDescription>
            </div>
            <Button onClick={fetchDevices} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              {tCommon("refresh")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">{t("stats.totalDevices")}</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold text-green-500">{stats.trusted}</div>
                <p className="text-xs text-muted-foreground">{t("trustStatuses.trusted")}</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">{t("stats.pendingApproval")}</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold text-red-500">{stats.nonCompliant}</div>
                <p className="text-xs text-muted-foreground">{t("complianceStatuses.nonCompliant")}</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.deviceType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                {DEVICE_TYPE_KEYS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`deviceTypes.${type.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("columns.trustStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                {TRUST_STATUS_KEYS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`trustStatuses.${status.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("columns.platform")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allPlatforms")}</SelectItem>
                {PLATFORM_KEYS.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {t(`platforms.${platform.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <AdminDataTable
            data={devices}
            columns={columns}
            getRowId={(device) => device.id}
            isLoading={isLoading}
            emptyMessage={t("noDevices")}
            viewHref={(device) => `/admin/identity/devices/${device.id}`}
            rowActions={rowActions}
            bulkActions={bulkActions}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            enableSelection={true}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>
    </div>
  )
}
