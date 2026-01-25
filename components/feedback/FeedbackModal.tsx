/**
 * @prompt-id forge-v4.1:feature:feedback-nps:008
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Star,
  Loader2,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultType?: string
}

const feedbackTypes = [
  { value: "BUG_REPORT", label: "Bug Report", icon: Bug, color: "text-red-500" },
  { value: "FEATURE_REQUEST", label: "Feature Request", icon: Lightbulb, color: "text-amber-500" },
  { value: "GENERAL", label: "General Feedback", icon: MessageSquare, color: "text-blue-500" },
  { value: "COMPLAINT", label: "Complaint", icon: AlertTriangle, color: "text-orange-500" },
  { value: "PRAISE", label: "Praise", icon: ThumbsUp, color: "text-green-500" },
]

const categories = [
  "Dashboard",
  "Analytics",
  "Agents",
  "Reports",
  "Settings",
  "Performance",
  "Other",
]

export function FeedbackModal({ open, onOpenChange, defaultType }: FeedbackModalProps) {
  const [type, setType] = useState(defaultType || "")
  const [category, setCategory] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [rating, setRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!type || !content.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          category: category || null,
          title: title || null,
          content,
          rating,
          source: "in_app",
          pageUrl: window.location.href,
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          onOpenChange(false)
          // Reset form after close
          setTimeout(() => {
            setType(defaultType || "")
            setCategory("")
            setTitle("")
            setContent("")
            setRating(null)
            setIsSuccess(false)
          }, 300)
        }, 2000)
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedType = feedbackTypes.find((t) => t.value === type)

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <DialogTitle className="text-xl mb-2">Thank you!</DialogTitle>
            <DialogDescription>
              Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your thoughts, reporting bugs, or suggesting features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Feedback Type Selection */}
          <div className="space-y-2">
            <Label>What type of feedback is this?</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {feedbackTypes.map((feedbackType) => {
                const Icon = feedbackType.icon
                const isSelected = type === feedbackType.value
                return (
                  <button
                    key={feedbackType.value}
                    type="button"
                    onClick={() => setType(feedbackType.value)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", feedbackType.color)} />
                    <span className="text-sm font-medium">{feedbackType.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your feedback"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Please provide details about your feedback..."
              rows={4}
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Overall experience (optional)</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      (hoveredRating !== null ? star <= hoveredRating : star <= (rating || 0))
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
              {rating && (
                <button
                  type="button"
                  onClick={() => setRating(null)}
                  className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!type || !content.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
