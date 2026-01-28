'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowUpCircle, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UpgradePromptProps {
  feature?: string
  title?: string
  description?: string
  requiredPlan?: string
}

export function UpgradePrompt({
  feature,
  title,
  description,
  requiredPlan,
}: UpgradePromptProps) {
  const t = useTranslations('features.upgrade')
  const router = useRouter()

  const displayTitle = title || t('title')
  const displayDescription = description || t('description')
  const displayPlan = requiredPlan || t('defaultPlan')

  return (
    <Card className="max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <CardTitle>{displayTitle}</CardTitle>
        </div>
        <CardDescription>{displayDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feature && (
            <p className="text-sm text-muted-foreground">
              {t('requiresPlan', { plan: displayPlan })}
            </p>
          )}
          <Button
            onClick={() => router.push('/dashboard/settings/plan')}
            className="w-full"
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            {t('upgradeButton')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
