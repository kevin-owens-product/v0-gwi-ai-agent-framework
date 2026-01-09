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

const workflowData = {
  id: "wf-001",
  name: "Gen Z Sustainability Analysis",
  description: "Weekly analysis of Gen Z consumer attitudes toward sustainable products across EU and NA markets",
  status: "active",
  schedule: "Weekly (Mondays at 9 AM)",
  lastRun: "2 hours ago",
  nextRun: "In 5 days",
  totalRuns: 24,
  successRate: 96,
  avgDuration: "4m 32s",
  agents: [
    { name: "Audience Strategist", status: "complete" },
    { name: "Trend Forecaster", status: "complete" },
  ],
  runs: [
    { id: "run-1", date: "Dec 2, 2025 9:00 AM", status: "completed", duration: "4m 12s", insights: 28 },
    { id: "run-2", date: "Nov 25, 2025 9:00 AM", status: "completed", duration: "4m 45s", insights: 24 },
    { id: "run-3", date: "Nov 18, 2025 9:00 AM", status: "completed", duration: "4m 38s", insights: 31 },
    { id: "run-4", date: "Nov 11, 2025 9:00 AM", status: "failed", duration: "2m 15s", insights: 0 },
    { id: "run-5", date: "Nov 4, 2025 9:00 AM", status: "completed", duration: "4m 22s", insights: 26 },
  ],
}

const runStatusConfig = {
  completed: { icon: CheckCircle2, color: "text-chart-5", bg: "bg-chart-5/10" },
  failed: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  running: { icon: Clock, color: "text-accent", bg: "bg-accent/10" },
}

export function WorkflowDetail({ id }: { id: string }) {
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
