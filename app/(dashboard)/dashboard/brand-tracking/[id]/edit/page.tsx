"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Save,
  Loader2,
  Target,
  Plus,
  X,
  AlertCircle,
  Calendar,
  Users,
  BarChart3,
} from "lucide-react"

interface BrandTrackingData {
  id: string
  brandName: string
  description: string | null
  industry: string | null
  status: string
  competitors: string[]
  audiences: string[]
  schedule: string | null
  metrics: {
    trackAwareness?: boolean
    trackConsideration?: boolean
    trackPreference?: boolean
    trackLoyalty?: boolean
    trackNPS?: boolean
    trackSentiment?: boolean
    trackMarketShare?: boolean
  } | null
  trackingConfig: {
    dateRange?: {
      start: string
      end: string
    }
    frequency?: string
  } | null
  alertThresholds: {
    awarenessMin?: number
    npsMin?: number
    sentimentMin?: number
  } | null
}

const industries = [
  "Technology",
  "Sportswear",
  "Automotive",
  "Beverages",
  "Food & Dining",
  "Retail",
  "Financial Services",
  "Healthcare",
  "Entertainment",
  "Travel & Hospitality",
  "Consumer Electronics",
  "Fashion & Apparel",
  "Other",
]

const audienceOptions = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
  "Male",
  "Female",
  "Urban",
  "Suburban",
  "Rural",
  "High Income",
  "Middle Income",
  "Tech Early Adopters",
  "Eco-Conscious",
  "Athletes",
  "Parents",
  "Students",
]

