"use client"

import { useState, useEffect } from "react"
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
import {
  HeartPulse,
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Calculator,
} from "lucide-react"

interface HealthScore {
  id: string
  orgId: string
  overallScore: number
  engagementScore: number
  usageScore: number
  riskLevel: string
  churnProbability: number | null
  recommendations: string[]
  healthIndicators: {
    memberCount?: number
    activeMembers?: number
    agentRuns?: number
    recentLogins?: number
  }
  calculatedAt: string
  organization?: {
    name: string
    slug: string
    planTier: string
  }
}

export default function HealthScoresPage() {
  const [scores, setScores] = useState<HealthScore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [riskFilter, setRiskFilter] = useState("all")
  const [isCalculating, setIsCalculating] = useState(false)

  const fetchScores = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        ...(riskFilter !== "all" && { riskLevel: riskFilter }),
      })
      const response = await fetch(`/api/admin/health?${params}`)
      const data = await response.json()
      setScores(data.scores)
    } catch (error) {
      console.error("Failed to fetch health scores:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchScores()
  }, [riskFilter])

  const calculateAllScores = async () => {
    setIsCalculating(true)
    try {
      await fetch("/api/admin/health/calculate", { method: "POST" })
      fetchScores()
    } catch (error) {
      console.error("Failed to calculate scores:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Critical</Badge>
      case "AT_RISK":
        return <Badge variant="default" className="bg-amber-500 gap-1"><TrendingDown className="h-3 w-3" />At Risk</Badge>
      default:
        return <Badge variant="default" className="bg-green-500 gap-1"><CheckCircle className="h-3 w-3" />Healthy</Badge>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500"
    if (score >= 40) return "text-amber-500"
    return "text-red-500"
  }

  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-green-500"
    if (score >= 40) return "bg-amber-500"
    return "bg-red-500"
  }

  // Summary stats
  const criticalCount = scores.filter(s => s.riskLevel === "CRITICAL").length
  const atRiskCount = scores.filter(s => s.riskLevel === "AT_RISK").length
  const healthyCount = scores.filter(s => s.riskLevel === "HEALTHY").length
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Health</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}</div>
            <Progress value={avgScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className={criticalCount > 0 ? "border-red-500/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className={atRiskCount > 0 ? "border-amber-500/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{atRiskCount}</div>
            <p className="text-xs text-muted-foreground">Need proactive outreach</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{healthyCount}</div>
            <p className="text-xs text-muted-foreground">Performing well</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tenant Health Scores</CardTitle>
              <CardDescription>
                Monitor tenant engagement and identify at-risk accounts
              </CardDescription>
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
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="AT_RISK">At Risk</SelectItem>
                <SelectItem value="HEALTHY">Healthy</SelectItem>
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
                  <TableHead className="text-center">Engagement</TableHead>
                  <TableHead className="text-center">Usage</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Churn Prob.</TableHead>
                  <TableHead>Recommendations</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : scores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No health scores available. Click "Recalculate All" to generate scores.
                    </TableCell>
                  </TableRow>
                ) : (
                  scores.map((score) => (
                    <TableRow key={score.id}>
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
                            {Math.round(score.overallScore)}
                          </span>
                          <Progress
                            value={score.overallScore}
                            className="w-16 h-1.5"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(score.engagementScore)}>
                          {Math.round(score.engagementScore)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(score.usageScore)}>
                          {Math.round(score.usageScore)}
                        </span>
                      </TableCell>
                      <TableCell>{getRiskBadge(score.riskLevel)}</TableCell>
                      <TableCell>
                        {score.churnProbability !== null && (
                          <span className={score.churnProbability > 0.5 ? "text-red-500" : "text-muted-foreground"}>
                            {Math.round(score.churnProbability * 100)}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {score.recommendations.length > 0 ? (
                          <div className="max-w-[200px]">
                            <p className="text-xs truncate">{score.recommendations[0]}</p>
                            {score.recommendations.length > 1 && (
                              <p className="text-xs text-muted-foreground">
                                +{score.recommendations.length - 1} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(score.calculatedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
