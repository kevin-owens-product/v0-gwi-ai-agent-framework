"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Brain } from "lucide-react"
import { useTranslations } from "@/lib/i18n"

export default function AuthLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('auth')

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted/30 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">{t('layout.brandName')}</span>
        </Link>

        <div className="space-y-6">
          <blockquote className="text-2xl font-medium leading-relaxed">
            "{t('layout.testimonialQuote')}"
          </blockquote>
          <div>
            <p className="font-semibold">{t('layout.testimonialAuthor')}</p>
            <p className="text-muted-foreground">{t('layout.testimonialRole')}</p>
          </div>
        </div>

        <div className="flex items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{t('layout.uptime')}</span>
          </div>
          <div>{t('layout.soc2')}</div>
          <div>{t('layout.gdpr')}</div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
