'use client'

import { ReactNode } from 'react'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { UpgradePrompt } from './UpgradePrompt'
import { Skeleton } from '@/components/ui/skeleton'

interface FeatureGateProps {
  children: ReactNode
  feature: string
  mode?: 'hard' | 'soft'
  fallback?: ReactNode
  loadingFallback?: ReactNode
}

/**
 * Feature gate component that controls access to features based on plan
 *
 * @param mode - 'hard' hides feature completely, 'soft' shows with overlay/prompt
 * @param fallback - Custom content to show when access is denied
 */
export function FeatureGate({
  children,
  feature,
  mode = 'soft',
  fallback,
  loadingFallback,
}: FeatureGateProps) {
  const { hasAccess, isLoading } = useFeatureAccess(feature)

  // Show loading state
  if (isLoading) {
    return <>{loadingFallback || <Skeleton className="w-full h-20" />}</>
  }

  // User has access
  if (hasAccess) {
    return <>{children}</>
  }

  // Hard gate - don't render at all
  if (mode === 'hard') {
    return <>{fallback || null}</>
  }

  // Soft gate - show upgrade prompt
  return (
    <div className="relative">
      <div className="pointer-events-none opacity-50 blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        {fallback || <UpgradePrompt feature={feature} />}
      </div>
    </div>
  )
}
