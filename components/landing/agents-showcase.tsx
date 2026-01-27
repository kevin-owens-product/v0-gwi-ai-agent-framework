"use client"

import { Users, Lightbulb, Target, TrendingUp, Heart, Globe } from "lucide-react"
import { useTranslations } from "next-intl"

const agentKeys = [
  { icon: Users, key: "audienceExplorer", color: "bg-chart-1/20 text-chart-1" },
  { icon: Lightbulb, key: "personaArchitect", color: "bg-chart-2/20 text-chart-2" },
  { icon: Target, key: "motivationDecoder", color: "bg-chart-3/20 text-chart-3" },
  { icon: TrendingUp, key: "cultureTracker", color: "bg-chart-4/20 text-chart-4" },
  { icon: Heart, key: "brandRelationshipAnalyst", color: "bg-chart-5/20 text-chart-5" },
  { icon: Globe, key: "globalPerspectiveAgent", color: "bg-accent/20 text-accent" },
]

export function AgentsShowcase() {
  const t = useTranslations("landing.agents")

  return (
    <section id="agents" className="py-24 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t("title")}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentKeys.map((agent) => (
            <div
              key={agent.key}
              className="rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${agent.color} flex items-center justify-center mb-4`}>
                <agent.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">{t(agent.key)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(`${agent.key}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
