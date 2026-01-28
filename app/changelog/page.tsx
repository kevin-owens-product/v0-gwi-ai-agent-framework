"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function ChangelogPage() {
  const t = useTranslations("landing.changelog")

  const updates = [
    {
      version: "3.0.0",
      date: "January 10, 2026",
      typeKey: "types.majorRelease",
      items: [
        t("releases.v300.item1"),
        t("releases.v300.item2"),
        t("releases.v300.item3"),
        t("releases.v300.item4"),
        t("releases.v300.item5"),
        t("releases.v300.item6"),
        t("releases.v300.item7"),
        t("releases.v300.item8"),
        t("releases.v300.item9"),
        t("releases.v300.item10"),
        t("releases.v300.item11"),
        t("releases.v300.item12"),
      ],
    },
    {
      version: "2.4.0",
      date: "January 8, 2025",
      typeKey: "types.feature",
      items: [
        t("releases.v240.item1"),
        t("releases.v240.item2"),
        t("releases.v240.item3"),
        t("releases.v240.item4"),
      ],
    },
    {
      version: "2.3.0",
      date: "December 15, 2024",
      typeKey: "types.feature",
      items: [
        t("releases.v230.item1"),
        t("releases.v230.item2"),
        t("releases.v230.item3"),
        t("releases.v230.item4"),
      ],
    },
    {
      version: "2.2.1",
      date: "November 28, 2024",
      typeKey: "types.fix",
      items: [
        t("releases.v221.item1"),
        t("releases.v221.item2"),
        t("releases.v221.item3"),
      ],
    },
    {
      version: "2.2.0",
      date: "November 10, 2024",
      typeKey: "types.feature",
      items: [
        t("releases.v220.item1"),
        t("releases.v220.item2"),
        t("releases.v220.item3"),
        t("releases.v220.item4"),
      ],
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

          <div className="space-y-12">
            {updates.map((update) => (
              <div key={update.version} className="border-l-2 border-accent pl-6">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-2xl font-semibold text-foreground">v{update.version}</h2>
                  <Badge variant={update.typeKey === "types.feature" ? "default" : "secondary"}>{t(update.typeKey)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{update.date}</p>
                <ul className="space-y-2">
                  {update.items.map((item, idx) => (
                    <li key={idx} className="text-foreground flex items-start gap-2">
                      <span className="text-accent mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
