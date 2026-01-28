"use client"

import Link from "next/link"
import { ArrowLeft, Users, TrendingUp, Target, Package, Lightbulb, Search, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function SolutionsPage() {
  const t = useTranslations("solutions")
  const tCommon = useTranslations("common")

  const solutions = [
    {
      titleKey: "salesTeams.title",
      descriptionKey: "salesTeams.description",
      icon: TrendingUp,
      href: "/solutions/sales",
      metricsKeys: ["salesTeams.metrics.fasterProposals", "salesTeams.metrics.moreOpportunities", "salesTeams.metrics.higherWinRates"],
    },
    {
      titleKey: "insightsTeams.title",
      descriptionKey: "insightsTeams.description",
      icon: Users,
      href: "/solutions/insights",
      metricsKeys: ["insightsTeams.metrics.fasterDelivery", "insightsTeams.metrics.moreStudies", "insightsTeams.metrics.lowerCosts"],
    },
    {
      titleKey: "adSales.title",
      descriptionKey: "adSales.description",
      icon: Target,
      href: "/solutions/ad-sales",
      metricsKeys: ["adSales.metrics.fasterRfps", "adSales.metrics.morePackages", "adSales.metrics.higherWinRates"],
    },
    {
      titleKey: "marketing.title",
      descriptionKey: "marketing.description",
      icon: TrendingUp,
      href: "/solutions/marketing",
      metricsKeys: ["marketing.metrics.fasterCampaigns", "marketing.metrics.engagement", "marketing.metrics.betterPerception"],
    },
    {
      titleKey: "productDevelopment.title",
      descriptionKey: "productDevelopment.description",
      icon: Package,
      href: "/solutions/product",
      metricsKeys: ["productDevelopment.metrics.fasterResearch", "productDevelopment.metrics.moreConcepts", "productDevelopment.metrics.higherPmf"],
    },
    {
      titleKey: "marketResearch.title",
      descriptionKey: "marketResearch.description",
      icon: Search,
      href: "/solutions/market-research",
      metricsKeys: ["marketResearch.metrics.fasterProjects", "marketResearch.metrics.moreStudies", "marketResearch.metrics.costReduction"],
    },
    {
      titleKey: "innovation.title",
      descriptionKey: "innovation.description",
      icon: Lightbulb,
      href: "/solutions/innovation",
      metricsKeys: ["innovation.metrics.moreConcepts", "innovation.metrics.fasterValidation", "innovation.metrics.successRate"],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToHome")}
          </Link>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">{t("pageTitle")}</h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl text-pretty">
              {t("pageDescription")}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solutions.map((solution, i) => (
                <Card key={i} className="p-6 border-border/40 hover:border-primary/50 transition-all group">
                  <Link href={solution.href} className="block">
                    <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
                      <solution.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {t(solution.titleKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{t(solution.descriptionKey)}</p>
                    <div className="space-y-1 mb-4">
                      {solution.metricsKeys.map((metricKey, j) => (
                        <div key={j} className="text-xs text-muted-foreground">
                          • {t(metricKey)}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                      {tCommon("learnMore")} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("cta.title")}</h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t("cta.description")}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">{t("cta.getStarted")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">{t("cta.talkToSales")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
