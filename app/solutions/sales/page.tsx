"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, TrendingUp, Users, Target, BarChart3, Brain, CheckCircle2, MessageSquare, BookOpen } from "lucide-react"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { salesAgents } from "@/lib/solution-agents"
import { useTranslations } from "next-intl"

export default function SalesPage() {
  const t = useTranslations("solutions.sales")

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("backToHome")}
            </Link>
          </div>

          <div className="mb-16 text-center">
            <Badge className="mb-4" variant="outline">
              {t("badge")}
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
              {t("hero.titleStart")} <span className="text-accent">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto mb-8">
              {t("hero.description")}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg">
                  {t("cta.startTrial")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  {t("cta.bookDemo")}
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-8 mb-16">
            <Card className="p-8 border-accent/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">{t("challengesTitle")}</h2>
                  <p className="text-muted-foreground">{t("challengesSubtitle")}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">{t("challenges.genericOutreach.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("challenges.genericOutreach.description")}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t("challenges.limitedInsights.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("challenges.limitedInsights.description")}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t("challenges.manualResearch.title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("challenges.manualResearch.description")}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("agentsTitle")}</h2>
              <p className="text-muted-foreground">{t("agentsDescription")}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {salesAgents.map((agent) => {
                const iconMap: Record<string, React.ReactNode> = {
                  Users: <Users className="h-5 w-5 text-blue-500" />,
                  MessageSquare: <MessageSquare className="h-5 w-5 text-purple-500" />,
                  TrendingUp: <TrendingUp className="h-5 w-5 text-green-500" />,
                  Target: <Target className="h-5 w-5 text-orange-500" />,
                  BarChart3: <BarChart3 className="h-5 w-5 text-pink-500" />,
                  BookOpen: <BookOpen className="h-5 w-5 text-cyan-500" />,
                }
                const colorMap: Record<string, string> = {
                  Users: "bg-blue-500/10",
                  MessageSquare: "bg-purple-500/10",
                  TrendingUp: "bg-green-500/10",
                  Target: "bg-orange-500/10",
                  BarChart3: "bg-pink-500/10",
                  BookOpen: "bg-cyan-500/10",
                }
                return (
                  <Link key={agent.id} href={`/dashboard/agents/${agent.id}`}>
                    <Card className="p-6 hover:border-accent/50 transition-colors h-full cursor-pointer">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${colorMap[agent.icon] || 'bg-blue-500/10'}`}>
                          {iconMap[agent.icon] || <Brain className="h-5 w-5 text-blue-500" />}
                        </div>
                        <h3 className="font-semibold">{agent.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {agent.description}
                      </p>
                      <ul className="space-y-2 text-sm">
                        {agent.capabilities.slice(0, 3).map((cap, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{cap}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-4 border-t">
                        <span className="text-sm text-accent flex items-center gap-1">
                          {t("openAgent")} <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("workflowsTitle")}</h2>
              <p className="text-muted-foreground">{t("workflowsDescription")}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-3">{t("workflows.accountResearch.title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("workflows.accountResearch.description")}
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">{t("workflows.accountResearch.badge1")}</Badge>
                  <Badge variant="secondary">{t("workflows.accountResearch.badge2")}</Badge>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">{t("workflows.outreachPersonalization.title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("workflows.outreachPersonalization.description")}
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">{t("workflows.outreachPersonalization.badge1")}</Badge>
                  <Badge variant="secondary">{t("workflows.outreachPersonalization.badge2")}</Badge>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">{t("workflows.dealReview.title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("workflows.dealReview.description")}
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">{t("workflows.dealReview.badge1")}</Badge>
                  <Badge variant="secondary">{t("workflows.dealReview.badge2")}</Badge>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">{t("workflows.territoryPlanning.title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("workflows.territoryPlanning.description")}
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">{t("workflows.territoryPlanning.badge1")}</Badge>
                  <Badge variant="secondary">{t("workflows.territoryPlanning.badge2")}</Badge>
                </div>
              </Card>
            </div>
          </div>

          <div className="bg-accent/5 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("finalCta.title")}</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("finalCta.description")}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg">
                  {t("finalCta.startTrial")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  {t("finalCta.talkToSales")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
