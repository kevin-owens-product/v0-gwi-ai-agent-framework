"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Loader2, Eye, EyeOff, Check, AlertCircle, CheckCircle } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const t = useTranslations('auth')

  const passwordRequirements = [
    { label: t('validation.atLeast8Characters'), check: (p: string) => p.length >= 8 },
    { label: t('validation.oneUppercase'), check: (p: string) => /[A-Z]/.test(p) },
    { label: t('validation.oneLowercase'), check: (p: string) => /[a-z]/.test(p) },
    { label: t('validation.oneNumber'), check: (p: string) => /\d/.test(p) },
  ]

  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  const isPasswordValid = passwordRequirements.every((req) => req.check(formData.password))
  const passwordsMatch = formData.password === formData.confirmPassword

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setIsValidating(false)
        setValidationError(t('errors.noResetToken'))
        return
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`)
        const data = await response.json()

        if (data.valid) {
          setIsValid(true)
        } else {
          setValidationError(data.error || t('errors.invalidOrExpiredLink'))
        }
      } catch {
        setValidationError(t('errors.failedToValidateLink'))
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordsMatch) {
      setFormError(t('validation.passwordsDoNotMatch'))
      return
    }

    if (!isPasswordValid) {
      setFormError(t('validation.meetPasswordRequirements'))
      return
    }

    setIsLoading(true)
    setFormError(null)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setFormError(data.error || t('errors.failedToResetPassword'))
        return
      }

      setIsSuccess(true)
    } catch {
      setFormError(t('errors.genericError'))
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="space-y-8 text-center">
        <div className="lg:hidden flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">GWI Agents</span>
          </Link>
        </div>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('validatingLink')}</p>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (!isValid && validationError) {
    return (
      <div className="space-y-8 text-center">
        <div className="lg:hidden flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">GWI Agents</span>
          </Link>
        </div>
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t('invalidLink')}</h1>
          <p className="text-muted-foreground">{validationError}</p>
        </div>
        <Button asChild className="w-full">
          <Link href="/forgot-password">{t('requestNewResetLink')}</Link>
        </Button>
        <Button variant="ghost" asChild className="w-full">
          <Link href="/login">{t('backToSignIn')}</Link>
        </Button>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="space-y-8 text-center">
        <div className="lg:hidden flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">GWI Agents</span>
          </Link>
        </div>
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t('passwordReset')}</h1>
          <p className="text-muted-foreground">
            {t('passwordResetSuccess')}
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/login">{t('signIn')}</Link>
        </Button>
      </div>
    )
  }

  // Reset form
  return (
    <div className="space-y-8">
      <div className="lg:hidden flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">GWI Agents</span>
        </Link>
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{t('createNewPassword')}</h1>
        <p className="text-muted-foreground">{t('enterNewPasswordBelow')}</p>
      </div>

      {formError && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">{t('newPassword')}</Label>
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t('confirmPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formData.confirmPassword && (
            <div className={`flex items-center gap-1.5 text-xs ${passwordsMatch ? "text-emerald-500" : "text-destructive"}`}>
              {passwordsMatch ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {passwordsMatch ? t('validation.passwordsMatch') : t('validation.passwordsDoNotMatch')}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !isPasswordValid || !passwordsMatch}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('resettingPassword')}
            </>
          ) : (
            t('resetPassword')
          )}
        </Button>
      </form>

      <Button variant="ghost" asChild className="w-full">
        <Link href="/login">{t('backToSignIn')}</Link>
      </Button>
    </div>
  )
}

function ResetPasswordSkeleton() {
  const t = useTranslations('auth')

  return (
    <div className="space-y-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
