"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Sparkles, Loader2, Users, Wand2, Filter } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { AIAudienceBuilder } from "@/components/audiences/ai-audience-builder"
import { AdvancedSegmentationBuilder, FilterGroup } from "@/components/audiences/advanced-segmentation-builder"
import { AudienceSizeEstimator } from "@/components/audiences/audience-size-estimator"

export default function NewAudiencePage() {
  const router = useRouter()
  const t = useTranslations("dashboard.audiences.new")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [aiQuery, setAiQuery] = useState("")
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(["Global"])
  const [attributes, setAttributes] = useState<{ dimension: string; operator: string; value: string }[]>([])
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([])
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [builderMode, setBuilderMode] = useState<"ai" | "advanced" | "manual">("ai")

  const handleAICriteriaGenerated = (criteria: Array<{ dimension: string; operator: string; value: string | number | [number, number]; confidence: number }>, size: number) => {
    // Convert AI criteria to attributes format
    const newAttributes = criteria.map(c => ({
      dimension: c.dimension,
      operator: c.operator,
      value: Array.isArray(c.value) ? `${c.value[0]}-${c.value[1]}` : String(c.value),
    }))
    setAttributes(newAttributes)
    setEstimatedSize(size)
  }

  const handleAdvancedCriteriaChange = (groups: FilterGroup[]) => {
    setFilterGroups(groups)
    // Convert filter groups to attributes format
    const allAttributes: { dimension: string; operator: string; value: string }[] = []
    groups.forEach(group => {
      group.conditions.forEach(condition => {
        allAttributes.push({
          dimension: condition.dimension,
          operator: condition.operator,
          value: Array.isArray(condition.value) ? `${condition.value[0]}-${condition.value[1]}` : String(condition.value),
        })
      })
    })
    setAttributes(allAttributes)
  }

  const handleEstimationChange = (estimation: { totalSize: number }) => {
    setEstimatedSize(estimation.totalSize)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t("errors.nameRequired"))
      return
    }

    setIsSaving(true)
    setError("")

    try {
      // Build criteria based on builder mode
      let criteria: unknown
      if (builderMode === "advanced" && filterGroups.length > 0) {
        criteria = {
          groups: filterGroups,
          logic: "AND", // Logic between groups
        }
      } else {
        criteria = {
          attributes,
          aiQuery: aiQuery.trim(),
        }
      }

      const response = await fetch("/api/v1/audiences", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          markets: selectedMarkets,
          criteria,
          size: estimatedSize,
        }),
      })

      if (response.ok) {
        router.push("/dashboard/audiences")
      } else {
        const data = await response.json()
        setError(data.error || t("errors.createFailed"))
      }
    } catch (err) {
      console.error("Failed to save audience:", err)
      setError(t("errors.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/audiences">
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
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="p-6 space-y-4">
            <div>
              <Label htmlFor="name">{t("basicInfo.audienceName")}</Label>
              <Input
                id="name"
                placeholder={t("basicInfo.audienceNamePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">{t("basicInfo.description")}</Label>
              <Textarea
                id="description"
                placeholder={t("basicInfo.descriptionPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </Card>

          {/* Builder Mode Selector */}
          <Card className="p-6">
            <Tabs value={builderMode} onValueChange={(v) => setBuilderMode(v as typeof builderMode)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Builder
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Advanced
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Manual
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai" className="mt-4">
                <AIAudienceBuilder
                  onCriteriaGenerated={handleAICriteriaGenerated}
                  initialQuery={aiQuery}
                  markets={selectedMarkets}
                />
              </TabsContent>

              <TabsContent value="advanced" className="mt-4">
                <AdvancedSegmentationBuilder
                  onCriteriaChange={handleAdvancedCriteriaChange}
                  initialGroups={filterGroups}
                />
              </TabsContent>

              <TabsContent value="manual" className="mt-4">
                <Card>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">{t("attributes.title")}</h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setAttributes([...attributes, { dimension: "age", operator: "between", value: "25-34" }])
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t("attributes.add")}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {attributes.map((attr, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Select
                            value={attr.dimension}
                            onValueChange={(v) => {
                              const newAttrs = [...attributes]
                              newAttrs[index].dimension = v
                              setAttributes(newAttrs)
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="age">{t("attributes.age")}</SelectItem>
                              <SelectItem value="gender">{t("attributes.gender")}</SelectItem>
                              <SelectItem value="income">{t("attributes.income")}</SelectItem>
                              <SelectItem value="interests">{t("attributes.interests")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={attr.operator}
                            onValueChange={(v) => {
                              const newAttrs = [...attributes]
                              newAttrs[index].operator = v
                              setAttributes(newAttrs)
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="is">{t("attributes.is")}</SelectItem>
                              <SelectItem value="between">{t("attributes.between")}</SelectItem>
                              <SelectItem value="contains">{t("attributes.contains")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            className="flex-1"
                            value={attr.value}
                            onChange={(e) => {
                              const newAttrs = [...attributes]
                              newAttrs[index].value = e.target.value
                              setAttributes(newAttrs)
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setAttributes(attributes.filter((_, i) => i !== index))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Markets */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">{t("markets.title")}</h2>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {["Global", "US", "UK", "DE", "FR", "JP", "AU", "CA", "NL", "KR", "SG", "HK", "UAE", "BR", "IT"].map((market) => (
                  <Badge
                    key={market}
                    variant={selectedMarkets.includes(market) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={() => {
                      if (selectedMarkets.includes(market)) {
                        setSelectedMarkets(selectedMarkets.filter((m) => m !== market))
                      } else {
                        setSelectedMarkets([...selectedMarkets, market])
                      }
                    }}
                  >
                    {market}
                    {selectedMarkets.includes(market) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
              {selectedMarkets.length === 0 && (
                <p className="text-xs text-muted-foreground">Select at least one market</p>
              )}
            </div>
          </Card>

          {/* Estimated Reach */}
          <AudienceSizeEstimator
            criteria={builderMode === "advanced" ? { groups: filterGroups } : { attributes, aiQuery }}
            markets={selectedMarkets}
            onEstimationChange={handleEstimationChange}
          />

          {/* Actions */}
          <div className="space-y-2">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("actions.saving")}
                </>
              ) : (
                t("actions.save")
              )}
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