export default function EditBrandTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { status: sessionStatus } = useSession()
  const t = useTranslations("dashboard.brandTracking.edit")
  const tCommon = useTranslations("common")

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  // Form state
  const [brandName, setBrandName] = useState("")
  const [description, setDescription] = useState("")
  const [industry, setIndustry] = useState("")
  const [studyStatus, setStudyStatus] = useState("ACTIVE")
  const [competitors, setCompetitors] = useState<string[]>([])
  const [competitorInput, setCompetitorInput] = useState("")
  const [audiences, setAudiences] = useState<string[]>([])
  const [schedule, setSchedule] = useState("daily")

  // Metrics toggles
  const [trackAwareness, setTrackAwareness] = useState(true)
  const [trackConsideration, setTrackConsideration] = useState(true)
  const [trackPreference, setTrackPreference] = useState(true)
  const [trackLoyalty, setTrackLoyalty] = useState(true)
  const [trackNPS, setTrackNPS] = useState(true)
  const [trackSentiment, setTrackSentiment] = useState(true)
  const [trackMarketShare, setTrackMarketShare] = useState(false)

  // Date range
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Alert thresholds
  const [enableAlerts, setEnableAlerts] = useState(false)
  const [awarenessThreshold, setAwarenessThreshold] = useState("50")
  const [npsThreshold, setNpsThreshold] = useState("0")

  useEffect(() => {
    if (sessionStatus === "loading") return
    if (sessionStatus === "unauthenticated") {
      router.push("/login")
      return
    }
    fetchBrandTracking()
  }, [id, sessionStatus])

  async function fetchBrandTracking() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/v1/brand-tracking/${id}`)

      if (response.status === 404) {
        setNotFound(true)
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch brand tracking")
      }

      const data: BrandTrackingData = await response.json()

      // Populate form fields
      setBrandName(data.brandName)
      setDescription(data.description || "")
      setIndustry(data.industry || "")
      setStudyStatus(data.status)
      setCompetitors(Array.isArray(data.competitors) ? data.competitors : [])
      setAudiences(Array.isArray(data.audiences) ? data.audiences : [])

      // Parse schedule
      if (data.schedule) {
        if (data.schedule.includes("0 0 * * *")) setSchedule("daily")
        else if (data.schedule.includes("0 0 * * 0")) setSchedule("weekly")
        else if (data.schedule.includes("0 0 1 * *")) setSchedule("monthly")
        else setSchedule("manual")
      } else {
        setSchedule("manual")
      }

      // Parse metrics
      if (data.metrics) {
        setTrackAwareness(data.metrics.trackAwareness ?? true)
        setTrackConsideration(data.metrics.trackConsideration ?? true)
        setTrackPreference(data.metrics.trackPreference ?? true)
        setTrackLoyalty(data.metrics.trackLoyalty ?? true)
        setTrackNPS(data.metrics.trackNPS ?? true)
        setTrackSentiment(data.metrics.trackSentiment ?? true)
        setTrackMarketShare(data.metrics.trackMarketShare ?? false)
      }

      // Parse tracking config
      if (data.trackingConfig?.dateRange) {
        setStartDate(data.trackingConfig.dateRange.start || "")
        setEndDate(data.trackingConfig.dateRange.end || "")
      }

      // Parse alert thresholds
      if (data.alertThresholds) {
        setEnableAlerts(true)
        setAwarenessThreshold(String(data.alertThresholds.awarenessMin ?? 50))
        setNpsThreshold(String(data.alertThresholds.npsMin ?? 0))
      }
    } catch (err) {
      console.error("Error fetching brand tracking:", err)
      setError(err instanceof Error ? err.message : "Failed to load brand tracking study")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCompetitor = () => {
    const trimmed = competitorInput.trim()
    if (trimmed && !competitors.includes(trimmed)) {
      setCompetitors([...competitors, trimmed])
      setCompetitorInput("")
    }
  }

  const handleRemoveCompetitor = (competitor: string) => {
    setCompetitors(competitors.filter((c) => c !== competitor))
  }

  const handleToggleAudience = (audience: string) => {
    if (audiences.includes(audience)) {
      setAudiences(audiences.filter((a) => a !== audience))
    } else {
      setAudiences([...audiences, audience])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      // Build schedule cron expression
      let scheduleCron: string | undefined
      switch (schedule) {
        case "daily":
          scheduleCron = "0 0 * * *"
          break
        case "weekly":
          scheduleCron = "0 0 * * 0"
          break
        case "monthly":
          scheduleCron = "0 0 1 * *"
          break
        default:
          scheduleCron = undefined
      }

      const payload = {
        brandName,
        description: description || null,
        industry: industry || null,
        status: studyStatus,
        competitors,
        audiences,
        schedule: scheduleCron,
        metrics: {
          trackAwareness,
          trackConsideration,
          trackPreference,
          trackLoyalty,
          trackNPS,
          trackSentiment,
          trackMarketShare,
        },
        trackingConfig: {
          dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined,
          frequency: schedule,
        },
        alertThresholds: enableAlerts
          ? {
              awarenessMin: parseInt(awarenessThreshold) || 50,
              npsMin: parseInt(npsThreshold) || 0,
            }
          : null,
      }

      const response = await fetch(`/api/v1/brand-tracking/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update brand tracking")
      }

      router.push(`/dashboard/brand-tracking/${id}`)
    } catch (err) {
      console.error("Error updating brand tracking:", err)
      setError(err instanceof Error ? err.message : "Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">{t("notFound")}</h3>
        <p className="text-muted-foreground mt-2">
          {t("notFoundDescription")}
        </p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/brand-tracking">{t("backToBrandTracking")}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/brand-tracking/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            </div>
            <p className="text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/brand-tracking/${id}`)}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || !brandName} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("saveChanges")}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>{t("basicInfo.title")}</CardTitle>
            <CardDescription>{t("basicInfo.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brandName">{t("basicInfo.brandName")} *</Label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder={t("basicInfo.brandNamePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{tCommon("description")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("basicInfo.descriptionPlaceholder")}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">{t("basicInfo.industry")}</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("basicInfo.selectIndustry")} />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{tCommon("status")}</Label>
                <Select value={studyStatus} onValueChange={setStudyStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("basicInfo.selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">{t("statuses.draft")}</SelectItem>
                    <SelectItem value="ACTIVE">{t("statuses.active")}</SelectItem>
                    <SelectItem value="PAUSED">{t("statuses.paused")}</SelectItem>
                    <SelectItem value="ARCHIVED">{t("statuses.archived")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitors */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("competitors.title")}
            </CardTitle>
            <CardDescription>
              {t("competitors.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t("competitors.addPlaceholder")}
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddCompetitor()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddCompetitor}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {competitors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {competitors.map((competitor) => (
                  <Badge key={competitor} variant="secondary" className="gap-1 pr-1">
                    {competitor}
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetitor(competitor)}
                      className="ml-1 hover:text-destructive rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {competitors.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("competitors.noCompetitors")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Target Audiences */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("audiences.title")}
            </CardTitle>
            <CardDescription>
              {t("audiences.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {audienceOptions.map((audience) => (
                <div key={audience} className="flex items-center space-x-2">
                  <Checkbox
                    id={`audience-${audience}`}
                    checked={audiences.includes(audience)}
                    onCheckedChange={() => handleToggleAudience(audience)}
                  />
                  <Label
                    htmlFor={`audience-${audience}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {audience}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Metrics to Track */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("metrics.title")}
            </CardTitle>
            <CardDescription>
              {t("metrics.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("metrics.awareness")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("metrics.awarenessDesc")}
                  </p>
                </div>
                <Switch checked={trackAwareness} onCheckedChange={setTrackAwareness} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("metrics.consideration")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("metrics.considerationDesc")}
                  </p>
                </div>
                <Switch checked={trackConsideration} onCheckedChange={setTrackConsideration} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("metrics.preference")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("metrics.preferenceDesc")}
                  </p>
                </div>
                <Switch checked={trackPreference} onCheckedChange={setTrackPreference} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("metrics.loyalty")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("metrics.loyaltyDesc")}
                  </p>
                </div>
                <Switch checked={trackLoyalty} onCheckedChange={setTrackLoyalty} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("metrics.nps")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("metrics.npsDesc")}
                  </p>
                </div>
                <Switch checked={trackNPS} onCheckedChange={setTrackNPS} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("metrics.sentiment")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("metrics.sentimentDesc")}
                  </p>
                </div>
                <Switch checked={trackSentiment} onCheckedChange={setTrackSentiment} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("metrics.marketShare")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("metrics.marketShareDesc")}
                  </p>
                </div>
                <Switch checked={trackMarketShare} onCheckedChange={setTrackMarketShare} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Date Range */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("schedule.title")}
            </CardTitle>
            <CardDescription>
              {t("schedule.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schedule">{t("schedule.frequency")}</Label>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger>
                  <SelectValue placeholder={t("schedule.selectFrequency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t("schedule.frequencies.daily")}</SelectItem>
                  <SelectItem value="weekly">{t("schedule.frequencies.weekly")}</SelectItem>
                  <SelectItem value="monthly">{t("schedule.frequencies.monthly")}</SelectItem>
                  <SelectItem value="manual">{t("schedule.frequencies.manual")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t("schedule.startDate")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t("schedule.endDate")}</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Thresholds */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t("alerts.title")}
            </CardTitle>
            <CardDescription>
              {t("alerts.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("alerts.enable")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("alerts.enableDesc")}
                </p>
              </div>
              <Switch checked={enableAlerts} onCheckedChange={setEnableAlerts} />
            </div>

            {enableAlerts && (
              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="awarenessThreshold">{t("alerts.minAwareness")}</Label>
                  <Input
                    id="awarenessThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={awarenessThreshold}
                    onChange={(e) => setAwarenessThreshold(e.target.value)}
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="npsThreshold">{t("alerts.minNPS")}</Label>
                  <Input
                    id="npsThreshold"
                    type="number"
                    min="-100"
                    max="100"
                    value={npsThreshold}
                    onChange={(e) => setNpsThreshold(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href={`/dashboard/brand-tracking/${id}`}>{tCommon("cancel")}</Link>
          </Button>
          <Button type="submit" disabled={isSaving || !brandName}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  )
}
