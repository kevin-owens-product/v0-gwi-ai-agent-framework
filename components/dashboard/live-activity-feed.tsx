"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Play, AlertTriangle, Clock, ArrowRight, Bot, Sparkles, Inbox } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

interface Activity {
  id: string
  type: "completed" | "running" | "warning" | "scheduled"
  title: string
  agent: string
  time: string
  insights?: number
  href: string
  progress?: number
  message?: string
}

interface LiveActivityFeedProps {
  activities?: Activity[]
}

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

const typeIcons = {
  completed: CheckCircle2,
  running: Play,
  warning: AlertTriangle,
  scheduled: Clock,
}

export function LiveActivityFeed({ activities = [] }: LiveActivityFeedProps) {
  const t = useTranslations('dashboard.activity')
  const tCommon = useTranslations('common')

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">{t('liveActivity')}</CardTitle>
          {activities.length > 0 && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
        </div>
        <Link href="/dashboard/agents">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            {tCommon('viewAll')}
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Inbox className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">{t('noRecentActivity')}</p>
            <p className="text-xs">{t('runAgentToSeeActivity')}</p>
          </div>
        ) : (
          activities.map((activity) => {
            const styles = typeStyles[activity.type]
            const Icon = typeIcons[activity.type]
            return (
              <Link key={activity.id} href={activity.href}>
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-accent/30 transition-all cursor-pointer group">
                  <div className={`p-2 rounded-lg ${styles.bg} mt-0.5`}>
                    <Icon className={`h-4 w-4 ${styles.icon}`} />
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

                    {activity.type === "running" && activity.progress !== undefined && (
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

                  {activity.insights !== undefined && activity.insights > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3" />
                      <span>{activity.insights}</span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
