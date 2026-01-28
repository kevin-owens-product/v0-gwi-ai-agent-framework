"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function PressPage() {
  const t = useTranslations("landing.press")

  const pressReleases = [
    {
      titleKey: "releases.agentFramework.title",
      dateKey: "releases.agentFramework.date",
      excerptKey: "releases.agentFramework.excerpt",
    },
    {
      titleKey: "releases.sparkIntegration.title",
      dateKey: "releases.sparkIntegration.date",
      excerptKey: "releases.sparkIntegration.excerpt",
    },
    {
      titleKey: "releases.seriesB.title",
      dateKey: "releases.seriesB.date",
      excerptKey: "releases.seriesB.excerpt",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome")}
            </Button>
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t("title")}</h1>
            <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="mb-12 p-6 rounded-lg border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-4">{t("mediaKit.title")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("mediaKit.description")}
            </p>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              {t("mediaKit.downloadButton")}
            </Button>
          </div>

          <div className="space-y-8">
            {pressReleases.map((release, idx) => (
              <article key={idx} className="pb-8 border-b border-border last:border-0">
                <div className="text-sm text-muted-foreground mb-2">{t(release.dateKey)}</div>
                <h2 className="text-2xl font-semibold text-foreground mb-3 hover:text-accent transition-colors cursor-pointer">
                  {t(release.titleKey)}
                </h2>
                <p className="text-muted-foreground">{t(release.excerptKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
