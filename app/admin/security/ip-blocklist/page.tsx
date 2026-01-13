"use client"

import { useEffect, useState } from "react"
import {
  Ban,
  Plus,
  Search,
  Filter,
  Globe,
  Clock,
  MoreHorizontal,
  Trash,
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertCircle,
  Shield,
  Calendar,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface IPBlocklistEntry {
  id: string
  ipAddress: string
  ipRange: string | null
  type: string
  reason: string
  orgId: string | null
  blockedBy: string | null
  expiresAt: string | null
  isActive: boolean
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

const blockTypes = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "THREAT_INTEL", label: "Threat Intelligence" },
  { value: "BRUTE_FORCE", label: "Brute Force" },
  { value: "GEOGRAPHIC", label: "Geographic" },
]

export default function IPBlocklistPage() {
  const [blocklist, setBlocklist] = useState<IPBlocklistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [stats, setStats] = useState<Record<string, number>>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  })

  const [newEntry, setNewEntry] = useState({
    ipAddress: "",
    ipRange: "",
    type: "MANUAL",
    reason: "",
    expiresAt: "",
    isActive: true,
  })

  useEffect(() => {
    fetchBlocklist()
  }, [typeFilter, activeFilter, sortBy, sortOrder, pagination.offset])

  const fetchBlocklist = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (typeFilter !== "all") params.set("type", typeFilter)
      if (activeFilter !== "all") params.set("isActive", activeFilter)
      if (search) params.set("search", search)
      params.set("sortBy", sortBy)
      params.set("sortOrder", sortOrder)
      params.set("limit", pagination.limit.toString())
      params.set("offset", pagination.offset.toString())
      params.set("includeExpired", "true")

      const response = await fetch(`/api/admin/security/ip-blocklist?${params}`)
      const data = await response.json()
      setBlocklist(data.blocklist || [])
      setStats(data.stats || {})
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        hasMore: data.pagination?.hasMore || false,
      }))
    } catch (error) {
      console.error("Failed to fetch blocklist:", error)
      toast.error("Failed to fetch IP blocklist")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, offset: 0 }))
    fetchBlocklist()
  }

  const handleCreateEntry = async () => {
    try {
      const response = await fetch("/api/admin/security/ip-blocklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEntry,
          ipRange: newEntry.ipRange || undefined,
          expiresAt: newEntry.expiresAt || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create entry")
      }

      toast.success("IP address added to blocklist")
      setIsCreateOpen(false)
      setNewEntry({
        ipAddress: "",
        ipRange: "",
        type: "MANUAL",
        reason: "",
        expiresAt: "",
        isActive: true,
      })
      fetchBlocklist()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add IP to blocklist"
      toast.error(message)
    }
  }

  const handleToggleEntry = async (entry: IPBlocklistEntry) => {
    try {
      const response = await fetch(`/api/admin/security/ip-blocklist/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !entry.isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update entry")
      }

      toast.success(`IP ${entry.isActive ? "disabled" : "enabled"} successfully`)
      fetchBlocklist()
    } catch (error) {
      toast.error("Failed to update entry")
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to remove this IP from the blocklist?")) return

    try {
      const response = await fetch(`/api/admin/security/ip-blocklist/${entryId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete entry")
      }

      toast.success("IP removed from blocklist")
      fetchBlocklist()
    } catch (error) {
      toast.error("Failed to remove IP from blocklist")
    }
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "MANUAL":
        return <Badge variant="outline">{type}</Badge>
      case "AUTOMATIC":
        return <Badge variant="default">{type}</Badge>
      case "THREAT_INTEL":
        return <Badge variant="destructive">{type.replace("_", " ")}</Badge>
      case "BRUTE_FORCE":
        return <Badge variant="destructive">{type.replace("_", " ")}</Badge>
      case "GEOGRAPHIC":
        return <Badge variant="secondary">{type}</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const filteredBlocklist = blocklist.filter(
    (entry) =>
      entry.ipAddress?.toLowerCase().includes(search.toLowerCase()) ||
      entry.reason?.toLowerCase().includes(search.toLowerCase())
  )

  const totalActive = Object.values(stats).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Ban className="h-8 w-8 text-destructive" />
            IP Blocklist
          </h1>
          <p className="text-muted-foreground">
            Manage blocked IP addresses across the platform
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Block IP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add IP to Blocklist</DialogTitle>
              <DialogDescription>
                Block an IP address from accessing the platform
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="ipAddress">IP Address *</Label>
                <Input
                  id="ipAddress"
                  placeholder="e.g., 192.168.1.1"
                  value={newEntry.ipAddress}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, ipAddress: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ipRange">IP Range (CIDR)</Label>
                <Input
                  id="ipRange"
                  placeholder="e.g., 192.168.1.0/24 (optional)"
                  value={newEntry.ipRange}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, ipRange: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Block Type</Label>
                <Select
                  value={newEntry.type}
                  onValueChange={(value) =>
                    setNewEntry({ ...newEntry, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {blockTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="Why is this IP being blocked?"
                  value={newEntry.reason}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, reason: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiresAt">Expires At (optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={newEntry.expiresAt}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, expiresAt: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={newEntry.isActive}
                  onCheckedChange={(checked) =>
                    setNewEntry({ ...newEntry, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Block immediately</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateEntry}
                disabled={!newEntry.ipAddress || !newEntry.reason}
              >
                Add to Blocklist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{totalActive}</div>
            <p className="text-xs text-muted-foreground">Active Blocks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">{stats.MANUAL || 0}</div>
            <p className="text-xs text-muted-foreground">Manual</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">{stats.AUTOMATIC || 0}</div>
            <p className="text-xs text-muted-foreground">Automatic</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">{stats.BRUTE_FORCE || 0}</div>
            <p className="text-xs text-muted-foreground">Brute Force</p>
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
                  placeholder="Search by IP or reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {blockTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active Only</SelectItem>
                <SelectItem value="false">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blocklist Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("ipAddress")}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    IP Address
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Range</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center gap-2">
                    Type
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("expiresAt")}
                >
                  <div className="flex items-center gap-2">
                    Expires
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-2">
                    Blocked At
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredBlocklist.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No blocked IPs found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Block First IP
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBlocklist.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <code className="font-mono text-sm">{entry.ipAddress}</code>
                    </TableCell>
                    <TableCell>
                      {entry.ipRange ? (
                        <code className="font-mono text-sm text-muted-foreground">
                          {entry.ipRange}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getTypeBadge(entry.type)}</TableCell>
                    <TableCell>
                      <p className="truncate max-w-[200px]">{entry.reason}</p>
                    </TableCell>
                    <TableCell>
                      {!entry.isActive ? (
                        <Badge variant="outline">Disabled</Badge>
                      ) : isExpired(entry.expiresAt) ? (
                        <Badge variant="secondary">Expired</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.expiresAt ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(entry.expiresAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleEntry(entry)}>
                            {entry.isActive ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Enable
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Remove
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
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pagination.offset + 1} to{" "}
            {Math.min(pagination.offset + pagination.limit, pagination.total)} of{" "}
            {pagination.total} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  offset: Math.max(0, prev.offset - prev.limit),
                }))
              }
              disabled={pagination.offset === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  offset: prev.offset + prev.limit,
                }))
              }
              disabled={!pagination.hasMore}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
