/**
 * @prompt-id forge-v4.1:feature:feedback-nps:012
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bug,
  Lightbulb,
  MessageSquare,
  AlertTriangle,
  ThumbsUp,
  FileText,
  User,
  Building2,
  Clock,
  Send,
  Loader2,
  Star,
  Globe,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"

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

interface FeedbackResponseProps {
  feedback: FeedbackItem
  onUpdate: (data: {
    status?: string
    priority?: string
    responseContent?: string
    tags?: string[]
    isPublic?: boolean
  }) => Promise<void>
}

const typeIcons: Record<string, typeof Bug> = {
  BUG_REPORT: Bug,
  FEATURE_REQUEST: Lightbulb,
  GENERAL: MessageSquare,
  COMPLAINT: AlertTriangle,
  PRAISE: ThumbsUp,
  NPS: FileText,
}

const typeColors: Record<string, string> = {
  BUG_REPORT: "bg-red-500/10 text-red-500",
  FEATURE_REQUEST: "bg-amber-500/10 text-amber-500",
  GENERAL: "bg-blue-500/10 text-blue-500",
  COMPLAINT: "bg-orange-500/10 text-orange-500",
  PRAISE: "bg-green-500/10 text-green-500",
  NPS: "bg-purple-500/10 text-purple-500",
}

const statusOptions = [
  { value: "NEW", label: "New" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "PLANNED", label: "Planned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "WONT_DO", label: "Won't Do" },
  { value: "DUPLICATE", label: "Duplicate" },
]

const priorityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
]

export function FeedbackResponse({ feedback, onUpdate }: FeedbackResponseProps) {
  const [status, setStatus] = useState(feedback.status)
  const [priority, setPriority] = useState(feedback.priority)
  const [responseContent, setResponseContent] = useState(feedback.responseContent || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>(feedback.tags)

  const Icon = typeIcons[feedback.type] || MessageSquare

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus)
    setIsSubmitting(true)
    try {
      await onUpdate({ status: newStatus })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    setPriority(newPriority)
    setIsSubmitting(true)
    try {
      await onUpdate({ priority: newPriority })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendResponse = async () => {
    if (!responseContent.trim()) return
    setIsSubmitting(true)
    try {
      await onUpdate({ responseContent })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()]
      setTags(newTags)
      setTagInput("")
      onUpdate({ tags: newTags })
    }
  }

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag)
    setTags(newTags)
    onUpdate({ tags: newTags })
  }

  return (
    <div className="space-y-6">
      {/* Feedback Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", typeColors[feedback.type])}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">
                {feedback.title || feedback.type.replace(/_/g, " ")}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {feedback.user && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {feedback.user.name || feedback.user.email}
                  </div>
                )}
                {feedback.orgId && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {feedback.orgId}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(feedback.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Content */}
            <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap">
              {feedback.content}
            </div>

            {/* Rating */}
            {feedback.rating && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rating:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-4 w-4",
                        star <= feedback.rating!
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {feedback.source && (
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  Source: {feedback.source}
                </div>
              )}
              {feedback.pageUrl && (
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  Page: {feedback.pageUrl}
                </div>
              )}
              {feedback.category && (
                <Badge variant="outline">{feedback.category}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status & Priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={handleStatusChange} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={handlePriorityChange} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {tags.length === 0 && (
                <span className="text-sm text-muted-foreground">No tags</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-1.5 text-sm border rounded-md bg-background"
              />
              <Button size="sm" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Response</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedback.responseContent && feedback.respondedAt && (
            <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <Badge>Previous Response</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(feedback.respondedAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{feedback.responseContent}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label>New Response</Label>
            <Textarea
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
              placeholder="Write a response to this feedback..."
              rows={4}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSendResponse}
              disabled={!responseContent.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
