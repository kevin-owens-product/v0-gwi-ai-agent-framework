"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Loader2, Eye, EyeOff, Check, AlertCircle, CheckCircle } from "lucide-react"

const passwordRequirements = [
  { label: "At least 8 characters", check: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", check: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", check: (p: string) => /[a-z]/.test(p) },
  { label: "One number", check: (p: string) => /\d/.test(p) },
]

function ResetPasswordForm() {
  const _router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

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
        setValidationError("No reset token provided")
        return
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`)
        const data = await response.json()

        if (data.valid) {
          setIsValid(true)
        } else {
          setValidationError(data.error || "Invalid or expired reset link")
        }
      } catch {
        setValidationError("Failed to validate reset link")
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordsMatch) {
      setFormError("Passwords do not match")
      return
    }

    if (!isPasswordValid) {
      setFormError("Please meet all password requirements")
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
        setFormError(data.error || "Failed to reset password")
        return
      }

      setIsSuccess(true)
    } catch {
      setFormError("An error occurred. Please try again.")
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
          <p className="text-muted-foreground">Validating reset link...</p>
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
          <h1 className="text-3xl font-bold">Invalid Link</h1>
          <p className="text-muted-foreground">{validationError}</p>
        </div>
        <Button asChild className="w-full">
          <Link href="/forgot-password">Request New Reset Link</Link>
        </Button>
        <Button variant="ghost" asChild className="w-full">
          <Link href="/login">Back to Sign In</Link>
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
          <h1 className="text-3xl font-bold">Password Reset!</h1>
          <p className="text-muted-foreground">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/login">Sign In</Link>
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
        <h1 className="text-3xl font-bold">Create new password</h1>
        <p className="text-muted-foreground">Enter your new password below</p>
      </div>

      {formError && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
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
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
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
              {passwordsMatch ? "Passwords match" : "Passwords do not match"}
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
              Resetting password...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      <Button variant="ghost" asChild className="w-full">
        <Link href="/login">Back to Sign In</Link>
      </Button>
    </div>
  )
}

function ResetPasswordSkeleton() {
  return (
    <div className="space-y-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
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
