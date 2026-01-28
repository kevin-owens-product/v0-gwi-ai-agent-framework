"use client"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, FileText, Play, MessageSquare } from "lucide-react"

export function TeamActivity() {
  const t = useTranslations("dashboard.analytics.teamActivity")
  
  const activities = [
    {
      user: { name: "Sarah Chen", avatar: "/placeholder.svg?key=yxbk2" },
      action: t("actions.generatedReport"),
      target: "Q4 Consumer Insights",
      time: "2 hours ago",
      icon: FileText,
    },
    {
      user: { name: "Michael Park", avatar: "/placeholder.svg?key=b4qmf" },
      action: t("actions.ranWorkflow"),
      target: "Weekly Competitor Analysis",
      time: "3 hours ago",
      icon: Play,
    },
    {
      user: { name: "Emily Johnson", avatar: "/placeholder.svg?key=xjh3d" },
      action: t("actions.createdAgent"),
      target: "Custom Segment Analyzer",
      time: "5 hours ago",
      icon: Bot,
    },
    {
      user: { name: "James Wilson", avatar: "/placeholder.svg?key=80i11" },
      action: t("actions.queriedAgent"),
      target: "Audience Strategy Agent",
      time: "6 hours ago",
      icon: MessageSquare,
    },
    {
      user: { name: "Lisa Wang", avatar: "/placeholder.svg?key=z2bqt" },
      action: t("actions.sharedReport"),
      target: "Beauty Industry Trends",
      time: "8 hours ago",
      icon: FileText,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {activity.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">{activity.user.name}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>
              </p>
              <div className="flex items-center gap-2">
                <activity.icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{activity.target}</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
