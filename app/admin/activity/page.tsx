/**
 * @prompt-id forge-v4.1:feature:admin-activity:009
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  BarChart3,
  Clock,
  RefreshCw,
  Download,
} from "lucide-react"
import {
  ActivityTimeline,
  ActivityFilters,
  AdminStatsCards,
  AdminProductivityCard,
  ActivityChart,
  type FilterState,
} from "@/components/admin/activity"

interface Admin {
  id: string
  name: string
  email: string
  role: string
}

interface ActivityItem {
  id: string
  adminId: string
  action: string
  resourceType: string
  resourceId: string | null
  description: string | null
  ipAddress: string | null
  userAgent: string | null
  duration: number | null
  status: string
  errorMessage: string | null
  metadata: Record<string, unknown>
  createdAt: string
  admin?: Admin
}

interface ActivityStats {
  totalActivities: number
  activitiesByAction: { action: string; count: number }[]
  activitiesByAdmin: {
    adminId: string
    admin?: Admin
    count: number
  }[]
  activitiesByResource: { resourceType: string; count: number }[]
  activitiesByStatus: { status: string; count: number }[]
  hourlyDistribution: number[]
  busiestHours: { hour: number; count: number }[]
  dailyActivityData: { date: string; count: number }[]
  avgResponseTime: number
}

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<FilterState>({
    adminId: "all",
    action: "all",
    resourceType: "all",
    startDate: "",
    endDate: "",
  })

  // Fetch admins for filter dropdown
  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/admins")
      const data = await response.json()
      setAdmins(data.admins || [])
    } catch (error) {
      console.error("Failed to fetch admins:", error)
    }
  }, [])

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    setIsLoadingActivities(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        ...(filters.adminId !== "all" && { adminId: filters.adminId }),
        ...(filters.action !== "all" && { action: filters.action }),
        ...(filters.resourceType !== "all" && { resourceType: filters.resourceType }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      })

      const response = await fetch(`/api/admin/activity?${params}`)
      const data = await response.json()

      setActivities(data.activities || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setIsLoadingActivities(false)
    }
  }, [page, filters])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true)
    try {
      const params = new URLSearchParams({
        ...(filters.adminId !== "all" && { adminId: filters.adminId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      })

      const response = await fetch(`/api/admin/activity/stats?${params}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setIsLoadingStats(false)
    }
  }, [filters])

  // Initial load
  useEffect(() => {
    fetchAdmins()
  }, [fetchAdmins])

  // Fetch data when filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchActivities()
      fetchStats()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchActivities, fetchStats])

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchActivities()
    fetchStats()
  }

  // Handle export
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        limit: "1000",
        ...(filters.adminId !== "all" && { adminId: filters.adminId }),
        ...(filters.action !== "all" && { action: filters.action }),
        ...(filters.resourceType !== "all" && { resourceType: filters.resourceType }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      })

      const response = await fetch(`/api/admin/activity?${params}`)
      const data = await response.json()

      // Convert to CSV
      const headers = [
        "Timestamp",
        "Admin",
        "Action",
        "Resource Type",
        "Resource ID",
        "Status",
        "Duration (ms)",
        "IP Address",
        "Description",
      ]

      const rows = (data.activities || []).map((activity: ActivityItem) => [
        new Date(activity.createdAt).toISOString(),
        activity.admin?.name || "Unknown",
        activity.action,
        activity.resourceType,
        activity.resourceId || "",
        activity.status,
        activity.duration?.toString() || "",
        activity.ipAddress || "",
        activity.description || "",
      ])

      const csvContent = [
        headers.join(","),
        ...rows.map((row: string[]) =>
          row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n")

      // Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `admin-activity-${new Date().toISOString().split("T")[0]}.csv`
      link.click()
    } catch (error) {
      console.error("Failed to export:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Admin Activity Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and analyze administrative actions across the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards stats={stats} isLoading={isLoadingStats} />

      {/* Main Content */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline" className="gap-2">
            <Clock className="h-4 w-4" />
            Activity Timeline
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFilters
                admins={admins}
                onFilterChange={handleFilterChange}
              />
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    {total.toLocaleString()} activities found
                  </CardDescription>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoadingActivities}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || isLoadingActivities}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ActivityTimeline
                activities={activities}
                isLoading={isLoadingActivities}
                emptyMessage="No activities found matching your filters"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ActivityChart stats={stats} isLoading={isLoadingStats} />
            </div>
            <div>
              <AdminProductivityCard stats={stats} isLoading={isLoadingStats} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
