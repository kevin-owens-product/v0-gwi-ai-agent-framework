"use client"

import { useState, useEffect, useCallback } from "react"
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

export default function DevicesPage() {
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
        throw new Error("Failed to fetch devices")
      }
      const data = await response.json()
      setDevices(data.devices || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotal(data.pagination?.total || 0)
      setStats(data.stats || null)
    } catch (error) {
      console.error("Failed to fetch devices:", error)
      toast.error("Failed to fetch devices")
    } finally {
      setIsLoading(false)
    }
  }, [page, search, typeFilter, statusFilter, platformFilter])

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
        throw new Error("Failed to trust device")
      }
      toast.success("Device trusted successfully")
      fetchDevices()
    } catch (error) {
      toast.error("Failed to trust device")
    }
  }

  const handleRevoke = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}/revoke`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to revoke device")
      }
      toast.success("Device trust revoked")
      fetchDevices()
    } catch (error) {
      toast.error("Failed to revoke device trust")
    }
  }

  const handleBlock = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}/block`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to block device")
      }
      toast.success("Device blocked successfully")
      fetchDevices()
    } catch (error) {
      toast.error("Failed to block device")
    }
  }

  const handleBulkRevoke = async (deviceIds: string[]) => {
    try {
      const promises = deviceIds.map(id =>
        fetch(`/api/admin/devices/${id}/revoke`, { method: "POST" })
      )
      await Promise.all(promises)
      toast.success(`${deviceIds.length} device(s) revoked successfully`)
      fetchDevices()
    } catch (error) {
      toast.error("Failed to revoke some devices")
    }
  }

  const handleBulkBlock = async (deviceIds: string[]) => {
    try {
      const promises = deviceIds.map(id =>
        fetch(`/api/admin/devices/${id}/block`, { method: "POST" })
      )
      await Promise.all(promises)
      toast.success(`${deviceIds.length} device(s) blocked successfully`)
      fetchDevices()
    } catch (error) {
      toast.error("Failed to block some devices")
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

  // Define columns for AdminDataTable
  const columns: Column<Device>[] = [
    {
      id: "device",
      header: "Device",
      cell: (device) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            {deviceTypeIcons[device.type] || <Smartphone className="h-4 w-4" />}
          </div>
          <div>
            <p className="font-medium">{device.name || device.deviceId}</p>
            <p className="text-xs text-muted-foreground">
              {device.model || device.manufacturer || "Unknown model"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "user",
      header: "User",
      cell: (device) => (
        <div>
          <p className="font-medium">{device.user?.name || "No name"}</p>
          <p className="text-xs text-muted-foreground">{device.user?.email}</p>
        </div>
      ),
    },
    {
      id: "platform",
      header: "Platform",
      cell: (device) => (
        <div className="flex items-center gap-2">
          <Badge className={platformColors[device.platform || ""] || "bg-gray-500"}>
            {device.platform || "Unknown"}
          </Badge>
          {device.osVersion && (
            <span className="text-xs text-muted-foreground">{device.osVersion}</span>
          )}
        </div>
      ),
    },
    {
      id: "compliance",
      header: "Compliance",
      cell: (device) =>
        device.isCompliant ? (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Compliant
          </Badge>
        ) : (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Non-Compliant
          </Badge>
        ),
    },
    {
      id: "trustStatus",
      header: "Trust Status",
      cell: (device) => getTrustStatusBadge(device.trustStatus),
    },
    {
      id: "lastActive",
      header: "Last Active",
      cell: (device) =>
        device.lastActiveAt ? (
          <div className="text-muted-foreground">
            <p className="text-sm">{new Date(device.lastActiveAt).toLocaleDateString()}</p>
            <p className="text-xs">{device.lastLocation || device.lastIpAddress || ""}</p>
          </div>
        ) : (
          <span className="text-muted-foreground">Never</span>
        ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<Device>[] = [
    {
      label: "Trust Device",
      icon: <Shield className="h-4 w-4" />,
      onClick: (device) => handleTrust(device.id),
      hidden: (device) => device.trustStatus !== "PENDING" && device.trustStatus !== "REVOKED",
    },
    {
      label: "Revoke Trust",
      icon: <ShieldOff className="h-4 w-4" />,
      onClick: (device) => handleRevoke(device.id),
      variant: "destructive",
      hidden: (device) => device.trustStatus !== "TRUSTED",
      separator: true,
    },
    {
      label: "Block Device",
      icon: <Ban className="h-4 w-4" />,
      onClick: (device) => handleBlock(device.id),
      variant: "destructive",
      hidden: (device) => device.trustStatus === "BLOCKED",
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: "Bulk Revoke Trust",
      icon: <ShieldOff className="h-4 w-4" />,
      onClick: handleBulkRevoke,
      variant: "destructive",
      confirmTitle: "Revoke Trust for Multiple Devices",
      confirmDescription: "Are you sure you want to revoke trust for the selected devices? This action cannot be undone.",
    },
    {
      label: "Bulk Block Devices",
      icon: <Ban className="h-4 w-4" />,
      onClick: handleBulkBlock,
      variant: "destructive",
      confirmTitle: "Block Multiple Devices",
      confirmDescription: "Are you sure you want to block the selected devices? This will prevent them from accessing the platform.",
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
                Device Trust Management
              </CardTitle>
              <CardDescription>
                Manage trusted devices across the platform ({total} total)
              </CardDescription>
            </div>
            <Button onClick={fetchDevices} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total Devices</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold text-green-500">{stats.trusted}</div>
                <p className="text-xs text-muted-foreground">Trusted</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Pending Approval</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold text-red-500">{stats.nonCompliant}</div>
                <p className="text-xs text-muted-foreground">Non-Compliant</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search devices, users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Device Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PHONE">Phone</SelectItem>
                <SelectItem value="TABLET">Tablet</SelectItem>
                <SelectItem value="LAPTOP">Laptop</SelectItem>
                <SelectItem value="DESKTOP">Desktop</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trust Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="TRUSTED">Trusted</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REVOKED">Revoked</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="MACOS">macOS</SelectItem>
                <SelectItem value="WINDOWS">Windows</SelectItem>
                <SelectItem value="IOS">iOS</SelectItem>
                <SelectItem value="ANDROID">Android</SelectItem>
                <SelectItem value="LINUX">Linux</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <AdminDataTable
            data={devices}
            columns={columns}
            getRowId={(device) => device.id}
            isLoading={isLoading}
            emptyMessage="No devices found"
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
