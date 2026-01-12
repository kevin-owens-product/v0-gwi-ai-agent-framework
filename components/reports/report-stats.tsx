"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Eye, Users, TrendingUp, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentOrganization } from "@/components/providers/organization-provider"

interface StatsData {
  totalReports: number
  totalViews: number
  publishedCount: number
  draftCount: number
}

export function ReportStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const org = useCurrentOrganization()

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/v1/reports?limit=100', {
          headers: { 'x-organization-id': org.id },
        })
        if (response.ok) {
          const responseData = await response.json()
          const reports = Array.isArray(responseData.data) ? responseData.data : []

          // Calculate stats from reports - use meta.total for accurate count
          const totalReports = responseData.meta?.total ?? responseData.total ?? reports.length
          const totalViews = reports.reduce((sum: number, r: any) => sum + (r.views || 0), 0)
          const publishedCount = reports.filter((r: any) => r.status === 'PUBLISHED').length
          const draftCount = reports.filter((r: any) => r.status === 'DRAFT').length

          setStats({
            totalReports,
            totalViews,
            publishedCount,
            draftCount,
          })
        } else {
          // Set default stats on error response
          setStats({
            totalReports: 0,
            totalViews: 0,
            publishedCount: 0,
            draftCount: 0,
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Set default stats on error
        setStats({
          totalReports: 0,
          totalViews: 0,
          publishedCount: 0,
          draftCount: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [org.id])

  const statItems = [
    {
      label: "Total Reports",
      value: stats?.totalReports.toString() || "0",
      change: `${stats?.publishedCount || 0} published`,
      changeType: "positive" as const,
      icon: FileText,
    },
    {
      label: "Total Views",
      value: stats?.totalViews.toLocaleString() || "0",
      change: "All time",
      changeType: "neutral" as const,
      icon: Eye,
    },
    {
      label: "Published",
      value: stats?.publishedCount.toString() || "0",
      change: "Ready to share",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      label: "Drafts",
      value: stats?.draftCount.toString() || "0",
      change: "In progress",
      changeType: "neutral" as const,
      icon: TrendingUp,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-11 w-11 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p
                  className={`text-xs mt-1 ${
                    stat.changeType === "positive" ? "text-emerald-500" : "text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
