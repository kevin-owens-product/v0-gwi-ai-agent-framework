"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  FolderKanban,
  Clock,
  Receipt,
  Truck,
  UsersRound,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Loader2,
} from "lucide-react"

interface DashboardStats {
  clients: { total: number; active: number }
  projects: { total: number; inProgress: number }
  invoices: { draft: number; sent: number; overdue: number; totalDue: number }
  team: { total: number; onProjects: number }
  recentActivity: Array<{
    id: string
    type: string
    title: string
    time: string
  }>
}

export default function ServicesDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, this would fetch from an API
    // For now, we'll use placeholder data
    setTimeout(() => {
      setStats({
        clients: { total: 24, active: 18 },
        projects: { total: 42, inProgress: 12 },
        invoices: { draft: 5, sent: 8, overdue: 2, totalDue: 45000 },
        team: { total: 15, onProjects: 12 },
        recentActivity: [
          { id: "1", type: "invoice", title: "Invoice INV-00042 sent to Acme Corp", time: "2 hours ago" },
          { id: "2", type: "project", title: "Project PRJ-0015 completed", time: "5 hours ago" },
          { id: "3", type: "time", title: "8 hours logged on Project PRJ-0012", time: "Yesterday" },
          { id: "4", type: "client", title: "New client TechStart Inc added", time: "2 days ago" },
        ],
      })
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Services Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your services business
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.clients.active}</div>
            <p className="text-xs text-muted-foreground">
              of {stats?.clients.total} total clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.projects.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              of {stats?.projects.total} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.invoices.sent}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.invoices.overdue} overdue
              {stats?.invoices.overdue ? (
                <Badge variant="destructive" className="ml-2 text-xs">
                  Attention
                </Badge>
              ) : null}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.invoices.totalDue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              across all open invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/gwi/services/clients/new">
                <span className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Add New Client
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/gwi/services/projects/new">
                <span className="flex items-center">
                  <FolderKanban className="h-4 w-4 mr-2" />
                  Create Project
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/gwi/services/time">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Log Time
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/gwi/services/invoicing/new">
                <span className="flex items-center">
                  <Receipt className="h-4 w-4 mr-2" />
                  Create Invoice
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {activity.type === "invoice" && <Receipt className="h-4 w-4" />}
                    {activity.type === "project" && <FolderKanban className="h-4 w-4" />}
                    {activity.type === "time" && <Clock className="h-4 w-4" />}
                    {activity.type === "client" && <Building2 className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Links */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/gwi/services/clients" className="block p-4">
            <div className="flex flex-col items-center text-center">
              <Building2 className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Clients</h3>
              <p className="text-xs text-muted-foreground">
                {stats?.clients.total} clients
              </p>
            </div>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/gwi/services/projects" className="block p-4">
            <div className="flex flex-col items-center text-center">
              <FolderKanban className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Projects</h3>
              <p className="text-xs text-muted-foreground">
                {stats?.projects.total} projects
              </p>
            </div>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/gwi/services/time" className="block p-4">
            <div className="flex flex-col items-center text-center">
              <Clock className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Time Tracking</h3>
              <p className="text-xs text-muted-foreground">Log & review</p>
            </div>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/gwi/services/invoicing" className="block p-4">
            <div className="flex flex-col items-center text-center">
              <Receipt className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Invoicing</h3>
              <p className="text-xs text-muted-foreground">
                {(stats?.invoices.draft ?? 0) + (stats?.invoices.sent ?? 0)} pending
              </p>
            </div>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/gwi/services/vendors" className="block p-4">
            <div className="flex flex-col items-center text-center">
              <Truck className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Vendors</h3>
              <p className="text-xs text-muted-foreground">Manage vendors</p>
            </div>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/gwi/services/team" className="block p-4">
            <div className="flex flex-col items-center text-center">
              <UsersRound className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Team</h3>
              <p className="text-xs text-muted-foreground">
                {stats?.team.total} members
              </p>
            </div>
          </Link>
        </Card>
      </div>

      {/* Alerts */}
      {(stats?.invoices.overdue ?? 0) > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">
                {stats?.invoices.overdue} overdue invoice(s)
              </p>
              <p className="text-sm text-muted-foreground">
                Review and follow up on overdue payments
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/gwi/services/invoicing?status=OVERDUE">View Overdue</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
