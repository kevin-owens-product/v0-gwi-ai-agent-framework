"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Trash,
  RefreshCw,
  Settings,
  Plus,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
import Link from "next/link"

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

// deviceTypes and trustStatuses moved inside component to use translations

// platforms array removed - unused

export default function DevicesPage() {
  const t = useTranslations("admin.devices")
  const tCommon = useTranslations("common")
  const router = useRouter()
  
  const deviceTypes = [
    { value: "DESKTOP", label: t("deviceTypes.desktop") },
    { value: "LAPTOP", label: t("deviceTypes.laptop") },
    { value: "MOBILE", label: t("deviceTypes.mobile") },
    { value: "TABLET", label: t("deviceTypes.tablet") },
    { value: "OTHER", label: t("deviceTypes.other") },
  ]

  const trustStatuses = [
    { value: "PENDING", label: t("trustStatuses.pending") },
    { value: "TRUSTED", label: t("trustStatuses.trusted") },
    { value: "BLOCKED", label: t("trustStatuses.blocked") },
    { value: "REVOKED", label: t("trustStatuses.revoked") },
  ]
  
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [complianceFilter, setComplianceFilter] = useState("all")
  const [stats, setStats] = useState<Stats>({ total: 0, trusted: 0, pending: 0, nonCompliant: 0 })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
  const [deviceToRevoke, setDeviceToRevoke] = useState<string | null>(null)

  const fetchDevices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())
      if (search) params.set("search", search)
      if (typeFilter !== "all") params.set("type", typeFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (complianceFilter !== "all") params.set("isCompliant", complianceFilter)

      const response = await fetch(`/api/admin/devices?${params}`)
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login?type=admin")
          return
        }
        throw new Error("Failed to fetch devices")
      }

      const data = await response.json()
      setDevices(data.devices || [])
      setStats(data.stats || { total: 0, trusted: 0, pending: 0, nonCompliant: 0 })
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch devices:", error)
      showErrorToast(t("errors.fetchFailed"))
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, typeFilter, statusFilter, complianceFilter, router, t])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchDevices()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchDevices])

  const handleTrustDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}/trust`, {
        method: "POST",
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.trustFailed"))
      }
      showSuccessToast(t("messages.deviceTrusted"))
      fetchDevices()
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : t("errors.trustFailed"))
    }
  }

  const handleRevokeClick = (deviceId: string) => {
    setDeviceToRevoke(deviceId)
    setShowRevokeConfirm(true)
  }

  const handleConfirmRevoke = async () => {
    if (!deviceToRevoke) return

    try {
      const response = await fetch(`/api/admin/devices/${deviceToRevoke}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: t("revokedByAdmin") }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.revokeFailed"))
      }
      showSuccessToast(t("messages.trustRevoked"))
      fetchDevices()
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : t("errors.revokeFailed"))
    } finally {
      setShowRevokeConfirm(false)
      setDeviceToRevoke(null)
    }
  }

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(t("errors.deleteFailed"))
      }
      showSuccessToast(t("messages.deviceDeleted"))
      fetchDevices()
    } catch {
      showErrorToast(t("errors.deleteFailed"))
    }
  }

  const handleBulkRevoke = async (selectedIds: string[]) => {
    try {
      const promises = selectedIds.map((deviceId) =>
        fetch(`/api/admin/devices/${deviceId}/revoke`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: t("bulkRevokedByAdmin") }),
        })
      )
      await Promise.all(promises)
      showSuccessToast(t("messages.bulkRevoked", { count: selectedIds.length }))
      fetchDevices()
    } catch {
      showErrorToast(t("errors.bulkRevokeFailed"))
    }
  }

  const handleBulkDelete = async (selectedIds: string[]) => {
    try {
      const promises = selectedIds.map((deviceId) =>
        fetch(`/api/admin/devices/${deviceId}`, {
          method: "DELETE",
        })
      )
      await Promise.all(promises)
      showSuccessToast(t("messages.bulkDeleted", { count: selectedIds.length }))
      fetchDevices()
    } catch {
      showErrorToast(t("errors.bulkDeleteFailed"))
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "DESKTOP":
        return <Monitor className="h-4 w-4" />
      case "LAPTOP":
        return <Laptop className="h-4 w-4" />
      case "MOBILE":
        return <Smartphone className="h-4 w-4" />
      case "TABLET":
        return <Tablet className="h-4 w-4" />
      default:
        return <Smartphone className="h-4 w-4" />
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

  // Define columns for AdminDataTable
  const columns: Column<Device>[] = [
    {
      id: "device",
      header: t("columns.device"),
      cell: (device) => (
        <Link href={`/admin/devices/${device.id}`} className="hover:underline">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              {getDeviceIcon(device.type)}
            </div>
            <div>
              <p className="font-medium">
                {device.name || device.model || device.deviceId.slice(0, 8)}
              </p>
              <p className="text-xs text-muted-foreground">
                {device.manufacturer} {device.model}
              </p>
            </div>
          </div>
        </Link>
      ),
    },
    {
      id: "user",
      header: t("columns.user"),
      cell: (device) => (
        <Link href={`/admin/users/${device.user.id}`} className="hover:underline">
          <div>
            <p className="font-medium">{device.user.name || t("noName")}</p>
            <p className="text-xs text-muted-foreground">{device.user.email}</p>
          </div>
        </Link>
      ),
    },
    {
      id: "platform",
      header: t("columns.platform"),
      cell: (device) => (
        <div className="flex flex-col gap-1">
          <Badge variant="outline">{device.platform || t("unknown")}</Badge>
          {device.osVersion && (
            <span className="text-xs text-muted-foreground">v{device.osVersion}</span>
          )}
        </div>
      ),
    },
    {
      id: "trustStatus",
      header: t("columns.trustStatus"),
      cell: (device) => getTrustStatusBadge(device.trustStatus),
    },
    {
      id: "compliance",
      header: t("columns.compliance"),
      cell: (device) => (
        device.isCompliant ? (
          <Badge className="bg-green-500">
            <ShieldCheck className="h-3 w-3 mr-1" />
            {t("complianceStatuses.compliant")}
          </Badge>
        ) : (
          <Badge variant="destructive">
            <ShieldAlert className="h-3 w-3 mr-1" />
            {t("complianceStatuses.nonCompliant")}
          </Badge>
        )
      ),
    },
    {
      id: "lastActive",
      header: t("columns.lastActive"),
      cell: (device) => (
        device.lastActiveAt ? (
          <div className="text-sm">
            <p>{new Date(device.lastActiveAt).toLocaleDateString()}</p>
            <p className="text-xs text-muted-foreground">
              {device.lastIpAddress || t("unknownIP")}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">{t("never")}</span>
        )
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<Device>[] = [
    {
      label: t("actions.approveTrust"),
      icon: <ShieldCheck className="h-4 w-4" />,
      onClick: (device) => handleTrustDevice(device.id),
      hidden: (device) => device.trustStatus !== "PENDING",
    },
    {
      label: t("actions.revokeTrust"),
      icon: <ShieldX className="h-4 w-4" />,
      onClick: (device) => handleRevokeClick(device.id),
      hidden: (device) => device.trustStatus !== "TRUSTED",
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.revokeTrust"),
      icon: <ShieldX className="h-4 w-4" />,
      onClick: handleBulkRevoke,
      variant: "destructive",
      confirmTitle: t("dialogs.revokeMultiple"),
      confirmDescription: t("dialogs.revokeMultipleDescription"),
    },
    {
      label: t("actions.deleteDevices"),
      icon: <Trash className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      separator: true,
      confirmTitle: t("dialogs.deleteMultiple"),
      confirmDescription: t("dialogs.deleteMultipleDescription"),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Smartphone className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDevices}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {tCommon("refresh")}
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/devices/policies">
              <Settings className="h-4 w-4 mr-2" />
              {t("managePolicies")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/devices/new">
              <Plus className="h-4 w-4 mr-2" />
              {t("registerDevice")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{t("stats.totalDevices")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{stats.trusted}</div>
            <p className="text-xs text-muted-foreground">{t("stats.trustedDevices")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">{t("stats.pendingApproval")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">{stats.nonCompliant}</div>
            <p className="text-xs text-muted-foreground">{t("stats.nonCompliant")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("filters.deviceType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                {deviceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.trustStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                {trustStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={complianceFilter} onValueChange={setComplianceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.compliance")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tCommon("all")}</SelectItem>
                <SelectItem value="true">{t("complianceStatuses.compliant")}</SelectItem>
                <SelectItem value="false">{t("complianceStatuses.nonCompliant")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Devices Table */}
      <Card>
        <CardContent className="p-6">
          <AdminDataTable
            data={devices}
            columns={columns}
            getRowId={(device) => device.id}
            isLoading={loading}
            emptyMessage={t("noDevicesFound")}
            viewHref={(device) => `/admin/devices/${device.id}`}
            onDelete={(device) => handleDeleteDevice(device.id)}
            deleteConfirmTitle={t("dialogs.deleteTitle")}
            deleteConfirmDescription={(device) =>
              t("dialogs.deleteDescription", { deviceName: device.name || device.deviceId })
            }
            rowActions={rowActions}
            bulkActions={bulkActions}
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            enableSelection={true}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showRevokeConfirm}
        onOpenChange={setShowRevokeConfirm}
        title={t("dialogs.revokeTitle")}
        description={t("dialogs.revokeDescription")}
        confirmText={t("actions.revokeTrust")}
        variant="destructive"
        onConfirm={handleConfirmRevoke}
      />
    </div>
  )
}
