"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, Users, Target, Lightbulb } from "lucide-react"
import Link from "next/link"

const insights = [
  {
    id: 1,
    title: "Gen Z sustainability interest up 23%",
    category: "Audience",
    confidence: 94,
    icon: Users,
    isNew: true,
    href: "/dashboard/reports/gen-z-sustainability",
  },
  {
    id: 2,
    title: "Competitor X launching eco-line Q1",
    category: "Competitive",
    confidence: 87,
    icon: Target,
    isNew: true,
    href: "/dashboard/reports/competitor-analysis",
  },
  {
    id: 3,
    title: "TikTok engagement peak: 7-9pm",
    category: "Trend",
    confidence: 91,
    icon: TrendingUp,
    isNew: false,
    href: "/dashboard/reports/tiktok-engagement",
  },
  {
    id: 4,
    title: "Brand affinity correlates with price",
    category: "Survey",
    confidence: 89,
    icon: Lightbulb,
    isNew: false,
    href: "/dashboard/reports/brand-affinity",
  },
]

export function InsightsPanel() {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">Top Insights</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {insights.filter((i) => i.isNew).length} new
          </Badge>
        </div>
        <Link href="/dashboard/reports">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((insight) => (
          <Link key={insight.id} href={insight.href}>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-accent/30 transition-all cursor-pointer group">
              <div className="p-1.5 rounded-md bg-accent/10 mt-0.5">
                <insight.icon className="h-3.5 w-3.5 text-accent" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground leading-tight group-hover:text-accent transition-colors">
                    {insight.title}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {insight.isNew && <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5" />}
                    <ArrowRight className="h-3 w-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{insight.category}</span>
                  <span>·</span>
                  <span className="text-emerald-400">{insight.confidence}% confidence</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
