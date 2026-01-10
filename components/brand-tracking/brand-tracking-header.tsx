"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Target } from "lucide-react"

export function BrandTrackingHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Target className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Brand Tracking</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Monitor your brand health, track competitors, and analyze market positioning over time.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard/brand-tracking/new">
          <Plus className="mr-2 h-4 w-4" />
          New Brand Tracking
        </Link>
      </Button>
    </div>
  )
}
