"use client"

import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function AudienceStrategistPage() {
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
            <Users className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">{t("agents.audienceStrategist.title")}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t("agents.audienceStrategist.subtitle")}
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.audienceStrategist.overview.title")}</h2>
            <p className="text-muted-foreground">
              {t("agents.audienceStrategist.overview.description")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">{t("agents.audienceStrategist.capabilities.title")}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.audienceStrategist.capabilities.profiling.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.audienceStrategist.capabilities.profiling.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.audienceStrategist.capabilities.segmentDiscovery.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.audienceStrategist.capabilities.segmentDiscovery.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.audienceStrategist.capabilities.personaGeneration.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.audienceStrategist.capabilities.personaGeneration.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.audienceStrategist.capabilities.comparison.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.audienceStrategist.capabilities.comparison.description")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.audienceStrategist.examplePrompts.title")}</h2>
            <div className="space-y-4">
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{t("agents.audienceStrategist.examplePrompts.example1")}</pre>
              </div>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{t("agents.audienceStrategist.examplePrompts.example2")}</pre>
              </div>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{t("agents.audienceStrategist.examplePrompts.example3")}</pre>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.audienceStrategist.dataSources.title")}</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{t("agents.audienceStrategist.dataSources.gwiCore")}</li>
              <li>{t("agents.audienceStrategist.dataSources.gwiUsa")}</li>
              <li>{t("agents.audienceStrategist.dataSources.gwiZeitgeist")}</li>
              <li>{t("agents.audienceStrategist.dataSources.mediaConsumption")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.audienceStrategist.tryIt.title")}</h2>
            <Link href="/dashboard/agents">
              <Button>{t("agents.audienceStrategist.tryIt.button")}</Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
