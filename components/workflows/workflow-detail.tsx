"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  ArrowLeft,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  AlertCircle,
  ChevronRight,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface WorkflowData {
  id: string
  name: string
  description: string | null
  status: string
  schedule: string
  agents: string[]
  configuration: Record<string, unknown>
  createdAt: string
  updatedAt: string
  lastRunAt?: string
  runsCount?: number
}

const statusDisplayMap: Record<string, string> = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  ARCHIVED: "archived",
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  return date.toLocaleDateString()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function WorkflowDetail({ id }: { id: string }) {
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null)

  useEffect(() => {
    async function fetchWorkflow() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/v1/workflows/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError("Workflow not found")
          } else {
            setError("Failed to load workflow")
          }
          return
        }
        const data = await response.json()
        setWorkflowData(data.data || data)
      } catch (err) {
        console.error('Failed to fetch workflow:', err)
        setError("Failed to load workflow")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkflow()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !workflowData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Workflow Not Found</h2>
        <p className="text-muted-foreground mb-4">{error || "The workflow does not exist."}</p>
        <Link href="/dashboard/workflows">
          <Button>Back to Workflows</Button>
        </Link>
      </div>
    )
  }

  const handleRunWorkflow = async () => {
    if (!workflowData) return
    setIsRunning(true)
    try {
      const response = await fetch(`/api/v1/workflows/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!response.ok) {
        throw new Error('Failed to run workflow')
      }
      toast.success('Workflow started')
      setWorkflowData(prev => prev ? { ...prev, status: 'ACTIVE' } : prev)
    } catch (err) {
      toast.error('Failed to run workflow')
    } finally {
      setIsRunning(false)
    }
  }

  const handlePauseWorkflow = async () => {
    if (!workflowData) return
    try {
      const response = await fetch(`/api/v1/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAUSED' }),
      })
      if (!response.ok) {
        throw new Error('Failed to pause workflow')
      }
      toast.success('Workflow paused')
      setWorkflowData(prev => prev ? { ...prev, status: 'PAUSED' } : prev)
    } catch (err) {
      toast.error('Failed to pause workflow')
    }
  }

  const handleResumeWorkflow = async () => {
    if (!workflowData) return
    try {
      const response = await fetch(`/api/v1/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      })
      if (!response.ok) {
        throw new Error('Failed to resume workflow')
      }
      toast.success('Workflow resumed')
      setWorkflowData(prev => prev ? { ...prev, status: 'ACTIVE' } : prev)
    } catch (err) {
      toast.error('Failed to resume workflow')
    }
  }

  const handleEditWorkflow = () => {
    router.push(`/dashboard/workflows/${id}/edit`)
  }

  const handleDuplicateWorkflow = async () => {
    if (!workflowData) return
    try {
      const response = await fetch('/api/v1/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${workflowData.name} (Copy)`,
          description: workflowData.description,
          schedule: workflowData.schedule,
          agents: workflowData.agents,
          configuration: workflowData.configuration,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to duplicate workflow')
      }
      const data = await response.json()
      toast.success('Workflow duplicated')
      router.push(`/dashboard/workflows/${data.id}`)
    } catch (err) {
      toast.error('Failed to duplicate workflow')
    }
  }

  const handleDeleteWorkflow = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/v1/workflows/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete workflow')
      }
      toast.success('Workflow deleted')
      setDeleteDialogOpen(false)
      router.push("/dashboard/workflows")
    } catch (err) {
      toast.error('Failed to delete workflow')
      setDeleteDialogOpen(false)
    }
  }

  const displayStatus = statusDisplayMap[workflowData.status] || workflowData.status.toLowerCase()
  const agentsList = Array.isArray(workflowData.agents) ? workflowData.agents : []
  const lastRun = workflowData.lastRunAt ? formatRelativeTime(workflowData.lastRunAt) : 'Never'

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
                {displayStatus}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{workflowData.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-12 sm:ml-0">
          {workflowData.status === "PAUSED" ? (
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleResumeWorkflow}>
              <Play className="h-4 w-4" />
              Resume
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={handlePauseWorkflow}
              disabled={isRunning}
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          <Button size="sm" className="gap-2" onClick={handleRunWorkflow} disabled={isRunning}>
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isRunning ? "Running..." : "Run Now"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Runs", value: workflowData.runsCount || 0 },
          { label: "Schedule", value: workflowData.schedule || 'On-demand' },
          { label: "Last Run", value: lastRun },
          { label: "Created", value: formatDate(workflowData.createdAt) },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold text-foreground mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Agent Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              {agentsList.length === 0 ? (
                <p className="text-muted-foreground">No agents configured for this workflow.</p>
              ) : (
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="px-4 py-2 rounded-lg bg-accent/20 text-accent font-medium">Input: GWI Core</div>
                  {agentsList.map((agent, index) => (
                    <div key={`${agent}-${index}`} className="flex items-center gap-4">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <div className="px-4 py-2 rounded-lg bg-secondary border border-border">
                        <span className="text-foreground font-medium">{agent}</span>
                      </div>
                    </div>
                  ))}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <div className="px-4 py-2 rounded-lg bg-chart-5/20 text-chart-5 font-medium">Output: Report</div>
                </div>
              )}
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
                  <p className="text-foreground font-medium">{workflowData.schedule || 'On-demand'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-foreground font-medium capitalize">{displayStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-foreground font-medium">{formatDate(workflowData.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-foreground font-medium">{formatDate(workflowData.updatedAt)}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleEditWorkflow}>
                  <Edit className="h-4 w-4" />
                  Edit Workflow
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleDuplicateWorkflow}>
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive bg-transparent"
                  onClick={handleDeleteWorkflow}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{workflowData.name}"? This will also delete all run history and associated data. This action cannot be undone.
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
    </div>
  )
}
