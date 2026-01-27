import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LoadingText } from "@/components/ui/loading-text"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Database,
  BarChart3,
  TrendingUp,
  TrendingDown,
  FileWarning,
  RefreshCw,
} from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

async function getDataQualityMetrics() {
  const dataSources = await prisma.gWIDataSourceConnection.findMany({
    where: { isActive: true },
    include: {
      createdBy: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  })

  return { dataSources }
}

// Mock quality metrics - in production these would come from actual quality checks
const mockQualityMetrics = [
  {
    metric: "Completeness",
    description: "Percentage of non-null values",
    score: 94.5,
    trend: "up",
    status: "good",
  },
  {
    metric: "Consistency",
    description: "Data format consistency",
    score: 87.2,
    trend: "down",
    status: "warning",
  },
  {
    metric: "Accuracy",
    description: "Validation rule pass rate",
    score: 98.1,
    trend: "up",
    status: "good",
  },
  {
    metric: "Timeliness",
    description: "Data freshness score",
    score: 72.3,
    trend: "down",
    status: "warning",
  },
]

const qualityIssues = [
  {
    id: 1,
    source: "Survey Responses DB",
    issue: "Missing required fields in 245 records",
    severity: "error",
    detected: "2 hours ago",
  },
  {
    id: 2,
    source: "Analytics Events",
    issue: "Date format inconsistency detected",
    severity: "warning",
    detected: "5 hours ago",
  },
  {
    id: 3,
    source: "User Profiles",
    issue: "Duplicate records identified (12 records)",
    severity: "warning",
    detected: "1 day ago",
  },
]

async function DataQualityContent() {
  const { dataSources } = await getDataQualityMetrics()
  const t = await getTranslations('gwi.dataSources.quality')

  const overallScore = mockQualityMetrics.reduce((sum, m) => sum + m.score, 0) / mockQualityMetrics.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="7d">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('timeRange')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">{t('last24Hours')}</SelectItem>
              <SelectItem value="7d">{t('last7Days')}</SelectItem>
              <SelectItem value="30d">{t('last30Days')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('runQualityCheck')}
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-600">
                  {overallScore.toFixed(0)}%
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{t('overallScore')}</h2>
                <p className="text-muted-foreground">
                  {t('aggregatedAcross', { count: dataSources.length })}
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 text-lg px-4 py-1">
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('healthy')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockQualityMetrics.map((metric) => {
          const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
          const trendColor = metric.trend === "up" ? "text-green-600" : "text-red-600"
          const statusColor = metric.status === "good"
            ? "bg-green-100"
            : metric.status === "warning"
            ? "bg-yellow-100"
            : "bg-red-100"

          return (
            <Card key={metric.metric}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.metric}
                    </p>
                    <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">{metric.score.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={metric.score}
                    className={`h-2 ${statusColor}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quality Trend Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('qualityScoreTrends')}
          </CardTitle>
          <CardDescription>{t('metricsOverTime')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border rounded-lg bg-slate-50">
            <div className="text-center">
              <LineChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {t('trendChartsComingSoon')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5" />
            {t('activeQualityIssues')}
          </CardTitle>
          <CardDescription>{t('issuesRequiringAttention')}</CardDescription>
        </CardHeader>
        <CardContent>
          {qualityIssues.length > 0 ? (
            <div className="space-y-3">
              {qualityIssues.map((issue) => {
                const severityConfig = {
                  error: { color: "bg-red-100 text-red-700", icon: XCircle },
                  warning: { color: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
                  info: { color: "bg-blue-100 text-blue-700", icon: CheckCircle },
                }
                const config = severityConfig[issue.severity as keyof typeof severityConfig]
                const SeverityIcon = config.icon

                return (
                  <div
                    key={issue.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50"
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.color.split(" ")[0]}`}>
                      <SeverityIcon className={`h-5 w-5 ${config.color.split(" ")[1]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{issue.source}</p>
                        <Badge className={config.color}>{issue.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {issue.issue}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('detected')} {issue.detected}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('investigate')}
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-muted-foreground">{t('noQualityIssues')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Source Quality */}
      <Card>
        <CardHeader>
          <CardTitle>{t('qualityByDataSource')}</CardTitle>
          <CardDescription>{t('qualityScoresPerSource')}</CardDescription>
        </CardHeader>
        <CardContent>
          {dataSources.length > 0 ? (
            <div className="space-y-4">
              {dataSources.map((ds, _index) => {
                // Mock quality scores per source
                const score = 85 + Math.random() * 15
                return (
                  <div
                    key={ds.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Database className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          href={`/gwi/data-sources/${ds.id}`}
                          className="font-medium hover:text-emerald-600"
                        >
                          {ds.name}
                        </Link>
                        <span className="text-sm font-medium">
                          {score.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                    <Badge variant="outline">{ds.type}</Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={Database}
              title={t('noDataSourcesConnected')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function DataQualityPage() {
  const t = await getTranslations('gwi.dataSources.quality')

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <LoadingText />
          </div>
        </div>
      }
    >
      <DataQualityContent />
    </Suspense>
  )
}
