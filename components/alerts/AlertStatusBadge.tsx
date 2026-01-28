/**
 * @prompt-id forge-v4.1:feature:custom-alerts:006
 * @generated-at 2024-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AlertStatus } from "@/hooks/use-alerts"
import { Bell, BellOff, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface AlertStatusBadgeProps {
  status: AlertStatus | 'ACTIVE' | 'INACTIVE'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const STATUS_CONFIG: Record<string, {
  translationKey: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className: string
  icon: React.ReactNode
}> = {
  TRIGGERED: {
    translationKey: 'statuses.triggered',
    variant: 'destructive',
    className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  ACKNOWLEDGED: {
    translationKey: 'statuses.acknowledged',
    variant: 'default',
    className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    icon: <Bell className="h-3 w-3" />,
  },
  RESOLVED: {
    translationKey: 'statuses.resolved',
    variant: 'secondary',
    className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  IGNORED: {
    translationKey: 'statuses.ignored',
    variant: 'outline',
    className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    icon: <XCircle className="h-3 w-3" />,
  },
  ACTIVE: {
    translationKey: 'statuses.active',
    variant: 'default',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    icon: <Bell className="h-3 w-3" />,
  },
  INACTIVE: {
    translationKey: 'statuses.inactive',
    variant: 'outline',
    className: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    icon: <BellOff className="h-3 w-3" />,
  },
}

const SIZE_CLASSES = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1',
}

export function AlertStatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className,
}: AlertStatusBadgeProps) {
  const t = useTranslations("alerts")
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.TRIGGERED

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
        config.className,
        SIZE_CLASSES[size],
        className
      )}
    >
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {t(config.translationKey)}
    </Badge>
  )
}

export default AlertStatusBadge
