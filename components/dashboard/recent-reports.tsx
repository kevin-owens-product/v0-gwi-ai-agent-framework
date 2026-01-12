"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, ArrowRight, Loader2, Eye, Clock } from "lucide-react"
import Link from "next/link"

interface Report {
  id: string
  title: string
  status: "draft" | "published" | "generating"
  createdAt: string
  type?: string
}

// Format a date to relative time
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

// Demo reports shown when API returns empty or errors
const demoReports: Report[] = [
  {
    id: "1",
    title: "Q4 2024 Consumer Trends Report",
    status: "published",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: "trends",
  },
  {
    id: "2",
    title: "Gen Z Brand Perception Analysis",
    status: "published",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    type: "analysis",
  },
  {
    id: "3",
    title: "Competitive Landscape Overview",
    status: "generating",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    type: "competitive",
  },
  {
    id: "4",
    title: "Market Expansion Feasibility Study",
    status: "draft",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    type: "research",
  },
]

const statusStyles = {
  published: { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: Eye },
  generating: { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Loader2 },
  draft: { badge: "bg-muted text-muted-foreground border-border", icon: Clock },
}

export function RecentReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch("/api/v1/reports?limit=4")
        if (!response.ok) {
          setReports(demoReports)
          return
        }
        const data = await response.json()
        const fetchedReports = data.reports || data.data || []

        if (fetchedReports.length === 0) {
          setReports(demoReports)
        } else {
          const transformedReports: Report[] = fetchedReports.slice(0, 4).map((r: any) => ({
            id: r.id,
            title: r.title || r.name,
            status: r.status?.toLowerCase() === "published" ? "published" :
                    r.status?.toLowerCase() === "generating" ? "generating" : "draft",
            createdAt: r.createdAt || r.created_at || new Date().toISOString(),
            type: r.type,
          }))
          setReports(transformedReports)
        }
      } catch (err) {
        setReports(demoReports)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [])

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-medium">Recent Reports</CardTitle>
        <Link href="/dashboard/reports">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No reports yet</p>
            <Link href="/dashboard/reports/new">
              <Button variant="outline" size="sm" className="mt-2">
                Create Report
              </Button>
            </Link>
          </div>
        ) : (
          reports.map((report) => {
            const status = statusStyles[report.status]
            const StatusIcon = status.icon

            return (
              <Link key={report.id} href={`/dashboard/reports/${report.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-accent/30 transition-all cursor-pointer group">
                  <div className="p-2 rounded-lg bg-teal-500/10">
                    <FileText className="h-4 w-4 text-teal-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                        {report.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(new Date(report.createdAt))}
                      </span>
                    </div>
                  </div>

                  <Badge variant="outline" className={`text-xs ${status.badge} flex items-center gap-1`}>
                    <StatusIcon className={`h-3 w-3 ${report.status === "generating" ? "animate-spin" : ""}`} />
                    {report.status}
                  </Badge>
                </div>
              </Link>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
