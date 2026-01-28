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
import { useTranslations } from "next-intl"
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
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const t = useTranslations("dashboard.pages.workflows.builder")

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
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

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
  const handleCreate = async (isDraft: boolean) => {
    if (!name.trim()) {
      setSaveError('Workflow name is required')
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      // Track workflow creation
      trackWorkflowCreate('new-workflow', {
        stepCount: steps.length,
        agentsUsed: steps.filter(s => s.agentId).map(s => s.agentId),
        schedule,
        enableNotifications,
        isDraft,
        hasDescription: !!description,
      })

      const response = await fetch('/api/v1/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || undefined,
          status: isDraft ? 'DRAFT' : 'ACTIVE',
          schedule: schedule === 'manual' ? undefined : schedule,
          agents: steps.filter(s => s.agentId).map(s => s.agentId),
          configuration: {
            steps: steps.map((step, index) => ({
              agentId: step.agentId,
              order: index + 1,
              config: step.config,
            })),
            enableNotifications,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create workflow')
      }

      const workflow = await response.json()
      router.push(`/dashboard/workflows/${workflow.id}`)
    } catch (error: any) {
      console.error('Failed to create workflow:', error)
      setSaveError(error.message || 'Failed to create workflow')
    } finally {
      setIsSaving(false)
    }
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
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => handleCreate(true)}
            disabled={isSaving || !name.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("saving")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t("saveDraft")}
              </>
            )}
          </Button>
          <Button
            className="gap-2"
            onClick={() => handleCreate(false)}
            disabled={isSaving || !name.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("creating")}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {t("createAndRun")}
              </>
            )}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4">
          <p className="text-sm">{saveError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t("basicInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("workflowName")}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("workflowNamePlaceholder")}
                  className="mt-1.5 bg-secondary"
                />
              </div>
              <div>
                <Label>{t("description")}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("descriptionPlaceholder")}
                  className="mt-1.5 bg-secondary min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Builder */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("agentPipeline")}</CardTitle>
              <Button variant="outline" size="sm" onClick={addStep} className="gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                {t("addStep")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, index) => {
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
                              <SelectValue placeholder={t("selectAgent")} />
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
                                <Label className="text-xs text-muted-foreground">{t("dataSource")}</Label>
                                <Select defaultValue="gwi-core">
                                  <SelectTrigger className="mt-1 bg-secondary h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="gwi-core">{t("dataSources.gwiCore")}</SelectItem>
                                    <SelectItem value="gwi-usa">{t("dataSources.gwiUsa")}</SelectItem>
                                    <SelectItem value="gwi-zeitgeist">{t("dataSources.gwiZeitgeist")}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">{t("outputFormat")}</Label>
                                <Select defaultValue="markdown">
                                  <SelectTrigger className="mt-1 bg-secondary h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="markdown">{t("outputFormats.markdown")}</SelectItem>
                                    <SelectItem value="json">{t("outputFormats.json")}</SelectItem>
                                    <SelectItem value="slides">{t("outputFormats.slides")}</SelectItem>
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
                  <Label className="text-xs text-muted-foreground mb-3 block">{t("pipelinePreview")}</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-sm font-medium">{t("input")}</div>
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
                    <div className="px-3 py-1.5 rounded-lg bg-chart-5/20 text-chart-5 text-sm font-medium">{t("output")}</div>
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
              <CardTitle>{t("schedule")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">{t("schedules.manual")}</SelectItem>
                  <SelectItem value="hourly">{t("schedules.hourly")}</SelectItem>
                  <SelectItem value="daily">{t("schedules.daily")}</SelectItem>
                  <SelectItem value="weekly">{t("schedules.weekly")}</SelectItem>
                  <SelectItem value="monthly">{t("schedules.monthly")}</SelectItem>
                </SelectContent>
              </Select>

              {schedule !== "manual" && (
                <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
                  {t("scheduleDescription")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t("settings")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("notifications")}</Label>
                  <p className="text-xs text-muted-foreground">{t("notificationsDescription")}</p>
                </div>
                <Switch checked={enableNotifications} onCheckedChange={setEnableNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("autoRetry")}</Label>
                  <p className="text-xs text-muted-foreground">{t("autoRetryDescription")}</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("saveToMemory")}</Label>
                  <p className="text-xs text-muted-foreground">{t("saveToMemoryDescription")}</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Outputs */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t("outputDestinations")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "dashboard", label: t("destinations.dashboard") },
                { key: "email", label: t("destinations.emailReport") },
                { key: "slack", label: t("destinations.slackChannel") },
                { key: "docs", label: t("destinations.googleDocs") },
              ].map((dest) => (
                <div key={dest.key} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span className="text-sm text-foreground">{dest.label}</span>
                  <Switch defaultChecked={dest.key === "dashboard"} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
