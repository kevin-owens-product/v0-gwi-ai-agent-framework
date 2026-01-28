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
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Save,
  Loader2,
  X,
  Plus,
  AlertCircle,
  Table2,
  Users,
  BarChart3,
  Filter,
  Scale,
  Trash2,
} from "lucide-react"

// Type definitions
interface CrosstabData {
  id: string
  name: string
  description: string
  audiences: string[]
  metrics: string[]
  filters: Record<string, unknown>
  results: Record<string, unknown>
  dataSource?: string
  category?: string
  weighting?: string
  confidenceLevel?: number
  showPercentages?: boolean
  showCounts?: boolean
  createdAt?: string
  updatedAt?: string
}

// Available options for selection
const availableAudiences = [
  { value: "Gen Z (18-24)", labelKey: "availableAudiences.genZ" },
  { value: "Millennials (25-40)", labelKey: "availableAudiences.millennials" },
  { value: "Gen X (41-56)", labelKey: "availableAudiences.genX" },
  { value: "Boomers (57-75)", labelKey: "availableAudiences.boomers" },
  { value: "Eco-Conscious Millennials", labelKey: "availableAudiences.ecoMillennials" },
  { value: "Tech Early Adopters", labelKey: "availableAudiences.techAdopters" },
  { value: "Gen Z Content Creators", labelKey: "availableAudiences.genZCreators" },
  { value: "Budget-Conscious Shoppers", labelKey: "availableAudiences.budgetShoppers" },
  { value: "Under $50K", labelKey: "availableAudiences.incomeUnder50k" },
  { value: "$50K-$100K", labelKey: "availableAudiences.income50kTo100k" },
  { value: "$100K-$150K", labelKey: "availableAudiences.income100kTo150k" },
  { value: "$150K-$250K", labelKey: "availableAudiences.income150kTo250k" },
  { value: "$250K+", labelKey: "availableAudiences.income250kPlus" },
  { value: "United States", labelKey: "availableAudiences.unitedStates" },
  { value: "United Kingdom", labelKey: "availableAudiences.unitedKingdom" },
  { value: "Germany", labelKey: "availableAudiences.germany" },
  { value: "France", labelKey: "availableAudiences.france" },
  { value: "Japan", labelKey: "availableAudiences.japan" },
  { value: "Brazil", labelKey: "availableAudiences.brazil" },
  { value: "Australia", labelKey: "availableAudiences.australia" },
]

const availableMetrics = [
  { value: "TikTok", labelKey: "availableMetrics.tiktok" },
  { value: "Instagram", labelKey: "availableMetrics.instagram" },
  { value: "Facebook", labelKey: "availableMetrics.facebook" },
  { value: "YouTube", labelKey: "availableMetrics.youtube" },
  { value: "LinkedIn", labelKey: "availableMetrics.linkedin" },
  { value: "Twitter/X", labelKey: "availableMetrics.twitterX" },
  { value: "Snapchat", labelKey: "availableMetrics.snapchat" },
  { value: "Pinterest", labelKey: "availableMetrics.pinterest" },
  { value: "Social Media Usage", labelKey: "availableMetrics.socialMediaUsage" },
  { value: "Purchase Intent", labelKey: "availableMetrics.purchaseIntent" },
  { value: "Brand Awareness", labelKey: "availableMetrics.brandAwareness" },
  { value: "Media Consumption", labelKey: "availableMetrics.mediaConsumption" },
  { value: "Values & Attitudes", labelKey: "availableMetrics.valuesAttitudes" },
  { value: "Lifestyle & Interests", labelKey: "availableMetrics.lifestyleInterests" },
  { value: "E-commerce", labelKey: "availableMetrics.ecommerce" },
  { value: "In-Store Retail", labelKey: "availableMetrics.inStoreRetail" },
  { value: "Mobile Apps", labelKey: "availableMetrics.mobileApps" },
  { value: "Streaming Video", labelKey: "availableMetrics.streamingVideo" },
  { value: "Mobile Gaming", labelKey: "availableMetrics.mobileGaming" },
  { value: "Food Delivery", labelKey: "availableMetrics.foodDelivery" },
  { value: "Fintech Apps", labelKey: "availableMetrics.fintechApps" },
  { value: "Fitness Apps", labelKey: "availableMetrics.fitnessApps" },
]

