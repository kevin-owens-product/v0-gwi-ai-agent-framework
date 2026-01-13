"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Rocket,
  Plus,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  ExternalLink,
  RefreshCw,
  Tag,
  Play,
  Undo,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface Release {
  id: string
  version: string
  name: string | null
  description: string | null
  type: string
  status: string
  features: unknown[]
  bugFixes: unknown[]
  breakingChanges: unknown[]
  rolloutStrategy: string
  rolloutPercentage: number
  rolloutRegions: string[]
  plannedDate: string | null
  startedAt: string | null
  completedAt: string | null
  rollbackedAt: string | null
  changelogUrl: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

const typeOptions = [
  { value: "MAJOR", label: "Major", color: "bg-purple-500" },
  { value: "MINOR", label: "Minor", color: "bg-blue-500" },
  { value: "PATCH", label: "Patch", color: "bg-green-500" },
  { value: "HOTFIX", label: "Hotfix", color: "bg-red-500" },
]

const statusOptions = [
  { value: "PLANNED", label: "Planned" },
  { value: "IN_DEVELOPMENT", label: "In Development" },
  { value: "STAGING", label: "Staging" },
  { value: "ROLLING_OUT", label: "Rolling Out" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ROLLBACK", label: "Rollback" },
  { value: "CANCELLED", label: "Cancelled" },
]

const strategyOptions = [
  { value: "BIG_BANG", label: "Big Bang" },
  { value: "STAGED", label: "Staged" },
  { value: "CANARY", label: "Canary" },
  { value: "BLUE_GREEN", label: "Blue-Green" },
  { value: "RING", label: "Ring" },
]

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [newRelease, setNewRelease] = useState({
    version: "",
    name: "",
    description: "",
    type: "MINOR",
    rolloutStrategy: "STAGED",
    plannedDate: "",
    changelogUrl: "",
  })

  useEffect(() => {
    fetchReleases()
  }, [statusFilter, typeFilter, page])

  const fetchReleases = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(search && { search }),
      })

      const response = await fetch(`/api/admin/operations/releases?${params}`)
      const data = await response.json()
      setReleases(data.releases || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch releases:", error)
      toast.error("Failed to load releases")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRelease = async () => {
    try {
      const response = await fetch("/api/admin/operations/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRelease),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create release")
      }

      toast.success("Release created")
      setIsCreateOpen(false)
      setNewRelease({
        version: "",
        name: "",
        description: "",
        type: "MINOR",
        rolloutStrategy: "STAGED",
        plannedDate: "",
        changelogUrl: "",
      })
      fetchReleases()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create release")
    }
  }

  const handleUpdateStatus = async (releaseId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/operations/releases/${releaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      toast.success("Release updated")
      fetchReleases()
    } catch (error) {
      toast.error("Failed to update release")
    }
  }

  const handleDelete = async (releaseId: string) => {
    if (!confirm("Are you sure you want to delete this release?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/operations/releases/${releaseId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete release")
      }

      toast.success("Release deleted")
      fetchReleases()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete release")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PLANNED":
        return <Badge variant="outline">Planned</Badge>
      case "IN_DEVELOPMENT":
        return <Badge className="bg-blue-500">In Development</Badge>
      case "STAGING":
        return <Badge className="bg-yellow-500">Staging</Badge>
      case "ROLLING_OUT":
        return <Badge className="bg-orange-500">Rolling Out</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>
      case "ROLLBACK":
        return <Badge className="bg-red-500">Rollback</Badge>
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const opt = typeOptions.find((o) => o.value === type)
    return <Badge className={opt?.color || "bg-gray-500"}>{opt?.label || type}</Badge>
  }

  const filteredReleases = releases.filter(
    (r) =>
      r.version.toLowerCase().includes(search.toLowerCase()) ||
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
  )

  const activeReleases = releases.filter((r) =>
    ["IN_DEVELOPMENT", "STAGING", "ROLLING_OUT"].includes(r.status)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Rocket className="h-8 w-8 text-primary" />
            Release Management
          </h1>
          <p className="text-muted-foreground">
            Plan, track, and deploy platform releases
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReleases}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Release
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Release</DialogTitle>
                <DialogDescription>
                  Plan a new platform release
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      placeholder="e.g., 2.5.0"
                      value={newRelease.version}
                      onChange={(e) =>
                        setNewRelease({ ...newRelease, version: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name (optional)</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Phoenix"
                      value={newRelease.name}
                      onChange={(e) =>
                        setNewRelease({ ...newRelease, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the release..."
                    rows={3}
                    value={newRelease.description}
                    onChange={(e) =>
                      setNewRelease({ ...newRelease, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select
                      value={newRelease.type}
                      onValueChange={(value) =>
                        setNewRelease({ ...newRelease, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Rollout Strategy</Label>
                    <Select
                      value={newRelease.rolloutStrategy}
                      onValueChange={(value) =>
                        setNewRelease({ ...newRelease, rolloutStrategy: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {strategyOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Planned Date</Label>
                    <Input
                      type="date"
                      value={newRelease.plannedDate}
                      onChange={(e) =>
                        setNewRelease({ ...newRelease, plannedDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Changelog URL (optional)</Label>
                    <Input
                      placeholder="https://..."
                      value={newRelease.changelogUrl}
                      onChange={(e) =>
                        setNewRelease({ ...newRelease, changelogUrl: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRelease} disabled={!newRelease.version}>
                  Create Release
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Releases Alert */}
      {activeReleases.length > 0 && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Rocket className="h-8 w-8 text-blue-500" />
              <div className="flex-1">
                <h3 className="font-semibold">
                  {activeReleases.length} Active Release{activeReleases.length !== 1 ? "s" : ""}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeReleases.map((r) => `v${r.version}`).join(", ")}
                </p>
              </div>
              {activeReleases.some((r) => r.status === "ROLLING_OUT") && (
                <div className="text-right">
                  <p className="text-sm font-medium">Rolling Out</p>
                  <Progress
                    value={activeReleases.find((r) => r.status === "ROLLING_OUT")?.rolloutPercentage || 0}
                    className="w-32 mt-1"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">Total Releases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {releases.filter((r) => r.status === "IN_DEVELOPMENT").length}
            </div>
            <p className="text-xs text-muted-foreground">In Development</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">
              {releases.filter((r) => r.status === "ROLLING_OUT").length}
            </div>
            <p className="text-xs text-muted-foreground">Rolling Out</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {releases.filter((r) => r.status === "COMPLETED").length}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search releases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Release</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rollout</TableHead>
                <TableHead>Planned</TableHead>
                <TableHead>Features</TableHead>
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
              ) : filteredReleases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No releases found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReleases.map((release) => (
                  <TableRow key={release.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/admin/operations/releases/${release.id}`}
                          className="font-medium hover:underline"
                        >
                          v{release.version}
                          {release.name && (
                            <span className="text-muted-foreground ml-1">
                              ({release.name})
                            </span>
                          )}
                        </Link>
                        {release.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {release.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(release.type)}</TableCell>
                    <TableCell>{getStatusBadge(release.status)}</TableCell>
                    <TableCell>
                      {release.status === "ROLLING_OUT" ? (
                        <div className="flex items-center gap-2">
                          <Progress value={release.rolloutPercentage} className="w-16" />
                          <span className="text-xs">{release.rolloutPercentage}%</span>
                        </div>
                      ) : (
                        <Badge variant="outline">{release.rolloutStrategy.replace("_", " ")}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {release.plannedDate ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(release.plannedDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {Array.isArray(release.features) && release.features.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {release.features.length} features
                          </Badge>
                        )}
                        {Array.isArray(release.bugFixes) && release.bugFixes.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {release.bugFixes.length} fixes
                          </Badge>
                        )}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/operations/releases/${release.id}`}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {release.status === "STAGING" && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(release.id, "ROLLING_OUT")}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Rollout
                            </DropdownMenuItem>
                          )}
                          {release.status === "ROLLING_OUT" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(release.id, "COMPLETED")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(release.id, "ROLLBACK")}
                                className="text-red-500"
                              >
                                <Undo className="h-4 w-4 mr-2" />
                                Rollback
                              </DropdownMenuItem>
                            </>
                          )}
                          {["PLANNED", "IN_DEVELOPMENT"].includes(release.status) && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(release.id, "CANCELLED")}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={() => handleDelete(release.id)}
                          >
                            Delete
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
