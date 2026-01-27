"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useTranslations } from "next-intl"

export function PricingSection() {
  const t = useTranslations("landing.pricing")

  const tiers = [
    {
      nameKey: "starter",
      priceKey: "starterPrice",
      periodKey: "starterPeriod",
      descKey: "starterDesc",
      features: [
        "starterFeature1",
        "starterFeature2",
        "starterFeature3",
        "starterFeature4",
        "starterFeature5",
        "starterFeature6",
        "starterFeature7",
      ],
      ctaKey: "starterCta",
      featured: false,
    },
    {
      nameKey: "professional",
      priceKey: "professionalPrice",
      periodKey: "professionalPeriod",
      descKey: "professionalDesc",
      features: [
        "professionalFeature1",
        "professionalFeature2",
        "professionalFeature3",
        "professionalFeature4",
        "professionalFeature5",
        "professionalFeature6",
        "professionalFeature7",
        "professionalFeature8",
        "professionalFeature9",
        "professionalFeature10",
      ],
      ctaKey: "professionalCta",
      featured: true,
    },
    {
      nameKey: "enterprise",
      priceKey: "enterprisePrice",
      periodKey: "enterprisePeriod",
      descKey: "enterpriseDesc",
      features: [
        "enterpriseFeature1",
        "enterpriseFeature2",
        "enterpriseFeature3",
        "enterpriseFeature4",
        "enterpriseFeature5",
        "enterpriseFeature6",
        "enterpriseFeature7",
        "enterpriseFeature8",
        "enterpriseFeature9",
        "enterpriseFeature10",
      ],
      ctaKey: "enterpriseCta",
      featured: false,
    },
  ]

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t("title")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.nameKey}
              className={`rounded-xl border p-8 ${
                tier.featured ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border bg-card"
              }`}
            >
              {tier.featured && (
                <div className="text-xs font-medium text-accent uppercase tracking-wider mb-4">{t("mostPopular")}</div>
              )}
              <h3 className="text-xl font-semibold text-foreground mb-2">{t(tier.nameKey)}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-foreground">{t(tier.priceKey)}</span>
                <span className="text-muted-foreground">{t(tier.periodKey)}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{t(tier.descKey)}</p>
              <Button
                className={`w-full mb-8 ${tier.featured ? "" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                variant={tier.featured ? "default" : "secondary"}
              >
                {t(tier.ctaKey)}
              </Button>
              <ul className="space-y-3">
                {tier.features.map((featureKey) => (
                  <li key={featureKey} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-chart-5 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{t(featureKey)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
