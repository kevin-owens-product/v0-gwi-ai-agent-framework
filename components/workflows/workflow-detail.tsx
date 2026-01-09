"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

const workflowsData: Record<string, {
  id: string
  name: string
  description: string
  status: string
  schedule: string
  lastRun: string
  nextRun: string
  totalRuns: number
  successRate: number
  avgDuration: string
  agents: { name: string; status: string }[]
  runs: { id: string; date: string; status: string; duration: string; insights: number }[]
}> = {
  "wf-001": {
    id: "wf-001",
    name: "Gen Z Sustainability Analysis",
    description: "Weekly analysis of Gen Z consumer attitudes toward sustainable products across EU and NA markets. Tracks eco-conscious behaviors, brand preferences, and emerging sustainability trends.",
    status: "active",
    schedule: "Weekly (Mondays at 9 AM)",
    lastRun: "2 hours ago",
    nextRun: "In 5 days",
    totalRuns: 24,
    successRate: 96,
    avgDuration: "4m 32s",
    agents: [
      { name: "Audience Explorer", status: "complete" },
      { name: "Trend Forecaster", status: "complete" },
    ],
    runs: [
      { id: "run-1", date: "Jan 6, 2025 9:00 AM", status: "completed", duration: "4m 12s", insights: 28 },
      { id: "run-2", date: "Dec 30, 2024 9:00 AM", status: "completed", duration: "4m 45s", insights: 24 },
      { id: "run-3", date: "Dec 23, 2024 9:00 AM", status: "completed", duration: "4m 38s", insights: 31 },
      { id: "run-4", date: "Dec 16, 2024 9:00 AM", status: "failed", duration: "2m 15s", insights: 0 },
      { id: "run-5", date: "Dec 9, 2024 9:00 AM", status: "completed", duration: "4m 22s", insights: 26 },
    ],
  },
  "wf-002": {
    id: "wf-002",
    name: "Q4 Campaign Brief Generation",
    description: "Automated campaign brief creation for Q4 marketing initiatives with audience insights, channel recommendations, and creative direction based on consumer research.",
    status: "running",
    schedule: "On-demand",
    lastRun: "Running now",
    nextRun: "-",
    totalRuns: 8,
    successRate: 100,
    avgDuration: "8m 15s",
    agents: [
      { name: "Campaign Strategist", status: "running" },
      { name: "Persona Architect", status: "pending" },
    ],
    runs: [
      { id: "run-1", date: "Jan 8, 2025 2:30 PM", status: "running", duration: "-", insights: 0 },
      { id: "run-2", date: "Jan 3, 2025 10:00 AM", status: "completed", duration: "7m 58s", insights: 42 },
      { id: "run-3", date: "Dec 15, 2024 3:00 PM", status: "completed", duration: "8m 32s", insights: 38 },
    ],
  },
  "wf-003": {
    id: "wf-003",
    name: "Competitor Market Share Tracking",
    description: "Daily competitor brand perception and market share analysis across key markets. Monitors brand mentions, sentiment, and competitive positioning.",
    status: "scheduled",
    schedule: "Daily (8 AM EST)",
    lastRun: "3 hours ago",
    nextRun: "In 4 hours",
    totalRuns: 312,
    successRate: 99,
    avgDuration: "3m 45s",
    agents: [
      { name: "Competitive Intelligence", status: "complete" },
      { name: "Brand Analyst", status: "complete" },
    ],
    runs: [
      { id: "run-1", date: "Jan 8, 2025 8:00 AM", status: "completed", duration: "3m 42s", insights: 18 },
      { id: "run-2", date: "Jan 7, 2025 8:00 AM", status: "completed", duration: "3m 51s", insights: 21 },
      { id: "run-3", date: "Jan 6, 2025 8:00 AM", status: "completed", duration: "3m 38s", insights: 16 },
      { id: "run-4", date: "Jan 5, 2025 8:00 AM", status: "completed", duration: "3m 55s", insights: 19 },
      { id: "run-5", date: "Jan 4, 2025 8:00 AM", status: "completed", duration: "3m 44s", insights: 22 },
    ],
  },
  "wf-004": {
    id: "wf-004",
    name: "EU Market Expansion Research",
    description: "Comprehensive market analysis for European expansion strategy and localization. Covers consumer preferences, regulatory considerations, and competitive landscape.",
    status: "failed",
    schedule: "Weekly (Tuesdays at 10 AM)",
    lastRun: "Yesterday",
    nextRun: "Paused",
    totalRuns: 5,
    successRate: 60,
    avgDuration: "12m 30s",
    agents: [
      { name: "Global Perspective", status: "failed" },
      { name: "Survey Analyst", status: "pending" },
      { name: "Culture Tracker", status: "pending" },
    ],
    runs: [
      { id: "run-1", date: "Jan 7, 2025 10:00 AM", status: "failed", duration: "5m 12s", insights: 0 },
      { id: "run-2", date: "Dec 31, 2024 10:00 AM", status: "completed", duration: "11m 45s", insights: 54 },
      { id: "run-3", date: "Dec 24, 2024 10:00 AM", status: "completed", duration: "12m 18s", insights: 48 },
      { id: "run-4", date: "Dec 17, 2024 10:00 AM", status: "failed", duration: "3m 22s", insights: 0 },
      { id: "run-5", date: "Dec 10, 2024 10:00 AM", status: "completed", duration: "13m 05s", insights: 61 },
    ],
  },
  "wf-005": {
    id: "wf-005",
    name: "Brand Health Monitor",
    description: "Continuous brand perception tracking across demographics and sentiment analysis. Monitors NPS, brand awareness, consideration, and purchase intent.",
    status: "active",
    schedule: "Daily (6 AM EST)",
    lastRun: "1 hour ago",
    nextRun: "Tomorrow",
    totalRuns: 156,
    successRate: 98,
    avgDuration: "5m 20s",
    agents: [
      { name: "Brand Analyst", status: "complete" },
      { name: "Trend Forecaster", status: "complete" },
    ],
    runs: [
      { id: "run-1", date: "Jan 8, 2025 6:00 AM", status: "completed", duration: "5m 18s", insights: 24 },
      { id: "run-2", date: "Jan 7, 2025 6:00 AM", status: "completed", duration: "5m 25s", insights: 22 },
      { id: "run-3", date: "Jan 6, 2025 6:00 AM", status: "completed", duration: "5m 12s", insights: 26 },
      { id: "run-4", date: "Jan 5, 2025 6:00 AM", status: "completed", duration: "5m 31s", insights: 21 },
      { id: "run-5", date: "Jan 4, 2025 6:00 AM", status: "completed", duration: "5m 08s", insights: 25 },
    ],
  },
  "wf-006": {
    id: "wf-006",
    name: "Consumer Persona Weekly Refresh",
    description: "Automated refresh of consumer personas with latest behavioral data and trend insights. Updates demographic profiles, psychographics, and media consumption patterns.",
    status: "active",
    schedule: "Weekly (Fridays at 2 PM)",
    lastRun: "3 days ago",
    nextRun: "In 4 days",
    totalRuns: 52,
    successRate: 94,
    avgDuration: "9m 45s",
    agents: [
      { name: "Persona Architect", status: "complete" },
      { name: "Motivation Decoder", status: "complete" },
      { name: "Audience Explorer", status: "complete" },
    ],
    runs: [
      { id: "run-1", date: "Jan 3, 2025 2:00 PM", status: "completed", duration: "9m 32s", insights: 36 },
      { id: "run-2", date: "Dec 27, 2024 2:00 PM", status: "completed", duration: "9m 58s", insights: 34 },
      { id: "run-3", date: "Dec 20, 2024 2:00 PM", status: "completed", duration: "9m 41s", insights: 38 },
      { id: "run-4", date: "Dec 13, 2024 2:00 PM", status: "failed", duration: "4m 15s", insights: 0 },
      { id: "run-5", date: "Dec 6, 2024 2:00 PM", status: "completed", duration: "10m 02s", insights: 32 },
    ],
  },
  "wf-007": {
    id: "wf-007",
    name: "Cultural Trend Alert System",
    description: "Real-time monitoring of emerging cultural trends and viral moments across social platforms. Alerts on significant sentiment shifts and trending topics.",
    status: "active",
    schedule: "Hourly",
    lastRun: "15 minutes ago",
    nextRun: "In 45 minutes",
    totalRuns: 2847,
    successRate: 99,
    avgDuration: "1m 45s",
    agents: [
      { name: "Culture Tracker", status: "complete" },
      { name: "Trend Forecaster", status: "complete" },
    ],
    runs: [
      { id: "run-1", date: "Jan 8, 2025 2:00 PM", status: "completed", duration: "1m 42s", insights: 8 },
      { id: "run-2", date: "Jan 8, 2025 1:00 PM", status: "completed", duration: "1m 48s", insights: 5 },
      { id: "run-3", date: "Jan 8, 2025 12:00 PM", status: "completed", duration: "1m 38s", insights: 12 },
      { id: "run-4", date: "Jan 8, 2025 11:00 AM", status: "completed", duration: "1m 52s", insights: 6 },
      { id: "run-5", date: "Jan 8, 2025 10:00 AM", status: "completed", duration: "1m 41s", insights: 9 },
    ],
  },
  "wf-008": {
    id: "wf-008",
    name: "Monthly Consumer Insights Report",
    description: "Comprehensive monthly report combining audience, brand, and trend insights for stakeholders. Includes executive summary, key findings, and strategic recommendations.",
    status: "scheduled",
    schedule: "Monthly (1st of month at 9 AM)",
    lastRun: "2 weeks ago",
    nextRun: "In 2 weeks",
    totalRuns: 18,
    successRate: 100,
    avgDuration: "18m 30s",
    agents: [
      { name: "Audience Explorer", status: "complete" },
      { name: "Brand Analyst", status: "complete" },
      { name: "Campaign Strategist", status: "complete" },
      { name: "Survey Analyst", status: "complete" },
    ],
    runs: [
      { id: "run-1", date: "Jan 1, 2025 9:00 AM", status: "completed", duration: "18m 22s", insights: 87 },
      { id: "run-2", date: "Dec 1, 2024 9:00 AM", status: "completed", duration: "18m 45s", insights: 92 },
      { id: "run-3", date: "Nov 1, 2024 9:00 AM", status: "completed", duration: "17m 58s", insights: 84 },
      { id: "run-4", date: "Oct 1, 2024 9:00 AM", status: "completed", duration: "19m 12s", insights: 89 },
      { id: "run-5", date: "Sep 1, 2024 9:00 AM", status: "completed", duration: "18m 35s", insights: 91 },
    ],
  },
  "wf-009": {
    id: "wf-009",
    name: "Product Launch Research Pipeline",
    description: "End-to-end research workflow for new product launches with audience validation. Covers target audience definition, competitive analysis, and go-to-market strategy.",
    status: "active",
    schedule: "On-demand",
    lastRun: "5 hours ago",
    nextRun: "On-demand",
    totalRuns: 34,
    successRate: 97,
    avgDuration: "15m 20s",
    agents: [
      { name: "Audience Explorer", status: "complete" },
      { name: "Motivation Decoder", status: "complete" },
      { name: "Global Perspective", status: "complete" },
      { name: "Campaign Strategist", status: "complete" },
    ],
    runs: [
      { id: "run-1", date: "Jan 8, 2025 9:30 AM", status: "completed", duration: "14m 58s", insights: 64 },
      { id: "run-2", date: "Jan 2, 2025 11:00 AM", status: "completed", duration: "15m 32s", insights: 58 },
      { id: "run-3", date: "Dec 18, 2024 2:00 PM", status: "completed", duration: "15m 15s", insights: 71 },
      { id: "run-4", date: "Dec 5, 2024 10:00 AM", status: "failed", duration: "6m 42s", insights: 0 },
      { id: "run-5", date: "Nov 20, 2024 3:00 PM", status: "completed", duration: "16m 08s", insights: 67 },
    ],
  },
  "wf-010": {
    id: "wf-010",
    name: "APAC Market Intelligence",
    description: "Weekly deep-dive into Asia-Pacific consumer trends and market opportunities. Covers Japan, Korea, China, Australia, and Southeast Asian markets.",
    status: "active",
    schedule: "Weekly (Wednesdays at 8 AM)",
    lastRun: "4 days ago",
    nextRun: "In 3 days",
    totalRuns: 89,
    successRate: 95,
    avgDuration: "11m 15s",
    agents: [
      { name: "Global Perspective", status: "complete" },
      { name: "Culture Tracker", status: "complete" },
      { name: "Competitive Intelligence", status: "complete" },
    ],
    runs: [
      { id: "run-1", date: "Jan 1, 2025 8:00 AM", status: "completed", duration: "11m 08s", insights: 45 },
      { id: "run-2", date: "Dec 25, 2024 8:00 AM", status: "completed", duration: "11m 32s", insights: 42 },
      { id: "run-3", date: "Dec 18, 2024 8:00 AM", status: "completed", duration: "10m 55s", insights: 48 },
      { id: "run-4", date: "Dec 11, 2024 8:00 AM", status: "failed", duration: "4m 22s", insights: 0 },
      { id: "run-5", date: "Dec 4, 2024 8:00 AM", status: "completed", duration: "11m 28s", insights: 51 },
    ],
  },
}

