"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Play, AlertTriangle, Clock, ArrowRight, Bot, Sparkles } from "lucide-react"
import Link from "next/link"

const activities = [
  {
    id: 1,
    type: "completed",
    title: "Gen Z Sustainability Report",
    agent: "Audience Strategist",
    time: "2 min ago",
    insights: 24,
    icon: CheckCircle2,
    href: "/dashboard/reports/gen-z-sustainability",
  },
  {
    id: 2,
    type: "running",
    title: "Q4 Campaign Brief Generation",
    agent: "Creative Brief Builder",
    time: "Running",
    progress: 67,
    icon: Play,
    href: "/dashboard/workflows/q4-campaign-brief",
  },
  {
    id: 3,
    type: "warning",
    title: "Competitor Analysis Needs Review",
    agent: "Competitive Tracker",
    time: "15 min ago",
    message: "Low confidence on 3 data points",
    icon: AlertTriangle,
    href: "/dashboard/reports/competitor-analysis",
  },
  {
    id: 4,
    type: "scheduled",
    title: "Weekly Market Trends Report",
    agent: "Trend Forecaster",
    time: "In 2 hours",
    icon: Clock,
    href: "/dashboard/workflows/weekly-trends",
  },
  {
    id: 5,
    type: "completed",
    title: "Customer Segmentation Update",
    agent: "Survey Analyst",
    time: "1 hour ago",
    insights: 18,
    icon: CheckCircle2,
    href: "/dashboard/reports/customer-segmentation",
  },
]

const typeStyles = {
  completed: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  running: {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  warning: {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  scheduled: {
    badge: "bg-muted text-muted-foreground border-border",
    icon: "text-muted-foreground",
    bg: "bg-muted",
  },
}

export function LiveActivityFeed() {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">Live Activity</CardTitle>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>
        <Link href="/dashboard/workflows">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity) => {
          const styles = typeStyles[activity.type as keyof typeof typeStyles]
          return (
            <Link key={activity.id} href={activity.href}>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-accent/30 transition-all cursor-pointer group">
                <div className={`p-2 rounded-lg ${styles.bg} mt-0.5`}>
                  <activity.icon className={`h-4 w-4 ${styles.icon}`} />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                      {activity.title}
                    </h4>
                    <ArrowRight className="h-3 w-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Bot className="h-3 w-3" />
                    <span>{activity.agent}</span>
                    <span>·</span>
                    <span>{activity.time}</span>
                  </div>

                  {activity.type === "running" && activity.progress && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${activity.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.progress}%</span>
                    </div>
                  )}

                  {activity.type === "warning" && activity.message && (
                    <p className="text-xs text-amber-400 mt-1">{activity.message}</p>
                  )}
                </div>

                {activity.insights && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    <span>{activity.insights}</span>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
