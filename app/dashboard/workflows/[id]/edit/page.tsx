"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"

interface WorkflowData {
  id: string
  name: string
  description: string
  status: string
  schedule: string
  agents: string[]
  notifications: string[]
  autoRetry: boolean
  retryAttempts: number
}

const initialWorkflows: Record<string, WorkflowData> = {
  "wf-001": {
    id: "wf-001",
    name: "Gen Z Sustainability Analysis",
    description: "Weekly analysis of Gen Z consumer attitudes toward sustainable products across EU and NA markets.",
    status: "active",
    schedule: "weekly",
    agents: ["Audience Explorer", "Trend Forecaster"],
    notifications: ["email", "slack"],
    autoRetry: true,
    retryAttempts: 3,
  },
  "wf-002": {
    id: "wf-002",
    name: "Q4 Campaign Brief Generation",
    description: "Automated campaign brief creation for Q4 marketing initiatives with audience insights.",
    status: "active",
    schedule: "on-demand",
    agents: ["Campaign Strategist", "Persona Architect"],
    notifications: ["email"],
    autoRetry: true,
    retryAttempts: 3,
  },
  "wf-003": {
    id: "wf-003",
    name: "Competitor Market Share Tracking",
    description: "Daily competitor brand perception and market share analysis across key markets.",
    status: "scheduled",
    schedule: "daily",
    agents: ["Competitive Intelligence", "Brand Analyst"],
    notifications: ["email", "slack"],
    autoRetry: true,
    retryAttempts: 3,
  },
  "wf-004": {
    id: "wf-004",
    name: "EU Market Expansion Research",
    description: "Comprehensive market analysis for European expansion strategy and localization.",
    status: "failed",
    schedule: "weekly",
    agents: ["Global Perspective", "Survey Analyst", "Culture Tracker"],
    notifications: ["email"],
    autoRetry: true,
    retryAttempts: 3,
  },
  "wf-005": {
    id: "wf-005",
    name: "Brand Health Monitor",
    description: "Continuous brand perception tracking across demographics and sentiment analysis.",
    status: "active",
    schedule: "daily",
    agents: ["Brand Analyst", "Trend Forecaster"],
    notifications: ["email", "slack"],
    autoRetry: true,
    retryAttempts: 3,
  },
  "wf-006": {
    id: "wf-006",
    name: "Consumer Persona Weekly Refresh",
    description: "Automated refresh of consumer personas with latest behavioral data and trend insights.",
    status: "active",
    schedule: "weekly",
    agents: ["Persona Architect", "Motivation Decoder", "Audience Explorer"],
    notifications: ["email"],
    autoRetry: true,
    retryAttempts: 3,
  },
  "wf-007": {
    id: "wf-007",
    name: "Cultural Trend Alert System",
    description: "Real-time monitoring of emerging cultural trends and viral moments across social platforms.",
    status: "active",
    schedule: "hourly",
    agents: ["Culture Tracker", "Trend Forecaster"],
    notifications: ["email", "slack"],
    autoRetry: true,
    retryAttempts: 3,
  },
  "wf-008": {
    id: "wf-008",
    name: "Monthly Consumer Insights Report",
    description: "Comprehensive monthly report combining audience, brand, and trend insights for stakeholders.",
    status: "scheduled",
    schedule: "monthly",
    agents: ["Audience Explorer", "Brand Analyst", "Campaign Strategist", "Survey Analyst"],
    notifications: ["email"],
    autoRetry: true,
    retryAttempts: 3,
  },
  "wf-009": {
    id: "wf-009",
    name: "Product Launch Research Pipeline",
    description: "End-to-end research workflow for new product launches with audience validation.",
    status: "active",
    schedule: "on-demand",
    agents: ["Audience Explorer", "Motivation Decoder", "Global Perspective", "Campaign Strategist"],
    notifications: ["email", "slack"],
    autoRetry: true,
    retryAttempts: 3,
  },
  "wf-010": {
    id: "wf-010",
    name: "APAC Market Intelligence",
    description: "Weekly deep-dive into Asia-Pacific consumer trends and market opportunities.",
    status: "active",
    schedule: "weekly",
    agents: ["Global Perspective", "Culture Tracker", "Competitive Intelligence"],
    notifications: ["email"],
    autoRetry: true,
    retryAttempts: 3,
  },
}

