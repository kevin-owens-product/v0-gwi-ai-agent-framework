"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Target, Activity, TrendingUp, BarChart3 } from "lucide-react"

export function BrandTrackingStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Tracking</p>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground mt-1">Across all brands</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Snapshots</p>
              <p className="text-2xl font-bold">260</p>
              <p className="text-xs text-emerald-500 mt-1">+12% this week</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Brand Health</p>
              <p className="text-2xl font-bold">78.5</p>
              <p className="text-xs text-emerald-500 mt-1">+3.2 points</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Competitors Tracked</p>
              <p className="text-2xl font-bold">11</p>
              <p className="text-xs text-muted-foreground mt-1">Across all brands</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
