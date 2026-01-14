"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Camera,
  Plus,
  Loader2,
  RefreshCw,
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Calendar,
  Filter,
  Trash2,
} from "lucide-react"
import { AdminDataTable, Column, BulkAction } from "@/components/admin/data-table"

interface AnalyticsSnapshot {
  id: string
  type: string
  period: string
  periodStart: string
  periodEnd: string
  totalOrgs: number
  activeOrgs: number
  newOrgs: number
  churnedOrgs: number
  totalUsers: number
  activeUsers: number
  newUsers: number
  totalAgentRuns: number
  totalTokens: string
  totalApiCalls: string
  totalStorage: string
  mrr: number
  arr: number
  newMrr: number
  churnedMrr: number
  expansionMrr: number
  orgsByPlan: Record<string, number>
  orgsByRegion: Record<string, number>
  orgsByIndustry: Record<string, number>
  metrics: Record<string, unknown>
  metadata: Record<string, unknown>
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const SNAPSHOT_TYPES = [
  { value: "PLATFORM", label: "Platform" },
  { value: "USAGE", label: "Usage" },
  { value: "REVENUE", label: "Revenue" },
  { value: "ENGAGEMENT", label: "Engagement" },
  { value: "SECURITY", label: "Security" },
]

const PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

export default function AnalyticsSnapshotsPage() {
  const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter state
  const [filterType, setFilterType] = useState<string>("all")
  const [filterPeriod, setFilterPeriod] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Form state
  const [formData, setFormData] = useState({
    type: "PLATFORM",
    period: "daily",
  })

  const fetchSnapshots = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", currentPage.toString())
      params.set("limit", "10")

      if (filterType && filterType !== "all") {
        params.set("type", filterType)
      }
      if (filterPeriod && filterPeriod !== "all") {
        params.set("period", filterPeriod)
      }
      if (startDate) {
        params.set("startDate", startDate)
      }
      if (endDate) {
        params.set("endDate", endDate)
      }

      const response = await fetch(`/api/admin/analytics/snapshots?${params}`)
      const data = await response.json()
      setSnapshots(data.snapshots)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Failed to fetch snapshots:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSnapshots()
  }, [currentPage, filterType, filterPeriod, startDate, endDate])

  const handleCreateSnapshot = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/analytics/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setDialogOpen(false)
        setFormData({ type: "PLATFORM", period: "daily" })
        fetchSnapshots()
      }
    } catch (error) {
      console.error("Failed to create snapshot:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/analytics/snapshots/${id}`, {
            method: "DELETE",
          })
        )
      )
      fetchSnapshots()
      setSelectedIds(new Set())
    } catch (error) {
      console.error("Failed to delete snapshots:", error)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      PLATFORM: "bg-blue-500/10 text-blue-500",
      USAGE: "bg-green-500/10 text-green-500",
      REVENUE: "bg-yellow-500/10 text-yellow-500",
      ENGAGEMENT: "bg-purple-500/10 text-purple-500",
      SECURITY: "bg-red-500/10 text-red-500",
    }
    return colors[type] || "bg-gray-500/10 text-gray-500"
  }

  // Define columns for AdminDataTable
  const columns: Column<AnalyticsSnapshot>[] = [
    {
      id: "type",
      header: "Type",
      cell: (snapshot) => (
        <Badge className={getTypeColor(snapshot.type)}>
          {snapshot.type}
        </Badge>
      ),
    },
    {
      id: "period",
      header: "Period",
      cell: (snapshot) => (
        <Badge variant="outline">{snapshot.period}</Badge>
      ),
    },
    {
      id: "orgs",
      header: "Orgs",
      headerClassName: "text-right",
      className: "text-right",
      cell: (snapshot) => (
        <div>
          <div className="font-medium">{formatNumber(snapshot.totalOrgs)}</div>
          <div className="text-xs text-muted-foreground">
            +{formatNumber(snapshot.newOrgs)} new
          </div>
        </div>
      ),
    },
    {
      id: "users",
      header: "Users",
      headerClassName: "text-right",
      className: "text-right",
      cell: (snapshot) => (
        <div>
          <div className="font-medium">{formatNumber(snapshot.totalUsers)}</div>
          <div className="text-xs text-muted-foreground">
            {formatNumber(snapshot.activeUsers)} active
          </div>
        </div>
      ),
    },
    {
      id: "mrr",
      header: "MRR",
      headerClassName: "text-right",
      className: "text-right",
      cell: (snapshot) => (
        <div>
          <div className="font-medium">{formatCurrency(snapshot.mrr)}</div>
          <div className="text-xs text-green-500">
            +{formatCurrency(snapshot.newMrr)}
          </div>
        </div>
      ),
    },
    {
      id: "agentRuns",
      header: "Agent Runs",
      headerClassName: "text-right",
      className: "text-right",
      cell: (snapshot) => formatNumber(snapshot.totalAgentRuns),
    },
    {
      id: "date",
      header: "Date",
      cell: (snapshot) => (
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3" />
          {new Date(snapshot.periodStart).toLocaleDateString()}
        </div>
      ),
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: "Delete Selected",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      confirmTitle: "Delete Snapshots",
      confirmDescription: "Are you sure you want to delete the selected snapshots? This action cannot be undone.",
    },
  ]

  // Get latest snapshot for summary cards
  const latestSnapshot = snapshots[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Camera className="h-8 w-8 text-primary" />
            Analytics Snapshots
          </h1>
          <p className="text-muted-foreground">
            Historical platform analytics data and metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSnapshots} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Snapshot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Analytics Snapshot</DialogTitle>
                <DialogDescription>
                  Generate a new analytics snapshot to capture current platform metrics
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Snapshot Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SNAPSHOT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Period</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, period: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODS.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSnapshot} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Snapshot"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      {latestSnapshot && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(latestSnapshot.totalOrgs)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {latestSnapshot.newOrgs > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={latestSnapshot.newOrgs > 0 ? "text-green-500" : "text-red-500"}>
                  +{formatNumber(latestSnapshot.newOrgs)}
                </span>
                <span className="ml-1">new this period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(latestSnapshot.totalUsers)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Activity className="h-3 w-3 mr-1" />
                {formatNumber(latestSnapshot.activeUsers)} active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(latestSnapshot.mrr)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {latestSnapshot.newMrr > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={latestSnapshot.newMrr > 0 ? "text-green-500" : "text-red-500"}>
                  +{formatCurrency(latestSnapshot.newMrr)}
                </span>
                <span className="ml-1">new</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Agent Runs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(latestSnapshot.totalAgentRuns)}</div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(parseInt(latestSnapshot.totalTokens))} tokens consumed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {SNAPSHOT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Period</Label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[150px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[150px]"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterType("all")
                  setFilterPeriod("all")
                  setStartDate("")
                  setEndDate("")
                  setCurrentPage(1)
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Snapshots Table */}
      <Card>
        <CardHeader>
          <CardTitle>Snapshot History</CardTitle>
          <CardDescription>
            {pagination?.total || 0} total snapshots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminDataTable
            data={snapshots}
            columns={columns}
            getRowId={(snapshot) => snapshot.id}
            isLoading={isLoading}
            emptyMessage="No snapshots found"
            viewHref={(snapshot) => `/admin/analytics/snapshots/${snapshot.id}`}
            bulkActions={bulkActions}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            page={pagination?.page || 1}
            totalPages={pagination?.totalPages || 1}
            total={pagination?.total}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
