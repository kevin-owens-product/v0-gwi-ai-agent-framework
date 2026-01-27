"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface SurveyQuestion {
  id: string
  code: string
  text: string
  type: string
  options: Record<string, unknown> | null
  order: number
  required: boolean
}

interface SurveyResponse {
  id: string
  surveyId: string
  respondentId: string
  answers: Record<string, unknown>
  metadata: Record<string, unknown> | null
  completedAt: string | null
  createdAt: string
  survey: {
    id: string
    name: string
    questions: SurveyQuestion[]
  }
}

export default function ResponseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string
  const responseId = params.responseId as string

  const [response, setResponse] = useState<SurveyResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editedAnswers, setEditedAnswers] = useState<Record<string, unknown>>({})

  useEffect(() => {
    fetchResponse()
  }, [surveyId, responseId])

  async function fetchResponse() {
    try {
      setLoading(true)
      const res = await fetch(`/api/gwi/surveys/${surveyId}/responses/${responseId}`)

      if (!res.ok) {
        if (res.status === 404) {
          setError("Response not found")
        } else {
          setError("Failed to load response")
        }
        return
      }

      const data = await res.json()
      setResponse(data)
      setEditedAnswers(data.answers || {})
    } catch (err) {
      setError("Failed to load response")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!response) return

    try {
      setSaving(true)
      const res = await fetch(`/api/gwi/surveys/${surveyId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: editedAnswers }),
      })

      if (!res.ok) {
        throw new Error("Failed to save")
      }

      const updated = await res.json()
      setResponse({ ...response, answers: updated.answers })
      setIsEditing(false)
    } catch (err) {
      toast.error("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true)
      const res = await fetch(`/api/gwi/surveys/${surveyId}/responses/${responseId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete")
      }

      router.push(`/gwi/surveys/${surveyId}`)
    } catch (err) {
      toast.error("Failed to delete response")
      setDeleting(false)
    }
  }

  async function handleMarkComplete() {
    if (!response) return

    try {
      setSaving(true)
      const res = await fetch(`/api/gwi/surveys/${surveyId}/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedAt: new Date().toISOString() }),
      })

      if (!res.ok) {
        throw new Error("Failed to update")
      }

      const updated = await res.json()
      setResponse({ ...response, completedAt: updated.completedAt })
    } catch (err) {
      toast.error("Failed to mark as complete")
    } finally {
      setSaving(false)
    }
  }

  function updateAnswer(questionCode: string, value: unknown) {
    setEditedAnswers((prev) => ({
      ...prev,
      [questionCode]: value,
    }))
  }

  function renderAnswerDisplay(question: SurveyQuestion) {
    const answer = response?.answers[question.code]

    if (answer === undefined || answer === null || answer === "") {
      return <span className="text-muted-foreground italic">No answer provided</span>
    }

    if (Array.isArray(answer)) {
      return (
        <div className="flex flex-wrap gap-2">
          {answer.map((item, idx) => (
            <Badge key={idx} variant="secondary">
              {String(item)}
            </Badge>
          ))}
        </div>
      )
    }

    if (typeof answer === "object") {
      return (
        <pre className="text-sm bg-slate-50 p-2 rounded overflow-auto">
          {JSON.stringify(answer, null, 2)}
        </pre>
      )
    }

    return <span>{String(answer)}</span>
  }

  function renderAnswerEditor(question: SurveyQuestion) {
    const value = editedAnswers[question.code] || ""

    switch (question.type) {
      case "SINGLE_SELECT":
      case "MULTI_SELECT":
        // For select types, show as JSON editor for simplicity
        return (
          <Textarea
            value={typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                updateAnswer(question.code, parsed)
              } catch {
                updateAnswer(question.code, e.target.value)
              }
            }}
            className="font-mono text-sm"
            rows={3}
          />
        )
      case "SCALE":
      case "NUMERIC":
        return (
          <Input
            type="number"
            value={String(value)}
            onChange={(e) => updateAnswer(question.code, parseFloat(e.target.value) || 0)}
          />
        )
      case "DATE":
        return (
          <Input
            type="date"
            value={String(value)}
            onChange={(e) => updateAnswer(question.code, e.target.value)}
          />
        )
      case "OPEN_TEXT":
      default:
        return (
          <Textarea
            value={String(value)}
            onChange={(e) => updateAnswer(question.code, e.target.value)}
            rows={3}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !response) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/gwi/surveys/${surveyId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Response Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{error || "The requested response could not be found."}</p>
            <Button asChild className="mt-4">
              <Link href={`/gwi/surveys/${surveyId}`}>Back to Survey</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
              <h1 className="text-3xl font-bold tracking-tight">Response Details</h1>
              {response.completedAt ? (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-700">
                  <Clock className="mr-1 h-3 w-3" />
                  In Progress
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Response for{" "}
              <Link href={`/gwi/surveys/${surveyId}`} className="hover:text-emerald-600">
                {response.survey.name}
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => {
                setIsEditing(false)
                setEditedAnswers(response.answers || {})
              }}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              {!response.completedAt && (
                <Button variant="outline" onClick={handleMarkComplete} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Mark Complete
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Response
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Response</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this response? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* Respondent Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Respondent Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Respondent ID</dt>
              <dd className="font-mono font-medium">{response.respondentId}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Started At</dt>
              <dd className="font-medium">
                {new Date(response.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Completed At</dt>
              <dd className="font-medium">
                {response.completedAt
                  ? new Date(response.completedAt).toLocaleString()
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Response ID</dt>
              <dd className="font-mono text-sm">{response.id}</dd>
            </div>
          </dl>
          {response.metadata && Object.keys(response.metadata).length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <dt className="text-sm text-muted-foreground mb-2">Metadata</dt>
              <dd>
                <pre className="text-sm bg-slate-50 p-3 rounded overflow-auto">
                  {JSON.stringify(response.metadata, null, 2)}
                </pre>
              </dd>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Question Answers
          </CardTitle>
          <CardDescription>
            {response.survey.questions.length} question(s) in this survey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {response.survey.questions.map((question, index) => (
              <div key={question.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-medium">{question.text}</Label>
                      {question.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                        {question.code}
                      </code>
                      <span className="text-slate-300">|</span>
                      <span>{question.type.replace("_", " ")}</span>
                    </div>
                    <div className="mt-2 pl-0">
                      {isEditing ? (
                        renderAnswerEditor(question)
                      ) : (
                        <div className="py-2">
                          {renderAnswerDisplay(question)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
