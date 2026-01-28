"use client"

import { useTranslations } from "next-intl"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Briefcase, Globe, Heart, Lightbulb, MapPin, Rocket, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function CareersPage() {
  const t = useTranslations("landing.careers")

  const benefits = [
    {
      icon: Globe,
      titleKey: "benefits.remoteFirst.title",
      descriptionKey: "benefits.remoteFirst.description",
    },
    {
      icon: Heart,
      titleKey: "benefits.healthWellness.title",
      descriptionKey: "benefits.healthWellness.description",
    },
    {
      icon: Rocket,
      titleKey: "benefits.growthBudget.title",
      descriptionKey: "benefits.growthBudget.description",
    },
    {
      icon: Users,
      titleKey: "benefits.teamRetreats.title",
      descriptionKey: "benefits.teamRetreats.description",
    },
    {
      icon: Zap,
      titleKey: "benefits.latestTools.title",
      descriptionKey: "benefits.latestTools.description",
    },
    {
      icon: Lightbulb,
      titleKey: "benefits.innovationTime.title",
      descriptionKey: "benefits.innovationTime.description",
    },
  ]

  const openings = [
    {
      id: "1",
      titleKey: "openings.seniorAiMlEngineer.title",
      departmentKey: "departments.engineering",
      location: "Remote (Global)",
      typeKey: "jobTypes.fullTime",
      experience: "5+ years",
    },
    {
      id: "2",
      titleKey: "openings.productManagerAiAgents.title",
      departmentKey: "departments.product",
      location: "London (Farringdon) / Remote",
      typeKey: "jobTypes.fullTime",
      experience: "4+ years",
    },
    {
      id: "3",
      titleKey: "openings.seniorFrontendEngineer.title",
      departmentKey: "departments.engineering",
      location: "Remote (US/EU)",
      typeKey: "jobTypes.fullTime",
      experience: "4+ years",
    },
    {
      id: "4",
      titleKey: "openings.customerSuccessManager.title",
      departmentKey: "departments.customerSuccess",
      location: "New York (Chelsea) / Remote",
      typeKey: "jobTypes.fullTime",
      experience: "3+ years",
    },
    {
      id: "5",
      titleKey: "openings.dataScientist.title",
      departmentKey: "departments.data",
      location: "Remote (Global)",
      typeKey: "jobTypes.fullTime",
      experience: "3+ years",
    },
    {
      id: "6",
      titleKey: "openings.technicalWriter.title",
      departmentKey: "departments.product",
      location: "Remote (Global)",
      typeKey: "jobTypes.fullTime",
      experience: "2+ years",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4">{t("hero.badge")}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("hero.title")}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("hero.subtitle")}
            </p>
            <Button size="lg" asChild>
              <a href="#openings">
                {t("hero.viewOpenPositions")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>

        {/* Culture */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("culture.title")}</h2>
              <p className="text-muted-foreground">
                {t("culture.subtitle")}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit) => (
                <Card key={benefit.titleKey}>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t(benefit.titleKey)}</h3>
                    <p className="text-muted-foreground">{t(benefit.descriptionKey)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section id="openings" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("positions.title")}</h2>
            <div className="max-w-4xl mx-auto space-y-4">
              {openings.map((job) => (
                <Card key={job.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{t(job.titleKey)}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {t(job.departmentKey)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{t(job.typeKey)}</Badge>
                        <Badge variant="secondary">{job.experience}</Badge>
                        <Button asChild>
                          <Link href={`/careers/${job.id}`}>{t("positions.apply")}</Link>
                        </Button>
                      </div>
                    </div>
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
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">{t("cta.getInTouch")}</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
