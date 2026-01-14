'use client'

import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { cn } from '@/lib/utils'

interface UsageInlineProps {
  feature: string
  children?: React.ReactNode
  className?: string
}

export function UsageInline({ feature, children, className }: UsageInlineProps) {
  const { usage, limit, isAtLimit, isNearLimit, isLoading } =
    useFeatureAccess(feature)

  if (isLoading) {
    return <span className="text-muted-foreground">Loading...</span>
  }

  if (limit === null || limit === undefined) {
    return null
  }

  const effectiveUsage = usage || 0

  return (
    <span
      className={cn(
        'text-sm',
        isAtLimit && 'text-destructive font-medium',
        isNearLimit && !isAtLimit && 'text-yellow-600 font-medium',
        !isAtLimit && !isNearLimit && 'text-muted-foreground',
        className
      )}
    >
      {children || `${effectiveUsage} / ${limit} used`}
    </span>
  )
}
