"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Check, ArrowLeft, Loader2 } from "lucide-react"
import { PageTracker } from "@/components/tracking/PageTracker"
import { toast } from "sonner"
import Link from "next/link"

export default function UpgradePage() {
  const t = useTranslations("settings.billing.upgrade")
  const searchParams = useSearchParams()
  const [isYearly, setIsYearly] = useState(false)
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const canceled = searchParams.get("canceled")

  const plans = [
    {
      name: t("plans.starter.name"),
      tier: "STARTER",
      description: t("plans.starter.description"),
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        t("plans.starter.features.runs"),
        t("plans.starter.features.seats"),
        t("plans.starter.features.sources"),
        t("plans.starter.features.retention"),
        t("plans.starter.features.tokens"),
        t("plans.starter.features.support"),
      ],
      popular: false,
      current: true,
    },
    {
      name: t("plans.professional.name"),
      tier: "PROFESSIONAL",
      description: t("plans.professional.description"),
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: [
        t("plans.professional.features.runs"),
        t("plans.professional.features.seats"),
        t("plans.professional.features.sources"),
        t("plans.professional.features.retention"),
        t("plans.professional.features.tokens"),
        t("plans.professional.features.support"),
        t("plans.professional.features.analytics"),
        t("plans.professional.features.integrations"),
      ],
      popular: true,
      current: false,
    },
    {
      name: t("plans.enterprise.name"),
      tier: "ENTERPRISE",
      description: t("plans.enterprise.description"),
      monthlyPrice: 499,
      yearlyPrice: 4990,
      features: [
        t("plans.enterprise.features.runs"),
        t("plans.enterprise.features.seats"),
        t("plans.enterprise.features.sources"),
        t("plans.enterprise.features.retention"),
        t("plans.enterprise.features.tokens"),
        t("plans.enterprise.features.support"),
        t("plans.enterprise.features.customDev"),
        t("plans.enterprise.features.sso"),
        t("plans.enterprise.features.sla"),
        t("plans.enterprise.features.accountManager"),
      ],
      popular: false,
      current: false,
    },
  ]

  const handleUpgrade = async (tier: string) => {
    if (tier === "STARTER") {
      toast.info(t("currentPlan"))
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
      toast.error(error instanceof Error ? error.message : t("toast.checkoutFailed"))
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
          {t("backToBilling")}
        </Link>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      {canceled && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400">
          {t("checkoutCanceled")}
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Label htmlFor="billing-toggle" className={!isYearly ? "font-medium" : "text-muted-foreground"}>
          {t("monthly")}
        </Label>
        <Switch
          id="billing-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <Label htmlFor="billing-toggle" className={isYearly ? "font-medium" : "text-muted-foreground"}>
          {t("yearly")}
          <Badge variant="secondary" className="ml-2 bg-emerald-500/10 text-emerald-600">
            {t("save17")}
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
                {t("mostPopular")}
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {plan.current && (
                  <Badge variant="outline">{t("currentPlan")}</Badge>
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
                    {t("billedAnnually", { price: plan.yearlyPrice })}
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
                    {t("processing")}
                  </>
                ) : plan.current ? (
                  t("currentPlan")
                ) : (
                  t("upgradeTo", { plan: plan.name })
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          {t("customSales")}{" "}
          <a href="mailto:sales@gwi.com" className="text-primary hover:underline">
            {t("contactSalesTeam")}
          </a>
        </p>
      </div>
    </div>
  )
}
