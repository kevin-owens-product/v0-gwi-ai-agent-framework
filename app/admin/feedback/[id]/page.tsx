/**
 * @prompt-id forge-v4.1:feature:feedback-nps:017
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Clock } from "lucide-react"
import { FeedbackResponse } from "@/components/admin/feedback"

interface FeedbackItem {
  id: string
  type: string
  category: string | null
  title: string | null
  content: string
  rating: number | null
  npsScore: number | null
  sentiment: string | null
  source: string | null
  pageUrl: string | null
  status: string
  priority: string
  assignedTo: string | null
  responseContent: string | null
  respondedAt: string | null
  tags: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    email: string
    name: string | null
    image: string | null
  } | null
  orgId: string | null
}

interface RelatedFeedback {
  id: string
  type: string
  title: string | null
  status: string
  createdAt: string
}

export default function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [feedback, setFeedback] = useState<FeedbackItem | null>(null)
  const [relatedFeedback, setRelatedFeedback] = useState<RelatedFeedback[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/feedback/${id}`)
      const data = await response.json()
      setFeedback(data.feedbackItem)
      setRelatedFeedback(data.relatedFeedback || [])
    } catch (error) {
      console.error("Failed to fetch feedback:", error)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  const handleUpdate = async (updateData: {
    status?: string
    priority?: string
    responseContent?: string
    tags?: string[]
    isPublic?: boolean
  }) => {
    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })
      if (response.ok) {
        const data = await response.json()
        setFeedback(data.feedbackItem)
      }
    } catch (error) {
      console.error("Failed to update feedback:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!feedback) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Feedback not found
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Feedback Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <FeedbackResponse feedback={feedback} onUpdate={handleUpdate} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related Feedback */}
          {relatedFeedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatedFeedback.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/admin/feedback/${item.id}`)}
                    >
                      <p className="font-medium text-sm truncate">
                        {item.title || item.type.replace(/_/g, " ")}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{item.status.replace(/_/g, " ")}</span>
                        <span>-</span>
                        <Clock className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline (placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="text-sm">Feedback received</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(feedback.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {feedback.respondedAt && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="text-sm">Response sent</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(feedback.respondedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-muted mt-2" />
                  <div>
                    <p className="text-sm">Last updated</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(feedback.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
