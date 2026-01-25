/**
 * @prompt-id forge-v4.1:feature:onboarding-checklist:008
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { OnboardingStep, OnboardingStepData } from './OnboardingStep'
import { OnboardingProgress } from './OnboardingProgress'
import { ChevronDown, ChevronUp, Sparkles, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingProgressData {
  id: string
  userId: string
  orgId: string
  templateId: string | null
  currentStep: number
  totalSteps: number
  completedSteps: string[]
  skippedSteps: string[]
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
  startedAt: string
  completedAt: string | null
  lastActivityAt: string
  metadata: Record<string, unknown>
  steps: OnboardingStepData[]
}

interface OnboardingChecklistProps {
  className?: string
  defaultOpen?: boolean
  onDismiss?: () => void
}

export function OnboardingChecklist({
  className,
  defaultOpen = true,
  onDismiss,
}: OnboardingChecklistProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [progress, setProgress] = useState<OnboardingProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/onboarding/progress')
      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
      }
    } catch (error) {
      console.error('Failed to fetch onboarding progress:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const handleComplete = async (stepId: string) => {
    if (!progress) return

    setIsUpdating(true)
    try {
      const response = await fetch('/api/v1/onboarding/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', stepId }),
      })

      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
      }
    } catch (error) {
      console.error('Failed to complete step:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSkip = async (stepId: string) => {
    if (!progress) return

    setIsUpdating(true)
    try {
      const response = await fetch('/api/v1/onboarding/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'skip', stepId }),
      })

      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
      }
    } catch (error) {
      console.error('Failed to skip step:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  // Don't render if dismissed or if onboarding is complete
  if (isDismissed) {
    return null
  }

  if (isLoading) {
    return (
      <Card className={cn('bg-card border-border', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!progress || progress.status === 'COMPLETED') {
    return null
  }

  const completedCount = progress.completedSteps.length
  const skippedCount = progress.skippedSteps.length
  const totalCount = progress.steps.length

  // Calculate estimated time remaining
  const remainingSteps = progress.steps.filter(
    (step) =>
      !progress.completedSteps.includes(step.id) &&
      !progress.skippedSteps.includes(step.id)
  )
  const estimatedTimeRemaining = remainingSteps.reduce(
    (acc, step) => acc + step.estimatedTime,
    0
  )

  // Get status for each step
  const getStepStatus = (step: OnboardingStepData) => {
    if (progress.completedSteps.includes(step.id)) {
      return 'completed' as const
    }
    if (progress.skippedSteps.includes(step.id)) {
      return 'skipped' as const
    }
    // Find first incomplete step as current
    const firstIncomplete = progress.steps.find(
      (s) =>
        !progress.completedSteps.includes(s.id) &&
        !progress.skippedSteps.includes(s.id)
    )
    if (firstIncomplete?.id === step.id) {
      return 'current' as const
    }
    return 'pending' as const
  }

  return (
    <Card className={cn('bg-card border-border', className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Getting Started</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Complete these steps to get the most out of the platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Progress bar always visible */}
          <div className="mt-4">
            <OnboardingProgress
              completedSteps={completedCount}
              totalSteps={totalCount}
              skippedSteps={skippedCount}
              estimatedTimeRemaining={estimatedTimeRemaining}
            />
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {progress.steps
                .sort((a, b) => a.order - b.order)
                .map((step) => (
                  <OnboardingStep
                    key={step.id}
                    step={step}
                    status={getStepStatus(step)}
                    onComplete={handleComplete}
                    onSkip={handleSkip}
                    isLoading={isUpdating}
                  />
                ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
