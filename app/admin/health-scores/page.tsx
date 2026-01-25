/**
 * @prompt-id forge-v4.1:feature:customer-health-scoring:010
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  HeartPulse,
  Building2,
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  CheckCircle,
  Loader2,
  RefreshCw,
  Calculator,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { ChurnRiskBadge, getChurnRiskBackgroundColor } from "@/components/admin/health-scores"

interface HealthScore {
  id: string
  orgId: string
  overallScore: number
  usageScore: number
  engagementScore: number
  supportScore: number
  paymentScore: number
  growthScore: number
  churnRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  monthlyActiveUsers: number
  weeklyActiveUsers: number
  lastActivityAt: string | null
  calculatedAt: string
  metadata: {
    recommendations?: string[]
    calculationDetails?: Record<string, number>
  }
  organization?: {
    name: string
    slug: string
    planTier: string
  }
}

interface Summary {
  total: number
  avgScore: number
  byRisk: {
    LOW: number
    MEDIUM: number
    HIGH: number
    CRITICAL: number
  }
}

export default function HealthScoresPage() {
  const [scores, setScores] = useState<HealthScore[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [riskFilter, setRiskFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 15

  const fetchScores = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(riskFilter !== "all" && { churnRisk: riskFilter }),
        ...(planFilter !== "all" && { planTier: planFilter }),
      })
      const response = await fetch(`/api/admin/health-scores?${params}`)
      const data = await response.json()
      setScores(data.scores || [])
      setSummary(data.summary || null)
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch health scores:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, riskFilter, planFilter])

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  const calculateAllScores = async () => {
    setIsCalculating(true)
    try {
      const response = await fetch("/api/admin/health-scores/calculate", { method: "POST" })
      const data = await response.json()
      if (data.success) {
        fetchScores()
      }
    } catch (error) {
      console.error("Failed to calculate scores:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500"
    if (score >= 50) return "text-amber-500"
    if (score >= 30) return "text-orange-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Health Scores</h1>
          <p className="text-muted-foreground">
            Monitor customer health and identify at-risk accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchScores} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={calculateAllScores}
            size="sm"
            disabled={isCalculating}
          >
            {isCalculating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            Recalculate All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <HeartPulse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(summary.avgScore)}`}>
                {summary.avgScore}
              </div>
              <Progress value={summary.avgScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card className={summary.byRisk.CRITICAL > 0 ? "border-red-500/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <AlertOctagon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{summary.byRisk.CRITICAL}</div>
              <p className="text-xs text-muted-foreground">Immediate action needed</p>
            </CardContent>
          </Card>

          <Card className={summary.byRisk.HIGH > 0 ? "border-orange-500/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{summary.byRisk.HIGH}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{summary.byRisk.MEDIUM}</div>
              <p className="text-xs text-muted-foreground">Monitor closely</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{summary.byRisk.LOW}</div>
              <p className="text-xs text-muted-foreground">Healthy accounts</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Health Scores Overview</CardTitle>
          <CardDescription>
            Showing {scores.length} of {total} organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select value={riskFilter} onValueChange={(v) => { setRiskFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High Risk</SelectItem>
                <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                <SelectItem value="LOW">Low Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Plan Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="STARTER">Starter</SelectItem>
                <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead className="text-center">Overall</TableHead>
                  <TableHead className="text-center">Usage</TableHead>
                  <TableHead className="text-center">Engagement</TableHead>
                  <TableHead className="text-center">Support</TableHead>
                  <TableHead className="text-center">Payment</TableHead>
                  <TableHead className="text-center">Growth</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : scores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No health scores available. Click &quot;Recalculate All&quot; to generate scores.
                    </TableCell>
                  </TableRow>
                ) : (
                  scores.map((score) => (
                    <TableRow key={score.id} className={getChurnRiskBackgroundColor(score.churnRisk)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{score.organization?.name || score.orgId}</p>
                            {score.organization && (
                              <Badge variant="outline" className="text-xs">
                                {score.organization.planTier}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`font-bold ${getScoreColor(score.overallScore)}`}>
                            {score.overallScore}
                          </span>
                          <Progress
                            value={score.overallScore}
                            className="w-12 h-1.5"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(score.usageScore)}>{score.usageScore}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(score.engagementScore)}>{score.engagementScore}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(score.supportScore)}>{score.supportScore}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(score.paymentScore)}>{score.paymentScore}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(score.growthScore)}>{score.growthScore}</span>
                      </TableCell>
                      <TableCell>
                        <ChurnRiskBadge risk={score.churnRisk} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {score.lastActivityAt
                          ? new Date(score.lastActivityAt).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/health-scores/${score.orgId}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
