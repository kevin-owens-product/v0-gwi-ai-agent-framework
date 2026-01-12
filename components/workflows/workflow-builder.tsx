/**
 * WorkflowBuilder Component
 *
 * A comprehensive interface for creating and configuring automated research workflows.
 * Allows users to chain multiple AI agents together in a pipeline, configure scheduling,
 * set output destinations, and manage workflow execution settings.
 *
 * Features:
 * - Drag-and-drop agent pipeline builder
 * - Multi-step workflow configuration
 * - Agent selection from marketplace
 * - Schedule configuration (manual, hourly, daily, weekly, monthly)
 * - Output destination management
 * - Real-time pipeline preview
 * - Draft saving and workflow execution
 * - Event tracking for analytics
 *
 * @component
 * @module components/workflows/workflow-builder
 *
 * @example
 * ```tsx
 * <WorkflowBuilder />
 * ```
 *
 * @see Workflow
 * @see Agent
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ArrowRight,
  Save,
  Play,
  Users,
  Lightbulb,
  Target,
  TrendingUp,
  PieChart,
  Globe,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useWorkflowTracking, useFormTracking, usePageViewTracking } from "@/hooks/useEventTracking"

const availableAgents = [
  { id: "audience-explorer", name: "Audience Explorer", icon: Users, color: "bg-chart-1/20 text-chart-1" },
  { id: "persona-architect", name: "Persona Architect", icon: Users, color: "bg-chart-1/20 text-chart-1" },
  { id: "campaign-strategist", name: "Campaign Strategist", icon: Lightbulb, color: "bg-chart-2/20 text-chart-2" },
  { id: "competitive-intel", name: "Competitive Intelligence", icon: Target, color: "bg-chart-3/20 text-chart-3" },
  { id: "trend-forecaster", name: "Trend Forecaster", icon: TrendingUp, color: "bg-chart-4/20 text-chart-4" },
  { id: "culture-tracker", name: "Culture Tracker", icon: TrendingUp, color: "bg-chart-4/20 text-chart-4" },
  { id: "brand-analyst", name: "Brand Analyst", icon: Target, color: "bg-chart-3/20 text-chart-3" },
  { id: "survey-analyst", name: "Survey Analyst", icon: PieChart, color: "bg-chart-5/20 text-chart-5" },
  { id: "global-perspective", name: "Global Perspective", icon: Globe, color: "bg-accent/20 text-accent" },
  { id: "motivation-decoder", name: "Motivation Decoder", icon: Lightbulb, color: "bg-chart-2/20 text-chart-2" },
]

/**
 * Configuration for a single workflow step
 */
interface WorkflowStep {
  /** Unique identifier for the step */
  id: string
  /** ID of the agent to execute in this step */
  agentId: string
  /** Step-specific configuration */
  config: {
    /** Data sources available to the agent */
    dataSources: string[]
    /** Format for agent output */
    outputFormat: string
    /** Optional custom prompt for this step */
    customPrompt: string
  }
}

