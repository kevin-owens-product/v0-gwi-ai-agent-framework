/**
 * @prompt-id forge-v4.1:feature:onboarding-checklist:007
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

'use client'

import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Clock } from 'lucide-react'

interface OnboardingProgressProps {
  completedSteps: number
  totalSteps: number
  skippedSteps?: number
  estimatedTimeRemaining?: number
}

export function OnboardingProgress({
  completedSteps,
  totalSteps,
  skippedSteps = 0,
  estimatedTimeRemaining,
}: OnboardingProgressProps) {
  const effectiveTotal = totalSteps - skippedSteps
  const percentage =
    effectiveTotal > 0
      ? Math.round((completedSteps / effectiveTotal) * 100)
      : 100
  const isComplete = completedSteps >= effectiveTotal

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-chart-5" />
          ) : (
            <span className="text-sm font-medium text-foreground">
              {completedSteps} of {effectiveTotal} completed
            </span>
          )}
          {isComplete && (
            <span className="text-sm font-medium text-chart-5">
              All done!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {!isComplete && estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
            <>
              <Clock className="h-3 w-3" />
              <span>~{estimatedTimeRemaining} min left</span>
            </>
          )}
          <span className="font-medium">{percentage}%</span>
        </div>
      </div>

      <Progress
        value={percentage}
        className="h-2"
      />

      {skippedSteps > 0 && (
        <p className="text-xs text-muted-foreground">
          {skippedSteps} step{skippedSteps > 1 ? 's' : ''} skipped
        </p>
      )}
    </div>
  )
}
