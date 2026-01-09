"use client"

import { useState } from "react"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { useRouter } from "next/navigation"

interface Workflow {
  id: string
  name: string
  description: string
  status: string
  lastRun: string
  nextRun: string
  runs: number
  agents: string[]
  schedule: string
}

const initialWorkflows: Workflow[] = [
  {
    id: "wf-001",
    name: "Gen Z Sustainability Analysis",
    description: "Weekly analysis of Gen Z consumer attitudes toward sustainable products across global markets",
    status: "active",
    lastRun: "2 hours ago",
    nextRun: "In 5 days",
    runs: 24,
    agents: ["Audience Explorer", "Trend Forecaster"],
    schedule: "Weekly",
  },
  {
    id: "wf-002",
    name: "Q4 Campaign Brief Generation",
    description: "Automated campaign brief creation for Q4 marketing initiatives with audience insights",
    status: "running",
    lastRun: "Running now",
    nextRun: "-",
    runs: 8,
    agents: ["Campaign Strategist", "Persona Architect"],
    schedule: "On-demand",
  },
  {
    id: "wf-003",
    name: "Competitor Market Share Tracking",
    description: "Daily competitor brand perception and market share analysis across key markets",
    status: "scheduled",
    lastRun: "3 hours ago",
    nextRun: "In 4 hours",
    runs: 312,
    agents: ["Competitive Intelligence", "Brand Analyst"],
    schedule: "Daily",
  },
  {
    id: "wf-004",
    name: "EU Market Expansion Research",
    description: "Comprehensive market analysis for European expansion strategy and localization",
    status: "failed",
    lastRun: "Yesterday",
    nextRun: "Paused",
    runs: 5,
    agents: ["Global Perspective", "Survey Analyst", "Culture Tracker"],
    schedule: "Weekly",
  },
  {
    id: "wf-005",
    name: "Brand Health Monitor",
    description: "Continuous brand perception tracking across demographics and sentiment analysis",
    status: "active",
    lastRun: "1 hour ago",
    nextRun: "Tomorrow",
    runs: 156,
    agents: ["Brand Analyst", "Trend Forecaster"],
    schedule: "Daily",
  },
  {
    id: "wf-006",
    name: "Consumer Persona Weekly Refresh",
    description: "Automated refresh of consumer personas with latest behavioral data and trend insights",
    status: "active",
    lastRun: "3 days ago",
    nextRun: "In 4 days",
    runs: 52,
    agents: ["Persona Architect", "Motivation Decoder", "Audience Explorer"],
    schedule: "Weekly",
  },
  {
    id: "wf-007",
    name: "Cultural Trend Alert System",
    description: "Real-time monitoring of emerging cultural trends and viral moments across social platforms",
    status: "active",
    lastRun: "15 minutes ago",
    nextRun: "In 45 minutes",
    runs: 2847,
    agents: ["Culture Tracker", "Trend Forecaster"],
    schedule: "Hourly",
  },
  {
    id: "wf-008",
    name: "Monthly Consumer Insights Report",
    description: "Comprehensive monthly report combining audience, brand, and trend insights for stakeholders",
    status: "scheduled",
    lastRun: "2 weeks ago",
    nextRun: "In 2 weeks",
    runs: 18,
    agents: ["Audience Explorer", "Brand Analyst", "Campaign Strategist", "Survey Analyst"],
    schedule: "Monthly",
  },
  {
    id: "wf-009",
    name: "Product Launch Research Pipeline",
    description: "End-to-end research workflow for new product launches with audience validation",
    status: "active",
    lastRun: "5 hours ago",
    nextRun: "On-demand",
    runs: 34,
    agents: ["Audience Explorer", "Motivation Decoder", "Global Perspective", "Campaign Strategist"],
    schedule: "On-demand",
  },
  {
    id: "wf-010",
    name: "APAC Market Intelligence",
    description: "Weekly deep-dive into Asia-Pacific consumer trends and market opportunities",
    status: "active",
    lastRun: "4 days ago",
    nextRun: "In 3 days",
    runs: 89,
    agents: ["Global Perspective", "Culture Tracker", "Competitive Intelligence"],
    schedule: "Weekly",
  },
]

const statusConfig = {
  active: { icon: CheckCircle2, color: "text-chart-5", bg: "bg-chart-5/10", label: "Active" },
  running: { icon: Loader2, color: "text-accent", bg: "bg-accent/10", label: "Running", spin: true },
  scheduled: { icon: Clock, color: "text-chart-3", bg: "bg-chart-3/10", label: "Scheduled" },
  failed: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Failed" },
  paused: { icon: Pause, color: "text-muted-foreground", bg: "bg-muted", label: "Paused" },
}

export function WorkflowList() {
  const router = useRouter()
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null)

  const handleRunWorkflow = (workflow: Workflow) => {
    setWorkflows(prev =>
      prev.map(w =>
        w.id === workflow.id
          ? { ...w, status: "running", lastRun: "Running now", runs: w.runs + 1 }
          : w
      )
    )
    // Simulate workflow completion after 3 seconds
    setTimeout(() => {
      setWorkflows(prev =>
        prev.map(w =>
          w.id === workflow.id
            ? { ...w, status: "active", lastRun: "Just now" }
            : w
        )
      )
    }, 3000)
  }

  const handlePauseWorkflow = (workflow: Workflow) => {
    setWorkflows(prev =>
      prev.map(w =>
        w.id === workflow.id
          ? { ...w, status: "paused", nextRun: "Paused" }
          : w
      )
    )
  }

  const handleEditWorkflow = (workflow: Workflow) => {
    router.push(`/dashboard/workflows/${workflow.id}/edit`)
  }

  const handleDuplicateWorkflow = (workflow: Workflow) => {
    const newWorkflow: Workflow = {
      ...workflow,
      id: `wf-${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      status: "scheduled",
      runs: 0,
      lastRun: "Never",
      nextRun: "Not scheduled",
    }
    setWorkflows(prev => [newWorkflow, ...prev])
  }

  const handleDeleteWorkflow = (workflow: Workflow) => {
    setWorkflowToDelete(workflow)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (workflowToDelete) {
      setWorkflows(prev => prev.filter(w => w.id !== workflowToDelete.id))
    }
    setDeleteDialogOpen(false)
    setWorkflowToDelete(null)
  }

  return (
    <>
      <div className="space-y-4">
        {workflows.map((workflow) => {
          const status = statusConfig[workflow.status as keyof typeof statusConfig] || statusConfig.active
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
                            <DropdownMenuItem
                              onClick={() => handleRunWorkflow(workflow)}
                              disabled={workflow.status === "running"}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Run Now
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handlePauseWorkflow(workflow)}
                              disabled={workflow.status === "paused" || workflow.status === "running"}
                            >
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditWorkflow(workflow)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateWorkflow(workflow)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteWorkflow(workflow)}
                            >
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{workflowToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
