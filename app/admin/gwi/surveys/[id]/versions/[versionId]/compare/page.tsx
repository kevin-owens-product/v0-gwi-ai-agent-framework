"use client"
/* eslint-disable local/no-hardcoded-strings */

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Minus, Edit } from "lucide-react"
import Link from "next/link"

interface ComparisonData {
  version: {
    id: string
    versionNumber: number
    name: string
  }
  currentSurvey: {
    id: string
    name: string
    version: number
    status: string
  }
  changes: {
    questions: Array<{
      type: "added" | "removed" | "modified"
      question: unknown
      changes?: Record<string, unknown>
    }>
    routing: Array<{
      type: "added" | "removed" | "modified"
      rule: unknown
    }>
    summary: {
      questionsAdded: number
      questionsRemoved: number
      questionsModified: number
      routingAdded: number
      routingRemoved: number
      routingModified: number
    }
  }
}

export default function VersionComparePage() {
  const params = useParams()
  const surveyId = params.id as string
  const versionId = params.versionId as string

  const [comparison, setComparison] = useState<ComparisonData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (surveyId && versionId) {
      fetchComparison()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyId, versionId])

  const fetchComparison = async () => {
    try {
      const response = await fetch(
        `/api/gwi/surveys/${surveyId}/versions/${versionId}/compare`
      )
      if (response.ok) {
        const data = await response.json()
        setComparison(data)
      }
    } catch (error) {
      console.error("Failed to fetch comparison:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading comparison...</div>
      </div>
    )
  }

  if (!comparison) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-muted-foreground">
          Failed to load comparison data
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/gwi/surveys/${surveyId}/versions`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Version Comparison</h1>
            <p className="text-muted-foreground">
              Comparing Version {comparison.version.versionNumber} with Current Survey
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Version {comparison.version.versionNumber}</CardTitle>
            <CardDescription>{comparison.version.name}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current Survey</CardTitle>
            <CardDescription>
              {comparison.currentSurvey.name} (v{comparison.currentSurvey.version})
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Questions</p>
              <div className="space-y-1 mt-2">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-green-500" />
                  <span>{comparison.changes.summary.questionsAdded} added</span>
                </div>
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-red-500" />
                  <span>{comparison.changes.summary.questionsRemoved} removed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-blue-500" />
                  <span>{comparison.changes.summary.questionsModified} modified</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Routing</p>
              <div className="space-y-1 mt-2">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-green-500" />
                  <span>{comparison.changes.summary.routingAdded} added</span>
                </div>
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-red-500" />
                  <span>{comparison.changes.summary.routingRemoved} removed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-blue-500" />
                  <span>{comparison.changes.summary.routingModified} modified</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {comparison.changes.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Question Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparison.changes.questions.map((change, index) => {
                const question = change.question as Record<string, unknown>
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    {change.type === "added" && (
                      <Badge className="bg-green-500">
                        <Plus className="h-3 w-3 mr-1" />
                        Added
                      </Badge>
                    )}
                    {change.type === "removed" && (
                      <Badge variant="destructive">
                        <Minus className="h-3 w-3 mr-1" />
                        Removed
                      </Badge>
                    )}
                    {change.type === "modified" && (
                      <Badge className="bg-blue-500">
                        <Edit className="h-3 w-3 mr-1" />
                        Modified
                      </Badge>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {question.code}: {String(question.text).substring(0, 100)}
                      </p>
                      {change.changes && (
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {Object.entries(change.changes).map(([key, value]) => (
                            <div key={key}>
                              <strong>{key}:</strong>{" "}
                              {JSON.stringify((value as { from: unknown; to: unknown }).from)}{" "}
                              → {JSON.stringify((value as { from: unknown; to: unknown }).to)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {comparison.changes.routing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Routing Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comparison.changes.routing.map((change, index) => {
                const rule = change.rule as Record<string, unknown>
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    {change.type === "added" && (
                      <Badge className="bg-green-500">
                        <Plus className="h-3 w-3 mr-1" />
                        Added
                      </Badge>
                    )}
                    {change.type === "removed" && (
                      <Badge variant="destructive">
                        <Minus className="h-3 w-3 mr-1" />
                        Removed
                      </Badge>
                    )}
                    {change.type === "modified" && (
                      <Badge className="bg-blue-500">
                        <Edit className="h-3 w-3 mr-1" />
                        Modified
                      </Badge>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">Action: {String(rule.action)}</p>
                      <p className="text-sm text-muted-foreground">
                        Priority: {String(rule.priority)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
