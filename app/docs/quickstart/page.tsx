"use client"

import Link from "next/link"
import { ArrowLeft, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function QuickstartPage() {
  const t = useTranslations("docs")

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/docs">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.backToDocs")}
          </Button>
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Play className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">{t("quickstart.title")}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t("quickstart.subtitle")}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("quickstart.step1.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("quickstart.step1.description")}
              </p>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">{t("quickstart.step1.button")}</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("quickstart.step2.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("quickstart.step2.description")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li><strong>{t("quickstart.step2.agents.audienceStrategist.name")}</strong> - {t("quickstart.step2.agents.audienceStrategist.description")}</li>
                <li><strong>{t("quickstart.step2.agents.creativeBrief.name")}</strong> - {t("quickstart.step2.agents.creativeBrief.description")}</li>
                <li><strong>{t("quickstart.step2.agents.competitiveTracker.name")}</strong> - {t("quickstart.step2.agents.competitiveTracker.description")}</li>
                <li><strong>{t("quickstart.step2.agents.trendSpotter.name")}</strong> - {t("quickstart.step2.agents.trendSpotter.description")}</li>
              </ul>
              <Link href="/dashboard/agents">
                <Button variant="outline" size="sm">{t("quickstart.step2.button")}</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("quickstart.step3.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("quickstart.step3.description")}
              </p>
              <div className="rounded bg-muted p-4 font-mono text-sm mb-4">
                <pre className="text-foreground whitespace-pre-wrap">{t("quickstart.step3.examplePrompt")}</pre>
              </div>
              <p className="text-muted-foreground">
                {t("quickstart.step3.result")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("quickstart.step4.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("quickstart.step4.description")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("quickstart.step4.formats.pdf")}</li>
                <li>{t("quickstart.step4.formats.pptx")}</li>
                <li>{t("quickstart.step4.formats.data")}</li>
                <li>{t("quickstart.step4.formats.share")}</li>
              </ul>
            </CardContent>
          </Card>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("quickstart.whatsNext.title")}</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/first-agent">
                <Button>{t("quickstart.whatsNext.createCustomAgent")}</Button>
              </Link>
              <Link href="/docs/workflows-intro">
                <Button variant="outline">{t("quickstart.whatsNext.learnWorkflows")}</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
