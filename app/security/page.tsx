"use client"

import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Shield, Lock, Key, Eye, Server, FileCheck, Users } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export default function SecurityPage() {
  const t = useTranslations("legal.security")

  const certifications = [
    { name: t("certifications.soc2.name"), description: t("certifications.soc2.description") },
    { name: t("certifications.gdpr.name"), description: t("certifications.gdpr.description") },
    { name: t("certifications.iso27001.name"), description: t("certifications.iso27001.description") },
    { name: t("certifications.ccpa.name"), description: t("certifications.ccpa.description") },
  ]

  const securityFeatures = [
    {
      icon: Lock,
      title: t("features.encryption.title"),
      description: t("features.encryption.description"),
    },
    {
      icon: Key,
      title: t("features.accessControls.title"),
      description: t("features.accessControls.description"),
    },
    {
      icon: Eye,
      title: t("features.auditLogging.title"),
      description: t("features.auditLogging.description"),
    },
    {
      icon: Server,
      title: t("features.infrastructure.title"),
      description: t("features.infrastructure.description"),
    },
    {
      icon: FileCheck,
      title: t("features.penetrationTesting.title"),
      description: t("features.penetrationTesting.description"),
    },
    {
      icon: Users,
      title: t("features.training.title"),
      description: t("features.training.description"),
    },
  ]

  const dataResidency = [
    { region: t("dataResidency.us.region"), location: t("dataResidency.us.location"), flag: "🇺🇸" },
    { region: t("dataResidency.eu.region"), location: t("dataResidency.eu.location"), flag: "🇪🇺" },
    { region: t("dataResidency.ap.region"), location: t("dataResidency.ap.location"), flag: "🇸🇬" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("hero.title")}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">{t("hero.subtitle")}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {certifications.map((cert) => (
                <Badge key={cert.name} variant="secondary" className="text-sm py-2 px-4">
                  <Check className="mr-2 h-4 w-4" />
                  {cert.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("featuresSection.title")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {securityFeatures.map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Data Residency */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4">{t("dataResidencySection.title")}</h2>
              <p className="text-muted-foreground text-center mb-12">{t("dataResidencySection.subtitle")}</p>
              <div className="grid md:grid-cols-3 gap-6">
                {dataResidency.map((region) => (
                  <Card key={region.region}>
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-4">{region.flag}</div>
                      <h3 className="font-semibold mb-1">{region.region}</h3>
                      <p className="text-sm text-muted-foreground">{region.location}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4">{t("complianceSection.title")}</h2>
              <p className="text-muted-foreground text-center mb-12">{t("complianceSection.subtitle")}</p>
              <div className="grid md:grid-cols-2 gap-6">
                {certifications.map((cert) => (
                  <Card key={cert.name}>
                    <CardContent className="pt-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground">{cert.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">{t("cta.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">{t("cta.contactButton")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs/security">{t("cta.docsButton")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
