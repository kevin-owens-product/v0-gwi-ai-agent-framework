"use client"

import { useState } from "react"
import { FileText, Presentation, BarChart3, Table, Download, Share2, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function ReportsSection() {
  const t = useTranslations("landing.reports")
  const [activeType, setActiveType] = useState("presentation")

  const outputTypes = [
    { id: "presentation", icon: Presentation, name: t("presentations"), description: t("presentationsDesc") },
    { id: "dashboard", icon: BarChart3, name: t("dashboards"), description: t("dashboardsDesc") },
    { id: "report", icon: FileText, name: t("reports"), description: t("reportsDesc") },
    { id: "data", icon: Table, name: t("dataExports"), description: t("dataExportsDesc") },
  ]

  const templates = [
    t("templatePersona"),
    t("templateSegment"),
    t("templateMarket"),
    t("templateTrend"),
    t("templateCompetitive"),
    t("templateBrand"),
  ]

  return (
    <section className="py-24 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm text-accent mb-6">
            <FileText className="h-3 w-3" />
            {t("badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("title")}
            <br />
            <span className="text-muted-foreground">{t("titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-chart-3/60" />
                  <div className="w-3 h-3 rounded-full bg-chart-5/60" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">{t("badge")}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  {outputTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setActiveType(type.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeType === type.id
                          ? "bg-accent/20 text-accent"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <type.icon className="h-4 w-4" />
                      {type.name}
                    </button>
                  ))}
                </div>

                {activeType === "presentation" && (
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((slide) => (
                      <div
                        key={slide}
                        className="aspect-video rounded-lg border border-border bg-secondary/50 p-3 flex flex-col"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="h-2 w-3/4 bg-muted-foreground/20 rounded" />
                          <div className="h-2 w-1/2 bg-muted-foreground/20 rounded" />
                          {slide === 2 && (
                            <div className="flex gap-1 mt-2">
                              {[30, 50, 40, 60].map((h, i) => (
                                <div key={i} className="flex-1 bg-accent/40 rounded" style={{ height: `${h}%` }} />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-2">{t("slide")} {slide}</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeType === "dashboard" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border bg-secondary/50 p-4">
                      <div className="text-xs text-muted-foreground mb-2">{t("audienceSize")}</div>
                      <div className="text-2xl font-bold text-foreground">2.4M</div>
                      <div className="text-xs text-chart-5">{t("vsLastPeriod")}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/50 p-4">
                      <div className="text-xs text-muted-foreground mb-2">{t("engagement")}</div>
                      <div className="h-12 flex items-end gap-1">
                        {[40, 65, 45, 80, 55, 70, 85].map((h, i) => (
                          <div key={i} className="flex-1 bg-chart-2/60 rounded-t" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeType === "report" && (
                  <div className="rounded-lg border border-border bg-secondary/50 p-4 space-y-3">
                    <div className="h-3 w-1/3 bg-muted-foreground/30 rounded" />
                    <div className="h-2 w-full bg-muted-foreground/20 rounded" />
                    <div className="h-2 w-full bg-muted-foreground/20 rounded" />
                    <div className="h-2 w-4/5 bg-muted-foreground/20 rounded" />
                    <div className="h-24 w-full bg-chart-3/20 rounded mt-4" />
                  </div>
                )}

                {activeType === "data" && (
                  <div className="rounded-lg border border-border bg-secondary/50 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left text-muted-foreground">{t("segment")}</th>
                          <th className="px-3 py-2 text-left text-muted-foreground">{t("size")}</th>
                          <th className="px-3 py-2 text-left text-muted-foreground">{t("index")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[t("ecoWarriors"), t("digitalNatives"), t("valueSeekers")].map((seg) => (
                          <tr key={seg}>
                            <td className="px-3 py-2 text-foreground">{seg}</td>
                            <td className="px-3 py-2 text-muted-foreground">1.2M</td>
                            <td className="px-3 py-2 text-chart-5">142</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                      <Sparkles className="h-3 w-3" />
                      {t("aiEnhance")}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                      <Download className="h-3 w-3" />
                      {t("export")}
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <Share2 className="h-3 w-3" />
                    {t("share")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-4">{t("prebuiltTemplates")}</h3>
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-muted-foreground">{template}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                ))}
              </div>
            </div>

            <Link href="/dashboard/reports">
              <Button className="w-full gap-2">
                {t("openReportBuilder")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
