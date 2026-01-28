"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function PartnersPage() {
  const t = useTranslations("landing.partners")

  const partners = [
    { nameKey: "partnersList.googleCloud.name", logo: "/google-logo.png", categoryKey: "categories.infrastructure" },
    { nameKey: "partnersList.tableau.name", logo: "/tableau-logo.png", categoryKey: "categories.analytics" },
    { nameKey: "partnersList.slack.name", logo: "/slack-logo.png", categoryKey: "categories.communication" },
    { nameKey: "partnersList.salesforce.name", logo: "/salesforce-logo.png", categoryKey: "categories.crm" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome")}
            </Button>
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t("title")}</h1>
            <p className="text-lg text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <div className="mb-12 p-8 rounded-lg border border-border bg-card">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("becomePartner.title")}</h2>
            <p className="text-muted-foreground mb-6">
              {t("becomePartner.description")}
            </p>
            <Button>{t("becomePartner.applyButton")}</Button>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mb-8">{t("ourPartners")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {partners.map((partner, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-card p-6 flex flex-col items-center justify-center hover:border-accent transition-colors"
              >
                <div className="h-16 w-16 rounded-lg bg-muted mb-3 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">{t(partner.nameKey)}</span>
                </div>
                <h3 className="font-medium text-foreground text-center">{t(partner.nameKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(partner.categoryKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
