/**
 * @prompt-id forge-v4.1:feature:onboarding-checklist:006
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

'use client'

import { Button } from '@/components/ui/button'
import { Check, Circle, SkipForward, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface OnboardingStepData {
  id: string
  title: string
  description: string
  action: string
  estimatedTime: number
  order: number
}

interface OnboardingStepProps {
  step: OnboardingStepData
  status: 'pending' | 'completed' | 'skipped' | 'current'
  onComplete?: (stepId: string) => void
  onSkip?: (stepId: string) => void
  isLoading?: boolean
}

export function OnboardingStep({
  step,
  status,
  onComplete,
  onSkip,
  isLoading,
}: OnboardingStepProps) {
  const isCompleted = status === 'completed'
  const isSkipped = status === 'skipped'
  const isCurrent = status === 'current'
  const isPending = status === 'pending'

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border transition-colors',
        isCompleted && 'bg-chart-5/5 border-chart-5/30',
        isSkipped && 'bg-muted/50 border-muted',
        isCurrent && 'bg-primary/5 border-primary/30 ring-1 ring-primary/20',
        isPending && 'bg-card border-border opacity-60'
      )}
    >
      {/* Status indicator */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isCompleted && 'bg-chart-5 text-white',
          isSkipped && 'bg-muted-foreground/20 text-muted-foreground',
          isCurrent && 'bg-primary text-primary-foreground',
          isPending && 'bg-muted text-muted-foreground'
        )}
      >
        {isCompleted ? (
          <Check className="h-4 w-4" />
        ) : isSkipped ? (
          <SkipForward className="h-3 w-3" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4
              className={cn(
                'font-medium',
                isCompleted && 'text-chart-5',
                isSkipped && 'text-muted-foreground line-through',
                isCurrent && 'text-foreground',
                isPending && 'text-muted-foreground'
              )}
            >
              {step.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-0.5">
              {step.description}
            </p>
            {step.estimatedTime > 0 && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {step.estimatedTime} min
              </div>
            )}
          </div>

          {/* Actions */}
          {isCurrent && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {onSkip && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSkip(step.id)}
                  disabled={isLoading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skip
                </Button>
              )}
              <Button asChild size="sm">
                <Link href={step.action}>
                  Start
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          )}

          {isCompleted && (
            <span className="text-xs text-chart-5 font-medium">Completed</span>
          )}

          {isSkipped && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComplete?.(step.id)}
              disabled={isLoading}
              className="text-xs"
            >
              Undo skip
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
