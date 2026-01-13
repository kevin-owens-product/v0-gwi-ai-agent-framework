"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
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
  MoreHorizontal,
  Eye,
  ShieldCheck,
  ShieldX,
  Trash,
  RefreshCw,
  Settings,
} from "lucide-react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
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

const deviceTypes = [
  { value: "DESKTOP", label: "Desktop" },
  { value: "LAPTOP", label: "Laptop" },
  { value: "MOBILE", label: "Mobile" },
  { value: "TABLET", label: "Tablet" },
  { value: "OTHER", label: "Other" },
]

const trustStatuses = [
  { value: "PENDING", label: "Pending" },
  { value: "TRUSTED", label: "Trusted" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "REVOKED", label: "Revoked" },
]

const platforms = [
  { value: "iOS", label: "iOS" },
  { value: "Android", label: "Android" },
  { value: "Windows", label: "Windows" },
  { value: "macOS", label: "macOS" },
  { value: "Linux", label: "Linux" },
]

export default function DevicesPage() {
  const router = useRouter()
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
          router.push("/admin/login")
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
      toast.error("Failed to fetch devices")
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, typeFilter, statusFilter, complianceFilter, router])

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
        throw new Error(data.error || "Failed to trust device")
      }
      toast.success("Device trusted successfully")
      fetchDevices()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to trust device")
    }
  }

  const handleRevokeDevice = async (deviceId: string) => {
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
      fetchDevices()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to revoke device")
    }
  }

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm("Are you sure you want to delete this device? This action cannot be undone.")) return

    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete device")
      }
      toast.success("Device deleted successfully")
      fetchDevices()
    } catch (error) {
      toast.error("Failed to delete device")
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Smartphone className="h-8 w-8 text-primary" />
            Device Trust
          </h1>
          <p className="text-muted-foreground">
            Manage enrolled devices and device trust policies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDevices}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/admin/devices/policies">
              <Settings className="h-4 w-4 mr-2" />
              Manage Policies
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Devices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{stats.trusted}</div>
            <p className="text-xs text-muted-foreground">Trusted Devices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending Approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">{stats.nonCompliant}</div>
            <p className="text-xs text-muted-foreground">Non-Compliant</p>
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
                  placeholder="Search devices, users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Device Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {deviceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trust Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {trustStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={complianceFilter} onValueChange={setComplianceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Compliance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Compliant</SelectItem>
                <SelectItem value="false">Non-Compliant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Devices Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Trust Status</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No devices found</p>
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/users/${device.user.id}`} className="hover:underline">
                        <div>
                          <p className="font-medium">{device.user.name || "No name"}</p>
                          <p className="text-xs text-muted-foreground">{device.user.email}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline">{device.platform || "Unknown"}</Badge>
                        {device.osVersion && (
                          <span className="text-xs text-muted-foreground">v{device.osVersion}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTrustStatusBadge(device.trustStatus)}</TableCell>
                    <TableCell>
                      {device.isCompliant ? (
                        <Badge className="bg-green-500">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Compliant
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <ShieldAlert className="h-3 w-3 mr-1" />
                          Non-Compliant
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {device.lastActiveAt ? (
                        <div className="text-sm">
                          <p>{new Date(device.lastActiveAt).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {device.lastIpAddress || "Unknown IP"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/devices/${device.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {device.trustStatus === "PENDING" && (
                            <DropdownMenuItem onClick={() => handleTrustDevice(device.id)}>
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Approve Trust
                            </DropdownMenuItem>
                          )}
                          {device.trustStatus === "TRUSTED" && (
                            <DropdownMenuItem onClick={() => handleRevokeDevice(device.id)}>
                              <ShieldX className="h-4 w-4 mr-2" />
                              Revoke Trust
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteDevice(device.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Device
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} devices
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
