'use client'

import { useOrganizationPlan, useOrganizationUsage } from '@/hooks/useOrganization'
import { useOrganizationFeatures } from '@/hooks/useFeatureAccess'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UsageMeter } from '@/components/features/UsageMeter'
import { FeatureBadge } from '@/components/features/FeatureBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, Crown, Zap, Star, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const PLAN_FEATURES = {
  STARTER: [
    'Up to 5 team members',
    '10 agents',
    '50 workflow runs/month',
    'Basic analytics',
    'Email support',
  ],
  PROFESSIONAL: [
    'Up to 20 team members',
    'Unlimited agents',
    'Unlimited workflow runs',
    'Advanced analytics',
    'Priority support',
    'Custom integrations',
    'API access',
  ],
  ENTERPRISE: [
    'Unlimited team members',
    'Unlimited everything',
    'Advanced security',
    'SSO & SAML',
    'Dedicated support',
    'Custom SLAs',
    'On-premise option',
    'White-label',
  ],
}

const TIER_INFO = {
  STARTER: {
    name: 'Starter',
    price: '$49/mo',
    icon: Star,
    color: 'blue',
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: '$199/mo',
    icon: Zap,
    color: 'purple',
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 'Custom',
    icon: Crown,
    color: 'yellow',
  },
}

export default function PlanPage() {
  const { plan, tier, isLoading: planLoading } = useOrganizationPlan()
  const { usage, counts, isLoading: usageLoading } = useOrganizationUsage()
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

      toast.success('Upgrade request submitted! Our team will contact you shortly.')
    } catch (error) {
      toast.error('Failed to submit upgrade request')
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
        <h1 className="text-3xl font-bold mb-2">Plan & Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view usage metrics
        </p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            <FeatureBadge tier={currentTier as any} />
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
                Upgrade Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-2xl font-bold">{counts?.members || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Agents</p>
              <p className="text-2xl font-bold">{counts?.agents || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Workflows</p>
              <p className="text-2xl font-bold">{counts?.workflows || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reports</p>
              <p className="text-2xl font-bold">{counts?.reports || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Meters */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>Monitor your resource usage against plan limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UsageMeter feature="TEAM_MEMBERS" label="Team Members" />
          <UsageMeter feature="AGENTS" label="Agents" />
          <UsageMeter feature="WORKFLOW_RUNS" label="Workflow Runs" />
          <UsageMeter feature="API_REQUESTS" label="API Requests" />
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Compare Plans</h2>
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
                      <Badge variant="secondary">Current Plan</Badge>
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
                      {upgrading ? 'Requesting...' : `Upgrade to ${info.name}`}
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
          <CardTitle>Your Features</CardTitle>
          <CardDescription>All features included in your current plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature: any) => (
              <div key={feature.key} className="flex items-start gap-3 p-3 rounded-lg border">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{feature.name}</div>
                  <div className="text-sm text-muted-foreground">{feature.category}</div>
                  {feature.limit && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Limit: {feature.limit}
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
