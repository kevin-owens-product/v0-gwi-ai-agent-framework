'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Crown, Zap, Star } from 'lucide-react'

interface FeatureBadgeProps {
  tier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  variant?: 'default' | 'outline'
  showIcon?: boolean
}

const TIER_CONFIG = {
  STARTER: {
    key: 'starter',
    icon: Star,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  PROFESSIONAL: {
    key: 'professional',
    icon: Zap,
    className: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  },
  ENTERPRISE: {
    key: 'enterprise',
    icon: Crown,
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  },
}

export function FeatureBadge({
  tier,
  variant = 'default',
  showIcon = true,
}: FeatureBadgeProps) {
  const t = useTranslations('features.tiers')
  const config = TIER_CONFIG[tier]
  const Icon = config.icon

  return (
    <Badge variant={variant} className={config.className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {t(config.key)}
    </Badge>
  )
}
