"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
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
  AlertCircle,
  Plus,
  X,
  Users,
  Globe,
  Sparkles,
  Trash2,
} from "lucide-react"

interface AudienceAttribute {
  dimension: string
  operator: string
  value: string
}

interface AudienceCriteria {
  attributes?: AudienceAttribute[]
  aiQuery?: string
  ageRange?: { min: number; max: number }
  income?: { min: number; max?: number }
  lifestyle?: string[]
  values?: string[]
  behaviors?: string[]
  interests?: string[]
  markets?: string[]
  [key: string]: unknown
}

interface Audience {
  id: string
  name: string
  description: string | null
  size: number | null
  markets: string[]
  criteria: AudienceCriteria
  createdAt: string
  updatedAt: string
}

const AVAILABLE_MARKETS = [
  { value: "Global", label: "Global" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
  { value: "NL", label: "Netherlands" },
  { value: "KR", label: "South Korea" },
  { value: "SG", label: "Singapore" },
  { value: "HK", label: "Hong Kong" },
  { value: "UAE", label: "United Arab Emirates" },
  { value: "BR", label: "Brazil" },
  { value: "IT", label: "Italy" },
]

const DIMENSION_OPTIONS = [
  { value: "age", label: "Age" },
  { value: "gender", label: "Gender" },
  { value: "income", label: "Income" },
  { value: "education", label: "Education" },
  { value: "location", label: "Location" },
  { value: "interests", label: "Interests" },
  { value: "behaviors", label: "Behaviors" },
  { value: "lifestyle", label: "Lifestyle" },
]

const OPERATOR_OPTIONS = [
  { value: "is", label: "is" },
  { value: "is_not", label: "is not" },
  { value: "between", label: "between" },
  { value: "contains", label: "contains" },
  { value: "greater_than", label: "greater than" },
  { value: "less_than", label: "less than" },
]

export default function EditAudiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])
  const [attributes, setAttributes] = useState<AudienceAttribute[]>([])
  const [aiQuery, setAiQuery] = useState("")
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null)

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalData, setOriginalData] = useState<Audience | null>(null)

  // Fetch audience data
  useEffect(() => {
    async function fetchAudience() {
      if (sessionStatus === "loading") return
      if (sessionStatus === "unauthenticated") {
        router.push("/login")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/v1/audiences/${id}`)

        if (response.status === 404) {
          setNotFound(true)
          return
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch audience")
        }

        const data = await response.json()
        const audience: Audience = data.data || data

        // Populate form fields
        setName(audience.name || "")
        setDescription(audience.description || "")
        setSelectedMarkets(audience.markets || [])
        setEstimatedSize(audience.size)

        // Extract criteria
        const criteria = audience.criteria || {}
        setAttributes(criteria.attributes || [])
        setAiQuery(criteria.aiQuery || "")

        setOriginalData(audience)
      } catch (err) {
        console.error("Error fetching audience:", err)
        setError(err instanceof Error ? err.message : "Failed to load audience")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAudience()
  }, [id, sessionStatus, router])

  // Track changes
  useEffect(() => {
    if (!originalData) return

    const currentData = {
      name,
      description,
      markets: selectedMarkets,
      criteria: { attributes, aiQuery },
    }

    const originalCriteria = originalData.criteria || {}
    const changed =
      name !== (originalData.name || "") ||
      description !== (originalData.description || "") ||
      JSON.stringify(selectedMarkets) !== JSON.stringify(originalData.markets || []) ||
      JSON.stringify(attributes) !== JSON.stringify(originalCriteria.attributes || []) ||
      aiQuery !== (originalCriteria.aiQuery || "")

    setHasChanges(changed)
  }, [name, description, selectedMarkets, attributes, aiQuery, originalData])

  // Handle form submission
  const handleSave = async () => {
    if (!name.trim()) {
      setError("Audience name is required")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/audiences/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          markets: selectedMarkets,
          criteria: {
            ...originalData?.criteria,
            attributes,
            aiQuery: aiQuery.trim() || undefined,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update audience")
      }

      // Navigate back to audience detail page
      router.push(`/dashboard/audiences/${id}`)
    } catch (err) {
      console.error("Error updating audience:", err)
      setError(err instanceof Error ? err.message : "Failed to update audience")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle cancel with unsaved changes check
  const handleCancel = () => {
    if (hasChanges) {
      setShowDiscardDialog(true)
    } else {
      router.push(`/dashboard/audiences/${id}`)
    }
  }

  // Add new attribute
  const addAttribute = () => {
    setAttributes([...attributes, { dimension: "age", operator: "between", value: "" }])
  }

  // Update attribute
  const updateAttribute = (index: number, field: keyof AudienceAttribute, value: string) => {
    const newAttributes = [...attributes]
    newAttributes[index] = { ...newAttributes[index], [field]: value }
    setAttributes(newAttributes)
  }

  // Remove attribute
  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  // Toggle market selection
  const toggleMarket = (market: string) => {
    if (selectedMarkets.includes(market)) {
      setSelectedMarkets(selectedMarkets.filter((m) => m !== market))
    } else {
      setSelectedMarkets([...selectedMarkets, market])
    }
  }

  // Loading state
  if (isLoading || sessionStatus === "loading") {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  // Not found state
  if (notFound) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/audiences">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Audience Not Found</h1>
            <p className="text-muted-foreground mt-1">
              The audience you're trying to edit doesn't exist
            </p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Audience not found</h2>
          <p className="text-muted-foreground mb-4">
            The audience you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/audiences">
            <Button>Back to Audiences</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Audience</h1>
            <p className="text-muted-foreground mt-1">
              Update the configuration for this audience segment
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set the name and description for this audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Audience Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Eco-Conscious Millennials"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this audience segment"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Query Builder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Powered Query
              </CardTitle>
              <CardDescription>
                Describe your audience in natural language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., Show me millennials who care about sustainability, live in urban areas, and shop at eco-friendly brands"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                rows={3}
              />
              <Button variant="outline" className="w-full" disabled>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Attributes (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          {/* Manual Attributes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Targeting Attributes</CardTitle>
                  <CardDescription>
                    Define specific criteria for this audience
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addAttribute}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Attribute
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {attributes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No attributes defined yet</p>
                  <p className="text-xs mt-1">
                    Add attributes to define your audience criteria
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attributes.map((attr, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Select
                        value={attr.dimension}
                        onValueChange={(v) => updateAttribute(index, "dimension", v)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIMENSION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={attr.operator}
                        onValueChange={(v) => updateAttribute(index, "operator", v)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OPERATOR_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        className="flex-1"
                        placeholder="Value"
                        value={attr.value}
                        onChange={(e) => updateAttribute(index, "value", e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttribute(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Markets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Markets
              </CardTitle>
              <CardDescription>
                Select the markets for this audience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_MARKETS.map((market) => (
                  <Badge
                    key={market.value}
                    variant={selectedMarkets.includes(market.value) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={() => toggleMarket(market.value)}
                  >
                    {market.label}
                    {selectedMarkets.includes(market.value) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
              {selectedMarkets.length === 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  Select at least one market
                </p>
              )}
            </CardContent>
          </Card>

          {/* Estimated Reach */}
          <Card>
            <CardHeader>
              <CardTitle>Estimated Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {estimatedSize
                  ? estimatedSize >= 1000000
                    ? `${(estimatedSize / 1000000).toFixed(1)}M`
                    : estimatedSize >= 1000
                      ? `${(estimatedSize / 1000).toFixed(0)}K`
                      : estimatedSize
                  : "TBD"}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                consumers match these criteria
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Discard Changes Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push(`/dashboard/audiences/${id}`)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
