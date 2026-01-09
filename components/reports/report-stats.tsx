"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, Eye, Users, TrendingUp } from "lucide-react"

const stats = [
  {
    label: "Total Reports",
    value: "127",
    change: "+12 this month",
    changeType: "positive" as const,
    icon: FileText,
  },
  {
    label: "Total Views",
    value: "8,432",
    change: "+23% vs last month",
    changeType: "positive" as const,
    icon: Eye,
  },
  {
    label: "Team Members",
    value: "24",
    change: "Active contributors",
    changeType: "neutral" as const,
    icon: Users,
  },
  {
    label: "Avg. Engagement",
    value: "4.2 min",
    change: "+0.8 min vs last month",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
]

export function ReportStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p
                  className={`text-xs mt-1 ${
                    stat.changeType === "positive" ? "text-emerald-500" : "text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
