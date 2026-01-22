"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertCircle, Loader2 } from "lucide-react"

const MAX_RETRIES = 3
const INITIAL_DELAY_MS = 1000

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Signing in...")
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setLoadingMessage("Signing in...")

    // Cancel any pending request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    let lastError = ""

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch("/api/admin/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          signal: abortControllerRef.current.signal,
        })

        const data = await response.json()

        if (response.ok) {
          router.push("/admin")
          router.refresh()
          return
        }

        // Check if error is retryable (503 Service Unavailable)
        if (response.status === 503 && data.retryable && attempt < MAX_RETRIES - 1) {
          const delay = INITIAL_DELAY_MS * Math.pow(2, attempt)
          setLoadingMessage(`Connecting... (attempt ${attempt + 2}/${MAX_RETRIES})`)
          await sleep(delay)
          continue
        }

        // Non-retryable error
        setError(data.error || "Login failed")
        setIsLoading(false)
        return
      } catch (err) {
        // Handle network errors with retry
        if (err instanceof Error && err.name === 'AbortError') {
          return // Request was cancelled
        }

        lastError = "Unable to connect. Please check your network and try again."

        if (attempt < MAX_RETRIES - 1) {
          const delay = INITIAL_DELAY_MS * Math.pow(2, attempt)
          setLoadingMessage(`Reconnecting... (attempt ${attempt + 2}/${MAX_RETRIES})`)
          await sleep(delay)
          continue
        }
      }
    }

    setError(lastError || "Service temporarily unavailable. Please try again.")
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-white">Admin Portal</CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to access the platform administration dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {loadingMessage}
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            This portal is for authorized administrators only.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
