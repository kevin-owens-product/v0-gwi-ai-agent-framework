"use client"

import { useTranslations } from "next-intl"

export function StatsSection() {
  const t = useTranslations("landing.stats")

  const stats = [
    { value: "3B", labelKey: "consumersRepresented" },
    { value: "50+", labelKey: "marketsWorldwide" },
    { value: "200K+", labelKey: "profilingDataPoints" },
    { value: "750+", labelKey: "teamMembersGlobally" },
  ]

  return (
    <section className="py-24 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.labelKey} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{t(stat.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
