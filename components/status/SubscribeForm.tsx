"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, Check, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"

interface SubscribeFormProps {
  className?: string
}

export function SubscribeForm({ className }: SubscribeFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/status/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      setIsSubscribed(true)
      toast.success("Successfully subscribed to status updates")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to subscribe")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">Subscribed!</h3>
              <p className="text-sm text-muted-foreground">
                You will receive email notifications when there are status updates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Subscribe to Updates
        </CardTitle>
        <CardDescription>
          Get notified via email when there are status updates or incidents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            We will only send you emails about status updates and incidents. You can
            unsubscribe at any time.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
