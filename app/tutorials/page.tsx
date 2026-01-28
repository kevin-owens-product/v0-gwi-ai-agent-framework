"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowLeft, BookOpen, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function TutorialsPage() {
  const t = useTranslations("landing.tutorials")

  const tutorials = [
    {
      titleKey: "items.gettingStarted.title",
      descriptionKey: "items.gettingStarted.description",
      duration: "15 min",
      levelKey: "levels.beginner",
      categoryKey: "categories.fundamentals",
    },
    {
      titleKey: "items.buildingAgents.title",
      descriptionKey: "items.buildingAgents.description",
      duration: "30 min",
      levelKey: "levels.intermediate",
      categoryKey: "categories.agents",
    },
    {
      titleKey: "items.automatingWorkflows.title",
      descriptionKey: "items.automatingWorkflows.description",
      duration: "25 min",
      levelKey: "levels.intermediate",
      categoryKey: "categories.workflows",
    },
    {
      titleKey: "items.advancedReportBuilder.title",
      descriptionKey: "items.advancedReportBuilder.description",
      duration: "40 min",
      levelKey: "levels.advanced",
      categoryKey: "categories.reports",
    },
    {
      titleKey: "items.usingInboxAgents.title",
      descriptionKey: "items.usingInboxAgents.description",
      duration: "20 min",
      levelKey: "levels.intermediate",
      categoryKey: "categories.automation",
    },
    {
      titleKey: "items.apiIntegration.title",
      descriptionKey: "items.apiIntegration.description",
      duration: "35 min",
      levelKey: "levels.advanced",
      categoryKey: "categories.api",
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
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-8 w-8 text-accent" />
              <h1 className="text-4xl font-bold text-foreground">{t("title")}</h1>
            </div>
            <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {tutorials.map((tutorial, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-card p-6 hover:border-accent transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="secondary">{t(tutorial.categoryKey)}</Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {tutorial.duration}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t(tutorial.titleKey)}</h3>
                <p className="text-muted-foreground mb-4">{t(tutorial.descriptionKey)}</p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t(tutorial.levelKey)}</span>
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
