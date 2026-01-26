"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
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
        <h3 className="text-lg font-semibold">Brand Tracking Study Not Found</h3>
        <p className="text-muted-foreground mt-2">
          The study you are looking for does not exist or has been deleted.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/brand-tracking">Back to Brand Tracking</Link>
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
              <h1 className="text-2xl font-bold text-foreground">Edit Brand Tracking</h1>
            </div>
            <p className="text-muted-foreground">
              Modify the configuration for your brand tracking study
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/brand-tracking/${id}`)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || !brandName} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
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
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core details about the brand tracking study</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name *</Label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g., Nike, Apple, Coca-Cola"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the objectives and scope of this brand tracking study..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
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
                <Label htmlFor="status">Status</Label>
                <Select value={studyStatus} onValueChange={setStudyStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
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
              Competitors
            </CardTitle>
            <CardDescription>
              Add competitor brands to track and compare against
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add competitor name..."
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
                No competitors added yet. Add brands to compare against.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Target Audiences */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Target Audiences
            </CardTitle>
            <CardDescription>
              Select the demographic segments to track
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
              Metrics to Track
            </CardTitle>
            <CardDescription>
              Choose which brand health metrics to monitor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Brand Awareness</Label>
                  <p className="text-xs text-muted-foreground">
                    Track how many people recognize your brand
                  </p>
                </div>
                <Switch checked={trackAwareness} onCheckedChange={setTrackAwareness} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Consideration</Label>
                  <p className="text-xs text-muted-foreground">
                    Measure purchase intent and consideration
                  </p>
                </div>
                <Switch checked={trackConsideration} onCheckedChange={setTrackConsideration} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Preference</Label>
                  <p className="text-xs text-muted-foreground">
                    Track brand preference vs competitors
                  </p>
                </div>
                <Switch checked={trackPreference} onCheckedChange={setTrackPreference} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Loyalty</Label>
                  <p className="text-xs text-muted-foreground">
                    Measure customer retention and loyalty
                  </p>
                </div>
                <Switch checked={trackLoyalty} onCheckedChange={setTrackLoyalty} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Net Promoter Score (NPS)</Label>
                  <p className="text-xs text-muted-foreground">
                    Track customer advocacy and satisfaction
                  </p>
                </div>
                <Switch checked={trackNPS} onCheckedChange={setTrackNPS} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Sentiment Analysis</Label>
                  <p className="text-xs text-muted-foreground">
                    Monitor brand sentiment and perception
                  </p>
                </div>
                <Switch checked={trackSentiment} onCheckedChange={setTrackSentiment} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Market Share</Label>
                  <p className="text-xs text-muted-foreground">
                    Track estimated market share over time
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
              Schedule & Date Range
            </CardTitle>
            <CardDescription>
              Configure tracking frequency and time period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schedule">Tracking Frequency</Label>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
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
              Alert Thresholds
            </CardTitle>
            <CardDescription>
              Get notified when metrics drop below specified thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications when metrics fall below thresholds
                </p>
              </div>
              <Switch checked={enableAlerts} onCheckedChange={setEnableAlerts} />
            </div>

            {enableAlerts && (
              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="awarenessThreshold">Minimum Awareness (%)</Label>
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
                  <Label htmlFor="npsThreshold">Minimum NPS Score</Label>
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
            <Link href={`/dashboard/brand-tracking/${id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving || !brandName}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
