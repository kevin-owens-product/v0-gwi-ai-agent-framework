"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function CTASection() {
  const t = useTranslations("landing.cta")

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/20 rounded-full blur-[100px] opacity-30" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t("title")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              {t("subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 px-8">
                  {t("getStartedFree")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 bg-transparent">
                {t("scheduleDemo")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
