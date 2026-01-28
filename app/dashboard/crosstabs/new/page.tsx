"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ArrowLeft, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function NewCrosstabPage() {
  const t = useTranslations('dashboard.crosstabs.new')
  const router = useRouter()
  const [name, setName] = useState("")
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    if (!name.trim()) {
      setError(t('errors.nameRequired'))
      return
    }
    if (selectedAudiences.length === 0) {
      setError(t('errors.audienceRequired'))
      return
    }
    if (selectedMetrics.length === 0) {
      setError(t('errors.metricRequired'))
      return
    }
    setIsSaving(true)
    setError("")
    try {
      const response = await fetch("/api/v1/crosstabs", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), audiences: selectedAudiences, metrics: selectedMetrics }),
      })
      if (response.ok) {
        router.push("/dashboard/crosstabs")
      } else {
        setError(t('errors.createFailed'))
      }
    } catch (err) {
      console.error("Failed to create crosstab:", err)
      setError(t('errors.createFailedRetry'))
    } finally {
      setIsSaving(false)
    }
  }

  const availableAudiences = [
    "Eco-Conscious Millennials",
    "Tech Early Adopters",
    "Gen Z Content Creators",
    "Budget-Conscious Shoppers",
  ]

  const availableMetrics = [
    "Social Media Usage",
    "Purchase Intent",
    "Brand Awareness",
    "Media Consumption",
    "Values & Attitudes",
    "Lifestyle & Interests",
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/crosstabs">
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
              <Label htmlFor="name">{t('form.crosstabName')}</Label>
              <Input id="name" placeholder={t('form.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t('form.selectAudiences')}</Label>
              <span className="text-sm text-muted-foreground">{t('form.selected', { count: selectedAudiences.length })}</span>
            </div>
            <div className="space-y-2">
              {availableAudiences.map((audience) => (
                <label
                  key={audience}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={selectedAudiences.includes(audience)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAudiences([...selectedAudiences, audience])
                      } else {
                        setSelectedAudiences(selectedAudiences.filter((a) => a !== audience))
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <span>{audience}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t('form.selectMetrics')}</Label>
              <span className="text-sm text-muted-foreground">{t('form.selected', { count: selectedMetrics.length })}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availableMetrics.map((metric) => (
                <label
                  key={metric}
                  className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMetrics([...selectedMetrics, metric])
                      } else {
                        setSelectedMetrics(selectedMetrics.filter((m) => m !== metric))
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{metric}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">{t('summary.title')}</h3>
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t('summary.audiences', { count: selectedAudiences.length })}</p>
              <div className="flex flex-wrap gap-2">
                {selectedAudiences.map((audience) => (
                  <Badge key={audience} variant="secondary">
                    {audience}
                    <button
                      onClick={() => setSelectedAudiences(selectedAudiences.filter((a) => a !== audience))}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t('summary.metrics', { count: selectedMetrics.length })}</p>
              <div className="flex flex-wrap gap-2">
                {selectedMetrics.map((metric) => (
                  <Badge key={metric} variant="secondary">
                    {metric}
                    <button
                      onClick={() => setSelectedMetrics(selectedMetrics.filter((m) => m !== metric))}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={handleCreate} disabled={isSaving}>
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('actions.generating')}</> : t('actions.generate')}
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => router.back()} disabled={isSaving}>
              {t('actions.cancel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
