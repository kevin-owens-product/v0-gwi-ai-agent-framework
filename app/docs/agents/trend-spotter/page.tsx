"use client"

import Link from "next/link"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function TrendSpotterPage() {
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
            <TrendingUp className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">{t("agents.trendSpotter.title")}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t("agents.trendSpotter.subtitle")}
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.trendSpotter.overview.title")}</h2>
            <p className="text-muted-foreground">
              {t("agents.trendSpotter.overview.description")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">{t("agents.trendSpotter.capabilities.title")}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.trendSpotter.capabilities.detection.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.trendSpotter.capabilities.detection.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.trendSpotter.capabilities.validation.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.trendSpotter.capabilities.validation.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.trendSpotter.capabilities.audienceMapping.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.trendSpotter.capabilities.audienceMapping.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.trendSpotter.capabilities.forecasting.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.trendSpotter.capabilities.forecasting.description")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.trendSpotter.categories.title")}</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>{t("agents.trendSpotter.categories.consumerValues.name")}</strong> - {t("agents.trendSpotter.categories.consumerValues.description")}</li>
              <li><strong>{t("agents.trendSpotter.categories.lifestyle.name")}</strong> - {t("agents.trendSpotter.categories.lifestyle.description")}</li>
              <li><strong>{t("agents.trendSpotter.categories.technology.name")}</strong> - {t("agents.trendSpotter.categories.technology.description")}</li>
              <li><strong>{t("agents.trendSpotter.categories.media.name")}</strong> - {t("agents.trendSpotter.categories.media.description")}</li>
              <li><strong>{t("agents.trendSpotter.categories.purchaseBehavior.name")}</strong> - {t("agents.trendSpotter.categories.purchaseBehavior.description")}</li>
              <li><strong>{t("agents.trendSpotter.categories.social.name")}</strong> - {t("agents.trendSpotter.categories.social.description")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.trendSpotter.examplePrompts.title")}</h2>
            <div className="space-y-4">
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{t("agents.trendSpotter.examplePrompts.example1")}</pre>
              </div>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{t("agents.trendSpotter.examplePrompts.example2")}</pre>
              </div>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{t("agents.trendSpotter.examplePrompts.example3")}</pre>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.trendSpotter.tryIt.title")}</h2>
            <Link href="/dashboard/agents">
              <Button>{t("agents.trendSpotter.tryIt.button")}</Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
