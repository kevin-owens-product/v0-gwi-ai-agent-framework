"use client"

import {
  Workflow,
  Brain,
  Shield,
  FileText,
  BarChart3,
  Layers,
  LayoutGrid,
  Users,
  Zap,
  Lock,
  Clock,
  RefreshCw,
} from "lucide-react"
import { useTranslations } from "next-intl"

const featureKeys = [
  { icon: Zap, key: "realLlmExecution", isNew: true },
  { icon: FileText, key: "multiFormatReports", isNew: true },
  { icon: Clock, key: "scheduledWorkflows", isNew: true },
  { icon: Lock, key: "ssoSaml", isNew: true },
  { icon: Layers, key: "integrationsHub", isNew: true },
  { icon: RefreshCw, key: "enterpriseReliability", isNew: true },
  { icon: BarChart3, key: "advancedAnalytics", isNew: true },
  { icon: Brain, key: "contextAwareAgents", isNew: true },
  { icon: LayoutGrid, key: "multiModePlayground", isNew: false },
  { icon: Workflow, key: "visualWorkflowBuilder", isNew: false },
  { icon: Shield, key: "verifiedInsights", isNew: false },
  { icon: Users, key: "teamCollaboration", isNew: false },
]

export function FeaturesSection() {
  const t = useTranslations("landing.features")

  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("title")}
            <br />
            <span className="text-muted-foreground">{t("titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureKeys.map((feature) => (
            <div
              key={feature.key}
              className="group rounded-xl border border-border bg-card p-6 hover:border-accent/50 hover:bg-card/80 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                {feature.isNew && (
                  <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">{t("new")}</span>
                )}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t(feature.key)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(`${feature.key}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
