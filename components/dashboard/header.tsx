"use client"

import { Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useState, useEffect } from "react"
import { MobileSidebar } from "./mobile-sidebar"
import { StatusBadge, type SystemStatus } from "@/components/status"
import Link from "next/link"

export function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>("operational")

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/status")
        const data = await response.json()
        setSystemStatus(data.status || "operational")
      } catch (error) {
        // Default to operational if fetch fails
        setSystemStatus("operational")
      }
    }

    fetchStatus()
    // Refresh status every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-6">
        <button
          className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1 flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents, workflows, or insights..."
              className="pl-10 bg-secondary border-border"
              aria-label="Search"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/status" className="hidden sm:block">
            <StatusBadge status={systemStatus} size="sm" showLabel={systemStatus !== "operational"} />
          </Link>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center lg:hidden">
            <span className="text-xs font-medium text-accent">JD</span>
          </div>
        </div>
      </header>

      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  )
}
