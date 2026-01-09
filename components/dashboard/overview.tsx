import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Workflow, Zap, Clock } from "lucide-react"

const stats = [
  {
    title: "Active Agents",
    value: "12",
    change: "+2 this week",
    icon: Bot,
    trend: "up",
  },
  {
    title: "Workflows Run",
    value: "847",
    change: "+23% from last month",
    icon: Workflow,
    trend: "up",
  },
  {
    title: "Insights Generated",
    value: "3,241",
    change: "+18% from last month",
    icon: Zap,
    trend: "up",
  },
  {
    title: "Avg. Run Time",
    value: "2.4m",
    change: "-12% faster",
    icon: Clock,
    trend: "up",
  },
]

export function DashboardOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-chart-5 mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
