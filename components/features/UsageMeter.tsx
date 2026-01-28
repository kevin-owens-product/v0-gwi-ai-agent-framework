'use client'

import { useTranslations } from 'next-intl'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UsageMeterProps {
  feature: string
  label?: string
  showPercentage?: boolean
  warnAt?: number // percentage to show warning
}

export function UsageMeter({
  feature,
  label,
  showPercentage = true,
}: UsageMeterProps) {
  const t = useTranslations('features.usage')
  const { usage, limit, percentage, isNearLimit, isAtLimit, isLoading } =
    useFeatureAccess(feature)

  if (isLoading) {
    return <div className="h-4 w-full animate-pulse bg-muted rounded" />
  }

  if (limit === null || limit === undefined) {
    return null
  }

  const effectiveUsage = usage || 0
  const effectivePercentage = percentage || 0

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span
            className={cn(
              'font-medium',
              isAtLimit && 'text-destructive',
              isNearLimit && !isAtLimit && 'text-yellow-600'
            )}
          >
            {effectiveUsage} / {limit}
            {showPercentage && ` (${Math.round(effectivePercentage)}%)`}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Progress
          value={effectivePercentage}
          className={cn(
            'flex-1',
            isAtLimit && '[&>div]:bg-destructive',
            isNearLimit && !isAtLimit && '[&>div]:bg-yellow-500'
          )}
        />

        {isAtLimit ? (
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
        ) : isNearLimit ? (
          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
        )}
      </div>

      {isAtLimit && (
        <p className="text-xs text-destructive">
          {t('limitReached')}
        </p>
      )}

      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-yellow-600">
          {t('approachingLimit')}
        </p>
      )}
    </div>
  )
}
