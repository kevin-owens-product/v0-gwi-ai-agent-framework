"use client"

import Link from "next/link"
import { ArrowLeft, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function FirstAgentPage() {
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
            <Cpu className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">{t("firstAgent.title")}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t("firstAgent.subtitle")}
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("firstAgent.understanding.title")}</h2>
            <p className="text-muted-foreground">
              {t("firstAgent.understanding.description")}
            </p>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>{t("firstAgent.step1.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("firstAgent.step1.description")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("firstAgent.step1.questions.researchQuestions")}</li>
                <li>{t("firstAgent.step1.questions.outputType")}</li>
                <li>{t("firstAgent.step1.questions.userExpertise")}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("firstAgent.step2.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("firstAgent.step2.description")}
              </p>
              <div className="rounded bg-muted p-4 font-mono text-sm mb-4">
                <pre className="text-foreground">{`{
  "data_sources": [
    "gwi_core",
    "gwi_usa",
    "gwi_zeitgeist"
  ],
  "markets": ["US", "UK", "DE", "FR"],
  "time_range": "last_12_months"
}`}</pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("firstAgent.step3.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("firstAgent.step3.description")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>{t("firstAgent.step3.guidelines.role")}</li>
                <li>{t("firstAgent.step3.guidelines.structure")}</li>
                <li>{t("firstAgent.step3.guidelines.constraints")}</li>
              </ul>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{t("firstAgent.step3.examplePrompt")}</pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("firstAgent.step4.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t("firstAgent.step4.description")}
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("firstAgent.step4.tips.edgeCases")}</li>
                <li>{t("firstAgent.step4.tips.verifyAccuracy")}</li>
                <li>{t("firstAgent.step4.tips.checkFormatting")}</li>
                <li>{t("firstAgent.step4.tips.gatherFeedback")}</li>
              </ul>
            </CardContent>
          </Card>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("firstAgent.nextSteps.title")}</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/custom-agents/builder">
                <Button>{t("firstAgent.nextSteps.builderGuide")}</Button>
              </Link>
              <Link href="/docs/custom-agents/prompts">
                <Button variant="outline">{t("firstAgent.nextSteps.systemPrompts")}</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
