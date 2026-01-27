"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, BarChart3, LineChart, PieChart, Loader2, Circle, Activity, Target, Triangle, Grid3X3, GitBranch } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChartRenderer, generateSampleData } from "@/components/charts"
import type { ChartType } from "@/components/charts"
import { useTranslations } from "next-intl"

export default function NewChartPage() {
  const router = useRouter()
  const t = useTranslations("dashboard.charts.new")
  const [chartType, setChartType] = useState<ChartType>("BAR")
  const [chartName, setChartName] = useState("")
  const [selectedAudience, setSelectedAudience] = useState("")
  const [selectedMetric, setSelectedMetric] = useState("")
  const [timePeriod, setTimePeriod] = useState("12m")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    if (!chartName.trim()) {
      setError("Please enter a chart name")
      return
    }
    setIsSaving(true)
    setError("")
    try {
      const response = await fetch("/api/v1/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: chartName.trim(),
          type: chartType,
          config: {
            audienceId: selectedAudience,
            metric: selectedMetric,
            timePeriod,
          },
        }),
      })
      if (response.ok) {
        router.push("/dashboard/charts")
      } else {
        setError("Failed to create chart")
      }
    } catch (err) {
      console.error("Failed to create chart:", err)
      setError("Failed to create chart. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/charts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <Label>{t("chartType.title")}</Label>
              <div className="grid grid-cols-5 gap-3 mt-2">
                <button
                  onClick={() => setChartType("BAR")}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 hover:bg-accent transition-colors ${
                    chartType === "BAR" ? "border-primary bg-accent" : ""
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-xs">Bar</span>
                </button>
                <button
                  onClick={() => setChartType("LINE")}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 hover:bg-accent transition-colors ${
                    chartType === "LINE" ? "border-primary bg-accent" : ""
                  }`}
                >
                  <LineChart className="h-5 w-5" />
                  <span className="text-xs">Line</span>
                </button>
                <button
                  onClick={() => setChartType("AREA")}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 hover:bg-accent transition-colors ${
                    chartType === "AREA" ? "border-primary bg-accent" : ""
                  }`}
                >
                  <Activity className="h-5 w-5" />
                  <span className="text-xs">Area</span>
                </button>
                <button
                  onClick={() => setChartType("PIE")}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 hover:bg-accent transition-colors ${
                    chartType === "PIE" ? "border-primary bg-accent" : ""
                  }`}
                >
                  <PieChart className="h-5 w-5" />
                  <span className="text-xs">Pie</span>
                </button>
                <button
                  onClick={() => setChartType("DONUT")}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 hover:bg-accent transition-colors ${
                    chartType === "DONUT" ? "border-primary bg-accent" : ""
                  }`}
                >
                  <Circle className="h-5 w-5" />
                  <span className="text-xs">Donut</span>
                </button>
                <button
                  onClick={() => setChartType("RADAR")}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 hover:bg-accent transition-colors ${
                    chartType === "RADAR" ? "border-primary bg-accent" : ""
                  }`}
                >
                  <Target className="h-5 w-5" />
                  <span className="text-xs">Radar</span>
                </button>
                <button
                  onClick={() => setChartType("SCATTER")}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 hover:bg-accent transition-colors ${
                    chartType === "SCATTER" ? "border-primary bg-accent" : ""
                  }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                  <span className="text-xs">Scatter</span>
                </button>
                <button
                  onClick={() => setChartType("FUNNEL")}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 hover:bg-accent transition-colors ${
                    chartType === "FUNNEL" ? "border-primary bg-accent" : ""
                  }`}
                >
                  <Triangle className="h-5 w-5" />
                  <span className="text-xs">Funnel</span>
                </button>
                <button
                  onClick={() => setChartType("TREEMAP")}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 hover:bg-accent transition-colors ${
                    chartType === "TREEMAP" ? "border-primary bg-accent" : ""
                  }`}
                >
                  <GitBranch className="h-5 w-5" />
                  <span className="text-xs">Treemap</span>
                </button>
                <button
                  onClick={() => setChartType("HEATMAP")}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 hover:bg-accent transition-colors ${
                    chartType === "HEATMAP" ? "border-primary bg-accent" : ""
                  }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                  <span className="text-xs">Heatmap</span>
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="name">{t("basicInfo.chartName")}</Label>
              <Input id="name" placeholder={t("basicInfo.chartNamePlaceholder")} value={chartName} onChange={(e) => setChartName(e.target.value)} />
            </div>

            <div>
              <Label>{t("dataConfig.targetAudience")}</Label>
              <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                <SelectTrigger>
                  <SelectValue placeholder={t("dataConfig.selectAudience")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eco-millennials">Eco-Conscious Millennials</SelectItem>
                  <SelectItem value="tech-adopters">Tech Early Adopters</SelectItem>
                  <SelectItem value="genz-creators">Gen Z Content Creators</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("dataConfig.dataSource")}</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue placeholder={t("dataConfig.selectDataSource")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social-usage">Social Media Usage</SelectItem>
                  <SelectItem value="purchase-intent">Purchase Intent</SelectItem>
                  <SelectItem value="brand-awareness">Brand Awareness</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">{t("preview.title")}</h3>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <ChartRenderer
                type={chartType}
                data={generateSampleData(chartType, 6)}
                config={{
                  showLegend: true,
                  showGrid: true,
                  showTooltip: true,
                  height: 280,
                }}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">{t("dataConfig.timePeriod")}</h3>
            <div>
              <Label>{t("dataConfig.selectTimePeriod")}</Label>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Last 12 months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <div className="space-y-2">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={handleCreate} disabled={isSaving}>
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("actions.saving")}</> : t("actions.save")}
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => router.back()} disabled={isSaving}>
              {t("actions.cancel")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
