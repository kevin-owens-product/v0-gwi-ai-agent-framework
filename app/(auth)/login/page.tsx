"use client"

import type React from "react"
import { useState, useEffect, Suspense, useTransition, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useTranslations } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Loader2, Eye, EyeOff, AlertCircle, Shield, Users, Database } from "lucide-react"

type LoginType = "platform" | "admin" | "gwi"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const error = searchParams.get("error")
  const t = useTranslations('auth')
  const [isPending, startTransition] = useTransition()
  const isNavigatingRef = useRef(false)

  const [loginType, setLoginType] = useState<LoginType>("platform")

  // Set login type from URL after mount to avoid hydration mismatch
  useEffect(() => {
    const typeParam = searchParams.get("type") as LoginType | null
    if (typeParam && ["platform", "admin", "gwi"].includes(typeParam)) {
      setLoginType(typeParam)
    }
  }, [searchParams])
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Prevent navigation if already navigating
  useEffect(() => {
    return () => {
      isNavigatingRef.current = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent double submission
    if (isLoading || isNavigatingRef.current) {
      return
    }

    setIsLoading(true)
    setFormError(null)

    try {
      if (loginType === "admin") {
        // Admin login uses separate API endpoint
        const response = await fetch("/api/admin/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        })

        const data = await response.json()

        if (!response.ok) {
          setFormError(data.error || t('errors.invalidCredentials'))
          setIsLoading(false)
          return
        }

        // Use startTransition to defer navigation and prevent DOM conflicts
        isNavigatingRef.current = true
        startTransition(() => {
          try {
            router.push("/admin")
          } catch (error) {
            console.error('Navigation error:', error)
            isNavigatingRef.current = false
            setIsLoading(false)
            // Fallback to window.location if router.push fails
            window.location.href = "/admin"
          }
        })
      } else if (loginType === "gwi") {
        // GWI login uses separate API endpoint
        const response = await fetch("/api/gwi/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        })

        const data = await response.json()

        if (!response.ok) {
          setFormError(data.error || t('errors.invalidCredentials'))
          setIsLoading(false)
          return
        }

        // Use startTransition to defer navigation and prevent DOM conflicts
        isNavigatingRef.current = true
        startTransition(() => {
          try {
            router.push("/gwi")
          } catch (error) {
            console.error('Navigation error:', error)
            isNavigatingRef.current = false
            setIsLoading(false)
            // Fallback to window.location if router.push fails
            window.location.href = "/gwi"
          }
        })
      } else {
        // Platform login uses NextAuth
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          setFormError(t('errors.invalidCredentials'))
          setIsLoading(false)
        } else {
          // Use startTransition to defer navigation and prevent DOM conflicts
          isNavigatingRef.current = true
          startTransition(() => {
            try {
              router.push(callbackUrl)
            } catch (error) {
              console.error('Navigation error:', error)
              isNavigatingRef.current = false
              setIsLoading(false)
              // Fallback to window.location if router.push fails
              window.location.href = callbackUrl
            }
          })
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setFormError(t('errors.genericError'))
      setIsLoading(false)
      isNavigatingRef.current = false
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsOAuthLoading(provider)
    await signIn(provider, { callbackUrl })
  }

  const handleTabChange = (value: string) => {
    // Prevent tab changes during loading or navigation
    if (isLoading || isPending || isNavigatingRef.current) {
      return
    }
    setLoginType(value as LoginType)
    setFormError(null)
    setFormData({ email: "", password: "" })
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
        <h1 className="text-3xl font-bold">{t('welcomeBack')}</h1>
        <p className="text-muted-foreground">{t('signInToContinue')}</p>
      </div>

      {/* Login Type Tabs */}
      <Tabs 
        value={loginType} 
        onValueChange={handleTabChange} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platform" className="flex items-center gap-1.5 text-xs sm:text-sm" disabled={isLoading || isPending || isNavigatingRef.current}>
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t('tabs.platform')}</span>
            <span className="sm:hidden">{t('tabs.user')}</span>
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-1.5 text-xs sm:text-sm" disabled={isLoading || isPending || isNavigatingRef.current}>
            <Shield className="h-4 w-4" />
            {t('tabs.admin')}
          </TabsTrigger>
          <TabsTrigger value="gwi" className="flex items-center gap-1.5 text-xs sm:text-sm" disabled={isLoading || isPending || isNavigatingRef.current}>
            <Database className="h-4 w-4" />
            {t('tabs.gwi')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="mt-6 space-y-6">
          {/* Error messages */}
          {(error || formError) && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                {error === "OAuthAccountNotLinked"
                  ? t('errors.oauthAccountNotLinked')
                  : formError || t('errors.signInError')}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-email">{t('email')}</Label>
              <Input
                id="platform-email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="platform-password">{t('password')}</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="platform-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('passwordPlaceholder')}
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
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || isPending}>
              {isLoading || isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('signingIn')}
                </>
              ) : (
                t('portal.signInToPlatform')
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
              {t('oauth.continueWithGoogle')}
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
              {t('oauth.continueWithMicrosoft')}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {t('noAccount')}{" "}
            <Link href="/signup" className="text-primary hover:underline">
              {t('signUpForFree')}
            </Link>
          </p>
        </TabsContent>

        <TabsContent value="admin" className="mt-6 space-y-6">
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-500">{t('admin.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('admin.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Error messages */}
          {formError && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">{t('form.adminEmail')}</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder={t('form.adminEmailPlaceholder')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">{t('password')}</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('form.adminPasswordPlaceholder')}
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
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || isPending}>
              {isLoading || isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('signingIn')}
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  {t('portal.signInToAdmin')}
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            {t('admin.accessLogged')}
          </p>
        </TabsContent>

        <TabsContent value="gwi" className="mt-6 space-y-6">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-500">{t('gwi.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('gwi.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Error messages */}
          {formError && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gwi-email">{t('form.gwiEmail')}</Label>
              <Input
                id="gwi-email"
                type="email"
                placeholder={t('form.gwiEmailPlaceholder')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gwi-password">{t('password')}</Label>
              <div className="relative">
                <Input
                  id="gwi-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('passwordPlaceholder')}
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
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading || isPending}>
              {isLoading || isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('signingIn')}
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  {t('portal.signInToGwi')}
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            {t('gwi.manageTools')}
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <div className="h-9 w-48 bg-muted rounded animate-pulse mx-auto" />
        <div className="h-5 w-64 bg-muted rounded animate-pulse mx-auto" />
      </div>
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}
