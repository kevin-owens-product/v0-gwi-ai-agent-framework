"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useTranslations } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Brain, Loader2, Eye, EyeOff, Check, AlertCircle } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const t = useTranslations('auth')

  const passwordRequirements = [
    { label: t('validation.atLeast8Characters'), check: (p: string) => p.length >= 8 },
    { label: t('validation.oneUppercase'), check: (p: string) => /[A-Z]/.test(p) },
    { label: t('validation.oneLowercase'), check: (p: string) => /[a-z]/.test(p) },
    { label: t('validation.oneNumber'), check: (p: string) => /\d/.test(p) },
  ]

  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
  })

  const isPasswordValid = passwordRequirements.every((req) => req.check(formData.password))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreedToTerms) {
      setFormError(t('validation.pleaseAgreeToTerms'))
      return
    }

    setIsLoading(true)
    setFormError(null)

    try {
      // Register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          organizationName: formData.company,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setFormError(data.error || t('errors.failedToCreateAccount'))
        return
      }

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        // Account created but auto-login failed
        router.push("/login?message=Account created successfully. Please sign in.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setFormError(t('errors.genericError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsOAuthLoading(provider)
    await signIn(provider, { callbackUrl: "/dashboard" })
  }

  return (
    <div className="space-y-6">
      {/* Mobile logo */}
      <div className="lg:hidden flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">{t('layout.brandName')}</span>
        </Link>
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{t('createYourAccount')}</h1>
        <p className="text-muted-foreground">{t('getStartedFree')}</p>
      </div>

      {/* Error message */}
      {formError && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t('form.fullName')}</Label>
            <Input
              id="name"
              placeholder={t('form.fullNamePlaceholder')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">{t('form.organization')}</Label>
            <Input
              id="company"
              placeholder={t('form.organizationPlaceholder')}
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('form.workEmail')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t('newPasswordPlaceholder')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formData.password && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {passwordRequirements.map((req, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 text-xs ${
                    req.check(formData.password) ? "text-emerald-500" : "text-muted-foreground"
                  }`}
                >
                  <Check className="h-3 w-3" />
                  {req.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            disabled={isLoading}
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed font-normal">
            {t('termsAgreement')}{" "}
            <Link href="/terms" className="text-primary hover:underline">
              {t('termsOfService')}
            </Link>{" "}
            {t('termsAnd')}{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              {t('privacyPolicy')}
            </Link>
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !agreedToTerms || !isPasswordValid}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('creatingAccount')}
            </>
          ) : (
            t('createAccount')
          )}
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          {t('orContinueWith')}
        </span>
      </div>

      <div className="grid gap-3">
        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => handleOAuthSignIn("google")}
          disabled={isOAuthLoading !== null}
        >
          {isOAuthLoading === "google" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {t('oauth.signUpWithGoogle')}
        </Button>
        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => handleOAuthSignIn("microsoft-entra-id")}
          disabled={isOAuthLoading !== null}
        >
          {isOAuthLoading === "microsoft-entra-id" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
            </svg>
          )}
          {t('oauth.signUpWithMicrosoft')}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {t('hasAccount')}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </div>
  )
}
