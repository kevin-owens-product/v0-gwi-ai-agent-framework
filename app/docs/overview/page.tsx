"use client"

import Link from "next/link"
import { ArrowLeft, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function OverviewPage() {
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
            <Layers className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">{t("overview.title")}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t("overview.subtitle")}
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("overview.whatIs.title")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("overview.whatIs.description1")}
            </p>
            <p className="text-muted-foreground">
              {t("overview.whatIs.description2")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">{t("overview.coreComponents.title")}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("overview.coreComponents.prebuiltAgents.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("overview.coreComponents.prebuiltAgents.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("overview.coreComponents.customAgents.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("overview.coreComponents.customAgents.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("overview.coreComponents.workflows.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("overview.coreComponents.workflows.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("overview.coreComponents.apiIntegrations.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("overview.coreComponents.apiIntegrations.description")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("overview.dataSources.title")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("overview.dataSources.description")}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{t("overview.dataSources.items.gwiCore")}</li>
              <li>{t("overview.dataSources.items.gwiUsa")}</li>
              <li>{t("overview.dataSources.items.gwiZeitgeist")}</li>
              <li>{t("overview.dataSources.items.socialMedia")}</li>
              <li>{t("overview.dataSources.items.customData")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("overview.nextSteps.title")}</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/quickstart">
                <Button>{t("overview.nextSteps.quickStart")}</Button>
              </Link>
              <Link href="/docs/first-agent">
                <Button variant="outline">{t("overview.nextSteps.createFirstAgent")}</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
