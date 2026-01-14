"use client"

import { useEffect, useState } from "react"
import {
  Monitor,
  Search,
  Filter,
  Clock,
  Globe,
  ArrowUpDown,
  Users,
  Activity,
  Smartphone,
  RefreshCw,
  XCircle,
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
import {
  AdminDataTable,
  Column,
  RowAction,
  BulkAction,
} from "@/components/admin/data-table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

interface SessionUser {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
}

interface PlatformSession {
  id: string
  sessionTokenPrefix: string
  userId: string
  user: SessionUser
  expires: string
  isActive: boolean
  ipAddress: string | null
  userAgent: string | null
}

interface SessionStats {
  totalActive: number
  activeLast24h: number
  activeLastWeek: number
  uniqueUsers: number
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<PlatformSession[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("true")
  const [sortBy, setSortBy] = useState("expires")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<SessionStats>({
    totalActive: 0,
    activeLast24h: 0,
    activeLastWeek: 0,
    uniqueUsers: 0,
  })
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  })

  useEffect(() => {
    fetchSessions()
  }, [activeFilter, sortBy, sortOrder, pagination.offset])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set("activeOnly", activeFilter)
      if (search) params.set("search", search)
      params.set("sortBy", sortBy)
      params.set("sortOrder", sortOrder)
      params.set("limit", pagination.limit.toString())
      params.set("offset", pagination.offset.toString())

      const response = await fetch(`/api/admin/security/sessions?${params}`)
      const data = await response.json()
      setSessions(data.sessions || [])
      setStats(data.stats || {
        totalActive: 0,
        activeLast24h: 0,
        activeLastWeek: 0,
        uniqueUsers: 0,
      })
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        hasMore: data.pagination?.hasMore || false,
      }))
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
      toast.error("Failed to fetch sessions")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, offset: 0 }))
    fetchSessions()
  }

  const handleRefresh = () => {
    fetchSessions()
    toast.success("Sessions refreshed")
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const parseUserAgent = (userAgent: string | null) => {
    if (!userAgent) return { browser: "Unknown", os: "Unknown", device: "Unknown" }

    let browser = "Unknown"
    let os = "Unknown"
    let device = "Desktop"

    // Browser detection
    if (userAgent.includes("Chrome")) browser = "Chrome"
    else if (userAgent.includes("Firefox")) browser = "Firefox"
    else if (userAgent.includes("Safari")) browser = "Safari"
    else if (userAgent.includes("Edge")) browser = "Edge"
    else if (userAgent.includes("Opera")) browser = "Opera"

    // OS detection
    if (userAgent.includes("Windows")) os = "Windows"
    else if (userAgent.includes("Mac")) os = "macOS"
    else if (userAgent.includes("Linux")) os = "Linux"
    else if (userAgent.includes("Android")) os = "Android"
    else if (userAgent.includes("iOS") || userAgent.includes("iPhone")) os = "iOS"

    // Device detection
    if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
      device = "Mobile"
    } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
      device = "Tablet"
    }

    return { browser, os, device }
  }

  const getDeviceIcon = (userAgent: string | null) => {
    const { device } = parseUserAgent(userAgent)
    if (device === "Mobile") return <Smartphone className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  const getTimeRemaining = (expires: string) => {
    const expiresDate = new Date(expires)
    const now = new Date()
    const diff = expiresDate.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h`
    const minutes = Math.floor(diff / (1000 * 60))
    return `${minutes}m`
  }

  const getUserInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  const handleTerminateSession = async (session: PlatformSession) => {
    try {
      const response = await fetch(`/api/admin/security/sessions/${session.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to terminate session")
      }

      toast.success("Session terminated successfully")
      fetchSessions()
    } catch (error) {
      console.error("Failed to terminate session:", error)
      toast.error("Failed to terminate session")
    }
  }

  const handleBulkTerminate = async (sessionIds: string[]) => {
    try {
      const response = await fetch("/api/admin/security/sessions/bulk-terminate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionIds }),
      })

      if (!response.ok) {
        throw new Error("Failed to terminate sessions")
      }

      toast.success(`${sessionIds.length} session(s) terminated successfully`)
      setSelectedIds(new Set())
      fetchSessions()
    } catch (error) {
      console.error("Failed to terminate sessions:", error)
      toast.error("Failed to terminate sessions")
    }
  }

  const filteredSessions = sessions.filter(
    (session) =>
      session.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      session.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      session.ipAddress?.toLowerCase().includes(search.toLowerCase())
  )

  // Define columns for AdminDataTable
  const columns: Column<PlatformSession>[] = [
    {
      id: "user",
      header: "User",
      cell: (session) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user?.avatarUrl || undefined} />
            <AvatarFallback>
              {getUserInitials(session.user?.name, session.user?.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {session.user?.name || "Unknown User"}
            </p>
            <p className="text-xs text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "session",
      header: "Session",
      cell: (session) => (
        <code className="font-mono text-xs text-muted-foreground">
          {session.sessionTokenPrefix}
        </code>
      ),
    },
    {
      id: "ipAddress",
      header: (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          IP Address
        </div>
      ),
      cell: (session) => (
        <div className="flex items-center gap-1 text-sm">
          <Globe className="h-3 w-3 text-muted-foreground" />
          {session.ipAddress || "N/A"}
        </div>
      ),
    },
    {
      id: "device",
      header: "Device",
      cell: (session) => {
        const { browser, os, device } = parseUserAgent(session.userAgent)
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  {getDeviceIcon(session.userAgent)}
                  <span className="text-sm">{browser}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <p>Browser: {browser}</p>
                  <p>OS: {os}</p>
                  <p>Device: {device}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      id: "status",
      header: "Status",
      cell: (session) => (
        session.isActive ? (
          <Badge variant="default" className="bg-green-500">
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">Expired</Badge>
        )
      ),
    },
    {
      id: "expires",
      header: (
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort("expires")}>
          Expires
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (session) => (
        <div className="flex items-center gap-1 text-sm">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={
                    session.isActive
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }
                >
                  {getTimeRemaining(session.expires)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {new Date(session.expires).toLocaleString()}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<PlatformSession>[] = [
    {
      label: "Terminate Session",
      icon: <XCircle className="h-4 w-4" />,
      onClick: handleTerminateSession,
      variant: "destructive",
      hidden: (session) => !session.isActive,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: "Terminate Selected Sessions",
      icon: <XCircle className="h-4 w-4" />,
      onClick: handleBulkTerminate,
      variant: "destructive",
      confirmTitle: "Terminate Sessions",
      confirmDescription: "Are you sure you want to terminate the selected sessions? Users will be logged out immediately.",
    },
  ]

  // Convert offset-based pagination to page-based
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      offset: (page - 1) * prev.limit,
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Monitor className="h-8 w-8 text-primary" />
            Active Sessions
          </h1>
          <p className="text-muted-foreground">
            Monitor active user sessions across the platform
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.totalActive}</div>
                <p className="text-xs text-muted-foreground">Active Sessions</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
                <p className="text-xs text-muted-foreground">Unique Users</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.activeLast24h}</div>
                <p className="text-xs text-muted-foreground">Last 24 Hours</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.activeLastWeek}</div>
                <p className="text-xs text-muted-foreground">Last 7 Days</p>
              </div>
              <Monitor className="h-8 w-8 text-purple-500" />
            </div>
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
                  placeholder="Search by user, email, or IP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active Only</SelectItem>
                <SelectItem value="false">All Sessions</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <AdminDataTable
        data={filteredSessions}
        columns={columns}
        getRowId={(session) => session.id}
        isLoading={loading}
        emptyMessage="No sessions found"
        rowActions={rowActions}
        bulkActions={bulkActions}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        page={currentPage}
        totalPages={totalPages}
        total={pagination.total}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
