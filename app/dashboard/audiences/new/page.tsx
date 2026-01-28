"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, X, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

export default function NewAudiencePage() {
  const router = useRouter()
  const t = useTranslations("dashboard.audiences.new")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [aiQuery, setAiQuery] = useState("")
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(["Global"])
  const [attributes, setAttributes] = useState<{ dimension: string; operator: string; value: string }[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t("errors.nameRequired"))
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const response = await fetch("/api/v1/audiences", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          markets: selectedMarkets,
          criteria: {
            attributes,
            aiQuery: aiQuery.trim(),
          },
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

          {/* AI Query Builder */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">{t("aiQuery.title")}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("aiQuery.description")}
            </p>
            <Textarea
              placeholder={t("aiQuery.placeholder")}
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              rows={3}
            />
            <Button variant="outline" className="w-full bg-transparent">
              <Sparkles className="h-4 w-4 mr-2" />
              {t("aiQuery.generateButton")}
            </Button>
          </Card>

          {/* Manual Attributes */}
          <Card className="p-6 space-y-4">
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
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Markets */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">{t("markets.title")}</h2>
            <Select value={selectedMarkets[0]} onValueChange={(v) => setSelectedMarkets([v])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Global">{t("markets.global")}</SelectItem>
                <SelectItem value="US">{t("markets.us")}</SelectItem>
                <SelectItem value="UK">{t("markets.uk")}</SelectItem>
                <SelectItem value="DE">{t("markets.de")}</SelectItem>
                <SelectItem value="JP">{t("markets.jp")}</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Estimated Reach */}
          <Card className="p-6 space-y-2">
            <h2 className="text-lg font-semibold">{t("estimatedReach.title")}</h2>
            <div className="text-3xl font-bold">1.2M</div>
            <p className="text-sm text-muted-foreground">{t("estimatedReach.matchCriteria")}</p>
          </Card>

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
