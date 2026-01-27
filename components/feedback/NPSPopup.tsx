/**
 * @prompt-id forge-v4.1:feature:feedback-nps:009
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NPSPopupProps {
  surveyId: string
  question?: string
  followUpQuestion?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

export function NPSPopup({
  surveyId,
  question,
  followUpQuestion,
  open,
  onOpenChange,
  onComplete,
}: NPSPopupProps) {
  const t = useTranslations("feedback.nps")
  const defaultQuestion = question || t("defaultQuestion")
  const [score, setScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState("")
  const [followUpResponse, setFollowUpResponse] = useState("")
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hoveredScore, setHoveredScore] = useState<number | null>(null)

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setScore(null)
        setFeedback("")
        setFollowUpResponse("")
        setShowFollowUp(false)
        setIsSuccess(false)
      }, 300)
    }
  }, [open])

  const handleScoreSelect = (selectedScore: number) => {
    setScore(selectedScore)
    setShowFollowUp(true)
  }

  const handleSubmit = async () => {
    if (score === null) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/v1/nps/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId,
          score,
          feedback: feedback || null,
          followUpResponse: followUpResponse || null,
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          onOpenChange(false)
          onComplete?.()
        }, 2000)
      }
    } catch (error) {
      console.error("Failed to submit NPS response:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoreLabel = (s: number) => {
    if (s <= 6) return t("notLikely")
    if (s <= 8) return t("likely")
    return t("veryLikely")
  }

  const getScoreColor = (s: number) => {
    if (s <= 6) return "bg-red-500"
    if (s <= 8) return "bg-amber-500"
    return "bg-green-500"
  }

  const getFollowUpPrompt = () => {
    if (score === null) return ""
    if (score <= 6) return t("detractorPrompt")
    if (score <= 8) return t("passivePrompt")
    return t("promoterPrompt")
  }

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <DialogTitle className="text-xl mb-2">{t("thankYou")}</DialogTitle>
            <DialogDescription>
              {t("responseRecorded")}
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <DialogTitle className="text-center">{defaultQuestion}</DialogTitle>
          <DialogDescription className="text-center">
            {t("scaleDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Score Selection */}
          <div className="space-y-3">
            <div className="flex justify-between gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => {
                const isSelected = score === s
                const isHovered = hoveredScore === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleScoreSelect(s)}
                    onMouseEnter={() => setHoveredScore(s)}
                    onMouseLeave={() => setHoveredScore(null)}
                    className={cn(
                      "flex-1 aspect-square max-w-[40px] rounded-lg border text-sm font-medium transition-all",
                      isSelected
                        ? `${getScoreColor(s)} text-white border-transparent`
                        : isHovered
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>{t("notLikely")}</span>
              <span>{t("neutral")}</span>
              <span>{t("veryLikely")}</span>
            </div>
          </div>

          {/* Selected Score Display */}
          {score !== null && (
            <div className="text-center">
              <span className={cn("inline-block px-3 py-1 rounded-full text-sm font-medium", getScoreColor(score), "text-white")}>
                {score} - {getScoreLabel(score)}
              </span>
            </div>
          )}

          {/* Follow-up Questions */}
          {showFollowUp && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-2">
                <Label>{getFollowUpPrompt()}</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t("feedbackPlaceholder")}
                  rows={3}
                />
              </div>

              {followUpQuestion && (
                <div className="space-y-2">
                  <Label>{followUpQuestion}</Label>
                  <Textarea
                    value={followUpResponse}
                    onChange={(e) => setFollowUpResponse(e.target.value)}
                    placeholder={t("responsePlaceholder")}
                    rows={2}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                >
                  {t("maybeLater")}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("submitting")}
                    </>
                  ) : (
                    t("submit")
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
