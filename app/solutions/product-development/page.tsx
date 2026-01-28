"use client"

import Link from "next/link"
import { Search, ListOrdered, UserCircle, CheckCircle, DollarSign, Rocket, ArrowRight, CheckCircle2, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { productAgents } from "@/lib/solution-agents"
import { useTranslations } from "next-intl"

export default function ProductDevelopmentPage() {
  const t = useTranslations("solutions.productDevelopment")

  const workflows = [
    {
      nameKey: "workflows.discoverySprint.name",
      timeKey: "workflows.discoverySprint.time",
      descriptionKey: "workflows.discoverySprint.description",
    },
    {
      nameKey: "workflows.userResearch.name",
      timeKey: "workflows.userResearch.time",
      descriptionKey: "workflows.userResearch.description",
    },
    {
      nameKey: "workflows.pricingStrategy.name",
      timeKey: "workflows.pricingStrategy.time",
      descriptionKey: "workflows.pricingStrategy.description",
    },
    {
      nameKey: "workflows.launchPlanning.name",
      timeKey: "workflows.launchPlanning.time",
      descriptionKey: "workflows.launchPlanning.description",
    },
  ]

  const challenges = [
    "challenges.unwantedFeatures",
    "challenges.painPoints",
    "challenges.slowValidation",
    "challenges.pricingWithoutData",
    "challenges.launchFailures",
    "challenges.opinionBasedPriority",
  ]

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="pt-24">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <Badge variant="secondary" className="mb-4">
              {t("badge")}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              {t("hero.titleStart")} <span className="text-primary">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl text-pretty">
              {t("hero.description")}
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">{t("stats.faster.value")}</h3>
                <p className="text-sm text-muted-foreground">{t("stats.faster.description")}</p>
              </Card>
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">{t("stats.higher.value")}</h3>
                <p className="text-sm text-muted-foreground">{t("stats.higher.description")}</p>
              </Card>
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">{t("stats.lower.value")}</h3>
                <p className="text-sm text-muted-foreground">{t("stats.lower.description")}</p>
              </Card>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">{t("cta.startBuilding")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">{t("cta.requestDemo")}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-8">{t("challengesTitle")}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {challenges.map((challengeKey, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{t(challengeKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-4">{t("agentsTitle")}</h2>
            <p className="text-muted-foreground mb-12 max-w-3xl">
              {t("agentsDescription")}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {productAgents.map((agent) => {
                const iconMap: Record<string, React.ReactNode> = {
                  Search: <Search className="h-6 w-6 text-primary" />,
                  ListOrdered: <ListOrdered className="h-6 w-6 text-primary" />,
                  UserCircle: <UserCircle className="h-6 w-6 text-primary" />,
                  CheckCircle: <CheckCircle className="h-6 w-6 text-primary" />,
                  DollarSign: <DollarSign className="h-6 w-6 text-primary" />,
                  Rocket: <Rocket className="h-6 w-6 text-primary" />,
                }
                return (
                  <Link key={agent.id} href={`/dashboard/agents/${agent.id}`}>
                    <Card className="p-6 border-border/40 hover:border-primary/50 transition-colors h-full cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          {iconMap[agent.icon] || <Brain className="h-6 w-6 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {agent.capabilities.slice(0, 4).map((cap, j) => (
                              <Badge key={j} variant="secondary" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-4">
                            <span className="text-sm text-primary flex items-center gap-1">
                              {t("openAgent")} <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-4">{t("workflowsTitle")}</h2>
            <p className="text-muted-foreground mb-12 max-w-3xl">
              {t("workflowsDescription")}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {workflows.map((workflow, i) => (
                <Card key={i} className="p-6 border-border/40">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold">{t(workflow.nameKey)}</h3>
                    <Badge variant="outline">{t(workflow.timeKey)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t(workflow.descriptionKey)}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("finalCta.title")}</h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t("finalCta.description")}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  {t("finalCta.getStarted")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">{t("finalCta.talkToSales")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
