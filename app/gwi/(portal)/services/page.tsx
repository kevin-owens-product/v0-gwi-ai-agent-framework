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
  AlertCircle,
  DollarSign,
  Loader2,
} from "lucide-react"
import { useTranslations } from "@/lib/i18n"

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
  const t = useTranslations('gwi.services.dashboard')

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/gwi/services/stats', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (response.ok) {
          const data = await response.json()
          // Format time relative to now
          const formatTimeAgo = (isoString: string) => {
            const date = new Date(isoString)
            const now = new Date()
            const diffMs = now.getTime() - date.getTime()
            const diffMins = Math.floor(diffMs / 60000)
            const diffHours = Math.floor(diffMs / 3600000)
            const diffDays = Math.floor(diffMs / 86400000)

            if (diffMins < 60) return `${diffMins} minutes ago`
            if (diffHours < 24) return `${diffHours} hours ago`
            if (diffDays === 1) return 'Yesterday'
            return `${diffDays} days ago`
          }

          setStats({
            ...data,
            recentActivity: data.recentActivity.map((a: any) => ({
              ...a,
              time: formatTimeAgo(a.time),
            })),
          })
        } else {
          // Fallback to empty stats
          setStats({
            clients: { total: 0, active: 0 },
            projects: { total: 0, inProgress: 0 },
            invoices: { draft: 0, sent: 0, overdue: 0, totalDue: 0 },
            team: { total: 0, onProjects: 0 },
            recentActivity: [],
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Fallback to empty stats
        setStats({
          clients: { total: 0, active: 0 },
          projects: { total: 0, inProgress: 0 },
          invoices: { draft: 0, sent: 0, overdue: 0, totalDue: 0 },
          team: { total: 0, onProjects: 0 },
          recentActivity: [],
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
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
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('activeClients')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.clients.active}</div>
            <p className="text-xs text-muted-foreground">
              {t('ofTotalClients', { total: stats?.clients.total ?? 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('activeProjects')}</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.projects.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              {t('ofTotalProjects', { total: stats?.projects.total ?? 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pendingInvoices')}</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.invoices.sent}</div>
            <p className="text-xs text-muted-foreground">
              {t('overdue', { count: stats?.invoices.overdue ?? 0 })}
              {stats?.invoices.overdue ? (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {t('attention')}
                </Badge>
              ) : null}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('amountDue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.invoices.totalDue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('acrossAllInvoices')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('quickActions')}</CardTitle>
            <CardDescription>{t('quickActionsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/gwi/services/clients/new">
                <span className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  {t('addNewClient')}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/gwi/services/projects/new">
                <span className="flex items-center">
                  <FolderKanban className="h-4 w-4 mr-2" />
                  {t('createProject')}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/gwi/services/time">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {t('logTime')}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/gwi/services/invoicing/new">
                <span className="flex items-center">
                  <Receipt className="h-4 w-4 mr-2" />
                  {t('createInvoice')}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
            <CardDescription>{t('recentActivityDesc')}</CardDescription>
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
              <h3 className="font-medium">{t('clients')}</h3>
              <p className="text-xs text-muted-foreground">
                {t('clientsCount', { count: stats?.clients.total ?? 0 })}
              </p>
            </div>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/gwi/services/projects" className="block p-4">
            <div className="flex flex-col items-center text-center">
              <FolderKanban className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">{t('projects')}</h3>
              <p className="text-xs text-muted-foreground">
                {t('projectsCount', { count: stats?.projects.total ?? 0 })}
              </p>
            </div>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/gwi/services/time" className="block p-4">
            <div className="flex flex-col items-center text-center">
              <Clock className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">{t('timeTracking')}</h3>
              <p className="text-xs text-muted-foreground">{t('logAndReview')}</p>
            </div>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/gwi/services/invoicing" className="block p-4">
            <div className="flex flex-col items-center text-center">
              <Receipt className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">{t('invoicing')}</h3>
              <p className="text-xs text-muted-foreground">
                {t('pending', { count: (stats?.invoices.draft ?? 0) + (stats?.invoices.sent ?? 0) })}
              </p>
            </div>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/gwi/services/vendors" className="block p-4">
            <div className="flex flex-col items-center text-center">
              <Truck className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">{t('vendors')}</h3>
              <p className="text-xs text-muted-foreground">{t('manageVendors')}</p>
            </div>
          </Link>
        </Card>

        <Card className="hover:bg-muted/50 transition-colors">
          <Link href="/gwi/services/team" className="block p-4">
            <div className="flex flex-col items-center text-center">
              <UsersRound className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">{t('team')}</h3>
              <p className="text-xs text-muted-foreground">
                {t('teamMembers', { count: stats?.team.total ?? 0 })}
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
                {t('overdueInvoices', { count: stats?.invoices.overdue ?? 0 })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('reviewOverdue')}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/gwi/services/invoicing?status=OVERDUE">{t('viewOverdue')}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
