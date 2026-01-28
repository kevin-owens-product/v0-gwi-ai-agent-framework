"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, Loader2 } from "lucide-react"

interface Survey {
  id: string
  name: string
  description: string | null
  status: string
  version: number
}

interface SurveyEditorProps {
  survey?: Survey
}

export function SurveyEditor({ survey }: SurveyEditorProps) {
  const router = useRouter()
  const t = useTranslations("gwi.surveys")
  const tCommon = useTranslations("common")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: survey?.name || "",
    description: survey?.description || "",
    status: survey?.status || "DRAFT",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = survey
        ? `/api/gwi/surveys/${survey.id}`
        : "/api/gwi/surveys"
      const method = survey ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        if (!survey) {
          router.push(`/gwi/surveys/${data.id}`)
        } else {
          router.refresh()
        }
      }
    } catch (error) {
      console.error("Failed to save survey:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const STATUS_VALUES = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"] as const

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t("surveySettings")}</CardTitle>
          <CardDescription>
            {t("surveySettingsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t("surveyName")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t("placeholders.surveyName")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{tCommon("description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={t("placeholders.description")}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{tCommon("status")}</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("placeholders.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                {STATUS_VALUES.map((statusValue) => (
                  <SelectItem key={statusValue} value={statusValue}>
                    {t(`statuses.${statusValue}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {survey && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {t("currentVersion", { version: survey.version })}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tCommon("saving")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {tCommon("saveChanges")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
