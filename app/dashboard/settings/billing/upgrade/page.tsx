"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Check, ArrowLeft, Loader2 } from "lucide-react"
import { PageTracker } from "@/components/tracking/PageTracker"
import { toast } from "sonner"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    tier: "STARTER",
    description: "For individuals and small teams getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "100 agent runs / month",
      "3 team seats",
      "5 data sources",
      "30 day data retention",
      "100K tokens / month",
      "Community support",
    ],
    popular: false,
    current: true, // Will be dynamic
  },
  {
    name: "Professional",
    tier: "PROFESSIONAL",
    description: "For growing teams with advanced needs",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      "1,000 agent runs / month",
      "10 team seats",
      "25 data sources",
      "90 day data retention",
      "1M tokens / month",
      "Priority email support",
      "Advanced analytics",
      "Custom integrations",
    ],
    popular: true,
    current: false,
  },
  {
    name: "Enterprise",
    tier: "ENTERPRISE",
    description: "For large organizations with custom requirements",
    monthlyPrice: 499,
    yearlyPrice: 4990,
    features: [
      "Unlimited agent runs",
      "Unlimited team seats",
      "Unlimited data sources",
      "365 day data retention",
      "Unlimited tokens",
      "24/7 dedicated support",
      "Custom agent development",
      "SSO & SCIM",
      "SLA guarantee",
      "Dedicated account manager",
    ],
    popular: false,
    current: false,
  },
]

export default function UpgradePage() {
  const searchParams = useSearchParams()
  const [isYearly, setIsYearly] = useState(false)
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const canceled = searchParams.get("canceled")

  const handleUpgrade = async (tier: string) => {
    if (tier === "STARTER") {
      toast.info("You're already on the Starter plan")
      return
    }

    setLoadingTier(tier)

    try {
      const response = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planTier: tier,
          billingPeriod: isYearly ? "yearly" : "monthly",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to start checkout")
    } finally {
      setLoadingTier(null)
    }
  }

  return (
    <div className="p-6 max-w-6xl">
      <PageTracker pageName="Settings - Upgrade Plan" />

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/settings/billing"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Billing
        </Link>
        <h1 className="text-2xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Select the plan that best fits your needs. Upgrade or downgrade anytime.
        </p>
      </div>

      {canceled && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400">
          Checkout was canceled. Feel free to try again when you're ready.
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Label htmlFor="billing-toggle" className={!isYearly ? "font-medium" : "text-muted-foreground"}>
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <Label htmlFor="billing-toggle" className={isYearly ? "font-medium" : "text-muted-foreground"}>
          Yearly
          <Badge variant="secondary" className="ml-2 bg-emerald-500/10 text-emerald-600">
            Save 17%
          </Badge>
        </Label>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.tier}
            className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {plan.current && (
                  <Badge variant="outline">Current</Badge>
                )}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                </span>
                <span className="text-muted-foreground">/month</span>
                {isYearly && plan.yearlyPrice > 0 && (
                  <p className="text-sm text-muted-foreground">
                    ${plan.yearlyPrice} billed annually
                  </p>
                )}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                disabled={plan.current || loadingTier === plan.tier}
                onClick={() => handleUpgrade(plan.tier)}
              >
                {loadingTier === plan.tier ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : plan.current ? (
                  "Current Plan"
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          All plans include our core features. Need something custom?{" "}
          <a href="mailto:sales@gwi.com" className="text-primary hover:underline">
            Contact our sales team
          </a>
        </p>
      </div>
    </div>
  )
}
