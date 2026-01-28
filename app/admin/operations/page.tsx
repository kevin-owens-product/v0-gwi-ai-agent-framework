"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  Server,
  AlertCircle,
  Calendar,
  Rocket,
  Gauge,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity,
  Cpu,
  HardDrive,
  Database,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface OperationsStats {
  activeIncidents: number
  criticalIncidents: number
  scheduledMaintenance: number
  activeReleases: number
  systemHealth: number
  cpuUsage: number
  memoryUsage: number
  storageUsage: number
  apiLatency: number
  errorRate: number
  uptime: number
  activeConnections: number
}

interface RecentIncident {
  id: string
  title: string
  severity: string
  status: string
  startedAt: string
  affectedServices: string[]
}

export default function OperationsCenterPage() {
  const t = useTranslations("admin.operations")
  const tCommon = useTranslations("common")
  const [stats, setStats] = useState<OperationsStats | null>(null)
  const [incidents, setIncidents] = useState<RecentIncident[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOperationsData()
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchOperationsData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchOperationsData = async () => {
    try {
      const response = await fetch("/api/admin/operations/overview")
      const data = await response.json()
      setStats(data.stats)
      setIncidents(data.recentIncidents || [])
    } catch (error) {
      console.error("Failed to fetch operations data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-500"
      case "INVESTIGATING":
        return "bg-yellow-500"
      case "IDENTIFIED":
        return "bg-blue-500"
      default:
        return "bg-red-500"
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="destructive">{t("severity.critical")}</Badge>
      case "MAJOR":
        return <Badge className="bg-orange-500">{t("severity.major")}</Badge>
      case "MODERATE":
        return <Badge className="bg-yellow-500">{t("severity.moderate")}</Badge>
      default:
        return <Badge variant="secondary">{t("severity.minor")}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("overview.title")}</h1>
            <p className="text-muted-foreground">{tCommon("loading")}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Server className="h-8 w-8 text-primary" />
            {t("overview.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("overview.description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/operations/incidents">
              <AlertCircle className="h-4 w-4 mr-2" />
              {t("overview.manageIncidents")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/operations/maintenance">
              <Calendar className="h-4 w-4 mr-2" />
              {t("overview.scheduleMaintenance")}
            </Link>
          </Button>
        </div>
      </div>

      {/* System Status Banner */}
      <Card
        className={`border-2 ${
          stats?.activeIncidents === 0
            ? "border-green-500/50 bg-green-500/5"
            : stats?.criticalIncidents && stats.criticalIncidents > 0
            ? "border-red-500/50 bg-red-500/5"
            : "border-yellow-500/50 bg-yellow-500/5"
        }`}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {stats?.activeIncidents === 0 ? (
                <CheckCircle className="h-10 w-10 text-green-500" />
              ) : stats?.criticalIncidents && stats.criticalIncidents > 0 ? (
                <AlertCircle className="h-10 w-10 text-red-500" />
              ) : (
                <AlertTriangle className="h-10 w-10 text-yellow-500" />
              )}
              <div>
                <h2 className="text-xl font-semibold">
                  {stats?.activeIncidents === 0
                    ? t("overview.allSystemsOperational")
                    : stats?.criticalIncidents && stats.criticalIncidents > 0
                    ? t("overview.criticalIncidentsActive")
                    : t("overview.someSystemsAffected")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {stats?.activeIncidents === 0
                    ? t("overview.noActiveIncidents")
                    : t("overview.activeIncidentsCount", { count: stats?.activeIncidents || 0 })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-500">{stats?.uptime || 99.99}%</p>
              <p className="text-xs text-muted-foreground">{t("overview.thirtyDayUptime")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.activeIncidents")}</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeIncidents || 0}
            </div>
            {(stats?.criticalIncidents ?? 0) > 0 && (
              <Badge variant="destructive" className="mt-2">
                {t("stats.criticalCount", { count: stats?.criticalIncidents || 0 })}
              </Badge>
            )}
            <Link
              href="/admin/operations/incidents"
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center"
            >
              {t("stats.viewIncidents")} <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.scheduledMaintenance")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.scheduledMaintenance || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.upcomingWindows")}</p>
            <Link
              href="/admin/operations/maintenance"
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center"
            >
              {t("stats.viewSchedule")} <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.activeReleases")}</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeReleases || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.rollingOut")}</p>
            <Link
              href="/admin/operations/releases"
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center"
            >
              {t("stats.manageReleases")} <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.systemHealth")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats?.systemHealth || 100}%
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.overallHealthScore")}</p>
            <Link
              href="/admin/operations/capacity"
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center"
            >
              {t("stats.viewCapacity")} <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("resources.title")}</CardTitle>
            <CardDescription>{t("resources.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  {t("resources.cpuUsage")}
                </span>
                <span className="font-medium">{stats?.cpuUsage || 0}%</span>
              </div>
              <Progress
                value={stats?.cpuUsage || 0}
                className={`h-2 ${(stats?.cpuUsage || 0) > 80 ? "[&>div]:bg-red-500" : ""}`}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  {t("resources.memoryUsage")}
                </span>
                <span className="font-medium">{stats?.memoryUsage || 0}%</span>
              </div>
              <Progress
                value={stats?.memoryUsage || 0}
                className={`h-2 ${(stats?.memoryUsage || 0) > 80 ? "[&>div]:bg-red-500" : ""}`}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  {t("resources.storageUsage")}
                </span>
                <span className="font-medium">{stats?.storageUsage || 0}%</span>
              </div>
              <Progress
                value={stats?.storageUsage || 0}
                className={`h-2 ${(stats?.storageUsage || 0) > 80 ? "[&>div]:bg-red-500" : ""}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats?.apiLatency || 0}ms</p>
                <p className="text-xs text-muted-foreground">{t("resources.apiLatency")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats?.activeConnections?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">{t("resources.activeConnections")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("recentIncidents.title")}</CardTitle>
            <CardDescription>{t("recentIncidents.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-muted-foreground">{t("recentIncidents.noIncidents")}</p>
                </div>
              ) : (
                incidents.slice(0, 5).map((incident) => (
                  <div key={incident.id} className="flex items-start gap-3">
                    <div
                      className={`mt-1.5 h-2 w-2 rounded-full ${getStatusColor(
                        incident.status
                      )}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{incident.title}</p>
                        {getSeverityBadge(incident.severity)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(incident.startedAt).toLocaleString()}
                      </div>
                      {incident.affectedServices.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {incident.affectedServices.slice(0, 3).map((service) => (
                            <Badge key={service} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {incidents.length > 0 && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/admin/operations/incidents">{t("recentIncidents.viewAll")}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/admin/operations/incidents">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">{t("quickActions.incidents")}</p>
                  <p className="text-sm text-muted-foreground">{t("quickActions.incidentsDescription")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/operations/maintenance">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">{t("quickActions.maintenance")}</p>
                  <p className="text-sm text-muted-foreground">{t("quickActions.maintenanceDescription")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/operations/releases">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Rocket className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">{t("quickActions.releases")}</p>
                  <p className="text-sm text-muted-foreground">{t("quickActions.releasesDescription")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/operations/capacity">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Gauge className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">{t("quickActions.capacity")}</p>
                  <p className="text-sm text-muted-foreground">{t("quickActions.capacityDescription")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
