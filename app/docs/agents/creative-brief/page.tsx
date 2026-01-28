"use client"

import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function CreativeBriefPage() {
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
            <FileText className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">{t("agents.creativeBrief.title")}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t("agents.creativeBrief.subtitle")}
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.creativeBrief.overview.title")}</h2>
            <p className="text-muted-foreground">
              {t("agents.creativeBrief.overview.description")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">{t("agents.creativeBrief.capabilities.title")}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.creativeBrief.capabilities.briefGeneration.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.creativeBrief.capabilities.briefGeneration.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.creativeBrief.capabilities.messageTesting.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.creativeBrief.capabilities.messageTesting.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.creativeBrief.capabilities.channelRecommendations.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.creativeBrief.capabilities.channelRecommendations.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("agents.creativeBrief.capabilities.competitiveContext.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("agents.creativeBrief.capabilities.competitiveContext.description")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.creativeBrief.briefStructure.title")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("agents.creativeBrief.briefStructure.description")}
            </p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2">
              <li><strong>{t("agents.creativeBrief.briefStructure.sections.background.name")}</strong> - {t("agents.creativeBrief.briefStructure.sections.background.description")}</li>
              <li><strong>{t("agents.creativeBrief.briefStructure.sections.objective.name")}</strong> - {t("agents.creativeBrief.briefStructure.sections.objective.description")}</li>
              <li><strong>{t("agents.creativeBrief.briefStructure.sections.targetAudience.name")}</strong> - {t("agents.creativeBrief.briefStructure.sections.targetAudience.description")}</li>
              <li><strong>{t("agents.creativeBrief.briefStructure.sections.keyInsight.name")}</strong> - {t("agents.creativeBrief.briefStructure.sections.keyInsight.description")}</li>
              <li><strong>{t("agents.creativeBrief.briefStructure.sections.proposition.name")}</strong> - {t("agents.creativeBrief.briefStructure.sections.proposition.description")}</li>
              <li><strong>{t("agents.creativeBrief.briefStructure.sections.tone.name")}</strong> - {t("agents.creativeBrief.briefStructure.sections.tone.description")}</li>
              <li><strong>{t("agents.creativeBrief.briefStructure.sections.mandatories.name")}</strong> - {t("agents.creativeBrief.briefStructure.sections.mandatories.description")}</li>
              <li><strong>{t("agents.creativeBrief.briefStructure.sections.media.name")}</strong> - {t("agents.creativeBrief.briefStructure.sections.media.description")}</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.creativeBrief.examplePrompts.title")}</h2>
            <div className="space-y-4">
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{t("agents.creativeBrief.examplePrompts.example1")}</pre>
              </div>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{t("agents.creativeBrief.examplePrompts.example2")}</pre>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("agents.creativeBrief.tryIt.title")}</h2>
            <Link href="/dashboard/agents">
              <Button>{t("agents.creativeBrief.tryIt.button")}</Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
