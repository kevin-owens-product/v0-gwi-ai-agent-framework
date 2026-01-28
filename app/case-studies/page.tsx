"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function CaseStudiesPage() {
  const t = useTranslations("landing.caseStudies")

  const caseStudies = [
    {
      company: "Nike",
      industryKey: "industries.retailEcommerce",
      titleKey: "studies.nike.title",
      challengeKey: "studies.nike.challenge",
      solutionKey: "studies.nike.solution",
      results: [
        { metric: "340%", labelKey: "results.campaignRoi" },
        { metric: "2.5x", labelKey: "results.engagementRate" },
        { metric: "85%", labelKey: "results.timeSaved" },
      ],
      icon: TrendingUp,
    },
    {
      company: "Unilever",
      industryKey: "industries.consumerGoods",
      titleKey: "studies.unilever.title",
      challengeKey: "studies.unilever.challenge",
      solutionKey: "studies.unilever.solution",
      results: [
        { metric: "5", labelKey: "results.productsLaunched" },
        { metric: "6", labelKey: "results.monthsTimeline" },
        { metric: "92%", labelKey: "results.accuracyRate" },
      ],
      icon: Zap,
    },
    {
      company: "Spotify",
      industryKey: "industries.mediaEntertainment",
      titleKey: "studies.spotify.title",
      challengeKey: "studies.spotify.challenge",
      solutionKey: "studies.spotify.solution",
      results: [
        { metric: "12", labelKey: "results.newSegments" },
        { metric: "45%", labelKey: "results.userGrowth" },
        { metric: "3.2M", labelKey: "results.newSubscribers" },
      ],
      icon: Users,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome")}
            </Button>
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t("title")}</h1>
            <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="space-y-12">
            {caseStudies.map((study, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                      <study.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{study.company}</h3>
                      <Badge variant="secondary">{t(study.industryKey)}</Badge>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">{t(study.titleKey)}</h2>
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">{t("labels.challenge")}</h4>
                      <p className="text-muted-foreground">{t(study.challengeKey)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">{t("labels.solution")}</h4>
                      <p className="text-muted-foreground">{t(study.solutionKey)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border">
                    {study.results.map((result, ridx) => (
                      <div key={ridx} className="text-center">
                        <div className="text-3xl font-bold text-accent mb-1">{result.metric}</div>
                        <div className="text-sm text-muted-foreground">{t(result.labelKey)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
