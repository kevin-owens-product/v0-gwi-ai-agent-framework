"use client"

import { useTranslations } from "next-intl"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

/**
 * A reusable empty state component with internationalization support.
 * Use this component to display empty states consistently across the application.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Database}
 *   title="No data sources configured"
 *   description="Connect external data sources to your platform"
 * >
 *   <Button>Add Data Source</Button>
 * </EmptyState>
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className
}: EmptyStateProps) {
  const t = useTranslations('ui.empty')

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {Icon && (
        <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      )}
      <h3 className="text-lg font-medium mb-1">
        {title || t('noData')}
      </h3>
      {description && (
        <p className="text-muted-foreground mb-4">
          {description}
        </p>
      )}
      {!description && !title && (
        <p className="text-muted-foreground mb-4">
          {t('getStarted')}
        </p>
      )}
      {children}
    </div>
  )
}
