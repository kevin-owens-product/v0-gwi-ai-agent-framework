"use client"

import { useState, useEffect } from "react"
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

// Demo workflows shown when API returns empty
const demoWorkflows: Workflow[] = [
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
    status: "active",
    lastRun: "1 day ago",
    nextRun: "On-demand",
    runs: 8,
    agents: ["Campaign Strategist", "Persona Architect"],
    schedule: "On-demand",
  },
  {
    id: "wf-003",
    name: "Brand Health Monitor",
    description: "Continuous brand perception tracking across demographics and sentiment analysis",
    status: "active",
    lastRun: "1 hour ago",
    nextRun: "Tomorrow",
    runs: 156,
    agents: ["Brand Analyst", "Trend Forecaster"],
    schedule: "Daily",
  },
]

function formatDate(date: Date | string | null): string {
  if (!date) return "Never"
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return d.toLocaleDateString()
}

function mapApiWorkflowToUI(apiWorkflow: any): Workflow {
  return {
    id: apiWorkflow.id,
    name: apiWorkflow.name,
    description: apiWorkflow.description || "",
    status: apiWorkflow.status?.toLowerCase() || "draft",
    lastRun: formatDate(apiWorkflow.lastRun),
    nextRun: apiWorkflow.nextRun ? formatDate(apiWorkflow.nextRun) : "Not scheduled",
    runs: apiWorkflow.runCount || 0,
    agents: apiWorkflow.agents || [],
    schedule: apiWorkflow.schedule || "On-demand",
  }
}

const statusConfig = {
  active: { icon: CheckCircle2, color: "text-chart-5", bg: "bg-chart-5/10", label: "Active" },
  running: { icon: Loader2, color: "text-accent", bg: "bg-accent/10", label: "Running", spin: true },
  scheduled: { icon: Clock, color: "text-chart-3", bg: "bg-chart-3/10", label: "Scheduled" },
  failed: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Failed" },
  paused: { icon: Pause, color: "text-muted-foreground", bg: "bg-muted", label: "Paused" },
}

export function WorkflowList() {
  const router = useRouter()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null)

  // Fetch workflows from API
  useEffect(() => {
    async function fetchWorkflows() {
      try {
        const response = await fetch('/api/v1/workflows')
        if (response.ok) {
          const data = await response.json()
          const apiWorkflows = data.workflows || []
          if (apiWorkflows.length > 0) {
            setWorkflows(apiWorkflows.map(mapApiWorkflowToUI))
          } else {
            // Use demo data if API returns empty
            setWorkflows(demoWorkflows)
          }
        } else {
          setWorkflows(demoWorkflows)
        }
      } catch (error) {
        console.error('Failed to fetch workflows:', error)
        setWorkflows(demoWorkflows)
      } finally {
        setIsLoading(false)
      }
    }
    fetchWorkflows()
  }, [])

  const handleRunWorkflow = async (workflow: Workflow) => {
    // Optimistically update UI
    setWorkflows(prev =>
      prev.map(w =>
        w.id === workflow.id
          ? { ...w, status: "running", lastRun: "Running now", runs: w.runs + 1 }
          : w
      )
    )

    try {
      const response = await fetch(`/api/v1/workflows/${workflow.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: {} }),
      })

      if (response.ok) {
        // Poll for completion or just update after delay
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
    } catch (error) {
      console.error('Failed to run workflow:', error)
      setWorkflows(prev =>
        prev.map(w =>
          w.id === workflow.id
            ? { ...w, status: "active", lastRun: workflow.lastRun }
            : w
        )
      )
    }
  }

  const handlePauseWorkflow = async (workflow: Workflow) => {
    try {
      await fetch(`/api/v1/workflows/${workflow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAUSED' }),
      })
      setWorkflows(prev =>
        prev.map(w =>
          w.id === workflow.id
            ? { ...w, status: "paused", nextRun: "Paused" }
            : w
        )
      )
    } catch (error) {
      console.error('Failed to pause workflow:', error)
    }
  }

  const handleEditWorkflow = (workflow: Workflow) => {
    router.push(`/dashboard/workflows/${workflow.id}/edit`)
  }

  const handleDuplicateWorkflow = async (workflow: Workflow) => {
    try {
      const response = await fetch('/api/v1/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${workflow.name} (Copy)`,
          description: workflow.description,
          schedule: workflow.schedule,
          agents: workflow.agents,
        }),
      })

      if (response.ok) {
        const newWorkflow = await response.json()
        setWorkflows(prev => [mapApiWorkflowToUI(newWorkflow), ...prev])
      }
    } catch (error) {
      console.error('Failed to duplicate workflow:', error)
      // Fallback to local duplicate
      const newWorkflow: Workflow = {
        ...workflow,
        id: `wf-${Date.now()}`,
        name: `${workflow.name} (Copy)`,
        status: "draft",
        runs: 0,
        lastRun: "Never",
        nextRun: "Not scheduled",
      }
      setWorkflows(prev => [newWorkflow, ...prev])
    }
  }

  const handleDeleteWorkflow = (workflow: Workflow) => {
    setWorkflowToDelete(workflow)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (workflowToDelete) {
      try {
        await fetch(`/api/v1/workflows/${workflowToDelete.id}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('Failed to delete workflow:', error)
      }
      setWorkflows(prev => prev.filter(w => w.id !== workflowToDelete.id))
    }
    setDeleteDialogOpen(false)
    setWorkflowToDelete(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
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
                    <status.icon className={`h-6 w-6 ${status.color} ${'spin' in status && status.spin ? "animate-spin" : ""}`} />
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
