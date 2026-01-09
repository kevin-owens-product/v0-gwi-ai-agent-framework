import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Bot, FileText, Users, Zap } from "lucide-react"

const stats = [
  {
    label: "Total Queries",
    value: "24,589",
    change: "+12.5%",
    trend: "up",
    icon: Zap,
    description: "vs. last period",
  },
  {
    label: "Reports Generated",
    value: "342",
    change: "+8.2%",
    trend: "up",
    icon: FileText,
    description: "vs. last period",
  },
  {
    label: "Active Agents",
    value: "18",
    change: "+3",
    trend: "up",
    icon: Bot,
    description: "new agents added",
  },
  {
    label: "Team Members",
    value: "47",
    change: "+5",
    trend: "up",
    icon: Users,
    description: "joined this month",
  },
]

export function AnalyticsOverview() {
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
