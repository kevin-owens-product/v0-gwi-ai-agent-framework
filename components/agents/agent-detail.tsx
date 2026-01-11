"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Play,
  Users,
  Clock,
  Zap,
  BookOpen,
  Trash2,
  Loader2,
  AlertCircle,
  PieChart,
  FileText,
  Target,
  Brain,
  CheckCircle,
  XCircle,
  Pause,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface AgentRun {
  id: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  startedAt: string
  completedAt: string | null
  tokensUsed: number
}

interface Agent {
  id: string
  name: string
  description: string | null
  type: 'RESEARCH' | 'ANALYSIS' | 'REPORTING' | 'MONITORING' | 'CUSTOM'
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  configuration: Record<string, unknown>
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    name: string | null
    email: string
  }
  runs: AgentRun[]
  _count: {
    runs: number
  }
}

// Map agent types to icons and colors
const typeConfig: Record<string, { icon: typeof Users; color: string }> = {
  RESEARCH: { icon: Users, color: "bg-chart-1/20 text-chart-1" },
  ANALYSIS: { icon: PieChart, color: "bg-chart-2/20 text-chart-2" },
  REPORTING: { icon: FileText, color: "bg-chart-3/20 text-chart-3" },
  MONITORING: { icon: Target, color: "bg-chart-4/20 text-chart-4" },
  CUSTOM: { icon: Brain, color: "bg-chart-5/20 text-chart-5" },
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-emerald-500/10 text-emerald-400",
  PAUSED: "bg-yellow-500/10 text-yellow-400",
  ARCHIVED: "bg-red-500/10 text-red-400",
}

const runStatusIcons: Record<string, typeof CheckCircle> = {
  COMPLETED: CheckCircle,
  FAILED: XCircle,
  RUNNING: Loader2,
  PENDING: Clock,
  CANCELLED: Pause,
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return 'In progress'
  const start = new Date(startedAt).getTime()
  const end = new Date(completedAt).getTime()
  const diffMs = end - start
  if (diffMs < 1000) return `${diffMs}ms`
  if (diffMs < 60000) return `${Math.round(diffMs / 1000)}s`
  return `${Math.round(diffMs / 60000)}m`
}

