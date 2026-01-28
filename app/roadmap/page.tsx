"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Circle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function RoadmapPage() {
  const t = useTranslations("roadmap")

  const roadmapItems = [
    {
      quarter: t("quarters.q1_2025"),
      status: "completed",
      items: [
        { title: t("items.inboxAgents.title"), description: t("items.inboxAgents.description") },
        { title: t("items.commandPalette.title"), description: t("items.commandPalette.description") },
        { title: t("items.canvasMode.title"), description: t("items.canvasMode.description") },
      ],
    },
    {
      quarter: t("quarters.q2_2025"),
      status: "in-progress",
      items: [
        { title: t("items.mobileApps.title"), description: t("items.mobileApps.description") },
        { title: t("items.advancedWorkflows.title"), description: t("items.advancedWorkflows.description") },
        { title: t("items.realTimeCollaboration.title"), description: t("items.realTimeCollaboration.description") },
      ],
    },
    {
      quarter: t("quarters.q3_2025"),
      status: "planned",
      items: [
        { title: t("items.agentMarketplace.title"), description: t("items.agentMarketplace.description") },
        { title: t("items.apiV2.title"), description: t("items.apiV2.description") },
        { title: t("items.customIntegrations.title"), description: t("items.customIntegrations.description") },
      ],
    },
    {
      quarter: t("quarters.q4_2025"),
      status: "planned",
      items: [
        { title: t("items.enterpriseSso.title"), description: t("items.enterpriseSso.description") },
        { title: t("items.advancedAnalytics.title"), description: t("items.advancedAnalytics.description") },
        { title: t("items.whiteLabel.title"), description: t("items.whiteLabel.description") },
      ],
    },
  ]

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-green-500" />
    if (status === "in-progress") return <Clock className="h-5 w-5 text-amber-500" />
    return <Circle className="h-5 w-5 text-muted-foreground" />
  }

  const getStatusBadge = (status: string) => {
    if (status === "completed")
      return (
        <Badge variant="default" className="bg-green-500/10 text-green-500">
          {t("status.completed")}
        </Badge>
      )
    if (status === "in-progress")
      return (
        <Badge variant="default" className="bg-amber-500/10 text-amber-500">
          {t("status.inProgress")}
        </Badge>
      )
    return <Badge variant="secondary">{t("status.planned")}</Badge>
  }

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

          <div className="grid gap-8 md:grid-cols-2">
            {roadmapItems.map((quarter) => (
              <div key={quarter.quarter} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">{quarter.quarter}</h2>
                  {getStatusBadge(quarter.status)}
                </div>
                <div className="space-y-4">
                  {quarter.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {getStatusIcon(quarter.status)}
                      <div>
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
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