export function WorkflowBuilder() {
  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: "1",
      agentId: "audience-explorer",
      config: { dataSources: ["gwi-core"], outputFormat: "markdown", customPrompt: "" },
    },
  ])
  const [schedule, setSchedule] = useState("manual")
  const [enableNotifications, setEnableNotifications] = useState(true)

  // Event tracking hooks
  usePageViewTracking({ pageName: 'Workflow Builder' })
  const { trackWorkflowCreate, trackWorkflowStepAdd } = useWorkflowTracking()
  const { onFieldChange: trackFieldChange } = useFormTracking('workflow-builder-form')

  /**
   * Track form start on first interaction
   */
  useEffect(() => {
    const handler = trackFieldChange('_init')
    handler({})
  }, [trackFieldChange])

  /**
   * Adds a new step to the workflow pipeline
   */
  const addStep = () => {
    const newStep = {
      id: Date.now().toString(),
      agentId: "",
      config: { dataSources: ["gwi-core"], outputFormat: "markdown", customPrompt: "" },
    }
    setSteps([...steps, newStep])

    // Track step addition
    trackWorkflowStepAdd('new-workflow', {
      stepCount: steps.length + 1,
      stepIndex: steps.length,
    })
  }

  /**
   * Removes a step from the workflow pipeline
   * @param id - ID of the step to remove
   */
  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter((s) => s.id !== id))
    }
  }

  /**
   * Updates the agent assigned to a workflow step
   * @param id - ID of the step to update
   * @param agentId - ID of the new agent
   */
  const updateStep = (id: string, agentId: string) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, agentId } : s)))
  }

  /**
   * Handles workflow creation with tracking
   * @param isDraft - Whether to save as draft or execute
   */
  const handleCreate = (isDraft: boolean) => {
    // Track workflow creation
    trackWorkflowCreate('new-workflow', {
      stepCount: steps.length,
      agentsUsed: steps.filter(s => s.agentId).map(s => s.agentId),
      schedule,
      enableNotifications,
      isDraft,
      hasDescription: !!description,
    })

    // TODO: Implement actual API call
    console.log('Creating workflow:', { name, description, steps, schedule, enableNotifications, isDraft })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/workflows">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Workflow</h1>
            <p className="text-muted-foreground">Design your automated research pipeline</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => handleCreate(true)}
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button
            className="gap-2"
            onClick={() => handleCreate(false)}
          >
            <Play className="h-4 w-4" />
            Create & Run
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Workflow Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Gen Z Sustainability Analysis"
                  className="mt-1.5 bg-secondary"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this workflow does..."
                  className="mt-1.5 bg-secondary min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Builder */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Agent Pipeline</CardTitle>
              <Button variant="outline" size="sm" onClick={addStep} className="gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                Add Step
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const _agent = availableAgents.find((a) => a.id === step.agentId)
                  return (
                    <div key={step.id} className="relative">
                      {index > 0 && <div className="absolute -top-4 left-6 w-px h-4 bg-border" />}
                      <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-secondary/30">
                        <div className="flex items-center gap-2 text-muted-foreground cursor-grab">
                          <GripVertical className="h-4 w-4" />
                          <span className="text-sm font-medium w-6">{index + 1}</span>
                        </div>

                        <div className="flex-1 space-y-3">
                          <Select value={step.agentId} onValueChange={(value) => updateStep(step.id, value)}>
                            <SelectTrigger className="bg-secondary">
                              <SelectValue placeholder="Select an agent" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableAgents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  <div className="flex items-center gap-2">
                                    <agent.icon className="h-4 w-4" />
                                    {agent.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {step.agentId && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs text-muted-foreground">Data Source</Label>
                                <Select defaultValue="gwi-core">
                                  <SelectTrigger className="mt-1 bg-secondary h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="gwi-core">GWI Core</SelectItem>
                                    <SelectItem value="gwi-usa">GWI USA</SelectItem>
                                    <SelectItem value="gwi-zeitgeist">GWI Zeitgeist</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Output Format</Label>
                                <Select defaultValue="markdown">
                                  <SelectTrigger className="mt-1 bg-secondary h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="markdown">Markdown</SelectItem>
                                    <SelectItem value="json">JSON</SelectItem>
                                    <SelectItem value="slides">Slides</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStep(step.id)}
                          disabled={steps.length === 1}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="flex items-center justify-center py-2">
                          <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Pipeline Preview */}
              {steps.filter((s) => s.agentId).length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <Label className="text-xs text-muted-foreground mb-3 block">Pipeline Preview</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-sm font-medium">Input</div>
                    {steps
                      .filter((s) => s.agentId)
                      .map((step, _index) => {
                        const agent = availableAgents.find((a) => a.id === step.agentId)
                        if (!agent) return null
                        return (
                          <div key={step.id} className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <div className={cn("px-3 py-1.5 rounded-lg text-sm font-medium", agent.color)}>
                              {agent.name}
                            </div>
                          </div>
                        )
                      })}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <div className="px-3 py-1.5 rounded-lg bg-chart-5/20 text-chart-5 text-sm font-medium">Output</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Schedule */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual (On-demand)</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>

              {schedule !== "manual" && (
                <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
                  This workflow will run automatically based on your schedule. You can also trigger it manually at any
                  time.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get notified when complete</p>
                </div>
                <Switch checked={enableNotifications} onCheckedChange={setEnableNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-retry on failure</Label>
                  <p className="text-xs text-muted-foreground">Retry failed runs automatically</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Save to Memory</Label>
                  <p className="text-xs text-muted-foreground">Store results in agent memory</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Outputs */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Output Destinations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Dashboard", "Email Report", "Slack Channel", "Google Docs"].map((dest) => (
                <div key={dest} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span className="text-sm text-foreground">{dest}</span>
                  <Switch defaultChecked={dest === "Dashboard"} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
