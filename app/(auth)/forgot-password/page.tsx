"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Loader2, ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      // Always show success to prevent email enumeration
      setIsSubmitted(true)
    } catch {
      // Even on error, show success to prevent email enumeration
      setIsSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-8 text-center">
        <div className="lg:hidden flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">{t('layout.brandName')}</span>
          </Link>
        </div>

        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t('checkYourEmail')}</h1>
          <p className="text-muted-foreground">
            {t('emailSentTo')} <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <Button variant="outline" asChild className="w-full bg-transparent">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToSignIn')}
          </Link>
        </Button>

        <p className="text-sm text-muted-foreground">
          {t('didntReceiveEmail')}{" "}
          <button onClick={() => setIsSubmitted(false)} className="text-primary hover:underline">
            {t('clickToResend')}
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="lg:hidden flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">{t('layout.brandName')}</span>
        </Link>
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{t('resetYourPassword')}</h1>
        <p className="text-muted-foreground">{t('enterEmailForReset')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('sendingLink')}
            </>
          ) : (
            t('sendResetLink')
          )}
        </Button>
      </form>

      <Button variant="ghost" asChild className="w-full">
        <Link href="/login">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToSignIn')}
        </Link>
      </Button>
    </div>
  )
}
