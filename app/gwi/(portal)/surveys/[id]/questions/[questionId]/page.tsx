"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Save,
  Trash2,
  BarChart3,
  FileText,
  Settings,
  Hash,
  List,
  CheckSquare,
  Type,
  Calendar,
  Grid3X3,
  Loader2,
  MessageSquare,
  Users,
  Percent,
} from "lucide-react"
import { use } from "react"

interface Question {
  id: string
  surveyId: string
  code: string
  text: string
  type: string
  options: Record<string, unknown> | unknown[] | null
  validationRules: Record<string, unknown> | null
  order: number
  required: boolean
  taxonomyLinks: Record<string, unknown> | unknown[] | null
  createdAt: string
  updatedAt: string
  survey: {
    id: string
    name: string
    status: string
  }
  stats: {
    totalResponses: number
    answeredCount: number
    completedCount: number
    responseRate: number
    distribution: Record<string, number>
  }
}

const questionTypeIcons = {
  SINGLE_SELECT: List,
  MULTI_SELECT: CheckSquare,
  SCALE: BarChart3,
  OPEN_TEXT: Type,
  NUMERIC: Hash,
  DATE: Calendar,
  MATRIX: Grid3X3,
}

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string; questionId: string }>
}) {
  const { id: surveyId, questionId } = use(params)
  const t = useTranslations("gwi.surveys.questions")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    code: "",
    text: "",
    type: "SINGLE_SELECT",
    required: true,
    options: "",
    validationRules: "",
  })

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const response = await fetch(
          `/api/gwi/surveys/${surveyId}/questions/${questionId}`
        )
        if (!response.ok) {
          throw new Error("Failed to fetch question")
        }
        const data = await response.json()
        setQuestion(data)
        setFormData({
          code: data.code,
          text: data.text,
          type: data.type,
          required: data.required,
          options: data.options ? JSON.stringify(data.options, null, 2) : "",
          validationRules: data.validationRules
            ? JSON.stringify(data.validationRules, null, 2)
            : "",
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchQuestion()
  }, [surveyId, questionId])

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      let parsedOptions = null
      let parsedValidationRules = null

      if (formData.options.trim()) {
        try {
          parsedOptions = JSON.parse(formData.options)
        } catch {
          throw new Error("Invalid JSON format for options")
        }
      }

      if (formData.validationRules.trim()) {
        try {
          parsedValidationRules = JSON.parse(formData.validationRules)
        } catch {
          throw new Error("Invalid JSON format for validation rules")
        }
      }

      const response = await fetch(
        `/api/gwi/surveys/${surveyId}/questions/${questionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: formData.code,
            text: formData.text,
            type: formData.type,
            required: formData.required,
            options: parsedOptions,
            validationRules: parsedValidationRules,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save question")
      }

      // Refresh the question data
      const refreshResponse = await fetch(
        `/api/gwi/surveys/${surveyId}/questions/${questionId}`
      )
      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        setQuestion(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save question")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/gwi/surveys/${surveyId}/questions/${questionId}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete question")
      }

      router.push(`/gwi/surveys/${surveyId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete question")
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-200 rounded animate-pulse" />
          <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-16 bg-slate-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error && !question) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/gwi/surveys/${surveyId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Error</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!question) {
    return null
  }

  const Icon =
    questionTypeIcons[question.type as keyof typeof questionTypeIcons] || Type
  const typeLabel =
    questionTypeLabels[question.type as keyof typeof questionTypeLabels] ||
    question.type

  // Calculate distribution chart data
  const distributionEntries = Object.entries(question.stats.distribution).sort(
    ([, a], [, b]) => b - a
  )
  const maxCount = Math.max(...Object.values(question.stats.distribution), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/gwi/surveys/${surveyId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-muted-foreground">
                    {question.code}
                  </span>
                  <Badge variant="outline">{typeLabel}</Badge>
                  {question.required && (
                    <Badge variant="secondary">Required</Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold tracking-tight mt-1">
                  {question.text}
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground mt-2 ml-14">
              Survey:{" "}
              <Link
                href={`/gwi/surveys/${surveyId}`}
                className="text-blue-600 hover:underline"
              >
                {question.survey.name}
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 border-red-200">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Question</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this question? This action
                  cannot be undone. All response data for this question will be
                  preserved in the survey responses but will no longer be
                  associated with this question.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Question"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {question.stats.totalResponses}
                </p>
                <p className="text-sm text-muted-foreground">Total Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {question.stats.answeredCount}
                </p>
                <p className="text-sm text-muted-foreground">Answered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {question.stats.completedCount}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Percent className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {question.stats.responseRate}%
                </p>
                <p className="text-sm text-muted-foreground">Response Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="statistics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Response Distribution</CardTitle>
              <CardDescription>
                Breakdown of responses for this question
              </CardDescription>
            </CardHeader>
            <CardContent>
              {distributionEntries.length > 0 ? (
                <div className="space-y-4">
                  {distributionEntries.map(([option, count]) => {
                    const percentage =
                      question.stats.answeredCount > 0
                        ? Math.round(
                            (count / question.stats.answeredCount) * 100
                          )
                        : 0
                    const barWidth = (count / maxCount) * 100

                    return (
                      <div key={option} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate max-w-[60%]">
                            {option}
                          </span>
                          <span className="text-muted-foreground">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium">No response data yet</h3>
                  <p className="text-muted-foreground">
                    Statistics will appear once responses are collected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Question Configuration</CardTitle>
                <CardDescription>
                  Current settings for this question
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Question Code
                    </dt>
                    <dd className="text-sm font-mono mt-1">{question.code}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Type
                    </dt>
                    <dd className="flex items-center gap-2 mt-1">
                      <Icon className="h-4 w-4" />
                      <span>{typeLabel}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Order
                    </dt>
                    <dd className="text-sm mt-1">{question.order}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Required
                    </dt>
                    <dd className="text-sm mt-1">
                      {question.required ? "Yes" : "No"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Options & Validation</CardTitle>
                <CardDescription>
                  Answer choices and validation rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  {question.options && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground mb-2">
                        Options
                      </dt>
                      <dd className="font-mono text-xs bg-slate-50 p-3 rounded-lg border overflow-auto max-h-48">
                        <pre>{JSON.stringify(question.options, null, 2)}</pre>
                      </dd>
                    </div>
                  )}
                  {question.validationRules && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground mb-2">
                        Validation Rules
                      </dt>
                      <dd className="font-mono text-xs bg-slate-50 p-3 rounded-lg border overflow-auto max-h-48">
                        <pre>
                          {JSON.stringify(question.validationRules, null, 2)}
                        </pre>
                      </dd>
                    </div>
                  )}
                  {question.taxonomyLinks && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground mb-2">
                        Taxonomy Links
                      </dt>
                      <dd className="font-mono text-xs bg-slate-50 p-3 rounded-lg border overflow-auto max-h-48">
                        <pre>
                          {JSON.stringify(question.taxonomyLinks, null, 2)}
                        </pre>
                      </dd>
                    </div>
                  )}
                  {!question.options &&
                    !question.validationRules &&
                    !question.taxonomyLinks && (
                      <p className="text-sm text-muted-foreground">
                        No options or validation rules configured
                      </p>
                    )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Question</CardTitle>
              <CardDescription>
                Modify the question settings and options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Question Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="Q1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Unique identifier for this question
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Question Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE_SELECT">
                          Single Select
                        </SelectItem>
                        <SelectItem value="MULTI_SELECT">
                          Multi Select
                        </SelectItem>
                        <SelectItem value="SCALE">Scale</SelectItem>
                        <SelectItem value="OPEN_TEXT">Open Text</SelectItem>
                        <SelectItem value="NUMERIC">Numeric</SelectItem>
                        <SelectItem value="DATE">Date</SelectItem>
                        <SelectItem value="MATRIX">Matrix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text">Question Text</Label>
                  <Textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    placeholder="Enter the question text"
                    rows={3}
                  />
                </div>

                {(formData.type === "SINGLE_SELECT" ||
                  formData.type === "MULTI_SELECT") && (
                  <div className="space-y-2">
                    <Label htmlFor="options">Options (JSON)</Label>
                    <Textarea
                      id="options"
                      value={formData.options}
                      onChange={(e) =>
                        setFormData({ ...formData, options: e.target.value })
                      }
                      placeholder='["Option 1", "Option 2", "Option 3"]'
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter options as a JSON array
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="validationRules">
                    Validation Rules (JSON, optional)
                  </Label>
                  <Textarea
                    id="validationRules"
                    value={formData.validationRules}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        validationRules: e.target.value,
                      })
                    }
                    placeholder='{"min": 1, "max": 100}'
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional validation rules in JSON format
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="required"
                    checked={formData.required}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, required: checked })
                    }
                  />
                  <Label htmlFor="required">Required question</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (question) {
                        setFormData({
                          code: question.code,
                          text: question.text,
                          type: question.type,
                          required: question.required,
                          options: question.options
                            ? JSON.stringify(question.options, null, 2)
                            : "",
                          validationRules: question.validationRules
                            ? JSON.stringify(question.validationRules, null, 2)
                            : "",
                        })
                      }
                    }}
                  >
                    Reset
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Question Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-mono text-xs truncate" title={question.id}>
                {question.id}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Survey Status</dt>
              <dd>
                <Badge
                  variant="outline"
                  className={
                    question.survey.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : question.survey.status === "DRAFT"
                        ? "bg-slate-100 text-slate-700"
                        : "bg-yellow-100 text-yellow-700"
                  }
                >
                  {question.survey.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created At</dt>
              <dd className="font-medium">
                {new Date(question.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last Updated</dt>
              <dd className="font-medium">
                {new Date(question.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
