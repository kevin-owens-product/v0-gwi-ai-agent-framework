'use client'

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
  title = 'Unlock this feature',
  description = 'Upgrade your plan to access this premium feature',
  requiredPlan = 'Professional',
}: UpgradePromptProps) {
  const router = useRouter()

  return (
    <Card className="max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feature && (
            <p className="text-sm text-muted-foreground">
              This feature requires a <strong>{requiredPlan}</strong> plan or higher.
            </p>
          )}
          <Button
            onClick={() => router.push('/dashboard/settings/plan')}
            className="w-full"
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
