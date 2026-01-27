"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import {
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  Globe,
  TrendingUp,
  Users,
  Building2,
  Clock,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface SecurityStats {
  totalPolicies: number
  activePolicies: number
  totalViolations: number
  openViolations: number
  criticalViolations: number
  activeThreats: number
  blockedIPs: number
  recentLoginAttempts: number
  failedLogins: number
  suspiciousActivities: number
  mfaAdoption: number
  ssoAdoption: number
}

interface RecentEvent {
  id: string
  type: string
  severity: string
  description: string
  timestamp: string
  orgName?: string
  userName?: string
}

export default function SecurityOverviewPage() {
  const t = useTranslations("admin.security")
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    try {
      const response = await fetch("/api/admin/security/overview")
      const data = await response.json()
      setStats(data.stats)
      setRecentEvents(data.recentEvents)
    } catch (error) {
      console.error("Failed to fetch security data:", error)
    } finally {
      setLoading(false)
    }
  }

  const severityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-500"
      case "WARNING":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("loading")}</p>
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
            <Shield className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/security/policies">
              <Lock className="h-4 w-4 mr-2" />
              {t("managePolicies")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Security Score */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("platformSecurityScore")}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-5xl font-bold text-primary">
                  {stats ? Math.round(100 - (stats.openViolations / Math.max(stats.totalViolations, 1)) * 100) : 0}
                </span>
                <div className="flex items-center text-green-500">
                  <TrendingUp className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">{t("thisWeek")}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-green-500">{stats?.activePolicies || 0}</p>
                <p className="text-xs text-muted-foreground">{t("activePolicies")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">{stats?.openViolations || 0}</p>
                <p className="text-xs text-muted-foreground">{t("openViolations")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{stats?.activeThreats || 0}</p>
                <p className="text-xs text-muted-foreground">{t("activeThreats")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("securityPolicies")}</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPolicies || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("totalPoliciesActive", { count: stats?.activePolicies || 0 })}
            </p>
            <Link
              href="/admin/security/policies"
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center"
            >
              {t("viewPolicies")} <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("securityViolations")}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.openViolations || 0}</div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">
                {t("critical", { count: stats?.criticalViolations || 0 })}
              </Badge>
            </div>
            <Link
              href="/admin/security/violations"
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center"
            >
              {t("reviewViolations")} <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("activeThreats")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats?.activeThreats || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("requireImmediateAttention")}
            </p>
            <Link
              href="/admin/security/threats"
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center"
            >
              {t("viewThreats")} <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("blockedIPs")}</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.blockedIPs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("platformWideRestrictions")}
            </p>
            <Link
              href="/admin/security/ip-blocklist"
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center"
            >
              {t("manageIPs")} <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Authentication & Access Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("authenticationOverview")}</CardTitle>
            <CardDescription>{t("loginActivityMetrics")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t("mfaAdoptionRate")}</span>
                <span className="font-medium">{stats?.mfaAdoption || 0}%</span>
              </div>
              <Progress value={stats?.mfaAdoption || 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t("ssoAdoptionRate")}</span>
                <span className="font-medium">{stats?.ssoAdoption || 0}%</span>
              </div>
              <Progress value={stats?.ssoAdoption || 0} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats?.recentLoginAttempts || 0}</p>
                <p className="text-xs text-muted-foreground">{t("loginAttempts24h")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">{stats?.failedLogins || 0}</p>
                <p className="text-xs text-muted-foreground">{t("failedLogins24h")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("recentSecurityEvents")}</CardTitle>
            <CardDescription>{t("latestSecurityActivities")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t("noRecentEvents")}
                </p>
              ) : (
                recentEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${severityColor(event.severity)}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {event.orgName && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {event.orgName}
                          </span>
                        )}
                        {event.userName && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.userName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Badge variant={event.severity === "CRITICAL" ? "destructive" : "secondary"}>
                      {event.type}
                    </Badge>
                  </div>
                ))
              )}
            </div>
            {recentEvents.length > 0 && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/admin/security/violations">
                  {t("viewAllEvents")}
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/admin/security/policies">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Lock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">{t("securityPolicies")}</p>
                  <p className="text-sm text-muted-foreground">{t("configureRules")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/security/threats">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">{t("threatDetection")}</p>
                  <p className="text-sm text-muted-foreground">{t("monitorThreats")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/security/violations">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Eye className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium">{t("violations")}</p>
                  <p className="text-sm text-muted-foreground">{t("reviewPolicyViolations")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/security/ip-blocklist">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Globe className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">{t("ipBlocklist")}</p>
                  <p className="text-sm text-muted-foreground">{t("manageBlockedAddresses")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