export function AgentDetail({ id }: { id: string }) {
  const router = useRouter()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchAgent() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/v1/agents/${id}`)
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to fetch agent')
        }
        const data = await response.json()
        setAgent(data.data)
      } catch (err) {
        console.error('Failed to fetch agent:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch agent')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgent()
  }, [id])

  const handleStatusChange = async (newStatus: 'ACTIVE' | 'PAUSED' | 'ARCHIVED') => {
    if (!agent) return
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/v1/agents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update agent')
      }
      const data = await response.json()
      setAgent(data.data)
      toast.success(`Agent ${newStatus.toLowerCase()}`)
    } catch (err) {
      console.error('Failed to update agent:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update agent')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/v1/agents/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete agent')
      }
      toast.success('Agent deleted')
      router.push('/dashboard/agents')
    } catch (err) {
      console.error('Failed to delete agent:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to delete agent')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-lg font-medium mb-2">Agent not found</p>
        <p className="text-sm text-muted-foreground mb-4">{error || 'The agent you are looking for does not exist'}</p>
        <Link href="/dashboard/agents">
          <Button>Back to Agents</Button>
        </Link>
      </div>
    )
  }

  const config = typeConfig[agent.type] || typeConfig.CUSTOM
  const Icon = config.icon
  const totalRuns = agent._count?.runs || 0
  const completedRuns = agent.runs.filter(r => r.status === 'COMPLETED').length
  const successRate = totalRuns > 0 ? Math.round((completedRuns / Math.min(totalRuns, agent.runs.length)) * 100) : 0
  const totalTokens = agent.runs.reduce((acc, run) => acc + (run.tokensUsed || 0), 0)

  // Calculate average duration
  const completedRunsWithTime = agent.runs.filter(r => r.status === 'COMPLETED' && r.completedAt)
  let avgDuration = '0s'
  if (completedRunsWithTime.length > 0) {
    const totalMs = completedRunsWithTime.reduce((acc, run) => {
      const start = new Date(run.startedAt).getTime()
      const end = new Date(run.completedAt!).getTime()
      return acc + (end - start)
    }, 0)
    const avgMs = totalMs / completedRunsWithTime.length
    if (avgMs < 1000) avgDuration = `${Math.round(avgMs)}ms`
    else if (avgMs < 60000) avgDuration = `${(avgMs / 1000).toFixed(1)}s`
    else avgDuration = `${(avgMs / 60000).toFixed(1)}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/agents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className={`w-16 h-16 rounded-2xl ${config.color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{agent.name}</h1>
              <Badge className={statusColors[agent.status]}>
                {agent.status.toLowerCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {agent.type.toLowerCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {agent.description || 'No description provided'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Created by {agent.creator?.name || agent.creator?.email || 'Unknown'} on {formatDate(agent.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-12 lg:ml-0">
          {agent.status === 'DRAFT' && (
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => handleStatusChange('ACTIVE')}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Activate
            </Button>
          )}
          {agent.status === 'ACTIVE' && (
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => handleStatusChange('PAUSED')}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4" />}
              Pause
            </Button>
          )}
          {agent.status === 'PAUSED' && (
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => handleStatusChange('ACTIVE')}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Resume
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{agent.name}"? This will also delete all associated runs and insights. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Delete Agent
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {agent.status === 'ACTIVE' && (
            <Link href={`/dashboard/playground?agent=${id}`}>
              <Button className="gap-2">
                <Play className="h-4 w-4" />
                Run Agent
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Runs", value: totalRuns.toString(), icon: Zap },
          { label: "Avg Duration", value: avgDuration, icon: Clock },
          { label: "Success Rate", value: `${successRate}%`, icon: CheckCircle },
          { label: "Tokens Used", value: totalTokens.toLocaleString(), icon: BookOpen },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="runs">Run History</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>About This Agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <p className="text-muted-foreground whitespace-pre-line">
                      {agent.description || 'No description provided. Add a description to help others understand what this agent does.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Recent Runs</CardTitle>
                </CardHeader>
                <CardContent>
                  {agent.runs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No runs yet. Run the agent to see history here.</p>
                  ) : (
                    <div className="space-y-2">
                      {agent.runs.slice(0, 5).map((run) => {
                        const StatusIcon = runStatusIcons[run.status] || Clock
                        return (
                          <div key={run.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
                            <div className="flex items-center gap-3">
                              <StatusIcon className={`h-4 w-4 ${
                                run.status === 'COMPLETED' ? 'text-emerald-400' :
                                run.status === 'FAILED' ? 'text-red-400' :
                                run.status === 'RUNNING' ? 'text-yellow-400 animate-spin' :
                                'text-muted-foreground'
                              }`} />
                              <div>
                                <p className="text-sm font-medium">{run.status.toLowerCase()}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(run.startedAt)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{formatDuration(run.startedAt, run.completedAt)}</p>
                              <p className="text-xs text-muted-foreground">{run.tokensUsed.toLocaleString()} tokens</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Agent Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm font-medium capitalize">{agent.type.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm font-medium capitalize">{agent.status.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">{formatDate(agent.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Updated</p>
                    <p className="text-sm font-medium">{formatDate(agent.updatedAt)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Run History</CardTitle>
            </CardHeader>
            <CardContent>
              {agent.runs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No runs yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Run the agent to see history here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {agent.runs.map((run) => {
                    const StatusIcon = runStatusIcons[run.status] || Clock
                    return (
                      <div key={run.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30">
                        <div className="flex items-center gap-4">
                          <StatusIcon className={`h-5 w-5 ${
                            run.status === 'COMPLETED' ? 'text-emerald-400' :
                            run.status === 'FAILED' ? 'text-red-400' :
                            run.status === 'RUNNING' ? 'text-yellow-400 animate-spin' :
                            'text-muted-foreground'
                          }`} />
                          <div>
                            <p className="font-medium">{run.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(run.startedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatDuration(run.startedAt, run.completedAt)}</p>
                            <p className="text-xs text-muted-foreground">Duration</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{run.tokensUsed.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Tokens</p>
                          </div>
                          <Badge className={
                            run.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                            run.status === 'FAILED' ? 'bg-red-500/10 text-red-400' :
                            run.status === 'RUNNING' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-muted text-muted-foreground'
                          }>
                            {run.status.toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-secondary p-4 font-mono text-sm">
                <pre className="text-muted-foreground overflow-x-auto">
                  {JSON.stringify(agent.configuration, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-secondary p-4 font-mono text-sm">
                <pre className="text-muted-foreground overflow-x-auto">
                  {`POST /api/v1/agents/${id}/run

{
  "input": {
    "prompt": "Your research question here",
    "options": {
      "temperature": 0.7,
      "maxTokens": 4096
    }
  }
}

Response:
{
  "data": {
    "runId": "run_abc123",
    "status": "RUNNING",
    "message": "Agent run started successfully"
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
