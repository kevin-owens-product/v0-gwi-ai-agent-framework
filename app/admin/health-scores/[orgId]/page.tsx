/**
 * @prompt-id forge-v4.1:feature:customer-health-scoring:011
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Building2,
  Users,
  Bot,
  Workflow,
  Loader2,
  RefreshCw,
  Calculator,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ExternalLink,
  Clock,
} from "lucide-react"
import Link from "next/link"
import {
  HealthScoreCard,
  HealthScoreBreakdown,
  ChurnRiskBadge,
  HealthTrendChart,
} from "@/components/admin/health-scores"

interface Organization {
  id: string
  name: string
  slug: string
  planTier: string
  createdAt: string
  _count: {
    members: number
    agents: number
    workflows: number
  }
  subscription: {
    status: string
    currentPeriodEnd: string
  } | null
}

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
  featureAdoption: Record<string, number>
  trendsData: {
    scoreHistory: Array<{ date: string; score: number }>
    usageHistory: Array<{ date: string; value: number }>
    engagementHistory: Array<{ date: string; value: number }>
  }
  lastActivityAt: string | null
  calculatedAt: string
  metadata: {
    calculationDetails?: {
      apiCalls?: number
      logins?: number
      featureUsageCount?: number
      activeUsers?: number
      totalMembers?: number
      ticketCount?: number
      avgResolutionTime?: number
      paymentSuccess?: number
      paymentFailures?: number
      userGrowth?: number
      usageGrowth?: number
    }
    recommendations?: string[]
  }
}

interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  status: string
  priority: string
  createdAt: string
}

export default function OrgHealthScorePage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null)
  const [history, setHistory] = useState<HealthScore[]>([])
  const [metrics, setMetrics] = useState<{ agentRunsLast30Days: number; lastActivityAt: string | null } | null>(null)
  const [recentTickets, setRecentTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRecalculating, setIsRecalculating] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/health-scores/${orgId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }
      const data = await response.json()
      setOrganization(data.organization)
      setHealthScore(data.healthScore)
      setHistory(data.history || [])
      setMetrics(data.metrics)
      setRecentTickets(data.recentTickets || [])
    } catch (error) {
      console.error("Failed to fetch health score data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [orgId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRecalculate = async () => {
    setIsRecalculating(true)
    try {
      const response = await fetch(`/api/admin/health-scores/${orgId}`, {
        method: "POST",
      })
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Failed to recalculate:", error)
    } finally {
      setIsRecalculating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      OPEN: { variant: "default", className: "bg-blue-500" },
      IN_PROGRESS: { variant: "default", className: "bg-amber-500" },
      WAITING_ON_CUSTOMER: { variant: "secondary" },
      RESOLVED: { variant: "default", className: "bg-green-500" },
      CLOSED: { variant: "outline" },
    }
    const config = statusConfig[status] || { variant: "secondary" }
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace(/_/g, " ")}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
      LOW: { variant: "outline" },
      MEDIUM: { variant: "secondary" },
      HIGH: { variant: "default" },
      URGENT: { variant: "destructive" },
    }
    const config = priorityConfig[priority] || { variant: "secondary" }
    return <Badge variant={config.variant}>{priority}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Organization not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/health-scores">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{organization.name}</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">{organization.slug}</p>
              <Badge variant="outline">{organization.planTier}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/tenants/${orgId}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Tenant
            </Link>
          </Button>
          <Button onClick={handleRecalculate} disabled={isRecalculating}>
            {isRecalculating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            Recalculate
          </Button>
        </div>
      </div>

      {!healthScore ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No health score data available for this organization.</p>
            <Button onClick={handleRecalculate} disabled={isRecalculating}>
              {isRecalculating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4 mr-2" />
              )}
              Calculate Health Score
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <HealthScoreCard
              title="Overall Health"
              score={healthScore.overallScore}
              size="large"
            />
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Churn Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <ChurnRiskBadge risk={healthScore.churnRisk} size="lg" />
                <p className="text-xs text-muted-foreground mt-2">
                  Based on overall health indicators
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthScore.monthlyActiveUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {healthScore.weeklyActiveUsers} active this week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {metrics?.lastActivityAt
                    ? new Date(metrics.lastActivityAt).toLocaleDateString()
                    : "No activity"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.agentRunsLast30Days || 0} runs in last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Row */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <Users className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{organization._count.members}</div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <Bot className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{organization._count.agents}</div>
                  <p className="text-sm text-muted-foreground">Agents</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <Workflow className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{organization._count.workflows}</div>
                  <p className="text-sm text-muted-foreground">Workflows</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <Calendar className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-sm font-bold">
                    {new Date(organization.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Customer Since</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Score Breakdown */}
            <HealthScoreBreakdown
              usageScore={healthScore.usageScore}
              engagementScore={healthScore.engagementScore}
              supportScore={healthScore.supportScore}
              paymentScore={healthScore.paymentScore}
              growthScore={healthScore.growthScore}
              metadata={healthScore.metadata}
            />

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Recommended Actions
                </CardTitle>
                <CardDescription>Suggested steps to improve health score</CardDescription>
              </CardHeader>
              <CardContent>
                {healthScore.metadata?.recommendations && healthScore.metadata.recommendations.length > 0 ? (
                  <ul className="space-y-3">
                    {healthScore.metadata.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">{index + 1}</span>
                          </div>
                        </div>
                        <p className="text-sm">{rec}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                    <p className="text-muted-foreground text-center">
                      Great job! No immediate actions recommended.<br />
                      This customer is in good health.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Historical Trend Chart */}
          <HealthTrendChart
            data={history.map(h => ({
              date: h.calculatedAt,
              overallScore: h.overallScore,
              usageScore: h.usageScore,
              engagementScore: h.engagementScore,
              supportScore: h.supportScore,
              paymentScore: h.paymentScore,
              growthScore: h.growthScore,
            }))}
            title="Health Score History"
            description="Historical trend of health score components"
            showBreakdown
          />

          {/* Recent Support Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Support Tickets</CardTitle>
              <CardDescription>Latest support interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTickets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono text-sm">
                          {ticket.ticketNumber}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {ticket.subject}
                        </TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No recent support tickets
                </p>
              )}
            </CardContent>
          </Card>

          {/* Feature Adoption */}
          {Object.keys(healthScore.featureAdoption).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Feature Adoption</CardTitle>
                <CardDescription>Usage of different features/agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {Object.entries(healthScore.featureAdoption).map(([feature, count]) => (
                    <div key={feature} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="font-medium">{feature}</span>
                      <Badge variant="secondary">{count} uses</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last calculated: {new Date(healthScore.calculatedAt).toLocaleString()}</span>
            <span>Score ID: {healthScore.id}</span>
          </div>
        </>
      )}
    </div>
  )
}
