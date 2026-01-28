"use client"

import { useTranslations } from "next-intl"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, HelpCircle, Minus } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  const t = useTranslations("pricing")

  const plans = [
    {
      name: t("plans.starter.name"),
      description: t("plans.starter.description"),
      price: 299,
      period: t("plans.starter.period"),
      features: [
        { name: t("plans.starter.features.teamMembers"), included: true },
        { name: t("plans.starter.features.prebuiltAgents"), included: true },
        { name: t("plans.starter.features.queriesPerMonth"), included: true },
        { name: t("plans.starter.features.basicMemory"), included: true },
        { name: t("plans.starter.features.emailSupport"), included: true },
        { name: t("plans.starter.features.customAgents"), included: false },
        { name: t("plans.starter.features.workflowAutomation"), included: false },
        { name: t("plans.starter.features.apiAccess"), included: false },
        { name: t("plans.starter.features.ssoSaml"), included: false },
      ],
      cta: t("plans.starter.cta"),
      popular: false,
    },
    {
      name: t("plans.professional.name"),
      description: t("plans.professional.description"),
      price: 799,
      period: t("plans.professional.period"),
      features: [
        { name: t("plans.professional.features.teamMembers"), included: true },
        { name: t("plans.professional.features.prebuiltAgents"), included: true },
        { name: t("plans.professional.features.queriesPerMonth"), included: true },
        { name: t("plans.professional.features.extendedMemory"), included: true },
        { name: t("plans.professional.features.prioritySupport"), included: true },
        { name: t("plans.professional.features.customAgents"), included: true },
        { name: t("plans.professional.features.scheduledWorkflows"), included: true },
        { name: t("plans.professional.features.multiFormatReports"), included: true },
        { name: t("plans.professional.features.integrations"), included: true },
        { name: t("plans.professional.features.advancedAnalytics"), included: true },
        { name: t("plans.professional.features.apiAccess"), included: true },
        { name: t("plans.professional.features.ssoSaml"), included: false },
      ],
      cta: t("plans.professional.cta"),
      popular: true,
    },
    {
      name: t("plans.enterprise.name"),
      description: t("plans.enterprise.description"),
      price: null,
      period: t("plans.enterprise.period"),
      features: [
        { name: t("plans.enterprise.features.teamMembers"), included: true },
        { name: t("plans.enterprise.features.prebuiltAgents"), included: true },
        { name: t("plans.enterprise.features.unlimitedQueries"), included: true },
        { name: t("plans.enterprise.features.unlimitedMemory"), included: true },
        { name: t("plans.enterprise.features.dedicatedSupport"), included: true },
        { name: t("plans.enterprise.features.unlimitedCustomAgents"), included: true },
        { name: t("plans.enterprise.features.advancedWorkflows"), included: true },
        { name: t("plans.enterprise.features.allReportFormats"), included: true },
        { name: t("plans.enterprise.features.unlimitedIntegrations"), included: true },
        { name: t("plans.enterprise.features.ssoSaml"), included: true },
        { name: t("plans.enterprise.features.sla"), included: true },
        { name: t("plans.enterprise.features.fullApiAccess"), included: true },
        { name: t("plans.enterprise.features.dedicatedInfrastructure"), included: true },
      ],
      cta: t("plans.enterprise.cta"),
      popular: false,
    },
  ]

  const faqs = [
    {
      question: t("faq.queryCount.question"),
      answer: t("faq.queryCount.answer"),
    },
    {
      question: t("faq.changePlans.question"),
      answer: t("faq.changePlans.answer"),
    },
    {
      question: t("faq.exceedLimit.question"),
      answer: t("faq.exceedLimit.answer"),
    },
    {
      question: t("faq.freeTrial.question"),
      answer: t("faq.freeTrial.answer"),
    },
    {
      question: t("faq.integrations.question"),
      answer: t("faq.integrations.answer"),
    },
    {
      question: t("faq.dataSecurity.question"),
      answer: t("faq.dataSecurity.answer"),
    },
  ]

  const comparisonFeatures = [
    { name: t("comparison.teamMembers"), starter: "5", professional: "25", enterprise: t("comparison.unlimited") },
    { name: t("comparison.prebuiltAgents"), starter: "3", professional: t("comparison.all"), enterprise: t("comparison.all") },
    { name: t("comparison.customAgents"), starter: "-", professional: "5", enterprise: t("comparison.unlimited") },
    { name: t("comparison.monthlyQueries"), starter: "1,000", professional: "10,000", enterprise: t("comparison.unlimited") },
    { name: t("comparison.realLlmExecution"), starter: "✓", professional: "✓", enterprise: "✓" },
    { name: t("comparison.memoryRetention"), starter: t("comparison.days30"), professional: t("comparison.days90"), enterprise: t("comparison.unlimited") },
    { name: t("comparison.scheduledWorkflows"), starter: "-", professional: "✓", enterprise: "✓" },
    { name: t("comparison.reportFormats"), starter: "CSV, HTML", professional: t("comparison.allFormats"), enterprise: t("comparison.allFormats") },
    { name: t("comparison.workflowAutomation"), starter: "-", professional: t("comparison.basic"), enterprise: t("comparison.advanced") },
    { name: t("comparison.apiAccess"), starter: "-", professional: t("comparison.yes"), enterprise: t("comparison.full") },
    { name: t("comparison.integrationsHub"), starter: "5", professional: "50", enterprise: t("comparison.unlimited") },
    { name: t("comparison.emailNotifications"), starter: "✓", professional: "✓", enterprise: "✓" },
    { name: t("comparison.circuitBreakers"), starter: "✓", professional: "✓", enterprise: "✓" },
    { name: t("comparison.advancedAnalytics"), starter: "-", professional: "✓", enterprise: "✓" },
    { name: t("comparison.support"), starter: t("comparison.email"), professional: t("comparison.priority"), enterprise: t("comparison.dedicated") },
    { name: t("comparison.ssoSaml"), starter: "-", professional: "-", enterprise: "✓" },
    { name: t("comparison.auditLogs"), starter: "-", professional: t("comparison.days90"), enterprise: t("comparison.unlimited") },
    { name: t("comparison.sla"), starter: "99.9%", professional: "99.9%", enterprise: "99.99%" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("hero.title")}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative ${plan.popular ? "border-primary shadow-lg shadow-primary/10" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                        {t("mostPopular")}
                      </span>
                    </div>
                  )}
                  <CardHeader className="pt-8">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      {plan.price ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground">{plan.period}</span>
                        </div>
                      ) : (
                        <div className="text-4xl font-bold">{t("custom")}</div>
                      )}
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-center gap-3">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-primary flex-shrink-0" />
                          ) : (
                            <Minus className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                          )}
                          <span className={feature.included ? "" : "text-muted-foreground/50"}>{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                      <Link href={plan.price ? "/signup" : "/contact"}>{plan.cta}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("comparePlans")}</h2>
            <div className="max-w-5xl mx-auto overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-medium">{t("tableHeaders.feature")}</th>
                    <th className="text-center py-4 px-4 font-medium">{t("plans.starter.name")}</th>
                    <th className="text-center py-4 px-4 font-medium">{t("plans.professional.name")}</th>
                    <th className="text-center py-4 px-4 font-medium">{t("plans.enterprise.name")}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature) => (
                    <tr key={feature.name} className="border-b">
                      <td className="py-4 px-4 text-muted-foreground">{feature.name}</td>
                      <td className="text-center py-4 px-4">{feature.starter}</td>
                      <td className="text-center py-4 px-4">{feature.professional}</td>
                      <td className="text-center py-4 px-4">{feature.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("faqTitle")}</h2>
            <div className="max-w-3xl mx-auto grid gap-6">
              {faqs.map((faq) => (
                <Card key={faq.question}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">{t("cta.startFreeTrial")}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 hover:bg-primary-foreground/10 bg-transparent"
                asChild
              >
                <Link href="/contact">{t("cta.talkToSales")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
