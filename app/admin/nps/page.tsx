/**
 * @prompt-id forge-v4.1:feature:feedback-nps:018
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  RefreshCw,
  Plus,
  Users,
  TrendingUp,
  BarChart3,
  Loader2,
  Clock,
  Eye,
  Trash2,
} from "lucide-react"
import { NPSScoreGauge } from "@/components/admin/feedback"

interface NPSSurvey {
  id: string
  name: string
  description: string | null
  question: string
  followUpQuestion: string | null
  targetType: string
  isActive: boolean
  startDate: string | null
  endDate: string | null
  totalResponses: number
  promoters: number
  passives: number
  detractors: number
  npsScore: number | null
  createdAt: string
  _count: {
    responses: number
  }
}

interface OverallStats {
  totalSurveys: number
  totalResponses: number
  overallNpsScore: number | null
  totalPromoters: number
  totalPassives: number
  totalDetractors: number
}

export default function NPSPage() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<NPSSurvey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<OverallStats | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Create survey dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newSurvey, setNewSurvey] = useState({
    name: "",
    description: "",
    question: "How likely are you to recommend us to a friend or colleague?",
    followUpQuestion: "",
    targetType: "ALL",
    isActive: true,
  })

  const fetchSurveys = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })

      const response = await fetch(`/api/admin/nps/surveys?${params}`)
      const data = await response.json()

      setSurveys(data.surveys)
      setTotalPages(data.totalPages)
      setStats(data.overallStats)
    } catch (error) {
      console.error("Failed to fetch surveys:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchSurveys()
  }, [fetchSurveys])

  const handleCreateSurvey = async () => {
    if (!newSurvey.name.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/admin/nps/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSurvey,
          followUpQuestion: newSurvey.followUpQuestion || null,
          description: newSurvey.description || null,
        }),
      })

      if (response.ok) {
        setIsCreateOpen(false)
        setNewSurvey({
          name: "",
          description: "",
          question: "How likely are you to recommend us to a friend or colleague?",
          followUpQuestion: "",
          targetType: "ALL",
          isActive: true,
        })
        fetchSurveys()
      }
    } catch (error) {
      console.error("Failed to create survey:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteSurvey = async (surveyId: string) => {
    if (!confirm("Are you sure you want to delete this survey? All responses will be lost.")) {
      return
    }

    try {
      await fetch(`/api/admin/nps/surveys/${surveyId}`, {
        method: "DELETE",
      })
      fetchSurveys()
    } catch (error) {
      console.error("Failed to delete survey:", error)
    }
  }

  const handleToggleActive = async (surveyId: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/nps/surveys/${surveyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })
      fetchSurveys()
    } catch (error) {
      console.error("Failed to update survey:", error)
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">NPS Surveys</h1>
          <p className="text-muted-foreground">
            Manage Net Promoter Score surveys and track customer satisfaction
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSurveys} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Survey
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create NPS Survey</DialogTitle>
                <DialogDescription>
                  Set up a new Net Promoter Score survey to gather customer feedback.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Survey Name</Label>
                  <Input
                    id="name"
                    value={newSurvey.name}
                    onChange={(e) => setNewSurvey({ ...newSurvey, name: e.target.value })}
                    placeholder="Q1 2026 NPS Survey"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={newSurvey.description}
                    onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                    placeholder="Quarterly customer satisfaction survey"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question">Main Question</Label>
                  <Textarea
                    id="question"
                    value={newSurvey.question}
                    onChange={(e) => setNewSurvey({ ...newSurvey, question: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followUp">Follow-up Question (optional)</Label>
                  <Textarea
                    id="followUp"
                    value={newSurvey.followUpQuestion}
                    onChange={(e) => setNewSurvey({ ...newSurvey, followUpQuestion: e.target.value })}
                    placeholder="What's the main reason for your score?"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target Audience</Label>
                  <Select
                    value={newSurvey.targetType}
                    onValueChange={(v) => setNewSurvey({ ...newSurvey, targetType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Users</SelectItem>
                      <SelectItem value="SPECIFIC_ORGS">Specific Organizations</SelectItem>
                      <SelectItem value="SPECIFIC_PLANS">Specific Plans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Active Immediately</Label>
                  <Switch
                    id="active"
                    checked={newSurvey.isActive}
                    onCheckedChange={(v) => setNewSurvey({ ...newSurvey, isActive: v })}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSurvey} disabled={!newSurvey.name.trim() || isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Survey"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <NPSScoreGauge
          score={stats?.overallNpsScore || null}
          totalResponses={stats?.totalResponses || 0}
          promoters={stats?.totalPromoters || 0}
          passives={stats?.totalPassives || 0}
          detractors={stats?.totalDetractors || 0}
          showBreakdown={true}
          className="md:col-span-2 lg:col-span-1"
        />

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Surveys</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalSurveys || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Active campaigns
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Responses</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalResponses || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Across all surveys
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Promoter Rate</CardDescription>
            <CardTitle className="text-3xl text-green-500">
              {stats && stats.totalResponses > 0
                ? `${Math.round((stats.totalPromoters / stats.totalResponses) * 100)}%`
                : "0%"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              {stats?.totalPromoters || 0} promoters
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Surveys List */}
      <Card>
        <CardHeader>
          <CardTitle>All Surveys</CardTitle>
          <CardDescription>
            Manage your NPS surveys and view responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : surveys.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No surveys created yet</p>
              <p className="text-sm">Create your first NPS survey to start collecting feedback</p>
            </div>
          ) : (
            <div className="space-y-4">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{survey.name}</h3>
                        <Badge variant={survey.isActive ? "default" : "secondary"}>
                          {survey.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {survey.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {survey.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {survey.totalResponses} responses
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          NPS: {survey.npsScore !== null ? Math.round(Number(survey.npsScore)) : "-"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(survey.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {/* Mini breakdown */}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-green-500">
                          {survey.promoters} promoters
                        </span>
                        <span className="text-xs text-amber-500">
                          {survey.passives} passives
                        </span>
                        <span className="text-xs text-red-500">
                          {survey.detractors} detractors
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={survey.isActive}
                        onCheckedChange={(v) => handleToggleActive(survey.id, v)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/nps/${survey.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSurvey(survey.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
