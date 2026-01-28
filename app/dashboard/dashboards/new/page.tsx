"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, BarChart3, LineChart, PieChart, Plus, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

const availableCharts = [
  { id: "1", name: "Social Media Usage by Age", type: "bar" as const },
  { id: "2", name: "Purchase Intent Trends", type: "line" as const },
  { id: "3", name: "Brand Awareness Comparison", type: "bar" as const },
  { id: "4", name: "Market Share Distribution", type: "pie" as const },
  { id: "5", name: "Engagement Over Time", type: "line" as const },
  { id: "6", name: "Audience Demographics", type: "pie" as const },
]

const ChartIcon = ({ type }: { type: "bar" | "line" | "pie" }) => {
  switch (type) {
    case "line":
      return <LineChart className="h-5 w-5" />
    case "pie":
      return <PieChart className="h-5 w-5" />
    default:
      return <BarChart3 className="h-5 w-5" />
  }
}

export default function NewDashboardPage() {
  const t = useTranslations('dashboard.dashboards.new')
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCharts, setSelectedCharts] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const toggleChart = (chartId: string) => {
    setSelectedCharts((prev) =>
      prev.includes(chartId) ? prev.filter((id) => id !== chartId) : [...prev, chartId]
    )
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      setError(t('validation.enterName'))
      return
    }
    if (selectedCharts.length === 0) {
      setError(t('validation.selectChart'))
      return
    }
    setIsSaving(true)
    setError("")
    try {
      const response = await fetch("/api/v1/dashboards", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          charts: selectedCharts,
          isPublic,
        }),
      })
      if (response.ok) {
        router.push("/dashboard/dashboards")
      } else {
        setError(t('errors.createFailed'))
      }
    } catch (err) {
      console.error("Failed to create dashboard:", err)
      setError(t('errors.createFailedRetry'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/dashboards">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <Label htmlFor="name">{t('form.dashboardName')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('form.dashboardNamePlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="description">{t('form.descriptionLabel')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('form.descriptionPlaceholder')}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>{t('form.publicDashboard')}</Label>
                <p className="text-sm text-muted-foreground">{t('form.publicDescription')}</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t('form.addCharts')}</Label>
              <span className="text-sm text-muted-foreground">{t('form.selectedCount', { count: selectedCharts.length })}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {availableCharts.map((chart) => (
                <button
                  key={chart.id}
                  onClick={() => toggleChart(chart.id)}
                  className={`flex items-center gap-3 p-3 border rounded-lg text-left transition-colors ${
                    selectedCharts.includes(chart.id)
                      ? "border-accent bg-accent/10"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <div className="p-2 bg-muted rounded-lg">
                    <ChartIcon type={chart.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{chart.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{t('form.chartType', { type: chart.type })}</p>
                  </div>
                  {selectedCharts.includes(chart.id) && (
                    <Badge variant="secondary" className="shrink-0">{t('form.added')}</Badge>
                  )}
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              {t('form.createNewChart')}
            </Button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">{t('preview.title')}</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('preview.name')}</p>
                <p className="font-medium">{name || t('preview.untitledDashboard')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('preview.chartsCount', { count: selectedCharts.length })}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCharts.map((chartId) => {
                    const chart = availableCharts.find((c) => c.id === chartId)
                    return chart ? (
                      <Badge key={chartId} variant="secondary" className="text-xs">
                        {chart.name}
                        <button
                          onClick={() => toggleChart(chartId)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                  {selectedCharts.length === 0 && (
                    <p className="text-sm text-muted-foreground">{t('preview.noChartsSelected')}</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('preview.visibility')}</p>
                <Badge variant={isPublic ? "default" : "secondary"}>
                  {isPublic ? t('preview.public') : t('preview.private')}
                </Badge>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={isSaving}
            >
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('buttons.creating')}</> : t('buttons.createDashboard')}
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => router.back()} disabled={isSaving}>
              {t('buttons.cancel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
