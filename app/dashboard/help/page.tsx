"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  Book,
  ChevronRight,
  ExternalLink,
  FileText,
  Headphones,
  MessageCircle,
  Play,
  Search,
  Video,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { PageTracker } from "@/components/tracking/PageTracker"

const quickLinkIcons = {
  gettingStarted: Play,
  videoTutorials: Video,
  apiDocs: FileText,
  contactSupport: Headphones,
}

export default function HelpPage() {
  const t = useTranslations("settings.help")
  const [searchQuery, setSearchQuery] = useState("")

  const quickLinks = [
    {
      titleKey: "quickLinks.gettingStarted.title",
      descriptionKey: "quickLinks.gettingStarted.description",
      icon: quickLinkIcons.gettingStarted,
      href: "/docs/quickstart",
    },
    {
      titleKey: "quickLinks.videoTutorials.title",
      descriptionKey: "quickLinks.videoTutorials.description",
      icon: quickLinkIcons.videoTutorials,
      href: "/docs/tutorials",
    },
    {
      titleKey: "quickLinks.apiDocs.title",
      descriptionKey: "quickLinks.apiDocs.description",
      icon: quickLinkIcons.apiDocs,
      href: "/docs/api",
    },
    {
      titleKey: "quickLinks.contactSupport.title",
      descriptionKey: "quickLinks.contactSupport.description",
      icon: quickLinkIcons.contactSupport,
      href: "/contact",
    },
  ]

  const faqs = [
    {
      categoryKey: "faq.categories.gettingStarted",
      questions: [
        {
          questionKey: "faq.gettingStarted.createAgent.question",
          answerKey: "faq.gettingStarted.createAgent.answer",
        },
        {
          questionKey: "faq.gettingStarted.dataSources.question",
          answerKey: "faq.gettingStarted.dataSources.answer",
        },
        {
          questionKey: "faq.gettingStarted.inviteTeam.question",
          answerKey: "faq.gettingStarted.inviteTeam.answer",
        },
      ],
    },
    {
      categoryKey: "faq.categories.agentsWorkflows",
      questions: [
        {
          questionKey: "faq.agentsWorkflows.difference.question",
          answerKey: "faq.agentsWorkflows.difference.answer",
        },
        {
          questionKey: "faq.agentsWorkflows.customize.question",
          answerKey: "faq.agentsWorkflows.customize.answer",
        },
        {
          questionKey: "faq.agentsWorkflows.schedule.question",
          answerKey: "faq.agentsWorkflows.schedule.answer",
        },
      ],
    },
    {
      categoryKey: "faq.categories.dataPrivacy",
      questions: [
        {
          questionKey: "faq.dataPrivacy.protection.question",
          answerKey: "faq.dataPrivacy.protection.answer",
        },
        {
          questionKey: "faq.dataPrivacy.export.question",
          answerKey: "faq.dataPrivacy.export.answer",
        },
        {
          questionKey: "faq.dataPrivacy.updateFrequency.question",
          answerKey: "faq.dataPrivacy.updateFrequency.answer",
        },
      ],
    },
    {
      categoryKey: "faq.categories.billingPlans",
      questions: [
        {
          questionKey: "faq.billingPlans.queryCount.question",
          answerKey: "faq.billingPlans.queryCount.answer",
        },
        {
          questionKey: "faq.billingPlans.changePlan.question",
          answerKey: "faq.billingPlans.changePlan.answer",
        },
        {
          questionKey: "faq.billingPlans.annualDiscount.question",
          answerKey: "faq.billingPlans.annualDiscount.answer",
        },
      ],
    },
  ]

  const guides = [
    {
      titleKey: "guides.personas.title",
      descriptionKey: "guides.personas.description",
      durationKey: "guides.personas.duration",
      levelKey: "guides.levels.beginner",
      href: "/docs/guides/personas",
    },
    {
      titleKey: "guides.workflows.title",
      descriptionKey: "guides.workflows.description",
      durationKey: "guides.workflows.duration",
      levelKey: "guides.levels.intermediate",
      href: "/docs/guides/workflows",
    },
    {
      titleKey: "guides.prompts.title",
      descriptionKey: "guides.prompts.description",
      durationKey: "guides.prompts.duration",
      levelKey: "guides.levels.advanced",
      href: "/docs/guides/prompts",
    },
    {
      titleKey: "guides.apiIntegration.title",
      descriptionKey: "guides.apiIntegration.description",
      durationKey: "guides.apiIntegration.duration",
      levelKey: "guides.levels.advanced",
      href: "/docs/guides/api-integration",
    },
  ]

  return (
    <div className="space-y-8">
      <PageTracker pageName="Help Center" metadata={{ searchQuery: !!searchQuery }} />
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground mb-6">{t("subtitle")}</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.titleKey} href={link.href}>
            <Card className="h-full hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <link.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{t(link.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(link.descriptionKey)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="faq">{t("tabs.faq")}</TabsTrigger>
          <TabsTrigger value="guides">{t("tabs.guides")}</TabsTrigger>
          <TabsTrigger value="contact">{t("tabs.contact")}</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          {faqs.map((category) => (
            <Card key={category.categoryKey}>
              <CardHeader>
                <CardTitle>{t(category.categoryKey)}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">{t(faq.questionKey)}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{t(faq.answerKey)}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {guides.map((guide) => (
              <Link key={guide.titleKey} href={guide.href}>
                <Card className="h-full hover:border-primary transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <Book className="h-5 w-5 text-primary" />
                      <Badge variant="outline">{t(guide.levelKey)}</Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{t(guide.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t(guide.descriptionKey)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t(guide.durationKey)}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/docs">
                {t("viewAllDocs")}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t("contact.liveChat.title")}</CardTitle>
                <CardDescription>{t("contact.liveChat.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("contact.liveChat.availability")}
                </p>
                <Button className="w-full">{t("contact.liveChat.button")}</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Headphones className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t("contact.ticket.title")}</CardTitle>
                <CardDescription>{t("contact.ticket.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("contact.ticket.info")}
                </p>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/contact">{t("contact.ticket.button")}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="max-w-3xl mx-auto mt-6">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{t("contact.enterprise.title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("contact.enterprise.description")}
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/contact">{t("contact.enterprise.button")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
