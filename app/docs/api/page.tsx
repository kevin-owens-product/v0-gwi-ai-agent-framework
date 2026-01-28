"use client"

import Link from "next/link"
import { ArrowLeft, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "next-intl"

export default function APIReferencePage() {
  const t = useTranslations("docs")
  const tCommon = useTranslations("common")

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
            <Code2 className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">{t("api.reference.title")}</h1>
          </div>
          <p className="text-lg text-muted-foreground">{t("api.reference.subtitle")}</p>
        </div>

        <Tabs defaultValue="agents" className="space-y-8">
          <TabsList>
            <TabsTrigger value="agents">{t("api.reference.tabs.agents")}</TabsTrigger>
            <TabsTrigger value="workflows">{t("api.reference.tabs.workflows")}</TabsTrigger>
            <TabsTrigger value="reports">{t("api.reference.tabs.reports")}</TabsTrigger>
            <TabsTrigger value="auth">{t("api.reference.tabs.auth")}</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("api.reference.agents.listAgents.endpoint")}</h2>
              <p className="text-muted-foreground mb-4">{t("api.reference.agents.listAgents.description")}</p>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground">{`curl https://api.gwi.ai/v1/agents \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("api.reference.agents.runAgent.endpoint")}</h2>
              <p className="text-muted-foreground mb-4">{t("api.reference.agents.runAgent.description")}</p>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground">{`curl https://api.gwi.ai/v1/agents/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "audience-explorer",
    "prompt": "Analyze Gen Z sustainability values",
    "data_sources": ["gwi_core", "social_media"]
  }'`}</pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("api.reference.workflows.listWorkflows.endpoint")}</h2>
              <p className="text-muted-foreground mb-4">{t("api.reference.workflows.listWorkflows.description")}</p>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground">{`curl https://api.gwi.ai/v1/workflows \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("api.reference.reports.listReports.endpoint")}</h2>
              <p className="text-muted-foreground mb-4">{t("api.reference.reports.listReports.description")}</p>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground">{`curl https://api.gwi.ai/v1/reports \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="auth" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("api.reference.auth.title")}</h2>
              <p className="text-muted-foreground mb-4">
                {t("api.reference.auth.description")}
              </p>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground">{`Authorization: Bearer YOUR_API_KEY`}</pre>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {t("api.reference.auth.getKey")}{" "}
                <Link href="/dashboard/settings/api-keys" className="text-accent hover:underline">
                  {tCommon("settings")}
                </Link>{" "}
                {t("api.reference.auth.page")}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
