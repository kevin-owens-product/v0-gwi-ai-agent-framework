"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  FileText,
  Loader2,
  Save,
  AlertCircle,
  X,
  Plus,
} from "lucide-react"
import Link from "next/link"

export default function NewReportPage() {
  const router = useRouter()
  const t = useTranslations("admin.analytics.reports.new")
  const tCommon = useTranslations("admin.analytics.reports")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const REPORT_TYPES = [
    { value: "USAGE", label: tCommon("types.usage"), description: t("typeDescriptions.usage") },
    { value: "REVENUE", label: tCommon("types.revenue"), description: t("typeDescriptions.revenue") },
    { value: "SECURITY", label: tCommon("types.security"), description: t("typeDescriptions.security") },
    { value: "COMPLIANCE", label: tCommon("types.compliance"), description: t("typeDescriptions.compliance") },
    { value: "USER_ACTIVITY", label: tCommon("types.userActivity"), description: t("typeDescriptions.userActivity") },
    { value: "CUSTOM_SQL", label: tCommon("types.customSql"), description: t("typeDescriptions.customSql") },
  ]

  const SCHEDULES = [
    { value: "", label: t("scheduleOptions.onDemand") },
    { value: "daily", label: tCommon("schedules.daily") },
    { value: "weekly", label: tCommon("schedules.weekly") },
    { value: "monthly", label: tCommon("schedules.monthly") },
  ]

  const FORMATS = [
    { value: "csv", label: t("formatOptions.csv") },
    { value: "json", label: t("formatOptions.json") },
    { value: "pdf", label: t("formatOptions.pdf") },
    { value: "xlsx", label: t("formatOptions.xlsx") },
  ]

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "USAGE",
    schedule: "",
    format: "csv",
    isActive: true,
    recipients: [] as string[],
    query: {
      days: 30,
    },
  })

  const [newRecipient, setNewRecipient] = useState("")

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError(t("errors.nameRequired"))
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/analytics/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          schedule: formData.schedule || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.createFailed"))
      }

      const data = await response.json()
      router.push(`/admin/analytics/reports/${data.report.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const addRecipient = () => {
    if (newRecipient && !formData.recipients.includes(newRecipient)) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient],
      }))
      setNewRecipient("")
    }
  }

  const removeRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email),
    }))
  }

  const selectedType = REPORT_TYPES.find(t => t.value === formData.type)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/analytics/reports">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToReports")}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("createReport")}
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("basicInfo.title")}</CardTitle>
            <CardDescription>{t("basicInfo.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("basicInfo.reportName")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t("basicInfo.reportNamePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("basicInfo.descriptionLabel")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t("basicInfo.descriptionPlaceholder")}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("basicInfo.active")}</Label>
                <p className="text-xs text-muted-foreground">{t("basicInfo.activeDescription")}</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Report Type */}
        <Card>
          <CardHeader>
            <CardTitle>{t("reportType.title")}</CardTitle>
            <CardDescription>{t("reportType.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("reportType.typeLabel")}</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedType && (
                <p className="text-xs text-muted-foreground">{selectedType.description}</p>
              )}
            </div>

            {formData.type !== "CUSTOM_SQL" && (
              <div className="space-y-2">
                <Label>{t("reportType.reportPeriod")}</Label>
                <Input
                  type="number"
                  value={formData.query.days}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    query: { ...prev.query, days: parseInt(e.target.value) || 30 },
                  }))}
                  min={1}
                  max={365}
                />
                <p className="text-xs text-muted-foreground">
                  {t("reportType.reportPeriodDescription")}
                </p>
              </div>
            )}

            {formData.type === "CUSTOM_SQL" && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t("reportType.customSqlNote")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule & Delivery */}
        <Card>
          <CardHeader>
            <CardTitle>{t("scheduleDelivery.title")}</CardTitle>
            <CardDescription>{t("scheduleDelivery.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("scheduleDelivery.scheduleLabel")}</Label>
              <Select
                value={formData.schedule}
                onValueChange={(v) => setFormData(prev => ({ ...prev, schedule: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("scheduleDelivery.selectSchedule")} />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULES.map((schedule) => (
                    <SelectItem key={schedule.value} value={schedule.value}>
                      {schedule.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("scheduleDelivery.outputFormat")}</Label>
              <Select
                value={formData.format}
                onValueChange={(v) => setFormData(prev => ({ ...prev, format: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Recipients */}
        <Card>
          <CardHeader>
            <CardTitle>{t("recipients.title")}</CardTitle>
            <CardDescription>{t("recipients.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                placeholder={t("recipients.emailPlaceholder")}
                onKeyDown={(e) => e.key === "Enter" && addRecipient()}
              />
              <Button variant="outline" onClick={addRecipient}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.recipients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.recipients.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <button
                      onClick={() => removeRecipient(email)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("recipients.noRecipients")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t("summary.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("summary.name")}</p>
              <p className="font-medium">{formData.name || t("summary.untitledReport")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("summary.type")}</p>
              <p className="font-medium">{selectedType?.label || formData.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("summary.schedule")}</p>
              <p className="font-medium">
                {SCHEDULES.find(s => s.value === formData.schedule)?.label || t("scheduleOptions.onDemand")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("summary.recipients")}</p>
              <p className="font-medium">{formData.recipients.length || t("summary.none")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
