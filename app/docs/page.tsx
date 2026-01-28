"use client"

import { Header } from "@/components/landing/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, Code, Cpu, FileText, Lightbulb, Play, Search, Zap, ChevronRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export default function DocsPage() {
  const t = useTranslations("docs")

  const categories = [
    {
      title: t("categories.gettingStarted.title"),
      icon: Play,
      description: t("categories.gettingStarted.description"),
      links: [
        { title: t("categories.gettingStarted.links.quickStart"), href: "/docs/quickstart" },
        { title: t("categories.gettingStarted.links.platformOverview"), href: "/docs/overview" },
        { title: t("categories.gettingStarted.links.firstAgent"), href: "/docs/first-agent" },
        { title: t("categories.gettingStarted.links.understandingWorkflows"), href: "/docs/workflows-intro" },
      ],
    },
    {
      title: t("categories.prebuiltAgents.title"),
      icon: Cpu,
      description: t("categories.prebuiltAgents.description"),
      links: [
        { title: t("categories.prebuiltAgents.links.audienceStrategist"), href: "/docs/agents/audience-strategist" },
        { title: t("categories.prebuiltAgents.links.creativeBrief"), href: "/docs/agents/creative-brief" },
        { title: t("categories.prebuiltAgents.links.competitiveTracker"), href: "/docs/agents/competitive-tracker" },
        { title: t("categories.prebuiltAgents.links.trendSpotter"), href: "/docs/agents/trend-spotter" },
      ],
    },
    {
      title: t("categories.customAgents.title"),
      icon: Lightbulb,
      description: t("categories.customAgents.description"),
      links: [
        { title: t("categories.customAgents.links.builderGuide"), href: "/docs/custom-agents/builder" },
        { title: t("categories.customAgents.links.systemPrompts"), href: "/docs/custom-agents/prompts" },
        { title: t("categories.customAgents.links.dataSources"), href: "/docs/custom-agents/data-sources" },
        { title: t("categories.customAgents.links.testing"), href: "/docs/custom-agents/testing" },
      ],
    },
    {
      title: t("categories.workflows.title"),
      icon: Zap,
      description: t("categories.workflows.description"),
      links: [
        { title: t("categories.workflows.links.builder"), href: "/docs/workflows/builder" },
        { title: t("categories.workflows.links.triggers"), href: "/docs/workflows/triggers" },
        { title: t("categories.workflows.links.orchestration"), href: "/docs/workflows/orchestration" },
        { title: t("categories.workflows.links.outputs"), href: "/docs/workflows/outputs" },
      ],
    },
    {
      title: t("categories.apiReference.title"),
      icon: Code,
      description: t("categories.apiReference.description"),
      links: [
        { title: t("categories.apiReference.links.authentication"), href: "/docs/api/auth" },
        { title: t("categories.apiReference.links.agentsApi"), href: "/docs/api/agents" },
        { title: t("categories.apiReference.links.workflowsApi"), href: "/docs/api/workflows" },
        { title: t("categories.apiReference.links.webhooks"), href: "/docs/api/webhooks" },
      ],
    },
    {
      title: t("categories.bestPractices.title"),
      icon: Book,
      description: t("categories.bestPractices.description"),
      links: [
        { title: t("categories.bestPractices.links.prompts"), href: "/docs/best-practices/prompts" },
        { title: t("categories.bestPractices.links.verification"), href: "/docs/best-practices/verification" },
        { title: t("categories.bestPractices.links.collaboration"), href: "/docs/best-practices/collaboration" },
        { title: t("categories.bestPractices.links.security"), href: "/docs/best-practices/security" },
      ],
    },
  ]

  const popularArticles = [
    { title: t("popularArticles.quickStart.title"), description: t("popularArticles.quickStart.description"), href: "/docs/quickstart" },
    {
      title: t("popularArticles.buildingAgents.title"),
      description: t("popularArticles.buildingAgents.description"),
      href: "/docs/custom-agents/builder",
    },
    { title: t("popularArticles.apiAuth.title"), description: t("popularArticles.apiAuth.description"), href: "/docs/api/auth" },
    { title: t("popularArticles.workflowAutomation.title"), description: t("popularArticles.workflowAutomation.description"), href: "/docs/workflows/builder" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">{t("main.title")}</h1>
              <p className="text-xl text-muted-foreground mb-8">
                {t("main.subtitle")}
              </p>
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder={t("main.searchPlaceholder")} className="pl-10 h-12 text-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold mb-6">{t("main.popularArticles")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularArticles.map((article) => (
                <Link key={article.title} href={article.href}>
                  <Card className="h-full hover:border-primary transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{article.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {categories.map((category) => (
                <Card key={category.title}>
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.links.map((link) => (
                        <li key={link.title}>
                          <Link
                            href={link.href}
                            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronRight className="h-4 w-4 mr-1" />
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      {t("help.apiReference.title")}
                    </CardTitle>
                    <CardDescription>{t("help.apiReference.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/docs/api">
                        {t("help.apiReference.button")}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      {t("help.needHelp.title")}
                    </CardTitle>
                    <CardDescription>{t("help.needHelp.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/contact">
                        {t("help.needHelp.button")}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
