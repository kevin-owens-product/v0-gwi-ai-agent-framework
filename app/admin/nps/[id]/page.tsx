/**
 * @prompt-id forge-v4.1:feature:feedback-nps:019
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect, useCallback, use } from "react"
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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Loader2,
  Settings,
  User,
  Clock,
  MessageSquare,
} from "lucide-react"
import { NPSScoreGauge, NPSDistributionChart } from "@/components/admin/feedback"

interface NPSSurvey {
  id: string
  name: string
  description: string | null
  question: string
  followUpQuestion: string | null
  targetType: string
  targetOrgs: string[]
  targetPlans: string[]
  isActive: boolean
  startDate: string | null
  endDate: string | null
  totalResponses: number
  promoters: number
  passives: number
  detractors: number
  npsScore: number | null
  createdAt: string
  updatedAt: string
}

interface NPSResponse {
  id: string
  score: number
  feedback: string | null
  followUpResponse: string | null
  category: string
  respondedAt: string
  user?: {
    id: string
    email: string
    name: string | null
  } | null
}

interface Analytics {
  scoreDistribution: Record<number, number>
  responsesOverTime: Record<string, number>
  npsScore: number | null
  responseRate: {
    promoters: number
    passives: number
    detractors: number
  }
}

export default function NPSSurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [survey, setSurvey] = useState<NPSSurvey | null>(null)
  const [responses, setResponses] = useState<NPSResponse[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResponses, setTotalResponses] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    question: "",
    followUpQuestion: "",
    isActive: true,
  })

  const fetchSurvey = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(categoryFilter !== "all" && { category: categoryFilter }),
      })

      const response = await fetch(`/api/admin/nps/surveys/${id}?${params}`)
      const data = await response.json()

      setSurvey(data.survey)
      setResponses(data.responses)
      setAnalytics(data.analytics)
      setTotalPages(data.totalPages)
      setTotalResponses(data.totalResponses)

      // Initialize edit form
      if (data.survey) {
        setEditData({
          name: data.survey.name,
          description: data.survey.description || "",
          question: data.survey.question,
          followUpQuestion: data.survey.followUpQuestion || "",
          isActive: data.survey.isActive,
        })
      }
    } catch (error) {
      console.error("Failed to fetch survey:", error)
    } finally {
      setIsLoading(false)
    }
  }, [id, page, categoryFilter])

  useEffect(() => {
    fetchSurvey()
  }, [fetchSurvey])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/nps/surveys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editData.name,
          description: editData.description || null,
          question: editData.question,
          followUpQuestion: editData.followUpQuestion || null,
          isActive: editData.isActive,
        }),
      })

      if (response.ok) {
        setIsEditOpen(false)
        fetchSurvey()
      }
    } catch (error) {
      console.error("Failed to update survey:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "PROMOTER": return "bg-green-500"
      case "PASSIVE": return "bg-amber-500"
      case "DETRACTOR": return "bg-red-500"
      default: return "bg-secondary"
    }
  }

  if (isLoading && !survey) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Survey not found
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{survey.name}</h1>
              <Badge variant={survey.isActive ? "default" : "secondary"}>
                {survey.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {survey.description && (
              <p className="text-muted-foreground mt-1">{survey.description}</p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => setIsEditOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Edit Survey
        </Button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NPSScoreGauge
          score={analytics?.npsScore || null}
          totalResponses={survey.totalResponses}
          promoters={survey.promoters}
          passives={survey.passives}
          detractors={survey.detractors}
          showBreakdown={true}
        />

        <NPSDistributionChart
          scoreDistribution={analytics?.scoreDistribution || {}}
          className="lg:col-span-2"
        />
      </div>

      {/* Survey Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Survey Question</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{survey.question}</p>
          {survey.followUpQuestion && (
            <p className="text-sm text-muted-foreground mt-2">
              Follow-up: {survey.followUpQuestion}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Responses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Responses</CardTitle>
              <CardDescription>
                {totalResponses} total responses
              </CardDescription>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PROMOTER">Promoters</SelectItem>
                <SelectItem value="PASSIVE">Passives</SelectItem>
                <SelectItem value="DETRACTOR">Detractors</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No responses yet</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Score</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead className="w-[150px]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell>
                        <Badge className={getCategoryColor(response.category)}>
                          {response.score}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {response.user?.name || response.user?.email || "Anonymous"}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        {response.feedback ? (
                          <p className="truncate">{response.feedback}</p>
                        ) : (
                          <span className="text-muted-foreground">No feedback</span>
                        )}
                        {response.followUpResponse && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            Follow-up: {response.followUpResponse}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(response.respondedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t">
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Survey</DialogTitle>
            <DialogDescription>
              Update the survey settings and questions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Survey Name</Label>
              <Input
                id="edit-name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-question">Main Question</Label>
              <Textarea
                id="edit-question"
                value={editData.question}
                onChange={(e) => setEditData({ ...editData, question: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-followUp">Follow-up Question</Label>
              <Textarea
                id="edit-followUp"
                value={editData.followUpQuestion}
                onChange={(e) => setEditData({ ...editData, followUpQuestion: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-active">Active</Label>
              <Switch
                id="edit-active"
                checked={editData.isActive}
                onCheckedChange={(v) => setEditData({ ...editData, isActive: v })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!editData.name.trim() || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
