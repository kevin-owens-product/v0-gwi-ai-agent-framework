"use client"

import { useTranslations } from "next-intl"

interface LoadingTextProps {
  className?: string
}

/**
 * A simple loading text component that uses internationalization.
 * Can be used in Suspense fallbacks and other loading states.
 */
export function LoadingText({ className = "text-muted-foreground" }: LoadingTextProps) {
  const t = useTranslations('ui.loading')
  return <p className={className}>{t('loading')}</p>
}
