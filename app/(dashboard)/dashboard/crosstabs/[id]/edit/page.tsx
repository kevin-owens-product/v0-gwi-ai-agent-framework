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
  "Gen Z (18-24)",
  "Millennials (25-40)",
  "Gen X (41-56)",
  "Boomers (57-75)",
  "Eco-Conscious Millennials",
  "Tech Early Adopters",
  "Gen Z Content Creators",
  "Budget-Conscious Shoppers",
  "Under $50K",
  "$50K-$100K",
  "$100K-$150K",
  "$150K-$250K",
  "$250K+",
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Japan",
  "Brazil",
  "Australia",
]

const availableMetrics = [
  "TikTok",
  "Instagram",
  "Facebook",
  "YouTube",
  "LinkedIn",
  "Twitter/X",
  "Snapchat",
  "Pinterest",
  "Social Media Usage",
  "Purchase Intent",
  "Brand Awareness",
  "Media Consumption",
  "Values & Attitudes",
  "Lifestyle & Interests",
  "E-commerce",
  "In-Store Retail",
  "Mobile Apps",
  "Streaming Video",
  "Mobile Gaming",
  "Food Delivery",
  "Fintech Apps",
  "Fitness Apps",
]

const availableDataSources = [
  "GWI Core Q4 2024",
  "GWI Core Q3 2024",
  "GWI Commerce Q4 2024",
  "GWI Global Q4 2024",
  "GWI Zeitgeist Nov 2024",
  "GWI Brand Tracker Q4 2024",
  "GWI Media Q4 2024",
  "GWI Finance Q4 2024",
  "GWI Health Q4 2024",
  "GWI Luxury Q4 2024",
  "GWI Social Q4 2024",
]

const availableCategories = [
  "Social Media",
  "Commerce",
  "Global Markets",
  "Sustainability",
  "Brand Health",
  "Media Planning",
  "Financial Services",
  "Health & Wellness",
  "Luxury",
  "Content Strategy",
]

const weightingOptions = [
  { value: "none", label: "No Weighting" },
  { value: "population", label: "Population Weighted" },
  { value: "internet", label: "Internet Population" },
  { value: "custom", label: "Custom Weighting" },
]

export default function EditCrosstabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session, status } = useSession()
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

        const response = await fetch(`/api/crosstabs/${id}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("Crosstab not found")
          } else if (response.status === 401) {
            setError("You must be logged in to edit this crosstab")
          } else if (response.status === 403) {
            setError("You do not have permission to edit this crosstab")
          } else {
            setError("Failed to load crosstab")
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
        setError("Failed to load crosstab. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (status !== "loading") {
      fetchCrosstab()
    }
  }, [id, status])

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
      errors.name = "Name is required"
    } else if (name.length > 200) {
      errors.name = "Name must be less than 200 characters"
    }

    if (selectedAudiences.length === 0) {
      errors.audiences = "At least one audience is required"
    }

    if (selectedMetrics.length === 0) {
      errors.metrics = "At least one metric is required"
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

      const response = await fetch(`/api/crosstabs/${id}`, {
        method: "PATCH",
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
      setError(err instanceof Error ? err.message : "Failed to save changes. Please try again.")
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
                    onClick={() => setSelectedAudiences(availableAudiences.slice(0, 10))}
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
                      key={audience}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedAudiences.includes(audience)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAudiences([...selectedAudiences, audience])
                          } else {
                            setSelectedAudiences(selectedAudiences.filter((a) => a !== audience))
                          }
                        }}
                      />
                      <span className="text-sm">{audience}</span>
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
                    onClick={() => setSelectedMetrics(availableMetrics.slice(0, 8))}
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
                      key={metric}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedMetrics.includes(metric)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMetrics([...selectedMetrics, metric])
                          } else {
                            setSelectedMetrics(selectedMetrics.filter((m) => m !== metric))
                          }
                        }}
                      />
                      <span className="text-sm">{metric}</span>
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
                        <SelectItem key={source} value={source}>
                          {source}
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
                        <SelectItem key={cat} value={cat}>
                          {cat}
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
                        {option.label}
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
