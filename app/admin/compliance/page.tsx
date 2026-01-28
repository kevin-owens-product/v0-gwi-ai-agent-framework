"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import {
  Fingerprint,
  FileSearch,
  Gavel,
  Download,
  Calendar,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface ComplianceStats {
  totalFrameworks: number
  activeFrameworks: number
  compliantOrgs: number
  nonCompliantOrgs: number
  pendingAudits: number
  activeLegalHolds: number
  pendingExports: number
  retentionPolicies: number
  overallComplianceScore: number
}

interface ComplianceFramework {
  id: string
  name: string
  code: string
  attestationCount: number
  compliantCount: number
  score: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
  status: string
}

export default function ComplianceOverviewPage() {
  const t = useTranslations("admin.compliance")
  const [stats, setStats] = useState<ComplianceStats | null>(null)
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComplianceData()
  }, [])

  const fetchComplianceData = async () => {
    try {
      const response = await fetch("/api/admin/compliance/overview")
      const data = await response.json()
      setStats(data.stats)
      setFrameworks(data.frameworks || [])
      setRecentActivity(data.recentActivity || [])
    } catch (error) {
      console.error("Failed to fetch compliance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-yellow-500"
    return "text-red-500"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return <Badge className="bg-green-500">{t("statuses.compliant")}</Badge>
      case "NON_COMPLIANT":
        return <Badge variant="destructive">{t("statuses.nonCompliant")}</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500">{t("statuses.inProgress")}</Badge>
      case "PENDING":
        return <Badge variant="secondary">{t("statuses.pending")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
            <Fingerprint className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/compliance/legal-holds">
              <Gavel className="h-4 w-4 mr-2" />
              {t("legalHolds")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/compliance/data-exports">
              <Download className="h-4 w-4 mr-2" />
              {t("dataExports")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Compliance Score */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("overallScore.title")}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`text-5xl font-bold ${getScoreColor(stats?.overallComplianceScore || 0)}`}>
                  {stats?.overallComplianceScore || 0}%
                </span>
                {(stats?.overallComplianceScore || 0) >= 90 ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (stats?.overallComplianceScore || 0) >= 70 ? (
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-green-500">{stats?.compliantOrgs || 0}</p>
                <p className="text-xs text-muted-foreground">{t("overallScore.compliantOrgs")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">{stats?.pendingAudits || 0}</p>
                <p className="text-xs text-muted-foreground">{t("overallScore.pendingAudits")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{stats?.nonCompliantOrgs || 0}</p>
                <p className="text-xs text-muted-foreground">{t("overallScore.nonCompliant")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.frameworks.title")}</CardTitle>
            <FileSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFrameworks || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeFrameworks || 0} {t("stats.frameworks.active")}
            </p>
            <Link
              href="/admin/compliance/frameworks"
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center"
            >
              {t("stats.frameworks.manageLink")} <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.legalHolds.title")}</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeLegalHolds || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.legalHolds.description")}
            </p>
            <Link
              href="/admin/compliance/legal-holds"
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center"
            >
              {t("stats.legalHolds.viewLink")} <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.pendingExports.title")}</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingExports || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.pendingExports.description")}
            </p>
            <Link
              href="/admin/compliance/data-exports"
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center"
            >
              {t("stats.pendingExports.processLink")} <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.retentionPolicies.title")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.retentionPolicies || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.retentionPolicies.description")}
            </p>
            <Link
              href="/admin/compliance/retention-policies"
              className="text-xs text-primary hover:underline mt-2 inline-flex items-center"
            >
              {t("stats.retentionPolicies.manageLink")} <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Frameworks & Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("frameworksOverview.title")}</CardTitle>
            <CardDescription>{t("frameworksOverview.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {frameworks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t("frameworksOverview.noFrameworks")}
                </p>
              ) : (
                frameworks.slice(0, 5).map((framework) => (
                  <div key={framework.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{framework.name}</span>
                        <Badge variant="outline">{framework.code}</Badge>
                      </div>
                      <span className={`font-bold ${getScoreColor(framework.score)}`}>
                        {framework.score}%
                      </span>
                    </div>
                    <Progress value={framework.score} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t("frameworksOverview.orgsCompliant", { count: framework.compliantCount })}</span>
                      <span>{t("frameworksOverview.attestations", { count: framework.attestationCount })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {frameworks.length > 0 && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/admin/compliance/frameworks">
                  {t("frameworksOverview.viewAll")}
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("activity.title")}</CardTitle>
            <CardDescription>{t("activity.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t("activity.noActivity")}
                </p>
              ) : (
                recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {activity.type === "LEGAL_HOLD" ? (
                        <Gavel className="h-4 w-4 text-muted-foreground" />
                      ) : activity.type === "DATA_EXPORT" ? (
                        <Download className="h-4 w-4 text-muted-foreground" />
                      ) : activity.type === "AUDIT" ? (
                        <FileSearch className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {getStatusBadge(activity.status)}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/admin/compliance/frameworks">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <FileSearch className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">{t("quickActions.frameworks.title")}</p>
                  <p className="text-sm text-muted-foreground">{t("quickActions.frameworks.description")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/compliance/legal-holds">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/10">
                  <Gavel className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">{t("quickActions.legalHolds.title")}</p>
                  <p className="text-sm text-muted-foreground">{t("quickActions.legalHolds.description")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/compliance/data-exports">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Download className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">{t("quickActions.dataExports.title")}</p>
                  <p className="text-sm text-muted-foreground">{t("quickActions.dataExports.description")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/compliance/retention-policies">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">{t("quickActions.retention.title")}</p>
                  <p className="text-sm text-muted-foreground">{t("quickActions.retention.description")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
