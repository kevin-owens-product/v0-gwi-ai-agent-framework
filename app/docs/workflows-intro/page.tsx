"use client"

import Link from "next/link"
import { ArrowLeft, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function WorkflowsIntroPage() {
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
            <Zap className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">{t("workflowsIntro.title")}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t("workflowsIntro.subtitle")}
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("workflowsIntro.whatAre.title")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("workflowsIntro.whatAre.description1")}
            </p>
            <p className="text-muted-foreground">
              {t("workflowsIntro.whatAre.description2")}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">{t("workflowsIntro.components.title")}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("workflowsIntro.components.triggers.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("workflowsIntro.components.triggers.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("workflowsIntro.components.agentSteps.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("workflowsIntro.components.agentSteps.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("workflowsIntro.components.transformations.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("workflowsIntro.components.transformations.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("workflowsIntro.components.outputs.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("workflowsIntro.components.outputs.description")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("workflowsIntro.example.title")}</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">1</div>
                    <div>
                      <p className="font-medium text-foreground">{t("workflowsIntro.example.step1.name")}</p>
                      <p className="text-sm text-muted-foreground">{t("workflowsIntro.example.step1.description")}</p>
                    </div>
                  </div>
                  <div className="ml-4 border-l-2 border-muted h-8" />
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">2</div>
                    <div>
                      <p className="font-medium text-foreground">{t("workflowsIntro.example.step2.name")}</p>
                      <p className="text-sm text-muted-foreground">{t("workflowsIntro.example.step2.description")}</p>
                    </div>
                  </div>
                  <div className="ml-4 border-l-2 border-muted h-8" />
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">3</div>
                    <div>
                      <p className="font-medium text-foreground">{t("workflowsIntro.example.step3.name")}</p>
                      <p className="text-sm text-muted-foreground">{t("workflowsIntro.example.step3.description")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("workflowsIntro.nextSteps.title")}</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/workflows/builder">
                <Button>{t("workflowsIntro.nextSteps.workflowBuilder")}</Button>
              </Link>
              <Link href="/dashboard/workflows">
                <Button variant="outline">{t("workflowsIntro.nextSteps.createWorkflow")}</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
