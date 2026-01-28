"use client"

import { useTranslations } from "next-intl"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Users, Zap, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  const t = useTranslations("landing.about")

  const stats = [
    { labelKey: "stats.enterpriseClients", value: "2,000+" },
    { labelKey: "stats.markets", value: "50+" },
    { labelKey: "stats.consumersRepresented", value: "3B" },
    { labelKey: "stats.teamMembers", value: "750+" },
  ]

  const values = [
    {
      icon: Target,
      titleKey: "values.accuracyFirst.title",
      descriptionKey: "values.accuracyFirst.description",
    },
    {
      icon: Users,
      titleKey: "values.customerObsessed.title",
      descriptionKey: "values.customerObsessed.description",
    },
    {
      icon: Zap,
      titleKey: "values.speedMatters.title",
      descriptionKey: "values.speedMatters.description",
    },
    {
      icon: Shield,
      titleKey: "values.trustSecurity.title",
      descriptionKey: "values.trustSecurity.description",
    },
  ]

  const team = [
    { name: "Tom Smith", roleKey: "team.roles.ceoFounder", image: "/placeholder-user.jpg" },
    { name: "Misha Williams", roleKey: "team.roles.coo", image: "/placeholder-user.jpg" },
    { name: "Nick Dearden", roleKey: "team.roles.cto", image: "/placeholder-user.jpg" },
    { name: "Kevin Owens", roleKey: "team.roles.cpo", image: "/placeholder-user.jpg" },
    { name: "Jason Mander", roleKey: "team.roles.cio", image: "/placeholder-user.jpg" },
    { name: "Birthe Emmerich", roleKey: "team.roles.cmo", image: "/placeholder-user.jpg" },
  ]

  const milestones = [
    { year: "2009", titleKey: "milestones.founded.title", descriptionKey: "milestones.founded.description" },
    { year: "2014", titleKey: "milestones.globalExpansion.title", descriptionKey: "milestones.globalExpansion.description" },
    { year: "2019", titleKey: "milestones.seriesA.title", descriptionKey: "milestones.seriesA.description" },
    { year: "2022", titleKey: "milestones.seriesB.title", descriptionKey: "milestones.seriesB.description" },
    { year: "2024", titleKey: "milestones.aiFramework.title", descriptionKey: "milestones.aiFramework.description" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("hero.title")}</h1>
              <p className="text-xl text-muted-foreground mb-8">
                {t("hero.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.labelKey} className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{t(stat.labelKey)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-3xl font-bold mb-6">{t("story.title")}</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>{t("story.paragraph1")}</p>
                  <p>{t("story.paragraph2")}</p>
                  <p>{t("story.paragraph3")}</p>
                </div>
              </div>
              <div className="relative h-80 lg:h-96 rounded-lg overflow-hidden">
                <Image src="/modern-office-collaboration.png" alt={t("story.imageAlt")} fill className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("values.title")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {values.map((value) => (
                <Card key={value.titleKey}>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t(value.titleKey)}</h3>
                    <p className="text-muted-foreground">{t(value.descriptionKey)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("journey.title")}</h2>
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-8">
                  {milestones.map((milestone) => (
                    <div key={milestone.year} className="relative flex gap-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center flex-shrink-0 z-10">
                        <span className="font-bold text-primary">{milestone.year}</span>
                      </div>
                      <div className="pt-3">
                        <h3 className="text-xl font-semibold">{t(milestone.titleKey)}</h3>
                        <p className="text-muted-foreground">{t(milestone.descriptionKey)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">{t("team.title")}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t("team.subtitle")}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {team.map((member) => (
                <Card key={member.name} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                  </div>
                  <CardContent className="pt-4 text-center">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-muted-foreground">{t(member.roleKey)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/careers">{t("cta.viewOpenPositions")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">{t("cta.contactUs")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
