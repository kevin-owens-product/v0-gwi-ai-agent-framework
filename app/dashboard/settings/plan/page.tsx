'use client'

import { useOrganizationPlan, useOrganizationUsage } from '@/hooks/useOrganization'
import { useOrganizationFeatures } from '@/hooks/useFeatureAccess'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UsageMeter } from '@/components/features/UsageMeter'
import { FeatureBadge } from '@/components/features/FeatureBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, Crown, Zap, Star, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function PlanPage() {
  const t = useTranslations("settings.plan")

  const PLAN_FEATURES = {
    STARTER: [
      t("tiers.starter.features.members"),
      t("tiers.starter.features.agents"),
      t("tiers.starter.features.runs"),
      t("tiers.starter.features.analytics"),
      t("tiers.starter.features.support"),
    ],
    PROFESSIONAL: [
      t("tiers.professional.features.members"),
      t("tiers.professional.features.agents"),
      t("tiers.professional.features.runs"),
      t("tiers.professional.features.analytics"),
      t("tiers.professional.features.support"),
      t("tiers.professional.features.integrations"),
      t("tiers.professional.features.api"),
    ],
    ENTERPRISE: [
      t("tiers.enterprise.features.members"),
      t("tiers.enterprise.features.everything"),
      t("tiers.enterprise.features.security"),
      t("tiers.enterprise.features.sso"),
      t("tiers.enterprise.features.support"),
      t("tiers.enterprise.features.sla"),
      t("tiers.enterprise.features.onPremise"),
      t("tiers.enterprise.features.whiteLabel"),
    ],
  }

  const TIER_INFO = {
    STARTER: {
      name: t("tiers.starter.name"),
      price: t("tiers.starter.price"),
      icon: Star,
      color: 'blue',
    },
    PROFESSIONAL: {
      name: t("tiers.professional.name"),
      price: t("tiers.professional.price"),
      icon: Zap,
      color: 'purple',
    },
    ENTERPRISE: {
      name: t("tiers.enterprise.name"),
      price: t("tiers.enterprise.price"),
      icon: Crown,
      color: 'yellow',
    },
  }
  const { tier, isLoading: planLoading } = useOrganizationPlan()
  const { usage, isLoading: usageLoading } = useOrganizationUsage()
  const counts = usage?.counts
  const { features } = useOrganizationFeatures()
  const [upgrading, setUpgrading] = useState(false)

  const handleUpgrade = async (newTier: string) => {
    setUpgrading(true)
    try {
      const response = await fetch('/api/v1/organization/plan/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: newTier }),
      })

      if (!response.ok) throw new Error('Failed to request upgrade')

      toast.success(t('toast.upgradeRequestSubmitted'))
    } catch {
      toast.error(t('toast.upgradeRequestFailed'))
    } finally {
      setUpgrading(false)
    }
  }

  if (planLoading || usageLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const currentTier = tier || 'STARTER'
  const currentPlanInfo = TIER_INFO[currentTier as keyof typeof TIER_INFO]

  return (
    <div className="space-y-8">
      {/* Current Plan Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("currentPlan")}</CardTitle>
              <CardDescription>{t("currentPlanDescription")}</CardDescription>
            </div>
            <FeatureBadge tier={currentTier as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{currentPlanInfo.name}</h3>
              <p className="text-muted-foreground">{currentPlanInfo.price}</p>
            </div>
            {currentTier !== 'ENTERPRISE' && (
              <Button onClick={() => handleUpgrade(currentTier === 'STARTER' ? 'PROFESSIONAL' : 'ENTERPRISE')}>
                {t("upgradePlan")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">{t("teamMembers")}</p>
              <p className="text-2xl font-bold">{counts?.members || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("agents")}</p>
              <p className="text-2xl font-bold">{counts?.agents || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("workflows")}</p>
              <p className="text-2xl font-bold">{counts?.workflows || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("reports")}</p>
              <p className="text-2xl font-bold">{counts?.reports || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Meters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("usageThisMonth")}</CardTitle>
          <CardDescription>{t("usageDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UsageMeter feature="TEAM_MEMBERS" label={t("teamMembers")} />
          <UsageMeter feature="AGENTS" label={t("agents")} />
          <UsageMeter feature="WORKFLOW_RUNS" label={t("workflows")} />
          <UsageMeter feature="API_REQUESTS" label={t("apiRequests")} />
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{t("comparePlans")}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(TIER_INFO).map(([tierKey, info]) => {
            const Icon = info.icon
            const isCurrentPlan = tierKey === currentTier
            const features = PLAN_FEATURES[tierKey as keyof typeof PLAN_FEATURES]

            return (
              <Card
                key={tierKey}
                className={isCurrentPlan ? 'border-primary' : ''}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className="h-6 w-6" />
                    {isCurrentPlan && (
                      <Badge variant="secondary">{t("currentPlan")}</Badge>
                    )}
                  </div>
                  <CardTitle>{info.name}</CardTitle>
                  <div className="text-3xl font-bold">{info.price}</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {!isCurrentPlan && (
                    <Button
                      className="w-full"
                      variant={tierKey === 'ENTERPRISE' ? 'default' : 'outline'}
                      onClick={() => handleUpgrade(tierKey)}
                      disabled={upgrading}
                    >
                      {upgrading ? t("requesting") : t("upgradeTo", { plan: info.name })}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("yourFeatures")}</CardTitle>
          <CardDescription>{t("yourFeaturesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature: { key: string; name: string; category: string | null; limit: number | null }) => (
              <div key={feature.key} className="flex items-start gap-3 p-3 rounded-lg border">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{feature.name}</div>
                  <div className="text-sm text-muted-foreground">{feature.category}</div>
                  {feature.limit && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {t("limit", { limit: feature.limit })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
