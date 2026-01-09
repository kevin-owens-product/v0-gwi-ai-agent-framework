"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Play,
  Pause,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"

const workflows = [
  {
    id: "wf-001",
    name: "Gen Z Sustainability Analysis",
    description: "Weekly analysis of Gen Z consumer attitudes toward sustainable products",
    status: "active",
    lastRun: "2 hours ago",
    nextRun: "In 5 days",
    runs: 24,
    agents: ["Audience Strategist", "Trend Forecaster"],
    schedule: "Weekly",
  },
  {
    id: "wf-002",
    name: "Q4 Campaign Brief Generation",
    description: "Automated campaign brief creation for Q4 marketing initiatives",
    status: "running",
    lastRun: "Running now",
    nextRun: "-",
    runs: 8,
    agents: ["Creative Brief Builder", "Audience Strategist"],
    schedule: "On-demand",
  },
  {
    id: "wf-003",
    name: "Competitor Market Share Tracking",
    description: "Monthly competitor analysis across key markets",
    status: "scheduled",
    lastRun: "3 days ago",
    nextRun: "In 4 hours",
    runs: 12,
    agents: ["Competitive Tracker"],
    schedule: "Daily",
  },
  {
    id: "wf-004",
    name: "EU Market Expansion Research",
    description: "Comprehensive market analysis for European expansion",
    status: "failed",
    lastRun: "Yesterday",
    nextRun: "Paused",
    runs: 5,
    agents: ["Market Expander", "Survey Analyst"],
    schedule: "Weekly",
  },
  {
    id: "wf-005",
    name: "Brand Health Monitor",
    description: "Continuous brand perception tracking across demographics",
    status: "active",
    lastRun: "1 hour ago",
    nextRun: "Tomorrow",
    runs: 156,
    agents: ["Survey Analyst", "Trend Forecaster"],
    schedule: "Daily",
  },
]

const statusConfig = {
  active: { icon: CheckCircle2, color: "text-chart-5", bg: "bg-chart-5/10", label: "Active" },
  running: { icon: Loader2, color: "text-accent", bg: "bg-accent/10", label: "Running", spin: true },
  scheduled: { icon: Clock, color: "text-chart-3", bg: "bg-chart-3/10", label: "Scheduled" },
  failed: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Failed" },
}

export function WorkflowList() {
  return (
    <div className="space-y-4">
      {workflows.map((workflow) => {
        const status = statusConfig[workflow.status as keyof typeof statusConfig]
        return (
          <Card key={workflow.id} className="bg-card border-border hover:border-muted-foreground/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${status.bg} flex items-center justify-center flex-shrink-0`}>
                  <status.icon className={`h-6 w-6 ${status.color} ${status.spin ? "animate-spin" : ""}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link href={`/dashboard/workflows/${workflow.id}`}>
                        <h3 className="font-semibold text-foreground hover:text-accent transition-colors">
                          {workflow.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="secondary" className="capitalize">
                        {status.label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Play className="h-4 w-4 mr-2" />
                            Run Now
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Agents: </span>
                      <span className="text-foreground">{workflow.agents.join(" → ")}</span>
                    </div>
                    <div className="text-muted-foreground">•</div>
                    <div>
                      <span className="text-muted-foreground">Schedule: </span>
                      <span className="text-foreground">{workflow.schedule}</span>
                    </div>
                    <div className="text-muted-foreground">•</div>
                    <div>
                      <span className="text-muted-foreground">Runs: </span>
                      <span className="text-foreground">{workflow.runs}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
                    <span>Last run: {workflow.lastRun}</span>
                    <span>Next run: {workflow.nextRun}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