const availableDataSources = [
  { value: "GWI Core Q4 2024", labelKey: "availableDataSources.gwiCoreQ4" },
  { value: "GWI Core Q3 2024", labelKey: "availableDataSources.gwiCoreQ3" },
  { value: "GWI Commerce Q4 2024", labelKey: "availableDataSources.gwiCommerceQ4" },
  { value: "GWI Global Q4 2024", labelKey: "availableDataSources.gwiGlobalQ4" },
  { value: "GWI Zeitgeist Nov 2024", labelKey: "availableDataSources.gwiZeitgeistNov" },
  { value: "GWI Brand Tracker Q4 2024", labelKey: "availableDataSources.gwiBrandTrackerQ4" },
  { value: "GWI Media Q4 2024", labelKey: "availableDataSources.gwiMediaQ4" },
  { value: "GWI Finance Q4 2024", labelKey: "availableDataSources.gwiFinanceQ4" },
  { value: "GWI Health Q4 2024", labelKey: "availableDataSources.gwiHealthQ4" },
  { value: "GWI Luxury Q4 2024", labelKey: "availableDataSources.gwiLuxuryQ4" },
  { value: "GWI Social Q4 2024", labelKey: "availableDataSources.gwiSocialQ4" },
]

const availableCategories = [
  { value: "Social Media", labelKey: "availableCategories.socialMedia" },
  { value: "Commerce", labelKey: "availableCategories.commerce" },
  { value: "Global Markets", labelKey: "availableCategories.globalMarkets" },
  { value: "Sustainability", labelKey: "availableCategories.sustainability" },
  { value: "Brand Health", labelKey: "availableCategories.brandHealth" },
  { value: "Media Planning", labelKey: "availableCategories.mediaPlanning" },
  { value: "Financial Services", labelKey: "availableCategories.financialServices" },
  { value: "Health & Wellness", labelKey: "availableCategories.healthWellness" },
  { value: "Luxury", labelKey: "availableCategories.luxury" },
  { value: "Content Strategy", labelKey: "availableCategories.contentStrategy" },
]

const weightingOptions = [
  { value: "none", labelKey: "weightingOptions.none" },
  { value: "population", labelKey: "weightingOptions.population" },
  { value: "internet", labelKey: "weightingOptions.internet" },
  { value: "custom", labelKey: "weightingOptions.custom" },
]

