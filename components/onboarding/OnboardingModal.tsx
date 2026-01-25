/**
 * @prompt-id forge-v4.1:feature:onboarding-checklist:009
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, Check } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  action: string
  estimatedTime: number
  order: number
}

interface OnboardingModalProps {
  userName?: string
  steps?: OnboardingStep[]
  onDismiss?: () => void
}

export function OnboardingModal({
  userName,
  steps = [],
  onDismiss,
}: OnboardingModalProps) {
  const [open, setOpen] = useState(false)
  const [hasSeenWelcome, setHasSeenWelcome] = useState(true)

  useEffect(() => {
    // Check if user has seen the welcome modal
    const seen = localStorage.getItem('hasSeenOnboardingWelcome')
    if (!seen) {
      setOpen(true)
      setHasSeenWelcome(false)
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
    localStorage.setItem('hasSeenOnboardingWelcome', 'true')
    onDismiss?.()
  }

  const handleGetStarted = () => {
    handleClose()
    // Optionally navigate to first step
    if (steps.length > 0) {
      const firstStep = steps.sort((a, b) => a.order - b.order)[0]
      window.location.href = firstStep.action
    }
  }

  // Don't render if user has already seen the welcome
  if (hasSeenWelcome) {
    return null
  }

  const totalTime = steps.reduce((acc, step) => acc + step.estimatedTime, 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            Welcome{userName ? `, ${userName}` : ''}!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Let&apos;s get you set up with the GWI AI Agent platform. Complete
            these quick steps to unlock the full potential of your account.
          </DialogDescription>
        </DialogHeader>

        {steps.length > 0 && (
          <div className="my-4 space-y-3">
            {steps
              .sort((a, b) => a.order - b.order)
              .slice(0, 4)
              .map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {step.estimatedTime} min
                  </div>
                </div>
              ))}
            {steps.length > 4 && (
              <p className="text-xs text-center text-muted-foreground">
                +{steps.length - 4} more step{steps.length - 4 > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-4 py-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{steps.length}</p>
            <p className="text-xs text-muted-foreground">Steps</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">~{totalTime}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-chart-5">
              <Check className="h-6 w-6 inline" />
            </p>
            <p className="text-xs text-muted-foreground">Easy Setup</p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleGetStarted} className="w-full" size="lg">
            Get Started
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-full text-muted-foreground"
          >
            I&apos;ll do this later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