const runStatusConfig = {
  completed: { icon: CheckCircle2, color: "text-chart-5", bg: "bg-chart-5/10" },
  failed: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  running: { icon: Clock, color: "text-accent", bg: "bg-accent/10" },
}

export function WorkflowDetail({ id }: { id: string }) {
  // Get workflow data based on ID, fall back to first workflow if not found
  const workflowData = workflowsData[id] || workflowsData["wf-001"]

  // Handle case where workflow doesn't exist
  if (!workflowsData[id] && !id.startsWith("wf-")) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Workflow Not Found</h2>
        <p className="text-muted-foreground mb-4">The workflow "{id}" does not exist.</p>
        <Link href="/dashboard/workflows">
          <Button>Back to Workflows</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/workflows">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{workflowData.name}</h1>
              <Badge variant="secondary" className="capitalize">
                {workflowData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{workflowData.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-12 sm:ml-0">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Pause className="h-4 w-4" />
            Pause
          </Button>
          <Button size="sm" className="gap-2">
            <Play className="h-4 w-4" />
            Run Now
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Runs", value: workflowData.totalRuns },
          { label: "Success Rate", value: `${workflowData.successRate}%` },
          { label: "Avg Duration", value: workflowData.avgDuration },
          { label: "Next Run", value: workflowData.nextRun },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="runs" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="runs">Run History</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflowData.runs.map((run) => {
                  const status = runStatusConfig[run.status as keyof typeof runStatusConfig]
                  return (
                    <div
                      key={run.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg ${status.bg} flex items-center justify-center flex-shrink-0`}
                      >
                        <status.icon className={`h-5 w-5 ${status.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{run.date}</p>
                        <p className="text-sm text-muted-foreground">Duration: {run.duration}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-foreground">{run.insights}</p>
                        <p className="text-xs text-muted-foreground">insights</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Agent Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="px-4 py-2 rounded-lg bg-accent/20 text-accent font-medium">Input: GWI Core</div>
                {workflowData.agents.map((agent, index) => (
                  <div key={agent.name} className="flex items-center gap-4">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <div className="px-4 py-2 rounded-lg bg-secondary border border-border">
                      <span className="text-foreground font-medium">{agent.name}</span>
                    </div>
                  </div>
                ))}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-4 py-2 rounded-lg bg-chart-5/20 text-chart-5 font-medium">Output: Report</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Schedule</p>
                  <p className="text-foreground font-medium">{workflowData.schedule}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-foreground font-medium capitalize">{workflowData.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Notifications</p>
                  <p className="text-foreground font-medium">Email, Slack</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Auto-retry</p>
                  <p className="text-foreground font-medium">Enabled (3 attempts)</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Edit className="h-4 w-4" />
                  Edit Workflow
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
