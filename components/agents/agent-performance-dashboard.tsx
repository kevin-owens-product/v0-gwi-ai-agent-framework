"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react"

interface AgentPerformance {
  id: string
  name: string
  type: string
  totalRuns: number
  successRate: number
  avgDuration: number
  tokenEfficiency: number
  costPerRun: number
  trend: "up" | "down" | "stable"
  lastRun: string
  recentIssues: number
}

const performanceData: AgentPerformance[] = [
  {
    id: "1",
    name: "Audience Explorer",
    type: "RESEARCH",
    totalRuns: 1247,
    successRate: 96.8,
    avgDuration: 3.2,
    tokenEfficiency: 892,
    costPerRun: 0.045,
    trend: "up",
    lastRun: "2 minutes ago",
    recentIssues: 0,
  },
  {
    id: "2",
    name: "Persona Architect",
    type: "ANALYSIS",
    totalRuns: 843,
    successRate: 94.2,
    avgDuration: 4.8,
    tokenEfficiency: 1124,
    costPerRun: 0.062,
    trend: "stable",
    lastRun: "15 minutes ago",
    recentIssues: 1,
  },
  {
    id: "3",
    name: "Trend Forecaster",
    type: "ANALYSIS",
    totalRuns: 612,
    successRate: 98.1,
    avgDuration: 2.9,
    tokenEfficiency: 756,
    costPerRun: 0.038,
    trend: "up",
    lastRun: "1 hour ago",
    recentIssues: 0,
  },
  {
    id: "4",
    name: "Campaign Strategist",
    type: "REPORTING",
    totalRuns: 524,
    successRate: 89.3,
    avgDuration: 5.4,
    tokenEfficiency: 1456,
    costPerRun: 0.078,
    trend: "down",
    lastRun: "3 hours ago",
    recentIssues: 3,
  },
  {
    id: "5",
    name: "Competitive Tracker",
    type: "MONITORING",
    totalRuns: 2156,
    successRate: 97.5,
    avgDuration: 2.1,
    tokenEfficiency: 634,
    costPerRun: 0.029,
    trend: "up",
    lastRun: "5 minutes ago",
    recentIssues: 0,
  },
]

const overallStats = {
  totalRuns: performanceData.reduce((sum, agent) => sum + agent.totalRuns, 0),
  avgSuccessRate: performanceData.length > 0 ? (performanceData.reduce((sum, agent) => sum + agent.successRate, 0) / performanceData.length).toFixed(1) : '0.0',
  totalCost: performanceData.reduce((sum, agent) => sum + agent.totalRuns * (agent.costPerRun ?? 0), 0).toFixed(2),
  avgResponseTime: performanceData.length > 0 ? (performanceData.reduce((sum, agent) => sum + agent.avgDuration, 0) / performanceData.length).toFixed(1) : '0.0',
}

export function AgentPerformanceDashboard() {
  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Runs</p>
              <p className="text-2xl font-bold">{overallStats.totalRuns.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Across all agents</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">{overallStats.avgSuccessRate}%</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-2">
            <TrendingUp className="inline h-3 w-3 mr-1" />
            +2.3% from last week
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold">${overallStats.totalCost}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">This month</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Response</p>
              <p className="text-2xl font-bold">{overallStats.avgResponseTime}s</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-orange-600 mt-2">
            <TrendingDown className="inline h-3 w-3 mr-1" />
            -0.4s from last week
          </p>
        </Card>
      </div>

      {/* Performance Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Agent Performance</h3>
            <p className="text-sm text-muted-foreground">Detailed metrics for each agent</p>
          </div>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>

        <div className="space-y-4">
          {performanceData.map((agent) => (
            <div key={agent.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{agent.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {agent.type}
                      </Badge>
                      {agent.trend === "up" && (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-600/30 text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Improving
                        </Badge>
                      )}
                      {agent.trend === "down" && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600/30 text-xs">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Declining
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Last run: {agent.lastRun}</p>
                  </div>
                </div>

                {agent.recentIssues > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {agent.recentIssues} issue{agent.recentIssues > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Runs</p>
                  <p className="text-sm font-medium">{agent.totalRuns.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{agent.successRate}%</p>
                    <Progress value={agent.successRate} className="h-1" />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Avg Duration</p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium">{agent.avgDuration}s</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tokens/Run</p>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium">{agent.tokenEfficiency}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cost/Run</p>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium">${typeof agent.costPerRun === 'number' ? agent.costPerRun.toFixed(3) : '0.000'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{Math.round((agent.totalRuns * agent.successRate) / 100)} successful</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                    <span>{Math.round((agent.totalRuns * (100 - agent.successRate)) / 100)} failed</span>
                  </div>
                </div>

                <Button variant="ghost" size="sm" className="text-xs">
                  View Details →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Optimization Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Optimization Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Reduce Campaign Strategist token usage</p>
              <p className="text-xs text-muted-foreground mt-1">
                This agent uses 28% more tokens than average. Consider optimizing the system prompt or reducing context window.
              </p>
              <Button variant="link" size="sm" className="text-xs p-0 h-auto mt-2">
                View optimization guide →
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Campaign Strategist has declining success rate</p>
              <p className="text-xs text-muted-foreground mt-1">
                Success rate dropped from 94% to 89% over the last 7 days. Review recent failed runs for patterns.
              </p>
              <Button variant="link" size="sm" className="text-xs p-0 h-auto mt-2">
                Investigate failures →
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Competitive Tracker performing exceptionally</p>
              <p className="text-xs text-muted-foreground mt-1">
                97.5% success rate with lowest cost per run. Consider using this agent as a template for others.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
