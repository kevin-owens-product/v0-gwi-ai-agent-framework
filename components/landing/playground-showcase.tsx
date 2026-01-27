"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  LayoutGrid,
  SplitSquareVertical,
  Command,
  Sparkles,
  Brain,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function PlaygroundShowcase() {
  const t = useTranslations("landing.playground")
  const [activeMode, setActiveMode] = useState("chat")

  const modes = [
    {
      id: "chat",
      icon: MessageSquare,
      title: t("chatMode"),
      description: t("chatModeDesc"),
    },
    {
      id: "canvas",
      icon: LayoutGrid,
      title: t("canvasMode"),
      description: t("canvasModeDesc"),
    },
    {
      id: "split",
      icon: SplitSquareVertical,
      title: t("splitView"),
      description: t("splitViewDesc"),
    },
  ]

  const capabilities = [
    t("cap1"),
    t("cap2"),
    t("cap3"),
    t("cap4"),
    t("cap5"),
    t("cap6"),
  ]

  const templates = [
    t("templatePersona"),
    t("templateSegment"),
    t("templateTrend"),
    t("templateBrand"),
  ]

  return (
    <section className="py-24 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm text-accent mb-6">
              <Sparkles className="h-3 w-3" />
              {t("badge")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t("title")}</h2>
            <p className="text-muted-foreground text-lg mb-8">
              {t("subtitle")}
            </p>

            <div className="space-y-3 mb-8">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                    activeMode === mode.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-muted-foreground/30 bg-card"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activeMode === mode.id ? "bg-accent/20" : "bg-secondary"
                    }`}
                  >
                    <mode.icon
                      className={`h-5 w-5 ${activeMode === mode.id ? "text-accent" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${activeMode === mode.id ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {mode.title}
                    </p>
                    <p className="text-sm text-muted-foreground/70">{mode.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <Link href="/dashboard/playground">
              <Button className="gap-2">
                {t("tryPlayground")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">{t("capabilities")}</h3>
              </div>
              <ul className="space-y-3">
                {capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-chart-5 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Command className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">{t("quickActions")}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t("quickActionsDesc")} <kbd className="px-1.5 py-0.5 rounded bg-secondary text-xs">⌘K</kbd> {t("quickActionsDescCont")}
              </p>
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <span key={template} className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded">
                    {template}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
