"use client"

import { useTranslations } from "next-intl"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function BlogPage() {
  const t = useTranslations("blog")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">{t("title")}</h1>
            <p className="text-lg text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <div className="mt-12 text-center text-muted-foreground">
            {t("comingSoon")}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