export default function EditCrosstabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { status } = useSession()
  const t = useTranslations("dashboard.crosstabs.edit")
  const tCommon = useTranslations("common")

  // State
  const [crosstab, setCrosstab] = useState<CrosstabData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Form fields
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [dataSource, setDataSource] = useState("")
  const [category, setCategory] = useState("")
  const [weighting, setWeighting] = useState("none")
  const [confidenceLevel, setConfidenceLevel] = useState(95)
  const [showPercentages, setShowPercentages] = useState(true)
  const [showCounts, setShowCounts] = useState(false)
  const [filters, setFilters] = useState<Record<string, unknown>>({})

  // Custom audience/metric input
  const [customAudience, setCustomAudience] = useState("")
  const [customMetric, setCustomMetric] = useState("")

  // Fetch crosstab data
  useEffect(() => {
    async function fetchCrosstab() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/v1/crosstabs/${id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError(t("errors.notFound"))
          } else if (response.status === 401) {
            setError(t("errors.unauthorized"))
          } else if (response.status === 403) {
            setError(t("errors.forbidden"))
          } else {
            setError(t("errors.loadFailed"))
          }
          return
        }

        const data = await response.json()
        const crosstabData = data.data || data

        setCrosstab(crosstabData)

        // Populate form fields
        setName(crosstabData.name || "")
        setDescription(crosstabData.description || "")
        setSelectedAudiences(crosstabData.audiences || [])
        setSelectedMetrics(crosstabData.metrics || [])
        setDataSource(crosstabData.dataSource || "")
        setCategory(crosstabData.category || "")
        setWeighting(crosstabData.weighting || "none")
        setConfidenceLevel(crosstabData.confidenceLevel || 95)
        setShowPercentages(crosstabData.showPercentages ?? true)
        setShowCounts(crosstabData.showCounts ?? false)
        setFilters(crosstabData.filters || {})
      } catch (err) {
        console.error("Error fetching crosstab:", err)
        setError(t("errors.loadFailedRetry"))
      } finally {
        setIsLoading(false)
      }
    }

    if (status !== "loading") {
      fetchCrosstab()
    }
  }, [id, status, t])

  // Track changes
  useEffect(() => {
    if (!crosstab) return

    const changed =
      name !== (crosstab.name || "") ||
      description !== (crosstab.description || "") ||
      JSON.stringify(selectedAudiences) !== JSON.stringify(crosstab.audiences || []) ||
      JSON.stringify(selectedMetrics) !== JSON.stringify(crosstab.metrics || []) ||
      dataSource !== (crosstab.dataSource || "") ||
      category !== (crosstab.category || "") ||
      weighting !== (crosstab.weighting || "none") ||
      confidenceLevel !== (crosstab.confidenceLevel || 95) ||
      showPercentages !== (crosstab.showPercentages ?? true) ||
      showCounts !== (crosstab.showCounts ?? false)

    setHasChanges(changed)
  }, [
    crosstab,
    name,
    description,
    selectedAudiences,
    selectedMetrics,
    dataSource,
    category,
    weighting,
    confidenceLevel,
    showPercentages,
    showCounts,
  ])

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!name.trim()) {
      errors.name = t("validation.nameRequired")
    } else if (name.length > 200) {
      errors.name = t("validation.nameTooLong")
    }

    if (selectedAudiences.length === 0) {
      errors.audiences = t("validation.audienceRequired")
    }

    if (selectedMetrics.length === 0) {
      errors.metrics = t("validation.metricRequired")
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const updateData = {
        name: name.trim(),
        description: description.trim(),
        audiences: selectedAudiences,
        metrics: selectedMetrics,
        filters: {
          ...filters,
          dataSource,
          category,
          weighting,
          confidenceLevel,
          showPercentages,
          showCounts,
        },
      }

      const response = await fetch(`/api/v1/crosstabs/${id}`, {
        method: "PATCH",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to save changes")
      }

      // Success - navigate back to detail page
      router.push(`/dashboard/crosstabs/${id}`)
    } catch (err) {
      console.error("Error saving crosstab:", err)
      setError(err instanceof Error ? err.message : t("errors.saveFailedRetry"))
    } finally {
      setIsSaving(false)
    }
  }

  // Handle cancel with unsaved changes check
  const handleCancel = () => {
    if (hasChanges) {
      setShowDiscardDialog(true)
    } else {
      router.push(`/dashboard/crosstabs/${id}`)
    }
  }

  // Add custom audience
  const handleAddCustomAudience = () => {
    if (customAudience.trim() && !selectedAudiences.includes(customAudience.trim())) {
      setSelectedAudiences([...selectedAudiences, customAudience.trim()])
      setCustomAudience("")
    }
  }

  // Add custom metric
  const handleAddCustomMetric = () => {
    if (customMetric.trim() && !selectedMetrics.includes(customMetric.trim())) {
      setSelectedMetrics([...selectedMetrics, customMetric.trim()])
      setCustomMetric("")
    }
  }

  // Loading state
  if (isLoading || status === "loading") {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !crosstab) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crosstabs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground mt-1">{t("unableToLoad")}</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("loadError")}</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard/crosstabs">
              <Button variant="outline">{t("backToCrosstabs")}</Button>
            </Link>
            <Button onClick={() => window.location.reload()}>{t("tryAgain")}</Button>
          </div>
        </Card>
      </div>
    )
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crosstabs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground mt-1">{t("authRequired")}</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("authRequired")}</h2>
          <p className="text-muted-foreground mb-4">
            {t("pleaseSignIn")}
          </p>
          <Link href="/login">
            <Button>{t("signIn")}</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges} className="gap-2">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("saveChanges")}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Form content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table2 className="h-5 w-5" />
                {t("basicInfo.title")}
              </CardTitle>
              <CardDescription>{t("basicInfo.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t("basicInfo.crosstabName")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("basicInfo.crosstabNamePlaceholder")}
                  className={validationErrors.name ? "border-destructive" : ""}
                />
                {validationErrors.name && (
                  <p className="text-sm text-destructive">{validationErrors.name}</p>
                )}
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
            </CardContent>
          </Card>

          {/* Row Variables (Audiences) */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t("rowVariables.title")}
              </CardTitle>
              <CardDescription>
                {t("rowVariables.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("rowVariables.selected", { count: selectedAudiences.length })}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAudiences(availableAudiences.slice(0, 10).map(a => a.value))}
                  >
                    {t("rowVariables.selectSuggested")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAudiences([])}
                  >
                    {t("clear")}
                  </Button>
                </div>
              </div>

              {validationErrors.audiences && (
                <p className="text-sm text-destructive">{validationErrors.audiences}</p>
              )}

              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="space-y-2">
                  {availableAudiences.map((audience) => (
                    <label
                      key={audience.value}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedAudiences.includes(audience.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAudiences([...selectedAudiences, audience.value])
                          } else {
                            setSelectedAudiences(selectedAudiences.filter((a) => a !== audience.value))
                          }
                        }}
                      />
                      <span className="text-sm">{t(audience.labelKey)}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>

              {/* Add custom audience */}
              <div className="flex gap-2">
                <Input
                  placeholder={t("rowVariables.addCustomPlaceholder")}
                  value={customAudience}
                  onChange={(e) => setCustomAudience(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCustomAudience()
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddCustomAudience}
                  disabled={!customAudience.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Column Variables (Metrics) */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t("columnVariables.title")}
              </CardTitle>
              <CardDescription>
                {t("columnVariables.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("columnVariables.selected", { count: selectedMetrics.length })}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMetrics(availableMetrics.slice(0, 8).map(m => m.value))}
                  >
                    {t("columnVariables.selectSuggested")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMetrics([])}
                  >
                    {t("clear")}
                  </Button>
                </div>
              </div>

              {validationErrors.metrics && (
                <p className="text-sm text-destructive">{validationErrors.metrics}</p>
              )}

              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="grid grid-cols-2 gap-2">
                  {availableMetrics.map((metric) => (
                    <label
                      key={metric.value}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedMetrics.includes(metric.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMetrics([...selectedMetrics, metric.value])
                          } else {
                            setSelectedMetrics(selectedMetrics.filter((m) => m !== metric.value))
                          }
                        }}
                      />
                      <span className="text-sm">{t(metric.labelKey)}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>

              {/* Add custom metric */}
              <div className="flex gap-2">
                <Input
                  placeholder={t("columnVariables.addCustomPlaceholder")}
                  value={customMetric}
                  onChange={(e) => setCustomMetric(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCustomMetric()
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddCustomMetric}
                  disabled={!customMetric.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters & Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {t("filtersSettings.title")}
              </CardTitle>
              <CardDescription>{t("filtersSettings.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dataSource">{t("filtersSettings.dataSource")}</Label>
                  <Select value={dataSource} onValueChange={setDataSource}>
                    <SelectTrigger id="dataSource">
                      <SelectValue placeholder={t("filtersSettings.selectDataSource")} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDataSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {t(source.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">{t("filtersSettings.category")}</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder={t("filtersSettings.selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {t(cat.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weighting & Statistical Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                {t("weighting.title")}
              </CardTitle>
              <CardDescription>{t("weighting.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weighting">{t("weighting.method")}</Label>
                <Select value={weighting} onValueChange={setWeighting}>
                  <SelectTrigger id="weighting">
                    <SelectValue placeholder={t("weighting.selectMethod")} />
                  </SelectTrigger>
                  <SelectContent>
                    {weightingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidenceLevel">{t("weighting.confidenceLevel")}</Label>
                <Select
                  value={confidenceLevel.toString()}
                  onValueChange={(val) => setConfidenceLevel(parseInt(val))}
                >
                  <SelectTrigger id="confidenceLevel">
                    <SelectValue placeholder={t("weighting.selectConfidence")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90%</SelectItem>
                    <SelectItem value="95">95%</SelectItem>
                    <SelectItem value="99">99%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("weighting.showPercentages")}</Label>
                    <p className="text-sm text-muted-foreground">{t("weighting.showPercentagesDesc")}</p>
                  </div>
                  <Switch
                    checked={showPercentages}
                    onCheckedChange={setShowPercentages}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("weighting.showCounts")}</Label>
                    <p className="text-sm text-muted-foreground">{t("weighting.showCountsDesc")}</p>
                  </div>
                  <Switch checked={showCounts} onCheckedChange={setShowCounts} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t("summary.title")}</CardTitle>
              <CardDescription>{t("summary.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("summary.audiences", { count: selectedAudiences.length })}
                </p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {selectedAudiences.length === 0 ? (
                    <span className="text-sm text-muted-foreground italic">{t("summary.noneSelected")}</span>
                  ) : (
                    selectedAudiences.map((audience) => (
                      <Badge key={audience} variant="secondary" className="text-xs">
                        {audience}
                        <button
                          onClick={() =>
                            setSelectedAudiences(selectedAudiences.filter((a) => a !== audience))
                          }
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("summary.metrics", { count: selectedMetrics.length })}
                </p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {selectedMetrics.length === 0 ? (
                    <span className="text-sm text-muted-foreground italic">{t("summary.noneSelected")}</span>
                  ) : (
                    selectedMetrics.map((metric) => (
                      <Badge key={metric} variant="outline" className="text-xs">
                        {metric}
                        <button
                          onClick={() =>
                            setSelectedMetrics(selectedMetrics.filter((m) => m !== metric))
                          }
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {(dataSource || category) && (
                <div className="pt-2 border-t">
                  {dataSource && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">{t("summary.source")}:</span> {dataSource}
                    </p>
                  )}
                  {category && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">{t("summary.category")}:</span> {category}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6 space-y-3">
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t("saveChanges")}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={handleCancel}
                disabled={isSaving}
              >
                {tCommon("cancel")}
              </Button>
              <Link href={`/dashboard/crosstabs/${id}`} className="block">
                <Button variant="ghost" className="w-full" disabled={isSaving}>
                  {t("viewCrosstab")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Change indicator */}
          {hasChanges && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>{t("unsavedChanges")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Discard changes dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("discardDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("discardDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("discardDialog.continueEditing")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push(`/dashboard/crosstabs/${id}`)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("discardDialog.discardChanges")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