export default function WorkflowEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { status: sessionStatus } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null)
  const t = useTranslations('dashboard.pages.workflows.edit')
  const tCommon = useTranslations('common')

  useEffect(() => {
    if (sessionStatus === "loading") return
    if (sessionStatus === "unauthenticated") {
      router.push("/login")
      return
    }
    fetchWorkflow()
  }, [id, sessionStatus, router])

  async function fetchWorkflow() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/v1/workflows/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.status === 404) {
        setError("Workflow not found")
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch workflow")
      }

      const data = await response.json()
      const workflowData = data.data || data
      
      // Map API response to component state
      const config = workflowData.configuration || {}
      setWorkflow({
        id: workflowData.id,
        name: workflowData.name || "",
        description: workflowData.description || "",
        status: workflowData.status?.toLowerCase() || "active",
        schedule: workflowData.schedule || "on-demand",
        agents: workflowData.agents || [],
        notifications: config.notifications || ["email"],
        autoRetry: config.autoRetry ?? true,
        retryAttempts: config.retryAttempts || 3,
      })
    } catch (err) {
      console.error("Error fetching workflow:", err)
      setError(err instanceof Error ? err.message : tCommon('errors.workflowLoadFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!workflow) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/workflows/${id}`, {
        method: "PATCH",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflow.name.trim(),
          description: workflow.description.trim() || undefined,
          status: workflow.status.toUpperCase(),
          schedule: workflow.schedule,
          agents: workflow.agents,
          configuration: {
            notifications: workflow.notifications,
            autoRetry: workflow.autoRetry,
            retryAttempts: workflow.retryAttempts,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || tCommon('errors.workflowUpdateFailed'))
      }

      router.push(`/dashboard/workflows/${id}`)
    } catch (err) {
      console.error("Failed to update workflow:", err)
      setError(err instanceof Error ? err.message : tCommon('errors.workflowUpdateFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !workflow) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-lg font-medium mb-2">{tCommon('errors.error')}</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Link href="/dashboard/workflows">
          <Button>{tCommon('back')}</Button>
        </Link>
      </div>
    )
  }

  if (!workflow) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/workflows/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/workflows/${id}`)}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {tCommon('saveChanges')}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>{t('basicInfo.title')}</CardTitle>
          <CardDescription>{t('basicInfo.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('basicInfo.workflowName')}</Label>
            <Input
              id="name"
              value={workflow.name}
              onChange={(e) => setWorkflow(prev => prev ? { ...prev, name: e.target.value } : null)}
              placeholder={t('basicInfo.workflowNamePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{tCommon('description')}</Label>
            <Textarea
              id="description"
              value={workflow.description}
              onChange={(e) => setWorkflow(prev => prev ? { ...prev, description: e.target.value } : null)}
              placeholder={t('basicInfo.descriptionPlaceholder')}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>{t('schedule.title')}</CardTitle>
          <CardDescription>{t('schedule.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schedule">{t('schedule.runFrequency')}</Label>
            <Select
              value={workflow.schedule}
              onValueChange={(value) => setWorkflow(prev => prev ? { ...prev, schedule: value } : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('schedule.selectSchedule')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">{t('schedule.frequencies.hourly')}</SelectItem>
                <SelectItem value="daily">{t('schedule.frequencies.daily')}</SelectItem>
                <SelectItem value="weekly">{t('schedule.frequencies.weekly')}</SelectItem>
                <SelectItem value="monthly">{t('schedule.frequencies.monthly')}</SelectItem>
                <SelectItem value="on-demand">{t('schedule.frequencies.onDemand')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">{tCommon('status')}</Label>
            <Select
              value={workflow.status}
              onValueChange={(value) => setWorkflow(prev => prev ? { ...prev, status: value } : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('schedule.selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('schedule.statuses.active')}</SelectItem>
                <SelectItem value="paused">{t('schedule.statuses.paused')}</SelectItem>
                <SelectItem value="scheduled">{t('schedule.statuses.scheduled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Handling */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>{t('errorHandling.title')}</CardTitle>
          <CardDescription>{t('errorHandling.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('errorHandling.autoRetry')}</Label>
              <p className="text-sm text-muted-foreground">{t('errorHandling.autoRetryDescription')}</p>
            </div>
            <Switch
              checked={workflow.autoRetry}
              onCheckedChange={(checked) => setWorkflow(prev => prev ? { ...prev, autoRetry: checked } : null)}
            />
          </div>
          {workflow.autoRetry && (
            <div className="space-y-2">
              <Label htmlFor="retryAttempts">{t('errorHandling.retryAttempts')}</Label>
              <Select
                value={workflow.retryAttempts.toString()}
                onValueChange={(value) => setWorkflow(prev => prev ? { ...prev, retryAttempts: parseInt(value) } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('errorHandling.selectAttempts')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t('errorHandling.attempts.one')}</SelectItem>
                  <SelectItem value="2">{t('errorHandling.attempts.two')}</SelectItem>
                  <SelectItem value="3">{t('errorHandling.attempts.three')}</SelectItem>
                  <SelectItem value="5">{t('errorHandling.attempts.five')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>{t('notifications.title')}</CardTitle>
          <CardDescription>{t('notifications.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('notifications.email')}</Label>
              <p className="text-sm text-muted-foreground">{t('notifications.emailDescription')}</p>
            </div>
            <Switch
              checked={workflow.notifications.includes("email")}
              onCheckedChange={(checked) => {
                setWorkflow(prev => {
                  if (!prev) return null
                  const notifications = checked
                    ? [...prev.notifications, "email"]
                    : prev.notifications.filter(n => n !== "email")
                  return { ...prev, notifications }
                })
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('notifications.slack')}</Label>
              <p className="text-sm text-muted-foreground">{t('notifications.slackDescription')}</p>
            </div>
            <Switch
              checked={workflow.notifications.includes("slack")}
              onCheckedChange={(checked) => {
                setWorkflow(prev => {
                  if (!prev) return null
                  const notifications = checked
                    ? [...prev.notifications, "slack"]
                    : prev.notifications.filter(n => n !== "slack")
                  return { ...prev, notifications }
                })
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
