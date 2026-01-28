"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Loader2, Target } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export default function NewBrandTrackingPage() {
  const router = useRouter()
  const t = useTranslations("dashboard.brandTracking.new")
  const [isLoading, setIsLoading] = useState(false)
  const [brandName, setBrandName] = useState("")
  const [description, setDescription] = useState("")
  const [industry, setIndustry] = useState("")
  const [competitors, setCompetitors] = useState<string[]>([])
  const [competitorInput, setCompetitorInput] = useState("")
  const [schedule, setSchedule] = useState("daily")

  const handleAddCompetitor = () => {
    if (competitorInput.trim() && !competitors.includes(competitorInput.trim())) {
      setCompetitors([...competitors, competitorInput.trim()])
      setCompetitorInput("")
    }
  }

  const handleRemoveCompetitor = (competitor: string) => {
    setCompetitors(competitors.filter(c => c !== competitor))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/v1/brand-tracking', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          description,
          industry,
          competitors,
          schedule: schedule === 'manual' ? undefined : `0 0 * * *`, // daily at midnight
          metrics: {
            trackAwareness: true,
            trackConsideration: true,
            trackPreference: true,
            trackLoyalty: true,
            trackNPS: true,
            trackSentiment: true,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/dashboard/brand-tracking/${data.id}`)
      } else {
        console.error('Failed to create brand tracking')
      }
    } catch (error) {
      console.error('Error creating brand tracking:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/brand-tracking">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t("brandInfo.title")}</CardTitle>
            <CardDescription>
              {t("brandInfo.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brandName">{t("brandInfo.brandNameLabel")}</Label>
              <Input
                id="brandName"
                placeholder={t("brandInfo.brandNamePlaceholder")}
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("brandInfo.descriptionLabel")}</Label>
              <Textarea
                id="description"
                placeholder={t("brandInfo.descriptionPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">{t("brandInfo.industryLabel")}</Label>
                <Input
                  id="industry"
                  placeholder={t("brandInfo.industryPlaceholder")}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">{t("brandInfo.frequencyLabel")}</Label>
                <Select value={schedule} onValueChange={setSchedule}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t("frequency.daily")}</SelectItem>
                    <SelectItem value="weekly">{t("frequency.weekly")}</SelectItem>
                    <SelectItem value="monthly">{t("frequency.monthly")}</SelectItem>
                    <SelectItem value="manual">{t("frequency.manual")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitors">{t("competitors.label")}</Label>
              <div className="flex gap-2">
                <Input
                  id="competitors"
                  placeholder={t("competitors.placeholder")}
                  value={competitorInput}
                  onChange={(e) => setCompetitorInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCompetitor())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCompetitor}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {competitors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {competitors.map((competitor) => (
                    <Badge key={competitor} variant="secondary" className="gap-1">
                      {competitor}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetitor(competitor)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-3">{t("metrics.title")}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">{t("metrics.awareness")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">{t("metrics.consideration")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">{t("metrics.preference")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">{t("metrics.loyalty")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">{t("metrics.nps")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">{t("metrics.sentiment")}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/brand-tracking">{t("actions.cancel")}</Link>
              </Button>
              <Button type="submit" disabled={isLoading || !brandName}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("actions.create")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
