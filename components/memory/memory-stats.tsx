"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Database, Clock, Layers } from "lucide-react"

export function MemoryStats() {
  const t = useTranslations("memory")

  const stats = [
    { label: t("stats.totalMemories"), value: "2,847", icon: Brain, change: t("stats.thisWeek", { count: 124 }) },
    { label: t("stats.storageUsed"), value: "847 MB", icon: Database, change: t("stats.ofTotal", { total: "5 GB" }) },
    { label: t("stats.avgRetention"), value: t("stats.days", { count: 45 }), icon: Clock, change: t("stats.extendedTier") },
    { label: t("stats.activeProjects"), value: "8", icon: Layers, change: t("stats.withMemories", { count: 3 }) },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
