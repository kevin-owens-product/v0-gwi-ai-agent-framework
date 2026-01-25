/**
 * @prompt-id forge-v4.1:feature:feedback-nps:007
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquarePlus } from "lucide-react"
import { FeedbackModal } from "./FeedbackModal"

interface FeedbackButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  variant?: "floating" | "inline"
}

export function FeedbackButton({
  position = "bottom-right",
  variant = "floating",
}: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const positionClasses = {
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6",
    "top-right": "fixed top-20 right-6",
    "top-left": "fixed top-20 left-6",
  }

  if (variant === "inline") {
    return (
      <>
        <Button onClick={() => setIsOpen(true)} variant="outline" size="sm">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          Send Feedback
        </Button>
        <FeedbackModal open={isOpen} onOpenChange={setIsOpen} />
      </>
    )
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`${positionClasses[position]} z-50 shadow-lg rounded-full h-12 w-12 p-0`}
        size="icon"
      >
        <MessageSquarePlus className="h-5 w-5" />
        <span className="sr-only">Send feedback</span>
      </Button>
      <FeedbackModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
