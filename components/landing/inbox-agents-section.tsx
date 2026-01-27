"use client"

import { useState } from "react"
import { Inbox, Mail, MessageSquare, Clock, CheckCircle2, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function InboxAgentsSection() {
  const t = useTranslations("landing.inbox")
  const [activeChannel, setActiveChannel] = useState("all")

  const channels = [
    { id: "slack", name: t("slack"), icon: MessageSquare, color: "bg-chart-1" },
    { id: "email", name: t("email"), icon: Mail, color: "bg-chart-2" },
  ]

  const exampleRequests = [
    {
      channel: "slack",
      from: t("request1From"),
      message: t("request1Message"),
      status: "completed",
      time: "2 min ago",
    },
    {
      channel: "email",
      from: t("request2From"),
      message: t("request2Message"),
      status: "processing",
      time: "Just now",
    },
    {
      channel: "slack",
      from: t("request3From"),
      message: t("request3Message"),
      status: "pending",
      time: "5 min ago",
    },
  ]

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Inbox className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">{t("badge")}</span>
                </div>
                <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                  <button
                    onClick={() => setActiveChannel("all")}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      activeChannel === "all" ? "bg-background text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t("all")}
                  </button>
                  {channels.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChannel(ch.id)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        activeChannel === ch.id ? "bg-background text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {ch.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-border">
                {exampleRequests
                  .filter((r) => activeChannel === "all" || r.channel === activeChannel)
                  .map((request, i) => (
                    <div key={i} className="p-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg ${
                            request.channel === "slack" ? "bg-chart-1/20" : "bg-chart-2/20"
                          } flex items-center justify-center flex-shrink-0`}
                        >
                          {request.channel === "slack" ? (
                            <MessageSquare className="h-4 w-4 text-chart-1" />
                          ) : (
                            <Mail className="h-4 w-4 text-chart-2" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{request.from}</span>
                            <span className="text-xs text-muted-foreground">{request.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{request.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {request.status === "completed" && (
                              <span className="flex items-center gap-1 text-xs text-chart-5">
                                <CheckCircle2 className="h-3 w-3" />
                                {t("completed")}
                              </span>
                            )}
                            {request.status === "processing" && (
                              <span className="flex items-center gap-1 text-xs text-accent">
                                <Zap className="h-3 w-3 animate-pulse" />
                                {t("processing")}
                              </span>
                            )}
                            {request.status === "pending" && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {t("pendingReview")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm text-accent mb-6">
              <Inbox className="h-3 w-3" />
              {t("badge")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t("title")}
              <br />
              <span className="text-muted-foreground">{t("titleHighlight")}</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              {t("subtitle")}
            </p>
            <ul className="space-y-3 mb-8">
              {[t("feature1"), t("feature2"), t("feature3"), t("feature4")].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-chart-5 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard/inbox">
              <Button className="gap-2">
                {t("setupButton")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
