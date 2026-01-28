"use client"

import Link from "next/link"
import { ArrowLeft, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function CompetitiveTrackerPage() {
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
            <Target className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">{t("agents.competitiveTracker.title")}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t("agents.competitiveTracker.subtitle")}
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.competitiveTracker.overview.title")}</h2>
            <p className="text-muted-foreground">
              {t("agents.competitiveTracker.overview.description")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">{t("agents.competitiveTracker.capabilities.title")}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.competitiveTracker.capabilities.brandHealth.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.competitiveTracker.capabilities.brandHealth.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.competitiveTracker.capabilities.perception.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.competitiveTracker.capabilities.perception.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.competitiveTracker.capabilities.shareOfVoice.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.competitiveTracker.capabilities.shareOfVoice.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.competitiveTracker.capabilities.opportunity.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.competitiveTracker.capabilities.opportunity.description")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.competitiveTracker.metrics.title")}</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>{t("agents.competitiveTracker.metrics.awareness.name")}</strong> - {t("agents.competitiveTracker.metrics.awareness.description")}</li>
              <li><strong>{t("agents.competitiveTracker.metrics.consideration.name")}</strong> - {t("agents.competitiveTracker.metrics.consideration.description")}</li>
              <li><strong>{t("agents.competitiveTracker.metrics.preference.name")}</strong> - {t("agents.competitiveTracker.metrics.preference.description")}</li>
              <li><strong>{t("agents.competitiveTracker.metrics.usage.name")}</strong> - {t("agents.competitiveTracker.metrics.usage.description")}</li>
              <li><strong>{t("agents.competitiveTracker.metrics.nps.name")}</strong> - {t("agents.competitiveTracker.metrics.nps.description")}</li>
              <li><strong>{t("agents.competitiveTracker.metrics.attributes.name")}</strong> - {t("agents.competitiveTracker.metrics.attributes.description")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.competitiveTracker.examplePrompts.title")}</h2>
            <div className="space-y-4">
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{t("agents.competitiveTracker.examplePrompts.example1")}</pre>
              </div>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{t("agents.competitiveTracker.examplePrompts.example2")}</pre>
              </div>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{t("agents.competitiveTracker.examplePrompts.example3")}</pre>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.competitiveTracker.tryIt.title")}</h2>
            <Link href="/dashboard/agents">
              <Button>{t("agents.competitiveTracker.tryIt.button")}</Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
