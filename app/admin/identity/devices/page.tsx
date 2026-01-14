"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  Eye,
  Shield,
  ShieldOff,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
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

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Trust Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : devices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No devices found
                    </TableCell>
                  </TableRow>
                ) : (
                  devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{device.user?.name || "No name"}</p>
                          <p className="text-xs text-muted-foreground">{device.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={platformColors[device.platform || ""] || "bg-gray-500"}
                          >
                            {device.platform || "Unknown"}
                          </Badge>
                          {device.osVersion && (
                            <span className="text-xs text-muted-foreground">{device.osVersion}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {device.isCompliant ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Compliant
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Non-Compliant
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getTrustStatusBadge(device.trustStatus)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {device.lastActiveAt ? (
                          <div>
                            <p className="text-sm">{new Date(device.lastActiveAt).toLocaleDateString()}</p>
                            <p className="text-xs">{device.lastLocation || device.lastIpAddress || ""}</p>
                          </div>
                        ) : (
                          "Never"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/identity/devices/${device.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {device.trustStatus === "PENDING" && (
                              <DropdownMenuItem onClick={() => handleTrust(device.id)}>
                                <Shield className="h-4 w-4 mr-2" />
                                Trust Device
                              </DropdownMenuItem>
                            )}
                            {device.trustStatus === "TRUSTED" && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRevoke(device.id)}
                              >
                                <ShieldOff className="h-4 w-4 mr-2" />
                                Revoke Trust
                              </DropdownMenuItem>
                            )}
                            {device.trustStatus === "REVOKED" && (
                              <DropdownMenuItem onClick={() => handleTrust(device.id)}>
                                <Shield className="h-4 w-4 mr-2" />
                                Re-trust Device
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
