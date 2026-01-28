"use client"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Bot, FileText, Users, Zap } from "lucide-react"

export function AnalyticsOverview() {
  const t = useTranslations("dashboard.analytics.overview")
  
  const stats = [
    {
      label: t("totalQueries"),
      value: "24,589",
      change: "+12.5%",
      trend: "up",
      icon: Zap,
      description: t("vsLastPeriod"),
    },
    {
      label: t("reportsGenerated"),
      value: "342",
      change: "+8.2%",
      trend: "up",
      icon: FileText,
      description: t("vsLastPeriod"),
    },
    {
      label: t("activeAgents"),
      value: "18",
      change: "+3",
      trend: "up",
      icon: Bot,
      description: t("newAgentsAdded"),
    },
    {
      label: t("teamMembers"),
      value: "47",
      change: "+5",
      trend: "up",
      icon: Users,
      description: t("joinedThisMonth"),
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  stat.trend === "up" ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {stat.trend === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
